import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";

// Only show this page for Traditional Chinese locale
export function generateStaticParams() {
  return [{ locale: "zh-Hant" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "zh-Hant") {
    return {};
  }

  return {
    title: "Markdown轉EPUB – 免費線上工具 | Markdown Free",
    description:
      "免費將Markdown檔案轉換為EPUB。無需註冊，無限制。適合在Kindle、Apple Books、Kobo等電子閱讀器上閱讀。",
    keywords: [
      "markdown轉epub",
      "markdown epub 免費",
      "md epub 轉換工具",
      "markdown 電子書",
      "markdown epub 線上轉換",
    ],
    alternates: {
      canonical: "/zh-Hant/markdown-epub-zhuanhuan-tw",
    },
    openGraph: {
      title: "Markdown轉EPUB – 免費線上工具 | Markdown Free",
      description:
        "免費將Markdown檔案轉換為EPUB。無需註冊，隱私保護。",
      locale: "zh_TW",
    },
  };
}

export default async function MarkdownEpubZhuanhuanTwPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  // Only render for Traditional Chinese
  if (localeParam !== "zh-Hant") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Markdown轉EPUB – 免費工具
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          將你的Markdown檔案轉換為EPUB電子書。適合在Kindle、Apple Books、
          Kobo等電子閱讀器上閱讀文件。自動從標題生成目錄和章節。
        </p>
        <Link
          href="/zh-Hant"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          立即開始 — 免費 <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why EPUB Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          為什麼要將Markdown轉換為EPUB？
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>隨處閱讀</strong> – EPUB支援Kindle、Apple Books、Kobo、Google Play圖書等所有主流電子閱讀器。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>自適應文字</strong> – 與PDF不同，EPUB內容會根據螢幕大小、字型偏好和閱讀模式自動調整。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>自動生成章節</strong> – Markdown標題會變成可導覽的章節和自動生成的目錄。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>離線閱讀</strong> – 下載一次，無需網路連線即可隨時閱讀。</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          如何將Markdown轉換為EPUB
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
            <div>
              <h3 className="font-medium text-slate-900">上傳或貼上</h3>
              <p className="text-sm text-slate-600">拖放你的.md檔案，或直接貼上Markdown文字。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
            <div>
              <h3 className="font-medium text-slate-900">預覽</h3>
              <p className="text-sm text-slate-600">在轉換前即時查看格式化後的文件。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
            <div>
              <h3 className="font-medium text-slate-900">匯出為EPUB</h3>
              <p className="text-sm text-slate-600">點擊&ldquo;轉EPUB&rdquo;，即刻下載你的電子書。</p>
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
              這個Markdown轉EPUB工具是免費的嗎？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              是的！Markdown Free 100%免費，沒有隱藏費用、進階方案或註冊要求。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              EPUB能在Kindle上使用嗎？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              可以。現代Kindle裝置原生支援EPUB。對於舊款機型，你可以使用&ldquo;傳送到Kindle&rdquo;功能或Calibre將EPUB轉換為MOBI。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              章節是如何生成的？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Markdown Free會在H1標題處（如果沒有H1則在H2處）自動將文件分割成章節，並生成可導覽的目錄。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              我的檔案會儲存在你們的伺服器上嗎？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              不會。你的檔案在記憶體中處理，轉換後立即刪除。我們從不儲存你的內容。
            </p>
          </details>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">相關工具</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/zh-Hant" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown轉PDF
          </Link>
          <Link href="/markdown-to-docx" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown轉DOCX
          </Link>
          <Link href="/readme-to-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            README轉PDF
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/zh-Hant"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          立即將Markdown轉換為EPUB <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          免費 &bull; 無需註冊 &bull; 即時下載
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
