"use client";

import { useEffect, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { makeStore } from './index';
import { getUserFromStorage, hydrateSession } from './slices/authSlice';

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
  // Streamed boundaries must hydrate against the same anonymous state as the server.
  const [serverState] = useState(() => store.getState());
  useEffect(() => {
    let user = null;
    try { if (localStorage.getItem('token')) user = getUserFromStorage(); } catch {}
    store.dispatch(hydrateSession(user));
  }, [store]);
  return <Provider store={store} serverState={serverState}><SessionReady>{children}</SessionReady></Provider>;
}
