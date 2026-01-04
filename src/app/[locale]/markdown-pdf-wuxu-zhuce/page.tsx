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
    title: "无需注册的Markdown转PDF | Markdown Free",
    description:
      "无需创建账户即可将Markdown转换为PDF。不用登录，不要邮箱，不追踪用户。上传转换就这么简单。",
    keywords: [
      "markdown pdf 无需注册",
      "md转换 不用账户",
      "markdown pdf 匿名",
      "pdf转换 无需登录",
      "markdown转换 免费",
    ],
    alternates: {
      canonical: "/zh-Hans/markdown-pdf-wuxu-zhuce",
    },
    openGraph: {
      title: "无需注册的Markdown转PDF | Markdown Free",
      description:
        "无需创建账户即可将Markdown转换为PDF。不用登录，不追踪用户。",
      locale: "zh_CN",
    },
  };
}

export default async function MarkdownPdfWuxuZhucePage({
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
        <h1>无需注册的Markdown转PDF</h1>

        <p className="lead text-lg text-slate-600">
          厌倦了每次使用在线工具都要注册账户？
          Markdown Free让你无需注册、无需邮箱、无需追踪，直接将Markdown转换为PDF。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            立即转换 — 无需登录
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>为什么「无需注册」很重要</h2>
        <p>
          为什么很多在线转换工具都要求创建账户？
        </p>
        <ul>
          <li>向你推销付费套餐</li>
          <li>发送营销邮件</li>
          <li>追踪用户行为</li>
          <li>将数据变现</li>
        </ul>
        <p>
          <strong>我们不一样。</strong>Markdown Free是一个简单的工具，
          只做一件事并且做好它。不求回报，只提供纯粹有用的服务。
        </p>

        <h2>使用方法</h2>
        <ol>
          <li>打开Markdown Free</li>
          <li>拖放<code>.md</code>文件</li>
          <li>点击「转PDF」</li>
          <li>下载 — 完成！</li>
        </ol>
        <p>
          没有表单要填。没有「验证邮箱」。没有「开始免费试用」。
        </p>

        <h2>隐私承诺</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>无需注册账户</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>没有追踪Cookie</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>文件不会被保存</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>HTTPS加密连接</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>注重隐私的分析工具（Umami）</span>
            </li>
          </ul>
        </div>

        <h2>常见问题</h2>

        <h3>真的不用注册吗？</h3>
        <p>
          是的！我们网站上连「注册」按钮都没有。
          打开页面，转换文件，关闭页面。就这么简单。
        </p>

        <h3>你们怎么盈利？</h3>
        <p>
          Markdown Free是个人项目。我们不会将用户数据变现，
          也不会推销服务。它只是一个有用的工具。
        </p>

        <h3>上传机密文档安全吗？</h3>
        <p>
          预览完全在浏览器内处理。生成PDF时，
          文件在服务器内存中处理后立即删除。
          我们不保存、不记录、不分析你的文件。
        </p>

        <h3>每天转换次数有限制吗？</h3>
        <p>
          没有！想转多少就转多少，随时都可以。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            无需注册。没有麻烦。即刻使用。
          </p>
          <Link
            href="/zh-Hans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            立即开始
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
