# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Markdown Free is a web-based Markdown viewer and converter. Users upload/paste Markdown files, preview them, then export to PDF, HTML, or TXT. The core principle is "upload-first, not editor-first" with a target experience of under 30 seconds to complete a task.

**Live site:** https://www.markdown.free

## Architecture

### Key Architectural Decisions

1. **Client-side processing for HTML/TXT/PNG/JPG/EPUB/XLSX:** These exports happen entirely in the browser. Mermaid fences are pre-rendered client-side into embedded images (`src/lib/diagrams.ts`) before ANY format is produced; math renders with KaTeX inside the shared pipeline (`src/lib/markdown.ts`), with `\(…\)`/`\[…\]` normalized to `$…$`/`$$…$$` first
2. **Server-side PDF generation:** Uses Puppeteer on Vercel serverless functions (1024MB memory, 30s timeout); KaTeX CSS + fonts are inlined from node_modules (`src/lib/katex-server.ts`). DOCX is also server-side (html-to-docx); formulas reach it as PNGs rendered in the browser (`src/lib/math-images.ts`), which the route sizes, centres and captions with their LaTeX (`src/lib/docx-math.ts`) until editable OMML lands (plan Phase 0b)
3. **XSS prevention:** All Markdown goes through rehype-sanitize using GitHub's schema
4. **i18n:** Uses Next.js dynamic routes with `[locale]` parameter; English is default (no prefix)

### PDF Generation Notes
- Cold starts may take 5-10s on first request
- 1MB max file size enforced client-side and server-side (all convert routes)
- Configured in `vercel.json` with 1024MB memory and 30s timeout
- Uses `@sparticuz/chromium-min` for smaller Lambda size

## Environment Variables

See `env.example` for required variables:
- `NEXT_PUBLIC_UMAMI_HOST` / `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: Analytics
- `UMAMI_API_KEY` / `UMAMI_WEBSITE_ID` / `UMAMI_API_HOST`: Report generation
- `SUPABASE_URL` / `SUPABASE_SECRET_KEY`: the feature vote board and its "notify me" signups (server-only; schema in `supabase/migrations/`)

## Testing

- **Local tests:** `e2e/app.spec.ts`, `e2e/i18n.spec.ts` - run against localhost:3000
- **Production tests:** `e2e/production.spec.ts` - run against live site with `--config=playwright.production.config.ts`
- **Live store tests:** `npm run test:notify-store` writes to the real Supabase project and cleans up; it skips unless `NOTIFY_LIVE=1`, and needs a server started WITHOUT `E2E_RELAXED_RATE_LIMITS` (see `docs/supabase-setup.md`)
- **Supabase schema:** `npm run db:check` reports what the project in `.env` has (read-only); `npm run db:migrate` applies `supabase/migrations/` (needs `SUPABASE_ACCESS_TOKEN` or `SUPABASE_DB_URL`)
- **Feature teaser by hand:** open `http://localhost:3000/?probe=teaser` and convert once; it works on localhost only. A server started with `E2E_RELAXED_RATE_LIMITS=1` accepts votes and signups but stores nothing
- Test outputs go to `tmp/` directory

## Communication

Follow `.claude/skills/communication-style/SKILL.md` in every reply, commit message, code comment, and document. Summary of the rules: active voice, short sentences, precise details, no filler, no concluding summary unless asked.

## Editing conventions

- **Change files with the Edit/Write tools, not with shell commands.** Do not use `sed -i`, `perl -pi`, `python` heredocs or similar to rewrite source: the edit then shows up as a reviewable diff instead of a script, and scripted rewrites have silently damaged files in this repo before — a `String.replace` whose replacement contained `` $` `` pasted a copy of the file header into CLAUDE.md and truncated a line in `llms.txt`, and an order-based regex once wrote the Japanese privacy sentence into the Traditional Chinese block.
- Bash stays the right tool for everything else: reading and searching (`cat`, `grep`, `sed -n`), builds, tests, git, and one-off probe scripts under `tmp/`.
- Exception: a genuinely mechanical change across many files (for example, adding one prop to 60 call sites). Say so first, then verify with `git diff` and a build before moving on.
- Scratch files, logs and probe scripts belong in `tmp/` (gitignored), not in a system temp directory.
