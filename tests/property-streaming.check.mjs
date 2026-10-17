import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { Writable } from 'node:stream';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToPipeableStream } = require('react-dom/server');
const ts = require('typescript');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function load(file) {
  const source = readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  const localRequire = name => {
    if (name === 'next/navigation') return { notFound() { throw new Error('NEXT_NOT_FOUND'); } };
    if (name === 'next/link') return { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
    if (name === './PropertyDetailClient') return { __esModule: true, default: ({ initialData }) => React.createElement('h1', null, initialData.title) };
    if (name === './PropertyLoading') return load(resolve(dirname(file), 'PropertyLoading.jsx'));
    if (name === '@/components/ContentSkeleton') return load(resolve(root, 'src/components/ContentSkeleton.jsx'));
    return require(name);
  };
  runInNewContext(output, { module: compiledModule, exports: compiledModule.exports, require: localRequire, process, AbortSignal, fetch: (...args) => globalThis.fetch(...args) }, { filename: file });
  return compiledModule.exports;
}

test('property details stream their real loading shell before the backend responds', { timeout: 10000 }, async () => {
  const originalFetch = globalThis.fetch;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let calls = 0;
  globalThis.fetch = async () => { calls++; await gate; return { status: 200, ok: true, json: async () => ({ title: 'Streamed property', description: 'Test details' }) }; };
  let stream;
  try {
    const route = load(resolve(root, 'src/app/(main)/properties/[id]/page.jsx'));
    const page = await route.default({ params: Promise.resolve({ id: 'a'.repeat(24) }) });
    let html = '', firstWrite;
    const firstChunk = new Promise(resolve => { firstWrite = resolve; });
    const sink = new Writable({ write(chunk, _encoding, next) { html += chunk.toString(); firstWrite(); next(); } });
    const finished = new Promise((resolve, reject) => { sink.on('finish', resolve); sink.on('error', reject); });
    const shellReady = new Promise((resolve, reject) => {
      stream = renderToPipeableStream(React.createElement('html', null, React.createElement('body', null, React.createElement('nav', null, 'Site navigation'), page)), { onShellReady() { stream.pipe(sink); resolve(); }, onError: reject });
    });
    await shellReady;
    await firstChunk;
    assert.match(html, /Back to properties/);
    assert.match(html, /Loading property details/);
    assert.doesNotMatch(html, /Streamed property/);
    assert.equal(calls, 1);
    release();
    await finished;
    assert.match(html, /Streamed property/);
    const metadata = await route.generateMetadata({ params: Promise.resolve({ id: 'a'.repeat(24) }) });
    assert.equal(metadata.title, 'Streamed property | RentzyPro');
    assert.equal(metadata.description, 'Test details');
  } finally { release(); stream?.abort(); globalThis.fetch = originalFetch; }
});

test('invalid property IDs still return not found without a backend call', async () => {
  const route = load(resolve(root, 'src/app/(main)/properties/[id]/page.jsx'));
  await assert.rejects(route.default({ params: Promise.resolve({ id: 'invalid' }) }), /NEXT_NOT_FOUND/);
});
