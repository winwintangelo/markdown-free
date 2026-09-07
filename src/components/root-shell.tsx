import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { RouteHistoryTracker } from "@/components/route-history-tracker";

// Umami Analytics configuration (proxied via /ingest to bypass adblockers)
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

interface RootShellProps {
  lang: string;
  children: React.ReactNode;
}

/**
 * The <html>/<body> shell shared by both root layouts ((en) and [locale]).
 *
 * `lang` is known statically per layout, so pages prerender with the correct
 * server-side <html lang> and no request-time dependency (see site-metadata.ts).
 */
export function RootShell({ lang, children }: RootShellProps) {
  return (
    <html lang={lang}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <RouteHistoryTracker />
        {children}
        {/* Vercel Web Analytics: only render on Vercel deploys.
            Locally (`next start` outside Vercel) the /_vercel/insights/script.js
            endpoint is not served, so the package logs a 404. */}
        {process.env.NEXT_PUBLIC_VERCEL_ENV && <Analytics debug={false} />}
        {/* Umami Analytics - Privacy-friendly, cookieless, proxied via /ingest */}
        {umamiWebsiteId && (
          <Script
            src="/ingest/script.js"
            data-website-id={umamiWebsiteId}
            data-host-url="/ingest"
            data-domains="www.markdown.free"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
