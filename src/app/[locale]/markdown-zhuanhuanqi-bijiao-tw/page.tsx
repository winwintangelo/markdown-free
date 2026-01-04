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
    title: "Markdown轉換器比較 2026 | Markdown Free vs 其他工具",
    description:
      "Markdown PDF轉換工具全面比較。Markdown Free、CloudConvert、LightPDF的差異。免費、無需註冊、保護隱私。",
    keywords: [
      "markdown轉換比較",
      "markdown free vs cloudconvert",
      "pdf轉換工具比較",
      "最好的markdown轉換器",
      "免費md pdf轉換",
    ],
    alternates: {
      canonical: "/zh-Hant/markdown-zhuanhuanqi-bijiao-tw",
    },
    openGraph: {
      title: "Markdown轉換器比較 2026 | Markdown Free vs 其他工具",
      description:
        "Markdown PDF轉換工具全面比較。免費、無需註冊、保護隱私。",
      locale: "zh_TW",
    },
  };
}

export default async function MarkdownZhuanhuanqiBijiaoTwPage({
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
        <h1>Markdown轉換器比較</h1>

        <p className="lead text-lg text-slate-600">
          在找最好的Markdown PDF轉換工具？來看看Markdown Free和
          其他熱門工具的誠實比較。
        </p>

        {/* Comparison Table */}
        <div className="not-prose my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">功能</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-700">Markdown Free</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">CloudConvert</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">LightPDF</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">PDFForge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">完全免費</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">每日限制</td>
                <td className="px-4 py-3 text-center text-slate-500">每日限制</td>
                <td className="px-4 py-3 text-center text-slate-500">僅桌面版</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">無需註冊</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">隱私保護（不儲存檔案）</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">暫時儲存</td>
                <td className="px-4 py-3 text-center text-slate-500">雲端儲存</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓（本機）</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">即時預覽</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">GitHub Flavored Markdown</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">部分支援</td>
                <td className="px-4 py-3 text-center text-slate-500">部分支援</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">HTML/TXT匯出</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-slate-500">僅PDF</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">中文介面</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>為什麼選擇Markdown Free</h2>

        <h3>完全免費</h3>
        <p>
          CloudConvert和LightPDF的免費版有嚴格限制（每天25次轉換等），
          但Markdown Free完全免費，沒有任何限制。
          不存在「Pro」方案，所有功能都已經可以使用。
        </p>

        <h3>隱私優先</h3>
        <p>
          CloudConvert和LightPDF會把檔案儲存到伺服器（即使是暫時的）。
          Markdown Free不儲存檔案。預覽在瀏覽器內處理，
          PDF在記憶體中生成後立即刪除。
        </p>

        <h3>簡單易用</h3>
        <p>
          不用建立帳戶，沒有複雜的控制面板，不需要管理「額度」。
          打開頁面，拖入檔案，下載PDF。就這麼簡單。
        </p>

        <h3>即時預覽</h3>
        <p>
          與其他轉換工具不同，Markdown Free在轉換前會顯示
          文件的格式化預覽。可以確認表格、程式碼和格式是否正確。
        </p>

        <h2>其他工具適合的場景</h2>
        <p>
          公平起見，也介紹一下其他方案更合適的情況：
        </p>
        <ul>
          <li>
            <strong>CloudConvert</strong> — 如果需要在Markdown以外的
            多種格式之間轉換
          </li>
          <li>
            <strong>PDFForge</strong> — 如果偏好本機安裝的桌面應用
          </li>
          <li>
            <strong>Pandoc</strong> — 如果是開發者，想要透過命令列完全掌控
          </li>
        </ul>

        <h2>自己試試看</h2>
        <p>
          決定的最好方式？試用Markdown Free。
          真的只需要10秒鐘。
        </p>

        {/* CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            無限制。無需註冊。完全免費。
          </p>
          <Link
            href="/zh-Hant"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            試用Markdown Free
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
