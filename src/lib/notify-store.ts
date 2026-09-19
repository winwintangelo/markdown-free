/**
 * Storage for Phase 1.5 "notify me" signups: one row per email in Supabase
 * Postgres. The table and the `notify_signup` function are defined in
 * supabase/migrations/20260919000000_notify_signups.sql.
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
  return url && key ? { url: url.replace(/\/+$/, ""), key } : null;
}

export function notifyStoreConfigured(): boolean {
  return storeConfig() !== null;
}

/** Insert the signup, or merge the new features into the existing row. */
export async function saveNotifySignup(email: string, features: string[], locale: string): Promise<void> {
  const config = storeConfig();
  if (!config) throw new Error("notify store is not configured");

  const headers: Record<string, string> = {
    apikey: config.key,
    "Content-Type": "application/json",
  };
  // New sb_secret_ keys are not JWTs and belong only on `apikey`. A legacy
  // service-role key is a JWT and also travels as a Bearer token.
  if (config.key.startsWith("eyJ")) headers.Authorization = `Bearer ${config.key}`;

  const response = await fetch(`${config.url}/rest/v1/rpc/notify_signup`, {
    method: "POST",
    headers,
    body: JSON.stringify({ p_email: email, p_features: features, p_locale: locale }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Supabase responded ${response.status}`);
}
