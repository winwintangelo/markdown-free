import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import {
  isValidLocale,
  getDictionary,
  locales,
  localeMetadata,
  getLocalizedPath,
  type Locale,
} from "@/i18n";

const siteUrl = "https://www.markdown.free";

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    return {};
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);
  const meta = localeMetadata[locale];
  const url =
    locale === "en" ? `${siteUrl}/faq` : `${siteUrl}/${locale}/faq`;

  return {
    title: dict.faqPage?.title || "FAQ - Frequently Asked Questions | Markdown Free",
    description: dict.faqPage?.description || dict.meta.description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [
          localeMetadata[l].hreflang,
          l === "en" ? `${siteUrl}/faq` : `${siteUrl}/${l}/faq`,
        ])
      ),
    },
    openGraph: {
      title: dict.faqPage?.title || "FAQ | Markdown Free",
      description: dict.faqPage?.description || dict.meta.description,
      url,
      locale: meta.ogLocale,
      type: "website",
    },
  };
}

// Extended FAQ content per locale
function getExtendedFaq(locale: Locale, dict: ReturnType<typeof getDictionary>) {
  // Base FAQ from dictionary
  const baseFaq = dict.faq || [];
  
  // Additional natural language questions (English fallback)
  const additionalFaq = [
    {
      question: locale === "zh-Hant" ? "如何把 README.md 轉成 PDF？" :
                locale === "zh-Hans" ? "如何把 README.md 转成 PDF？" :
                locale === "ja" ? "README.md を PDF に変換するには？" :
                locale === "ko" ? "README.md를 PDF로 어떻게 변환하나요?" :
                locale === "es" ? "¿Cómo convierto un README.md a PDF?" :
                locale === "it" ? "Come converto un README.md in PDF?" :
                locale === "id" ? "Bagaimana cara mengonversi README.md ke PDF?" :
                locale === "vi" ? "Làm thế nào để chuyển đổi README.md sang PDF?" :
                "How do I convert a README.md to PDF?",
      answer: locale === "zh-Hant" ? "只需將 README.md 檔案拖放到上傳區域，或點擊「選擇檔案」來選取。上傳後，點擊「轉 PDF」按鈕即可下載轉換後的 PDF。整個過程只需幾秒鐘。" :
              locale === "zh-Hans" ? "只需将 README.md 文件拖放到上传区域，或点击「选择文件」来选取。上传后，点击「转 PDF」按钮即可下载转换后的 PDF。整个过程只需几秒钟。" :
              locale === "ja" ? "README.md ファイルをアップロードエリアにドラッグ＆ドロップするか、「ファイルを選択」をクリックして選択してください。アップロード後、「PDF に変換」ボタンをクリックすると、変換された PDF がダウンロードされます。" :
              locale === "ko" ? "README.md 파일을 업로드 영역에 끌어다 놓거나 '파일 선택'을 클릭하여 선택하세요. 업로드 후 'PDF로 변환' 버튼을 클릭하면 변환된 PDF가 다운로드됩니다." :
              locale === "es" ? "Simplemente arrastra y suelta tu archivo README.md en el área de carga, o haz clic en 'elegir archivo' para seleccionarlo. Una vez cargado, haz clic en el botón 'A PDF' para descargar tu PDF convertido." :
              locale === "it" ? "Trascina e rilascia il tuo file README.md nell'area di caricamento, o clicca su 'scegli file' per selezionarlo. Una volta caricato, clicca sul pulsante 'A PDF' per scaricare il PDF convertito." :
              locale === "id" ? "Cukup seret dan lepas file README.md Anda ke area unggah, atau klik 'pilih file' untuk memilihnya. Setelah diunggah, klik tombol 'Ke PDF' untuk mengunduh PDF yang telah dikonversi." :
              locale === "vi" ? "Chỉ cần kéo và thả tệp README.md của bạn vào vùng tải lên, hoặc nhấp vào 'chọn tệp' để chọn. Sau khi tải lên, nhấp vào nút 'Sang PDF' để tải xuống PDF đã chuyển đổi." :
              "Simply drag and drop your README.md file onto the upload area, or click 'choose file' to select it. Once uploaded, click the 'To PDF' button to download your converted PDF.",
    },
    {
      question: locale === "zh-Hant" ? "可以把 Markdown 轉成 Word 文件嗎？" :
                locale === "zh-Hans" ? "可以把 Markdown 转成 Word 文档吗？" :
                locale === "ja" ? "Markdown を Word 文書（DOCX）に変換できますか？" :
                locale === "ko" ? "마크다운을 Word 문서(DOCX)로 변환할 수 있나요?" :
                locale === "es" ? "¿Puedo convertir Markdown a documento Word (DOCX)?" :
                locale === "it" ? "Posso convertire Markdown in documento Word (DOCX)?" :
                locale === "id" ? "Bisakah saya mengonversi Markdown ke dokumen Word (DOCX)?" :
                locale === "vi" ? "Tôi có thể chuyển đổi Markdown sang tài liệu Word (DOCX) không?" :
                "Can I convert Markdown to Word document (DOCX)?",
      answer: locale === "zh-Hant" ? "可以！Markdown Free 支援匯出為 DOCX 格式。上傳您的 Markdown 檔案後，點擊「轉 DOCX」即可獲得保留格式、標題和程式碼區塊的 Word 相容文件。" :
              locale === "zh-Hans" ? "可以！Markdown Free 支持导出为 DOCX 格式。上传您的 Markdown 文件后，点击「转 DOCX」即可获得保留格式、标题和代码块的 Word 兼容文档。" :
              locale === "ja" ? "はい！Markdown Free は DOCX 形式へのエクスポートをサポートしています。Markdown ファイルをアップロードして「DOCX に変換」をクリックすると、書式、見出し、コードブロックが保持された Word 互換のドキュメントが得られます。" :
              locale === "ko" ? "네! Markdown Free는 DOCX 형식으로 내보내기를 지원합니다. 마크다운 파일을 업로드하고 'DOCX로 변환'을 클릭하면 서식, 제목, 코드 블록이 유지된 Word 호환 문서를 얻을 수 있습니다." :
              locale === "es" ? "¡Sí! Markdown Free admite la exportación a formato DOCX. Sube tu archivo Markdown y haz clic en 'A DOCX' para obtener un documento compatible con Word que preserva el formato, los títulos y los bloques de código." :
              locale === "it" ? "Sì! Markdown Free supporta l'esportazione in formato DOCX. Carica il tuo file Markdown e clicca su 'A DOCX' per ottenere un documento compatibile con Word che preserva formattazione, titoli e blocchi di codice." :
              locale === "id" ? "Ya! Markdown Free mendukung ekspor ke format DOCX. Unggah file Markdown Anda dan klik 'Ke DOCX' untuk mendapatkan dokumen yang kompatibel dengan Word yang mempertahankan format, judul, dan blok kode." :
              locale === "vi" ? "Có! Markdown Free hỗ trợ xuất sang định dạng DOCX. Tải lên tệp Markdown của bạn và nhấp vào 'Sang DOCX' để nhận tài liệu tương thích với Word giữ nguyên định dạng, tiêu đề và khối mã." :
              "Yes! Markdown Free supports exporting to DOCX format. Upload your Markdown file and click 'To DOCX' to get a Word-compatible document that preserves formatting, headings, and code blocks.",
    },
  ];

  return [...baseFaq, ...additionalFaq];
}

// JSON-LD for FAQ page
function getJsonLd(faq: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default async function LocaleFAQPage({
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
  const extendedFaq = getExtendedFaq(locale, dict);
  const jsonLd = getJsonLd(extendedFaq);

  // Localized text
  const pageTitle = dict.faqPage?.heading || "Frequently Asked Questions";
  const pageSubtitle = dict.faqPage?.subtitle || "Everything you need to know about converting Markdown to PDF, DOCX, HTML, and TXT.";
  const homeText = dict.faqPage?.home || "Home";
  const faqText = dict.faqPage?.faq || "FAQ";
  const ctaTitle = dict.faqPage?.ctaTitle || "Ready to convert your Markdown?";
  const ctaSubtitle = dict.faqPage?.ctaSubtitle || "No signup required. Just drag, drop, and download.";
  const ctaButton = dict.faqPage?.ctaButton || "Start Converting";

  return (
    <ConverterProvider>
      <Header locale={locale} dict={dict} />
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <Link
            href={getLocalizedPath("/", locale)}
            className="hover:text-emerald-600"
          >
            {homeText}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-slate-900">{faqText}</span>
        </nav>

        {/* Page Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {pageTitle}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{pageSubtitle}</p>
        </header>

        {/* FAQ List */}
        <section className="space-y-6">
          {extendedFaq.map((item, index) => (
            <article
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {item.question}
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {item.answer}
              </p>
            </article>
          ))}
        </section>

        {/* CTA Section */}
        <section className="mt-12 rounded-xl bg-emerald-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">{ctaTitle}</h2>
          <p className="mt-2 text-slate-600">{ctaSubtitle}</p>
          <Link
            href={getLocalizedPath("/", locale)}
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            {ctaButton}
          </Link>
        </section>

        {/* Footer */}
        <div className="mt-12">
          <Footer locale={locale} dict={dict} />
        </div>
      </main>
    </ConverterProvider>
  );
}
