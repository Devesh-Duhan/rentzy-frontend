// UX/session-storage helpers only. The backend verifies JWT signatures and roles.
const configuredAge = (process.env.NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS ?? '604800').trim();
const sessionMaxAgeSeconds = Number(configuredAge);
if (!/^[1-9]\d*$/.test(configuredAge) || !Number.isSafeInteger(sessionMaxAgeSeconds) || sessionMaxAgeSeconds > 2147483647) {
  throw new Error('NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS must be a positive whole number of seconds (maximum 2147483647).');
}
export const SESSION_MAX_AGE_SECONDS = sessionMaxAgeSeconds;
export const SESSION_CHANGE_EVENT = 'rentzy:session-change';

// Clamp long waits so a configurable duration cannot overflow browser timers.
export const getSessionCheckDelay = (expiresAt, now = Date.now()) => Math.min(2147483647, Math.max(1, expiresAt - now));

export function decodeSessionToken(token) {
  try {
    if (typeof token !== 'string' || token.split('.').length !== 3) return null;
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload + '='.repeat((4 - payload.length % 4) % 4)));
    return claims && typeof claims === 'object' && !Array.isArray(claims) ? claims : null;
  } catch { return null; }
}

export function getSessionExpiresAt(token) {
  const claims = decodeSessionToken(token);
  if (!Number.isFinite(claims?.iat) || !Number.isFinite(claims?.exp) || claims.iat <= 0 || claims.exp <= claims.iat) return 0;
  return Math.min(claims.exp, claims.iat + SESSION_MAX_AGE_SECONDS) * 1000;
}

export function clearSession({ notify = true } = {}) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  for (const name of ['token', 'rentzy_token']) document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  if (notify) window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function setSessionToken(token) {
  if (typeof window === 'undefined') return;
  const expiresAt = getSessionExpiresAt(token);
  const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
  if (remaining <= 0) {
    clearSession();
    throw new Error('Session expired. Please login again.');
  }
  localStorage.setItem('token', token);
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = `rentzy_token=${token}; path=/; max-age=${remaining}; expires=${new Date(expiresAt).toUTCString()}; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}
