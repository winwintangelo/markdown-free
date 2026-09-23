const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // The PDF route inlines the KaTeX stylesheet + fonts (read from node_modules
  // at runtime, see src/lib/katex-server.ts); make sure they ship in the bundle.
  outputFileTracingIncludes: {
    "/api/convert/pdf": ["./node_modules/katex/dist/katex.min.css", "./node_modules/katex/dist/fonts/*.woff2"],
  },
  // Pages prerender statically (two root layouts, see src/lib/site-metadata.ts), so
  // metadata renders in <head> for every crawler without the old `htmlLimitedBots`
  // workaround that the headers()-driven dynamic rendering needed.
  webpack: (config) => {
    // Suppress "Module not found: Can't resolve 'encoding'" warning from html-to-docx
    // The 'encoding' module is optional and not needed for DOCX generation
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
    };
    return config;
  },
  // The three -docx- pages duplicated the -word- cluster's intent and split its
  // ranking signal (the word pages carry the hreflang group, RelatedTools and
  // FAQPage schema). 301 keeps whatever the synonyms earned and sends visitors
  // to the page that answers the query.
  async redirects() {
    return [
      // statusCode 301, not `permanent: true`: Next's `permanent` emits 308, and
      // 301 is the code every crawler here (Google, Bing, the AI bots) reads
      // without ambiguity.
      { source: "/markdown-to-docx", destination: "/markdown-to-word", statusCode: 301 },
      { source: "/ja/markdown-docx-henkan", destination: "/ja/markdown-word-henkan", statusCode: 301 },
      { source: "/zh-Hant/markdown-docx-zhuanhuan", destination: "/zh-Hant/markdown-word-zhuanhuan", statusCode: 301 },
    ];
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
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            // NOTE: no upgrade-insecure-requests — HSTS covers the upgrade
            // story, and WebKit applies the directive to http://localhost,
            // which breaks e2e runs against a local prod build.
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
