# Supabase setup — "notify me" signups (Phase 1.5)

One-time setup for the feature teaser's "Notify me" form. About 15 minutes.

When you finish, `POST /api/notify` stores each signup (email, picked features, locale) in a Supabase table that only the server can reach. Until then the form still thanks the visitor, but the server drops the email and logs `[notify] storage not configured`. **Finish this setup before you merge the teaser to `main`.**

> The migration file lives on branch `phase-1.5-feature-teaser`. Run `git switch phase-1.5-feature-teaser` before Part 2 if you are on another branch.
>
> The secret key in Part 3 has full access to the database. Put it only in Vercel and your local `.env` (git-ignored). Never give it a `NEXT_PUBLIC_` prefix, never commit it, and never paste it into an issue or chat.

---

## Part 1 — Create the project · ~3 min

1. Open <https://supabase.com/dashboard> and sign in with your existing account.
2. Select **New project**, and fill in the form:
   - **Organization:** your existing one.
   - **Name:** `markdown-free`.
   - **Database password:** select **Generate a password** and save it in your password manager. The app never uses it; you need it only for direct database connections later.
   - **Region:** **East US (North Virginia)**, `us-east-1`. The Vercel functions run in `iad1` (Washington, D.C.), so each signup stays in the same area.
   - **Plan:** Free or Pro. Part 6 explains the difference that matters here.
3. If the form shows security or Data API options, keep the **Data API enabled** and keep it on the **`public` schema**. The server calls the signup function through the Data API at `/rest/v1/rpc/notify_signup`.
4. Select **Create new project** and wait until the dashboard shows the project as ready (about 2 minutes).

If you already have two active free projects, Supabase asks you to pause one or upgrade.

## Part 2 — Create the tables and functions · ~3 min

There are **two** migrations in `supabase/migrations/`, and both must run. If you set this project up before the vote board existed, you have run only the first: run the second now.

### Check what you have

```bash
npm run db:check
```

It reads the project named in `.env` and prints one line per object — the tables, their seed rows, and whether the vote function is callable. It changes nothing.

### Option A — one command

Add **one** of these to `.env`, then run `npm run db:migrate`. The REST secret key already in `.env` cannot create tables, which is why this needs a second credential.

| Variable | Where it comes from | How it applies |
|---|---|---|
| `SUPABASE_DB_URL` | **Project Settings → Database → Connection string → URI** (includes the database password; percent-encode special characters) | `supabase db push`, no login needed |
| `SUPABASE_ACCESS_TOKEN` | **Account → Access Tokens → Generate new token** (starts with `sbp_`) | Management API |

The script applies every file in `supabase/migrations/`, then runs the same check as above. Both migrations are safe to run more than once: tables use `create table if not exists`, functions use `create or replace`, seed rows use `on conflict do nothing`, and nothing drops or deletes. Running it a second time reports "Remote database is up to date".

### Option B — paste into the SQL editor

5. In the project, open **SQL Editor → New query**.
6. Paste the whole file `supabase/migrations/20260919000000_notify_signups.sql` and select **Run**. The editor reports success with no rows returned.

   It creates:
   - table `public.notify_signups`: one row per lowercase email, with its features, locale and timestamps. Row-level security (RLS) is on, with no policies.
   - function `public.notify_signup(...)`: inserts a signup, or merges new features into an existing row. Only the secret key's role (`service_role`) may run it.

7. In another new query, paste `supabase/migrations/20260921000000_feature_votes.sql` and select **Run**.

   It creates the counters behind the vote board:
   - table `public.feature_votes`: one row per feature, seeded at zero.
   - table `public.pay_intent`: one row per answer — `yes`, `maybe`, `no`.
   - function `public.record_probe(...)`: adds a vote, a pay answer or both, and returns the current tallies. The tallies travel back in that response only, which is how the board keeps the counts hidden until someone has voted.

   Neither table stores a person: no address, no IP, no session. You can run both scripts again safely; they do not delete data.

   Then check the result in a new query:

   ```sql
   select count(*) from public.notify_signups;                              -- 0
   select relrowsecurity from pg_class where relname = 'notify_signups';    -- true
   select feature, votes from public.feature_votes order by feature;        -- 6 rows, all 0
   select answer, responses from public.pay_intent order by answer;         -- 3 rows, all 0
   select proname from pg_proc
   where proname in ('notify_signup', 'record_probe');                      -- 2 rows
   ```

The dashboard may warn that these tables have RLS enabled but no policies. That is intended: with no policies, the public (publishable) key can neither read nor write them. **Do not add a policy.**

## Part 3 — Copy the URL and the secret key · ~2 min

Dashboard labels can shift between versions. These are the current ones.

8. **Project Settings → Data API:** copy the **Project URL**, for example `https://abcdefghijklmnop.supabase.co`.

   The page may show the REST endpoint instead, with `/rest/v1/` on the end. Drop that part: `SUPABASE_URL` is everything up to `.supabase.co`. The server adds the rest of the path. (It also strips a trailing `/rest/v1`, so either form works.)
9. **Project Settings → API Keys → Secret keys:** reveal and copy a key that starts with `sb_secret_`. If the list is empty, select **Add new secret key** and name it `vercel-notify`.

   Older projects show only **Legacy API keys**. In that case, copy the `service_role` key (a long value that starts with `eyJ`) and use the variable name `SUPABASE_SERVICE_ROLE_KEY` in the next steps instead of `SUPABASE_SECRET_KEY`. The code accepts either.

## Part 4 — Give Vercel the two variables · ~3 min

Pick one option.

### Option A (recommended) — add the two variables yourself

Only two values are needed, and you choose where they apply.

10. Open the Vercel dashboard → project **markdown-free** → **Settings → Environment Variables**.
11. Add:

    | Name | Value | Environments |
    |---|---|---|
    | `SUPABASE_URL` | the Project URL from step 8 | Production |
    | `SUPABASE_SECRET_KEY` | the `sb_secret_…` key from step 9 | Production, marked **Sensitive** |

    Production alone is enough. Preview deployments cannot submit the form anyway: `src/middleware.ts` accepts POSTs only from `markdown.free` and `localhost`.

### Option B — the Supabase Vercel integration

12. In Supabase: **Project Settings → Integrations → Vercel**, then connect the project to the Vercel project **markdown-free**.
13. The integration copies about a dozen variables into every Vercel environment, including the Postgres connection strings. In **Settings → Environment Variables**, confirm that the list contains `SUPABASE_URL` and either `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`. If it does not, add the missing one as in Option A.

Do not create the database from **Vercel → Storage → Create Database → Supabase**. That creates a new project in a separate, Vercel-billed Supabase organization, not in your account.

### Either option

14. Vercel applies environment variables only to new deployments. The merge deploy picks them up. If you add them after the teaser is live, redeploy.

## Part 5 — Test locally before you merge · ~5 min

15. Add the same two values to your local `.env`:

    ```bash
    SUPABASE_URL=https://abcdefghijklmnop.supabase.co
    SUPABASE_SECRET_KEY=sb_secret_...
    ```

16. Start a production build **without** `E2E_RELAXED_RATE_LIMITS`. With that flag set, the route never stores signups.

    ```bash
    lsof -ti :3000 | xargs kill
    npm run build && npm run start
    ```

17. Send one test signup:

    ```bash
    curl -i http://localhost:3000/api/notify \
      -H 'Origin: http://localhost:3000' \
      -H 'Content-Type: application/json' \
      -d '{"email":"setup-test@example.com","features":["backup","share"],"locale":"en","website":"","elapsedMs":5000}'
    ```

    The response is `HTTP 200` with `{"ok":true}`. The response is identical whether the server stored the signup or dropped it, by design, so check the table:

    ```sql
    select * from public.notify_signups;
    ```

    You see one row: `setup-test@example.com`, `{backup,share}`, `en`.

    Then send one vote, which is the other half of the probe:

    ```bash
    curl -i http://localhost:3000/api/votes \
      -H 'Origin: http://localhost:3000' \
      -H 'Content-Type: application/json' \
      -d '{"features":["backup","share"],"elapsedMs":5000}'
    ```

    The response carries the tallies — `{"ok":true,"tallies":[…]}` — and those two features are now one higher in `public.feature_votes`.

18. To test through the page instead: open http://localhost:3000 in a private window and convert a file twice. On the teaser, select **See upcoming features**, pick a feature, wait a couple of seconds, then **Count my vote**. The results screen shows the tallies, the pay question and the optional email field. A vote sent less than 1.5 seconds after the dialog opens counts as a bot and is dropped.

19. If no row appears, read the server output. Every drop or failure logs one line. A stored signup logs nothing, and no line contains the address.

    | Log line | Cause | Fix |
    |---|---|---|
    | `[notify] storage not configured` | The server did not load the variables. | Check the names in `.env`, then restart the server. |
    | `[notify] test mode — not storing` | The server runs with `E2E_RELAXED_RATE_LIMITS=1`. | Restart without it (step 16). |
    | `[notify] dropped a submission: sent too fast` | Submitted less than 1.5 s after opening the chips. | Wait longer, or send `elapsedMs` ≥ 1500 with curl. |
    | `[notify] save failed: Supabase responded 401` | The key is wrong or belongs to another project. | Copy the key again (step 9). |
    | `[notify] save failed: Supabase responded 404` | The Data API cannot find the function. | Rerun Part 2. If it still fails, run `notify pgrst, 'reload schema';` in the SQL Editor. |
    | `[votes] save failed: Supabase responded 404` | The second migration has not run. | Run `supabase/migrations/20260921000000_feature_votes.sql` (Part 2, step 7). |
    | `[notify] save failed: Supabase responded 403` | The key's role may not run the function. | Rerun Part 2; its last line grants the permission. |
    | `[notify] save failed:` with a 5xx status or a timeout | The project is paused or unreachable. | Restore the project in the dashboard; see Part 6. |

20. Delete the test row:

    ```sql
    delete from public.notify_signups where email = 'setup-test@example.com';
    ```

21. Optional: confirm that the public key cannot read the list. Copy the **publishable** key (`sb_publishable_…`) from **Project Settings → API Keys**, then run:

    ```bash
    curl 'https://abcdefghijklmnop.supabase.co/rest/v1/notify_signups?select=*' \
      -H 'apikey: sb_publishable_...'
    ```

    The expected result is an error that mentions `permission denied`. If it returns rows instead, stop and tell me before launch.

## Part 6 — Keep the project awake, and watch it · ~10 min

The Free plan pauses a project after about a week without activity. A paused project rejects every signup: visitors read "Couldn't save that. Try again.", and you restore the project by hand in the dashboard. At today's traffic, a week with no signups is likely.

One endpoint solves both halves of the problem. `GET /api/health` reads a single timestamp from the table and returns a bare status:

```json
{"status":"ok","store":"ok","time":"2026-09-20T16:08:33.690Z"}
```

| `store` | HTTP | Meaning |
|---|---|---|
| `ok` | 200 | The table answered. |
| `unconfigured` | 503 | The deployment has no `SUPABASE_*` variables. |
| `error` | 503 | The project is paused, unreachable, or the key is wrong. |
| `skipped` | 200 | A server started for the e2e suite. Never in production. |

An external monitor that calls it every few minutes alerts you when signups break, and its traffic is the activity that keeps the project awake. The body carries no URL, no key and no address, so it is safe to leave public.

### Set up the monitor

These steps use Checkly. UptimeRobot, Better Stack and cron-job.org work the same way: any service that calls a URL on a schedule and alerts on failure.

22. Create an account at <https://www.checklyhq.com> and start on the free plan.
23. Create an **API check**:
    - **URL:** `https://www.markdown.free/api/health`, method `GET`.
    - **Frequency:** every 10 minutes. That is about 1,000 database reads a week against a 7-day pause threshold.
    - **Locations:** one is enough; N. Virginia sits next to the functions and the database. Two locations running in parallel double the runs: every 10 minutes from two regions is about 8,640 runs a month, 86% of the free plan's 10,000. If you want two regions, set the scheduling strategy to **round-robin**, which keeps it near 4,300.
    - **Assertions:** status code equals `200`. That alone catches every failure, because the endpoint answers 503 when the store is unreachable or the variables are missing. For a belt-and-braces check, add a JSON body assertion: `$.store` equals `ok`.
    - **Retries:** retry once from the same location before alerting, so one slow request does not page you.
24. Add an alert channel (email is enough), **subscribe this check to it**, and save. Without a subscribed channel a failing check notifies nobody.
25. Confirm the first run is green in Checkly, then open `https://www.markdown.free/api/health` yourself and check that it reads `"store":"ok"`.

Every run reaches the database: the endpoint sends `Cache-Control: no-store`, and production answers with `x-vercel-cache: MISS` on each request (checked 2026-09-22). Keep the interval at a minute or more; the endpoint allows 10 requests per minute per IP address (`src/middleware.ts`).

In use since 2026-09-22: a Checkly API check named "Markdown Free Health Check", every 10 minutes.

### When the alert fires

- `store: "error"` → open the Supabase dashboard. If the project is paused, restore it. If it is running, check that the secret key still exists under **Project Settings → API Keys**.
- `store: "unconfigured"` → the Vercel environment variables are missing from the current deployment. Add them again (Part 4) and redeploy.
- The whole check times out → the site itself is down, not the store.

The Pro plan (check the current price; it was $25/month per organization) removes the pausing behaviour altogether. The monitor is still worth having, because it also catches a wrong key and a missing variable.

## Part 7 — Run the live tests · ~2 min

The normal test suite runs against a server that never stores anything. A second suite writes to your real project, reads each row back through the REST API, and deletes what it created. Every address it uses starts with `e2e-live-`.

26. Start a production server **without** `E2E_RELAXED_RATE_LIMITS`, as in Part 5.
27. Run:

    ```bash
    npm run test:notify-store
    ```

    It checks that a signup is stored, that a second signup merges into the same row, that an address is stored lowercase, that honeypot and too-fast submissions store nothing, that a rejected signup stores nothing, that the 11th signup from one address is refused, that the database rejects bad input even if the route is bypassed, and that the health endpoint reports `ok`.

28. Optional: add the **publishable** key to `.env` as `SUPABASE_PUBLISHABLE_KEY` to enable one more test, which proves that the public key can neither read the list nor run the signup function. Without it that test skips.

The suite is skipped in normal runs, including the full suite, unless `NOTIFY_LIVE=1` is set.

## After launch — using the list

Run these in the SQL Editor.

- Addresses to email when a feature ships (replace `backup` with the feature key: `backup`, `templates`, `formatting`, `equations`, `merge` or `share`):

  ```sql
  select email, locale from public.notify_signups
  where 'backup' = any(features) and unsubscribed_at is null;
  ```

- Retention promised on the privacy page. Delete a row once all of its features have shipped and been announced. Delete anything older than 12 months:

  ```sql
  delete from public.notify_signups where updated_at < now() - interval '12 months';
  ```

- What people are voting for, and whether they would pay:

  ```sql
  select feature, votes from public.feature_votes order by votes desc;
  select answer, responses from public.pay_intent order by responses desc;
  ```

- Someone asks to be removed:

  ```sql
  delete from public.notify_signups where email = lower('Person@Example.com');
  ```

The launch email and its one-click unsubscribe (which sets `unsubscribed_at`) are not built yet.
