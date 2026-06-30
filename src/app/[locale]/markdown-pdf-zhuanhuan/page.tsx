import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { hreflangAlternates } from "@/lib/tool-links";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

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
    title: "Markdown 转 PDF — 免费在线工具，无需注册（2026） | Markdown Free",
    description:
      "在线 Markdown 转 PDF 免费工具：拖放 .md 文件，立即下载 PDF。无需注册、无需安装、无水印。中文支持，无字体豆腐。GFM 表格、清单、代码块完整保留。2026 最新版本。",
    keywords: [
      "markdown 转 pdf",
      "md 转 pdf",
      "在线 markdown 转 pdf",
      "markdown 转 pdf 免费",
      "markdown 转换器",
      "markdown pdf 在线工具",
      "markdown pdf 无需注册",
      "markdown pdf 中文",
      "markdown pdf 2026",
    ],
    alternates: {
      canonical: "/zh-Hans/markdown-pdf-zhuanhuan",
      languages: hreflangAlternates("pdf"),
    },
    openGraph: {
      title: "Markdown 转 PDF — 免费在线工具，无需注册（2026）",
      description:
        "拖放 .md 文件，立即下载 PDF。无需注册、无需安装、中文支持。",
      locale: "zh_CN",
    },
  };
}

const faq = [
  { q: "如何把 Markdown 文件转成 PDF？", a: "把 .md 文件拖放到 Markdown Free 的上传区（或直接粘贴 Markdown 文字），预览确认后点击「转 PDF」即可下载。整个流程约 10 秒，无需安装、无需注册。" },
  { q: "Markdown 转 PDF 工具是免费的吗？", a: "是。Markdown Free 100% 免费，没有付费版、没有注册、没有使用次数限制，导出的 PDF 也没有水印。" },
  { q: "可以不注册就把 Markdown 转成 PDF 吗？", a: "可以。Markdown Free 不需要账号，所有文件都在浏览器或无服务器内存中处理，处理完立即丢弃。" },
  { q: "中文 Markdown 转 PDF 后会出现乱码或字体豆腐吗？", a: "不会。Markdown Free 在 PDF 渲染管线中内嵌 Noto Sans CJK 字体，简体中文、繁体中文、日文、韩文都能正确显示，不会出现 □□□ 豆腐字。" },
  { q: "可以转换 GitHub README.md 吗？", a: "可以。在 GitHub 仓库打开 README.md，点击「Raw」保存文件，然后上传到 Markdown Free 即可导出 PDF。CHANGELOG.md、CONTRIBUTING.md 等任何 .md 文件都支持。" },
  { q: "Markdown 转 PDF 有文件大小限制吗？", a: "目前每个文件的上限是 5MB，足以涵盖几乎所有真实世界的 Markdown 文档（约 75 万字）。" },
  { q: "我的 Markdown 文件会被保存在你们的服务器吗？", a: "不会。PDF 在无服务器内存中生成，完成后立即丢弃；HTML 与 TXT 导出完全在浏览器中处理，不会离开你的电脑。" },
  { q: "GFM 的表格、清单、代码块在 PDF 里会保留吗？", a: "会。表格、任务清单、代码块（含语法高亮）、删除线、自动链接等 GFM 特性都会在 PDF 中正确保留。" },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "zh-Hans",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function MarkdownPdfZhuanhuanPage({
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
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Markdown转PDF - 免费在线工具</h1>

        <p className="lead text-lg text-slate-600">
          想把<code>.md</code>文件转换成专业的PDF？
          使用Markdown Free，几秒钟即可完成。无需注册，无需安装。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            立即免费转换
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>使用方法</h2>
        <ol>
          <li>
            <strong>上传文件</strong> — 将<code>.md</code>或<code>.markdown</code>文件拖放到上传区域
          </li>
          <li>
            <strong>预览确认</strong> — 即时查看格式化后的Markdown
          </li>
          <li>
            <strong>下载PDF</strong> — 点击「转PDF」按钮下载
          </li>
        </ol>

        <h2>为什么选择Markdown Free？</h2>
        <ul>
          <li>
            <strong>100%免费</strong> — 没有隐藏费用，没有订阅
          </li>
          <li>
            <strong>无需注册</strong> — 不需要邮箱或个人信息
          </li>
          <li>
            <strong>隐私保护</strong> — 文件不会存储在服务器上
          </li>
          <li>
            <strong>快速转换</strong> — 几秒钟即可完成
          </li>
          <li>
            <strong>支持GFM</strong> — 表格、清单、删除线等都支持
          </li>
        </ul>

        <h2>支持的格式</h2>
        <p>
          除了PDF，还可以导出为：
        </p>
        <ul>
          <li><strong>HTML</strong> — 用于网页发布</li>
          <li><strong>TXT</strong> — 纯文本</li>
        </ul>

        <h2>常见问题</h2>

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            现在就把Markdown转换成PDF
          </p>
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            免费试用
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相关页面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hans/markdown-pdf-wuxu-zhuce" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                无需注册的Markdown转PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hans/readme-pdf-zhuanhuan" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                README.md转PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hans/markdown-zhuanhuanqi-bijiao" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown转换器对比
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
