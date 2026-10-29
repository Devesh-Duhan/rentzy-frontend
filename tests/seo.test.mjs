import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_SEO, PAGE_SEO, buildMetadata, pageMetadata, canonicalUrl, dashboardMetadata, dynamicMetadata, metadataText } from '../src/seo/index.js';

test('production canonical URLs exclude queries, fragments, preview hosts and trailing slashes', () => {
  for (const value of ['/rent?city=Hisar#results', 'https://preview.example/rent/?utm_source=ad', '/rent//']) {
    assert.equal(canonicalUrl(value), 'https://rentzypro.com/rent');
  }
  assert.equal(canonicalUrl('/'), SITE_SEO.baseUrl);
  assert.equal(canonicalUrl('javascript:alert(1)'), SITE_SEO.baseUrl);
  assert.equal(pageMetadata('/rent?city=Hisar').alternates.canonical, canonicalUrl('/rent'));
});

test('every configured page has unique copy, canonical and complete social metadata', () => {
  const descriptions = new Set();
  for (const [route, config] of Object.entries(PAGE_SEO)) {
    const data = pageMetadata(route);
    assert.equal(data.alternates.canonical, canonicalUrl(route));
    assert.equal(data.openGraph.url, data.alternates.canonical);
    assert.equal(data.description, config.description);
    assert.ok(!descriptions.has(data.description), `Duplicate description: ${route}`);
    descriptions.add(data.description);
    assert.ok(data.title.absolute.includes(SITE_SEO.name));
    assert.equal(data.openGraph.siteName, SITE_SEO.name);
    assert.equal(data.twitter.title, data.title.absolute);
    assert.equal(data.openGraph.images[0].url, `${SITE_SEO.baseUrl}/images/logo.png`);
    assert.equal(data.twitter.card, 'summary_large_image');
  }
});

test('login and registration indexable; account and recovery routes noindex', () => {
  for (const route of ['/login', '/register']) assert.equal(pageMetadata(route).robots.index, true);
  for (const route of ['/profile', '/chat', '/wishlist', '/alerts', '/notifications/preferences', '/become-seller', '/verify-otp', '/reset-password', '/forgot-password']) {
    assert.equal(pageMetadata(route).robots.index, false, route);
    assert.equal(PAGE_SEO[route].sitemap, false);
  }
  assert.equal(dashboardMetadata().robots.index, false);
  assert.equal(dashboardMetadata().alternates, undefined, 'Do not inherit a homepage canonical into private routes');
});

test('HTML/entity and invalid Unicode metadata values are handled as text', () => {
  assert.equal(metadataText('<p>Homes &amp; rentals &#x1F3E0; &quot;Hisar&quot;</p>'), 'Homes & rentals 🏠 "Hisar"');
  assert.equal(metadataText('&#999999999; &#xD800;'), '');
  const data = buildMetadata({ title: 'Homes &amp; <b>rentals</b>', description: '&lt;script&gt;alert(1)&lt;/script&gt; &amp; details' });
  assert.equal(data.title.absolute, 'Homes & rentals | RentzyPro');
  assert.equal(data.description, 'alert(1) & details');
  assert.equal(data.title.template, undefined);
});

test('social overrides and images are normalized without losing defaults', () => {
  const data = buildMetadata({ title: 'Listing', description: 'Details', canonical: '/properties', type: 'article', image: 'javascript:alert(1)', keywords: ['Hisar'], openGraph: { title: 'Share &amp; read', images: [{ url: '/images/logo.png', alt: 'Brand &amp; mark' }] }, twitter: { card: 'summary', title: 'Read this' } });
  assert.equal(data.openGraph.title, 'Share & read');
  assert.equal(data.openGraph.images[0].alt, 'Brand & mark');
  assert.equal(data.openGraph.type, 'article');
  assert.equal(data.twitter.card, 'summary');
  assert.equal(data.twitter.title, 'Read this');
  assert.deepEqual(data.keywords, ['Hisar']);
  assert.equal(data.twitter.images[0].url, `${SITE_SEO.baseUrl}/images/logo.png`);
});

test('dynamic routes preserve their own canonical and existing listing information', () => {
  const data = dynamicMetadata('property', '/properties/123?utm=x', { title: 'Owner &amp; home', image: 'https://images.example/home.webp' });
  assert.equal(data.title.absolute, 'Owner & home | RentzyPro');
  assert.equal(data.alternates.canonical, 'https://rentzypro.com/properties/123');
  assert.equal(data.twitter.images[0].url, 'https://images.example/home.webp');
  assert.throws(() => pageMetadata('/missing'));
  assert.throws(() => dynamicMetadata('missing', '/missing'));
});

test('every existing static route has a native metadata integration and central configuration', () => {
  const app = fileURLToPath(new URL('../src/app/', import.meta.url));
  function walk(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'page.jsx') {
        const relative = path.relative(app, full).replaceAll('\\', '/');
        if (relative.startsWith('(dashboard)/') || relative.includes('[')) continue;
        const route = '/' + relative.split('/').filter(part => !part.startsWith('(') && part !== 'page.jsx').join('/');
        assert.ok(PAGE_SEO[route], `Missing config: ${route}`);
        const source = fs.readFileSync(full, 'utf8');
        assert.ok(source.includes(`pageMetadata('${route}')`), `Missing native metadata: ${route}`);
        assert.ok(!source.startsWith('"use client"'));
      }
    }
  }
  walk(app);
  assert.ok(fs.readFileSync(path.join(app, '(dashboard)/layout.jsx'), 'utf8').includes('dashboardMetadata()'));
  assert.equal(fs.existsSync(new URL('../public/robots.txt', import.meta.url)), false, 'Only one robots.txt implementation');
});
