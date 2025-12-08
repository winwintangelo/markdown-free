# Markdown Free — Product Specification

> **Version:** 1.0 MVP  
> **Last Updated:** December 7, 2024  
> **Status:** Implemented & Deployed  
> **Reference Mockup:** `tmp/c.html`

---

## 1. Executive Summary

### What We're Building
A fast, free, web-based Markdown viewer and converter with an ultra-simple flow: upload a Markdown file, preview it, then click "To PDF", "To TXT", or "To HTML" to download the converted output.

### Product Name & Branding
- **Name:** Markdown Free
- **Domain:** markdown.free
- **Logo:** "md" text in a rounded emerald square (emerald-500 background, white text)
- **Tagline:** "Free • No signup • Instant export"

### Core Principle
**Upload-first, not editor-first.** Users should understand the tool in under 3 seconds and complete their task in under 30 seconds.

### Target Experience
```
Drag File → See Preview → Click Export → Download
```

---

## 2. Problem Statement

| User Pain Point | Current Solutions | Our Approach |
|-----------------|-------------------|--------------|
| Non-technical users receive `.md` files and can't open them | Google "how to open md file" | Instant preview, no learning |
| Technical users want quick conversion without IDE | Open VS Code, install extension, export | 3-click workflow |
| Existing tools require sign-up or complex UI | Medium, Notion, HackMD | No account, single page |
| Privacy concerns with cloud-based converters | "We store your files" disclaimers | Process temporarily, never store |

---

## 3. Target Users

1. **Primary:** People who receive `.md` files (from GitHub, email, etc.) and just want to view/convert them
2. **Secondary:** Developers and technical writers needing quick conversions
3. **Tertiary:** Students/teachers sharing Markdown with non-technical peers

---

## 4. MVP Scope

### ✅ Included in MVP

| Feature | Priority | Processing |
|---------|----------|------------|
| Drag-and-drop file upload | P0 | Client |
| Click to choose file | P0 | Client |
| Paste Markdown text | P0 | Client |
| Real-time preview (always visible) | P0 | Client |
| Export to PDF | P0 | Server |
| Export to HTML | P0 | Client |
| Export to TXT | P0 | Client |
| Progress feedback for conversions | P0 | Both |
| Error states with retry | P0 | Both |
| Mobile responsive | P0 | — |
| Privacy notice | P0 | — |
| 5MB file size limit | P0 | Client |

### ❌ Deferred to v1.1+

| Feature | Reason | Target Version |
|---------|--------|----------------|
| DOCX export | Adds complexity, docx.js learning curve | v1.1 |
| URL import (GitHub/Gist) | CORS complexity, edge cases | v1.1 |
| Edit mode | Use-and-forget tool, users have editors | v1.2 |
| Dark mode | Use-and-forget tool | v1.2 |
| Keyboard shortcuts | Use-and-forget tool | v1.2 |
| Batch conversion | Significant UX changes | v2.0 |
| User accounts | Not needed for core value | v2.0 |
| API access | Different product | v2.0 |

---

## 5. Technical Stack

### Frontend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | SSR, API routes, Vercel-native |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Components | Shadcn/UI | Accessible, customizable primitives |
| Drag & Drop | Native HTML5 DnD + custom hook | Smaller bundle, matches mockup |
| Markdown | Unified.js (remark + rehype + rehype-sanitize) | Extensible, GFM support, XSS-safe |
| State | React Context | Sufficient for single-page app |

### Backend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | Next.js API Routes (Node.js) | Co-located with frontend |
| PDF Generation | Puppeteer with `@sparticuz/chromium` | Vercel-compatible, high fidelity (see Risks) |
| Hosting | Vercel | Edge CDN, serverless, zero-config |

### Why This Stack?

```
┌─────────────────────────────────────────────────────────┐
│                      Vercel Edge CDN                     │
├─────────────────────────────────────────────────────────┤
│  Next.js Static Pages          │  Serverless Functions  │
│  ├─ / (main page)              │  ├─ /api/convert/pdf   │
│  ├─ /privacy                   │  └─ (Puppeteer)        │
│  └─ /about                     │                        │
├─────────────────────────────────────────────────────────┤
│                    Client-Side Only                      │
│  ├─ HTML generation (remark/rehype)                     │
│  ├─ TXT download (Blob)                                 │
│  └─ File validation                                     │
└─────────────────────────────────────────────────────────┘
```

### Known Risks & Mitigations

#### PDF Generation (Complexity Hotspot)

Puppeteer + `@sparticuz/chromium` on Vercel serverless is the riskiest part of this stack:

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Cold starts** | First request may take 5-10s | Show "Generating PDF..." message; set realistic user expectations |
| **Lambda size** | ~50MB compressed chromium binary | Use `@sparticuz/chromium` which is optimized for Lambda |
| **15s timeout** | May fail for very large documents | Enforce 5MB limit; optimize HTML before rendering |
| **Regional latency** | Slower in some Vercel regions | Deploy to multiple regions if needed post-launch |
| **Debugging** | Hard to debug headless Chrome in serverless | Add detailed error logging; test locally with full Puppeteer |

**Fallback strategy:** If PDF generation fails after 3 retries, show error with "Try again" button. No browser print dialog fallback (poor UX).

**Version pinning:** Always pin `@sparticuz/chromium` version to match your Puppeteer version exactly. Mismatched versions are a common cause of deployment failures.

---

## 6. Core Features Specification

### 6.1 File Upload

#### Functional Requirements

| Requirement | Details |
|-------------|---------|
| **Supported formats** | `.md`, `.markdown`, `.txt` |
| **Max file size** | 5 MB |
| **Input methods** | Drag-and-drop, file picker, paste text |
| **Validation** | File type, file size, encoding (UTF-8) |

#### Upload Card Content

| Element | Text/Behavior |
|---------|---------------|
| **Icon** | Upload arrow in emerald circle (`bg-emerald-50 text-emerald-600`) |
| **Main text** | "Drag & drop your Markdown file **or** choose file" |
| **Supported formats** | "Supports `.md`, `.markdown`, `.txt` • Max 5 MB" |
| **Status line** | Shows file status with colored dot indicator |
| **Paste toggle** | "Or paste Markdown instead" link at bottom |

#### Status Line States

| State | Dot Color | Text |
|-------|-----------|------|
| No file | `bg-slate-300` | "No file selected yet" |
| File loaded | `bg-emerald-500` | "{filename} ({size} KB)" |
| Error | `bg-red-400` | Error message |

#### File Selection Behavior

1. **Click anywhere** on card → opens file picker
2. **Drag file** over card → border turns emerald, background tints
3. **Drop file** → validates and loads
4. **Choose file link** → opens file picker (same as clicking card)

#### Acceptance Criteria

- [ ] User can drag a `.md` file and see preview within 1 second
- [ ] User can click the zone to open file picker
- [ ] Incorrect file types show: "Unsupported file type. Please upload a .md, .markdown or .txt file."
- [ ] Files over 5MB show: "File too large. Maximum size is 5MB."
- [ ] Non-UTF8 files show: "Unable to read file. Please ensure it's a valid text file."
- [ ] Status line updates immediately with filename and size on successful load

---

### 6.2 Paste Mode

#### Functional Requirements

| Requirement | Details |
|-------------|---------|
| **Trigger** | Click "Or paste Markdown instead" link in upload card |
| **Behavior** | Separate paste card appears **below** upload card (upload card remains) |
| **Debounce** | Preview updates 250ms after typing stops |
| **Toggle** | Click link again to hide paste area |

#### Paste Area Content

| Element | Details |
|---------|---------|
| **Label** | "PASTED MARKDOWN" (uppercase, slate-500) |
| **Textarea** | `h-40`, monospace font, resizable vertically |
| **Placeholder** | "Paste your Markdown here…" |
| **Helper text** | "Changes here will also be used when exporting to PDF, TXT or HTML." |

#### Input Priority

When both file and paste content exist:
- **Most recent input wins** — if user pastes after uploading, paste content is used
- Status badge in preview shows source: "(uploaded file)" or "(pasted text)"

#### Acceptance Criteria

- [ ] Clicking paste link reveals textarea below upload card
- [ ] Pasted content renders in preview within 500ms
- [ ] Clicking paste link again hides the paste area
- [ ] Paste area has monospace font for code-friendly editing
- [ ] Textarea auto-focuses when paste area is revealed

---

### 6.3 Markdown Preview

#### Card Structure

| Part | Content |
|------|---------|
| **Header** | "PREVIEW" label (left) + Status badge (right) |
| **Content** | Rendered markdown with prose styling |

#### Status Badge

| State | Badge Content |
|-------|---------------|
| No content | `● Waiting for Markdown…` (slate dot) |
| File loaded | `● Ready to export (uploaded file)` (emerald dot) |
| Paste loaded | `● Ready to export (pasted text)` (emerald dot) |

#### Rendering (Tailwind Typography / Prose)

Uses `@tailwindcss/typography` plugin with customizations:

| Element | Tailwind Prose Class |
|---------|---------------------|
| Container | `prose prose-sm max-w-none` |
| Headings | `prose-headings:mt-4 prose-headings:mb-2` |
| H1 | `prose-h1:text-2xl` |
| H2 | `prose-h2:text-xl` |
| H3 | `prose-h3:text-lg` |
| Inline code | `prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5` |
| Code blocks | `prose-pre:bg-slate-950/90 prose-pre:text-slate-50 prose-pre:shadow-inner` |

#### Content Area

- Max height: `420px`
- Overflow: `overflow-auto` (scrollable)
- Padding: `px-5 py-4`
- Line height: `leading-relaxed`

#### Default Content (Before Upload)

When no file is loaded, show helpful onboarding:

```markdown
## How it works
1. Upload a `.md` file or paste Markdown text.
2. See the formatted preview right here.
3. Click **To PDF**, **To TXT**, or **To HTML** to download your converted file.

_Once you add your own Markdown, this preview will update to match it._
```

#### Acceptance Criteria

- [ ] Preview matches HTML export output exactly
- [ ] Long documents are scrollable within 420px max-height
- [ ] Preview works on mobile (full width, readable)
- [ ] Default "How it works" content shows before any file is loaded
- [ ] Status badge updates immediately when content changes

---

### 6.4 Export Controls

#### Layout

Export buttons are contained in a card row with the privacy notice:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [To PDF]  [To TXT]  [To HTML]      Files are processed temporarily... │
│  ▲primary  ▲secondary               ▲privacy notice (right-aligned)    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Button Hierarchy

| Button | Style | Purpose |
|--------|-------|---------|
| **To PDF** | Primary (emerald filled, white text) | Most common action |
| **To TXT** | Secondary (outlined, slate border) | Plain text export |
| **To HTML** | Secondary (outlined, slate border) | Web-ready export |

#### Button States

| State | To PDF | To TXT / To HTML |
|-------|--------|------------------|
| **Disabled** | `bg-slate-200 cursor-not-allowed` | `bg-slate-100 cursor-not-allowed` |
| **Ready** | `bg-emerald-600 text-white` | `bg-slate-50 border-slate-200 text-slate-700` |
| **Hover** | `bg-emerald-700` | `bg-white border-slate-300` |
| **Loading** | Spinner + disabled | Spinner + disabled |

#### Conversion Specifications

**PDF Export (Server-side)**

| Property | Value |
|----------|-------|
| Page size | A4 (210mm × 297mm) |
| Margins | 20mm all sides |
| Font | System sans-serif (body), monospace (code) |
| Links | Clickable |
| Images | Embedded |
| Timeout | 30 seconds |

**HTML Export (Client-side)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{filename}</title>
  <style>
    /* Embedded minimal CSS extracted from Tailwind prose classes */
    /* Must match preview styling to avoid visual drift */
  </style>
</head>
<body>
  <article class="markdown-body">
    {rendered content}
  </article>
</body>
</html>
```

> **Implementation note:** `lib/export-html.ts` uses the same Tailwind-generated CSS subset as the preview component (extracted as a minimal standalone stylesheet) to ensure exported HTML matches what users see in preview.

**TXT Export (Client-side)**

- Returns original Markdown source (not stripped)
- UTF-8 encoding
- Preserves line endings

#### Filename Convention

| Source | Output Filename |
|--------|-----------------|
| Uploaded file: `readme.md` | `readme.pdf`, `readme.txt`, `readme.html` |
| Pasted content | `markdown-YYYYMMDD-HHMM.pdf` |

#### Acceptance Criteria

- [ ] All buttons disabled until content is loaded
- [ ] PDF generates within 10 seconds for typical documents (< 50KB)
- [ ] HTML and TXT download instantly (< 100ms)
- [ ] Downloaded files open without errors in standard applications
- [ ] Filenames never contain spaces (use hyphens)

---

### 6.5 Progress Feedback & Error Handling

#### Progress States

| Conversion | Progress Indication |
|------------|---------------------|
| TXT | Instant (no progress needed) |
| HTML | Instant (no progress needed) |
| PDF | Spinner in button + "Generating PDF..." text below |

> **MVP simplification:** No progress bar. Spinner-only approach is sufficient for a "use-and-forget" tool. Progress bars require streaming/polling which adds unnecessary complexity.

#### Error States

| Error | Message | Action |
|-------|---------|--------|
| File too large | "File exceeds 5MB limit. Please use a smaller file." | — |
| Invalid file type | "Please upload a Markdown file (.md, .markdown, or .txt)" | — |
| PDF timeout | "PDF generation timed out. Please try again." | Retry button |
| PDF server error | "Something went wrong. Please try again." | Retry button |
| Network error | "Connection lost. Please check your internet and try again." | Retry button |

#### Retry Behavior

```
┌─────────────────────────────────────────────┐
│  ❌ PDF generation failed                   │
│                                             │
│  Something went wrong. Please try again.   │
│                                             │
│  [ Try Again ]                              │
└─────────────────────────────────────────────┘
```

- Retry uses same content (no re-upload needed)
- Maximum 3 automatic retries for transient errors
- After 3 failures, show manual retry only

#### Acceptance Criteria

- [ ] User always knows when conversion is in progress
- [ ] Errors are human-readable (no technical jargon)
- [ ] Retry button appears for all recoverable errors
- [ ] Retry works without re-uploading file

---

## 7. UI/UX Specification

### 7.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (border-b, bg-white/80 backdrop-blur)                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ [md] Markdown Free                             About · Privacy [Feedback]│
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  HERO SECTION (text-center)                                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │            ● Free • No signup • Instant export                        │  │
│  │                                                                       │  │
│  │       Free Markdown to PDF, TXT & HTML Converter                      │  │
│  │                                                                       │  │
│  │   Upload or paste your .md file, preview it instantly, then export   │  │
│  │   to PDF, TXT or HTML. Free, private, secure — never stored.         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  UPLOAD CARD (max-w-4xl, centered)                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        ┌─────────────────┐                            │  │
│  │                        │   ↑ Upload Icon │  (emerald circle)          │  │
│  │                        └─────────────────┘                            │  │
│  │                                                                       │  │
│  │           Drag & drop your Markdown file  or  choose file            │  │
│  │                                                                       │  │
│  │           Supports .md, .markdown, .txt • Max 5 MB                   │  │
│  │                                                                       │  │
│  │                   ● No file selected yet                             │  │
│  │                                                                       │  │
│  │                  "Or paste Markdown instead"                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  PASTE AREA (hidden by default, revealed on click)                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  PASTED MARKDOWN                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Paste your Markdown here…                                       │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  Changes here will also be used when exporting to PDF, TXT or HTML.  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  EXPORT ROW (card with border, flex justify-between)                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [To PDF]  [To TXT]  [To HTML]     Files are processed temporarily...│  │
│  │  ▲primary  ▲secondary ▲secondary                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  PREVIEW CARD                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  PREVIEW                               ● Waiting for Markdown…        │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  ## How it works                                                     │  │
│  │  1. Upload a .md file or paste Markdown text.                        │  │
│  │  2. See the formatted preview right here.                            │  │
│  │  3. Click To PDF, To TXT, or To HTML to download...                  │  │
│  │                                                                       │  │
│  │  (max-height: 420px, overflow-y: auto)                               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  FOOTER                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  © 2025 Markdown Free.      No accounts • No tracking cookies • HTTPS │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Header

| Element | Specification |
|---------|---------------|
| Container | `border-b border-slate-200 bg-white/80 backdrop-blur`, max-w-6xl centered |
| Logo | Emerald square (rounded-xl) with "md" text + "Markdown Free" |
| Navigation | About, Privacy links (text-slate-600), Feedback button (rounded-full, border) |
| Mobile | Hide nav links, show hamburger menu |

### 7.3 Design Tokens

#### Typography

Uses Tailwind CSS default font stack (system fonts). No custom fonts required.

| Element | Tailwind Class | Spec |
|---------|----------------|------|
| Logo text | `text-base font-semibold tracking-tight` | 16px, weight 600 |
| Hero badge | `text-xs font-medium` | 12px, weight 500 |
| Headline | `text-3xl sm:text-4xl font-semibold tracking-tight` | 30px/36px, weight 600 |
| Subheadline | `text-sm sm:text-base text-slate-600` | 14px/16px, weight 400 |
| Body | `text-sm` | 14px |
| Button | `text-xs font-semibold` | 12px, weight 600 |
| Code | `font-mono text-xs` | Monospace, 12px |
| Labels | `text-xs font-medium uppercase tracking-wide` | 12px, uppercase |

#### Color Palette (Tailwind Slate + Emerald)

```css
/* Using Tailwind's built-in color classes */

/* Background */
--bg-page: slate-50           /* #F8FAFC - page background */
--bg-card: white              /* #FFFFFF - cards */
--bg-code-light: slate-100    /* #F1F5F9 - inline code */
--bg-code-dark: slate-950/90  /* rgba(2,6,23,0.9) - code blocks */

/* Text */
--text-primary: slate-900     /* #0F172A */
--text-secondary: slate-600   /* #475569 */
--text-muted: slate-500       /* #64748B */
--text-placeholder: slate-400 /* #94A3B8 */

/* Borders */
--border-default: slate-200   /* #E2E8F0 */
--border-light: slate-100     /* #F1F5F9 */

/* Primary Accent (Emerald) */
--accent-50: emerald-50       /* #ECFDF5 - hover backgrounds */
--accent-500: emerald-500     /* #10B981 - icons, indicators */
--accent-600: emerald-600     /* #059669 - primary buttons */
--accent-700: emerald-700     /* #047857 - hover state */

/* Semantic */
--success: emerald-500        /* #10B981 */
--error: red-400/500          /* #F87171 / #EF4444 */
```

#### Status Indicators

| Status | Dot Color | Background |
|--------|-----------|------------|
| Default/Waiting | `bg-slate-300` | — |
| Success/Ready | `bg-emerald-500` | — |
| Error | `bg-red-400` | — |
| Badge (hero) | `bg-emerald-500` dot | `bg-emerald-50 text-emerald-700` |

#### Spacing (Tailwind Scale)

| Use Case | Tailwind | Pixels |
|----------|----------|--------|
| Icon margins | `gap-2` | 8px |
| Card padding | `px-6 py-10` | 24px / 40px |
| Section gap | `gap-8` | 32px |
| Page padding | `px-4` | 16px |
| Max content width | `max-w-5xl` | 1024px |
| Upload card width | `max-w-4xl` | 896px |

#### Border Radius

| Element | Tailwind | Pixels |
|---------|----------|--------|
| Logo square | `rounded-xl` | 12px |
| Cards | `rounded-2xl` | 16px |
| Buttons | `rounded-full` | 9999px (pill) |
| Textarea | `rounded-lg` | 8px |
| Status dots | `rounded-full` | 9999px |

#### Shadows

| Element | Tailwind |
|---------|----------|
| Cards | `shadow-sm` |
| Code blocks | `shadow-inner` |

### 7.4 Component Specifications

#### Upload Card

```html
<!-- Tailwind classes from mockup -->
<div class="
  relative flex cursor-pointer flex-col items-center justify-center 
  rounded-2xl border-2 border-dashed border-slate-200 
  bg-white px-6 py-10 text-center shadow-sm 
  transition hover:border-emerald-400 hover:bg-emerald-50/40
">
  <!-- Upload icon in emerald circle -->
  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
    <svg><!-- upload arrow icon --></svg>
  </div>
  
  <!-- Main text -->
  <p class="text-sm font-medium text-slate-900">
    Drag & drop your Markdown file
    <span class="font-normal text-slate-500">or</span>
    <label class="cursor-pointer font-semibold text-emerald-600 hover:text-emerald-700">
      choose file
    </label>
  </p>
  
  <!-- Supported formats -->
  <p class="mt-2 text-xs text-slate-500">
    Supports .md, .markdown, .txt • Max 5 MB
  </p>
  
  <!-- Status indicator -->
  <div class="mt-4 flex items-center gap-2 text-xs text-slate-500">
    <span class="inline-flex h-1.5 w-1.5 rounded-full bg-slate-300"></span>
    <span>No file selected yet</span>
  </div>
  
  <!-- Paste toggle -->
  <button class="mt-5 text-xs font-medium text-emerald-700 underline-offset-4 hover:underline">
    Or paste Markdown instead
  </button>
</div>
```

**States:**
| State | Border | Background | Status Dot |
|-------|--------|------------|------------|
| Default | `border-slate-200` | `bg-white` | `bg-slate-300` |
| Hover | `border-emerald-400` | `bg-emerald-50/40` | — |
| Drag over | `border-emerald-400` | `bg-emerald-50/40` | — |
| File loaded | `border-slate-200` | `bg-white` | `bg-emerald-500` |
| Error | `border-slate-200` | `bg-white` | `bg-red-400` |

#### Paste Area

```html
<!-- Hidden by default, revealed on toggle click -->
<div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
  <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
    Pasted Markdown
  </label>
  <textarea class="
    h-40 w-full resize-y rounded-lg border border-slate-200 
    bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 
    outline-none ring-emerald-500/60 focus:bg-white focus:ring-1
  " placeholder="Paste your Markdown here…"></textarea>
  <p class="mt-2 text-[11px] text-slate-500">
    Changes here will also be used when exporting to PDF, TXT or HTML.
  </p>
</div>
```

#### Export Buttons Row

```html
<div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
  <div class="space-x-2">
    <!-- Primary: To PDF -->
    <button class="
      inline-flex items-center gap-1 rounded-full 
      bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm 
      transition hover:bg-emerald-700 
      disabled:cursor-not-allowed disabled:bg-slate-200
    ">To PDF</button>
    
    <!-- Secondary: To TXT -->
    <button class="
      inline-flex items-center gap-1 rounded-full 
      border border-slate-200 bg-slate-50 px-4 py-2 
      text-xs font-semibold text-slate-700 shadow-sm 
      transition hover:border-slate-300 hover:bg-white 
      disabled:cursor-not-allowed disabled:bg-slate-100
    ">To TXT</button>
    
    <!-- Secondary: To HTML -->
    <button class="...same as TXT...">To HTML</button>
  </div>
  
  <!-- Privacy notice -->
  <p class="text-[11px] text-slate-500">
    Files are processed temporarily for conversion and not stored.
  </p>
</div>
```

**Button States:**
| State | To PDF | To TXT / To HTML |
|-------|--------|------------------|
| Disabled | `bg-slate-200` | `bg-slate-100` |
| Ready | `bg-emerald-600 text-white` | `bg-slate-50 border-slate-200 text-slate-700` |
| Hover | `bg-emerald-700` | `bg-white border-slate-300` |
| Loading | Shows spinner, disabled | Shows spinner, disabled |

#### Preview Card

```html
<div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
  <!-- Header -->
  <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
    <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Preview
    </h2>
    <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
      <span class="inline-block h-1.5 w-1.5 rounded-full bg-slate-300"></span>
      Waiting for Markdown…
    </span>
  </div>
  
  <!-- Content -->
  <div class="max-h-[420px] overflow-auto px-5 py-4 text-sm leading-relaxed">
    <article class="prose prose-sm max-w-none 
      prose-headings:mt-4 prose-headings:mb-2 
      prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg 
      prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 
      prose-pre:bg-slate-950/90 prose-pre:text-slate-50 prose-pre:shadow-inner
    ">
      <!-- Rendered markdown content -->
    </article>
  </div>
</div>
```

**Preview Badge States:**
| State | Badge Style |
|-------|-------------|
| Waiting | `bg-slate-100 text-slate-600` + slate dot |
| Ready (file) | `bg-slate-100 text-slate-600` + emerald dot + "Ready to export (uploaded file)" |
| Ready (paste) | `bg-slate-100 text-slate-600` + emerald dot + "Ready to export (pasted text)" |

### 7.5 Hero Section

```html
<section class="text-center">
  <!-- Badge -->
  <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
    <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
    Free • No signup • Instant export
  </div>
  
  <!-- Headline (SEO-optimized H1) -->
  <h1 class="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
    Free Markdown to PDF, TXT &amp; HTML Converter
  </h1>
  
  <!-- Subheadline with privacy promise -->
  <p class="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
    Upload or paste your <code>.md</code> file, preview it instantly, then export to
    <span class="font-medium text-slate-800">PDF</span>,
    <span class="font-medium text-slate-800">TXT</span> or
    <span class="font-medium text-slate-800">HTML</span> in one click.
    Free, private and secure — your files are never stored.
  </p>
</section>
```

### 7.6 Footer

```html
<footer class="mt-4 flex flex-col items-center justify-between gap-2 text-[11px] text-slate-400 sm:flex-row">
  <p>© 2025 Markdown Free. Built for simple, fast, free exports.</p>
  <p>Privacy • No tracking cookies • HTTPS only</p>
</footer>
```

### 7.7 Responsive Breakpoints

| Breakpoint | Width | Tailwind | Layout Changes |
|------------|-------|----------|----------------|
| Mobile | < 640px | default | Single column, full-width, stacked elements |
| Small | ≥ 640px | `sm:` | Side-by-side footer, larger headline |
| Medium | ≥ 768px | `md:` | Show nav links in header |
| Desktop | ≥ 1024px | `lg:` | Max-width containers, generous whitespace |

#### Container Widths

| Element | Max Width | Tailwind |
|---------|-----------|----------|
| Header | 1152px | `max-w-6xl` |
| Main content | 1024px | `max-w-5xl` |
| Upload/Preview cards | 896px | `max-w-4xl` |

#### Mobile Specific

- Upload card: Full width with `px-4` page padding
- Export buttons: Stack vertically with `flex-wrap`
- Preview: Full width, `max-h-[420px]`
- Header nav: Hidden on mobile (`hidden md:flex`)
- Touch targets: Buttons have `py-2 px-4` (minimum 44px height)

### 7.8 Animations & Transitions

All interactive elements use `transition` class for smooth state changes.

| Element | Transition |
|---------|------------|
| Upload card border/bg | `transition` (150ms ease) |
| Buttons | `transition` (150ms ease) |
| Paste area reveal | CSS transition or JS toggle |

#### Drag Over State
Upload card adds `border-emerald-400 bg-emerald-50/40` classes on drag over.

---

## 8. API Specification

### 8.1 PDF Generation Endpoint

```
POST /api/convert/pdf
```

#### Request

```typescript
{
  markdown: string;      // Raw markdown content
  filename?: string;     // Original filename (optional)
}
```

#### Response (Success)

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
```

#### Response (Error)

```typescript
{
  error: string;         // Error code
  message: string;       // Human-readable message
}
```

#### Error Codes

| Code | HTTP Status | Message |
|------|-------------|---------|
| `CONTENT_TOO_LARGE` | 413 | Content exceeds maximum size |
| `INVALID_CONTENT` | 400 | Unable to parse markdown |
| `GENERATION_TIMEOUT` | 504 | PDF generation timed out |
| `GENERATION_FAILED` | 500 | PDF generation failed |

#### Rate Limiting

| Limit | Value |
|-------|-------|
| Requests per minute per IP | 10 |
| Max content size | 5 MB |
| Timeout | 30 seconds |

**Implementation:** IP-based rate limiting via Vercel Edge Middleware + Upstash Redis (free tier sufficient for MVP).

---

## 9. TypeScript Types

```typescript
// Input modes
export type InputMode = 'upload' | 'paste';

// File state
export interface LoadedContent {
  source: 'file' | 'paste';
  filename: string | null;
  content: string;
  size: number;
  loadedAt: Date;
}

// Conversion state
export type ConversionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ConversionState {
  pdf: ConversionStatus;
  html: ConversionStatus;
  txt: ConversionStatus;
}

export interface ConversionError {
  format: 'pdf' | 'html' | 'txt';
  code: string;
  message: string;
  retryable: boolean;
}

// App state
export interface AppState {
  inputMode: InputMode;
  content: LoadedContent | null;
  conversionState: ConversionState;
  error: ConversionError | null;
}

// Actions
export type AppAction =
  | { type: 'SET_INPUT_MODE'; mode: InputMode }
  | { type: 'LOAD_CONTENT'; content: LoadedContent }
  | { type: 'CLEAR_CONTENT' }
  | { type: 'START_CONVERSION'; format: 'pdf' | 'html' | 'txt' }
  | { type: 'CONVERSION_SUCCESS'; format: 'pdf' | 'html' | 'txt' }
  | { type: 'CONVERSION_ERROR'; error: ConversionError }
  | { type: 'CLEAR_ERROR' };
```

---

## 10. File Structure

```
/
├── tmp/
│   └── c.html                  # Reference mockup (open in browser)
├── docs/
│   └── spec.md                 # This specification
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout with header
    │   ├── page.tsx            # Main converter page
    │   ├── privacy/
    │   │   └── page.tsx        # Privacy policy
    │   ├── about/
    │   │   └── page.tsx        # About page
    │   └── api/
    │       └── convert/
    │           └── pdf/
    │               └── route.ts # PDF generation endpoint
    ├── components/
    │   ├── ui/                 # Shadcn components (if used)
    │   ├── header.tsx          # Site header with nav
    │   ├── hero.tsx            # Hero section with badge
    │   ├── upload-card.tsx     # Drag & drop component
    │   ├── paste-area.tsx      # Collapsible textarea
    │   ├── export-row.tsx      # Buttons + privacy notice
    │   ├── preview-card.tsx    # Preview with status badge
    │   └── footer.tsx          # Simple footer
    ├── lib/
    │   ├── markdown.ts         # Remark/rehype pipeline
    │   ├── export-html.ts      # HTML generation
    │   ├── export-txt.ts       # TXT download
    │   ├── download.ts         # File download utility
    │   └── utils.ts            # Shared utilities
    ├── hooks/
    │   ├── use-converter.ts    # Main state hook
    │   └── use-file-drop.ts    # Drag & drop hook
    ├── styles/
    │   └── globals.css         # Tailwind imports + custom styles
    └── types/
        └── index.ts            # TypeScript types
```

---

## 11. Acceptance Criteria Summary

### Must Have (MVP)

| ID | Criteria | Testable |
|----|----------|----------|
| AC-1 | User can drag-and-drop a .md file and see preview in < 2 seconds | ✅ |
| AC-2 | User can paste Markdown and see preview in < 1 second | ✅ |
| AC-3 | PDF exports complete in < 15 seconds for files under 1MB | ✅ |
| AC-4 | HTML and TXT download instantly (< 500ms) | ✅ |
| AC-5 | Files over 5MB show clear error before upload attempt | ✅ |
| AC-6 | Invalid file types show descriptive error message | ✅ |
| AC-7 | Failed conversions show retry button | ✅ |
| AC-8 | All buttons are disabled until content is loaded | ✅ |
| AC-9 | Mobile layout is fully functional (no horizontal scroll) | ✅ |
| AC-10 | Preview matches HTML export output | ✅ |

### Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Bundle Size (JS) | < 300KB gzipped |

---

## 12. Security & Privacy

### XSS Prevention

User-uploaded Markdown files may contain malicious content (e.g., `<script>` tags, `javascript:` links). The markdown pipeline **must** sanitize output:

```
remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify
```

The `rehype-sanitize` plugin uses GitHub's schema by default, which strips dangerous elements while preserving safe HTML.

### Data Handling

| Data | Handling |
|------|----------|
| Uploaded files | Processed in memory only, never written to disk |
| Pasted content | Stored in browser state only |
| PDF generation | Content sent to serverless function, discarded after response |
| Logs | No document content logged, only error codes |

### Privacy Notice (Footer)

> 🔒 **Your files stay private.** Content is processed temporarily for conversion and never stored on our servers.

### Privacy Page Content

- No accounts or tracking cookies
- Files processed in memory only
- PDF generation uses temporary serverless compute
- No document content in logs
- Privacy-first analytics (cookieless, aggregated data only)

---

## 13. User Analytics

### Overview

Privacy-friendly, cookieless analytics using **Umami Cloud** (Hobby plan - free tier). Track basic usage for product decisions without collecting personal data or file contents.

### Tool Selection: Umami Cloud

| Feature | Details |
|---------|---------|
| Plan | Hobby (Free) |
| Events | Up to 100,000/month |
| Websites | Up to 3 |
| Data Retention | 6 months |
| Privacy | Cookieless, GDPR/CCPA compliant, no PII |

### Privacy Principles

**Never Send:**
- File names or content
- Email addresses, IPs, or user IDs
- Any Markdown text or document data

**Only Send:**
- Event names (short strings)
- Non-identifying properties: export format (`pdf`, `txt`, `html`), source (`file`, `paste`)

**Respect DNT:**
- Enable `data-do-not-track="true"` to honor browser Do Not Track setting

### Event Schema

| Event | Trigger | Properties |
|-------|---------|------------|
| `upload_start` | User drops/selects file or starts paste conversion | `source`: `file` \| `paste` |
| `upload_error` | Upload rejected before conversion | `source`, `reason`: `invalid_type` \| `too_large` \| `parse_error` |
| `convert_success` | Conversion completes, download initiated | `format`: `pdf` \| `txt` \| `html`, `source` |
| `convert_error` | Conversion fails | `format`, `error_code`: `pdf_timeout` \| `pdf_server_error` \| `unknown` |

### Integration Architecture

**Environment Variables:**
```
NEXT_PUBLIC_UMAMI_HOST=https://cloud.umami.is
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<your-website-id>
```

**Script Integration (layout.tsx):**
```tsx
import Script from "next/script";

// In body (not head) with afterInteractive strategy
{host && websiteId && (
  <Script
    src={`${host}/script.js`}
    data-website-id={websiteId}
    data-domains="www.markdown.free"
    data-do-not-track="true"
    strategy="afterInteractive"
  />
)}
```

**Event Tracking Utility:**
```typescript
// src/lib/analytics.ts
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string>) => void;
    };
  }
}

export function trackEvent(eventName: string, data?: Record<string, string>) {
  if (typeof window !== "undefined" && window.umami?.track) {
    window.umami.track(eventName, data);
  }
}
```

### Messaging Updates

**Footer:**
- Change from: "No tracking"
- Change to: "No tracking cookies"

**Privacy Page:**
Add section:
> **Analytics**
>
> We use Umami Cloud, a privacy-focused, cookieless analytics platform. It helps us understand how many people use Markdown Free and which features are most useful.
>
> Umami does not use cookies and does not collect personal information. We only see aggregated data like page views and counts of successful conversions. We do not send your Markdown content, file names, or any text you paste to our analytics provider.

### Key Metrics

| Category | Metrics |
|----------|---------|
| Traffic | Daily/weekly pageviews, unique visitors, top referrers |
| Conversion | Success count by format (PDF/TXT/HTML), error rate by format |
| Behavior | File vs paste usage ratio |

---

## 15. Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Project setup (Next.js, Tailwind, Shadcn)
- [ ] Upload card component with drag-and-drop
- [ ] Paste mode component
- [ ] App state management
- [ ] Basic file validation (type, size)

### Phase 2: Core Features (Week 2)

- [ ] Markdown preview with remark/rehype
- [ ] HTML export (client-side)
- [ ] TXT export (client-side)
- [ ] Export button states and UX

### Phase 3: PDF & Polish (Week 3)

- [ ] PDF generation API route
- [ ] Puppeteer integration with @sparticuz/chromium
- [ ] Progress indicators
- [ ] Error handling with retry
- [ ] Mobile responsiveness

### Phase 4: Launch Prep (Week 4)

- [ ] Privacy and About pages
- [ ] SEO meta tags
- [ ] Analytics integration
- [ ] Performance optimization
- [ ] Testing and bug fixes

---

## 16. Success Metrics

### Launch Criteria

| Metric | Target |
|--------|--------|
| All AC items passing | 100% |
| Lighthouse score | > 90 |
| Mobile usability | No issues |
| PDF generation success rate | > 95% |

### Post-Launch KPIs

| Metric | Measurement |
|--------|-------------|
| Unique visitors / week | Analytics |
| Conversion completion rate | Started vs completed exports |
| Error rate | Failed conversions / total attempts |
| Format popularity | % split between PDF/HTML/TXT |

---

## Appendix A: Sample Test Files

Create these files for testing:

1. **simple.md** - Basic headings and paragraphs (< 1KB)
2. **complex.md** - All Markdown elements (tables, code, images) (~10KB)
3. **large.md** - Long document (~1MB)
4. **edge-case.md** - Unicode, emojis, special characters
5. **malformed.md** - Invalid UTF-8 bytes

---

## Appendix B: Competitor Reference

| Tool | Strengths | Weaknesses |
|------|-----------|------------|
| Dillinger | Full editor, export options | Complex UI, requires learning |
| StackEdit | Powerful, sync options | Too many features |
| Markdown Preview Plus (Chrome) | Simple preview | No export, extension only |
| Pandoc | Universal converter | CLI only, not for non-technical |

**Our differentiation:** Single-purpose tool, zero learning curve, instant results.

---

## Appendix C: Reference Mockup

The approved UI mockup is located at `tmp/c.html`. Open in any browser to view.

### Key Design Decisions from Mockup

| Decision | Implementation |
|----------|----------------|
| **Color scheme** | Emerald (green) accent on slate gray base |
| **Primary button** | "To PDF" is emerald filled; TXT/HTML are outlined |
| **Card style** | `rounded-2xl border shadow-sm` on white background |
| **Paste mode** | Separate card below upload (not replacing it) |
| **Status indicators** | Small colored dots (1.5×1.5 rounded-full) |
| **Typography** | System fonts via Tailwind defaults, no custom fonts |
| **Privacy notice** | Inline with export buttons (right side of row) |
| **Preview default** | Shows "How it works" instructions |
| **Header backdrop** | `bg-white/80 backdrop-blur` for subtle transparency |
| **Feedback button** | Rounded pill button in header nav |

### Mockup vs Implementation Notes

The mockup uses CDN Tailwind for rapid prototyping. The production build will:
- Use Tailwind via PostCSS for optimized builds
- Add proper React components with state management
- Implement actual file reading and conversion logic
- Add loading states and error handling not shown in static mockup

