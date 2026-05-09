# Markdown Free: Growth & Marketing Sprint 🚀

**Objective:** Transition from Phase 1 (Building) to Phase 2 (Validation & Scaling) by leveraging our CJK technical moat, the "No Login" universal wedge, and the "AI Referral" narrative.

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

## 🏆 Priority 4: Comparison / Buyer's-Guide Article Matrix

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

1. **Markdown Free** — `https://www.markdown.free` — browser-based, no signup, CJK-correct via embedded fonts, exports PDF/DOCX/EPUB/HTML. **Weaknesses:** 5MB file cap, no offline mode, no LaTeX/math rendering.
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
- [ ] markdown.free 5MB limit and supported formats match current production
- [ ] Internal links all 200 OK in target locale
- [ ] hreflang alternates in sitemap.xml include all 10 versions
- [ ] FAQ Q&As phrased the way a native speaker would actually search

### Maintenance

Each article gets a `next_review_date` (~6 months out). When that hits, a single editor pass: refresh the year in the title, re-verify the editor's checklist above, bump publish_date.
