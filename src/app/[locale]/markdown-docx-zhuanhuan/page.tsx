import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

// This page is only for zh-Hant locale
export function generateStaticParams() {
  return [{ locale: "zh-Hant" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown 轉 DOCX（Word）| 免費線上轉換工具",
    description: "即時將 Markdown 檔案轉換為 Word DOCX 文件。100% 免費，無需註冊，無廣告。您的檔案安全處理，絕不儲存。",
    alternates: {
      canonical: "https://www.markdown.free/zh-Hant/markdown-docx-zhuanhuan",
    },
    openGraph: {
      title: "Markdown 轉 DOCX（Word）免費轉換器",
      description: "將 .md 檔案轉換為 Microsoft Word DOCX 格式。免費、私密、即時下載。",
      url: "https://www.markdown.free/zh-Hant/markdown-docx-zhuanhuan",
      type: "website",
      locale: "zh_TW",
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownDocxZhuanhuanPage({ params }: PageProps) {
  const { locale } = await params;
  
  // Only allow zh-Hant
  if (locale !== "zh-Hant") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Markdown 轉 DOCX（Word）免費線上工具
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            將您的 Markdown 檔案轉換為專業的 Microsoft Word 文件。
            非常適合與非技術同事分享文件、提交報告，或從筆記建立可編輯的文件。
          </p>
          <Link
            href="/zh-Hant"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            開始轉換 →
          </Link>
        </section>

        {/* Why DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            為什麼要將 Markdown 轉換為 DOCX？
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>通用相容性</strong> – Word 文件適用於所有平台，從 Microsoft Office 到 Google 文件到 LibreOffice。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>可編輯輸出</strong> – 與 PDF 不同，DOCX 檔案可以輕鬆編輯。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>專業格式</strong> – 表格、程式碼區塊和標題會保留為正確的 Word 樣式。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>商務就緒</strong> – 非常適合在企業環境中提交文件、報告或提案。</span>
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            如何將 Markdown 轉換為 Word DOCX
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">上傳或貼上</h3>
                <p className="text-sm text-slate-600">拖放您的 .md 檔案，或直接貼上 Markdown 文字。</p>
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
                <h3 className="font-medium text-slate-900">匯出為 DOCX</h3>
                <p className="text-sm text-slate-600">點擊「轉DOCX」即可立即下載您的 Word 文件。</p>
              </div>
            </li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            常見問題
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                這個 Markdown 轉 DOCX 轉換器是免費的嗎？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                是的！Markdown Free 100% 免費，沒有隱藏費用、進階版本或註冊要求。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                轉換後的 DOCX 可以在 Microsoft Word 中開啟嗎？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                是的，產生的 DOCX 檔案與 Microsoft Word 2007 及更高版本、Google 文件、LibreOffice 以及其他支援 .docx 格式的文書處理器相容。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                我的檔案會被儲存在伺服器上嗎？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                不會。您的檔案在記憶體中處理，轉換後立即刪除。我們從不儲存您的內容。
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            立即轉換 Markdown 為 DOCX →
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
