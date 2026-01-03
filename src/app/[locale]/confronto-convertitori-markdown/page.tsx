import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

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
    title: "Markdown Free vs CloudConvert, LightPDF, PDFForge | Confronto 2026",
    description:
      "Confronto tra i migliori convertitori Markdown a PDF. Scopri perché Markdown Free è la scelta migliore: gratis, senza registrazione, privacy garantita.",
    keywords: [
      "markdown free vs cloudconvert",
      "markdown free vs lightpdf",
      "confronto convertitori markdown",
      "miglior convertitore markdown pdf",
      "alternativa cloudconvert gratis",
    ],
    alternates: {
      canonical: "/it/confronto-convertitori-markdown",
    },
    openGraph: {
      title: "Markdown Free vs CloudConvert, LightPDF, PDFForge",
      description:
        "Confronto tra i migliori convertitori Markdown a PDF. Gratis, senza registrazione.",
      locale: "it_IT",
    },
  };
}

export default async function ConfrontoConvertitoriPage({
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
        <h1>Markdown Free vs Altri Convertitori</h1>
        
        <p className="lead text-lg text-slate-600">
          Stai cercando il miglior convertitore Markdown a PDF? Ecco un confronto 
          onesto tra Markdown Free e le alternative più popolari.
        </p>

        {/* Comparison Table */}
        <div className="not-prose my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Funzionalità</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-700">Markdown Free</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">CloudConvert</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">LightPDF</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">PDFForge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">100% Gratuito</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Limiti giornalieri</td>
                <td className="px-4 py-3 text-center text-slate-500">Limiti giornalieri</td>
                <td className="px-4 py-3 text-center text-slate-500">Solo desktop</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Senza Registrazione</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Privacy (no file salvati)</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">File salvati temporaneamente</td>
                <td className="px-4 py-3 text-center text-slate-500">Cloud storage</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓ (locale)</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Anteprima Live</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">GitHub Flavored Markdown</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Parziale</td>
                <td className="px-4 py-3 text-center text-slate-500">Parziale</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Export HTML/TXT</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-slate-500">Solo PDF</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Interfaccia in Italiano</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Perché Scegliere Markdown Free</h2>

        <h3>🆓 Davvero Gratuito</h3>
        <p>
          Mentre CloudConvert e LightPDF offrono piani gratuiti con limiti severi 
          (25 conversioni/giorno), Markdown Free è completamente gratuito senza 
          alcun limite. Non esiste un piano &quot;Pro&quot; perché tutte le funzionalità 
          sono già disponibili.
        </p>

        <h3>🔒 Privacy Prima di Tutto</h3>
        <p>
          CloudConvert e LightPDF salvano i tuoi file sui loro server (anche se 
          temporaneamente). Markdown Free non salva mai i tuoi file — l&apos;anteprima 
          è generata nel browser, e il PDF viene creato in memoria e subito eliminato.
        </p>

        <h3>⚡ Semplicità</h3>
        <p>
          Niente account da creare, niente dashboard complicati, niente &quot;crediti&quot; 
          da gestire. Apri la pagina, trascina il file, scarica il PDF. Fatto.
        </p>

        <h3>👁️ Anteprima in Tempo Reale</h3>
        <p>
          A differenza degli altri convertitori, Markdown Free mostra un&apos;anteprima 
          formattata del tuo documento prima di convertirlo. Puoi verificare che 
          tabelle, codice e formattazione siano corretti.
        </p>

        <h2>Quando Usare le Alternative</h2>
        <p>
          Per essere onesti, ecco quando potresti preferire altre soluzioni:
        </p>
        <ul>
          <li>
            <strong>CloudConvert</strong> — Se hai bisogno di convertire tra decine 
            di formati diversi (non solo Markdown)
          </li>
          <li>
            <strong>PDFForge</strong> — Se preferisci un&apos;applicazione desktop 
            installata localmente
          </li>
          <li>
            <strong>Pandoc</strong> — Se sei uno sviluppatore e vuoi controllo 
            totale sulla conversione via command line
          </li>
        </ul>

        <h2>Prova Tu Stesso</h2>
        <p>
          Il modo migliore per decidere? Prova Markdown Free — ci vogliono 
          letteralmente 10 secondi.
        </p>

        {/* CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Nessun limite. Nessun account. Nessun costo.
          </p>
          <Link
            href="/it"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Prova Markdown Free
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

