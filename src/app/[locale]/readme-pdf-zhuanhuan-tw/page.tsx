import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

const faq = [
  { q: "如何把 .md 檔案轉成 PDF？", a: "把 .md 檔案拖放到 Markdown Free 的上傳區（或直接貼上 Markdown 文字），預覽確認後點擊「轉 PDF」即可下載。整個流程約 10 秒，不需安裝、不需註冊。" },
  { q: "README.md 可以轉 PDF 嗎？", a: "可以。GitHub 的 README.md、CHANGELOG.md、CONTRIBUTING.md，或任何 .md / .markdown 檔案都支援。表格、程式碼區塊、清單、checklist 等格式完整保留。" },
  { q: "Markdown 轉 PDF 工具是免費的嗎？", a: "是。Markdown Free 100% 免費，沒有付費版、沒有註冊、沒有使用次數限制，匯出的 PDF 也沒有浮水印。" },
  { q: "可以不註冊就把 Markdown 轉成 PDF 嗎？", a: "可以。Markdown Free 不需要帳號，所有檔案都在瀏覽器或無伺服器記憶體中處理，處理完立即丟棄。" },
  { q: "繁體中文的 Markdown 轉成 PDF 後會出現亂碼嗎？", a: "不會。Markdown Free 在 PDF 渲染管線中內嵌 Noto Sans CJK 字型，繁體中文、簡體中文、日文、韓文都能正確顯示，不會出現□□□豆腐字。" },
  { q: "Markdown 中的圖片會包含在 PDF 裡嗎？", a: "絕對網址（https://...）的圖片會包含在 PDF 中。儲存庫相對路徑（例如 ./images/foo.png）在 GitHub 之外無法解析——請改用 raw.githubusercontent.com 的完整網址。" },
  { q: "Markdown 轉 PDF 有檔案大小限制嗎？", a: "目前每個檔案的上限是 5MB，足以涵蓋幾乎所有真實世界的 README 與 Markdown 文件（約 75 萬字）。" },
  { q: "我的 Markdown 檔案會被儲存在你們的伺服器嗎？", a: "不會。PDF 在無伺服器記憶體中產生，完成後立即丟棄；HTML 與 TXT 匯出完全在瀏覽器中處理，不會離開你的電腦。" },
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
    title: "Markdown 轉 PDF — .md 檔案一鍵轉換，免費線上（2026）",
    description:
      "把 .md 檔案轉成 PDF：上傳 README.md 或任何 Markdown 文件，立即下載 PDF。免費、免註冊、檔案不存檔，繁體中文完整支援。線上工具，無需安裝。",
    keywords: [
      "markdown 轉 pdf",
      ".md 轉 pdf",
      "readme.md 轉 pdf",
      "readme 轉 pdf",
      "線上 markdown 轉 pdf",
      "markdown pdf 免費",
      "markdown 檔案 pdf",
      "github readme pdf",
    ],
    alternates: {
      canonical: "/zh-Hant/readme-pdf-zhuanhuan-tw",
    },
    openGraph: {
      title: "Markdown 轉 PDF — .md 檔案一鍵轉換，免費線上（2026）",
      description:
        "上傳 .md 或 README.md，立即下載 PDF。免費、免註冊、繁體中文支援。",
      locale: "zh_TW",
    },
  };
}

export default async function ReadmePdfZhuanhuanTwPage({
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
        <h1>Markdown 轉 PDF（README 也可）</h1>

        <p className="lead text-lg text-slate-600">
          想把 <code>.md</code> 檔案轉成 PDF？不論是 GitHub 的 README.md 還是其他 Markdown 文件，
          都能一鍵轉換成專業 PDF。免費、免註冊、檔案不儲存。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            轉換README
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>為什麼要把README轉成PDF？</h2>
        <ul>
          <li>
            <strong>離線文件</strong> — 無需網路也能分享文件
          </li>
          <li>
            <strong>專業作品集</strong> — 以精美的格式展示專案
          </li>
          <li>
            <strong>簡報</strong> — 將技術文件嵌入投影片
          </li>
          <li>
            <strong>存檔</strong> — 保存文件的靜態版本
          </li>
          <li>
            <strong>列印</strong> — 用於會議或審查的紙本資料
          </li>
        </ul>

        <h2>完全支援GitHub Flavored Markdown</h2>
        <p>
          Markdown Free支援GitHub Flavored Markdown (GFM)的所有功能：
        </p>
        <ul>
          <li>✓ 表格</li>
          <li>✓ 清單 / 任務列表</li>
          <li>✓ 刪除線</li>
          <li>✓ 語法高亮</li>
          <li>✓ 自動連結</li>
          <li>✓ 表情符號 :smile:</li>
        </ul>

        <h2>如何轉換README</h2>
        <ol>
          <li>
            <strong>下載README</strong> — 在GitHub儲存庫打開README.md，
            點擊「Raw」，儲存檔案
          </li>
          <li>
            <strong>上傳到Markdown Free</strong> — 將檔案拖放到上傳區域
          </li>
          <li>
            <strong>檢查預覽</strong> — 確認格式正確
          </li>
          <li>
            <strong>匯出</strong> — 點擊「轉PDF」下載
          </li>
        </ol>

        <h2>範例：典型的README</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# 專案名稱

專案的簡短描述。

## 安裝

\`\`\`bash
npm install project-name
\`\`\`

## 使用方法

\`\`\`javascript
import { myFunction } from 'project-name';
myFunction();
\`\`\`

## 功能特性

- [x] 已完成的功能
- [ ] 開發中的功能

## 授權條款

MIT`}</pre>
        </div>
        <p>
          這個README會以完美的格式轉換為PDF：
          標題、程式碼區塊（帶語法高亮）、清單等
          都會完美呈現。
        </p>

        <h2>常見問題</h2>

        {faq.map((item, i) => (
          <details key={i} className={i === 0 ? "group" : "group mt-4"} open={i === 0 ? true : undefined}>
            <summary className="cursor-pointer font-semibold text-slate-800 hover:text-emerald-700">
              {item.q}
            </summary>
            <p className="mt-2">{item.a}</p>
          </details>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            把README轉換成專業文件
          </p>
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            立即免費試用
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hant/markdown-pdf-zhuanhuan-tw" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown轉PDF - 免費線上工具
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/markdown-pdf-mianzhuce" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                免註冊Markdown轉PDF
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
