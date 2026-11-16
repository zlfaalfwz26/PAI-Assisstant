import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/server/admin-auth";
import { getAdminStatus } from "@/lib/server/diagnostics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Silakan masuk sebagai admin." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, status: getAdminStatus() }, { headers: { "Cache-Control": "no-store" } });
}
