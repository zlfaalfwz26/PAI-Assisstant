import type { CharacterExpression } from "@/config/site";
import { Character } from "@/components/characters/Character";
import styles from "./EmptyState.module.css";

type Props = {
  title: string;
  description: string;
  /** Petunjuk untuk pengelola situs; hanya ditampilkan saat development. */
  devHint?: string;
  expression?: CharacterExpression;
  compact?: boolean;
};

/** Keadaan kosong yang ramah, ditemani maskot (versi kepala & bahu). */
export function EmptyState({ title, description, devHint, expression = "neutral", compact = false }: Props) {
  const showHint = devHint && process.env.NODE_ENV !== "production";
  return (
    <div className={styles.empty} data-compact={compact ? "true" : "false"}>
      <div className={styles.mascots} aria-hidden="true">
        <div className={styles.avatar}>
          <Character variant="male" crop="bust" expression={expression} />
        </div>
        <div className={styles.avatar}>
          <Character variant="female" crop="bust" expression={expression} />
        </div>
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.desc}>{description}</p>
      {showHint && (
        <p className={styles.hint}>
          <strong>Untuk pengelola:</strong> {devHint}
        </p>
      )}
    </div>
  );
}
