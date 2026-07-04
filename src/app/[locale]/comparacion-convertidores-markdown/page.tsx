import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/tool-links";

export function generateStaticParams() { return [{ locale: "es" }]; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "es") return {};
  return {
    title: "Mejores convertidores Markdown a PDF 2026 | Comparación de 8",
    description: "Comparación de 8 herramientas para convertir Markdown a PDF: Markdown Free, Pandoc, Typora, Dillinger, StackEdit, md-to-pdf, Markdown PDF (VS Code), Online2PDF.",
    keywords: ["mejor markdown a pdf 2026", "comparación markdown pdf", "convertidor markdown gratis", "markdown sin instalación", "pandoc vs markdown free", "markdown pdf online"],
    alternates: { canonical: "/es/comparacion-convertidores-markdown", languages: hreflangAlternates("comparison") },
    openGraph: { title: "Mejores convertidores Markdown a PDF 2026", description: "Comparación honesta de 8 herramientas Markdown→PDF, con la mejor para cada caso de uso.", locale: "es_ES" },
  };
}

const PUBLISH_DATE = "2026-05-09"; const NEXT_REVIEW = "2026-11-09";

const faq = [
  { q: "¿Por qué los acentos (á, é, ñ) o los caracteres no latinos se rompen al convertir a PDF?", a: "La mayoría de pipelines Markdown→PDF caen sobre fuentes solo latinas como Helvetica o Times New Roman, que tienen glifos limitados. Para acentos en español el problema es raro, pero para chino/japonés/coreano hace falta una fuente compatible (Noto Sans CJK). Markdown Free incrusta esas fuentes automáticamente; con Pandoc se necesita --pdf-engine=xelatex -V mainfont." },
  { q: "¿Existe un convertidor Markdown→PDF gratis sin anuncios?", a: "Sí. Markdown Free (sin anuncios, sin tracking, sin registro), Pandoc (CLI) y la extensión Markdown PDF de VS Code son todas gratuitas y sin publicidad. Editores web alojados como Dillinger y Online2PDF suelen apoyarse en publicidad." },
  { q: "¿Cuál es la mejor herramienta Markdown→PDF sin instalación?", a: "Markdown Free funciona completamente en el navegador sin instalar nada. StackEdit y Dillinger también son solo navegador, pero dependen de las fuentes del sistema, así que los scripts no latinos pueden mostrarse como cuadritos." },
  { q: "¿Puedo convertir Markdown a DOCX (Word) sin perder formato?", a: "Sí. Markdown Free, Pandoc y Typora producen DOCX preservando títulos, bloques de código, tablas y listas de tareas. Pandoc es el más exhaustivo; Markdown Free es el más rápido en el navegador." },
  { q: "¿Sigue siendo Pandoc la mejor opción en 2026?", a: "Pandoc sigue siendo el convertidor Markdown más potente para uso scriptado. Para usuarios no técnicos o quienes no quieran instalar LaTeX (~1,5 GB), herramientas en navegador como Markdown Free ofrecen ahora calidad PDF comparable sin coste de instalación." },
  { q: "¿Qué convertidor es más seguro para documentos sensibles?", a: "Cualquier herramienta local (Pandoc, Typora, Markdown PDF para VS Code, md-to-pdf) mantiene el archivo en tu máquina. Entre las web, Markdown Free procesa HTML/TXT/DOCX completamente del lado cliente y los PDF en memoria serverless sin almacenamiento. Las herramientas que suben al servidor (Online2PDF) tienen el mayor riesgo de privacidad." },
  { q: "¿Markdown Free tiene un límite de tamaño de archivo?", a: "Sí, actualmente 5MB por archivo. 5MB de Markdown equivalen aproximadamente a 750.000 palabras, lo que cubre prácticamente cualquier documento real. Para archivos mayores, Pandoc por línea de comandos no tiene límite de tamaño integrado." },
];

const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", inLanguage: "es", headline: "Mejores convertidores Markdown a PDF 2026", description: "Comparación de 8 herramientas Markdown→PDF.", datePublished: PUBLISH_DATE, dateModified: PUBLISH_DATE, author: { "@type": "Organization", name: "Markdown Free team", url: "https://www.markdown.free/es/about" }, publisher: { "@type": "Organization", name: "Markdown Free", url: "https://www.markdown.free" }, mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.markdown.free/es/comparacion-convertidores-markdown" } };
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "es", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (localeParam !== "es") notFound();
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <ConverterProvider>
      <LocaleTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Mejores convertidores Markdown a PDF 2026</h1>
          <p className="text-sm text-slate-500">Publicado el {PUBLISH_DATE} ・ Próxima revisión {NEXT_REVIEW} ・ Equipo de Markdown Free</p>
          <p className="lead text-lg text-slate-600">Elegir una herramienta Markdown→PDF parece trivial hasta que la necesitas. Entonces tienes que escoger entre una instalación de LaTeX de 1,5 GB (Pandoc), una app de escritorio de pago (Typora), un editor web con banners (Dillinger) o un script que tienes que configurar tú mismo (md-to-pdf). En inglés casi todas funcionan. Empiezan a fallar con caracteres no latinos — ahí es donde se decide cuál es realmente &quot;la mejor&quot;.</p>
          <p><strong>Esta guía compara 8 herramientas populares para 2026.</strong> Resumen: <Link href="/es" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link> gana para uso solo navegador sin configuración (especialmente con scripts no latinos), Pandoc gana para procesamiento por lotes scriptado, Typora gana para terminado offline.</p>

          <h2>Comparación rápida</h2>
          <div className="not-prose my-6 overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Herramienta</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Ideal para</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Precio</th><th className="px-3 py-3 text-left font-semibold text-slate-700">CJK / no latino</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Salida</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Instalación</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Privacidad</th>
            </tr></thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown Free</td><td className="px-3 py-3">Navegador, scripts no latinos</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Sí — fuentes Noto incrustadas, sin configuración</td><td className="px-3 py-3">PDF, DOCX, PNG, EPUB, HTML, TXT</td><td className="px-3 py-3">Ninguna</td><td className="px-3 py-3">Archivos en memoria, sin almacenamiento</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Pandoc</td><td className="px-3 py-3">Conversión por lotes scriptada</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Con configuración: <code>--pdf-engine=xelatex -V mainfont</code></td><td className="px-3 py-3">30+ formatos</td><td className="px-3 py-3">LaTeX (~1,5 GB) para PDF</td><td className="px-3 py-3">Solo local</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Dillinger</td><td className="px-3 py-3">Edición rápida en navegador</td><td className="px-3 py-3">Gratis, con anuncios</td><td className="px-3 py-3">Solo fuentes del sistema</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">Ninguna</td><td className="px-3 py-3">Puede sincronizar con la nube</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">StackEdit</td><td className="px-3 py-3">Navegador + sync Drive</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Solo fuentes del sistema</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">Ninguna</td><td className="px-3 py-3">Sync de nube opcional</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td><td className="px-3 py-3">Flujo de trabajo VS Code</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Fuentes del sistema; CSS configurable</td><td className="px-3 py-3">PDF, HTML, PNG, JPEG</td><td className="px-3 py-3">VS Code + Chromium (~170MB)</td><td className="px-3 py-3">Solo local</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">md-to-pdf (npm)</td><td className="px-3 py-3">Pipelines de build</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Configurable vía CSS + Puppeteer</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Node.js + Chromium</td><td className="px-3 py-3">Solo local</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Typora</td><td className="px-3 py-3">Editor offline cuidado</td><td className="px-3 py-3">De pago (única vez, no verificado al momento de redacción)</td><td className="px-3 py-3">Fuentes del sistema; depende del tema</td><td className="px-3 py-3">PDF, HTML, DOCX</td><td className="px-3 py-3">Aplicación de escritorio</td><td className="px-3 py-3">Solo local</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Online2PDF</td><td className="px-3 py-3">Conversión de archivos genérica</td><td className="px-3 py-3">Gratis, con anuncios</td><td className="px-3 py-3">Limitado; no nativo de Markdown</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Ninguna</td><td className="px-3 py-3">Archivos subidos al servidor</td></tr>
            </tbody>
          </table></div>

          <h2>Markdown Free</h2>
          <p>Convertidor Markdown basado en navegador: HTML/TXT/DOCX se procesan completamente del lado cliente, mientras que el PDF se genera en infraestructura serverless con archivos en memoria, descartados de inmediato. Construido sobre el principio de que añadir registro, anuncios o trackers arruina una tarea de 30 segundos.</p>
          <p><strong>Manejo de scripts no latinos:</strong> incrusta Noto Sans CJK JP/KR/SC/TC y Noto Sans Devanagari directamente en el pipeline de renderizado PDF. Sin flag de fuente, sin instalación, sin cuadritos.</p>
          <p><strong>Fortalezas:</strong> sin registro, sin cookies de tracking, analytics respetuoso con la privacidad, UI en 10 idiomas, salida DOCX sólida para convertir Markdown generado por IA en documentos Word corporativos.<br /><strong>Debilidades:</strong> límite de 5MB por archivo, sin modo offline (requiere navegador), sin renderizado matemático LaTeX/MathJax, sin procesamiento por lotes (un archivo a la vez), sin estilo PDF personalizable.<br /><strong>Ideal para:</strong> quien necesita convertir Markdown a PDF, DOCX o EPUB ahora mismo sin instalar nada, especialmente con scripts no latinos.</p>
          <p><Link href="/es" className="text-emerald-700 hover:text-emerald-800 hover:underline">markdown.free/es</Link> (también <Link href="/es/markdown-pdf-sin-registro" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF sin registro</Link>, <Link href="/es/convertir-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">README a PDF</Link>)</p>

          <h2>Pandoc</h2>
          <p>Convertidor universal de documentos por línea de comandos, el estándar de oro para uso por lotes y en pipelines. Convierte entre 30+ formatos incluyendo Markdown, LaTeX, DOCX, EPUB y PDF.</p>
          <p><strong>Scripts no latinos:</strong> el motor LaTeX por defecto (<code>pdflatex</code>) no maneja CJK, devanagari, árabe ni hebreo. Para una salida legible hace falta <code>--pdf-engine=xelatex</code> (o <code>lualatex</code>) y <code>-V mainfont=&quot;Noto Sans CJK JP&quot;</code> (o la fuente correspondiente). La fuente Noto debe estar instalada en el sistema.</p>
          <p><strong>Fortalezas:</strong> el convertidor más potente y flexible disponible; ecosistema masivo de plugins/filtros; aceptado universalmente en publicación académica y técnica.<br /><strong>Debilidades:</strong> generar PDF requiere instalar LaTeX (TeX Live ~1,5 GB); curva de aprendizaje empinada; CJK y otros scripts no latinos requieren configuración explícita que el principiante no conocerá.<br /><strong>Ideal para:</strong> pipelines scriptadas, publicación académica, escritores técnicos cómodos con la línea de comandos.</p>
          <p><a href="https://pandoc.org" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">pandoc.org</a></p>

          <h2>Dillinger</h2>
          <p>Editor Markdown en navegador con vista previa en vivo y exportación básica. Open source, instancia alojada en dillinger.io.</p>
          <p><strong>Scripts no latinos:</strong> la vista previa hereda los fallbacks de fuente del navegador; la exportación PDF usa fuentes disponibles en el sistema. Los scripts no latinos pueden verse correctamente en la vista previa pero caer en fuentes por defecto en el PDF, según el sistema del usuario.</p>
          <p><strong>Fortalezas:</strong> editor de panel dividido familiar, gratis, importa/exporta desde Dropbox, Google Drive, GitHub.<br /><strong>Debilidades:</strong> versión alojada con anuncios; el estado del documento puede sincronizarse a servicios cloud conectados; control limitado del estilo PDF.<br /><strong>Ideal para:</strong> ediciones rápidas y exportaciones puntuales en scripts latinos.</p>
          <p><a href="https://dillinger.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">dillinger.io</a></p>

          <h2>StackEdit</h2>
          <p>Editor Markdown en navegador con sólido soporte de sync cloud (Google Drive, Dropbox, GitHub) y soporte MathJax para renderizado matemático.</p>
          <p><strong>Scripts no latinos:</strong> como Dillinger, depende de fuentes de navegador/sistema. Sin Noto integrado.</p>
          <p><strong>Fortalezas:</strong> UI limpia, renderizado matemático, sync cloud para edición multidispositivo.<br /><strong>Debilidades:</strong> la exportación PDF pasa por el pipeline de impresión del navegador, el estilo está limitado a las convenciones del print stylesheet; el sync cloud requiere permisos de Google/Dropbox.<br /><strong>Ideal para:</strong> escritores que quieren un editor Markdown con sync cloud y necesitan matemática MathJax.</p>
          <p><a href="https://stackedit.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">stackedit.io</a></p>

          <h2>Markdown PDF (extensión VS Code)</h2>
          <p>Extensión de VS Code que exporta el archivo Markdown actual a PDF, HTML, PNG o JPEG. Renderiza vía Chromium incluido (descargado en el primer uso, ~170MB).</p>
          <p><strong>Scripts no latinos:</strong> usa el sistema de fuentes de Chromium. CJK y devanagari se renderizan si el sistema operativo tiene las fuentes instaladas (la mayoría de instalaciones modernas de macOS/Windows/Linux las tienen para los principales scripts). Personalizable vía CSS — los usuarios avanzados pueden usar reglas <code>@font-face</code> para incrustar fuentes específicas.</p>
          <p><strong>Fortalezas:</strong> encaja naturalmente en el flujo de VS Code; altamente personalizable vía CSS; solo local — sin dependencia de red una vez descargado Chromium.<br /><strong>Debilidades:</strong> requiere VS Code; el primer uso descarga ~170MB; primera exportación lenta.<br /><strong>Ideal para:</strong> desarrolladores que ya viven en VS Code y quieren una exportación PDF de un solo atajo.</p>
          <p><a href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">VS Code Marketplace</a></p>

          <h2>md-to-pdf (npm)</h2>
          <p>CLI/biblioteca Node.js que convierte Markdown a PDF usando Puppeteer (que incrusta Chromium). Diseñado para pipelines de build y flujos personalizados.</p>
          <p><strong>Scripts no latinos:</strong> usa el sistema de fuentes de Chromium. Personalizable vía inyección de CSS — los usuarios avanzados pueden <code>@import</code> fuentes web (incluido Noto) en el CSS de renderizado.</p>
          <p><strong>Fortalezas:</strong> scriptable, personalizable por temas, rápido para conversión por lotes una vez instalado, open source.<br /><strong>Debilidades:</strong> requiere Node.js y el Chromium de Puppeteer (~170MB en primera instalación); el estilo por defecto necesita trabajo CSS para calidad de producción.<br /><strong>Ideal para:</strong> pipelines de build personalizadas, CI/CD que produce PDFs desde documentación.</p>
          <p><a href="https://github.com/simonhaenisch/md-to-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">github.com/simonhaenisch/md-to-pdf</a></p>

          <h2>Typora</h2>
          <p>Editor Markdown WYSIWYG cuidado para escritorio (macOS, Windows, Linux). Gratis hasta 2021, ahora de pago (licencia única, precio no verificado al momento de redacción — consulta typora.io).</p>
          <p><strong>Scripts no latinos:</strong> sólido out-of-the-box para la mayoría de scripts vía fuentes del sistema. Depende del tema — algunos temas envían stacks optimizados para CJK.</p>
          <p><strong>Fortalezas:</strong> editor WYSIWYG de primera clase; exportación cuidada; manejo sólido de fuentes; sin anuncios ni telemetría una vez licenciado.<br /><strong>Debilidades:</strong> de pago; solo escritorio (sin versión navegador); sin funciones de equipo o nube.<br /><strong>Ideal para:</strong> escritores en solitario que quieren un editor offline cuidado y no les importa una licencia de única vez.</p>
          <p><a href="https://typora.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">typora.io</a></p>

          <h2>Online2PDF</h2>
          <p>Convertidor web genérico que maneja muchos formatos (Word, Excel, PDF, imágenes, etc.). Markdown se admite a través de conversión genérica.</p>
          <p><strong>Scripts no latinos:</strong> limitado y no verificado al momento de redacción. No diseñado como herramienta nativa de Markdown, así que el comportamiento con bloques de código, tablas y fuentes CJK es inconsistente.</p>
          <p><strong>Fortalezas:</strong> maneja muchos formatos más allá de Markdown; sin instalación.<br /><strong>Debilidades:</strong> archivos subidos al servidor (preocupación de privacidad para contenido sensible); interfaz con muchos anuncios; el renderizado de Markdown es genérico — bloques de código, tablas y listas de tareas pueden no renderizar correctamente; estilo no personalizable.<br /><strong>Ideal para:</strong> conversiones puntuales con una mezcla de formatos donde Markdown es incidental.</p>
          <p><a href="https://online2pdf.com" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">online2pdf.com</a></p>

          <h2>Cómo elegir</h2>
          <ul>
            <li><strong>Necesitas convertir un archivo Markdown a PDF/DOCX/EPUB ahora mismo en el navegador, sin registro, especialmente con contenido coreano/japonés/chino/hindi/árabe</strong> → <Link href="/es" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link></li>
            <li><strong>Estás cómodo con la CLI, tienes LaTeX instalado (o puedes hacerlo) y quieres un pipeline scriptado</strong> → Pandoc</li>
            <li><strong>Vives en VS Code y quieres una exportación de un solo atajo</strong> → Markdown PDF (extensión VS Code)</li>
            <li><strong>Estás construyendo un CI/CD que produce PDFs desde Markdown</strong> → md-to-pdf o Pandoc</li>
            <li><strong>Quieres un editor WYSIWYG offline cuidado y no te importa pagar</strong> → Typora</li>
            <li><strong>Necesitas Markdown sincronizado en cloud con soporte matemático</strong> → StackEdit</li>
            <li><strong>Estás haciendo ediciones puntuales solo en scripts latinos</strong> → Dillinger o StackEdit</li>
          </ul>

          <h2>Preguntas frecuentes</h2>
          {faq.map((item, i) => (<div key={i}><h3>{item.q}</h3><p>{item.a}</p></div>))}

          <h2>Transparencia</h2>
          <p>Este artículo lo publica el equipo detrás de <Link href="/es" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>, una de las herramientas comparadas. Hemos intentado ser específicos sobre los casos en que ganan otras herramientas — Pandoc para pipelines scriptadas, Typora para terminado offline, VS Code Markdown PDF para flujos en editor. Los enlaces a competidores usan <code>rel=&quot;nofollow&quot;</code>. Si encuentras un error de hecho, <Link href="/es/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">avísanos</Link> y lo corregiremos.</p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">Prueba Markdown Free — sin instalación, sin registro, sin cuadritos</p>
            <Link href="/es" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800">Abrir Markdown Free<span aria-hidden="true">→</span></Link>
          </div>

          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Páginas relacionadas</h2>
            <ul className="space-y-2">
              <li><Link href="/es/convertir-markdown-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">Convertir Markdown a PDF - Gratis</Link></li>
              <li><Link href="/es/markdown-pdf-sin-registro" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF sin registro</Link></li>
              <li><Link href="/es/convertir-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">README.md a PDF</Link></li>
              <li><Link href="/es/markdown-a-word" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown a Word (DOCX)</Link></li>
            </ul>
          </div>
        </article>
        <Footer locale={locale} dict={dict} />
      </main>
    </ConverterProvider>
  );
}
