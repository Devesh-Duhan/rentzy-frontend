import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { seoApiResponse } from './fixtures/seo-api.mjs';

// SSR requests also use fixture data; no real backend or database is needed.
const api = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  response.setHeader('Content-Type', 'application/json');
  if (request.method !== 'GET') { response.writeHead(405); response.end('{}'); return; }
  const result = seoApiResponse(url);
  response.writeHead(result.status);
  response.end(JSON.stringify(result.body));
});
await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
const apiURL = `http://127.0.0.1:${api.address().port}`;
const child = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'dev', '--hostname', '127.0.0.1', '--port', process.env.PLAYWRIGHT_PORT || '3100'], {
  stdio: 'inherit',
  env: { ...process.env, PLAYWRIGHT_TEST: '1', NEXT_PUBLIC_API_URL: `${apiURL}/api`, NEXT_PUBLIC_BACKEND_URL: apiURL, NEXT_PUBLIC_URL: `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || 3100}` },
});
child.on('error', error => { console.error(error.message); api.close(); process.exitCode = 1; });
child.on('exit', code => { api.close(); process.exitCode = code || 0; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { child.kill(signal); api.close(); });
