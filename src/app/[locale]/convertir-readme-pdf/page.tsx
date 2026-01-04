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
    title: "Convertir README.md a PDF | Markdown Free",
    description:
      "Convierte tu README.md de GitHub en un PDF profesional. Perfecto para documentación, portfolio o presentaciones. Gratis y sin registro.",
    keywords: [
      "convertir readme pdf",
      "readme.md a pdf",
      "github readme pdf",
      "documentación markdown pdf",
      "readme markdown convertidor",
    ],
    alternates: {
      canonical: "/es/convertir-readme-pdf",
    },
    openGraph: {
      title: "Convertir README.md a PDF | Markdown Free",
      description:
        "Convierte tu README.md de GitHub en un PDF profesional. Gratis y sin registro.",
      locale: "es_ES",
    },
  };
}

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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>¿Las imágenes del README se incluyen?</h3>
        <p>
          Las imágenes con URLs absolutas (ej. https://...) se incluyen en el PDF. 
          Las imágenes con rutas relativas podrían no mostrarse correctamente — 
          te recomendamos usar URLs completas.
        </p>

        <h3>¿Puedo convertir otros archivos Markdown del repositorio?</h3>
        <p>
          ¡Por supuesto! Funciona con cualquier archivo <code>.md</code>: CHANGELOG.md, 
          CONTRIBUTING.md, documentación en la carpeta /docs, etc.
        </p>

        <h3>¿El formato del PDF es personalizable?</h3>
        <p>
          Actualmente el PDF usa un diseño profesional optimizado para legibilidad. 
          Estamos evaluando opciones de personalización para versiones futuras.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Transforma tu README en un documento profesional
          </p>
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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
              <Link href="/es/convertir-markdown-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Convertir Markdown a PDF Gratis
              </Link>
            </li>
            <li>
              <Link href="/es/markdown-pdf-sin-registro" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown a PDF Sin Registro
              </Link>
            </li>
            <li>
              <Link href="/es/comparacion-convertidores-markdown" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Comparación de Convertidores Markdown
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

