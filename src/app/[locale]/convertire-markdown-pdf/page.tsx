import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { hreflangAlternates } from "@/lib/tool-links";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

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
    title: "Convertire Markdown in PDF Gratis — Online, Senza Registrazione (2026) | Markdown Free",
    description:
      "Convertitore Markdown a PDF online gratuito: trascina il file .md, scarica il PDF in pochi secondi. Senza registrazione, senza installazione, senza filigrana. Tabelle GFM, checklist e blocchi di codice mantenuti. Versione 2026.",
    keywords: [
      "convertire markdown in pdf",
      "markdown a pdf gratis",
      "convertitore markdown pdf",
      "md to pdf italiano",
      "markdown pdf gratuito",
      "markdown pdf senza registrazione",
      "convertitore markdown online 2026",
    ],
    alternates: {
      canonical: "/it/convertire-markdown-pdf",
      languages: hreflangAlternates("pdf"),
    },
    openGraph: {
      title: "Convertire Markdown in PDF Gratis — Online, Senza Registrazione (2026)",
      description:
        "Trascina .md, scarica PDF. Senza registrazione, senza installazione, senza filigrana.",
      locale: "it_IT",
    },
  };
}

const faq = [
  { q: "Come si converte un file Markdown in PDF?", a: "Apri Markdown Free, trascina il file .md nell'area di caricamento (oppure incolla il testo Markdown), controlla l'anteprima e clicca \"A PDF\" per scaricare. L'intero processo richiede circa 10 secondi, senza registrazione né installazione." },
  { q: "Il convertitore Markdown a PDF è davvero gratuito?", a: "Sì. Markdown Free è 100% gratuito senza piani premium, senza registrazione, senza limiti d'uso e senza filigrana sul PDF esportato." },
  { q: "Posso convertire Markdown in PDF senza registrarmi?", a: "Sì. Markdown Free non richiede un account. I file vengono elaborati nel tuo browser (HTML/TXT) o in memoria serverless (PDF/DOCX/EPUB) e non vengono mai memorizzati." },
  { q: "Posso convertire un README.md di GitHub in PDF?", a: "Sì. Apri il README.md nel repository GitHub, clicca \"Raw\" e salva il file, poi caricalo su Markdown Free ed esporta in PDF. Funziona anche per CHANGELOG.md, CONTRIBUTING.md e qualsiasi file .md." },
  { q: "I miei file Markdown vengono salvati sui vostri server?", a: "No. I PDF vengono generati in memoria serverless e scartati immediatamente. Le esportazioni HTML e TXT vengono elaborate completamente nel browser e non lasciano mai il tuo computer." },
  { q: "Qual è il limite di dimensione del file?", a: "Attualmente 5MB per file, sufficiente per praticamente qualsiasi documento Markdown reale (~750.000 parole di Markdown semplice)." },
  { q: "Le tabelle, i blocchi di codice e le checklist GFM vengono mantenuti nel PDF?", a: "Sì. Tutte le funzionalità GFM — tabelle, blocchi di codice (con evidenziazione della sintassi), checklist, strikethrough, autolink — vengono preservate correttamente nell'output PDF." },
  { q: "Funziona senza installazione?", a: "Sì. Markdown Free funziona interamente nel browser — nessuna installazione, plugin o estensione richiesti." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "it",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

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
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
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

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Pronto a convertire il tuo Markdown?
          </p>
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
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
              <Link href="/it/markdown-pdf-senza-registrazione" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown a PDF Senza Registrazione
              </Link>
            </li>
            <li>
              <Link href="/it/convertire-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Convertire README.md in PDF
              </Link>
            </li>
            <li>
              <Link href="/it/confronto-convertitori-markdown" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Confronto Convertitori Markdown
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
    </>
  );
}

