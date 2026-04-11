import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";

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
    title: "Convertir Markdown a EPUB Gratis | Markdown Free",
    description:
      "Convierte tus archivos Markdown a EPUB gratis. Sin registro, sin l&iacute;mites. Perfecto para leer en Kindle, Apple Books, Kobo y otros lectores electr&oacute;nicos.",
    keywords: [
      "convertir markdown a epub",
      "markdown epub gratis",
      "convertidor markdown epub",
      "md a epub espa&ntilde;ol",
      "markdown ebook gratuito",
    ],
    alternates: {
      canonical: "/es/convertir-markdown-epub",
    },
    openGraph: {
      title: "Convertir Markdown a EPUB Gratis | Markdown Free",
      description:
        "Convierte tus archivos Markdown a EPUB gratis. Sin registro, privacidad garantizada.",
      locale: "es_ES",
    },
  };
}

export default async function ConvertirMarkdownEpubPage({
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Convertir Markdown a EPUB Gratis
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Transforma tus archivos Markdown en ebooks EPUB. Perfecto para leer
          documentaci&oacute;n en Kindle, Apple Books, Kobo o cualquier lector electr&oacute;nico.
          Genera autom&aacute;ticamente &iacute;ndice y cap&iacute;tulos a partir de tus encabezados.
        </p>
        <Link
          href="/es"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Empieza Ahora — Es Gratis <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why EPUB Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          &iquest;Por Qu&eacute; Convertir Markdown a EPUB?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Lee en cualquier lugar</strong> – EPUB funciona en Kindle, Apple Books, Kobo, Google Play Libros y todos los principales lectores electr&oacute;nicos.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Texto adaptable</strong> – A diferencia del PDF, el contenido EPUB se adapta al tama&ntilde;o de pantalla, preferencias de fuente y modos de lectura.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Cap&iacute;tulos autom&aacute;ticos</strong> – Los encabezados de tu Markdown se convierten en cap&iacute;tulos navegables con un &iacute;ndice autom&aacute;tico.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Lectura sin conexi&oacute;n</strong> – Descarga una vez, lee en cualquier lugar sin necesidad de internet.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          C&oacute;mo Convertir Markdown a EPUB
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
            <div>
              <h3 className="font-medium text-slate-900">Sube o Pega</h3>
              <p className="text-sm text-slate-600">Arrastra tu archivo .md o pega el texto Markdown directamente.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
            <div>
              <h3 className="font-medium text-slate-900">Vista Previa</h3>
              <p className="text-sm text-slate-600">Visualiza tu documento formateado en tiempo real antes de convertir.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
            <div>
              <h3 className="font-medium text-slate-900">Exportar a EPUB</h3>
              <p className="text-sm text-slate-600">Haz clic en &ldquo;A EPUB&rdquo; y descarga tu ebook al instante.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-4">
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              &iquest;Es gratis el convertidor de Markdown a EPUB?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              &iexcl;S&iacute;! Markdown Free es 100% gratuito sin costos ocultos, planes premium ni registro obligatorio.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              &iquest;Funciona el EPUB en Kindle?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              S&iacute;. Los Kindle modernos soportan EPUB de forma nativa. Para modelos m&aacute;s antiguos, puedes usar la funci&oacute;n &ldquo;Enviar a Kindle&rdquo; o Calibre para convertir EPUB a MOBI.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              &iquest;C&oacute;mo se generan los cap&iacute;tulos?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Markdown Free divide autom&aacute;ticamente tu documento en cap&iacute;tulos en los encabezados H1 (o H2 si no hay H1) y genera un &iacute;ndice navegable.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              &iquest;Se almacenan mis archivos en sus servidores?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              No. Tus archivos se procesan en memoria y se eliminan inmediatamente despu&eacute;s de la conversi&oacute;n. Nunca almacenamos tu contenido.
            </p>
          </details>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Herramientas Relacionadas</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/es" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown a PDF
          </Link>
          <Link href="/es/convertir-markdown-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            Convertir Markdown a PDF
          </Link>
          <Link href="/es/convertir-readme-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            Convertir README a PDF
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/es"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Convierte Markdown a EPUB Ahora <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Gratis &bull; Sin registro &bull; Descarga instant&aacute;nea
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
