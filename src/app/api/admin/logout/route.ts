import { NextResponse } from "next/server";
import { ADMIN_COOKIE, sessionCookieOptions } from "@/lib/server/admin-auth";
import { isSameOrigin } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Permintaan ditolak." }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", sessionCookieOptions(0));
  return response;
}
