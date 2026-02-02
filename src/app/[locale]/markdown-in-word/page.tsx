import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

// This page is only for it locale
export function generateStaticParams() {
  return [{ locale: "it" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Convertitore Markdown in Word (DOCX) – Strumento Online Gratis | Markdown Free",
    description: "Converti file Markdown in documenti Word (DOCX) istantaneamente. 100% gratis, senza registrazione, senza pubblicità. I tuoi file vengono elaborati in modo sicuro e mai archiviati.",
    keywords: [
      "markdown in word",
      "markdown in docx",
      "convertire markdown in word",
      "convertitore markdown word",
      "md in word",
    ],
    alternates: {
      canonical: "https://www.markdown.free/it/markdown-in-word",
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
      title: "Convertitore Markdown in Word (DOCX) – Strumento Online Gratis",
      description: "Converti i tuoi file .md in formato Microsoft Word. Gratuito, privato, download istantaneo.",
      url: "https://www.markdown.free/it/markdown-in-word",
      type: "website",
      locale: "it_IT",
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownInWordPage({ params }: PageProps) {
  const { locale } = await params;

  // Only allow it
  if (locale !== "it") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Converti Markdown in Word (DOCX) – Strumento Gratis
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Trasforma i tuoi file Markdown in documenti Microsoft Word professionali.
            Perfetto per condividere documentazione con colleghi non tecnici, inviare
            report o creare documenti modificabili dai tuoi appunti.
          </p>
          <Link
            href="/it"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Inizia a Convertire →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Perché convertire Markdown in Word?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Compatibilità universale</strong> – I documenti Word (.docx) funzionano ovunque: Microsoft Office, Google Docs, LibreOffice.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Output modificabile</strong> – A differenza del PDF, i file Word/DOCX possono essere facilmente modificati dai destinatari.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Formattazione professionale</strong> – Tabelle, blocchi di codice e intestazioni vengono mantenuti come stili Word appropriati.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Pronto per il business</strong> – Ideale per inviare documentazione, report o proposte in ambienti aziendali.</span>
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Chi usa la conversione da Markdown a Word?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Studenti</h3>
              <p className="text-sm text-slate-600">Converti bozze di tesi e relazioni da Markdown a Word per la consegna.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Sviluppatori</h3>
              <p className="text-sm text-slate-600">Trasforma file README e documentazione tecnica in specifiche Word per non tecnici.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Scrittori</h3>
              <p className="text-sm text-slate-600">Esporta manoscritti scritti in Markdown verso Word per la revisione e collaborazione.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Team</h3>
              <p className="text-sm text-slate-600">Condividi documenti Markdown come file Word con colleghi che preferiscono Office.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Come convertire Markdown in Word (DOCX)
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Carica o incolla</h3>
                <p className="text-sm text-slate-600">Trascina e rilascia il tuo file .md, oppure incolla il testo Markdown direttamente.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Anteprima</h3>
                <p className="text-sm text-slate-600">Visualizza il tuo documento formattato in tempo reale prima della conversione.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Esporta in Word</h3>
                <p className="text-sm text-slate-600">Clicca "In DOCX" e scarica il tuo documento Word istantaneamente.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Privacy e Sicurezza
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>I file vengono elaborati temporaneamente in memoria</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Mai archiviati sui server</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Connessione crittografata HTTPS</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Nessuna creazione di account richiesta</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Domande Frequenti
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Questo convertitore da Markdown a Word è gratuito?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Sì! Markdown Free è 100% gratuito senza costi nascosti, piani premium o requisiti di registrazione.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Qual è la differenza tra Word e DOCX?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                DOCX è il formato file utilizzato da Microsoft Word dal 2007. Quando diciamo "documento Word", intendiamo un file .docx che può essere aperto in Word, Google Docs, LibreOffice e altri elaboratori di testi.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                I miei file vengono archiviati sui vostri server?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                No. I file vengono elaborati in memoria e eliminati immediatamente dopo la conversione. Non archiviamo mai i tuoi contenuti.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                La formattazione come tabelle e blocchi di codice viene mantenuta?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Sì! Tabelle, blocchi di codice, intestazioni, elenchi e altra formattazione Markdown vengono convertiti negli stili Word appropriati.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Converti Markdown in Word Ora →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Gratuito • Senza registrazione • Download istantaneo
          </p>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
