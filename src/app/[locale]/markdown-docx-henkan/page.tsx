import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

// This page is only for ja locale
export function generateStaticParams() {
  return [{ locale: "ja" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown DOCX 変換 | 無料オンラインツール",
    description: "MarkdownファイルをWord DOCXドキュメントに即座に変換。100%無料、登録不要、広告なし。ファイルは安全に処理され、保存されません。",
    alternates: {
      canonical: "https://www.markdown.free/ja/markdown-docx-henkan",
    },
    openGraph: {
      title: "Markdown DOCX 変換 無料ツール",
      description: ".mdファイルをMicrosoft Word DOCX形式に変換。無料・プライベート・即時ダウンロード。",
      url: "https://www.markdown.free/ja/markdown-docx-henkan",
      type: "website",
      locale: "ja_JP",
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownDocxHenkanPage({ params }: PageProps) {
  const { locale } = await params;
  
  // Only allow ja
  if (locale !== "ja") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Markdown DOCX 変換 – 無料オンラインツール
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            MarkdownファイルをプロフェッショナルなMicrosoft Wordドキュメントに変換します。
            非技術者の同僚とドキュメントを共有したり、レポートを提出したり、
            ノートから編集可能なドキュメントを作成するのに最適です。
          </p>
          <Link
            href="/ja"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            変換を開始 →
          </Link>
        </section>

        {/* Why DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            なぜMarkdownをDOCXに変換するのか？
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>汎用的な互換性</strong> – WordドキュメントはMicrosoft OfficeからGoogle DocsからLibreOfficeまで、どこでも動作します。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>編集可能な出力</strong> – PDFとは異なり、DOCXファイルは受信者が簡単に編集できます。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>プロフェッショナルなフォーマット</strong> – テーブル、コードブロック、見出しは適切なWordスタイルとして保持されます。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>ビジネス対応</strong> – 企業環境でのドキュメント、レポート、提案書の提出に最適です。</span>
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            MarkdownをWord DOCXに変換する方法
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">アップロードまたは貼り付け</h3>
                <p className="text-sm text-slate-600">.mdファイルをドラッグ＆ドロップするか、Markdownテキストを直接貼り付けます。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">プレビュー</h3>
                <p className="text-sm text-slate-600">変換前にフォーマットされたドキュメントをリアルタイムで確認できます。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">DOCXにエクスポート</h3>
                <p className="text-sm text-slate-600">「DOCXへ」をクリックして、Wordドキュメントを即座にダウンロードします。</p>
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
                このMarkdown DOCX変換ツールは無料ですか？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                はい！Markdown Freeは隠れたコスト、プレミアムプラン、登録要件なしで100%無料です。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                変換されたDOCXはMicrosoft Wordで開けますか？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                はい、生成されたDOCXファイルはMicrosoft Word 2007以降、Google Docs、LibreOffice、および.docx形式をサポートする他のワードプロセッサと互換性があります。
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                私のファイルはサーバーに保存されますか？
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                いいえ。ファイルはメモリ内で処理され、変換後すぐに削除されます。コンテンツを保存することはありません。
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            今すぐMarkdownをDOCXに変換 →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            無料 • 登録不要 • 即時ダウンロード
          </p>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
