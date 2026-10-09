// Opt-in comparison surface. Shared by delivery, static fallback and editor preview.
export const EDITORIAL_CSS = `
.toplist:has(> .toplist__item--editorial) { gap:16px; }
body:has(.toplist__item--editorial) .sticky-bonus .sticky-bonus__cta { background:var(--c-gold,#d4af37) !important; color:var(--c-navy,#1c3453) !important; border-radius:8px; box-shadow:none !important; }
.toplist__item--editorial {
  --editorial-ink:var(--c-navy,#1c3453);
  --editorial-muted:#596878;
  --editorial-line:#e5e9ed;
  background:#fff !important; color:var(--editorial-ink); border:1px solid var(--editorial-line) !important; border-radius:14px; overflow:hidden;
  box-shadow:0 3px 12px rgba(22,42,65,.045); transition:border-color .15s ease;
}
.toplist__item--editorial:hover { transform:none; border-color:#b9c4cf !important; box-shadow:0 3px 12px rgba(22,42,65,.045); }
.toplist__item--editorial::before, .toplist__item--editorial::after { content:none !important; }
.toplist__item--editorial .toplist__main { display:grid; grid-template-columns:28px 128px minmax(108px,128px) minmax(0,1fr) 160px; gap:16px; align-items:center; min-height:126px; padding:20px; }
.toplist__item--editorial.toplist__item--no-bonus .toplist__main { grid-template-columns:28px 128px minmax(0,1fr) 160px; }
.toplist__item--editorial .toplist__rank { grid-column:auto; grid-row:auto; align-self:center; display:flex; align-items:center; justify-content:center; width:28px; height:28px; padding:0; border:0; border-radius:50%; background:#f0f3f6; color:var(--editorial-muted); font-size:12px; font-weight:700; }
.toplist__item--editorial .toplist__rank--1 { background:#f6e9b6; color:#6e5310; }
.toplist__item--editorial .toplist__rank--2, .toplist__item--editorial .toplist__rank--3 { background:#faf4df; color:#80642a; }
.toplist__item--editorial .toplist__logo { min-height:0; height:80px; padding:0 !important; background:transparent !important; border:0 !important; border-radius:0; box-shadow:none; display:flex; align-items:center; justify-content:center; }
.toplist__item--editorial .toplist__logo-img { width:100% !important; height:76px !important; max-width:128px !important; max-height:76px !important; object-fit:contain !important; border-radius:0; }
.toplist__item--editorial .toplist__info { padding:0 !important; border:0; gap:6px; }
.toplist__item--editorial .toplist__header { display:flex; flex-direction:column; align-items:flex-start; gap:7px; }
.toplist__item--editorial .toplist__name { color:var(--editorial-ink) !important; font-size:18px; font-weight:750; line-height:1.3; letter-spacing:-.025em; }
.toplist__item--editorial .badge { font-size:10px; line-height:1.4; padding:3px 7px; border-radius:4px; box-shadow:none; }
.toplist__item--editorial .toplist__bonus { grid-column:auto; grid-row:auto; min-width:0; padding:0 0 0 20px; align-self:center; border:0; border-left:1px solid var(--editorial-line); display:flex; flex-direction:column; gap:7px; background:none; }
.toplist__item--editorial .toplist__bonus-label { color:var(--editorial-muted) !important; opacity:1; font-size:11px; font-weight:600; letter-spacing:.07em; line-height:1.4; }
.toplist__item--editorial .toplist__bonus-label .icon { display:none; }
.toplist__item--editorial .toplist__bonus-value { color:var(--editorial-ink) !important; font-size:20px; font-weight:700; line-height:1.4; letter-spacing:-.01em; overflow-wrap:anywhere; }
.toplist__item--editorial .toplist__cta { grid-column:auto; grid-row:auto; display:flex; flex-direction:column; align-items:stretch; gap:6px; padding:0; border:0; background:none; }
.toplist__item--editorial .toplist__cta .btn--play { display:flex; align-items:center; justify-content:center; gap:8px; min-height:48px; padding:12px 10px; margin:0; border:1px solid transparent; border-radius:8px; color:#fff !important; background:#15803d !important; box-shadow:none !important; font-size:16px; line-height:1.4; font-weight:700; text-decoration:none; transform:none; }
.toplist__item--editorial .toplist__cta .btn--play:hover { background:#166534 !important; transform:none; }
.toplist__item--editorial .toplist__cta .btn--review { display:flex; align-items:center; justify-content:center; min-height:44px; margin:0; padding:8px 10px; border:0; border-radius:8px; background:transparent; color:var(--editorial-muted) !important; font-size:14px; line-height:1.5; font-weight:500; opacity:1; box-shadow:none; }
.toplist__item--editorial .toplist__cta .btn--review:hover { background:#f3f5f7; color:var(--editorial-ink); }
.toplist__item--editorial .toplist__cta a:focus-visible { outline:2px solid var(--editorial-ink); outline-offset:3px; }
.toplist__item--editorial .toplist__extras { background:#f8f9fb; color:var(--editorial-muted); border-top:1px solid #edf0f3; padding:0 20px; }
.toplist__item--editorial .toplist__deposit { margin:0 !important; color:var(--editorial-muted); font-size:12px; }
.toplist__item--editorial .toplist__deposit span { opacity:1; }
.toplist__item--editorial .toplist__deposit strong { color:var(--editorial-ink); font-size:12px; }
.toplist__item--editorial .toplist__legal { color:var(--editorial-muted); opacity:1; font-size:12px; }
.toplist__item--editorial .toplist__details { border-color:var(--editorial-line); }
.toplist__item--editorial .toplist__details summary { color:var(--editorial-ink); font-size:12px; font-weight:500; }
.toplist__item--editorial .toplist__details dl { border-color:var(--editorial-line); }
.toplist__item--editorial .toplist__detail-row dt { opacity:1; color:var(--editorial-muted); }
.toplist__item--editorial .toplist__payment-list li { background:#fff; border-color:var(--editorial-line); color:var(--editorial-ink); }
@media(min-width:681px) and (max-width:1000px) {
  .toplist__item--editorial .toplist__main { grid-template-columns:24px 96px minmax(88px,104px) minmax(0,1fr) 128px; gap:12px; padding:16px; }
  .toplist__item--editorial.toplist__item--no-bonus .toplist__main { grid-template-columns:24px 96px minmax(0,1fr) 128px; }
  .toplist__item--editorial .toplist__bonus { padding-left:14px; }
  .toplist__item--editorial .toplist__bonus-value { font-size:18px; }
  .toplist__item--editorial .toplist__name { font-size:16px; }
  .toplist__item--editorial .toplist__extras { grid-template-columns:minmax(0,1fr) 164px; }
  .toplist__item--editorial .toplist__legal { grid-column:1 / -1; grid-row:2; min-height:0; padding:0 0 8px; }
  .toplist__item--editorial .toplist__extras:has(.toplist__details) .toplist__legal { padding-right:0; }
  .toplist__item--editorial .toplist__details { grid-row:3; }
}
@media(max-width:680px) {
  .toplist__item--editorial .toplist__main, .toplist__item--editorial.toplist__item--no-bonus .toplist__main { position:relative; grid-template-columns:minmax(0,1fr) !important; grid-template-rows:auto; gap:12px; padding:20px 16px 16px; min-height:0; }
  .toplist__item--editorial .toplist__rank { position:absolute; top:16px; left:16px; width:24px; height:24px; font-size:11px; }
  /* Wide wordmarks get room; the height cap keeps square marks proportional. */
  .toplist__item--editorial .toplist__logo { grid-column:1; grid-row:1; justify-self:center; width:min(80%,260px); height:104px; }
  .toplist__item--editorial .toplist__logo-img { height:104px !important; max-height:104px !important; max-width:100% !important; }
  .toplist__item--editorial .toplist__info { grid-column:1; grid-row:2; width:100%; min-width:0; align-items:center; text-align:center; }
  .toplist__item--editorial .toplist__header { align-items:center; width:100%; }
  .toplist__item--editorial .toplist__name { font-size:20px; line-height:1.3; text-align:center; overflow-wrap:anywhere; }
  .toplist__item--editorial .toplist__bonus { grid-column:1 / -1; grid-row:auto; padding:14px 0 0; border:0; border-top:1px solid var(--editorial-line); gap:7px; }
  .toplist__item--editorial .toplist__bonus-value { font-size:20px; line-height:1.4; }
  .toplist__item--editorial .toplist__cta { grid-column:1 / -1; grid-row:auto; flex-direction:row; gap:10px; }
  .toplist__item--editorial .toplist__cta > a { flex:1; width:auto; min-width:0; min-height:48px; }
  .toplist__item--editorial .toplist__cta .btn--review { order:-1; border:1px solid var(--editorial-line); font-size:14px; }
  .toplist__item--editorial .toplist__extras { display:flex; flex-wrap:wrap; align-items:center; column-gap:12px; padding:0 16px; }
  .toplist__item--editorial .toplist__deposit { width:100%; padding:10px 0 0; line-height:1.5; gap:4px 8px; }
  .toplist__item--editorial .toplist__legal { order:2; margin:0; padding:0 0 10px; font-size:12px; }
  .toplist__item--editorial .toplist__details { width:100%; border:0; }
  .toplist__item--editorial .toplist__details summary { min-height:44px; padding:10px 0; }
}
@media(max-width:360px) {
  /* The redundant homepage CTA must not push the language menu off narrow screens. */
  body:has(.toplist__item--editorial) .header .nav__cta { display:none; }
  .toplist__item--editorial .toplist__main, .toplist__item--editorial.toplist__item--no-bonus .toplist__main { padding:20px 14px 14px; }
  .toplist__item--editorial .toplist__rank { left:12px; width:22px; height:22px; }
  .toplist__item--editorial .toplist__name { font-size:18px; }
}
@media(prefers-reduced-motion:reduce) { .toplist__item--editorial, .toplist__item--editorial * { transition:none !important; } }
`;
