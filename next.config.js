const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["epub-gen-memory"],
  webpack: (config) => {
    // Suppress "Module not found: Can't resolve 'encoding'" warning from html-to-docx
    // The 'encoding' module is optional and not needed for DOCX generation
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/ingest/script.js",
        destination: "https://cloud.umami.is/script.js",
      },
      {
        source: "/ingest/api/send",
        destination: "https://cloud.umami.is/api/send",
      },
    ];
  },
  async headers() {
    // Security headers for all routes
    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      // Note: X-XSS-Protection removed - deprecated and can cause issues in modern browsers
      // CSP provides better protection
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ];

    // Add HSTS and CSP only in production (avoid issues with HMR in dev)
    if (process.env.NODE_ENV === "production") {
      // HSTS preload is opt-in. Only enable after submitting the domain at
      // https://hstspreload.org and confirming inclusion. Once enabled, browsers
      // will refuse HTTP for ~1 year regardless of header changes — there's no
      // quick rollback. Set HSTS_PRELOAD_ENABLED=true to opt in.
      const hstsValue =
        process.env.HSTS_PRELOAD_ENABLED === "true"
          ? "max-age=31536000; includeSubDomains; preload"
          : "max-age=31536000; includeSubDomains";

      securityHeaders.push(
        {
          key: "Strict-Transport-Security",
          value: hstsValue,
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://*.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob:",
            "connect-src 'self' https://*.vercel-insights.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        }
      );
    }

    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
