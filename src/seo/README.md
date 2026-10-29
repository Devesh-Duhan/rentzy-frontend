# SEO foundation

Next.js App Router native Metadata API; no head-management dependency.

- Edit all static SEO copy, canonical paths, social defaults and crawl policies in `src/seo/seo.constants.js`.
- `pageMetadata(route)` resolves static pages. `buildMetadata(config)` supports title, description, canonical, robots, openGraph, twitter, image, type and optional keywords.
- Server `page.jsx` wrappers export metadata. `SeoPageClient.jsx` files preserve the original client UI. Existing layouts, auth guards and APIs are unchanged.
- Default canonicals use `https://rentzypro.com`, without queries/fragments or preview domains. The explicit inventory-backed location search policy is documented in `DYNAMIC_SEO.md`. Login/register are indexable; account, dashboard, recovery and personal search/compare pages are noindex.
- Native `/robots.txt` and the static sitemap entries use the same config. Crawlers may read noindex pages; backend authorization still protects private data.
- Static metadata no longer fetches global admin settings or lets a site-wide title overwrite every route. The constants file is authoritative for this foundation; existing admin settings storage/API remains intact, but its legacy SEO fields do not override this config.
- Property/rental/location metadata and public availability checks are implemented in Phase 2; see `DYNAMIC_SEO.md`. Other dynamic route fallbacks retain distinct canonicals.
- Keywords are optional metadata, not a ranking guarantee. No credentials, biometric data or inventory claims are embedded.

## Verification

From `Frontend`:

```powershell
npm.cmd run test:seo
npm.cmd run test:e2e -- tests/seo.spec.ts
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd ls react react-dom
```

The browser suite uses existing synthetic API fixtures and checks public HTML, client navigation, one canonical/title/description, social tags, private noindex, robots and sitemap on desktop/mobile Chromium. Existing auth, property and blog workflows are covered by `tests/auth.spec.ts`, `tests/properties.spec.ts` and `tests/blogs.spec.ts`.

Production verification used `PLAYWRIGHT_TEST=1` for the existing isolated `.next-playwright` build directory with a synthetic API. No deployment or production data changes were performed. Actual search-engine indexing and live deployment headers are not verified by these tests.
