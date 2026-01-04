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
    title: "Perbandingan Konverter Markdown 2026 | Markdown Free vs Lainnya",
    description:
      "Perbandingan lengkap tool konversi Markdown ke PDF. Markdown Free, CloudConvert, LightPDF. Gratis, tanpa daftar, privasi terjamin.",
    keywords: [
      "perbandingan markdown konverter",
      "markdown free vs cloudconvert",
      "tool konversi pdf perbandingan",
      "konverter markdown terbaik",
      "konversi md pdf gratis",
    ],
    alternates: {
      canonical: "/id/perbandingan-konverter-markdown",
    },
    openGraph: {
      title: "Perbandingan Konverter Markdown 2026 | Markdown Free vs Lainnya",
      description:
        "Perbandingan lengkap tool konversi Markdown ke PDF. Gratis, tanpa daftar, privasi terjamin.",
      locale: "id_ID",
    },
  };
}

export default async function PerbandinganKonverterMarkdownPage({
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
        <h1>Perbandingan Konverter Markdown</h1>

        <p className="lead text-lg text-slate-600">
          Sedang mencari tool konversi Markdown ke PDF terbaik? Berikut perbandingan
          jujur antara Markdown Free dan alternatif populer lainnya.
        </p>

        {/* Comparison Table */}
        <div className="not-prose my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Fitur</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-700">Markdown Free</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">CloudConvert</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">LightPDF</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">PDFForge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Gratis Sepenuhnya</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Batas harian</td>
                <td className="px-4 py-3 text-center text-slate-500">Batas harian</td>
                <td className="px-4 py-3 text-center text-slate-500">Desktop saja</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Tanpa Daftar</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Privasi (File Tidak Disimpan)</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Disimpan sementara</td>
                <td className="px-4 py-3 text-center text-slate-500">Cloud storage</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓ (lokal)</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Preview Real-time</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">GitHub Flavored Markdown</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Sebagian</td>
                <td className="px-4 py-3 text-center text-slate-500">Sebagian</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Ekspor HTML/TXT</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-slate-500">PDF saja</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Antarmuka Bahasa Indonesia</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Mengapa Memilih Markdown Free</h2>

        <h3>Gratis Sepenuhnya</h3>
        <p>
          CloudConvert dan LightPDF memiliki batasan ketat pada paket gratis
          (25 konversi per hari, dll), tapi Markdown Free sepenuhnya gratis tanpa batasan.
          Tidak ada paket &quot;Pro&quot;. Semua fitur sudah tersedia.
        </p>

        <h3>Privasi Utama</h3>
        <p>
          CloudConvert dan LightPDF menyimpan file Anda di server (meskipun sementara).
          Markdown Free tidak menyimpan file. Preview diproses di browser,
          PDF dibuat di memori lalu langsung dihapus.
        </p>

        <h3>Simpel</h3>
        <p>
          Tidak perlu buat akun, tidak ada dashboard rumit, tidak ada &quot;kredit&quot; yang harus dikelola.
          Buka halaman, drag file, download PDF. Selesai.
        </p>

        <h3>Preview Real-time</h3>
        <p>
          Berbeda dengan tool konversi lain, Markdown Free menampilkan preview
          dokumen yang sudah diformat sebelum konversi. Anda bisa memastikan
          tabel, kode, dan format sudah benar.
        </p>

        <h2>Kapan Alternatif Lain Lebih Cocok</h2>
        <p>
          Untuk bersikap adil, berikut situasi di mana solusi lain mungkin lebih tepat:
        </p>
        <ul>
          <li>
            <strong>CloudConvert</strong> — Jika Anda perlu konversi antara
            berbagai format selain Markdown
          </li>
          <li>
            <strong>PDFForge</strong> — Jika Anda lebih suka aplikasi desktop
            yang terinstal lokal
          </li>
          <li>
            <strong>Pandoc</strong> — Jika Anda developer dan ingin kontrol penuh
            via command line
          </li>
        </ul>

        <h2>Coba Sendiri</h2>
        <p>
          Cara terbaik untuk memutuskan? Coba Markdown Free.
          Benar-benar hanya butuh 10 detik.
        </p>

        {/* CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Tanpa batasan. Tanpa daftar. Tanpa biaya.
          </p>
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Coba Markdown Free
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Halaman Terkait</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/id/konversi-markdown-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Konversi Markdown ke PDF - Gratis
              </Link>
            </li>
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
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
