import { NextResponse } from "next/server";
import { notifyStoreConfigured, pingNotifyStore } from "@/lib/notify-store";

/**
 * Health check for an external monitor (setup in docs/supabase-setup.md).
 *
 * It reads one timestamp from the signup store. That read is deliberate: a
 * Supabase project on the free plan pauses after a week without activity, and
 * a paused project silently loses every "notify me" signup. A monitor calling
 * this endpoint every few minutes both alerts on failures and keeps the
 * project awake.
 *
 * The body carries a status and nothing else: no URL, no key, no address.
 * Details of a failure go to the server log.
 */

export const dynamic = "force-dynamic";

type StoreState = "ok" | "error" | "unconfigured" | "skipped";

export async function GET() {
  let store: StoreState;

  if (process.env.E2E_RELAXED_RATE_LIMITS === "1") {
    // A server started for the e2e suite has no store and must not be probed.
    store = "skipped";
  } else if (!notifyStoreConfigured()) {
    store = "unconfigured";
  } else {
    try {
      await pingNotifyStore();
      store = "ok";
    } catch (error) {
      console.error("[health] notify store check failed:", error instanceof Error ? error.message : String(error));
      store = "error";
    }
  }

  const healthy = store === "ok" || store === "skipped";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", store, time: new Date().toISOString() },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
