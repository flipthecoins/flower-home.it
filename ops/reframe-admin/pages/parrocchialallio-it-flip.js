import {injectLiveToplist} from '../shared/live-toplist.js';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "parrocchialallio.it") {
      url.protocol = "https:";
      url.hostname = "www.parrocchialallio.it";
      return Response.redirect(url.toString(), 301);
    }
    return injectLiveToplist(await env.ASSETS.fetch(request), 'italy');
  },
};
