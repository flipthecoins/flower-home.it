import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { chromium } from 'playwright';
import { html } from '../admin/src/html.js';
import { COUNTRIES, LANGS, NL_BADGE_LABELS } from '../admin/src/config.js';
import { LOGO_CSS } from '../admin/src/logo-styles.js';
import { DETAILS_CSS } from '../admin/src/casino-details.js';
import { EDITORIAL_CSS } from '../admin/src/editorial-styles.js';
import { generateToplistHTML, generateColorsCSS } from '../admin/src/worker.js';

const document = html();
const start = document.indexOf('var renderPublicDetails =');
const end = document.indexOf('/* ── Deploy', start);
assert.ok(start > 0 && end > start);
const preview = runInNewContext(`(() => {${document.slice(start, end)} return generatePreviewHTML;})()`, {
  currentCountry: COUNTRIES.italy, currentSettings: {}, LANGS, NL_BADGE_LABELS,
  DEFAULT_COLORS: { navy: '#1d3557', text: '#fff', gold: '#d4af37', cta: '#16a34a' },
  previewLink: casino => casino.destination, mediaUrl: logo => logo,
  esc: value => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
});
const casinos = [{ name: 'Test casino', slug: 'test', bonus: 'Test bonus', destination: 'https://example.com/' }];
const previewHTML = preview(casinos, {}, '', 'it').replace('</head>', `<style>${LOGO_CSS + DETAILS_CSS + EDITORIAL_CSS}</style></head>`);
const deliveryHTML = generateToplistHTML(casinos, COUNTRIES.italy, 'it', {});
const browser = await chromium.launch();
try {
  for (const width of [390, 600, 601, 680, 681, 1440]) {
    const p = await browser.newPage({ viewport: { width, height: 1000 } });
    const d = await browser.newPage({ viewport: { width, height: 1000 } });
    await p.setContent(previewHTML);
    await d.goto('https://www.flower-home.it/', { waitUntil: 'networkidle' });
    await d.evaluate(({ markup, css }) => {
      document.querySelector('.toplist[role="list"]').innerHTML = markup;
      document.querySelector('#toplist-custom-colors').outerHTML = css;
    }, { markup: deliveryHTML, css: generateColorsCSS({}) });
    const read = page => page.locator('.toplist__cta').first().evaluate(el => ({
      direction: getComputedStyle(el).flexDirection,
      buttons: [...el.querySelectorAll('a')].map(a => ({
        kind: a.classList.contains('btn--play') ? 'play' : 'review',
        order: getComputedStyle(a).order,
      })),
    }));
    const actual = await read(p);
    assert.deepEqual(actual, await read(d), `CTA parity at ${width}px`);
    if(width<=680){
      for(const page of [p,d]){
        const brand=await page.locator('.toplist__item').first().evaluate(c=>{
          const r=c.getBoundingClientRect();const logo=c.querySelector('.toplist__logo').getBoundingClientRect();
          const name=c.querySelector('.toplist__name');const nr=name.getBoundingClientRect();
          return {logoCentered:Math.abs((logo.left+logo.right-r.left-r.right)/2)<1,nameCentered:Math.abs((nr.left+nr.right-r.left-r.right)/2)<1,below:nr.top>=logo.bottom+6,textAlign:getComputedStyle(name).textAlign};
        });
        assert.deepEqual(brand,{logoCentered:true,nameCentered:true,below:true,textAlign:'center'},`Mobile brand header at ${width}px`);
        const uncentered=await page.locator('.toplist__item').first().evaluate(c=>[...c.querySelectorAll('.toplist__bonus-label,.toplist__bonus-value,.toplist__deposit,.toplist__legal,summary,dt,dd,li')].filter(e=>getComputedStyle(e).textAlign!=='center').map(e=>e.className||e.tagName));
        assert.deepEqual(uncentered,[],`Mobile text centering in preview/delivery at ${width}px`);
      }
    }
    console.log(JSON.stringify({ width, parity: true, ...actual }));
    await p.close(); await d.close();
  }
} finally { await browser.close(); }
