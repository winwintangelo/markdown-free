import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for the zh-Hans locale
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
    title: "Markdown转图片/长图 – 免费在线工具，适合公众号排版 | Markdown Free",
    description: "免费将 Markdown 转换为清晰的 PNG 图片或长图，全程在浏览器完成，文件不上传。长文可导出为一张长图或分段图片ZIP，适合微信公众号、小红书排版。",
    keywords: ["markdown转图片", "markdown转长图", "markdown 转 png", "md转图片", "公众号 markdown 排版", "markdown 长图工具"],
    alternates: {
      canonical: "/zh-Hans/markdown-zhuan-tupian",
      languages: hreflangAlternates("image"),
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og-markdown-to-png.png"],
    },
    openGraph: {
      images: [{ url: "/og-markdown-to-png.png", width: 1200, height: 630, alt: "Markdown to Image (PNG) — Markdown Free" }],
      title: "Markdown转图片/长图 – 免费在线工具，适合公众号排版 | Markdown Free",
      description: "把 Markdown 渲染为清晰的 PNG 长图，全程本地处理，无需注册。",
      locale: "zh_CN",
    },
  };
}

const faq = [
  {
    "question": "这个 Markdown 转图片工具免费吗？",
    "answer": "免费！Markdown Free 100%免费，没有隐藏费用、高级计划或注册要求。"
  },
  {
    "question": "适合微信公众号排版吗？",
    "answer": "非常适合。长文可导出为一张长图或分段图片ZIP，直接上传到公众号后台即可保留全部排版格式。"
  },
  {
    "question": "我的 Markdown 会上传到服务器吗？",
    "answer": "不会。图片完全在你的浏览器中渲染，Markdown 内容不离开你的设备。只有文档中引用的远程图片可能通过我们的代理获取，以便正常显示在输出中。"
  },
  {
    "question": "中文会乱码吗？",
    "answer": "不会。图片使用你设备自带的字体渲染，输出效果与预览完全一致，不会出现乱码或方块字。"
  },
  {
    "question": "可以导出 JPG 吗？",
    "answer": "可以，JPG 在「更多格式」菜单中。文字内容推荐使用 PNG（无损压缩，文字边缘更清晰）。"
  }
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

export default async function MarkdownZhuanTupianPage({
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Markdown 转图片/长图 – 免费工具
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          把 Markdown 文章渲染为清晰的 PNG 图片或长图，全程在浏览器中完成，内容不会上传。适合微信公众号、小红书等不支持 Markdown 的平台排版分享。
        </p>
        <Link
          href="/zh-Hans"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          立即开始 — 免费 <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why Image Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          为什么要把 Markdown 转成图片？
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>公众号排版利器</strong> – 微信公众号、小红书不支持 Markdown，转成长图即可保留全部排版。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>文字清晰锐利</strong> – 按设备像素密度渲染，文字比截图更清晰。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>长图或分段</strong> – 长文可导出为一张长图，或分段图片ZIP（超长文档更清晰）。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>全程本地处理</strong> – 图片在浏览器中生成，Markdown 内容绝不上传。</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          如何把 Markdown 转成图片
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
            <div>
              <h3 className="font-medium text-slate-900">上传或粘贴</h3>
              <p className="text-sm text-slate-600">拖放你的.md文件，或直接粘贴 Markdown 文本。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
            <div>
              <h3 className="font-medium text-slate-900">预览</h3>
              <p className="text-sm text-slate-600">在转换前实时查看格式化后的文档。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
            <div>
              <h3 className="font-medium text-slate-900">导出为图片</h3>
              <p className="text-sm text-slate-600">点击「转图片 (PNG)」即刻下载。JPG 在「更多格式」中。</p>
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
      <RelatedTools locale={locale} current="image" />

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/zh-Hans"
          className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          立即将 Markdown 转为图片 <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          免费 &bull; 无需注册 &bull; 即时下载
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
