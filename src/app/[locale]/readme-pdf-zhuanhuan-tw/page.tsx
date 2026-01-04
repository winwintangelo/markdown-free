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
    title: "README.md轉PDF | Markdown Free",
    description:
      "將GitHub的README.md轉換為專業PDF。適合文件歸檔、作品集、簡報。免費，無需註冊。",
    keywords: [
      "readme轉pdf",
      "readme.md pdf",
      "github readme pdf",
      "markdown文件 pdf",
      "readme轉換 免費",
    ],
    alternates: {
      canonical: "/zh-Hant/readme-pdf-zhuanhuan-tw",
    },
    openGraph: {
      title: "README.md轉PDF | Markdown Free",
      description:
        "將GitHub的README.md轉換為專業PDF。免費，無需註冊。",
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
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>README.md轉PDF</h1>

        <p className="lead text-lg text-slate-600">
          有GitHub專案的README.md？將它轉換成專業的PDF，
          用於文件歸檔、作品集或簡報。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>README中的圖片會被包含嗎？</h3>
        <p>
          絕對URL（如 https://...）的圖片會被包含在PDF中。
          相對路徑的圖片可能無法正確顯示。
          建議使用完整URL。
        </p>

        <h3>可以轉換儲存庫中的其他Markdown檔案嗎？</h3>
        <p>
          當然可以！CHANGELOG.md、CONTRIBUTING.md、/docs資料夾中的
          文件等任何<code>.md</code>檔案都支援。
        </p>

        <h3>可以自訂PDF格式嗎？</h3>
        <p>
          目前PDF使用針對可讀性最佳化的專業版面。
          我們正在考慮在未來版本中新增自訂選項。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            把README轉換成專業文件
          </p>
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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
              <Link href="/zh-Hant/markdown-pdf-zhuanhuan-tw" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown轉PDF - 免費線上工具
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/markdown-pdf-mianzhuce" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                免註冊Markdown轉PDF
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
