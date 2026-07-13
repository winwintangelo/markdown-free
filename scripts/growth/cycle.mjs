// Unattended growth cycle (growth-impl.md §10.4, §12 P2) — the scheduled entrypoint.
//
// Runs the DETERMINISTIC read-only stages (snapshot → measure → analyze), writes a
// digest to data/loop-log.md, and fires a notification. NO LLM / API cost — the
// judgment stages (propose/implement) stay a human-initiated `/growth-loop`, per the
// North Star (humans own strategic direction). The ping says "a fresh digest is ready
// — run /growth-loop to review".
//
//   node scripts/growth/cycle.mjs      (or: npm run growth:cycle)
//
// Notification (best-effort, never fails the cycle):
//   • SLACK_WEBHOOK_URL set → posts to Slack
//   • else on macOS → Notification Center via osascript
//   • always → prints the digest + a summary banner

import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR, todayStr, isMain, SnapshotStore } from './lib.mjs';
import { runSnapshot } from './snapshot.mjs';
import { runMeasure } from './measure.mjs';
import { runAnalyze } from './analyze.mjs';
import { runDiscover } from './discover.mjs';
import { runPropose, proposalMd } from './propose.mjs';
import { generateReport } from './report.mjs';

function buildDigest(snapshot, measured, analysis, discovery, proposal) {
  const h = snapshot.meta?.health || {};
  const ok = Object.keys(snapshot.channels).join(', ') || 'none';
  const skipped = Object.keys(snapshot.errors).join(', ');
  const lines = [];
  lines.push(`## ${snapshot.date} — automated cycle`);
  lines.push('');
  lines.push(`**Channels:** ${ok}${skipped ? ` · _skipped: ${skipped}_` : ''} · ${h.runMs ?? '?'}ms`);
  if (snapshot.context?.algoUpdates?.length) {
    lines.push(`**Context:** ⚠ ${snapshot.context.algoUpdates.map((e) => e.name).join('; ')}${snapshot.context.season ? ` · season: ${snapshot.context.season}` : ''}`);
  }
  lines.push('');

  // Measured experiments
  if (measured.length) {
    lines.push(`**Measured (${measured.length}):**`);
    measured.forEach((m) => lines.push(`- [${m.status}] ${m.id} — ${m.note}`));
  } else {
    lines.push('**Measured:** none due.');
  }
  lines.push('');

  if (!analysis.ok) {
    lines.push(`_${analysis.reason}_`);
    return lines.join('\n');
  }

  // Regressions (the thing to actually watch)
  const regs = analysis.regressions || [];
  if (regs.length) {
    lines.push(`**⚠ Regressions (${regs.length}):**`);
    regs.slice(0, 8).forEach((f) => lines.push(`- ${f.type} [${f.channel}] ${f.key} — ${f.from} → ${f.to}`));
  } else {
    lines.push(`**Regressions:** none${analysis.baselineCycle ? ' (baseline cycle — need a 2nd snapshot for deltas)' : ''}.`);
  }
  lines.push('');

  // Signal Warehouse + Opportunity Engine (P3)
  if (discovery?.ok) {
    lines.push(`**Signals:** ${discovery.mined} mined · ${discovery.total} in warehouse · **${discovery.graduated} graduated** (confidence ≥ threshold)`);
    lines.push('');
  }
  lines.push(proposalMd(proposal));
  lines.push('');
  lines.push('**Next:** review the portfolio above; run `/growth-loop` to refine with judgment + implement 🟢 items.');
  return lines.join('\n');
}

// Insert newest entry just under the log's intro (`---`), keeping newest-on-top.
function prependToLog(md) {
  const file = path.join(DATA_DIR(), 'loop-log.md');
  const entry = `\n${md}\n`;
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `# Growth loop — running log\n\n---\n${entry}`);
    return;
  }
  const cur = fs.readFileSync(file, 'utf-8');
  const marker = '\n---\n';
  const i = cur.indexOf(marker);
  if (i < 0) { fs.appendFileSync(file, entry); return; }
  const at = i + marker.length;
  fs.writeFileSync(file, cur.slice(0, at) + entry + cur.slice(at));
}

async function notify(title, body) {
  try {
    const hook = process.env.SLACK_WEBHOOK_URL;
    if (hook) {
      await fetch(hook, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `*${title}*\n${body}` }),
      });
      return;
    }
    if (process.platform === 'darwin') {
      const { execFileSync } = await import('node:child_process');
      execFileSync('osascript', ['-e', `display notification ${JSON.stringify(body)} with title ${JSON.stringify(title)}`]);
    }
  } catch { /* notification is best-effort — never fail the cycle on it */ }
}

export async function runCycle() {
  const { snapshot } = await runSnapshot();
  const measured = runMeasure();     // measures due experiments (and learns on resolve)
  const discovery = runDiscover();   // mine snapshot → warehouse → age → graduate
  const analysis = runAnalyze();
  const proposal = runPropose();     // graduated signals → ranked portfolio
  const digest = buildDigest(snapshot, measured, analysis, discovery, proposal);
  prependToLog(digest);

  // Per-cycle report: data/reports/<date>.{md,html} (numbers · trends · discoveries · issues · actions).
  const prev = SnapshotStore.recent(2)[1] || null;
  const report = generateReport({ snapshot, measured, analysis, discovery, proposal, prev });

  const regs = analysis.ok ? (analysis.regressions?.length || 0) : 0;
  const grad = discovery.ok ? discovery.graduated : 0;
  const nProps = proposal.portfolio.slate.length;
  const reviewNeeded = regs > 0 || measured.length > 0 || nProps > 0;
  const summary = `${Object.keys(snapshot.channels).length} channels · ${grad} graduated · ${nProps} proposals · ${regs} regressions · ${measured.length} measured`;
  return { snapshot, digest, summary, reviewNeeded, report };
}

async function main() {
  console.log(`🔁 growth cycle — ${todayStr()}`);
  const { digest, summary, reviewNeeded, snapshot, report } = await runCycle();
  console.log('\n' + digest + '\n');
  const title = `Growth digest ${snapshot.date}${reviewNeeded ? ' — review needed' : ''}`;
  await notify(title, summary);
  console.log(`📌 ${title} · ${summary}`);
  console.log(`   digest → data/loop-log.md · report → ${report.mdPath} (+ .html)`);
}

if (isMain(import.meta.url)) main();
