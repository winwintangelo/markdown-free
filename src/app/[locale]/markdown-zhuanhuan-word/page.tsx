import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

// This page is only for zh-Hans locale
export function generateStaticParams() {
  return [{ locale: "zh-Hans" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown转换Word（DOCX）| 免费在线工具 | Markdown Free",
    description: "即时将Markdown文件转换为Word文档（DOCX）。100%免费，无需注册，无广告。您的文件安全处理，永不存储。",
    keywords: [
      "markdown转word",
      "markdown转docx",
      "md转word",
      "markdown word转换器",
      "markdown转换word在线",
    ],
    alternates: {
      canonical: "https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word",
      languages: {
        "en": "/markdown-to-word",
        "id": "/id/markdown-ke-word",
        "ja": "/ja/markdown-word-henkan",
        "es": "/es/markdown-a-word",
        "ko": "/ko/markdown-word-byeonhwan",
        "vi": "/vi/markdown-sang-word",
        "zh-Hans": "/zh-Hans/markdown-zhuanhuan-word",
        "zh-Hant": "/zh-Hant/markdown-word-zhuanhuan",
        "it": "/it/markdown-in-word",
        "x-default": "/markdown-to-word",
      },
    },
    openGraph: {
      title: "Markdown转换Word（DOCX）| 免费在线工具",
      description: "将.md文件转换为Microsoft Word格式。免费、私密、即时下载。",
      url: "https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word",
      type: "website",
      locale: "zh_CN",
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownZhuanhuanWordPage({ params }: PageProps) {
  const { locale } = await params;

  // Only allow zh-Hans
  if (locale !== "zh-Hans") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Markdown转换Word（DOCX）– 免费在线工具
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            将您的Markdown文件转换为专业的Microsoft Word文档。
            非常适合与非技术同事分享文档、提交报告
            或从笔记创建可编辑文档。
          </p>
          <Link
            href="/zh-Hans"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            开始转换 →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            为什么要将Markdown转换为Word？
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>通用兼容性</strong> – Word文档（.docx）可在任何地方使用：Microsoft Office、Google Docs、LibreOffice。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>可编辑输出</strong> – 与PDF不同，Word/DOCX文件可以被接收者轻松编辑。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>专业格式</strong> – 表格、代码块和标题作为适当的Word样式保留。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>商务就绪</strong> – 非常适合在企业环境中提交文档、报告或提案。</span>
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            谁在使用Markdown转Word？
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">学生</h3>
              <p className="text-sm text-slate-600">将论文和报告草稿从Markdown转换为Word以便提交。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">开发者</h3>
              <p className="text-sm text-slate-600">将README文件和技术文档转换为非技术人员的Word规格说明。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">作家</h3>
              <p className="text-sm text-slate-600">将Markdown编写的手稿导出到Word进行编辑和协作。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">团队</h3>
              <p className="text-sm text-slate-600">与喜欢Office的同事分享Markdown文档的Word文件。</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            如何将Markdown转换为Word（DOCX）
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">上传或粘贴</h3>
                <p className="text-sm text-slate-600">拖放您的.md文件，或直接粘贴Markdown文本。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">预览</h3>
                <p className="text-sm text-slate-600">在转换前实时查看格式化的文档。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">导出到Word</h3>
                <p className="text-sm text-slate-600">点击"转DOCX"并立即下载您的Word文档。</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            隐私与安全
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>文件在内存中临时处理</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>永不存储在服务器上</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>HTTPS加密连接</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>无需创建账户</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            常见问题
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                这个Markdown转Word工具是免费的吗？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                是的！Markdown Free 100%免费，没有隐藏费用、高级计划或注册要求。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Word和DOCX有什么区别？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                DOCX是2007年以来Microsoft Word使用的文件格式。当我们说"Word文档"时，我们指的是可以在Word、Google Docs、LibreOffice和其他文字处理器中打开的.docx文件。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                我的文件会存储在您的服务器上吗？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                不会。文件在内存中处理，转换后立即删除。我们从不存储您的内容。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                表格和代码块等格式会保留吗？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                是的！表格、代码块、标题、列表和其他Markdown格式都会转换为适当的Word样式。
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            立即将Markdown转换为Word →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            免费 • 无需注册 • 即时下载
          </p>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
