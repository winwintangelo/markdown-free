import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

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
    title: "md pdf 変換 — 無料・登録不要・文字化けなし（2026） | Markdown Free",
    description:
      "md pdf 変換・markdown pdf 変換・pdf markdown 変換 すべて無料。.md ファイルをドラッグ＆ドロップ、すぐにPDFをダウンロード。登録不要、インストール不要、日本語の文字化けなし。GFM の表・チェックリスト・コードブロック完全対応。2026年版。",
    keywords: [
      "md pdf 変換",
      "markdown pdf 変換",
      "pdf markdown 変換",
      "md pdf 変換 無料",
      "マークダウン pdf",
      "markdown 変換 オンライン",
      "readme pdf 変換",
      "md ファイル pdf 変換",
      "markdown pdf 登録不要",
      "markdown pdf 2026",
    ],
    alternates: {
      canonical: "/ja/markdown-pdf-henkan",
    },
    openGraph: {
      title: "md pdf 変換 — 無料・登録不要・文字化けなし（2026）",
      description:
        "md → PDF 無料変換ツール。ドラッグ＆ドロップでPDF即ダウンロード。登録・インストール不要、日本語文字化けなし。",
      locale: "ja_JP",
    },
  };
}

const faq = [
  { q: "md ファイルを PDF に変換する方法は？", a: "Markdown Free を開いて .md ファイルをドラッグ＆ドロップ（または Markdown テキストを貼り付け）、プレビューで確認後「PDF」ボタンをクリックするだけ。約 10 秒で完了、登録もインストールも不要です。" },
  { q: "Markdown PDF 変換は本当に無料ですか？", a: "はい。Markdown Free は完全無料です。プレミアムプラン、登録、利用回数制限、PDF への透かしは一切ありません。" },
  { q: "登録なしで Markdown を PDF に変換できますか？", a: "できます。Markdown Free はアカウント不要です。HTML/TXT はブラウザ内、PDF/DOCX/EPUB はサーバーレスメモリ上で処理され、ファイルは一切保存されません。" },
  { q: "日本語の Markdown を PDF に変換すると文字化けしますか？", a: "しません。Markdown Free は PDF レンダリングパイプラインに Noto Sans CJK JP フォントを埋め込んでいるため、日本語、中国語（簡体・繁体）、韓国語のすべてが正しく表示され、□□□（豆腐）になることはありません。" },
  { q: "GitHub の README.md も PDF に変換できますか？", a: "はい。GitHub のリポジトリで README.md を開き「Raw」ボタンをクリックして .md ファイルとして保存、Markdown Free にアップロードすれば PDF として書き出せます。CHANGELOG.md や CONTRIBUTING.md も同様です。" },
  { q: "Markdown PDF 変換のファイルサイズ上限は？", a: "現在 5MB／ファイルです。Markdown 5MB は約 75 万語に相当し、ほぼすべての実際の文書をカバーします。" },
  { q: "ファイルはどこで処理されますか？", a: "PDF はサーバーレス関数のメモリ内で生成され、変換完了直後に破棄されます。HTML と TXT のエクスポートは完全にブラウザ内で処理され、お使いのコンピュータから外に出ません。" },
  { q: "GFM（GitHub Flavored Markdown）の表やチェックリストは保持されますか？", a: "はい。表、チェックリスト、取り消し線、コードブロック（シンタックスハイライト付き）、自動リンクなど、GFM のすべての機能が PDF 出力で正しく保持されます。" },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "ja",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

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
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>md pdf 変換・Markdown PDF 変換 - 無料・登録不要</h1>

        <p className="lead text-lg text-slate-600">
          <strong>md pdf 変換</strong>、<strong>markdown pdf 変換</strong>、
          <strong>pdf markdown 変換</strong> — すべて無料で簡単。
          <code>.md</code>ファイルをドラッグ＆ドロップするだけで、
          数秒でプロフェッショナルなPDFに変換。登録もインストールも不要です。
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
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

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Markdownを今すぐPDFに変換しませんか？
          </p>
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
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
              <Link href="/ja/markdown-pdf-touroku-fuyou" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                登録不要のMarkdown PDF変換
              </Link>
            </li>
            <li>
              <Link href="/ja/readme-pdf-henkan" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                README.md PDF 変換
              </Link>
            </li>
            <li>
              <Link href="/ja/markdown-henkan-hikaku" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdownコンバーター比較
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
    </>
  );
}
