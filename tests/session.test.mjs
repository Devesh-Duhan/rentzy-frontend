import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
process.env.NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS = '604800';
const { SESSION_MAX_AGE_SECONDS, getSessionCheckDelay, getSessionExpiresAt, setSessionToken, clearSession, SESSION_CHANGE_EVENT } = await import('../src/lib/session.js');

const now = 1800000000000;
const iat = now / 1000;
const token = claims => 'test.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.test';
afterEach(() => mock.timers.reset());

test('all roles use a seven-day absolute cap, including legacy 30-day tokens', () => {
  assert.equal(SESSION_MAX_AGE_SECONDS, 604800);
  for (const role of ['buyer', 'seller', 'admin']) {
    assert.equal(getSessionExpiresAt(token({ role, iat, exp: iat + 30 * 86400 })), now + SESSION_MAX_AGE_SECONDS * 1000);
    assert.equal(getSessionExpiresAt(token({ role, iat, exp: iat + 60 })), now + 60000);
  }
});

test('malformed or non-expiring browser sessions cannot be restored', () => {
  for (const value of [null, '', 'invalid', 'test.invalid.test', token([]), token({ iat }), token({ exp: iat + 60 }), token({ iat: 'invalid', exp: iat + 60 }), token({ iat, exp: iat })]) assert.equal(getSessionExpiresAt(value), 0);
});

test('cookies mirror remaining lifetime and clearing removes only session storage/cookies', () => {
  mock.timers.enable({ apis: ['Date'], now: now + 6 * 86400 * 1000 });
  const values = new Map([['theme', 'dark'], ['user', '{}']]), cookies = [], events = [];
  const originals = Object.fromEntries(['window', 'document', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: { location: { protocol: 'https:' }, dispatchEvent: event => events.push(event.type) } },
    document: { configurable: true, value: { set cookie(value) { cookies.push(value); } } },
    localStorage: { configurable: true, value: { setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } },
  });
  try {
    const session = token({ iat, exp: iat + 30 * 86400 });
    setSessionToken(session);
    assert.equal(values.get('token'), session);
    assert.match(cookies.at(-1), /max-age=86400;/);
    assert.match(cookies.at(-1), /; Secure$/);
    assert.equal(events.at(-1), SESSION_CHANGE_EVENT);
    mock.timers.setTime(now + SESSION_MAX_AGE_SECONDS * 1000);
    assert.throws(() => setSessionToken(session), /Session expired/);
    assert.equal(values.has('token'), false);
    assert.equal(values.has('user'), false);
    assert.equal(values.get('theme'), 'dark');
    clearSession({ notify: false });
    assert.match(cookies.at(-1), /^rentzy_token=; path=\/; max-age=0;/);
  } finally {
    for (const key of Object.keys(originals)) {
      if (originals[key]) Object.defineProperty(globalThis, key, originals[key]);
      else delete globalThis[key];
    }
  }
});

test('public env values configure expiry and reject invalid settings', () => {
  const script = "import {SESSION_MAX_AGE_SECONDS,getSessionExpiresAt} from './src/lib/session.js'; const iat=1800000000; const token='test.'+Buffer.from(JSON.stringify({iat,exp:iat+90*86400})).toString('base64url')+'.test'; console.log(JSON.stringify({seconds:SESSION_MAX_AGE_SECONDS,lifetime:getSessionExpiresAt(token)/1000-iat}));";
  for (const seconds of ['3600', '2592000']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd: new URL('..', import.meta.url), env: { ...process.env, NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS: seconds }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), { seconds: Number(seconds), lifetime: Number(seconds) });
  }
  for (const invalid of ['', '0', '-1', '1.5', 'seven', '2147483648']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd: new URL('..', import.meta.url), env: { ...process.env, NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS: invalid }, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS must be a positive whole number/);
  }
});

test('long browser sessions use bounded waits without losing their actual expiry', () => {
  assert.equal(getSessionCheckDelay(now + 30 * 86400 * 1000, now), 2147483647);
  assert.equal(getSessionCheckDelay(now + 3600000, now), 3600000);
  assert.equal(getSessionCheckDelay(now, now), 1);
});
