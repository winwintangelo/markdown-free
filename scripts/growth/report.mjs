// Per-cycle report generator — writes data/reports/<date>.{md,html} each cycle with
// numbers · trends · discoveries · issues · proposed actions. The .md is the durable
// committed record; the .html is a self-contained styled view (git-ignored, regenerable).
//
//   node scripts/growth/report.mjs   (or: npm run growth:report — from the latest snapshot)
//
// cycle.mjs calls generateReport() with its already-computed data so nothing re-runs.

import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR, SnapshotStore, ensureDir, writeJsonAtomic, readJson, isMain } from './lib.mjs';

// ---- metric helpers ----
function searchTotals(ch) {
  const rows = ch?.queries || [];
  const clicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
  const impressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
  let w = 0, wi = 0;
  for (const r of rows) if (r.position != null && r.impressions) { w += r.position * r.impressions; wi += r.impressions; }
  return { clicks, impressions, ctr: impressions ? +(clicks / impressions * 100).toFixed(2) : 0, pos: wi ? +(w / wi).toFixed(1) : null };
}
const conversions = (snap) => snap?.channels?.events?.totals?.conversions ?? null;
const aiSessions = (snap) => (snap?.channels?.referral?.groups || []).find((g) => g.group === 'ai')?.sessions ?? null;

function delta(cur, prev) {
  if (cur == null || prev == null) return null;
  const d = +(cur - prev).toFixed(2);
  const pct = prev ? Math.round((d / prev) * 100) : null;
  return { d, pct, up: d > 0, flat: d === 0 };
}
const arrow = (dl) => (dl == null ? '' : dl.flat ? '→' : dl.up ? '▲' : '▼');
const dstr = (dl) => (dl == null ? '—' : `${arrow(dl)} ${dl.d >= 0 ? '+' : ''}${dl.d}${dl.pct != null ? ` (${dl.pct >= 0 ? '+' : ''}${dl.pct}%)` : ''}`);

// ---- assemble the report model from cycle data ----
export function buildModel({ snapshot, measured = [], analysis = {}, discovery = {}, proposal = {}, prev = null, market = {} }) {
  const searchChannels = ['bing', 'gsc', 'baidu'].filter((c) => snapshot.channels[c]);
  const numbers = searchChannels.map((c) => {
    const cur = searchTotals(snapshot.channels[c]);
    const p = prev?.channels?.[c] ? searchTotals(prev.channels[c]) : null;
    return { channel: c, ...cur, dClicks: p ? delta(cur.clicks, p.clicks) : null, dImpr: p ? delta(cur.impressions, p.impressions) : null };
  });
  const ev = snapshot.channels.events;
  const trends = [
    ...numbers.filter((n) => n.dClicks).map((n) => ({ label: `${n.channel} clicks`, dl: n.dClicks })),
    ...numbers.filter((n) => n.dImpr).map((n) => ({ label: `${n.channel} impressions`, dl: n.dImpr })),
    prev ? { label: 'conversions', dl: delta(conversions(snapshot), conversions(prev)) } : null,
    prev ? { label: 'AI referrals', dl: delta(aiSessions(snapshot), aiSessions(prev)) } : null,
  ].filter((t) => t && t.dl);

  const grad = discovery.graduatedSignals || [];
  const stages = {};
  for (const s of grad) stages[s.stage] = (stages[s.stage] || 0) + 1;

  const issues = [];
  (analysis.regressions || []).forEach((r) => issues.push(`Regression: ${r.type} on \`${r.key}\` [${r.channel}] ${r.from}→${r.to}`));
  Object.entries(snapshot.errors || {}).forEach(([c, e]) => issues.push(`Channel skipped: ${c} — ${e.split('.')[0]}`));
  const themes = (readJson(path.join(DATA_DIR(), 'themes.json'), { themes: [] }).themes || []).slice(0, 8);

  return {
    date: snapshot.date, runMs: snapshot.meta?.health?.runMs,
    channelsOk: Object.keys(snapshot.channels), channelsSkipped: Object.keys(snapshot.errors || {}),
    context: snapshot.context || {}, numbers, ev, trends, prevDate: prev?.date,
    measured, discovery: { graduated: discovery.graduated ?? grad.length, stages, mined: discovery.mined },
    slate: proposal.portfolio?.slate || [], totalCandidates: proposal.portfolio?.totalCandidates || 0,
    suppressed: proposal.portfolio?.suppressed || [], issues,
    gaps: (market.gaps || []).slice(0, 12),
    themes,
  };
}

// ---- markdown ----
export function toMarkdown(m) {
  const L = [];
  L.push(`# Growth report — ${m.date}`);
  L.push('');
  L.push(`_${m.channelsOk.length} channels${m.channelsSkipped.length ? ` (skipped: ${m.channelsSkipped.join(', ')})` : ''} · ${m.runMs ?? '?'}ms${m.context.season ? ` · season: ${m.context.season}` : ''}${m.context.algoUpdates?.length ? ` · ⚠ ${m.context.algoUpdates.length} algo update(s)` : ''}_`);
  L.push('');
  L.push('## 📊 Numbers');
  L.push('| Channel | Clicks | Impressions | CTR | Avg pos |');
  L.push('|---|--:|--:|--:|--:|');
  m.numbers.forEach((n) => L.push(`| ${n.channel} | ${n.clicks} | ${n.impressions} | ${n.ctr}% | ${n.pos ?? '—'} |`));
  if (m.ev) L.push(`\n**Conversions:** ${m.ev.totals.conversions} (cjk ${m.ev.byScript.find((s) => s.key === 'cjk')?.count ?? 0} / latin ${m.ev.byScript.find((s) => s.key === 'latin')?.count ?? 0}) · funnel ${m.ev.funnel.upload_start}→${m.ev.funnel.convert_success} (abandon ${Math.round((m.ev.funnel.abandonment ?? 0) * 100)}%)`);
  L.push('');
  L.push(`## 📈 Trends${m.prevDate ? ` (vs ${m.prevDate})` : ''}`);
  if (!m.trends.length) L.push('_baseline — no prior snapshot to compare_');
  else m.trends.forEach((t) => L.push(`- ${t.label}: ${dstr(t.dl)}`));
  L.push('');
  L.push('## 🔭 Discoveries');
  L.push(`- **${m.discovery.graduated} signals graduated**${Object.keys(m.discovery.stages).length ? ` (${Object.entries(m.discovery.stages).map(([k, v]) => `${k} ${v}`).join(' · ')})` : ''}`);
  if (m.measured.length) m.measured.forEach((x) => L.push(`- Experiment measured: [${x.status}] ${x.id} — ${x.note}`));
  L.push('');
  L.push('## 🕳️ Demand gaps (new-page candidates)');
  if (!m.gaps.length) L.push('_none this scan_');
  else m.gaps.slice(0, 10).forEach((g) => L.push(`- [${g.topic}] \`${g.query}\` — no ranking presence (${g.engines.join('+')})`));
  L.push('');
  L.push('## 🧩 Product opportunities (from demand)');
  if (!m.themes.length) L.push('_no painpoint themes yet — run `npm run growth:social` + `growth:consolidate`_');
  else m.themes.forEach((t) => {
    L.push(`- **[${t.triage}]** ${t.title} — ${t.count} mentions across ${t.sources.join('+')} · score ${t.score}`);
    if (t.representative?.[0]) L.push(`   ↳ e.g. "${t.representative[0].title}" (${t.representative[0].source})`);
  });
  L.push('');
  L.push('## ⚠️ Issues');
  if (!m.issues.length) L.push('_none_');
  else m.issues.forEach((i) => L.push(`- ${i}`));
  L.push('');
  L.push('## 💡 Proposed actions');
  L.push(`_${m.totalCandidates} candidates · top ${m.slate.length} (portfolio-balanced)_`);
  m.slate.forEach((c, i) => {
    L.push(`${i + 1}. ${c.gate === 'green' ? '🟢' : '🟡'} **[${c.bucket}]** ${c.action} — \`${c.key}\``);
    L.push(`   _${c.why || ''}${c.score != null ? ` · score ${c.score}` : ''}${c.goalId ? ` · goal:${c.goalId}` : ''}_`);
  });
  if (m.suppressed.length) {
    const exp = m.suppressed.filter((s) => s.suppressed === 'experiment');
    const dec = m.suppressed.filter((s) => s.suppressed === 'declined');
    L.push('');
    L.push(`> 🔒 **${m.suppressed.length} suppressed** — ${[exp.length && `${exp.length} under active experiments`, dec.length && `${dec.length} human-declined`].filter(Boolean).join(' · ')} (held back to protect measurement / respect prior judgment):`);
    exp.forEach((s) => L.push(`> - 🔒 \`${s.key}\` — exp \`${s.expId}\` (${s.role}) → measures ${s.measureOn}`));
    dec.forEach((s) => L.push(`> - 🚫 \`${s.key}\` — declined: ${(s.reason || '').slice(0, 110)}${(s.reason || '').length > 110 ? '…' : ''}`));
  }
  L.push('');
  L.push('---');
  L.push('_Generated by the growth loop. Run `/growth-loop` to refine + implement 🟢 items._');
  return L.join('\n');
}

// ---- html (self-contained, theme-aware) ----
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function toHtml(m) {
  const trendRows = m.trends.length
    ? m.trends.map((t) => `<li><span>${esc(t.label)}</span> <b class="${t.dl.up ? 'up' : t.dl.flat ? '' : 'down'}">${esc(dstr(t.dl))}</b></li>`).join('')
    : '<li><em>baseline — no prior snapshot</em></li>';
  const numRows = m.numbers.map((n) => `<tr><td>${esc(n.channel)}</td><td>${n.clicks}</td><td>${n.impressions}</td><td>${n.ctr}%</td><td>${n.pos ?? '—'}</td></tr>`).join('');
  const issueRows = m.issues.length ? m.issues.map((i) => `<li>${esc(i)}</li>`).join('') : '<li class="ok">none</li>';
  const gapRows = m.gaps.length ? m.gaps.map((g) => `<li><span class="bucket">${esc(g.topic)}</span> <code>${esc(g.query)}</code> <span class="meta">no ranking presence · ${esc(g.engines.join('+'))}</span></li>`).join('') : '<li class="ok">none this scan</li>';
  const themeRows = m.themes.length ? m.themes.map((t) => `<li><span class="bucket">${esc(t.triage)}</span> ${esc(t.title)} <span class="meta">${t.count} mentions · ${esc(t.sources.join('+'))} · score ${t.score}</span>${t.representative?.[0] ? `<div class="why">e.g. "${esc(t.representative[0].title)}" (${esc(t.representative[0].source)})</div>` : ''}</li>`).join('') : '<li class="ok">no painpoint themes yet</li>';
  const slateRows = m.slate.map((c, i) => `<li><span class="gate ${c.gate}">${c.gate === 'green' ? '🟢' : '🟡'}</span> <span class="bucket">${esc(c.bucket || '')}</span> ${esc(c.action)} <code>${esc(c.key)}</code><div class="why">${esc(c.why || '')}${c.score != null ? ` · score ${c.score}` : ''}${c.goalId ? ` · goal:${esc(c.goalId)}` : ''}</div></li>`).join('');
  const supRows = m.suppressed.map((s) => s.suppressed === 'experiment'
    ? `<li><span class="gate">🔒</span> <span class="bucket">locked</span> <code>${esc(s.key)}</code><div class="why">under experiment <code>${esc(s.expId)}</code> (${esc(s.role)}) · measures ${esc(s.measureOn)}</div></li>`
    : `<li><span class="gate">🚫</span> <span class="bucket">declined</span> <code>${esc(s.key)}</code><div class="why">${esc((s.reason || '').slice(0, 140))}</div></li>`).join('');
  const supCard = m.suppressed.length ? `<div class="card"><h2>🔒 Suppressed <span class="meta">${m.suppressed.length} held back — protect measurement / prior judgment</span></h2><ul>${supRows}</ul></div>` : '';
  const conv = m.ev ? `<p class="conv"><b>${m.ev.totals.conversions}</b> conversions · cjk ${m.ev.byScript.find((s) => s.key === 'cjk')?.count ?? 0} / latin ${m.ev.byScript.find((s) => s.key === 'latin')?.count ?? 0} · funnel ${m.ev.funnel.upload_start}→${m.ev.funnel.convert_success} (abandon ${Math.round((m.ev.funnel.abandonment ?? 0) * 100)}%)</p>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Growth report ${esc(m.date)}</title>
<style>
:root{--bg:#f6f8fa;--card:#fff;--ink:#1a2330;--soft:#5a6675;--rule:#e3e8ee;--accent:#0f766e;--up:#2f8a54;--down:#c0392b;--gate-g:#2f8a54;--gate-a:#b7791f}
@media(prefers-color-scheme:dark){:root{--bg:#0e141b;--card:#161d26;--ink:#e7ecf2;--soft:#95a2b1;--rule:#243040;--accent:#45c9bd;--up:#58bf7e;--down:#e57373;--gate-g:#58bf7e;--gate-a:#dda641}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:1.5rem}
.wrap{max-width:52rem;margin:0 auto}h1{font-size:1.5rem;margin:0 0 .2rem}.meta{color:var(--soft);font-size:.85rem;margin-bottom:1.4rem}
.card{background:var(--card);border:1px solid var(--rule);border-radius:12px;padding:1rem 1.2rem;margin-bottom:1rem}
h2{font-size:1rem;margin:.1rem 0 .7rem}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
th,td{text-align:right;padding:.35rem .5rem;border-bottom:1px solid var(--rule)}th:first-child,td:first-child{text-align:left}th{color:var(--soft);font-weight:600;font-size:.8rem}
ul{list-style:none;margin:0;padding:0}li{padding:.35rem 0;border-bottom:1px solid var(--rule)}li:last-child{border:0}
.trend li{display:flex;justify-content:space-between}.up{color:var(--up)}.down{color:var(--down)}
code{background:var(--bg);padding:.05em .35em;border-radius:5px;font-size:.85em;word-break:break-all}
.gate{font-size:.9em}.bucket{font-size:.7rem;color:var(--soft);text-transform:uppercase;letter-spacing:.04em;margin-right:.3rem}
.why{color:var(--soft);font-size:.82rem;margin:.15rem 0 0 1.5rem}.conv{margin:.6rem 0 0}.ok{color:var(--soft)}
.accent{color:var(--accent)}
</style></head><body><div class="wrap">
<h1>Growth report <span class="accent">${esc(m.date)}</span></h1>
<div class="meta">${m.channelsOk.length} channels${m.channelsSkipped.length ? ` (skipped: ${esc(m.channelsSkipped.join(', '))})` : ''} · ${m.runMs ?? '?'}ms${m.context.season ? ` · season: ${esc(m.context.season)}` : ''}</div>
<div class="card"><h2>📊 Numbers</h2><table><thead><tr><th>Channel</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Avg pos</th></tr></thead><tbody>${numRows}</tbody></table>${conv}</div>
<div class="card"><h2>📈 Trends${m.prevDate ? ` <span class="meta">vs ${esc(m.prevDate)}</span>` : ''}</h2><ul class="trend">${trendRows}</ul></div>
<div class="card"><h2>🔭 Discoveries</h2><p><b>${m.discovery.graduated}</b> signals graduated${Object.keys(m.discovery.stages).length ? ` (${Object.entries(m.discovery.stages).map(([k, v]) => `${esc(k)} ${v}`).join(' · ')})` : ''}</p></div>
<div class="card"><h2>🕳️ Demand gaps <span class="meta">new-page candidates</span></h2><ul>${gapRows}</ul></div>
<div class="card"><h2>🧩 Product opportunities <span class="meta">from demand</span></h2><ul>${themeRows}</ul></div>
<div class="card"><h2>⚠️ Issues</h2><ul>${issueRows}</ul></div>
<div class="card"><h2>💡 Proposed actions <span class="meta">${m.totalCandidates} candidates · top ${m.slate.length}</span></h2><ul>${slateRows}</ul></div>
${supCard}
<div class="meta">Generated by the growth loop. Run <code>/growth-loop</code> to refine + implement 🟢 items.</div>
</div></body></html>`;
}

export function generateReport(data) {
  const model = buildModel(data);
  const md = toMarkdown(model);
  const html = toHtml(model);
  const dir = path.join(DATA_DIR(), 'reports');
  ensureDir(dir);
  const mdPath = path.join(dir, `${model.date}.md`);
  const htmlPath = path.join(dir, `${model.date}.html`);
  fs.writeFileSync(mdPath, md + '\n');
  fs.writeFileSync(htmlPath, html + '\n');
  return { mdPath, htmlPath };
}

// ---- CLI: regenerate from the latest committed snapshot (read-only) ----
async function main() {
  const [snapshot, prev] = SnapshotStore.recent(2);
  if (!snapshot) { console.error('no snapshot — run `npm run growth:snapshot` first'); process.exit(1); }
  const { runAnalyze } = await import('./analyze.mjs');
  const { runPropose } = await import('./propose.mjs');
  const { SignalWarehouse } = await import('./signals.mjs');
  const analysis = runAnalyze();
  const proposal = runPropose();
  const grad = SignalWarehouse.graduated();
  const discovery = { graduated: grad.length, graduatedSignals: grad };
  const market = readJson(path.join(DATA_DIR(), 'market.json'), { gaps: [] });
  const { mdPath, htmlPath } = generateReport({ snapshot, prev, analysis, proposal, discovery, measured: [], market });
  console.log(`📝 report written:\n   ${mdPath}\n   ${htmlPath}`);
}

if (isMain(import.meta.url)) main();
