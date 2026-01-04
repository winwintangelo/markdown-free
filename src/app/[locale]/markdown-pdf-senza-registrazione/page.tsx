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
    title: "Markdown a PDF Senza Registrazione | Markdown Free",
    description:
      "Converti Markdown in PDF senza creare un account. Zero login, zero email, zero tracciamento. Carica, converti e scarica — tutto qui.",
    keywords: [
      "markdown pdf senza registrazione",
      "convertire md pdf no login",
      "markdown a pdf anonimo",
      "pdf da markdown senza account",
      "conversione markdown gratis",
    ],
    alternates: {
      canonical: "/it/markdown-pdf-senza-registrazione",
    },
    openGraph: {
      title: "Markdown a PDF Senza Registrazione | Markdown Free",
      description:
        "Converti Markdown in PDF senza creare un account. Zero login, zero tracciamento.",
      locale: "it_IT",
    },
  };
}

export default async function MarkdownPdfSenzaRegistrazionePage({
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
        <h1>Markdown a PDF Senza Registrazione</h1>
        
        <p className="lead text-lg text-slate-600">
          Stanco di creare account per ogni strumento online? Con Markdown Free 
          converti i tuoi file Markdown in PDF senza registrazione, senza email, 
          senza tracciamento.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Converti Ora — Nessun Login
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Perché &quot;Senza Registrazione&quot; è Importante</h2>
        <p>
          Molti convertitori online ti obbligano a creare un account. Perché?
        </p>
        <ul>
          <li>Per venderti abbonamenti premium</li>
          <li>Per inviarti email di marketing</li>
          <li>Per tracciare le tue attività</li>
          <li>Per monetizzare i tuoi dati</li>
        </ul>
        <p>
          <strong>Noi no.</strong> Markdown Free è uno strumento semplice che fa 
          una cosa sola e la fa bene — senza chiederti nulla in cambio.
        </p>

        <h2>Come Funziona</h2>
        <ol>
          <li>Vai su Markdown Free</li>
          <li>Trascina il tuo file <code>.md</code></li>
          <li>Clicca &quot;A PDF&quot;</li>
          <li>Scarica — fatto!</li>
        </ol>
        <p>
          Nessun modulo da compilare. Nessun &quot;verifica la tua email&quot;. 
          Nessun &quot;inizia la prova gratuita&quot;.
        </p>

        <h2>La Nostra Promessa sulla Privacy</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Nessun account richiesto</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Nessun cookie di tracciamento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>I file non vengono mai salvati</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Connessione HTTPS crittografata</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Analytics rispettoso della privacy (Umami)</span>
            </li>
          </ul>
        </div>

        <h2>Domande Frequenti</h2>

        <h3>Devo davvero non registrarmi?</h3>
        <p>
          Esatto! Non esiste nemmeno un pulsante &quot;Registrati&quot; sul nostro sito. 
          Apri la pagina, converti il file, chiudi la pagina. Fine.
        </p>

        <h3>Come guadagnate allora?</h3>
        <p>
          Markdown Free è un progetto personale. Non cerchiamo di monetizzare i tuoi dati 
          o di venderti servizi. È semplicemente uno strumento utile che volevamo esistesse.
        </p>

        <h3>Posso fidarmi a caricare documenti sensibili?</h3>
        <p>
          L&apos;anteprima viene elaborata interamente nel tuo browser. Per la generazione PDF, 
          il contenuto viene elaborato in memoria sul server e immediatamente eliminato. 
          Non salviamo, non logghiamo, non analizziamo i tuoi file.
        </p>

        <h3>C&apos;è un limite giornaliero?</h3>
        <p>
          No! Converti quanti file vuoi, quando vuoi.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Zero registrazione. Zero complicazioni.
          </p>
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Inizia Subito
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

