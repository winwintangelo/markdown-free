# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Markdown Free is a web-based Markdown viewer and converter. Users upload/paste Markdown files, preview them, then export to PDF, HTML, or TXT. The core principle is "upload-first, not editor-first" with a target experience of under 30 seconds to complete a task.

**Live site:** https://www.markdown.free

## Architecture

### Key Architectural Decisions

1. **Client-side processing for HTML/TXT:** These exports happen entirely in the browser for instant downloads
2. **Server-side PDF generation:** Uses Puppeteer on Vercel serverless functions (1024MB memory, 30s timeout)
3. **XSS prevention:** All Markdown goes through rehype-sanitize using GitHub's schema
4. **i18n:** Uses Next.js dynamic routes with `[locale]` parameter; English is default (no prefix)

### PDF Generation Notes
- Cold starts may take 5-10s on first request
- 5MB max file size enforced client-side
- Configured in `vercel.json` with 1024MB memory and 30s timeout
- Uses `@sparticuz/chromium-min` for smaller Lambda size

## Environment Variables

See `env.example` for required variables:
- `NEXT_PUBLIC_UMAMI_HOST` / `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: Analytics
- `UMAMI_API_KEY` / `UMAMI_WEBSITE_ID` / `UMAMI_API_HOST`: Report generation

## Testing

- **Local tests:** `e2e/app.spec.ts`, `e2e/i18n.spec.ts` - run against localhost:3000
- **Production tests:** `e2e/production.spec.ts` - run against live site with `--config=playwright.production.config.ts`
- Test outputs go to `tmp/` directory
