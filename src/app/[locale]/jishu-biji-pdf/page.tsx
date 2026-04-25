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
    title: "技術筆記轉PDF | Markdown Free",
    description:
      "將Markdown技術筆記轉換為PDF。適合程式設計師、學生、技術作家。支援程式碼區塊、表格、數學公式。免費，無需註冊。",
    keywords: [
      "技術筆記轉pdf",
      "markdown筆記 pdf",
      "程式筆記 pdf",
      "學習筆記 pdf",
      "筆記軟體 pdf匯出",
      "obsidian pdf",
      "notion匯出 pdf",
    ],
    alternates: {
      canonical: "/zh-Hant/jishu-biji-pdf",
    },
    openGraph: {
      title: "技術筆記轉PDF | Markdown Free",
      description:
        "將Markdown技術筆記轉換為PDF。免費，無需註冊。",
      locale: "zh_TW",
    },
  };
}

export default async function JishuBijiPdfPage({
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
        <h1>技術筆記轉PDF</h1>

        <p className="lead text-lg text-slate-600">
          用Markdown寫技術筆記？將它們轉換成精美的PDF，
          方便分享、存檔和離線閱讀。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            轉換技術筆記
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>適合各種筆記工具</h2>
        <p>
          無論你使用什麼工具寫Markdown筆記，都可以輕鬆轉換：
        </p>
        <ul>
          <li>
            <strong>Obsidian</strong> — 匯出.md檔案後上傳轉換
          </li>
          <li>
            <strong>Notion</strong> — 匯出為Markdown後轉PDF
          </li>
          <li>
            <strong>Typora</strong> — 直接使用.md檔案
          </li>
          <li>
            <strong>VS Code</strong> — 任何.md檔案都支援
          </li>
          <li>
            <strong>純文字編輯器</strong> — 只要是Markdown格式即可
          </li>
        </ul>

        <h2>為什麼程式設計師喜歡用Markdown？</h2>
        <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">💻 程式碼友好</h3>
            <p className="text-sm text-slate-600">
              程式碼區塊支援語法高亮，完美呈現程式碼片段
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📝 純文字格式</h3>
            <p className="text-sm text-slate-600">
              可用Git版本控制，輕鬆追蹤變更
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">🚀 快速撰寫</h3>
            <p className="text-sm text-slate-600">
              專注內容，不需要複雜的排版操作
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">🔄 可攜性強</h3>
            <p className="text-sm text-slate-600">
              任何平台都能開啟和編輯
            </p>
          </div>
        </div>

        <h2>常見的技術筆記類型</h2>
        <ul>
          <li>
            <strong>學習筆記</strong> — 程式語言、框架、工具的學習記錄
          </li>
          <li>
            <strong>解題筆記</strong> — LeetCode、演算法題解
          </li>
          <li>
            <strong>專案記錄</strong> — 開發過程中的決策和心得
          </li>
          <li>
            <strong>Debug日誌</strong> — 問題排查和解決方案
          </li>
          <li>
            <strong>面試準備</strong> — 技術知識整理
          </li>
        </ul>

        <h2>完美呈現程式碼</h2>
        <p>
          我們的PDF轉換器完整支援程式碼區塊的語法高亮：
        </p>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\``}</pre>
        </div>
        <p>
          支援Python、JavaScript、TypeScript、Java、C++、Go、Rust等主流程式語言。
        </p>

        <h2>如何轉換你的筆記</h2>
        <ol>
          <li>
            <strong>匯出Markdown</strong> — 從你的筆記工具匯出.md檔案
          </li>
          <li>
            <strong>上傳檔案</strong> — 將檔案拖放到Markdown Free
          </li>
          <li>
            <strong>預覽</strong> — 確認格式正確
          </li>
          <li>
            <strong>下載PDF</strong> — 一鍵匯出
          </li>
        </ol>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            讓你的技術筆記更專業
          </p>
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            立即免費試用
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Trust signals */}
        <div className="not-prose rounded-lg bg-slate-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-700">
            隱私保護
          </h3>
          <ul className="space-y-2 text-slate-600">
            <li>✓ 無需帳號</li>
            <li>✓ 檔案處理後立即刪除</li>
            <li>✓ 不儲存任何資料</li>
            <li>✓ 你的筆記內容不會被保留</li>
          </ul>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hant/github-wenjiian-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                GitHub文件轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/readme-pdf-zhuanhuan-tw" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                README.md轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/markdown-pdf-zhuanhuan-tw" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown轉PDF - 免費線上工具
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
