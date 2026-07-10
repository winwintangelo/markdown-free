# Off-site backlink program — prioritized target list

**Context:** On-site SEO is complete (cross-links, hreflang across all 4 clusters, titles/FAQ/CJK, llms.txt, AI-crawler access). GSC diagnostic showed JP/KO intent pages are at content parity with well-ranking ID/zh pages but stuck ~pos 34 → the gap is **off-page authority**, not content. This list is the validated next lever, for both JP/KO rankings *and* AI-citation (LLMs sample the same dev sources Google ranks).

**Product positioning (use verbatim in copy):** Free in-browser Markdown converter → PDF, DOCX (Word), EPUB, HTML, TXT. No signup, no watermark, files never stored (client-side for HTML/TXT). GitHub Flavored Markdown + code highlighting. 10 languages. "Upload-first, under 30 seconds." Live: https://www.markdown.free

**Legend:** 🟢 = I can draft/prep the exact submission (you review + submit) · 🔵 = needs your account/login to submit · DF = dofollow link · NF = nofollow (still valuable: referral traffic + brand mentions LLMs cite)

---

## Tier 1 — High authority, topically relevant, do first

### 1. 🟢 DF · `BubuAnabelas/awesome-markdown` (935★, actively maintained, CC0)
The flagship awesome-list for Markdown. Section: **Tools → Converters**. Read `.github/contributing.md` first (alphabetical, one entry).
- **Format** (mirror the existing StackEdit/Pandoc lines): `[Name](URL) - Description. [platform badges]`
- **Ready entry** (place alphabetically under Converters; copy the `[![Globe]]` badge reference from the StackEdit line):
  ```
  [Markdown Free](https://www.markdown.free) - Free in-browser converter for Markdown to PDF, DOCX, EPUB, HTML and TXT. No signup, no watermark, files never stored. [![Globe]][Globe]
  ```
- Related secondary lists to PR after this lands (lower authority, same idea): `mundimark/awesome-markdown`, `pditommaso/awesome-markdown`, `webiaio/awesome-markdown`.

### 2. 🟢 DF · `J0rgeSerran0/Useful-Free-Online-Tools-and-Sites` (478 commits, active, PRs welcome)
Rule: must be free, ordered alphabetically. Section: **Markdown** (or Documents).
- **Format:** `[**Tool Name** - (_Brief description_)](URL)`
- **Ready entry** (alphabetical):
  ```
  [**Markdown Free** - (_Convert Markdown to PDF, Word, EPUB, HTML and TXT in your browser — no signup, no watermark, files never stored_)](https://www.markdown.free)
  ```

### 3. 🔵 DF · AlternativeTo — https://alternativeto.net
List markdown.free as an alternative to Pandoc, Dillinger, StackEdit, Typora, MarkdownToPDF.me. Profile link is dofollow; strong topical cluster. Needs account.
- **Tagline:** "Free, private, no-signup Markdown → PDF/Word/EPUB/HTML/TXT converter that runs in your browser."

### 4. 🔵 DF · SaaSHub — https://www.saashub.com/markdown-to-pdf-alternatives
Submit as a product; it surfaces on the "Markdown to PDF alternatives" page alongside MD2FILE, MarkdowntoPDF.me. Needs account.

---

## Tier 2 — JP / KO placements (targets the actual ranking-gap markets)

These are genuine tutorial posts on the dev platforms Japanese/Korean users (and LLMs) read. Links may be NF, but they drive in-market referral traffic + brand mentions exactly where JP/KO rankings and AI-citation are weak. **Highest strategic value** given the GSC finding.

### 5. 🟢 JP · Qiita — https://qiita.com  (high-authority JP dev platform)
Proven demand: existing article "【無料】30秒でMarkdownをPDFに変換する方法（登録不要）" ranks. Write an original how-to (do NOT copy).
- **Draft title:** 「【登録不要・無料】MarkdownをPDF / Word / EPUBに30秒で変換する（10言語対応・ファイル保存なし）」
- **Outline:** ①課題（インストール/登録/透かしが面倒）→ ②Markdown Freeで貼り付け→変換の手順（スクショ）→ ③PDF以外（Word/EPUB/HTML/TXT）→ ④プライバシー（サーバー非保存）→ ⑤対応言語。本文中に https://www.markdown.free/ja/markdown-pdf-henkan へリンク。

### 6. 🟢 JP · Zenn — https://zenn.dev
Same angle, Zenn audience skews engineer. Link the JP readme/PDF intent pages.

### 7. 🟢 KO · velog — https://velog.io  (dominant KO dev blog platform)
- **Draft title:** 「회원가입 없이 마크다운을 PDF·Word·EPUB로 변환하는 무료 사이트 (파일 저장 안 함)」
- **Outline:** 문제 → 붙여넣기→변환 3단계(스크린샷) → PDF 외 포맷 → 프라이버시 → 10개 언어 지원. 본문에 https://www.markdown.free/ko/markdown-pdf-byeonhwan 링크.

### 8. 🟢 KO · Tistory / OKKY / 커리어리
Cross-post the velog piece to Tistory; drop a genuinely helpful mention in relevant OKKY/커리어리 threads.

---

## Tier 3 — Launch & community (referral + brand; mostly NF but high-visibility)

### 9. 🔵 Product Hunt — https://www.producthunt.com  (pick a launch day)
"Markdown Free — convert Markdown to PDF/Word/EPUB in your browser, no signup." Strong referral spike + lasting brand mention.

### 10. 🔵 Indie launch directories (DF on several): DevHunt, Uneed, Fazier, Peerlist, Toolfolio
Low effort, several give dofollow profile/tool links. Reuse the AlternativeTo tagline.

### 11. 🟢 Hacker News
- Add a genuinely useful comment on the existing thread *Ask HN: Where are the good Markdown to PDF tools?* (news.ycombinator.com/item?id=43231964) — it explicitly asks for tools matching markdown.free's exact requirements.
- Later: a **Show HN** post. NF but heavy referral + frequently cited by LLMs.

### 12. 🟢 Reddit — r/markdown, r/webdev, r/selfhosted (as helpful answers, not spam)
Answer existing "how do I convert markdown to pdf" threads.

---

## Tier 4 — Secondary awesome-lists (batch after Tier 1)
`mathewlewallen/awesome-free-tools`, `mundimark/awesome-markdown-editors` (we have a viewer/preview), `dvorka/awesome-markdown-repositories`, `macmdviewer/awesome-markdown-mac` (we render on macOS browsers). Same PR pattern as Tier 1.

---

## Suggested execution order
1. **This week (🟢, I can draft all copy/PRs):** #1 + #2 GitHub PRs, #5–#8 JP/KO posts, #11 HN Ask-thread comment.
2. **Needs your login (🔵):** #3 AlternativeTo, #4 SaaSHub, #9 Product Hunt, #10 indie directories.
3. **Measure:** re-pull GSC in ~3–4 weeks; watch JP/KO avg position on the readme/pdf/comparison intent pages and referral traffic from qiita.com / velog.io in Umami.

**Note:** Opening the GitHub PRs (#1, #2) posts publicly under your GitHub identity — say the word and I'll draft the exact diff or open them via `gh`; I won't do that without your go-ahead.
