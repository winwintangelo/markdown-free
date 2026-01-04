import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

// Only show this page for Simplified Chinese locale
export function generateStaticParams() {
  return [{ locale: "zh-Hans" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "zh-Hans") {
    return {};
  }

  return {
    title: "Markdown转换器对比 2026 | Markdown Free vs 其他工具",
    description:
      "Markdown PDF转换工具全面对比。Markdown Free、CloudConvert、LightPDF的区别。免费、无需注册、保护隐私。",
    keywords: [
      "markdown转换对比",
      "markdown free vs cloudconvert",
      "pdf转换工具对比",
      "最好的markdown转换器",
      "免费md pdf转换",
    ],
    alternates: {
      canonical: "/zh-Hans/markdown-zhuanhuanqi-bijiao",
    },
    openGraph: {
      title: "Markdown转换器对比 2026 | Markdown Free vs 其他工具",
      description:
        "Markdown PDF转换工具全面对比。免费、无需注册、保护隐私。",
      locale: "zh_CN",
    },
  };
}

export default async function MarkdownZhuanhuanqiBijiaoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (localeParam !== "zh-Hans") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Markdown转换器对比</h1>

        <p className="lead text-lg text-slate-600">
          在找最好的Markdown PDF转换工具？来看看Markdown Free和
          其他热门工具的诚实对比。
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
                <td className="px-4 py-3 font-medium">完全免费</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">每日限制</td>
                <td className="px-4 py-3 text-center text-slate-500">每日限制</td>
                <td className="px-4 py-3 text-center text-slate-500">仅桌面版</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">无需注册</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">隐私保护（不存储文件）</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">临时存储</td>
                <td className="px-4 py-3 text-center text-slate-500">云端存储</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓（本地）</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">实时预览</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">GitHub Flavored Markdown</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">部分支持</td>
                <td className="px-4 py-3 text-center text-slate-500">部分支持</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">HTML/TXT导出</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-slate-500">仅PDF</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">中文界面</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>为什么选择Markdown Free</h2>

        <h3>完全免费</h3>
        <p>
          CloudConvert和LightPDF的免费版有严格限制（每天25次转换等），
          但Markdown Free完全免费，没有任何限制。
          不存在「Pro」套餐，所有功能都已经可以使用。
        </p>

        <h3>隐私优先</h3>
        <p>
          CloudConvert和LightPDF会把文件存储到服务器（即使是临时的）。
          Markdown Free不存储文件。预览在浏览器内处理，
          PDF在内存中生成后立即删除。
        </p>

        <h3>简单易用</h3>
        <p>
          不用创建账户，没有复杂的控制面板，不需要管理「额度」。
          打开页面，拖入文件，下载PDF。就这么简单。
        </p>

        <h3>实时预览</h3>
        <p>
          与其他转换工具不同，Markdown Free在转换前会显示
          文档的格式化预览。可以确认表格、代码和格式是否正确。
        </p>

        <h2>其他工具适合的场景</h2>
        <p>
          公平起见，也介绍一下其他方案更合适的情况：
        </p>
        <ul>
          <li>
            <strong>CloudConvert</strong> — 如果需要在Markdown以外的
            多种格式之间转换
          </li>
          <li>
            <strong>PDFForge</strong> — 如果偏好本地安装的桌面应用
          </li>
          <li>
            <strong>Pandoc</strong> — 如果是开发者，想要通过命令行完全掌控
          </li>
        </ul>

        <h2>自己试试看</h2>
        <p>
          决定的最好方式？试用Markdown Free。
          真的只需要10秒钟。
        </p>

        {/* CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            无限制。无需注册。完全免费。
          </p>
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            试用Markdown Free
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
