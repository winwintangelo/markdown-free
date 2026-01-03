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
    title: "Markdown a PDF Sin Registro | Markdown Free",
    description:
      "Convierte Markdown a PDF sin crear una cuenta. Cero login, cero email, cero seguimiento. Sube, convierte y descarga — así de simple.",
    keywords: [
      "markdown pdf sin registro",
      "convertir md pdf sin cuenta",
      "markdown a pdf anónimo",
      "pdf desde markdown sin login",
      "conversión markdown gratis",
    ],
    alternates: {
      canonical: "/es/markdown-pdf-sin-registro",
    },
    openGraph: {
      title: "Markdown a PDF Sin Registro | Markdown Free",
      description:
        "Convierte Markdown a PDF sin crear una cuenta. Cero login, cero seguimiento.",
      locale: "es_ES",
    },
  };
}

export default async function MarkdownPdfSinRegistroPage({
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
        <h1>Markdown a PDF Sin Registro</h1>
        
        <p className="lead text-lg text-slate-600">
          ¿Cansado de crear cuentas para cada herramienta online? Con Markdown Free 
          conviertes tus archivos Markdown a PDF sin registro, sin email, sin seguimiento.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Convertir Ahora — Sin Login
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Por Qué &quot;Sin Registro&quot; Importa</h2>
        <p>
          Muchos convertidores online te obligan a crear una cuenta. ¿Por qué?
        </p>
        <ul>
          <li>Para venderte suscripciones premium</li>
          <li>Para enviarte emails de marketing</li>
          <li>Para rastrear tus actividades</li>
          <li>Para monetizar tus datos</li>
        </ul>
        <p>
          <strong>Nosotros no.</strong> Markdown Free es una herramienta simple que hace 
          una cosa y la hace bien — sin pedirte nada a cambio.
        </p>

        <h2>Cómo Funciona</h2>
        <ol>
          <li>Ve a Markdown Free</li>
          <li>Arrastra tu archivo <code>.md</code></li>
          <li>Haz clic en &quot;A PDF&quot;</li>
          <li>Descarga — ¡listo!</li>
        </ol>
        <p>
          Sin formularios que llenar. Sin &quot;verifica tu email&quot;. 
          Sin &quot;inicia tu prueba gratuita&quot;.
        </p>

        <h2>Nuestra Promesa de Privacidad</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Sin cuenta requerida</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Sin cookies de seguimiento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Los archivos nunca se guardan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Conexión HTTPS encriptada</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Analytics respetuoso con la privacidad (Umami)</span>
            </li>
          </ul>
        </div>

        <h2>Preguntas Frecuentes</h2>

        <h3>¿De verdad no tengo que registrarme?</h3>
        <p>
          ¡Exacto! Ni siquiera existe un botón &quot;Registrarse&quot; en nuestro sitio. 
          Abre la página, convierte el archivo, cierra la página. Fin.
        </p>

        <h3>¿Cómo ganan dinero entonces?</h3>
        <p>
          Markdown Free es un proyecto personal. No buscamos monetizar tus datos 
          ni venderte servicios. Es simplemente una herramienta útil que queríamos que existiera.
        </p>

        <h3>¿Puedo confiar al subir documentos sensibles?</h3>
        <p>
          La vista previa se procesa completamente en tu navegador. Para la generación de PDF, 
          el contenido se procesa en memoria en el servidor y se elimina inmediatamente. 
          No guardamos, no registramos, no analizamos tus archivos.
        </p>

        <h3>¿Hay un límite diario?</h3>
        <p>
          ¡No! Convierte cuantos archivos quieras, cuando quieras.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Cero registro. Cero complicaciones.
          </p>
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Comienza Ya
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

