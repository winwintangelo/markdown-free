import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { hreflangAlternates } from "@/lib/tool-links";
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
    title: "Markdown 轉 PDF — 免費線上工具，免註冊（2026） | Markdown Free",
    description:
      "線上 Markdown 轉 PDF 免費工具：拖放 .md 檔案，立即下載 PDF。免註冊、免安裝、無浮水印。繁體中文支援，無字型亂碼。GFM 表格、清單、程式碼區塊完整保留。2026 最新版本。",
    keywords: [
      "markdown 轉 pdf",
      "md 轉 pdf",
      "線上 markdown 轉 pdf",
      "markdown 轉 pdf 免費",
      "markdown 轉換器",
      "markdown pdf 線上工具",
      "markdown pdf 免註冊",
      "markdown pdf 繁體中文",
      "markdown pdf 2026",
    ],
    alternates: {
      canonical: "/zh-Hant/markdown-pdf-zhuanhuan-tw",
      languages: hreflangAlternates("pdf"),
    },
    openGraph: {
      title: "Markdown 轉 PDF — 免費線上工具，免註冊（2026）",
      description:
        "拖放 .md 檔案，立即下載 PDF。免註冊、免安裝、繁體中文支援。",
      locale: "zh_TW",
    },
  };
}

const faq = [
  { q: "如何把 Markdown 檔案轉成 PDF？", a: "把 .md 檔案拖放到 Markdown Free 的上傳區（或直接貼上 Markdown 文字），預覽確認後點擊「轉 PDF」即可下載。整個流程約 10 秒，不需安裝、不需註冊。" },
  { q: "Markdown 轉 PDF 工具是免費的嗎？", a: "是。Markdown Free 100% 免費，沒有付費版、沒有註冊、沒有使用次數限制，匯出的 PDF 也沒有浮水印。" },
  { q: "可以不註冊就把 Markdown 轉成 PDF 嗎？", a: "可以。Markdown Free 不需要帳號，所有檔案都在瀏覽器或無伺服器記憶體中處理，處理完立即丟棄。" },
  { q: "繁體中文的 Markdown 轉成 PDF 後會出現亂碼嗎？", a: "不會。Markdown Free 在 PDF 渲染管線中內嵌 Noto Sans CJK 字型，繁體中文、簡體中文、日文、韓文都能正確顯示，不會出現□□□豆腐字。" },
  { q: "可以轉換 GitHub README.md 嗎？", a: "可以。在 GitHub 儲存庫打開 README.md，點擊「Raw」儲存檔案，然後上傳到 Markdown Free 即可匯出 PDF。CHANGELOG.md、CONTRIBUTING.md 等任何 .md 檔案都支援。" },
  { q: "Markdown 轉 PDF 有檔案大小限制嗎？", a: "目前每個檔案的上限是 5MB，足以涵蓋幾乎所有真實世界的 Markdown 文件（約 75 萬字）。" },
  { q: "我的 Markdown 檔案會被儲存在你們的伺服器嗎？", a: "不會。PDF 在無伺服器記憶體中產生，完成後立即丟棄；HTML 與 TXT 匯出完全在瀏覽器中處理，不會離開你的電腦。" },
  { q: "GFM 的表格、清單、程式碼區塊在 PDF 裡會保留嗎？", a: "會。表格、任務清單、程式碼區塊（含語法高亮）、刪除線、自動連結等 GFM 特性都會在 PDF 中正確保留。" },
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

export default async function MarkdownPdfZhuanhuanTwPage({
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
        <h1>Markdown轉PDF - 免費線上工具</h1>

        <p className="lead text-lg text-slate-600">
          想把<code>.md</code>檔案轉換成專業的PDF？
          使用Markdown Free，幾秒鐘即可完成。無需註冊，無需安裝。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            立即免費轉換
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>使用方法</h2>
        <ol>
          <li>
            <strong>上傳檔案</strong> — 將<code>.md</code>或<code>.markdown</code>檔案拖放到上傳區域
          </li>
          <li>
            <strong>預覽確認</strong> — 即時查看格式化後的Markdown
          </li>
          <li>
            <strong>下載PDF</strong> — 點擊「轉PDF」按鈕下載
          </li>
        </ol>

        <h2>為什麼選擇Markdown Free？</h2>
        <ul>
          <li>
            <strong>100%免費</strong> — 沒有隱藏費用，沒有訂閱
          </li>
          <li>
            <strong>無需註冊</strong> — 不需要電子郵件或個人資訊
          </li>
          <li>
            <strong>隱私保護</strong> — 檔案不會儲存在伺服器上
          </li>
          <li>
            <strong>快速轉換</strong> — 幾秒鐘即可完成
          </li>
          <li>
            <strong>支援GFM</strong> — 表格、清單、刪除線等都支援
          </li>
        </ul>

        <h2>支援的格式</h2>
        <p>
          除了PDF，還可以匯出為：
        </p>
        <ul>
          <li><strong>HTML</strong> — 用於網頁發布</li>
          <li><strong>TXT</strong> — 純文字</li>
        </ul>

        <h2>常見問題</h2>

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            現在就把Markdown轉換成PDF
          </p>
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            免費試用
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hant/markdown-pdf-mianzhuce" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                免註冊Markdown轉PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hant/readme-pdf-zhuanhuan-tw" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                README.md轉PDF
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
