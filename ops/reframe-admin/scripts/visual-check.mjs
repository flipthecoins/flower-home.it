import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { html } from '../admin/src/html.js';
import { snapshot } from '../delivery/src/worker.js';

const state = JSON.parse(await readFile('artifacts/current-state.json', 'utf8'));
const env = { SESSIONS: { async get(key) {
  if (key === 'media:index') return state.media;
  const [, kind, country] = key.split(':');
  return state[country]?.[kind] || null;
} } };
const built = await build({ stdin: { contents: `import {injectLiveToplist} from './shared/live-toplist.js'; export default {async fetch(request) {const b=await request.json(); return injectLiveToplist(new Response(b.source,{headers:{'Content-Type':'text/html'}}), b.country, async()=>Response.json(b.data));}};`, resolveDir: process.cwd() }, bundle: true, format: 'esm', write: false });
const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: built.outputFiles[0].text, compatibilityDate: '2026-04-22' }));
const browser = await chromium.launch({ headless: true });
const errors = [];
const results = [];
try {
  const context = await browser.newContext();
  const mediaCache = new Map();
  await context.route('**/media/**', async route => {
    const url = new URL(route.request().url());
    const filename = url.pathname.split('/').pop();
    if (!mediaCache.has(filename)) {
      const res = await fetch('https://admin.reframe-web.workers.dev/api/media/' + filename, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      mediaCache.set(filename, { status: res.status, contentType: res.headers.get('Content-Type'), body: Buffer.from(await res.arrayBuffer()) });
    }
    await route.fulfill(mediaCache.get(filename));
  });
  await context.route('**/api/click/**', route => route.fulfill({ json: { ok: true } }));
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const documents = [
    ['italy', 'https://www.flower-home.it/', '../../proyectos/flower-home.it/bot/index.html'],
    ['netherlands', 'https://www.driftwooddistillery.nl/', '../../../driftwooddistillery.nl/proyectos/driftwooddistillery.nl/bot/index.html'],
  ];
  for (const [country, url, path] of documents) {
    const source = await readFile(path, 'utf8');
    const data = await snapshot(country, env, 'https://reframe-toplists.reframe-web.workers.dev');
    const output = await mf.dispatchFetch('http://local', { method: 'POST', body: JSON.stringify({ source, data, country }) });
    const body = await output.text();
    await page.route(url, route => route.fulfill({ contentType: 'text/html', body }));
    for (const width of [390, 320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(url, { waitUntil: 'networkidle' });
      const first = page.locator('.toplist__item').filter({ visible: true }).first();
      const visible = await first.count();
      if (visible) {
        await first.scrollIntoViewIfNeeded();
        await first.screenshot({ path: `artifacts/${country}-${width}-card.png` });
        if(width===320) await page.screenshot({path:`artifacts/${country}-320-page.png`});
      }
      results.push({ country, width, ...await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        overflowElements: [...document.querySelectorAll('body *')].filter(x => x.getBoundingClientRect().right > innerWidth + 1).slice(0,8).map(x=>x.className),
        images: [...document.querySelectorAll('.toplist__logo-img')].filter(x => x.getBoundingClientRect().width).map(x => ({ width: Math.round(x.getBoundingClientRect().width), height: Math.round(x.getBoundingClientRect().height), loaded: x.complete && x.naturalWidth > 0 })).slice(0, 3),
        names: [...document.querySelectorAll('.toplist__name')].map(x => x.textContent).slice(0, 3),
      })) });
    }
  }
  await page.route('https://panel.test/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/') return route.fulfill({ contentType: 'text/html', body: html() });
    if (path === '/api/countries') return route.fulfill({ json: state.countries });
    if (path.startsWith('/api/casinos/')) return route.fulfill({ json: route.request().method() === 'GET' ? state[path.split('/').pop()] : { ok: true, published: true } });
    if (path.startsWith('/api/rules/')) return route.fulfill({ json: { rules: [] } });
    if (path.startsWith('/api/domains/')) return route.fulfill({ json: { domains: [] } });
    if (path.startsWith('/api/settings/')) return route.fulfill({ json: {} });
    if (path.startsWith('/api/media/')) {
      const filename = path.split('/').pop();
      if (mediaCache.has(filename)) return route.fulfill(mediaCache.get(filename));
      const response = await fetch('https://admin.reframe-web.workers.dev' + path, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      return route.fulfill({ status: response.status, contentType: response.headers.get('Content-Type'), body: Buffer.from(await response.arrayBuffer()) });
    }
    return route.fulfill({ json: [] });
  });
  await page.addInitScript(() => localStorage.setItem('bot_token', 'local-visual-check'));
  for (const width of [390, 320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('https://panel.test/', { waitUntil: 'networkidle' });
    await page.evaluate(() => loadCasinos('italy'));
    await page.waitForSelector('.c-logo');
    await page.screenshot({ path: `artifacts/admin-${width}.png` });
    results.push({ country: 'admin', width, ...await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, logo: document.querySelector('.c-logo').getBoundingClientRect().toJSON() })) });
    await page.evaluate(() => { moveCasino(0, 1); return deployChanges(); });
    if (!(await page.locator('#deploy-btn').textContent()).includes('Published')) throw new Error('Publish interaction failed');
    await page.evaluate(() => switchTab('colprv'));
    await page.waitForTimeout(700);
    const preview = page.frames().find(f=>f.parentFrame());
    if(!preview || !(await preview.locator('.toplist__logo-img').count())) throw new Error('Preview missing');
    await page.screenshot({path:`artifacts/preview-${width}.png`});
  }
  await writeFile('artifacts/visual-results.json', JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
  if (errors.length || results.some(r => r.overflowElements?.some(c => String(c).startsWith('toplist')) || r.images?.some(i => !i.loaded))) process.exitCode = 1;
} finally { await browser.close(); await mf.dispose(); }
