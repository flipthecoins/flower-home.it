import { LOGO_CSS } from './logo-styles.js';
import { renderCasinoDetails, DETAILS_CSS } from './casino-details.js';
import { publicCasinos, PUBLIC_ORIGIN } from './public-media.js';
import { html } from './html.js';
import { COUNTRIES, LANGS, NL_BADGE_LABELS, GITHUB_ORG } from './config.js';

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days
const MEDIA_CDN = 'img/logos';
// Devuelve la URL del logo: soporta URLs absolutas (CF Images) y paths relativos (legacy)
function logoUrl(logo) {
  if (!logo) return '';
  return logo.startsWith('http') ? logo : `${MEDIA_CDN}/${logo}`;
}

const DEFAULT_COLORS = { cta: '#16a34a', gold: '#d4af37', navy: '#1d3557', accent: '#e63946', text: '#ffffff' };

const DEFAULT_CASINOS = {
  italy: [
    { name: 'Bizzo Casino', slug: 'bizzo', logo: 'bizzo.webp', rating: '4.9/5', license: 'Licenza Curaçao', bonus: '100% fino a €500 + 100 giri gratis', methods: 'Visa, Mastercard, Skrill, Neteller, Bitcoin', min_deposit: '€10', badge: 'Top Pick', destination: '', redirect_type: '302' },
    { name: 'Wazamba', slug: 'wazamba', logo: 'wazamba.webp', rating: '4.8/5', license: 'Licenza Curaçao', bonus: '100% fino a €500 + 200 giri gratis', methods: 'Visa, Mastercard, Skrill, Neteller, Crypto, Paysafecard', min_deposit: '€10', badge: 'Best Bonus', destination: '', redirect_type: '302' },
    { name: 'Richmoose', slug: 'richmoose', logo: 'richmoose.webp', rating: '4.7/5', license: 'Licenza MGA Malta', bonus: 'Fino a €1.100 + 700 giri gratis + 15% cashback', methods: 'Visa, Mastercard, Apple Pay, Revolut, Jetonbank', min_deposit: '€10', badge: '', destination: '', redirect_type: '302' },
    { name: 'NV Casino', slug: 'nvcasino', logo: 'nvcasino.webp', rating: '4.7/5', license: 'Licenza Curaçao', bonus: 'Fino a €1.500 + 225 giri gratis', methods: 'Visa, Mastercard, Skrill, Neteller, Crypto', min_deposit: '€20', badge: '', destination: '', redirect_type: '302' },
    { name: 'Spinlander', slug: 'spinlander', logo: 'spinlander.webp', rating: '4.6/5', license: 'Licenza Anjouan', bonus: '230% fino a €2.000 + 300 giri gratis', methods: 'Visa, Mastercard, Neteller, Skrill, Bitcoin, Ethereum', min_deposit: '€10', badge: '', destination: '', redirect_type: '302' },
    { name: 'TenBet', slug: 'tenbet', logo: 'tenbet.webp', rating: '4.5/5', license: 'Licenza Curaçao', bonus: '400% fino a €2.000 · wager 25x', methods: 'Visa, Mastercard, Bonifico Bancario, Crypto', min_deposit: '€10', badge: '', destination: '', redirect_type: '302' },
    { name: 'Zipcasino', slug: 'zipcasino', logo: 'zipcasino.webp', rating: '4.5/5', license: 'Licenza Curaçao', bonus: '100% fino a €1.000 + 50 giri gratis', methods: 'Visa, Mastercard, Skrill, Neteller', min_deposit: '€20', badge: '', destination: '', redirect_type: '302' },
    { name: 'Golden Panda', slug: 'goldenpanda', logo: 'goldenpanda.webp', rating: '4.4/5', license: 'Licenza Curaçao', bonus: '200% fino a €5.700 + 15% cashback', methods: 'Visa, Mastercard, Revolut, Crypto', min_deposit: '€10', badge: '', destination: '', redirect_type: '302' },
    { name: 'Sugarino', slug: 'sugarino', logo: 'sugarino.webp', rating: '4.3/5', license: 'Licenza Anjouan', bonus: 'Fino a €888 + 888 giri gratis + 15% cashback', methods: 'Visa, Mastercard, Bonifico Bancario, Crypto', min_deposit: '€20', badge: '', destination: '', redirect_type: '302' },
    { name: 'PuppyBet', slug: 'puppybet', logo: 'puppybet.webp', rating: '4.4/5', license: 'Licenza Curaçao', bonus: '200% fino a €500 + 50 giri gratis', methods: 'Visa, Mastercard, Skrill, Crypto', min_deposit: '€10', badge: '', destination: '', redirect_type: '302' },
  ],
};

// ── Country config helper (hardcoded + dynamic from KV) ──────────

async function getCountryConfig(id, env) {
  if (COUNTRIES[id]) return COUNTRIES[id];
  const raw = await env.SESSIONS.get(`bot:country:${id}`);
  if (raw) return JSON.parse(raw);
  return null;
}

async function getAllCountries(env) {
  const all = { ...COUNTRIES };
  const dynRaw = await env.SESSIONS.get('bot:country-list');
  if (dynRaw) {
    const ids = JSON.parse(dynRaw);
    await Promise.all(ids.map(async id => {
      if (!all[id]) {
        const raw = await env.SESSIONS.get(`bot:country:${id}`);
        if (raw) all[id] = JSON.parse(raw);
      }
    }));
  }
  return all;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    if (path === '/' || path === '') {
      return new Response(html(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (path.startsWith('/api/')) {
      const res = await handleAPI(path, request, env);
      const h = new Headers(res.headers);
      for (const [k, v] of Object.entries(corsHeaders)) h.set(k, v);
      return new Response(res.body, { status: res.status, headers: h });
    }

    return new Response('Not found', { status: 404 });
  },
};

async function handleAPI(path, request, env) {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  // POST /api/auth
  if (path === '/api/auth' && request.method === 'POST') {
    const { password } = await request.json();
    if (password !== env.ADMIN_PASSWORD) return json({ error: 'Invalid password' }, 401);
    const token = crypto.randomUUID();
    await env.SESSIONS.put(`bot-session:${token}`, '1', { expirationTtl: SESSION_TTL });
    return json({ token });
  }

  // GET /api/rules/:country — acepta sesión admin O X-Api-Key (workers externos)
  const rulesReadMatch = path.match(/^\/api\/rules\/(\w+)$/);
  if (rulesReadMatch && request.method === 'GET') {
    const apiKey = request.headers.get('X-Api-Key');
    const sessionToken = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
    const validApiKey = apiKey && env.RULES_API_KEY && apiKey === env.RULES_API_KEY;
    const validSession = sessionToken && !!(await env.SESSIONS.get(`bot-session:${sessionToken}`));
    if (!validApiKey && !validSession) return json({ error: 'Unauthorized' }, 401);
    const id = rulesReadMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    const raw = await env.SESSIONS.get(`bot:rules:${id}`);
    return json({ rules: raw ? JSON.parse(raw) : [] });
  }

  // GET /api/media/:filename — public
  const publicMedia = path.match(/^\/api\/media\/(.+)$/);
  if (publicMedia && request.method === 'GET') {
    const filename = decodeURIComponent(publicMedia[1]);
    const data = await env.SESSIONS.get(`media:file:${filename}`);
    if (!data) return json({ error: 'Not found' }, 404);
    const ext = filename.split('.').pop().toLowerCase();
    const types = { svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
    const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    return new Response(binary, { headers: { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' } });
  }

  // POST /api/click/:countryId/:slug/:type — public, no auth (click tracking)
  const clickMatch = path.match(/^\/api\/click\/([^/]+)\/([^/]+)\/(play|review)$/);
  if (clickMatch && request.method === 'POST') {
    // Server-side bot filter: drop known crawlers & HTTP clients
    const ua = (request.headers.get('User-Agent') || '').toLowerCase();
    const BOT_RE = /bot|crawl|spider|slurp|scrape|headless|puppeteer|playwright|python|curl|wget|axios|node-fetch|go-http|java\/|libwww|perl|php\/|scrapy|httpclient|okhttp|requests\//;
    if (!ua || BOT_RE.test(ua)) return json({ ok: true }); // silently ignore
    const [, countryId, slug, type] = clickMatch;
    const today = new Date().toISOString().slice(0, 10);
    const dayKey = `stats-day:${countryId}:${today}`;
    try {
      const raw = await env.SESSIONS.get(dayKey);
      const counts = raw ? JSON.parse(raw) : {};
      const k = `${slug}:${type}`;
      counts[k] = (counts[k] || 0) + 1;
      await env.SESSIONS.put(dayKey, JSON.stringify(counts));
    } catch (e) { /* silent fail */ }
    return json({ ok: true });
  }

  // Auth check
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (!token || !(await env.SESSIONS.get(`bot-session:${token}`))) return json({ error: 'Unauthorized' }, 401);

  // GET /api/countries
  if (path === '/api/countries' && request.method === 'GET') {
    const all = await getAllCountries(env);
    const list = await Promise.all(Object.entries(all).map(async ([id, c]) => {
      const kvKey = c.kv_key || `bot:casinos:${id}`;
      const raw = await env.SESSIONS.get(kvKey);
      const count = raw ? JSON.parse(raw).length : (DEFAULT_CASINOS[id]?.length || 0);
      const settingsRaw = await env.SESSIONS.get(`bot:settings:${id}`);
      const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
      return { id, name: c.name, flag: c.flag, casinoCount: count, language: settings.language || 'it' };
    }));
    return json(list);
  }

  // POST /api/countries — crear nuevo país dinámico
  if (path === '/api/countries' && request.method === 'POST') {
    const body = await request.json();
    const { id, name, flag, link_base, repo, bot_path } = body;
    if (!id || !name) return json({ error: 'id and name are required' }, 400);
    if (COUNTRIES[id]) return json({ error: 'Country already exists as hardcoded' }, 409);
    const countryConfig = {
      name,
      flag: flag || '🏳️',
      repo: repo || '',
      bot_path: bot_path || '',
      link_base: link_base || '',
      kv_key: `bot:casinos:${id}`,
    };
    await env.SESSIONS.put(`bot:country:${id}`, JSON.stringify(countryConfig));
    const listRaw = await env.SESSIONS.get('bot:country-list');
    const list = listRaw ? JSON.parse(listRaw) : [];
    if (!list.includes(id)) { list.push(id); await env.SESSIONS.put('bot:country-list', JSON.stringify(list)); }
    return json({ ok: true, id });
  }

  // GET /api/casinos/:country
  const casinoMatch = path.match(/^\/api\/casinos\/(\w+)$/);
  if (casinoMatch && request.method === 'GET') {
    const id = casinoMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    const kvKey = config.kv_key || `bot:casinos:${id}`;
    const raw = await env.SESSIONS.get(kvKey);
    const casinos = raw ? JSON.parse(raw) : (DEFAULT_CASINOS[id] || []);
    const colorsRaw = await env.SESSIONS.get(`bot:colors:${id}`);
    const colors = colorsRaw ? JSON.parse(colorsRaw) : {};
    const settingsRaw = await env.SESSIONS.get(`bot:settings:${id}`);
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
    return json({ country: { id, ...config }, casinos, colors, settings });
  }

  // POST /api/casinos/:country
  if (casinoMatch && request.method === 'POST') {
    const id = casinoMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    const body = await request.json();
    const { casinos, colors } = body;
    if (!Array.isArray(casinos)) return json({ error: 'Invalid data' }, 400);

    const kvKey = config.kv_key || `bot:casinos:${id}`;
    await env.SESSIONS.put(kvKey, JSON.stringify(casinos));
    if (colors && typeof colors === 'object') {
      await env.SESSIONS.put(`bot:colors:${id}`, JSON.stringify(colors));
    }

    // Load language setting
    const settingsRaw = await env.SESSIONS.get(`bot:settings:${id}`);
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
    const lang = settings.language || 'it';

    // Skip GitHub push if no repo configured (dynamic country without domain)
    if (!config.repo || !config.bot_path) {
      return json({ ok: true, note: 'Saved to KV. No GitHub repo configured yet.' });
    }

    try {
      const media = JSON.parse(await env.SESSIONS.get('media:index') || '[]');
      const published = publicCasinos(casinos, media);
      const toplistHTML = generateToplistHTML(published, config, lang, settings, id, PUBLIC_ORIGIN);
      const file = await githubGetFile(config.repo, config.bot_path, env);
      if (!/<!-- TOPLIST_START -->[\s\S]*?<!-- TOPLIST_END -->/.test(file.content)) throw new Error('TOPLIST markers not found in HTML.');
      let patched = file.content.replace(
        /<!-- TOPLIST_START -->[\s\S]*?<!-- TOPLIST_END -->/,
        `<!-- TOPLIST_START -->\n${toplistHTML}\n<!-- TOPLIST_END -->`
      );

      if (colors) {
        const colorsCSS = generateColorsCSS(colors);
        // Try TOPLIST_STYLE_START/END markers first
        let patchedColors = patched.replace(
          /<!-- TOPLIST_STYLE_START -->[\s\S]*?<!-- TOPLIST_STYLE_END -->/,
          `<!-- TOPLIST_STYLE_START -->\n${colorsCSS}\n<!-- TOPLIST_STYLE_END -->`
        );
        if (patchedColors !== patched) {
          patched = patchedColors;
        } else {
          // Remove ALL existing toplist-custom-colors blocks (prevents duplicates)
          patched = patched.replace(/<style id="toplist-custom-colors">[\s\S]*?<\/style>\s*/g, '');
          patched = patched.replace('</head>', colorsCSS + '\n</head>');
        }
      }

      // Patch sticky bonus
      const stickyHTML = generateStickyBonusHTML(published, config, lang, settings);
      {
        const patchedSticky = patched.replace(
          /<!-- STICKY_START -->[\s\S]*?<!-- STICKY_END -->/,
          `<!-- STICKY_START -->\n    ${stickyHTML}\n    <!-- STICKY_END -->`
        );
        if (patchedSticky !== patched) patched = patchedSticky;
      }

      const casinoSummary = casinos.map((c, i) => `${i+1}. ${c.name} → ${c.destination || c.link || `${config.link_base}/${c.slug}`}`).join(', ');
      const commitMsg = `toplist(${id}): ${casinos.length} casinos — ${casinoSummary}`;
      if (patched !== file.content) await githubPutFile(config.repo, config.bot_path, patched, file.sha, env, commitMsg);

      // Push _redirects if path is configured
      if (settings.redirects_path) {
        const redirectLines = casinos
          .filter(c => c.slug && c.destination)
          .map(c => `/${c.slug} ${c.destination} ${c.redirect_type || '302'}`);
        if (redirectLines.length) {
          const redirectsContent = redirectLines.join('\n') + '\n';
          try {
            let existingSha;
            try { const rf = await githubGetFile(config.repo, settings.redirects_path, env); existingSha = rf.sha; } catch(e) {}
            await githubPutFile(config.repo, settings.redirects_path, redirectsContent, existingSha, env, `redirects(${id}): ${redirectLines.length} destinations`);
          } catch(e) { /* don't fail the whole deploy */ }
        }
      }

      return json({ ok: true, published: true });
    } catch (e) {
      console.error('Static toplist copy could not be updated', id, e.message);
      return json({ ok: true, published: true, warning: 'Published to connected sites. The static backup could not be updated; please retry saving.' });
    }
  }

  // GET /api/settings/:country
  const settingsMatch = path.match(/^\/api\/settings\/(\w+)$/);
  if (settingsMatch && request.method === 'GET') {
    const id = settingsMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    const raw = await env.SESSIONS.get(`bot:settings:${id}`);
    return json(raw ? JSON.parse(raw) : { language: 'it' });
  }

  // POST /api/settings/:country
  if (settingsMatch && request.method === 'POST') {
    const id = settingsMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    const body = await request.json();
    await env.SESSIONS.put(`bot:settings:${id}`, JSON.stringify(body));
    return json({ ok: true });
  }

  // GET /api/domains/:country
  const domainsMatch = path.match(/^\/api\/domains\/(\w+)$/);
  if (domainsMatch && request.method === 'GET') {
    const id = domainsMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    const raw = await env.SESSIONS.get(`bot:domains:${id}`);
    return json({ domains: raw ? JSON.parse(raw) : [] });
  }

  // POST /api/domains/:country
  if (domainsMatch && request.method === 'POST') {
    const id = domainsMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    const body = await request.json();
    if (!Array.isArray(body.domains)) return json({ error: 'Invalid data' }, 400);
    await env.SESSIONS.put(`bot:domains:${id}`, JSON.stringify(body.domains));
    return json({ ok: true });
  }

  // POST /api/rules/:country — solo admin
  const rulesMatch = path.match(/^\/api\/rules\/(\w+)$/);
  if (rulesMatch && request.method === 'POST') {
    const id = rulesMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    const body = await request.json();
    if (!Array.isArray(body.rules)) return json({ error: 'Invalid data' }, 400);
    await env.SESSIONS.put(`bot:rules:${id}`, JSON.stringify(body.rules));
    return json({ ok: true });
  }

  // GET /api/stats/:countryId
  const statsMatch = path.match(/^\/api\/stats\/([^/]+)$/);
  if (statsMatch && request.method === 'GET') {
    const id = statsMatch[1];
    const config = await getCountryConfig(id, env);
    if (!config) return json({ error: 'Country not found' }, 404);
    // Fetch last 30 days in parallel
    const days = Array.from({ length: 30 }, (_, i) =>
      new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    );
    const raws = await Promise.all(days.map(d => env.SESSIONS.get(`stats-day:${id}:${d}`)));
    const allData = {};
    raws.forEach((raw, i) => { if (raw) allData[days[i]] = JSON.parse(raw); });
    // Casino names map
    const kvKey = config.kv_key || `bot:casinos:${id}`;
    const listRaw = await env.SESSIONS.get(kvKey);
    const list = listRaw ? JSON.parse(listRaw) : (DEFAULT_CASINOS[id] || []);
    const casinosMap = {};
    list.forEach(c => { casinosMap[c.slug] = c.name; });
    return json({ allData, casinos: casinosMap });
  }

  // GET /api/media
  if (path === '/api/media' && request.method === 'GET') {
    const raw = await env.SESSIONS.get('media:index');
    return json(raw ? JSON.parse(raw) : []);
  }

  // POST /api/media
  if (path === '/api/media' && request.method === 'POST') {
    const { filename, data, type } = await request.json();
    if (!filename || !data) return json({ error: 'Missing filename or data' }, 400);
    await env.SESSIONS.put(`media:file:${filename}`, data);
    const raw = await env.SESSIONS.get('media:index');
    const index = raw ? JSON.parse(raw) : [];
    const i = index.findIndex(m => m.filename === filename);
    const entry = { filename, type: type || 'image/webp', size: Math.round(data.length * 3 / 4), uploaded_at: new Date().toISOString() };
    if (i >= 0) index[i] = entry; else index.push(entry);
    await env.SESSIONS.put('media:index', JSON.stringify(index));
    return json({ ok: true, filename });
  }

  // DELETE /api/media/:filename
  const mediaDelete = path.match(/^\/api\/media\/(.+)$/);
  if (mediaDelete && request.method === 'DELETE') {
    const filename = decodeURIComponent(mediaDelete[1]);
    await env.SESSIONS.delete(`media:file:${filename}`);
    const raw = await env.SESSIONS.get('media:index');
    const index = raw ? JSON.parse(raw) : [];
    await env.SESSIONS.put('media:index', JSON.stringify(index.filter(m => m.filename !== filename)));
    return json({ ok: true });
  }

  return json({ error: 'Not found' }, 404);
}

// ── HTML generation ──────────────────────────────────────────────

function safeLink(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : '#'; } catch { return '#'; }
}

function escHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const BADGE_CLASS = {'Top Pick':'badge--gold','Best Bonus':'badge--gold',"Editor's Choice":'badge--navy','Most Popular':'badge--red','New Casino':'badge--green','Exclusive':'badge--navy','Recommended':'badge--navy','VIP':'badge--gold','🔥 Hot':'badge--red'};

export function generateToplistHTML(casinos, config, lang, settings, countryId, trackingOrigin) {
  const base = LANGS[lang] || LANGS['it'];
  const L = Object.assign({}, base, {
    cta_play:   (settings && settings.cta_play)   || base.cta_play,
    cta_review: (settings && settings.cta_review) || base.cta_review,
  });
  const linkBase = config.link_base || '';
  const compact = countryId === 'netherlands' || config.kv_key === 'bot:casinos:netherlands';
  const items = casinos.map((c, i) => {
    const rank = i + 1;
    const isTop3 = rank <= 3;
    const hasBonus = !!String(c.bonus || '').trim();
    const itemClass = (isTop3 ? `toplist__item toplist__item--top toplist__item--${rank}` : 'toplist__item') + (compact ? ' toplist__item--compact' + (!hasBonus ? ' toplist__item--no-bonus' : '') : '');
    const rankClass = isTop3 ? `toplist__rank toplist__rank--${rank}` : 'toplist__rank';
    const link = safeLink(c.link || (!settings?.redirects_path && c.destination) || `${linkBase}/${c.slug}`);
    const ctaPlay = escHtml(c.cta_play || L.cta_play);
    const ctaReview = escHtml(c.cta_review || L.cta_review);
    const badgeClass = BADGE_CLASS[c.badge] || 'badge--gold';
    return `
    <div class="${itemClass}" role="listitem">
        <div class="toplist__main">
            <div class="${rankClass}">${rank}</div>
            <div class="toplist__logo">
                <img src="${escHtml(logoUrl(c.logo))}" alt="${escHtml(c.name)}" class="toplist__logo-img">
            </div>
            <div class="toplist__info">
                <div class="toplist__header">
                    <span class="toplist__name">${escHtml(c.name)}</span>
                    ${c.badge ? `<span class="badge ${badgeClass}">${escHtml(lang === 'nl' ? NL_BADGE_LABELS[c.badge] || c.badge : c.badge)}</span>` : ''}
                </div>
                ${c.withdrawal_time ? `<div class="toplist__speed"><span class="toplist__speed-lbl">Opname</span><span class="toplist__speed-val"><i data-lucide="zap" class="icon"></i> ${escHtml(c.withdrawal_time)}</span></div>` : ''}
                ${!compact && String(c.license || '').trim() ? `<div class="toplist__license"><i data-lucide="shield-check" class="icon"></i> ${escHtml(c.license)}</div>` : ''}
            </div>
            ${!compact || hasBonus ? `<div class="toplist__bonus">
                <span class="toplist__bonus-label"><i data-lucide="gift" class="icon"></i> ${L.bonus_label}</span>
                <span class="toplist__bonus-value">${escHtml(c.bonus)}</span>
            </div>` : ''}
            <div class="toplist__cta">
                <a href="${escHtml(link)}" class="btn btn--play" data-cs="${escHtml(c.slug)}:play" rel="noopener noreferrer nofollow" target="_blank">${ctaPlay}</a>
                <a href="${escHtml(link)}" class="btn btn--review" data-cs="${escHtml(c.slug)}:review" rel="noopener noreferrer nofollow" target="_blank">${ctaReview}</a>
            </div>
        </div>
        ${compact ? renderCasinoDetails(c, lang, L, escHtml) : `<div class="toplist__footer">
            <div class="toplist__footer-col">
                <span class="toplist__footer-label">${L.methods_label}</span>
                <span class="toplist__footer-val">${escHtml(c.methods)}</span>
            </div>
            <div class="toplist__footer-col">
                <span class="toplist__footer-label">${L.deposit_label}</span>
                <span class="toplist__footer-val">${escHtml(c.min_deposit)}</span>
            </div>
            <div class="toplist__footer-col">
                <span class="toplist__footer-label">${L.verified_label}</span>
                <span class="toplist__footer-val">${L.disclaimer}</span>
            </div>
        </div>`}
    </div>`;
  }).join('\n');

  if (!countryId || !trackingOrigin) return items;
  const trackingScript = `<script>(function(){if(navigator.webdriver||!navigator.languages||!navigator.languages.length)return;var o=${JSON.stringify(trackingOrigin)},c=${JSON.stringify(countryId)};document.addEventListener('click',function(e){var a=e.target.closest('[data-cs]');if(!a)return;var p=a.dataset.cs.split(':');try{navigator.sendBeacon(o+'/api/click/'+c+'/'+p[0]+'/'+p[1]);}catch(x){}});})()</script>`;
  return items + '\n' + trackingScript;
}

// ── Sticky bonus generation ──────────────────────────────────────

export function generateStickyBonusHTML(casinos, config, lang, settings) {
  if (!casinos.length) return '';
  const c = casinos[0];
  const base = LANGS[lang] || LANGS['it'];
  const L = Object.assign({}, base, {
    cta_play: (settings && settings.cta_play) || base.cta_play,
  });
  const link = safeLink(c.link || (!settings?.redirects_path && c.destination) || `${config.link_base}/${c.slug}`);
  const ctaPlay = escHtml(c.cta_play || L.cta_play);
  const score = escHtml(String(c.rating || '').split('/')[0].trim());
  return `<div class="sticky-bonus" id="stickyBonus" role="complementary" aria-label="Offerta casino consigliato">
        <div class="sticky-bonus__inner">
            <div class="sticky-bonus__rank" aria-hidden="true">1</div>
            <div class="sticky-bonus__logo">
                <img src="${escHtml(logoUrl(c.logo))}" alt="${escHtml(c.name)}" class="sticky-bonus__logo-img">
            </div>
            <div class="sticky-bonus__info">
                <span class="sticky-bonus__name">${escHtml(c.name)}</span>
                <span class="sticky-bonus__offer">${escHtml(c.bonus)}</span>
            </div>
            <div class="sticky-bonus__stars" aria-label="Valutazione ${score} su 5">
                <span class="sticky-bonus__score">${score}</span>
                <span class="sticky-stars" aria-hidden="true">★★★★★</span>
            </div>
            <a href="${escHtml(link)}" class="btn btn--play sticky-bonus__cta" rel="noopener noreferrer nofollow" target="_blank">${ctaPlay}</a>
            <button class="sticky-bonus__close" id="stickyClose" aria-label="Chiudi">✕</button>
        </div>
    </div>`;
}

// ── Colors CSS generation ────────────────────────────────────────

export function generateColorsCSS(colors) {
  const c = { ...DEFAULT_COLORS, ...colors };
  return `<style id="toplist-custom-colors">
.toplist, .toplist-slot, .sticky-bonus {
  --c-navy: ${c.navy};
  --c-navy-dark: ${c.navy};
  --c-navy-light: ${c.navy};
  --c-gold: ${c.gold};
  --c-gold-light: ${c.gold};
  --c-red: ${c.accent};
  --c-red-dark: ${c.accent};
  --c-text: ${c.text};
}
.toplist__item { background: ${c.navy} !important; }
.toplist__name, .toplist__bonus-value { color: ${c.text} !important; }
.toplist__bonus-label, .toplist__footer-label { color: ${c.text} !important; opacity: .5; }
.toplist__footer-val, .toplist__license { color: ${c.text} !important; opacity: .75; }
.btn--play {
  background: linear-gradient(135deg, ${c.cta}, color-mix(in srgb, ${c.cta} 78%, #000)) !important;
  box-shadow: 0 4px 14px ${c.cta}66 !important;
}
.btn--play::after { content: '→'; transition: transform .15s ease; }
.btn--play:hover {
  background: linear-gradient(135deg, color-mix(in srgb, ${c.cta} 88%, #000), color-mix(in srgb, ${c.cta} 68%, #000)) !important;
  box-shadow: 0 6px 20px ${c.cta}80 !important;
  transform: translateY(-1px);
}
.btn--play:hover::after { transform: translateX(3px); }
${LOGO_CSS}
${DETAILS_CSS}
@media (max-width: 600px) {
  .toplist__cta { flex-direction: row !important; }
  .btn--review { order: -1; }
}
</style>`;
}

// ── GitHub helpers ───────────────────────────────────────────────

async function githubGetFile(repo, filePath, env) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${repo}/contents/${filePath}`, {
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'bot-admin', Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
  const data = await res.json();
  const binary = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0));
  return { content: new TextDecoder().decode(binary), sha: data.sha };
}

async function githubPutFile(repo, filePath, content, sha, env, message) {
  const commitMessage = message || 'chore: update toplist via bot-admin';
  const body = { message: commitMessage, content: btoa(unescape(encodeURIComponent(content))) };
  if (sha) body.sha = sha; // omit sha when creating a new file
  const res = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'bot-admin', Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${res.status}: ${await res.text()}`);
  return res.json();
}

async function syncLogos(casinos, config, env) {
  if (!config.repo) return;
  // Derivar el directorio de logos del bot_path (mismo nivel que el HTML)
  const botDir = config.bot_path
    ? config.bot_path.substring(0, config.bot_path.lastIndexOf('/'))
    : `proyectos/${config.repo}/bot`;
  const logosPath = `${botDir}/img/logos`;
  await Promise.allSettled(casinos.filter(c => c.logo).map(async c => {
    const logoPath = `${logosPath}/${c.logo}`;
    const check = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${config.repo}/contents/${logoPath}`, {
      headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'bot-admin', Accept: 'application/vnd.github.v3+json' },
    });
    if (check.ok) return;
    const mediaData = await env.SESSIONS.get(`media:file:${c.logo}`);
    if (!mediaData) return;
    await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${config.repo}/contents/${logoPath}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'bot-admin', Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `chore: add logo ${c.logo}`, content: mediaData }),
    });
  }));
}
