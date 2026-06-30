import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { hreflangAlternates } from "@/lib/tool-links";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for Spanish locale
export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "es") {
    return {};
  }

  return {
    title: "Convertir Markdown a PDF Gratis — Online, Sin Registro (2026) | Markdown Free",
    description:
      "Convertidor Markdown a PDF online gratuito: arrastra el archivo .md, descarga el PDF en segundos. Sin registro, sin instalación, sin marca de agua. Tablas GFM, checklists y bloques de código se conservan. Versión 2026.",
    keywords: [
      "convertir markdown a pdf",
      "markdown a pdf gratis",
      "convertidor markdown pdf",
      "md to pdf español",
      "markdown pdf gratuito",
      "markdown a pdf sin registro",
      "convertidor markdown online 2026",
    ],
    alternates: {
      canonical: "/es/convertir-markdown-pdf",
      languages: hreflangAlternates("pdf"),
    },
    openGraph: {
      title: "Convertir Markdown a PDF Gratis — Online, Sin Registro (2026)",
      description:
        "Arrastra .md, descarga PDF. Sin registro, sin instalación, sin marca de agua.",
      locale: "es_ES",
    },
  };
}

const faq = [
  { q: "¿Cómo convierto un archivo Markdown a PDF?", a: "Abre Markdown Free, arrastra el archivo .md a la zona de carga (o pega el texto Markdown), revisa la vista previa y haz clic en \"A PDF\" para descargar. Todo el proceso toma unos 10 segundos, sin registro ni instalación." },
  { q: "¿El convertidor Markdown a PDF es realmente gratis?", a: "Sí. Markdown Free es 100% gratis sin niveles premium, sin registro, sin límites de uso y sin marca de agua en el PDF exportado." },
  { q: "¿Puedo convertir Markdown a PDF sin registrarme?", a: "Sí. Markdown Free no requiere cuenta. Los archivos se procesan en tu navegador (HTML/TXT) o en memoria serverless (PDF/DOCX/EPUB) y nunca se almacenan." },
  { q: "¿Puedo convertir un README.md de GitHub a PDF?", a: "Sí. Abre el README.md del repositorio en GitHub, haz clic en \"Raw\" y guarda el archivo, luego súbelo a Markdown Free y expórtalo a PDF. Funciona también para CHANGELOG.md, CONTRIBUTING.md y cualquier archivo .md." },
  { q: "¿Mis archivos Markdown se guardan en vuestros servidores?", a: "No. Los PDFs se generan en memoria serverless y se descartan inmediatamente. Las exportaciones HTML y TXT se procesan completamente en tu navegador y nunca salen de tu equipo." },
  { q: "¿Cuál es el límite de tamaño de archivo?", a: "Actualmente 5MB por archivo, lo que cubre prácticamente cualquier documento Markdown real (~750.000 palabras de Markdown plano)." },
  { q: "¿Las tablas, bloques de código y checklists GFM se conservan en el PDF?", a: "Sí. Todas las funciones GFM — tablas, bloques de código (con resaltado de sintaxis), checklists, tachado, autolink — se preservan correctamente en la salida PDF." },
  { q: "¿Funciona sin instalación?", a: "Sí. Markdown Free se ejecuta completamente en el navegador — sin instalación, plugins ni extensiones." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "es",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function ConvertirMarkdownPdfPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  // Only render for Spanish
  if (localeParam !== "es") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Convertir Markdown a PDF Gratis</h1>
        
        <p className="lead text-lg text-slate-600">
          ¿Tienes un archivo <code>.md</code> y quieres convertirlo en un PDF profesional? 
          Con Markdown Free puedes hacerlo en segundos, sin registro y sin costo.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Comenzar Ahora — Es Gratis
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Cómo Funciona</h2>
        <ol>
          <li>
            <strong>Sube el archivo</strong> — Arrastra tu archivo <code>.md</code> o <code>.markdown</code> al área de carga
          </li>
          <li>
            <strong>Vista previa</strong> — Visualiza tu Markdown formateado instantáneamente
          </li>
          <li>
            <strong>Descarga PDF</strong> — Haz clic en &quot;A PDF&quot; y descarga tu documento
          </li>
        </ol>

        <h2>¿Por Qué Elegir Markdown Free?</h2>
        <ul>
          <li>
            <strong>100% Gratis</strong> — Sin costos ocultos, sin suscripciones
          </li>
          <li>
            <strong>Sin Registro</strong> — No pedimos email ni datos personales
          </li>
          <li>
            <strong>Privacidad Total</strong> — Los archivos nunca se guardan en nuestros servidores
          </li>
          <li>
            <strong>Rápido</strong> — Conversión en pocos segundos
          </li>
          <li>
            <strong>Soporte GFM</strong> — Tablas, checklists, tachado y mucho más
          </li>
        </ul>

        <h2>Formatos Soportados</h2>
        <p>
          Además de PDF, puedes exportar a:
        </p>
        <ul>
          <li><strong>HTML</strong> — Para publicar en la web</li>
          <li><strong>TXT</strong> — Texto simple sin formato</li>
        </ul>

        <h2>Preguntas Frecuentes</h2>

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            ¿Listo para convertir tu Markdown?
          </p>
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Prueba Gratis Ahora
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Recursos Relacionados</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/es/markdown-pdf-sin-registro" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown a PDF Sin Registro
              </Link>
            </li>
            <li>
              <Link href="/es/convertir-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Convertir README.md a PDF
              </Link>
            </li>
            <li>
              <Link href="/es/comparacion-convertidores-markdown" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Comparación de Convertidores Markdown
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

