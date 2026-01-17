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
    title: "API文件轉PDF | 技術文件Markdown轉PDF | Markdown Free",
    description:
      "將API文件從Markdown轉換為PDF。適合開發團隊、技術文件存檔、離線參考。支援程式碼高亮。免費，無需註冊。",
    keywords: [
      "api文件轉pdf",
      "技術文件 pdf",
      "api文檔 pdf",
      "swagger pdf",
      "openapi pdf",
      "開發文件 pdf",
      "程式文件",
    ],
    alternates: {
      canonical: "/zh-Hant/api-wendang-pdf",
    },
    openGraph: {
      title: "API文件轉PDF | Markdown Free",
      description:
        "將API文件從Markdown轉換為PDF。適合開發團隊。免費，無需註冊。",
      locale: "zh_TW",
    },
  };
}

export default async function ApiWendangPdfPage({
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
        <h1>API文件轉PDF</h1>

        <p className="lead text-lg text-slate-600">
          用Markdown撰寫API文件？將技術文件轉換成PDF格式，
          方便團隊分享、離線參考或交付客戶。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            轉換API文件
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>為什麼開發者需要PDF版API文件？</h2>
        <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📋 客戶交付</h3>
            <p className="text-sm text-slate-600">
              交付專業的PDF文件給客戶或合作夥伴
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">✈️ 離線開發</h3>
            <p className="text-sm text-slate-600">
              沒有網路也能參考API規格進行開發
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">📁 版本存檔</h3>
            <p className="text-sm text-slate-600">
              保存每個版本的API文件快照
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">🔍 程式碼審查</h3>
            <p className="text-sm text-slate-600">
              列印出來在會議中討論API設計
            </p>
          </div>
        </div>

        <h2>API文件Markdown範例</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# 使用者API文件

## 認證

所有API請求需要在Header中包含：

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

---

## 端點

### GET /api/users

取得使用者列表。

**參數：**

| 參數 | 類型 | 說明 |
|------|------|------|
| page | number | 頁碼（預設1） |
| limit | number | 每頁數量（預設20） |

**回應範例：**

\`\`\`json
{
  "data": [
    {
      "id": 1,
      "name": "王小明",
      "email": "ming@example.com"
    }
  ],
  "total": 100,
  "page": 1
}
\`\`\`

### POST /api/users

建立新使用者。

**請求本體：**

\`\`\`json
{
  "name": "新使用者",
  "email": "user@example.com",
  "password": "secure123"
}
\`\`\`

**回應：** 201 Created`}</pre>
        </div>

        <h2>完美支援技術文件格式</h2>
        <ul>
          <li>
            <strong>程式碼區塊</strong> — 多語言語法高亮（JSON、JavaScript、Python等）
          </li>
          <li>
            <strong>表格</strong> — API參數說明、回應欄位一目了然
          </li>
          <li>
            <strong>標題層級</strong> — 清晰的文件結構
          </li>
          <li>
            <strong>連結</strong> — 相關端點的交叉引用
          </li>
          <li>
            <strong>引用區塊</strong> — 重要提示和警告
          </li>
        </ul>

        <h2>適合的使用場景</h2>
        <ul>
          <li>
            <strong>REST API文件</strong> — 端點、參數、回應格式
          </li>
          <li>
            <strong>SDK使用說明</strong> — 安裝、設定、範例程式碼
          </li>
          <li>
            <strong>系統整合指南</strong> — 給第三方開發者的文件
          </li>
          <li>
            <strong>內部技術規格</strong> — 團隊開發參考
          </li>
          <li>
            <strong>開源專案文件</strong> — README和API參考
          </li>
        </ul>

        <h2>常見問題</h2>

        <h3>可以處理很長的API文件嗎？</h3>
        <p>
          可以！支援最大5MB的檔案，足以處理完整的API參考文件。
          PDF會自動分頁，保持良好的閱讀體驗。
        </p>

        <h3>JSON/XML程式碼會正確顯示嗎？</h3>
        <p>
          完全支援！JSON、XML和其他格式都會有語法高亮，
          讓程式碼更容易閱讀。
        </p>

        <h3>表格會被正確處理嗎？</h3>
        <p>
          GitHub風格的Markdown表格會完美呈現，
          適合用來說明API參數和回應欄位。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            讓API文件更專業、更好分享
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
            機密資料安全
          </h3>
          <ul className="space-y-2 text-slate-600">
            <li>✓ 無需帳號登入</li>
            <li>✓ 資料不會被儲存</li>
            <li>✓ HTTPS加密傳輸</li>
            <li>✓ 處理完成後自動刪除</li>
            <li>✓ 你的API規格完全保密</li>
          </ul>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hant/github-wenjiian-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                GitHub文件轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/jishu-biji-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                技術筆記轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/readme-pdf-zhuanhuan-tw" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                README.md轉PDF
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
