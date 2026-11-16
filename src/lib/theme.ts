import { siteConfig } from "@/config/site";

export type ResolvedTheme = "light" | "dark";

/** Kunci localStorage untuk preferensi tema pengunjung. */
export const THEME_STORAGE_KEY = "pai-theme";

/**
 * Skrip kecil yang dijalankan di <head> sebelum halaman dirender,
 * agar tidak ada kilatan tema yang salah (flash of wrong theme).
 * Urutan: preferensi tersimpan → APP_THEME → tema sistem.
 */
export const themeInitScript = `(function(){try{var d=document.documentElement,s=null;try{s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}var c=${JSON.stringify(siteConfig.APP_THEME)};var p=(s==="light"||s==="dark")?s:((c==="light"||c==="dark")?c:"system");var t=p==="system"?(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;d.setAttribute("data-theme",t);d.style.colorScheme=t;}catch(e){}})();`;

export function readStoredTheme(): ResolvedTheme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function systemTheme(): ResolvedTheme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function currentTheme(): ResolvedTheme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function applyTheme(theme: ResolvedTheme, { animate = false } = {}) {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduceMotion) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 420);
  }
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  window.dispatchEvent(new CustomEvent("pai-theme-change", { detail: theme }));
}

export function storeTheme(theme: ResolvedTheme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* localStorage bisa diblokir (mode privat); tema tetap berlaku di sesi ini. */
  }
}
