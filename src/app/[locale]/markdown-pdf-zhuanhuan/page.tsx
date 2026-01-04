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
    title: "Markdown转PDF免费在线工具 | Markdown Free",
    description:
      "免费将Markdown文件转换为PDF。无需注册，文件不会被存储。拖放即可转换。支持GitHub Flavored Markdown。",
    keywords: [
      "markdown转pdf",
      "md转pdf免费",
      "markdown转换器",
      "在线markdown转换",
      "readme转pdf",
    ],
    alternates: {
      canonical: "/zh-Hans/markdown-pdf-zhuanhuan",
    },
    openGraph: {
      title: "Markdown转PDF免费在线工具 | Markdown Free",
      description:
        "免费将Markdown文件转换为PDF。无需注册，隐私保护。",
      locale: "zh_CN",
    },
  };
}

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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>真的免费吗？</h3>
        <p>
          是的！Markdown Free完全免费。没有高级版，没有每日限制，
          没有隐藏的付费功能。
        </p>

        <h3>文件安全吗？</h3>
        <p>
          请放心使用。预览在浏览器内处理，
          PDF转换时文件在内存中处理后立即删除。
          文件绝不会被存储。
        </p>

        <h3>文件大小限制是多少？</h3>
        <p>
          支持最大5MB的文件。对于一般的Markdown文档来说
          绰绰有余。
        </p>

        <h3>手机上能用吗？</h3>
        <p>
          可以！界面已针对手机和平板进行优化。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            现在就把Markdown转换成PDF
          </p>
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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
              <Link href="/zh-Hans/markdown-pdf-wuxu-zhuce" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                无需注册的Markdown转PDF
              </Link>
            </li>
            <li>
              <Link href="/zh-Hans/readme-pdf-zhuanhuan" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                README.md转PDF
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
