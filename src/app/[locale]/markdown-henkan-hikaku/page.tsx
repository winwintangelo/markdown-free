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
    title: "Markdownコンバーター比較 2026 | Markdown Free vs 他サービス",
    description:
      "Markdown PDF変換ツールを徹底比較。Markdown Free、CloudConvert、LightPDFの違いは？無料・登録不要・プライバシー重視で選ぶなら。",
    keywords: [
      "markdown 変換 比較",
      "markdown free vs cloudconvert",
      "pdf変換ツール 比較",
      "おすすめ markdown 変換",
      "無料 md pdf 変換",
    ],
    alternates: {
      canonical: "/ja/markdown-henkan-hikaku",
    },
    openGraph: {
      title: "Markdownコンバーター比較 2026 | Markdown Free vs 他サービス",
      description:
        "Markdown PDF変換ツールを徹底比較。無料・登録不要・プライバシー重視。",
      locale: "ja_JP",
    },
  };
}

export default async function MarkdownHenkanHikakuPage({
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
        <h1>Markdownコンバーター比較</h1>

        <p className="lead text-lg text-slate-600">
          最適なMarkdown PDF変換ツールをお探しですか？Markdown Freeと
          人気の他サービスを正直に比較します。
        </p>

        {/* Comparison Table */}
        <div className="not-prose my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">機能</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-700">Markdown Free</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">CloudConvert</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">LightPDF</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">PDFForge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">完全無料</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">日数制限あり</td>
                <td className="px-4 py-3 text-center text-slate-500">日数制限あり</td>
                <td className="px-4 py-3 text-center text-slate-500">デスクトップのみ</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">登録不要</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">プライバシー（ファイル非保存）</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">一時保存</td>
                <td className="px-4 py-3 text-center text-slate-500">クラウド保存</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓（ローカル）</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">リアルタイムプレビュー</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">GitHub Flavored Markdown</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">一部対応</td>
                <td className="px-4 py-3 text-center text-slate-500">一部対応</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">HTML/TXT出力</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-slate-500">PDFのみ</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">日本語インターフェース</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Markdown Freeを選ぶ理由</h2>

        <h3>完全無料</h3>
        <p>
          CloudConvertやLightPDFは無料プランに厳しい制限（1日25回変換など）が
          ありますが、Markdown Freeは完全無料で制限なし。
          「Pro」プランは存在しません。すべての機能がすでに利用可能です。
        </p>

        <h3>プライバシー重視</h3>
        <p>
          CloudConvertやLightPDFはファイルをサーバーに（一時的にでも）保存します。
          Markdown Freeはファイルを保存しません。プレビューはブラウザ内で処理され、
          PDFはメモリ上で生成後すぐに削除されます。
        </p>

        <h3>シンプルさ</h3>
        <p>
          アカウント作成なし、複雑なダッシュボードなし、「クレジット」の管理なし。
          ページを開いて、ファイルをドラッグして、PDFをダウンロード。それだけです。
        </p>

        <h3>リアルタイムプレビュー</h3>
        <p>
          他の変換ツールと違い、Markdown Freeは変換前にドキュメントの
          フォーマット済みプレビューを表示します。テーブル、コード、
          フォーマットが正しいことを確認できます。
        </p>

        <h2>他のツールが適している場合</h2>
        <p>
          公平を期すために、他のソリューションが適しているケースも紹介します：
        </p>
        <ul>
          <li>
            <strong>CloudConvert</strong> — Markdown以外の多数のフォーマット間で
            変換が必要な場合
          </li>
          <li>
            <strong>PDFForge</strong> — ローカルにインストールした
            デスクトップアプリを好む場合
          </li>
          <li>
            <strong>Pandoc</strong> — 開発者でコマンドラインから
            完全にコントロールしたい場合
          </li>
        </ul>

        <h2>実際に試してみてください</h2>
        <p>
          判断する最良の方法は？Markdown Freeを試すこと。
          文字通り10秒で完了します。
        </p>

        {/* CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            制限なし。登録なし。料金なし。
          </p>
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Markdown Freeを試す
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">関連ページ</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/ja/markdown-pdf-henkan" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown PDF 変換 - 無料・登録不要
              </Link>
            </li>
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
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
