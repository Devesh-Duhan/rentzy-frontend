# Redirect audit — 2026-11-16

Reviewed Next.js configuration, Vercel configuration, route handlers, auth middleware, client navigation and Express routes. Live checks used HEAD without following redirects or modifying data.

| Permanent alias | Live before deployment | Fixed/verified locally |
| --- | --- | --- |
| Frontend /favicon → /favicon.ico | 307 | 308 (GET and HEAD) |
| Backend /buy → /api/properties?purpose=sell | 302 | 308 (GET and HEAD) |
| Backend /rent → /api/properties?purpose=rent | 302 | 308 (GET and HEAD) |
| Backend /properties/page/:page → /api/properties?page=…&limit=… | 302 | 308 (GET and HEAD, query values preserved) |

Auth/role redirects remain 307 because they depend on the current session; they are not permanent page moves. Existing HTTP→HTTPS, www→non-www, trailing-slash, manifest and canonical blog/category redirects are permanent already. No blanket conversion of login redirects.

Google follows temporary redirects but does not treat them as a permanent canonical change; they are appropriate when the redirect is actually temporary. [Google Search Central guidance](https://developers.google.com/search/docs/crawling-indexing/301-redirects).

Changed: Frontend/src/app/favicon/route.js, Frontend/tests/branding.spec.ts, Backend/server.js, Backend/tests/http.test.js. No environment, data or authentication changes.

Validation: 113 backend tests passed; backend syntax build passed for 110 modules. 62 frontend SEO/branding/auth tests passed. 13 local HTTP checks passed for redirects, asset targets, query preservation and auth behavior. 17 live status checks were recorded. Logs: D:/Desktop/Rent/.task/redirect-audit. Full frontend production build and full browser suite were not rerun; local Next dev compilation encountered machine memory/cache allocation limits, and focused HTTP checks passed after an isolated restart with bounded heap.

Deployment pending: live /favicon and backend aliases still return their old statuses until the corresponding frontend/backend changes are deployed. The live /properties route also still serves the earlier page; its previously implemented local removal/308 rules are pending deployment. No deployment or Git push was performed.

After approved deployment, run curl.exe -I on https://rentzypro.com/favicon and the backend /buy, /rent and /properties/page/2?limit=12 URLs. Expect 308 and the exact Location targets above; /favicon.ico must remain 200. Anonymous /admin and /seller should remain 307 to /login. Confirm login works and authenticated panels retain access controls. Permanent redirects can be cached; verify with uncached HTTP requests.

Rollback: revert only these four files or restore this task's originals from D:/Desktop/Rent/.task/redirect-audit/before, then redeploy the affected services. Preserve unrelated work.
