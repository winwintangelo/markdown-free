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
    title: "Convertire Markdown in PDF Gratis | Markdown Free",
    description:
      "Converti i tuoi file Markdown in PDF gratuitamente. Nessuna registrazione richiesta, nessun limite, privacy garantita. Trascina il file e scarica il PDF in pochi secondi.",
    keywords: [
      "convertire markdown in pdf",
      "markdown a pdf gratis",
      "convertitore markdown pdf",
      "md to pdf italiano",
      "markdown pdf gratuito",
    ],
    alternates: {
      canonical: "/it/convertire-markdown-pdf",
    },
    openGraph: {
      title: "Convertire Markdown in PDF Gratis | Markdown Free",
      description:
        "Converti i tuoi file Markdown in PDF gratuitamente. Nessuna registrazione, privacy garantita.",
      locale: "it_IT",
    },
  };
}

export default async function ConvertireMarkdownPdfPage({
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
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Convertire Markdown in PDF Gratis</h1>
        
        <p className="lead text-lg text-slate-600">
          Hai un file <code>.md</code> e vuoi trasformarlo in un PDF professionale? 
          Con Markdown Free puoi farlo in pochi secondi, senza registrazione e senza costi.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Inizia Ora — È Gratis
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Come Funziona</h2>
        <ol>
          <li>
            <strong>Carica il file</strong> — Trascina il tuo file <code>.md</code> o <code>.markdown</code> nell&apos;area di caricamento
          </li>
          <li>
            <strong>Anteprima</strong> — Visualizza il tuo Markdown formattato istantaneamente
          </li>
          <li>
            <strong>Scarica PDF</strong> — Clicca &quot;A PDF&quot; e scarica il tuo documento
          </li>
        </ol>

        <h2>Perché Scegliere Markdown Free?</h2>
        <ul>
          <li>
            <strong>100% Gratuito</strong> — Nessun costo nascosto, nessun abbonamento
          </li>
          <li>
            <strong>Nessuna Registrazione</strong> — Non chiediamo email o dati personali
          </li>
          <li>
            <strong>Privacy Totale</strong> — I file non vengono mai salvati sui nostri server
          </li>
          <li>
            <strong>Veloce</strong> — Conversione in pochi secondi
          </li>
          <li>
            <strong>Supporto GFM</strong> — Tabelle, checklist, strikethrough e molto altro
          </li>
        </ul>

        <h2>Formati Supportati</h2>
        <p>
          Oltre al PDF, puoi esportare in:
        </p>
        <ul>
          <li><strong>HTML</strong> — Per pubblicare sul web</li>
          <li><strong>TXT</strong> — Testo semplice senza formattazione</li>
        </ul>

        <h2>Domande Frequenti</h2>

        <h3>È davvero gratis?</h3>
        <p>
          Sì! Markdown Free è completamente gratuito. Non ci sono piani premium, 
          limiti giornalieri o funzionalità nascoste a pagamento.
        </p>

        <h3>I miei file sono al sicuro?</h3>
        <p>
          Assolutamente. L&apos;anteprima viene generata direttamente nel tuo browser. 
          Per la conversione PDF, il contenuto viene elaborato in memoria e 
          immediatamente eliminato — non salviamo mai i tuoi file.
        </p>

        <h3>Qual è il limite di dimensione?</h3>
        <p>
          Puoi caricare file fino a 5 MB — più che sufficiente per qualsiasi 
          documento Markdown.
        </p>

        <h3>Funziona su mobile?</h3>
        <p>
          Sì! L&apos;interfaccia è ottimizzata per smartphone e tablet.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Pronto a convertire il tuo Markdown?
          </p>
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Prova Gratis Ora
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Risorse Correlate</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/it/markdown-pdf-senza-registrazione" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown a PDF Senza Registrazione
              </Link>
            </li>
            <li>
              <Link href="/it/convertire-readme-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Convertire README.md in PDF
              </Link>
            </li>
            <li>
              <Link href="/it/confronto-convertitori-markdown" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Confronto Convertitori Markdown
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

