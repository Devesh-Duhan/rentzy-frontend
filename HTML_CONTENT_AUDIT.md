# HTML/content audit — 2026-11-16

Inspected actual HTTP HTML, public listing API field sizes, CSS/script delivery and existing Next.js App Router rendering. This is an optimization of confirmed waste, not a promise to clear an arbitrary audit score or improve rankings.

## Changes

- Removed an always-hidden duplicate header navigation block. Visible desktop/mobile navigation remains available; no design change or content added.
- Public listing hydration now serializes only fields consumed by cards, galleries, collection schemas and approval checks. Unused full descriptions, owner objects and unrelated property fields no longer repeat in listing-page HTML. Full property-detail data and backend APIs are unchanged.
- Kept required Next.js RSC/hydration scripts, structured data and the pre-paint theme script. Stylesheets already load externally; no inline style blocks were found on audited live pages.

## Identical-fixture local comparison

Raw UTF-8 HTTP responses in the same Next development mode, with the same synthetic records before and after. Main text and body text are identical. These are not claimed as live production or Lighthouse improvements. Gzip savings are smaller than raw-HTML savings.

| Route | Before bytes | After bytes | Raw reduction | Gzip bytes |
| --- | ---: | ---: | ---: | ---: |
| / | 283751 | 273518 | 3.61% | 21031 → 20705 |
| /rent | 153309 | 147522 | 3.77% | 17639 → 17386 |
| /about | 53178 | 50222 | 5.56% | 10365 → 10212 |
| /blog/published-guide | 70777 | 67824 | 4.17% | 14453 → 14231 |

22 redundant elements were removed on the about/article/listing snapshots; homepage DOM decreased by 24 elements in this capture. No article text, property facts, images, canonical tags or headings were removed.

## Live baseline, before deployment

| Route | HTML bytes | Text/HTML heuristic | RSC script bytes |
| --- | ---: | ---: | ---: |
| / | 95645 | 1.56% | 27127 |
| /rent | 82287 | 1.4% | 20848 |
| /about | 43812 | 3.25% | 13786 |
| /blog | 57194 | 4.52% | 17976 |
| /blog/apartments-near-me-a-guide-to-finding-rental-homes | 66539 | 15.6% | 23913 |

Method: body text excludes script/style/SVG/template/noscript nodes and normalizes whitespace. This heuristic can include responsive CSS-hidden text and is not a reproduction of a specific crawler tool's algorithm. Full raw snapshots and JSON are in D:/Desktop/Rent/.task/html-ratio.

Some pages remain below the tool's 10% threshold. Inventory-led UI and framework payload contribute to that score; removing working hydration or adding filler would harm functionality or content quality. Google recommends useful, reliable content rather than text written to manipulate rankings: [Google guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). RSC payload carries client props and framework rendering information: [Next.js rendering documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## Validation

- 71 renderer, SEO, public-data, branding and auth tests passed serially; added focused checks for listing-field preservation and omission without source mutation.
- Production build passed (75 routes) using an isolated fixture API and .next-playwright output. No production database writes or environment-file edits.
- 20 production-server Playwright checks passed on desktop Chromium and Pixel 5 Chromium emulation: raw HTML, metadata, no-JavaScript content, galleries, refresh, navigation, Markdown, error/404 behavior and responsive overflow. Physical devices/Safari were not tested.
- Initial parallel test/dev runs encountered machine memory exhaustion; final unit tests ran serially and final browser tests used the production server. No hydration/runtime regressions in the final checks.

Changed: src/components/Navbar.jsx, src/seo/property.server.js, new src/lib/listing-card-data.js, tests/property-seo.test.mjs. No backend changes. For regression tests use node --test --test-concurrency=1 tests/*.test.mjs.

Deployment pending. Rebuild/deploy the frontend with its real environment only after approval, then recheck public HTML and the audit-tool report. No Git push or deployment performed. Rollback only these changes using the originals in D:/Desktop/Rent/.task/html-ratio/original; remove the newly added listing-card-data.js only as part of that rollback.
