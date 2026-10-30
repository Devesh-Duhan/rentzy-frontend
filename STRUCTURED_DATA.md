# Phase 6 — structured data and semantic content

## Audit and decision

The existing App Router already server-renders public inventory/articles and centralizes metadata. Organization JSON-LD existed globally. Property pages, however, used `Product` with an `Offer`, `InStock` and a top-level address despite representing heterogeneous rental/sale properties. There were no website, article or breadcrumb entities. Rental copy promised owner-only/no-brokerage service although the actual model supports owner, broker and builder listings. Article UI labelled every author a verified real-estate advisor without such a field.

Reuse native rendering and the same approved/published API snapshots. No additional database/API fetches, dependency packages, stored descriptions, locations, business details, prices or reviews were introduced or edited.

## Schema architecture

`src/seo/schema.js` contains pure generators; `JsonLd.jsx` safely serializes each result. Existing metadata text/canonical utilities and public record guards are reused. Editable labels are in `STRUCTURED_SEO` within `seo.constants.js`. `Breadcrumbs.jsx` renders standard visible Next Link anchors from the same trail definitions used in JSON-LD.

| Page | Markup | Data source / scope |
| --- | --- | --- |
| Shared site identity | One Organization with stable `/#organization` | Existing site name, description, production URL and approved logo only |
| Homepage | One WebSite with stable `/#website` | Real site identity and organization reference |
| Approved, available property | RealEstateListing + actual Place/House/Apartment/Accommodation/Residence + BreadcrumbList | Existing public property title, description, images, provided address and supported numeric facts |
| Published article | WebPage + BlogPosting + BreadcrumbList | Actual visible title, excerpt/public text, cover image, available author name and valid publication date |
| Rental listing / legitimate indexable location results | CollectionPage + ItemList | Only the currently displayed public cards, in visible order |

- House/apartment/room accommodation facts use actual positive bedroom counts and square-foot area (`FTK`). Generic residences/commercial/industrial/land/custom types are conservative Place/Residence entities; unsupported accommodation fields are omitted. Country, address and images are never inferred when missing.
- Property addresses belong to the actual Place/Accommodation entity, not to the listing WebPage. The listing references that entity and its visible breadcrumb trail through stable canonical IDs.
- Product, Offer, price/availability markup, hotel/vacation-rental types, ratings, reviews, awards, invented contact details, ownership identity and business credentials are not emitted. Mixed rent/sale pricing is not recast as a purchase or nightly offer.
- Article images come only from the actual visible cover image, not a fallback logo/stock image. Missing authors/images/dates are omitted. `dateModified` is intentionally omitted because historical `updatedAt` also recorded views. Publication dates must be valid and nonfuture; they are not replaced with today's date.
- Only approved/currently available properties and published editorial records receive these page entities. Missing/private/rejected/inactive/error routes receive no property/article graph. Existing protected route guards and noindex policies remain intact.
- Collection counts describe the displayed items, not an invented total. Client filtering updates the schema from the same current card data. Low-value/noindex search combinations do not receive location collection markup.
- JSON serialization escapes `<`, `>`, `&`, U+2028/U+2029 and round-trips through `JSON.parse`; untrusted text cannot close the script tag. Explicit graph definitions use unique IDs and reference shared entities rather than duplicating them. One script per page responsibility is removed/updated on client navigation.

## Content and discoverability changes

- Homepage accessible H1 naturally identifies homes/properties. Rental H1 now says “Find a home for rent”; its description no longer promises broker-free/owner-only inventory. Existing titles and real property descriptions are retained rather than stuffed with phrases or fabricated locations.
- Blog copy no longer promises a broker-free experience. Unverified author/advisor labels became neutral contributor text; author names are paragraphs rather than heading-level jumps. Related article headings now use H2/H3. Zero views stay zero; missing reading duration no longer becomes an arbitrary four-minute claim.
- Real property/gallery/cover photos retain relevant descriptive alt text. Pure stock fallback article thumbnails are decorative (`alt=""`) because their adjacent linked article title already describes the destination; they are not presented as genuine property/article photos in schema.
- Property breadcrumbs, article breadcrumbs and contextual links use standard crawlable anchors. Detail pages link to the appropriate existing rental/sale inventory and the actual provided city search. Articles link to existing rental/all-property pages. There are no fabricated city landing pages or inferred city names from article text.
- Footer category links now target the working `/properties?type=...` listing route, including fallback categories; they no longer depend on an unconfirmed `/category/:slug` database page existing. Existing category pages themselves were not removed.

## Google eligibility

Checked official documentation for [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [WebSite/site names](https://developers.google.com/search/docs/appearance/site-names), [Article](https://developers.google.com/search/docs/appearance/structured-data/article) and [BreadcrumbList](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb). Implemented fields follow those documented features where applicable to the actual content.

Schema.org [RealEstateListing](https://schema.org/RealEstateListing), [House](https://schema.org/House), Apartment/Accommodation/Place and collection markup describe content semantically. They are **not** a claim of Google property rich-result or carousel eligibility. [Google vacation-rental markup](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental) has separate business/integration requirements; no evidence justifies applying it to these monthly rental/sale listings.

Google Rich Results Test and Schema.org's hosted validator were NOT executed against an undeployed site. Local automated JSON parsing, expected schema fields/types, source-to-visible-content mapping, escaping, missing/invalid values, unique entities, canonical URLs and HTTP/navigation tests were executed. After deploying through the normal approved pipeline, the optional hosted tools can be run on public example URLs. Their output and actual Google indexing/display remain NOT VERIFIED; valid markup does not guarantee a rich result.

## Repeatable checks and release

From Frontend:

```powershell
npm.cmd run test:seo
npm.cmd run test:e2e -- tests/structured-data.spec.ts tests/rendering.spec.ts tests/seo.spec.ts tests/dynamic-seo.spec.ts tests/technical-seo.spec.ts tests/blogs.spec.ts tests/properties.spec.ts tests/rent.spec.ts tests/search.spec.ts tests/navigation-loading.spec.ts tests/auth.spec.ts
node node_modules/typescript/bin/tsc --noEmit
npm.cmd run build
```

Backend remains unchanged in this phase; `npm.cmd test` and `npm.cmd run build` were still run to check regressions. Desktop/mobile tests use synthetic public data, never a production database or real credentials.

Deploy using the existing frontend pipeline/API configuration. No new environment variables, migrations, services, SEO server, backend endpoints or future phase are required. No deployment or production data changes were performed. Physical Safari/iOS/Android and live deployment remain NOT VERIFIED.


## Verification result — 2026-10-30

- PASS: frontend production build (75 generated entries), backend syntax build (110 modules), strict TypeScript and git diff checks.
- PASS: 47 metadata/schema unit tests, including escaping, domain/canonical rules, missing/invalid fields, real property type/unit mapping, published-only articles, absent invented attributes and displayed-item counts.
- PASS: 106 unchanged-backend tests.
- PASS: 16 new desktop/mobile structured-data browser checks + 108 existing auth, publishing, gallery, rental/filter/search/navigation, raw-HTML/no-JavaScript, metadata, sitemap and crawl-control checks (124 browser cases).
- Actual raw JSON-LD parsed without errors. Entity definitions/IDs, visible breadcrumbs, real facts, optional publication data, existing internal route responses, filter updates and removal of old page entities during client navigation verified. No observed hydration/runtime regressions in those checks.
- NOT VERIFIED: hosted Google Rich Results Test/Schema.org validator, live deployment/indexing, physical Safari/iOS/Android hardware. Automated local validation does not claim Google feature display.
- No production data changes, backend changes, dependency additions/upgrades, deployment or later phase work performed.

Phase file list and test evidence: D:/Desktop/Rent/.task/structured-data. Existing unrelated/uncommitted changes from earlier phases were preserved.
