"use client";

import { Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./admin.module.css";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) {
        setError(body.message ?? "Gagal masuk.");
        return;
      }
      setPassword("");
      router.refresh();
    } catch {
      setError("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`container ${styles.center}`}>
      <form className={`card ${styles.loginCard}`} onSubmit={submit}>
        <span className={styles.loginIcon}>
          <KeyRound size={22} aria-hidden="true" />
        </span>
        <h1 className={styles.loginTitle}>Masuk Dashboard</h1>
        <p className={styles.muted}>Khusus pengelola PAI Assistant.</p>
        <label htmlFor="admin-password" className={styles.label}>
          Kata sandi admin
        </label>
        <div className={styles.passwordWrap}>
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            className={styles.input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "admin-error" : undefined}
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        {error && (
          <p id="admin-error" className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading || !password}>
          {loading && <LoaderCircle size={18} className={styles.spin} aria-hidden="true" />}
          Masuk
        </button>
      </form>
    </section>
  );
}
