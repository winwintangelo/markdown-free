import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

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
    title: "免註冊Markdown轉PDF | Markdown Free",
    description:
      "無需建立帳戶即可將Markdown轉換為PDF。不用登入，不要電郵，不追蹤用戶。上傳轉換就這麼簡單。",
    keywords: [
      "markdown pdf 免註冊",
      "md轉換 不用帳戶",
      "markdown pdf 匿名",
      "pdf轉換 無需登入",
      "markdown轉換 免費",
    ],
    alternates: {
      canonical: "/zh-Hant/markdown-pdf-mianzhuce",
    },
    openGraph: {
      title: "免註冊Markdown轉PDF | Markdown Free",
      description:
        "無需建立帳戶即可將Markdown轉換為PDF。不用登入，不追蹤用戶。",
      locale: "zh_TW",
    },
  };
}

export default async function MarkdownPdfMianzhucePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (localeParam !== "zh-Hant") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>免註冊Markdown轉PDF</h1>

        <p className="lead text-lg text-slate-600">
          厭倦了每次使用線上工具都要註冊帳戶？
          Markdown Free讓你無需註冊、無需電郵、無需追蹤，直接將Markdown轉換為PDF。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            立即轉換 — 無需登入
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>為什麼「免註冊」很重要</h2>
        <p>
          為什麼很多線上轉換工具都要求建立帳戶？
        </p>
        <ul>
          <li>向你推銷付費方案</li>
          <li>發送行銷郵件</li>
          <li>追蹤用戶行為</li>
          <li>將資料變現</li>
        </ul>
        <p>
          <strong>我們不一樣。</strong>Markdown Free是一個簡單的工具，
          只做一件事並且做好它。不求回報，只提供純粹有用的服務。
        </p>

        <h2>使用方法</h2>
        <ol>
          <li>打開Markdown Free</li>
          <li>拖放<code>.md</code>檔案</li>
          <li>點擊「轉PDF」</li>
          <li>下載 — 完成！</li>
        </ol>
        <p>
          沒有表單要填。沒有「驗證電郵」。沒有「開始免費試用」。
        </p>

        <h2>隱私承諾</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>無需註冊帳戶</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>沒有追蹤Cookie</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>檔案不會被儲存</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>HTTPS加密連線</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>注重隱私的分析工具（Umami）</span>
            </li>
          </ul>
        </div>

        <h2>常見問題</h2>

        <h3>真的不用註冊嗎？</h3>
        <p>
          是的！我們網站上連「註冊」按鈕都沒有。
          打開頁面，轉換檔案，關閉頁面。就這麼簡單。
        </p>

        <h3>你們怎麼獲利？</h3>
        <p>
          Markdown Free是個人專案。我們不會將用戶資料變現，
          也不會推銷服務。它只是一個有用的工具。
        </p>

        <h3>上傳機密文件安全嗎？</h3>
        <p>
          預覽完全在瀏覽器內處理。生成PDF時，
          檔案在伺服器記憶體中處理後立即刪除。
          我們不儲存、不記錄、不分析你的檔案。
        </p>

        <h3>每天轉換次數有限制嗎？</h3>
        <p>
          沒有！想轉多少就轉多少，隨時都可以。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            無需註冊。沒有麻煩。即刻使用。
          </p>
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            立即開始
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
