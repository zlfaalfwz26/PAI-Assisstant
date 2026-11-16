import Link from "next/link";
import { ArrowRight, BookMarked, GraduationCap, Lightbulb, MessagesSquare } from "lucide-react";
import styles from "./sections.module.css";

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Tanya Jawab AI",
    text: "Ajukan pertanyaan dengan bahasa sehari-hari. Jawaban tampil bertahap secara langsung.",
    sample: "Apa itu Pendidikan Agama Islam?",
  },
  {
    icon: GraduationCap,
    title: "Informasi Jurusan",
    text: "Kenali jurusan dan kehidupan mahasiswa PAI berdasarkan informasi resmi dari pengurus.",
    sample: "Seperti apa kehidupan mahasiswa PAI?",
  },
  {
    icon: Lightbulb,
    title: "Diskusi Akademik",
    text: "Diskusikan isu pendidikan dan keislaman secara kritis, santun, dan berimbang.",
    sample: "Bagaimana peran guru PAI di era digital?",
  },
  {
    icon: BookMarked,
    title: "Bantuan Pembelajaran",
    text: "Minta penjelasan ulang materi, ringkasan, atau contoh soal untuk latihan.",
    sample: "Jelaskan pengertian akhlak beserta contohnya.",
  },
];

export function Features() {
  return (
    <section id="fitur" className="section" aria-labelledby="fitur-title">
      <div className="container">
        <div className="section-head center">
          <span className="section-kicker">Fitur</span>
          <h2 id="fitur-title" className="section-title">
            Teman belajar yang siap membantu
          </h2>
          <p className="section-lead">
            Empat cara PAI Assistant menemani perjalananmu mengenal Pendidikan Agama Islam.
          </p>
        </div>

        <ul className={styles.featureGrid}>
          {FEATURES.map(({ icon: Icon, title, text, sample }) => (
            <li key={title} className={`card ${styles.feature}`}>
              <span className={styles.featureIcon}>
                <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureText}>{text}</p>
              <Link href={`/assistant?q=${encodeURIComponent(sample)}`} className={styles.featureLink}>
                <span className={styles.sample}>“{sample}”</span>
                <span className={styles.featureCta}>
                  Coba tanyakan <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
