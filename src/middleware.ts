import { NextRequest, NextResponse } from "next/server";

/**
 * Security Middleware
 *
 * Implements:
 * 1. Origin validation for API routes (prevent CSRF and API theft)
 * 2. Simple rate limiting for PDF API (prevent DoS and cost attacks)
 *
 * ⚠️ RATE LIMITING LIMITATION - CASUAL DETERRENT ONLY ⚠️
 *
 * This rate limiting is implemented using in-memory storage in Vercel Edge Middleware.
 * Due to Vercel's distributed, ephemeral architecture, this provides LIMITED protection:
 *
 * 1. Cold Start Reset: Each serverless cold start resets the rate limit counters
 * 2. Distributed Instances: Each Vercel edge instance has its own separate memory
 *    - If Vercel scales to 10 instances, an attacker effectively gets 10x the limit
 *    - Requests from different geographic locations may hit different instances
 * 3. Not Shared: There is no global counter across instances
 *
 * This provides:
 * ✓ Basic deterrent against casual abuse (accidental refresh loops, simple scripts)
 * ✓ Per-instance burst protection
 * ✗ NOT a hard security boundary against determined attackers
 * ✗ NOT protection against distributed attacks
 *
 * For production-grade rate limiting with global enforcement, upgrade to:
 * - Vercel KV (Redis): https://vercel.com/docs/storage/vercel-kv
 * - Upstash Redis: https://upstash.com/
 * - Cloudflare Rate Limiting (if using CF in front)
 */

// Configuration
// In development/test, use higher limits to avoid blocking parallel tests
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: IS_PRODUCTION ? 15 : 100, // 15/min in prod, 100/min in dev/test
};

// Allowed origins for API requests
const ALLOWED_ORIGINS = [
  "https://www.markdown.free",
  "https://markdown.free",
  "http://localhost:3000",
  "http://localhost:3001",
];

// In-memory rate limit storage
// Note: This resets on serverless cold starts. For persistent rate limiting,
// use @vercel/kv or Upstash Redis.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => rateLimitMap.delete(key));
}

/**
 * Check rate limit for an IP
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }

  if (entry.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - entry.count };
}

/**
 * Validate request origin
 */
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Allow requests with no origin (same-origin requests, curl, etc.)
  if (!origin) {
    // Check referer as backup for same-origin validation
    if (referer) {
      return ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed));
    }
    // Allow requests without origin/referer (curl, direct API calls in dev)
    // In production, you may want to be stricter
    return process.env.NODE_ENV !== "production";
  }

  return ALLOWED_ORIGINS.includes(origin);
}

export function middleware(request: NextRequest) {
  // Only apply security checks to API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip OPTIONS requests (CORS preflight)
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  // Origin validation for POST requests to sensitive APIs
  if (request.method === "POST") {
    if (!validateOrigin(request)) {
      console.log(
        `[Security] Blocked request from unauthorized origin: ${request.headers.get("origin")}`
      );
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Unauthorized origin" },
        { status: 403 }
      );
    }
  }

  // Rate limiting for PDF API
  if (request.nextUrl.pathname === "/api/convert/pdf") {
    // Clean up expired entries periodically (every ~100 requests)
    if (Math.random() < 0.01) {
      cleanupRateLimits();
    }

    // Get client IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      console.log(`[Security] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Too many requests. Please wait a minute before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": RATE_LIMIT.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", RATE_LIMIT.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: ["/api/:path*"],
};
