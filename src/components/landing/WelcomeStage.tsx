"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig, type CharacterExpression } from "@/config/site";
import { Character, type CharacterVariant } from "@/components/characters/Character";
import { pickGreetings, readLastGreeting, storeLastGreeting } from "@/lib/greetings";
import styles from "./WelcomeStage.module.css";

type Greeting = { male: string; female: string };

const SETTLE_DELAY: Record<CharacterVariant, number> = { male: 4200, female: 4800 };

/**
 * Panggung hero: dua karakter penyambut + balon sapaan acak.
 * Sapaan dipilih sekali per pemuatan halaman (di browser), tidak berganti
 * sendiri selama pengunjung membaca.
 */
export function WelcomeStage() {
  const [greeting, setGreeting] = useState<Greeting | null>(null);
  const [expr, setExpr] = useState<Record<CharacterVariant, CharacterExpression>>({
    male: "happy",
    female: "happy",
  });
  const [waveKey, setWaveKey] = useState<Record<CharacterVariant, number>>({ male: 0, female: 0 });
  const timers = useRef<Record<CharacterVariant, number | undefined>>({ male: undefined, female: undefined });
  const lastWave = useRef<Record<CharacterVariant, number>>({ male: 0, female: 0 });
  const charRefs = useRef<Record<CharacterVariant, HTMLDivElement | null>>({ male: null, female: null });

  // 1) Pilih sapaan acak & tenangkan ekspresi setelah menyapa.
  useEffect(() => {
    const male = siteConfig.WELCOME_GREETINGS_MALE;
    const female = siteConfig.WELCOME_GREETINGS_FEMALE;
    const pick = pickGreetings(male, female, readLastGreeting());
    storeLastGreeting(pick);
    setGreeting({ male: male[pick.male] ?? "", female: female[pick.female] ?? "" });

    const settle = (variant: CharacterVariant) =>
      window.setTimeout(() => setExpr((current) => ({ ...current, [variant]: "neutral" })), SETTLE_DELAY[variant]);
    timers.current.male = settle("male");
    timers.current.female = settle("female");
    const pending = timers.current;
    return () => {
      window.clearTimeout(pending.male);
      window.clearTimeout(pending.female);
    };
  }, []);

  // 2) Arah pandang mengikuti kursor (hanya pointer presisi & tanpa reduced-motion).
  useEffect(() => {
    const fine = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        (Object.keys(charRefs.current) as CharacterVariant[]).forEach((variant) => {
          const el = charRefs.current[variant];
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width * (variant === "male" ? 0.54 : 0.46);
          const cy = rect.top + rect.height * 0.3;
          const x = clamp((event.clientX - cx) / (window.innerWidth * 0.4));
          const y = clamp((event.clientY - cy) / (window.innerHeight * 0.45));
          el.style.setProperty("--look-x", x.toFixed(3));
          el.style.setProperty("--look-y", y.toFixed(3));
        });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  // 3) Reaksi saat pengunjung berinteraksi: tersenyum lebar & melambai sekali.
  const react = useCallback((variant: CharacterVariant) => {
    window.clearTimeout(timers.current[variant]);
    setExpr((current) => ({ ...current, [variant]: "happy" }));
    const now = Date.now();
    if (now - lastWave.current[variant] > 2600) {
      lastWave.current[variant] = now;
      setWaveKey((current) => ({ ...current, [variant]: current[variant] + 1 }));
    }
  }, []);

  const relax = useCallback((variant: CharacterVariant, delay = 1600) => {
    window.clearTimeout(timers.current[variant]);
    timers.current[variant] = window.setTimeout(
      () => setExpr((current) => ({ ...current, [variant]: "neutral" })),
      delay,
    );
  }, []);

  const handlers = (variant: CharacterVariant) => ({
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") react(variant);
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") relax(variant);
    },
    onClick: () => {
      react(variant);
      relax(variant, 2600);
    },
  });

  return (
    <figure className={styles.stage} aria-label="Dua karakter penyambut PAI Assistant">
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.glow} />
        <span className={styles.ring} />
        <span className={styles.pattern} />
        <span className={`${styles.spark} ${styles.sparkA}`} />
        <span className={`${styles.spark} ${styles.sparkB}`} />
        <span className={`${styles.spark} ${styles.sparkC}`} />
      </div>

      <div className={styles.grid}>
        <p className={styles.bubble} data-side="male" data-ready={greeting ? "true" : "false"}>
          {greeting?.male ?? siteConfig.WELCOME_GREETINGS_MALE[0]}
        </p>
        <p className={styles.bubble} data-side="female" data-ready={greeting ? "true" : "false"}>
          {greeting?.female ?? siteConfig.WELCOME_GREETINGS_FEMALE[0]}
        </p>

        <div
          ref={(el) => {
            charRefs.current.male = el;
          }}
          className={`${styles.character} ${styles.male}`}
          {...handlers("male")}
        >
          <div className={styles.float}>
            <Character variant="male" expression={expr.male} waving waveKey={waveKey.male} fade />
          </div>
        </div>
        <div
          ref={(el) => {
            charRefs.current.female = el;
          }}
          className={`${styles.character} ${styles.female}`}
          {...handlers("female")}
        >
          <div className={styles.float}>
            <Character variant="female" expression={expr.female} waving waveKey={waveKey.female} fade />
          </div>
        </div>
      </div>

      <figcaption className="visually-hidden">
        {siteConfig.CHARACTERS.male.alt} dan {siteConfig.CHARACTERS.female.alt.toLowerCase()}, menyapa pengunjung.
      </figcaption>
      <noscript>
        <style>{`.${styles.bubble}{opacity:1;transform:none;animation:none}`}</style>
      </noscript>
    </figure>
  );
}

function clamp(value: number) {
  return Math.max(-1, Math.min(1, value));
}
