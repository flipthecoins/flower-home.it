export const PUBLIC_ORIGIN = 'https://reframe-toplists.reframe-web.workers.dev';

export function publicCasinos(casinos, media, origin = PUBLIC_ORIGIN) {
  const entries = new Map((media || []).map(m => [m.filename, m]));
  return casinos.map(c => ({
    ...c,
    logo: /^https?:\/\//i.test(c.logo || '') ? c.logo : c.logo
      ? `${origin}/media/${encodeURIComponent(c.logo)}?v=${encodeURIComponent(entries.get(c.logo)?.uploaded_at || '1')}` : '',
  }));
}
