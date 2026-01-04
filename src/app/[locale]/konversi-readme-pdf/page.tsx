import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

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
    title: "Konversi README.md ke PDF | Markdown Free",
    description:
      "Konversi README.md GitHub menjadi PDF profesional. Cocok untuk dokumentasi, portofolio, presentasi. Gratis, tanpa daftar.",
    keywords: [
      "konversi readme pdf",
      "readme.md pdf",
      "github readme pdf",
      "markdown dokumentasi pdf",
      "readme konversi gratis",
    ],
    alternates: {
      canonical: "/id/konversi-readme-pdf",
    },
    openGraph: {
      title: "Konversi README.md ke PDF | Markdown Free",
      description:
        "Konversi README.md GitHub menjadi PDF profesional. Gratis, tanpa daftar.",
      locale: "id_ID",
    },
  };
}

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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>Apakah gambar di README akan ikut?</h3>
        <p>
          Gambar dengan URL absolut (seperti https://...) akan masuk ke PDF.
          Gambar dengan path relatif mungkin tidak tampil dengan benar.
          Disarankan menggunakan URL lengkap.
        </p>

        <h3>Bisa konversi file Markdown lain dari repository?</h3>
        <p>
          Tentu! CHANGELOG.md, CONTRIBUTING.md, dokumentasi di folder /docs,
          semua file <code>.md</code> didukung.
        </p>

        <h3>Bisa kustomisasi format PDF?</h3>
        <p>
          Saat ini PDF menggunakan layout profesional yang dioptimalkan untuk keterbacaan.
          Kami sedang mempertimbangkan opsi kustomisasi untuk versi mendatang.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Ubah README menjadi dokumen profesional
          </p>
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Coba Gratis Sekarang
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
