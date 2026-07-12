#!/usr/bin/env bash
# Scheduled-run wrapper for the growth cycle (growth-impl.md §12 P2).
# Handles the minimal PATH that cron/launchd give, logs output, and (optionally)
# commits the snapshot to the local git archive. NEVER pushes.
#
# Schedule this (not `npm run growth:cycle` directly) from cron/launchd — see
# docs/growth-schedule.md.
#
# Optional env:
#   GROWTH_AUTOCOMMIT=1   commit data/ (snapshot + loop-log) locally after the run
#   SLACK_WEBHOOK_URL=...  send the digest ping to Slack (else macOS notification)

set -euo pipefail

# repo root = two levels up from this script
cd "$(cd "$(dirname "$0")/../.." && pwd)"

# cron/launchd start with a bare PATH; make node/npm findable on Intel + Apple Silicon
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

mkdir -p tmp
echo "=== growth cycle $(date '+%Y-%m-%d %H:%M:%S') ===" >> tmp/growth-cycle.log
npm run growth:cycle >> tmp/growth-cycle.log 2>&1

# Optional: keep the git archive current (local commit only — never push).
if [ "${GROWTH_AUTOCOMMIT:-0}" = "1" ]; then
  git add data/snapshots data/loop-log.md data/ledger.json 2>/dev/null || true
  git diff --cached --quiet || git commit -m "growth: snapshot $(date +%F)" >> tmp/growth-cycle.log 2>&1 || true
fi
