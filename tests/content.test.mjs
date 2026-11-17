import test from 'node:test';
import assert from 'node:assert/strict';
import { PAGE_GUIDES } from '../src/content/page-guides.mjs';
import { PAGE_SEO } from '../src/seo/seo.constants.js';
import { CRAWL } from '../src/seo/crawl.constants.mjs';

test('existing public page guides contain more than 200 meaningful words without inventory dependency', () => {
  assert.equal(Object.keys(PAGE_GUIDES).length, 17);
  for (const [page, guide] of Object.entries(PAGE_GUIDES)) {
    const text = [guide.title, ...guide.sections.flat()].join(' ');
    const words = text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || [];
    assert.ok(words.length > 200, `${page}: ${words.length}`);
    assert.equal(guide.sections.length, 3);
    assert.equal(new Set(guide.sections.map(([heading]) => heading)).size, 3);
  }
});

test('guides have distinct copy and use real public resource paths', () => {
  const titles = new Set(), paragraphs = new Set();
  for (const guide of Object.values(PAGE_GUIDES)) {
    assert.ok(!titles.has(guide.title)); titles.add(guide.title);
    for (const [, text] of guide.sections) { assert.ok(!paragraphs.has(text)); paragraphs.add(text); }
    for (const [, href] of guide.links) {
      assert.ok(PAGE_SEO[href] || href === 'https://haryanarera.gov.in/', href);
      if (PAGE_SEO[href]) assert.notEqual(PAGE_SEO[href].robots?.index, false);
    }
  }
});

test('account-only referral content is excluded from public indexing and sitemap', () => {
  assert.equal(PAGE_SEO['/refer'].robots.index, false);
  assert.equal(PAGE_SEO['/refer'].sitemap, false);
  assert.ok(CRAWL.privatePaths.includes('/refer'));
});
