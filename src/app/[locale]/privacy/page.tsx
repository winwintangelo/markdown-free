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
    en: "Privacy Policy",
    it: "Informativa sulla Privacy",
    es: "Política de Privacidad",
  };
  
  const descriptions: Record<Locale, string> = {
    en: "Privacy policy for Markdown Free. Learn how we handle your files and data. No accounts, no tracking, no stored content.",
    it: "Informativa sulla privacy di Markdown Free. Scopri come gestiamo i tuoi file e dati. Nessun account, nessun tracciamento, nessun contenuto salvato.",
    es: "Política de privacidad de Markdown Free. Conoce cómo manejamos tus archivos y datos. Sin cuentas, sin rastreo, sin contenido almacenado.",
  };
  
  return {
    title: titles[locale],
    description: descriptions[locale],
  };
}

// Localized content structure
const content: Record<Locale, {
  title: string;
  lead: string;
  shortVersion: { title: string; items: { title: string; text: string }[] };
  filesProcessed: {
    title: string;
    preview: { title: string; text: string };
    pdf: { title: string; text: string; items: string[] };
  };
  noCollect: { title: string; items: string[] };
  analytics: { title: string; text1: string; text2: string; items: string[]; notice: string };
  thirdParties: { title: string; text: string };
  security: { title: string; items: { title: string; text: string }[] };
  changes: { title: string; text: string; date: string };
  contact: { title: string; text: string };
}> = {
  en: {
    title: "Privacy Policy",
    lead: "Your privacy matters. Here's exactly how Markdown Free handles your data.",
    shortVersion: {
      title: "The short version",
      items: [
        { title: "No accounts", text: "We don't collect any personal information" },
        { title: "No tracking cookies", text: "We don't use cookies or track your content" },
        { title: "No storage", text: "Your files are never stored on our servers" },
        { title: "HTTPS only", text: "All connections are encrypted" }
      ]
    },
    filesProcessed: {
      title: "How files are processed",
      preview: {
        title: "Preview, HTML & TXT export",
        text: "When you upload a file for preview or export to HTML/TXT, everything happens entirely in your browser. Your file never leaves your device. We use client-side JavaScript to parse and render the Markdown."
      },
      pdf: {
        title: "PDF export",
        text: "For PDF generation, your Markdown content is sent to our server, converted to PDF, and immediately returned to you. The content is:",
        items: [
          "Processed in memory only",
          "Never written to disk",
          "Immediately discarded after the PDF is generated",
          "Not logged, analyzed, or stored in any way"
        ]
      }
    },
    noCollect: {
      title: "Data we don't collect",
      items: [
        "Personal information (names, emails, accounts)",
        "Document content or file contents",
        "File names or metadata",
        "Your IP address in logs",
        "Cookies for tracking"
      ]
    },
    analytics: {
      title: "Analytics",
      text1: "We use Umami Cloud, a privacy-focused, cookieless analytics platform. It helps us understand how many people use Markdown Free and which features are most useful.",
      text2: "Umami does not use cookies and does not collect personal information such as names, email addresses, or IP addresses. We only see aggregated data like:",
      items: [
        "Page views and visitor counts",
        "Referrer information (where visitors come from)",
        "Counts of successful conversions (PDF, TXT, HTML)",
        "General device/browser information"
      ],
      notice: "We do not send your Markdown content, file names, or any text you paste to our analytics provider. Analytics respects your browser's Do Not Track setting."
    },
    thirdParties: {
      title: "Third parties",
      text: "We do not share any data with third parties. The PDF generation runs on our own serverless infrastructure (Vercel). No external services see your content."
    },
    security: {
      title: "Security",
      items: [
        { title: "HTTPS everywhere", text: "All traffic is encrypted" },
        { title: "XSS protection", text: "User content is sanitized before rendering" },
        { title: "No persistent storage", text: "Nothing to breach" }
      ]
    },
    changes: {
      title: "Changes to this policy",
      text: "If we make changes to this privacy policy, we'll update the date below. Significant changes will be noted on the homepage.",
      date: "Last updated: December 2024"
    },
    contact: {
      title: "Contact",
      text: "Questions about privacy? Click the Feedback button in the header to reach us."
    }
  },
  it: {
    title: "Informativa sulla Privacy",
    lead: "La tua privacy è importante. Ecco esattamente come Markdown Free gestisce i tuoi dati.",
    shortVersion: {
      title: "In breve",
      items: [
        { title: "Nessun account", text: "Non raccogliamo alcuna informazione personale" },
        { title: "Nessun cookie di tracciamento", text: "Non utilizziamo cookie e non tracciamo i tuoi contenuti" },
        { title: "Nessun salvataggio", text: "I tuoi file non vengono mai salvati sui nostri server" },
        { title: "Solo HTTPS", text: "Tutte le connessioni sono crittografate" }
      ]
    },
    filesProcessed: {
      title: "Come vengono elaborati i file",
      preview: {
        title: "Anteprima, esportazione HTML e TXT",
        text: "Quando carichi un file per l'anteprima o l'esportazione in HTML/TXT, tutto avviene interamente nel tuo browser. Il tuo file non lascia mai il tuo dispositivo. Utilizziamo JavaScript lato client per analizzare e renderizzare il Markdown."
      },
      pdf: {
        title: "Esportazione PDF",
        text: "Per la generazione del PDF, il contenuto Markdown viene inviato al nostro server, convertito in PDF e immediatamente restituito. Il contenuto è:",
        items: [
          "Elaborato solo in memoria",
          "Mai scritto su disco",
          "Immediatamente eliminato dopo la generazione del PDF",
          "Non registrato, analizzato o salvato in alcun modo"
        ]
      }
    },
    noCollect: {
      title: "Dati che non raccogliamo",
      items: [
        "Informazioni personali (nomi, email, account)",
        "Contenuto dei documenti o dei file",
        "Nomi dei file o metadati",
        "Il tuo indirizzo IP nei log",
        "Cookie per il tracciamento"
      ]
    },
    analytics: {
      title: "Analytics",
      text1: "Utilizziamo Umami Cloud, una piattaforma di analytics rispettosa della privacy e senza cookie. Ci aiuta a capire quante persone usano Markdown Free e quali funzionalità sono più utili.",
      text2: "Umami non utilizza cookie e non raccoglie informazioni personali come nomi, indirizzi email o IP. Vediamo solo dati aggregati come:",
      items: [
        "Visualizzazioni di pagina e conteggio visitatori",
        "Informazioni sui referrer (da dove arrivano i visitatori)",
        "Conteggio delle conversioni riuscite (PDF, TXT, HTML)",
        "Informazioni generali su dispositivo/browser"
      ],
      notice: "Non inviamo il contenuto Markdown, i nomi dei file o qualsiasi testo che incolli al nostro provider di analytics. Le analytics rispettano l'impostazione Do Not Track del tuo browser."
    },
    thirdParties: {
      title: "Terze parti",
      text: "Non condividiamo alcun dato con terze parti. La generazione PDF avviene sulla nostra infrastruttura serverless (Vercel). Nessun servizio esterno vede i tuoi contenuti."
    },
    security: {
      title: "Sicurezza",
      items: [
        { title: "HTTPS ovunque", text: "Tutto il traffico è crittografato" },
        { title: "Protezione XSS", text: "Il contenuto utente viene sanificato prima del rendering" },
        { title: "Nessun salvataggio persistente", text: "Nulla da violare" }
      ]
    },
    changes: {
      title: "Modifiche a questa policy",
      text: "Se apportiamo modifiche a questa informativa sulla privacy, aggiorneremo la data qui sotto. Le modifiche significative saranno indicate sulla homepage.",
      date: "Ultimo aggiornamento: Dicembre 2024"
    },
    contact: {
      title: "Contatti",
      text: "Domande sulla privacy? Clicca il pulsante Feedback nell'intestazione per contattarci."
    }
  },
  es: {
    title: "Política de Privacidad",
    lead: "Tu privacidad importa. Aquí explicamos exactamente cómo Markdown Free maneja tus datos.",
    shortVersion: {
      title: "La versión corta",
      items: [
        { title: "Sin cuentas", text: "No recopilamos información personal" },
        { title: "Sin cookies de rastreo", text: "No usamos cookies ni rastreamos tu contenido" },
        { title: "Sin almacenamiento", text: "Tus archivos nunca se guardan en nuestros servidores" },
        { title: "Solo HTTPS", text: "Todas las conexiones están encriptadas" }
      ]
    },
    filesProcessed: {
      title: "Cómo se procesan los archivos",
      preview: {
        title: "Vista previa, exportación HTML y TXT",
        text: "Cuando subes un archivo para vista previa o exportación a HTML/TXT, todo sucede completamente en tu navegador. Tu archivo nunca sale de tu dispositivo. Usamos JavaScript del lado del cliente para analizar y renderizar el Markdown."
      },
      pdf: {
        title: "Exportación PDF",
        text: "Para la generación de PDF, tu contenido Markdown se envía a nuestro servidor, se convierte a PDF y se te devuelve inmediatamente. El contenido es:",
        items: [
          "Procesado solo en memoria",
          "Nunca escrito en disco",
          "Eliminado inmediatamente después de generar el PDF",
          "No registrado, analizado ni almacenado de ninguna manera"
        ]
      }
    },
    noCollect: {
      title: "Datos que no recopilamos",
      items: [
        "Información personal (nombres, emails, cuentas)",
        "Contenido de documentos o archivos",
        "Nombres de archivos o metadatos",
        "Tu dirección IP en registros",
        "Cookies para rastreo"
      ]
    },
    analytics: {
      title: "Analytics",
      text1: "Usamos Umami Cloud, una plataforma de análisis enfocada en privacidad y sin cookies. Nos ayuda a entender cuántas personas usan Markdown Free y qué funciones son más útiles.",
      text2: "Umami no usa cookies y no recopila información personal como nombres, direcciones de email o IPs. Solo vemos datos agregados como:",
      items: [
        "Vistas de página y conteo de visitantes",
        "Información de referencia (de dónde vienen los visitantes)",
        "Conteo de conversiones exitosas (PDF, TXT, HTML)",
        "Información general de dispositivo/navegador"
      ],
      notice: "No enviamos tu contenido Markdown, nombres de archivos o cualquier texto que pegues a nuestro proveedor de analytics. Las analytics respetan la configuración Do Not Track de tu navegador."
    },
    thirdParties: {
      title: "Terceros",
      text: "No compartimos datos con terceros. La generación de PDF se ejecuta en nuestra propia infraestructura serverless (Vercel). Ningún servicio externo ve tu contenido."
    },
    security: {
      title: "Seguridad",
      items: [
        { title: "HTTPS en todas partes", text: "Todo el tráfico está encriptado" },
        { title: "Protección XSS", text: "El contenido del usuario se sanea antes de renderizar" },
        { title: "Sin almacenamiento persistente", text: "Nada que vulnerar" }
      ]
    },
    changes: {
      title: "Cambios a esta política",
      text: "Si hacemos cambios a esta política de privacidad, actualizaremos la fecha abajo. Los cambios significativos se notarán en la página principal.",
      date: "Última actualización: Diciembre 2024"
    },
    contact: {
      title: "Contacto",
      text: "¿Preguntas sobre privacidad? Haz clic en el botón de Comentarios en el encabezado para contactarnos."
    }
  }
};

export default async function PrivacyPage({
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

        <h2>{c.shortVersion.title}</h2>
        <ul>
          {c.shortVersion.items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> — {item.text}
            </li>
          ))}
        </ul>

        <h2>{c.filesProcessed.title}</h2>

        <h3>{c.filesProcessed.preview.title}</h3>
        <p>{c.filesProcessed.preview.text}</p>

        <h3>{c.filesProcessed.pdf.title}</h3>
        <p>{c.filesProcessed.pdf.text}</p>
        <ul>
          {c.filesProcessed.pdf.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{c.noCollect.title}</h2>
        <ul>
          {c.noCollect.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{c.analytics.title}</h2>
        <p><strong>Umami Cloud</strong> — {c.analytics.text1}</p>
        <p>{c.analytics.text2}</p>
        <ul>
          {c.analytics.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p><strong>{c.analytics.notice}</strong></p>

        <h2>{c.thirdParties.title}</h2>
        <p>{c.thirdParties.text}</p>

        <h2>{c.security.title}</h2>
        <ul>
          {c.security.items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> — {item.text}
            </li>
          ))}
        </ul>

        <h2>{c.changes.title}</h2>
        <p>{c.changes.text}</p>
        <p className="text-sm text-slate-500">{c.changes.date}</p>

        <h2>{c.contact.title}</h2>
        <p>{c.contact.text}</p>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

