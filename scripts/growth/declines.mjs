// Decline memory (growth-impl.md — "learn from human judgment").
// When a human/SME reviews a proposal and decides NOT to pursue that lever, we record it
// here so the Opportunity Engine stops re-surfacing it every cycle. This closes the loop
// on judgment the deterministic scorer can't make (e.g. "this low CTR is a *ranking*
// problem, not a snippet problem — a title tweak won't fix it").
//
// A decline entry: { key, reason, ref?, decided, kinds?, expires? }
//   • key     — page URL or query the decision is about (normalized via pathOf)
//   • kinds   — optional: only suppress these proposal kinds (e.g. ['low_ctr']); a
//               genuinely different future lever for the same page can still surface.
//               Omit to suppress ALL proposals for the key.
//   • expires — optional YYYY-MM-DD; the decline lapses after this (so a stale call
//               re-enters the funnel for a fresh look). Omit for an indefinite decline.
//
// This is the ONLY module that reads data/declines.json.

import path from 'node:path';
import { DATA_DIR, readJson, todayStr, pathOf } from './lib.mjs';

const FILE = () => path.join(DATA_DIR(), 'declines.json');

export const Declines = {
  all() { return readJson(FILE(), { version: 1, declines: [] }).declines || []; },

  // Map<normalizedKey, declineRecord> for declines still in effect as of `asOf`.
  active(asOf) {
    const today = asOf || todayStr();
    const map = new Map();
    for (const d of this.all()) {
      if (d.expires && d.expires < today) continue;
      const k = pathOf(d.key);
      if (!map.has(k)) map.set(k, d);
    }
    return map;
  },

  // Does an active decline suppress this candidate? (respects `kinds` scoping)
  suppresses(candidate, asOf) {
    const d = this.active(asOf).get(pathOf(candidate.key));
    if (!d) return null;
    if (d.kinds && !d.kinds.includes(candidate.kind)) return null;
    return d;
  },
};
