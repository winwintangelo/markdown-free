# Issue: `/best-markdown-to-pdf-converter-2026` — stuck at page-1 bottom, zero clicks

> **For SME consultation.** The growth loop surfaced this page as a "low-CTR" opportunity, but on inspection it's a **ranking/authority problem, not a snippet problem** — a title rewrite won't fix it. This doc frames the issue + the strategic questions for an SEO SME to weigh.
> **Date:** 2026-07-13 · **Owner:** growth loop (auto-flagged)

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
The loop keeps `/best-markdown-to-pdf-converter-2026` visible (400 impressions is real demand) but will **not** auto-propose a title tweak for it again — this doc records that its lever is rank/authority, a strategic call for a human + SME, not a mechanical 🟢 fix. Once a direction is chosen, it can be logged as an experiment (target_metric: **position**, measure_on +28d) so the loop tracks whether the change moved rank.
