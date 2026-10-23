# Security Defence Documentation

This document captures all security hardening measures implemented for Markdown Free, a web-based Markdown viewer and converter.

**Last Updated:** September 2026 (see [section 8](#8-september-2026-review) for the latest review)

---

## Table of Contents

1. [SSRF Protection](#1-ssrf-protection)
2. [DOCX Generation Hardening](#2-docx-generation-hardening)
3. [Content Security Policy (CSP)](#3-content-security-policy-csp)
4. [Input Validation & Size Limits](#4-input-validation--size-limits)
5. [XSS Prevention](#5-xss-prevention)
6. [Rate Limiting](#6-rate-limiting)
7. [Future Enhancements](#7-future-enhancements)
8. [September 2026 Review](#8-september-2026-review)

---

## 1. SSRF Protection

### Problem
Server-Side Request Forgery (SSRF) attacks could be attempted through malicious image URLs embedded in Markdown content. During PDF/DOCX generation, the server would fetch these URLs, potentially:
- Accessing internal services (localhost, 127.0.0.1, internal IPs)
- Reading cloud metadata endpoints (169.254.169.254)
- Probing internal network infrastructure
- DNS rebinding attacks

### Solution

#### Image Proxy System (`src/lib/image-proxy.ts`)

All external images in Markdown are processed through a secure proxy that:

1. **URL Validation**
   - Blocks private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
   - Blocks localhost variants (127.0.0.1, ::1, localhost)
   - Blocks cloud metadata IPs (169.254.169.254)
   - Blocks link-local addresses (169.254.x.x)
   - Blocks loopback range (127.0.0.0/8)

2. **DNS Rebinding Prevention**
   - Resolves hostnames to IP addresses before fetching
   - Validates resolved IPs against blocklist
   - Prevents TOCTOU (time-of-check-time-of-use) attacks

3. **Protocol Restrictions**
   - Only allows `http://` and `https://` protocols
   - Blocks `file://`, `ftp://`, `data:` (except for already-embedded images)
   - Blocks `javascript:`, `vbscript:`, and other dangerous protocols

4. **IP Obfuscation Detection**
   - Detects decimal IP notation (e.g., `http://2130706433` = 127.0.0.1)
   - Detects octal IP notation (e.g., `http://0177.0.0.1`)
   - Detects hex IP notation (e.g., `http://0x7f.0.0.1`)

5. **Redirect Validation**
   - Follows redirects but validates each hop
   - Prevents redirect-based SSRF (external URL redirecting to internal)
   - Maximum redirect limit enforced

6. **Magic Number Validation**
   - Validates actual file content matches claimed image type
   - Prevents non-image content from being processed
   - Supported formats: JPEG, PNG, GIF, WebP, BMP, ICO, SVG

#### Files Modified
- `src/lib/image-proxy.ts` - Core proxy implementation
- `src/app/api/convert/pdf/route.ts` - PDF generation with proxy
- `src/app/api/convert/docx/route.ts` - DOCX generation with proxy

---

## 2. DOCX Generation Hardening

### Problem
The `html-to-docx` library is fragile and crashes on various HTML structures:
- Malformed `<img>` tags (missing src attribute)
- HTML comments
- Empty elements
- External image URLs it cannot fetch

The `rehype-sanitize` library strips dangerous protocols (like `file://`) from URLs, leaving malformed tags like `<img alt="text">` with no `src` attribute, which crashes html-to-docx.

### Solution

#### Multi-Stage HTML Sanitization (`src/app/api/convert/docx/route.ts`)

**Pipeline:** Markdown → HTML → Image Proxy → Replace Non-Embedded → Sanitize → DOCX

1. **`replaceNonEmbeddedImages()`**
   - Replaces external image URLs with `<em>[Image not available]</em>`
   - Handles malformed img tags (no src attribute) from sanitization
   - Preserves valid `data:image/` URIs (already embedded)

   ```typescript
   // Handles: <img src="http://external.com/image.jpg">
   // Handles: <img alt="text"> (malformed, no src from sanitization)
   ```

2. **`sanitizeHtmlForDocx()`**
   - Removes HTML comments (`<!-- -->`)
   - Removes empty paragraphs, spans, divs
   - Normalizes whitespace

3. **Console Polyfill**
   - html-to-docx uses `console.warning` (non-standard)
   - Polyfill maps it to `console.warn`

#### Files Modified
- `src/app/api/convert/docx/route.ts`

---

## 3. Content Security Policy (CSP)

### Changes Made

#### Removed `unsafe-eval`
- **Before:** `script-src 'self' 'unsafe-inline' 'unsafe-eval' ...`
- **After:** `script-src 'self' 'unsafe-inline' ...`

This prevents:
- `eval()` execution
- `Function()` constructor abuse
- `setTimeout/setInterval` with string arguments

#### Files Modified
- `next.config.js` - CSP header configuration
- `vercel.json` - Production CSP headers

---

## 4. Input Validation & Size Limits

### Client-Server Synchronization

Both client and server enforce the same limits to provide "fail fast" UX:

| Limit | Client | Server | Purpose |
|-------|--------|--------|---------|
| Max file size | 1MB | 1MB | Prevent DoS, memory exhaustion |
| Supported formats | .md, .markdown, .txt | .md, .markdown, .txt | Limit attack surface |

### Implementation

#### Client-Side (`src/lib/utils.ts`)
```typescript
export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
```

#### Server-Side (API routes)
```typescript
const MAX_CONTENT_SIZE = 1 * 1024 * 1024; // 1MB
```

#### Paste Area Truncation (`src/components/paste-area.tsx`)
- Binary search algorithm to truncate at exact byte boundary
- Handles UTF-8 multi-byte characters correctly
- Visual warning when content is truncated

### Files Modified
- `src/lib/utils.ts`
- `src/components/upload-card.tsx`
- `src/components/paste-area.tsx`
- `src/app/api/convert/pdf/route.ts`
- `src/app/api/convert/docx/route.ts`
- All i18n dictionaries (updated error messages)

---

## 5. XSS Prevention

### Primary Protection: rehype-sanitize

The Markdown processing pipeline uses `rehype-sanitize` with GitHub's schema:

```typescript
// src/lib/markdown.ts
.use(rehypeSanitize, defaultSchema)
```

This prevents:
- Script injection (`<script>` tags)
- Event handlers (`onclick`, `onerror`, etc.)
- Dangerous protocols (`javascript:`, `vbscript:`, `file:`)
- Data exfiltration via img/iframe src

### Secondary Protection: URL Pattern Blocking

PDF generation includes regex-based URL sanitization as a defense-in-depth measure:

```typescript
// src/app/api/convert/pdf/route.ts
const DANGEROUS_URL_PATTERNS = [
  /href\s*=\s*["']?\s*javascript:/gi,
  /href\s*=\s*["']?\s*vbscript:/gi,
  /href\s*=\s*["']?\s*file:/gi,
  /href\s*=\s*["']?\s*ftp:/gi,
  /href\s*=\s*["']?\s*data:/gi,
  /src\s*=\s*["']?\s*javascript:/gi,
  /src\s*=\s*["']?\s*vbscript:/gi,
  /src\s*=\s*["']?\s*file:/gi,
  /src\s*=\s*["']data:(?!image\/)/gi, // Allow only data:image/*
];
```

### Design Decision: No DOMPurify

We intentionally avoid `isomorphic-dompurify` due to:
- **Dependency bloat**: Requires `jsdom` (~45 packages)
- **ESM compatibility issues**: `jsdom@27` uses ESM-only dependencies that break on Vercel serverless
- **Redundancy**: `rehype-sanitize` with GitHub's schema provides equivalent protection

The combination of `rehype-sanitize` + regex URL blocking provides robust XSS protection without the operational complexity.

### Additional Measures
- HTML export includes sanitized content only
- PDF/DOCX generated from sanitized HTML
- No user content rendered without sanitization

---

## 6. Rate Limiting

### Current State

Rate limiting is documented but has architectural limitations on Vercel:

#### Middleware Approach (`src/middleware.ts`)
- In-memory rate limiting attempted
- **Limitation:** Vercel's distributed architecture means each edge node has separate memory
- Requests may be served by different nodes, bypassing limits

### Documented Limitations
- No persistent storage for rate limit counters
- Edge functions are stateless
- Current implementation provides minimal protection

---

## 7. Future Enhancements

### High Priority

#### 7.1 Redis-Based Rate Limiting
**Problem:** Current in-memory rate limiting is ineffective on distributed infrastructure.

**Solution:** Implement Redis (Upstash) for centralized rate limit tracking:
```typescript
// Example with Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per minute
});
```

**Files to modify:**
- `src/middleware.ts`
- Add `@upstash/ratelimit` and `@upstash/redis` dependencies

#### 7.2 Subresource Integrity (SRI)
Add integrity hashes for any external scripts:
```html
<script src="..." integrity="sha384-..." crossorigin="anonymous">
```

#### 7.3 Additional Security Headers
Consider adding:
- `Permissions-Policy` - Disable unnecessary browser features
- `Cross-Origin-Embedder-Policy` - Prevent cross-origin resource loading
- `Cross-Origin-Opener-Policy` - Isolate browsing context

### Medium Priority

#### 7.4 API Authentication
For high-volume users or API access:
- API key authentication
- Usage quotas per key
- Abuse detection

#### 7.5 Content Analysis
Machine learning-based detection of:
- Malicious payloads in Markdown
- Encoded attack vectors
- Unusual patterns

#### 7.6 Audit Logging
Log security-relevant events:
- Blocked SSRF attempts
- Rate limit violations
- Malformed input patterns
- Failed conversions

### Low Priority

#### 7.7 Web Application Firewall (WAF)
Consider Vercel's WAF or Cloudflare for:
- DDoS protection
- Bot detection
- Geographic restrictions

#### 7.8 Bug Bounty Program
Once security measures mature:
- Establish responsible disclosure policy
- Consider bug bounty platform integration

---

## 8. September 2026 Review

A code review of every API route, the Supabase schema and the client pipeline (2026-09-30, branch `security-2026-09`). Each fix below has a regression test: the "Hardening" groups in `e2e/security.spec.ts` and the new cases in `e2e/img-proxy.spec.ts`.

### Fixed

| Finding | Severity | Fix |
|---|---|---|
| A 59-byte Markdown file crashed the DOCX route. html-to-docx sizes images with a bundled copy of `image-size`, which picks its parser from the bytes; its ICNS parser loops forever on a zero-length entry, so `![x](data:image/png;base64,<ICNS bytes>)` blocked the event loop until the heap ran out. npm can't patch a bundled copy. | High | `dataImageMatchesType` in the DOCX route: a data image reaches html-to-docx only when its bytes match its declared type (PNG, JPEG, GIF, WebP signatures; SVG must start with markup). |
| The image proxy read bodies without a byte cap or timeout. Content-Length counts compressed bytes, so a 300 KB gzip body inflated to 300 MB (1 GB peak memory); a server that dripped its body held the request past the 5 s timeout. | High | `readCappedBody`: streams the body, stops at 2 MB of decompressed bytes and after 5 s. The proxy also sends `Accept-Encoding: identity`. A real 299 KB bomb now costs 6 MB. |
| The DOCX list-paragraph join re-ran a regex until nothing changed: quadratic in the paragraphs of one list item (40,000 paragraphs: 9.8 s of blocked CPU; a 1 MB file: minutes). | Medium | One pass, same output (2 ms on the same input). |
| KaTeX output is ~100× its source. 300 KB of `$x^2$` became 38 MB of HTML and a 1.4 GB heap before the PDF route's 10 MB rendered-size check ran. | Medium | Server renders count formulas before KaTeX runs and stop past 5,000 (`MAX_SERVER_FORMULAS`, `serverProcessor` in `src/lib/markdown.ts`): 413 `CONTENT_TOO_LARGE`. The browser pipeline has no limit. |
| `/api/img-proxy` worked as an image proxy for any site through a plain `<img src>`, which needs no CORS. | Low–medium | The route answers 403 `CROSS_SITE` when `Sec-Fetch-Site` is present and not `same-origin` or `none`. |
| The SSRF blocklist used string patterns and missed `::ffff:0.0.0.0`, `fc12::1`, `fe90::1`, NAT64, 6to4, `198.18.0.0/15` and `[::127.0.0.1]`. | Low | `node:net` `BlockList` with subnet ranges from the IANA special-purpose registries; anything that doesn't parse as an IP is blocked. |
| A Chromium launch that finished after the launch timeout was never closed. | Low | The late browser is closed. |
| The rate limiter keyed IPv6 clients by full address; a client rotating through its /64 got a fresh budget each time. | Low | IPv6 addresses count per /64. |
| The Referer fallback in the origin check used a prefix match (`https://markdown.free.evil.com` passed). | Low | Whole-origin comparison. |
| `/api/feedback` parsed any body size and put the user-supplied `format` into the mail subject with CR/LF intact. | Low (inert while Resend is unconfigured) | 32 KB body cap; control characters stripped from single-line fields. |
| `vercel.json` is gitignored (the Vercel settings live in the dashboard), so its `Cross-Origin-Opener-Policy` never reached production. | Hardening | COOP moved into `next.config.js`. |
| `script-src` needs `'unsafe-inline'` for Next's inline scripts. | Hardening | `script-src-attr 'none'` blocks `on*="…"` attributes, the usual XSS payload; no page uses them. |
| `.gitignore` listed five env files; `.env.production` and `.env.development` were not covered. | Hardening | `.env*`. |
| Dependencies: next 15.5.23 (critical advisory: RCE in image optimization with AVIF), sharp, undici, dompurify, ip-address. | Critical → patched | next 15.5.27, sharp 0.35.5, undici 7.30.0, dompurify 3.4.16, ip-address 10.7.2. |

### Checked and fine

- Supabase: RLS on every table, no table grants to `anon`/`authenticated`, RPCs `security invoker` with a pinned `search_path`, EXECUTE for `service_role` only, SQL length and enum checks. The publishable key reads nothing.
- No server secret is `NEXT_PUBLIC_*`; the client bundle holds no Supabase URL or key; error bodies are fixed strings.
- XSS: no raw HTML, GitHub sanitize schema, KaTeX `trust: false`, Mermaid `securityLevel: "strict"` rendered into `<img>` only, every `innerHTML` sink takes sanitized output.
- PDF page: JavaScript off, request interception allows data URIs and Google Fonts only, offline before printing.
- Encoded or alternate API paths (`/api/vote%73`) return 404, so they can't reach a handler around its rate limit.

### Open

- **Rate limits are per instance.** Votes, ideas and signups can still be stuffed by a script that spreads requests across IPs or instances, and `elapsedMs` is client-reported. Options: a Vercel Firewall rate-limit rule, Upstash (7.1), or an HMAC-signed issue time. Meanwhile, compare `npm run db:check` totals with the `vote_saved` analytics count: scripted votes don't fire analytics.
- **A repeat signup clears `unsubscribed_at`** (`notify_signup` RPC), and anyone can sign up any address. Fix before the first launch email: never clear it from the public path, and confirm addresses (double opt-in).
- **Defence in depth for html-to-docx:** run it in a `worker_thread` with `resourceLimits` and terminate on timeout, so an unknown parser bug can't take the instance down.
- ~~**Puppeteer major upgrade**~~ Done in October, with Chromium 141 → 153 (§9).

---

## 9. October 2026 Patches

Advisories published 2026-10-20 → 22, patched 2026-10-23 (branches `security-2026-10`, then `chromium-upgrade` on top). `npm audit`: 28 → 10, critical 2 → 0, high 16 → 1.

### Patched

| Advisory | Severity | Reachable here? | Fix |
|---|---|---|---|
| Next.js GHSA-2464-fhr4-w9xw: RCE in the image optimizer through `sharp` on glibc Linux | Critical | No: no `next/image`, and `sharp` was already 0.35.5 | next 15.5.28 |
| Next.js GHSA-p3m5-59mp-jv5r: CPU exhaustion through Server Actions | High | No: the app has no Server Actions | next 15.5.28 |
| DOMPurify GHSA-cg2g-xh64-v4q7, GHSA-mrv2-3pqr-j5jr: `SAFE_FOR_TEMPLATES` and `IN_PLACE` hook bypasses | Critical, high | No: Mermaid runs in `strict` mode and renders into `<img>` | dompurify 3.4.17 |
| follow-redirects GHSA-q3jh-wrc6-jgq8: credential headers survive a cross-host redirect | High | No: the Chromium download sends no credentials | follow-redirects 1.16.1 |
| undici GHSA-4qv8-2p9j-2685, GHSA-f72v-6w45-q472: EventSource memory, SRI bypass | Moderate | No: the image proxy uses `fetch` only | undici 7.30.1 |
| Puppeteer 23 chain: `extract-zip`, `chromium-bidi`, `zod`, `basic-ftp`, proxy agents | High | No: browser downloads and WebDriver BiDi; the route uses neither (CDP, Sparticuz's binary) | puppeteer-core 25.16 |
| Chromium 141 in the PDF route | Hardening | Yes, in principle: it runs `--no-sandbox --single-process` with the function's environment, and user images reach its decoders as data URIs (JavaScript is off while the page parses, and the network allows Google Fonts only) | Chromium 153 (`@sparticuz/chromium-min` 153, `headless: "shell"`) |

Removing secrets from Chromium's environment would not replace the upgrade: a process running as the same user can read its parent's `/proc/<pid>/environ`.

### How the upgrade was checked

- Full e2e suite on a production build (local PDFs use full Puppeteer 25 and Chrome 156).
- The Sparticuz pack in the AWS Lambda Node 24 image (Amazon Linux 2023, like Vercel's Node 24 runtime), from only the files Next traces for the PDF route: Chromium 153 launches, the PDF's producer reads `Skia/PDF m153`, external images stay blocked, and an inline handler doesn't run. Both pack sources work: the local pack and the GitHub release URL.
- Previews now download the GitHub release that matches `@sparticuz/chromium-min`; before, they took production's pack from `www.markdown.free`, so a preview could never test a new Chromium. `e2e/security.spec.ts` fails if the release URL and the installed version drift apart.
- After a deploy, a real PDF's `Producer` field names the Chromium that rendered it.

### Left

- **image-size** (high): the copy npm flags is never loaded; html-to-docx runs its own bundled copy, which has no HEIF or JXL parser (its ICNS loop is gated, §8).
- **KaTeX GHSA-238p-pmpm-9mq7** (low): needs an existing prototype pollution; the fix (0.18.2) is outside the range `rehype-katex` and Mermaid accept.
- **Tailwind 3's `postcss-selector-parser`** (moderate): build time only, on our own CSS.

---

## Testing

Security tests are located in `e2e/security.spec.ts`:

```bash
# Run all security tests
npm run test -- e2e/security.spec.ts

# Run specific test group
npm run test -- -g "SSRF Protection"
npm run test -- -g "DOCX SSRF Protection"
```

### Test Coverage
- SSRF payload handling (PDF & DOCX)
- Localhost/internal IP blocking
- File protocol blocking
- IP obfuscation detection
- Size limit enforcement
- Normal content processing

---

## References

- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [rehype-sanitize documentation](https://github.com/rehypejs/rehype-sanitize)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
