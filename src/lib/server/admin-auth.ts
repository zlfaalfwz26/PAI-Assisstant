import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAdminConfig, type AdminConfig } from "./env";

/**
 * Sesi admin berbasis cookie HttpOnly yang ditandatangani HMAC.
 * Kata sandi hanya dibandingkan di server (ADMIN_PASSWORD).
 */

export const ADMIN_COOKIE = "pai_admin_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function isAdminEnabled(config: AdminConfig = getAdminConfig()) {
  return config.password.length > 0;
}

export function passwordMatches(input: string, config: AdminConfig = getAdminConfig()) {
  if (!isAdminEnabled(config)) return false;
  return safeEqual(input, config.password);
}

export function createSessionToken(config: AdminConfig = getAdminConfig(), now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.${expires}`;
  return `${payload}.${sign(payload, config.sessionSecret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  config: AdminConfig = getAdminConfig(),
  now = Date.now(),
) {
  if (!token || !isAdminEnabled(config)) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expires = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(expires) || expires * 1000 < now) return false;
  return safeEqual(parts[2], sign(`${parts[0]}.${parts[1]}`, config.sessionSecret));
}

/** Untuk Server Component & Route Handler. */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}
