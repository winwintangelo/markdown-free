# Growth loop — running log

Human-readable digest, appended by the `propose`/`summarize` stages each cycle
(growth-impl.md §10.1). Newest entries on top. This file is the weekly review surface.

---

## 2026-09-07 — automated cycle

**Channels:** bing, gsc, vercel, events, referral · _skipped: baidu_ · 14906ms

**Measured (10):**
- [inconclusive] md-to-png-cluster — baseline not backfilled (pre-loop ship) — backfill from search-API history in P1
- [inconclusive] cjk-zhuanhuan-word-epub — baseline not backfilled (pre-loop ship) — backfill from search-API history in P1
- [inconclusive] word-cluster-sweep — baseline not backfilled (pre-loop ship) — backfill from search-API history in P1
- [inconclusive] og-image-relatedtools-faq — baseline not backfilled (pre-loop ship) — backfill from search-API history in P1
- [inconclusive] server-side-html-lang — baseline not backfilled (pre-loop ship) — backfill from search-API history in P1
- [lost] word-title-meta-ctr-2026-07-13 — ctr -0.7 (DiD) vs baseline 0.82
- [inconclusive] obsidian-title-meta-ctr-2026-07-15 — ctr +0.09 (DiD) vs baseline 1.95
- [won] converter-hub-html-2026-07-16 — impressions +3 vs baseline 0
- [won] comparison-cta-2026-07-16 — cta_clicks +31 vs baseline 0
- [won] llms-cjk-refresh-2026-07-18 — ai_sessions +6.2 vs baseline 17

**⚠ Regressions (5):**
- position_drop [gsc] markdown to word — 27.4 → 37.1
- position_drop [gsc] https://www.markdown.free/ — 13.42 → 19.56
- clicks_drop [gsc] https://www.markdown.free/es/convertir-readme-pdf — 11 → 5
- position_drop [gsc] https://www.markdown.free/zh-Hant — 12.12 → 22.83
- position_drop [gsc] https://www.markdown.free/markdown-to-docx — 30.41 → 49.68

**Signals:** 84 mined · 392 in warehouse · **83 graduated** (confidence ≥ threshold)

**Opportunity Engine:** 83 graduated signals → 83 candidates · top 10 (portfolio-balanced):
1. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word`
   _3 sources · converts in-funnel · impact 1.00 · advances 'cjk-market' · CJK (moat) · score 3.367 · goal:cjk-market_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
2. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `markdown转word`
   _3 sources · converts in-funnel · impact 1.00 · advances 'cjk-market' · CJK (moat) · score 3.34 · goal:cjk-market_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
3. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans`
   _3 sources · converts in-funnel · impact 1.00 · advances 'cjk-market' · CJK (moat) · score 3.098 · goal:cjk-market_
4. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans/markdown-pdf-zhuanhuan`
   _3 sources · converts in-funnel · impact 0.80 · advances 'cjk-market' · CJK (moat) · score 2.719 · goal:cjk-market_
   ↳ KB(pdf): readme→pdf is the top Google intent; /claude-artifacts-to-pdf is a Bing star (~12.5% CTR)
5. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/id/markdown-ke-word`
   _5 sources · converts in-funnel · impact 1.00 · score 2.496_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
6. 🟡 **[strategic_bet]** Lean into this converting market (locale depth, AI visibility, distribution queue) — `country:CN`
   _1 sources · converts in-funnel · impact 1.00 · advances 'cjk-market' · CJK (moat) · score 1.753 · goal:cjk-market_
7. 🟡 **[strategic_bet]** Lean into this converting market (locale depth, AI visibility, distribution queue) — `country:JP`
   _1 sources · converts in-funnel · impact 1.00 · advances 'cjk-market' · CJK (moat) · score 1.753 · goal:cjk-market_
8. 🟡 **[strategic_bet]** Lean into this converting market (locale depth, AI visibility, distribution queue) — `country:US`
   _1 sources · converts in-funnel · impact 0.68 · advances 'conversion' · score 1.029 · goal:conversion_
9. 🟢 **[maintenance]** Fix regression: position_drop (30.41→49.68) — `https://www.markdown.free/markdown-to-docx`
   _regression on gsc · score 1_
10. 🟢 **[maintenance]** Fix regression: position_drop (12.12→22.83) — `https://www.markdown.free/zh-Hant`
   _regression on gsc · score 1_

🔒 _1 candidate(s) suppressed: 1 human-declined._
   🚫 `https://www.markdown.free/best-markdown-to-pdf-converter-2026` — declined: Rank/authority problem, not a snippet failure (pos ~10, 0% CTR, Google-only). SME-reviewed…

**📣 Distribution queue:** 4 item(s) awaiting a human post (drafted 3 · proposed 1) — `npm run growth:distribution`

**SEO hygiene:** ✅ 10 pages clean (core) · 6 warning(s)

**Next:** review the portfolio above; run `/growth-loop` to refine with judgment + implement 🟢 items.

## 2026-07-16 — manual action (title hygiene + lock-leak fix)

**🔧 Loop-integrity fix.** `word-cluster-sweep`'s 6 non-EN targets were seeded in the
ledger without locale prefixes (`/markdown-ke-word` instead of `/id/markdown-ke-word`,
etc.), so experiment-lock never matched them → they leaked into the opportunity slate as
false-positive "quick wins" (this cycle's #1 `/id/markdown-ke-word` + #4 `/es/markdown-a-word`
were both locked targets). Corrected the URLs → re-ran propose: locked count 11→15, both
pages now suppress, clean new #1 is the homepage `/`. Also unbreaks the 2026-08-08
measurement, which would otherwise have queried dead URLs.

**✂️ Title truncation fixes** (SEO audit warnings, unlocked pages only):
- `/` homepage: 99 → 55 chars — `Markdown to PDF, Word & Image Converter | Markdown Free` (`src/app/layout.tsx`)
- `/es`: 105 → 52 chars — `Convertidor de Markdown a PDF y Word | Markdown Free` (`es.json` meta.title; per-locale, does not touch locked `/ja` `/ko` `/zh-Hans` `/zh-Hant`)

**Full e2e caught a regression on the first cut:** my initial trims dropped the "Markdown Free"
brand → `i18n.spec.ts` "title contains Markdown Free exactly once" failed for `/` + `/es`.
Reworked to keep the brand (which also carries the free-ness hook) + the "Converter" keyword
(a demand gap we rank nowhere for), still ≤65. Re-ran full suite: **484 passed + 3 known
baselines** (filename ×2, image-proxy flake) — 0 new failures. SEO audit: **0 errors**, both
pages served in `<head>`, length warnings 8→6 (remaining 6 are all locked experiment targets).

**⏸ Deferred (locked — fix after each measures):** `/markdown-to-word` (t77), `/readme-to-pdf`
(d204), `/obsidian-markdown-to-pdf` (t73), `/markdown-to-png` (t74), `/ja` (t69),
`/es/markdown-a-word` (d169) → due 2026-08-01 … 08-12.

_Working-tree changes only — not committed/deployed. `git push`/deploy is the human's call._

---

## 2026-07-16 — automated cycle

**Channels:** bing, gsc, vercel, events, referral · _skipped: baidu_ · 7519ms

**Measured:** none due.

**Regressions:** none.

**Signals:** 35 mined · 307 in warehouse · **35 graduated** (confidence ≥ threshold)

**Opportunity Engine:** 35 graduated signals → 35 candidates · top 10 (portfolio-balanced):
1. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/id/markdown-ke-word`
   _2 sources · converts in-funnel · impact 1.00 · score 1.967_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
2. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/`
   _3 sources · converts in-funnel · impact 0.58 · score 1.252_
3. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `md to word`
   _4 sources · converts in-funnel · impact 0.41 · score 1.022_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
4. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/es/markdown-a-word`
   _3 sources · converts in-funnel · impact 0.25 · score 0.575_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
5. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hant/github-wenjiian-pdf`
   _2 sources · converts in-funnel · impact 0.18 · advances 'cn-market' · CJK (moat) · score 0.566 · goal:cn-market_
   ↳ KB(pdf): readme→pdf is the top Google intent; /claude-artifacts-to-pdf is a Bing star (~12.5% CTR)
6. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/it`
   _4 sources · converts in-funnel · impact 0.21 · score 0.524_
7. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/markdown-to-docx`
   _2 sources · converts in-funnel · impact 0.21 · score 0.413_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
8. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/vi`
   _2 sources · converts in-funnel · impact 0.21 · score 0.413_
9. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/es/convertir-readme-pdf`
   _2 sources · converts in-funnel · impact 0.20 · score 0.393_
10. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans/readme-pdf-zhuanhuan`
   _2 sources · converts in-funnel · impact 0.13 · advances 'cn-market' · CJK (moat) · score 0.39 · goal:cn-market_

🔒 _12 candidate(s) suppressed: 11 under active experiments (locked to protect measurement) · 1 human-declined._
   🔒 `https://www.markdown.free/readme-to-pdf` — exp `og-image-relatedtools-faq` (target) → measures 2026-08-08
   🔒 `https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word` — exp `cjk-zhuanhuan-word-epub` (target) → measures 2026-08-06
   🔒 `readme to pdf` — exp `og-image-relatedtools-faq` (target) → measures 2026-08-08
   🔒 `https://www.markdown.free/markdown-to-word` — exp `word-cluster-sweep` (target) → measures 2026-08-08
   🔒 `https://www.markdown.free/ja` — exp `server-side-html-lang` (target) → measures 2026-08-08
   🔒 `https://www.markdown.free/obsidian-markdown-to-pdf` — exp `obsidian-title-meta-ctr-2026-07-15` (target) → measures 2026-08-12
   🚫 `https://www.markdown.free/best-markdown-to-pdf-converter-2026` — declined: Rank/authority problem, not a snippet failure (pos ~10, 0% CTR, Google-only). SME-reviewed…

**SEO hygiene:** ✅ 10 pages clean (core) · 8 warning(s)

**Next:** review the portfolio above; run `/growth-loop` to refine with judgment + implement 🟢 items.

## 2026-07-15 — automated cycle

**Channels:** bing, gsc, vercel, events, referral · _skipped: baidu_ · 5946ms

**Measured:** none due.

**Regressions:** none.

**Signals:** 34 mined · 300 in warehouse · **34 graduated** (confidence ≥ threshold)

**Opportunity Engine:** 34 graduated signals → 34 candidates · top 10 (portfolio-balanced):
1. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/readme-to-pdf`
   _3 sources · converts in-funnel · impact 1.00 · score 2.186_
2. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word`
   _2 sources · converts in-funnel · impact 0.68 · advances 'cn-market' · CJK (moat) · score 2.105 · goal:cn-market_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
3. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/id/markdown-ke-word`
   _2 sources · converts in-funnel · impact 1.00 · score 1.967_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
4. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `readme to pdf`
   _5 sources · converts in-funnel · impact 0.68 · score 1.694_
5. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/best-markdown-to-pdf-converter-2026`
   _3 sources · converts in-funnel · impact 0.63 · score 1.384_
6. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/`
   _3 sources · converts in-funnel · impact 0.58 · score 1.252_
7. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/markdown-to-word`
   _3 sources · converts in-funnel · impact 0.47 · score 1.06_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
8. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `md to word`
   _4 sources · converts in-funnel · impact 0.36 · score 0.896_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
9. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/es/markdown-a-word`
   _3 sources · converts in-funnel · impact 0.25 · score 0.575_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
10. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/ja`
   _3 sources · converts in-funnel · impact 0.14 · advances 'cn-market' · CJK (moat) · score 0.559 · goal:cn-market_

**Next:** review the portfolio above; run `/growth-loop` to refine with judgment + implement 🟢 items.

## 2026-07-13 — automated cycle

**Channels:** bing, gsc, vercel, events, referral · _skipped: baidu_ · 11701ms

**Measured:** none due.

**Regressions:** none.

**Signals:** 34 mined · 182 in warehouse · **33 graduated** (confidence ≥ threshold)

**Opportunity Engine:** 33 graduated signals → 33 candidates · top 10 (portfolio-balanced):
1. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/readme-to-pdf`
   _3 sources · converts in-funnel · impact 1.00 · score 2.186_
2. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/id/markdown-ke-word`
   _2 sources · converts in-funnel · impact 1.00 · score 1.967_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
3. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `readme to pdf`
   _5 sources · converts in-funnel · impact 0.68 · score 1.694_
4. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word`
   _2 sources · converts in-funnel · impact 0.44 · advances 'cn-market' · CJK (moat) · score 1.358 · goal:cn-market_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
5. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/`
   _2 sources · converts in-funnel · impact 0.58 · score 1.125_
6. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/best-markdown-to-pdf-converter-2026`
   _3 sources · converts in-funnel · impact 0.50 · score 1.101_
7. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/markdown-to-word`
   _3 sources · converts in-funnel · impact 0.46 · score 1.037_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
8. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `md to word`
   _4 sources · converts in-funnel · impact 0.34 · score 0.859_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
9. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hant/github-wenjiian-pdf`
   _2 sources · converts in-funnel · impact 0.17 · advances 'cn-market' · CJK (moat) · score 0.527 · goal:cn-market_
   ↳ KB(pdf): readme→pdf is the top Google intent; /claude-artifacts-to-pdf is a Bing star (~12.5% CTR)
10. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/ja`
   _3 sources · converts in-funnel · impact 0.13 · advances 'cn-market' · CJK (moat) · score 0.51 · goal:cn-market_

**Next:** review the portfolio above; run `/growth-loop` to refine with judgment + implement 🟢 items.

## 2026-07-13 — automated cycle

**Channels:** bing, gsc, vercel, events, referral · _skipped: baidu_ · 12424ms

**Measured:** none due.

**⚠ Regressions (1):**
- clicks_drop [gsc] https://www.markdown.free/vi — 3 → 2

**Signals:** 34 mined · 34 in warehouse · **33 graduated** (confidence ≥ threshold)

**Opportunity Engine:** 33 graduated signals → 33 candidates · top 10 (portfolio-balanced):
1. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/readme-to-pdf`
   _3 sources · converts in-funnel · impact 1.00 · score 2.186_
2. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/id/markdown-ke-word`
   _2 sources · converts in-funnel · impact 1.00 · score 1.967_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
3. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `readme to pdf`
   _4 sources · converts in-funnel · impact 0.68 · score 1.715_
4. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word`
   _2 sources · converts in-funnel · impact 0.44 · advances 'cn-market' · CJK (moat) · score 1.358 · goal:cn-market_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
5. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/`
   _2 sources · converts in-funnel · impact 0.58 · score 1.125_
6. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/best-markdown-to-pdf-converter-2026`
   _3 sources · converts in-funnel · impact 0.50 · score 1.101_
7. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/markdown-to-word`
   _3 sources · converts in-funnel · impact 0.46 · score 1.037_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
8. 🟢 **[maintenance]** Fix regression: clicks_drop (3→2) — `https://www.markdown.free/vi`
   _regression on gsc · score 1_
9. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `md to word`
   _3 sources · converts in-funnel · impact 0.34 · score 0.776_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
10. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hant/github-wenjiian-pdf`
   _2 sources · converts in-funnel · impact 0.17 · advances 'cn-market' · CJK (moat) · score 0.527 · goal:cn-market_
   ↳ KB(pdf): readme→pdf is the top Google intent; /claude-artifacts-to-pdf is a Bing star (~12.5% CTR)

**Next:** review the portfolio above; run `/growth-loop` to refine with judgment + implement 🟢 items.

## 2026-07-13 — automated cycle

**Channels:** bing, gsc, vercel, events, referral · _skipped: baidu_ · 5072ms

**Measured:** none due.

**⚠ Regressions (1):**
- clicks_drop [gsc] https://www.markdown.free/vi — 3 → 2

**Signals:** 34 mined · 34 in warehouse · **33 graduated** (confidence ≥ threshold)

**Opportunity Engine:** 33 graduated signals → 33 candidates · top 10 (portfolio-balanced):
1. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/readme-to-pdf`
   _3 sources · converts in-funnel · impact 1.00 · score 2.186_
2. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/id/markdown-ke-word`
   _2 sources · converts in-funnel · impact 1.00 · score 1.967_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
3. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `readme to pdf`
   _4 sources · converts in-funnel · impact 0.68 · score 1.715_
4. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word`
   _2 sources · converts in-funnel · impact 0.44 · advances 'cn-market' · CJK (moat) · score 1.358 · goal:cn-market_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
5. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/`
   _2 sources · converts in-funnel · impact 0.58 · score 1.125_
6. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/best-markdown-to-pdf-converter-2026`
   _3 sources · converts in-funnel · impact 0.50 · score 1.101_
7. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/markdown-to-word`
   _3 sources · converts in-funnel · impact 0.46 · score 1.037_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
8. 🟢 **[maintenance]** Fix regression: clicks_drop (3→2) — `https://www.markdown.free/vi`
   _regression on gsc · score 1_
9. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `md to word`
   _3 sources · converts in-funnel · impact 0.34 · score 0.776_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
10. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hant/github-wenjiian-pdf`
   _2 sources · converts in-funnel · impact 0.17 · advances 'cn-market' · CJK (moat) · score 0.527 · goal:cn-market_
   ↳ KB(pdf): readme→pdf is the top Google intent; /claude-artifacts-to-pdf is a Bing star (~12.5% CTR)

**Next:** review the portfolio above; run `/growth-loop` to refine with judgment + implement 🟢 items.

## 2026-07-13 — automated cycle

**Channels:** bing, gsc, vercel, events, referral · _skipped: baidu_ · 5683ms

**Measured:** none due.

**⚠ Regressions (1):**
- clicks_drop [gsc] https://www.markdown.free/vi — 3 → 2

**Signals:** 34 mined · 34 in warehouse · **33 graduated** (confidence ≥ threshold)

**Opportunity Engine:** 33 graduated signals → 33 candidates · top 10 (portfolio-balanced):
1. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/readme-to-pdf`
   _3 sources · converts in-funnel · impact 1.00 · score 2.186_
2. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/id/markdown-ke-word`
   _2 sources · converts in-funnel · impact 1.00 · score 1.967_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
3. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `readme to pdf`
   _4 sources · converts in-funnel · impact 0.68 · score 1.715_
4. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word`
   _2 sources · converts in-funnel · impact 0.44 · advances 'cn-market' · CJK (moat) · score 1.358 · goal:cn-market_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
5. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/`
   _2 sources · converts in-funnel · impact 0.58 · score 1.125_
6. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/best-markdown-to-pdf-converter-2026`
   _3 sources · converts in-funnel · impact 0.50 · score 1.101_
7. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `https://www.markdown.free/markdown-to-word`
   _3 sources · converts in-funnel · impact 0.46 · score 1.037_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
8. 🟢 **[maintenance]** Fix regression: clicks_drop (3→2) — `https://www.markdown.free/vi`
   _regression on gsc · score 1_
9. 🟢 **[quick_win]** Rewrite title/meta to lift CTR — `md to word`
   _3 sources · converts in-funnel · impact 0.34 · score 0.776_
   ↳ KB(word): CJK word-conversion demand (转word) skews to Bing, not Google
10. 🟢 **[quick_win]** Nudge on-page (internal links, depth) to break into page 1 — `https://www.markdown.free/zh-Hant/github-wenjiian-pdf`
   _2 sources · converts in-funnel · impact 0.17 · advances 'cn-market' · CJK (moat) · score 0.527 · goal:cn-market_
   ↳ KB(pdf): readme→pdf is the top Google intent; /claude-artifacts-to-pdf is a Bing star (~12.5% CTR)

**Next:** review the portfolio above; run `/growth-loop` to refine with judgment + implement 🟢 items.

## 2026-07-12 — automated cycle

**Channels:** bing, gsc, vercel, events, referral · _skipped: baidu_ · 4595ms

**Measured:** none due.

**Regressions:** none (baseline cycle — need a 2nd snapshot for deltas).

**Striking-distance (pos 5–15) — top 5 of 37:**
- [bing] https://www.markdown.free/readme-to-pdf — pos 5.08 · 1589 imp · 7.3% ctr
- [gsc] https://www.markdown.free/readme-to-pdf — pos 7.77 · 1283 imp · 2.57% ctr
- [gsc] https://www.markdown.free/id/markdown-ke-word — pos 7.67 · 877 imp · 2.74% ctr
- [bing] readme to pdf — pos 5.98 · 541 imp · 4.44% ctr
- [bing] https://www.markdown.free/ — pos 7.39 · 466 imp · 3.86% ctr

**High-impression / low-CTR (title-rewrite candidates) — top 4:**
- [bing] https://www.markdown.free/markdown-to-word — 366 imp · 0.82% ctr
- [gsc] https://www.markdown.free/best-markdown-to-pdf-converter-2026 — 322 imp · 0% ctr
- [gsc] md to word — 261 imp · 0.77% ctr
- [gsc] readme to pdf — 183 imp · 0% ctr

**Next:** run `/growth-loop` for ranked, moat-filtered proposals + gated 🟢 fixes.

## 2026-07-12 — automated cycle

**Channels:** bing · _skipped: gsc, vercel, events, baidu_ · 1522ms

**Measured:** none due.

**Regressions:** none (baseline cycle — need a 2nd snapshot for deltas).

**Striking-distance (pos 5–15) — top 5 of 23:**
- [bing] https://www.markdown.free/readme-to-pdf — pos 5.08 · 1589 imp · 7.3% ctr
- [bing] readme to pdf — pos 5.98 · 541 imp · 4.44% ctr
- [bing] https://www.markdown.free/ — pos 7.39 · 466 imp · 3.86% ctr
- [bing] https://www.markdown.free/markdown-to-word — pos 8.61 · 366 imp · 0.82% ctr
- [bing] https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word — pos 8.05 · 353 imp · 3.12% ctr

**High-impression / low-CTR (title-rewrite candidates) — top 4:**
- [bing] https://www.markdown.free/markdown-to-word — 366 imp · 0.82% ctr
- [bing] markdown to word — 151 imp · 0.66% ctr
- [bing] mark down to pdf — 110 imp · 0.91% ctr
- [bing] https://www.markdown.free/it/markdown-in-word — 104 imp · 0.96% ctr

**Next:** run `/growth-loop` for ranked, moat-filtered proposals + gated 🟢 fixes.

## 2026-07-11 — P0 foundation initialized

- Ledger seeded with 5 experiments from real shipped commits (measure window opens 2026-08-01 → 2026-08-08).
- Collectors live: **bing** (GSC/Vercel/events/referral arrive in P1).
- No snapshots captured yet — run `npm run growth:snapshot` to take the first.
- Nothing to measure until the seeded experiments come due (earliest 2026-08-01).
