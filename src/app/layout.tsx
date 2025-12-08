import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { ConverterProvider } from "@/hooks/use-converter";

const siteUrl = "https://www.markdown.free";

export const metadata: Metadata = {
  title: {
    default: "Markdown to PDF Converter – Free, Private, No Signup",
    template: "%s | Markdown Free",
  },
  description:
    "Convert Markdown to PDF, HTML or TXT instantly. 100% free, no signup, no ad trackers. Files processed in your browser and never stored.",
  // Note: keywords meta tag omitted - not used by modern search engines
  authors: [{ name: "Markdown Free" }],
  creator: "Markdown Free",
  publisher: "Markdown Free",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
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
  manifest: "/site.webmanifest",
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
        <ConverterProvider>
          <Header />
          {children}
        </ConverterProvider>
      </body>
    </html>
  );
}
