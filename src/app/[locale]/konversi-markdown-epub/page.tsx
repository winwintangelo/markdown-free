import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";

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
    title: "Konversi Markdown ke EPUB Gratis | Markdown Free",
    description:
      "Konversi file Markdown ke EPUB secara gratis. Tanpa registrasi, tanpa batasan. Sempurna untuk dibaca di Kindle, Apple Books, Kobo, dan e-reader lainnya.",
    keywords: [
      "konversi markdown ke epub",
      "markdown epub gratis",
      "konverter markdown epub",
      "md ke epub indonesia",
      "markdown ebook gratis",
    ],
    alternates: {
      canonical: "/id/konversi-markdown-epub",
    },
    openGraph: {
      title: "Konversi Markdown ke EPUB Gratis | Markdown Free",
      description:
        "Konversi file Markdown ke EPUB secara gratis. Tanpa registrasi, privasi terjamin.",
      locale: "id_ID",
    },
  };
}

export default async function KonversiMarkdownEpubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  // Only render for Indonesian
  if (localeParam !== "id") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Konversi Markdown ke EPUB Gratis
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Ubah file Markdown Anda menjadi ebook EPUB. Sempurna untuk membaca
          dokumentasi di Kindle, Apple Books, Kobo, atau e-reader mana pun.
          Otomatis menghasilkan daftar isi dan bab dari heading Anda.
        </p>
        <Link
          href="/id"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Mulai Sekarang — Gratis <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why EPUB Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Mengapa Mengonversi Markdown ke EPUB?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Baca di mana saja</strong> – EPUB berfungsi di Kindle, Apple Books, Kobo, Google Play Books, dan semua e-reader utama.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Teks yang menyesuaikan</strong> – Berbeda dengan PDF, konten EPUB menyesuaikan dengan ukuran layar, preferensi font, dan mode baca.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Bab otomatis</strong> – Heading Markdown Anda menjadi bab yang dapat dinavigasi dengan daftar isi otomatis.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Baca offline</strong> – Unduh sekali, baca di mana saja tanpa koneksi internet.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Cara Mengonversi Markdown ke EPUB
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
            <div>
              <h3 className="font-medium text-slate-900">Unggah atau Tempel</h3>
              <p className="text-sm text-slate-600">Seret dan lepas file .md Anda, atau tempel teks Markdown secara langsung.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
            <div>
              <h3 className="font-medium text-slate-900">Pratinjau</h3>
              <p className="text-sm text-slate-600">Lihat dokumen terformat Anda secara real-time sebelum mengonversi.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
            <div>
              <h3 className="font-medium text-slate-900">Ekspor ke EPUB</h3>
              <p className="text-sm text-slate-600">Klik &ldquo;Ke EPUB&rdquo; dan unduh ebook Anda secara instan.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Pertanyaan yang Sering Diajukan
        </h2>
        <div className="space-y-4">
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Apakah konverter Markdown ke EPUB ini gratis?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Ya! Markdown Free 100% gratis tanpa biaya tersembunyi, paket premium, atau persyaratan registrasi.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Apakah EPUB berfungsi di Kindle?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Ya. Perangkat Kindle modern mendukung EPUB secara native. Untuk model lama, Anda dapat menggunakan fitur &ldquo;Kirim ke Kindle&rdquo; atau Calibre untuk mengonversi EPUB ke MOBI.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Bagaimana bab dihasilkan?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Markdown Free secara otomatis membagi dokumen Anda menjadi bab pada heading H1 (atau H2 jika tidak ada H1) dan menghasilkan daftar isi yang dapat dinavigasi.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Apakah file saya disimpan di server Anda?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Tidak. File Anda diproses di memori dan langsung dihapus setelah konversi. Kami tidak pernah menyimpan konten Anda.
            </p>
          </details>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Alat Terkait</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/id" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown ke PDF
          </Link>
          <Link href="/markdown-to-docx" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown ke DOCX
          </Link>
          <Link href="/readme-to-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            README ke PDF
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/id"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Konversi Markdown ke EPUB Sekarang <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Gratis &bull; Tanpa registrasi &bull; Unduh instan
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
