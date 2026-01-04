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
    title: "登録不要のMarkdown PDF変換 | Markdown Free",
    description:
      "アカウント作成なしでMarkdownをPDFに変換。ログイン不要、メール不要、追跡なし。アップロードして変換するだけ。",
    keywords: [
      "markdown pdf 登録不要",
      "md 変換 アカウント不要",
      "markdown pdf 匿名",
      "pdf変換 ログインなし",
      "markdown 変換 無料",
    ],
    alternates: {
      canonical: "/ja/markdown-pdf-touroku-fuyou",
    },
    openGraph: {
      title: "登録不要のMarkdown PDF変換 | Markdown Free",
      description:
        "アカウント作成なしでMarkdownをPDFに変換。ログイン不要、追跡なし。",
      locale: "ja_JP",
    },
  };
}

export default async function MarkdownPdfTourokufuyouPage({
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
        <h1>登録不要のMarkdown PDF変換</h1>

        <p className="lead text-lg text-slate-600">
          毎回アカウント登録を求められるオンラインツールにうんざりしていませんか？
          Markdown Freeなら、登録なし、メールなし、追跡なしでMarkdownをPDFに変換できます。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            今すぐ変換 — ログイン不要
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>なぜ「登録不要」が重要なのか</h2>
        <p>
          多くのオンライン変換ツールがアカウント作成を求める理由は何でしょうか？
        </p>
        <ul>
          <li>有料プランへのアップセル</li>
          <li>マーケティングメールの送信</li>
          <li>ユーザーの行動追跡</li>
          <li>データの収益化</li>
        </ul>
        <p>
          <strong>私たちは違います。</strong>Markdown Freeは、一つのことをシンプルに
          行うツールです。見返りを求めず、純粋に便利なサービスを提供します。
        </p>

        <h2>使い方</h2>
        <ol>
          <li>Markdown Freeを開く</li>
          <li><code>.md</code>ファイルをドラッグ＆ドロップ</li>
          <li>「PDF」をクリック</li>
          <li>ダウンロード — 完了！</li>
        </ol>
        <p>
          入力フォームなし。「メールを確認」なし。「無料トライアルを開始」なし。
        </p>

        <h2>プライバシーへの取り組み</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>アカウント登録不要</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>トラッキングCookieなし</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>ファイルは保存されません</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>HTTPS暗号化通信</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>プライバシー重視のアナリティクス（Umami）</span>
            </li>
          </ul>
        </div>

        <h2>よくある質問</h2>

        <h3>本当に登録しなくていいのですか？</h3>
        <p>
          はい！サイトに「登録」ボタンすらありません。
          ページを開いて、ファイルを変換して、閉じる。それだけです。
        </p>

        <h3>どうやって収益を得ているのですか？</h3>
        <p>
          Markdown Freeは個人プロジェクトです。ユーザーのデータを収益化したり、
          サービスを売り込んだりすることはありません。便利なツールとして存在しています。
        </p>

        <h3>機密文書をアップロードしても大丈夫ですか？</h3>
        <p>
          プレビューは完全にブラウザ内で処理されます。PDF生成時は、
          サーバーのメモリ上で処理され、即座に削除されます。
          ファイルの保存、ログ記録、解析は一切行いません。
        </p>

        <h3>1日の変換回数に制限はありますか？</h3>
        <p>
          ありません！好きなだけ、いつでも変換できます。
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            登録なし。手間なし。すぐに使える。
          </p>
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            今すぐ始める
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
