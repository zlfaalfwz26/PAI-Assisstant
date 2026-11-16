import type { CharacterExpression } from "@/config/site";
import { Character } from "@/components/characters/Character";
import styles from "./PageHeader.module.css";

type Props = {
  kicker: string;
  title: string;
  lead?: string;
  expression?: CharacterExpression;
};

/** Kepala halaman untuk subhalaman, dengan maskot kecil agar identitas visual konsisten. */
export function PageHeader({ kicker, title, lead, expression = "happy" }: Props) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="section-kicker">{kicker}</span>
          <h1 className={styles.title}>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
        </div>
        <div className={styles.mascots} aria-hidden="true">
          <div className={styles.avatar}>
            <Character variant="male" crop="bust" expression={expression} />
          </div>
          <div className={styles.avatar}>
            <Character variant="female" crop="bust" expression={expression} />
          </div>
        </div>
      </div>
    </header>
  );
}
