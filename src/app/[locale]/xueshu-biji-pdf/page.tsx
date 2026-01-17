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
    title: "學術筆記轉PDF | 研究筆記Markdown轉PDF | Markdown Free",
    description:
      "將學術筆記、研究筆記從Markdown轉換為PDF。適合學生、研究生、學者。支援數學公式、引用格式。免費，無需註冊。",
    keywords: [
      "學術筆記轉pdf",
      "研究筆記 pdf",
      "markdown 論文",
      "筆記 pdf 轉換",
      "學生筆記 pdf",
      "讀書筆記 pdf",
      "markdown學術寫作",
    ],
    alternates: {
      canonical: "/zh-Hant/xueshu-biji-pdf",
    },
    openGraph: {
      title: "學術筆記轉PDF | Markdown Free",
      description:
        "將學術筆記從Markdown轉換為PDF。適合學生和研究人員。免費，無需註冊。",
      locale: "zh_TW",
    },
  };
}

export default async function XueshuBijiPdfPage({
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
        <h1>學術筆記轉PDF</h1>

        <p className="lead text-lg text-slate-600">
          使用Markdown撰寫學術筆記？將它們轉換成專業的PDF格式，
          方便列印、分享或存檔。適合學生、研究生和學者。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            轉換學術筆記
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>為什麼用Markdown寫學術筆記？</h2>
        <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">⚡ 專注內容</h3>
            <p className="text-sm text-slate-600">
              不用擔心格式，專心寫作。Markdown語法簡單直覺。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📝 版本控制</h3>
            <p className="text-sm text-slate-600">
              純文字檔案，可用Git追蹤修改歷史。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">🔄 多格式輸出</h3>
            <p className="text-sm text-slate-600">
              同一份筆記可輸出PDF、HTML、純文字。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">💻 跨平台</h3>
            <p className="text-sm text-slate-600">
              任何編輯器都能開啟，不受軟體限制。
            </p>
          </div>
        </div>

        <h2>適合的使用情境</h2>
        <ul>
          <li>
            <strong>課堂筆記</strong> — 整理課程內容，轉PDF方便複習
          </li>
          <li>
            <strong>文獻摘要</strong> — 記錄論文重點，建立個人知識庫
          </li>
          <li>
            <strong>讀書心得</strong> — 撰寫閱讀筆記，分享給讀書會
          </li>
          <li>
            <strong>研究筆記</strong> — 記錄實驗過程和發現
          </li>
          <li>
            <strong>考試準備</strong> — 整理重點，列印複習資料
          </li>
        </ul>

        <h2>學術筆記Markdown範例</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# 機器學習導論 - 第三週筆記

## 監督式學習

### 迴歸 (Regression)
- 預測連續數值
- 例如：房價預測、股票價格

### 分類 (Classification)
- 預測離散類別
- 例如：垃圾郵件偵測、影像辨識

## 重要概念

> 過度擬合（Overfitting）是指模型在訓練資料上
> 表現很好，但在新資料上表現不佳。

### 解決方法
1. 增加訓練資料
2. 使用正規化
3. 交叉驗證

## 參考資料
- [Deep Learning Book](https://www.deeplearningbook.org/)
- 李宏毅機器學習課程`}</pre>
        </div>

        <h2>支援的Markdown功能</h2>
        <ul>
          <li>✓ 標題層級 — 章節結構清晰</li>
          <li>✓ 清單和編號 — 整理重點條列</li>
          <li>✓ 引用區塊 — 標註重要觀念</li>
          <li>✓ 程式碼區塊 — 記錄程式範例</li>
          <li>✓ 表格 — 整理比較資料</li>
          <li>✓ 連結 — 附上參考來源</li>
        </ul>

        <h2>常見問題</h2>

        <h3>可以處理很長的筆記嗎？</h3>
        <p>
          可以！我們支援最大5MB的檔案，足以處理數百頁的筆記內容。
          PDF會自動分頁，保持良好的閱讀體驗。
        </p>

        <h3>轉換後格式會亂掉嗎？</h3>
        <p>
          不會！我們的轉換器針對學術內容最佳化，
          標題、清單、引用等都會正確呈現。
        </p>

        <h3>支援中文嗎？</h3>
        <p>
          完全支援！繁體中文、簡體中文都能正確顯示，
          不會出現亂碼問題。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            把學術筆記轉換成專業PDF
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
            <li>✓ 無需帳號或登入</li>
            <li>✓ 筆記不會被儲存</li>
            <li>✓ 處理完成後自動刪除</li>
            <li>✓ 你的學術資料完全保密</li>
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
              <Link href="/zh-Hant/markdown-pdf-zhuanhuan-tw" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown轉PDF - 免費線上工具
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/markdown-pdf-mianzhuce" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                免註冊Markdown轉PDF
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
