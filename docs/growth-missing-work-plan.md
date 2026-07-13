# Growth Intelligence — Implementation Plan for the Missing Work

> **Status:** Plan for review. Built so far: **P0–P5 on branch `growth-loop-p0`** — the full measurement + optimization loop mining **internal** analytics (GSC/Bing/Vercel/events/referral) → Signal Warehouse → Confidence/Opportunity engines → Knowledge Base → measure/learn/meta. This doc scopes everything **not yet built**.
> **Date:** 2026-07-13

## What's missing, in one screen
The platform today **optimizes what exists** from its own analytics. It does **not** yet: (a) discover *demand* from the outside world, (b) discover *new* pages/keywords, (c) measure conversions by file-type, or (d) do community-reply distribution. Four workstreams close those gaps, in rough priority order.

| WS | Gap | Effort | Needs from you | Value |
|---|---|---|---|---|
| **W4** Calibration & hardening | noise in regression watch; unproven thresholds | S | — | keeps the loop trustworthy |
| **W2** Growth-side signal expansion | can't propose *new* pages, only tune existing | M | (optional) rank-tracker budget | net-new SEO opportunities |
| **W3** Measurement completeness | conversions by *type* missing; no A/B; Baidu idle | M | Baidu CSV; later, traffic for A/B | closes the moat metric |
| **W1** Demand discovery & distribution | the painpoint loop's whole reason for existing | **L** | GitHub token; a real community account | *demand-in*, not just performance-out |

---

## W4 — Calibration & hardening (do first; autonomous, ~half a day)
Small fixes that make the existing loop more trustworthy before we pile more on it.
1. **Regression min-clicks floor** — the `/vi` "regression" (clicks 3→2) is noise; the `clicks_drop` trigger fires on tiny-volume pages. Add a floor (only flag if prior clicks ≥ ~10) in `analyze.mjs`. *(one-line change I already flagged.)*
2. **Threshold calibration hooks** — `meta.mjs` already advises tuning the confidence threshold + portfolio mix from outcomes; wire its suggestions into the digest once experiments resolve (Aug 1+).
3. **Snapshot retention** — snapshots commit forever; add a simple prune/rollup (keep dailies 90d, then weekly) if the archive grows large.

## W2 — Growth-side signal expansion (unlocks "propose NEW pages")
Today `discover.mjs` mines only channels where we already rank. To find pages we *don't* have yet, add external SEO-intent collectors feeding the Signal Warehouse.
- `scripts/growth/market/autocomplete.mjs` — Google/Bing autocomplete + People-Also-Ask + related searches (unofficial endpoints, free). **Highest value/effort ratio** — turns "markdown to ___" prefixes into new-page candidates.
- `scripts/growth/market/trends.mjs` — Google Trends interest/rising queries (unofficial).
- `scripts/growth/market/competitor.mjs` — competitor pages / ranking movement (needs a SERP or rank source; some paid — start with sitemap/OG scraping, free).
- **Wiring:** these emit `kind: 'search_intent' | 'competitor'` signals; the Opportunity Engine already handles new candidates — new-page proposals become `🟡 needs-approval` items (content, not mechanical).

## W3 — Measurement completeness
1. **`/api/ev` first-party event sink** — the one conversion dimension Vercel can't give is **by type** (pdf/docx/png). Add `app/api/ev/route.ts` that appends `{ts, type, script, locale}` to a store the snapshot reads; tag the existing `convert_success` client call. No third-party tracker (decision #5). ~half a day.
2. **Per-user on-page A/B (P5)** — for conversion elements only (CTA/hero/FAQ), never rankings; needs a lightweight app-side variant harness + enough traffic for significance. Defer until traffic supports it.
3. **Baidu** — collector is built; activate by exporting a CSV from 百度搜索资源平台 and setting `BAIDU_CSV`. Treat first pulls as a coverage probe.

## W1 — Demand discovery & distribution (the painpoint loop, unbuilt)
The biggest and highest-risk workstream. Build in strict order; each stage gates the next.

**D1 · Social collectors (deterministic, no LLM)** — feed the warehouse with real painpoints.
- `scripts/growth/social/{github,stackoverflow,hackernews}.mjs` — GitHub Issues/Discussions search, Stack Exchange API, HN Algolia API. All free (GitHub wants a token for rate limits). Reddit = restricted → manual queue or skip (state the blind spot).
- New store `data/painpoints.json` (`painpoint_item` records) + `data/seen.json` (dedup). Same raw-fetch style as existing collectors.

**D2 · Consolidate (LLM — the first genuinely-model step)** — cluster raw items into `painpoint_theme`s.
- This is judgment work, so it runs as an **agent step** in `/growth-loop` (or a headless `claude -p` job), *not* a deterministic script — the one place the loop needs a model.
- Cross-reference each theme against our own funnel (is the demand real here, or loud-online-only? — reuse the `ownFunnel` idea). Output `data/themes.json` with representative quotes + source links.

**D3 · Triage → Opportunity Engine (product track)** — themes become `track: 'product'` candidates (the field already exists, nothing feeds it yet). Score with the moat filter + goals; add **build / defer / decline** states to the digest; human approves at the weekly gate.

**D4 · Distribution (listen-for-new + reply-to-fresh)** — highest-risk, most human-gated; build last.
- `watch` records: activate when a feature ships against a theme.
- Listen-for-new: social collectors flag NEW items matching an active watch.
- Reply-to-fresh: LLM drafts an anti-shill reply; **human posts** from a real account; `reply` ledger + UTM tags. Volume cap 1–3/week. **Never auto-post.**

---

## Recommended sequencing
1. **Now (autonomous):** W4 (regression floor) + W2 autocomplete collector — cheap, high value, no dependencies.
2. **Next (small app change):** W3 `/api/ev` sink — completes the moat metric.
3. **Then (the big build):** W1 D1→D2→D3 — social discovery + LLM clustering + product-track triage. Prove it surfaces one real, correctly-triaged painpoint before D4.
4. **Last / opportunistic:** W1 D4 distribution (needs a real community account), Baidu (needs CSV), per-user A/B (needs traffic).

## What needs you (one-time / external)
- **GitHub token** (`GITHUB_TOKEN`) for D1 rate limits — optional but recommended.
- **Reddit decision** — accept the blind spot or invest in a manual queue.
- **Baidu** account + CSV export (W3).
- **A community account with genuine history** for D4 replies — can't be automated; the anti-astroturfing guardrail depends on it.
- **(optional) rank-tracker budget** for W2 competitor monitoring — start free (scraping) if not.

## Discipline (unchanged)
Per the frozen `growth-impl.md`: deterministic core stays cheap (collectors, scoring); the model is reserved for genuine judgment (D2 clustering, `/growth-loop` refinement). Never auto-deploy, never auto-post. Build each layer only after the one beneath it is proven.

Related: `docs/growth-impl.md` (frozen spec), `docs/painpoint-driven-loop-prd.md` (the demand loop this W1 implements), `docs/growth-intelligence-plan.md`.
