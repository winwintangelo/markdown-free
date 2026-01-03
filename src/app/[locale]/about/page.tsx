import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { 
  isValidLocale, 
  getDictionary,
  locales,
  type Locale 
} from "@/i18n";

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  
  const titles: Record<Locale, string> = {
    en: "About",
    it: "Chi Siamo",
    es: "Acerca de",
  };
  
  const descriptions: Record<Locale, string> = {
    en: "Learn about Markdown Free - a fast, free, web-based Markdown viewer and converter. No signup required.",
    it: "Scopri Markdown Free - un visualizzatore e convertitore Markdown gratuito, veloce e basato sul web. Nessuna registrazione richiesta.",
    es: "Conoce Markdown Free - un visor y convertidor de Markdown gratuito, rápido y basado en web. Sin necesidad de registro.",
  };
  
  return {
    title: titles[locale],
    description: descriptions[locale],
  };
}

// Localized content
const content: Record<Locale, {
  title: string;
  lead: string;
  whatIs: { title: string; text: string };
  whyBuilt: { title: string; text1: string; text2: string };
  principles: { title: string; items: { title: string; text: string }[] };
  howItWorks: { title: string; steps: { title: string; text: string }[] };
  technical: { title: string; items: { title: string; text: string }[] };
  contact: { title: string; text: string };
}> = {
  en: {
    title: "About Markdown Free",
    lead: "A fast, free, web-based Markdown viewer and converter with an ultra-simple flow.",
    whatIs: {
      title: "What is Markdown Free?",
      text: "Markdown Free lets you upload a .md file, preview it instantly with beautiful formatting, then export to PDF, TXT, or HTML with a single click. No signup required, no complex interfaces—just drag, drop, and download."
    },
    whyBuilt: {
      title: "Why we built this",
      text1: "We noticed that many people receive Markdown files but don't have an easy way to view or convert them. Existing tools often require sign-ups, have complex interfaces, or raise privacy concerns.",
      text2: "Markdown Free solves this with a single-purpose tool that anyone can understand in under 3 seconds and complete their task in under 30 seconds."
    },
    principles: {
      title: "Our principles",
      items: [
        { title: "Free forever", text: "No accounts, no subscriptions, no hidden costs" },
        { title: "Privacy first", text: "Files are processed temporarily and never stored on our servers" },
        { title: "Simple by design", text: "One page, three buttons, done" },
        { title: "Open and transparent", text: "What you see is what you get" }
      ]
    },
    howItWorks: {
      title: "How it works",
      steps: [
        { title: "Upload", text: "Drag & drop your .md, .markdown, or .txt file" },
        { title: "Preview", text: "See your formatted Markdown instantly" },
        { title: "Export", text: "Click To PDF, To TXT, or To HTML to download" }
      ]
    },
    technical: {
      title: "Technical details",
      items: [
        { title: "Preview & HTML/TXT export:", text: "Processed entirely in your browser using modern web technologies" },
        { title: "PDF export:", text: "Generated server-side for high fidelity, then immediately discarded" },
        { title: "File size limit:", text: "Up to 5 MB per file" },
        { title: "Supported formats:", text: "GitHub Flavored Markdown (GFM) including tables, task lists, and strikethrough" }
      ]
    },
    contact: {
      title: "Questions or feedback?",
      text: "We'd love to hear from you! Click the Feedback button in the header to share your thoughts, report issues, or suggest improvements."
    }
  },
  it: {
    title: "Chi Siamo - Markdown Free",
    lead: "Un visualizzatore e convertitore Markdown veloce, gratuito e basato sul web, con un flusso ultra-semplice.",
    whatIs: {
      title: "Cos'è Markdown Free?",
      text: "Markdown Free ti permette di caricare un file .md, visualizzarlo istantaneamente con una formattazione elegante, e poi esportarlo in PDF, TXT o HTML con un solo clic. Nessuna registrazione, nessuna interfaccia complessa — solo trascina, rilascia e scarica."
    },
    whyBuilt: {
      title: "Perché l'abbiamo creato",
      text1: "Abbiamo notato che molte persone ricevono file Markdown ma non hanno un modo semplice per visualizzarli o convertirli. Gli strumenti esistenti spesso richiedono registrazioni, hanno interfacce complesse o sollevano preoccupazioni sulla privacy.",
      text2: "Markdown Free risolve questo problema con uno strumento a scopo singolo che chiunque può capire in meno di 3 secondi e completare il proprio compito in meno di 30 secondi."
    },
    principles: {
      title: "I nostri principi",
      items: [
        { title: "Gratis per sempre", text: "Nessun account, nessun abbonamento, nessun costo nascosto" },
        { title: "Privacy prima di tutto", text: "I file vengono elaborati temporaneamente e mai salvati sui nostri server" },
        { title: "Semplice per design", text: "Una pagina, tre pulsanti, fatto" },
        { title: "Aperto e trasparente", text: "Quello che vedi è quello che ottieni" }
      ]
    },
    howItWorks: {
      title: "Come funziona",
      steps: [
        { title: "Carica", text: "Trascina e rilascia il tuo file .md, .markdown o .txt" },
        { title: "Anteprima", text: "Visualizza il tuo Markdown formattato istantaneamente" },
        { title: "Esporta", text: "Clicca su In PDF, In TXT o In HTML per scaricare" }
      ]
    },
    technical: {
      title: "Dettagli tecnici",
      items: [
        { title: "Anteprima ed esportazione HTML/TXT:", text: "Elaborazione interamente nel tuo browser usando tecnologie web moderne" },
        { title: "Esportazione PDF:", text: "Generata lato server per alta fedeltà, poi immediatamente eliminata" },
        { title: "Limite dimensione file:", text: "Fino a 5 MB per file" },
        { title: "Formati supportati:", text: "GitHub Flavored Markdown (GFM) incluse tabelle, liste di attività e testo barrato" }
      ]
    },
    contact: {
      title: "Domande o feedback?",
      text: "Ci piacerebbe sentirti! Clicca il pulsante Feedback nell'intestazione per condividere i tuoi pensieri, segnalare problemi o suggerire miglioramenti."
    }
  },
  es: {
    title: "Acerca de Markdown Free",
    lead: "Un visor y convertidor de Markdown rápido, gratuito y basado en web, con un flujo ultra-simple.",
    whatIs: {
      title: "¿Qué es Markdown Free?",
      text: "Markdown Free te permite subir un archivo .md, previsualizarlo instantáneamente con un formato elegante, y luego exportarlo a PDF, TXT o HTML con un solo clic. Sin registro, sin interfaces complejas — solo arrastra, suelta y descarga."
    },
    whyBuilt: {
      title: "Por qué lo creamos",
      text1: "Notamos que muchas personas reciben archivos Markdown pero no tienen una forma fácil de verlos o convertirlos. Las herramientas existentes a menudo requieren registros, tienen interfaces complejas o generan preocupaciones de privacidad.",
      text2: "Markdown Free resuelve esto con una herramienta de propósito único que cualquiera puede entender en menos de 3 segundos y completar su tarea en menos de 30 segundos."
    },
    principles: {
      title: "Nuestros principios",
      items: [
        { title: "Gratis para siempre", text: "Sin cuentas, sin suscripciones, sin costos ocultos" },
        { title: "Privacidad primero", text: "Los archivos se procesan temporalmente y nunca se almacenan en nuestros servidores" },
        { title: "Simple por diseño", text: "Una página, tres botones, listo" },
        { title: "Abierto y transparente", text: "Lo que ves es lo que obtienes" }
      ]
    },
    howItWorks: {
      title: "Cómo funciona",
      steps: [
        { title: "Subir", text: "Arrastra y suelta tu archivo .md, .markdown o .txt" },
        { title: "Vista previa", text: "Ve tu Markdown formateado instantáneamente" },
        { title: "Exportar", text: "Haz clic en A PDF, A TXT o A HTML para descargar" }
      ]
    },
    technical: {
      title: "Detalles técnicos",
      items: [
        { title: "Vista previa y exportación HTML/TXT:", text: "Procesado completamente en tu navegador usando tecnologías web modernas" },
        { title: "Exportación PDF:", text: "Generado del lado del servidor para alta fidelidad, luego eliminado inmediatamente" },
        { title: "Límite de tamaño:", text: "Hasta 5 MB por archivo" },
        { title: "Formatos soportados:", text: "GitHub Flavored Markdown (GFM) incluyendo tablas, listas de tareas y texto tachado" }
      ]
    },
    contact: {
      title: "¿Preguntas o comentarios?",
      text: "¡Nos encantaría saber de ti! Haz clic en el botón de Comentarios en el encabezado para compartir tus pensamientos, reportar problemas o sugerir mejoras."
    }
  }
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  
  if (!isValidLocale(localeParam)) {
    notFound();
  }
  
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);
  const c = content[locale];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>{c.title}</h1>
        <p className="lead">{c.lead}</p>

        <h2>{c.whatIs.title}</h2>
        <p>{c.whatIs.text}</p>

        <h2>{c.whyBuilt.title}</h2>
        <p>{c.whyBuilt.text1}</p>
        <p>{c.whyBuilt.text2}</p>

        <h2>{c.principles.title}</h2>
        <ul>
          {c.principles.items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> — {item.text}
            </li>
          ))}
        </ul>

        <h2>{c.howItWorks.title}</h2>
        <ol>
          {c.howItWorks.steps.map((step, i) => (
            <li key={i}>
              <strong>{step.title}</strong> — {step.text}
            </li>
          ))}
        </ol>

        <h2>{c.technical.title}</h2>
        <ul>
          {c.technical.items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> {item.text}
            </li>
          ))}
        </ul>

        <h2>{c.contact.title}</h2>
        <p>{c.contact.text}</p>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

