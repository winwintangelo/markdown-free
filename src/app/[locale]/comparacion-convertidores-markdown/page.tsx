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
    title: "Markdown Free vs CloudConvert, LightPDF, PDFForge | Comparación 2026",
    description:
      "Comparación entre los mejores convertidores Markdown a PDF. Descubre por qué Markdown Free es la mejor opción: gratis, sin registro, privacidad garantizada.",
    keywords: [
      "markdown free vs cloudconvert",
      "markdown free vs lightpdf",
      "comparación convertidores markdown",
      "mejor convertidor markdown pdf",
      "alternativa cloudconvert gratis",
    ],
    alternates: {
      canonical: "/es/comparacion-convertidores-markdown",
    },
    openGraph: {
      title: "Markdown Free vs CloudConvert, LightPDF, PDFForge",
      description:
        "Comparación entre los mejores convertidores Markdown a PDF. Gratis, sin registro.",
      locale: "es_ES",
    },
  };
}

export default async function ComparacionConvertidoresPage({
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
        <h1>Markdown Free vs Otros Convertidores</h1>
        
        <p className="lead text-lg text-slate-600">
          ¿Buscas el mejor convertidor Markdown a PDF? Aquí tienes una comparación 
          honesta entre Markdown Free y las alternativas más populares.
        </p>

        {/* Comparison Table */}
        <div className="not-prose my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Característica</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-700">Markdown Free</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">CloudConvert</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">LightPDF</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">PDFForge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">100% Gratis</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Límites diarios</td>
                <td className="px-4 py-3 text-center text-slate-500">Límites diarios</td>
                <td className="px-4 py-3 text-center text-slate-500">Solo escritorio</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Sin Registro</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Privacidad (sin archivos guardados)</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Archivos guardados temp.</td>
                <td className="px-4 py-3 text-center text-slate-500">Cloud storage</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓ (local)</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Vista Previa en Vivo</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">GitHub Flavored Markdown</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Parcial</td>
                <td className="px-4 py-3 text-center text-slate-500">Parcial</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Export HTML/TXT</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-slate-500">Solo PDF</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Interfaz en Español</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-emerald-700">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Por Qué Elegir Markdown Free</h2>

        <h3>🆓 Realmente Gratis</h3>
        <p>
          Mientras CloudConvert y LightPDF ofrecen planes gratuitos con límites severos 
          (25 conversiones/día), Markdown Free es completamente gratis sin ningún límite. 
          No existe un plan &quot;Pro&quot; porque todas las funciones ya están disponibles.
        </p>

        <h3>🔒 Privacidad Primero</h3>
        <p>
          CloudConvert y LightPDF guardan tus archivos en sus servidores (aunque sea 
          temporalmente). Markdown Free nunca guarda tus archivos — la vista previa 
          se genera en el navegador, y el PDF se crea en memoria y se elimina inmediatamente.
        </p>

        <h3>⚡ Simplicidad</h3>
        <p>
          Sin cuentas que crear, sin dashboards complicados, sin &quot;créditos&quot; que 
          gestionar. Abre la página, arrastra el archivo, descarga el PDF. Listo.
        </p>

        <h3>👁️ Vista Previa en Tiempo Real</h3>
        <p>
          A diferencia de otros convertidores, Markdown Free muestra una vista previa 
          formateada de tu documento antes de convertirlo. Puedes verificar que tablas, 
          código y formato estén correctos.
        </p>

        <h2>Cuándo Usar las Alternativas</h2>
        <p>
          Para ser honestos, aquí está cuándo podrías preferir otras soluciones:
        </p>
        <ul>
          <li>
            <strong>CloudConvert</strong> — Si necesitas convertir entre docenas 
            de formatos diferentes (no solo Markdown)
          </li>
          <li>
            <strong>PDFForge</strong> — Si prefieres una aplicación de escritorio 
            instalada localmente
          </li>
          <li>
            <strong>Pandoc</strong> — Si eres desarrollador y quieres control total 
            sobre la conversión vía línea de comandos
          </li>
        </ul>

        <h2>Pruébalo Tú Mismo</h2>
        <p>
          ¿La mejor manera de decidir? Prueba Markdown Free — literalmente toma 
          10 segundos.
        </p>

        {/* CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Sin límites. Sin cuenta. Sin costo.
          </p>
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Prueba Markdown Free
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
              <Link href="/es/convertir-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Convertir README.md a PDF
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

