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
    title: "README.md转PDF | Markdown Free",
    description:
      "将GitHub的README.md转换为专业PDF。适合文档归档、作品集、演示。免费，无需注册。",
    keywords: [
      "readme转pdf",
      "readme.md pdf",
      "github readme pdf",
      "markdown文档 pdf",
      "readme转换 免费",
    ],
    alternates: {
      canonical: "/zh-Hans/readme-pdf-zhuanhuan",
    },
    openGraph: {
      title: "README.md转PDF | Markdown Free",
      description:
        "将GitHub的README.md转换为专业PDF。免费，无需注册。",
      locale: "zh_CN",
    },
  };
}

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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>README中的图片会被包含吗？</h3>
        <p>
          绝对URL（如 https://...）的图片会被包含在PDF中。
          相对路径的图片可能无法正确显示。
          建议使用完整URL。
        </p>

        <h3>可以转换仓库中的其他Markdown文件吗？</h3>
        <p>
          当然可以！CHANGELOG.md、CONTRIBUTING.md、/docs文件夹中的
          文档等任何<code>.md</code>文件都支持。
        </p>

        <h3>可以自定义PDF格式吗？</h3>
        <p>
          目前PDF使用针对可读性优化的专业布局。
          我们正在考虑在未来版本中添加自定义选项。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            把README转换成专业文档
          </p>
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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
              <Link href="/zh-Hans/markdown-pdf-zhuanhuan" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown转PDF - 免费在线工具
              </Link>
            </li>
            <li>
              <Link href="/zh-Hans/markdown-pdf-wuxu-zhuce" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                无需注册的Markdown转PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hans/markdown-zhuanhuanqi-bijiao" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown转换器对比
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
