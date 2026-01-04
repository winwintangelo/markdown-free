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
    title: "Markdown轉PDF免費線上工具 | Markdown Free",
    description:
      "免費將Markdown檔案轉換為PDF。無需註冊，檔案不會被儲存。拖放即可轉換。支援GitHub Flavored Markdown。",
    keywords: [
      "markdown轉pdf",
      "md轉pdf免費",
      "markdown轉換器",
      "線上markdown轉換",
      "readme轉pdf",
    ],
    alternates: {
      canonical: "/zh-Hant/markdown-pdf-zhuanhuan-tw",
    },
    openGraph: {
      title: "Markdown轉PDF免費線上工具 | Markdown Free",
      description:
        "免費將Markdown檔案轉換為PDF。無需註冊，隱私保護。",
      locale: "zh_TW",
    },
  };
}

export default async function MarkdownPdfZhuanhuanTwPage({
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
        <h1>Markdown轉PDF - 免費線上工具</h1>

        <p className="lead text-lg text-slate-600">
          想把<code>.md</code>檔案轉換成專業的PDF？
          使用Markdown Free，幾秒鐘即可完成。無需註冊，無需安裝。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            立即免費轉換
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>使用方法</h2>
        <ol>
          <li>
            <strong>上傳檔案</strong> — 將<code>.md</code>或<code>.markdown</code>檔案拖放到上傳區域
          </li>
          <li>
            <strong>預覽確認</strong> — 即時查看格式化後的Markdown
          </li>
          <li>
            <strong>下載PDF</strong> — 點擊「轉PDF」按鈕下載
          </li>
        </ol>

        <h2>為什麼選擇Markdown Free？</h2>
        <ul>
          <li>
            <strong>100%免費</strong> — 沒有隱藏費用，沒有訂閱
          </li>
          <li>
            <strong>無需註冊</strong> — 不需要電子郵件或個人資訊
          </li>
          <li>
            <strong>隱私保護</strong> — 檔案不會儲存在伺服器上
          </li>
          <li>
            <strong>快速轉換</strong> — 幾秒鐘即可完成
          </li>
          <li>
            <strong>支援GFM</strong> — 表格、清單、刪除線等都支援
          </li>
        </ul>

        <h2>支援的格式</h2>
        <p>
          除了PDF，還可以匯出為：
        </p>
        <ul>
          <li><strong>HTML</strong> — 用於網頁發布</li>
          <li><strong>TXT</strong> — 純文字</li>
        </ul>

        <h2>常見問題</h2>

        <h3>真的免費嗎？</h3>
        <p>
          是的！Markdown Free完全免費。沒有高級版，沒有每日限制，
          沒有隱藏的付費功能。
        </p>

        <h3>檔案安全嗎？</h3>
        <p>
          請放心使用。預覽在瀏覽器內處理，
          PDF轉換時檔案在記憶體中處理後立即刪除。
          檔案絕不會被儲存。
        </p>

        <h3>檔案大小限制是多少？</h3>
        <p>
          支援最大5MB的檔案。對於一般的Markdown文件來說
          綽綽有餘。
        </p>

        <h3>手機上能用嗎？</h3>
        <p>
          可以！介面已針對手機和平板進行最佳化。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            現在就把Markdown轉換成PDF
          </p>
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            免費試用
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hant/markdown-pdf-mianzhuce" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                免註冊Markdown轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/readme-pdf-zhuanhuan-tw" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                README.md轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/markdown-zhuanhuanqi-bijiao-tw" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown轉換器比較
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
