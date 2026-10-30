# Phase 7 — Production SEO and performance audit

Audit: 30 October 2026. Actual repository: D:/Projects/rentzip (Next.js 15.5.27 App Router, React 19.2.4; separate Express/Mongoose backend). No framework/dependency upgrade, production mutation or deployment performed.

## Current production condition

- Fresh direct HTTP checked 24 indexable static public pages, robots, sitemap, favicon/manifest/assets, invalid URLs and anonymous protected redirects. Public titles/descriptions were unique; canonical, Open Graph and Twitter metadata present. Sampled HTML images all had alt attributes. Login/register remain index,follow. HTTP→HTTPS, www→apex, trailing slash and legacy manifest redirects preserve paths/queries.
- Live deployment is older than local code: homepage raw HTML has zero property-detail anchors versus 60 anchors/20 synthetic cards locally; live homepage only has Organization JSON-LD, local also has WebSite. Local property/article schemas and visible content passed fixture tests; this is not proof of deployed dynamic schemas.
- P1: live /properties/invalid returns HTTP 200 (soft 404); local returns actual 404 for browsers and bots, including missing/unapproved records.
- P1: live sitemap is the older URL-set implementation with generation-time lastmod values in sampled entries. /sitemap-static.xml is 404. Local uses a cached, bounded sitemap index/shards with validated canonical public records and reliable timestamps only.
- P1 deployment prerequisite: deployed backend /api/seo/sitemap returns 404. Browser network confirms the active backend is **DigitalOcean**, not the Render service named in the prompt: https://sea-turtle-app-g4msm.ondigitalocean.app. Read-only public listing returned 200 (~236 ms in one warm probe, count 40). Do not switch hosting/API URLs blindly. Current backend code contains the required SEO routes.
- Live private routes redirect anonymously to login; deployed API/private redirect X-Robots-Tag headers are absent in sampled responses. Local private routes/headers and backend authorization tests pass. Authentication remains the security boundary.
- Favicon, manifest and four referenced branding assets returned 200 with correct content types. robots.txt allows essential resources/public auth and declares the canonical sitemap. No claim of Search Console ownership or indexing.

## Confirmed fixes in this phase

1. Prevented automatic prefetch of guarded account links and explicit auth menu links. Mobile bottom navigation previously followed anonymous redirects and downloaded login/Firebase chunks while browsing public inventory. Public navigation prefetch, click behavior, authentication and roles remain available.
2. Login/register main content no longer starts opacity-zero awaiting hydration; one visible H1 on mobile/desktop. Existing form logic, branding, layout and feedback animations preserved. Verified with JavaScript disabled.
3. Category routes now validate actual active records before streaming, return real 404s for missing/inactive/invalid categories, redirect valid aliases while retaining filters, sanitize centralized metadata, and noindex filtered variants. SSR category/initial public listings hydrate existing query keys without duplicate initial category calls. API outages show a neutral noindex retry state.
4. Thin legacy featured utility views are noindex,follow and excluded from the static sitemap; invalid pagination syntax returns 404. Existing view URLs/UI remain functional. Normal inventory remains discoverable through /properties and homepage cards.
5. RSS now uses canonical production URLs, actual publishDate only, escaped public fields and published records. Missing/invalid/future dates are omitted rather than fabricated. Requests use bounded summaries; cache lifetime is 300 seconds without day-long stale fallback. API failure returns retryable, uncacheable 503 rather than cached empty success.

## Performance evidence

Chromium CDP/PerformanceObserver equivalent audit; Lighthouse package unavailable, no Lighthouse score claimed. Cold browser cache, 4× CPU slowdown, 1.6 Mbps down/750 Kbps up, 40 ms latency; six-second post-load sample, one run per route/device. Initial server caches/workstation load can differ. Local runs use identical synthetic inventory/API, not production database latency. JS KB is encoded response-body bytes observed, including automatic prefetch; image cross-origin timing can undercount bytes.

| Local route/device | LCP seconds before → after | JS KB before → after | CLS before → after |
| --- | --- | --- | --- |
| / / desktop | 2.74 → 3.55 | 242.5 → 237.6 | 0.0010 → 0.0029 |
| /rent / desktop | 1.19 → 1.70 | 245.0 → 240.2 | 0.0010 → 0.0010 |
| /login / desktop | 4.42 → 0.80 | 271.7 → 271.6 | 0.0124 → 0.0400 |
| / / mobile | 2.50 → 2.08 | 275.6 → 230.1 | 0.0000 → 0.0201 |
| /rent / mobile | 1.89 → 1.22 | 284.1 → 232.6 | 0.0000 → 0.0000 |
| /login / mobile | 2.92 → 1.32 | 277.5 → 271.6 | 0.0000 → 0.0000 |

Mobile homepage JS fell 45.5 KB (16.5%); rental JS fell 51.4 KB (18.1%). Login content became visible before hydration. **Desktop homepage/rental LCP samples worsened**; no general desktop speed improvement is claimed. CLS remained below 0.1 in these samples. Zero page runtime errors/overflow in the measured routes. Some Next prefetch cancellations were ERR_ABORTED, not failed destination requests. No external font requests; existing system fonts, image optimization/sizes, lazy card images and route splitting retained. Shared first-load JS remains ~103 KB gzip in the Next build report.

| Current live route/device | LCP seconds | CLS | JS KB |
| --- | --- | --- | --- |
| / / desktop | 9.80 | 0.0047 | 243.9 |
| /rent / desktop | 3.21 | 0.0000 | 251.5 |
| /login / desktop | 7.30 | 0.0448 | 290.1 |
| / / mobile | 7.66 | 0.0004 | 283.4 |
| /rent / mobile | 6.08 | 0.0000 | 291.0 |
| /login / mobile | 8.84 | 0.0000 | 296.0 |

These live measurements describe the **unmodified deployed version**, not after-deployment results. Homepage required client listing requests; local SSR query hydration avoids those initial duplicates. The sampled mobile search interaction was 1000 ms live and 888→832 ms locally; these are individual lab event durations, **not field INP**. Local total long-task blocking remains substantial (~2.4–3.7 seconds on listing samples under throttling). Field INP/CrUX and repeatable production-after measurements are NOT VERIFIED.

## Verification

- PASS: 50 SEO/schema/category/RSS unit tests; 5 branding tests; 106 backend tests; backend syntax build (110 modules).
- PASS: 129 desktop/mobile browser regressions, plus four final-build RSS HTTP checks. One mobile-only prefetch test intentionally skipped on desktop. No failed/flaky cases. Covers auth/roles/OTP mock flows, forms, listing/filter/pagination/gallery/save actions, admin blog publishing, metadata/navigation, raw/no-JS rendering, schema, sitemap shards, robots, redirects, protected routes and responsive overflow.
- PASS: final frontend production build (75 entries), strict TypeScript, diff checks. Only four obsolete generated .next type stubs removed after route-group moves; source URLs unchanged.
- PASS: final raw local HTTP audit, including RSS MIME, category/featured invalid-route 404, canonical Hisar inventory and noindex arbitrary search. API failure/privacy edge cases use synthetic fixtures; no production database writes.
- NOT VERIFIED: physical Apple/Android devices, Safari, actual Google login/OTP delivery, authenticated production dashboards, real production detail/article requests (existing GET endpoints increment views), hosted Google Rich Results Test, Search Console/Bing ownership/indexing, live after-deployment performance. Chromium mobile tests are emulation.

## Files changed in Phase 7

- src/components/Navbar.jsx, Footer.jsx; src/app/(auth)/login/SeoPageClient.jsx and register/SeoPageClient.jsx.
- src/seo/seo.constants.js; new category-seo.js, category.server.js, feed.js; src/app/feed.xml/route.js.
- category/[slug] and featured-properties/[page] moved from (main) into (public) without URL changes; CategoryClient/FeaturedClient preserve existing UI. Category server wrapper replaces generic layout metadata; featured server wrapper validates pagination and crawl policy.
- scripts/audit-public-seo.mjs and measure-seo-performance.mjs; tests/production-audit.test.mjs, production-audit.spec.ts, feed.spec.ts; tests/fixtures/seo-api.mjs and test.ts; package.json test script.
- This report and ../PRODUCTION_AUDIT.md. Backend source unchanged in Phase 7; its existing SEO endpoints must be deployed with this frontend. Earlier phase changes were preserved.

## Remaining issues and release decision

- **P1 / current live NO-GO for SEO sign-off:** deployment mismatch, backend SEO endpoint 404, old sitemap/soft 404 behavior, and poor sampled live LCP. Local code is buildable/tested; deployment requires owner approval and paired backend/frontend release, followed by actual live verification.
- **P2:** unfiltered /properties and /buy still depend on browser JavaScript for inventory grids; metadata and homepage/rental/detail discovery work. Legacy featured utility views remain excluded rather than advertising thin/duplicate content. No claim that all routes are statically rendered.
- **P2:** repeat controlled desktop LCP profiling and collect real-user CWV before declaring the performance target met. Full auth/Firebase functionality remains, so login bundle is still ~272 KB observed. Do not delete functionality to chase a score.
- **Manual:** production database index presence/query plans, cold-start distribution and backup readiness not verified. Existing backend/scripts/create-seo-indexes.js is optional and must be reviewed/approved before running on production; it was not executed.

## Verification and deployment / rollback

1. Locally, run npm.cmd run test:seo, npm.cmd run test:branding and npm.cmd run build in Frontend; npm.cmd test and npm.cmd run build in Backend. Run npx.cmd playwright test using the existing synthetic test launcher. Default test API binds only loopback; never point its control endpoints at production.
2. Read-only raw audit: node scripts/audit-public-seo.mjs (defaults to https://rentzypro.com; AUDIT_BASE and AUDIT_OUTPUT override). Performance audit: node scripts/measure-seo-performance.mjs (default localhost:3200; PERF_BASE/PERF_LABEL/PERF_OUTPUT override). Start a production build, not Next dev, for meaningful bundle/performance results. Audit JSON outputs contain public URLs only; no account credentials needed.
3. After approval, deploy current Backend first to the actual active host with existing secrets kept in its dashboard. Verify /api/seo/sitemap returns 200 and /api/seo/sitemap/properties/1 minimal public rows. Keep frontend API origin pointing at that host. Deploy complete current Frontend to Vercel; remove all PLAYWRIGHT_TEST/loopback test overrides from production settings. No env secrets were edited here.
4. Recheck root sitemap and every shard, RSS, robots, assets, login/register indexability, private noindex/auth guards, invalid-property 404 and canonical redirects. Confirm raw HTML public content and equivalent browser DOM; inspect a real approved detail/article only when view-counter side effects are acceptable. Repeat mobile/desktop performance samples; compare production with production, not fixtures.
5. Rollback: promote the previous known-good Vercel deployment; if needed restore the previous backend release on its actual host. No database migration or destructive data operation was performed. Keep both release identifiers before rollout. Earlier application/SEO edits must not be discarded via blanket git reset.

## Search Console / Bing manual setup

Owner must add the rentzypro.com Domain property in Google Search Console and publish the **exact DNS TXT value Google supplies**, then verify and retain it. No verification token was supplied or added. In Bing Webmaster Tools, import the verified Search Console property or use Bing's supplied DNS verification method. Submit https://rentzypro.com/sitemap.xml after the paired release passes checks. Inspect homepage, /rent, a genuine approved property and published article; confirm declared/selected canonical, rendered HTML and crawler access. Monitor Page indexing/exclusions, sitemap last-read/errors, Core Web Vitals field data and Search performance queries/pages/countries after release and regularly thereafter. Submission does not guarantee indexing or rankings.

Primary guidance: [Google Search Console setup](https://developers.google.com/search/docs/monitor-debug/search-console-start), [ownership verification](https://support.google.com/webmasters/answer/9008080), [sitemap requirements](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [INP definition](https://web.dev/articles/inp), [Bing sitemaps](https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed). No external account connections were claimed.

Evidence: D:/Desktop/Rent/.task/production-seo — fresh live/local HTTP JSON, live resource headers, before/after/live browser metrics, build/type/unit/backend logs, browser-regression.json and final RSS browser.json. No later phase started.
