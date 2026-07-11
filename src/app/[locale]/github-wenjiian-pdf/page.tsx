import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

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
    title: "GitHub README 轉 PDF — 免費線上工具，免註冊（2026）",
    description:
      "把 GitHub 上的 README.md、CHANGELOG.md、技術文件一鍵轉成 PDF。免費、免註冊、檔案不存檔。完整支援繁體中文、表格、程式碼區塊。2026 最新版本。",
    keywords: [
      "github 文件 轉 pdf",
      "github readme 轉 pdf",
      "github markdown pdf",
      "github 文件 pdf",
      "技術文件 轉 pdf",
      "開源專案 文件 pdf",
      "readme 轉 pdf 免費",
      "github 文件 匯出 pdf",
    ],
    alternates: {
      canonical: "/zh-Hant/github-wenjiian-pdf",
    },
    openGraph: {
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB" }],
      title: "GitHub README 轉 PDF — 免費線上工具，免註冊（2026）",
      description:
        "把 GitHub README.md 一鍵轉成 PDF。免費、免註冊、繁體中文支援。",
      locale: "zh_TW",
    },
  };
}

const faq = [
  { q: "如何把 GitHub 上的 README.md 轉成 PDF？", a: "在 GitHub 儲存庫中打開 README.md，點擊「Raw」按鈕並儲存檔案；接著拖放到 Markdown Free，預覽結果後點擊「轉成 PDF」就能下載。整個過程約 10 秒，不需安裝任何軟體。" },
  { q: "GitHub 文件轉 PDF 工具是免費的嗎？", a: "是。Markdown Free 100% 免費，沒有付費方案、沒有使用次數限制、沒有浮水印，也不需要註冊帳號。" },
  { q: "可以把 GitHub README.md 轉成 PDF 嗎，需要註冊嗎？", a: "可以，且不需要註冊。Markdown Free 不要求帳號，所有檔案都在瀏覽器或無伺服器記憶體中處理，完成後立即丟棄。" },
  { q: "繁體中文的 README 在轉 PDF 後會出現亂碼或字型豆腐嗎？", a: "不會。Markdown Free 在 PDF 渲染管線中內嵌 Noto Sans CJK 字型，繁體中文、簡體中文、日文、韓文都能正確顯示，不會出現□□□豆腐字。" },
  { q: "可以轉換 README 以外的 GitHub Markdown 檔案嗎？", a: "可以。CHANGELOG.md、CONTRIBUTING.md、docs/ 資料夾下的任何 .md 檔案、甚至 GitHub Wiki 匯出的 .md 都能直接轉換。" },
  { q: "GitHub README 中的圖片會包含在 PDF 裡嗎？", a: "絕對網址（https://...）的圖片會包含在 PDF 中。儲存庫相對路徑（例如 ./images/foo.png）在 GitHub 之外無法解析——請改用 raw.githubusercontent.com 的完整網址。" },
  { q: "GitHub 文件轉 PDF 有檔案大小限制嗎？", a: "目前每個檔案的上限是 5MB，足以涵蓋幾乎所有真實世界的 README 與技術文件（約 75 萬字）。" },
  { q: "我的 GitHub 文件會被儲存在你們的伺服器嗎？", a: "不會。PDF 在無伺服器記憶體中產生，完成後立即丟棄；HTML 與 TXT 匯出完全在瀏覽器中處理，不會離開你的電腦。" },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "zh-Hant",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

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
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
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

        <h2>常見問題</h2>
        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

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
    </>
  );
}
