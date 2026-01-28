# Security Defence Documentation

This document captures all security hardening measures implemented for Markdown Free, a web-based Markdown viewer and converter.

**Last Updated:** January 2026

---

## Table of Contents

1. [SSRF Protection](#1-ssrf-protection)
2. [DOCX Generation Hardening](#2-docx-generation-hardening)
3. [Content Security Policy (CSP)](#3-content-security-policy-csp)
4. [Input Validation & Size Limits](#4-input-validation--size-limits)
5. [XSS Prevention](#5-xss-prevention)
6. [Rate Limiting](#6-rate-limiting)
7. [Future Enhancements](#7-future-enhancements)

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

### Existing Protection

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
