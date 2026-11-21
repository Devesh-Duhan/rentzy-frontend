"use client";

import { useEffect, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { makeStore } from './index';
import { getUserFromStorage, hydrateSession, reset } from './slices/authSlice';
import { clearSession, getSessionExpiresAt, getSessionCheckDelay, setSessionToken, SESSION_CHANGE_EVENT } from '@/lib/session';

const PRIVATE_PATHS = ['/admin', '/seller', '/add', '/profile', '/wishlist', '/alerts', '/chat', '/notifications', '/become-seller'];
function SessionReady({ children }) {
  const path = usePathname();
  const ready = useSelector(state => state.auth.isHydrated);
  const privatePage = PRIVATE_PATHS.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
  if (privatePage && !ready) return <div role="status" className="flex min-h-[60vh] items-center justify-center pt-20 text-sm text-slate-500">Loading your account…</div>;
  return children;
}
export default function StoreProvider({ children }) {
  const [store] = useState(makeStore);
  // Streamed boundaries hydrate against the same anonymous state as the server.
  const [serverState] = useState(() => store.getState());
  useEffect(() => {
    let timer, lastSession;
    const syncSession = () => {
      clearTimeout(timer);
      let token = null, user = null;
      try { token = localStorage.getItem('token'); if (token) user = getUserFromStorage(); } catch {}
      const expiresAt = getSessionExpiresAt(token);
      if (token && expiresAt <= Date.now()) {
        clearSession({ notify: false });
        store.dispatch(hydrateSession(null));
        store.dispatch(reset());
        if (!/^\/(login|register|verify-otp|forgot-password|reset-password)(\/|$)/.test(window.location.pathname)) {
          // A fresh document also drops cached private page data.
          window.location.replace('/login?reason=session-expired');
        }
        return;
      }
      const snapshot = JSON.stringify([token, user]);
      if (snapshot !== lastSession) {
        store.dispatch(hydrateSession(user));
        lastSession = snapshot;
      }
      if (token) timer = setTimeout(syncSession, getSessionCheckDelay(expiresAt));
    };
    const onStorage = event => { if (event.key === null || ['token', 'user'].includes(event.key)) syncSession(); };
    const onVisible = () => { if (!document.hidden) syncSession(); };
    // Shorten a legacy cookie to the remaining absolute lifetime; never extend it.
    try {
      const token = localStorage.getItem('token');
      if (token && getSessionExpiresAt(token) > Date.now()) setSessionToken(token);
    } catch {}
    syncSession();
    window.addEventListener(SESSION_CHANGE_EVENT, syncSession);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', syncSession);
    window.addEventListener('pageshow', syncSession);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(SESSION_CHANGE_EVENT, syncSession);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', syncSession);
      window.removeEventListener('pageshow', syncSession);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [store]);
  return <Provider store={store} serverState={serverState}><SessionReady>{children}</SessionReady></Provider>;
}
