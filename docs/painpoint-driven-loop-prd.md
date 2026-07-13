# PRD: Demand-Driven Feature & Distribution Loop

> **Status:** Revised after product-team review — decisions resolved inline; see §9
> **Date:** 2026-05-16
> **Author:** Drafted in the markdown-promotion framework repo; intended to be built in the markdown.free product repo.
> **One-line:** Discover real markdown painpoints online → consolidate → build targeted features → respond to fresh posts with the solution. A demand-driven loop that feeds both the product roadmap and distribution.

> **⇢ MERGE + IMPLEMENTATION STATUS (2026-07-13).** This loop was **merged into the growth-intelligence platform** (`docs/growth-impl.md`), built on branch `growth-loop-p0`. The **shared skeleton** (signal store → weekly digest → one human gate → gated action → measure) plus the **moat filter**, **own-funnel cross-reference**, and **Knowledge Base** are **implemented** — but by the *growth/SEO* half, mining **internal analytics only** (`scripts/growth/*`, not `scripts/loop/*`). The painpoint loop's **distinctive demand-discovery + distribution half is NOT built.** Per-stage:
> - **1 Discover (external social: GitHub/SO/HN/Reddit)** — ❌ not built. `discover.mjs` mines internal channels (GSC/Bing/Vercel/events), not social sources.
> - **2 Consolidate (LLM theme-clustering)** — ❌ not built. Signals are per-page/query, deterministic — no clustering of social complaints into themes.
> - **3 Triage** — 🟡 partial. Moat filter ✅ (heuristic in `opportunity.mjs` + `goals.mjs`, not the "encoded ruleset" envisioned); build/defer/decline decision states ❌; `track: growth|product` field exists but nothing feeds the product track.
> - **4 Build handoff tagged with theme-ID** — ❌ ledger has `topic`/`commit`, not social painpoint-theme IDs.
> - **5 Listen-for-new (active watches)** — ❌ no `watch` table, no new-post detection.
> - **6 Reply-to-fresh (LLM draft → human post, UTM, reply tracking)** — ❌ not built at all.
> - **Data model** `painpoint_item / painpoint_theme / watch / reply` — ❌ (growth uses `signals` [internal] / `ledger` / `knowledge` instead).
> - **Shared infra** ✅: Signal Warehouse + Experiment Ledger, weekly digest + one approval gate, committed-JSON-in-git review surface, Knowledge Base, measurement/attribution (`measure_on`, learn).

---

## 1. Summary

Today, promotion for markdown.free is **supply-driven**: the team decides what to build and what content/links to push, then hopes demand follows. This PRD proposes inverting that — a **demand-driven loop** where discovered painpoints drive the roadmap, and shipped features become credible, high-intent distribution by responding to people actively expressing those painpoints.

The loop has six stages: **discover → consolidate → triage → build → listen-for-new → reply-to-fresh.** Stages 1-3 are automated — including triage, where an LLM scores themes against an encoded moat-alignment filter. Stage 4 is the existing product dev process. Stages 5-6 are automated detection plus LLM-drafted, human-posted response. The system has exactly two human touchpoints: a weekly ~5-minute digest approval (signing off the automated triage), and posting the 1-3 selected replies.

The system's value is not "more content" — it's tightening the feedback distance between what users actually struggle with and what the product ships and says.

---

## 2. Problem & motivation

- The highest-converting distribution is answering someone's *actual stated problem*. A reply that genuinely solves a stated painpoint is the least promotional, highest-intent form of distribution available.
- markdown.free's existing promotion (SEO, backlinks, community posts) is high-effort and supply-driven — it manufactures reasons to be discovered.
- markdown.free already has unsought AI-channel traction (ChatGPT is the #1 referral source) and a clear differentiator (CJK-correct, no-signup, browser-based). A demand-driven loop compounds an existing strength rather than fighting for attention from zero.
- Painpoint discovery produces a second dividend: a consolidated painpoint digest is also the best possible input for content (FAQ, comparison articles, the CJK technical writeup) — demand-validated instead of guessed.

---

## 3. Goals & non-goals

### Goals
1. A repeatable pipeline that surfaces **ranked, evidence-backed** markdown/document-conversion painpoints.
2. Feed the product roadmap with **demand-validated** feature candidates.
3. Convert shipped features into distribution by responding to **fresh** posts expressing that painpoint.
4. Make the **discovery → ship → response → outcome** chain measurable per painpoint.

### Non-goals
- **Not a replacement** for existing SEO/content work — complementary; it becomes the requirements engine upstream of it.
- **Not automated posting.** Every external reply is human-gated.
- **Not a general social-listening tool.** Scoped to markdown / document-conversion painpoints.
- **Not a roadmap authority.** It informs prioritization; humans decide.

---

## 4. Success metrics

| Metric | Type | Target / note |
|---|---|---|
| Median latency: painpoint discovered → feature shipped | **Primary (loop health)** | With 1-2 features/week capacity, a `build`-triaged theme should ship within ~2-4 weeks. Latency creeping past ~6 weeks signals a triage or capacity problem — see Risk 1 |
| Distinct painpoint themes surfaced per quarter (with evidence) | Coverage | Directional; quality over volume |
| Features shipped attributable to the loop | Conversion | The loop justifies itself only if features actually ship |
| Reply → visit → convert funnel, per responded painpoint | Distribution | Tracks whether the response stage works |
| External replies posted per week | **Guardrail** | Keep low (1-3/wk). 0 account warnings/bans is a hard requirement |

---

## 5. The loop

```
  ┌─────────────┐   ┌──────────────┐   ┌──────────┐
  │ 1. DISCOVER │──▶│ 2.CONSOLIDATE│──▶│ 3.TRIAGE │
  │  (auto)     │   │  (auto, LLM) │   │ (LLM)    │
  └─────────────┘   └──────────────┘   └────┬─────┘
        ▲                                   │
        │                                   ▼
        │                            ┌─────────────┐
        │                            │ 4. BUILD    │
        │                            │ (product    │
        │                            │  dev proc.) │
        │                            └──────┬──────┘
        │                                   │ feature ships,
  ┌─────┴────────┐   ┌──────────────┐        │ tagged w/ theme ID
  │ 6. REPLY     │◀──│5.LISTEN-FOR- │◀───────┘
  │ TO FRESH     │   │   NEW        │
  │ (human gate) │   │  (auto)      │
  └──────────────┘   └──────────────┘
```

**Human touchpoints:** triage runs automatically (LLM, stage 3). The only recurring human work is a weekly **digest approval** — a ~5-minute sign-off on the consolidated themes and the LLM's `build`/`defer`/`decline` recommendations — plus posting the selected replies (stage 6). Everything else is automated.

Key design correction: you **cannot** build a feature and then reply to the *original* posts — by the time a feature ships (weeks-months), those threads are stale or archived (Reddit locks after 6 months, HN threads die in days). The original posts are the **discovery corpus**. After a feature ships, the system watches for **new** expressions of that painpoint and replies to those while they're live. Evergreen Q&A (Stack Overflow, GitHub issues) is the one exception where answering an old item still has value, because future searchers and LLM crawlers see it.

---

## 6. Stage requirements

### 6.1 Discover (automated)

- **Sources (free APIs):** GitHub Issues/Discussions API, Stack Overflow API, Hacker News (Algolia) API — the MVP source set. markdown.free has no public repo, so GitHub search runs product-wide. First-party inbound (support email / contact form) is **not a source today** — no such channel exists yet; add it only if one is built.
- **Partial-coverage sources:** Reddit (restricted API — use manual queue or limited search), forums (scrape selectively, respect ToS). X/Twitter excluded — no free API.
- **Search scope:** markdown/document-conversion painpoints — e.g. "markdown to pdf", "markdown to word/docx", "pandoc cjk", "markdown table broken", "mermaid not rendering", "markdown export font", localized variants in JA/KO/zh/ID.
- **Dedup:** persist seen item IDs; never reprocess.
- **Output:** raw `painpoint_item` records — source, URL, text, author-handle, date, engagement (upvotes/comments), language.
- **Cadence:** scheduled daily discovery, with a weekly consolidated digest. Build capacity is confirmed at 1-2 features/week, so daily discovery + weekly digest keeps supply and build throughput roughly matched.

### 6.2 Consolidate (automated, LLM)

- **Clustering:** an LLM groups raw items into painpoint **themes**. Each `painpoint_theme`: id, title, description, frequency count, recency, representative quotes + source links, affected languages, rough severity.
- **Analytics cross-reference:** correlate each theme against markdown.free's own product analytics — does the complaint align with where real users actually drop off? A theme that is loud online but invisible in the funnel is flagged low-confidence (Risk 3).
- **Verified at digest approval:** LLM clusters can hallucinate or merge distinct issues. Rather than a separate human gate, every cluster carries its representative quotes + source links into the weekly digest, so the digest-approval step (see 6.3) catches a hallucinated or wrongly-merged cluster in the same ~5-minute review.

### 6.3 Triage (automated, LLM)

- **Automated by LLM.** Triage is not a human task — an LLM scores every theme and recommends a decision state. The human does not *run* triage; they *approve* its output once a week via the digest.
- **Scoring rubric:** frequency × recency × addressability × **moat alignment**.
- **Moat-alignment filter (Risk 4) — encoded, not improvised.** The "simple, no-signup, CJK-correct" thesis is written down as an explicit rule set (what strengthens the moat vs. what dilutes it); the LLM scores each theme against those rules and must justify the score, with an explicit license to `decline` high-frequency painpoints that would bloat the product. **At 1-2 features/week this filter is the single most important control in the system** — high build velocity means the product can drift off-thesis within a couple of months if triage rubber-stamps every popular painpoint. Triage should *expect* to `decline` or `defer` a meaningful share of high-frequency themes; that is the system working, not failing. With no human in the per-theme loop, the quality of the encoded rules is now load-bearing — see Risk 4.
- **Decision states:** `build` / `defer` / `decline`, each LLM-recommended with a one-line rationale. Declined and deferred themes are not wasted — they feed content (FAQ entries, blog posts, comparison-article sections).
- **Human approval — the one gate.** The weekly digest lists every theme with its evidence, analytics cross-reference, and the LLM's recommended decision + moat rationale. The approver signs off in ~5 minutes and overrides any recommendation they disagree with. Approval is the gate; the recommendations are a default, not a verdict.
- **Output:** prioritized roadmap candidates with theme IDs.

### 6.4 Build handoff (existing product dev process)

- Features are built through markdown.free's normal engineering process — **out of scope for this system to perform**.
- Requirement on the dev process: the shipped feature's release/commit is **tagged with the painpoint theme ID**, so stages 5-6 and measurement can connect feature → painpoint.

### 6.5 Listen-for-new (automated)

- When a feature ships, its theme becomes an **active watch**.
- The discovery layer (already running) flags **new** posts matching an active-watch theme as reply opportunities.

### 6.6 Reply-to-fresh (human-gated)

- LLM drafts a reply under strict anti-shill rules (understand the exact problem, mention the tool once, link naturally, decline to reply if it is not a genuine match).
- **Human reviews and posts** — never automated. From an account with real community history.
- **Volume limit:** 1-3 replies/week total (Risk 2). Note the deliberate asymmetry: feature output (1-2/week) will outpace reply volume over time. That is expected — replies target the highest-value *fresh* posts, not every shipped feature. Most features ship without a reply campaign; the reply stage is selective by design.
- Reply links carry UTM tags so the reply → visit → convert funnel is measurable.

---

## 7. Architecture & build suggestions

### MVP scope & validation gates

**Decision (resolved):** the first build is an **MVP covering the whole loop except auto-posting** — discover + consolidate + automated triage + digest + listen-for-new + reply drafting + reply tracking — built in one pass rather than three sequential phases.

The exit gates below are **retained as validation gates, not build gates**: the code for every stage exists up front, but each stage is only *trusted and acted on* once its gate is met.

| Stage group | Scope | Effort (est.) | Validation gate — do not rely on the stage until... |
|---|---|---|---|
| **Intelligence** | Discover + Consolidate + automated Triage + Digest | ~1-2 weeks | a digest has surfaced a real, correctly-triaged painpoint and informed one roadmap decision |
| **Reply** | Listen-for-new + LLM reply drafting + reply tracking | ~1 week | one loop-driven feature has shipped, and one fresh-post reply has been posted and tracked |
| **Attribution** | discovery→ship→reply→conversion traceable per theme | folded into the above | theme IDs flow through to release tags and reply UTMs |

The reply stage is structurally **un-validatable until a loop-driven feature actually ships** — building its code early is fine, but do not run reply campaigns until the intelligence layer has proven itself. If digests pile up unactioned, the loop is broken and more automation will not fix it.

### Build standalone — independent of the promotion framework

**Decision (resolved):** the loop is reimplemented from scratch inside the markdown.free repo, with **no code dependency** on the markdown-promotion framework. The framework's **Tool 3 (Social Listener)** — GitHub-issue source, dedup state, anti-shill reply drafter — may be read as a **reference design**, but is not imported, shared, or depended on.

Rationale: the two repos serve different masters (a product vs. a generic multi-site promotion framework) and should not be coupled. A product repo taking a hard dependency on a promotion-tooling repo is the wrong direction of dependency.

Accepted tradeoff: the discovery, dedup, and reply-draft logic now exists in two places and will drift over time. That is acceptable — markdown.free's loop is product-specific and will diverge from the generic framework anyway. The cost of reimplementation (a few days) is paid once; the cost of cross-repo coupling would be paid forever.

### Data model (minimal)

- `painpoint_item` — raw discovered complaint (source, url, text, date, engagement, lang, dedup key).
- `painpoint_theme` — consolidated cluster (id, title, description, frequency, recency, severity, confidence, evidence links, triage state).
- `watch` — active painpoint→shipped-feature link (theme id, release tag, activated date).
- `reply` — a posted response (watch id, target url, drafted text, posted-by, posted date, utm tag).

### Tech notes — MVP implementation

The MVP is implemented as plain Node ES-module scripts (`.mjs`) under `scripts/loop/` in the markdown.free repo, matching the existing `scripts/` conventions (manual `.env` loader, raw `fetch`, no build step):

- **No new npm dependencies.** The Claude API and every source are called over raw `fetch`. This keeps the loop standalone (per the decision above) and adds zero weight to the product bundle.
- **Storage = JSON files** under `scripts/loop/data/`, one file per data-model table (`items`, `themes`, `watches`, `replies`, `seen`). These are committed: a discovery/triage run produces a reviewable git diff, which *is* the "digest in a PR" review surface.
- **Discovery** is a scheduled job — run as an `npm` script for the MVP; a daily/weekly cron (GitHub Action or Vercel Cron) is a thin wrapper added once the pipeline is proven.
- **Consolidation + triage** are LLM calls over the new items; the encoded moat rules live in one config module and are sent as a cacheable system prompt.
- External HTTP stays behind a per-source module so sources are pluggable, and a real-browser fallback (Playwright) can be added later for Cloudflare-gated sources.
- Mock all LLM and network calls at the boundary for tests.

---

## 8. Critical risks & mitigations

| # | Risk | Mitigation (designed into this PRD) |
|---|---|---|
| 1 | **Loop pacing.** Discovery is cheap, building is slower. With build capacity confirmed at 1-2 features/week the loop *can* keep pace — the original "backlog grows forever" failure is largely mitigated. Residual risk: a `build` backlog still forms if triage over-admits. | Primary success metric is discovery→ship latency (target ~2-4 weeks). Hard WIP limit on `build`-state themes. Weekly digest cadence matched to weekly build capacity. Phase 2 gated on Phase 1 actually changing a roadmap decision. |
| 2 | **Systematic replies look like astroturfing.** Volume replies from automation-fed accounts trip spam filters; account bans are hard to reverse. | Every reply human-gated. Volume cap 1-3/week. Replies from accounts with genuine community history. Never templated. Guardrail metric: 0 account warnings. |
| 3 | **Vocal complaints ≠ representative demand.** Roadmap drifts toward a vocal minority. | Every theme cross-referenced against markdown.free's own analytics. Loud-online-but-invisible-in-funnel themes flagged low-confidence. |
| 4 | **Scope creep erodes the moat — the dominant risk at 1-2 features/week.** A demand-driven roadmap at this velocity can ship 50-100 painpoint features/year. Followed uncritically that bloats markdown.free into a generic converter within months and dissolves its actual advantage. **Automating triage sharpens this risk:** with no human in the per-theme loop, a miscalibrated rule set drifts the product automatically and silently. | Three layered controls: (a) the **encoded moat-alignment rules** (see 6.3) — version-controlled and reviewed as a deliverable in their own right, and required to `decline`/`defer` a real share of popular painpoints; (b) the **weekly digest approval**, where a human sees every recommendation with its moat rationale and can override — the safety net for a bad automated call; (c) a **hard WIP cap on `build`-state themes** plus periodic roadmap review against the "simple, no-signup, CJK-correct" thesis. Treat the ability to say no as a designed feature of the system, not a failure of it. |
| 5 | **No measurement design = can't tell if the loop works.** Can't separate feature impact from reply impact from SEO from noise. | Theme IDs carried through to release tags and reply UTMs from day one. Phase 3 builds the attribution view. |

### Secondary risks
- **Lopsided discovery coverage** — Reddit API restricted, X has none. The digest must state its blind spots explicitly so it is not mistaken for complete.
- **LLM clustering errors** — every cluster carries its raw evidence into the digest, so the digest-approval step catches hallucinated or wrongly-merged clusters (see 6.2).
- **Reply-account reputation** takes time to build and cannot be automated.
- **Maintenance burden** — scrapers break; assign a clear owner before building.

---

## 9. Open questions

**Resolved:**
- (a) The loop is reimplemented standalone in markdown.free, no dependency on the promotion framework — see Section 7.
- (b) Build capacity is 1-2 features/week (tested and validated) — the success metrics, digest cadence, and WIP limits in this PRD are sized to that.
- (c) **Triage is automated** — an LLM scores and recommends; the human role is a weekly ~5-minute digest approval, not running triage. See 6.3.
- (d) **MVP scope** is the whole loop minus auto-posting — intelligence layer + reply drafting + reply tracking, built in one pass. See Section 7.
- (e) **MVP discovery sources** are GitHub + Stack Overflow + Hacker News.

Still open:

1. **Digest-approval owner & cadence** — who signs off the weekly digest (triage itself is automated); weekly is the assumed cadence.
2. **Reddit/X coverage gap** — accept the blind spot, or invest in manual-queue workflows to cover it? The digest must state this blind spot explicitly.
3. **Analytics access** — markdown.free's Umami analytics are already reachable programmatically (`UMAMI_API_KEY`, `scripts/umami-report.mjs`); confirm the granularity the consolidation step needs for the Risk 3 cross-reference.

---

## 10. Out of scope

- Performing the feature builds themselves (markdown.free's normal eng process).
- Automated posting of replies.
- Painpoint discovery for non-markdown/document-conversion topics.
- Replacing the existing SEO / backlink / content work — this feeds it, does not supersede it.
- X/Twitter as a discovery source (no free API).

---

## 11. Appendix: relationship to existing work

- **markdown-promotion framework Tool 3 (Social Listener)** — existing GitHub-source + dedup + anti-shill reply drafter. **Reference design only** — read it for prior art, do not depend on it (Section 7).
- **markdown-promotion framework Tool 4 (Story Signal Detector)** — same "detect signal → consolidate → human review → feed forward" pattern this loop uses; worth mirroring its design.
- **SEO audit (`docs/seo_audit.md`)** — the painpoint digest is the demand-validated input the audit's content recommendations (FAQ schema, comparison articles, CJK writeup) currently lack.
