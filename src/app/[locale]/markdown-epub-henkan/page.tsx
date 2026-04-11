import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";

// Only show this page for Japanese locale
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
    title: "Markdown EPUB変換 – 無料オンラインツール | Markdown Free",
    description:
      "MarkdownファイルをEPUBに無料で変換。登録不要、制限なし。Kindle、Apple Books、Koboなどの電子書籍リーダーで読むのに最適です。",
    keywords: [
      "markdown epub 変換",
      "markdown epub 無料",
      "md epub 変換ツール",
      "マークダウン epub",
      "markdown 電子書籍",
    ],
    alternates: {
      canonical: "/ja/markdown-epub-henkan",
    },
    openGraph: {
      title: "Markdown EPUB変換 – 無料オンラインツール | Markdown Free",
      description:
        "MarkdownファイルをEPUBに無料で変換。登録不要、プライバシー保護。",
      locale: "ja_JP",
    },
  };
}

export default async function MarkdownEpubHenkanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  // Only render for Japanese
  if (localeParam !== "ja") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          MarkdownをEPUBに変換 – 無料ツール
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          MarkdownファイルをEPUB電子書籍に変換します。Kindle、Apple Books、
          Koboなどの電子書籍リーダーでドキュメントを読むのに最適です。
          見出しから目次とチャプターを自動生成します。
        </p>
        <Link
          href="/ja"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          今すぐ始める — 無料 <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why EPUB Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          なぜMarkdownをEPUBに変換するのか？
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>どこでも読める</strong> – EPUBはKindle、Apple Books、Kobo、Google Playブックスなど、すべての主要な電子書籍リーダーで動作します。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>リフロー対応テキスト</strong> – PDFとは異なり、EPUBコンテンツは画面サイズ、フォント設定、読書モードに適応します。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>チャプター自動生成</strong> – Markdownの見出しがナビゲーション可能なチャプターと目次になります。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>オフライン読書</strong> – 一度ダウンロードすれば、インターネット接続なしでどこでも読めます。</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          MarkdownをEPUBに変換する方法
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
            <div>
              <h3 className="font-medium text-slate-900">アップロードまたは貼り付け</h3>
              <p className="text-sm text-slate-600">.mdファイルをドラッグ＆ドロップするか、Markdownテキストを直接貼り付けます。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
            <div>
              <h3 className="font-medium text-slate-900">プレビュー</h3>
              <p className="text-sm text-slate-600">変換前にフォーマットされたドキュメントをリアルタイムで確認できます。</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
            <div>
              <h3 className="font-medium text-slate-900">EPUBにエクスポート</h3>
              <p className="text-sm text-slate-600">「EPUBへ」をクリックして、電子書籍を即座にダウンロードします。</p>
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
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              このMarkdown-EPUB変換ツールは無料ですか？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              はい！Markdown Freeは隠れた費用、プレミアムプラン、登録要件なしで100%無料です。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              EPUBはKindleで動作しますか？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              はい。最新のKindleデバイスはEPUBをネイティブサポートしています。古いモデルの場合は、「Kindleに送信」機能またはCalibreを使用してEPUBをMOBIに変換できます。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              チャプターはどのように生成されますか？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Markdown FreeはH1見出し（H1がない場合はH2）でドキュメントを自動的にチャプターに分割し、ナビゲーション可能な目次を生成します。
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              ファイルはサーバーに保存されますか？
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              いいえ。ファイルはメモリ内で処理され、変換後すぐに削除されます。コンテンツを保存することはありません。
            </p>
          </details>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">関連ツール</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/ja" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown → PDF
          </Link>
          <Link href="/markdown-to-docx" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown → DOCX
          </Link>
          <Link href="/readme-to-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            README → PDF
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/ja"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          今すぐMarkdownをEPUBに変換 <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          無料 &bull; 登録不要 &bull; 即座にダウンロード
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
