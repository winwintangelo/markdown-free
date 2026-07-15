# Issue: `/best-markdown-to-pdf-converter-2026` — stuck at page-1 bottom, zero clicks

> **For SME consultation.** The growth loop surfaced this page as a "low-CTR" opportunity, but on inspection it's a **ranking/authority problem, not a snippet problem** — a title rewrite won't fix it. This doc frames the issue + the strategic questions for an SEO SME to weigh.
> **Date:** 2026-07-13 · **Owner:** growth loop (auto-flagged)
>
> **✅ UPDATE 2026-07-13 — SME-reviewed; direction decided.** Verdict: pursue it, but reframe the asset around **information gain** (original benchmark data) + honest "where we lose," migrate to an **evergreen URL**, and make **long-tail intents the primary strategy**. Full plan in [§ SME verdict & action plan](#sme-verdict--action-plan) below. The rest of this doc (data + diagnosis) stands as the rationale.

## The data
| Channel | Impressions | Clicks | CTR | Avg position |
|---|--:|--:|--:|--:|
| Google (GSC) | 400 | **0** | **0%** | **10.13** |
| Bing | 0 | 0 | — | *not present* |

- Page: `https://www.markdown.free/best-markdown-to-pdf-converter-2026` — a "best converter (2026 comparison)" page, ~656 lines of real content (not thin).
- Current title: `Best Markdown to PDF Converter (2026 Comparison) | Markdown Free`.

## Diagnosis — why the loop's "rewrite title for CTR" is the wrong lever
- **0% CTR at pos 10.13 is positional, not a snippet failure.** Position ~10 is the bottom of Google page 1 / top of page 2; organic CTR there is typically ~1% and frequently 0% on modest-volume queries. Rewriting the title/meta won't meaningfully move clicks while the page sits at #10 — the lever is **rank**, not snippet.
- **Google-only, and stuck.** 400 Google impressions but **zero Bing impressions** — Bing doesn't surface it at all. So this is a Google-ranking question specifically.
- **"Best X" is an authority query class.** Searches like *"best markdown to pdf converter"* reward domain authority, external citations, and perceived neutrality. A comparison page **published by one of the tools being compared** carries an inherent bias/trust headwind that Google's quality systems may discount.

## Hypotheses for the SME to weigh (ranking levers, roughly by leverage)
1. **E-E-A-T / self-serving-comparison bias.** We're rating ourselves in our own "best converter" list. Does the page read as a *neutral, methodology-backed* comparison (explicit criteria, honest pros/cons of alternatives, a disclosure that we're one of the options), or as self-promotional? Neutrality + a transparent methodology is often what unlocks "best X" rankings.
2. **Backlinks / citations.** "Best X" SERPs are backlink-heavy. Do we have *any* external links to this page? Who links to the pages ranking #1–9?
3. **Competitor SERP analysis.** Pull the current top 9 for the target query — word count, comparison-table depth, freshness, backlink profile, publisher type (independent blog vs vendor). Gap-analyze against ours.
4. **Search-intent match.** Does the page actually satisfy the *comparison* intent — a real side-by-side table, criteria, when-to-use-which — or is it a thin framing around our own tool? Intent mismatch caps ranking.
5. **Freshness signal vs reality.** The title says "2026"; is the *content* genuinely current and re-dated, or will the date decay into a trust liability?
6. **Internal linking / authority flow.** Is the page linked from our highest-authority internal pages (homepage, top PDF pages), or orphaned-ish?
7. **Cannibalization.** Do other pages of ours compete for the same query and split authority?

## Questions for the SME
- Is a **vendor-published "best X" comparison** worth pursuing at all, or is this query class structurally hard for a tool to rank for (better to target it off-site / via a neutral third party)?
- If worth pursuing: what's the highest-leverage single change — **methodology/neutrality rewrite**, **backlink acquisition**, or **content-depth/table expansion**?
- Is "2026" in the URL/title a net positive (freshness) or a liability (dated slug, annual maintenance burden)?

## Recommended data to pull before the consult
- **GSC → this page → Queries filter**: the exact queries it earns impressions for (confirms it's the "best converter" comparison intent vs. a long-tail mismatch). *(Our snapshot stores page-level and query-level separately, so query-per-page isn't in it — pull directly from GSC.)*
- **A rank-tracker / SERP snapshot** of the top 10 for the primary query.
- **Backlinks** to the page and to the top-ranked competitors.

## What the loop will do meanwhile
The loop keeps `/best-markdown-to-pdf-converter-2026` visible (400 impressions is real demand) but will **not** auto-propose a title tweak for it again — its lever is rank/authority, a strategic call for a human + SME, not a mechanical 🟢 fix. **This is now enforced in code**, not just documented: the decision lives in `data/declines.json` (`kinds: ["low_ctr"]`), and the Opportunity Engine's decline memory (`scripts/growth/declines.mjs`) suppresses the low-CTR proposal every cycle, surfacing it under a 🚫 note instead of the 🟢 slate. A genuinely different lever for this page (e.g. a content/authority proposal) can still surface.

---

## SME verdict & action plan
SMEs confirmed the diagnosis (rank/authority, not snippet) and resolved the open questions. **Verdict: pursue it — but reframe the asset around _information gain_, and make long-tail the primary strategy.** Four decisions:

### 1. Rebuild as an original-benchmark asset (information gain) — the key move
Not *"here are 10 Markdown converters"* but *"we tested N converters against the same M-feature benchmark."* A real feature/score matrix across the field — e.g.:

| Feature | Pandoc | Markdown Free | Typora | VSCode | Dillinger |
|---|:--:|:--:|:--:|:--:|:--:|
| Mermaid | ✅ | ✅ | ❌ | ⚠️ | ❌ |
| MathJax | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Footnotes | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| CSS fidelity | 10/10 | 9/10 | 8/10 | 7/10 | 3/10 |
| **Rendering score** | 96 | 92 | 84 | 79 | 61 |

**Original data Google can't find elsewhere, AI systems can cite, and developers link to** — this is what earns the authority the page currently lacks. Extend the matrix with page-breaks, fonts, offline, privacy, templates, LaTeX (the long-tail terms below double as benchmark rows).

> ⚠️ **The benchmark must be REAL.** The table above is *illustrative* — the shipped scores must come from actually testing each tool. **Do not ship placeholder/estimated numbers.** Fabricated comparison data is worse than no page (trust + legal exposure, and it collapses the moment a reader checks). This is a hands-on research task for the team, not something to auto-generate.

### 2. Include "where our tool loses" (honest disclosure)
State plainly where competitors win — *"for books, Pandoc is better"*, *"if you're already in VSCode, use the extension."* Counterintuitively this **increases trust** and neutralizes the vendor-bias headwind that likely caps a self-published "best X" page.

### 3. Evergreen URL
Migrate `/best-markdown-to-pdf-converter-2026` → **`/best-markdown-to-pdf-converters/`** (year out of the slug) with a **301 redirect** from the old URL so the ~400 impressions of accrued signal carry over. Title → **"Best Markdown to PDF Converters (2026 Tested)"** — freshness lives in the title, not the URL, so the page compounds authority across years instead of resetting annually.

### 4. Long-tail first (the bigger strategic shift)
Don't fight the one hard head term (*best markdown converter*); **own ~50 easier long-tail intents** where a small domain outranks big competitors. Starter set (SME-picked): `markdown pdf css` · `markdown pdf page break` · `markdown pdf mermaid` · `markdown pdf latex` · `markdown pdf fonts` · `markdown pdf templates` · `pandoc vs markdown free` · `typora pdf export` · `markdown pdf offline` · `markdown pdf privacy`. Each becomes a focused page/section; the benchmark page is the **hub** that links them (and each is a benchmark row). This is now a primary SEO track, not a one-page fix.

## How the loop tracks it
- **Long-tail intents → wired into the loop now.** Added to the autocomplete collector's seeds (`scripts/growth/market/autocomplete.mjs`), so each cycle the loop reports **present-vs-gap** for these terms in the report's *Demand gaps* section. As pages ship, they graduate from "gap" to tracked signals.
- **Comparison-page rebuild → log on ship.** When the evergreen URL + real benchmark goes live, register a ledger experiment: `target_metric: position`, `topic: comparison`, `measure_on: ship + 28d` (authority moves slowly — consider a 6–8 week window). **Guardrail:** the 301 must preserve the old page's impressions.
- **Each long-tail page → a light experiment** (target `impressions`/`position` on its query) so the "long-tail beats head-term" thesis is measured, not assumed.
