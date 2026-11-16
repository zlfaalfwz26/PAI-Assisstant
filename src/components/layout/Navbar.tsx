"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NAV_ITEMS, isActivePath } from "./nav-items";
import styles from "./Navbar.module.css";

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const onAssistant = isActivePath(pathname, "/assistant");

  // Tutup menu saat berpindah halaman.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header className={styles.header} data-scrolled={scrolled || open ? "true" : "false"}>
      <nav className={`container ${styles.bar}`} aria-label="Navigasi utama">
        <Logo />

        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  data-active={active ? "true" : "false"}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <ThemeToggle />
          {!onAssistant && (
            <Link href="/assistant" className={`btn btn-primary btn-sm ${styles.cta}`}>
              <MessageCircle size={17} strokeWidth={2.2} aria-hidden="true" />
              Mulai Bertanya
            </Link>
          )}
          <button
            ref={toggleRef}
            type="button"
            className={`icon-btn ${styles.menuBtn}`}
            aria-expanded={open}
            aria-controls="menu-seluler"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div id="menu-seluler" ref={panelRef} className={styles.panel} data-open={open ? "true" : "false"} hidden={!open}>
        <ul className="container">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.panelLink}
                  data-active={active ? "true" : "false"}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          {!onAssistant && (
            <li className={styles.panelCta}>
              <Link href="/assistant" className="btn btn-primary" onClick={() => setOpen(false)}>
                <MessageCircle size={18} strokeWidth={2.2} aria-hidden="true" />
                Mulai Bertanya
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
