import { Compass, Target } from "lucide-react";
import { siteConfig } from "@/config/site";
import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./sections.module.css";

/** Visi & misi resmi. Teks HANYA diambil dari siteConfig — tidak pernah dikarang. */
export function PaiInfo() {
  const vision = siteConfig.PAI_VISION.trim();
  const missions = siteConfig.PAI_MISSION.map((item) => item.trim()).filter(Boolean);

  return (
    <section id="visi-misi" className={`section ${styles.tinted}`} aria-labelledby="pai-title">
      <div className="container">
        <div className="section-head center">
          <span className="section-kicker">Informasi PAI</span>
          <h2 id="pai-title" className="section-title">
            Visi &amp; Misi {siteConfig.DEPARTMENT_SHORT_NAME}
          </h2>
          <p className="section-lead">Arah dan tujuan {siteConfig.DEPARTMENT_NAME} sesuai dokumen resmi.</p>
        </div>

        <div className={styles.vmGrid}>
          <article className={`card ${styles.vmCard}`} aria-labelledby="visi-title">
            <div className={styles.vmHead}>
              <span className={styles.vmIcon}>
                <Compass size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 id="visi-title">Visi</h3>
            </div>
            {vision ? (
              <blockquote className={styles.vision}>{vision}</blockquote>
            ) : (
              <EmptyState
                compact
                title="Visi resmi belum ditambahkan"
                description="Visi Jurusan PAI akan ditampilkan di sini setelah diperbarui oleh pengurus."
                devHint="isi PAI_VISION di src/config/site.ts dengan teks resmi."
              />
            )}
          </article>

          <article className={`card ${styles.vmCard}`} aria-labelledby="misi-title">
            <div className={styles.vmHead}>
              <span className={styles.vmIcon}>
                <Target size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 id="misi-title">Misi</h3>
            </div>
            {missions.length > 0 ? (
              <ol className={styles.mission}>
                {missions.map((mission, index) => (
                  <li key={index}>
                    <span className={styles.missionNo}>{index + 1}</span>
                    <span>{mission}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                compact
                title="Misi resmi belum ditambahkan"
                description="Daftar misi Jurusan PAI akan ditampilkan di sini setelah diperbarui oleh pengurus."
                devHint="isi PAI_MISSION (array teks) di src/config/site.ts."
              />
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
