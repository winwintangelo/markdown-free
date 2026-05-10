import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
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
    title: "Konversi README.md ke PDF — Gratis Online, Tanpa Daftar (2026) | Markdown Free",
    description:
      "Konversi README.md GitHub menjadi PDF profesional dalam hitungan detik. Drag-and-drop file .md, unduh PDF langsung. Gratis, tanpa daftar, tanpa instal. Tabel GFM, checklist, dan blok kode dipertahankan. Versi 2026.",
    keywords: [
      "konversi readme pdf",
      "readme.md ke pdf",
      "github readme pdf",
      "konversi readme gratis",
      "readme pdf tanpa daftar",
      "markdown readme pdf 2026",
      "github markdown pdf indonesia",
    ],
    alternates: {
      canonical: "/id/konversi-readme-pdf",
    },
    openGraph: {
      title: "Konversi README.md ke PDF — Gratis Online, Tanpa Daftar (2026)",
      description:
        "Konverter GitHub README→PDF gratis. Drag-and-drop .md, unduh PDF. Tanpa daftar, tanpa instal.",
      locale: "id_ID",
    },
  };
}

const faq = [
  { q: "Bagaimana cara mengonversi README GitHub ke PDF?", a: "Buka README.md di repository GitHub Anda, klik tombol \"Raw\", simpan filenya, lalu drag-and-drop ke Markdown Free dan klik \"Ke PDF\" untuk mengunduh. Seluruh proses sekitar 10 detik, tanpa instalasi." },
  { q: "Bagaimana cara mengunduh README GitHub sebagai PDF?", a: "Buka README.md di GitHub, klik \"Raw\" dan simpan halaman sebagai file .md, lalu unggah ke Markdown Free dan ekspor ke PDF. Seluruh alur tetap di browser Anda." },
  { q: "Apakah konverter README ke PDF ini gratis?", a: "Ya. Markdown Free 100% gratis tanpa paket premium, tanpa pendaftaran, tanpa batasan penggunaan, dan tanpa watermark di PDF hasil." },
  { q: "Bisakah saya mengonversi README.md ke PDF tanpa mendaftar?", a: "Bisa. Markdown Free tidak memerlukan akun. File diproses di browser (HTML/TXT) atau di memori serverless (PDF/DOCX/EPUB) dan tidak pernah disimpan." },
  { q: "Apakah gambar dari README saya akan ikut ke PDF?", a: "Ya untuk URL absolut (https://...). Path relatif dari repository (./images/foo.png) tidak terselesaikan di luar GitHub — ganti dengan URL raw.githubusercontent.com sebelum konversi." },
  { q: "Bisa konversi CHANGELOG.md, CONTRIBUTING.md, atau file Markdown lain?", a: "Bisa. File .md atau .markdown apa pun bisa: README.md, CHANGELOG.md, CONTRIBUTING.md, dokumentasi di /docs, semuanya." },
  { q: "Apakah ada batas ukuran file untuk konversi README ke PDF?", a: "Ya — 5MB per file, mencakup hampir semua README dan dokumentasi nyata (~750.000 kata Markdown polos)." },
  { q: "Apakah file README saya disimpan di server Anda?", a: "Tidak. PDF dibuat di memori serverless dan langsung dihapus. Ekspor HTML dan TXT diproses sepenuhnya di browser dan tidak pernah meninggalkan komputer Anda." },
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

export default async function KonversiReadmePdfPage({
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
        <h1>Konversi README.md ke PDF</h1>

        <p className="lead text-lg text-slate-600">
          Punya README.md dari proyek GitHub? Ubah menjadi PDF profesional
          untuk dokumentasi, portofolio, atau presentasi.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Konversi README
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Mengapa Mengubah README ke PDF?</h2>
        <ul>
          <li>
            <strong>Dokumentasi Offline</strong> — Bagikan dokumentasi tanpa perlu internet
          </li>
          <li>
            <strong>Portofolio Profesional</strong> — Tampilkan proyek dengan format yang rapi
          </li>
          <li>
            <strong>Presentasi</strong> — Masukkan dokumentasi teknis ke dalam slide
          </li>
          <li>
            <strong>Arsip</strong> — Simpan versi statis dari dokumentasi
          </li>
          <li>
            <strong>Cetak</strong> — Dokumen kertas untuk meeting atau review
          </li>
        </ul>

        <h2>Dukungan Penuh GitHub Flavored Markdown</h2>
        <p>
          Markdown Free mendukung semua fitur GitHub Flavored Markdown (GFM):
        </p>
        <ul>
          <li>✓ Tabel</li>
          <li>✓ Checklist / Task list</li>
          <li>✓ Strikethrough</li>
          <li>✓ Syntax highlighting</li>
          <li>✓ Auto link</li>
          <li>✓ Emoji :smile:</li>
        </ul>

        <h2>Cara Konversi README</h2>
        <ol>
          <li>
            <strong>Download README</strong> — Di repository GitHub, buka README.md,
            klik &quot;Raw&quot;, lalu simpan file
          </li>
          <li>
            <strong>Upload ke Markdown Free</strong> — Drag and drop file ke area upload
          </li>
          <li>
            <strong>Cek Preview</strong> — Pastikan format sudah benar
          </li>
          <li>
            <strong>Ekspor</strong> — Klik &quot;Ke PDF&quot; untuk download
          </li>
        </ol>

        <h2>Contoh: README Umum</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# Nama Proyek

Deskripsi singkat proyek.

## Instalasi

\`\`\`bash
npm install nama-proyek
\`\`\`

## Penggunaan

\`\`\`javascript
import { fungsiSaya } from 'nama-proyek';
fungsiSaya();
\`\`\`

## Fitur

- [x] Fitur yang sudah selesai
- [ ] Fitur yang sedang dikembangkan

## Lisensi

MIT`}</pre>
        </div>
        <p>
          README ini akan dikonversi ke PDF dengan format yang sempurna:
          judul, blok kode (dengan syntax highlighting), checklist,
          semuanya tampil dengan baik.
        </p>

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
            Ubah README menjadi dokumen profesional
          </p>
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Coba Gratis Sekarang
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Halaman Terkait</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/id/konversi-markdown-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Konversi Markdown ke PDF - Gratis
              </Link>
            </li>
            <li>
              <Link href="/id/markdown-pdf-tanpa-daftar" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown ke PDF Tanpa Daftar
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
    </main>
    </>
  );
}
