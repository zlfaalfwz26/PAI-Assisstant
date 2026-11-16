import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "./Logo.module.css";

/** Logo + nama aplikasi. Gambar logo diambil dari siteConfig.APP_LOGO. */
export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  const [first, ...rest] = siteConfig.APP_NAME.split(" ");
  return (
    <Link href={href} className={styles.logo} aria-label={`${siteConfig.APP_NAME} — Beranda`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={siteConfig.APP_LOGO} alt="" width={38} height={38} className={styles.mark} />
      {!compact && (
        <span className={styles.word}>
          <span className={styles.wordStrong}>{first}</span>
          {rest.length > 0 && <span className={styles.wordSoft}> {rest.join(" ")}</span>}
        </span>
      )}
    </Link>
  );
}
