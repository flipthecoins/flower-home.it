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
