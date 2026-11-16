import { getOpenRouterConfig, getSupabaseConfig, isOpenRouterReady, isSupabaseReady } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Status publik tanpa rahasia: apakah asisten siap dipakai. */
export function GET() {
  const config = getOpenRouterConfig();
  return Response.json(
    {
      ok: true,
      assistant: { ready: isOpenRouterReady(config), streaming: config.stream },
      knowledge: { configured: isSupabaseReady(getSupabaseConfig()) },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
