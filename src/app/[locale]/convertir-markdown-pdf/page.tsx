import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

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
    title: "Convertir Markdown a PDF Gratis | Markdown Free",
    description:
      "Convierte tus archivos Markdown a PDF gratis. Sin registro, sin límites, privacidad garantizada. Arrastra el archivo y descarga el PDF en segundos.",
    keywords: [
      "convertir markdown a pdf",
      "markdown a pdf gratis",
      "convertidor markdown pdf",
      "md to pdf español",
      "markdown pdf gratuito",
    ],
    alternates: {
      canonical: "/es/convertir-markdown-pdf",
    },
    openGraph: {
      title: "Convertir Markdown a PDF Gratis | Markdown Free",
      description:
        "Convierte tus archivos Markdown a PDF gratis. Sin registro, privacidad garantizada.",
      locale: "es_ES",
    },
  };
}

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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>¿Es realmente gratis?</h3>
        <p>
          ¡Sí! Markdown Free es completamente gratuito. No hay planes premium, 
          límites diarios ni funciones ocultas de pago.
        </p>

        <h3>¿Mis archivos están seguros?</h3>
        <p>
          Absolutamente. La vista previa se genera directamente en tu navegador. 
          Para la conversión a PDF, el contenido se procesa en memoria y se elimina 
          inmediatamente — nunca guardamos tus archivos.
        </p>

        <h3>¿Cuál es el límite de tamaño?</h3>
        <p>
          Puedes subir archivos de hasta 5 MB — más que suficiente para cualquier 
          documento Markdown.
        </p>

        <h3>¿Funciona en móvil?</h3>
        <p>
          ¡Sí! La interfaz está optimizada para smartphones y tablets.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            ¿Listo para convertir tu Markdown?
          </p>
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Prueba Gratis Ahora
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

