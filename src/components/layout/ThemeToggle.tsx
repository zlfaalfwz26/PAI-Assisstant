"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  currentTheme,
  readStoredTheme,
  storeTheme,
  systemTheme,
  type ResolvedTheme,
} from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  // Ikon dipilih lewat CSS ([data-theme]) sehingga sudah benar sebelum hidrasi.
  const [theme, setTheme] = useState<ResolvedTheme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());

    const onThemeChange = (event: Event) => setTheme((event as CustomEvent<ResolvedTheme>).detail);
    window.addEventListener("pai-theme-change", onThemeChange);

    // Ikuti tema sistem selama pengunjung belum memilih sendiri.
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (!readStoredTheme()) applyTheme(systemTheme(), { animate: true });
    };
    media?.addEventListener?.("change", onSystemChange);

    // Sinkron antar-tab.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = readStoredTheme() ?? systemTheme();
      applyTheme(next, { animate: true });
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("pai-theme-change", onThemeChange);
      media?.removeEventListener?.("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = () => {
    const next: ResolvedTheme = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next, { animate: true });
    storeTheme(next);
  };

  const label =
    theme === null ? "Ganti tema terang/gelap" : theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap";

  return (
    <button type="button" className={`icon-btn ${styles.toggle}`} onClick={toggle} aria-label={label} title={label}>
      <Sun className={styles.sun} size={19} strokeWidth={2.1} aria-hidden="true" />
      <Moon className={styles.moon} size={18} strokeWidth={2.1} aria-hidden="true" />
    </button>
  );
}
