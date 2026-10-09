import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import delivery, { snapshot } from '../delivery/src/worker.js';
import admin from '../admin/src/worker.js';

function environment(casinos = [{ name: 'Example Casino', slug: 'example', logo: 'example.png', destination: 'https://example.com/new?x=1&y=2', rating: '4.8/5', bonus: 'New bonus' }]) {
  const data = new Map([
    ['bot:casinos:italy', casinos], ['bot:settings:italy', { language: 'it' }],
    ['media:index', [{ filename: 'example.png', uploaded_at: '2026-09-28' }]],
    ['bot-session:test', 1],
  ]);
  return { data, SESSIONS: {
    async get(key, options) { const value = data.get(key); return value === undefined ? null : options?.type === 'json' ? value : JSON.stringify(value); },
    async put(key, value) { data.set(key, JSON.parse(value)); },
  } };
}

test('published edits change order, bonus, CTA, destination, logo and revision together', async () => {
  const env = environment();
  const before = await snapshot('italy', env, 'https://public.example');
  assert.match(before.html, /https:\/\/public.example\/media\/example.png\?v=2026-09-28/);
  assert.match(before.html, /https:\/\/example.com\/new\?x=1&amp;y=2/);
  assert.match(before.sticky, /https:\/\/example.com\/new\?x=1&amp;y=2/);
  env.data.set('bot:casinos:italy', [{ name: 'Second', slug: 'second', logo: 'https://images.example/logo.svg', link: 'https://example.com/custom', bonus: 'Changed', cta_play: 'Claim', rating: '' }, ...env.data.get('bot:casinos:italy')]);
  const after = await snapshot('italy', env, 'https://public.example');
  assert.notEqual(before.revision, after.revision);
  assert.equal(after.count, 2);
  assert.ok(after.html.indexOf('Second') < after.html.indexOf('Example Casino'));
  for (const html of [after.html, after.sticky]) {
    assert.match(html, /Changed/); assert.match(html, /Claim/);
    assert.match(html, /https:\/\/images.example\/logo.svg/);
    assert.match(html, /https:\/\/example.com\/custom/);
  }
  env.data.get('media:index')[0].uploaded_at = 'replacement';
  assert.match((await snapshot('italy', env, 'https://public.example')).html, /v=replacement/);
});

test('public delivery distinguishes deliberately empty lists from missing data', async () => {
  const env = environment([]);
  assert.equal((await snapshot('italy', env, 'https://public.example')).count, 0);
  env.data.delete('bot:casinos:italy');
  const res = await delivery.fetch(new Request('https://public.example/lists/italy.json'), env);
  assert.equal(res.status, 503);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal((await delivery.fetch(new Request('https://public.example/api/casinos/italy'), env)).status, 404);
});

test('Italian lists have independent saves and public cards while existing sites keep the italy ID', async () => {
  const nonAams = [{ name: 'Offshore example', slug: 'offshore', license: 'Licenza Curaçao' }];
  const aams = [{ name: 'Italian example', slug: 'italian', license: 'Licenza ADM/AAMS', destination: 'https://example.it/' }];
  const env = environment(nonAams);
  const headers = { Authorization: 'Bearer test' };
  const saved = await admin.fetch(new Request('https://admin.example/api/casinos/italy_aams', {
    method: 'POST', headers, body: JSON.stringify({ casinos: aams, colors: { cta: '#123456' } }),
  }), env);
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).ok, true);
  assert.deepEqual(env.data.get('bot:casinos:italy'), nonAams);
  assert.deepEqual(env.data.get('bot:casinos:italy_aams'), aams);
  assert.equal(env.data.has('bot:colors:italy'), false);

  const countries = await (await admin.fetch(new Request('https://admin.example/api/countries', { headers }), env)).json();
  assert.deepEqual(countries.filter(c => c.id.startsWith('italy')).map(c => [c.name, c.casinoCount]), [
    ['Italy — AAMS', 1], ['Italy — NON AAMS', 1],
  ]);
  const legacy = await snapshot('italy', env, 'https://public.example');
  const licensed = await snapshot('italy_aams', env, 'https://public.example');
  assert.match(legacy.html, /Offshore example/);
  assert.doesNotMatch(legacy.html, /Italian example/);
  assert.match(licensed.html, /Italian example/);
  assert.doesNotMatch(licensed.html, /Offshore example/);
  assert.match(licensed.html, /https:\/\/example.it\//);
  const clicks = [];
  runInNewContext(licensed.html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    navigator: { languages: ['it'], sendBeacon: url => clicks.push(url) },
    document: { addEventListener: (_type, callback) => callback({
      target: { closest: () => ({ dataset: { cs: 'italian:play' } }) },
    }) },
  });
  assert.deepEqual(clicks, ['https://public.example/api/click/italy_aams/italian/play']);
  assert.match(licensed.html, /Gioca ora/);
  assert.match(licensed.css, /#123456/);
});

test('markup remains escaped and invalid link protocols do not become active links', async () => {
  const env = environment([{ name: '<script>alert(1)</script>', slug: 'a" onmouseover="bad', logo: 'a".png', link: 'javascript:alert(1)', rating: '', bonus: '<b>untrusted</b>' }]);
  const data = await snapshot('italy', env, 'https://public.example');
  assert.match(data.html, /href="#"/);
  assert.doesNotMatch(data.html, /<script>alert/);
  assert.match(data.html, /&lt;b&gt;untrusted/);
  assert.match(data.html, /%22.png/);
});

test('NL cards keep full facts in accessible details and omit empty fields', async () => {
  const env = environment();
  env.data.set('bot:settings:netherlands', { language: 'nl' });
  env.data.set('bot:casinos:netherlands', [
    { name: 'Currency casino', slug: 'currency', methods: 'EUR, USD, BTC', min_deposit: ' ', license: ' ', bonus: '' },
    { name: 'Long licence', slug: 'licence', license: 'KSA — Full operator details <unescaped> with licence 123/456', methods: 'iDEAL, Visa, Mastercard', min_deposit: '€10', bonus: '100% tot €100' },
  ]);
  const data = await snapshot('netherlands', env, 'https://public.example');
  const [first, second] = data.html.split('role="listitem"').slice(1);
  assert.doesNotMatch(first, /toplist__license|toplist__bonus|toplist__deposit|Min\. storting/);
  assert.match(first, /<details class="toplist__details"><summary>Casino-informatie/);
  assert.match(first, /Valuta's/);
  assert.match(first, /<li>EUR<\/li><li>USD<\/li><li>BTC<\/li>/);
  assert.match(first, /Speel Nu/);
  assert.match(first, /Lees review/);
  assert.doesNotMatch(second, /toplist__license/);
  assert.match(second, /KSA — Full operator details &lt;unescaped&gt; with licence 123\/456/);
  assert.match(second, /<strong>€10<\/strong>/);
  assert.match(second, /<dt>Betaalmethoden<\/dt>/);
  assert.match(second, /100% tot €100/);
  assert.doesNotMatch(data.html, /Jetzt spielen|Zahlungsmethoden|Mindesteinzahlung/);
});

test('Dutch lists save independently and both use Dutch compact cards', async () => {
  const env = environment();
  const zonder = [{ name: 'Offshore example', slug: 'offshore', license: 'Geen KSA', methods: 'EUR, BTC', bonus: '' }];
  const cruks = [{ name: 'Licensed example', slug: 'licensed', license: 'KSA 1234', methods: 'iDEAL, Visa', bonus: '' }];
  env.data.set('bot:casinos:netherlands', zonder);
  env.data.set('bot:settings:netherlands', { language: 'nl' });
  const headers = { Authorization: 'Bearer test' };
  const save = await admin.fetch(new Request('https://admin.example/api/casinos/netherlands_cruks', {
    method: 'POST', headers, body: JSON.stringify({ casinos: cruks, colors: { cta: '#00c896' } }),
  }), env);
  assert.equal((await save.json()).ok, true);
  assert.deepEqual(env.data.get('bot:casinos:netherlands'), zonder);
  assert.deepEqual(env.data.get('bot:casinos:netherlands_cruks'), cruks);
  assert.equal(env.data.has('bot:colors:netherlands'), false);
  const existing = await snapshot('netherlands', env, 'https://public.example');
  const licensed = await snapshot('netherlands_cruks', env, 'https://public.example');
  assert.match(existing.html, /Offshore example/);
  assert.doesNotMatch(existing.html, /Licensed example/);
  assert.match(licensed.html, /Licensed example/);
  assert.doesNotMatch(licensed.html, /Offshore example/);
  for (const data of [existing, licensed]) {
    assert.match(data.html, /toplist__item--compact/);
    assert.match(data.html, /<summary>Casino-informatie/);
    assert.match(data.html, /Speel Nu/);
    assert.doesNotMatch(data.html, /toplist__bonus|toplist__footer|toplist__license/);
  }
  const countries = await (await admin.fetch(new Request('https://admin.example/api/countries', { headers }), env)).json();
  assert.deepEqual(countries.filter(c => c.id.startsWith('netherlands')).map(c => [c.name, c.casinoCount]), [
    ['Netherlands — Zonder CRUKS', 1], ['Netherlands — CRUKS', 1],
  ]);
});

test('both Italian lists use the compact design with Italian details and preserve all casino facts', async () => {
  const casinos = [
    { name: 'Empty fields', slug: 'empty', license: ' ', bonus: '', methods: '', min_deposit: '' },
    { name: 'Full facts', slug: 'full', license: 'Licenza ADM/AAMS <1234>', bonus: 'Bonus originale', methods: 'Visa, PayPal', min_deposit: '€10' },
  ];
  const env = environment(casinos);
  env.data.set('bot:casinos:italy_aams', casinos);
  for (const country of ['italy', 'italy_aams']) {
    const data = await snapshot(country, env, 'https://public.example');
    const [empty, full] = data.html.split('role="listitem"').slice(1);
    assert.equal((data.html.match(/toplist__item--compact/g) || []).length, 2);
    assert.doesNotMatch(empty, /toplist__bonus|toplist__deposit|toplist__details/);
    assert.doesNotMatch(data.html, /toplist__footer|toplist__license|Casino-informatie/);
    assert.match(full, /<summary>Informazioni sul casinò/);
    assert.match(full, /Licenza ADM\/AAMS &lt;1234&gt;/);
    assert.match(full, /<li>Visa<\/li><li>PayPal<\/li>/);
    assert.match(full, /Deposito minimo/);
    assert.match(full, /<strong>€10<\/strong>/);
    assert.match(full, /Bonus originale/);
    assert.match(full, /Gioca ora/);
    assert.deepEqual(env.data.get('bot:casinos:' + country), casinos);
  }
});

test('all Italian and Dutch cards use one neutral logo plate for dark and light marks', async () => {
  const casino = [{ name: 'Mixed logo', slug: 'mixed', logo: 'mixed.svg', bonus: '' }];
  const env = environment(casino);
  for (const country of ['italy', 'italy_aams', 'netherlands', 'netherlands_cruks']) {
    env.data.set(`bot:casinos:${country}`, casino);
    const data = await snapshot(country, env, 'https://public.example');
    assert.match(data.css, /\.toplist__logo\s*\{[^}]*background:\s*#64748b\s*!important/s);
    assert.match(data.css, /\.toplist__logo\s*\{[^}]*border:\s*1px solid rgba\(255,255,255,\.18\)\s*!important/s);
    assert.match(data.css, /\.toplist__logo\s*\{[^}]*border-radius:\s*10px/s);
    assert.match(data.css, /\.toplist__logo\s*\{[^}]*box-shadow:\s*0 2px 8px rgba\(0,0,0,\.18\)/s);
  }
});

test('the bundled preview renderer runs without Worker bundler helpers in the browser', async () => {
  const bundle = await build({ entryPoints: ['admin/src/html.js'], bundle: true, format: 'esm', keepNames: true, write: false });
  const compiled = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  const document = compiled.html();
  const start = document.indexOf('var renderPublicDetails =');
  const end = document.indexOf('function generatePreviewHTML', start);
  const render = runInNewContext(`(() => {${document.slice(start, end)} return renderPublicDetails;})()`);
  const output = render({ methods: 'EUR, USD' }, 'nl', { methods_label: 'Betaalmethoden', disclaimer: '18+' }, value => String(value || ''));
  assert.match(output, /Casino-informatie/);
  assert.match(output, /<li>EUR<\/li><li>USD<\/li>/);
});

const built = await build({ stdin: {
  contents: `import {injectLiveToplist} from './shared/live-toplist.js'; export default {async fetch(request) {const b=await request.json(); return injectLiveToplist(new Response(b.source,{headers:{'Content-Type': b.type || 'text/html','ETag':'old'}}), 'italy', async()=> b.fail ? new Response('',{status:503}) : Response.json(b.data));}};`,
  resolveDir: process.cwd(), sourcefile: 'test-worker.js',
}, bundle: true, format: 'esm', write: false });
const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: built.outputFiles[0].text, compatibilityDate: '2026-04-22' }));
after(() => mf.dispose());
const rewrite = body => mf.dispatchFetch('https://test.example', { method: 'POST', body: JSON.stringify(body) });

test('runtime updates both static and template lists, preserves SEO, and clears an empty sticky', async () => {
  const source = '<!doctype html><html><head><link rel="canonical" href="https://site.example/"><style id="toplist-custom-colors">old</style></head><body><h1>Keep this</h1><div class="toplist" role="list"><!-- TOPLIST_START -->OLD</div><template id="toplist-tpl">OLD TEMPLATE</template><div class="sticky-bonus">OLD STICKY</div></body></html>';
  const data = { country: 'italy', revision: 'abc', html: '<div class="toplist__item">NEW</div>', css: '<style id="toplist-custom-colors">new</style>', sticky: '' };
  const res = await rewrite({ source, data });
  assert.equal(res.headers.get('X-Toplist-Revision'), 'abc');
  assert.equal(res.headers.get('ETag'), null);
  const html = await res.text();
  assert.equal((html.match(/>NEW</g) || []).length, 2);
  assert.doesNotMatch(html, /OLD/);
  assert.match(html, /<h1>Keep this<\/h1>/);
  assert.match(html, /rel="canonical" href="https:\/\/site.example\/"/);
  assert.equal((html.match(/id="toplist-custom-colors"/g) || []).length, 1);
});

test('delivery failure, wrong country and ordinary pages preserve the original response', async () => {
  const source = '<html><body><!-- TOPLIST_START -->Original list</body></html>';
  for (const options of [{ fail: true }, { data: { country: 'netherlands', html: 'Wrong', css: '' } }]) {
    const res = await rewrite({ source, ...options });
    assert.equal(await res.text(), source); assert.equal(res.headers.get('ETag'), 'old');
  }
  const ordinary = '<html><head><title>Contact</title></head><body>Contact us</body></html>';
  assert.equal(await (await rewrite({ source: ordinary, data: { country: 'italy', html: 'NEW', css: '' } })).text(), ordinary);
});

test('saving reports a published list even if the static GitHub backup fails', async () => {
  const env = environment();
  const savedFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
  try {
    const request = new Request('https://admin.example/api/casinos/italy', { method: 'POST', headers: { Authorization: 'Bearer test' }, body: JSON.stringify({ casinos: [], colors: {} }) });
    const res = await admin.fetch(request, env);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.published, true); assert.ok(body.warning);
    assert.deepEqual(env.data.get('bot:casinos:italy'), []);
  } finally { globalThis.fetch = savedFetch; }
});
