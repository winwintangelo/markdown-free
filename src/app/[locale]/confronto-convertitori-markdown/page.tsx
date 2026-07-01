import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/tool-links";

export function generateStaticParams() { return [{ locale: "it" }]; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "it") return {};
  return {
    title: "Migliori convertitori Markdown PDF 2026 | Confronto di 8 strumenti",
    description: "Confronto di 8 strumenti per convertire Markdown in PDF: Markdown Free, Pandoc, Typora, Dillinger, StackEdit, md-to-pdf, Markdown PDF (VS Code), Online2PDF. Quale scegliere.",
    keywords: ["confronto convertitori markdown", "migliore markdown pdf 2026", "markdown pdf gratis", "pandoc vs markdown free", "markdown pdf senza installazione", "markdown pdf online"],
    alternates: { canonical: "/it/confronto-convertitori-markdown", languages: hreflangAlternates("comparison") },
    openGraph: { title: "Migliori convertitori Markdown PDF 2026", description: "Confronto onesto di 8 strumenti Markdown→PDF, con la versione che vince per ogni caso d'uso.", locale: "it_IT" },
  };
}

const PUBLISH_DATE = "2026-05-09"; const NEXT_REVIEW = "2026-11-09";

const faq = [
  { q: "Perché gli accenti italiani (è, à, ù) o i caratteri non latini si rompono nel PDF?", a: "La maggior parte delle pipeline Markdown→PDF ricade su font solo latini come Helvetica o Times New Roman, che hanno glifi limitati. Per accenti italiani il problema è raro, ma per cinese/giapponese/coreano serve un font compatibile (es. Noto Sans CJK). Markdown Free incorpora questi font automaticamente; con Pandoc serve --pdf-engine=xelatex -V mainfont." },
  { q: "Esiste un convertitore Markdown→PDF gratuito senza pubblicità?", a: "Sì. Markdown Free (senza pubblicità, tracciamento o registrazione), Pandoc (CLI) e l'estensione VS Code Markdown PDF sono tutti gratuiti e senza ads. Editor browser ospitati come Dillinger e Online2PDF sono in genere supportati da pubblicità." },
  { q: "Qual è il miglior strumento Markdown→PDF senza installazione?", a: "Markdown Free funziona interamente nel browser senza installazione. Anche StackEdit e Dillinger sono solo browser, ma dipendono dai font di sistema, quindi script non latini possono apparire come quadrettini." },
  { q: "Posso convertire Markdown in DOCX (Word) senza perdere la formattazione?", a: "Sì. Markdown Free, Pandoc e Typora producono DOCX preservando intestazioni, blocchi di codice, tabelle e checkbox. Pandoc è il più completo; Markdown Free è il più rapido nel browser." },
  { q: "Pandoc è ancora la scelta migliore nel 2026?", a: "Pandoc resta il convertitore Markdown più potente per casi d'uso scriptati. Ma per utenti non tecnici o chi non vuole installare LaTeX (~1.5GB), strumenti basati su browser come Markdown Free offrono ora qualità PDF comparabile senza il costo di installazione." },
  { q: "Quale convertitore Markdown è più sicuro per documenti riservati?", a: "Tutto ciò che gira in locale (Pandoc, Typora, Markdown PDF per VS Code, md-to-pdf) tiene il file sulla tua macchina. Tra gli strumenti browser, Markdown Free elabora HTML/TXT/DOCX interamente lato client e i PDF in memoria serverless senza archiviazione. Strumenti che caricano sul server (Online2PDF) hanno il rischio di privacy più alto." },
  { q: "Markdown Free ha un limite di dimensione del file?", a: "Sì, attualmente 5MB per file. Un Markdown da 5MB equivale a circa 750.000 parole, copre praticamente ogni documento reale. Per file più grandi, Pandoc da riga di comando non ha limiti integrati di dimensione." },
];

const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", inLanguage: "it", headline: "Migliori convertitori Markdown PDF 2026", description: "Confronto di 8 strumenti Markdown→PDF.", datePublished: PUBLISH_DATE, dateModified: PUBLISH_DATE, author: { "@type": "Organization", name: "Markdown Free team", url: "https://www.markdown.free/it/about" }, publisher: { "@type": "Organization", name: "Markdown Free", url: "https://www.markdown.free" }, mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.markdown.free/it/confronto-convertitori-markdown" } };
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "it", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (localeParam !== "it") notFound();
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <ConverterProvider>
      <LocaleTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Migliori convertitori Markdown PDF 2026</h1>
          <p className="text-sm text-slate-500">Pubblicato il {PUBLISH_DATE} ・ Prossima revisione {NEXT_REVIEW} ・ Team di Markdown Free</p>
          <p className="lead text-lg text-slate-600">Scegliere uno strumento per convertire Markdown in PDF sembra banale finché non ti serve davvero. Poi ti ritrovi a scegliere tra un&apos;installazione LaTeX da 1,5 GB (Pandoc), un&apos;app desktop a pagamento (Typora), un editor browser con banner pubblicitari (Dillinger), o uno script da configurare a mano (md-to-pdf). Con l&apos;inglese funzionano quasi tutti. Iniziano a fallire con accenti, lingue asiatiche o script non latini — è lì che si vede chi è davvero il &quot;migliore&quot;.</p>
          <p><strong>Questa guida confronta 8 strumenti popolari per il 2026.</strong> In sintesi: <Link href="/it" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link> vince per uso solo browser senza installazione (specialmente con script non latini), Pandoc vince per pipeline batch scriptate, Typora vince per la rifinitura offline.</p>

          <h2>Confronto rapido</h2>
          <div className="not-prose my-6 overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Strumento</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Ideale per</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Prezzo</th><th className="px-3 py-3 text-left font-semibold text-slate-700">CJK / non latino</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Output</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Installazione</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Privacy</th>
            </tr></thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown Free</td><td className="px-3 py-3">Browser, script non latini</td><td className="px-3 py-3">Gratuito</td><td className="px-3 py-3">Sì — font Noto incorporati, nessuna config</td><td className="px-3 py-3">PDF, DOCX, EPUB, HTML, TXT</td><td className="px-3 py-3">Nessuna</td><td className="px-3 py-3">File in memoria, non salvati</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Pandoc</td><td className="px-3 py-3">Conversione batch scriptata</td><td className="px-3 py-3">Gratuito</td><td className="px-3 py-3">Con config: <code>--pdf-engine=xelatex -V mainfont</code></td><td className="px-3 py-3">30+ formati</td><td className="px-3 py-3">LaTeX (~1,5 GB) per PDF</td><td className="px-3 py-3">Solo locale</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Dillinger</td><td className="px-3 py-3">Editing rapido browser (latino)</td><td className="px-3 py-3">Gratuito, con pubblicità</td><td className="px-3 py-3">Solo font di sistema</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">Nessuna</td><td className="px-3 py-3">Può sincronizzare con cloud</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">StackEdit</td><td className="px-3 py-3">Browser + sync Drive</td><td className="px-3 py-3">Gratuito</td><td className="px-3 py-3">Solo font di sistema</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">Nessuna</td><td className="px-3 py-3">Sync cloud opzionale</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td><td className="px-3 py-3">Workflow VS Code</td><td className="px-3 py-3">Gratuito</td><td className="px-3 py-3">Font di sistema; CSS configurabile</td><td className="px-3 py-3">PDF, HTML, PNG, JPEG</td><td className="px-3 py-3">VS Code + Chromium (~170MB)</td><td className="px-3 py-3">Solo locale</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">md-to-pdf (npm)</td><td className="px-3 py-3">Pipeline di build</td><td className="px-3 py-3">Gratuito</td><td className="px-3 py-3">Configurabile via CSS + Puppeteer</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Node.js + Chromium</td><td className="px-3 py-3">Solo locale</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Typora</td><td className="px-3 py-3">Editor offline curato</td><td className="px-3 py-3">A pagamento (una tantum, non verificato al momento della scrittura)</td><td className="px-3 py-3">Font di sistema; dipende dal tema</td><td className="px-3 py-3">PDF, HTML, DOCX</td><td className="px-3 py-3">App desktop</td><td className="px-3 py-3">Solo locale</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Online2PDF</td><td className="px-3 py-3">Conversione file generica</td><td className="px-3 py-3">Gratuito, con pubblicità</td><td className="px-3 py-3">Limitato; non nativo Markdown</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Nessuna</td><td className="px-3 py-3">File caricati su server</td></tr>
            </tbody>
          </table></div>

          <h2>Markdown Free</h2>
          <p>Convertitore Markdown basato su browser: HTML/TXT/DOCX vengono elaborati interamente lato client, mentre il PDF è generato su infrastruttura serverless con file in memoria, scartati immediatamente. Costruito sul principio che aggiungere registrazioni, pubblicità o tracker rovini un&apos;attività che dovrebbe durare 30 secondi.</p>
          <p><strong>Gestione di script non latini:</strong> incorpora Noto Sans CJK JP/KR/SC/TC e Noto Sans Devanagari direttamente nella pipeline di rendering PDF. Nessun flag font, nessuna installazione, nessun quadrettino.</p>
          <p><strong>Punti di forza:</strong> nessuna registrazione, nessun cookie di tracciamento, analytics rispettoso della privacy, UI in 10 lingue, output DOCX solido per chi converte Markdown generato da AI in documenti Word aziendali.<br /><strong>Limiti:</strong> tetto di 5MB per file in input, nessuna modalità offline (richiede browser), nessun rendering matematico LaTeX/MathJax, nessun batch (un file alla volta), nessuna personalizzazione dello stile PDF.<br /><strong>Ideale per:</strong> chi deve convertire Markdown in PDF, DOCX o EPUB ora senza installare nulla, specialmente con script non latini.</p>
          <p><Link href="/it" className="text-emerald-700 hover:text-emerald-800 hover:underline">markdown.free/it</Link> (oppure direttamente <Link href="/it/markdown-pdf-senza-registrazione" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF senza registrazione</Link>, <Link href="/it/convertire-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">README in PDF</Link>)</p>

          <h2>Pandoc</h2>
          <p>Convertitore universale da riga di comando, lo standard de facto per uso batch e in pipeline. Converte tra 30+ formati inclusi Markdown, LaTeX, DOCX, EPUB e PDF.</p>
          <p><strong>Script non latini:</strong> il motore LaTeX predefinito (<code>pdflatex</code>) non gestisce CJK, Devanagari, arabo, ebraico. Per output leggibile servono <code>--pdf-engine=xelatex</code> (o <code>lualatex</code>) e <code>-V mainfont=&quot;Noto Sans CJK JP&quot;</code> (o il font corrispondente). Il font Noto deve essere installato sul sistema.</p>
          <p><strong>Punti di forza:</strong> il convertitore più potente e flessibile, vasto ecosistema di plugin/filtri, riferimento universale in editoria accademica e tecnica.<br /><strong>Limiti:</strong> per il PDF serve installare LaTeX (TeX Live ~1,5 GB), curva di apprendimento ripida, gli script non latini richiedono configurazione esplicita che il principiante non conosce.<br /><strong>Ideale per:</strong> pipeline scriptate, editoria accademica, scrittori tecnici a proprio agio con la riga di comando.</p>
          <p><a href="https://pandoc.org" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">pandoc.org</a></p>

          <h2>Dillinger</h2>
          <p>Editor Markdown browser con anteprima dal vivo ed export base. Open source, istanza ospitata su dillinger.io.</p>
          <p><strong>Script non latini:</strong> l&apos;anteprima eredita il fallback dei font del browser, l&apos;export PDF usa i font di sistema. L&apos;anteprima può apparire corretta ma il PDF mostrare quadrettini, a seconda del sistema dell&apos;utente.</p>
          <p><strong>Punti di forza:</strong> editor a riquadri familiare, gratuito, integrazioni Dropbox/Google Drive/GitHub.<br /><strong>Limiti:</strong> versione ospitata con pubblicità; lo stato del documento può sincronizzarsi con cloud collegati; controllo limitato sullo stile PDF.<br /><strong>Ideale per:</strong> editing rapido e export di documenti in script latini.</p>
          <p><a href="https://dillinger.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">dillinger.io</a></p>

          <h2>StackEdit</h2>
          <p>Editor Markdown browser con sync cloud robusto (Google Drive, Dropbox, GitHub) e supporto matematica via MathJax.</p>
          <p><strong>Script non latini:</strong> come Dillinger, dipende dai font del browser/sistema. Niente font Noto integrati.</p>
          <p><strong>Punti di forza:</strong> UI pulita, rendering matematico, sync cloud per editing multi-dispositivo.<br /><strong>Limiti:</strong> l&apos;export PDF passa per il pipeline di stampa del browser, lo stile è limitato alle convenzioni del print stylesheet; il sync richiede permessi Google/Dropbox.<br /><strong>Ideale per:</strong> chi vuole un editor Markdown con sync cloud e ha bisogno di MathJax.</p>
          <p><a href="https://stackedit.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">stackedit.io</a></p>

          <h2>Markdown PDF (estensione VS Code)</h2>
          <p>Estensione VS Code che esporta il file Markdown corrente in PDF, HTML, PNG o JPEG. Render via Chromium incorporato (download al primo uso, ~170MB).</p>
          <p><strong>Script non latini:</strong> usa il sistema font di Chromium. CJK e Devanagari si renderizzano se i font sono installati nel sistema operativo (i moderni macOS/Windows/Linux li hanno per i principali script). Personalizzabile via CSS — gli utenti avanzati possono usare <code>@font-face</code> per incorporare font specifici.</p>
          <p><strong>Punti di forza:</strong> integrato nel workflow VS Code, altamente personalizzabile via CSS, locale (nessuna dipendenza di rete dopo il download di Chromium).<br /><strong>Limiti:</strong> richiede VS Code; primo avvio scarica ~170MB; primo export lento.<br /><strong>Ideale per:</strong> sviluppatori che vivono già in VS Code e vogliono un export PDF a un comando.</p>
          <p><a href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">Marketplace VS Code</a></p>

          <h2>md-to-pdf (npm)</h2>
          <p>CLI/libreria Node.js che converte Markdown in PDF tramite Puppeteer (che incorpora Chromium). Pensata per pipeline di build e workflow personalizzati.</p>
          <p><strong>Script non latini:</strong> usa il sistema font di Chromium. Personalizzabile via injection di CSS — gli utenti avanzati possono <code>@import</code> font web (incluso Noto) nello stylesheet di rendering.</p>
          <p><strong>Punti di forza:</strong> scriptabile, personalizzabile a tema, veloce in batch dopo l&apos;installazione, open source.<br /><strong>Limiti:</strong> richiede Node.js e il Chromium di Puppeteer (~170MB al primo install); lo stile predefinito necessita lavoro CSS per qualità di produzione.<br /><strong>Ideale per:</strong> pipeline di build personalizzate, CI/CD che produce PDF dalla documentazione.</p>
          <p><a href="https://github.com/simonhaenisch/md-to-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">github.com/simonhaenisch/md-to-pdf</a></p>

          <h2>Typora</h2>
          <p>Editor Markdown WYSIWYG curato per desktop (macOS, Windows, Linux). Gratuito fino al 2021, ora a pagamento (licenza una tantum, prezzo non verificato al momento della scrittura — controlla typora.io).</p>
          <p><strong>Script non latini:</strong> solido out-of-the-box per la maggior parte degli script via font di sistema. Dipende dal tema — alcuni temi hanno stack ottimizzati per CJK.</p>
          <p><strong>Punti di forza:</strong> editor WYSIWYG di prim&apos;ordine, export curato, gestione font solida, niente pubblicità o telemetria una volta licenziato.<br /><strong>Limiti:</strong> a pagamento, solo desktop (niente versione browser), niente funzioni team/cloud.<br /><strong>Ideale per:</strong> scrittori solitari che vogliono un editor offline curato e accettano una licenza una tantum.</p>
          <p><a href="https://typora.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">typora.io</a></p>

          <h2>Online2PDF</h2>
          <p>Convertitore web generico per molti formati (Word, Excel, PDF, immagini, ecc.). Markdown è supportato attraverso conversione generica.</p>
          <p><strong>Script non latini:</strong> limitato e non verificato al momento della scrittura. Non progettato come strumento Markdown nativo, quindi il comportamento con blocchi di codice, tabelle e font CJK è incoerente.</p>
          <p><strong>Punti di forza:</strong> gestisce molti formati oltre Markdown, nessuna installazione.<br /><strong>Limiti:</strong> file caricati su server (problema di privacy per contenuto sensibile), interfaccia con molte pubblicità, rendering Markdown generico — blocchi di codice, tabelle e checkbox possono non rendersi correttamente, stile non personalizzabile.<br /><strong>Ideale per:</strong> conversioni occasionali con un mix di formati dove Markdown è solo accessorio.</p>
          <p><a href="https://online2pdf.com" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">online2pdf.com</a></p>

          <h2>Come scegliere</h2>
          <ul>
            <li><strong>Devi convertire un file Markdown in PDF/DOCX/EPUB ora nel browser, senza registrazione, specialmente con contenuto coreano/giapponese/cinese/hindi/arabo</strong> → <Link href="/it" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link></li>
            <li><strong>Sei a tuo agio con la CLI, hai LaTeX installato (o puoi farlo) e vuoi una pipeline scriptata</strong> → Pandoc</li>
            <li><strong>Vivi in VS Code e vuoi un export a un comando</strong> → Markdown PDF (estensione VS Code)</li>
            <li><strong>Stai costruendo una CI/CD che produce PDF da Markdown</strong> → md-to-pdf o Pandoc</li>
            <li><strong>Vuoi un editor WYSIWYG offline curato e non ti dispiace pagare</strong> → Typora</li>
            <li><strong>Hai bisogno di Markdown sincronizzato in cloud con supporto matematica</strong> → StackEdit</li>
            <li><strong>Stai facendo edit occasionali in script latini soltanto</strong> → Dillinger o StackEdit</li>
          </ul>

          <h2>Domande frequenti</h2>
          {faq.map((item, i) => (<div key={i}><h3>{item.q}</h3><p>{item.a}</p></div>))}

          <h2>Trasparenza</h2>
          <p>Questo articolo è pubblicato dal team dietro <Link href="/it" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>, uno degli strumenti confrontati. Abbiamo provato a essere specifici sui casi in cui altri strumenti vincono — Pandoc per pipeline scriptate, Typora per la rifinitura offline, VS Code Markdown PDF per workflow in editor. I link ai concorrenti usano <code>rel=&quot;nofollow&quot;</code>. Se trovi un errore fattuale, <Link href="/it/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">faccelo sapere</Link> e lo correggiamo.</p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">Prova Markdown Free — niente installazione, niente registrazione, niente quadrettini</p>
            <Link href="/it" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800">Apri Markdown Free<span aria-hidden="true">→</span></Link>
          </div>

          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Pagine correlate</h2>
            <ul className="space-y-2">
              <li><Link href="/it/convertire-markdown-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">Convertire Markdown in PDF - Gratis</Link></li>
              <li><Link href="/it/markdown-pdf-senza-registrazione" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF senza registrazione</Link></li>
              <li><Link href="/it/convertire-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">README.md in PDF</Link></li>
              <li><Link href="/it/markdown-in-word" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown in Word (DOCX)</Link></li>
            </ul>
          </div>
        </article>
        <Footer locale={locale} dict={dict} />
      </main>
    </ConverterProvider>
  );
}
