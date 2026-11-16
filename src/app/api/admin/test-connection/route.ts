import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/server/admin-auth";
import { runConnectionTest } from "@/lib/server/diagnostics";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Permintaan ditolak." }, { status: 403 });
  }
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Silakan masuk sebagai admin." }, { status: 401 });
  }
  const rate = checkRateLimit(`test:${clientIp(request)}`, 6, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "Terlalu sering menguji koneksi. Tunggu sebentar." },
      { status: 429 },
    );
  }
  const report = await runConnectionTest();
  return NextResponse.json({ ok: true, report }, { headers: { "Cache-Control": "no-store" } });
}
