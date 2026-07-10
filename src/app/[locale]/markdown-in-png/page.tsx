import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for the it locale
export function generateStaticParams() {
  return [{ locale: "it" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "it") {
    return {};
  }

  return {
    title: "Convertire Markdown in Immagine PNG – Gratis, Privato, Senza Registrazione | Markdown Free",
    description: "Converti Markdown in un'immagine PNG o JPG nitida direttamente nel browser. Gratis, senza registrazione, nulla viene caricato. I documenti lunghi si esportano come un'unica immagine lunga o uno ZIP di parti.",
    keywords: ["markdown in png", "markdown in immagine", "markdown in jpg", "md in png", "convertire markdown in immagine"],
    alternates: {
      canonical: "/it/markdown-in-png",
      languages: hreflangAlternates("image"),
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og-markdown-to-png.png"],
    },
    openGraph: {
      images: [{ url: "/og-markdown-to-png.png", width: 1200, height: 630, alt: "Markdown to Image (PNG) — Markdown Free" }],
      title: "Convertire Markdown in Immagine PNG – Gratis, Privato, Senza Registrazione | Markdown Free",
      description: "Renderizza il tuo file .md come un'immagine PNG nitida, tutto nel browser. Gratis e privato.",
      locale: "it_IT",
    },
  };
}

const faq = [
  {
    "question": "Questo convertitore Markdown in PNG è gratuito?",
    "answer": "Sì! Markdown Free è 100% gratuito, senza costi nascosti, piani premium o registrazione."
  },
  {
    "question": "Come vengono gestiti i documenti lunghi?",
    "answer": "I documenti fino a circa dieci schermate si esportano sempre come un'unica immagine. Quelli più lunghi ti fanno scegliere: un'immagine lunga (facile da condividere) o uno ZIP di parti a misura di schermo (più nitido per documenti molto lunghi)."
  },
  {
    "question": "Il mio Markdown viene caricato su un server?",
    "answer": "No. L'immagine viene renderizzata interamente nel browser: il tuo Markdown non lascia mai il dispositivo. Solo le immagini remote referenziate nel documento possono passare dal nostro proxy per comparire nel risultato."
  },
  {
    "question": "Accenti e caratteri speciali verranno resi correttamente?",
    "answer": "Sì. L'immagine viene rasterizzata con i font del tuo dispositivo, quindi il testo esce esattamente come lo vedi nell'anteprima."
  },
  {
    "question": "Posso esportare JPG invece di PNG?",
    "answer": "Sì. L'esportazione JPG è nel menu Altri formati. Per il testo è consigliato PNG perché è senza perdita e i bordi delle lettere restano perfettamente nitidi."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "it",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default async function MarkdownInPngPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (localeParam !== "it") {
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
          Convertire Markdown in Immagine (PNG) – Strumento Gratuito
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Trasforma il tuo Markdown in un'immagine PNG o JPG nitida, renderizzata interamente nel browser. Perfetto per condividere note in chat, pubblicare testo formattato sui social o inserire frammenti nelle presentazioni.
        </p>
        <Link
          href="/it"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          Inizia a Convertire <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why Image Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Perché convertire Markdown in immagine?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Condividi ovunque</strong> – le immagini funzionano in ogni app di chat, social e presentazione, anche dove il Markdown no.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Testo nitido</strong> – il rendering usa la densità di pixel del tuo dispositivo, così il testo resta nitido invece di sembrare uno screenshot sfocato.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Documenti lunghi</strong> – esporta un intero articolo come un'unica immagine lunga, oppure dividilo in uno ZIP di parti.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>100% nel browser</strong> – nulla viene caricato; il tuo Markdown non lascia mai il dispositivo.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Come convertire Markdown in PNG
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
            <div>
              <h3 className="font-medium text-slate-900">Carica o incolla</h3>
              <p className="text-sm text-slate-600">Trascina il tuo file .md o incolla direttamente il testo Markdown.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
            <div>
              <h3 className="font-medium text-slate-900">Anteprima</h3>
              <p className="text-sm text-slate-600">Guarda il documento formattato in tempo reale prima di convertire.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
            <div>
              <h3 className="font-medium text-slate-900">Esporta come immagine</h3>
              <p className="text-sm text-slate-600">Clicca In Immagine (PNG) e l'immagine si scarica all'istante. JPG è in Altri formati.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Domande Frequenti
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
          href="/it"
          className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          Converti Markdown in PNG Ora <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Gratis &bull; Senza registrazione &bull; Download istantaneo
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
