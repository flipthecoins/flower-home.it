import { renderCasinoDetails, DETAILS_CSS } from './casino-details.js';
import { LANGS, NL_BADGE_LABELS } from './config.js';
import { LOGO_CSS } from './logo-styles.js';
export function html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>ReframeAdmin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #06090f;
      --glass: rgba(255,255,255,0.055);
      --glass2: rgba(255,255,255,0.09);
      --border: rgba(255,255,255,0.09);
      --border-hi: rgba(255,255,255,0.18);
      --text: #eef2ff;
      --text2: rgba(238,242,255,0.42);
      --accent: #f97316;
      --accent-dim: rgba(249,115,22,0.18);
      --danger: #f87171;
      --success: #4ade80;
      --r: 16px;
      --spring: cubic-bezier(0.34,1.56,0.64,1);
      --ease: cubic-bezier(0.16,1,0.3,1);
      --blur: blur(28px) saturate(1.8);
    }
    html, body { height: 100%; color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
      font-size: 15px; line-height: 1.5; overflow-x: hidden;
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
      background: var(--bg);
      background-image:
        radial-gradient(ellipse 80% 60% at 10% 5%,  rgba(99,75,255,0.1)  0%, transparent 55%),
        radial-gradient(ellipse 60% 50% at 90% 90%,  rgba(249,115,22,0.09) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 55% 50%,  rgba(20,160,255,0.05) 0%, transparent 60%);
    }

    /* ── Header ── */
    #header { position: sticky; top: 0; z-index: 50;
      padding-top: env(safe-area-inset-top);
      background: rgba(6,9,15,0.75);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 0 rgba(255,255,255,0.04); }
    .hdr-inner { display: flex; align-items: center; gap: 12px;
      height: 58px; padding: 0 20px;
      max-width: 920px; margin: 0 auto; }
    #hamburger { background: var(--glass); border: 1px solid var(--border); color: var(--text2);
      cursor: pointer; padding: 8px; border-radius: 11px; display: none; align-items: center;
      justify-content: center; flex-shrink: 0; transition: background .2s, color .2s; }
    #hamburger:hover { background: var(--glass2); color: var(--text); }
    #hamburger svg { width: 20px; height: 20px; }
    .logo { font-size: 18px; font-weight: 800; letter-spacing: -.7px; flex: 1;
      background: linear-gradient(135deg, #fff 20%, rgba(255,255,255,.55) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    #hdr-right { display: flex; align-items: center; gap: 8px; }
    .btn-logout { background: var(--glass); border: 1px solid var(--border); color: var(--text2);
      padding: 6px 14px; border-radius: 10px; cursor: pointer; font-size: 13px;
      transition: background .2s, color .2s; }
    .btn-logout:hover { background: var(--glass2); color: var(--text); }

    /* ── Sidebar ── */
    #sb-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 80;
      opacity: 0; pointer-events: none; transition: opacity .3s; }
    #sb-ov.open { opacity: 1; pointer-events: all; }
    #sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 248px;
      background: rgba(6,9,15,0.88);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border-right: 1px solid var(--border);
      box-shadow: 4px 0 48px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.04);
      z-index: 90; transform: translateX(-100%);
      transition: transform .32s cubic-bezier(0.16,1,0.3,1);
      display: flex; flex-direction: column; overflow: hidden; }
    #sidebar.open { transform: translateX(0); }
    .sb-top { display: flex; align-items: center; justify-content: space-between;
      padding: 18px 16px; padding-top: max(18px, env(safe-area-inset-top));
      border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .sb-logo { font-size: 16px; font-weight: 800; letter-spacing: -.5px;
      background: linear-gradient(135deg, #fff 20%, rgba(255,255,255,.5) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .sb-close { background: var(--glass); border: 1px solid var(--border); color: var(--text2);
      cursor: pointer; padding: 6px; border-radius: 9px; display: flex; align-items: center;
      transition: all .2s; }
    .sb-close:hover { background: var(--glass2); color: var(--text); }
    .sb-close svg { width: 16px; height: 16px; }
    .sb-nav { flex: 1; overflow-y: auto; padding: 10px 8px; }
    .sb-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border-radius: 11px; cursor: pointer; color: var(--text2); font-size: 13.5px;
      font-weight: 500; border: none; background: none; width: 100%; text-align: left;
      transition: all .2s; letter-spacing: -.1px; }
    .sb-link:hover { background: var(--glass); color: var(--text); }
    .sb-link svg { width: 15px; height: 15px; flex-shrink: 0; opacity: .6; }
    .sb-section { font-size: 10px; font-weight: 700; letter-spacing: .1em;
      text-transform: uppercase; color: var(--text2); padding: 16px 12px 5px; opacity: .5; }

    /* ── Main ── */
    #main { padding: 24px 20px; max-width: 920px; margin: 0 auto;
      padding-bottom: max(24px, env(safe-area-inset-bottom)); }

    /* ── Login ── */
    #login-wrap { display: flex; align-items: center; justify-content: center;
      min-height: calc(100dvh - 58px - env(safe-area-inset-top)); padding: 24px; }
    .login-card {
      background: var(--glass);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--border-hi);
      box-shadow: 0 32px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1);
      border-radius: 24px; padding: 36px 32px; width: 100%; max-width: 380px; }
    .login-card h2 { font-size: 22px; font-weight: 800; letter-spacing: -.6px; margin-bottom: 28px; }
    .fg { margin-bottom: 16px; }
    .fg label { display: block; font-size: 11px; font-weight: 700; color: var(--text2);
      margin-bottom: 6px; text-transform: uppercase; letter-spacing: .07em; }
    .fg input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 16px;
      transition: border-color .2s, background .2s; }
    .fg input:focus { outline: none; border-color: var(--accent);
      background: rgba(249,115,22,0.05); }
    #login-err { color: var(--danger); font-size: 13px; margin-top: 10px; text-align: center; }

    /* ── Buttons ── */
    .btn-primary { background: linear-gradient(135deg, var(--accent), #e8650a);
      color: #fff; border: none; border-radius: 12px;
      box-shadow: 0 4px 16px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
      padding: 12px 22px; font-size: 15px; font-weight: 700; letter-spacing: -.2px;
      cursor: pointer; width: 100%;
      transition: transform .2s cubic-bezier(0.16,1,0.3,1), box-shadow .2s cubic-bezier(0.16,1,0.3,1), opacity .2s; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(249,115,22,0.45); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: .45; cursor: not-allowed; transform: none; }
    .btn-secondary { background: var(--glass); border: 1px solid var(--border);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      color: var(--text); padding: 9px 18px; border-radius: 11px; cursor: pointer;
      font-size: 14px; font-weight: 500; transition: all .2s; }
    .btn-secondary:hover { background: var(--glass2); border-color: var(--border-hi); }
    .btn-add { background: var(--glass); border: 1px solid var(--border);
      color: var(--text); padding: 8px 14px; border-radius: 11px; cursor: pointer;
      font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 6px;
      transition: all .2s; }
    .btn-add:hover { background: var(--glass2); border-color: var(--border-hi); }
    .btn-deploy { background: linear-gradient(135deg, var(--success), #22c55e);
      color: #000; border: none; padding: 9px 18px; border-radius: 11px; cursor: pointer;
      font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px;
      box-shadow: 0 4px 14px rgba(74,222,128,0.3); transition: all .2s; }
    .btn-deploy:disabled { opacity: .4; cursor: not-allowed; box-shadow: none; }
    .btn-deploy:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(74,222,128,0.4); }
    /* ── Country grid ── */
    .page-title { font-size: 24px; font-weight: 800; letter-spacing: -.7px; margin-bottom: 4px; }
    .page-sub { font-size: 14px; color: var(--text2); margin-bottom: 24px; }
    .countries-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
    .country-card {
      background: var(--glass);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--border);
      box-shadow: 0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07);
      border-radius: 20px; padding: 22px 16px; text-align: center; cursor: pointer;
      transition: transform .3s cubic-bezier(0.34,1.56,0.64,1), border-color .3s, box-shadow .3s; }
    .country-card:hover { border-color: var(--border-hi); transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12); }
    .c-flag { font-size: 38px; margin-bottom: 10px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
    .c-name2 { font-weight: 700; font-size: 15px; letter-spacing: -.3px; }
    .c-count { font-size: 12px; color: var(--text2); margin-top: 3px; }

    /* ── Breadcrumb ── */
    .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px;
      color: var(--text2); margin-bottom: 18px; }
    .bc-link { color: var(--text2); cursor: pointer; transition: color .15s; }
    .bc-link:hover { color: var(--text); }
    .bc-cur { color: var(--text); font-weight: 600; }

    /* ── Country toolbar ── */
    .c-toolbar { display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 18px; gap: 10px; flex-wrap: wrap; }
    .c-toolbar-title { font-size: 21px; font-weight: 800; letter-spacing: -.5px; }
    .toolbar-right { display: flex; gap: 8px; }

    /* ── Casino list ── */
    #casino-list { display: flex; flex-direction: column; gap: 8px; }
    .casino-item {
      background: var(--glass);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--border);
      box-shadow: 0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06);
      border-radius: var(--r); padding: 12px 14px; display: flex; align-items: center;
      gap: 12px; transition: all .2s; }
    .casino-item:hover { border-color: var(--border-hi);
      box-shadow: 0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1); }
    .c-arrows { display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; }
    .arr-btn { background: none; border: 1px solid transparent; color: var(--text2);
      padding: 3px 5px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; line-height: 1;
      transition: all .15s; }
    .arr-btn:hover:not(:disabled) { background: var(--glass2); border-color: var(--border); color: var(--text); }
    .arr-btn:disabled { opacity: .22; cursor: default; }
    .arr-btn svg { width: 14px; height: 14px; }
    .c-rank { width: 28px; height: 28px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 12px; font-weight: 800;
      flex-shrink: 0; background: var(--glass2); color: var(--text2);
      border: 1px solid var(--border); }
    .c-rank.r1 { background: linear-gradient(135deg,#ffd700,#f59e0b); color: #000; border-color: #ffd700; box-shadow: 0 0 12px rgba(255,215,0,0.4); }
    .c-rank.r2 { background: linear-gradient(135deg,#e2e8f0,#94a3b8); color: #000; border-color: #94a3b8; }
    .c-rank.r3 { background: linear-gradient(135deg,#e97c3e,#cd7f32); color: #fff; border-color: #cd7f32; }
    .c-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .c-logo { width: 112px; height: 72px; padding: 6px; border-radius: 10px; object-fit: contain;
      background: rgba(255,255,255,0.08); flex-shrink: 0; border: 1px solid var(--border); }
    .c-info { flex: 1; min-width: 0; }
    .c-iname { font-weight: 600; font-size: 14px; letter-spacing: -.2px; }
    .c-bonus { font-size: 12px; color: var(--text2); white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
    .c-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .act-btn { background: none; border: 1px solid transparent; color: var(--text2);
      padding: 6px; border-radius: 8px; cursor: pointer; display: flex; align-items: center;
      transition: all .15s; }
    .act-btn:hover { background: var(--glass2); border-color: var(--border); color: var(--text); }
    .act-btn.del:hover { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.3); color: var(--danger); }
    .act-btn svg { width: 16px; height: 16px; }

    /* ── Colors section ── */
    .colors-wrap {
      background: var(--glass);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--border);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
      border-radius: var(--r); margin-bottom: 20px; overflow: hidden; }
    .colors-hdr { display: flex; align-items: center; justify-content: space-between;
      padding: 11px 16px; cursor: pointer; user-select: none; transition: background .15s; }
    .colors-hdr:hover { background: var(--glass2); }
    .colors-hdr-title { display: flex; align-items: center; gap: 8px;
      font-weight: 600; font-size: 14px; color: var(--text); }
    .colors-hdr-title svg { width: 15px; height: 15px; color: var(--text2); flex-shrink: 0; }
    .colors-hdr-right { display: flex; align-items: center; gap: 10px; }
    .color-dots { display: flex; align-items: center; gap: 5px; }
    .color-dot { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.15); flex-shrink: 0; }
    .btn-colors-toggle { background: var(--glass2); border: 1px solid var(--border-hi); color: var(--text);
      padding: 4px 11px; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 600;
      transition: background .15s; white-space: nowrap; }
    .btn-colors-toggle:hover { background: rgba(255,255,255,.12); }
    .colors-body { padding: 0 16px; display: none; border-top: 1px solid var(--border); }
    .colors-body.open { display: block; }
    .colors-footer { display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0 12px; }
    .cta-section { border-top: 1px solid var(--border); margin-top: 4px; padding: 14px 0 4px; }
    .cta-section-title { font-size: 10px; font-weight: 800; text-transform: uppercase;
      letter-spacing: .1em; color: var(--text2); opacity: .6; margin-bottom: 10px; }
    .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .cta-field { flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 5px; }
    .cta-label { font-size: 12px; font-weight: 600; color: var(--text2); }
    .cta-input { background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 9px; padding: 8px 12px; color: var(--text); font-size: 14px; width: 100%;
      transition: border-color .15s; }
    .cta-input:focus { outline: none; border-color: var(--accent); }
    .cta-input::placeholder { color: var(--text2); opacity: .5; }
    .color-row { display: flex; align-items: center; gap: 14px; padding: 11px 0;
      border-bottom: 1px solid var(--border); transition: background .12s; cursor: pointer; }
    .color-row:last-child { border-bottom: none; }
    .color-row:hover { background: transparent; }
    .color-row:hover .clabel-name { color: #fff; }
    input[type="color"].cswatch {
      width: 40px; height: 40px; border-radius: 10px;
      border: 1.5px solid var(--border-hi); cursor: pointer; flex-shrink: 0; padding: 3px;
      background: var(--glass2); -webkit-appearance: none; appearance: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: box-shadow .15s, transform .15s; }
    input[type="color"].cswatch:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15); transform: scale(1.06); }
    input[type="color"].cswatch::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"].cswatch::-webkit-color-swatch { border: none; border-radius: 7px; }
    .clabel { flex: 1; min-width: 0; }
    .clabel-name { font-size: 14px; font-weight: 500; color: var(--text); transition: color .12s; }
    .clabel-desc { font-size: 12px; color: var(--text2); margin-top: 2px; }
    .cval { font-family: 'SF Mono', ui-monospace, monospace; font-size: 12px; font-weight: 500;
      color: var(--text2); letter-spacing: .03em; background: rgba(255,255,255,0.05);
      border: 1px solid var(--border); border-radius: 6px; padding: 3px 8px; flex-shrink: 0; }
    .btn-reset { background: var(--glass); border: 1px solid var(--border); color: var(--text2);
      padding: 5px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500;
      transition: background .15s, color .15s, border-color .15s; flex-shrink: 0; }
    .btn-reset:hover { background: var(--glass2); color: var(--text); border-color: var(--border-hi); }

    /* ── Modals ── */
    .m-back { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: none;
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    .m-back.open { display: block; }
    .modal { position: fixed; left: 0; right: 0; bottom: 0; z-index: 110;
      background: rgba(10,13,22,0.92);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--border); border-bottom: none;
      box-shadow: 0 -24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
      border-radius: 24px 24px 0 0; max-height: 92dvh;
      display: flex; flex-direction: column; transform: translateY(100%);
      transition: transform .35s cubic-bezier(0.16,1,0.3,1), opacity .25s; padding-bottom: env(safe-area-inset-bottom); }
    .modal.open { transform: translateY(0); }
    @media (min-width: 640px) {
      .modal { left: 50%; right: auto; bottom: auto; top: 50%; width: 540px;
        max-height: 87vh; border-radius: 20px; padding-bottom: 0; border: 1px solid var(--border-hi);
        transform: translate(-50%, -50%) scale(.95) translateY(12px); opacity: 0; pointer-events: none;
        transition: opacity .25s cubic-bezier(0.16,1,0.3,1), transform .25s cubic-bezier(0.16,1,0.3,1); }
      .modal.open { transform: translate(-50%, -50%) scale(1) translateY(0); opacity: 1; pointer-events: auto; }
    }
    .m-hdr { display: flex; align-items: center; justify-content: space-between;
      padding: 18px 18px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .m-hdr h3 { font-size: 17px; font-weight: 700; letter-spacing: -.4px; }
    .m-close { background: var(--glass); border: 1px solid var(--border); color: var(--text2);
      cursor: pointer; padding: 5px; border-radius: 8px; display: flex; align-items: center;
      transition: all .2s; }
    .m-close:hover { background: var(--glass2); color: var(--text); }
    .m-close svg { width: 17px; height: 17px; }
    .m-body { flex: 1; overflow-y: auto; padding: 18px; }
    .m-foot { padding: 14px 18px; border-top: 1px solid var(--border);
      display: flex; gap: 8px; justify-content: flex-end; flex-shrink: 0; }
    .m-foot .btn-primary { width: auto; }

    /* ── Form fields ── */
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 10.5px; color: var(--text2); margin-bottom: 5px;
      font-weight: 700; text-transform: uppercase; letter-spacing: .07em; }
    .field input, .field textarea, .field select {
      width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 10px; padding: 9px 12px; color: var(--text); font-size: 14px;
      transition: border-color .2s, background .2s; }
    .field input:focus, .field textarea:focus, .field select:focus {
      outline: none; border-color: var(--accent); background: rgba(249,115,22,0.05); }
    .field select { cursor: pointer; appearance: auto; }
    select option { background: #131620; color: #e8ecf0; }

    /* ── Logo picker ── */
    .logo-picker { display: flex; align-items: center; gap: 12px; }
    .logo-preview { width: 52px; height: 52px; border-radius: 12px; object-fit: contain;
      background: var(--glass2); border: 1px solid var(--border); flex-shrink: 0; }
    .btn-pick { background: var(--glass); border: 1px solid var(--border); color: var(--text);
      padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 13px;
      transition: all .2s; }
    .btn-pick:hover { background: var(--glass2); border-color: var(--border-hi); }

    /* ── Media ── */
    .media-search-row { display: flex; gap: 8px; margin-bottom: 14px; }
    #media-search { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 10px; padding: 9px 12px; color: var(--text); font-size: 14px; }
    #media-search:focus { outline: none; border-color: var(--accent); }
    .upload-lbl { background: var(--glass); border: 1px solid var(--border); color: var(--text);
      padding: 9px 14px; border-radius: 10px; cursor: pointer; font-size: 14px; white-space: nowrap;
      transition: all .2s; }
    .upload-lbl:hover { background: var(--glass2); }
    #media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 8px; }
    .med-item { background: var(--glass); border: 2px solid transparent; border-radius: 10px;
      padding: 8px; text-align: center; transition: border-color .15s, background .15s; }
    .med-item:hover { border-color: var(--accent); background: var(--glass2); }
    .med-item img { width: 100%; aspect-ratio: 1; object-fit: contain; cursor: pointer; }
    .med-name { font-size: 10px; color: var(--text2); margin-top: 4px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .med-del { background: rgba(239,68,68,.13); border: none; color: var(--danger);
      font-size: 11px; padding: 2px 6px; border-radius: 5px; cursor: pointer; margin-top: 4px;
      transition: background .15s; }
    .med-del:hover { background: rgba(239,68,68,.28); }

    /* ── Tabs (pill capsule) ── */
    .tabs { display: flex; gap: 2px; margin-bottom: 0;
      background: var(--glass); border: 1px solid var(--border);
      border-radius: 14px; padding: 4px; width: fit-content; }
    .tab-btn { background: none; border: none; color: var(--text2);
      padding: 7px 18px; cursor: pointer; font-size: 13.5px; font-weight: 600; letter-spacing: -.2px;
      border-radius: 11px; transition: background .22s cubic-bezier(0.16,1,0.3,1), color .15s, box-shadow .2s; }
    .tab-btn:hover { color: var(--text); background: var(--glass2); }
    .tab-btn.active {
      background: rgba(255,255,255,0.11);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      color: var(--text);
      box-shadow: 0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15); }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* ── Preview toggle ── */
    .preview-toggle { display: flex; background: var(--glass); border: 1px solid var(--border);
      border-radius: 11px; padding: 3px; gap: 2px; }
    .ptgl-btn { background: none; border: none; color: var(--text2); padding: 5px 14px;
      border-radius: 9px; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap;
      transition: all .2s; letter-spacing: -.1px; }
    .ptgl-btn:hover { color: var(--text); }
    .ptgl-btn.active { background: rgba(255,255,255,0.12); color: var(--text);
      box-shadow: 0 1px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15); }

    /* ── Settings card ── */
    .tabs-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 18px; }
    .tabs-row .tabs { margin-bottom: 0; }

    /* ── Mobile responsive ── */
    @media (max-width: 599px) {
      #main { padding: 16px 14px; padding-bottom: max(16px, env(safe-area-inset-bottom)); }
      .tabs-row { flex-direction: column; align-items: stretch; gap: 8px; }
      .tabs { width: 100%; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
      .tabs::-webkit-scrollbar { display: none; }
      .tab-btn { flex: 1; text-align: center; padding: 7px 8px; font-size: 12.5px; letter-spacing: -.3px; }
      #btn-add-casino { width: 100%; justify-content: center; }
      .hdr-inner { padding: 0 14px; }
      .casino-item { display: grid; grid-template-columns: 24px 96px minmax(0, 1fr); gap: 8px; padding: 12px 10px; }
      .c-arrows { grid-row: 1 / 3; }
      .c-brand { position: relative; grid-row: 1 / 3; }
      .c-rank { position: absolute; top: -8px; left: -3px; width: 22px; height: 22px; font-size: 10px; }
      .c-logo { width: 96px; height: 68px; }
      .c-iname { overflow-wrap: anywhere; }
      .c-actions { grid-column: 3; }
      .toast { white-space: normal; width: calc(100% - 28px); border-radius: 14px; text-align: center; }

    }
    .settings-section {
      background: var(--glass);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--border);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
      border-radius: 16px; padding: 16px 20px; margin-bottom: 14px; }
    .settings-section-title { font-size: 10px; font-weight: 800; color: var(--text2);
      text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px; opacity: .7; }
    .settings-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .settings-label { font-size: 14px; color: var(--text); flex-shrink: 0; font-weight: 500; }
    .settings-select { background: rgba(255,255,255,0.06); border: 1px solid var(--border);
      color: var(--text); border-radius: 10px; padding: 7px 12px; font-size: 14px; cursor: pointer;
      transition: border-color .2s; }
    .settings-select:focus { outline: none; border-color: var(--accent); }

    /* ── Rules ── */
    .rule-item {
      background: var(--glass);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--border); border-radius: var(--r); padding: 12px 14px;
      display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;
      transition: border-color .2s, box-shadow .2s; }
    .rule-item:hover { border-color: var(--border-hi); box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
    .rule-info { flex: 1; min-width: 0; }
    .rule-name { font-weight: 600; font-size: 14px; }
    .rule-summary { font-size: 12px; color: var(--text2); margin-top: 3px; }
    .rule-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .field-row { display: flex; gap: 12px; }
    .field-row .field { flex: 1; }
    .check-group { display: flex; flex-wrap: wrap; gap: 8px; }
    .check-item { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 13px; }
    .check-item input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; }
    .rule-toplist { display: flex; flex-direction: column; gap: 5px; }
    .rule-casino-row { display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: 9px; padding: 7px 10px; font-size: 13px;
      transition: opacity .15s, background .15s; }
    .rule-casino-row.rc-inactive { opacity: .45; background: rgba(255,255,255,0.015); }
    .rule-casino-row .rc-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rc-rank { width: 20px; text-align: center; font-size: 11px; font-weight: 700; color: var(--text2); flex-shrink: 0; }
    .rc-toggle { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;
      cursor: pointer; background: none; line-height: 1; transition: all .15s; }
    .rc-toggle.rc-on { border-color: var(--success); color: var(--success); }
    .rc-toggle.rc-on:hover { background: rgba(74,222,128,.15); }
    .rc-toggle.rc-off { border-color: var(--text2); color: var(--text2); }
    .rc-toggle.rc-off:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
    .rc-arrows { display: flex; gap: 2px; flex-shrink: 0; }
    .rc-divider { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
      color: var(--text2); opacity: .5; padding: 8px 4px 4px; }

    /* ── Phone mockup ── */
    .phone-wrap {
      display: flex; justify-content: center; align-items: flex-start;
      padding: 40px 24px 48px; background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%); }
    .phone-mockup {
      position: relative; flex-shrink: 0;
      background: linear-gradient(160deg, #2e2e2e 0%, #1a1a1a 60%, #111 100%);
      border-radius: 52px; padding: 14px;
      box-shadow:
        0 0 0 1.5px #3a3a3a,
        0 0 0 3px #111,
        0 30px 90px rgba(0,0,0,.85),
        inset 0 1px 0 rgba(255,255,255,.08),
        inset 0 -1px 0 rgba(0,0,0,.5); }
    /* Volume buttons left */
    .phone-mockup::before {
      content: ''; position: absolute; left: -5px; top: 108px; width: 4px;
      background: linear-gradient(180deg, #333 0%, #282828 100%);
      border-radius: 3px 0 0 3px; box-shadow: 0 52px 0 #2e2e2e, 0 96px 0 #2e2e2e;
      height: 38px; }
    /* Power button right */
    .phone-mockup::after {
      content: ''; position: absolute; right: -5px; top: 148px; width: 4px; height: 68px;
      background: linear-gradient(180deg, #333 0%, #282828 100%);
      border-radius: 0 3px 3px 0; }
    .phone-screen {
      border-radius: 40px; overflow: hidden; position: relative;
      background: #f4f6f9; line-height: 0; }
    /* Dynamic Island */
    .phone-island {
      position: absolute; top: 13px; left: 50%; transform: translateX(-50%);
      width: 126px; height: 37px; background: #000; border-radius: 20px; z-index: 5;
      box-shadow: 0 0 0 1px rgba(255,255,255,.04); }
    /* Status bar time (decorative) */
    .phone-status {
      position: absolute; top: 0; left: 0; right: 0; height: 59px;
      z-index: 4; pointer-events: none;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px; }
    .phone-status-time {
      font-size: 16px; font-weight: 700; color: #000; letter-spacing: -.02em; line-height: 1; }
    .phone-status-icons {
      display: flex; align-items: center; gap: 6px; }
    .phone-status-icons svg { width: 18px; height: 18px; }
    /* Home indicator */
    .phone-home {
      height: 34px; display: flex; align-items: center; justify-content: center; }
    .phone-home-bar {
      width: 134px; height: 5px; background: rgba(255,255,255,.35);
      border-radius: 3px; }

    /* ── Stats tab ── */
    .stats-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 10px; flex-wrap: wrap; }
    .stat-pills { display: flex; gap: 4px; }
    .stat-pill { background: var(--glass); border: 1px solid var(--border); color: var(--text2);
      padding: 5px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
      transition: all .15s; }
    .stat-pill:hover { background: var(--glass2); color: var(--text); }
    .stat-pill.active { background: var(--accent); border-color: var(--accent); color: #fff; }
    .stats-grand { font-size: 12px; color: var(--text2); }
    .stats-grand strong { color: var(--text); }
    .stats-cols { display: grid; grid-template-columns: 28px 1fr 64px 64px 64px 100px;
      gap: 0 8px; padding: 0 14px 8px; border-bottom: 1px solid var(--border); margin-bottom: 2px; }
    .stat-col-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--text2); opacity: .55; }
    .stat-col-lbl.r { text-align: right; }
    .stats-rows { display: flex; flex-direction: column; }
    .stat-row { display: grid; grid-template-columns: 28px 1fr 64px 64px 64px 100px;
      gap: 0 8px; padding: 10px 14px; border-bottom: 1px solid var(--border); align-items: center;
      transition: background .15s; border-radius: 8px; }
    .stat-row:hover { background: var(--glass); }
    .stat-rk { font-size: 12px; font-weight: 700; color: var(--text2); opacity: .45; }
    .stat-nm { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .stat-n { font-size: 13px; text-align: right; font-variant-numeric: tabular-nums; color: var(--text2); }
    .stat-n.play { color: #4ade80; }
    .stat-n.rev { color: #60a5fa; }
    .stat-n.tot { font-weight: 700; color: var(--text); }
    .stat-bar-wrap { background: rgba(255,255,255,.06); border-radius: 4px; height: 6px; overflow: hidden; }
    .stat-bar { height: 100%; background: linear-gradient(90deg,#f97316,var(--accent)); border-radius: 4px; transition: width .5s cubic-bezier(0.16,1,0.3,1); }
    .stats-empty { padding: 48px 20px; text-align: center; color: var(--text2); font-size: 14px; line-height: 1.9; }
    .stats-note { font-size: 11px; color: var(--text2); opacity: .5; margin-top: 4px; }
    @media (max-width: 599px) {
      .stats-cols, .stat-row { grid-template-columns: 24px 1fr 48px 48px 48px; }
      .stat-bar-wrap { display: none; }
    }

    /* ── Misc ── */
    .empty { text-align: center; padding: 48px; color: var(--text2); }
    .loading { text-align: center; padding: 48px; color: var(--text2); }
    .toast { position: fixed; bottom: max(28px, env(safe-area-inset-bottom)); left: 50%;
      transform: translateX(-50%) translateY(0);
      background: rgba(10,13,22,0.92);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--border);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
      padding: 11px 22px; border-radius: 100px; font-size: 14px; font-weight: 500;
      z-index: 200; white-space: nowrap; letter-spacing: -.1px; }
    .toast.ok { border-color: rgba(74,222,128,0.4); color: var(--success); }
    .toast.err { border-color: rgba(248,113,113,0.4); color: var(--danger); }
  </style>
</head>
<body>

<!-- Sidebar overlay -->
<div id="sb-ov" onclick="closeSidebar()" style="display:none"></div>

<!-- Sidebar -->
<nav id="sidebar" style="display:none">
  <div class="sb-top">
    <span class="sb-logo">Reframe<span style="color:#f97316">Admin</span></span>
    <button class="sb-close" onclick="closeSidebar()"><i data-lucide="x"></i></button>
  </div>
  <div class="sb-nav">
    <button class="sb-link" onclick="goHome()"><i data-lucide="home"></i> Home</button>
    <div class="sb-section">Countries</div>
    <div id="sb-countries"><div style="padding:8px 12px;color:var(--text2);font-size:13px">—</div></div>
  </div>
</nav>

<!-- App -->
<div id="app">
  <header id="header">
    <div class="hdr-inner">
      <button id="hamburger" onclick="openSidebar()" title="Menu">
        <i data-lucide="menu"></i>
      </button>
      <div class="logo">Reframe<span style="color:#f97316">Admin</span></div>
      <div id="hdr-right"></div>
    </div>
  </header>
  <main id="main">
    <div id="login-wrap">
      <div class="login-card">
        <h2>Sign in</h2>
        <div class="fg">
          <label>Password</label>
          <input type="password" id="pw" placeholder="Admin password"
            onkeydown="if(event.key==='Enter')doLogin()">
        </div>
        <button type="button" class="btn-primary" onclick="doLogin()">Sign in</button>
        <div id="login-err"></div>
      </div>
    </div>
  </main>
</div>

<!-- Casino edit modal -->
<div class="m-back" id="mb1" onclick="closeModal()"></div>
<div class="modal" id="casino-modal">
  <div class="m-hdr">
    <h3 id="modal-title">Edit Casino</h3>
    <button class="m-close" onclick="closeModal()"><i data-lucide="x"></i></button>
  </div>
  <div class="m-body" id="modal-body"></div>
  <div class="m-foot">
    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    <button class="btn-primary" onclick="saveModal()">Save</button>
  </div>
</div>

<!-- Rule edit modal -->
<div class="m-back" id="mb3" onclick="closeRuleModal()"></div>
<div class="modal" id="rule-modal">
  <div class="m-hdr">
    <h3 id="rule-modal-title">Add Rule</h3>
    <button class="m-close" onclick="closeRuleModal()"><i data-lucide="x"></i></button>
  </div>
  <div class="m-body" id="rule-modal-body"></div>
  <div class="m-foot">
    <button class="btn-secondary" onclick="closeRuleModal()">Cancel</button>
    <button class="btn-primary" onclick="saveRule()">Save</button>
  </div>
</div>

<!-- Media library modal -->
<div class="m-back" id="mb2" onclick="closeMedia()"></div>
<div class="modal" id="media-modal">
  <div class="m-hdr">
    <h3>Media Library</h3>
    <button class="m-close" onclick="closeMedia()"><i data-lucide="x"></i></button>
  </div>
  <div class="m-body">
    <div class="media-search-row">
      <input type="text" id="media-search" placeholder="Search files&#x2026;" oninput="filterMedia()">
      <label class="upload-lbl">Upload
        <input type="file" multiple accept="image/*" style="display:none" onchange="uploadMedia(this)">
      </label>
    </div>
    <div id="media-grid"></div>
  </div>
</div>

<!-- Add Country modal -->
<div class="m-back" id="mb4" onclick="closeAddCountry()"></div>
<div class="modal" id="add-country-modal">
  <div class="m-hdr">
    <h3>New Country</h3>
    <button class="m-close" onclick="closeAddCountry()"><i data-lucide="x"></i></button>
  </div>
  <div class="m-body">
    <div class="field"><label>ID (slug, lowercase, no spaces)</label><input id="nc-id" type="text" placeholder="germany"></div>
    <div class="field"><label>Name</label><input id="nc-name" type="text" placeholder="Germany"></div>
    <div class="field-row">
      <div class="field"><label>Flag emoji</label><input id="nc-flag" type="text" placeholder="🇩🇪" style="font-size:20px"></div>
      <div class="field"><label>Language</label>
        <select id="nc-lang" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:14px">
          <option value="it">Italiano</option>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
    <div class="field"><label>Link base URL (affiliate links)</label><input id="nc-link" type="text" placeholder="https://link.mycasino.de"></div>
    <div class="field"><label>GitHub repo (optional — needed to deploy)</label><input id="nc-repo" type="text" placeholder="mycasino.de"></div>
    <div class="field"><label>File path in repo (optional)</label><input id="nc-path" type="text" placeholder="proyectos/mycasino.de/bot/index.html"></div>
  </div>
  <div class="m-foot">
    <button class="btn-secondary" onclick="closeAddCountry()">Cancel</button>
    <button class="btn-primary" onclick="saveNewCountry()">Create</button>
  </div>
</div>

<script>
var token = localStorage.getItem('bot_token') || '';
var countries = [];
var currentCountry = null;
var casinos = [];
var currentColors = {};
var currentRules = [];
var editingRule = null;
var ruleCasinoState = [];
var activeTab = 'casinos';
var dirty = false;
var editingIdx = -1;
var statsCache = null;
var mediaCb = null;
var allMedia = [];
var colorsOpen = false;

var DEFAULT_COLORS = { cta: '#16a34a', gold: '#d4af37', navy: '#1d3557', accent: '#e63946', text: '#ffffff' };
var COLOR_DEFS = [
  { key: 'cta',    label: 'CTA Button', desc: 'Play now button color' },
  { key: 'gold',   label: 'Highlight',  desc: 'Rank #1 and top-3 border' },
  { key: 'navy',   label: 'Card BG',    desc: 'Casino card background' },
  { key: 'accent', label: 'Accent',     desc: 'Badges & secondary elements' },
  { key: 'text',   label: 'Text',       desc: 'Casino name & main text color' },
];
var LANGS = ${JSON.stringify(LANGS)};
var NL_BADGE_LABELS = ${JSON.stringify(NL_BADGE_LABELS)};
var currentSettings = {};
var previewMode = 'desktop';

/* ── API helper ─────────────────────────────────── */
async function api(method, path, body) {
  var opts = { method: method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  var r = await fetch(path, opts);
  var data = await r.json().catch(function() { return {}; });
  if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
  return data;
}

/* ── Auth ─────────────────────────────────────── */
async function doLogin() {
  try {
    var pw = document.getElementById('pw').value.trim();
    if (!pw) return;
    document.getElementById('login-err').textContent = '';
    var btn = document.querySelector('#login-wrap .btn-primary');
    btn.disabled = true; btn.textContent = 'Signing in…';
    var r = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    });
    var json = await r.json();
    if (!r.ok) {
      document.getElementById('login-err').textContent = '❌ ' + (json.error || 'Wrong password');
      btn.disabled = false; btn.textContent = 'Sign in';
      return;
    }
    token = json.token;
    localStorage.setItem('bot_token', token);
    await initApp();
  } catch(e) {
    document.getElementById('login-err').textContent = '❌ ' + e.message;
    var b = document.querySelector('#login-wrap .btn-primary');
    if (b) { b.disabled = false; b.textContent = 'Sign in'; }
  }
}

function doLogout() {
  token = ''; localStorage.removeItem('bot_token');
  document.body.classList.remove('authed');
  document.getElementById('hamburger').style.display = 'none';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('sb-ov').style.display = 'none';
  document.getElementById('hdr-right').innerHTML = '';
  document.getElementById('sb-countries').innerHTML = '<div style="padding:8px 12px;color:var(--text2);font-size:13px">—</div>';
  document.getElementById('main').innerHTML = '<div id="login-wrap"><div class="login-card"><h2>Sign in</h2><div class="fg"><label>Password</label><input type="password" id="pw" placeholder="Admin password"></div><button type="button" class="btn-primary" onclick="doLogin()">Sign in</button><div id="login-err"></div></div></div>';
  var pw2 = document.getElementById('pw');
  if (pw2) pw2.addEventListener('keydown', function(e) { if (e.key === 'Enter') doLogin(); });
}

async function initApp() {
  document.body.classList.add('authed');
  var sb = document.getElementById('sidebar');
  var sbov = document.getElementById('sb-ov');
  sb.style.display = '';
  sbov.style.display = '';
  // On mobile, hamburger is visible; desktop hides it via media query
  document.getElementById('hamburger').style.display = 'flex';
  document.getElementById('hdr-right').innerHTML = '<button type="button" class="btn-logout" onclick="doLogout()">Log out</button>';
  countries = await api('GET', '/api/countries');
  populateSidebar();
  renderCountries();
}

/* ── Sidebar ─────────────────────────────────── */
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sb-ov').classList.add('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sb-ov').classList.remove('open');
}
function populateSidebar() {
  var el = document.getElementById('sb-countries');
  if (!countries.length) { el.innerHTML = '<div style="padding:8px 12px;color:var(--text2);font-size:13px">No countries</div>'; return; }
  el.innerHTML = countries.map(function(c) {
    return '<button class="sb-link" data-id="' + c.id + '" onclick="sbGoCountry(this)">' + c.flag + ' ' + c.name + '</button>';
  }).join('');
}
function sbGoCountry(el) {
  var id = el.getAttribute('data-id');
  if (dirty && !confirm('Unsaved changes — continue without deploying?')) return;
  loadCasinos(id); closeSidebar();
}
function goHome() {
  if (dirty && !confirm('Unsaved changes — continue without deploying?')) return;
  renderCountries(); closeSidebar();
}

/* ── Countries view ─────────────────────────── */
function renderCountries() {
  currentCountry = null; casinos = []; dirty = false; colorsOpen = false; currentSettings = {};
  document.getElementById('main').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
      '<h1 class="page-title">Countries</h1>' +
      '<button class="btn-add" onclick="openAddCountry()"><i data-lucide="plus"></i> New Country</button>' +
    '</div>' +
    '<p class="page-sub">Select a country to manage its toplist</p>' +
    '<div class="countries-grid">' +
    countries.map(function(c) {
      return '<div class="country-card" data-id="' + c.id + '" onclick="loadCasinos(this.dataset.id)">' +
        '<div class="c-flag">' + c.flag + '</div>' +
        '<div class="c-name2">' + c.name + '</div>' +
        '<div class="c-count">' + c.casinoCount + ' casinos</div>' +
      '</div>';
    }).join('') + '</div>';
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
}

/* ── Casino view ───────────────────────────── */
async function loadCasinos(countryId) {
  document.getElementById('main').innerHTML = '<div class="loading">Loading…</div>';
  try {
    var data = await api('GET', '/api/casinos/' + countryId);
    currentCountry = data.country;
    casinos = data.casinos;
    currentColors = Object.assign({}, DEFAULT_COLORS, data.colors || {});
    currentSettings = data.settings || {};
    dirty = false; colorsOpen = false; activeTab = 'casinos'; statsCache = null;
    try {
      var rData = await api('GET', '/api/rules/' + countryId);
      currentRules = rData.rules || [];
    } catch(e3) { currentRules = []; }
    renderCasinoView();
  } catch(e) {
    document.getElementById('main').innerHTML = '<div class="empty">Error: ' + e.message + '</div>';
  }
}

function renderCasinoView() {
  var c = currentCountry;
  document.getElementById('main').innerHTML =
    '<div class="breadcrumb">' +
      '<span class="bc-link" onclick="goHome()">Countries</span>' +
      ' <span style="opacity:.4">›</span> ' +
      '<span class="bc-cur">' + c.flag + ' ' + c.name + '</span>' +
    '</div>' +
    '<div class="c-toolbar">' +
      '<span class="c-toolbar-title">' + c.flag + ' ' + c.name + '</span>' +
      '<div class="toolbar-right">' +
        '<button class="btn-deploy" id="deploy-btn" disabled onclick="deployChanges()"><i data-lucide="rocket"></i> Save &amp; Publish</button>' +
      '</div>' +
    '</div>' +
    '<div class="tabs-row">' +
      '<div class="tabs">' +
        '<button class="tab-btn' + (activeTab==='casinos'?' active':'') + '" data-tab="casinos" onclick="switchTab(this.dataset.tab)">Casinos</button>' +
        '<button class="tab-btn' + (activeTab==='colprv'?' active':'') + '" data-tab="colprv" onclick="switchTab(this.dataset.tab)">Colors &amp; Preview</button>' +
        '<button class="tab-btn' + (activeTab==='rules'?' active':'') + '" data-tab="rules" onclick="switchTab(this.dataset.tab)">Rules</button>' +
        '<button class="tab-btn' + (activeTab==='settings'?' active':'') + '" data-tab="settings" onclick="switchTab(this.dataset.tab)">Settings</button>' +
        '<button class="tab-btn' + (activeTab==='stats'?' active':'') + '" data-tab="stats" onclick="switchTab(this.dataset.tab)">📊 Stats</button>' +
      '</div>' +
      '<button class="btn-add" id="btn-add-casino" style="' + (activeTab==='casinos'?'':'display:none') + '" onclick="openModal(-1)"><i data-lucide="plus"></i> Add Casino</button>' +
    '</div>' +
    '<div id="tab-casinos" class="tab-panel' + (activeTab==='casinos'?' active':'') + '">' +
      '<div id="casino-list"></div>' +
    '</div>' +
    '<div id="tab-colprv" class="tab-panel' + (activeTab==='colprv'?' active':'') + '">' +
      '<div id="colors-body" style="margin-bottom:16px"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<span style="font-size:12px;color:var(--text2);font-weight:500">Live preview</span>' +
        '<div class="preview-toggle">' +
          '<button class="ptgl-btn active" data-mode="desktop" onclick="setPreviewMode(\\'desktop\\')">🖥 Desktop</button>' +
          '<button class="ptgl-btn" data-mode="mobile" onclick="setPreviewMode(\\'mobile\\')">📱 Mobile</button>' +
        '</div>' +
      '</div>' +
      '<div id="preview-wrap" style="border-radius:14px;overflow:hidden;border:1px solid var(--border);box-shadow:0 8px 40px rgba(0,0,0,0.5);background:#f4f6f9;display:flex;justify-content:center;align-items:flex-start">' +
        '<iframe id="preview-frame" style="width:100%;height:700px;border:none;background:#f4f6f9;display:block;flex-shrink:0" frameborder="0"></iframe>' +
      '</div>' +
    '</div>' +
    '<div id="tab-rules" class="tab-panel' + (activeTab==='rules'?' active':'') + '">' +
      '<div style="display:flex;justify-content:flex-end;margin-bottom:10px">' +
        '<button class="btn-add" onclick="openRuleModal(null)"><i data-lucide="plus"></i> Add Rule</button>' +
      '</div>' +
      '<div id="rules-list"></div>' +
    '</div>' +
    '<div id="tab-settings" class="tab-panel' + (activeTab==='settings'?' active':'') + '">' +
      renderSettingsTab() +
    '</div>' +
    '<div id="tab-stats" class="tab-panel' + (activeTab==='stats'?' active':'') + '">' +
      '<div class="loading">Loading stats…</div>' +
    '</div>' +
    '';

  renderCasinoList();
  renderColorsInputs();
  renderRulesList();
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
  if (activeTab === 'colprv') renderPreviewTab();
  if (activeTab === 'stats') renderStatsTab();
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  var btn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
  if (btn) btn.classList.add('active');
  var panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
  var addBtn = document.getElementById('btn-add-casino');
  if (addBtn) addBtn.style.display = tab === 'casinos' ? '' : 'none';
  if (tab === 'colprv') { previewMode = 'desktop'; renderPreviewTab(); }
  if (tab === 'stats') renderStatsTab();
}


function mediaUrl(logo) {
  if (!logo) return '';
  if (/^https?:/i.test(logo)) return logo;
  return '/api/media/' + encodeURIComponent(logo) + '?v=' + Date.now();
}

function previewLink(casino, linkBase) {
  var value = casino.link || (!currentSettings.redirects_path && casino.destination) || linkBase + '/' + (casino.slug || '');
  try { var url = new URL(value); return esc(/^https?:$/.test(url.protocol) ? url.href : '#'); } catch(e) { return '#'; }
}

function renderCasinoList() {
  var el = document.getElementById('casino-list');
  if (!el) return;
  if (!casinos.length) { el.innerHTML = '<div class="empty">No casinos. Click "Add" to start.</div>'; return; }
  var n = casinos.length;
  el.innerHTML = casinos.map(function(c, i) {
    var rk = i === 0 ? 'c-rank r1' : i === 1 ? 'c-rank r2' : i === 2 ? 'c-rank r3' : 'c-rank';
    var src = esc(mediaUrl(c.logo));
    var upDis  = i === 0 ? ' disabled' : '';
    var dnDis  = i === n-1 ? ' disabled' : '';
    return '<div class="casino-item">' +
      '<div class="c-arrows">' +
        '<button class="arr-btn"' + upDis + ' onclick="moveCasino(' + i + ',-1)" title="Move up"><i data-lucide="chevron-up"></i></button>' +
        '<button class="arr-btn"' + dnDis + ' onclick="moveCasino(' + i + ',1)" title="Move down"><i data-lucide="chevron-down"></i></button>' +
      '</div>' +
      '<div class="c-brand"><div class="' + rk + '">' + (i+1) + '</div>' +
      '<img class="c-logo" src="' + src + '" alt="" onerror="this.style.opacity=.2"></div>' +
      '<div class="c-info">' +
        '<div class="c-iname">' + esc(c.name) + '</div>' +
        '<div class="c-bonus">' + esc(c.bonus) + '</div>' +
      '</div>' +
      '<div class="c-actions">' +
        '<button class="act-btn" onclick="openModal(' + i + ')" title="Edit"><i data-lucide="pencil"></i></button>' +
        '<button class="act-btn del" onclick="deleteCasino(' + i + ')" title="Delete"><i data-lucide="trash-2"></i></button>' +
      '</div>' +
    '</div>';
  }).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
}

function moveCasino(i, dir) {
  var j = i + dir;
  if (j < 0 || j >= casinos.length) return;
  var tmp = casinos[j]; casinos[j] = casinos[i]; casinos[i] = tmp;
  renderCasinoList();
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
  markDirty();
  if (activeTab === 'colprv') renderPreviewTab();
}

/* ── Rules ──────────────────────────────────── */
function renderRulesList() {
  var el = document.getElementById('rules-list');
  if (!el) return;
  if (!currentRules.length) {
    el.innerHTML = '<div class="empty">No rules yet. Click "Add Rule" to create one.</div>';
    return;
  }
  el.innerHTML = currentRules.map(function(r, i) {
    var parts = [];
    if (r.conditions.device && r.conditions.device.length) parts.push('📱 ' + r.conditions.device.join(', '));
    if (r.conditions.geo && r.conditions.geo.length) parts.push('🌍 ' + r.conditions.geo.join(', '));
    if (r.conditions.city && r.conditions.city.length) parts.push('🏙 ' + r.conditions.city.join(', '));
    if (r.conditions.dayOfWeek && r.conditions.dayOfWeek.length) parts.push('📅 ' + r.conditions.dayOfWeek.join(', '));
    if (r.conditions.timeFrom || r.conditions.timeTo) parts.push('⏰ ' + (r.conditions.timeFrom||'') + '–' + (r.conditions.timeTo||''));
    if (r.conditions.ip && r.conditions.ip.length) parts.push('🔒 ' + r.conditions.ip.length + ' IP(s)');
    if (r.conditions.vpn === true) parts.push('VPN only');
    else if (r.conditions.vpn === false) parts.push('No VPN');
    var summary = parts.join(' · ') || 'No conditions (always applies)';
    var topSummary = r.toplist && r.toplist.length ? r.toplist.length + ' casinos' : 'Default toplist';
    return '<div class="rule-item">' +
      '<div class="rule-info">' +
        '<div class="rule-name">' + esc(r.name || 'Unnamed rule') + '</div>' +
        '<div class="rule-summary">' + esc(summary) + ' · ' + esc(topSummary) + '</div>' +
      '</div>' +
      '<div class="rule-actions">' +
        '<button class="act-btn" onclick="openRuleModal(' + i + ')" title="Edit"><i data-lucide="pencil"></i></button>' +
        '<button class="act-btn del" onclick="deleteRule(' + i + ')" title="Delete"><i data-lucide="trash-2"></i></button>' +
      '</div>' +
    '</div>';
  }).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
}

function deleteRule(i) {
  if (!confirm('Delete this rule?')) return;
  currentRules.splice(i, 1);
  saveRules();
  renderRulesList();
}

async function saveRules() {
  if (!currentCountry) return;
  try {
    await api('POST', '/api/rules/' + currentCountry.id, { rules: currentRules });
    showToast('Rules saved ✓', 'ok');
  } catch(e) {
    showToast('Error saving rules: ' + e.message, 'err');
  }
}

function openRuleModal(idx) {
  var rule = idx !== null && idx >= 0 ? currentRules[idx] : null;
  editingRule = idx;
  // Init casino state: active (ordered) + inactive
  var ruleToplistSlugs = rule && rule.toplist && rule.toplist.length ? rule.toplist : null;
  if (ruleToplistSlugs) {
    var activeSlugsMap = {};
    ruleToplistSlugs.forEach(function(s) { activeSlugsMap[s] = true; });
    var activeState = ruleToplistSlugs.map(function(slug) {
      var c = casinos.find(function(x) { return x.slug === slug; }) || { slug: slug, name: slug };
      return { slug: c.slug, name: c.name || c.slug, active: true };
    });
    var inactiveState = casinos.filter(function(c) { return !activeSlugsMap[c.slug]; })
      .map(function(c) { return { slug: c.slug, name: c.name, active: false }; });
    ruleCasinoState = activeState.concat(inactiveState);
  } else {
    ruleCasinoState = casinos.map(function(c) { return { slug: c.slug, name: c.name, active: true }; });
  }
  document.getElementById('rule-modal-title').textContent = rule ? 'Edit Rule' : 'Add Rule';
  document.getElementById('rule-modal-body').innerHTML = buildRuleForm(rule);
  buildRuleCasinoList();
  document.getElementById('mb3').classList.add('open');
  document.getElementById('rule-modal').classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
}

function closeRuleModal() {
  document.getElementById('mb3').classList.remove('open');
  document.getElementById('rule-modal').classList.remove('open');
  editingRule = null;
}

function buildRuleForm(rule) {
  var r = rule || {};
  var cond = r.conditions || {};
  var devices = cond.device || [];
  var geo = (cond.geo || []).join(', ');
  var city = (cond.city || []).join(', ');
  var days = cond.dayOfWeek || [];
  var timeFrom = cond.timeFrom || '';
  var timeTo = cond.timeTo || '';
  var ips = (cond.ip || []).join('\\n');
  var vpn = cond.vpn;
  var vpnVal = vpn === true ? 'vpn' : vpn === false ? 'novpn' : 'all';
  var dayNames = [['mon','Mon'],['tue','Tue'],['wed','Wed'],['thu','Thu'],['fri','Fri'],['sat','Sat'],['sun','Sun']];

  return '<div class="field"><label>Rule name</label>' +
    '<input id="rf-name" type="text" value="' + esc(r.name||'') + '" placeholder="E.g.: Mobile Italy daytime"></div>' +

    '<div class="field"><label>Device</label>' +
    '<div class="check-group">' +
      '<label class="check-item"><input type="checkbox" id="rf-dev-mob"' + (devices.indexOf('mobile')>=0?' checked':'') + '> Mobile</label>' +
      '<label class="check-item"><input type="checkbox" id="rf-dev-dsk"' + (devices.indexOf('desktop')>=0?' checked':'') + '> Desktop</label>' +
    '</div></div>' +

    '<div class="field-row">' +
      '<div class="field"><label>GEO (ISO codes, comma-separated)</label>' +
        '<input id="rf-geo" type="text" value="' + esc(geo) + '" placeholder="IT, ES, DE"></div>' +
      '<div class="field"><label>City</label>' +
        '<input id="rf-city" type="text" value="' + esc(city) + '" placeholder="Rome, Milan"></div>' +
    '</div>' +

    '<div class="field"><label>Days of the week</label>' +
    '<div class="check-group">' +
    dayNames.map(function(d) {
      return '<label class="check-item"><input type="checkbox" class="rf-day" value="' + d[0] + '"' + (days.indexOf(d[0])>=0?' checked':'') + '> ' + d[1] + '</label>';
    }).join('') +
    '</div></div>' +

    '<div class="field-row">' +
      '<div class="field"><label>Time from</label>' +
        '<input id="rf-tfrom" type="time" value="' + esc(timeFrom) + '" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:14px;width:100%"></div>' +
      '<div class="field"><label>Time to</label>' +
        '<input id="rf-tto" type="time" value="' + esc(timeTo) + '" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:14px;width:100%"></div>' +
    '</div>' +

    '<div class="field"><label>IPs / CIDR ranges (one per line)</label>' +
    '<textarea id="rf-ip" rows="3" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:14px;resize:vertical">' + esc(ips) + '</textarea></div>' +

    '<div class="field"><label>VPN</label>' +
    '<select id="rf-vpn" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:14px">' +
      '<option value="all"' + (vpnVal==='all'?' selected':'') + '>All (VPN and non-VPN)</option>' +
      '<option value="vpn"' + (vpnVal==='vpn'?' selected':'') + '>VPN only</option>' +
      '<option value="novpn"' + (vpnVal==='novpn'?' selected':'') + '>No VPN</option>' +
    '</select></div>' +

    '<div class="field"><label>Toplist for this rule</label>' +
    '<div class="rule-toplist" id="rf-toplist"></div></div>';
}

function buildRuleCasinoList() {
  var container = document.getElementById('rf-toplist');
  if (!container) return;
  var active = ruleCasinoState.filter(function(s) { return s.active; });
  var inactive = ruleCasinoState.filter(function(s) { return !s.active; });
  var svgUp = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  var svgDn = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  var n = active.length;
  var html = active.map(function(s, i) {
    return '<div class="rule-casino-row rc-active" data-slug="' + esc(s.slug) + '">' +
      '<button class="rc-toggle rc-on" onclick="toggleRuleSlug(this)" title="Exclude from this rule">✓</button>' +
      '<span class="rc-rank">' + (i+1) + '</span>' +
      '<span class="rc-name">' + esc(s.name) + '</span>' +
      '<div class="rc-arrows">' +
        '<button class="arr-btn"' + (i===0?' disabled':'') + ' onclick="moveRuleSlug(this,-1)">' + svgUp + '</button>' +
        '<button class="arr-btn"' + (i===n-1?' disabled':'') + ' onclick="moveRuleSlug(this,1)">' + svgDn + '</button>' +
      '</div>' +
    '</div>';
  }).join('');
  if (inactive.length) {
    html += '<div class="rc-divider">Excluded from this rule (' + inactive.length + ')</div>';
    html += inactive.map(function(s) {
      return '<div class="rule-casino-row rc-inactive" data-slug="' + esc(s.slug) + '">' +
        '<button class="rc-toggle rc-off" onclick="toggleRuleSlug(this)" title="Include in this rule">+</button>' +
        '<span class="rc-name">' + esc(s.name) + '</span>' +
      '</div>';
    }).join('');
  }
  container.innerHTML = html;
}

function toggleRuleSlug(btn) {
  var row = btn.parentNode;
  var slug = row.getAttribute('data-slug');
  var s = null;
  for (var i = 0; i < ruleCasinoState.length; i++) { if (ruleCasinoState[i].slug === slug) { s = ruleCasinoState[i]; break; } }
  if (!s) return;
  s.active = !s.active;
  if (s.active) {
    // Move to end of active section
    ruleCasinoState.splice(ruleCasinoState.indexOf(s), 1);
    var lastActiveIdx = 0;
    for (var j = 0; j < ruleCasinoState.length; j++) { if (ruleCasinoState[j].active) lastActiveIdx = j + 1; }
    ruleCasinoState.splice(lastActiveIdx, 0, s);
  }
  buildRuleCasinoList();
}

function moveRuleSlug(btn, dir) {
  var slug = btn.parentNode.parentNode.getAttribute('data-slug');
  var active = ruleCasinoState.filter(function(s) { return s.active; });
  var idx = -1;
  for (var i = 0; i < active.length; i++) { if (active[i].slug === slug) { idx = i; break; } }
  var newIdx = idx + dir;
  if (idx < 0 || newIdx < 0 || newIdx >= active.length) return;
  var tmp = active[newIdx]; active[newIdx] = active[idx]; active[idx] = tmp;
  var inactive = ruleCasinoState.filter(function(s) { return !s.active; });
  ruleCasinoState = active.concat(inactive);
  buildRuleCasinoList();
}

function saveRule() {
  var name = document.getElementById('rf-name').value.trim();
  if (!name) { alert('Rule name is required'); return; }

  var devices = [];
  if (document.getElementById('rf-dev-mob').checked) devices.push('mobile');
  if (document.getElementById('rf-dev-dsk').checked) devices.push('desktop');

  var geo = document.getElementById('rf-geo').value.trim().split(',').map(function(s){return s.trim();}).filter(Boolean);
  var city = document.getElementById('rf-city').value.trim().split(',').map(function(s){return s.trim();}).filter(Boolean);

  var dayInputs = document.querySelectorAll('.rf-day');
  var dayOfWeek = [];
  dayInputs.forEach(function(cb) { if (cb.checked) dayOfWeek.push(cb.value); });

  var timeFrom = document.getElementById('rf-tfrom').value;
  var timeTo = document.getElementById('rf-tto').value;

  var ipText = document.getElementById('rf-ip').value.trim();
  var ip = ipText ? ipText.split('\\n').map(function(s){return s.trim();}).filter(Boolean) : [];

  var vpnSel = document.getElementById('rf-vpn').value;
  var vpn = vpnSel === 'vpn' ? true : vpnSel === 'novpn' ? false : null;

  var toplist = ruleCasinoState.filter(function(s) { return s.active; }).map(function(s) { return s.slug; });

  var rule = {
    id: (editingRule !== null && editingRule >= 0 && currentRules[editingRule]) ? currentRules[editingRule].id : crypto.randomUUID(),
    name: name,
    conditions: { device: devices, geo: geo, city: city, dayOfWeek: dayOfWeek, timeFrom: timeFrom, timeTo: timeTo, ip: ip, vpn: vpn },
    toplist: toplist,
  };

  if (editingRule !== null && editingRule >= 0) currentRules[editingRule] = rule;
  else currentRules.push(rule);

  closeRuleModal();
  saveRules();
  renderRulesList();
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
}

/* ── Colors ─────────────────────────────────── */
function renderColorsInputs() {
  var body = document.getElementById('colors-body');
  if (!body) return;
  var isOpen = body.dataset.open === '1';
  var dots = COLOR_DEFS.map(function(def) {
    var val = currentColors[def.key] || DEFAULT_COLORS[def.key];
    return '<span class="color-dot" id="cdot-' + def.key + '" style="background:' + val + '"></span>';
  }).join('');
  var rows = COLOR_DEFS.map(function(def) {
    var val = currentColors[def.key] || DEFAULT_COLORS[def.key];
    return '<div class="color-row">' +
      '<label style="display:contents;cursor:pointer">' +
        '<input type="color" class="cswatch" value="' + val + '" data-key="' + def.key + '" oninput="onColorChange(this)">' +
        '<div class="clabel">' +
          '<div class="clabel-name">' + def.label + '</div>' +
          '<div class="clabel-desc">' + def.desc + '</div>' +
        '</div>' +
      '</label>' +
      '<span class="cval" id="cv-' + def.key + '">' + val + '</span>' +
    '</div>';
  }).join('');
  body.innerHTML =
    '<div class="colors-wrap">' +
      '<div class="colors-hdr" onclick="toggleColors()">' +
        '<div class="colors-hdr-title">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>' +
          'Colors & CTAs' +
        '</div>' +
        '<div class="colors-hdr-right">' +
          '<div class="color-dots">' + dots + '</div>' +
          '<button class="btn-colors-toggle" id="colors-toggle-btn" onclick="event.stopPropagation();toggleColors()">' + (isOpen ? 'Done ↑' : 'Edit') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="colors-body' + (isOpen ? ' open' : '') + '" id="colors-panel">' +
        rows +
        '<div class="cta-section">' +
          '<div class="cta-section-title">CTAs</div>' +
          '<div class="cta-row">' +
            '<div class="cta-field">' +
              '<label class="cta-label">▶ Play button</label>' +
              '<input class="cta-input" id="cta-play-input" type="text" value="' + esc(currentSettings.cta_play || '') + '" placeholder="e.g. Play now" onblur="saveCTASettings()" oninput="onCTAChange()">' +
            '</div>' +
            '<div class="cta-field">' +
              '<label class="cta-label">→ Review link</label>' +
              '<input class="cta-input" id="cta-review-input" type="text" value="' + esc(currentSettings.cta_review || '') + '" placeholder="e.g. Review" onblur="saveCTASettings()" oninput="onCTAChange()">' +
            '</div>' +
          '</div>' +
          '<div style="font-size:11px;color:var(--text2);opacity:.6;margin-top:6px">Leave blank to use the language default. Per-casino CTAs override this.</div>' +
        '</div>' +
        '<div class="colors-footer">' +
          '<button class="btn-reset" onclick="resetColors()">↺ Reset colors</button>' +
          '<button class="btn-colors-toggle" onclick="toggleColors()">Done ↑</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}


function toggleColors() {
  var panel = document.getElementById('colors-panel');
  var btn = document.getElementById('colors-toggle-btn');
  var outer = document.getElementById('colors-body');
  if (!panel) return;
  var isOpen = panel.classList.toggle('open');
  if (btn) btn.textContent = isOpen ? 'Done ↑' : 'Edit';
  if (outer) outer.dataset.open = isOpen ? '1' : '0';
}

function onCTAChange() {
  // Live update preview while typing
  if (activeTab === 'colprv') {
    var p = document.getElementById('cta-play-input');
    var r = document.getElementById('cta-review-input');
    if (p) currentSettings.cta_play = p.value.trim();
    if (r) currentSettings.cta_review = r.value.trim();
    renderPreviewTab();
  }
}

async function saveCTASettings() {
  var p = document.getElementById('cta-play-input');
  var r = document.getElementById('cta-review-input');
  if (!p && !r) return;
  if (p) currentSettings.cta_play = p.value.trim();
  if (r) currentSettings.cta_review = r.value.trim();
  if (!currentCountry) return;
  try {
    await api('POST', '/api/settings/' + currentCountry.id, currentSettings);
  } catch(e) { showToast('Error saving CTAs', 'err'); }
}

function onColorChange(input) {
  var key = input.getAttribute('data-key');
  var val = input.value;
  currentColors[key] = val;
  var lbl = document.getElementById('cv-' + key);
  if (lbl) lbl.textContent = val;
  var dot = document.getElementById('cdot-' + key);
  if (dot) dot.style.background = val;
  markDirty();
  if (activeTab === 'colprv') renderPreviewTab();
}

function resetColors() {
  currentColors = Object.assign({}, DEFAULT_COLORS);
  var outer = document.getElementById('colors-body');
  var wasOpen = outer && outer.dataset.open === '1';
  renderColorsInputs();
  if (wasOpen && outer) { outer.dataset.open = '1'; toggleColors(); }
  if (activeTab === 'colprv') renderPreviewTab();
  markDirty();
}

/* ── Settings tab ───────────────────────────── */
function renderSettingsTab() {
  var lang = currentSettings.language || 'it';
  var opts = Object.keys(LANGS).map(function(k) {
    return '<option value="' + k + '"' + (lang === k ? ' selected' : '') + '>' + LANGS[k].name + '</option>';
  }).join('');
  var rpath = currentSettings.redirects_path || '';
  return '<div class="settings-section">' +
    '<div class="settings-section-title">🌐 Language</div>' +
    '<div class="settings-row">' +
      '<label class="settings-label">Toplist language</label>' +
      '<select id="lang-select" onchange="onLangChange(this.value)" class="settings-select">' + opts + '</select>' +
    '</div>' +
  '</div>' +
  '<div class="settings-section" style="margin-top:12px">' +
    '<div class="settings-section-title">🔗 Redirects (_redirects)</div>' +
    '<div class="field" style="margin-bottom:6px">' +
      '<label>Path to <code>_redirects</code> file in the repo</label>' +
      '<input id="redirects-path-input" type="text" value="' + esc(rpath) + '" placeholder="e.g. _redirects or public/_redirects" onblur="saveRedirectsPath(this.value)">' +
    '</div>' +
    '<div style="font-size:11px;color:var(--text2);opacity:.6;line-height:1.6">' +
      'If set, each deploy will also push a <code>_redirects</code> file mapping <code>/slug → Destination URL</code>. Set the Destination URL on each casino.' +
    '</div>' +
  '</div>';
}

async function saveRedirectsPath(val) {
  currentSettings.redirects_path = val.trim();
  try {
    await api('POST', '/api/settings/' + currentCountry.id, currentSettings);
    showToast('Redirects path saved ✓', 'ok');
  } catch(e) { showToast('Error: ' + e.message, 'err'); }
}

async function onLangChange(lang) {
  currentSettings.language = lang;
  try {
    await api('POST', '/api/settings/' + currentCountry.id, currentSettings);
    showToast('Language saved ✓', 'ok');
    if (activeTab === 'colprv') renderPreviewTab();
  } catch(e) {
    showToast('Error: ' + e.message, 'err');
  }
}

/* ── Preview ────────────────────────────────── */
function renderPreviewTab() {
  var frame = document.getElementById('preview-frame');
  if (!frame) return;
  var linkBase = (currentCountry && currentCountry.link_base) ? currentCountry.link_base : '#';
  var lang = (currentSettings && currentSettings.language) ? currentSettings.language : 'it';
  frame.srcdoc = generatePreviewHTML(casinos, currentColors, linkBase, lang).replace('</head>', '<style>' + ${JSON.stringify(LOGO_CSS + DETAILS_CSS)} + '</style></head>');
}

var renderPublicDetails = ${renderCasinoDetails.toString()};

function generatePreviewHTML(casinoList, colors, linkBase, lang) {
  var compact = currentCountry && currentCountry.id === 'netherlands';
  var c = Object.assign({}, DEFAULT_COLORS, colors || {});
  var L = Object.assign({}, LANGS[lang] || LANGS.it, {
    cta_play:   (currentSettings.cta_play   || '') || (LANGS[lang] || LANGS.it).cta_play,
    cta_review: (currentSettings.cta_review || '') || (LANGS[lang] || LANGS.it).cta_review
  });
  var BC = {'Top Pick':'badge--gold','Best Bonus':'badge--gold',"Editor's Choice":'badge--navy',
    'Most Popular':'badge--red','New Casino':'badge--green','Exclusive':'badge--navy',
    'Recommended':'badge--navy','VIP':'badge--gold','🔥 Hot':'badge--red'};

  var rows = casinoList.map(function(casino, i) {
    var rank = i + 1;
    var isTop = rank <= 3;
    var hasBonus = !!String(casino.bonus || '').trim();
    var link = previewLink(casino, linkBase);
    var logoSrc = esc(mediaUrl(casino.logo));
    var bc = (casino.badge && BC[casino.badge]) ? BC[casino.badge] : 'badge--gold';
    return '<div class="toplist__item' + (isTop ? ' toplist__item--top toplist__item--' + rank : '') + (compact ? ' toplist__item--compact' + (!hasBonus ? ' toplist__item--no-bonus' : '') : '') + '" role="listitem">' +
      '<div class="toplist__main">' +
        '<div class="toplist__rank' + (isTop ? ' toplist__rank--' + rank : '') + '">' + rank + '</div>' +
        '<div class="toplist__logo">' +
          (logoSrc ? '<img src="' + logoSrc + '" alt="' + esc(casino.name) + '" class="toplist__logo-img" onerror="this.style.opacity=.12">' : '<div style="width:80px;height:60px;border-radius:8px;background:rgba(255,255,255,.06)"></div>') +
        '</div>' +
        '<div class="toplist__info">' +
          '<div class="toplist__header">' +
            '<span class="toplist__name">' + esc(casino.name) + '</span>' +
            (casino.badge ? '<span class="badge ' + bc + '">' + esc(lang === 'nl' ? NL_BADGE_LABELS[casino.badge] || casino.badge : casino.badge) + '</span>' : '') +
          '</div>' +
          (!compact && casino.rating ? '<div class="toplist__rating">★ ' + esc(casino.rating) + '</div>' : '') +
          (!compact && String(casino.license || '').trim() ? '<div class="toplist__license">🛡 ' + esc(casino.license) + '</div>' : '') +
        '</div>' +
        (!compact || hasBonus ? '<div class="toplist__bonus">' +
          '<span class="toplist__bonus-label">🎁 ' + L.bonus_label + '</span>' +
          '<span class="toplist__bonus-value">' + esc(casino.bonus || '') + '</span>' +
        '</div>' : '') +
        '<div class="toplist__cta">' +
          '<a href="' + link + '" class="btn--play" target="_blank" rel="noopener nofollow">' + esc(casino.cta_play || L.cta_play) + '</a>' +
          '<a href="' + link + '" class="btn--review" target="_blank" rel="noopener nofollow">' + esc(casino.cta_review || L.cta_review) + '</a>' +
        '</div>' +
      '</div>' +
      (compact ? renderPublicDetails(casino, lang, L) : '<div class="toplist__footer">' +
        '<div class="toplist__footer-col"><span class="toplist__footer-label">' + L.methods_label + '</span><span class="toplist__footer-val">' + esc(casino.methods || '') + '</span></div>' +
        '<div class="toplist__footer-col"><span class="toplist__footer-label">' + L.deposit_label + '</span><span class="toplist__footer-val">' + esc(casino.min_deposit || '') + '</span></div>' +
        '<div class="toplist__footer-col"><span class="toplist__footer-label">' + L.verified_label + '</span><span class="toplist__footer-val">' + L.disclaimer + '</span></div>' +
      '</div>') +
    '</div>';
  }).join('');

  // Real CSS from flower-home.it style3.css (toplist section)
  var css =
    '*, *::before, *::after{box-sizing:border-box;margin:0;padding:0}' +
    ':root{--c-navy:' + c.navy + ';--c-gold:' + c.gold + ';--c-gold-light:' + c.gold + ';--c-red:' + c.accent + ';--c-green:#10b981;--c-text:' + c.text + ';--c-bg:#f4f6f9;--c-border:rgba(255,255,255,.07);--c-text-muted:rgba(255,255,255,.5);--font:system-ui,-apple-system,"Segoe UI",sans-serif;--r-sm:6px;--r-md:10px;--r-lg:16px;--r-full:9999px;--t-fast:0.15s ease}' +
    'body{font-family:var(--font);background:var(--c-bg);color:var(--c-text);padding:20px;padding-bottom:110px;-webkit-font-smoothing:antialiased}' +
    // Toplist container
    '.toplist{display:flex;flex-direction:column;gap:16px}' +
    // Card — exact match style3.css
    '.toplist__item{background:var(--c-navy);border:1px solid rgba(255,255,255,.07);border-radius:var(--r-lg);overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.28);transition:transform var(--t-fast),box-shadow var(--t-fast);display:flex;flex-direction:column;position:relative}' +
    '.toplist__item--top{border-left:3px solid var(--c-gold)}' +
    '.toplist__item--1{background:var(--c-navy)}' +
    // Main grid — exact from style3.css
    '.toplist__main{display:grid;grid-template-columns:56px 160px 1fr 240px 190px;align-items:stretch;min-height:160px}' +
    // Rank
    '.toplist__rank{display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:rgba(255,255,255,.28);background:rgba(0,0,0,.18);border-right:1px solid rgba(255,255,255,.07);letter-spacing:-0.04em;user-select:none}' +
    '.toplist__rank--1{color:var(--c-gold)}.toplist__rank--2{color:rgba(255,255,255,.55)}.toplist__rank--3{color:#cd7f32}' +
    // Logo
    '.toplist__logo{display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(255,255,255,.035);border-right:1px solid rgba(255,255,255,.07)}' +
    '.toplist__logo-img{max-width:130px;max-height:90px;width:auto;height:auto;object-fit:contain;display:block}' +
    // Info
    '.toplist__info{padding:16px 20px;display:flex;flex-direction:column;justify-content:center;gap:8px;border-right:1px solid rgba(255,255,255,.07);min-width:0}' +
    '.toplist__header{display:flex;align-items:center;flex-wrap:wrap;gap:8px}' +
    '.toplist__name{font-size:1.55rem;font-weight:800;color:var(--c-text);line-height:1.1}' +
    '.toplist__rating{display:flex;align-items:center;gap:5px;color:var(--c-gold);font-size:1.1rem;font-weight:700;line-height:1}' +
    '.toplist__license{display:inline-flex;align-items:center;gap:5px;font-size:.75rem;font-weight:600;color:var(--c-text);opacity:.75;background:rgba(128,128,128,.12);border:1px solid rgba(128,128,128,.2);border-radius:var(--r-full);padding:3px 10px;line-height:1;width:fit-content}' +
    // Bonus
    '.toplist__bonus{padding:16px 20px;display:flex;flex-direction:column;justify-content:center;gap:8px;border-right:1px solid rgba(128,128,128,.12)}' +
    '.toplist__bonus-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--c-text);opacity:.5}' +
    '.toplist__bonus-value{font-size:1.3rem;font-weight:800;color:var(--c-text);line-height:1.3}' +
    // CTA
    '.toplist__cta{padding:16px 20px;display:flex;flex-direction:column;gap:12px;align-items:stretch;justify-content:center}' +
    // Footer
    '.toplist__footer{display:grid;grid-template-columns:2.2fr 0.7fr 1.4fr;background:rgba(0,0,0,.12);border-top:1px solid rgba(128,128,128,.12)}' +
    '.toplist__footer-col{padding:12px 16px;border-right:1px solid rgba(128,128,128,.1);min-width:0}.toplist__footer-col:last-child{border-right:none}' +
    '.toplist__footer-label{display:block;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--c-text);opacity:.45;margin-bottom:3px;white-space:nowrap}' +
    '.toplist__footer-val{font-size:.8rem;color:var(--c-text);opacity:.8;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}' +
    // Buttons — exact from style3.css, color override
    '.btn--play{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:var(--font);font-size:1rem;font-weight:800;padding:12px 20px;border-radius:var(--r-full);border:none;cursor:pointer;text-decoration:none !important;white-space:nowrap;letter-spacing:.01em;background:linear-gradient(135deg,' + c.cta + ',color-mix(in srgb,' + c.cta + ' 78%,#000));color:#fff !important;box-shadow:0 4px 14px ' + c.cta + '66;width:100%;transition:all .15s ease}' +
    '.btn--play::after{content:"→";transition:transform .15s ease}' +
    '.btn--play:hover{background:linear-gradient(135deg,color-mix(in srgb,' + c.cta + ' 88%,#000),color-mix(in srgb,' + c.cta + ' 68%,#000));box-shadow:0 6px 20px ' + c.cta + '80;transform:translateY(-1px)}' +
    '.btn--play:hover::after{transform:translateX(3px)}' +
    '.btn--review{display:inline-flex;align-items:center;justify-content:center;font-family:var(--font);font-size:.875rem;font-weight:700;padding:8px 20px;border-radius:var(--r-full);border:2px solid rgba(255,255,255,.3);background:transparent;color:rgba(255,255,255,.8) !important;text-decoration:none !important;transition:all .15s ease;width:100%;text-align:center}' +
    '.btn--review:hover{border-color:rgba(255,255,255,.7);color:#fff !important;background:rgba(255,255,255,.08)}' +
    // Badges
    '.badge{display:inline-flex;align-items:center;gap:4px;font-size:.75rem;font-weight:700;padding:3px 8px;border-radius:var(--r-full);white-space:nowrap;letter-spacing:.03em;text-transform:uppercase}' +
    '.badge--gold{background:linear-gradient(135deg,#fbbf24,#d97706);color:#fff}' +
    '.badge--navy{background:var(--c-navy);color:#fff;border:1px solid rgba(255,255,255,.2)}' +
    '.badge--red{background:var(--c-red);color:#fff}.badge--green{background:var(--c-green);color:#fff}' +
    // Sticky bonus — exact from style3.css
    '.sticky-bonus{position:fixed;left:12px;right:12px;bottom:12px;z-index:300;transform:translateY(0);background:linear-gradient(135deg,#152640 0%,var(--c-navy) 100%);border:1px solid rgba(212,175,55,.45);border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.4);overflow:hidden}' +
    '.sticky-bonus__inner{display:flex;align-items:center;gap:10px;padding:12px 14px}' +
    '.sticky-bonus__rank{width:32px;height:32px;border-radius:50%;background:linear-gradient(160deg,var(--c-gold),var(--c-gold));color:#1d3557;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
    '.sticky-bonus__logo{display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(255,255,255,.08);border-radius:8px;padding:6px 8px}' +
    '.sticky-bonus__logo-img{height:36px;width:auto;max-width:70px;object-fit:contain}' +
    '.sticky-bonus__info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;overflow:hidden}' +
    '.sticky-bonus__name{font-size:14px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.sticky-bonus__offer{font-size:12px;color:var(--c-gold);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.sticky-bonus__stars{display:flex;flex-direction:column;align-items:center;flex-shrink:0;line-height:1.15}' +
    '.sticky-bonus__score{font-size:16px;font-weight:800;color:#fff}' +
    '.sticky-stars{color:var(--c-gold);font-size:10px;letter-spacing:1px}' +
    '.sticky-bonus__cta{flex-shrink:0;font-size:13px;padding:9px 16px;white-space:nowrap;background:' + c.cta + ';color:#fff;border-radius:8px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center}' +
    '.sticky-bonus__close{flex-shrink:0;background:none;border:none;color:rgba(255,255,255,.45);font-size:16px;cursor:pointer;padding:4px 6px;line-height:1}' +
    '@media(min-width:800px){.sticky-bonus{left:50%;right:auto;width:760px;margin-left:-380px;bottom:20px}.sticky-bonus__inner{padding:14px 18px;gap:14px}}' +
    // Mobile toplist
    '@media(max-width:680px){' +
      '.toplist__main{grid-template-columns:44px 110px 1fr;grid-template-rows:auto auto auto}' +
      '.toplist__rank{grid-row:1/3;grid-column:1;align-self:stretch;font-size:1rem}' +
      '.toplist__logo{grid-row:1;grid-column:2;border-right:none;padding:12px 16px;min-height:80px}' +
      '.toplist__logo-img{max-width:100%;max-height:64px}' +
      '.toplist__info{grid-row:1;grid-column:3;border-right:none;padding:12px 8px 12px 8px}' +
      '.toplist__bonus{grid-row:2;grid-column:2/4;border-right:none;border-top:1px solid rgba(255,255,255,.07);padding:8px 12px}' +
      '.toplist__bonus-value{font-size:1rem}' +
      '.toplist__cta{grid-row:3;grid-column:1/4;flex-direction:row-reverse;border-top:1px solid rgba(255,255,255,.07);padding:12px;gap:8px}' +
      '.toplist__footer{grid-template-columns:1fr}' +
      '.toplist__footer-col{border-right:none;border-bottom:1px solid rgba(255,255,255,.07);padding:7px 12px}' +
      '.toplist__footer-col:last-child{border-bottom:none}' +
      '.toplist__item--top{border-left:none;border-top:3px solid var(--c-gold)}' +
      '.toplist__name{font-size:1rem}' +
    '}';

  var sticky = '';
  if (casinoList.length) {
    var s = casinoList[0];
    var sScore = esc((s.rating || '').split('/')[0].trim());
    var sLink = previewLink(s, linkBase);
    var sLogo = esc(mediaUrl(s.logo));
    var sCtaPlay = esc(s.cta_play || L.cta_play);
    sticky =
      '<div class="sticky-bonus">' +
        '<div class="sticky-bonus__inner">' +
          '<div class="sticky-bonus__rank">1</div>' +
          (sLogo ? '<div class="sticky-bonus__logo"><img src="' + sLogo + '" class="sticky-bonus__logo-img" onerror="this.style.opacity=.15" alt=""></div>' : '') +
          '<div class="sticky-bonus__info">' +
            '<span class="sticky-bonus__name">' + esc(s.name) + '</span>' +
            '<span class="sticky-bonus__offer">' + esc(s.bonus || '') + '</span>' +
          '</div>' +
          '<div class="sticky-bonus__stars"><span class="sticky-bonus__score">' + sScore + '</span><span class="sticky-stars">★★★★★</span></div>' +
          '<a href="' + sLink + '" class="sticky-bonus__cta" target="_blank" rel="noopener nofollow">' + sCtaPlay + '</a>' +
          '<button class="sticky-bonus__close" onclick="this.closest(\\'.sticky-bonus\\').remove()">✕</button>' +
        '</div>' +
      '</div>';
  }

  return '<!DOCTYPE html><html lang="' + lang + '"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>' + css + '</style></head><body>' +
    (casinoList.length ? '<div class="toplist" role="list">' + rows + '</div>' : '<p style="color:#94a3b8;padding:40px;text-align:center">No casinos yet.</p>') +
    sticky + '</body></html>';
}

/* ── Deploy ─────────────────────────────────── */
function markDirty() {
  dirty = true;
  var btn = document.getElementById('deploy-btn');
  if (btn) btn.disabled = false;
}

async function deployChanges() {
  var btn = document.getElementById('deploy-btn');
  if (!btn || !currentCountry) return;
  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="loader-2"></i> Publishing…';
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
  try {
    await api('POST', '/api/settings/' + currentCountry.id, currentSettings);
    var result = await api('POST', '/api/casinos/' + currentCountry.id, { casinos: casinos, colors: currentColors });
    dirty = false;
    btn.innerHTML = '<i data-lucide="check"></i> Published!';
    if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
    showToast(result.warning || 'Published. Connected sites update within about a minute.', result.warning ? 'err' : 'ok');
    if (result.warning) { dirty = true; btn.disabled = false; }
    setTimeout(function() {
      if (!dirty && btn) {
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="rocket"></i> Save &amp; Publish';
        if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
      }
    }, 3000);
    countries = await api('GET', '/api/countries');
    populateSidebar();
  } catch(e) {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="rocket"></i> Save &amp; Publish';
    if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
    showToast('Publish failed: ' + e.message, 'err');
  }
}

/* ── Casino modal ───────────────────────────── */
function openModal(idx) {
  editingIdx = idx;
  var c = idx >= 0 ? casinos[idx] : {};
  document.getElementById('modal-title').textContent = idx >= 0 ? 'Edit Casino' : 'Add Casino';
  document.getElementById('modal-body').innerHTML = buildForm(c);
  document.getElementById('mb1').classList.add('open');
  document.getElementById('casino-modal').classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
}

function buildForm(c) {
  var logo = c.logo || '';
  var lsrc = esc(mediaUrl(logo));
  var rtype = c.redirect_type || '302';
  return '<div class="field"><label>Name</label><input id="f-name" type="text" value="' + esc(c.name||'') + '" placeholder="e.g. Bizzo Casino"></div>' +
    '<div class="field"><label>Link slug</label><input id="f-slug" type="text" value="' + esc(c.slug||'') + '" placeholder="e.g. bizzo"></div>' +
    '<div class="field"><label>Destination URL <span style="opacity:.5;font-weight:400">— where /slug redirects to</span></label>' +
      '<input id="f-destination" type="text" value="' + esc(c.destination||'') + '" placeholder="https://record.casino.com/visit/?bta=12345"></div>' +
    '<div class="field"><label>Redirect type</label>' +
      '<select id="f-redirect-type" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:14px">' +
        '<option value="302"' + (rtype==='302'?' selected':'') + '>302 — Temporary (default, better for affiliates)</option>' +
        '<option value="301"' + (rtype==='301'?' selected':'') + '>301 — Permanent (cached by browser)</option>' +
        '<option value="307"' + (rtype==='307'?' selected':'') + '>307 — Temporary (preserves method)</option>' +
      '</select></div>' +
    '<div class="field"><label>Logo</label><div class="logo-picker">' +
      '<img id="f-logo-prev" class="logo-preview" src="' + esc(lsrc) + '" onerror="this.style.opacity=.2"></div>' +
      '<input id="f-logo" type="hidden" value="' + esc(logo) + '">' +
      '<button class="btn-pick" onclick="openMedia(pickLogo)">Pick from library</button>' +
    '</div></div>' +
    '<div class="field"><label>Rating</label><input id="f-rating" type="text" value="' + esc(c.rating||'') + '" placeholder="4.9/5"></div>' +
    '<div class="field"><label>License</label><input id="f-license" type="text" value="' + esc(c.license||'') + '" placeholder="e.g. Licenza Curaçao"></div>' +
    '<div class="field"><label>Bonus</label><input id="f-bonus" type="text" value="' + esc(c.bonus||'') + '" placeholder="e.g. 100% fino a €500 + 100 giri gratis"></div>' +
    '<div class="field"><label>Payment Methods</label><input id="f-methods" type="text" value="' + esc(c.methods||'') + '" placeholder="Visa, Mastercard…"></div>' +
    '<div class="field"><label>Min. Deposit</label><input id="f-min" type="text" value="' + esc(c.min_deposit||'') + '" placeholder="€10"></div>' +
    '<div class="field"><label>Badge (optional)</label>' +
    '<select id="f-badge" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:14px">' +
      ['', 'Top Pick', 'Best Bonus', "Editor\'s Choice", 'Most Popular', 'New Casino', 'Exclusive', 'Recommended', 'VIP', '🔥 Hot'].map(function(opt) {
        return '<option value="' + esc(opt) + '"' + (c.badge === opt ? ' selected' : '') + '>' + (opt || '— None —') + '</option>';
      }).join('') +
    '</select></div>' +
    '';
}

function closeModal() {
  document.getElementById('mb1').classList.remove('open');
  document.getElementById('casino-modal').classList.remove('open');
}

function pickLogo(filename) {
  document.getElementById('f-logo').value = filename;
  var p = document.getElementById('f-logo-prev');
  if (p) { p.src = mediaUrl(filename); p.style.opacity = '1'; }
}

function saveModal() {
  var casino = {
    name: document.getElementById('f-name').value.trim(),
    slug: document.getElementById('f-slug').value.trim(),
    logo: document.getElementById('f-logo').value.trim(),
    rating: document.getElementById('f-rating').value.trim(),
    license: document.getElementById('f-license').value.trim(),
    bonus: document.getElementById('f-bonus').value.trim(),
    methods: document.getElementById('f-methods').value.trim(),
    min_deposit: document.getElementById('f-min').value.trim(),
    badge: document.getElementById('f-badge').value.trim(),
    destination: document.getElementById('f-destination').value.trim(),
    redirect_type: document.getElementById('f-redirect-type').value,
  };
  if (!casino.name) { alert('Name is required'); return; }
  if (editingIdx >= 0) casinos[editingIdx] = casino;
  else casinos.push(casino);
  closeModal();
  renderCasinoList();
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
  markDirty();
  if (activeTab === 'colprv') renderPreviewTab();
}

function deleteCasino(idx) {
  if (!confirm('Delete "' + casinos[idx].name + '"?')) return;
  casinos.splice(idx, 1);
  renderCasinoList();
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
  markDirty();
  if (activeTab === 'colprv') renderPreviewTab();
}

/* ── Media library ──────────────────────────── */
function openMedia(cb) {
  mediaCb = cb;
  document.getElementById('mb2').classList.add('open');
  document.getElementById('media-modal').classList.add('open');
  loadMedia();
}
function closeMedia() {
  document.getElementById('mb2').classList.remove('open');
  document.getElementById('media-modal').classList.remove('open');
  mediaCb = null;
}
async function loadMedia() {
  document.getElementById('media-grid').innerHTML = '<div style="color:var(--text2);padding:20px;text-align:center">Loading…</div>';
  try {
    allMedia = await api('GET', '/api/media');
    filterMedia();
  } catch(e) {
    document.getElementById('media-grid').innerHTML = '<div style="color:var(--danger);padding:20px">Error: ' + e.message + '</div>';
  }
}
function filterMedia() {
  var q = ((document.getElementById('media-search') || {}).value || '').toLowerCase();
  var filtered = allMedia.filter(function(m) { return !q || m.filename.toLowerCase().indexOf(q) >= 0; });
  var el = document.getElementById('media-grid');
  if (!filtered.length) { el.innerHTML = '<div class="empty">No files found</div>'; return; }
  el.innerHTML = filtered.map(function(m) {
    var src = esc(mediaUrl(m.filename));
    return '<div class="med-item" data-file="' + esc(m.filename) + '">' +
      '<img src="' + src + '" onerror="this.style.opacity=.2" onclick="selectMed(this.parentElement)">' +
      '<div class="med-name">' + esc(m.filename) + '</div>' +
      '<button class="med-del" onclick="deleteMed(this.parentElement)">delete</button>' +
    '</div>';
  }).join('');
}
function selectMed(el) {
  var f = el.getAttribute('data-file');
  if (mediaCb) mediaCb(f);
  closeMedia();
}
function deleteMed(el) {
  var f = el.getAttribute('data-file');
  if (!confirm('Delete "' + f + '"?')) return;
  api('DELETE', '/api/media/' + encodeURIComponent(f)).then(function() {
    allMedia = allMedia.filter(function(m) { return m.filename !== f; });
    filterMedia();
  });
}
async function uploadMedia(input) {
  var files = Array.from(input.files);
  if (!files.length) return;
  document.getElementById('media-grid').innerHTML = '<div style="color:var(--text2);padding:20px;text-align:center">Uploading ' + files.length + ' file(s)…</div>';
  await Promise.all(files.map(function(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = async function(e) {
        try {
          var b64 = e.target.result.split(',')[1];
          await api('POST', '/api/media', { filename: file.name, data: b64, type: file.type });
          resolve();
        } catch(err) { reject(err); }
      };
      reader.readAsDataURL(file);
    });
  }));
  input.value = '';
  await loadMedia();
}

/* ── Utilities ──────────────────────────────── */
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function showToast(msg, type) {
  var el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 3000);
}

/* ── Preview mode toggle ─────────────────────── */
function setPreviewMode(mode) {
  previewMode = mode;
  document.querySelectorAll('.ptgl-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-mode') === mode);
  });
  var wrap = document.getElementById('preview-wrap');
  if (!wrap) return;
  if (mode === 'mobile') {
    wrap.style.padding = '0';
    wrap.style.background = 'transparent';
    wrap.innerHTML =
      '<div class="phone-wrap">' +
        '<div class="phone-mockup">' +
          '<div class="phone-screen">' +
            '<div class="phone-island"></div>' +
            '<div class="phone-status">' +
              '<span class="phone-status-time">9:41</span>' +
              '<div class="phone-status-icons">' +
                '<svg viewBox="0 0 24 24"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
                '<svg viewBox="0 0 24 24"><path d="M6 18L6 6M10 18L10 9M14 18L14 12M18 18L18 15" stroke="#000" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>' +
                '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="16" height="11" rx="2" stroke="#000" stroke-width="2" fill="none"/><path d="M22 11v3" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>' +
              '</div>' +
            '</div>' +
            '<iframe id="preview-frame" style="width:390px;height:750px;border:none;display:block;background:#f4f6f9;margin-top:59px" frameborder="0"></iframe>' +
          '</div>' +
          '<div class="phone-home"><div class="phone-home-bar"></div></div>' +
        '</div>' +
      '</div>';
  } else {
    wrap.style.padding = '0';
    wrap.style.background = '#f4f6f9';
    wrap.innerHTML = '<iframe id="preview-frame" style="width:100%;height:700px;border:none;background:#f4f6f9;display:block" frameborder="0"></iframe>';
  }
  renderPreviewTab();
}

/* ── Add Country ────────────────────────────── */
function openAddCountry() {
  document.getElementById('mb4').classList.add('open');
  document.getElementById('add-country-modal').classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons({icons:lucide.icons});
}
function closeAddCountry() {
  document.getElementById('mb4').classList.remove('open');
  document.getElementById('add-country-modal').classList.remove('open');
}
async function saveNewCountry() {
  var id = (document.getElementById('nc-id').value || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  var name = (document.getElementById('nc-name').value || '').trim();
  var flag = (document.getElementById('nc-flag').value || '').trim() || '🏳️';
  var lang = document.getElementById('nc-lang').value;
  var link = (document.getElementById('nc-link').value || '').trim();
  var repo = (document.getElementById('nc-repo').value || '').trim();
  var botPath = (document.getElementById('nc-path').value || '').trim();
  if (!id || !name) { alert('ID and Name are required'); return; }
  try {
    await api('POST', '/api/countries', { id, name, flag, link_base: link, repo, bot_path: botPath });
    // Save language setting
    await api('POST', '/api/settings/' + id, { language: lang });
    showToast('Country created ✓', 'ok');
    closeAddCountry();
    countries = await api('GET', '/api/countries');
    populateSidebar();
    renderCountries();
  } catch(e) {
    showToast('Error: ' + e.message, 'err');
  }
}

/* ── Stats ───────────────────────────────────── */
async function renderStatsTab() {
  var panel = document.getElementById('tab-stats');
  if (!panel || !currentCountry) return;
  if (statsCache) { renderStatsUI('30d'); return; }
  panel.innerHTML = '<div class="loading">Loading stats…</div>';
  try {
    statsCache = await api('GET', '/api/stats/' + currentCountry.id);
    renderStatsUI('30d');
  } catch(e) {
    panel.innerHTML = '<div class="stats-empty" style="color:var(--danger)">Error: ' + esc(e.message) + '</div>';
  }
}

function renderStatsUI(period) {
  var panel = document.getElementById('tab-stats');
  if (!panel || !statsCache) return;
  var allData = statsCache.allData || {};
  var casinosMap = statsCache.casinos || {};

  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);
  var cutoff = null;
  if (period === 'today') cutoff = todayStr;
  else if (period === '7d') cutoff = new Date(now - 6*86400000).toISOString().slice(0, 10);
  else if (period === '30d') cutoff = new Date(now - 29*86400000).toISOString().slice(0, 10);

  var slugTotals = {};
  Object.keys(allData).forEach(function(date) {
    if (cutoff && date < cutoff) return;
    var counts = allData[date];
    Object.keys(counts).forEach(function(k) {
      var parts = k.split(':'); var slug = parts[0], type = parts[1];
      if (!slugTotals[slug]) slugTotals[slug] = { play: 0, review: 0 };
      if (type === 'play') slugTotals[slug].play += counts[k];
      else if (type === 'review') slugTotals[slug].review += counts[k];
    });
  });

  var rows = Object.keys(slugTotals).map(function(slug) {
    return { slug: slug, name: casinosMap[slug] || slug,
      play: slugTotals[slug].play, review: slugTotals[slug].review,
      total: slugTotals[slug].play + slugTotals[slug].review };
  }).sort(function(a, b) { return b.total - a.total; });

  var grandTotal = rows.reduce(function(s, r) { return s + r.total; }, 0);
  var maxTotal = rows.length ? rows[0].total : 1;

  var periods = [
    { key: 'today', label: 'Today' },
    { key: '7d', label: '7 days' },
    { key: '30d', label: '30 days' },
  ];
  var pills = periods.map(function(p) {
    return '<button class="stat-pill' + (period === p.key ? ' active' : '') + '" data-p="' + p.key + '" onclick="renderStatsUI(this.dataset.p)">' + p.label + '</button>';
  }).join('');

  var tableRows = rows.length ? rows.map(function(r, i) {
    var barW = maxTotal > 0 ? Math.round(r.total / maxTotal * 100) : 0;
    return '<div class="stat-row">' +
      '<div class="stat-rk">' + (i+1) + '</div>' +
      '<div class="stat-nm">' + esc(r.name) + '</div>' +
      '<div class="stat-n play">' + r.play + '</div>' +
      '<div class="stat-n rev">' + r.review + '</div>' +
      '<div class="stat-n tot">' + r.total + '</div>' +
      '<div class="stat-bar-wrap"><div class="stat-bar" style="width:' + barW + '%"></div></div>' +
    '</div>';
  }).join('') :
    '<div class="stats-empty">No clicks yet for this period 📭<br>' +
    '<span class="stats-note">Deploy the toplist to start tracking. Clicks appear here within seconds.</span></div>';

  panel.innerHTML =
    '<div class="stats-header">' +
      '<div class="stat-pills">' + pills + '</div>' +
      '<div class="stats-grand">Total: <strong>' + grandTotal + '</strong> clicks</div>' +
    '</div>' +
    '<div class="stats-cols">' +
      '<div class="stat-col-lbl">#</div>' +
      '<div class="stat-col-lbl">Casino</div>' +
      '<div class="stat-col-lbl r">▶ Play</div>' +
      '<div class="stat-col-lbl r">→ Review</div>' +
      '<div class="stat-col-lbl r">Total</div>' +
      '<div class="stat-col-lbl"></div>' +
    '</div>' +
    '<div class="stats-rows">' + tableRows + '</div>';
}

/* ── Boot ───────────────────────────────────── */
(async function() {
  if (token) {
    try { await initApp(); }
    catch(e) { token = ''; localStorage.removeItem('bot_token'); }
  }
})();
</script>
<script src="https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js"></script>
<script>if(typeof lucide!=='undefined')lucide.createIcons({icons:lucide.icons});</script>
</body>
</html>`;
}
