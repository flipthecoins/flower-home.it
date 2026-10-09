# Reframe Admin and live toplists

The current admin is `https://admin.reframe-web.workers.dev/`. This directory versions the previously standalone source from `vps-claude:~/Documentos/flip/bot-admin/src`.

Saving publishes the country list in the existing KV namespace. `reframe-toplists` reads that data and exposes only rendered public cards, styles, logos and click collection. Site Workers replace the existing toplist and sticky components in HTML, keeping each site's content, canonical tags and visitor routing. The public site never needs the admin password, session, rules API key or admin URL.

KV reads use a 30-second cache. Edits normally reach new page loads within about a minute; already-open browser tabs need a reload. There is no polling. Uploaded logos have versioned public URLs and a short browser cache, so replacing a file does not retain its old image for a year. If public delivery fails, each site keeps its last static HTML instead of returning an empty page.

The admin still writes its configured HTML to GitHub for history and static fallback. A GitHub error is reported separately from a successful live save. No database migration or replacement of the current casino lists is required.

## Integrations

Italy has two independent lists: `italy_aams` (Italy — AAMS) and `italy`
(Italy — NON AAMS). Existing Italian sites keep using `italy`; the AAMS list
has its own saved casinos, settings and public `/lists/italy_aams.json` endpoint,
with no site or static repository assigned. The initial split uses the licence
labels already saved in the panel and preserves every casino field and the
relative order within each list.

The Netherlands also has two independent lists: `netherlands` (Netherlands —
Zonder CRUKS) and `netherlands_cruks` (Netherlands — CRUKS). Existing Dutch sites
keep using `netherlands`; the CRUKS list has its own saved data and public
`/lists/netherlands_cruks.json` endpoint, with no site or static repository
assigned. Both lists keep the Dutch language, colors and compact cards. The
initial split uses the saved KSA licence labels, excluding explicit negatives
such as "Geen KSA", and preserves every casino field and the order in each group.

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


## Flower editorial comparison theme

The `italy` configuration opts into `card_theme: 'editorial'`. Its light cards
use the site's navy as ink, accessible green primary actions (`#15803d`,
hover `#166534`, white labels), restrained gold ranking markers, and unboxed logos. This is an intentional theme override of the dark
palette: the saved navy/gold values remain the theme inputs; the legacy CTA/text
colors do not recolor editorial cards. Other country lists are not opted in.

`admin/src/editorial-styles.js` is shared by public delivery and editor previews.
Keep its selectors scoped to `.toplist__item--editorial`; page-level integration
rules must use `:has(.toplist__item--editorial)`. Casino facts, ordering, image
sources and destinations are unchanged by the theme.

With the ignored `artifacts/current-state.json` fixture captured from the panel,
run `npm run test:visual:editorial`. It renders local styles on the actual Flower
page at ten breakpoints, checks content preservation, image loading, review-link
contrast, overflow and keyboard details, and saves screenshot/report evidence.
Run `npm run test:visual:editorial:edges` for empty and long-content cases,
and `npm run test:visual:editorial:parity` to compare preview/delivery CTA order
around mobile breakpoints. The scoped page-level rules also restyle the sticky
CTA and hide the redundant header CTA at widths of 360px or less.
After the official deployment run `npm run test:visual:editorial -- --production`.
The viewport screenshots preserve the normal header; full-list captures hide it
only to avoid sticky-header stitching artifacts. Source image resolution is
separate from layout validation and still requires visual review.

## Italian and Dutch card presentation

NL uses Dutch (`language: nl`), explicitly requested by José. Public cards omit empty licence badges, bonus sections and deposit labels. Nonempty deposits remain visible; full licence text and payment data are in a keyboard-accessible native `details` section. Payment entries are individual tags, and currency-only entries use the currency label. User-entered facts, casino order and destinations are preserved. The preview uses the same details renderer, and the editor language selector now uses the backend language catalog, including Nederlands.

Both Italian lists now use the same compact presentation, with Italian labels
and their existing colors. `card_layout: 'compact'` in the country configuration
selects this layout consistently for public delivery, static copies and previews.

On desktop, compact cards use a horizontal row with a smaller brand area and
more room for the complete bonus text. Deposit, legal notice and the details
toggle share one footer row. Opening details reveals licence and payments below
without moving the toggle. These density rules apply above 680px; mobile keeps
its existing layout. Check full-list screenshots and card heights when changing
this presentation, including both the site's CSS and the admin preview.

On mobile, casino names use 20px type for readability and badges wrap in narrow
previews. Payment and currency tags
explicitly suppress native markers and inherited pseudo-element bullets at every
screen size, including when embedded inside article lists.
