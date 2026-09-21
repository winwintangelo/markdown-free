#!/usr/bin/env node
/**
 * Apply supabase/migrations/*.sql to the Supabase project in .env, then check
 * the result.
 *
 *   npm run db:check      verify only — what exists right now
 *   npm run db:migrate    apply every migration, then verify
 *
 * The REST secret key in .env can read and write rows, but it cannot create
 * tables: DDL needs one of these, added to .env.
 *
 *   SUPABASE_DB_URL        Supabase → Project Settings → Database →
 *                          Connection string → URI (contains the database
 *                          password). Applied with the Supabase CLI, which
 *                          needs no login. Percent-encode any special
 *                          characters in the password.
 *   SUPABASE_ACCESS_TOKEN  Supabase → Account → Access Tokens → Generate
 *                          (starts with sbp_). Applied over the Management API.
 *
 * Both migrations are written to be safe to run again: tables use
 * "create table if not exists", the functions use "create or replace", and the
 * seed rows use "on conflict do nothing". Nothing here drops or deletes.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Same manual .env loader as the other scripts (no dotenv dependency).
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const [key, ...rest] = line.split("=");
    if (!key || rest.length === 0) continue;
    const name = key.trim();
    if (!process.env[name]) process.env[name] = rest.join("=").trim();
  }
}
loadEnv();

const CHECK_ONLY = process.argv.includes("--check");
const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DB_URL = process.env.SUPABASE_DB_URL || "";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || "";

const tick = "✓";
const cross = "✗";

function fail(message) {
  console.error(`\n${cross} ${message}`);
  process.exit(1);
}

function restHeaders() {
  const headers = { apikey: SECRET_KEY, "Content-Type": "application/json" };
  // A legacy service-role key is a JWT and also travels as a Bearer token.
  if (SECRET_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${SECRET_KEY}`;
  return headers;
}

function migrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) fail(`No migrations directory at ${MIGRATIONS_DIR}`);
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

/** Rows of a table, or null when the table does not exist yet. */
async function readTable(table, select) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, { headers: restHeaders() });
  if (response.status === 404) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // PostgREST reports a missing table as 404 (PGRST205) or 400 (PGRST200)
    if (body && typeof body.message === "string" && /could not find the table|does not exist/i.test(body.message)) {
      return null;
    }
    fail(`Reading ${table} failed (HTTP ${response.status}): ${body?.message ?? "unknown error"}`);
  }
  return Array.isArray(body) ? body : [];
}

/** Call record_probe with nothing to record: it writes nothing and returns the tallies. */
async function readTallies() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/record_probe`, {
    method: "POST",
    headers: restHeaders(),
    body: JSON.stringify({ p_features: [], p_pay: null }),
  });
  if (!response.ok) return null;
  const body = await response.json().catch(() => null);
  return Array.isArray(body) ? body : null;
}

async function applyWithCli() {
  // --include-all re-applies files the remote history table has never seen,
  // which is the normal case when the first migration was pasted into the SQL
  // editor by hand. Both files are safe to run again.
  console.log("Applying migrations with the Supabase CLI (SUPABASE_DB_URL)…\n");
  const result = spawnSync("supabase", ["db", "push", "--db-url", DB_URL, "--include-all", "--yes"], {
    stdio: "inherit",
  });
  if (result.error) fail(`Could not run the supabase CLI: ${result.error.message}`);
  if (result.status !== 0) fail(`supabase db push exited with code ${result.status}`);
}

async function applyWithManagementApi() {
  const ref = SUPABASE_URL.replace(/^https?:\/\//, "").split(".")[0];
  console.log(`Applying migrations over the Management API (project ${ref})…\n`);

  for (const name of migrationFiles()) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name), "utf-8");
    const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      fail(`${name} failed (HTTP ${response.status}): ${detail.slice(0, 400)}`);
    }
    console.log(`  ${tick} ${name}`);
  }
  console.log("");
}

async function verify() {
  const expected = {
    feature_votes: ["backup", "templates", "formatting", "equations", "merge", "share"],
    pay_intent: ["yes", "maybe", "no"],
  };
  let ok = true;

  const signups = await readTable("notify_signups", "email");
  if (signups === null) {
    console.log(`  ${cross} notify_signups — missing (run 20260919000000_notify_signups.sql)`);
    ok = false;
  } else {
    console.log(`  ${tick} notify_signups — ${signups.length} signup(s)`);
  }

  const votes = await readTable("feature_votes", "feature,votes");
  if (votes === null) {
    console.log(`  ${cross} feature_votes — missing (run 20260921000000_feature_votes.sql)`);
    ok = false;
  } else {
    const keys = votes.map((row) => row.feature).sort();
    const missing = expected.feature_votes.filter((key) => !keys.includes(key));
    const total = votes.reduce((sum, row) => sum + Number(row.votes), 0);
    if (missing.length) {
      console.log(`  ${cross} feature_votes — missing rows: ${missing.join(", ")}`);
      ok = false;
    } else {
      console.log(`  ${tick} feature_votes — 6 features, ${total} vote(s) so far`);
    }
  }

  const pay = await readTable("pay_intent", "answer,responses");
  if (pay === null) {
    console.log(`  ${cross} pay_intent — missing (run 20260921000000_feature_votes.sql)`);
    ok = false;
  } else {
    const answers = pay.map((row) => row.answer).sort();
    const missing = expected.pay_intent.filter((key) => !answers.includes(key));
    const total = pay.reduce((sum, row) => sum + Number(row.responses), 0);
    if (missing.length) {
      console.log(`  ${cross} pay_intent — missing rows: ${missing.join(", ")}`);
      ok = false;
    } else {
      console.log(`  ${tick} pay_intent — 3 answers, ${total} response(s) so far`);
    }
  }

  // The route calls this function on every vote, so a working call is the
  // check that matters. Passing nothing records nothing.
  const before = votes === null ? null : votes.reduce((sum, row) => sum + Number(row.votes), 0);
  const tallies = await readTallies();
  if (tallies === null) {
    console.log(`  ${cross} record_probe() — not callable with the secret key`);
    ok = false;
  } else {
    const after = tallies.reduce((sum, row) => sum + Number(row.votes), 0);
    if (before !== null && after !== before) {
      console.log(`  ${cross} record_probe() — an empty call changed the tallies (${before} → ${after})`);
      ok = false;
    } else {
      console.log(`  ${tick} record_probe() — returns ${tallies.length} tallies, records nothing when passed nothing`);
    }
  }

  return ok;
}

async function main() {
  if (!SUPABASE_URL || !SECRET_KEY) {
    fail("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env (see docs/supabase-setup.md).");
  }

  console.log(`Project: ${SUPABASE_URL}`);
  console.log(`Migrations: ${migrationFiles().join(", ")}\n`);

  if (!CHECK_ONLY) {
    if (DB_URL) {
      await applyWithCli();
    } else if (ACCESS_TOKEN) {
      await applyWithManagementApi();
    } else {
      console.error("Nothing in .env can create tables. Add ONE of these, then run this again:\n");
      console.error("  SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres");
      console.error("      Supabase → Project Settings → Database → Connection string → URI\n");
      console.error("  SUPABASE_ACCESS_TOKEN=sbp_...");
      console.error("      Supabase → Account → Access Tokens → Generate new token\n");
      console.error("Or paste each file into the SQL editor by hand (docs/supabase-setup.md, Part 2).");
      console.error("\nChecking what exists today:\n");
      await verify();
      process.exit(1);
    }
  }

  console.log("Checking the schema:\n");
  const ok = await verify();
  console.log("");
  if (!ok) {
    fail(CHECK_ONLY ? "The schema is incomplete." : "The migrations ran but the schema still looks wrong.");
  }
  console.log(`${tick} Schema is ready.`);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
