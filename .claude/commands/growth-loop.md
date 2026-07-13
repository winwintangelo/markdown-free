---
description: Run one growth-intelligence cycle — collect, measure, analyze, propose, (gated) implement, summarize. Manual entrypoint (growth-impl.md §10.1).
---

You are running one cycle of the growth-intelligence loop for markdown.free.
**Read `docs/growth-impl.md` first** if you have not this session — it is the spec.
You are a **thin orchestrator**: run the deterministic stages as scripts, then apply
judgment only where the design says a human/LLM does (propose, implement, summarize).

## Invariants (never cross these — impl doc "Will Never Do")
- **Never** `git push`, merge, deploy, or run `vercel` (also deny-listed in `.claude/settings.json`).
- **Never** implement anything but 🟢 auto-safe mechanical fixes, and only to a `growth/<date>` branch — never `main`.
- **Never** ship a proposal or verdict without its reasoning (`why`).
- Optimize for decision quality; the moat filter + guardrail metrics outrank any traffic win.

## Stages (run in order; stop on first failure — partial runs are recoverable, §17)

1. **snapshot** — `npm run growth:snapshot`. Writes `data/snapshots/<date>.json`. If every channel is skipped, stop and report (likely missing creds — §13).
2. **measure** — `npm run growth:measure`. Scores any ledger entry whose `measure_on` has arrived (trailing means · DiD vs control · guardrails) and records the verdict. Report each verdict with its note. (Most cycles: "nothing due yet.")
3. **discover** — `npm run growth:discover`. Mines the snapshot into the Signal Warehouse (grouping by page/query so multi-channel + in-funnel corroboration compounds), ages signals, graduates those the Confidence Engine clears. Report how many graduated.
4. **analyze** — `npm run growth:analyze`. Deltas + threshold-gated regressions — your regression watch.
5. **propose** *(engine + your judgment)* — run `npm run growth:propose`: the Opportunity Engine ranks graduated signals into a portfolio (impact × effort⁻¹ × confidence × **moat** × **goal**, ~40/30/20/10 buckets), 🟢/🟡 tagged, each with a `why` + KB context. **REFINE, don't rebuild:** sanity-check the moat/impact calls, re-order for judgment the heuristics miss, drop anything off-thesis, confirm the gates. Append the refined digest to `data/loop-log.md`.
6. **implement** *(gated, Level B)* — only if there are 🟢 items and the user is present/approving:
   - `git switch -c growth/<date>` (never on `main`).
   - Make the change → `npx tsc --noEmit` → prod-build e2e (`npm run build` + tests) → `git commit`. **Do not push.**
   - Write a ledger entry per change (hypothesis, target_metric + guardrail_metrics, target_scope + control_scope if a cohort, baseline, `measure_on = today + 28d`) — the graduated signal's `target` is the starting point. A resolved verdict later feeds the Knowledge Base automatically (measure → learn).
   - If tsc/e2e fails, revert that item, keep the rest, and report it as needing a hand.
7. **summarize** *(your judgment)* — end with: what was measured, what graduated, what's proposed (🟡 items needing the user's call), what was auto-implemented (branch name), the health block (§16), and a one-line **"your move."**

## Notes
- Stages 1–4 are read-only; prefer the `growth-analyst` subagent for them. Only stage 5 writes, and only to a branch.
- This is **manual-first**. Scheduling (Routines / GH Action) comes in P2, unchanged in behavior.
- **Demand side (W1 — the painpoint half).** `npm run growth:social` (GitHub/SO/HN painpoints) + `npm run growth:consolidate` run on their own cadence and write provisional themes to `data/themes.json`. When themes are present, **this is where you (the model) do the real work D2 needs**: read the raw `data/painpoints.json` evidence + the pre-groups, then **refine** — merge/split, rename, drop noise (the deterministic pre-group is keyword-based and noisy), and **re-triage build / defer / decline** against the moat (simple, no-signup, CJK-correct). Surface the survivors as 🟡 **product-track** proposals that inform the roadmap — you never auto-build a feature. Reply-to-fresh distribution (D4) is deferred (needs a real community account + is human-posted; never auto-post).
