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
3. **analyze** — `npm run growth:analyze`. Reports deltas + threshold-gated regressions + striking-distance / low-CTR opportunities. Read this output — it is your evidence base.
4. **propose** *(your judgment)* — from the analyze output + the ledger, produce a **ranked** action list:
   - Score on impact × effort × confidence × **moat alignment** (simple, no-signup, CJK-correct). Down-weight/decline anything that dilutes the moat.
   - Classify each: 🟢 **auto-safe** (mechanical, reversible: missing schema, broken link, hreflang entry, meta tweak) vs 🟡 **needs-approval** (content, new pages, redirects, anything strategic/outward).
   - Give every item a one-line **why** (the evidence behind it).
   - Append the digest to `data/loop-log.md` (newest on top).
5. **implement** *(gated, Level B)* — only if there are 🟢 items and the user is present/approving:
   - `git switch -c growth/<date>` (never on `main`).
   - Make the change → `npx tsc --noEmit` → prod-build e2e (`npm run build` + tests) → `git commit`. **Do not push.**
   - Write a ledger entry per change (`node -e` via the ExperimentLedger, or hand-add to `data/ledger.json`): hypothesis, target_metric (+ guardrail_metrics), target_scope (+ control_scope if a cohort), baseline (backfill or capture now), `measure_on = today + 28d`.
   - If tsc/e2e fails, revert that item, keep the rest, and report it as needing a hand.
6. **summarize** *(your judgment)* — end with: what was measured, what's proposed (🟡 items needing the user's call), what was auto-implemented (branch name), the health block from analyze (§16), and a one-line **"your move."**

## Notes
- Stages 1–4 are read-only; prefer the `growth-analyst` subagent for them. Only stage 5 writes, and only to a branch.
- This is **manual-first**. Scheduling (Routines / GH Action) comes in P2, unchanged in behavior.
