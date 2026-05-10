import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";
import { safeJsonLd } from "@/lib/json-ld";

// This page is only for ja locale
export function generateStaticParams() {
  return [{ locale: "ja" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown Word（DOCX）変換 — 無料・登録不要・文字化けなし（2026） | Markdown Free",
    description: "Markdown ファイル（.md）を Word 文書（.docx）にブラウザで直接変換。ドラッグ＆ドロップで即座にダウンロード。無料、登録不要、インストール不要、日本語の文字化けなし。ファイルはメモリ上で処理され即削除。2026年版。",
    keywords: [
      "markdown word 変換",
      "markdown docx 変換",
      "md word 変換",
      "md docx 変換",
      "マークダウン ワード 変換",
      "markdown word 無料",
      "markdown docx 登録不要",
      "markdown word converter 2026",
    ],
    alternates: {
      canonical: "https://www.markdown.free/ja/markdown-word-henkan",
      languages: {
        "en": "/markdown-to-word",
        "id": "/id/markdown-ke-word",
        "ja": "/ja/markdown-word-henkan",
        "es": "/es/markdown-a-word",
        "ko": "/ko/markdown-word-byeonhwan",
        "vi": "/vi/markdown-sang-word",
        "zh-Hans": "/zh-Hans/markdown-zhuanhuan-word",
        "zh-Hant": "/zh-Hant/markdown-word-zhuanhuan",
        "it": "/it/markdown-in-word",
        "x-default": "/markdown-to-word",
      },
    },
    openGraph: {
      title: "Markdown Word（DOCX）変換 — 無料・登録不要・文字化けなし（2026）",
      description: ".md を .docx にブラウザで変換。ドラッグ＆ドロップで即時ダウンロード。無料、登録不要。",
      url: "https://www.markdown.free/ja/markdown-word-henkan",
      type: "website",
      locale: "ja_JP",
    },
  };
}

const faq = [
  { q: "Markdown を Word（.docx）に変換する方法は？", a: "Markdown Free を開いて .md ファイルをドラッグ＆ドロップ（または Markdown テキストを貼り付け）、プレビューで確認後「DOCX へ」ボタンをクリックするだけ。約 10 秒で完了、登録もインストールも不要です。" },
  { q: "この Markdown Word 変換ツールは無料ですか？", a: "はい。Markdown Free は完全無料です。プレミアムプラン、登録、利用回数制限はありません。" },
  { q: "登録なしで Markdown を Word に変換できますか？", a: "できます。Markdown Free はアカウント不要です。ファイルはメモリ上で処理され、変換完了直後に破棄されます。" },
  { q: "Word と DOCX の違いは？", a: "DOCX は 2007 年以降の Microsoft Word で使われるファイル形式です。「Word 文書」と言うとき、Word、Google Docs、LibreOffice などで開ける .docx ファイルを意味します。" },
  { q: "日本語の Markdown を Word に変換すると文字化けしますか？", a: "しません。Markdown Free は日本語、中国語、韓国語などの CJK 文字を正しく保持します。表、コードブロック、見出しも適切な Word スタイルとして書き出されます。" },
  { q: "ファイルはサーバーに保存されますか？", a: "いいえ。ファイルはメモリ上で一時的に処理され、変換完了直後に削除されます。HTML/TXT のエクスポートは完全にブラウザ内で処理されます。" },
  { q: "表、コードブロック、チェックリストなどの書式は保持されますか？", a: "はい。GFM の表、コードブロック、見出し、順序付き／順序なしリスト、チェックリスト、取り消し線など、すべて適切な Word スタイルに変換されます。" },
  { q: "ファイルサイズの上限は？", a: "現在 5MB／ファイルです。Markdown 5MB は約 75 万語に相当し、ほぼすべての実際の文書をカバーします。" },
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

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownWordHenkanPage({ params }: PageProps) {
  const { locale } = await params;

  // Only allow ja
  if (locale !== "ja") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Markdown Word（DOCX）変換 – 無料オンラインツール
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            MarkdownファイルをプロフェッショナルなMicrosoft Word文書に変換します。
            非技術者の同僚とドキュメントを共有したり、レポートを提出したり、
            メモから編集可能な文書を作成するのに最適です。
          </p>
          <Link
            href="/ja"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            変換を開始 →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            なぜMarkdownをWordに変換するのか？
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>汎用的な互換性</strong> – Word文書（.docx）はMicrosoft OfficeからGoogle Docs、LibreOfficeまで、どこでも動作します。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>編集可能な出力</strong> – PDFとは異なり、Word/DOCXファイルは受信者が簡単に編集できます。</span>
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

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            MarkdownからWord変換の利用者
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">学生</h3>
              <p className="text-sm text-slate-600">論文やレポートのドラフトをMarkdownからWordに変換して提出。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">開発者</h3>
              <p className="text-sm text-slate-600">READMEファイルや技術ドキュメントを非技術者向けのWord仕様書に変換。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">ライター</h3>
              <p className="text-sm text-slate-600">Markdownで書いた原稿をWordにエクスポートして編集・共同作業。</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">チーム</h3>
              <p className="text-sm text-slate-600">Officeを好む同僚とMarkdownドキュメントをWordファイルとして共有。</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            MarkdownをWord（DOCX）に変換する方法
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
                <p className="text-sm text-slate-600">変換前にフォーマットされた文書をリアルタイムで確認できます。</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Wordにエクスポート</h3>
                <p className="text-sm text-slate-600">「DOCXへ」をクリックして、Word文書を即座にダウンロードします。</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            プライバシーとセキュリティ
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>ファイルはメモリ内で一時的に処理</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>サーバーに保存されることはありません</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>HTTPS暗号化接続</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>アカウント作成不要</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            よくある質問
          </h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-slate-900">{item.q}</summary>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/ja"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            今すぐMarkdownをWordに変換 →
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
