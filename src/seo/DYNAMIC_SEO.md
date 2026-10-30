# Phase 2 — dynamic property SEO

## Editable configuration

`src/seo/seo.constants.js` contains `PROPERTY_SEO`: title/description templates, property labels, furnishing labels, inventory wording, crawl policies and fetch timeout. `property-seo.js` builds native Next metadata; `property.server.js` shares request-scoped public API results between metadata and server rendering.

## Routes and canonical policy

- Existing `/properties/[MongoDB id]` URLs remain unchanged. Canonicals use the actual ID, normalized to lowercase; no slugs, redirects or identifier migrations were introduced.
- Property metadata uses real type, purpose, bedrooms, public title/description, address/city/state, price, furnishing and photos where present. Missing attributes are omitted; the existing logo is the fallback social image.
- `/rent` uses the real public inventory count and server-renders its initial cards. The initial response seeds React Query rather than making a duplicate browser request.
- Existing `/search?city=Hisar` (optionally `purpose=rent` or `purpose=sell`) is indexable only when the public API returns non-empty, approved inventory whose city exactly matches the query. The canonical retains only normalized city and purpose; tracking parameters are dropped.
- Mixed filters, partial city matches, empty/error results, sorting and explicit pagination are noindex. Their canonical is `/search`. Arbitrary `/properties`, `/buy` and `/rent` filter queries are noindex with the unfiltered route canonical. Normal filter functionality remains available.
- No new city/locality routes or automatically generated location pages were created. The schema has an address/city/state, not a separate locality field. No inventory or coverage is invented.
- Search filter navigation uses Next router navigation, so metadata changes together with the URL and results. Existing private/dashboard metadata policies remain intact.

## Availability and failures

- Public detail API requests check current database approval, payment eligibility and `status: available`. Pending, rejected, unpaid, rented, sold and deleted records are unavailable. Cached detail payloads are not trusted after approval/status changes; successful responses use `Cache-Control: no-store`.
- Frontend server loaders independently reject malformed, nonpublic or mismatched records before metadata or RSC/HTML serialization. Private payment/contact fields are stripped. Generic errors never serialize upstream private records.
- The current schema has no separate expiry or hidden flag. No expiry dates or business rules were invented. Unsupported statuses (including legacy `expired`/`hidden` values) cannot pass the available-status check.
- Invalid identifiers make no frontend API request. Backend invalid identifiers return 400; unavailable records return 404. Native Next `notFound()` adds noindex and the not-found UI.
- Phase 4 resolves the earlier streamed-200 limitation: property availability is checked before streaming. Invalid, removed and nonpublic property URLs return HTTP 404, including browser and bot requests. Shared loading fallbacks remain on other route groups.
- Temporary API failures are distinct from missing records: neutral noindex metadata and a retry UI, without an automatic duplicate detail request. An explicit retry can recover; a fresh server navigation/refresh resolves metadata again.
- Request-scoped React cache shares successful/error lookups for metadata and rendering. No persistent frontend property cache or extra metadata-only database query was added. Existing backend listing cache invalidation remains in place.

## Verification

Frontend:

```powershell
npm.cmd run test:seo
npm.cmd run test:e2e -- tests/dynamic-seo.spec.ts tests/seo.spec.ts
npm.cmd run test:e2e -- tests/auth.spec.ts tests/properties.spec.ts tests/blogs.spec.ts tests/rent.spec.ts tests/search.spec.ts tests/navigation-loading.spec.ts
npx.cmd tsc --noEmit
npm.cmd run build
```

Backend:

```powershell
npm.cmd test
npm.cmd run build
```

The repository test server includes synthetic SSR fixtures. No live database, real users, mail, payment services or deployment are required for these tests. `SEO_TEST_API_URL` optionally enables an external synthetic server's `/__seo/counts` assertion; production verification used it to confirm one request serves detail metadata and HTML, with zero immediate duplicate browser requests.

Production verification uses the existing `PLAYWRIGHT_TEST=1` isolated `.next-playwright` output directory. Live deployment/search indexing and physical Safari/Android devices are not verified. No production data was changed or deployment performed. No later phase was started.
