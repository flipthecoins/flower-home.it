# Reframe Admin and live toplists

The current admin is `https://admin.reframe-web.workers.dev/`. This directory versions the previously standalone source from `vps-claude:~/Documentos/flip/bot-admin/src`.

Saving publishes the country list in the existing KV namespace. `reframe-toplists` reads that data and exposes only rendered public cards, styles, logos and click collection. Site Workers replace the existing toplist and sticky components in HTML, keeping each site's content, canonical tags and visitor routing. The public site never needs the admin password, session, rules API key or admin URL.

KV reads use a 30-second cache. Edits normally reach new page loads within about a minute; already-open browser tabs need a reload. There is no polling. Uploaded logos have versioned public URLs and a short browser cache, so replacing a file does not retain its old image for a year. If public delivery fails, each site keeps its last static HTML instead of returning an empty page.

The admin still writes its configured HTML to GitHub for history and static fallback. A GitHub error is reported separately from a successful live save. No database migration or replacement of the current casino lists is required.

## Integrations

| Country | Site | Integration source |
| --- | --- | --- |
| Italy | flower-home.it and its current router aliases | `proyectos/flower-home.it/workers/router/src/live-toplist.js` |
| Italy | parrocchialallio.it | `pages/parrocchialallio-it-flip.js` |
| Netherlands | driftwooddistillery.nl and its current router aliases | Same helper in that repository's router |
| Netherlands | bijlin-studiebegeleiding.nl | Same helper in that repository's asset Worker |
| Netherlands | ekofamily.nl | `pages/ekofamily-nl.js` |
| Netherlands | nocruks-casinos.com | `pages/nocruks-casinos.js` |

`shared/live-toplist.js` is the reference helper. Keep its copies in the site repositories identical. The Pages entries preserve their existing redirects and call the existing ASSETS binding. Their `.original.js` files document the previous wrappers. Production Pages files remain in the original VPS restorebot directories; do not redeploy stale site copies from elsewhere.

Existing country language settings and device-dependent site layouts are preserved. This change does not implement the separate, previously disconnected visitor-rule editor.

## Validation and deployment

Run `npm ci && npm test`. Tests cover saved edits, versioned images, link escaping, empty lists, both HTML layouts, SEO preservation, public delivery failure, and a failed GitHub backup after a live save. Use Wrangler `deploy --dry-run` for both configurations. `scripts/visual-check.mjs` additionally uses a locally captured, ignored `artifacts/current-state.json` and Chromium to check actual country data, mobile cards, editor, previews, and mocked publication without altering production lists.

The `Reframe live lists` workflow checks branch pushes and deploys both Workers on **main**, delivery first. It uses the existing repository Cloudflare secret. `admin/wrangler.toml` uses `keep_vars`, preserving the existing ADMIN_PASSWORD; secret bindings are not stored here. The regular site workflows deploy the router changes.

Rollback a site helper with a Git revert and its normal deployment. Roll back either admin/delivery Worker with its previous Cloudflare deployment version. For Pages, restore the previous deployment ID recorded in the change report. These rollbacks do not modify stored casinos or credentials.


## NL card presentation

NL uses Dutch (`language: nl`), explicitly requested by José. Public cards omit empty licence badges, bonus sections and deposit labels. Nonempty deposits remain visible; full licence text and payment data are in a keyboard-accessible native `details` section. Payment entries are individual tags, and currency-only entries use the currency label. User-entered facts, casino order and destinations are preserved. The preview uses the same details renderer, and the editor language selector now uses the backend language catalog, including Nederlands.
