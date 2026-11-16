import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminEnabled,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/server/admin-auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Permintaan ditolak." }, { status: 403 });
  }
  if (!isAdminEnabled()) {
    return NextResponse.json(
      { ok: false, message: "Dashboard belum diaktifkan. Atur ADMIN_PASSWORD di environment server." },
      { status: 503 },
    );
  }
  const rate = checkRateLimit(`login:${clientIp(request)}`, 5, 15 * 60_000);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterMs / 60_000);
    return NextResponse.json(
      { ok: false, message: `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.` },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    /* body tidak valid → dianggap kata sandi kosong */
  }

  if (!passwordMatches(password)) {
    return NextResponse.json({ ok: false, message: "Kata sandi salah." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions());
  return response;
}
