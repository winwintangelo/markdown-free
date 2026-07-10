# Markdown Free — Promotion Plan v3

**Updated:** 2026-07-09
**Supersedes:** the standalone plans, which remain the detailed source of record — this doc consolidates and re-prioritizes them against fresh data. Don't delete them; they hold the full drafts/checklists v3 only summarizes:
- `docs/market-promotion.md` — the P1–P6 growth sprint (post drafts, comparison-article spec, FAQ/schema rollout)
- `docs/backlink-targets.md` — off-site backlink target list (Tier 1–4, ready-to-submit copy)
- `docs/x-promotion.md` — 14-day X/Twitter warm-up + promo calendar

**What changed since v2:** the Jul 2026 analytics pull revealed the plan was being steered off Google Search Console alone — which turns out to be **only ~¼ of actual traffic**. The real growth map is two separate channels, and that reorders the backlog. See §0.

---

## §0 — The data picture (why the priorities below changed)

Sources: Vercel Analytics on-site (Jun 9–Jul 9) + GSC (last 3 months, through Jul 7). Umami's API is dead (free tier dropped it) — Vercel is now the on-site source.

**The finding: you have two acquisition channels with almost no overlap, and GSC only sees one of them.**

| Country | On-site visitors (Vercel) | GSC clicks | Read |
|---|---|---|---|
| **CN** | **222 (#1)** | 5 | Biggest real audience — **invisible to GSC** |
| IN | 65 | 12 | Google-driven |
| US | 63 | 15 | Mixed (Google + AI + direct) |
| ID | 34 | 33 | Almost entirely Google |
| JP | 22 | 6 | Buried (pos ~39) — demand exists, rank doesn't |
| TW | 14 | 21 | Google-driven, ranks well |
| KR | 5 | 3 | Buried (pos ~54) |

- **China is the #1 on-site audience by 3×, but nearly absent from GSC** because Chinese users arrive via Bing / cn.bing.com / Doubao / Tencent Yuanbao / Sogou — not Google. `/zh-Hans` pages are your top non-EN performers on-site and you'd never know it from GSC.
- **GSC ≈ only a quarter of total traffic.** Planning solely off it under-serves your largest market. Bing + Chinese-AI is an unmanaged channel.
- **The funnel is healthy** (`upload_start` 303 → `convert_success` 240 ≈ **79%**, errors ~3%). The product converts — **the constraint is acquisition/distribution, not more features.** Promotion is the lever, not engineering.
- **AI referral is real and CN-led:** `ai_referral` fired for 98 visitors; referrers include Doubao (11), Tencent Yuanbao (4), ChatGPT (9), Perplexity (3), Copilot. Being *citable* by these assistants is a first-class channel.

**Two playbooks fall out of this:**
- **Channel A — Google** (GSC-visible): EN, ID, TW/zh-Hant, ES already win → optimize rank+CTR+authority. **JP is the top rescue** (real demand, buried at pos ~39). KO next.
- **Channel B — Non-Google** (Bing / Baidu / Chinese-AI, GSC-invisible): mainland CN / zh-Hans is already the biggest audience → optimize via **Bing Webmaster Tools** + AI-citation + native-platform distribution (WeChat/小红书/知乎 for the 长图 wedge).

---

## §1 — Already shipped (don't redo)

| Priority | Status | Summary (detail in `market-promotion.md`) |
|---|---|---|
| P4 — Comparison / buyer's-guide matrix | ✅ 2026-05-09 | 10-locale "best converter 2026" articles; wins Google rank + LLM citation. |
| P5 — SEO snippet + FAQPage schema | ✅ 2026-05-09 | 19 intent pages: modern titles + FAQ JSON-LD mirroring real GSC queries. |
| P6 — Markdown→Image (PNG/JPG) + 长图 wedge | ✅ 2026-07-04 | One-tap image export + 9-locale `/markdown-to-png` cluster. **Conversion flow verified working 2026-07-09.** |

**On P6 / PNG usage (important context):** as of 2026-07-09, PNG shows ~1 conversion — **this is expected, not a problem.** The feature works; its audience just hasn't arrived: the landing pages have 0 GSC impressions yet (new pages take weeks to index/rank) and the distribution posts that seed the 长图 audience aren't live. P6's ROI is *gated on distribution* (§2, Channel B) — that's the action, not a product fix. Judge PNG ~2026-07-28.

---

## §2 — The re-prioritized backlog

Ordered by ROI given §0: activate the channels already producing audience before chasing new ones. Legend: 🟢 = I can draft/prep it (you review+submit) · 🔵 = needs your login.

### Rank 1 — The Bing channel (CN's actual search engine)
Your biggest audience (CN) comes through Bing/cn.bing and you have almost no management of that channel. Two distinct pieces:
- **Submission (IndexNow) — ✅ DONE 2026-07-09.** `scripts/indexnow-submit.mjs` (`npm run indexnow:all`) pushes every sitemap URL to Bing/Yandex/Seznam/Naver for fast crawl. Ran full-site: **101/101 accepted (HTTP 200)**, key file live at `/3074aa8265cdc58e5af0ded9f519972f.txt`. Re-run after any significant deploy (`:new` for changed pages, `:all` for a full nudge). Note: this is *submission only*, not reporting.
- **Reporting (Bing Webmaster Tools) — ✅ DONE 2026-07-10.** **`npm run report:bing`** (`scripts/bing-report.mjs`) now pulls Bing's traffic/queries/pages into `tmp/reports/bing_*` in the same `Clicks/Impressions/CTR/Position` shape as the GSC exports. Key is in `.env` (`BING_API_KEY`). Re-run monthly to track the CN channel. **First pull (see §0.1) confirms Bing is a major channel for this site, not a rounding error.**

### §0.1 — What Bing Webmaster data revealed (first pull, ~5.5 months to 2026-07-07)
- **Bing is ~75% of Google's search clicks here** (246 clk / 5,662 imp / **4.34% CTR** vs GSC's ~181 clk / 2.9% over 3mo). Typical sites see Bing at 5–10% of Google — this site is abnormally Bing-heavy because of the CJK/China audience. **Bing also ranks us better** (readme-to-pdf pos **5.1** on Bing vs 7.4 on Google) and converts higher.
- **CN pages get 10–25× more impressions on Bing than Google:** `/zh-Hans/markdown-zhuanhuan-word` = 353 Bing imp (pos 8.1) vs **14** GSC imp (pos 18). `/markdown-to-word` = 366 Bing vs 20 GSC. This is the quantitative proof of the "CN invisible in GSC" finding.
- **Bing's Chinese demand skews to “转word” and “转epub”**, not the readme→pdf that dominates Google: `markdown转word在线工具`, `readme转word`, `在线markdown转word`, and `markdown转epub` (67 imp) — 258 distinct CJK queries. → the zh-Hans **转word / 转epub** pages are the CN-channel winners to strengthen (titles + internal links for those exact queries).
- **`/claude-artifacts-to-pdf` is a Bing star** — 35 clicks at **12.5% CTR**, pos 4.4 ("claude artifact to pdf" ranks pos 2.8) — yet nearly invisible in GSC. The AI-adjacent intent converts unusually well on Bing → worth a zh localization + more "AI artifact → PDF/Word" intent pages.
- **JP is a Google-channel problem, not a Bing one:** on Bing the buried-CJK demand is Chinese 转word/epub, not Japanese. JP rescue stays a Google play.
- **Caveat:** Bing WMT captures the Bing-*organic-search* slice of CN only. The larger Chinese-AI-assistant portion (Doubao/Yuanbao referrals in Vercel) still isn't directly measurable.

### Rank 2 — Backlink Tier 1: authority that feeds *both* channels *(🟢 I can draft all)*
From `backlink-targets.md`. Cheap dofollow authority + LLM-citation sources. Do first:
- `BubuAnabelas/awesome-markdown` PR (935★) · `J0rgeSerran0/Useful-Free-Online-Tools` PR — ready entries already written.
- 🔵 AlternativeTo + SaaSHub profiles (alt-to Pandoc/Dillinger/StackEdit/Typora).
- *(GitHub PRs post publicly under your identity — I'll draft the exact diff; won't open without your go-ahead.)*

### Rank 3 — JP + KO distribution posts *(🟢 I can draft; targets the buried Channel-A markets)*
The JP/KO ranking gap is off-page authority, not content (GSC diagnostic confirmed parity with ranking ID/zh pages). Native tutorials are the lever:
- **JP:** Qiita + Zenn how-to → link `/ja/markdown-pdf-henkan`. *(Gated: confirm whether a prior Qiita post is already live before publishing — avoids self-competition.)*
- **KO:** velog + Tistory/OKKY → link `/ko/markdown-pdf-byeonhwan`. (This is the long-planned P1 Korean wedge.)
- Fold the **长图/이미지 변환** angle into both to seed P6 in-market.

### Rank 4 — CN 长图 distribution *(activates P6 where the audience actually is)*
Channel B, native platforms Google can't see: WeChat 公众号 / 小红书 / 知乎 posts on "Markdown 转长图/公众号排版" → link `/zh-Hans/markdown-zhuan-tupian`. This is what turns the shipped PNG cluster into real conversions. 🟢 I can draft the zh copy; 🔵 posting needs your platform accounts.

### Rank 5 — EN "ChatGPT > Google" Dev.to article (P2) *(🟢 drafted-ready)*
The AI-referral narrative — now *stronger* with fresh data (Chinese AI assistants referring too). Positions the tool as the stateless AI→DOCX/PDF bridge. Full outline in `market-promotion.md` §P2.

### Rank 6 — Launch/community + X *(referral + brand; lower urgency)*
- 🟢 Hacker News: helpful comment on the existing "Ask HN: Markdown to PDF tools?" thread; later a Show HN.
- 🟢 Reddit: r/markdown, r/webdev, r/selfhosted — answer existing threads.
- 🔵 Product Hunt launch + indie directories (DevHunt/Uneed/Fazier/Peerlist).
- The `x-promotion.md` 14-day warm-up calendar — run when you have daily bandwidth; it's the slowest-compounding item, so it's last.

### Ongoing — Social interception sweep (P3) *(1 hr/week)*
Search `pandoc 文字化け`, `마크다운 pdf 깨짐`, `"markdown to word" formatting broken` on X + GitHub Issues; reply helpfully with the relevant locale link. Playbook replies in `market-promotion.md` §P3.

---

## §3 — Execution order

1. **This week, needs your login (🔵):** Bing Webmaster Tools verification (Rank 1) — do it first, it's 30 min and unlocks visibility into your biggest market.
2. **This week, I can draft now (🟢):** Backlink Tier 1 PRs/profiles (Rank 2); JP/KO post drafts (Rank 3); zh 长图 post draft (Rank 4); Dev.to article (Rank 5). Say which and I'll produce the copy.
3. **When you have accounts/bandwidth (🔵):** publish the distribution posts, AlternativeTo/SaaSHub, Product Hunt, X calendar.
4. **Weekly (ongoing):** social interception sweep.

---

## §4 — Measurement & open items

**Re-measure ≈ 2026-07-28** (give Google 3–4 weeks + distribution time):
- **Channel A (GSC):** JP/KO avg position on readme/pdf intent pages — did the backlinks + posts move `md pdf 変換` off page 4? CTR on P5 pages. `/markdown-to-png` cluster: first impressions appearing?
- **Channel B (Bing WMT + Vercel):** CN position/queries in Bing; referral traffic from qiita.com / velog.io / WeChat / 小红书; `convert_success` with `format: png|jpg` + `split_parts` (via Vercel).
- **AI channel:** `ai_referral` trend; does the site get cited when Doubao/Yuanbao/Perplexity are asked the comparison question?

**Gated / awaiting your input:**
- JP Qiita post status — confirm before writing a new one (self-competition risk).
- PT-BR readme pilot — still pending the cluster-cannibalization decision (Brazil+Portugal had ~156 impr with no pt-BR locale = unclaimed gap).

---

*Source of record for full drafts, checklists, and per-tool facts: `market-promotion.md`, `backlink-targets.md`, `x-promotion.md`. This v3 is the prioritized index over them.*
