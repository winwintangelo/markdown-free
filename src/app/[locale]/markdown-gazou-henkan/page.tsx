import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for the ja locale
export function generateStaticParams() {
  return [{ locale: "ja" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "ja") {
    return {};
  }

  return {
    title: "Markdown画像変換（PNG）– 無料・登録不要・文字化けなし | Markdown Free",
    description: "MarkdownをブラウザだけでくっきりしたPNG/JPG画像に変換。無料・登録不要・ファイルはアップロードされません。長文は1枚の縦長画像またはZIP分割で書き出せます。",
    keywords: ["markdown 画像 変換", "markdown png 変換", "md 画像化", "markdown 画像 書き出し", "markdown jpg 変換"],
    alternates: {
      canonical: "/ja/markdown-gazou-henkan",
      languages: hreflangAlternates("image"),
    },
    openGraph: {
      title: "Markdown画像変換（PNG）– 無料・登録不要・文字化けなし | Markdown Free",
      description: "Markdownをブラウザ内で鮮明なPNG画像としてレンダリング。無料・登録不要。",
      locale: "ja_JP",
    },
  };
}

const faq = [
  {
    "question": "このMarkdown画像変換ツールは無料ですか？",
    "answer": "はい！Markdown Freeは100%無料で、隠れた料金・有料プラン・登録要件はありません。"
  },
  {
    "question": "長い文書はどうなりますか？",
    "answer": "約10画面分までの文書は常に1枚の画像として書き出されます。それより長い場合は、1枚の縦長画像（共有しやすい）またはZIP分割（長文でも鮮明）を選択できます。"
  },
  {
    "question": "Markdownはサーバーにアップロードされますか？",
    "answer": "いいえ。画像はブラウザ内で完全にレンダリングされ、Markdownがデバイスから出ることはありません。文書内で参照されている外部画像のみ、表示のためにプロキシ経由で取得されることがあります。"
  },
  {
    "question": "日本語は文字化けしませんか？",
    "answer": "しません。デバイスのフォントでレンダリングするため、ひらがな・カタカナ・漢字がプレビューどおりに出力されます。"
  },
  {
    "question": "JPGでも書き出せますか？",
    "answer": "はい。「他の形式」メニューからJPGで書き出せます。テキスト中心の内容には可逆圧縮のPNGがおすすめです。"
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "ja",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default async function MarkdownGazouHenkanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (localeParam !== "ja") {
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
          Markdown を画像（PNG）に変換 – 無料ツール
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Markdownをブラウザ内で鮮明なPNG/JPG画像としてレンダリング。SlackやSNSでのノート共有、スライドへの貼り付けに最適。スクリーンショット不要、文字化けなし。
        </p>
        <Link
          href="/ja"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          今すぐ変換 — 無料 <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why Image Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Markdownを画像に変換する理由
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>どこでも共有</strong> – 画像はチャット・SNS・スライドなど、Markdownが使えない場所でも表示できます。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>文字がくっきり</strong> – デバイスの解像度に合わせてレンダリングするため、スクリーンショットよりも鮮明です。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>長文にも対応</strong> – 記事全体を1枚の縦長画像として、または画面サイズごとのZIP分割で書き出せます。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>完全ブラウザ内処理</strong> – アップロードは一切なし。Markdownはデバイスから出ません。</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          MarkdownをPNGに変換する方法
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
            <div>
              <h3 className="font-medium text-slate-900">アップロードまたは貼り付け</h3>
              <p className="text-sm text-slate-600">.mdファイルをドラッグ＆ドロップ、またはMarkdownテキストを貼り付け。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
            <div>
              <h3 className="font-medium text-slate-900">プレビュー</h3>
              <p className="text-sm text-slate-600">変換前にフォーマット済みの文書をリアルタイムで確認。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
            <div>
              <h3 className="font-medium text-slate-900">画像として書き出し</h3>
              <p className="text-sm text-slate-600">「画像へ (PNG)」をクリックすると即ダウンロード。JPGは「他の形式」から。</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          よくある質問
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
          href="/ja"
          className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          今すぐMarkdownを画像に変換 <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          無料 &bull; 登録不要 &bull; 即ダウンロード
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
