import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Umami Analytics configuration (proxied via /ingest to bypass adblockers)
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const siteUrl = "https://www.markdown.free";

export const metadata: Metadata = {
  title: "Markdown to PDF Converter – Free, Private, No Signup | Markdown Free",
  description:
    "Convert Markdown to PDF, HTML or TXT instantly. 100% free, no signup, no ad trackers. Files processed in your browser and never stored.",
  authors: [{ name: "Markdown Free" }],
  creator: "Markdown Free",
  publisher: "Markdown Free",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "it": "/it",
      "es": "/es",
      "ja": "/ja",
      "ko": "/ko",
      "zh-Hans": "/zh-Hans",
      "zh-Hant": "/zh-Hant",
      "id": "/id",
      "vi": "/vi",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Markdown Free",
    title: "Markdown to PDF Converter – Free, Private, No Signup",
    description:
      "Convert Markdown to PDF, HTML or TXT instantly. 100% free, no signup, no ad trackers.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Markdown Free - Convert Markdown to PDF, HTML, TXT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown to PDF Converter – Free, Private, No Signup",
    description:
      "Convert Markdown to PDF, HTML or TXT instantly. 100% free, no signup, no ad trackers.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
        {/* Vercel Web Analytics */}
        <Analytics />
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
