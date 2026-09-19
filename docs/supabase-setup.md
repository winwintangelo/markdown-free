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

## Part 2 — Create the table and function · ~2 min

5. In the project, open **SQL Editor → New query**.
6. Paste the whole file `supabase/migrations/20260919000000_notify_signups.sql` and select **Run**. The editor reports success with no rows returned.

   The script creates:
   - table `public.notify_signups`: one row per lowercase email, with its features, locale and timestamps. Row-level security (RLS) is on, with no policies.
   - function `public.notify_signup(...)`: inserts a signup, or merges new features into an existing row. Only the secret key's role (`service_role`) may run it.

   You can run the script again safely. It does not delete data.
7. Check the result in a new query:

   ```sql
   select count(*) from public.notify_signups;                              -- 0
   select relrowsecurity from pg_class where relname = 'notify_signups';    -- true
   select proname from pg_proc where proname = 'notify_signup';             -- 1 row
   ```

The dashboard may warn that `notify_signups` has RLS enabled but no policies. That is intended: with no policies, the public (publishable) key can neither read nor write the list. **Do not add a policy.**

## Part 3 — Copy the URL and the secret key · ~2 min

Dashboard labels can shift between versions. These are the current ones.

8. **Project Settings → Data API:** copy the **Project URL**, for example `https://abcdefghijklmnop.supabase.co`.
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

18. To test through the page instead: open http://localhost:3000 in a private window and convert a file twice. On the teaser, select **See what's coming**, tap a feature, wait at least 2 seconds, enter an email and select **Notify me**. Signups sent less than 1.5 seconds after opening the chips count as bots and are dropped.

19. If no row appears, read the server output. Every drop or failure logs one line. A stored signup logs nothing, and no line contains the address.

    | Log line | Cause | Fix |
    |---|---|---|
    | `[notify] storage not configured` | The server did not load the variables. | Check the names in `.env`, then restart the server. |
    | `[notify] test mode — not storing` | The server runs with `E2E_RELAXED_RATE_LIMITS=1`. | Restart without it (step 16). |
    | `[notify] dropped a submission: sent too fast` | Submitted less than 1.5 s after opening the chips. | Wait longer, or send `elapsedMs` ≥ 1500 with curl. |
    | `[notify] save failed: Supabase responded 401` | The key is wrong or belongs to another project. | Copy the key again (step 9). |
    | `[notify] save failed: Supabase responded 404` | The Data API cannot find the function. | Rerun Part 2. If it still fails, run `notify pgrst, 'reload schema';` in the SQL Editor. |
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

## Part 6 — Keep the project from pausing

The Free plan pauses a project after 7 days without activity. A paused project rejects every signup: visitors see "Couldn't save that. Try again.", and you must restore the project by hand in the dashboard. At today's traffic, a week with no signups is likely.

Choose one:

- **Pro plan** (check the current price on the Supabase pricing page; it was $25/month per organization): the project never pauses. Nothing else to build.
- **Stay on Free** and ask me to add a daily keep-alive: a scheduled GitHub Actions job that makes one request to the project. I would not use a Vercel cron, because `vercel.json` changes are deferred.

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

- Someone asks to be removed:

  ```sql
  delete from public.notify_signups where email = lower('Person@Example.com');
  ```

The launch email and its one-click unsubscribe (which sets `unsubscribed_at`) are not built yet.
