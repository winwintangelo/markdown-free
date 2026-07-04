# Markdown Free: Growth & Marketing Sprint 🚀

**Objective:** Transition from Phase 1 (Building) to Phase 2 (Validation & Scaling) by leveraging our CJK technical moat, the "No Login" universal wedge, and the "AI Referral" narrative.

---

## 📊 Progress log (last updated 2026-07-04)

| Priority | Status | What shipped |
|---|---|---|
| P1 — Korean CJK wedge (Velog/OKKY post) | 🔲 Not started | Distribution-side work, not engineering |
| P2 — English/Global Dev.to article | 🔲 Not started | Distribution-side work, not engineering |
| P3 — Social interception sweep | 🔲 Not started | Distribution-side work, not engineering |
| P4 — Comparison/buyer's-guide article matrix | ✅ Shipped 2026-05-09 (commit `5329277`) | All 10 locales live: 8 rewrites + 2 new (EN, HI). Sitemap + llms.txt updated. Cross-linked from /readme-to-pdf, /markdown-to-docx, /obsidian-markdown-to-pdf. |
| P5 — SEO snippet + FAQPage schema rollout | ✅ Shipped 2026-05-09 (commits `637d934`, `86f4525`, `356e89b`) | 19 intent pages: 4 in first batch + 15 in second. Title rewrites with 2026/free/locale-canonical noun forms; FAQPage JSON-LD with locale-native search-query phrasing. See P5 section below. |
| P6 — Markdown → Image (PNG/JPG) feature + SEO cluster | ✅ Shipped 2026-07-04 (branch `feature/image-export`) | New client-side image export (one-tap "To Image (PNG)", device-based defaults, long-doc → single-image-vs-ZIP prompt, JPG under More formats). Opens the **CJK 长图 wedge**: WeChat 公众号 / Xiaohongshu authors need Markdown → long-image. New 9-locale intent cluster (`/markdown-to-png` + localized, zh-Hans/zh-Hant lead with 长图/公众号), reciprocal hreflang, FAQPage schema, sitemap (+9 URLs), llms.txt. Copy/JSON-LD/FAQ refreshed across all surfaces. See P6 section below. |

**Gated / awaiting external input:**
- **JP push (audit P3):** waiting on confirmation of whether a Qiita/Zenn post is live. `docs/posts/` does not exist in repo. Either confirm external authorship or publish a new Qiita post before doing further JP on-page content work.
- **ID page reshape (audit P1):** SERP audit complete (Indonesia VPN, see conversation history). **Verdict: page does NOT need reshape** — `/id/markdown-ke-word` is at position 2 on the live SERP, intent matches. Ship verdict captured; only title/FAQ snippet work was needed (done in P5).
- **PT-BR readme pilot (audit P5):** still pending the cluster-cannibalization decision (audit Q1).

**Re-measure window:** Give Google 2-4 weeks to reindex P4 + P5 work. Re-check GSC at 2026-05-23 and 2026-06-06 for CTR lift on the touched pages.

See `docs/seo_audit.md` for the technical-SEO audit driving P5.

---

## 🥇 Priority 1: The CJK Wedge (Korea Focus)
**Goal:** Replicate the Japanese Qiita success in the South Korean market to capture validated GSC search demand.
**Target Platforms:** [Velog.io](https://velog.io/) (Korea's Dev.to equivalent) or [OKKY.kr](https://okky.kr/).

### Action Item: Publish the "Hangul Support" Tutorial
**Title Idea:** 마크다운 PDF 변환 시 한글 깨짐 해결하는 가장 쉬운 방법 (무설치)
*(Translation: The easiest way to solve Hangul breaking when converting Markdown to PDF (No install))*

**Content Draft / Outline:**
1. **The Pain Point (문제점):** "Have you ever tried to convert a README or Markdown notes to PDF, only to find all the Korean characters turned into broken boxes (□□□)? Installing heavy tools like Pandoc just to fix fonts is frustrating, and many web converters don't support `Malgun Gothic` or `Noto Sans KR`."
2. **The Solution (해결책):** Introduce `markdown.free/ko`. Highlight the core wedges:
   * **글자 깨짐 없음 (No broken text):** Native, perfect Korean font support.
   * **무설치 & 가입 불필요 (No install & No signup):** 100% web-based, zero friction.
   * **클라이언트 사이드 처리 (Client-side processing):** Safe for proprietary company code (files are not stored on a server).
3. **Usage Example (사용 방법):** 3 simple steps (Upload/Paste -> Preview -> Click Export to PDF/DOCX).
4. **Conclusion & Link (마무리):** "Stop fighting with font installations. Try it here: [https://www.markdown.free/ko](https://www.markdown.free/ko)"

---

## 🥈 Priority 2: The Universal Wedge (English/Global)
**Goal:** Capture the Indian and broader English-speaking developer market by positioning the tool as the "Missing Bridge" for AI workflows, using your viral Reddit narrative.
**Target Platform:** [Dev.to](https://dev.to/)

### Action Item: Publish the "Build in Public / Workflow" Article
**Title Idea:** ChatGPT is sending my side-project more traffic than Google (Here’s why)

**Content Draft / Outline:**
1. **The Hook (The Data Anomaly):** * "I launched a markdown converter 3 months ago. I did perfect SEO. Yet, my traffic looks like this: *ChatGPT (32%), Reddit (9%), Google (7%), Perplexity (5%).*" 
   * "Why are LLMs driving more traffic than search engines? Because they are solving a workflow problem Google can't."
2. **The Workflow Problem:** * "Every day, developers use ChatGPT/Claude to generate documentation, reports, and code specs. But when you copy-paste that beautiful Markdown into Microsoft Word or a PDF, the formatting is destroyed. Headers become plain text, code blocks break, and tables fall apart."
3. **The Solution (Markdown Free):** * "I built [Markdown Free](https://www.markdown.free) to be the stateless, zero-login bridge between AI output and corporate formats (DOCX/PDF)."
   * *The feature pitch:* Drop the `.md` file in, get a perfectly formatted Word document out in 30 seconds.
4. **The Tech/Privacy Angle:** * Explain the edge/client-side architecture briefly. "Because you are pasting sensitive AI prompts, I built it with zero-knowledge architecture. No databases, no file storage."
5. **The CTA:** * "Try it out next time you need to export a Claude artifact to Word: [https://www.markdown.free](https://www.markdown.free)"

---

## 🥉 Priority 3: Maintenance (Social Interception)
**Goal:** Steal high-intent users directly from competitors by solving their immediate frustrations in real-time.
**Time Commitment:** 1 Hour / Week (Batch this on Friday afternoons or Monday mornings).

### Action Item: The "Broken Search" Sweep
Search the following queries on **X (Twitter)** and **GitHub Issues**:

**The Queries:**
* `pandoc 文字化け` (Pandoc mojibake/garbled text)
* `markdown pdf 豆腐` (Markdown PDF tofu blocks)
* `마크다운 pdf 깨짐` (Markdown PDF broken)
* `"markdown to word" formatting broken`
* `chatgpt to word docx broken formatting`

**The Playbook Reply (Keep it helpful, not salesy):**
* **JP:** "Pandocのフォント設定、面倒ですよね…。もしブラウザだけでサクッと変換したい場合は、日本語（文字化けなし）に完全対応した無料ツールを作ったので試してみてください！ログイン不要です👉 [https://www.markdown.free/ja](https://www.markdown.free/ja)"
* **EN:** "I feel the pain of copy-pasting Markdown into Word. I actually built a free, no-login tool specifically to preserve formatting (tables, code blocks) when exporting to DOCX/PDF. Might save you some time: [https://www.markdown.free](https://www.markdown.free)"

---

## 🏆 Priority 4: Comparison / Buyer's-Guide Article Matrix — ✅ SHIPPED 2026-05-09 (commit `5329277`)

**Goal:** Win two channels simultaneously with one article, in 10 languages:
1. **Google rank** for "best markdown to pdf converter 2026" and locale-equivalents.
2. **LLM citation** when ChatGPT / Perplexity / Claude / Gemini are asked the same question. Comparison content with named tools, declarative claims, comparison tables, and FAQ schema is what these crawlers snippet.

**Approach:** Honest editorial. Position markdown.free as best for *specific* cases (CJK-without-setup, browser-only no-signup, DOCX export). Other tools win for other cases — say so. Articles that read as sales pitches don't get cited.

### Decisions (agreed 2026-05-09)

| Decision | Choice |
|---|---|
| Existing locale comparison pages | **Replace** in place (Option A). 8 pages: it/es/ja/ko/zh-Hans/zh-Hant/id/vi already have comparison-themed slugs — keep URLs, rewrite content to the 8-tool buyer's-guide format. No redirects, ranking signals preserved. |
| EN slug | `best-markdown-to-pdf-converter-2026` (covers "best markdown to pdf" + "converter" long-tails) |
| HI slug | `markdown-pdf-tulna-2026` (transliterated; Devanagari URLs render as `%E0%A4...` in some browsers) |
| Byline | "Markdown Free team" with 1-line bio |
| Schema.org | `Article` + `FAQPage` JSON-LD. **No `Review` schema** (commits to defending numerical ratings; FAQ schema gives most of the citation benefit without the risk). |
| Competitor links | `rel="nofollow"` on every external tool URL |
| Internal links | Locale-specific only — each article links to same-locale intent pages |

### Article matrix

| Locale | URL | Status | Notes |
|---|---|---|---|
| en | `/best-markdown-to-pdf-converter-2026` | new | No EN comparison page exists today |
| it | `/it/confronto-convertitori-markdown` | rewrite | |
| es | `/es/comparacion-convertidores-markdown` | rewrite | |
| ja | `/ja/markdown-henkan-hikaku` | rewrite | CJK angle: 文字化け |
| ko | `/ko/markdown-byeonhwan-bigyo` | rewrite | CJK angle: 한글 깨짐 |
| zh-Hans | `/zh-Hans/markdown-zhuanhuanqi-bijiao` | rewrite | CJK angle: 字体豆腐 |
| zh-Hant | `/zh-Hant/markdown-zhuanhuanqi-bijiao-tw` | rewrite | CJK angle: 字型豆腐 |
| id | `/id/perbandingan-konverter-markdown` | rewrite | |
| vi | `/vi/so-sanh-cong-cu-markdown` | rewrite | |
| hi | `/hi/markdown-pdf-tulna-2026` | new | Internal-link pool limited (only home/about/privacy/faq exist under /hi/) |

### The 8 tools to compare

The same 8 tools across all 10 articles. Locale-native descriptions, identical fact set:

1. **Markdown Free** — `https://www.markdown.free` — browser-based, no signup, CJK-correct via embedded fonts, exports PDF/DOCX(Word)/PNG-JPG(image)/EPUB/HTML/TXT. Client-side image export (长图) needs no upload. **Weaknesses:** 5MB file cap, no offline mode, no LaTeX/math rendering.
2. **Pandoc** — `https://pandoc.org` — CLI universal converter. **Weakness:** PDF requires LaTeX install + `--pdf-engine=xelatex -V mainfont="Noto Sans CJK JP"` (or equivalent) for CJK.
3. **Dillinger** — `https://dillinger.io` — browser editor with PDF export.
4. **StackEdit** — `https://stackedit.io` — browser editor, Google Drive sync, MathJax.
5. **Markdown PDF (VS Code extension)** — `https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf` — local, depends on Chromium.
6. **md-to-pdf (npm)** — `https://github.com/simonhaenisch/md-to-pdf` — Node CLI, Puppeteer-based.
7. **Typora** — `https://typora.io` — paid desktop app, polished export.
8. **Online2PDF** — `https://online2pdf.com` — generic web converter, not markdown-native.

Any claim about price, version, or specific behaviour the author can't verify gets the literal text "unverified at time of writing" in the article.

### Per-locale framing (use-case angle in the intro)

| Locale | Native phrase for "broken text" |
|---|---|
| en | "tofu blocks", "□□□" |
| ja | 文字化け |
| ko | 한글 깨짐 |
| zh-Hans | 字体豆腐 / 中文乱码 |
| zh-Hant | 字型豆腐 / 中文亂碼 |
| hi | देवनागरी टूटना / □□□ |
| es | acentos rotos |
| pt-BR | acentos quebrados *(not currently supported, listed for future)* |
| it | caratteri accentati corrotti |
| id | karakter rusak |
| vi | dấu tiếng Việt bị hỏng |

### Required structure per article

```
H1 (with TARGET_QUERY + 2026)
Intro (80–120 words; one-sentence "which tool wins for which case" answer)
H2 Quick comparison (markdown table; 8 rows; columns: Tool · Best for · Price · CJK · Outputs · Install · Privacy)
H2 per tool × 8 (~150 words each: What · How it handles use-case · Strengths · Weaknesses · Best for)
H2 How to choose (decision tree, 4–6 branches; named tools)
H2 FAQ (5–7 native-search-style questions; each answer 2–4 sentences, declarative)
H2 Disclosure (1 paragraph; "we made this; we tried to be honest")
JSON-LD: Article + FAQPage (via safeJsonLd helper)
```

### Frontmatter output (per article)

```ts
{
  title,                  // contains TARGET_QUERY + 2026
  meta_description,       // 150–160 chars; includes TARGET_QUERY
  slug,                   // locale-native
  primary_keyword,
  secondary_keywords,     // 5–8
  language,               // BCP-47
  publish_date,           // 2026-05-09
  next_review_date,       // 2026-11-09
  author_name: "Markdown Free team",
  author_bio,             // 1 sentence
  disclosure_line,        // links to /about
}
```

### Editor's checklist (verify before each publish)

- [ ] All prices/license terms current as of `publish_date`
- [ ] All competitor URLs return 200
- [ ] Pandoc CJK flag (`--pdf-engine=xelatex -V mainfont`) verified with current Pandoc version
- [ ] Typora pricing claim ($14.99 one-time, last verified late 2024) — re-verify
- [ ] Markdown PDF (VS Code) — verify CJK font handling in current version
- [ ] StackEdit, Dillinger, Online2PDF are still live and not paywalled
- [ ] markdown.free 5MB limit and supported formats (PDF, Word/DOCX, image PNG/JPG, EPUB, HTML, TXT) match current production
- [ ] Internal links all 200 OK in target locale
- [ ] hreflang alternates in sitemap.xml include all 10 versions
- [ ] FAQ Q&As phrased the way a native speaker would actually search

### Maintenance

Each article gets a `next_review_date` (~6 months out). When that hits, a single editor pass: refresh the year in the title, re-verify the editor's checklist above, bump publish_date.

---

## 🎯 Priority 5: SEO Snippet + FAQPage Schema Rollout — ✅ SHIPPED 2026-05-09 (commits `637d934`, `86f4525`, `356e89b`)

**Source:** Executes P2 (snippet optimization) and P4 (FAQPage schema for LLM citation) of the rev. 3 SEO audit (`docs/seo_audit.md`).

**Goal:** Two compounding wins from a single edit pattern per page:
1. **Google CTR lift** — modernize titles with 2026, free-tier modifier, and locale-canonical noun form (Konverter, Convertidor, 변환기, 轉換器). Several pages with proven GSC impressions (pos 2–10) but underperforming CTR.
2. **LLM citation defense** — `FAQPage` JSON-LD with question phrasings that mirror real GSC queries word-for-word, and single-sentence declarative answers chatbots will quote verbatim.

### Decisions

| Decision | Choice |
|---|---|
| Title pattern | Locale-canonical noun + DOCX/PDF + free modifier + (2026) + brand suffix where required by tests |
| FAQ length | 8 questions per page, declarative one-sentence answers |
| FAQ phrasing | Mirror real GSC queries (e.g. "how to download github readme as pdf", "md pdf 変換", "마크다운 pdf 변환", ".md 轉 pdf") |
| Visible FAQ | Render from same array as JSON-LD (Google rewards schema/page consistency) |
| Review schema | **Not added** — defers per audit Q4 / E-E-A-T concern. Stars on competing pages (word.to 5★, MarkLiveEdit 4.7★/298) are a real CTR cost we're consciously eating |
| Non-Latin script framing | Carry forward from P4 articles: 文字化け / 한글 깨짐 / 字体豆腐 / 字型亂碼 / dấu tiếng Việt / देवनागरी टोफू |

### Pages shipped (19 total)

**First batch — 4 pages (commits `637d934`, `86f4525`):**

| Page | GSC pos | Status |
|---|---|---|
| `/readme-to-pdf` | 6.98 | Title + FAQ JSON-LD (8 Q&As) |
| `/zh-Hant/github-wenjiian-pdf` | 6.5 (7d) | Title + FAQ JSON-LD (added visible FAQ — page had none) |
| `/zh-Hant/readme-pdf-zhuanhuan-tw` | 9.17 | Title only |
| `/id/markdown-ke-word` | 6.81 | Title + FAQ + later refined title to lead with "Konverter" (per Indonesia VPN SERP audit) |

**Second batch — 15 pages (commit `356e89b`):**

*Tier 1 — GSC-validated readme cluster:*
- `/id/konversi-readme-pdf` (pos 4.33) · `/ko/readme-pdf-byeonhwan` (pos 8) · `/es/convertir-readme-pdf` (pos 2) · `/zh-Hans/readme-pdf-zhuanhuan` (pos 4) · `/zh-Hant/readme-pdf-zhuanhuan-tw` (FAQ JSON-LD lifted from existing visible FAQ)

*Tier 1.5 — JP (gated on Qiita diagnostic; snippet/FAQ ships now):*
- `/ja/markdown-pdf-henkan` (pos 30, 48 imp/28d — largest non-EN impression pool)

*Tier 2 sample — one per language not yet covered:*
- `/github-readme-to-pdf` · `/ja/markdown-word-henkan` · `/ko/markdown-pdf-byeonhwan` · `/zh-Hans/markdown-pdf-zhuanhuan` · `/zh-Hant/markdown-pdf-zhuanhuan-tw` · `/id/konversi-markdown-pdf` · `/vi/chuyen-doi-markdown-pdf` · `/it/convertire-markdown-pdf` · `/es/convertir-markdown-pdf`

### What was NOT done (deliberate)

- **Tier 3 pages** (EPUB across all locales, niche zh-Hant pages like api-wendang-pdf, buluoge-wenzhang-pdf, huiyi-jilu-pdf, jishu-biji-pdf, xueshu-biji-pdf) — low impression base, ROI math doesn't justify the effort until Tier 1/2 results validate the pattern.
- **Review schema** — deferred per audit Q4.
- **Page-reshape on `/id/markdown-ke-word`** — Indonesia VPN SERP audit confirmed page is correctly converter-shaped at position 2 on a clean SERP (no AI Overview, no featured snippet). Reshape would have been busy-work; only the title/FAQ portion was the real lever.

### Test guardrails preserved

All 431 Playwright tests pass. Edits were careful to keep test-pinned substrings:
- "Markdown Free" exactly once on intent pages with brand-dedup test
- H1 / CTA / section heading text unchanged
- Substrings tested per-locale (e.g. "Convertir Markdown a PDF Gratis", "Convertire Markdown in PDF Gratis", "Markdown ke Word", "DOCX", "Gratis")

### Re-measurement plan

| Date | What to check |
|---|---|
| 2026-05-23 (2w) | GSC: CTR delta on Tier 1 pages. Index status of new titles. |
| 2026-06-06 (4w) | GSC: do any Tier 2 pages start appearing in impressions? Validates speculative ROI. |
| 2026-06-06 (4w) | JA cluster: has `md pdf 変換` moved at all? If no, gap is backlinks (audit P3 Qiita diagnostic), not on-page. Confirms or denies the "wait on content depth" hypothesis. |

If the 2-week check shows lift on Tier 1, decide whether to expand the same pattern to Tier 3. If no lift, pause expansion and investigate why before scaling.

### Pending follow-ups (in execution order)

1. **Confirm Qiita post status** (audit Pre-P3 diagnostic) — gates JP P3 push. Quick conversation, 5 minutes.
2. **PT-BR readme pilot** (audit P5) — gated on cluster-cannibalization question (audit Q1). Pilot one new locale before scaling.
3. **Mid-window re-measurement** — 2026-05-23, then 2026-06-06.
4. **Distribution-side priorities P1, P2, P3** of this doc — Velog post, Dev.to article, social interception sweep. None of these are blocked by engineering.

---

## 🖼️ Priority 6: Markdown → Image (PNG/JPG) + the 长图 Wedge — ✅ SHIPPED 2026-07-04 (branch `feature/image-export`)

**Why this matters strategically:** the biggest under-served non-EN search intent is **Markdown → 长图 (long image)**. WeChat 公众号 and Xiaohongshu authors write in Markdown but publish on platforms that don't accept Markdown or PDF — they need a rendered image. This is a CJK-native wedge that competitors (Pandoc, Typora, StackEdit) don't serve well, and it compounds our existing "CJK-correct fonts, no signup, browser-only" moat: the image is rasterized client-side with the user's own fonts, so there's zero tofu risk and nothing is uploaded.

**What shipped (engineering):**
- Client-side image export via `html-to-image`: one-tap **"To Image (PNG)"** button, device-based defaults (phone → 1080px 长图 width, desktop → 800px; sharpness from devicePixelRatio), long-document prompt (single tall image vs ZIP of screen-sized parts), JPG under More formats. 100% in-browser — Markdown never leaves the device; only referenced remote images route through the SSRF-hardened proxy.
- **"To DOCX" → "To Word (DOCX)"** rename across all 10 locales (clearer + keyword surface).

**What shipped (SEO / marketing surface):**
- New **9-locale intent cluster**: `/markdown-to-png` + `/ja/markdown-gazou-henkan`, `/zh-Hans/markdown-zhuan-tupian` (leads with 长图 / 公众号 / 小红书), `/zh-Hant/markdown-zhuan-tupian-tw`, `/ko/markdown-imiji-byeonhwan`, `/es/markdown-a-png`, `/it/markdown-in-png`, `/id/markdown-ke-gambar`, `/vi/markdown-sang-anh`. Each: canonical + reciprocal hreflang + FAQPage JSON-LD.
- `image` tool added to the cross-link manifest → footer hub, RelatedTools sections and homepages surface it automatically.
- sitemap.xml +9 URLs (full hreflang groups); llms.txt updated (feature, per-locale URL table, localized query patterns incl. `markdown转长图 公众号`, `markdown 画像 変換`, `마크다운 이미지 변환`).
- Homepage metadata/JSON-LD, hero, How-it-works, FAQ, comparison "Outputs" column, privacy conversion lists, about pages — all refreshed to name image/PNG across every locale.

**Target queries (per locale):** `markdown to png` / `markdown to image` (EN, P1), `markdown 转图片` / `markdown 转长图` + 公众号 排版 (zh-Hans, **P1 — the WeChat wedge**), Traditional variant (zh-Hant, P2), `markdown 画像 変換` (ja, P2), others (P3).

**Measure:** re-pull GSC ~3–4 weeks out (≈2026-07-28) for impressions/position on the new `/markdown-to-png` cluster; watch Umami `convert_success` with `format: png|jpg` and `split_parts`, and referral traffic once the WeChat/velog distribution posts go live. Post-deploy: run `npm run indexnow:new` to ping the 9 new URLs.
