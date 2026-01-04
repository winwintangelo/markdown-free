# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Markdown Free is a web-based Markdown viewer and converter. Users upload/paste Markdown files, preview them, then export to PDF, HTML, or TXT. The core principle is "upload-first, not editor-first" with a target experience of under 30 seconds to complete a task.

**Live site:** https://www.markdown.free

## Common Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm run lint             # ESLint

# Testing (Playwright)
npm run test             # Run local tests (app.spec.ts, i18n.spec.ts)
npm run test:ui          # Interactive Playwright UI
npm run test:headed      # Tests with visible browser
npm run test:production  # Run against production (production.spec.ts)

# Analytics & Validation
npm run report           # Generate Umami analytics report
npm run validate         # Validate production deployment
npm run validate:verbose # Verbose validation output
```

## Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with @tailwindcss/typography
- **Markdown:** unified.js pipeline (remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify)
- **PDF Generation:** Puppeteer with @sparticuz/chromium (serverless-compatible)
- **Hosting:** Vercel with edge CDN
- **Analytics:** Umami Cloud (cookieless, privacy-focused)

### Project Structure

```
src/
├── app/
│   ├── [locale]/           # i18n routes (en, it, es)
│   ├── api/convert/pdf/    # PDF generation endpoint
│   ├── layout.tsx          # Root layout with Umami analytics
│   └── page.tsx            # Main converter page
├── components/             # React components (upload-card, preview-card, export-row, etc.)
├── hooks/                  # Custom React hooks
├── i18n/
│   ├── config.ts           # Locale configuration (en, it, es)
│   └── dictionaries/       # Translation files
├── lib/
│   ├── markdown.ts         # Markdown→HTML conversion pipeline
│   ├── export-pdf.ts       # Client-side PDF export handler
│   ├── export-html.ts      # HTML generation
│   ├── export-txt.ts       # TXT download
│   ├── download.ts         # File download utilities
│   └── analytics.ts        # Umami event tracking
└── types/                  # TypeScript types
```

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

## Supported Locales

English (default), Italian (`/it`), Spanish (`/es`). Locale config in `src/i18n/config.ts`.