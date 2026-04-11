import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";

// Only show this page for Italian locale
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
    title: "Convertire Markdown in EPUB Gratis | Markdown Free",
    description:
      "Converti i tuoi file Markdown in EPUB gratuitamente. Nessuna registrazione richiesta, nessun limite. Perfetto per leggere su Kindle, Apple Books, Kobo e altri e-reader.",
    keywords: [
      "convertire markdown in epub",
      "markdown epub gratis",
      "convertitore markdown epub",
      "md to epub italiano",
      "markdown ebook gratuito",
    ],
    alternates: {
      canonical: "/it/markdown-epub-gratis",
    },
    openGraph: {
      title: "Convertire Markdown in EPUB Gratis | Markdown Free",
      description:
        "Converti i tuoi file Markdown in EPUB gratuitamente. Nessuna registrazione, privacy garantita.",
      locale: "it_IT",
    },
  };
}

export default async function MarkdownEpubGratisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  // Only render for Italian
  if (localeParam !== "it") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Convertire Markdown in EPUB Gratis
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Trasforma i tuoi file Markdown in ebook EPUB. Perfetto per leggere
          documentazione su Kindle, Apple Books, Kobo o qualsiasi e-reader.
          Genera automaticamente indice e capitoli dai tuoi titoli.
        </p>
        <Link
          href="/it"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Inizia Ora — &Egrave; Gratis <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why EPUB Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Perch&eacute; Convertire Markdown in EPUB?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Leggi ovunque</strong> – EPUB funziona su Kindle, Apple Books, Kobo, Google Play Libri e tutti i principali e-reader.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Testo adattivo</strong> – A differenza del PDF, il contenuto EPUB si adatta alle dimensioni dello schermo, alle preferenze di carattere e alle modalit&agrave; di lettura.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Capitoli automatici</strong> – I titoli del tuo Markdown diventano capitoli navigabili con un indice automatico.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Lettura offline</strong> – Scarica una volta, leggi ovunque senza connessione internet.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Come Convertire Markdown in EPUB
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
            <div>
              <h3 className="font-medium text-slate-900">Carica o Incolla</h3>
              <p className="text-sm text-slate-600">Trascina il tuo file .md o incolla il testo Markdown direttamente.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
            <div>
              <h3 className="font-medium text-slate-900">Anteprima</h3>
              <p className="text-sm text-slate-600">Visualizza il documento formattato in tempo reale prima della conversione.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
            <div>
              <h3 className="font-medium text-slate-900">Esporta in EPUB</h3>
              <p className="text-sm text-slate-600">Clicca &ldquo;A EPUB&rdquo; e scarica il tuo ebook istantaneamente.</p>
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
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Il convertitore Markdown-EPUB &egrave; gratuito?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              S&igrave;! Markdown Free &egrave; 100% gratuito senza costi nascosti, piani premium o registrazione obbligatoria.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              L&apos;EPUB funziona su Kindle?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              S&igrave;. I Kindle moderni supportano EPUB nativamente. Per i modelli pi&ugrave; vecchi, puoi usare la funzione &ldquo;Invia a Kindle&rdquo; o Calibre per convertire EPUB in MOBI.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Come vengono generati i capitoli?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Markdown Free divide automaticamente il documento in capitoli ai titoli H1 (o H2 se non ci sono H1) e genera un indice navigabile.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              I miei file vengono salvati sui vostri server?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              No. I tuoi file vengono elaborati in memoria e immediatamente eliminati dopo la conversione. Non salviamo mai i tuoi contenuti.
            </p>
          </details>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Strumenti Correlati</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/it" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown a PDF
          </Link>
          <Link href="/it/convertire-markdown-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            Convertire Markdown in PDF
          </Link>
          <Link href="/it/convertire-readme-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            Convertire README in PDF
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/it"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Converti Markdown in EPUB Ora <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Gratis &bull; Senza registrazione &bull; Download istantaneo
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
