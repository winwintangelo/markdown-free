import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for the zh-Hant locale
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
    title: "Markdown轉圖片/長圖 – 免費線上工具 | Markdown Free",
    description: "免費將 Markdown 轉換為清晰的 PNG 圖片或長圖，全程在瀏覽器完成，檔案不上傳。長文可匯出為一張長圖或分段圖片ZIP，適合社群平台與部落格分享。",
    keywords: ["markdown轉圖片", "markdown轉長圖", "markdown 轉 png", "md轉圖片", "markdown 長圖工具"],
    alternates: {
      canonical: "/zh-Hant/markdown-zhuan-tupian-tw",
      languages: hreflangAlternates("image"),
    },
    openGraph: {
      title: "Markdown轉圖片/長圖 – 免費線上工具 | Markdown Free",
      description: "把 Markdown 渲染為清晰的 PNG 長圖，全程本地處理，無需註冊。",
      locale: "zh_TW",
    },
  };
}

const faq = [
  {
    "question": "這個 Markdown 轉圖片工具免費嗎？",
    "answer": "免費！Markdown Free 100%免費，沒有隱藏費用、進階方案或註冊要求。"
  },
  {
    "question": "長文件如何處理？",
    "answer": "約十個螢幕高度以內的文件會匯出為單張圖片。更長的文件可選擇：一張長圖（便於分享）或分段圖片ZIP（超長文件更清晰）。"
  },
  {
    "question": "我的 Markdown 會上傳到伺服器嗎？",
    "answer": "不會。圖片完全在你的瀏覽器中渲染，Markdown 內容不離開你的裝置。只有文件中引用的遠端圖片可能透過我們的代理取得。"
  },
  {
    "question": "中文會亂碼嗎？",
    "answer": "不會。圖片使用你裝置自帶的字型渲染，輸出效果與預覽完全一致。"
  },
  {
    "question": "可以匯出 JPG 嗎？",
    "answer": "可以，JPG 在「更多格式」選單中。文字內容推薦使用 PNG（無損壓縮）。"
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "zh-Hant",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default async function MarkdownZhuanTupianTwPage({
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Markdown 轉圖片/長圖 – 免費工具
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          把 Markdown 文章渲染為清晰的 PNG 圖片或長圖，全程在瀏覽器中完成，內容不會上傳。適合在不支援 Markdown 的社群平台與通訊軟體分享。
        </p>
        <Link
          href="/zh-Hant"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          立即開始 — 免費 <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why Image Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          為什麼要把 Markdown 轉成圖片？
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>隨處分享</strong> – 圖片可以在任何聊天軟體、社群平台與簡報中使用。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>文字清晰銳利</strong> – 按裝置像素密度渲染，文字比截圖更清晰。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>長圖或分段</strong> – 長文可匯出為一張長圖，或分段圖片ZIP（超長文件更清晰）。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>全程本地處理</strong> – 圖片在瀏覽器中生成，Markdown 內容絕不上傳。</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          如何把 Markdown 轉成圖片
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
            <div>
              <h3 className="font-medium text-slate-900">上傳或貼上</h3>
              <p className="text-sm text-slate-600">拖放你的.md檔案，或直接貼上 Markdown 文字。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
            <div>
              <h3 className="font-medium text-slate-900">預覽</h3>
              <p className="text-sm text-slate-600">在轉換前即時查看格式化後的文件。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
            <div>
              <h3 className="font-medium text-slate-900">匯出為圖片</h3>
              <p className="text-sm text-slate-600">點擊「轉圖片 (PNG)」即刻下載。JPG 在「更多格式」中。</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          常見問題
        </h2>
        <div className="space-y-4">
          {faq.map((item) => (
            <details key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related tool suite cross-links */}
      <RelatedTools locale={locale} current="image" />

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/zh-Hant"
          className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          立即將 Markdown 轉為圖片 <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          免費 &bull; 無需註冊 &bull; 即時下載
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
