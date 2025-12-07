import { Hero } from "@/components/hero";
import { UploadCard } from "@/components/upload-card";
import { PasteArea } from "@/components/paste-area";
import { ExportRow } from "@/components/export-row";
import { PreviewCard } from "@/components/preview-card";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10">
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {/* Upload Card */}
        <UploadCard />

        {/* Paste Area (collapsible) */}
        <PasteArea />

        {/* Export Buttons Row */}
        <ExportRow />

        {/* Preview Card */}
        <PreviewCard />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

