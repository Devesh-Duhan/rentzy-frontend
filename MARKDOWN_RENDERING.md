# Blog Markdown rendering

Reference reviewed: [Markdown-Viewer](https://github.com/ThisIs-Developer/Markdown-Viewer), commit `d7b51b4b42010168d5ef15c0a8576ff37127668c`. Analysis clone: `D:/Desktop/Rent/.task/references/Markdown-Viewer` (outside the application repository).

`src/components/markdown/MarkdownViewer.jsx` uses the reference's Marked, DOMPurify, highlight.js and GitHub Markdown CSS stack. This is an original React integration of that approach; the reference editor/PWA/export features are not imported. `isomorphic-dompurify` provides server rendering on the existing Node 22.19 runtime.

Use `<MarkdownViewer content={markdown} />`; pass `headingOffset={1}` below an existing article H1. Storage is unchanged. Plain-text articles still render as paragraphs. No backend changes or database migrations.

Supports GitHub-flavored headings, emphasis, lists, tables, tasks, links, images, blockquotes and fenced code. Common known languages receive highlighting; unknown languages and fences over 50,000 characters render escaped text. Math, diagrams and editor extensions are outside this feature.

HTML is sanitized after parsing/highlighting on both server and browser. Active embeds, executable URLs, event handlers, styles and clobbering IDs/names are removed. No CDN scripts or remote rendering service. Server-rendered text, SEO, publication checks and canonical URLs remain intact. Viewer-scoped styles support responsive overflow and the app's dark theme.

Verify: `npm run test:markdown`, `npm run test:seo`, `npx playwright test tests/markdown.spec.ts tests/blogs.spec.ts --workers=1`, `npm run build`. Browser tests use isolated API fixtures; no production records are modified. Check a published article with Markdown at `/blog/<slug>` after deployment.

## Verification — 2026-11-16

- Renderer/security unit tests: 7 passed. Existing SEO tests: 53 passed. Authentication/branding checks: 9 passed.
- Production-mode build: passed (76 routes), using the isolated fixture API and separate .next-playwright output. TypeScript and git diff whitespace checks passed. No environment files changed.
- Production-build Playwright checks: 26 passed on desktop Chromium and Pixel 5 Chromium emulation, including publishing/drafts, initial HTML, no-JavaScript content, sanitization, tables, highlighting, themes, refresh, navigation and overflow. No hydration/runtime errors detected. Physical devices and Safari were not tested.
- Dependency tree resolves without peer conflicts. npm audit reports 8 existing runtime findings, including a critical advisory in Next.js 15.5.27 and a high advisory in follow-redirects. No Markdown dependency was listed. Existing unrelated packages were not upgraded.
- No deployment, Git push or real database mutations performed. Test logs remain under D:/Desktop/Rent/.task/markdown.
