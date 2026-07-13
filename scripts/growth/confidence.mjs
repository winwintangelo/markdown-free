// Confidence Engine (growth-impl.md §8.1) — makes graduation explicit, not hand-waved.
//
// A signal accrues evidence from multiple independent sources; we blend that into a
// DIMENSIONAL score (so tuning/debugging is possible), nudged by the KnowledgeBase
// prior for the topic. Only signals above THRESHOLD graduate to opportunities.
//
// Design (from the reviews):
//   • multi-source corroboration > one loud channel   → `quantity`
//   • our own funnel/conversion data weighted highest  → `ownFunnel`
//   • recent evidence beats stale                       → `recency`

import { clamp01, daysBetween, todayStr } from './lib.mjs';

export const THRESHOLD = 0.6;

// Weights sum to 1.0. ownFunnel + quantity dominate by design.
const W = { quantity: 0.30, quality: 0.20, recency: 0.15, ownFunnel: 0.20, prior: 0.15 };

export function scoreSignal(signal, prior = 0.5) {
  const sources = signal.sources || [];
  const channels = new Set(sources.map((s) => s.channel));

  // more independent channels corroborating → higher (saturates at 3)
  const quantity = clamp01(channels.size / 3);
  // avg source weight (own-funnel sources carry high weight already)
  const quality = sources.length ? clamp01(sources.reduce((a, s) => a + (s.weight ?? 0.5), 0) / sources.length) : 0;
  // decay over ~21 days
  const ageDays = signal.lastSeen ? Math.abs(daysBetween(signal.lastSeen, todayStr())) : 0;
  const recency = clamp01(1 - ageDays / 21);
  // does our own conversion/referral data corroborate?
  const ownFunnel = sources.some((s) => s.channel === 'events') ? 1
    : (sources.some((s) => s.channel === 'referral') ? 0.5 : 0);

  const score = clamp01(
    W.quantity * quantity + W.quality * quality + W.recency * recency +
    W.ownFunnel * ownFunnel + W.prior * clamp01(prior)
  );

  return {
    score: +score.toFixed(3),
    quality: +quality.toFixed(2),
    quantity: +quantity.toFixed(2),
    recency: +recency.toFixed(2),
    ownFunnel: +ownFunnel.toFixed(2),
    prior: +Number(prior).toFixed(2),
  };
}

export const graduates = (conf) => conf.score >= THRESHOLD;
