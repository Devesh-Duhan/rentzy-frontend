"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    let savedTheme;
    try { savedTheme = localStorage.getItem("theme"); } catch {}
    const nextTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    try { localStorage.setItem("theme", nextTheme); } catch {}
  }, [theme]);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  // Keep the same tree during hydration so pages, forms and queries do not remount.
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
