"use client";

import { useEffect, useId, useState } from "react";
import { siteConfig, type CharacterExpression } from "@/config/site";
import { MaleCharacter } from "./MaleCharacter";
import { FemaleCharacter } from "./FemaleCharacter";
import styles from "./characters.module.css";

export type CharacterVariant = "male" | "female";

export type CharacterProps = {
  variant: CharacterVariant;
  expression?: CharacterExpression;
  /** Lambaian berulang yang lembut (hero). */
  waving?: boolean;
  /** Picu satu kali lambaian; ubah nilainya (mis. counter) untuk mengulang. */
  waveKey?: number;
  blink?: boolean;
  /** "half" = setengah badan, "bust" = kepala & bahu (avatar kecil). */
  crop?: "half" | "bust";
  /** Pudarkan bagian bawah agar menyatu dengan latar. */
  fade?: boolean;
  className?: string;
};

/**
 * Pembungkus karakter maskot. Memakai SVG bawaan, atau gambar referensi
 * resmi bila diisi di siteConfig.CHARACTERS[variant].assets.
 */
export function Character({
  variant,
  expression = "neutral",
  waving = false,
  waveKey = 0,
  blink = true,
  crop = "half",
  fade = false,
  className,
}: CharacterProps) {
  const rawId = useId();
  const uid = `c${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [waveOnce, setWaveOnce] = useState(false);

  useEffect(() => {
    if (!waveKey) return;
    setWaveOnce(false);
    // Paksa reflow agar animasi bisa diulang.
    const raf = requestAnimationFrame(() => setWaveOnce(true));
    const timer = window.setTimeout(() => setWaveOnce(false), 2500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [waveKey]);

  const assets = siteConfig.CHARACTERS[variant].assets;
  const customSrc = assets[expression] ?? assets.neutral;
  const isFemale = variant === "female";

  const style = {
    "--wave-dir": isFemale ? -1 : 1,
    "--wave-amp": isFemale ? 0.8 : 1,
    "--wave-delay": isFemale ? "1.5s" : "0.9s",
    "--wave-cycle": isFemale ? "7.6s" : "7s",
    "--blink-delay": isFemale ? "2.6s" : "1.2s",
    "--blink-duration": isFemale ? "6.4s" : "5.6s",
  } as React.CSSProperties;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-expression={expression}
      data-waving={waving && !waveOnce ? "true" : "false"}
      data-wave-once={waveOnce ? "true" : "false"}
      data-blink={blink ? "true" : "false"}
      data-fade={fade ? "true" : "false"}
      style={style}
    >
      {customSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.image} src={customSrc} alt="" draggable={false} />
      ) : isFemale ? (
        <FemaleCharacter uid={uid} crop={crop} />
      ) : (
        <MaleCharacter uid={uid} crop={crop} />
      )}
    </div>
  );
}
