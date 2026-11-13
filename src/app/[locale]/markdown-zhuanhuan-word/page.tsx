import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { InlineConverter } from "@/components/inline-converter";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { notFound } from "next/navigation";

// This page is only for zh-Hans locale
export function generateStaticParams() {
  return [{ locale: "zh-Hans" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown转换Word（DOCX）在线工具 – 免费Markdown转Word，公式可编辑 | Markdown Free",
    description: "免费在线把 Markdown（.md）转换为 Word 文档（DOCX）。LaTeX 公式变成可编辑的 Word 公式，表格、代码块和 Mermaid 图表完整保留；DeepSeek、豆包、ChatGPT 的回答粘贴即可转换。无需注册，文件不存储。",
    keywords: [
      "markdown转word",
      "md转word",
      "md文件转word",
      "md转word在线",
      "markdown转word在线工具",
      "在线markdown转word",
      "markdown在线转word",
      "markdown转docx",
      "md转docx",
      "md格式转word",
      "markdown公式转word",
      "readme转word",
      "markdown转换为word",
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
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB" }],
      title: "Markdown转换Word（DOCX）| 免费在线工具，公式可编辑",
      description: "把 .md 文件或 AI 回答转换成可编辑的 Word 文档：公式是 Word 公式，表格是 Word 表格。免费、无需注册。",
      url: "https://www.markdown.free/zh-Hans/markdown-zhuanhuan-word",
      type: "website",
      locale: "zh_CN",
    },
  };
}

// One list feeds both the visible FAQ and the FAQPage schema, so they can't drift apart
const faq = [
  {
    question: "这个Markdown转Word工具是免费的吗？",
    answer: "是的！Markdown Free 100%免费，没有隐藏费用、高级计划或注册要求。",
  },
  {
    question: "公式转到 Word 后还能编辑吗？",
    answer: "可以。用 $…$、$$…$$、\\(…\\) 或 \\[…\\] 包裹的 LaTeX 公式会变成 Word 原生公式，和用 Word 自带的公式编辑器输入的一样，点击即可修改。极少数无法完整转换的公式会保留为清晰的图片，并附上 LaTeX 源码。",
  },
  {
    question: "能转换 DeepSeek、豆包、ChatGPT 的回答吗？",
    answer: "可以。用回答下方的复制按钮复制，粘贴到转换器里：「复制代码」之类的按钮文字、角色标签和 DeepSeek 的 <think> 思考块会自动去掉，公式、表格和代码按排版显示，再点「转Word (DOCX)」即可。",
  },
  {
    question: "图片和流程图会保留吗？",
    answer: "会。文档里的网络图片会嵌入 Word（每个文档最多 20 张）；```mermaid 流程图、时序图在浏览器里画好，以清晰的图片进入 Word。本地路径的图片（如 ./images/a.png）不会随 .md 文件一起上传，请改用网络图片链接。",
  },
  {
    question: "文件大小有限制吗？",
    answer: "单个文件最大 1 MB，大约 30 万个汉字。支持 .md、.markdown 和 .txt 文件，也可以直接粘贴文本。",
  },
  {
    question: "手机上能用吗？",
    answer: "可以。在手机浏览器里同样可以粘贴文本或选择文件；支持分享的浏览器会显示「分享DOCX」，可以直接把 Word 文件发到其他应用。",
  },
  {
    question: "Word和DOCX有什么区别？",
    answer: "DOCX 是 Microsoft Word 自 2007 年起使用的文件格式。我们说的“Word 文档”就是 .docx 文件，可以用 Word、WPS、Google 文档、LibreOffice 等打开。",
  },
  {
    question: "我的文件会存储在您的服务器上吗？",
    answer: "不会。Word 文件在服务器内存中生成，下载后立即丢弃。我们从不存储您的内容。",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "zh-Hans",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        {/* Hero: the converter itself, so a visitor from search converts on the page they land on */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Markdown转换Word（DOCX）– 免费在线工具，公式可编辑
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            拖入 .md 文件，或粘贴 DeepSeek、豆包、ChatGPT 的回答，几秒得到可编辑的
            Word 文档：LaTeX 公式是 Word 公式，表格是 Word 表格，无需注册。
          </p>
          <div className="mx-auto max-w-2xl text-left">
            <InlineConverter
              locale={locale as Locale}
              dict={dict}
              heading="把 .md 文件拖到这里，直接转 Word"
              hint="或点击选择文件 ・ 免费 ・ 无需注册 ・ 文件不存储 ・ 最大 1 MB"
              readyHint="点下方「转Word (DOCX)」下载"
            />
          </div>
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            要粘贴文本或 AI 回答？开始转换 →
          </Link>
        </section>

        {/* What arrives in Word */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            转换后的 Word 文档里有什么
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>可编辑的公式</strong> – $…$、$$…$$、\(…\)、\[…\] 包裹的 LaTeX 公式变成 Word 原生公式，点击即可修改；极少数无法完整转换的公式保留为清晰图片并附上 LaTeX 源码。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>真正的表格</strong> – Markdown 表格变成 Word 表格，表头加粗，可以继续增删行列。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>流程图和图片</strong> – ```mermaid 流程图、时序图以清晰图片嵌入；网络图片一并嵌入（每个文档最多 20 张）。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>完整的结构</strong> – 标题、列表、引用、链接和代码块都保留，代码使用等宽字体。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>通用兼容</strong> – .docx 文件可用 Microsoft Word、WPS、Google 文档和 LibreOffice 打开，收到的人可以直接编辑。</span>
            </li>
          </ul>
        </section>

        {/* AI answers */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            AI 回答转 Word：粘贴即可
          </h2>
          <p className="text-slate-600">
            DeepSeek、豆包、Kimi、ChatGPT 的回答本身就是 Markdown。直接粘贴到 Word 里，公式会变成一串
            \frac、\sum 之类的源码，表格变成竖线和横线。粘贴到转换器里再导出，公式和表格就都是 Word
            原生格式。「复制代码」之类的按钮文字、角色标签和 DeepSeek 的 &lt;think&gt; 思考块在粘贴时自动去掉，不会进入你的文档。
          </p>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            谁在使用Markdown转Word？
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">学生和老师</h3>
              <p className="text-sm text-slate-600">把带公式的作业、论文草稿和讲义转成 Word，公式还能继续修改。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">职场人士</h3>
              <p className="text-sm text-slate-600">把 AI 写好的报告、方案和会议纪要转成公司要求的 Word 文档。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">开发者</h3>
              <p className="text-sm text-slate-600">把 README 和技术文档转成 Word，交给不用 Markdown 的同事。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">作者</h3>
              <p className="text-sm text-slate-600">把用 Markdown 写的稿件导出到 Word，方便编辑修订和协作。</p>
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
                <p className="text-sm text-slate-600">拖入 .md 文件，或粘贴 Markdown 文本和 AI 回答。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">预览</h3>
                <p className="text-sm text-slate-600">在完整转换器里实时查看排版好的文档，包括公式和表格。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">转Word (DOCX)</h3>
                <p className="text-sm text-slate-600">点击「转Word (DOCX)」，Word 文档立即下载；手机上也可以点「分享DOCX」发到其他应用。</p>
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
        <RelatedTools locale={locale as Locale} current="docx" />

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
      <Footer locale={locale} dict={dict} showToolLinks={false} />
    </>
  );
}
