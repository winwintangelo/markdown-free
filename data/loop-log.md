# Growth loop — running log

Human-readable digest, appended by the `propose`/`summarize` stages each cycle
(growth-impl.md §10.1). Newest entries on top. This file is the weekly review surface.

---

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
