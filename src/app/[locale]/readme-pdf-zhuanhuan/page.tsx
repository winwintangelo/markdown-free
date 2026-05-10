import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
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
    title: "README.md 转 PDF — 免费在线，无需注册（2026）| Markdown Free",
    description:
      "将 GitHub README.md 一键转成专业 PDF。拖放 .md 文件，立即下载 PDF。免费、无需注册、无需安装、无水印。GFM 表格、清单、代码块完整保留。中文支持，无字体豆腐。2026 最新版本。",
    keywords: [
      "readme 转 pdf",
      "readme.md 转 pdf",
      "github readme pdf",
      "readme 转换 免费",
      "readme pdf 无需注册",
      "github markdown pdf 中文",
      "readme.md pdf 2026",
    ],
    alternates: {
      canonical: "/zh-Hans/readme-pdf-zhuanhuan",
    },
    openGraph: {
      title: "README.md 转 PDF — 免费在线，无需注册（2026）",
      description:
        "GitHub README → PDF 免费转换器。拖放 .md，立即下载 PDF。无需注册、无需安装。",
      locale: "zh_CN",
    },
  };
}

const faq = [
  { q: "如何把 GitHub 上的 README 转成 PDF？", a: "在 GitHub 仓库打开 README.md，点击「Raw」按钮并保存文件；接着拖放到 Markdown Free，预览结果后点击「转 PDF」即可下载。整个过程约 10 秒，无需安装任何软件。" },
  { q: "如何下载 GitHub README 为 PDF？", a: "在 GitHub 上打开 README.md，点击「Raw」并将页面保存为 .md 文件，然后上传到 Markdown Free 并导出 PDF。整个流程都在浏览器内完成。" },
  { q: "这个 README 转 PDF 工具是免费的吗？", a: "是。Markdown Free 100% 免费，没有付费版、无需注册、没有使用次数限制，导出的 PDF 也没有水印。" },
  { q: "可以不注册就把 README.md 转成 PDF 吗？", a: "可以。Markdown Free 不需要账号，所有文件都在浏览器或无服务器内存中处理，处理完立即丢弃。" },
  { q: "中文 README 转 PDF 后会出现乱码或字体豆腐吗？", a: "不会。Markdown Free 在 PDF 渲染管线中内嵌 Noto Sans CJK 字体，简体中文、繁体中文、日文、韩文都能正确显示，不会出现 □□□ 豆腐字。" },
  { q: "README 中的图片会包含在 PDF 里吗？", a: "绝对网址（https://...）的图片会包含在 PDF 中。仓库相对路径（例如 ./images/foo.png）在 GitHub 之外无法解析——请改用 raw.githubusercontent.com 的完整网址。" },
  { q: "可以转换 README 以外的 Markdown 文件吗？", a: "可以。CHANGELOG.md、CONTRIBUTING.md、docs/ 文件夹下的任何 .md 文件、甚至 GitHub Wiki 导出的 .md 都能直接转换。" },
  { q: "我的 README 文件会被保存在你们的服务器吗？", a: "不会。PDF 在无服务器内存中生成，完成后立即丢弃；HTML 与 TXT 导出完全在浏览器中处理，不会离开你的电脑。" },
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

export default async function ReadmePdfZhuanhuanPage({
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
        <h1>README.md转PDF</h1>

        <p className="lead text-lg text-slate-600">
          有GitHub项目的README.md？将它转换成专业的PDF，
          用于文档归档、作品集或演示。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            转换README
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>为什么要把README转成PDF？</h2>
        <ul>
          <li>
            <strong>离线文档</strong> — 无需网络也能分享文档
          </li>
          <li>
            <strong>专业作品集</strong> — 以精美的格式展示项目
          </li>
          <li>
            <strong>演示文稿</strong> — 将技术文档嵌入幻灯片
          </li>
          <li>
            <strong>存档</strong> — 保存文档的静态版本
          </li>
          <li>
            <strong>打印</strong> — 用于会议或审查的纸质资料
          </li>
        </ul>

        <h2>完全支持GitHub Flavored Markdown</h2>
        <p>
          Markdown Free支持GitHub Flavored Markdown (GFM)的所有功能：
        </p>
        <ul>
          <li>✓ 表格</li>
          <li>✓ 清单 / 任务列表</li>
          <li>✓ 删除线</li>
          <li>✓ 语法高亮</li>
          <li>✓ 自动链接</li>
          <li>✓ 表情符号 :smile:</li>
        </ul>

        <h2>如何转换README</h2>
        <ol>
          <li>
            <strong>下载README</strong> — 在GitHub仓库打开README.md，
            点击「Raw」，保存文件
          </li>
          <li>
            <strong>上传到Markdown Free</strong> — 将文件拖放到上传区域
          </li>
          <li>
            <strong>检查预览</strong> — 确认格式正确
          </li>
          <li>
            <strong>导出</strong> — 点击「转PDF」下载
          </li>
        </ol>

        <h2>示例：典型的README</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# 项目名称

项目的简短描述。

## 安装

\`\`\`bash
npm install project-name
\`\`\`

## 使用方法

\`\`\`javascript
import { myFunction } from 'project-name';
myFunction();
\`\`\`

## 功能特性

- [x] 已完成的功能
- [ ] 开发中的功能

## 许可证

MIT`}</pre>
        </div>
        <p>
          这个README会以完美的格式转换为PDF：
          标题、代码块（带语法高亮）、清单等
          都会完美呈现。
        </p>

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
            把README转换成专业文档
          </p>
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            立即免费试用
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">相关页面</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/zh-Hans/markdown-pdf-zhuanhuan" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown转PDF - 免费在线工具
              </Link>
            </li>
            <li>
              <Link href="/zh-Hans/markdown-pdf-wuxu-zhuce" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                无需注册的Markdown转PDF
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
