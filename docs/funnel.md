# Markdown Free — Funnel Analysis

> **Analysis Date:** January 3, 2026  
> **Data Period:** December 12, 2025 – January 3, 2026  
> **Source:** Umami Cloud session reports

---

## Executive Summary

Analysis of 12 user sessions revealed **zero conversions** (no completed exports). The primary issues identified are:

1. **No Google indexing** — Site was not discoverable via search
2. **High bounce rate** — 58% of sessions were single pageviews
3. **No upload attempts** — Users viewed but didn't interact with the tool
4. **Bot traffic** — Significant portion of traffic from data center IPs

---

## Traffic Breakdown

### By Source
| Source | Sessions | % | Real Users? |
|--------|----------|---|-------------|
| Bots/Crawlers (Falkenstein, etc.) | ~7 | 58% | ❌ No |
| Direct traffic | ~4 | 33% | ⚠️ Maybe |
| Organic search | ~1 | 8% | ✅ Yes |

### By Device
| Device | Sessions | % |
|--------|----------|---|
| Mobile | 7 | 58% |
| Tablet | 2 | 17% |
| Laptop | 3 | 25% |

### By Geography
| Country | Sessions |
|---------|----------|
| United States | 6 |
| Canada | 2 |
| Saudi Arabia | 2 (1 returning user) |
| Mexico | 1 |

---

## Funnel Analysis

### Conversion Funnel

```
Pageview (12 sessions)
    │
    ├── Bounced immediately (7) ──────────────► 58% drop-off
    │
    ▼
Engaged (5 sessions)
    │
    ├── Viewed sections only (5)
    │
    ▼
Tried Upload (0 sessions) ──────────────────► 100% drop-off
    │
    ▼
Converted (0 sessions)
```

### Session Categories

| Category | Sessions | % |
|----------|----------|---|
| 🚪 Bounced (pageview only) | 7 | 58% |
| 👁️ Viewed sections | 3 | 25% |
| 📜 Engaged (time on page) | 2 | 17% |
| 📤 Tried upload | 0 | 0% |
| ✅ Converted | 0 | 0% |

---

## Key Findings

### 1. Site Not Indexed on Google

**Evidence:** `site:markdown.free` returned zero results on Google.

**Impact:** No organic search traffic. Users can only find the site via:
- Direct URL entry
- Referral links (none detected)
- Bookmarks

**Resolution:** 
- ✅ Added site to Google Search Console (Jan 3, 2026)
- ✅ Submitted sitemap.xml
- ⏳ Awaiting Google crawl (expected 3-7 days)

### 2. Bot Traffic from Data Centers

**Evidence:** Multiple sessions from Falkenstein, Germany (Hetzner data center).

**Characteristics:**
- Rapid section_visible events (within 1 second)
- No time_on_page events
- No referrer data

**Impact:** Inflates traffic metrics, skews analysis.

**Resolution:** Bot filtering already implemented in `umami-sessions.mjs` script.

### 3. Zero Upload Attempts

**Evidence:** No `upload_start`, `upload_error`, or `paste_toggle_click` events.

**Possible Causes:**
1. Users don't have a markdown file handy
2. Mobile upload friction (58% mobile traffic)
3. Value proposition not clear enough
4. Users are "window shopping" without intent

**Resolution:**
- ✅ Added "Try sample file" feature (Jan 3, 2026)
- Allows users to test converter without their own file
- Tracks via `sample_click` event

### 4. Returning Users Without Conversion

**Evidence:** 
- Saudi Arabia user: 3 visits over 11 days, no conversion
- Burnaby, Canada user: 3 visits over 6 days, no conversion

**Possible Causes:**
- Bookmarked for later use
- Evaluating the tool
- Waiting for a specific need

---

## Referrer Analysis

### Current State
| Referrer | Visitors |
|----------|----------|
| markdown.free (internal) | 1 |
| (empty/direct) | 11 |

**Insight:** 100% of external traffic has no referrer, indicating:
- Direct traffic (typed URL)
- Browsers stripping referrer headers
- No external link sources yet

---

## Recommendations

### Immediate Actions (Completed ✅)

| Action | Status | Expected Impact |
|--------|--------|-----------------|
| Submit to Google Search Console | ✅ Done | Enable organic discovery |
| Add "Try sample file" button | ✅ Done | Reduce friction for first-time users |
| Implement multi-language support (IT/ES) | ✅ Done | Expand SEO reach to Italian/Spanish markets |

### Short-term Actions (1-2 weeks)

| Action | Priority | Expected Impact |
|--------|----------|-----------------|
| Monitor Google indexing | 🔴 High | Verify pages are being crawled |
| Track sample_click vs conversion | 🔴 High | Measure sample file effectiveness |
| Test mobile upload UX | 🟡 Medium | Identify friction points |

### Medium-term Actions (1 month)

| Action | Priority | Expected Impact |
|--------|----------|-----------------|
| A/B test headline copy | 🟡 Medium | Improve value proposition clarity |
| Add use-case prompts | 🟡 Medium | Help users understand when to use tool |
| Consider blog/content marketing | 🟢 Low | Build organic traffic |

---

## Metrics to Track

### Primary KPIs
| Metric | Current | Target |
|--------|---------|--------|
| Weekly conversions | 0 | 10+ |
| Conversion rate (upload → export) | N/A | >50% |
| Sample file → export rate | N/A | >30% |

### Secondary KPIs
| Metric | Current | Target |
|--------|---------|--------|
| Organic search sessions | 0 | 100+/week |
| Bounce rate | 58% | <40% |
| Upload attempt rate | 0% | >20% |

---

## Next Analysis

Schedule next funnel analysis for:
- **Date:** January 17, 2026 (2 weeks post-Google indexing)
- **Focus:** Measure impact of Google indexing and sample file feature

