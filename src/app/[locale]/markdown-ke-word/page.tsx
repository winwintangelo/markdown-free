import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

// This page is only for id locale
export function generateStaticParams() {
  return [{ locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown ke Word (DOCX) Gratis | Konverter Online | Markdown Free",
    description: "Konversi file Markdown ke dokumen Word (DOCX) secara instan. 100% gratis, tanpa daftar, tanpa iklan. File Anda diproses dengan aman dan tidak pernah disimpan.",
    keywords: [
      "markdown ke word",
      "markdown ke docx",
      "konversi markdown word",
      "md ke word gratis",
      "markdown word converter indonesia",
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
      title: "Markdown ke Word (DOCX) Gratis | Konverter Online",
      description: "Konversi file .md ke format Microsoft Word. Gratis, privat, unduh langsung.",
      url: "https://www.markdown.free/id/markdown-ke-word",
      type: "website",
      locale: "id_ID",
    },
  };
}

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
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Apakah konverter Markdown ke Word ini gratis?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Ya! Markdown Free 100% gratis tanpa biaya tersembunyi, paket premium, atau persyaratan pendaftaran.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Apa perbedaan antara Word dan DOCX?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                DOCX adalah format file yang digunakan oleh Microsoft Word sejak 2007. Ketika kami mengatakan "dokumen Word," yang kami maksud adalah file .docx yang dapat dibuka di Word, Google Docs, LibreOffice, dan pengolah kata lainnya.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Apakah file saya disimpan di server Anda?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Tidak. File Anda diproses di memori dan segera dihapus setelah konversi. Kami tidak pernah menyimpan konten Anda.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Apakah format seperti tabel dan blok kode dipertahankan?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Ya! Tabel, blok kode, heading, daftar, dan format Markdown lainnya dikonversi ke gaya Word yang tepat.
              </p>
            </details>
          </div>
        </section>

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
