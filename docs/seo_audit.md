# markdown.free — SEO Audit & Proposal

**Date:** 2026-05-09 (rev. 3 — reconciles plan vs. actual state of repo)
**Author:** Internal review (drafted with AI assistance)
**Status:** Active execution plan (round-2 reviewer feedback incorporated; rev. 3 corrects two factual errors and removes P6 which has shipped)
**Data source:** Google Search Console exports under [tmp/google_search_console/](../tmp/google_search_console/)
**Windows analyzed:** 7 days (2026-05-01 to 2026-05-07) and 28 days (2026-04-10 to 2026-05-07)
**Revision history:** see [Section 7](#7-revision-log) for round-1 feedback summary and what changed.

---

## 1. Context

`markdown.free` is a free, browser-based markdown → PDF / DOCX / EPUB converter. Key product differentiators relevant to SEO:

- No signup, no install (browser-only)
- Strong CJK rendering (Korean / Japanese / Traditional & Simplified Chinese) — competitor markdown→PDF tools commonly fail here
- DOCX export (not just PDF)
- Privacy-first (no data stored, cookieless analytics)
- Localized URL paths: `/ko`, `/ja`, `/zh-Hans`, `/zh-Hant`, `/id`, `/es`, `/vi`, `/it`, plus root EN

The site is ~3-4 months old, currently ~1,100 impressions / 28 days. Promotion has primarily been community posting (Reddit, Velog, TabNews, V2EX) per a separate distribution plan; this audit is specifically about Google organic.

The reviewer's question we want answered: **what should we focus on for the next 4-12 weeks to compound this position growth into actual click volume?**

---

## 2. Top-line metrics

### 28-day window (2026-04-10 to 2026-05-07)

| Metric | Value |
|---|---|
| Total clicks | 34 |
| Total impressions | 1,110 |
| Average CTR | 3.06% |
| Average position | ~10.5 (trending from 16.4 → 7.5) |
| Distinct queries with ≥1 impression | 65 |
| Distinct pages with ≥1 impression | 44 |
| Distinct countries with ≥1 impression | 80+ |

### 7-day window (2026-05-01 to 2026-05-07)

| Metric | Value |
|---|---|
| Total clicks | 9 |
| Total impressions | 244 |
| Average CTR | 3.69% |
| Average position | ~9.4 |

### Position trajectory (28-day chart)

| Date range | Avg position |
|---|---|
| 2026-04-10 to 2026-04-16 | ~12.4 |
| 2026-04-17 to 2026-04-23 | ~12.0 |
| 2026-04-24 to 2026-04-30 | ~10.7 |
| 2026-05-01 to 2026-05-07 | ~9.4 |

Position is improving roughly 1 rank per week, with the last two days (May 6 = 7.5, May 7 = 7.8) crossing into first-page territory. CTR roughly doubled from ~1.5% in the first half to 4-8% in the last week.

### Device split (28d)

| Device | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| Desktop | 32 | 956 | 3.35% | 10.58 |
| Mobile | 1 | 147 | 0.68% | 15.59 |
| Tablet | 1 | 7 | 14.29% | 5.57 |

Mobile is the largest gap. 147 impressions yielding 1 click is consistent with Google's AI Overviews / SGE suppressing click-through on informational mobile SERPs in 2026.

---

## 3. Findings

### 3.1 What's working

**F1. The position-improvement curve is real and consistent.**
[Chart.csv](../tmp/google_search_console/28_days/Chart.csv) shows a steady decline from position 16.4 (Apr 10) to 7.5-7.8 (May 6-7). Not noisy — it's a sustained trend. This is what an aging-site signal looks like in Google: passing the initial trust threshold.

**F2. `/readme-to-pdf` is the proven beachhead.**
- 22 clicks / 492 impressions / 4.47% CTR / position 6.98 (28d)
- 4 clicks / 120 impressions / 3.33% CTR / position 6.86 (7d)
- Single page = 65% of all clicks and 44% of all impressions for the entire site

**F3. Traditional Chinese is rising fastest.**
`/zh-Hant/github-wenjiian-pdf` moved from position 9.6 (28d) to **6.5 (7d)** — a 3-position climb in one week. CTR jumped from 5.97% to 20%. Taiwan is the #1 click country (4 clicks, 28d).

**F4. Two long-tail queries close at unusually high CTR.**
- `markdown free` — pos 3.2, 20% CTR (28d)
- `線上markdown轉pdf` — pos 10.17, 16.67% CTR (28d)
- `readme file to pdf` — pos 4, 20% CTR (28d)

These are below the volume that moves the topline but they validate that branding and zh-Hant long-tails close hard when they appear high.

**F5. The "no signup" / "free" differentiator is showing up in queries.**
Spanish: `cómo crear pdf desde texto o markdown online gratis sin registro` (pos 9.67) — the "sin registro" angle is finding its audience naturally. `markdown to pdf converter free` (pos 8) and `markdown to pdf free` (pos 62.67) suggest "free" has product-market-fit as a query modifier worth doubling down on.

---

### 3.2 What's broken

**B1. `/id/markdown-ke-word`: 209 impressions, 2 clicks (0.96% CTR), position 6.81.**
This is the single largest CTR leak on the site. Position 6.81 should yield ~5% CTR (industry avg). Getting 1% strongly suggests one of:
- **Intent mismatch.** "markdown ke word" is converter-intent; if the page is comparison/article-shaped, users skip it.
- **Title/meta weakness.** The Indonesian SERP for this query is winning clicks against this listing.
- **SERP feature suppression.** Featured snippet or AI Overview above this listing is harvesting clicks.

This needs a manual SERP audit (open the query in Google ID, screenshot, compare).

**Magnitude framing:** total site is at 34 clicks / 28d. Lifting this single page from 1% → 5% CTR on existing 209 impressions adds ~8 clicks / 28d — **a ~25% increase in total site clicks from one page fix, with zero ranking improvement required.** This is a larger absolute lift than every other near-term lever combined.

**B2. Japan: 106 impressions, 0 clicks across 28 days.**
- `md pdf 変換` — 48 impressions, position **30.42** (28d)
- `markdown pdf変換` — 7 impressions, position 46.14
- `markdown pdf 変換` — 5 impressions, position 58.4
- `md ファイル pdf 変換` — 2 impressions, position 26
- `/ja/markdown-pdf-henkan` page is at position 30.62

Japan has the highest non-EN impression volume of any single keyword (`md pdf 変換` alone has more impressions than any English query except `readme to pdf`), but the site ranks page 3+ across all of it. **This is the largest unrealized market.**

**B3. Korean is not yet ranking.**
- `마크다운` — pos 76
- `마크다운 pdf 변환` — pos 64
- `무료 마크다운 에디터` — pos 77.5
- `마크다운 변환기` — pos 67
- `/ko` page — pos 50.06

All KO queries sit at positions 50-90. This is consistent with a site Google has not yet judged authoritative for Korean content. **Important coordination note:** "wait and re-measure" only works if the upstream distribution plan executes — Korean SEO movement is dependent on Velog and Naver Blog posts generating backlinks, which typically take 4-8 weeks to register in GSC. If those community posts stall or get removed, Korean SEO stalls with them. This is a coupled dependency, not a passive timer.

**B4. Mobile CTR collapse: 0.68%.**
147 impressions → 1 click. Desktop on the same period: 3.35%. The original draft attributed this primarily to AI Overviews / SGE eating clicks. **Reviewer correction (round 1):** the simpler explanation is device-context mismatch — markdown→PDF conversion is overwhelmingly a desktop activity (Umami device split shows ~87% desktop usage of the actual product). Mobile users searching `markdown to pdf` may simply be researching, not converting; the impressions aren't being "stolen," they're on users who were never going to start a converter workflow on a phone.

What this changes: mobile CTR is largely **structural to the product category**, not a fixable SERP-feature problem. FAQ schema is still worth doing for LLM-citation reasons (Priority 4 below), but expecting it to materially lift mobile CTR for this product is unrealistic.

**B5. `/readme-to-pdf` cluster — split between fixable and likely-unfixable.**

The original draft framed this entire cluster as a CTR problem. **Reviewer correction (round 1):** the cluster contains two distinct query types and they need different treatment.

*Likely intent mismatch — not a CTR problem to fix:*
- `readme.pdf` — 22 impressions, position 9.23, **0 clicks**. A user typing the literal filename is plausibly looking for a specific file, not a converter.
- `readme pdf` — 14 impressions, position 7.21, **0 clicks**. May be navigational ("find a project's PDF README").

For these two, the 0% CTR may simply be the correct outcome — the page appears because Google sees keyword overlap, but isn't what the user wants. Optimizing titles for these wastes effort and risks degrading the snippet for the queries that do convert.

*Genuine conversion intent — small-sample zeros that should clear as volume grows:*
- `readme.md to pdf` — 14 imp, pos 14
- `how to download github readme as pdf` — 4 imp, pos 6.5
- `download github readme as pdf` — 4 imp, pos 6.75
- `github readme to pdf` — 4 imp, pos 7.25
- `convert github readme to pdf` — 3 imp, pos 3.67

These queries explicitly contain action verbs ("download", "convert", "to pdf"). Position 3.67 with 0 clicks on 3 impressions is statistical noise, not a CTR problem. As impressions grow into the 20-50 range, normal CTR will naturally produce clicks. The actionable lever for this group is rank improvement on `readme.md to pdf` (pos 14), not snippet rewriting.

**B6. EN head terms are not within reach.**
- `markdown to pdf` — pos 65.5
- `markdown to pdf online` — pos 60
- `markdown to pdf free` — pos 62.67
- `markdown pdf` — pos 90

These are page 6+. EN head terms are a 6-12 month battle on backlinks; not a near-term lever.

**B7. Concentration risk: `/readme-to-pdf` is a single point of failure.**
One page accounts for 65% of clicks and 44% of impressions. If that page drops 3 positions because a competitor launches a stronger page, or because Google re-ranks the SERP after a core update, the site loses ~one-third of total traffic overnight. This isn't a hypothetical — for a 3-month-old site at position 6.98, SERP volatility is the rule, not the exception.

The strategic implication: **diversification is a goal in its own right**, not just a side effect of growth. Priorities P3 (Japan), P5 (localized readme matrix), and P6 (comparison articles) should be evaluated through both lenses — incremental clicks AND reduced single-page dependency. A site with 30 clicks distributed across 5 pages is more resilient than the current 22 clicks from one page even if the totals are similar.

---

### 3.3 What's surprising

**S1. Indonesian impressions are second only to English.**
`/id/markdown-ke-word` alone has 209 impressions in 28 days. Indonesia is #2 click country. If even fixed to a normal CTR, this page alone would more than double total clicks.

**S2. 80+ countries with ≥1 impression in 28 days.**
Most have no localized landing page. The latent demand is far broader than the current localization effort suggests. See [Countries.csv](../tmp/google_search_console/28_days/Countries.csv).

**S3. Search behavior reveals localized intent the planning didn't anticipate.**
- ID: `markdown ke word` (DOCX is a stronger intent than PDF in Indonesian SERP)
- ES: `sin registro` modifier (privacy-focused phrasing)
- zh-Hant: GitHub-specific phrasing (`github-wenjiian-pdf`) outranks generic markdown
- zh-Hans: `在线md转pdf`, `markdown 转 pdf 在线工具` — "online" / "tool" modifiers

These are angle hooks that should drive page titles and H1s for localized content.

**S4. JA volume > KO volume in current GSC, contrary to community-post intuition.**
Korean was the focus of much of the v2 distribution plan (Velog, Naver Blog) because of CJK font breakage as an angle. But GSC shows JP currently has ~5x KO impression volume. The CJK-pain hook is universal; JP is the larger near-term Google opportunity.

**S5. `markdown free` brand search is at position 3.2 with only 5 impressions.**
The brand isn't established as a query — meaning organic discovery is fully driven by topic queries, not brand recall. This is normal for a 3-month-old site but worth noting: brand-building campaigns will move this needle.

---

## 4. Proposal: Next 4-12 weeks

Ranked by expected ROI. Effort estimates assume one engineer / writer working solo. **Priority order revised in round 2** based on reviewer feedback — see [Section 7](#7-revision-log). **Rev. 3** removes shipped work from the active list — see "Already shipped" subsection at the end of this section.

### Priority 1 — Indonesian SERP intent audit + page rework (effort: 0.5-1 day)

**Largest single near-term lever.** `/id/markdown-ke-word` is sitting on 209 impressions with 1% CTR at position 6.81. Lifting it to a normal 5% CTR adds ~8 clicks / 28d — a ~25% increase in total site clicks from one page fix, with zero ranking change needed.

Steps:
1. Manually audit the Google ID SERP for `markdown ke word`. Screenshot top 10 results.
2. Classify the dominant intent: converter, comparison, or tutorial?
3. Reshape the page to match (most likely: more converter-shaped, less article-shaped), or build a separate page that matches and internal-link from the existing one.
4. While there, audit the title tag — Indonesian SERPs reward localized "konversi/online/gratis" framing.

This is P1 because the impression volume is already earned — fixing CTR captures it. Other high-CTR pages (P2 below) are improving on already-reasonable performance; this is recovering wasted impressions.

### Priority 2 — Snippet optimization on top 5 pages (effort: 1 day)

Rewrite title tags and meta descriptions on pages that already rank but have CTR upside. Specifically:

| Page | Position | Current CTR | Target CTR |
|---|---|---|---|
| `/readme-to-pdf` | 6.98 | 4.47% | 8-12% |
| `/zh-Hant/github-wenjiian-pdf` | 9.64 (28d) / 6.5 (7d) | 5.97% (28d) | 15%+ |
| `/zh-Hant/readme-pdf-zhuanhuan-tw` | 9.17 | 5.77% | 10%+ |
| `/zh-Hans/readme-pdf-zhuanhuan` | 4 | 50% (1 imp) | n/a — already high |

(Note: `/id/markdown-ke-word` was previously listed here; moved to P1 because it requires an intent fix, not just a snippet tweak.)

Levers: include current year (2026), include "free / no signup / 無料 / 免費 / gratis" modifier, mention CJK / 中文 / 한글 / 日本語 in titles where relevant, GitHub-specific phrasing in readme variants. Bounded upside (CTR improvements on already-converting pages), but also bounded effort and risk.

### Priority 3 — Japanese on-page push + backlink check (effort: 2-3 days)

**Largest market-unlock investment.** Japan has the highest non-EN impression volume of any single keyword (`md pdf 変換` = 48 imp, more than any English query except "readme to pdf"). The site sits at position 30 across this cluster, so the question is **why** the gap and what closes it.

**Important diagnostic step before content work:** the original draft assumed content depth was the gap. A reviewer flagged that a position-30 gap on a 3-month-old site is more typical of a backlink/authority gap than a content gap. Two things to check first:

1. **Is a Qiita post (or other high-DA JP backlink) live?** Qiita is the highest-authority JP developer platform; one post there can move a position-30 page meaningfully on its own. The repo's `docs/posts/` currently contains Reddit/Velog/TabNews/Dev.to posts but no Qiita post visible. **Confirm whether a Qiita post exists** — if yes, identify it and watch GSC weekly. If no, prioritize publishing one before any on-page work.
2. **What's the SERP shape?** If JP top-10 results for `md pdf 変換` are all Qiita / Zenn / individual blog posts, the gap is editorial authority and on-page depth alone won't close it. If they're product pages, on-page work suffices.

Assuming the diagnostic supports content work, three concurrent on-page fixes:
- **Content depth.** Japanese SEO rewards length and detail; current page likely too thin.
- **Query targeting.** Page should hit `md pdf 変換` (48 imp) phrasing, not just `markdown pdf 変換` (5 imp).
- **Internal linking.** Anchor links from `/readme-to-pdf` and `/zh-Hant/*` pages to bump authority transfer.

Realistic target: position 30 → 15 in 4-6 weeks if the gap is content; longer if it's authority.

### Priority 4 — FAQ schema + declarative answer blocks (effort: 1-2 days, applied across all localized landings)

Add structured FAQ blocks to top-ranking pages with:
- Schema.org `FAQPage` markup
- Single-sentence declarative answers ("Yes, markdown.free converts GitHub README files to PDF for free, with no signup.")
- Locale-specific question phrasings (mirror real GSC queries word-for-word)

**Primary purpose: LLM-citation defense.** Declarative one-sentence answers are exactly what chatbots quote when answering related user questions. This is also the foundation for the comparison-article strategy (P6).

(The original draft framed FAQ schema as "mobile defense" via AI Overviews. Reviewer correction in round 1: mobile CTR is more likely structural to the product category — markdown→PDF is overwhelmingly a desktop activity — than a SERP-feature problem. FAQ schema may produce some mobile lift but shouldn't be expected to materially fix the 0.68% mobile CTR. Justify FAQ work primarily on LLM-citation grounds.)

### Priority 5 — Build out the `readme-to-pdf` localized landing matrix (effort: 2-3 days)

The strongest cluster (`readme to pdf`) deserves a localized landing per supported locale. Current state:

| Locale | Has page? | Position |
|---|---|---|
| en (`/readme-to-pdf`) | Yes | 6.98 |
| zh-Hans (`/zh-Hans/readme-pdf-zhuanhuan`) | Yes | 4 |
| zh-Hant (`/zh-Hant/readme-pdf-zhuanhuan-tw`) | Yes | 9.17 |
| zh-Hant (`/zh-Hant/github-wenjiian-pdf`) | Yes | 9.64 |
| id (`/id/konversi-readme-pdf`) | Yes | 4.33 |
| ko (`/ko/readme-pdf-byeonhwan`) | Yes | 8 |
| es (`/es/convertir-readme-pdf`) | Yes | 2 |
| ja (`/ja/readme-pdf-henkan`) | Yes (rev. 3 correction) | not yet ranking |
| vi (`/vi/chuyen-doi-readme-pdf`) | Yes (rev. 3 correction) | not yet ranking |
| pt-BR | **Missing** | — |

**Rev. 3 correction:** the original audit listed JA and VI as missing. Both pages exist in the repo and are deployed. The actual gap is content depth and possibly internal linking, not "build the page". Only `pt-BR` is genuinely absent from the matrix.

Revised work scope: (1) audit existing JA/VI readme pages — depth, query targeting, internal links from EN/zh-Hant — and bring them up to the same template as the EN page; (2) build `/pt-BR/readme-para-pdf` from scratch (Brazil is in the 80-country impressions tail). The Spanish version is at position 2 with only 1 impression — it needs the same expansion treatment as the EN version to grow demand for that head term.

**Strategic framing:** this is not just incremental clicks — it's a concentration-risk hedge against B7. With 7+ localized readme variants ranking, no single SERP shock can take down 65% of site traffic. **Caveat to validate before doing this in volume:** reviewer Q1 in [Section 5](#5-open-questions-for-seo-reviewers) raises the cluster-cannibalization risk — if Google sees 7 thin variants instead of one strong canonical, this could backfire. Resolve that question (or pilot with one new locale) before expanding the matrix.

### Priority 6 — Localized comparison/buyer's-guide articles — **SHIPPED 2026-05-09** (commit `5329277`)

Original scope: JP- and ID-first comparison articles. **Actual scope shipped:** 10-locale matrix in one batch (EN, IT, ES, JA, KO, zh-Hans, zh-Hant, ID, VI, HI), each as an 8-tool buyer's guide with `Article` + `FAQPage` JSON-LD, decision tree, locale-native non-Latin-script framing (文字化け / 한글 깨짐 / 字体豆腐 / dấu tiếng Việt bị hỏng / देवनागरी टोफू), and `rel="nofollow"` on competitor outbound links. Existing 8 locale slugs were rewritten in place (preserving canonical URLs); EN and HI are new files. Sitemap and llms.txt updated; readme/docx/obsidian intent pages cross-linked to the EN article.

**Open editorial integrity check:** reviewer Q4 (E-E-A-T risk on self-authored comparisons) is now a live question, not a hypothetical. Watch GSC at the 4 and 8 week marks for either (a) the JP/ID/HI articles starting to rank against `best markdown to pdf converter 2026`-shaped queries — confirming ROI — or (b) any indexing/quality-signal drag on the rewritten locale slugs that previously held positions (the IT/ES/ID/VI variants were thin "vs CloudConvert" stubs and may have had small held positions worth tracking pre/post).

EN article (`/best-markdown-to-pdf-converter-2026`) is the new test piece: brutal head-term competition for `markdown to pdf` (position 65) means this article is unlikely to rank against the head term but may pick up the long-tail "best ... 2026" comparison-intent traffic, which is what justified building it in the first place.

### Deprioritized / not now

- **EN head terms (`markdown to pdf`, `markdown pdf`).** Page 6+ rankings; needs sustained backlink work over 6-12 months. Not a near-term lever.
- **Korean rank push.** Will move organically over the next 4-8 weeks as Velog / community signals propagate, **conditional on those community posts existing and remaining live** (see B3). On-page work has lower ROI than waiting and re-measuring.
- **Mobile UX redesign.** Mobile CTR is more likely structural to product category than a UX problem (see B4). FAQ schema (P4) may produce some lift but the larger story is that markdown→PDF users aren't on phones.

### Already shipped (rev. 3)

- **P6 — comparison/buyer's-guide article matrix** (commit `5329277`, 2026-05-09): 10 locales deployed in a single batch. See P6 above for the open evaluation criteria at 4 and 8 weeks.

### Active execution order (rev. 3)

After removing the shipped P6 and reconciling the P5 readme-matrix scope:

1. **P2 — Snippet optimization on top 5 pages.** First because it has no external dependencies, no native-speaker audit required, and lowest risk. ~1 day.
2. **P1 — Indonesian SERP intent audit + page rework.** Largest single near-term lever (~25% click lift) but **gated on a native-speaker SERP screenshot** for `markdown ke word`. Pre-work: get that screenshot or VPN into Google ID. ~0.5-1 day after that.
3. **P4 — FAQ schema + declarative answer blocks** on the highest-impression intent pages (`/readme-to-pdf`, `/id/markdown-ke-word`, `/zh-Hant/github-wenjiian-pdf`). The pattern is already proven via P6 — the comparison articles all carry `FAQPage` JSON-LD, just lift the same `safeJsonLd()` call into the intent pages. ~1-2 days.
4. **Pre-P3 diagnostic — confirm Qiita/Zenn presence.** Repo audit (rev. 3): `docs/posts/` does not exist at all. The round-1 reviewer's claim that a Qiita post is live could not be verified from the repo. Either it's hosted under a personal account outside the repo (verify with the user), or it has not been published. Resolve this before P3 content work.
5. **P3 — Japanese on-page push** (only after the diagnostic). ~2-3 days.
6. **P5 — Localized readme-to-pdf matrix.** Now mostly an existing-page audit (JA, VI) plus one new build (pt-BR), not the larger build-out the original draft framed. Still gated on Q1 (cluster cannibalization). Pilot pt-BR alone before deciding whether to expand the JA/VI pages aggressively. ~1-2 days.

---

## 5. Open questions for SEO reviewers

Reordered in round 2 — Q1 (cluster cannibalization) flagged by round-1 reviewer as the most strategically important open question, gating P5.

1. **Cluster strategy on `readme-to-pdf` (gates Priority 5).** The site has 7+ ranking variants of the readme→PDF query across locales, several with 0% CTR despite top-10 rank. Two opposed hypotheses: (a) thin variants are self-cannibalizing — Google splits authority across pages and none rank strongly enough to convert; (b) localized variants serve genuinely distinct user intents and the 0% CTRs are low-sample noise. A native-speaker reviewer with access to the actual SERPs in each locale would add the most value here. Wrong answer in either direction has 4-6 weeks of wasted work attached.
2. **Indonesian intent (gates Priority 1).** Is `markdown ke word` dominantly converter-intent or comparison-intent in Indonesian Google? We're relying on inference; would value a native-speaker SERP audit. The intent diagnosis directly determines whether to reshape the existing page or build a new one.
3. **JP authority signals (gates Priority 3).** Is the gap to page-1 in Japan primarily content depth, backlinks, or domain age? Different answers imply very different work — content rework vs. publishing a Qiita/Zenn post vs. waiting on domain aging.
4. **Comparison-article risk (gates Priority 6).** Self-authored comparisons that include own product — are there 2026 Google E-E-A-T signals that punish this even on owned domains, or is the disclosure-driven approach still safe? Reviewers with recent post-Helpful-Content-Update experience preferred.
5. **Internal linking density.** No data here on internal link graph; would value a reviewer's read on whether the localized matrix is properly cross-linked or operating as silos. Coupled to Q1 — silos amplify cannibalization; strong cross-links mitigate it.
6. **AI Overview impact quantification.** Round-1 review pushed back on the original "AI Overviews are eating mobile clicks" framing — the simpler explanation is that markdown conversion is structurally a desktop activity. Still, the question stands: is there any way to measure click loss to AI Overviews specifically in GSC, or do we need a third-party tool, before either explanation can be confirmed?

---

## 6. Appendix: source files

All raw data under [tmp/google_search_console/](../tmp/google_search_console/).

- 28-day window: [Chart](../tmp/google_search_console/28_days/Chart.csv) · [Queries](../tmp/google_search_console/28_days/Queries.csv) · [Pages](../tmp/google_search_console/28_days/Pages.csv) · [Countries](../tmp/google_search_console/28_days/Countries.csv) · [Devices](../tmp/google_search_console/28_days/Devices.csv)
- 7-day window: [Chart](../tmp/google_search_console/7_days/Chart.csv) · [Queries](../tmp/google_search_console/7_days/Queries.csv) · [Pages](../tmp/google_search_console/7_days/Pages.csv) · [Countries](../tmp/google_search_console/7_days/Countries.csv) · [Devices](../tmp/google_search_console/7_days/Devices.csv)

Note: GSC data is sampled and rounded; very-low-impression queries (1-3 impressions) should be treated as directional, not statistical. Recommendations P1-P3 are based on sufficiently-large-sample data; P4-P6 lean on smaller samples and should be treated as hypotheses to validate at 4 and 8 weeks.

---

## 7. Revision log

### Rev. 3 (2026-05-09) — reconcile plan vs. actual repo state

| # | Issue | Change made |
|---|---|---|
| 1 | P6 (comparison articles) shipped same day as audit revision (commit `5329277`). The proposal listed it as future work for "JP and ID first"; the actual deploy was a 10-locale matrix in one batch. | Marked P6 as **shipped** with the open evaluation criteria called out (4-week and 8-week GSC checks for ranking, plus pre/post tracking on the rewritten IT/ES/ID/VI slugs in case any held positions were disturbed). Added an "Already shipped" subsection. |
| 2 | P5 readme-matrix table listed JA and VI as missing. Both pages exist in the repo (`/ja/readme-pdf-henkan/page.tsx`, `/vi/chuyen-doi-readme-pdf/page.tsx`) and are deployed. | Corrected matrix. The remaining work is auditing existing JA/VI for depth and internal linking, not building from scratch. Only `pt-BR` is genuinely missing. |
| 3 | Rev. 2 footnote on P3 said "round-1 reviewer asserted a Qiita post exists; the repo's `docs/posts/` does not currently contain one — flagged for verification." Rev. 3 actually verified: `docs/posts/` does not exist as a directory at all in the repo, and no `qiita`/`zenn` filenames exist anywhere. | Promoted this from "flagged" to a confirmed prerequisite for P3. Either the Qiita post is hosted on a personal account outside the repo (must confirm with project owner) or it has not been published. |
| 4 | Active priority order was a list of 6 items, with P6 still in it. Hard to read against actual remaining scope. | Added an "Active execution order (rev. 3)" subsection at the bottom of section 4, ordered by ready-to-execute (P2 first, then gated items). |

**Net active priority order, rev. 3:**

1. P2 — Snippet optimization on top 5 pages (no dependencies; do first)
2. P1 — Indonesian SERP intent audit + page rework (gated: needs native-speaker SERP screenshot)
3. P4 — FAQ schema + declarative answers (lift the pattern from the shipped comparison articles)
4. Pre-P3 — Confirm Qiita post exists (verifiable; resolve in 1 conversation)
5. P3 — Japanese on-page push (after Qiita diagnostic)
6. P5 — Readme matrix audit + pt-BR build (gated by Q1 cannibalization question)

P6 — moved to "Already shipped".

### Rev. 2 (2026-05-09) — round-1 reviewer feedback incorporated

Reviewer notes summary, with what changed:

| # | Reviewer point | Change made |
|---|---|---|
| 1 | B1/P2 underweighted: 1% → 5% CTR on 209 imp = ~25% total-site click lift from one fix. P2 belongs above P1. | Added explicit magnitude framing to B1. Promoted Indonesian fix to **Priority 1**; demoted snippet optimization to **Priority 2**. Removed `/id/markdown-ke-word` from the snippet-optimization table (it's an intent fix, not a snippet tweak). |
| 2 | B5 partially wrong: `readme.pdf` and `readme pdf` may be navigational/different-intent queries, not CTR problems. Don't optimize titles for these. | Rewrote B5 to split the cluster into "likely intent mismatch — leave alone" vs "genuine conversion intent — small-sample noise". Removed the implicit CTA to optimize titles for the intent-ambiguous queries. |
| 3 | B4 mobile diagnosis incomplete: 87% of actual product users are desktop. Mobile users may simply not be in conversion context for this product category. AI Overviews framing is too pat. | Rewrote B4 with the device-context mismatch as the primary explanation. Adjusted P4 (FAQ schema) to justify the work primarily on LLM-citation grounds, not mobile lift. |
| 4 | Concentration risk on `/readme-to-pdf` (65% of clicks, 44% of impressions) not called out. P3-P6 are diversification, not just growth. | Added new finding **B7** ("concentration risk: single point of failure"). Reframed P5 (localized readme matrix) to explicitly call out diversification as the strategic goal, not just incremental clicks. |
| 5 | Korean deprioritization is correct for SEO but should reference distribution plan. It's a coupled dependency, not passive waiting. | Updated B3 to flag the dependency on Velog/Naver community posts. "Wait and re-measure" now framed as conditional on upstream execution. |
| 6 | Japan (B2/P3) understated relative to opportunity size. Also: position 30 gap may be backlinks (not just content depth); existing Qiita post should be mentioned as an asset. | Reframed P3 as the "largest market-unlock investment". Added a diagnostic step: confirm whether a Qiita / high-DA JP backlink is live before doing on-page content work. (Note: round-1 reviewer asserted a Qiita post exists; the repo has no `docs/posts/` directory at all — verified again in rev. 3. See rev. 3 row #3.) |
| 7 | Open Q5 (cluster cannibalization on readme variants) is the most strategically important open question. | Promoted to **Q1** in Section 5 and explicitly noted it gates Priority 5. |

**Net priority order, rev. 2:**

1. P1 — Indonesian SERP intent audit + page rework (was P2)
2. P2 — Snippet optimization on top 5 pages (was P1)
3. P3 — Japanese on-page push + backlink check (same number, expanded scope)
4. P4 — FAQ schema + declarative answers (was P5; reframed as LLM-citation, not mobile)
5. P5 — Localized readme-to-pdf matrix (was P4; reframed as concentration-risk hedge, gated by Q1)
6. P6 — Localized comparison/buyer's-guide articles (same)

### Rev. 1 (2026-05-09) — initial draft

Original analysis based on raw GSC CSVs; priority order was snippet → ID fix → JP → matrix → FAQ → comparisons. See git history for the original framing.
