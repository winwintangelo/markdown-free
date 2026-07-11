import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";
import { safeJsonLd } from "@/lib/json-ld";

// This page is only for id locale
export function generateStaticParams() {
  return [{ locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Konverter Markdown ke Word (DOCX) — Gratis Online, Tanpa Daftar (2026)",
    description: "Ubah file Markdown (.md) ke dokumen Word (DOCX) langsung di browser. Drag-and-drop, unduh instan. Gratis, tanpa daftar, tanpa instal. File diproses di memori dan langsung dihapus. Versi 2026.",
    keywords: [
      "markdown ke word",
      "markdown ke docx",
      "konversi markdown ke word",
      "md ke word gratis",
      "konversi md ke docx",
      "markdown word online gratis",
      "markdown docx tanpa daftar",
      "konverter markdown word 2026",
    ],
    alternates: {
      canonical: "https://www.markdown.free/id/markdown-ke-word",
      languages: {
        "en": "/markdown-to-word",
        "id": "/id/markdown-ke-word",
        "ja": "/ja/markdown-word-henkan",
        "es": "/es/markdown-a-word",
        "ko": "/ko/markdown-word-byeonhwan",
        "vi": "/vi/markdown-sang-word",
        "zh-Hans": "/zh-Hans/markdown-zhuanhuan-word",
        "zh-Hant": "/zh-Hant/markdown-word-zhuanhuan",
        "it": "/it/markdown-in-word",
        "x-default": "/markdown-to-word",
      },
    },
    openGraph: {
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB" }],
      title: "Konverter Markdown ke Word (DOCX) — Gratis Online, Tanpa Daftar",
      description: "Ubah .md ke DOCX langsung di browser. Drag-and-drop, unduh instan. Gratis, tanpa daftar.",
      url: "https://www.markdown.free/id/markdown-ke-word",
      type: "website",
      locale: "id_ID",
    },
  };
}

const faq = [
  { q: "Bagaimana cara konversi Markdown ke Word (.docx)?", a: "Buka Markdown Free, drag-and-drop file .md Anda (atau tempel teks Markdown), pratinjau hasil, lalu klik tombol \"Ke DOCX\" untuk mengunduh dokumen Word. Seluruh proses sekitar 10 detik, tanpa instalasi." },
  { q: "Apakah konverter Markdown ke Word ini gratis?", a: "Ya. Markdown Free 100% gratis tanpa biaya tersembunyi, paket premium, atau persyaratan pendaftaran." },
  { q: "Apakah saya perlu mendaftar untuk konversi Markdown ke Word?", a: "Tidak. Markdown Free tidak memerlukan akun atau pendaftaran. Cukup buka halaman, unggah file, dan unduh hasilnya." },
  { q: "Apa perbedaan antara Word dan DOCX?", a: "DOCX adalah format file standar yang digunakan Microsoft Word sejak 2007. Saat kami menyebut \"dokumen Word\", yang dimaksud adalah file .docx yang dapat dibuka di Word, Google Docs, dan LibreOffice." },
  { q: "Apakah file Markdown saya disimpan di server Anda?", a: "Tidak. File Anda diproses sementara di memori dan langsung dihapus setelah konversi. Kami tidak menyimpan konten Anda." },
  { q: "Apakah format tabel, blok kode, dan checklist dipertahankan saat konversi ke Word?", a: "Ya. Tabel, blok kode, heading, daftar berurutan/tidak berurutan, dan checklist GFM dipertahankan sebagai gaya Word yang tepat." },
  { q: "Berapa ukuran file maksimum untuk konversi Markdown ke Word?", a: "Saat ini batasnya 5MB per file, mencakup hampir semua dokumen Markdown nyata (~750.000 kata)." },
  { q: "Apakah konverter Markdown ke .docx ini berfungsi tanpa instalasi?", a: "Ya. Markdown Free berjalan sepenuhnya di browser — tidak perlu instalasi, plugin, atau ekstensi." },
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

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownKeWordPage({ params }: PageProps) {
  const { locale } = await params;

  // Only allow id
  if (locale !== "id") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Konversi Markdown ke Word (DOCX) – Gratis Online
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Ubah file Markdown Anda menjadi dokumen Microsoft Word profesional.
            Sempurna untuk berbagi dokumentasi dengan rekan kerja, mengirim laporan,
            atau membuat dokumen yang dapat diedit dari catatan Anda.
          </p>
          <Link
            href="/id"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Mulai Konversi →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Mengapa Mengonversi Markdown ke Word?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Kompatibilitas universal</strong> – Dokumen Word (.docx) berfungsi di mana saja, dari Microsoft Office hingga Google Docs hingga LibreOffice.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Output yang dapat diedit</strong> – Berbeda dengan PDF, file Word/DOCX dapat dengan mudah diedit oleh penerima.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Format profesional</strong> – Tabel, blok kode, dan heading dipertahankan sebagai gaya Word yang tepat.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Siap untuk bisnis</strong> – Sempurna untuk menyerahkan dokumentasi, laporan, atau proposal di lingkungan perusahaan.</span>
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Siapa yang Menggunakan Konversi Markdown ke Word?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Mahasiswa</h3>
              <p className="text-sm text-slate-600">Konversi draft skripsi dan tugas dari Markdown ke Word untuk pengumpulan.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Developer</h3>
              <p className="text-sm text-slate-600">Ubah file README dan dokumentasi teknis menjadi spesifikasi Word untuk stakeholder non-teknis.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Penulis</h3>
              <p className="text-sm text-slate-600">Ekspor draft yang ditulis dalam Markdown ke Word untuk editing dan kolaborasi.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Tim</h3>
              <p className="text-sm text-slate-600">Bagikan dokumentasi Markdown sebagai file Word dengan rekan kerja yang lebih suka Office.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Cara Mengonversi Markdown ke Word (DOCX)
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Upload atau Tempel</h3>
                <p className="text-sm text-slate-600">Seret dan lepas file .md Anda, atau tempel teks Markdown langsung.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Pratinjau</h3>
                <p className="text-sm text-slate-600">Lihat dokumen Anda yang sudah diformat secara real-time sebelum mengonversi.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Ekspor ke Word</h3>
                <p className="text-sm text-slate-600">Klik "Ke DOCX" dan unduh dokumen Word Anda secara instan.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Privasi & Keamanan
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>File diproses sementara di memori</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Tidak pernah disimpan di server kami</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Koneksi terenkripsi HTTPS</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Tidak perlu membuat akun</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-slate-900">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related tool suite cross-links */}
        <RelatedTools locale={locale} current="docx" />

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Konversi Markdown ke Word Sekarang →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Gratis • Tanpa daftar • Unduh langsung
          </p>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
