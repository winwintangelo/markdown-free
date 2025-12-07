import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { ConverterProvider } from "@/hooks/use-converter";

export const metadata: Metadata = {
  title: "Markdown Free – Preview & Export",
  description:
    "Upload your .md file, see the formatted preview, then export to PDF, TXT or HTML with clear, simple buttons. Free, no signup, instant export.",
  keywords: ["markdown", "converter", "pdf", "html", "txt", "export", "preview"],
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

