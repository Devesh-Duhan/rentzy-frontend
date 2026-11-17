import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { renderMarkdown } from '../src/lib/markdown.js';

const parse = (text, options) => new JSDOM(renderMarkdown(text, options)).window.document.body;

test('renders headings, emphasis, links, paragraphs and lists', () => {
  const body = parse('# Rental guide\n\n**Compare** *homes* and ~~old~~ offers.\nNext line.\n\n- One\n- Two\n\n1. Visit\n2. Decide\n\n[Rentals](/rent)\n\n> Check the details.');
  assert.equal(body.querySelector('h1').textContent, 'Rental guide');
  assert.equal(body.querySelector('strong').textContent, 'Compare');
  assert.equal(body.querySelector('em').textContent, 'homes');
  assert.equal(body.querySelector('del').textContent, 'old');
  assert.ok(body.querySelector('br'));
  assert.equal(body.querySelectorAll('ul li').length, 2);
  assert.equal(body.querySelectorAll('ol li').length, 2);
  assert.equal(body.querySelector('a').getAttribute('href'), '/rent');
  assert.ok(body.querySelector('blockquote'));
});

test('supports tables, disabled task checkboxes and lazy images with alt text', () => {
  const body = parse('| Home | Rent |\n| --- | ---: |\n| Flat | 12000 |\n\n- [x] Visit\n- [ ] Decide\n\n![Rental home](/images/logo.png)');
  assert.equal(body.querySelectorAll('th').length, 2);
  assert.equal(body.querySelector('td').textContent, 'Flat');
  assert.equal(body.querySelectorAll('input[disabled]').length, 2);
  assert.equal(body.querySelectorAll('input[checked]').length, 1);
  assert.equal(body.querySelector('img').alt, 'Rental home');
  assert.equal(body.querySelector('img').getAttribute('loading'), 'lazy');
});

test('highlights known code, escapes unknown code and bounds highlighting work', () => {
  const body = parse('```js\nconst price = 12000;\n```\n\n```unknown\n<script>alert("test")</script>\n```');
  assert.ok(body.querySelector('code.language-js .hljs-keyword'));
  assert.equal(body.querySelector('code.language-plaintext').textContent, '<script>alert("test")</script>');
  assert.equal(body.querySelectorAll('script').length, 0);
  const large = parse('```js\n' + 'a'.repeat(50_001) + '\n```');
  assert.equal(large.querySelector('code').textContent.length, 50_001);
  assert.equal(large.querySelectorAll('code span').length, 0);
});

test('sanitizes HTML, URLs, event handlers, styles and clobbering attributes', () => {
  const body = parse('<script>alert(1)</script>\n\n<iframe src="https://example.test"></iframe><form><button>Send</button></form>\n\n<img src="x" onerror="alert(1)" style="position:fixed" id="location" name="cookie">\n\n<a href="javascript:alert(1)">Unsafe</a> <a href="data:text/html,evil">Data link</a>\n\n<svg onload="alert(1)"><a href="javascript:alert(2)">SVG</a></svg>');
  assert.equal(body.querySelectorAll('script,iframe,form,button,svg,math,style').length, 0);
  assert.equal(body.querySelectorAll('[onerror],[onload],[style],[id],[name]').length, 0);
  for (const link of body.querySelectorAll('a')) assert.equal(link.getAttribute('href'), null);
});

test('rejects SVG data images and preserves safe URLs and raster data images', () => {
  const body = parse('<img alt="svg" src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="><img alt="png" src="data:image/png;base64,aGVsbG8=">\n\n[Email](mailto:hello@example.test) [Call](tel:1234567890) [Website](https://example.test)');
  assert.equal(body.querySelector('img[alt="svg"]').getAttribute('src'), null);
  assert.equal(body.querySelector('img[alt="png"]').getAttribute('src'), 'data:image/png;base64,aGVsbG8=');
  assert.equal(body.querySelectorAll('a[href]').length, 3);
});

test('heading offsets keep the article H1 unique without leaking parser options', () => {
  const source = '# Intro\n\n## Details\n\n###### End';
  const shifted = parse(source, { headingOffset: 1 });
  assert.equal(shifted.querySelectorAll('h1').length, 0);
  assert.equal(shifted.querySelector('h2').textContent, 'Intro');
  assert.equal(shifted.querySelector('h3').textContent, 'Details');
  assert.equal(shifted.querySelector('h6').textContent, 'End');
  assert.ok(parse(source).querySelector('h1'));
  assert.ok(parse(source, { headingOffset: NaN }).querySelector('h1'));
});

test('preserves old plain-text paragraphs and deterministic, safe empty output', () => {
  const source = 'First paragraph.\n\nSecond paragraph & more.';
  assert.equal(parse(source).querySelectorAll('p').length, 2);
  assert.equal(renderMarkdown(source), renderMarkdown(source));
  for (const value of [null, undefined, 42, {}, '', '  ']) assert.equal(renderMarkdown(value), '');
});
