// `measure` stage (growth-impl.md §6.2 ledger cross-reference, §8.3 Experiment Engine).
//
// For every ledger entry whose measure_on has arrived: pull the target metric from
// recent snapshots (trailing mean), compare to the windowed baseline, score a
// difference-in-differences vs the control cohort where one exists, check guardrails,
// and record the verdict. Robust to thin data — with no history / no baseline yet an
// entry is scored `inconclusive` with a note, never a false win/loss.
//
//   node scripts/growth/measure.mjs      (or: npm run growth:measure)

import { SnapshotStore, todayStr, isMain, pathOf } from './lib.mjs';
import { ExperimentLedger } from './ledger.mjs';
import { learnFromExperiment } from './learn.mjs';

const WINDOW_DAYS = 28;

// Aggregate one metric over the rows in `scope` for a channel in a single snapshot.
//
// Scope keys are pathOf()-normalized on BOTH sides (same normalizer as the
// experiment-lock): ledger scopes store full URLs while the vercel channel keys
// rows by bare requestPath — without normalization CN-side experiments (whose only
// visibility is Vercel, not GSC/Bing) could never match their own target pages.
function metricInSnapshot(snapshot, channel, metric, scope) {
  const ch = snapshot?.channels?.[channel];
  if (!ch) return null;
  const scoped = (scope?.pages?.length || 0) + (scope?.queries?.length || 0) > 0;
  const keys = new Set([...(scope?.pages || []), ...(scope?.queries || [])].map(pathOf));
  const inScope = (rows = []) => (scoped ? rows.filter((r) => keys.has(pathOf(r.key))) : rows);

  // `cta_clicks` lives in the events channel: comparison_cta_click grouped by
  // requestPath (events.mjs). A present-but-unmatched cta block scores 0 (measured,
  // no clicks); a missing block (pre-deploy snapshot) scores null (no data).
  if (metric === 'cta_clicks') {
    if (!ch.cta) return null;
    return inScope(ch.cta.byPath).reduce((s, r) => s + (r.count || 0), 0);
  }

  // `ai_sessions` lives in the referral channel (site-wide AI-assistant sessions —
  // chatgpt/doubao/yuanbao/perplexity referrers). Scope-less by nature: llms.txt /
  // AI-visibility experiments target the whole site, so their ledger scopes stay
  // empty and lock nothing.
  if (metric === 'ai_sessions') {
    return (ch.groups || []).find((g) => g.group === 'ai')?.sessions ?? null;
  }

  const rows = [...inScope(ch.pages), ...inScope(ch.queries)];
  if (!rows.length) return null;

  // pageviews/visitors come from the vercel channel (pages rows carry both).
  if (metric === 'clicks' || metric === 'impressions' || metric === 'pageviews' || metric === 'visitors') {
    return rows.reduce((s, r) => s + (r[metric] || 0), 0);
  }
  if (metric === 'ctr') {
    const c = rows.reduce((s, r) => s + (r.clicks || 0), 0);
    const i = rows.reduce((s, r) => s + (r.impressions || 0), 0);
    return i ? +((c / i) * 100).toFixed(2) : 0;
  }
  if (metric === 'position') {
    let w = 0, wi = 0;
    for (const r of rows) if (r.position != null && r.impressions) { w += r.position * r.impressions; wi += r.impressions; }
    return wi ? +(w / wi).toFixed(2) : null;
  }
  return null;
}

// Trailing mean of a metric over the snapshots inside the window.
function trailingMean(snapshots, channel, metric, scope) {
  const vals = snapshots.map((s) => metricInSnapshot(s, channel, metric, scope)).filter((v) => v != null);
  if (!vals.length) return null;
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

// Positive delta = "better". For position, lower is better, so invert.
const betterness = (metric, delta) => (metric === 'position' ? -delta : delta);

export function scoreExperiment(entry, snapshots) {
  const { channel, target_metric: m, target_scope, control_scope, baseline, guardrail_metrics = [] } = entry;

  const current = trailingMean(snapshots, channel, m, target_scope);
  if (current == null) {
    return { status: 'inconclusive', outcome: { note: 'insufficient snapshot history for target scope' } };
  }
  const base = baseline?.mean;
  if (base == null) {
    return { status: 'inconclusive', outcome: { treated_delta: null, note: 'baseline not backfilled (pre-loop ship) — backfill from search-API history in P1' } };
  }

  const treatedDelta = +(current - base).toFixed(2);

  // Difference-in-differences when a held-back control cohort exists.
  let did = null, controlDelta = null;
  if (control_scope) {
    const cCur = trailingMean(snapshots, channel, m, control_scope);
    const cBase = entry.control_baseline?.mean;
    if (cCur != null && cBase != null) {
      controlDelta = +(cCur - cBase).toFixed(2);
      did = +(treatedDelta - controlDelta).toFixed(2);
    }
  }

  const effect = did != null ? did : treatedDelta;

  // Guardrails: a win requires no guardrail metric to have regressed.
  const guardrailsHeld = guardrail_metrics.every((gm) => {
    const cur = trailingMean(snapshots, channel, gm, target_scope);
    // Unknown guardrail value can't be cleared — treat as not-held only if we can measure it.
    if (cur == null || entry.guardrail_baseline?.[gm] == null) return true;
    return betterness(gm, cur - entry.guardrail_baseline[gm]) >= 0;
  });

  const improved = betterness(m, effect) > 0;
  const status = improved && guardrailsHeld ? 'won' : (!improved ? 'lost' : 'inconclusive');
  return {
    status,
    outcome: {
      treated_delta: treatedDelta, control_delta: controlDelta, did,
      guardrails_held: guardrailsHeld,
      note: `${m} ${effect >= 0 ? '+' : ''}${effect}${did != null ? ' (DiD)' : ''} vs baseline ${base}`,
    },
  };
}

export function runMeasure(asOf) {
  const due = ExperimentLedger.due(asOf);
  const snapshots = SnapshotStore.recent(WINDOW_DAYS); // newest first; window-bounded later
  const results = [];
  for (const entry of due) {
    const { status, outcome } = scoreExperiment(entry, snapshots);
    ExperimentLedger.record(entry.id, outcome, status);
    // P4: a resolved experiment feeds the Knowledge Base (wins branch, losses prune).
    if (status === 'won' || status === 'lost') learnFromExperiment({ ...entry, status, outcome });
    results.push({ id: entry.id, status, note: outcome.note });
  }
  return results;
}

function main() {
  const asOf = process.argv[2] || todayStr();
  console.log(`⚖️  measure — ledger entries due as of ${asOf}`);
  const results = runMeasure(asOf);
  if (!results.length) {
    console.log('   nothing due yet.');
    return;
  }
  for (const r of results) console.log(`   [${r.status}] ${r.id} — ${r.note}`);
}

if (isMain(import.meta.url)) main();
