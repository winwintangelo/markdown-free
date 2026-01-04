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
    title: "Markdown ke PDF Tanpa Daftar | Markdown Free",
    description:
      "Konversi Markdown ke PDF tanpa membuat akun. Tanpa login, tanpa email, tanpa pelacakan. Upload dan konversi saja.",
    keywords: [
      "markdown pdf tanpa daftar",
      "md konversi tanpa akun",
      "markdown pdf anonim",
      "konversi pdf tanpa login",
      "markdown konversi gratis",
    ],
    alternates: {
      canonical: "/id/markdown-pdf-tanpa-daftar",
    },
    openGraph: {
      title: "Markdown ke PDF Tanpa Daftar | Markdown Free",
      description:
        "Konversi Markdown ke PDF tanpa membuat akun. Tanpa login, tanpa pelacakan.",
      locale: "id_ID",
    },
  };
}

export default async function MarkdownPdfTanpaDaftarPage({
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
        <h1>Markdown ke PDF Tanpa Daftar</h1>

        <p className="lead text-lg text-slate-600">
          Bosan dengan tool online yang selalu minta daftar akun?
          Markdown Free memungkinkan Anda konversi Markdown ke PDF tanpa daftar, tanpa email, tanpa pelacakan.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Konversi Sekarang — Tanpa Login
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Mengapa &quot;Tanpa Daftar&quot; Itu Penting</h2>
        <p>
          Kenapa banyak tool konversi online yang minta buat akun?
        </p>
        <ul>
          <li>Untuk menjual paket berbayar</li>
          <li>Untuk mengirim email marketing</li>
          <li>Untuk melacak aktivitas pengguna</li>
          <li>Untuk memonetisasi data</li>
        </ul>
        <p>
          <strong>Kami berbeda.</strong> Markdown Free adalah tool sederhana yang
          melakukan satu hal dengan baik. Tanpa meminta imbalan apapun.
        </p>

        <h2>Cara Menggunakan</h2>
        <ol>
          <li>Buka Markdown Free</li>
          <li>Drag and drop file <code>.md</code></li>
          <li>Klik &quot;Ke PDF&quot;</li>
          <li>Download — selesai!</li>
        </ol>
        <p>
          Tidak ada form yang harus diisi. Tidak ada &quot;verifikasi email&quot;.
          Tidak ada &quot;mulai trial gratis&quot;.
        </p>

        <h2>Komitmen Privasi Kami</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Tidak perlu daftar akun</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Tidak ada cookie pelacakan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>File tidak disimpan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Koneksi HTTPS terenkripsi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Analytics yang menghormati privasi (Umami)</span>
            </li>
          </ul>
        </div>

        <h2>Pertanyaan Umum</h2>

        <h3>Benar-benar tidak perlu daftar?</h3>
        <p>
          Benar! Di situs kami bahkan tidak ada tombol &quot;Daftar&quot;.
          Buka halaman, konversi file, tutup halaman. Selesai.
        </p>

        <h3>Bagaimana cara kalian mendapat penghasilan?</h3>
        <p>
          Markdown Free adalah proyek personal. Kami tidak memonetisasi data pengguna
          atau menjual layanan apapun. Ini hanya tool yang berguna.
        </p>

        <h3>Apakah aman untuk upload dokumen rahasia?</h3>
        <p>
          Preview diproses sepenuhnya di browser Anda. Saat generate PDF,
          file diproses di memori server lalu langsung dihapus.
          Kami tidak menyimpan, tidak mencatat, tidak menganalisis file Anda.
        </p>

        <h3>Ada batas konversi per hari?</h3>
        <p>
          Tidak ada! Konversi sebanyak yang Anda mau, kapan saja.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Tanpa daftar. Tanpa ribet. Langsung pakai.
          </p>
          <Link
            href="/id"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Mulai Sekarang
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
