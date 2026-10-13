"use client";

import { useEffect, useRef } from "react";

// Keep-Alive Component
// Pings the backend every 14 minutes to prevent server cold starts on Render/Railway/Heroku
// Place this in root layout to run on every page

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes (Render sleeps after 15)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function KeepAlive() {
  const intervalRef = useRef(null);
  const lastPingRef = useRef(null);

  const pingServer = async () => {
    // Don't ping if tab is hidden (save resources)
    if (typeof document !== "undefined" && document.hidden) return;

    try {
      const res = await fetch(`${BACKEND_URL}/ping`, {
        method: "GET",
        cache: "no-store",
      });
      if (res.ok) {
        lastPingRef.current = new Date().toISOString();
        // Silent success - no console noise in production
        if (process.env.NODE_ENV === "development") {
          console.log(`[KeepAlive] ✅ Server pinged at ${lastPingRef.current}`);
        }
      }
    } catch {
      // Silent fail - don't show errors to user for background pings
      if (process.env.NODE_ENV === "development") {
        console.warn("[KeepAlive] ⚠️ Ping failed - server may be sleeping");
      }
    }
  };

  useEffect(() => {
    // Ping immediately when app loads (warm up server)
    pingServer();

    // Then ping every 14 minutes
    intervalRef.current = setInterval(pingServer, PING_INTERVAL_MS);

    // Also ping when user comes back to the tab after being away
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        const lastPing = lastPingRef.current ? new Date(lastPingRef.current).getTime() : 0;
        // If it's been more than 5 minutes since last ping, ping now
        if (now - lastPing > 5 * 60 * 1000) {
          pingServer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Renders nothing — purely background behavior
  return null;
}
