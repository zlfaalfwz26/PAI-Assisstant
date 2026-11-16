"use client";

import {
  CircleAlert,
  CircleCheck,
  CircleMinus,
  Database,
  Gauge,
  KeyRound,
  LoaderCircle,
  LogOut,
  PlugZap,
  RefreshCw,
  Server,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminStatus, CheckStatus, ConnectionReport } from "@/lib/server/diagnostics";
import styles from "./admin.module.css";

const CHECK_ICON: Record<CheckStatus, typeof CircleCheck> = {
  ok: CircleCheck,
  warn: TriangleAlert,
  fail: CircleAlert,
  skip: CircleMinus,
};

const CHECK_LABEL: Record<CheckStatus, string> = {
  ok: "Berhasil",
  warn: "Perlu dicek",
  fail: "Gagal",
  skip: "Dilewati",
};

export function AdminDashboard({ initialStatus }: { initialStatus: AdminStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [report, setReport] = useState<ConnectionReport | null>(null);
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const or = status.openrouter;

  const testConnection = async () => {
    setTesting(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/test-connection", { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        report?: ConnectionReport;
        message?: string;
      };
      if (response.status === 401) return router.refresh();
      if (!response.ok || !body.report) setMessage(body.message ?? "Uji koneksi gagal dijalankan.");
      else setReport(body.report);
    } catch {
      setMessage("Server tidak dapat dihubungi.");
    } finally {
      setTesting(false);
    }
  };

  const refreshStatus = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/status", { cache: "no-store" });
      if (response.status === 401) return router.refresh();
      const body = (await response.json()) as { status?: AdminStatus };
      if (body.status) setStatus(body.status);
    } finally {
      setRefreshing(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.refresh();
  };

  return (
    <section className={`container ${styles.dashboard}`} aria-labelledby="dash-title">
      <header className={styles.dashHead}>
        <div>
          <p className="section-kicker">Dashboard</p>
          <h1 id="dash-title" className={styles.dashTitle}>
            Konfigurasi PAI Assistant
          </h1>
          <p className={styles.muted}>
            Pantau koneksi AI. Kredensial tidak pernah dikirim ke browser — hanya status dan versi tersamarkan.
          </p>
        </div>
        <div className={styles.headActions}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={refreshStatus} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? styles.spin : undefined} aria-hidden="true" />
            Muat ulang
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            <LogOut size={16} aria-hidden="true" />
            Keluar
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.col}>
          {/* OpenRouter */}
          <article className={`card ${styles.panel}`} aria-labelledby="or-title">
            <div className={styles.panelHead}>
              <span className={styles.panelIcon}>
                <Server size={20} aria-hidden="true" />
              </span>
              <h2 id="or-title" className={styles.panelTitle}>
                OpenRouter
              </h2>
              <span className={`badge ${or.ready ? "badge-success" : "badge-warning"}`}>
                {or.ready ? "Siap" : "Belum lengkap"}
              </span>
            </div>
            <dl className={styles.rows}>
              <div>
                <dt>Status API key</dt>
                <dd>
                  {or.apiKeySet ? (
                    <>
                      <span className="badge badge-success">Terpasang</span>
                      <code className={styles.code}>{or.apiKeyMasked}</code>
                    </>
                  ) : (
                    <span className="badge badge-danger">Belum diatur</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Model aktif</dt>
                <dd>
                  {or.model ? (
                    <>
                      <code className={styles.code}>{or.model}</code>
                      {!or.modelLooksValid && <span className="badge badge-warning">Format tidak biasa</span>}
                    </>
                  ) : (
                    <span className="badge badge-danger">Belum diatur</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Model alternatif</dt>
                <dd>
                  {or.fallbackModels.length ? (
                    or.fallbackModels.map((model) => (
                      <code key={model} className={styles.code}>
                        {model}
                      </code>
                    ))
                  ) : (
                    <span className={styles.muted}>— (opsional)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Base URL</dt>
                <dd>
                  <code className={styles.code}>{or.baseUrl}</code>
                </dd>
              </div>
              <div>
                <dt>Streaming (SSE)</dt>
                <dd>{or.stream ? "Aktif" : "Nonaktif"}</dd>
              </div>
              <div>
                <dt>Batas waktu · token · suhu</dt>
                <dd>
                  {Math.round(or.timeoutMs / 1000)} detik · {or.maxTokens} token · {or.temperature}
                </dd>
              </div>
              <div>
                <dt>Atribusi aplikasi</dt>
                <dd>
                  {or.siteName}
                  {or.siteUrl ? ` · ${or.siteUrl}` : ""}
                </dd>
              </div>
            </dl>
          </article>

          {/* Batas penggunaan */}
          <article className={`card ${styles.panel}`} aria-labelledby="limit-title">
            <div className={styles.panelHead}>
              <span className={styles.panelIcon}>
                <Gauge size={20} aria-hidden="true" />
              </span>
              <h2 id="limit-title" className={styles.panelTitle}>
                Batas penggunaan
              </h2>
            </div>
            <dl className={styles.rows}>
              <div>
                <dt>Pesan per menit / IP</dt>
                <dd>{status.limits.rateLimitPerMinute}</dd>
              </div>
              <div>
                <dt>Panjang maksimal pesan</dt>
                <dd>{status.limits.maxInputChars} karakter</dd>
              </div>
              <div>
                <dt>Riwayat yang dikirim</dt>
                <dd>{status.limits.maxHistory} pesan terakhir</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className={styles.col}>
          {/* Uji koneksi */}
          <article className={`card ${styles.panel}`} aria-labelledby="test-title">
            <div className={styles.panelHead}>
              <span className={styles.panelIcon}>
                <PlugZap size={20} aria-hidden="true" />
              </span>
              <h2 id="test-title" className={styles.panelTitle}>
                Test Connection
              </h2>
            </div>
            <p className={styles.muted}>
              Memeriksa API key, keberadaan model di katalog, satu permintaan chat kecil, dan Supabase (bila ada).
            </p>
            <button type="button" className="btn btn-primary" onClick={testConnection} disabled={testing}>
              {testing ? (
                <LoaderCircle size={18} className={styles.spin} aria-hidden="true" />
              ) : (
                <PlugZap size={18} aria-hidden="true" />
              )}
              {testing ? "Menguji…" : "Test Connection"}
            </button>
            {message && (
              <p className={styles.error} role="alert">
                {message}
              </p>
            )}
            {report && (
              <div className={styles.report} aria-live="polite">
                <p className={styles.reportHead}>
                  <span className={`badge ${report.ok ? "badge-success" : "badge-danger"}`}>
                    {report.ok ? "Koneksi berhasil" : "Ada masalah"}
                  </span>
                  <span className={styles.muted}>{new Date(report.testedAt).toLocaleString("id-ID")}</span>
                </p>
                <ul className={styles.checks}>
                  {report.checks.map((check) => {
                    const Icon = CHECK_ICON[check.status];
                    return (
                      <li key={check.id} data-status={check.status}>
                        <Icon size={18} aria-hidden="true" />
                        <div>
                          <p className={styles.checkLabel}>
                            {check.label}
                            <span className="visually-hidden"> — {CHECK_LABEL[check.status]}</span>
                            {check.latencyMs !== undefined && (
                              <span className={styles.latency}>{check.latencyMs} ms</span>
                            )}
                          </p>
                          <p className={styles.checkDetail}>{check.detail}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </article>

          {/* Supabase */}
          <article className={`card ${styles.panel}`} aria-labelledby="sb-title">
            <div className={styles.panelHead}>
              <span className={styles.panelIcon}>
                <Database size={20} aria-hidden="true" />
              </span>
              <h2 id="sb-title" className={styles.panelTitle}>
                Supabase
              </h2>
              <span className={`badge ${status.supabase.configured ? "badge-success" : ""}`}>
                {status.supabase.configured ? "Terhubung" : "Opsional"}
              </span>
            </div>
            <dl className={styles.rows}>
              <div>
                <dt>Host</dt>
                <dd>{status.supabase.host ? <code className={styles.code}>{status.supabase.host}</code> : "—"}</dd>
              </div>
              <div>
                <dt>Jenis kunci</dt>
                <dd>
                  {status.supabase.keyType === "service_role"
                    ? "Service role (server)"
                    : status.supabase.keyType === "anon"
                      ? "Anon"
                      : "—"}
                </dd>
              </div>
            </dl>
            <p className={styles.muted}>
              Tanpa Supabase, chatbot tetap berjalan melalui OpenRouter. Isi tabel <code>knowledge_base</code> hanya
              dengan data resmi.
            </p>
          </article>

          {/* Mengganti kredensial */}
          <article className={`card ${styles.panel}`} aria-labelledby="cred-title">
            <div className={styles.panelHead}>
              <span className={styles.panelIcon}>
                <KeyRound size={20} aria-hidden="true" />
              </span>
              <h2 id="cred-title" className={styles.panelTitle}>
                Mengganti kredensial
              </h2>
            </div>
            <ol className={styles.steps}>
              <li>
                Ubah <code>OPENROUTER_API_KEY</code>, <code>OPENROUTER_MODEL</code>, atau{" "}
                <code>OPENROUTER_FALLBACK_MODELS</code> di environment server (hosting atau <code>.env.local</code>).
              </li>
              <li>Deploy/jalankan ulang aplikasi agar nilai baru terbaca.</li>
              <li>Tekan Test Connection untuk memastikan model dapat dipakai.</li>
            </ol>
            <p className={styles.muted}>
              Kunci tidak dapat diubah dari halaman ini demi keamanan, dan tidak pernah disimpan di browser.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
