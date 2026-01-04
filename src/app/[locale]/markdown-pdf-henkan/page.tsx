import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

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
    title: "Markdown PDF 変換 無料 | Markdown Free",
    description:
      "MarkdownファイルをPDFに無料で変換。登録不要、ファイルは保存されません。ドラッグ＆ドロップで簡単変換。GitHub Flavored Markdown対応。",
    keywords: [
      "markdown pdf 変換",
      "md pdf 変換 無料",
      "マークダウン pdf",
      "markdown 変換 オンライン",
      "readme pdf 変換",
    ],
    alternates: {
      canonical: "/ja/markdown-pdf-henkan",
    },
    openGraph: {
      title: "Markdown PDF 変換 無料 | Markdown Free",
      description:
        "MarkdownファイルをPDFに無料で変換。登録不要、プライバシー保護。",
      locale: "ja_JP",
    },
  };
}

export default async function MarkdownPdfHenkanPage({
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
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Markdown PDF 変換 - 無料・登録不要</h1>

        <p className="lead text-lg text-slate-600">
          <code>.md</code>ファイルをプロフェッショナルなPDFに変換したいですか？
          Markdown Freeなら、数秒で完了。登録もインストールも不要です。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            今すぐ無料で変換
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>使い方</h2>
        <ol>
          <li>
            <strong>ファイルをアップロード</strong> — <code>.md</code>または<code>.markdown</code>ファイルをドラッグ＆ドロップ
          </li>
          <li>
            <strong>プレビュー確認</strong> — フォーマットされたMarkdownを即座にプレビュー
          </li>
          <li>
            <strong>PDFダウンロード</strong> — 「PDF」ボタンをクリックしてダウンロード
          </li>
        </ol>

        <h2>Markdown Freeが選ばれる理由</h2>
        <ul>
          <li>
            <strong>完全無料</strong> — 隠れた料金やサブスクリプションは一切ありません
          </li>
          <li>
            <strong>登録不要</strong> — メールアドレスも個人情報も求めません
          </li>
          <li>
            <strong>プライバシー保護</strong> — ファイルはサーバーに保存されません
          </li>
          <li>
            <strong>高速変換</strong> — 数秒で変換完了
          </li>
          <li>
            <strong>GFM対応</strong> — テーブル、チェックリスト、取り消し線などに対応
          </li>
        </ul>

        <h2>対応フォーマット</h2>
        <p>
          PDF以外にも、以下の形式にエクスポートできます：
        </p>
        <ul>
          <li><strong>HTML</strong> — Web公開用</li>
          <li><strong>TXT</strong> — プレーンテキスト</li>
        </ul>

        <h2>よくある質問</h2>

        <h3>本当に無料ですか？</h3>
        <p>
          はい！Markdown Freeは完全無料です。プレミアムプランも、日数制限も、
          隠れた有料機能もありません。
        </p>

        <h3>ファイルの安全性は？</h3>
        <p>
          安心してご利用いただけます。プレビューはブラウザ内で処理され、
          PDF変換時もファイルはメモリ上で処理後、即座に削除されます。
          ファイルが保存されることは一切ありません。
        </p>

        <h3>ファイルサイズの上限は？</h3>
        <p>
          5MBまでのファイルに対応しています。通常のMarkdownドキュメントには
          十分なサイズです。
        </p>

        <h3>スマートフォンでも使えますか？</h3>
        <p>
          はい！スマートフォンやタブレットに最適化されたインターフェースで
          ご利用いただけます。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Markdownを今すぐPDFに変換しませんか？
          </p>
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            無料で試す
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">関連ページ</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/ja/markdown-pdf-touroku-fuyou" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                登録不要のMarkdown PDF変換
              </Link>
            </li>
            <li>
              <Link href="/ja/readme-pdf-henkan" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                README.md PDF 変換
              </Link>
            </li>
            <li>
              <Link href="/ja/markdown-henkan-hikaku" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdownコンバーター比較
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
