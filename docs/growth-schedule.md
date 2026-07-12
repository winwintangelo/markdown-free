# Growth loop — scheduling (P2)

Make the weekly digest land on its own, with a ping — so you never have to remember to
pull data or eyeball regressions. This automates only the **deterministic, read-only**
half of the loop; the judgment half (ranked proposals, gated fixes) stays a
human-initiated `/growth-loop`, per the North Star (humans own strategic direction).

## What the scheduled job does
`scripts/growth/run-cycle.sh` → `npm run growth:cycle`:
1. **snapshot** every channel → committed `data/snapshots/<date>.json`
2. **measure** any experiments that have come due (verdicts → `data/ledger.json`)
3. **analyze** deltas + threshold-gated regressions + opportunities
4. **digest** prepended to `data/loop-log.md`
5. **notify** you (Slack or macOS) — "digest ready, N regressions, M measured"

No LLM, no API cost. When the ping says something interesting happened, you open
`/growth-loop` to get the ranked proposals and (with you present) the gated 🟢 fixes.

**Cadence:** weekly is the recommended default (SEO moves in weeks). The weekly run is a
*regression watch*; the real re-prioritization is every ~4 weeks when experiments come due.

---

## Option 1 — macOS `launchd` (recommended for a local, always-your-machine setup)
Creds stay in your local `.env`; nothing leaves your machine. Runs when the laptop is on
(launchd runs a missed job at next wake).

1. Make the wrapper executable (once):
   ```bash
   chmod +x scripts/growth/run-cycle.sh
   ```
2. Create `~/Library/LaunchAgents/free.markdown.growth-loop.plist` (edit the two paths):
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
     <key>Label</key><string>free.markdown.growth-loop</string>
     <key>ProgramArguments</key>
     <array>
       <string>/bin/bash</string>
       <string>/Users/YOU/Documents/myworks/projects/markdown-free/scripts/growth/run-cycle.sh</string>
     </array>
     <key>WorkingDirectory</key>
     <string>/Users/YOU/Documents/myworks/projects/markdown-free</string>
     <key>EnvironmentVariables</key>
     <dict>
       <key>GROWTH_AUTOCOMMIT</key><string>1</string>
       <!-- <key>SLACK_WEBHOOK_URL</key><string>https://hooks.slack.com/services/...</string> -->
     </dict>
     <!-- Monday 09:00 weekly -->
     <key>StartCalendarInterval</key>
     <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
     <key>StandardOutPath</key><string>/tmp/growth-loop.out</string>
     <key>StandardErrorPath</key><string>/tmp/growth-loop.err</string>
   </dict>
   </plist>
   ```
3. Load it:
   ```bash
   launchctl load ~/Library/LaunchAgents/free.markdown.growth-loop.plist
   launchctl start free.markdown.growth-loop     # test-fire once now
   ```
   Unload with `launchctl unload …` if you want to stop it.

## Option 2 — plain `cron`
```bash
crontab -e
# Monday 09:00 — run the wrapper (absolute path)
0 9 * * 1 GROWTH_AUTOCOMMIT=1 /Users/YOU/Documents/myworks/projects/markdown-free/scripts/growth/run-cycle.sh
```

## Option 3 — GitHub Actions (cloud; runs with the laptop off)
Use `.github/workflows/growth-loop.yml` (included, **manual-dispatch by default**). Trade-off:
a cloud run can't write to your local git archive — it **uploads the snapshot + digest as a
workflow artifact** and pings Slack instead. To enable:
1. Repo → **Settings → Secrets and variables → Actions** → add:
   `BING_API_KEY`, `GSC_SITE_URL`, `GSC_SA_KEY` (paste the whole service-account JSON),
   `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, (`VERCEL_TEAM_ID`), `SLACK_WEBHOOK_URL`.
2. Uncomment the `schedule:` block in the workflow to run weekly (it's manual-only until then).
3. Run it once via **Actions → Growth loop → Run workflow** to confirm.

---

## Notifications
- **Slack:** set `SLACK_WEBHOOK_URL` (create an Incoming Webhook in Slack). The digest summary is posted there.
- **macOS:** with no Slack URL, the cycle uses Notification Center automatically.
- Either way the full digest is always in `data/loop-log.md` (newest on top).

## Reminder — what stays human (never scheduled)
- Ranked **proposals** + **moat filtering** (run `/growth-loop`).
- **Implementing** 🟢 fixes (Level B, to a branch, with you present).
- **Deploy / merge / push** — always you (deny-listed for the agent).
- Setting the quarter's **Strategic Goals** (P4).
