import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

// This page is only for es locale
export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown a Word (DOCX) – Conversor Online Gratis | Markdown Free",
    description: "Convierte archivos Markdown a documentos Word (DOCX) al instante. 100% gratis, sin registro, sin anuncios. Tus archivos se procesan de forma segura y nunca se almacenan.",
    keywords: [
      "markdown a word",
      "markdown a docx",
      "convertir markdown a word",
      "convertidor markdown word",
      "md a word",
    ],
    alternates: {
      canonical: "https://www.markdown.free/es/markdown-a-word",
      languages: {
        "en": "/markdown-to-word",
        "id": "/id/markdown-ke-word",
        "ja": "/ja/markdown-word-henkan",
        "es": "/es/markdown-a-word",
        "ko": "/ko/markdown-word-byeonhwan",
        "vi": "/vi/markdown-sang-word",
        "zh-Hans": "/zh-Hans/markdown-zhuanhuan-word",
        "zh-Hant": "/zh-Hant/markdown-word-zhuanhuan",
        "it": "/it/markdown-in-word",
        "x-default": "/markdown-to-word",
      },
    },
    openGraph: {
      title: "Markdown a Word (DOCX) – Conversor Online Gratis",
      description: "Convierte archivos .md a formato Microsoft Word. Gratis, privado, descarga instantánea.",
      url: "https://www.markdown.free/es/markdown-a-word",
      type: "website",
      locale: "es_ES",
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownAWordPage({ params }: PageProps) {
  const { locale } = await params;

  // Only allow es
  if (locale !== "es") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Convertir Markdown a Word (DOCX) – Herramienta Gratis
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Transforma tus archivos Markdown en documentos profesionales de Microsoft Word.
            Perfecto para compartir documentación con colegas, entregar informes
            o crear documentos editables a partir de tus notas.
          </p>
          <Link
            href="/es"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Comenzar a Convertir →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            ¿Por qué convertir Markdown a Word?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Compatibilidad universal</strong> – Los documentos Word (.docx) funcionan en todas partes: Microsoft Office, Google Docs, LibreOffice.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Salida editable</strong> – A diferencia del PDF, los archivos Word/DOCX pueden ser editados fácilmente por los destinatarios.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Formato profesional</strong> – Tablas, bloques de código y encabezados se conservan como estilos de Word.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Listo para empresas</strong> – Ideal para entregar documentación, informes o propuestas en entornos corporativos.</span>
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            ¿Quién usa la conversión de Markdown a Word?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Estudiantes</h3>
              <p className="text-sm text-slate-600">Convierte borradores de tesis y trabajos de Markdown a Word para entregar.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Desarrolladores</h3>
              <p className="text-sm text-slate-600">Transforma archivos README y documentación técnica en especificaciones Word para no técnicos.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Escritores</h3>
              <p className="text-sm text-slate-600">Exporta manuscritos escritos en Markdown a Word para edición y colaboración.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Equipos</h3>
              <p className="text-sm text-slate-600">Comparte documentos Markdown como archivos Word con colegas que prefieren Office.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Cómo convertir Markdown a Word (DOCX)
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Sube o pega</h3>
                <p className="text-sm text-slate-600">Arrastra y suelta tu archivo .md, o pega el texto Markdown directamente.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Previsualiza</h3>
                <p className="text-sm text-slate-600">Ve tu documento formateado en tiempo real antes de convertir.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Exporta a Word</h3>
                <p className="text-sm text-slate-600">Haz clic en "A DOCX" y descarga tu documento Word al instante.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Privacidad y Seguridad
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Los archivos se procesan temporalmente en memoria</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Nunca se almacenan en servidores</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Conexión cifrada HTTPS</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>No requiere crear cuenta</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                ¿Este convertidor de Markdown a Word es gratis?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                ¡Sí! Markdown Free es 100% gratis sin costos ocultos, planes premium ni requisitos de registro.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                ¿Cuál es la diferencia entre Word y DOCX?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                DOCX es el formato de archivo utilizado por Microsoft Word desde 2007. Cuando decimos "documento Word", nos referimos a un archivo .docx que se abre en Word, Google Docs, LibreOffice y otros procesadores de texto.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                ¿Mis archivos se almacenan en sus servidores?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                No. Los archivos se procesan en memoria y se eliminan inmediatamente después de la conversión. Nunca almacenamos tu contenido.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                ¿Se conserva el formato como tablas y bloques de código?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                ¡Sí! Las tablas, bloques de código, encabezados, listas y otros formatos Markdown se convierten a los estilos apropiados de Word.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/es"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Convertir Markdown a Word Ahora →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Gratis • Sin registro • Descarga instantánea
          </p>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
