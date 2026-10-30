# Phase 4: technical SEO deployment

## Routes and policies

- `/sitemap.xml` is an XML index; it links `/sitemap-static.xml`, `/sitemap-locations.xml` when inventory exists, and `/sitemap-{properties|blogs}-{page}.xml`.
- Static URLs come from the existing centralized `PAGE_SEO`, deduplicated and restricted to indexable public pages. Login and registration remain indexable. No dashboards, personal accounts, recovery/token routes, arbitrary search filters or preview hostnames are included.
- Backend `GET /api/seo/sitemap` returns counts and a finite inventory-verified city list. `GET /api/seo/sitemap/:kind/:page` selects only IDs, published blog slugs and timestamps. Every property query requires approval, available status, payment eligibility and no rejection. Every blog query requires published status.
- Pages use 5,000 rows in stable ID order; no full property collection is loaded. Next's shared fetch cache and CDN responses cache results for 300 seconds. Approval/removal changes can therefore take up to five minutes to leave a sitemap; detail pages still check current public visibility without persistent caching. Independent counts/pages can briefly differ during concurrent inventory changes and converge on refresh.
- Each XML file enforces 50,000 entries, 50 MiB uncompressed and canonical same-origin URLs below 2,048 characters. XML entities are escaped. Static/index/location files have no invented `lastmod`; content entries include a finite, nonfuture timestamp only when creation and update times agree. Legacy `updatedAt` also recorded views, so other entries deliberately omit optional `lastmod` rather than claim an unreliable content modification time. All property/blog view counters now preserve content `updatedAt`.
- Only the existing `/search?city=Hisar` plus optional `purpose=rent|sell` is eligible for the location sitemap, and only with current exact-city public inventory. Ambiguous substring matches and inconsistent city spellings are excluded; canonical city spelling comes from actual inventory. `Backend/config/seo.js` holds the deliberately small city allowlist; no new location pages are created.
- Sitemap API outages/invalid payloads produce HTTP 503, `Retry-After: 300`, `no-store`, `noindex`; they never produce a false successful empty sitemap. The independent static sitemap remains available. Invalid/empty child pages return 404.
- `/robots.txt` allows legitimate public crawling and assets, points to the production sitemap, and disallows API crawling. Wildcard rules cover Googlebot and Bingbot. Robots rules are not an access-control mechanism. Private pages have native noindex metadata plus `X-Robots-Tag`; API responses have noindex headers. Preview deployments also receive noindex headers.
- Existing authentication/authorization guards remain unchanged. Login/register are not blocked or given private-page headers.
- Property availability resolves before streaming: invalid, removed, pending, rejected, rented/sold records return actual HTML HTTP 404 with noindex and no private records. The detail route moved to the `(property)` route group without changing its public URL. Shared loading fallback moved into `(main)`, `(auth)` and `(dashboard)` so other routes retain loading behavior. One React-cached lookup still serves metadata and HTML. Temporary upstream failure remains a neutral noindex retry page, not a false 404.

## Hosting and release

1. Deploy the Backend changes first. New sitemap endpoints are public, read-only and expose only minimal SEO fields. No production database was accessed or modified during implementation.
2. Production disables automatic Mongoose index creation. With database-owner approval, run `node scripts/create-seo-indexes.js` from Backend once against the intended deployment database. It adds only the two declared paging indexes, never drops indexes or edits documents. This command was NOT executed against a real database.
3. Deploy Frontend on Vercel using its existing project/root settings (`Frontend` if deploying this repository as a monorepo). The added minimal `vercel.json` declares Next.js; only explicit root XML sitemap aliases rewrite to their internal handlers; no SPA catch-all, API rewrite or Netlify redirects were added. Root-level sitemap URLs ensure site-wide scope without requiring prior Search Console submission. Existing native assets remain real resources.
4. Configure `NEXT_PUBLIC_API_URL` to the active HTTPS backend origin plus `/api`, and `NEXT_PUBLIC_BACKEND_URL` to its origin before building. The repository currently defaults to DigitalOcean; this was preserved because no confirmed active Render replacement URL was provided. Render's existing `render.yaml` was preserved and remains usable if that is the intended host. Never point Vercel at a suspended/obsolete service.
5. Attach both apex and www domains to the Vercel project and enable TLS. Next config redirects www to `https://rentzypro.com`, and HTTP forwarded requests on the apex to HTTPS, preserving paths/queries. Localhost and previews are not redirected to production. Next normalizes trailing slashes; existing manifest redirect is preserved. No speculative obsolete-route redirects were invented.
6. After deployment, inspect `/robots.txt`, `/sitemap.xml`, every listed child sitemap, `/login`, `/register`, `/properties/`, an invalid/removed property URL, an anonymous `/admin`, `/favicon.ico` and `/manifest.webmanifest`. Expect XML/200 for valid sitemaps, 308 then 200 for trailing-slash public listing, 404 for missing property, protected login redirect with noindex, and correct asset MIME types.
7. Submit `https://rentzypro.com/sitemap.xml` in Google Search Console/Bing Webmaster Tools. Search-engine discovery/indexing, real DNS/TLS and the deployed Vercel/backend connection require post-deployment verification; none were claimed tested here.

## Repeatable verification

Frontend: `npm run test:seo`, `npm run test:branding`, `npm run build`, and `npm run test:e2e -- tests/technical-seo.spec.ts tests/seo.spec.ts tests/dynamic-seo.spec.ts`.

Backend: `npm test` and `npm run build`. Backend is JavaScript; its build performs syntax validation rather than transpilation.

The existing Playwright test server supplies synthetic server-side APIs. Browser fixtures mock auth/listing workflows. No real email, payment, database writes or deployment are required. An isolated production build (`PLAYWRIGHT_TEST=1`) was also tested with desktop Chrome and mobile Pixel 5 Chromium emulation. Real Safari/iOS/Android hardware and live deployments remain NOT VERIFIED.

Protocol reference: [Sitemaps.org](https://www.sitemaps.org/protocol.html). Hosting behavior uses [Next.js 15 route handlers](https://nextjs.org/docs/15/app/getting-started/route-handlers-and-middleware).

## Implementation verification (2026-10-30)

- Production frontend build: PASS (isolated .next-playwright, no deployment). Backend syntax build: PASS (110 modules); additive index script separately syntax-checked.
- Backend: 104 tests PASS, including public-only bounded sitemap queries, exact real location context, invalid parameters, read counters and HTTP endpoint guards. No live database connections.
- Frontend: 32 metadata/sitemap/cache unit tests and 5 branding unit tests PASS; strict TypeScript PASS.
- Production-browser automation: 26 SEO/crawl/dynamic metadata checks and 74 auth/blog/property/filter/navigation/branding regressions PASS across desktop Chrome and mobile Pixel 5 emulation. Root sitemap aliases reverified after the routing update.
- The final full SEO rerun had one prolonged worker/request-context timeout (25 passed). All eight final technical-route cases passed in a focused rerun, including that sitemap case; the original failure trace was preserved. Other checks had already passed.
- Cache measurement: 15 repeated sitemap requests required at most one manifest and one shard upstream request; a final warm-cache run required zero additional API requests. Property metadata plus HTML used one detail request. Simulated upstream outage returned 503/no-store/noindex/Retry-After:300 while the static sitemap remained HTTP 200.
- Git diff whitespace validation: PASS. No dependencies added or upgraded. Existing logos, favicon, APIs, auth permissions and UI preserved.
- NOT VERIFIED: live Vercel deployment, chosen active backend host/configuration, real MongoDB index presence/query plans, DNS/TLS, Google/Bing ingestion, physical mobile devices. No deployment or production data changes performed.
