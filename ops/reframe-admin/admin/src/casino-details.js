// Shared by compact public cards and their preview. Keep user-entered facts intact.
export function renderCasinoDetails(casino, lang, L, escape) {
  const labels = {
    nl: { details: 'Casino-informatie', license: 'Licentie', currencies: "Valuta's" },
    de: { details: 'Casinodetails', license: 'Lizenz', currencies: 'Währungen' },
    en: { details: 'Casino details', license: 'License', currencies: 'Currencies' },
    it: { details: 'Informazioni sul casinò', license: 'Licenza', currencies: 'Valute' },
    es: { details: 'Información del casino', license: 'Licencia', currencies: 'Monedas' },
  }[lang] || { details: 'Casino details', license: 'License', currencies: 'Currencies' };
  const license = String(casino.license || '').trim();
  const deposit = String(casino.min_deposit || '').trim();
  const methods = String(casino.methods || '').split(',').map(value => value.trim()).filter(Boolean);
  const currencies = new Set(['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'NZD', 'CHF', 'NOK', 'SEK', 'DKK', 'PLN', 'BRL', 'JPY', 'BTC', 'ETH', 'XRP', 'USDT', 'USDC', 'DOGE', 'LTC', 'TRX', 'BCH', 'SOL']);
  const methodsLabel = methods.length && methods.every(value => currencies.has(value.toUpperCase())) ? labels.currencies : L.methods_label;
  const rows = [
    license ? `<div class="toplist__detail-row"><dt>${escape(labels.license)}</dt><dd>${escape(license)}</dd></div>` : '',
    methods.length ? `<div class="toplist__detail-row"><dt>${escape(methodsLabel)}</dt><dd><ul class="toplist__payment-list" role="list">${methods.map(value => `<li>${escape(value)}</li>`).join('')}</ul></dd></div>` : '',
  ].join('');
  return `<div class="toplist__extras">
    ${deposit ? `<p class="toplist__deposit"><span>${escape(L.deposit_label)}</span><strong>${escape(deposit)}</strong></p>` : ''}
    ${rows ? `<details class="toplist__details"><summary>${escape(labels.details)}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5"/></svg></summary><dl>${rows}</dl></details>` : ''}
    <small class="toplist__legal">${escape(L.disclaimer)}</small>
  </div>`;
}

export const DETAILS_CSS = `
.toplist__item--compact .toplist__header { gap:8px; }
.toplist__item--compact .toplist__bonus-value { overflow-wrap:anywhere; }
.toplist__extras { border-top:1px solid rgba(255,255,255,.1); padding:0 14px; background:rgba(0,0,0,.12); color:var(--c-text,#eef2ff); }
.toplist__deposit { display:flex; flex-wrap:wrap; align-items:baseline; gap:6px 12px; margin:0; padding:12px 0; font-size:12px; line-height:1.5; }
.toplist__deposit span { opacity:.7; }
.toplist__deposit strong { font-size:13px; font-weight:700; }
.toplist__details { margin:0; padding:0; }
.toplist__deposit + .toplist__details { border-top:1px solid rgba(255,255,255,.08); }
.toplist__details summary { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:44px; padding:10px 0; list-style:none; cursor:pointer; font-size:12px; font-weight:600; line-height:1.5; }
.toplist__details summary::-webkit-details-marker { display:none; }
.toplist__details summary:hover { color:var(--accent,#00c896); }
.toplist__details summary:focus-visible { outline:2px solid currentColor; outline-offset:3px; border-radius:3px; }
.toplist__details summary svg { width:18px; height:18px; flex-shrink:0; fill:none; stroke:currentColor; stroke-width:1.75; transition:transform .15s; }
.toplist__details[open] summary svg { transform:rotate(180deg); }
.toplist__details dl { margin:0; padding:8px 0 12px; display:grid; gap:14px; }
.toplist__detail-row { min-width:0; }
.toplist__detail-row dt { margin:0 0 5px; font-size:11px; line-height:1.5; font-weight:600; opacity:.65; }
.toplist__detail-row dd { margin:0; font-size:12px; line-height:1.6; overflow-wrap:anywhere; }
.toplist__payment-list { display:flex; flex-wrap:wrap; gap:6px; list-style:none; margin:0 !important; padding:0 !important; }
.toplist__payment-list li { margin:0 !important; padding:3px 8px !important; max-width:100%; border:1px solid rgba(255,255,255,.12); border-radius:5px; background:rgba(255,255,255,.04); font-size:11px; line-height:1.5; overflow-wrap:anywhere; }
.toplist__legal { display:block; margin:0; padding:8px 0 10px; font-size:10px; line-height:1.5; opacity:.55; }
.toplist__details + .toplist__legal { padding-top:0; }
@media(min-width:681px) {
  .toplist__item--no-bonus .toplist__main { grid-template-columns:44px minmax(150px,180px) minmax(130px,1fr) minmax(120px,170px); }
}
@media(max-width:680px) {
  .toplist__item--compact .toplist__cta > a { flex:1; width:auto; min-width:0; min-height:44px; padding:10px 8px; font-size:13px; line-height:1.35; text-align:center; }
  .toplist__item--no-bonus .toplist__cta { grid-row:2; }
  .toplist__item--no-bonus .toplist__rank { grid-row:1; }
}
`;
