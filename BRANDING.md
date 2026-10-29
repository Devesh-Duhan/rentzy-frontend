# Phase 3 — brand assets, favicon and manifest

All original image files are preserved. No logos, resized variants or splash screens were generated.

## Approved assets

| Use | Existing asset | Verified size |
| --- | --- | --- |
| Browser favicon | `/favicon.ico` | ICO frames: 16×16, 32×32, 48×48 |
| Navbar, auth and dashboard logos | content-hashed import of `/images/logo.png` | 180×180 |
| Apple touch icon | `/images/apple-touch-icon.png` | 180×180 |
| Manifest icons | `/images/android-chrome-192x192.png`, `/images/android-chrome-512x512.png` | 192×192, 512×512 |
| Default social/organization image | `/images/android-chrome-512x512.png` | 512×512 |

The PNG touch icon and logo contain the same original bytes. All assets show the same existing house/location brand. Existing 16/32px PNG favicons remain available, but the head uses one ICO reference rather than conflicting alternate favicons. The unused `/icon.svg` placeholder and unrelated photos remain untouched.

`src/lib/brand.js` centralizes asset references, actual icon sizes and existing theme/display values. Site name and description continue to come from the existing SEO constants.

## Behavior

- `/favicon.ico` is served directly from `public/favicon.ico`, without the old rewrite to a PNG. Native root metadata emits one `rel="icon"` with `image/x-icon` and one Apple touch icon. The old `/favicon` URL redirects to `/favicon.ico` for compatibility.
- Native `/manifest.webmanifest` contains name, short_name, description, start_url, scope, display, theme_color, background_color and the real 192/512px PNG icons. Icon purpose is `any`; no maskable/splash capability is claimed.
- The broken duplicate `public/site.webmanifest` was removed. Its URL redirects permanently to `/manifest.webmanifest`, keeping one manifest implementation.
- The existing `BrandLogo` component, its accessible alt text, dimensions, aspect ratio and usage in navbar/auth/admin/seller positions are unchanged. Footer branding is text, so its layout/wordmark is preserved.
- Existing purple toolbar/theme and white manifest background are preserved. The HTML theme color now uses native viewport metadata once.
- Existing service worker support remains in place. Its cache version is bumped; only stable brand/manifest URLs use network-first with existing offline fallback, preventing old cached PNG responses from hiding the corrected ICO. Immutable chunks and API/private-route bypass remain unchanged. This does not claim full PWA functionality or add installation flows.

## Verification

From `Frontend`:

```powershell
npm.cmd run test:branding
npm.cmd run test:seo
npm.cmd run test:e2e -- tests/branding.spec.ts
npx.cmd tsc --noEmit
npm.cmd run build
```

Direct browser checks: `/favicon.ico`, `/manifest.webmanifest`, `/images/apple-touch-icon.png`, and both manifest PNG URLs. `/favicon` and `/site.webmanifest` retain redirects to the canonical assets.

Tests cover original ICO bytes and MIME, real PNG dimensions/decoding, valid manifest references, one effective favicon/manifest, accessible logos, footer wordmark, dark/light rendering, mobile/desktop overflow, client navigation, hard reload, and actual Chromium service-worker stale-cache/offline icon behavior. Metadata regression suites cover the changed social-image default.

Production verification uses the existing isolated `.next-playwright` build output and a synthetic API. No backend, database or deployment changes are needed. Physical Apple/Android home-screen installation and live-domain/browser-tab cache refresh are NOT VERIFIED. No later phase was started.
