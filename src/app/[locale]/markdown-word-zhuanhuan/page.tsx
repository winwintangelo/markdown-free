import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { notFound } from "next/navigation";

// This page is only for zh-Hant locale
export function generateStaticParams() {
  return [{ locale: "zh-Hant" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown轉換Word（DOCX）線上工具 – 免費Markdown轉Word | Markdown Free",
    description: "線上免費將Markdown檔案轉換為Word文件（DOCX）。markdown轉word線上工具，無需註冊、無廣告。檔案安全處理，永不儲存。README、md 檔案一鍵轉 Word。",
    keywords: [
      "markdown轉word",
      "markdown轉word線上工具",
      "線上markdown轉word",
      "markdown轉docx",
      "md轉word",
      "readme轉word",
      "markdown轉檔",
      "markdown word轉換器",
      "markdown轉換word線上",
    ],
    alternates: {
      canonical: "https://www.markdown.free/zh-Hant/markdown-word-zhuanhuan",
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
      title: "Markdown轉換Word（DOCX）| 免費線上工具",
      description: "將.md檔案轉換為Microsoft Word格式。免費、私密、即時下載。",
      url: "https://www.markdown.free/zh-Hant/markdown-word-zhuanhuan",
      type: "website",
      locale: "zh_TW",
    },
  };
}

const faq = [
  {
    question: "這個Markdown轉Word工具是免費的嗎？",
    answer: "是的！Markdown Free 100%免費，沒有隱藏費用、進階方案或註冊要求。",
  },
  {
    question: "Word和DOCX有什麼區別？",
    answer: "DOCX是2007年以來Microsoft Word使用的檔案格式。當我們說「Word文件」時，指的是可以在Word、Google Docs、LibreOffice和其他文書處理器中開啟的.docx檔案。",
  },
  {
    question: "我的檔案會儲存在您的伺服器上嗎？",
    answer: "不會。檔案在記憶體中處理，轉換後立即刪除。我們從不儲存您的內容。",
  },
  {
    question: "表格和程式碼區塊等格式會保留嗎？",
    answer: "是的！表格、程式碼區塊、標題、清單和其他Markdown格式都會轉換為適當的Word樣式。",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "zh-Hant",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownWordZhuanhuanPage({ params }: PageProps) {
  const { locale } = await params;

  // Only allow zh-Hant
  if (locale !== "zh-Hant") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Markdown轉換Word（DOCX）– 免費線上工具
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            將您的Markdown檔案轉換為專業的Microsoft Word文件。
            非常適合與非技術同事分享文件、提交報告
            或從筆記建立可編輯文件。
          </p>
          <Link
            href="/zh-Hant"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            開始轉換 →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            為什麼要將Markdown轉換為Word？
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>通用相容性</strong> – Word文件（.docx）可在任何地方使用：Microsoft Office、Google Docs、LibreOffice。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>可編輯輸出</strong> – 與PDF不同，Word/DOCX檔案可以被收件者輕鬆編輯。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>專業格式</strong> – 表格、程式碼區塊和標題作為適當的Word樣式保留。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>商務就緒</strong> – 非常適合在企業環境中提交文件、報告或提案。</span>
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            誰在使用Markdown轉Word？
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">學生</h3>
              <p className="text-sm text-slate-600">將論文和報告草稿從Markdown轉換為Word以便提交。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">開發者</h3>
              <p className="text-sm text-slate-600">將README檔案和技術文件轉換為非技術人員的Word規格說明。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">作家</h3>
              <p className="text-sm text-slate-600">將Markdown編寫的手稿匯出到Word進行編輯和協作。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">團隊</h3>
              <p className="text-sm text-slate-600">與喜歡Office的同事分享Markdown文件的Word檔案。</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            如何將Markdown轉換為Word（DOCX）
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">上傳或貼上</h3>
                <p className="text-sm text-slate-600">拖放您的.md檔案，或直接貼上Markdown文字。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">預覽</h3>
                <p className="text-sm text-slate-600">在轉換前即時查看格式化的文件。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">匯出到Word</h3>
                <p className="text-sm text-slate-600">點擊「轉DOCX」並立即下載您的Word文件。</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            隱私與安全
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>檔案在記憶體中暫時處理</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>永不儲存在伺服器上</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>HTTPS加密連線</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>無需建立帳戶</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            常見問題
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                這個Markdown轉Word工具是免費的嗎？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                是的！Markdown Free 100%免費，沒有隱藏費用、進階方案或註冊要求。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Word和DOCX有什麼區別？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                DOCX是2007年以來Microsoft Word使用的檔案格式。當我們說「Word文件」時，我們指的是可以在Word、Google Docs、LibreOffice和其他文書處理器中開啟的.docx檔案。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                我的檔案會儲存在您的伺服器上嗎？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                不會。檔案在記憶體中處理，轉換後立即刪除。我們從不儲存您的內容。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                表格和程式碼區塊等格式會保留嗎？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                是的！表格、程式碼區塊、標題、清單和其他Markdown格式都會轉換為適當的Word樣式。
              </p>
            </details>
          </div>
        </section>

        {/* Related tool suite cross-links */}
        <RelatedTools locale={locale as Locale} current="docx" />

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            立即將Markdown轉換為Word →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            免費 • 無需註冊 • 即時下載
          </p>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
