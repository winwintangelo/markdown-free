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
    title: "GitHub文件轉PDF | Markdown Free",
    description:
      "將GitHub的Markdown文件轉換為PDF。支援README、CHANGELOG、技術文件。免費線上工具，無需註冊。",
    keywords: [
      "github文件轉pdf",
      "github markdown pdf",
      "github文件 pdf",
      "技術文件轉pdf",
      "開源專案文件",
      "github 文件匯出",
    ],
    alternates: {
      canonical: "/zh-Hant/github-wenjiian-pdf",
    },
    openGraph: {
      title: "GitHub文件轉PDF | Markdown Free",
      description:
        "將GitHub的Markdown文件轉換為PDF。免費，無需註冊。",
      locale: "zh_TW",
    },
  };
}

export default async function GithubWenjiianPdfPage({
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
        <h1>GitHub文件轉PDF</h1>

        <p className="lead text-lg text-slate-600">
          將GitHub儲存庫中的Markdown文件轉換為專業的PDF格式。
          適合開發者、技術作家和開源貢獻者。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            轉換GitHub文件
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>支援的GitHub文件類型</h2>
        <ul>
          <li>
            <strong>README.md</strong> — 專案說明文件
          </li>
          <li>
            <strong>CHANGELOG.md</strong> — 版本更新記錄
          </li>
          <li>
            <strong>CONTRIBUTING.md</strong> — 貢獻指南
          </li>
          <li>
            <strong>docs/</strong> — 文件資料夾中的所有.md檔案
          </li>
          <li>
            <strong>wiki</strong> — GitHub Wiki頁面（另存為.md後可用）
          </li>
        </ul>

        <h2>為什麼開發者需要這個工具？</h2>
        <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📋 程式碼審查</h3>
            <p className="text-sm text-slate-600">
              將技術規格轉為PDF，方便團隊審查和批注
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📁 存檔備份</h3>
            <p className="text-sm text-slate-600">
              保存文件的靜態版本，不受儲存庫變更影響
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">🎯 作品集</h3>
            <p className="text-sm text-slate-600">
              將開源專案文件整理成作品集
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📧 分享</h3>
            <p className="text-sm text-slate-600">
              以PDF格式發送給沒有GitHub帳號的人
            </p>
          </div>
        </div>

        <h2>如何從GitHub下載Markdown檔案</h2>
        <ol>
          <li>
            <strong>進入GitHub儲存庫</strong> — 找到你要轉換的.md檔案
          </li>
          <li>
            <strong>點擊「Raw」按鈕</strong> — 在檔案預覽頁面的右上角
          </li>
          <li>
            <strong>儲存頁面</strong> — 使用瀏覽器的「另存新檔」功能
          </li>
          <li>
            <strong>上傳到Markdown Free</strong> — 拖放檔案即可轉換
          </li>
        </ol>

        <h2>完整支援GitHub Flavored Markdown</h2>
        <p>
          所有GitHub特有的Markdown語法都能完美轉換：
        </p>
        <ul>
          <li>✓ 表格 — 數據呈現</li>
          <li>✓ 任務列表 — 清單和待辦事項</li>
          <li>✓ 程式碼區塊 — 多語言語法高亮</li>
          <li>✓ 刪除線 — 修訂標記</li>
          <li>✓ 自動連結 — URL和電子郵件</li>
        </ul>

        <h2>適合的使用場景</h2>
        <ul>
          <li>
            <strong>技術面試</strong> — 展示開源貢獻
          </li>
          <li>
            <strong>客戶報告</strong> — 將專案進度文件化
          </li>
          <li>
            <strong>內部培訓</strong> — 製作技術教材
          </li>
          <li>
            <strong>法務/合規</strong> — 保存授權條款和隱私政策
          </li>
        </ul>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            將GitHub文件轉換為專業PDF
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
            <li>✓ HTTPS加密連線</li>
          </ul>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
          <ul className="space-y-2">
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
            <li>
              <Link href="/zh-Hant/markdown-zhuanhuanqi-bijiao-tw" className="text-emerald-700 hover:text-emerald-800 hover:underline">
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
