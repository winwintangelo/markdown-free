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
    title: "會議記錄轉PDF | 會議紀錄Markdown轉PDF | Markdown Free",
    description:
      "將會議記錄從Markdown轉換為PDF。整理會議重點、待辦事項、決議事項。適合團隊協作。免費，無需註冊。",
    keywords: [
      "會議記錄轉pdf",
      "會議紀錄 pdf",
      "會議筆記 pdf",
      "meeting notes pdf",
      "會議記錄範本",
      "會議紀錄整理",
      "markdown會議記錄",
    ],
    alternates: {
      canonical: "/zh-Hant/huiyi-jilu-pdf",
    },
    openGraph: {
      title: "會議記錄轉PDF | Markdown Free",
      description:
        "將會議記錄從Markdown轉換為PDF。適合團隊分享。免費，無需註冊。",
      locale: "zh_TW",
    },
  };
}

export default async function HuiyiJiluPdfPage({
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
        <h1>會議記錄轉PDF</h1>

        <p className="lead text-lg text-slate-600">
          用Markdown快速記錄會議內容？將會議紀錄轉換成專業的PDF格式，
          方便分享給團隊成員或存檔備查。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            轉換會議記錄
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>為什麼用Markdown記錄會議？</h2>
        <ul>
          <li>
            <strong>打字速度快</strong> — 不用切換滑鼠調格式，專心記錄
          </li>
          <li>
            <strong>結構清晰</strong> — 標題、清單、任務列表一目了然
          </li>
          <li>
            <strong>容易編輯</strong> — 會後整理修改方便快速
          </li>
          <li>
            <strong>版本管理</strong> — 純文字檔案，可用Git追蹤修改
          </li>
          <li>
            <strong>多格式輸出</strong> — 同一份記錄可輸出PDF、HTML
          </li>
        </ul>

        <h2>會議記錄Markdown範本</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# 產品規劃會議

**日期：** 2026年1月17日  
**與會人員：** 王小明、陳小華、林小美  
**記錄：** 王小明

---

## 討論事項

### 1. Q1產品路線圖
- 優先開發新功能A
- 功能B延後至Q2
- 需要額外2名工程師

### 2. 使用者回饋
> 很多使用者反映登入流程太複雜

建議簡化為：
1. 移除驗證碼
2. 新增Google登入

---

## 待辦事項

- [ ] @王小明：整理功能A規格書（1/20前）
- [ ] @陳小華：評估登入流程改版（1/22前）
- [ ] @林小美：聯繫設計師討論UI（1/19前）

---

## 下次會議
**時間：** 2026年1月24日 14:00  
**議題：** 功能A規格審核`}</pre>
        </div>

        <h2>會議記錄PDF的好處</h2>
        <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📧 方便分享</h3>
            <p className="text-sm text-slate-600">
              PDF格式人人都能開，不用擔心軟體相容性
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📁 永久存檔</h3>
            <p className="text-sm text-slate-600">
              PDF不會因編輯軟體版本而格式跑掉
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">🖨️ 列印友善</h3>
            <p className="text-sm text-slate-600">
              紙本會議記錄，適合正式場合
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">🔒 唯讀保護</h3>
            <p className="text-sm text-slate-600">
              避免會議記錄被意外修改
            </p>
          </div>
        </div>

        <h2>適合的使用場景</h2>
        <ul>
          <li>
            <strong>團隊週會</strong> — 記錄進度、問題和下週計畫
          </li>
          <li>
            <strong>客戶會議</strong> — 確認需求和時程
          </li>
          <li>
            <strong>專案kick-off</strong> — 記錄目標和分工
          </li>
          <li>
            <strong>腦力激盪</strong> — 整理創意和點子
          </li>
          <li>
            <strong>績效面談</strong> — 記錄重點和後續行動
          </li>
        </ul>

        <h2>常見問題</h2>

        <h3>會議記錄會被儲存嗎？</h3>
        <p>
          不會！你的會議記錄只在轉換時暫時處理，
          完成後立即刪除。我們不儲存任何資料。
        </p>

        <h3>可以加入公司Logo嗎？</h3>
        <p>
          目前版本使用簡潔的預設樣式。
          如需加入Logo，建議在Markdown中使用圖片語法插入。
        </p>

        <h3>支援任務清單嗎？</h3>
        <p>
          支援！使用<code>- [ ]</code>和<code>- [x]</code>
          語法即可建立待辦事項清單，PDF會正確呈現勾選框。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            讓會議記錄更專業、更好分享
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
            企業級隱私保護
          </h3>
          <ul className="space-y-2 text-slate-600">
            <li>✓ 無需帳號或登入</li>
            <li>✓ 資料不會被儲存</li>
            <li>✓ HTTPS加密傳輸</li>
            <li>✓ 處理完成後自動刪除</li>
          </ul>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hant/xueshu-biji-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                學術筆記轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/jishu-biji-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                技術筆記轉PDF
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
