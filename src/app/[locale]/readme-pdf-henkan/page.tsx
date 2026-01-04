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
    title: "README.md PDF 変換 | Markdown Free",
    description:
      "GitHubのREADME.mdをプロフェッショナルなPDFに変換。ドキュメント、ポートフォリオ、プレゼンに最適。無料・登録不要。",
    keywords: [
      "readme pdf 変換",
      "readme.md pdf",
      "github readme pdf",
      "markdown ドキュメント pdf",
      "readme 変換 無料",
    ],
    alternates: {
      canonical: "/ja/readme-pdf-henkan",
    },
    openGraph: {
      title: "README.md PDF 変換 | Markdown Free",
      description:
        "GitHubのREADME.mdをプロフェッショナルなPDFに変換。無料・登録不要。",
      locale: "ja_JP",
    },
  };
}

export default async function ReadmePdfHenkanPage({
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
        <h1>README.md PDF 変換</h1>

        <p className="lead text-lg text-slate-600">
          GitHubプロジェクトのREADME.mdをお持ちですか？プロフェッショナルなPDFに
          変換して、ドキュメント、ポートフォリオ、プレゼンテーションに活用しましょう。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            READMEを変換する
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>READMEをPDFに変換するメリット</h2>
        <ul>
          <li>
            <strong>オフラインドキュメント</strong> — インターネット接続なしで
            ドキュメントを共有
          </li>
          <li>
            <strong>プロフェッショナルなポートフォリオ</strong> — プロジェクトを
            洗練された形式でプレゼン
          </li>
          <li>
            <strong>プレゼンテーション</strong> — 技術ドキュメントをスライドに組み込み
          </li>
          <li>
            <strong>アーカイブ</strong> — ドキュメントの静的バージョンを保存
          </li>
          <li>
            <strong>印刷</strong> — ミーティングやレビュー用の紙資料
          </li>
        </ul>

        <h2>GitHub Flavored Markdown 完全対応</h2>
        <p>
          Markdown Freeは、GitHub Flavored Markdown（GFM）のすべての機能に対応しています：
        </p>
        <ul>
          <li>✓ テーブル</li>
          <li>✓ チェックリスト / タスクリスト</li>
          <li>✓ 取り消し線</li>
          <li>✓ シンタックスハイライト</li>
          <li>✓ 自動リンク</li>
          <li>✓ 絵文字 :smile:</li>
        </ul>

        <h2>README変換の手順</h2>
        <ol>
          <li>
            <strong>READMEをダウンロード</strong> — GitHubリポジトリでREADME.mdを開き、
            「Raw」をクリックしてファイルを保存
          </li>
          <li>
            <strong>Markdown Freeにアップロード</strong> — ファイルを
            アップロードエリアにドラッグ＆ドロップ
          </li>
          <li>
            <strong>プレビューを確認</strong> — フォーマットが正しいことを確認
          </li>
          <li>
            <strong>エクスポート</strong> — 「PDF」をクリックしてダウンロード
          </li>
        </ol>

        <h2>サンプル: 典型的なREADME</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# プロジェクト名

プロジェクトの簡単な説明。

## インストール

\`\`\`bash
npm install project-name
\`\`\`

## 使い方

\`\`\`javascript
import { myFunction } from 'project-name';
myFunction();
\`\`\`

## 機能

- [x] 実装済みの機能
- [ ] 開発中の機能

## ライセンス

MIT`}</pre>
        </div>
        <p>
          このREADMEは、完璧なフォーマットでPDFに変換されます：
          見出し、コードブロック（シンタックスハイライト付き）、チェックリストなど、
          すべてが美しく表示されます。
        </p>

        <h2>よくある質問</h2>

        <h3>README内の画像は含まれますか？</h3>
        <p>
          絶対URL（例：https://...）の画像はPDFに含まれます。
          相対パスの画像は正しく表示されない場合があります。
          完全なURLの使用をお勧めします。
        </p>

        <h3>リポジトリ内の他のMarkdownファイルも変換できますか？</h3>
        <p>
          もちろんです！CHANGELOG.md、CONTRIBUTING.md、/docsフォルダ内の
          ドキュメントなど、あらゆる<code>.md</code>ファイルに対応しています。
        </p>

        <h3>PDFのフォーマットはカスタマイズできますか？</h3>
        <p>
          現在、PDFは読みやすさを重視したプロフェッショナルなレイアウトで
          出力されます。将来のバージョンでカスタマイズオプションを検討中です。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            READMEをプロフェッショナルなドキュメントに変換
          </p>
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            今すぐ無料で試す
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
