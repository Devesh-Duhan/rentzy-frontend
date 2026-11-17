# Public content audit — 2026-11-16

## Outcome

Added visible, page-specific editorial guidance to 14 public static pages that were below 200 words. Existing approved property pages, populated categories and legitimate indexable location results also receive contextual guidance. Content appears after existing listings/forms and before the footer. No property records or blog articles were edited.

Copy is centralized in src/content/page-guides.mjs. PageGuide is a server component composed with the existing shadcn Separator; route components pass its rendered node through their current client shells. Only the selected guide is serialized, rather than shipping every guide in client JavaScript. Existing controls, cards, filters and navigation are retained.

Removed unsupported About-page customer/property/city/savings statistics and an unsupported project-reach claim; replaced them with factual workflow copy. Project registration guidance links to the official Haryana RERA portal and does not claim that site approval certifies ownership or official registration. Existing refund terms are unchanged.

## Verification counts

Main-content words exclude scripts, styles, SVGs, templates and noscript text. The following compares the read-only live baseline with the local production build using isolated fixtures; listing inventory differs, so these are not claimed as identical-data before/after measurements. Each selected guide itself contains over 200 words, independently of inventory.

| Route/template | Live main words before | Local main words after |
| --- | ---: | ---: |
| / | 123 | 776 |
| /rent | 113 | 470 |
| /buy | 57 | 300 |
| /about | 130 | 402 |
| /contact | 151 | 402 |
| /refund-policy | 138 | 392 |
| /safety | 174 | 426 |
| /projects | 67 | 326 |
| /gallery | 51 | 305 |
| /rera | 104 | 375 |
| /tenant-screening | 76 | 337 |
| /mobile-app | 173 | 428 |
| /testimonials | 55 | 310 |
| /whatsapp | 146 | 413 |
| /properties/999999999999999999999999 | Dynamic template | 355 |
| /category/commercial | Dynamic template | 424 |
| /search?city=Hisar&purpose=rent | Dynamic template | 437 |

The 5 live property pages sampled had 109–120 main words. They now use the property template without inventing additional property facts; the new enquiry checklist is clearly separate from the advertiser description. All 5 sampled published blog articles already had 774–1613 main words and were left unchanged. Sell, blog listing, help, privacy and terms already exceeded 200 words in the live sample and were not padded.

## Indexing and rendering fixes

- /refer is account content: authentication, noindex directives and sitemap exclusion replace the former public loading-only page.
- Removed the redundant shared public loading boundary that placed static content inside hidden streaming containers without JavaScript. Query-based comparison retains a scoped fallback; existing data-loading skeletons remain. Auth/dashboard loading boundaries are unchanged.
- Public guidance renders in the anonymous tenant-screening branch as well as the seller view. Seller-only form access remains restricted.
- About entrance transforms no longer hide its initial content or cause no-JavaScript mobile overflow.
- Invalid/private properties and non-indexable arbitrary search results do not receive filler copy. Existing availability, canonical and robots policies remain.

74 unit/regression tests passed. Production build, lint/type checks and all 75 route generations passed with an isolated API. Final Playwright suite: 52 tests passed across desktop Chromium and Pixel 5 Chromium emulation, including 17 raw-HTML content checks per project, no-JavaScript visibility, preserved descriptions, slow-API skeletons, privacy, auth/signup, contact forms, Markdown, hydration, navigation and overflow. Live email/Google-provider delivery, physical devices and other browsers were not tested. No deployment, Git push, environment-file change or production database mutation.

## Editorial limits and next checks

200 words is an audit-tool threshold, not Google's preferred length or a ranking promise. Google explicitly advises against writing to a supposedly preferred word count: [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Owners should continue adding specific, accurate property descriptions; general guidance does not replace missing property facts. Existing operational service claims and legal policy terms require business review separately. The supplied YouTube page could not be retrieved; the Google documentation was consulted directly.

Remaining P2: with JavaScript disabled on a narrow desktop viewport, the Contact page's overall canvas can overflow horizontally. The added guide itself fits the viewport, remains visible and readable, and full-page responsive checks pass with JavaScript enabled. This cosmetic edge case is deferred; the content checks do not claim complete no-JavaScript operation of interactive forms.

After approved frontend deployment, rerun the content audit on the affected live URLs, inspect raw HTML and check Search Console separately. No ranking or indexing success is claimed.

Changed files (44): the public route shells/clients, PageGuide and copy data, referral metadata/crawl/auth rules, and focused tests. Full list: D:/Desktop/Rent/.task/content-depth/changed-files.txt. Logs and raw counts are in the same task directory.

Rollback: restore existing files from D:/Desktop/Rent/.task/content-depth/original, including the deleted src/app/(main)/loading.jsx; remove newly created guide/data/test files rather than restoring intermediate copies of them. Preserve unrelated changes and rebuild the frontend. No deployment was performed.
