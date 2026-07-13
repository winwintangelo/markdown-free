# Growth Intelligence Platform — Implementation Document

> **Status:** Implementation blueprint for review — nothing built yet. Working tree is clean; the exploratory collector code + earlier design drafts from the 2026-07-11 session were reverted, and everything worth keeping is consolidated here.
> **Author/date:** 2026-07-11
> **Supersedes:** the reverted `growth-loop-prd.md` and `growth-intelligence-plan.md`. Will eventually fold in `docs/painpoint-driven-loop-prd.md` (see §2).

---

## North Star, invariants & doc conventions

**North Star.** *The goal of this platform is not to automate growth — it is to systematically improve the quality of growth decisions while keeping humans responsible for strategic direction and production deployment.* Nearly every choice below follows from this one sentence.

**The single most important build rule.** **Ship P0–P2 (the measurement loop), run it in production for a real cycle, THEN build the intelligence layer.** This prevents over-engineering and keeps the system grounded in real feedback. When in doubt, do less and measure.

**Will Never Do — permanent invariants.** Not phases or preferences; boundaries the platform never crosses, whatever a future contributor or a clever ranking suggests:
1. Never **auto-deploy** or **auto-merge** to production.
2. Never **push** to a remote (deny-listed, §10.3).
3. Never **rewrite a major product area** autonomously.
4. Never **launch a user-facing experiment** (survey, on-page A/B) without human approval.
5. Never **collect personal information**; never use **invasive tracking** (no session recordings, no third-party behavioral trackers).
6. Never **optimize traffic at the expense of product quality** — the moat filter and guardrail metrics outrank any traffic win.
7. Never **act on a metric it can't explain** — every proposal and verdict carries its reasoning.

**How this doc is organized (architecture vs implementation).** Treat the **conceptual model as stable architecture** — the loop (§1), the two rails (§4), the three-tier memory model (§7), the engines' *roles* (§8), and the invariants above. Treat **file names, schemas, phase contents, and code sketches as the implementation layer** — expected to evolve as we build; pin them loosely. Where a section mixes both, the prose is architecture and the JSON/paths are implementation.

**Architecture freeze.** With this revision the architecture is **frozen**. The next action is to build P0 — not to add intelligence features. New capabilities earn their way in through the platform's own experiment process, not by expanding this doc.

---

## 0. Purpose & how to read this

This is the single source of truth for building markdown.free's **growth-intelligence platform**: a mostly-autonomous loop that pulls every analytics + market signal, turns observations into confidence-scored experiments, ships the safe ones behind a human gate, measures them rigorously, and accumulates validated learning that steers every future decision.

It is written to be **executed in phases** (P0 → P4). Each section gives the design *and* the concrete artifacts (file paths, schemas, code sketches, commands, acceptance criteria). Read §1–§4 for the shape; §5–§11 for the components; §12 for the build order; §13 for your one-time setup.

**Guiding constraint (repeated throughout):** ship the **measurement loop (P0–P2) first and let it run a real cycle** before building the intelligence layer (P3–P4). Earn each layer with a working one beneath it.

---

## 1. What we're building (one screen)

```
Strategic Goals (quarterly, human-set)
        │  steer ↓
 Signal Sources ─▶ Signal Warehouse ─▶ Confidence Engine ─▶ Opportunity Engine ─▶ Experiment Engine ─▶ Knowledge Base
  passive: GSC·Bing·   (raw obs, aged   (multi-source        (portfolio-balanced,   (cohort DiD,         ▲    │
  Baidu·Vercel·events· New→…→Archived)  evidence→score→      goal-aligned,          guardrails,          │    │
  referral/AI                           graduate ≥ thresh)   moat-filtered rank)    windowed baseline)   │    │
  active: surveys·A/B                                                                          consulted by every stage ◀┘
```

- **Two execution tracks** hang off the Opportunity Engine: **Growth** (SEO / content / page changes — auto-implemented to a branch) and **Product** (feature builds + community reply-to-fresh — human-run).
- **Three memories:** Signal Warehouse (raw, transient), Experiment Ledger (in-flight, resolves), **Knowledge Base** (validated learning, permanent — the compounding asset).
- **Human touchpoints:** quarterly goal-setting · one weekly digest approval · deploy/merge · one-time credential setup. Everything else is autonomous.

---

## 2. Relationship to the painpoint loop

This platform is the merge of two previously-separate loops that shared one skeleton (`signals → ledger → weekly gate → gated action → measure`):

- **Measurement/SEO loop** → the **Growth track** + the performance-signal collectors + the Experiment Engine.
- **Demand/painpoint loop** (`docs/painpoint-driven-loop-prd.md`) → the **market-signal** collectors + the **Product track** (feature build + reply-to-fresh).

Keeping them separate duplicated the skeleton (a risk the painpoint PRD itself named). This doc unifies them. When it's built out, `docs/painpoint-driven-loop-prd.md` gets a "merged into `growth-impl.md`" banner and is kept for history.

**The seam:** the painpoint (market) side discovers *demand themes*; a theme that is a **searchable query intent** graduates into the Opportunity Engine as a new-page candidate (Growth track). A Growth signal that reveals a **missing capability** files back as a Product candidate. One warehouse, one engine, two tracks.

---

## 3. Locked decisions (2026-07-11)

| # | Decision | Detail |
|---|---|---|
| 1 | **Autonomy = Level B** | Loop auto-implements 🟢 safe fixes to a `growth/<date>` branch, then STOPS. Never pushes/deploys. Enforced by a `settings.json` deny-list (deny wins over allow). |
| 2 | **Manual first** | Ship as a `/growth-loop` command run by hand; graduate to a scheduler once proven. |
| 3 | **Wire GSC + Vercel now** | Both are API-automatable (Vercel shipped an official Web Analytics API ~Jun 2026). Umami API is dead → retired. |
| 4 | **Merge both loops** | One growth-intelligence platform (§2). |
| 5 | **Behavioral = first-party only** | Funnel abandonment from our own events + optional scroll depth. No third-party trackers, no session recordings (protect the privacy moat). |
| 6 | **Cadence** | Weekly pulse (regression watch) + 4-weekly deep measurement. SEO crawl→index→rank lag is the loop's clock. |

Still open → §16.

---

## 4. Design principles (the rails)

1. **Two rails steer everything:** **Strategic Goals** say *where to push*; the **moat filter** ("simple, no-signup, CJK-correct") says *what not to dilute*. Every ranking multiplies by both.
2. **Measure the product, not just traffic.** Conversions by type × script (CJK vs Latin) make the moat visible in the metrics. A loop blind to conversions optimizes traffic and dissolves its own differentiator.
3. **Close the loop or it's not a loop.** Every shipped change is an experiment with a hypothesis and a `measure_on` date; the system must return a verdict.
4. **Rigor over vibes.** Trailing-window means, cohort difference-in-differences, guardrail metrics, explicit thresholds, logged confounders.
5. **Compounding memory.** Validated learning persists in the Knowledge Base and is consulted before any new experiment.
6. **Autonomous up to a reviewable branch; never past it.** Deploy is always human.

---

## 5. Repository layout (target)

```
scripts/growth/
  lib.mjs            # shared: env loader, normalized shapes, CSV, date helpers, paths
  bing.mjs           # collector (refactor of existing scripts/bing-report.mjs → module)
  gsc.mjs            # collector (service-account JWT)
  vercel.mjs         # collector (Web Analytics REST API)
  events.mjs         # P1a: conversion events (first-party sink or Vercel custom events)
  referral.mjs       # P1a: derive referral/AI channel from Vercel referrerHostname
  baidu.mjs          # P1b: CSV ingest
  algo-context.mjs   # P1b: algo-update + seasonality context
  snapshot.mjs       # orchestrator → data/snapshots/<date>.json
  ledger.mjs         # P0: experiment-ledger read/measure/update helpers
  signals.mjs        # P3: signal warehouse + confidence + aging
  knowledge.mjs      # P4: knowledge-base topic graph read/write

scripts/bing-report.mjs   # becomes a thin shim → scripts/growth/bing.mjs (keeps npm run report:bing)

data/                     # COMMITTED — git history is the durable archive
  snapshots/<YYYY-MM-DD>.json
  snapshots/latest.json
  ledger.json             # experiment ledger (seeded P0)
  signals.json            # P3 signal warehouse
  knowledge.json          # P4 knowledge base (topic graph)
  goals.json              # P4 strategic goals (quarterly)
  loop-log.md             # human-readable running digest, appended each cycle

.claude/
  commands/growth-loop.md # the invokable loop procedure
  agents/growth-analyst.md# read-only analysis subagent
  settings.json           # committed allow/deny (deny push/deploy)

app/api/ev/route.ts       # P1a: first-party event sink (only if Vercel tier lacks custom events)

docs/growth-impl.md       # this document
```

`package.json` scripts to add: `report:gsc`, `report:vercel`, `snapshot`, and later `growth:*`. `.gitignore`: add the GSC key filename (store the key OUTSIDE the repo and reference by absolute path in `.env`). `data/` is **committed** (not ignored).

---

## 6. Data layer — collectors

### 6.1 Conventions & the `collect()` contract
Every collector is a side-effect-free ES module matching the existing `scripts/` style: no external deps, hand-rolled `.env` loader, raw `fetch`. Each exports:

```js
export async function collect() { /* … */ return { channel, dateRange, ...rows }; }
// plus a CLI mode so it still runs standalone:
if (isMain(import.meta)) runCli();
```

**Normalized SEARCH row** (Bing/GSC/Baidu): `{ key, clicks, impressions, ctr, position }` — `ctr` a percentage number (3.53), `position` numeric or null. **Non-search shapes:** Vercel = `{ path|host|country, pageviews, visitors }`; events = `{ type, script, count }`; referral = `{ host, group, sessions, conversions }`.

`snapshot.mjs` imports every `collect()`, runs them with per-channel `try/catch` (a channel without creds is skipped, not fatal), and writes one committed snapshot.

### 6.2 Bing (exists → refactor)
Port `fetchBing` / `parseMsDate` / `aggregateBy` verbatim from the current `scripts/bing-report.mjs` into `scripts/growth/bing.mjs` as a module (no top-level side effects). Bing returns **weekly** rows; `aggregateBy` collapses to per-item totals with impression-weighted position. Endpoint: `GET https://ssl.bing.com/webmaster/api.svc/json/{GetRankAndTrafficStats|GetQueryStats|GetPageStats}?apikey=&siteUrl=`, `{d:…}` wrapper, `/Date(ms±tz)/` dates. `GetPageStats` carries the URL in the `Query` field (Bing quirk). Env: `BING_API_KEY`, `BING_SITE_URL`. Repoint `scripts/bing-report.mjs` to a thin shim so `npm run report:bing` is unchanged.

### 6.3 GSC (service-account JWT — zero deps)
Endpoint: `POST https://searchconsole.googleapis.com/webmasters/v3/sites/{encodeURIComponent(siteUrl)}/searchAnalytics/query`. Auth: mint an RS256 JWT with `node:crypto`, exchange at `https://oauth2.googleapis.com/token` for an access token (scope `https://www.googleapis.com/auth/webmasters.readonly`). Body: `{ startDate, endDate, dimensions:["query"]|["page"], type:"web", dataState:"final", rowLimit:25000, startRow }`. Paginate `startRow` by 25 000 until a short page. `siteUrl` = `sc-domain:markdown.free` (domain property) — the `:` is percent-encoded by `encodeURIComponent`. Dates are **Pacific**; default range = 31 days ago → 3 days ago (inside finalized data). `ctr` is 0–1 → ×100. Env: `GSC_SERVICE_ACCOUNT_KEY` (abs path to JSON key), `GSC_SITE_URL`. Auth code sketch in Appendix A.

**Caveats to encode:** anonymized queries dropped (by-query sum ≠ true total, ~46% of clicks have no visible query); by-query vs by-page totals differ by design; 16-month retention; API can return a longer tail than the UI CSV.

### 6.4 Vercel (Web Analytics REST API)
Endpoints: `GET https://api.vercel.com/v1/query/web-analytics/visits/{count|aggregate}` (and `/events/*` for custom events). Auth: `Authorization: Bearer $VERCEL_TOKEN`. Params: `projectId` (name `markdown-free` works), `teamId` (only if team-owned), `since`, `until`, `by` (`requestPath`|`referrerHostname`|`country`|`deviceType`), `limit`≤100. Default window 28 days. Env: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID?`. **Plan caveat:** Hobby retains only **1 month** → committing snapshots is the long-term archive. Response envelope is handled defensively (`data`/`rows`/array). Replaces the dead Umami report.

### 6.5 Conversion events (P1a — moat-critical)
Conversions by **script** (CJK vs Latin) and **country/locale** — the moat, made measurable. **RESOLVED against the live Vercel events API (2026-07-12):**
- Vercel **exposes** custom events (`convert_success`, `upload_start`, …) via `/v1/query/web-analytics/events/{count,aggregate}` with `filter=eventName eq '<name>'`.
- It **cannot group by a custom property** (`by=format` / `by=locale` are rejected — `by` only accepts fixed dims: requestPath, country, deviceType, …). So we recover **script** by grouping `convert_success` **by `requestPath`** (the locale is in the path: `/zh-Hans`, `/ja`, …) → map to cjk/latin, and get **by-country** for free.
- Conversions **by type** (pdf/docx/png) — a custom property, so not groupable directly. **Solved (W3, 2026-07-13) without a sink:** the app fires a per-format event `conv_<format>` alongside `convert_success`, and we group by **eventName** (which IS allowed). No `/api/ev` sink or KV needed. Deploy-gated — populates once `src/lib/analytics.ts` ships and events accrue.

Events are **likely already fired client-side** (`src/lib/analytics.ts`, `docs/funnel.md`) — the work is a *readable sink* + tagging each event with `type` and `script`, not net-new instrumentation. **Funnel abandonment** (started-but-didn't-finish) falls out of these events; that is the entirety of our behavioral analytics (decision #5).

### 6.6 Referral / AI channel (P1a — nearly free)
Derive from Vercel `referrerHostname` (already collected). Roll known AI-assistant hosts into an **"AI referral" group**: `chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`/Google-AI, `copilot.microsoft.com`; CN: `doubao.com`, `yuanbao.tencent.com`. Emit `{ host, group, sessions, conversions }`. This channel behaves nothing like search (no query, no rank) and is a growing share for a utility tool.

### 6.7 Baidu (P1b — CSV ingest)
The CN market **directly** (Bing is only a proxy). Baidu 搜索资源平台 API is China-gated, so start with a **manual CSV drop** (same bootstrap as GSC before its API). `baidu.mjs` ingests a dropped CSV into the search-row shape. Treat the first drops as a **coverage probe** — a non-ICP / non-CN-hosted site may index thinly; the data answers "is this even worth automating."

### 6.8 algo-context / seasonality (P1b)
Not a metrics source. Logs confirmed Google/Bing ranking-update windows + a SERP-volatility signal + seasonal markers into each snapshot's `context` block, so experiment verdicts can flag "shipped during a confirmed update / seasonal swing." Makes the confounder mitigation real, not aspirational.

### 6.9 snapshot.mjs + snapshot schema
```jsonc
{
  "date": "2026-07-14",
  "generatedAt": "…",
  "context": { "algoUpdates": [], "volatility": null, "season": null },   // from algo-context
  "channels": {
    "gsc":    { "queries": [...], "pages": [...] },
    "bing":   { "traffic": [...], "queries": [...], "pages": [...] },
    "vercel": { "totals": {...}, "pages": [...], "referrers": [...], "countries": [...] },
    "events": { "byType": [...], "byScript": [...], "funnel": {...} },
    "referral": { "groups": [...], "hosts": [...] },
    "baidu":  { "queries": [...], "pages": [...] }
  },
  "errors": { }   // channels skipped for missing creds
}
```

### 6.10 Passive vs Active (classification)
**Passive** (free, always-on, the default cadence): GSC, Bing, Baidu, Vercel, events, referral/AI, algo-context. **Active** (cost user attention / traffic / time — a **budgeted** resource): micro-surveys, A/B tests, interviews, outreach. Rule: **spend active signals only to break confidence ties** (§8.1), never routinely.

---

## 7. Memory — three tiers

### 7.1 Signal Warehouse — `data/signals.json` (P3)
Raw observations before they're experiments. Aged, trend-driven.
```jsonc
{
  "id": "sig-2026-07-tables-cjk",
  "topic": "tables",                       // graph key (see §7.3)
  "observation": "rising 'markdown table to word' + Reddit thread + competitor page",
  "sources": [ {"channel":"gsc","weight":0.9,"note":"impr +40% WoW"},
               {"channel":"reddit","weight":0.5}, {"channel":"competitor","weight":0.7} ],
  "firstSeen": "2026-07-10", "lastSeen": "2026-07-14",
  "stage": "New|Growing|Hot|Cooling|Archived",   // trend-driven; Archived≠deleted
  "seasonal": false,                              // if true, tag revisit-next-season vs archive
  "confidence": 0.0,                              // set by the Confidence Engine
  "graduatedTo": null                             // experiment id once it graduates
}
```

### 7.2 Experiment Ledger — `data/ledger.json` (P0, the keystone)
Hypotheses under test. Each entry resolves and retires (its learning distills into the Knowledge Base).
```jsonc
{
  "id": "og-image-72pages",
  "title": "og:image on 72 intent pages",
  "hypothesis": "Social cards render → more shares/CTR; no direct rank effect",
  "topic": "social-cards",                        // links into the knowledge graph
  "channel": "vercel|gsc|bing|baidu|referral|events",
  "target_metric": "clicks|impressions|ctr|position|pageviews|conversions",
  "guardrail_metrics": ["position","conversions"],// must NOT regress for a win (kills CTR-bait)
  "target_scope":  { "pages": ["/markdown-to-word"], "queries": [], "country": null },
  "control_scope": { "pages": ["/markdown-in-word"] },  // held-back cohort → difference-in-differences
  "shipped_date": "2026-07-11", "commit": "22b1c05",
  "baseline": { "window_days": 28, "mean": null, "as_of": "2026-07-11" },  // trailing mean, not a point
  "measure_on": "2026-08-08",
  "status": "shipped|measuring|won|lost|inconclusive",
  "outcome": { "treated_delta": null, "control_delta": null, "did": null,
               "guardrails_held": null, "note": "" }
}
```

### 7.3 Knowledge Base — `data/knowledge.json` (P4, the compounding asset)
Validated learning as a **topic graph** (plain JSON adjacency — **not** a graph DB). Consulted before any signal graduates.
```jsonc
{
  "tables": {
    "signals": ["sig-2026-07-tables-cjk"],
    "experiments": [ {"id":"exp-17","change":"add comparison table","result":"won","did":"+0.4 pos","conditions":"CJK pages, ID/JA locales"} ],
    "learnings": [
      { "claim": "FAQ schema wins on the -word- cluster (+CTR, position held)",
        "evidence": ["exp-17","exp-31","exp-42"], "confidence": 0.91 },
      { "claim": "CJK pages respond more to on-page than to backlinks",
        "evidence": ["exp-24"], "confidence": 0.6 }
    ],   // learnings cite the experiments behind them → recommendations are explainable, not opaque
    "confidence_prior": 0.7,                       // seeds confidence for new 'tables' signals
    "related": ["markdown-to-word", "formatting"]  // adjacency for hypothesis propagation
  }
}
```

---

### 7.4 Module interfaces — nothing touches JSON directly
Each data tier is reached **only** through a small service module; no stage or engine opens `data/*.json` itself. This encapsulates storage so the on-disk format can change without touching callers, and makes each tier unit-testable with a fake store.

```
SnapshotStore    : write(snapshot) · latest() · at(date) · range(days)
ExperimentLedger : open(entry) · due(asOf) · record(id, outcome) · byTopic(topic) · all()
SignalWarehouse  : add(obs) · get(filter) · update(id, patch) · age() · graduate(id) → experiment
KnowledgeBase    : find(topic) · learn(topic, learning) · similar(topic) · prior(topic) → confidence · evidenceFor(claim)
```

Rule: a stage/engine calls these functions; it never reads or writes the JSON directly. Storage-format migrations, atomic writes (§17), and schema checks all live behind these interfaces.

## 8. Engines

### 8.1 Confidence Engine (P3)
Graduation is explicit. A signal accrues **evidence from multiple independent sources**, each weighted, into a score `∈ [0,1]`; it graduates to an experiment only above a threshold (start ~0.6, tune).
- **Weighting:** our **own funnel/analytics corroboration is weighted highest** — a signal visible in our conversion data beats loud external chatter. (This is the painpoint loop's "loud-online-but-invisible-in-funnel = low confidence," made computable.)
- **Multi-source corroboration > one loud channel.** Two independent mid-strength sources beat one screaming source.
- **Prior from the Knowledge Base:** a new signal on a topic inherits `confidence_prior` from past outcomes on that topic.
- **Break ties with active signals:** when a high-value signal is stuck mid-confidence, spend one active probe (survey/A-B) — never routinely.
- **Expose the dimensions, not just a number** (so tuning + debugging are possible). Store confidence as a breakdown: `{ score, quality, quantity, recency, ownFunnel }` — e.g. `{score:0.81, quality:0.42, quantity:0.95, recency:0.93, ownFunnel:0.70}`. `score` is the weighted blend; the components explain *why* it's high or low (here: lots of recent evidence, but each source is individually weak → investigate quality before graduating).

### 8.2 Opportunity Engine (P3)
Turns graduated signals into a **ranked portfolio**, not a naked list.
- **Score** = `impact × effort⁻¹ × confidence × moat_alignment × goal_alignment`. `moat_alignment` down-weights anything diluting "simple, no-signup, CJK-correct"; `goal_alignment` boosts candidates advancing the quarter's Strategic Goals (§9).
- **Portfolio buckets** (so it doesn't chase easy SEO wins forever): ~**40% quick wins / 30% strategic bets / 20% maintenance / 10% wildcards**. The mix **tilts by the quarter's goals** (goal = "expand CN" → strategic-bets slice leans CN). "Maintenance" = keep shipped wins healthy + regression fixes.
- **Tag each candidate:** track (Growth | Product) and gate (🟢 auto-safe | 🟡 needs-approval).
- **Explain every ranking.** Each proposed item carries a `why` — its contributing factors + confidence — rendered in the weekly digest, e.g.:
  > **#3 · Markdown Tables guide** — *growing search demand · competitor launched a similar page · strong goal-alignment (CN expansion)* · confidence 81%
  An unexplained rank is not shippable; the `why` is what makes the ~5-minute human review possible.

### 8.3 Experiment Engine (P0 core, extended P3)
- **Cohort difference-in-differences** across the 72-page template: apply a change to **half (treated)**, hold **half (control)**, score `treated Δ − control Δ`. Cohorts **balance-assigned** (matched on baseline impressions + locale) so pre-period trends are parallel. This neutralizes seasonality + algo confounders directly.
- **Windowed baselines:** compare **trailing-28-day means** both sides, not single points (single points are noise for a small site).
- **Guardrail metrics:** a win requires no guardrail regressed (kills CTR-bait — a title rewrite that wins CTR but loses position/conversions is not a win).
- **Regression thresholds** (weekly watch): eligibility = above an impressions floor; alert = position worsens ≥ X or clicks/conversions drop ≥ Y% WoW **and** past the item's noise band. Below threshold → logged, not surfaced.
- **Per-user A/B** is valid **only** for conversion elements (CTA/hero/FAQ order), **only** once the event layer + enough traffic exist, and **never** for rankings (Google sees one page). P3+ gated.

### 8.4 Learn (P4 — the back-edge that compounds)
On verdict: distill the experiment into a Knowledge Base learning under its topic, update `confidence_prior`, and:
- **Wins branch:** propose adjacent hypotheses via the graph (Word-FAQ won → PDF-FAQ, Google-Docs-FAQ, Tables-guide).
- **Losses prune:** suppress the same pattern on sibling topics — one loss must not spawn three losers.

---

## 9. Strategic Goals layer (P4 — the alignment rail)
`data/goals.json`, **quarterly, human-set**. The engine asks *"the biggest opportunity that advances THIS quarter's objective,"* not just *"the biggest opportunity."*
```jsonc
{
  "period": "2026-H2",
  "goals": [
    { "id":"ai-referrals", "title":"Grow AI-assistant referrals", "metric":"referral.groups.ai.sessions", "target":"+50%" },
    { "id":"cn-market",    "title":"Expand Chinese market",       "metric":"baidu+bing CN impressions",   "target":"+30%" }
  ]
}
```
Each goal **binds to a metric the loop already tracks**, so `goal_alignment` is computed, not vibes. Distinct from the moat filter: **goals say where to push; the moat says what not to dilute.** Setting goals each quarter is a low-frequency human touchpoint.

---

## 10. Loop packaging (Claude Code)

### 10.1 `/growth-loop` — a THIN orchestrator over independent stages
The command owns **no logic**; it sequences **discrete, independently-runnable stages**, each its own script with a clear input→output contract, so any stage can be run, tested, and debugged alone:

```
/growth-loop → snapshot → measure → analyze → propose → implement → summarize
```

| Stage | Script | Reads → Writes | Notes |
|---|---|---|---|
| `snapshot` | `snapshot.mjs` | collectors → `data/snapshots/<date>.json` | P0 |
| `measure` | `ledger.mjs` | snapshot + ledger → updated ledger | trailing means · DiD · guardrails · `context` (P0); distill to KB (P4) |
| `analyze` | `analyze.mjs` | 2 snapshots → deltas + regression alerts (thresholds §8.3) | P0; warehouse consolidation + aging (P3) |
| `propose` | `propose.mjs` | analysis + signals + goals → ranked, **explained** digest → `loop-log.md` | portfolio · moat · goal-align · **why** (P3, §8.2) |
| `implement` | `implement.mjs` | 🟢 items → `growth/<date>` branch (tsc + e2e + commit) | Level B; **never push**; revert-on-fail |
| `summarize` | `summarize.mjs` | all outputs → the "your move" summary + health block (§16) | — |

Each stage is a plain `npm run growth:<stage>`; `/growth-loop` just runs them in order and **stops on the first failure** (a partial run is recoverable — §17). Analysis stages (`snapshot`/`measure`/`analyze`/`propose`) are read-only and run via the `growth-analyst` subagent / `--permission-mode plan`; only `implement` writes, and only to a branch.

### 10.2 `growth-analyst` subagent — `.claude/agents/growth-analyst.md`
Read-only (`Read, Grep, Glob`, + the report scripts). Handles the analysis phase so it can't accidentally edit.

### 10.3 `.claude/settings.json` (committed deny-list)
```jsonc
{
  "permissions": {
    "allow": [
      "Bash(node scripts/growth/*)", "Bash(npm run snapshot:*)", "Bash(npm run report:*)",
      "Bash(npm run build:*)", "Bash(npm run test:*)", "Bash(npx tsc:*)", "Bash(npx playwright test:*)",
      "Bash(git add:*)", "Bash(git commit:*)", "Bash(git switch:*)", "Bash(git checkout -b:*)",
      "Bash(git status:*)", "Bash(git diff:*)"
    ],
    "deny": [
      "Bash(git push:*)", "Bash(git merge:*)", "Bash(vercel:*)", "Bash(npx vercel:*)", "Bash(npm run deploy:*)"
    ]
  }
}
```
`deny` wins over `allow` — a hard block even if the agent tries to push/deploy.

### 10.4 Notification & scheduling
- **Stop hook** → desktop/Slack ping when the digest is ready.
- **Scheduling:** manual `/growth-loop` first. Then **Routines** (cloud cron, runs with laptop off; pair with plan-mode + deny-list) or a **GitHub Actions** scheduled workflow wrapping `claude -p --permission-mode plan --max-turns N`. Cap runs with `--max-turns`.

---

## 11. Human touchpoints & guardrails
**Touchpoints (everything else autonomous):** quarterly goal-setting · one weekly digest approval (~5–10 min) · deploy/merge · one-time credential setup.
**Guardrails:** deny-list (push/deploy hard-blocked) · read-only analysis phase · branch-only implementation · `--max-turns` cap · human merge · moat filter on every proposal · first-party-only behavioral data.

---

## 12. Phased build (with acceptance criteria)

| Phase | Build | Needs from you | Done when |
|---|---|---|---|
| **P0 — Foundation** | `lib.mjs` · refactor `bing.mjs` (+ shim) · `snapshot.mjs` · `ledger.mjs` + **seeded `data/ledger.json`** · `/growth-loop` command · `growth-analyst` subagent · `.claude/settings.json` · package.json scripts | nothing | `npm run snapshot` writes a committed snapshot from Bing; `/growth-loop` runs manually, produces a digest, and measures due ledger entries |
| **P1a — Kill manual pulls + see the product** | `gsc.mjs` · `vercel.mjs` · `events.mjs` (+ `/api/ev` if needed) · `referral.mjs` | GSC service account, Vercel token | all four search/analytics channels + conversions (type×script) + AI-referral auto-collect; zero manual downloads |
| **P1b — CN + confounders** | `baidu.mjs` (CSV) · `algo-context.mjs` | Baidu webmaster CSV | CN seen directly; algo/seasonality in each snapshot's `context` |
| **P2 — Schedule** | Routines / GH Action + Stop-hook notification | pick mechanism | hands-off weekly digest lands with a ping |
| **P3 — Discovery** | Signal Warehouse (`signals.mjs`) · Confidence Engine (dimensional) · Opportunity Engine (portfolio, goal-aligned, **explained**) — **read-only proposals only** | — | signals graduate on confidence; the digest proposes *new* pages, portfolio-balanced, each with a `why` |
| **P4 — Learning** | Knowledge Base (`knowledge.mjs`, evidence-linked learnings) · experiment→experiment feedback (branch/prune) · opportunity aging · engine-proposed changes flow into the `implement` stage · `goals.json` + goal-alignment | quarterly goals | a resolved experiment updates the KB with evidence and spawns/prunes adjacent hypotheses |
| **P5 — Optimization** | strategy/goal optimization · per-user on-page A/B (event-gated, conversion elements) · meta-learning (tune confidence weights + portfolio mix from measured outcomes) | — | the platform improves its own scoring from real results |
| **Unify doc** | Fold `painpoint-driven-loop-prd.md` in; banner it | — | one source of truth |

**Discipline:** P0–P2 is the measurement loop — ship it and run one real cycle before P3–P5. Smaller milestones each validate before the next.

**Two kinds of auto-implement (the reviewer's one lump, split):** (a) 🟢 **mechanical fixes** surfaced by the regression watch/diff — available from **P0** under Level B, no engine needed (broken link, missing schema, meta tweak); (b) **engine-proposed** changes (new pages/content from the Opportunity Engine) — flow into the `implement` stage at **P4**. Both stop at a branch; both never push.

**Build status (2026-07-13): P0–P5 all implemented** on branch `growth-loop-p0`. The intelligence layer runs deterministically each cycle — `discover` (Signal Warehouse + Confidence Engine, multi-source corroboration) → `propose` (Opportunity Engine: portfolio-balanced, goal-tilted, moat-weighted, explained) → `measure`→`learn` (Knowledge Base: wins branch / losses prune) → `meta` (advisory tuning). The `/growth-loop` agent **refines** the engine's output; it no longer builds proposals from scratch. **Deferred (P5): per-user on-page A/B** — needs an app-side experiment harness + traffic volume for significance; out of scope for the analytics loop. **Market-signal sources** (search-intent autocomplete/Trends, competitor, community) are additional Signal Warehouse *inputs* to layer in later; the engine currently mines the internal channels (GSC/Bing/Vercel/events), which already produce a strong graduated portfolio.

---

## 13. Your one-time setup (unblocks P1)

**GSC (~10 min):** Google Cloud → enable **Google Search Console API** → create a service account (`gsc-reader`) → **Keys → Add key → JSON**, download it → in **Search Console → Settings → Users and permissions**, add the service account's email (Restricted/read-only). No domain-wide delegation. `.env`:
```
GSC_SERVICE_ACCOUNT_KEY=/absolute/path/outside/repo/gsc-key.json
GSC_SITE_URL=sc-domain:markdown.free        # or URL-prefix: https://www.markdown.free/
```
Add the key filename to `.gitignore` (or keep it outside the repo entirely).

**Vercel (~3 min):** Vercel → **Settings → Tokens** → create (scope to the team if the project is team-owned). `.env`:
```
VERCEL_TOKEN=…
VERCEL_PROJECT_ID=markdown-free
VERCEL_TEAM_ID=team_…        # only if the project is team-owned
```

**Baidu (P1b, optional):** verify the site in 百度搜索资源平台, export the performance CSV, drop it in an agreed folder for `baidu.mjs`.

---

## 14. Seeded experiments (measure ~2026-08-08)
Seed `data/ledger.json` from real shipped commits so there's history to score: `0378273` (word cluster + dynamic sitemap + hreflang), `22b1c05` (og:image ×72 + RelatedTools + EPUB FAQ), `3a48079` (server-side `<html lang>`), `7c36729` (md→png feature), `62bf43a` (CJK 转word/转epub tuning). Because the loop didn't exist pre-ship, **backfill baselines** from GSC (~16 mo) / Bing history; where unavailable, score pre/post and flag low-confidence.

---

## 15. Risks & mitigations
| # | Risk | Mitigation |
|---|---|---|
| 1 | Acting on noise | Weekly = watch-only above thresholds; decisions on the 4-week cycle; trailing-mean verdicts; `measure_on = ship+28d`. |
| 2 | Correlation ≠ causation | Cohort DiD vs a held-back control cancels seasonality/algo; `algo-context` logs update windows; one primary change per experiment. |
| 3 | Unattended agent ships something | Deny-list · read-only analysis · branch-only · `--max-turns` · human merge. |
| 4 | Data gaps read as truth | Caveats encoded (anonymized queries, Hobby 1-mo, sampling); snapshots committed; totals never assumed to reconcile across dimensions. |
| 5 | Metric-chasing erodes the moat | Moat filter on every score; **first-party-only** behavioral data (no invasive trackers); goals + moat as the two rails. |
| 6 | Over-building the intelligence layer | Strict phase gating — earn each layer with a working one below it (§12). |

---

## 16. Platform observability (the loop watches itself)
An autonomous loop must monitor its own health. Each run stamps a **health block** (in the snapshot's `meta`, surfaced at the top of the weekly digest by `summarize`); anything red is flagged for you.

- **Freshness** — last successful run · snapshot age · any channel whose data is staler than expected.
- **Collectors** — per-channel success / skip / error · API quota + rate headroom (esp. GSC, Vercel) · missing-data flags.
- **Consistency** — ledger integrity (no entry past `measure_on` left unscored) · experiment backlog size · schema-version check on `data/*`.
- **Performance** — run duration per stage.

Lightweight by design: a health block + digest surfacing, not a separate dashboard. A real dashboard is a later, opt-in nicety — do not build it before the loop runs.

---

## 17. Failure modes & recovery (degrade, never corrupt)
Autonomy demands explicit recovery. Principle: **fail soft, never leave state half-written.** All writes are atomic (write temp → `rename`); a failed stage stops the orchestrator with a clear cause and leaves prior state intact; stages are idempotent per day, so re-running resumes cleanly.

| Failure | Detection | Recovery |
|---|---|---|
| GSC / Bing / Vercel down or timing out | non-2xx / timeout in a collector | that channel is **skipped** (recorded in `snapshot.errors`); other channels still snapshot; digest notes the gap |
| Missing credentials | env var absent | channel skipped with a "run §13 setup" hint; never fatal |
| Partial snapshot | `errors` non-empty | snapshot still written + committed with what succeeded; `measure`/`analyze` operate on available channels; flagged in the digest + health block |
| Corrupted / unreadable `data/*.json` | JSON parse fail or schema check | the tier's service module (§7.4) refuses to write, restores the last good version (`git show HEAD:data/…`), and **aborts the run with a clear message** — never overwrites good state with garbage |
| Failed 🟢 implementation (tsc / e2e red) | non-zero exit | **revert that item** on the branch, keep the rest, report it as needing your hand; no ledger entry is written for it |
| Stage crash mid-run | orchestrator catch | stop at that stage; completed stages' outputs persist; re-run resumes (idempotent per day) |
| Rate-limit / quota hit | 429 / quota header | back off; skip that channel this run; surface in observability |

---

## 18. Open questions (need your call)
1. **Attribution vs intent micro-survey** — one sampled, post-success, optional-tap question: "how did you find us?" (attribution / dark traffic) **or** "what were you trying to do?" (intent). Which — or rotate? Must not dent the under-30-seconds, no-signup ethos. (Product change.)
2. **Event sink** — **RESOLVED (2026-07-13):** by-script + by-country + funnel work via `requestPath`; by-type now works too via per-format `conv_<format>` events grouped by eventName (W3) — no `/api/ev` sink needed.
3. **Confidence threshold + portfolio mix** — start values (threshold ~0.6; 40/30/20/10) are guesses to calibrate once real signals flow.
4. **Baidu** — worth the CSV workflow, or park until Bing/GSC show CN is capturable at all?
5. **Scheduler** — Routines vs GitHub Actions when we reach P2.

---

## Appendix A — GSC service-account auth (zero-dep sketch)
```js
import crypto from 'node:crypto';
const b64url = (b) => Buffer.from(b).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
async function getAccessToken(key) {                     // key = parsed JSON service-account file
  const now = Math.floor(Date.now()/1000);
  const head = b64url(JSON.stringify({ alg:'RS256', typ:'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email, scope:'https://www.googleapis.com/auth/webmasters.readonly',
    aud:'https://oauth2.googleapis.com/token', iat: now, exp: now+3600 }));
  const input = `${head}.${claim}`;
  const sig = b64url(crypto.sign('RSA-SHA256', Buffer.from(input), key.private_key));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({ grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion:`${input}.${sig}` }) });
  if (!r.ok) throw new Error(`GSC token ${r.status}`);
  return (await r.json()).access_token;
}
// then: POST …/sites/{encodeURIComponent(siteUrl)}/searchAnalytics/query with Bearer token,
// body { startDate,endDate,dimensions,type:'web',dataState:'final',rowLimit:25000,startRow }, paginate.
```
(The JSON key file's `private_key` is already valid PEM after `JSON.parse` — no `\n` fix-up needed when read from the file.)

---

_Architecture **frozen** 2026-07-11. Load-bearing choices: the North Star + invariants (top), the two rails (§4), the three-tier memory (§7), and the phase discipline (§12). **Next action: build P0 — not add features.**_
