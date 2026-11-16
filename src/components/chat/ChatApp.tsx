"use client";

import { ArrowUp, Check, Copy, RotateCcw, Square, SquarePen, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig, type CharacterExpression } from "@/config/site";
import { Character } from "@/components/characters/Character";
import { streamChat } from "@/lib/chat/client";
import { EXPRESSION_STATUS, expressionForReply } from "@/lib/chat/expression";
import type { ChatErrorCode, WireMessage } from "@/lib/chat/types";
import { Markdown } from "./Markdown";
import styles from "./ChatApp.module.css";

type ChatItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "done" | "streaming" | "error" | "stopped";
  error?: { code: ChatErrorCode; message: string };
};

type Phase = "idle" | "waiting" | "streaming";

type Props = {
  aiReady: boolean;
  maxInputChars: number;
  initialQuestion?: string;
  showSetupHint?: boolean;
};

const STORAGE_KEY = "pai-chat-v1";
const MAX_STORED = 40;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

function isChatItem(value: unknown): value is ChatItem {
  if (!value || typeof value !== "object") return false;
  const item = value as ChatItem;
  return (
    (item.role === "user" || item.role === "assistant") &&
    typeof item.content === "string" &&
    typeof item.id === "string"
  );
}

/** Riwayat yang dikirim ke server: buang pasangan tanya-jawab yang gagal. */
function toWire(items: ChatItem[]): WireMessage[] {
  const wire: WireMessage[] = [];
  items.forEach((item, index) => {
    if (item.role === "user") {
      const reply = items[index + 1];
      if (reply && reply.role === "assistant" && reply.status === "error" && !reply.content.trim()) return;
      wire.push({ role: "user", content: item.content });
    } else if (item.status !== "error" && item.content.trim()) {
      wire.push({ role: "assistant", content: item.content });
    }
  });
  return wire;
}

export function ChatApp({ aiReady, maxInputChars, initialQuestion = "", showSetupHint = false }: Props) {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [restored, setRestored] = useState(false);
  const [input, setInput] = useState(initialQuestion.slice(0, maxInputChars));
  const [phase, setPhase] = useState<Phase>("idle");
  const [expression, setExpression] = useState<CharacterExpression>("happy");
  const [waveKey, setWaveKey] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const stickToBottom = useRef(true);
  const busy = phase !== "idle";

  const settle = useCallback((next: CharacterExpression, delay: number) => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setExpression(next), delay);
  }, []);

  // Pulihkan percakapan dari sessionStorage (hanya tab ini).
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (Array.isArray(parsed)) {
        setItems(
          parsed
            .filter(isChatItem)
            .map((item) => (item.status === "streaming" ? { ...item, status: "stopped" } : item)),
        );
      }
    } catch {
      /* abaikan data rusak */
    }
    setRestored(true);
    setWaveKey(1);
    settle("neutral", 4200);
    return () => {
      window.clearTimeout(settleTimer.current);
      abortRef.current?.abort();
    };
  }, [settle]);

  useEffect(() => {
    if (!restored || busy) return;
    try {
      if (items.length) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-MAX_STORED)));
      else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* penyimpanan bisa diblokir */
    }
  }, [items, restored, busy]);

  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [items, phase]);

  // Tinggi textarea mengikuti isi.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 140;
  };

  const updateItem = (id: string, patch: Partial<ChatItem>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const send = async (text: string, baseItems?: ChatItem[]) => {
    const content = text.trim();
    if (!content || busy || !aiReady || content.length > maxInputChars) return;

    window.clearTimeout(settleTimer.current);
    const base = baseItems ?? items;
    const userItem: ChatItem = { id: newId(), role: "user", content, status: "done" };
    const reply: ChatItem = { id: newId(), role: "assistant", content: "", status: "streaming" };
    setItems([...base, userItem, reply]);
    setInput("");
    setPhase("waiting");
    setExpression("thinking");
    setAnnouncement("");
    stickToBottom.current = true;

    const controller = new AbortController();
    abortRef.current = controller;
    let text_ = "";
    let pending = "";
    let frame = 0;
    let started = false;
    const flush = () => {
      frame = 0;
      text_ += pending;
      pending = "";
      updateItem(reply.id, { content: text_ });
    };

    const outcome = await streamChat(
      toWire([...base, userItem]),
      {
        onDelta: (delta) => {
          if (!started) {
            started = true;
            setPhase("streaming");
            setExpression("neutral");
          }
          pending += delta;
          if (!frame) frame = window.requestAnimationFrame(flush);
        },
      },
      controller.signal,
    );
    if (frame) window.cancelAnimationFrame(frame);
    text_ += pending;
    abortRef.current = null;
    setPhase("idle");

    if (outcome.status === "done") {
      updateItem(reply.id, { content: text_, status: "done" });
      setExpression(text_.trim() ? expressionForReply(content, text_) : "confused");
      settle("neutral", 6500);
      setAnnouncement("Jawaban selesai.");
    } else if (outcome.status === "aborted") {
      updateItem(reply.id, { content: text_, status: "stopped" });
      setExpression("neutral");
    } else {
      updateItem(reply.id, {
        content: text_,
        status: "error",
        error: { code: outcome.code, message: outcome.message },
      });
      setExpression("apologetic");
      setAnnouncement(outcome.message);
    }
    if (window.matchMedia?.("(hover: hover)").matches) inputRef.current?.focus();
  };

  const retry = (assistantId: string) => {
    const index = items.findIndex((item) => item.id === assistantId);
    const question = items[index - 1];
    if (index < 1 || question?.role !== "user") return;
    void send(question.content, items.slice(0, index - 1));
  };

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    abortRef.current?.abort();
    setItems([]);
    setPhase("idle");
    setExpression("happy");
    setWaveKey((key) => key + 1);
    settle("neutral", 3800);
    inputRef.current?.focus();
  };

  const copy = async (item: ChatItem) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1600);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  };

  const statusText = !aiReady
    ? "Belum terhubung ke layanan AI"
    : phase === "waiting"
      ? "Sedang berpikir…"
      : phase === "streaming"
        ? "Sedang menjawab…"
        : EXPRESSION_STATUS[expression];
  const overLimit = input.length > maxInputChars;
  const nearLimit = input.length > maxInputChars * 0.8;
  const empty = restored && items.length === 0;

  return (
    <div className={styles.layout}>
      {/* Panel maskot (desktop) */}
      <aside className={styles.panel} aria-label="Maskot PAI Assistant">
        <div className={styles.stage} aria-hidden="true">
          <span className={styles.stageGlow} />
          <div className={styles.duo}>
            <Character variant="male" expression={expression} waveKey={waveKey} fade />
            <Character variant="female" expression={expression} waveKey={waveKey} fade />
          </div>
        </div>
        <p className={styles.status} data-phase={phase} data-ready={aiReady ? "true" : "false"}>
          <span className={styles.statusDot} aria-hidden="true" />
          {statusText}
        </p>
        <div className={styles.tips}>
          <p className={styles.tipsTitle}>Tips bertanya</p>
          <ul>
            <li>Tulis pertanyaan sejelas mungkin.</li>
            <li>Sebutkan konteksnya, mis. “untuk tugas kuliah”.</li>
            <li>Untuk urusan resmi, konfirmasi ke jurusan.</li>
          </ul>
        </div>
        <button type="button" className={`btn btn-secondary ${styles.newChat}`} onClick={newChat}>
          <SquarePen size={17} aria-hidden="true" />
          Percakapan baru
        </button>
      </aside>

      <section className={styles.conversation} aria-labelledby="chat-title">
        <h1 id="chat-title" className="visually-hidden">
          AI Assistant — {siteConfig.APP_NAME}
        </h1>
        {/* Kepala ringkas (mobile) */}
        <div className={styles.mobileHead}>
          <div className={styles.miniDuo} aria-hidden="true">
            <span className={styles.miniAvatar}>
              <Character variant="male" crop="bust" expression={expression} />
            </span>
            <span className={styles.miniAvatar}>
              <Character variant="female" crop="bust" expression={expression} />
            </span>
          </div>
          <div className={styles.miniText}>
            <p className={styles.miniTitle}>{siteConfig.APP_NAME}</p>
            <p className={styles.miniStatus} data-phase={phase}>
              {statusText}
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={newChat}
            aria-label="Percakapan baru"
            title="Percakapan baru"
          >
            <SquarePen size={18} aria-hidden="true" />
          </button>
        </div>

        {!aiReady && (
          <div className={styles.notice} role="status">
            <TriangleAlert size={18} aria-hidden="true" />
            <div>
              <p className={styles.noticeTitle}>Asisten AI belum aktif</p>
              <p>
                Pengelola situs perlu menghubungkan layanan AI (OpenRouter) terlebih dahulu.
                {showSetupHint && (
                  <>
                    {" "}
                    Atur <code>OPENROUTER_API_KEY</code> dan <code>OPENROUTER_MODEL</code> di <code>.env.local</code>,
                    lalu jalankan ulang server.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <div
          ref={listRef}
          className={styles.messages}
          onScroll={onScroll}
          role="log"
          aria-live="polite"
          aria-busy={busy}
          aria-label="Riwayat percakapan"
        >
          <div className={styles.thread}>
            {empty && (
              <div className={styles.welcome}>
                <h2 className={styles.welcomeTitle}>Assalamu&apos;alaikum! Ada yang bisa kami bantu?</h2>
                <p className={styles.welcomeText}>
                  Tanyakan apa saja seputar Pendidikan Agama Islam, kehidupan mahasiswa, atau materi keislaman.
                </p>
                <div className={styles.starters}>
                  {siteConfig.STARTER_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className={styles.starter}
                      onClick={() => void send(question)}
                      disabled={!aiReady || busy}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {items.map((item) =>
              item.role === "user" ? (
                <div key={item.id} className={styles.userRow}>
                  <p className={styles.userBubble}>{item.content}</p>
                </div>
              ) : (
                <div key={item.id} className={styles.aiRow} data-status={item.status}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.aiAvatar} src={siteConfig.APP_LOGO} alt="" width={34} height={34} />
                  <div className={styles.aiBody}>
                    <p className={styles.aiName}>{siteConfig.APP_NAME}</p>
                    {item.content ? (
                      <div className={styles.aiBubble}>
                        <Markdown text={item.content} />
                        {item.status === "streaming" && (
                          <span className={styles.streamDots} aria-hidden="true">
                            <span />
                            <span />
                            <span />
                          </span>
                        )}
                      </div>
                    ) : item.status === "streaming" ? (
                      <div className={`${styles.aiBubble} ${styles.typing}`} aria-label="Sedang mengetik">
                        <span />
                        <span />
                        <span />
                      </div>
                    ) : null}

                    {item.status === "error" && item.error && (
                      <div className={styles.errorBox} role="alert">
                        <TriangleAlert size={18} aria-hidden="true" />
                        <div>
                          <p>{item.error.message}</p>
                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() => retry(item.id)}
                            disabled={busy}
                          >
                            <RotateCcw size={15} aria-hidden="true" /> Coba lagi
                          </button>
                        </div>
                      </div>
                    )}
                    {item.status === "stopped" && <p className={styles.meta}>Jawaban dihentikan.</p>}
                    {item.status === "done" && item.content && (
                      <div className={styles.actions}>
                        <button type="button" className={styles.linkBtn} onClick={() => void copy(item)}>
                          {copiedId === item.id ? (
                            <>
                              <Check size={15} aria-hidden="true" /> Tersalin
                            </>
                          ) : (
                            <>
                              <Copy size={15} aria-hidden="true" /> Salin
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <form
          className={styles.composer}
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
        >
          <div className={styles.inputWrap} data-invalid={overLimit ? "true" : "false"}>
            <label htmlFor="chat-input" className="visually-hidden">
              Tulis pertanyaan
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={aiReady ? "Tulis pertanyaanmu di sini…" : "Asisten AI belum aktif"}
              rows={1}
              disabled={!aiReady}
              aria-describedby="chat-hint"
            />
            {busy ? (
              <button
                type="button"
                className={`${styles.sendBtn} ${styles.stopBtn}`}
                onClick={stop}
                aria-label="Hentikan jawaban"
              >
                <Square size={16} fill="currentColor" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!aiReady || !input.trim() || overLimit}
                aria-label="Kirim pertanyaan"
              >
                <ArrowUp size={20} strokeWidth={2.4} aria-hidden="true" />
              </button>
            )}
          </div>
          <p id="chat-hint" className={styles.hint}>
            {nearLimit ? (
              <span data-over={overLimit ? "true" : "false"} className={styles.counter}>
                {input.length}/{maxInputChars} karakter
              </span>
            ) : (
              <span className={styles.enterHint}>Enter untuk kirim · Shift+Enter untuk baris baru</span>
            )}
            <span>Jawaban AI dapat keliru — konfirmasi informasi penting ke jurusan.</span>
          </p>
        </form>
        <p className="visually-hidden" aria-live="assertive">
          {announcement}
        </p>
      </section>
    </div>
  );
}
