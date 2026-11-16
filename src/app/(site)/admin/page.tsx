import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { isAdminEnabled, isAdminSession } from "@/lib/server/admin-auth";
import { getAdminStatus } from "@/lib/server/diagnostics";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import styles from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdminEnabled()) {
    return (
      <section className={`container ${styles.center}`}>
        <div className={`card ${styles.loginCard}`}>
          <span className={styles.loginIcon}>
            <KeyRound size={22} aria-hidden="true" />
          </span>
          <h1 className={styles.loginTitle}>Dashboard belum diaktifkan</h1>
          <p className={styles.muted}>
            Atur environment variable <code>ADMIN_PASSWORD</code> di server (mis. <code>.env.local</code> atau menu
            Environment Variables di hosting), lalu jalankan ulang aplikasi.
          </p>
        </div>
      </section>
    );
  }

  if (!(await isAdminSession())) return <AdminLogin />;

  return <AdminDashboard initialStatus={getAdminStatus()} />;
}
