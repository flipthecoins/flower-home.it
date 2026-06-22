#!/usr/bin/env node
/**
 * Reads casinos.json and injects casino cards into index.html.
 * Reads build-config.json for localized labels (optional).
 * Usage: node scripts/build-casinos.js <client-dir>
 *
 * Casinos are committed-to-git source-of-truth: cards are rendered
 * at build time so initial HTML is complete (no client-side flash,
 * SEO-friendly). The rules engine still runs client-side fetching
 * /rules.json (which the router serves live from KV).
 */

const fs = require('fs');
const path = require('path');

const clientDir = process.argv[2];
if (!clientDir) { console.error('Usage: node build-casinos.js <client-dir>'); process.exit(1); }

const casinosPath = path.join(clientDir, 'casinos.json');
const indexPath = path.join(clientDir, 'index.html');
const configPath = path.join(clientDir, 'build-config.json');

if (!fs.existsSync(casinosPath)) { console.log('No casinos.json found, skipping build'); process.exit(0); }
if (!fs.existsSync(indexPath)) { console.error('index.html not found at', indexPath); process.exit(1); }

const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));
const html = fs.readFileSync(indexPath, 'utf8');

const defaultConfig = {
  bonus_label: 'Welcome Bonus',
  cta_text: 'CLAIM YOUR BONUS',
  disclaimer: '18+',
};
const config = fs.existsSync(configPath)
  ? { ...defaultConfig, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) }
  : defaultConfig;

console.log(`Building ${casinos.length} casino cards for ${clientDir}`);

function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function buildCard(c, i) {
  const rank = i + 1;
  let cardClass = 'casino-card';
  let rankClass = 'rank';

  if (rank === 1) { cardClass += ' top-1'; rankClass += ' gold'; }
  else if (rank === 2) { cardClass += ' top-2'; rankClass += ' silver'; }
  else if (rank === 3) { cardClass += ' top-3'; rankClass += ' bronze'; }

  const logoSrc = /^https?:\/\//i.test(c.logo || '')
    ? esc(c.logo)
    : `img/${esc(c.logo)}`;

  const badgeHtml = c.badge
    ? `\n                    <div class="partner-badge">&#9733; ${esc(c.badge)}</div>`
    : '';

  const tagsHtml = (c.tags || [])
    .map(t => `                            <span class="tag">${esc(t)}</span>`)
    .join('\n');

  const methodsHtml = (c.methods || [])
    .map(m => `                            <span class="method">${esc(m)}</span>`)
    .join('\n');

  return `
<!-- #${rank} ${esc(c.name)} -->
                <div class="${cardClass}" data-slug="${esc(c.slug)}">
                    <div class="${rankClass}">${rank}</div>${badgeHtml}
                    <div class="card-logo" style="background:#f0f0f0">
                        <img src="${logoSrc}" alt="${esc(c.name)}">
                    </div>
                    <div class="card-body">
                        <div class="card-name">${esc(c.name)}</div>
                        <div class="card-bonus">
                            <div class="label" data-style="bonus-label">${esc(config.bonus_label)}</div>
                            <div class="value">${esc(c.bonus_value)}</div>
                            <div class="spins">${esc(c.bonus_spins)}</div>
                        </div>
                        <div class="card-tags">
${tagsHtml}
                        </div>
                        <div class="card-methods">
${methodsHtml}
                        </div>
                        <div class="card-cta">
                            <a href="/go/${esc(c.slug)}" target="_blank" rel="nofollow noopener" class="cta-btn" data-style="cta">${esc(config.cta_text)}</a>
                            <div class="card-18" data-style="disclaimer">${esc(config.disclaimer)}</div>
                        </div>
                    </div>
                </div>`;
}

const cardsHtml = casinos.map((c, i) => buildCard(c, i)).join('\n');

const startMarker = '<div class="grid">';
const endMarker = '</div>\n        </div>\n    </main>';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find casino grid markers in index.html');
  process.exit(1);
}

const before = html.substring(0, startIdx + startMarker.length);
const after = html.substring(endIdx);
let newHtml = before + '\n' + cardsHtml + '\n\n            ' + after;

// Remove any previously-injected engine block(s) — both marker-tagged
// variants (rules-engine, casinos-engine, style-engine) and the legacy
// un-tagged one.
newHtml = newHtml.replace(/<!-- (?:rules-engine|casinos-engine|style-engine) -->[\s\S]*?<\/script>/g, '');
newHtml = newHtml.replace(
  /<script>\s*\(function\(\)\{\s*var grid = document\.querySelector\('\.grid'\)[\s\S]*?<\/script>/g,
  ''
);

// Inject style-hydration script: fetches /style.json (served live by
// router from admin KV) and applies CSS variables + text replacements.
const STYLE_MARKER = '<!-- style-engine -->';
const styleScript = `
${STYLE_MARKER}<script>
(function(){
  function tmpl(str){
    if (!str) return str;
    var d = new Date();
    var locale = document.documentElement.lang || 'en';
    var month = '';
    try {
      month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(d);
      month = month.charAt(0).toUpperCase() + month.slice(1);
    } catch (_) {
      month = ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()];
    }
    return String(str)
      .replace(/\{\{\s*month\s*\}\}/gi, month)
      .replace(/\{\{\s*year\s*\}\}/gi, d.getFullYear());
  }
  function apply(s){
    if (!s || typeof s !== 'object') return;
    var root = document.documentElement.style;
    var setVar = function(name, val){ if (val) root.setProperty('--' + name, val); };
    setVar('brand-color', s.brand_color);
    setVar('accent-color', s.accent_color);
    setVar('bg-color', s.bg_color);
    setVar('text-color', s.text_color);
    setVar('bonus-color-top1', s.bonus_color_top1);
    setVar('bonus-color-top2', s.bonus_color_top2);
    setVar('bonus-color-top3', s.bonus_color_top3);
    // Texts and visibility live in the source HTML — runtime hydration
    // would flash and could trample author-written rich markup. Colors
    // alone are applied here because CSS variables paint synchronously
    // before content is visible.
  }
  fetch('/style.json', { credentials: 'omit' })
    .then(function(r){ return r.ok ? r.json() : null; })
    .catch(function(){ return null; })
    .then(function(s){ if (s && Object.keys(s).length) apply(s); });
})();
<\/script>`;

const RULES_MARKER = '<!-- rules-engine -->';
const rulesScript = `
${RULES_MARKER}<script>
(function(){
  var grid = document.querySelector('.grid');
  if (!grid) return;
  fetch('/rules.json').then(function(r){ return r.ok ? r.json() : []; }).catch(function(){ return []; }).then(function(rules){
    if (!rules || !rules.length) return;
    var now = new Date();
    var day = ['sun','mon','tue','wed','thu','fri','sat'][now.getDay()];
    var time = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    var ua = navigator.userAgent.toLowerCase();
    var device = /mobile|android|iphone|ipod/.test(ua) ? 'mobile' : /ipad|tablet/.test(ua) ? 'tablet' : 'desktop';
    var geo = document.querySelector('meta[name="x-visitor-country"]');
    var city = document.querySelector('meta[name="x-visitor-city"]');
    var ip = document.querySelector('meta[name="x-visitor-ip"]');
    var vpnMeta = document.querySelector('meta[name="x-visitor-vpn"]');
    geo = geo ? geo.content.toUpperCase() : '';
    city = city ? city.content : '';
    ip = ip ? ip.content : '';
    var vpn = !!(vpnMeta && vpnMeta.content === '1');
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i]; var c = r.conditions; if (!c) continue;
      if (typeof c.vpn === 'boolean' && c.vpn !== vpn) continue;
      if (c.device && c.device.length && c.device.indexOf(device) === -1) continue;
      if (c.geo && c.geo.length && geo && c.geo.indexOf(geo) === -1) continue;
      if (c.city && c.city.length && city) { var cityMatch = false; for(var ci=0;ci<c.city.length;ci++){if(city.toLowerCase().indexOf(c.city[ci].toLowerCase())!==-1){cityMatch=true;break;}} if(!cityMatch) continue; }
      if (c.dayOfWeek && c.dayOfWeek.length && c.dayOfWeek.indexOf(day) === -1) continue;
      if (c.timeFrom && c.timeTo && (time < c.timeFrom || time > c.timeTo)) continue;
      if (Array.isArray(r.toplist)) {
        var cards = Array.from(grid.querySelectorAll('.casino-card[data-slug]'));
        var ordered = [];
        r.toplist.forEach(function(slug) {
          var card = cards.find(function(el) { return el.getAttribute('data-slug') === slug; });
          if (card) ordered.push(card);
        });
        cards.forEach(function(card) { if (ordered.indexOf(card) === -1) card.style.display = 'none'; });
        ordered.forEach(function(card, idx) {
          card.style.display = '';
          grid.appendChild(card);
          var rank = card.querySelector('.rank');
          if (rank) rank.textContent = idx + 1;
          card.className = card.className.replace(/top-[123]/g, '').trim();
          if (idx === 0) card.classList.add('top-1');
          else if (idx === 1) card.classList.add('top-2');
          else if (idx === 2) card.classList.add('top-3');
        });
      }
      break;
    }
  });
})();
<\/script>`;

const bodyClose = '</body>';
const bodyIdx = newHtml.lastIndexOf(bodyClose);
if (bodyIdx !== -1) {
  newHtml = newHtml.substring(0, bodyIdx) + rulesScript + '\n' + styleScript + '\n' + newHtml.substring(bodyIdx);
}

fs.writeFileSync(indexPath, newHtml, 'utf8');
console.log(`Done: ${casinos.length} casino cards injected into index.html`);
