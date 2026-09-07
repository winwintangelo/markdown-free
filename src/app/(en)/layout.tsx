import type { Metadata, Viewport } from "next";
import { RootShell } from "@/components/root-shell";
import { localeAlternates, siteUrl, siteViewport } from "@/lib/site-metadata";
import "../globals.css";

/**
 * Root layout for the English site (URL root, no locale prefix).
 *
 * This is one of two root layouts — see src/lib/site-metadata.ts. It renders
 * <html lang="en"> statically; the [locale] root layout handles the rest.
 */

export const metadata: Metadata = {
  // Kept ≤65 chars so Google doesn't truncate it in the SERP (was 99 chars → cut off
  // mid-phrase). Front-loads the primary intents (PDF/Word/Image/Converter — "converter" is
  // a demand gap we rank nowhere for) and keeps the "Markdown Free" brand exactly once (the
  // i18n dedup test asserts this; the brand also carries the free-ness hook). og:/twitter
  // titles below stay longer (social cards have room) and keep the privacy angle.
  title: "Markdown to PDF, Word & Image Converter | Markdown Free",
  description:
    "Convert Markdown to PDF, Word (DOCX), image (PNG) or EPUB instantly. 100% free, no signup, no ad trackers. Files processed temporarily and never stored.",
  authors: [{ name: "Markdown Free" }],
  creator: "Markdown Free",
  publisher: "Markdown Free",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: localeAlternates,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Markdown Free",
    title: "Markdown to PDF, Word (DOCX) & Image (PNG) Converter – Free, Private, No Signup",
    description:
      "Convert Markdown to PDF, Word (DOCX), image (PNG) or EPUB instantly. 100% free, no signup, no ad trackers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Markdown Free - Convert Markdown to PDF, Word, Image (PNG), EPUB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown to PDF, Word (DOCX) & Image (PNG) Converter – Free, Private, No Signup",
    description:
      "Convert Markdown to PDF, Word (DOCX), image (PNG) or EPUB instantly. 100% free, no signup, no ad trackers.",
    images: ["/og-image.png"],
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

export const viewport: Viewport = siteViewport;

export default function EnglishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootShell lang="en">{children}</RootShell>;
}
