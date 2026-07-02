const ALLOWED_BOT_DOMAINS = [".googlebot.com", ".google.com"];
const CACHE_TTL_SECONDS = 86400;

// VPN / datacenter ASNs used as a free heuristic to flag likely VPN traffic.
// Sources: top hosting providers commonly resold by commercial VPNs
// (M247, OVH, DigitalOcean, Hetzner, Vultr, Linode, Contabo, Scaleway,
// Worldstream, Choopa, ColoCrossing, etc.) plus dedicated VPN ASNs.
const VPN_ASNS = new Set([
  9009,    // M247 (Mullvad, ProtonVPN, ExpressVPN)
  16276,   // OVH SAS
  14061,   // DigitalOcean
  20473,   // Choopa / Vultr
  63949,   // Linode / Akamai
  24940,   // Hetzner
  51167,   // Contabo
  12876,   // Scaleway / Online SAS
  16509,   // Amazon AWS
  14618,   // Amazon AWS
  15169,   // Google LLC (Google Cloud)
  396982,  // Google Cloud Platform
  8075,    // Microsoft (Azure)
  8100,    // QuadraNet (PIA)
  29802,   // HVC Internet (PIA legacy)
  62240,   // Clouvider
  60068,   // CDN77 / Datacamp
  51852,   // Private Layer
  47692,   // Nexeon
  62567,   // DigitalOcean
  36352,   // ColoCrossing
  49981,   // WorldStream
  61317,   // Asergo (Mullvad)
  39351,   // 31173 Services (Mullvad)
  205406,  // GLOBALCONNECT (Mullvad)
  62217,   // 1337 Services (NordVPN/Tefincom)
  21859,   // Zenlayer
  136975,  // Vultr Asia
  20454,   // SingleHop
  46606,   // Unified Layer (Bluehost)
  46562,   // Total Server Solutions
  53667,   // FranTech / Buyvm
  62904,   // Eonix Network
  394380,  // Leaseweb USA
  60781,   // Leaseweb Netherlands
  16125,   // ITERA Networks
  43350,   // NForce Entertainment
  22612,   // Namecheap Hosting
  133199,  // Surfshark (limited assignments)
  202425,  // IP Volume Inc
  3214,    // xTom Pty
  136787,  // ColocationAmerica / VPN.ac
  131159,  // ColoCenter
  133752,  // Leaseweb APAC
  41947,   // Telmex / various VPNs
  211252,  // Delis LLC (NordVPN)
  31034,   // Aruba SpA
  19318,   // Net Access Corp
  44066,   // Nexeon
  56971,   // Total Web IT
  214379,  // Datacamp Limited
  201106,  // Tier Net
  37963,   // Alibaba Cloud
  45102    // Alibaba Cloud Asia
]);

function isVpnRequest(request) {
  const asn = request.cf?.asn;
  return typeof asn === "number" && VPN_ASNS.has(asn);
}
const DOH_ENDPOINT = "https://cloudflare-dns.com/dns-query";
const DNS_TYPE = {
  A: 1,
  AAAA: 28,
  PTR: 12
};

function isGooglebotUserAgent(request) {
  const userAgent = request.headers.get("user-agent");
  if (!userAgent) {
    return false;
  }

  return userAgent.toLowerCase().includes("google");
}

function getCountry(request) {
  return request.cf?.country ?? null;
}

function getBlockedCountries(env) {
  if (!env.BLOCKED_COUNTRIES) {
    return [];
  }

  try {
    const parsed = JSON.parse(env.BLOCKED_COUNTRIES);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return env.BLOCKED_COUNTRIES.split(",").map((value) => value.trim()).filter(Boolean);
  }
}

function isGeoBlocked(request, env) {
  const blockedCountries = getBlockedCountries(env);
  if (blockedCountries.length === 0) {
    return false;
  }

  const country = getCountry(request);
  return country ? blockedCountries.includes(country) : false;
}

async function verifyGooglebot(ip, env) {
  if (env.BOT_CACHE) {
    try {
      const cached = await env.BOT_CACHE.get(ip, "json");
      if (cached) {
        return {
          verified: cached.verified,
          reason: "cached"
        };
      }
    } catch {
    }
  }

  const result = await performRdnsVerification(ip);

  if (env.BOT_CACHE) {
    try {
      await env.BOT_CACHE.put(
        ip,
        JSON.stringify({ verified: result.verified, timestamp: Date.now() }),
        { expirationTtl: CACHE_TTL_SECONDS }
      );
    } catch {
    }
  }

  return result;
}

async function performRdnsVerification(ip) {
  const ptrName = buildPtrName(ip);
  if (!ptrName) {
    return { verified: false, reason: "invalid-ip" };
  }

  const ptrResponse = await dohQuery(ptrName, DNS_TYPE.PTR);
  if (!ptrResponse || !ptrResponse.Answer || ptrResponse.Answer.length === 0) {
    return { verified: false, reason: "no-ptr-record" };
  }

  let hostname = ptrResponse.Answer[0].data;
  if (hostname.endsWith(".")) {
    hostname = hostname.slice(0, -1);
  }

  const hostnameLower = hostname.toLowerCase();
  const domainMatch = ALLOWED_BOT_DOMAINS.some((domain) => hostnameLower.endsWith(domain));
  if (!domainMatch) {
    return { verified: false, hostname, reason: "domain-mismatch" };
  }

  const normalizedOriginalIp = normalizeIp(ip);
  const forwardType = ip.includes(":") ? DNS_TYPE.AAAA : DNS_TYPE.A;
  const forwardResponse = await dohQuery(hostname, forwardType);

  if (!forwardResponse || !forwardResponse.Answer) {
    return { verified: false, hostname, reason: "forward-lookup-failed" };
  }

  const ipMatch = forwardResponse.Answer.some(
    (answer) => normalizeIp(answer.data) === normalizedOriginalIp
  );

  if (!ipMatch) {
    return { verified: false, hostname, reason: "ip-mismatch" };
  }

  return { verified: true, hostname };
}

function buildPtrName(ip) {
  if (ip.includes(":")) {
    return buildIpv6PtrName(ip);
  }

  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }

  if (parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    return null;
  }

  return `${parts.reverse().join(".")}.in-addr.arpa`;
}

function buildIpv6PtrName(ip) {
  let groups;

  if (ip.includes("::")) {
    const [left, right] = ip.split("::");
    const leftGroups = left ? left.split(":") : [];
    const rightGroups = right ? right.split(":") : [];
    const missing = 8 - leftGroups.length - rightGroups.length;

    if (missing < 0) {
      return null;
    }

    groups = [...leftGroups, ...Array(missing).fill("0"), ...rightGroups];
  } else {
    groups = ip.split(":");
  }

  if (groups.length !== 8) {
    return null;
  }

  const nibbles = groups
    .map((group) => group.padStart(4, "0"))
    .join("")
    .split("")
    .reverse();

  return `${nibbles.join(".")}.ip6.arpa`;
}

async function dohQuery(name, type) {
  try {
    const url = `${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=${type}`;
    const response = await fetch(url, {
      headers: { Accept: "application/dns-json" }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function normalizeIp(ip) {
  if (!ip.includes(":")) {
    return ip
      .split(".")
      .map((octet) => String(parseInt(octet, 10)))
      .join(".");
  }

  let groups;
  if (ip.includes("::")) {
    const [left, right] = ip.split("::");
    const leftGroups = left ? left.split(":") : [];
    const rightGroups = right ? right.split(":") : [];
    const missing = 8 - leftGroups.length - rightGroups.length;
    groups = [...leftGroups, ...Array(missing).fill("0"), ...rightGroups];
  } else {
    groups = ip.split(":");
  }

  return groups.map((group) => group.padStart(4, "0").toLowerCase()).join(":");
}

function serveRobotsTxt(origin) {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}

function injectHreflang(headers, env) {
  const canonical = `${env.CANONICAL_ORIGIN}/`;
  const xdefault = `${(env.XDEFAULT_ORIGIN ?? env.CANONICAL_ORIGIN)}/`;
  const links = [`<${canonical}>; rel="canonical"`];

  if (env.HREFLANG_TAGS) {
    try {
      const tags = JSON.parse(env.HREFLANG_TAGS);
      for (const tag of tags) {
        links.push(`<${tag.origin}>; rel="alternate"; hreflang="${tag.lang}"`);
      }
    } catch {
      console.error("Failed to parse HREFLANG_TAGS", env.HREFLANG_TAGS);
    }
  }

  links.push(`<${xdefault}>; rel="alternate"; hreflang="x-default"`);
  headers.set("Link", links.join(", "));
}

async function proxyToBackend(request, origin) {
  const incomingUrl = new URL(request.url);
  const targetOrigin = new URL(origin);
  incomingUrl.hostname = targetOrigin.hostname;
  incomingUrl.protocol = targetOrigin.protocol;
  incomingUrl.port = "";

  const response = await fetch(new Request(incomingUrl.toString(), request), {
    redirect: "manual"
  });

  const headers = new Headers(response.headers);
  headers.set("X-Xss-Protection", "1; mode=block");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function getLocaleAliases(env) {
  if (!env.LOCALE_ALIASES) {
    return [];
  }
  try {
    const parsed = JSON.parse(env.LOCALE_ALIASES);
    return Array.isArray(parsed) ? parsed.map((p) => p.toLowerCase().replace(/\/?$/, "/")) : [];
  } catch {
    return env.LOCALE_ALIASES.split(",").map((p) => p.trim().toLowerCase().replace(/\/?$/, "/")).filter(Boolean);
  }
}

function resolveLocalePath(pathname, env) {
  const aliases = getLocaleAliases(env);
  const normalized = pathname.toLowerCase().replace(/\/?$/, "/");
  if (aliases.includes(normalized)) {
    return { rewritten: true, originalPath: pathname, proxyPath: "/" };
  }
  return { rewritten: false, originalPath: pathname, proxyPath: pathname };
}


async function injectVisitorMetaAndStyle(response, request, env) {
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return response;

  // Visitor geo data intentionally not exposed in HTML source (privacy).

  // Fetch style.json from rules-public (30s edge cache → usually <5ms).
  let s = {};
  if (env.SITE_COUNTRY) {
    try {
      const styleUpstream = `https://casino-rules-public.cloudflare-jaws818-611.workers.dev/style/${env.SITE_COUNTRY}.json`;
      const sr = await fetch(styleUpstream, {
        cf: { cacheTtl: 30, cacheEverything: true },
        headers: env.RULES_FETCH_SECRET ? { Authorization: `Bearer ${env.RULES_FETCH_SECRET}` } : {}
      });
      if (sr.ok) s = await sr.json();
    } catch (_) {}
  }
  const hasStyle = s && typeof s === "object" && Object.keys(s).length > 0;

  // Build inline CSS variables for colors.
  let colorStyle = "";
  if (hasStyle) {
    const colorMap = {
      brand_color: "brand-color",
      accent_color: "accent-color",
      bg_color: "bg-color",
      text_color: "text-color",
      bonus_color_top1: "bonus-color-top1",
      bonus_color_top2: "bonus-color-top2",
      bonus_color_top3: "bonus-color-top3"
    };
    const vars = [];
    for (const [k, cssName] of Object.entries(colorMap)) {
      if (s[k]) vars.push(`--${cssName}:${s[k]}`);
    }
    if (vars.length) colorStyle = `<style>:root{${vars.join(";")}}</style>`;
  }

  // {{month}} / {{year}} template substitution (localised).
  const now = new Date();
  const langByCountry = {
    italy: "it", poland: "pl", denmark: "da",
    netherlands: "nl", uae: "ar", ireland: "en"
  };
  const lang = langByCountry[env.SITE_COUNTRY] || "en";
  let monthName = "";
  try {
    monthName = new Intl.DateTimeFormat(lang, { month: "long" }).format(now);
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  } catch (_) {
    monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"][now.getMonth()];
  }
  const year = String(now.getFullYear());
  const tmpl = (str) => str
    ? String(str).replace(/\{\{\s*month\s*\}\}/gi, monthName).replace(/\{\{\s*year\s*\}\}/gi, year)
    : str;

  const textMap = hasStyle ? {
    "hero-title": s.hero_title,
    "hero-subtitle": s.hero_subtitle,
    "header-badge": s.header_badge_text,
    "reviewer-name": s.reviewer_name,
    "reviewer-role": s.reviewer_role,
    "reviewer-initials": s.reviewer_initials,
    "trust-1": s.trust_strip_text_1,
    "trust-2": s.trust_strip_text_2,
    "disclaimer": s.disclaimer,
    "footer": s.footer_text,
    "cta": s.cta_text,
    "bonus-label": s.bonus_label
  } : {};

  let rewriter = new HTMLRewriter().on("head", {
    element(el) { if (colorStyle) el.append(colorStyle, { html: true }); }
  });

  // Title is defined in the HTML source — not overridden by rules-public.

  for (const [key, val] of Object.entries(textMap)) {
    if (val) {
      const final = tmpl(val);
      rewriter = rewriter.on(`[data-style="${key}"]`, {
        element(el) { el.setInnerContent(final, { html: true }); }
      });
    }
  }

  const toggles = [
    ["reviewer-strip", "show_reviewer_strip"],
    ["sticky-cta", "show_sticky_cta"],
    ["trust-strip", "show_trust_strip"]
  ];
  for (const [key, prop] of toggles) {
    if (hasStyle && s[prop] === false) {
      rewriter = rewriter.on(`[data-style="${key}"]`, {
        element(el) {
          const existing = el.getAttribute("style") || "";
          el.setAttribute("style", (existing ? existing + ";" : "") + "display:none");
        }
      });
    }
  }

  return rewriter.transform(response);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Canonicalise to www
    if (url.hostname === "flower-home.it") {
      return Response.redirect(
        `https://www.flower-home.it${url.pathname}${url.search}`,
        301
      );
    }

    if (url.pathname === "/robots.txt") {
      return serveRobotsTxt(url.origin);
    }

    if (isGeoBlocked(request, env)) {
      return new Response("Access denied", { status: 403 });
    }

    // Rules and style are KV-authoritative. Intercept both paths and
    // proxy to the casino-rules-public worker (reads admin's KV).
    // Casinos stay committed in git so cards render at build time
    // (SEO + no client-side flash).
    const liveMatch = url.pathname.match(/^\/(rules|style)\.json$/);
    if (liveMatch && env.SITE_COUNTRY) {
      const kind = liveMatch[1];
      const upstream = `https://casino-rules-public.cloudflare-jaws818-611.workers.dev/${kind}/${env.SITE_COUNTRY}.json`;
      try {
        const res = await fetch(upstream, {
          cf: { cacheTtl: 30, cacheEverything: true },
          headers: env.RULES_FETCH_SECRET ? { Authorization: `Bearer ${env.RULES_FETCH_SECRET}` } : {}
        });
        if (res.ok) {
          return new Response(res.body, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=30"
            }
          });
        }
      } catch (_) {}
      // Graceful fallback if upstream unreachable.
      return new Response(kind === "rules" ? "[]" : "{}", {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30"
        }
      });
    }

    const { rewritten, originalPath, proxyPath } = resolveLocalePath(url.pathname, env);

    let proxyRequest = request;
    if (rewritten) {
      const proxyUrl = new URL(request.url);
      proxyUrl.pathname = proxyPath;
      proxyRequest = new Request(proxyUrl.toString(), request);
    }

    // CLIENT_ORIGIN is optional; falls back to BOT_ORIGIN for single-Pages projects
    const clientOrigin = env.CLIENT_ORIGIN || env.BOT_ORIGIN;

    if (!isGooglebotUserAgent(request)) {
      { const _response = await proxyToBackend(proxyRequest, clientOrigin); return injectVisitorMetaAndStyle(_response, request, env); }
    }

    const ip = request.headers.get("cf-connecting-ip") ?? "0.0.0.0";
    const result = await verifyGooglebot(ip, env);

    console.log(
      JSON.stringify({
        event: "googlebot-verification",
        ip,
        verified: result.verified,
        hostname: result.hostname ?? null,
        reason: result.reason ?? null,
        country: getCountry(request),
        path: originalPath
      })
    );

    if (!result.verified) {
      return proxyToBackend(proxyRequest, clientOrigin);
    }

    const response = await proxyToBackend(proxyRequest, env.BOT_ORIGIN);
    if (response.status === 404) {
      return proxyToBackend(proxyRequest, clientOrigin);
    }

    // Link headers (canonical + hreflang) desactivados — ya están en el HTML
    return response;
  }
};
