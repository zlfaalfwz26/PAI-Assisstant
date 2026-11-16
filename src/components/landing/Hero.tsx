import Link from "next/link";
import { ArrowDown, MessageCircle, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { WelcomeStage } from "./WelcomeStage";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.bg} aria-hidden="true">
        <span className={styles.blobA} />
        <span className={styles.blobB} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className={`eyebrow ${styles.eyebrow}`}>
            <span className="eyebrow-dot">
              <Sparkles size={13} strokeWidth={2.4} aria-hidden="true" />
            </span>
            Asisten AI {siteConfig.DEPARTMENT_SHORT_NAME}
          </span>
          <h1 id="hero-title" className={styles.title}>
            Kenali <span className={styles.accent}>PAI</span> Lebih Dekat.
          </h1>
          <p className={styles.lead}>{siteConfig.APP_DESCRIPTION}</p>
          <div className={styles.ctas}>
            <Link href="/assistant" className="btn btn-primary btn-lg">
              <MessageCircle size={19} strokeWidth={2.2} aria-hidden="true" />
              Mulai Bertanya
            </Link>
            <a href="#pengenalan" className="btn btn-secondary btn-lg">
              Pelajari Lebih Lanjut
              <ArrowDown size={18} strokeWidth={2.2} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.visual}>
          <WelcomeStage />
        </div>
      </div>
    </section>
  );
}
