# Markdown Free — Technical Reference

> **Repository:** https://github.com/winwintangelo/markdown-free  
> **Last Updated:** January 10, 2026  
> **Status:** ✅ Production Ready

---

## Quick Reference

### Tech Stack
- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `@tailwindcss/typography`
- **Icons:** lucide-react
- **Testing:** Playwright (246 E2E tests)
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

All events are fire-and-forget, sent to both Umami and Vercel Analytics (if enabled).

| Category | Events |
|----------|--------|
| Conversion | `upload_start`, `upload_error`, `convert_success`, `convert_error`, `sample_click` |
| Abandonment | `upload_abandoned`, `convert_abandoned` |
| Engagement | `section_visible`, `scroll_depth`, `time_on_page`, `upload_hover`, `paste_toggle_click`, `export_hover`, `drag_enter` |
| Navigation | `nav_click`, `feedback_click`, `feedback_submit` |
| Localization | `language_suggestion_shown`, `language_switched`, `language_suggestion_dismissed`, `locale_pageview`, `locale_conversion` |

**Engagement tracking fires once per session** to avoid spam.

#### Failure Lens Tracking (Error Classification)

Errors are classified as **User Error** vs **System Error** to help prioritize fixes:

| Event | Error Code | Category | Description |
|-------|------------|----------|-------------|
| `upload_error` | `invalid_type` | user_error | Wrong file type uploaded |
| `upload_error` | `too_large` | user_error | File exceeds 5MB limit |
| `upload_error` | `parse_error` | user_error | Corrupted/binary file |
| `upload_error` | `read_error` | system_error | System couldn't read file |
| `convert_error` | `pdf_timeout` | system_error | Server took too long |
| `convert_error` | `pdf_server_error` | system_error | 500 error from server |
| `convert_error` | `network_error` | system_error | Network connectivity issue |
| `convert_error` | `aborted` | user_error | User cancelled request |
| `convert_error` | `unknown` | system_error | Unexpected error |

**Abandonment Events:**
- `upload_abandoned`: User closes tab during file upload (rare)
- `convert_abandoned`: User closes tab during PDF generation (tracked via beforeunload)

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

### E2E Test Coverage (246 tests)

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
| Multilingual PDF | 11 | CJK fonts, Vietnamese, currency symbols |
| Security | 11 | Puppeteer sandbox, image proxy, rate limiting, headers |

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

> **Last Updated:** January 26, 2026
> **Security Audit:** Implemented based on security team recommendations

### Defense Layers

| Layer | Implementation | Risk Mitigated |
|-------|----------------|----------------|
| **Puppeteer Sandbox** | JavaScript disabled, network requests blocked | RCE, SSRF |
| **Image Proxy** | Pre-fetch images in Node.js, validate URLs, convert to Base64 | SSRF via images |
| **Edge Protection** | Rate limiting (15/min), origin validation | DoS, API theft |
| **Input Sanitization** | rehype-sanitize + DOMPurify, 1MB PDF limit | XSS, resource exhaustion |
| **Security Headers** | CSP, HSTS, X-Frame-Options, etc. | Clickjacking, MITM |
| **Privacy Logging** | Metadata only, no user content logged | PII exposure |

### Priority 1: Puppeteer Sandbox (Critical)

**File:** `src/app/api/convert/pdf/route.ts`

- JavaScript execution disabled: `page.setJavaScriptEnabled(false)`
- Network request interception blocks all external requests except Google Fonts
- Allowed domains: `fonts.googleapis.com`, `fonts.gstatic.com` (for CJK support)

### Image Proxy (GitHub README Support)

**File:** `src/lib/image-proxy.ts`

External images in markdown (e.g., GitHub README images) are:
1. Pre-fetched in Node.js (not by Puppeteer)
2. URL validated to block localhost, internal IPs, file:// protocol
3. Converted to Base64 data URIs
4. Injected into HTML before Puppeteer renders

Limits:
- Max 2MB per image
- Max 20 images per document
- 5s timeout per image fetch

### Priority 2: Edge Protection (High)

**File:** `src/middleware.ts`

- **Rate Limiting:** 15 requests/minute per IP for PDF API (100/min in dev)
- **Origin Validation:** POST requests require valid `Origin` header
- Allowed origins: `https://www.markdown.free`, `https://markdown.free`, `localhost:3000`
- Returns 429 (Rate Limited) or 403 (Forbidden) for violations

### Priority 3: Input Sanitization

- **XSS Prevention:** `rehype-sanitize` (GitHub schema) + `isomorphic-dompurify` double sanitization
- **Forbidden tags:** iframe, object, embed, form, input, button
- **Forbidden attributes:** onerror, onload, onclick, onmouseover
- **File Validation:** Client-side 5MB limit before upload
- **PDF API Limits:** 1MB content limit, 15s PDF timeout, 25s max duration

### Priority 4: Security Headers

**Files:** `vercel.json`, `next.config.js`

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Restrictive policy | XSS prevention |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | HTTPS enforcement |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing prevention |
| `X-Frame-Options` | `DENY` | Clickjacking prevention |
| `X-XSS-Protection` | `1; mode=block` | Browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage prevention |

### Zero-Content Logging

- API logs only metadata: request ID, filename, content length, duration, status
- User content (markdown, HTML) is never logged (PII protection)
- Error logs include error type and stack trace, not user data

### Security Test Coverage

**File:** `e2e/security.spec.ts` (11 tests)

| Test | Coverage |
|------|----------|
| Normal PDF generation | Baseline functionality |
| External image URLs blocked | SSRF protection |
| XSS sanitization | Script/event handler removal |
| Code blocks preserved | Documentation safety |
| Content size limit (1MB) | Resource exhaustion |
| External image proxy | GitHub README images work |
| Localhost image block | SSRF via image URLs |
| Security headers | Header presence |
| Rate limit headers | Rate limiting |
| Origin validation (blocked) | CSRF/API theft |
| Origin validation (allowed) | Legitimate requests |

### Legacy Security

- **Next.js:** Updated to 14.2.35 (CVE-2025-55184 patched)

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

---

## LLM SEO Implementation

> **Last Updated:** January 24, 2026  
> **Branch:** LLMSEO

### Features Added

| Feature | Description | Files |
|---------|-------------|-------|
| **SoftwareApplication Schema** | Enhanced JSON-LD with dual type (WebApplication + SoftwareApplication) for better AI discoverability | `src/app/page.tsx`, `src/app/[locale]/page.tsx` |
| **llms.txt** | AI-friendly content description file at `/llms.txt` | `public/llms.txt` |
| **AI Crawler Permissions** | Updated robots.txt to allow GPTBot, ChatGPT-User, Claude, Perplexity, etc. | `public/robots.txt` |
| **FAQ Pages** | Dedicated FAQ pages with natural language questions in all 9 locales | `src/app/faq/page.tsx`, `src/app/[locale]/faq/page.tsx` |

### New Files

- `public/llms.txt` - AI-friendly tool description
- `src/app/faq/page.tsx` - English FAQ page
- `src/app/[locale]/faq/page.tsx` - Localized FAQ pages

### Schema.org Enhancements

The JSON-LD schema now includes:
- `@type: ["WebApplication", "SoftwareApplication"]` - Dual type for broader AI recognition
- `@id` - Unique identifier for the app
- `alternateName` - Alternative name for search
- `keywords` - SEO keywords
- `softwareHelp` - Link to FAQ page
- Updated `featureList` including DOCX support

### robots.txt AI Crawler Permissions

```
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: Google-Extended
User-agent: anthropic-ai
User-agent: Claude-Web
User-agent: PerplexityBot
User-agent: Bytespider
User-agent: CCBot
User-agent: cohere-ai
Allow: /
```

### FAQ Page URLs

| Locale | URL |
|--------|-----|
| English | /faq |
| Traditional Chinese | /zh-Hant/faq |
| Simplified Chinese | /zh-Hans/faq |
| Japanese | /ja/faq |
| Korean | /ko/faq |
| Spanish | /es/faq |
| Italian | /it/faq |
| Indonesian | /id/faq |
| Vietnamese | /vi/faq |

### Test Coverage

11 new E2E tests added:
- robots.txt AI crawler permissions
- llms.txt accessibility and content
- SoftwareApplication schema presence
- FAQ page structure (EN)
- FAQ page JSON-LD schema
- FAQ page breadcrumb navigation
- FAQ page CTA section
- FAQ page natural language questions
- Localized FAQ page (zh-Hant)
- FAQ page meta description

**Total tests:** 248 (all passing)

---

## Next Steps & Recommendations

> **Last Updated:** February 8, 2026
> **Based on:** Google Search Console + Bing Webmaster + Umami Analytics

### 📊 Current Performance (Feb 8, 2026)

| Metric | Current | Previous (Jan 10) | Change |
|--------|---------|-------------------|--------|
| GSC Impressions (28d) | **299** | 12 | +2,392% |
| GSC Clicks | **5** | 1 | +400% |
| Average Position | 21.4 | 11.3 | Widened (more queries) |
| CTR | 1.7% | 8.3% | Lower (more page 2-3 impressions) |
| Upload → Conversion Rate | **83%** | 53% | +57% |
| Session Conversion Rate | **61%** | ~31% | +97% |
| Countries Reached | 20 | ~11 | +82% |
| AI Referrals (30d) | **20** | - | New metric |
| Bing Impressions | 14 | - | New |

### 🌟 Key Wins

1. **AI referrals = 6.3x Google organic** — ChatGPT (14), Perplexity (5), others (1)
2. **Japan is #1 non-EN market** — 5 visitors, conversions, 11 GSC impressions, 3 Bing queries
3. **India emerged organically** — 8 visitors with conversions, zero marketing effort
4. **83% upload→conversion rate** — product-market fit is strong
5. **GSC impressions grew 25x** — from 12 to 299 in one month

### 🎯 Recommended Actions

| Priority | Action | Rationale |
|----------|--------|-----------|
| 🔴 CRITICAL | Request GSC indexing for `/ja` | 11 impressions + 5 visitors + conversions, blocked by indexing |
| 🔴 CRITICAL | Request GSC indexing for `/ko` | 5 impressions, 0 visitors (indexing gap) |
| 🔥 High | Post on Qiita (Japan) | Proven demand, AI + search driving JP traffic |
| 🔥 High | Enhance AI/LLM visibility | AI = primary channel, expand llms.txt + FAQ |
| Medium | Add India to marketing plans | 8 visitors, conversions, unaddressed |
| Medium | Request GSC indexing for `/id` | 8 AI-driven visitors |
| Low | Evaluate French locale | 3 visitors, extreme engagement (52 events) |
| Low | Deprioritize Italian promotion | Only 1 visitor despite 4 indexed pages |

### 📈 Expected Timeline

| Timeframe | Expected Outcome |
|-----------|-----------------|
| This week | `/ja` and `/ko` indexed → unlock search traffic |
| Week 2 | Qiita article drives Japan developer traffic |
| Month 1 | 100-200 visitors as JP/KO pages start ranking |
| Month 2-3 | AI referrals compound as more content indexed |

### 🔑 KPIs to Monitor

1. **AI Referrals:** `ai_referral` events by source (ChatGPT, Perplexity, etc.)
2. **Search Console:** Impressions + clicks by locale (especially JA, KO)
3. **Umami:** `locale_pageview` and `locale_conversion` by language
4. **Conversion funnel:** Upload start rate (18%) → Conversion rate (83%)
5. **Bing Webmaster:** Position tracking for JP/KO/ES queries

---

## 📦 DOCX Expansion Implementation

> **Started:** February 1, 2026
> **Strategy:** Power Page approach (one page per locale targeting both "Word" and "DOCX" keywords)

### Milestone 1: Wave 1 - EN, ID, JA ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Create `/markdown-to-word` (EN) | ✅ Done | Power page with FAQ, Privacy, Who Uses sections |
| Create `/id/markdown-ke-word` (ID) | ✅ Done | Indonesian power page with localized content |
| Create `/ja/markdown-word-henkan` (JA) | ✅ Done | Japanese power page with localized content |
| Update existing DOCX page titles | ✅ Done | Added "(Word)" to titles |
| E2E tests for Wave 1 | ✅ Done | 19 tests passing in `e2e/word-pages.spec.ts` |

### Milestone 2: Wave 2 - ES, KO, VI ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Create `/es/markdown-a-word` | ✅ Done | Spanish power page with localized content |
| Create `/ko/markdown-word-byeonhwan` | ✅ Done | Korean power page with localized content |
| Create `/vi/markdown-sang-word` | ✅ Done | Vietnamese power page with localized content |
| Add hreflang cross-links | ✅ Done | All pages include full hreflang network |
| E2E tests for Wave 2 | ✅ Done | 15 tests passing in `e2e/word-pages.spec.ts` |

### Milestone 3: Wave 3 - ZH-Hans, ZH-Hant, IT ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Create `/zh-Hans/markdown-zhuanhuan-word` | ✅ Done | Simplified Chinese power page |
| Create `/zh-Hant/markdown-word-zhuanhuan` | ✅ Done | Traditional Chinese power page |
| Create `/it/markdown-in-word` | ✅ Done | Italian power page |
| Complete hreflang network | ✅ Done | All pages include full hreflang network |
| E2E tests for Wave 3 | ✅ Done | 15 tests passing in `e2e/word-pages.spec.ts` |

### Milestone 4: Sitemap & Final Verification ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Add Word pages to sitemap.xml | ✅ Done | All 9 pages with full hreflang network |
| Update progress tracking | ✅ Done | docs/progress.md updated |

### Test Coverage

| Test Suite | Tests | Status |
|------------|-------|--------|
| Word power pages (Wave 1) | 19 | ✅ Passing |
| Word power pages (Wave 2) | 15 | ✅ Passing |
| Word power pages (Wave 3) | 15 | ✅ Passing |
| **Total** | **49** | ✅ All passing |

### New Word Power Pages Summary

| Locale | URL | Title |
|--------|-----|-------|
| EN | `/markdown-to-word` | Markdown to Word (DOCX) Converter |
| ID | `/id/markdown-ke-word` | Markdown ke Word (DOCX) Gratis |
| JA | `/ja/markdown-word-henkan` | Markdown Word（DOCX）変換 |
| ES | `/es/markdown-a-word` | Markdown a Word (DOCX) Gratis |
| KO | `/ko/markdown-word-byeonhwan` | Markdown Word(DOCX) 변환 |
| VI | `/vi/markdown-sang-word` | Markdown sang Word (DOCX) Miễn phí |
| ZH-Hans | `/zh-Hans/markdown-zhuanhuan-word` | Markdown转换Word（DOCX）免费 |
| ZH-Hant | `/zh-Hant/markdown-word-zhuanhuan` | Markdown轉換Word（DOCX）免費 |
| IT | `/it/markdown-in-word` | Markdown in Word (DOCX) Gratis |

---

## AI Traffic Acquisition Plan

> **Added:** February 26, 2026
> **Goal:** Get markdown.free recommended by Claude, Grok, and Gemini
> **Analytics context:** ChatGPT already drives 32% of external referrals (35 visits/30d). Claude, Grok, Gemini have zero tracked referrals — untapped.

### How Each AI Surfaces Tool Recommendations

| AI | Mechanism | Key Lever |
|----|-----------|-----------|
| **Claude** | Pre-training data + live web search (ClaudeBot crawls) | Third-party citations on high-authority sites |
| **Grok** | Live web search + **real-time X/Twitter data** (exclusive) | X posts with engagement; only LLM where social is a direct input |
| **Gemini** | Google Search index + Knowledge Graph + structured data | Schema.org JSON-LD; Wikidata entry for entity recognition |
| **ChatGPT** | Bing search index + training data | Standard SEO + AlternativeTo/directory listings |
| **Perplexity** | Live web, favors content <90 days old | Reddit, fresh articles, high-authority citations |

### What's Already Done ✅

| Item | Status | Notes |
|------|--------|-------|
| `SoftwareApplication` + `FAQPage` JSON-LD | ✅ Done (Jan 24) | In `page.tsx` and `[locale]/page.tsx` |
| `llms.txt` | ✅ Done | At `/llms.txt` with 9-language queries |
| AI crawler permissions in `robots.txt` | ✅ Done | ClaudeBot, GPTBot, Google-Extended, etc. all allowed |
| FAQ pages (9 locales) | ✅ Done | `/faq`, `/ja/faq`, `/zh-Hant/faq`, etc. |
| AI referral tracking | ✅ Done | `ai_referral` events in analytics.ts |
| `llms.txt` Key Pages section | ✅ Done (Feb 26) | Added direct links to landing pages |

### Acquisition Checklist

#### Tier 1 — High Impact, Low Effort

| # | Action | Target AI | Status | Notes |
|---|--------|-----------|--------|-------|
| 1 | `SoftwareApplication` JSON-LD in layout | Gemini, ChatGPT | ✅ Done | Already in page.tsx since Jan 24 |
| 2 | Add `## Key Pages` section to `llms.txt` | Claude (agentic) | ✅ Done (Feb 26) | Links to all major landing pages |
| 3 | List on **AlternativeTo** | All LLMs | ✅ Done (Feb 26) | Listed as alternative to Pandoc, Typora, markdowntopdf.com |
| 4 | List on **There's An AI For That** + **Futurepedia** | All LLMs | ⛔ Skipped | Paid listings only — not worth cost at this stage |
| 4b | List on **Toolify.ai** + **TopAI.tools** (free) | All LLMs | ⬜ Todo | Free alternatives: `toolify.ai/submit` + `topai.tools/submit` |
| 5 | Post on Reddit (r/ObsidianMD, r/selfhosted) | All LLMs | ⬜ Todo | Reddit cited in ~40% of LLM responses; write a genuine "I built this" post |

#### Tier 2 — Medium Effort, Strategic

| # | Action | Target AI | Status | Notes |
|---|--------|-----------|--------|-------|
| 6 | Create **X/Twitter account** for markdown.free | **Grok** | ⬜ Todo | Grok reads live X posts directly — only LLM where this is a real-time signal |
| 7 | **Hacker News Show HN** post | All LLMs | ⬜ Todo | High-authority domain; even 20-50 upvotes creates a permanent LLM citation |
| 8 | Create **Wikidata entry** | **Gemini** | ⬜ Todo | Feeds Google Knowledge Graph → Gemini entity recognition; requires notability (AlternativeTo listing satisfies this) |
| 9 | **Product Hunt** launch | All LLMs | ⬜ Todo | Permanent high-DA listing; time for Tue–Thu |
| 10 | Write comparison landing page | All LLMs | ⬜ Todo | `/markdown-to-pdf-alternatives` comparing Pandoc, md2pdf, markdowntopdf.com |

#### Tier 3 — Watch and Wait

| # | Action | Target AI | Status | Notes |
|---|--------|-----------|--------|-------|
| 11 | **Claude MCP Plugin** | Claude | ⬜ Watch | Enterprise-only as of Feb 2026; monitor `github.com/anthropics/claude-plugins-official` for indie dev submissions |
| 12 | Dev.to / Hashnode posts | All LLMs | ⬜ Todo | "How I convert Obsidian notes to PDF without Pandoc" — LLM-cited platforms |
| 13 | Stack Overflow / Quora answers | All LLMs | ⬜ Todo | Answer "convert README.md to PDF" questions; link naturally |

### Key Insight: Reddit is the Highest-ROI Single Action

Reddit is cited in ~40% of all LLM responses and is Perplexity's top source. A single well-received post on r/ObsidianMD or r/selfhosted creates a permanent, crawlable citation that influences Claude, ChatGPT, Gemini, and Grok alike.

### Analytics to Track Progress

Monitor these in Umami dashboard after each action:
- `ai_referral` events broken down by `source` property (claude, grok, gemini)
- Referrer list for `claude.ai`, `grok.com`, `gemini.google.com`
- `conversion_referrer` events with `source` property

---

## 📱 Mobile UX Redesign

> **Started:** March 19, 2026
> **Goal:** Optimize mobile experience for paste-first workflow (ChatGPT/Claude → markdown.free → PDF/DOCX share)
> **Principle:** All changes mobile-only. Desktop experience completely unchanged.

### Phase 1: Native File Sharing ✅ Complete (Mar 19)

| Feature | Status | Description |
|---------|--------|-------------|
| Web Share API integration | ✅ Done | "Share as PDF" / "Share as DOCX" buttons on mobile using `navigator.share()` |
| Two-step share flow | ✅ Done | Generate blob → "Tap to share" button (browser requires fresh user activation) |
| Graceful degradation | ✅ Done | Falls back to download-only on unsupported browsers (Firefox) |
| Share analytics | ✅ Done | `share_file` event tracking |
| All 9 locales | ✅ Done | Share strings translated |

### Phase 2: Mobile Layout Optimization ✅ Complete (Mar 20)

| Feature | Status | Description |
|---------|--------|-------------|
| Hero compression | ✅ Done | H1 + subtitle hidden on mobile; badge only |
| Upload card hidden | ✅ Done | Drag & drop hidden via `hidden md:flex` |
| Paste-first input | ✅ Done | Textarea always visible on mobile with Choose file + Try sample |
| Export placeholder | ✅ Done | "Upload or paste to continue" shown until content loaded |
| Preview compact | ✅ Done | Single-line placeholder instead of "How it works" steps |
| Preview clamp | ✅ Done | 600px max-height with gradient fade + expand/collapse toggle |
| Mobile menu | ✅ Done | Language selector grid replaces About/Privacy links (moved to footer) |
| Export consolidation | ✅ Done | Share PDF + Share DOCX primary; Save/TXT/HTML in "More formats" dropdown |
| Vercel debug logs | ✅ Done | `<Analytics debug={false} />` suppresses dev console noise |

### Phase 3: Clipboard Paste Button ✅ Complete (Mar 21)

| Feature | Status | Description |
|---------|--------|-------------|
| Clipboard paste button | ✅ Done | Large "Paste from clipboard" button as primary input using `navigator.clipboard.readText()` |
| Confirmation bar | ✅ Done | "Pasted · ~N pages" compact bar after successful paste |
| Edit mode | ✅ Done | "Edit text" link reveals textarea with pasted content; "Done editing" returns to bar |
| Paste again | ✅ Done | "Paste again" resets to landing state |
| Error: permission denied | ✅ Done | Falls back to textarea with warning message |
| Error: empty clipboard | ✅ Done | "Nothing to paste" message with shake animation on button |
| Error: non-text content | ✅ Done | "Only text/markdown is supported" inline message |
| Clipboard API detection | ✅ Done | Feature detection; textarea shown directly if API unavailable |
| All 9 locales | ✅ Done | 13 new paste strings translated |

### Test Coverage

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| `e2e/share.spec.ts` | 15 | Native sharing, two-step flow, fallbacks |
| `e2e/mobile.spec.ts` | 44 | Mobile layout, paste-first, preview, menu, i18n |
| `e2e/clipboard.spec.ts` | 21 | Clipboard paste, confirmation, edit, errors, i18n |
| **Total mobile tests** | **80** | |
| **Total all tests** | **427** | All passing |

### Mobile User Journey (Before → After)

```
BEFORE (8 taps, ~15s):
  Tap textarea → Keyboard appears → Long-press → Tap "Paste" →
  iOS "Allow" → Dismiss keyboard → Scroll to Share → Tap Share

AFTER (3 taps, ~5s):
  Tap "Paste from clipboard" → iOS "Allow Paste" → Tap "Share as PDF"
```

