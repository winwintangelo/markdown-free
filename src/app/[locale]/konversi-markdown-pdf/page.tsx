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
    title: "Konversi Markdown ke PDF Gratis | Markdown Free",
    description:
      "Konversi file Markdown ke PDF secara gratis. Tanpa daftar, file tidak disimpan. Drag and drop untuk konversi. Mendukung GitHub Flavored Markdown.",
    keywords: [
      "konversi markdown pdf",
      "md ke pdf gratis",
      "markdown converter",
      "konversi markdown online",
      "readme ke pdf",
    ],
    alternates: {
      canonical: "/id/konversi-markdown-pdf",
    },
    openGraph: {
      title: "Konversi Markdown ke PDF Gratis | Markdown Free",
      description:
        "Konversi file Markdown ke PDF secara gratis. Tanpa daftar, privasi terjamin.",
      locale: "id_ID",
    },
  };
}

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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>Apakah benar-benar gratis?</h3>
        <p>
          Ya! Markdown Free sepenuhnya gratis. Tidak ada paket premium, tidak ada batas harian,
          tidak ada fitur berbayar tersembunyi.
        </p>

        <h3>Apakah file saya aman?</h3>
        <p>
          Aman dan terjamin. Preview diproses di browser Anda,
          dan saat konversi PDF, file diproses di memori lalu langsung dihapus.
          File tidak pernah disimpan.
        </p>

        <h3>Berapa batas ukuran file?</h3>
        <p>
          Mendukung file hingga 5MB. Lebih dari cukup untuk dokumen Markdown biasa.
        </p>

        <h3>Bisa digunakan di HP?</h3>
        <p>
          Bisa! Antarmuka sudah dioptimalkan untuk smartphone dan tablet.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Konversi Markdown ke PDF sekarang
          </p>
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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
              <Link href="/id/markdown-pdf-tanpa-daftar" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown ke PDF Tanpa Daftar
              </Link>
            </li>
            <li>
              <Link href="/id/konversi-readme-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Konversi README.md ke PDF
              </Link>
            </li>
            <li>
              <Link href="/id/perbandingan-konverter-markdown" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Perbandingan Konverter Markdown
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
