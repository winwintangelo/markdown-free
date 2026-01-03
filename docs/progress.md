# Markdown Free — Technical Reference

> **Repository:** https://github.com/winwintangelo/markdown-free  
> **Last Updated:** January 3, 2026  
> **Status:** ✅ Production Ready

---

## Quick Reference

### Tech Stack
- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `@tailwindcss/typography`
- **Icons:** lucide-react
- **Testing:** Playwright (126 E2E tests)
- **Analytics:** Umami Cloud (cookieless)
- **PDF Generation:** Puppeteer + @sparticuz/chromium (serverless)
- **Deployment:** Vercel
- **Internationalization:** 3 locales (English, Italian, Spanish)

### Key Commands
```bash
npm run dev             # Development server
npm run build           # Production build
npm test                # Run E2E tests (headless)
npm run test:ui         # Playwright UI mode
npm run report          # Pull Umami aggregate stats
npm run report:sessions # Pull user session journeys
```

### Environment Variables
```bash
# Analytics (client-side)
NEXT_PUBLIC_UMAMI_HOST=https://cloud.umami.is
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<your-website-id>

# Umami Report Scripts (local only)
UMAMI_API_KEY=<your-api-key>
UMAMI_WEBSITE_ID=<your-website-id>
UMAMI_API_HOST=https://api.umami.is
REPORT_DAYS=30
```

---

## Architecture Overview

### File Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout, SEO metadata, Umami script
│   ├── page.tsx            # Home page (English default)
│   ├── globals.css         # Global styles
│   ├── about/page.tsx      # About page (English)
│   ├── privacy/page.tsx    # Privacy policy (English)
│   ├── [locale]/           # Localized routes (/it, /es)
│   │   ├── layout.tsx      # Locale layout with hreflang
│   │   ├── page.tsx        # Localized home page
│   │   ├── about/page.tsx  # Localized about
│   │   └── privacy/page.tsx # Localized privacy
│   └── api/convert/pdf/route.ts  # PDF generation API
├── i18n/
│   ├── config.ts           # Locale settings, path helpers
│   ├── dictionaries.ts     # Dictionary loader
│   ├── index.ts            # Module exports
│   └── dictionaries/       # JSON translation files
│       ├── en.json
│       ├── it.json
│       └── es.json
├── components/
│   ├── header.tsx          # Nav + Feedback modal trigger
│   ├── hero.tsx            # Hero section with H1
│   ├── footer.tsx          # Footer with privacy notice
│   ├── upload-card.tsx     # File upload with drag-and-drop
│   ├── paste-area.tsx      # Collapsible markdown textarea
│   ├── export-row.tsx      # PDF/TXT/HTML export buttons
│   ├── preview-card.tsx    # Live markdown preview
│   ├── feedback-modal.tsx  # Feedback form (React Portal)
│   ├── engagement-tracker.tsx  # Scroll/time tracking
│   ├── language-switcher.tsx   # Language dropdown
│   ├── language-banner.tsx     # Browser language suggestion
│   └── index.ts            # Barrel exports
├── hooks/
│   ├── use-converter.tsx   # App state (React Context + Reducer)
│   └── use-engagement-tracking.tsx  # Visibility/scroll/time hooks
├── lib/
│   ├── utils.ts            # cn(), file validation helpers
│   ├── markdown.ts         # Unified pipeline (remark → rehype)
│   ├── download.ts         # File download utility
│   ├── export-txt.ts       # TXT export (client-side)
│   ├── export-html.ts      # HTML export with embedded CSS
│   ├── export-pdf.ts       # PDF export via API call
│   └── analytics.ts        # Umami event tracking
└── types/index.ts          # TypeScript types

scripts/
├── umami-report.mjs        # Aggregate stats export (pageviews, events, etc.)
└── umami-sessions.mjs      # User session journey report
```

---

## Core Features

### 1. Markdown Processing
**File:** `src/lib/markdown.ts`

Pipeline: `remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify`
- Supports GitHub Flavored Markdown (tables, strikethrough, etc.)
- XSS sanitized output (scripts, event handlers stripped)

### 2. Export Formats

| Format | Implementation | Location |
|--------|----------------|----------|
| TXT | Client-side, raw markdown | `src/lib/export-txt.ts` |
| HTML | Client-side, styled template | `src/lib/export-html.ts` |
| PDF | Server-side, Puppeteer | `src/app/api/convert/pdf/route.ts` |

**PDF Generation:**
- Uses `@sparticuz/chromium-min` for serverless
- A4 format, 20mm margins
- 15s timeout, 5MB content limit
- Vercel config: 1024MB memory, 30s max duration

### 3. State Management
**File:** `src/hooks/use-converter.tsx`

React Context with useReducer pattern:
```typescript
interface ConverterState {
  content: { source: 'file' | 'paste' | 'sample', content: string, filename: string, size: number } | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: { code: string, message: string } | null;
  isPasteAreaVisible: boolean;
}
```

### 4. Analytics Events
**File:** `src/lib/analytics.ts`

All events are fire-and-forget, only sent if Umami is loaded.

| Category | Events |
|----------|--------|
| Conversion | `upload_start`, `upload_error`, `convert_success`, `convert_error`, `sample_click` |
| Engagement | `section_visible`, `scroll_depth`, `time_on_page`, `upload_hover`, `paste_toggle_click`, `export_hover`, `drag_enter` |
| Navigation | `nav_click`, `feedback_click`, `feedback_submit` |
| Localization | `language_suggestion_shown`, `language_switched`, `language_suggestion_dismissed`, `locale_pageview`, `locale_conversion` |

**Engagement tracking fires once per session** to avoid spam.

### 5. Analytics Reports
**Scripts:** `scripts/umami-report.mjs`, `scripts/umami-sessions.mjs`

Local scripts to pull analytics data from Umami API for analysis.

#### Aggregate Report (`npm run report`)
Exports to `tmp/reports/`:
- `stats_*.json` - Pageviews, visitors, bounces, visit duration
- `pageviews_*.json` - Page-level traffic
- `event_names_*.json/csv` - Event counts by name
- `browsers_*.json/csv` - Browser breakdown
- `countries_*.json/csv` - Geographic data
- `referrers_*.json/csv` - Traffic sources

#### Session Journey Report (`npm run report:sessions`)
Shows individual user journeys with event sequences:

```
👤 Session 1: 704f29d3...
   📍 Riyadh, Saudi Arabia (SA)
   💻 mobile | ios | iOS
   📝 Journey (6 events):
      11:28:46 AM │ 📄 Viewed page: /
      11:28:46 AM │ 👁️  section_visible
      11:28:54 AM │ ⏱️  time_on_page
      11:29:14 AM │ ⏱️  time_on_page
```

**Filtering Options:**
| Flag | Effect |
|------|--------|
| (default) | Excludes testers + crawlers |
| `--include-testers` | Include test sessions (Plano, US) |
| `--include-crawlers` | Include detected bots |

**Crawler Detection:**
- Data center cities: Ashburn (AWS), Falkenstein (Hetzner), Council Bluffs (Google)
- Bot browsers: headless, phantomjs, selenium
- Override: Users with engagement events are never flagged as crawlers

**Session Categorization:**
- ✅ Converted (completed export)
- 📤 Tried upload (or sample click)
- 🎯 Showed interest (hover/paste toggle)
- 📜 Engaged (scrolled/stayed)
- 👁️ Viewed sections
- 🚪 Bounced (pageview only)

**Locale-Specific KPIs:**
The session report now includes locale-specific KPIs:

| KPI | Formula | Purpose |
|-----|---------|---------|
| Language Switch Rate | `language_switched / language_suggestion_shown` | Banner effectiveness |
| Activation Rate | `(sample_click + upload_start + paste_toggle) / locale_pageview` | User engagement by locale |
| Conversion Rate | `export_pdf / total_activations` | Export success by locale |

Filter by `locale=it` or `locale=es` in Umami dashboard for per-language metrics.

### 6. Try Sample File
**Feature:** Allows users to test the converter without having their own markdown file.

- **Button location:** Upload card, alongside "paste Markdown" link
- **Sample file:** `public/sample.md` (Shakespeare's Sonnets I-III)
- **Analytics:** Tracks `sample_click` and `upload_start` with `source: "sample"`
- **Purpose:** Reduce friction for first-time users and improve conversion rate

### 7. Feedback System
**File:** `src/components/feedback-modal.tsx`

- Triggered by Feedback button in header
- Fields: Feedback (required), Email (optional)
- Stores via Umami `feedback_submit` event (no backend DB needed)
- Uses React Portal for proper z-index
- Auto-closes after successful submission

---

## Testing

### E2E Test Coverage (126 tests)

| Suite | Tests | Key Coverage |
|-------|-------|--------------|
| App Layout | 5 | Header, Hero, Footer, initial states |
| Upload/Paste | 6 | File upload, drag-drop, paste area |
| File Validation | 2 | 5MB limit enforcement |
| Export | 11 | PDF/TXT/HTML download, error handling |
| Preview | 2 | Markdown rendering, XSS prevention |
| Navigation | 6 | Page routing, mobile menu |
| SEO | 14 | Metadata, OG tags, JSON-LD, robots.txt |
| Analytics | 19 | Event tracking, engagement hooks |
| Feedback Modal | 15 | Form validation, submission, accessibility |
| Mobile | 7 | Responsive UI, touch interactions |
| Performance | 3 | Load time, FCP, accessibility |
| Special Cases | 5 | Unicode filenames, emoji handling |
| i18n | 24 | Locale routes, translations, SEO, language switcher |

### Running Tests
```bash
npm test                    # Headless
npm run test:headed         # With browser visible
npm run test:ui             # Playwright UI
npm run test:production     # Against production URL
```

---

## Deployment

### Vercel Configuration
**File:** `vercel.json`

- PDF route: 1024MB memory, 30s timeout
- Security headers: X-Content-Type-Options, X-Frame-Options, etc.
- Cache: Static assets cached for 1 year

### Static Files
**Folder:** `public/`

| File | Purpose |
|------|---------|
| `favicon.svg` | Emerald logo favicon |
| `og-image.svg` | OpenGraph social image |
| `robots.txt` | Crawler directives (disallows /api/) |
| `sitemap.xml` | SEO sitemap |
| `sample.md` | Sample markdown file (Shakespeare's Sonnets) |

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | React Context | Simpler than Zustand for this scope |
| Drag & Drop | Native HTML5 DnD | No extra dependency needed |
| PDF Generation | Server-side Puppeteer | Better quality, handles complex markdown |
| Analytics | Umami Cloud | Privacy-friendly, cookieless, free tier |
| Feedback Storage | Umami events | No backend DB needed |
| Styling | Tailwind + Typography | Fast development, good prose styling |

---

## Security

- **XSS Prevention:** `rehype-sanitize` strips scripts, event handlers, javascript: URLs
- **File Validation:** Client-side 5MB limit before upload
- **PDF API:** Content size validation, timeout protection
- **Next.js:** Updated to 14.2.35 (CVE-2025-55184 patched)
- **Headers:** Security headers via Vercel config

---

## Color Scheme

| Usage | Color | Tailwind Class |
|-------|-------|----------------|
| Primary accent | Emerald | `emerald-500`, `emerald-600` |
| Text | Slate | `slate-900`, `slate-600`, `slate-400` |
| Backgrounds | White/Slate | `white`, `slate-50`, `slate-100` |
| Errors | Red | `red-500`, `red-50` |
| Success | Emerald | `emerald-500`, `emerald-100` |

---

## API Reference

### POST /api/convert/pdf

**Request:**
```json
{
  "markdown": "# Title\n\nContent...",
  "filename": "document.md"
}
```

**Response (Success):** PDF binary with `Content-Disposition: attachment`

**Response (Error):**
```json
{
  "error": "GENERATION_FAILED",
  "message": "PDF generation failed. Please try again."
}
```

**Error Codes:** `INVALID_CONTENT`, `CONTENT_TOO_LARGE`, `GENERATION_TIMEOUT`, `GENERATION_FAILED`

---

## Notes for Development

1. **Adding new analytics events:** Add helper function in `src/lib/analytics.ts`, call from component
2. **Adding new export format:** Create `src/lib/export-{format}.ts`, add button in `export-row.tsx`
3. **Modifying preview styling:** Edit prose classes in `preview-card.tsx` and `export-html.ts`
4. **PDF styling:** Edit HTML template in `src/app/api/convert/pdf/route.ts`
5. **Testing:** Add tests to `e2e/app.spec.ts`, run with `npm test`
6. **Analytics reports:** Configure `.env` with Umami API key, run `npm run report` or `npm run report:sessions`
7. **Exclude tester locations:** Edit `EXCLUDED_LOCATIONS` in `scripts/umami-sessions.mjs`
8. **Exclude crawler cities:** Edit `DATA_CENTER_CITIES` in `scripts/umami-sessions.mjs`

---

## Internationalization (i18n)

### Supported Locales
| Locale | URL Path | Language |
|--------|----------|----------|
| `en` | `/` (default) | English |
| `it` | `/it` | Italian (Italiano) |
| `es` | `/es` | Spanish (Español) |

### How to Add a New Language

1. **Add locale to config:** Edit `src/i18n/config.ts`:
   ```typescript
   export const locales = ["en", "it", "es", "fr"] as const; // Add new locale
   
   export const localeNames: Record<Locale, string> = {
     en: "English",
     it: "Italiano",
     es: "Español",
     fr: "Français", // Add display name
   };
   
   export const localeMetadata: Record<Locale, {...}> = {
     // Add metadata for new locale
     fr: { hreflang: "fr", ogLocale: "fr_FR", htmlLang: "fr" },
   };
   ```

2. **Create translation file:** Copy `src/i18n/dictionaries/en.json` to `src/i18n/dictionaries/fr.json` and translate all strings.

3. **Import dictionary:** Edit `src/i18n/dictionaries.ts`:
   ```typescript
   import fr from "./dictionaries/fr.json";
   
   const dictionaries: Record<Locale, Dictionary> = {
     en, it, es, fr, // Add new import
   };
   ```

4. **Add localized content for About/Privacy pages:** Add translations to the `content` objects in:
   - `src/app/[locale]/about/page.tsx`
   - `src/app/[locale]/privacy/page.tsx`

5. **Update sitemap:** Add new locale URLs to `public/sitemap.xml`

6. **Add tests:** Add locale-specific tests to `e2e/i18n.spec.ts`

### Translation Guidelines
- Keep ~20% unique content per locale (not just direct translation)
- Localize FAQs with culturally relevant examples
- Adapt phrasing naturally for the target language
- Verify all copy is **truthful** — don't claim features that don't exist

### SEO Implementation
- **hreflang tags:** Auto-generated via `generateMetadata` in locale layouts
- **Canonical URLs:** Each locale is self-canonical (no cross-locale canonicalization)
- **Sitemap:** All locale URLs included with proper hreflang annotations
- **No forced redirects:** Users aren't auto-redirected based on browser language

### Language Detection (UX)
- Browser language detected on first visit
- Non-blocking banner suggests locale switch if mismatch
- User preference saved to `localStorage` (key: `preferred-locale`)
- Language switcher in header for manual selection
- Shared links always open in the URL's language

### Analytics Events
| Event | Data | Purpose |
|-------|------|---------|
| `locale_pageview` | `{locale, page}` | Track pageviews by language |
| `locale_conversion` | `{locale, format}` | Track exports by language |
| `language_suggestion_shown` | `{suggested, current}` | Banner was displayed |
| `language_switched` | `{from, to, via}` | User changed language |
| `language_suggestion_dismissed` | `{suggested, current}` | Banner was closed |
