import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";

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
    title: "Markdown转EPUB – 免费在线工具 | Markdown Free",
    description:
      "免费将Markdown文件转换为EPUB。无需注册，无限制。适合在Kindle、Apple Books、Kobo等电子阅读器上阅读。",
    keywords: [
      "markdown转epub",
      "markdown epub 免费",
      "md epub 转换工具",
      "markdown 电子书",
      "markdown epub 在线转换",
    ],
    alternates: {
      canonical: "/zh-Hans/markdown-epub-zhuanhuan",
    },
    openGraph: {
      title: "Markdown转EPUB – 免费在线工具 | Markdown Free",
      description:
        "免费将Markdown文件转换为EPUB。无需注册，隐私保护。",
      locale: "zh_CN",
    },
  };
}

export default async function MarkdownEpubZhuanhuanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  // Only render for Simplified Chinese
  if (localeParam !== "zh-Hans") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Markdown转EPUB – 免费工具
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          将你的Markdown文件转换为EPUB电子书。适合在Kindle、Apple Books、
          Kobo等电子阅读器上阅读文档。自动从标题生成目录和章节。
        </p>
        <Link
          href="/zh-Hans"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          立即开始 — 免费 <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why EPUB Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          为什么要将Markdown转换为EPUB？
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>随处阅读</strong> – EPUB支持Kindle、Apple Books、Kobo、Google Play图书等所有主流电子阅读器。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>自适应文本</strong> – 与PDF不同，EPUB内容会根据屏幕大小、字体偏好和阅读模式自动调整。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>自动生成章节</strong> – Markdown标题会变成可导航的章节和自动生成的目录。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>离线阅读</strong> – 下载一次，无需网络连接即可随时阅读。</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          如何将Markdown转换为EPUB
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
            <div>
              <h3 className="font-medium text-slate-900">上传或粘贴</h3>
              <p className="text-sm text-slate-600">拖放你的.md文件，或直接粘贴Markdown文本。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
            <div>
              <h3 className="font-medium text-slate-900">预览</h3>
              <p className="text-sm text-slate-600">在转换前实时查看格式化后的文档。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
            <div>
              <h3 className="font-medium text-slate-900">导出为EPUB</h3>
              <p className="text-sm text-slate-600">点击&ldquo;转EPUB&rdquo;，即刻下载你的电子书。</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          常见问题
        </h2>
        <div className="space-y-4">
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              这个Markdown转EPUB工具是免费的吗？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              是的！Markdown Free 100%免费，没有隐藏费用、高级计划或注册要求。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              EPUB能在Kindle上使用吗？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              可以。现代Kindle设备原生支持EPUB。对于旧款机型，你可以使用&ldquo;发送到Kindle&rdquo;功能或Calibre将EPUB转换为MOBI。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              章节是如何生成的？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Markdown Free会在H1标题处（如果没有H1则在H2处）自动将文档分割成章节，并生成可导航的目录。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              我的文件会存储在你们的服务器上吗？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              不会。你的文件在内存中处理，转换后立即删除。我们从不存储你的内容。
            </p>
          </details>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">相关工具</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/zh-Hans" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown转PDF
          </Link>
          <Link href="/markdown-to-docx" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown转DOCX
          </Link>
          <Link href="/readme-to-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            README转PDF
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/zh-Hans"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          立即将Markdown转换为EPUB <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          免费 &bull; 无需注册 &bull; 即时下载
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
