import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { hreflangAlternates } from "@/lib/tool-links";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for Indonesian locale
export function generateStaticParams() {
  return [{ locale: "id" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "id") {
    return {};
  }

  return {
    title: "Konverter Markdown ke PDF — Gratis Online, Tanpa Daftar (2026) | Markdown Free",
    description:
      "Konverter Markdown ke PDF online gratis: drag-and-drop file .md, unduh PDF instan. Tanpa daftar, tanpa instal, tanpa watermark. Tabel GFM, checklist, dan blok kode dipertahankan. Versi 2026.",
    keywords: [
      "konversi markdown ke pdf",
      "md ke pdf gratis",
      "konverter markdown online",
      "markdown ke pdf tanpa daftar",
      "konversi markdown online",
      "readme ke pdf",
      "markdown pdf 2026",
    ],
    alternates: {
      canonical: "/id/konversi-markdown-pdf",
      languages: hreflangAlternates("pdf"),
    },
    openGraph: {
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB" }],
      title: "Konverter Markdown ke PDF — Gratis Online, Tanpa Daftar (2026)",
      description:
        "Drag-and-drop .md, unduh PDF. Tanpa daftar, tanpa instal, tanpa watermark.",
      locale: "id_ID",
    },
  };
}

const faq = [
  { q: "Bagaimana cara mengonversi Markdown ke PDF?", a: "Buka Markdown Free, drag-and-drop file .md Anda (atau tempel teks Markdown), pratinjau hasil, lalu klik tombol \"Ke PDF\" untuk mengunduh. Seluruh proses sekitar 10 detik, tanpa instalasi." },
  { q: "Apakah konverter Markdown ke PDF ini gratis?", a: "Ya. Markdown Free 100% gratis tanpa paket premium, tanpa pendaftaran, tanpa batasan penggunaan, dan tanpa watermark di PDF hasil." },
  { q: "Bisa konversi Markdown ke PDF tanpa daftar?", a: "Bisa. Markdown Free tidak memerlukan akun atau pendaftaran. File diproses di browser (HTML/TXT) atau di memori serverless (PDF/DOCX/EPUB) dan tidak pernah disimpan." },
  { q: "Bisa konversi GitHub README.md ke PDF?", a: "Bisa. Buka README.md di repository GitHub, klik \"Raw\" dan simpan filenya, lalu unggah ke Markdown Free dan ekspor ke PDF. CHANGELOG.md, CONTRIBUTING.md dan file .md lain juga didukung." },
  { q: "Apakah file Markdown saya disimpan di server?", a: "Tidak. PDF dibuat di memori serverless dan langsung dihapus. Ekspor HTML dan TXT diproses sepenuhnya di browser dan tidak pernah meninggalkan komputer Anda." },
  { q: "Berapa ukuran file maksimum untuk konversi Markdown ke PDF?", a: "Saat ini 5MB per file, mencakup hampir semua dokumen Markdown nyata (~750.000 kata)." },
  { q: "Apakah format tabel, blok kode, dan checklist dipertahankan di PDF?", a: "Ya. Semua fitur GFM — tabel, blok kode (dengan syntax highlighting), checklist, daftar, strikethrough, autolink — dipertahankan dengan benar di output PDF." },
  { q: "Apakah tool ini berfungsi tanpa instalasi?", a: "Ya. Markdown Free berjalan sepenuhnya di browser — tidak perlu instalasi, plugin, atau ekstensi." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "id",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function KonversiMarkdownPdfPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (localeParam !== "id") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Konversi Markdown ke PDF - Gratis</h1>

        <p className="lead text-lg text-slate-600">
          Ingin mengubah file <code>.md</code> menjadi PDF profesional?
          Dengan Markdown Free, selesai dalam hitungan detik. Tanpa daftar, tanpa install.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Konversi Sekarang - Gratis
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Cara Menggunakan</h2>
        <ol>
          <li>
            <strong>Upload file</strong> — Drag and drop file <code>.md</code> atau <code>.markdown</code> ke area upload
          </li>
          <li>
            <strong>Preview</strong> — Lihat hasil format Markdown secara instan
          </li>
          <li>
            <strong>Download PDF</strong> — Klik tombol &quot;Ke PDF&quot; untuk download
          </li>
        </ol>

        <h2>Mengapa Memilih Markdown Free?</h2>
        <ul>
          <li>
            <strong>100% Gratis</strong> — Tidak ada biaya tersembunyi atau langganan
          </li>
          <li>
            <strong>Tanpa Daftar</strong> — Tidak perlu email atau informasi pribadi
          </li>
          <li>
            <strong>Privasi Terjamin</strong> — File tidak disimpan di server
          </li>
          <li>
            <strong>Konversi Cepat</strong> — Selesai dalam hitungan detik
          </li>
          <li>
            <strong>Mendukung GFM</strong> — Tabel, checklist, strikethrough, dan lainnya
          </li>
        </ul>

        <h2>Format yang Didukung</h2>
        <p>
          Selain PDF, Anda juga bisa ekspor ke:
        </p>
        <ul>
          <li><strong>HTML</strong> — Untuk publikasi web</li>
          <li><strong>TXT</strong> — Teks polos</li>
        </ul>

        <h2>Pertanyaan Umum</h2>

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Konversi Markdown ke PDF sekarang
          </p>
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Coba Gratis
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Halaman Terkait</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/id/markdown-pdf-tanpa-daftar" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown ke PDF Tanpa Daftar
              </Link>
            </li>
            <li>
              <Link href="/id/konversi-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Konversi README.md ke PDF
              </Link>
            </li>
            <li>
              <Link href="/id/perbandingan-konverter-markdown" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Perbandingan Konverter Markdown
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
            {/* Related tool suite cross-links */}
        <RelatedTools locale={locale} current="pdf" />
      </main>
    </>
  );
}
