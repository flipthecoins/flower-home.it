import { COUNTRIES } from '../../admin/src/config.js';
import { generateToplistHTML, generateStickyBonusHTML, generateColorsCSS } from '../../admin/src/worker.js';
import { publicCasinos } from '../../admin/src/public-media.js';

const types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif', avif: 'image/avif' };
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
});
const read = (env, key) => env.SESSIONS.get(key, { type: 'json', cacheTtl: 30 });

export async function snapshot(country, env, origin) {
  const config = COUNTRIES[country] || await read(env, `bot:country:${country}`);
  if (!config) return null;
  const [casinos, colors, settings, media] = await Promise.all([
    read(env, config.kv_key || `bot:casinos:${country}`),
    read(env, `bot:colors:${country}`),
    read(env, `bot:settings:${country}`),
    read(env, 'media:index'),
  ]);
  // A missing value is an outage/unpublished list, not an intentionally empty list.
  if (!Array.isArray(casinos)) return null;
  const versionBytes = new TextEncoder().encode(JSON.stringify([casinos, colors, settings, media]));
  const revision = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', versionBytes)), x => x.toString(16).padStart(2, '0')).join('').slice(0, 20);
  const published = publicCasinos(casinos, media, origin);
  const lang = settings?.language || (['netherlands', 'netherlands_cruks'].includes(country) ? 'nl' : 'it');
  return {
    country, revision, count: published.length,
    html: generateToplistHTML(published, config, lang, settings || {}, country, origin),
    css: generateColorsCSS(colors || {}),
    sticky: generateStickyBonusHTML(published, config, lang, settings || {}),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } });
    const list = url.pathname.match(/^\/lists\/([a-z0-9_]+)\.json$/);
    if (list && request.method === 'GET') {
      try {
        const data = await snapshot(list[1], env, url.origin);
        return data ? json(data) : json({ error: 'List unavailable' }, 503);
      } catch { return json({ error: 'List unavailable' }, 503); }
    }
    const media = url.pathname.match(/^\/media\/([^/]+)$/);
    if (media && request.method === 'GET') {
      let filename;
      try { filename = decodeURIComponent(media[1]); } catch { return new Response('Bad filename', { status: 400 }); }
      if (filename.includes('/') || filename.includes('\\')) return new Response('Bad filename', { status: 400 });
      const type = types[filename.split('.').pop().toLowerCase()];
      if (!type) return new Response('Unsupported media', { status: 415 });
      const data = await env.SESSIONS.get(`media:file:${filename}`, { cacheTtl: 30 });
      if (!data) return new Response('Not found', { status: 404 });
      return new Response(Uint8Array.from(atob(data), c => c.charCodeAt(0)), { headers: {
        'Content-Type': type, 'Cache-Control': 'public, max-age=30, must-revalidate',
        'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox",
      } });
    }
    const click = url.pathname.match(/^\/api\/click\/([a-z0-9_]+)\/([^/]+)\/(play|review)$/);
    if (click && request.method === 'POST') {
      const ua = request.headers.get('User-Agent') || '';
      if (ua && !/bot|crawl|spider|headless|python|curl|wget|playwright/i.test(ua)) {
        const key = `stats-day:${click[1]}:${new Date().toISOString().slice(0, 10)}`;
        try {
          const data = await read(env, key) || {};
          const name = `${decodeURIComponent(click[2])}:${click[3]}`;
          if (name !== '__proto__') data[name] = (Number(data[name]) || 0) + 1;
          await env.SESSIONS.put(key, JSON.stringify(data));
        } catch { /* Tracking must not interfere with navigation. */ }
      }
      return json({ ok: true });
    }
    return new Response('Not found', { status: 404 });
  },
};
