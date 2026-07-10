import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for the es locale
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
    title: "Convertir Markdown a Imagen PNG – Gratis, Privado, Sin Registro | Markdown Free",
    description: "Convierte Markdown en una imagen PNG o JPG nítida directamente en tu navegador. Gratis, sin registro, sin subir nada. Los documentos largos se exportan como una imagen larga o un ZIP por partes.",
    keywords: ["markdown a png", "markdown a imagen", "markdown a jpg", "md a png", "convertir markdown en imagen"],
    alternates: {
      canonical: "/es/markdown-a-png",
      languages: hreflangAlternates("image"),
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og-markdown-to-png.png"],
    },
    openGraph: {
      images: [{ url: "/og-markdown-to-png.png", width: 1200, height: 630, alt: "Markdown to Image (PNG) — Markdown Free" }],
      title: "Convertir Markdown a Imagen PNG – Gratis, Privado, Sin Registro | Markdown Free",
      description: "Renderiza tu archivo .md como una imagen PNG nítida, todo en tu navegador. Gratis y privado.",
      locale: "es_ES",
    },
  };
}

const faq = [
  {
    "question": "¿Es gratis este conversor de Markdown a PNG?",
    "answer": "¡Sí! Markdown Free es 100% gratuito, sin costes ocultos, planes premium ni registro."
  },
  {
    "question": "¿Cómo se manejan los documentos largos?",
    "answer": "Los documentos de hasta unas diez pantallas siempre se exportan como una sola imagen. Los más largos te dejan elegir: una imagen larga (fácil de compartir) o un ZIP de partes del tamaño de pantalla (más nítido para documentos muy largos)."
  },
  {
    "question": "¿Se sube mi Markdown a un servidor?",
    "answer": "No. La imagen se renderiza completamente en tu navegador: tu Markdown nunca sale de tu dispositivo. Solo las imágenes remotas referenciadas en tu documento pueden pasar por nuestro proxy para aparecer en el resultado."
  },
  {
    "question": "¿Se verán bien los acentos y caracteres especiales?",
    "answer": "Sí. La imagen se rasteriza con las fuentes de tu propio dispositivo, así que el texto sale exactamente como lo ves en la vista previa."
  },
  {
    "question": "¿Puedo exportar JPG en lugar de PNG?",
    "answer": "Sí. La exportación a JPG está en el menú Más formatos. Para texto se recomienda PNG porque no tiene pérdida y los bordes de las letras quedan perfectamente nítidos."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "es",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default async function MarkdownAPngPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (localeParam !== "es") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Convertir Markdown a Imagen (PNG) – Herramienta Gratuita
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Convierte tu Markdown en una imagen PNG o JPG nítida, renderizada completamente en tu navegador. Perfecto para compartir notas en apps de chat, publicar texto formateado en redes sociales o insertar fragmentos en presentaciones.
        </p>
        <Link
          href="/es"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          Empezar a Convertir <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why Image Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          ¿Por qué convertir Markdown a imagen?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Comparte en cualquier lugar</strong> – las imágenes funcionan en todas las apps de chat, redes sociales y presentaciones, incluso donde el Markdown no.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Texto nítido</strong> – el renderizado usa la densidad de píxeles de tu dispositivo, así el texto queda nítido en lugar de parecer una captura borrosa.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Documentos largos</strong> – exporta un artículo completo como una sola imagen larga, o divídelo en un ZIP por partes.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>100% en tu navegador</strong> – no se sube nada; tu Markdown nunca sale de tu dispositivo.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Cómo convertir Markdown a PNG
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
            <div>
              <h3 className="font-medium text-slate-900">Sube o pega</h3>
              <p className="text-sm text-slate-600">Arrastra tu archivo .md o pega el texto Markdown directamente.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
            <div>
              <h3 className="font-medium text-slate-900">Previsualiza</h3>
              <p className="text-sm text-slate-600">Ve tu documento formateado en tiempo real antes de convertir.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
            <div>
              <h3 className="font-medium text-slate-900">Exporta a imagen</h3>
              <p className="text-sm text-slate-600">Haz clic en A Imagen (PNG) y tu imagen se descarga al instante. JPG está en Más formatos.</p>
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
          {faq.map((item) => (
            <details key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related tool suite cross-links */}
      <RelatedTools locale={locale} current="image" />

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/es"
          className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          Convierte Markdown a PNG Ahora <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Gratis &bull; Sin registro &bull; Descarga instantánea
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
