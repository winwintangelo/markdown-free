/**
 * Storage for the Phase 1.5 demand probe, in Supabase Postgres:
 *   - "notify me" signups, one row per email (20260919000000_notify_signups.sql)
 *   - vote tallies and pay intent, counters only (20260921000000_feature_votes.sql)
 *
 * Server only. The route calls the function through Supabase's REST API with
 * the secret key. The table has row-level security on and no policies, so the
 * public (publishable) key can neither read nor write it.
 */

const TIMEOUT_MS = 5000;

function storeConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  // The Supabase–Vercel integration sets SUPABASE_SECRET_KEY; projects created
  // before the new key format use the legacy service-role JWT instead.
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  // The dashboard shows the REST endpoint (https://<ref>.supabase.co/rest/v1/)
  // next to the project URL, so accept either and build the path here.
  return url && key ? { url: url.replace(/\/+$/, "").replace(/\/rest\/v1$/, ""), key } : null;
}

export function notifyStoreConfigured(): boolean {
  return storeConfig() !== null;
}

function authHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  // New sb_secret_ keys are not JWTs and belong only on `apikey`. A legacy
  // service-role key is a JWT and also travels as a Bearer token.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

/**
 * One cheap read that proves the store answers. /api/health calls it, and an
 * external monitor calling /api/health also keeps a free-tier project from
 * pausing. It reads a timestamp, never an address.
 */
export async function pingNotifyStore(): Promise<void> {
  const config = storeConfig();
  if (!config) throw new Error("notify store is not configured");

  const response = await fetch(`${config.url}/rest/v1/notify_signups?select=created_at&limit=1`, {
    headers: authHeaders(config.key),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Supabase responded ${response.status}`);
}

export type TallyRow = { feature: string; votes: number };

/**
 * Record a vote, a pay answer, or both, and return the current tallies. The
 * tallies travel back in this response only: the board shows them after the
 * vote, never before it.
 */
export async function recordProbe(features: string[], pay: string | null): Promise<TallyRow[]> {
  const config = storeConfig();
  if (!config) throw new Error("notify store is not configured");

  const response = await fetch(`${config.url}/rest/v1/rpc/record_probe`, {
    method: "POST",
    headers: authHeaders(config.key),
    body: JSON.stringify({ p_features: features, p_pay: pay }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Supabase responded ${response.status}`);

  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row): row is TallyRow =>
      !!row && typeof row === "object" && typeof (row as TallyRow).feature === "string" && typeof (row as TallyRow).votes === "number"
  );
}

/** Insert the signup, or merge the new features into the existing row. */
export async function saveNotifySignup(email: string, features: string[], locale: string): Promise<void> {
  const config = storeConfig();
  if (!config) throw new Error("notify store is not configured");

  const headers = authHeaders(config.key);

  const response = await fetch(`${config.url}/rest/v1/rpc/notify_signup`, {
    method: "POST",
    headers,
    body: JSON.stringify({ p_email: email, p_features: features, p_locale: locale }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Supabase responded ${response.status}`);
}
