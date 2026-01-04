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
    title: "Convertire README.md in PDF | Markdown Free",
    description:
      "Converti il tuo README.md di GitHub in un PDF professionale. Perfetto per documentazione, portfolio o presentazioni. Gratuito e senza registrazione.",
    keywords: [
      "convertire readme pdf",
      "readme.md a pdf",
      "github readme pdf",
      "documentazione markdown pdf",
      "readme markdown convertitore",
    ],
    alternates: {
      canonical: "/it/convertire-readme-pdf",
    },
    openGraph: {
      title: "Convertire README.md in PDF | Markdown Free",
      description:
        "Converti il tuo README.md di GitHub in un PDF professionale. Gratuito e senza registrazione.",
      locale: "it_IT",
    },
  };
}

export default async function ConvertireReadmePdfPage({
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
        <h1>Convertire README.md in PDF</h1>
        
        <p className="lead text-lg text-slate-600">
          Hai un progetto su GitHub con un bel README.md? Trasformalo in un PDF 
          professionale per la tua documentazione, portfolio o presentazioni.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Converti il Tuo README
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Perché Convertire un README in PDF?</h2>
        <ul>
          <li>
            <strong>Documentazione offline</strong> — Condividi la documentazione 
            anche senza accesso a internet
          </li>
          <li>
            <strong>Portfolio professionale</strong> — Presenta i tuoi progetti 
            in modo elegante
          </li>
          <li>
            <strong>Presentazioni</strong> — Includi la documentazione tecnica 
            nelle tue slide
          </li>
          <li>
            <strong>Archiviazione</strong> — Conserva una versione statica della 
            documentazione
          </li>
          <li>
            <strong>Stampa</strong> — Documenti cartacei per riunioni o revisioni
          </li>
        </ul>

        <h2>Supporto Completo per GitHub Flavored Markdown</h2>
        <p>
          Markdown Free supporta tutte le funzionalità di GitHub Flavored Markdown (GFM):
        </p>
        <ul>
          <li>✓ Tabelle</li>
          <li>✓ Checklist / Task list</li>
          <li>✓ Strikethrough (testo barrato)</li>
          <li>✓ Syntax highlighting per codice</li>
          <li>✓ Link automatici</li>
          <li>✓ Emoji :smile:</li>
        </ul>

        <h2>Come Convertire il Tuo README</h2>
        <ol>
          <li>
            <strong>Scarica il README</strong> — Vai sul tuo repository GitHub, 
            clicca su README.md, poi su &quot;Raw&quot;, e salva il file
          </li>
          <li>
            <strong>Carica su Markdown Free</strong> — Trascina il file nell&apos;area 
            di caricamento
          </li>
          <li>
            <strong>Verifica l&apos;anteprima</strong> — Controlla che tutto sia 
            formattato correttamente
          </li>
          <li>
            <strong>Esporta</strong> — Clicca &quot;A PDF&quot; e scarica
          </li>
        </ol>

        <h2>Esempio: README Tipico</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# Nome Progetto

Breve descrizione del progetto.

## Installazione

\`\`\`bash
npm install nome-progetto
\`\`\`

## Utilizzo

\`\`\`javascript
import { funzione } from 'nome-progetto';
funzione();
\`\`\`

## Funzionalità

- [x] Feature completata
- [ ] Feature in sviluppo

## Licenza

MIT`}</pre>
        </div>
        <p>
          Questo README viene convertito in un PDF con formattazione perfetta: 
          titoli, blocchi di codice con syntax highlighting, checklist e tutto il resto.
        </p>

        <h2>Domande Frequenti</h2>

        <h3>Le immagini nel README vengono incluse?</h3>
        <p>
          Le immagini con URL assoluti (es. https://...) vengono incluse nel PDF. 
          Le immagini con percorsi relativi potrebbero non essere visualizzate 
          correttamente — ti consigliamo di usare URL completi.
        </p>

        <h3>Posso convertire altri file Markdown del repository?</h3>
        <p>
          Certamente! Funziona con qualsiasi file <code>.md</code>: CHANGELOG.md, 
          CONTRIBUTING.md, documentazione nella cartella /docs, ecc.
        </p>

        <h3>Il formato del PDF è personalizzabile?</h3>
        <p>
          Attualmente il PDF usa un layout professionale ottimizzato per la leggibilità. 
          Stiamo valutando opzioni di personalizzazione per versioni future.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Trasforma il tuo README in un documento professionale
          </p>
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Prova Ora — Gratis
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Risorse Correlate</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/it/convertire-markdown-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Convertire Markdown in PDF Gratis
              </Link>
            </li>
            <li>
              <Link href="/it/markdown-pdf-senza-registrazione" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown a PDF Senza Registrazione
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

