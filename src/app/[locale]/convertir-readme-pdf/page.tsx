import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/tool-links";

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
    title: "Convertir README.md a PDF — Gratis Online, Sin Registro (2026) | Markdown Free",
    description:
      "Convierte cualquier README.md de GitHub a un PDF profesional en segundos. Arrastra el archivo .md, descarga el PDF — gratis, sin registro, sin instalación, sin marca de agua. Tablas GFM, checklists y bloques de código se conservan. Versión 2026.",
    keywords: [
      "convertir readme pdf",
      "readme.md a pdf",
      "github readme a pdf",
      "convertir readme gratis",
      "readme pdf sin registro",
      "github markdown pdf 2026",
      "readme.md pdf español",
    ],
    alternates: {
      canonical: "/es/convertir-readme-pdf",
      languages: hreflangAlternates("readme"),
    },
    openGraph: {
      title: "Convertir README.md a PDF — Gratis Online, Sin Registro (2026)",
      description:
        "Convertidor README→PDF gratis. Arrastra .md, descarga PDF. Sin registro, sin instalación.",
      locale: "es_ES",
    },
  };
}

const faq = [
  { q: "¿Cómo convierto un README de GitHub a PDF?", a: "Abre Markdown Free, arrastra el archivo README.md a la zona de carga (o pega el contenido), revisa la vista previa y haz clic en Exportar a PDF. Sin registro, sin instalación, en unos 10 segundos." },
  { q: "¿Cómo descargo un README de GitHub como PDF?", a: "Abre el README.md del repositorio en GitHub, haz clic en \"Raw\" y guarda la página como archivo .md, luego súbelo a Markdown Free y expórtalo a PDF. Todo el flujo permanece en tu navegador." },
  { q: "¿El convertidor README a PDF es gratis?", a: "Sí. Markdown Free es 100% gratis sin nivel premium, sin registro, sin límites de uso y sin marca de agua en el PDF exportado." },
  { q: "¿Puedo convertir README.md a PDF sin registrarme?", a: "Sí. Markdown Free no requiere cuenta. Los archivos se procesan en tu navegador (HTML/TXT) o en memoria serverless (PDF/DOCX/EPUB) y nunca se almacenan." },
  { q: "¿Las imágenes de mi README se incluyen en el PDF?", a: "Sí para URLs absolutas (https://...). Las rutas relativas del repositorio (./images/foo.png) no se resuelven fuera de GitHub — sustitúyelas por la URL de raw.githubusercontent.com antes de convertir." },
  { q: "¿Puedo convertir CHANGELOG.md, CONTRIBUTING.md u otros archivos Markdown?", a: "Sí. Cualquier archivo .md o .markdown funciona — README.md, CHANGELOG.md, CONTRIBUTING.md, documentación en /docs, todos." },
  { q: "¿Hay un límite de tamaño de archivo para la conversión README a PDF?", a: "Sí — 5MB por archivo, lo que cubre prácticamente cualquier README y archivo de documentación real (~750.000 palabras de Markdown plano)." },
  { q: "¿Mis archivos README se guardan en vuestros servidores?", a: "No. Los PDFs se generan en memoria serverless y se descartan inmediatamente. Las exportaciones HTML y TXT se procesan completamente en tu navegador y nunca salen de tu equipo." },
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

export default async function ConvertirReadmePdfPage({
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
        <h1>Convertir README.md a PDF</h1>
        
        <p className="lead text-lg text-slate-600">
          ¿Tienes un proyecto en GitHub con un buen README.md? Transfórmalo en un PDF 
          profesional para tu documentación, portfolio o presentaciones.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Convierte Tu README
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>¿Por Qué Convertir un README a PDF?</h2>
        <ul>
          <li>
            <strong>Documentación offline</strong> — Comparte la documentación 
            incluso sin acceso a internet
          </li>
          <li>
            <strong>Portfolio profesional</strong> — Presenta tus proyectos 
            de manera elegante
          </li>
          <li>
            <strong>Presentaciones</strong> — Incluye la documentación técnica 
            en tus diapositivas
          </li>
          <li>
            <strong>Archivo</strong> — Conserva una versión estática de la 
            documentación
          </li>
          <li>
            <strong>Impresión</strong> — Documentos en papel para reuniones o revisiones
          </li>
        </ul>

        <h2>Soporte Completo para GitHub Flavored Markdown</h2>
        <p>
          Markdown Free soporta todas las funciones de GitHub Flavored Markdown (GFM):
        </p>
        <ul>
          <li>✓ Tablas</li>
          <li>✓ Checklist / Lista de tareas</li>
          <li>✓ Tachado (strikethrough)</li>
          <li>✓ Resaltado de sintaxis para código</li>
          <li>✓ Links automáticos</li>
          <li>✓ Emojis :smile:</li>
        </ul>

        <h2>Cómo Convertir Tu README</h2>
        <ol>
          <li>
            <strong>Descarga el README</strong> — Ve a tu repositorio en GitHub, 
            haz clic en README.md, luego en &quot;Raw&quot;, y guarda el archivo
          </li>
          <li>
            <strong>Sube a Markdown Free</strong> — Arrastra el archivo al área 
            de carga
          </li>
          <li>
            <strong>Verifica la vista previa</strong> — Comprueba que todo esté 
            formateado correctamente
          </li>
          <li>
            <strong>Exporta</strong> — Haz clic en &quot;A PDF&quot; y descarga
          </li>
        </ol>

        <h2>Ejemplo: README Típico</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# Nombre del Proyecto

Breve descripción del proyecto.

## Instalación

\`\`\`bash
npm install nombre-proyecto
\`\`\`

## Uso

\`\`\`javascript
import { funcion } from 'nombre-proyecto';
funcion();
\`\`\`

## Características

- [x] Feature completada
- [ ] Feature en desarrollo

## Licencia

MIT`}</pre>
        </div>
        <p>
          Este README se convierte en un PDF con formato perfecto: 
          títulos, bloques de código con resaltado de sintaxis, checklists y todo lo demás.
        </p>

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
            Transforma tu README en un documento profesional
          </p>
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Prueba Ahora — Gratis
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Recursos Relacionados</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/es/convertir-markdown-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Convertir Markdown a PDF Gratis
              </Link>
            </li>
            <li>
              <Link href="/es/markdown-pdf-sin-registro" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown a PDF Sin Registro
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

