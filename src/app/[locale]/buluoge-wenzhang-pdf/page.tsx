import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

// Only show this page for Traditional Chinese locale (Taiwan focus)
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
    title: "部落格文章轉PDF | 網誌Markdown轉PDF | Markdown Free",
    description:
      "將部落格文章從Markdown轉換為PDF。適合備份網誌、製作電子書、分享離線閱讀。免費，無需註冊。",
    keywords: [
      "部落格轉pdf",
      "網誌 pdf",
      "blog pdf",
      "文章備份",
      "markdown部落格",
      "hexo pdf",
      "hugo pdf",
      "jekyll pdf",
    ],
    alternates: {
      canonical: "/zh-Hant/buluoge-wenzhang-pdf",
    },
    openGraph: {
      title: "部落格文章轉PDF | Markdown Free",
      description:
        "將部落格文章從Markdown轉換為PDF。適合備份和分享。免費，無需註冊。",
      locale: "zh_TW",
    },
  };
}

export default async function BuluogeWenzhangPdfPage({
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
        <h1>部落格文章轉PDF</h1>

        <p className="lead text-lg text-slate-600">
          用Markdown寫部落格？將文章轉換成PDF格式，
          方便離線閱讀、備份存檔或製作電子書合集。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            轉換部落格文章
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>支援的部落格平台</h2>
        <p>
          許多流行的靜態網站產生器都使用Markdown格式，
          你可以直接將原始文章檔案轉換為PDF：
        </p>
        <ul>
          <li>
            <strong>Hexo</strong> — 繁體中文社群最受歡迎的部落格框架
          </li>
          <li>
            <strong>Hugo</strong> — 快速的靜態網站產生器
          </li>
          <li>
            <strong>Jekyll</strong> — GitHub Pages預設的部落格引擎
          </li>
          <li>
            <strong>Gatsby</strong> — React生態系的靜態網站框架
          </li>
          <li>
            <strong>VuePress</strong> — Vue生態系的文件網站工具
          </li>
          <li>
            <strong>Notion</strong> — 匯出為Markdown後可用
          </li>
        </ul>

        <h2>為什麼要把文章轉成PDF？</h2>
        <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">💾 永久備份</h3>
            <p className="text-sm text-slate-600">
              網站可能關閉，但PDF永遠保存你的作品
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📖 電子書</h3>
            <p className="text-sm text-slate-600">
              集結系列文章，製作成電子書分享
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">✈️ 離線閱讀</h3>
            <p className="text-sm text-slate-600">
              搭飛機、捷運時也能閱讀自己的文章
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📋 作品集</h3>
            <p className="text-sm text-slate-600">
              將技術文章整理成作品集，求職加分
            </p>
          </div>
        </div>

        <h2>部落格文章Markdown範例</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`---
title: "React Hooks完全指南"
date: 2026-01-15
tags: [React, JavaScript, 前端]
---

# React Hooks完全指南

React Hooks是React 16.8引入的重要功能，
讓你在函式元件中使用狀態和其他React特性。

## useState

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

## useEffect

處理副作用，例如API呼叫：

\`\`\`javascript
useEffect(() => {
  fetchData();
}, []);
\`\`\`

## 重點整理

1. Hooks只能在函式元件頂層使用
2. 不能在條件式中呼叫Hooks
3. 自訂Hook命名以use開頭

> 完整程式碼請參考我的GitHub！`}</pre>
        </div>
        <p className="text-sm text-slate-600">
          Front matter（---之間的部分）會被保留，
          讓你的PDF保持完整的文章資訊。
        </p>

        <h2>適合的使用場景</h2>
        <ul>
          <li>
            <strong>技術教學</strong> — 將系列教學轉成PDF教材
          </li>
          <li>
            <strong>旅遊遊記</strong> — 製作旅行回憶錄
          </li>
          <li>
            <strong>讀書筆記</strong> — 整理閱讀心得
          </li>
          <li>
            <strong>個人品牌</strong> — 分享專業見解的合集
          </li>
          <li>
            <strong>網站遷移</strong> — 在換平台前備份所有文章
          </li>
        </ul>

        <h2>常見問題</h2>

        <h3>文章中的圖片會顯示嗎？</h3>
        <p>
          使用完整URL的圖片（https://開頭）會正確顯示在PDF中。
          相對路徑的圖片可能需要調整為絕對路徑。
        </p>

        <h3>Front matter會被處理嗎？</h3>
        <p>
          YAML front matter會保留在輸出中，
          讓你的PDF包含標題、日期、標籤等資訊。
        </p>

        <h3>支援程式碼高亮嗎？</h3>
        <p>
          支援！我們支援多種程式語言的語法高亮，
          包括JavaScript、Python、Go、Rust等。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            把部落格文章變成精美PDF
          </p>
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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
            <li>✓ 文章內容不會被儲存</li>
            <li>✓ 處理完成後自動刪除</li>
            <li>✓ 你的創作完全保密</li>
          </ul>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hant/jishu-biji-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                技術筆記轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/github-wenjiian-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                GitHub文件轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/markdown-pdf-zhuanhuan-tw" className="text-emerald-600 hover:text-emerald-700 hover:underline">
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
