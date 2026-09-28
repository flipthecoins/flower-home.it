// Shared by the published cards and the editor preview.
export const LOGO_CSS = `
.toplist__main { grid-template-columns: 44px minmax(150px,180px) minmax(130px,1fr) minmax(140px,210px) minmax(120px,170px); }
.toplist__logo { box-sizing:border-box; min-width:0; min-height:112px; padding:8px !important; overflow:hidden; }
.toplist__logo-img { display:block !important; width:100% !important; height:104px !important; max-width:100% !important; max-height:none !important; object-fit:contain !important; }
.toplist__info { min-width:0; }
.toplist__name { overflow-wrap:anywhere; }
.toplist__license { max-width:100%; white-space:normal; overflow-wrap:anywhere; }
@media(max-width:900px) and (min-width:681px) {
  .toplist__main { grid-template-columns:36px 138px minmax(100px,1fr) minmax(125px,160px) minmax(105px,140px); }
}
@media(max-width:680px) {
  .toplist__main { grid-template-columns:32px 120px minmax(0,1fr) !important; }
  .toplist__logo { min-height:96px; padding:6px !important; }
  .toplist__logo-img { height:84px !important; }
  .toplist__info { padding:10px !important; }
  .toplist__footer { grid-template-columns:1fr !important; }
  .toplist__footer-label, .toplist__footer-val { white-space:normal !important; overflow-wrap:anywhere; }
}
@media(max-width:380px) {
  .toplist__main { grid-template-columns:28px 104px minmax(0,1fr) !important; }
  .toplist__logo-img { height:76px !important; }
}
`;
