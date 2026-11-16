import Link from "next/link";
import { institutionLabel, siteConfig } from "@/config/site";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "./nav-items";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();
  const about = siteConfig.HMJ_ABOUT[0];
  const socials = siteConfig.SOCIAL_LINKS.filter((item) => item.url);
  const email = siteConfig.CONTACT_EMAIL.trim();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <section className={styles.brand} aria-label={`Tentang ${siteConfig.APP_NAME}`}>
          <Logo />
          <p className={styles.desc}>{siteConfig.APP_DESCRIPTION}</p>
          <p className={styles.org}>{institutionLabel()}</p>
        </section>

        <section aria-labelledby="footer-hmj">
          <h2 id="footer-hmj" className={styles.title}>
            {siteConfig.HMJ_NAME}
          </h2>
          <p className={styles.text}>{siteConfig.HMJ_FULL_NAME}.</p>
          <p className={styles.text}>
            {about ? truncate(about, 150) : "Profil lengkap HMJ PAI akan segera diperbarui oleh pengurus."}
          </p>
          <Link href="/tentang" className={styles.more}>
            Tentang {siteConfig.HMJ_NAME} →
          </Link>
        </section>

        <nav aria-labelledby="footer-nav">
          <h2 id="footer-nav" className={styles.title}>
            Navigasi
          </h2>
          <ul className={styles.list}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {(socials.length > 0 || email) && (
          <section aria-labelledby="footer-social">
            <h2 id="footer-social" className={styles.title}>
              Terhubung
            </h2>
            <ul className={styles.list}>
              {socials.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.social}>
                    <SocialIcon platform={item.platform} size={17} />
                    {item.label}
                  </a>
                </li>
              ))}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className={styles.social}>
                    <SocialIcon platform="email" size={17} />
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </section>
        )}
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {year} {siteConfig.APP_NAME} · {siteConfig.HMJ_NAME}
        </p>
        <p className={styles.note}>
          Jawaban AI dapat keliru. Untuk keperluan resmi, selalu konfirmasi ke pihak jurusan.
        </p>
      </div>
    </footer>
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
