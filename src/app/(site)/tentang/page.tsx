import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { institutionLabel, siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SocialIcon } from "@/components/ui/SocialIcon";
import styles from "./tentang.module.css";

export const metadata: Metadata = {
  title: `Tentang ${siteConfig.HMJ_NAME}`,
  description: `Profil ${siteConfig.HMJ_FULL_NAME}.`,
};

export default function AboutPage() {
  const paragraphs = siteConfig.HMJ_ABOUT.map((text) => text.trim()).filter(Boolean);
  const socials = siteConfig.SOCIAL_LINKS.filter((item) => item.url);
  const email = siteConfig.CONTACT_EMAIL.trim();

  return (
    <>
      <PageHeader
        kicker="Tentang"
        title={`Tentang ${siteConfig.HMJ_NAME}`}
        lead={[siteConfig.HMJ_FULL_NAME, siteConfig.INSTITUTION_NAME].filter(Boolean).join(" — ")}
        expression="supportive"
      />
      <section className="section" aria-label={`Profil ${siteConfig.HMJ_NAME}`}>
        <div className={`container ${styles.layout}`}>
          <article className={styles.article}>
            <h2 className={styles.heading}>Profil organisasi</h2>
            {paragraphs.length > 0 ? (
              <div className={styles.prose}>
                {paragraphs.map((text, index) => (
                  <p key={index}>{text}</p>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Profil HMJ PAI belum ditambahkan"
                description="Sejarah, visi, dan kegiatan HMJ PAI akan ditampilkan di sini setelah diperbarui oleh pengurus."
                devHint="isi HMJ_ABOUT (satu string per paragraf) di src/config/site.ts."
                expression="supportive"
              />
            )}
          </article>

          <aside className={styles.aside}>
            <div className={`card ${styles.sideCard}`}>
              <h2 className={styles.sideTitle}>Kontak &amp; media sosial</h2>
              {socials.length > 0 || email ? (
                <ul className={styles.contactList}>
                  {socials.map((item) => (
                    <li key={item.url}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <SocialIcon platform={item.platform} size={18} />
                        {item.label}
                      </a>
                    </li>
                  ))}
                  {email && (
                    <li>
                      <a href={`mailto:${email}`}>
                        <Mail size={18} aria-hidden="true" />
                        {email}
                      </a>
                    </li>
                  )}
                </ul>
              ) : (
                <p className={styles.muted}>Kontak resmi belum ditambahkan.</p>
              )}
            </div>

            <div className={`card ${styles.sideCard}`}>
              <h2 className={styles.sideTitle}>{siteConfig.DEPARTMENT_SHORT_NAME}</h2>
              <p className={styles.muted}>{institutionLabel()}</p>
              <Link href="/#visi-misi" className={styles.sideLink}>
                Lihat visi &amp; misi <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/assistant" className={styles.sideLink}>
                Tanya PAI Assistant <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
