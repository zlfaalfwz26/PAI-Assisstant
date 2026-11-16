import { BookOpen, CircleCheck, GraduationCap, MessagesSquare } from "lucide-react";
import { siteConfig } from "@/config/site";
import styles from "./sections.module.css";

const FUNCTIONS = [
  {
    icon: MessagesSquare,
    title: "Menjawab pertanyaan",
    text: "Tanyakan apa saja seputar Pendidikan Agama Islam dan dapatkan penjelasan yang runtut.",
  },
  {
    icon: GraduationCap,
    title: "Menyajikan informasi jurusan",
    text: "Informasi jurusan disampaikan berdasarkan data resmi yang dimasukkan pengurus.",
  },
  {
    icon: BookOpen,
    title: "Menemani belajar & diskusi",
    text: "Bahas materi kuliah, tugas, atau topik keislaman bersama asisten yang sabar.",
  },
];

const BENEFITS = [
  "Bisa diakses kapan saja, dari perangkat apa pun.",
  "Bahasa yang ramah, sopan, dan mudah dipahami.",
  "Tanpa perlu membuat akun.",
  "Mengarahkan ke sumber resmi untuk hal-hal penting.",
];

export function Intro() {
  return (
    <section id="pengenalan" className="section" aria-labelledby="intro-title">
      <div className="container">
        <div className="section-head center">
          <span className="section-kicker">Pengenalan</span>
          <h2 id="intro-title" className="section-title">
            Apa itu {siteConfig.APP_NAME}?
          </h2>
          <p className="section-lead">
            {siteConfig.APP_NAME} adalah asisten berbasis kecerdasan buatan (AI) yang membantu siapa saja — calon
            mahasiswa, mahasiswa, maupun masyarakat umum — mengenal dunia Pendidikan Agama Islam dengan cara yang santai
            dan mudah dipahami.
          </p>
        </div>

        <div className={styles.introGrid}>
          <div className={`card ${styles.introCard}`}>
            <h3 className={styles.cardTitle}>Fungsi platform</h3>
            <ul className={styles.fnList}>
              {FUNCTIONS.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className={styles.fnIcon}>
                    <Icon size={20} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <div>
                    <p className={styles.fnTitle}>{title}</p>
                    <p className={styles.fnText}>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={`card ${styles.introCard} ${styles.benefitCard}`}>
            <h3 className={styles.cardTitle}>Keuntungan memakai AI Assistant</h3>
            <ul className={styles.benefitList}>
              {BENEFITS.map((benefit) => (
                <li key={benefit}>
                  <CircleCheck size={20} strokeWidth={2.2} aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
            <p className={styles.note}>
              Jawaban AI bersifat membantu, bukan pengganti informasi resmi. Untuk urusan administrasi, selalu
              konfirmasi ke pihak jurusan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
