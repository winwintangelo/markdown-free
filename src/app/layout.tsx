import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { ConverterProvider } from "@/hooks/use-converter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://markdown.free";

export const metadata: Metadata = {
  title: {
    default: "Markdown Free – Preview & Convert Markdown Files",
    template: "%s | Markdown Free",
  },
  description:
    "Free online Markdown viewer and converter. Upload your .md file, preview it instantly, then export to PDF, TXT, or HTML. No signup required, instant export.",
  keywords: [
    "markdown",
    "markdown converter",
    "markdown to pdf",
    "markdown to html",
    "markdown preview",
    "md file viewer",
    "markdown editor",
    "free markdown converter",
    "online markdown",
  ],
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
    title: "Markdown Free – Preview & Convert Markdown Files",
    description:
      "Free online Markdown viewer and converter. Upload, preview, and export to PDF, TXT, or HTML instantly. No signup required.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Markdown Free - Preview & Convert Markdown Files",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Free – Preview & Convert Markdown Files",
    description:
      "Free online Markdown viewer and converter. No signup required.",
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
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
