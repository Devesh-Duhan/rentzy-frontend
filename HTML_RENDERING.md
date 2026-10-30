# Phase 5 — Google-friendly public HTML

## Architecture decision

The application already uses Next.js 15.5.27 App Router with React 19, native metadata, server components and React Query. Keep this hybrid architecture: stable informational pages remain statically rendered; public inventory and articles render per request; existing interactive components hydrate that same public data. No framework migration, crawler-specific responses, separate SEO service or dependencies were added.

The audit used direct HTTP responses and real Chromium with JavaScript disabled, rather than only the hydrated DOM. Homepage cards previously depended on IntersectionObserver/client requests. Rental/location content existed in streamed HTML but remained hidden without JavaScript, including opacity-based animation. Article content was entirely client-fetched and inherited generic metadata.

## Implemented routes

- `/`: seven fixed category queries run concurrently, capped at ten records each. Existing category rails, strict Sell/Rent featured tabs, cards, galleries and layout are reused. Public query snapshots hydrate React Query and prevent duplicate initial browser property requests. Empty categories stay empty; failed categories have retry controls.
- `/rent` and `/search`: reuse existing request-shared server loaders and native inventory/location metadata. Main content is rendered before the response shell rather than placed in JavaScript-revealed stream templates. Entry opacity animation no longer hides the initial headings/cards. Failed SSR requests show a real error/retry state; search errors no longer claim there are zero matching properties.
- `/properties/[id]`: preserve the existing current-approval server lookup, genuine missing/nonpublic HTTP 404, real property metadata, gallery, structured property data and one shared metadata/content request.
- `/blog`: server-render the initial twenty published article summaries, then hydrate the existing infinite query. Search, category filtering and Load More remain client interactions. `summary=true` is an optional lightweight backend projection; older/full API clients retain their payload. The frontend also works if an older backend ignores this parameter.
- `/blog/[slug]`: server-render published article heading/body/photos and real database-derived title, description, canonical and Open Graph metadata. Shared React cache means metadata and HTML use one API lookup. Only explicitly allowed public fields are serialized; author email/internal fields are omitted. Missing/removed/draft records return real HTTP 404 with noindex. Existing ID/case aliases permanently redirect to the canonical public slug without changing MongoDB IDs. API outages have neutral noindex metadata and a manual retry UI, rather than a fake not-found record.

Home, rental, location and blog files moved from `(main)` to `(public)` to avoid an ancestor loading boundary streaming a hidden content segment. Public URLs and shared root providers/navbar remain unchanged. Other `(main)`, authentication and dashboard routes keep their existing loading behavior; property detail keeps its existing `(property)` group. There is no half-migrated router or extra server to deploy.

`BLOG_SEO` in `src/seo/seo.constants.js` holds editable article fallback metadata/settings. `blog-seo.js` validates public data and builds native metadata. `blog.server.js` performs request-scoped public reads. `PublicQueryBoundary.jsx` constructs a fresh query client for each server render; it never dehydrates a visitor's personalized client cache. Homepage category definitions/query keys are shared in `src/lib/home-properties.js`.

## Before/after evidence

Synthetic public fixtures, production build, JavaScript disabled:

| Page | Before | After |
| --- | --- | --- |
| Homepage | 0 visible property cards; 0 detail links | 20 visible cards; 60 card links |
| Rent | 0 visible cards despite streamed links | 12 visible cards |
| Hisar location search | 0 visible cards despite streamed links | 12 visible cards |
| Published article | No article body; generic title | Visible body/heading; actual article title/description |
| Property detail | Existing actual public content/metadata | Preserved |

These are fixture counts, not claims about live inventory. Raw HTML tests remove scripts before checking main content. Tests separately compare the visible no-JavaScript page and hydrated interactions, not merely text embedded in a React payload. Browser requests with normal, Googlebot and Twitterbot user agents receive equivalent published content and titles.

## Performance and availability

- No persistent frontend cache of property approval states or article publication status was introduced. Public server reads use `no-store`, an existing eight-second timeout and request-scoped deduplication. Existing backend list caches remain bounded and keep their existing mutation invalidation.
- Homepage requests are parallel and bounded (at most 70 preview records); blog listing fetches only its first twenty summaries. No entire collection is fetched or prerendered during build.
- Browser query freshness remains sixty seconds. A page already open may retain its snapshot during that interval; fresh server navigation/refresh checks public data again. Metadata after a successful client-side outage retry is refreshed by the next server navigation/refresh, rather than falsely claiming the failed original response was indexable.
- Complete nonstreamed public HTML waits for the public lookup. Backend latency can therefore affect TTFB for these selected pages. This is the deliberate tradeoff for useful visible HTML without JavaScript; requests are parallel, bounded and timed out. Other page loading shells remain intact.
- Authentication, private dashboards, saved-property permissions, API host configuration, sitemap/robots, brand assets and existing organization/property structured metadata are preserved. Interactive filters, authentication and galleries still require JavaScript; their public text and links do not.

## Verification and deployment

Run from Frontend:

```powershell
npm.cmd run test:seo
npm.cmd run test:e2e -- tests/rendering.spec.ts tests/blogs.spec.ts tests/rent.spec.ts tests/search.spec.ts tests/navigation-loading.spec.ts tests/auth.spec.ts tests/properties.spec.ts tests/seo.spec.ts tests/dynamic-seo.spec.ts tests/technical-seo.spec.ts
node node_modules/typescript/bin/tsc --noEmit
npm.cmd run build
```

Run from Backend: `npm.cmd test` and `npm.cmd run build`.

The ordinary Playwright launcher starts its own loopback-only fixture API on the test frontend port + 1. Test-only in-memory snapshot/lease endpoints synchronize mocked admin publishing with server-side article reads, so parallel tests cannot contaminate each other's publication state. These controls are never mounted in either production application. Production-build checks also ran against an isolated synthetic API; no real accounts, mail, payments or database writes were used.

Deploy normal Backend/Frontend changes with the existing pipeline and configured active backend URL. Deploying the optional backend summary support first reduces list payload size; the frontend tolerates the legacy full public list response. No new environment variables, services, database migrations, dependency upgrades or deployment rewrites are required for this phase.

Remaining verification: actual Vercel/backend deployment and latency, real MongoDB execution plans, Google indexing/Search Console and physical Safari/iOS/Android devices. None are claimed tested. No deployment was performed.

References: [Next.js 15 server fetching](https://nextjs.org/docs/15/app/getting-started/fetching-data), [React Query hydration](https://tanstack.com/query/latest/docs/framework/react/guides/ssr).


## Verification result — 2026-10-30

- PASS: final frontend production build (75 generated entries; selected public routes are dynamic SSR) and backend syntax build (110 modules).
- PASS: 106 backend tests, 35 SEO/rendering unit tests, strict TypeScript and whitespace/diff checks.
- PASS: 16 production rendering checks + 92 existing workflow/SEO regressions = 108 unique desktop/mobile browser cases. The affected rent/search/navigation subset also passed a final 36-case rerun.
- PASS: two standard development-launcher checks (admin publishes article through to public SSR; failed search has real retry recovery). The launcher supplies its own isolated loopback API without external setup.
- Verified zero initial duplicate browser property requests on homepage; article metadata and HTML use one detail API call. Real raw HTML content, no-JavaScript visibility, refresh, deep links, history, live hydration, galleries, filters, auth guards, public/private indexing and published-only responses checked.
- Failure-path tests caught a duplicate search empty/error branch during implementation; corrected before the final passing run. No unresolved test failures remain in these checks.
- No live deployment, production data edits, package installations/upgrades or subsequent phase work performed. Live hosting, search-engine ingestion and physical device verification remain NOT VERIFIED.

Changed files: moved public route files; PropertyCategoryRows; home query definitions; native blog SEO/server helpers and public hydration boundary; optional backend blog summary projection; focused frontend/backend tests and isolated SSR fixtures. Full phase file list/evidence: D:/Desktop/Rent/.task/html-rendering.
