'use client';
import { useEffect } from "react";

/**
 * Registers the service worker in production only.
 *
 * In development the service worker is actively harmful: a cache-first SW serves
 * stale HTML + stale /_next/static chunks on a normal refresh, so code changes
 * appear not to apply until you hard-reload (Ctrl+Shift+R). It also mixes
 * mismatched HTML/JS pairs, which produces React hydration errors.
 *
 * So in dev we skip registration entirely and unregister/clear anything a
 * previous run installed.
 */
export default function PWAProvider({ children }) {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const clearStale = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    };

    if (process.env.NODE_ENV === "development") {
      clearStale();
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed — app still works without it.
      });
    };

    // `load` may already have fired by the time this effect runs.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return children;
}
