import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Character } from "@/components/characters/Character";
import styles from "./sections.module.css";

export function CtaBand() {
  return (
    <section className={styles.ctaWrap} aria-labelledby="cta-title">
      <div className="container">
        <div className={styles.cta}>
          <div className={styles.ctaCopy}>
            <h2 id="cta-title" className={styles.ctaTitle}>
              Siap mengenal PAI lebih dekat?
            </h2>
            <p className={styles.ctaText}>Mulai percakapan pertamamu. Kami siap menemani.</p>
            <Link href="/assistant" className={`btn btn-lg ${styles.ctaBtn}`}>
              <MessageCircle size={19} strokeWidth={2.2} aria-hidden="true" />
              Mulai Bertanya
            </Link>
          </div>
          <div className={styles.ctaMascots} aria-hidden="true">
            <div className={styles.ctaAvatar}>
              <Character variant="male" crop="bust" expression="happy" />
            </div>
            <div className={styles.ctaAvatar}>
              <Character variant="female" crop="bust" expression="happy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
