import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for the id locale
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
    title: "Konversi Markdown ke Gambar PNG – Gratis, Privat, Tanpa Daftar | Markdown Free",
    description: "Konversi Markdown menjadi gambar PNG atau JPG yang tajam langsung di browser. Gratis, tanpa daftar, tidak ada yang diunggah. Dokumen panjang diekspor sebagai satu gambar panjang atau ZIP per bagian.",
    keywords: ["markdown ke png", "markdown ke gambar", "markdown ke jpg", "md ke png", "konversi markdown jadi gambar"],
    alternates: {
      canonical: "/id/markdown-ke-gambar",
      languages: hreflangAlternates("image"),
    },
    openGraph: {
      title: "Konversi Markdown ke Gambar PNG – Gratis, Privat, Tanpa Daftar | Markdown Free",
      description: "Render file .md Anda sebagai gambar PNG tajam, sepenuhnya di browser. Gratis dan privat.",
      locale: "id_ID",
    },
  };
}

const faq = [
  {
    "question": "Apakah konverter Markdown ke PNG ini gratis?",
    "answer": "Ya! Markdown Free 100% gratis tanpa biaya tersembunyi, paket premium, atau kewajiban mendaftar."
  },
  {
    "question": "Bagaimana dokumen panjang ditangani?",
    "answer": "Dokumen hingga sekitar sepuluh layar selalu diekspor sebagai satu gambar. Yang lebih panjang memberi Anda pilihan: satu gambar panjang (mudah dibagikan) atau ZIP berisi bagian seukuran layar (lebih tajam untuk dokumen sangat panjang)."
  },
  {
    "question": "Apakah Markdown saya diunggah ke server?",
    "answer": "Tidak. Gambar dirender sepenuhnya di browser Anda — Markdown tidak pernah meninggalkan perangkat. Hanya gambar remote yang dirujuk dalam dokumen yang mungkin diambil melalui proxy kami agar tampil di hasil."
  },
  {
    "question": "Apakah teks akan tetap tajam?",
    "answer": "Ya. Gambar dirasterisasi dengan font perangkat Anda sendiri pada kepadatan piksel penuh, jadi hasilnya persis seperti pratinjau."
  },
  {
    "question": "Bisakah mengekspor JPG alih-alih PNG?",
    "answer": "Bisa. Ekspor JPG tersedia di menu Format lainnya. Untuk teks disarankan PNG karena lossless sehingga tepi huruf tetap tajam sempurna."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "id",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default async function MarkdownKeGambarPage({
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Konversi Markdown ke Gambar (PNG) – Alat Gratis
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Ubah Markdown Anda menjadi gambar PNG atau JPG tajam, dirender sepenuhnya di browser. Sempurna untuk berbagi catatan di aplikasi chat, memposting teks berformat di media sosial, atau menyisipkan potongan ke slide.
        </p>
        <Link
          href="/id"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          Mulai Konversi <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why Image Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Mengapa mengonversi Markdown menjadi gambar?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Bagikan di mana saja</strong> – gambar berfungsi di semua aplikasi chat, platform sosial, dan slide, bahkan di tempat yang tidak mendukung Markdown.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Teks tajam</strong> – rendering mengikuti kepadatan piksel perangkat Anda, sehingga teks tetap tajam, tidak seperti tangkapan layar yang buram.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Dukungan dokumen panjang</strong> – ekspor seluruh artikel sebagai satu gambar panjang, atau bagi menjadi ZIP per bagian.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>100% di browser</strong> – tidak ada yang diunggah; Markdown Anda tidak pernah meninggalkan perangkat.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Cara mengonversi Markdown ke PNG
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
            <div>
              <h3 className="font-medium text-slate-900">Unggah atau tempel</h3>
              <p className="text-sm text-slate-600">Seret file .md Anda, atau tempel teks Markdown langsung.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
            <div>
              <h3 className="font-medium text-slate-900">Pratinjau</h3>
              <p className="text-sm text-slate-600">Lihat dokumen berformat secara real-time sebelum konversi.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
            <div>
              <h3 className="font-medium text-slate-900">Ekspor ke gambar</h3>
              <p className="text-sm text-slate-600">Klik Ke Gambar (PNG) dan gambar langsung terunduh. JPG ada di Format lainnya.</p>
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
          {faq.map((item) => (
            <details key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related tool suite cross-links */}
      <RelatedTools locale={locale} current="image" />

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/id"
          className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          Konversi Markdown ke PNG Sekarang <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Gratis &bull; Tanpa daftar &bull; Unduh instan
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
