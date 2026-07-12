# Growth loop — credential setup (GSC + Vercel)

One-time setup to unlock the Google Search Console and Vercel channels for the growth
loop. ~10–15 minutes total. When done, `npm run snapshot` pulls **all** channels and
you never download an analytics CSV again.

> All values go in your local `.env` (git-ignored). The GSC key file stays **outside**
> the repo (or matches the git-ignored `*gsc-key*.json` pattern). Never commit credentials.

---

## Part A — Google Search Console (service account) · ~10 min

A service account is a robotic Google identity that reads your GSC data unattended (no
browser login, no expiring token). You create it once and add it as a *user* on your
Search Console property.

### A1. Create a Google Cloud project + enable the API
1. Go to <https://console.cloud.google.com> and sign in with the Google account that owns the Search Console property.
2. Top bar → project dropdown → **New Project** (name it e.g. `markdown-growth`). Create, then select it.
3. **APIs & Services → Library** → search **"Google Search Console API"** → open it → **Enable**.

### A2. Create the service account + download its key
4. **APIs & Services → Credentials** → **Create credentials → Service account**.
5. Name it `gsc-reader` → **Create and continue**. You do **not** need to grant it any project roles → **Done**.
6. Open the new service account → **Keys** tab → **Add key → Create new key → JSON** → **Create**. A `.json` file downloads. **Keep it out of the repo** — e.g. move it to `~/.secrets/gsc-key.json`.
7. Copy the service account's **email** — it looks like `gsc-reader@markdown-growth.iam.gserviceaccount.com`.

### A3. Grant it access inside Search Console (the step people miss)
8. Go to <https://search.google.com/search-console> → select the **markdown.free** property.
9. **Settings → Users and permissions → Add user**.
10. Paste the service account **email** from step 7, permission **Restricted** (read-only is all we need) → **Add**.

> **Domain-wide delegation is NOT needed** — you added the account directly as a property user.

### A4. Which property type are you?
- **Domain property** (no `https://`, covers all subdomains) → `GSC_SITE_URL=sc-domain:markdown.free`
- **URL-prefix property** (the full URL with trailing slash) → `GSC_SITE_URL=https://www.markdown.free/`

If unsure, look at the property picker in Search Console: a bare `markdown.free` = Domain; a `https://www.markdown.free/` entry = URL-prefix. The service account must be a user on the **specific** property whose `GSC_SITE_URL` you use.

### A5. Put it in `.env`
```bash
GSC_SERVICE_ACCOUNT_KEY=/Users/you/.secrets/gsc-key.json
GSC_SITE_URL=sc-domain:markdown.free        # or https://www.markdown.free/
```

### A6. Verify
```bash
npm run report:gsc
```
You should see your top queries + pages. If you get **403 / "User does not have sufficient permission"**, the service account isn't added to *this* property (redo A3) or you picked the wrong `GSC_SITE_URL` type (A4). Fresh GSC data lags ~2–3 days (by design; the collector ends its window 3 days back).

---

## Part B — Vercel (Web Analytics + conversion events) · ~3 min

### B1. Create a token
1. Go to <https://vercel.com/account/tokens> (Account → **Settings → Tokens**).
2. **Create Token** → name it `markdown-growth`, set an expiration if you like.
   - **If markdown-free lives under a Team**, scope the token to that team.
3. Copy the token immediately (shown once).

### B2. Find the project (and team) id
- `VERCEL_PROJECT_ID` can be the project **name**: `markdown-free`.
- If the project is **team-owned**, you also need the team id: Vercel → team → **Settings → General → Team ID** (`team_…`). Personal-account projects don't need it.

### B3. Put it in `.env`
```bash
VERCEL_TOKEN=xxxxxxxxxxxxxxxx
VERCEL_PROJECT_ID=markdown-free
# VERCEL_TEAM_ID=team_xxxx        # ONLY if the project is team-owned
```

### B4. Verify
```bash
npm run report:vercel     # visits: top pages, referrers, countries
npm run report:events     # conversions by type + CJK/Latin script + funnel
```
- `report:vercel` should list your top pages/referrers.
- `report:events` reads the app's existing custom events (`convert_success`, `locale_conversion`). **If it errors that the events API is unavailable**, your plan tier doesn't expose custom-event queries — tell me and I'll build the tiny first-party `/api/ev` sink instead (impl doc §18 #2). Visits still work regardless.

> **Plan note:** on **Hobby**, the analytics API reaches back only ~1 month. That's fine — the loop commits every snapshot to git, so git history is the long-term archive.

---

## Part C — Light it all up
```bash
npm run snapshot
```
You should now see `bing`, `gsc`, `vercel`, `events` all collect (and `referral` derived from Vercel). Any channel still missing creds is skipped, not fatal.

```bash
npm run growth:cycle      # the full unattended cycle: snapshot → measure → analyze → digest
```

---

## Troubleshooting
| Symptom | Fix |
|---|---|
| GSC `403 permission` | Service-account email not added to *this* property (A3), or wrong `GSC_SITE_URL` type (A4). |
| GSC `invalid_grant` on token | System clock skew, or the key JSON is malformed / wrong file path. |
| GSC returns 0 rows | New property, or the date window predates verification. Data also lags ~2–3 days. |
| Vercel `403 / forbidden` | Token not scoped to the team that owns the project, or missing `VERCEL_TEAM_ID`. |
| Vercel events error | Plan tier lacks custom-event queries → build the `/api/ev` sink (ping me). |
| Baidu skipped | Optional (P1b). Export a CSV from 百度搜索资源平台 and set `BAIDU_CSV`. |

## Security recap
- The GSC key is a credential — keep it outside the repo (or named `*gsc-key*.json`, which is git-ignored). Load it by absolute path.
- `.env` is git-ignored; never commit it. Rotate the Vercel token if it leaks (Vercel → Tokens → delete).
