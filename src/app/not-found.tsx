import Link from "next/link";
import { Character } from "@/components/characters/Character";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main id="konten" className={styles.wrap}>
      <div className={styles.mascots} aria-hidden="true">
        <div className={styles.avatar}>
          <Character variant="male" crop="bust" expression="confused" />
        </div>
        <div className={styles.avatar}>
          <Character variant="female" crop="bust" expression="confused" />
        </div>
      </div>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Halaman tidak ditemukan</h1>
      <p className={styles.text}>Sepertinya halaman yang kamu cari sudah dipindahkan atau tidak pernah ada.</p>
      <div className={styles.actions}>
        <Link href="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
        <Link href="/assistant" className="btn btn-secondary">
          Tanya PAI Assistant
        </Link>
      </div>
    </main>
  );
}
