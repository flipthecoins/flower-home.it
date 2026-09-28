export const DELIVERY_ORIGIN = 'https://reframe-toplists.reframe-web.workers.dev';

// Preserve the site's layout and static fallback; replace only managed components.
export async function injectLiveToplist(response, country, fetcher = fetch) {
  if (!response.ok || !(response.headers.get('content-type') || '').includes('text/html')) return response;
  const source = await response.clone().text();
  if (!source.includes('TOPLIST_START') && !source.includes('toplist__item')) return response;
  let data;
  try {
    const live = await fetcher(`${DELIVERY_ORIGIN}/lists/${country}.json`, { signal: AbortSignal.timeout(3500) });
    if (!live.ok) return response;
    data = await live.json();
    if (data.country !== country || typeof data.html !== 'string' || typeof data.css !== 'string') return response;
  } catch { return response; }

  const headers = new Headers(response.headers);
  for (const key of ['etag', 'last-modified', 'content-length', 'content-encoding']) headers.delete(key);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Toplist-Revision', data.revision);
  const input = new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  return new HTMLRewriter()
    .on('style#toplist-custom-colors', { element(el) { el.remove(); } })
    .on('head', { element(el) { el.append(data.css, { html: true }); } })
    .on('template#toplist-tpl, .toplist[role="list"]', {
      element(el) {
        el.setAttribute('data-toplist-revision', data.revision);
        el.setInnerContent(`<!-- TOPLIST_START -->${data.html}<!-- TOPLIST_END -->`, { html: true });
      },
    })
    .on('.sticky-bonus', { element(el) { el.replace(data.sticky || '', { html: true }); } })
    .transform(input);
}
