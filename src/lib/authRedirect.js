// Backend authorization remains authoritative; this only selects a safe landing page.
export function getAuthDestination(user, next) {
  const fallback = user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/seller' : '/';
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(next)) return fallback;
  try {
    const target = new URL(next, 'https://auth.invalid');
    if (target.origin !== 'https://auth.invalid') return fallback;
    const matches = prefix => target.pathname === prefix || target.pathname.startsWith(prefix + '/');
    if (['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'].some(matches)) return fallback;
    if (matches('/admin') && user?.role !== 'admin') return fallback;
    if (['/seller', '/add'].some(matches) && !['seller', 'admin'].includes(user?.role)) return fallback;
    return target.pathname + target.search + target.hash;
  } catch { return fallback; }
}
