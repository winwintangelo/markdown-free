import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

export function generateStaticParams() {
  return [{ locale: "ja" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "ja") return {};

  return {
    title: "Markdown PDF変換ツール徹底比較 2026 | おすすめ8選",
    description:
      "Markdown PDF変換ツール8種を比較。Markdown Free、Pandoc、Typora、Dillinger、StackEdit、md-to-pdf、Markdown PDF (VS Code)、Online2PDF。文字化けしない選び方。",
    keywords: [
      "markdown pdf 変換 比較",
      "markdown pdf 変換 おすすめ",
      "markdown pdf 文字化け",
      "pandoc 日本語 pdf",
      "markdown コンバーター 比較",
      "ブラウザ markdown pdf",
    ],
    alternates: {
      canonical: "/ja/markdown-henkan-hikaku",
    },
    openGraph: {
      title: "Markdown PDF変換ツール徹底比較 2026",
      description:
        "Markdown PDF変換ツール8種を正直に比較。文字化けしない選び方を、用途別に解説。",
      locale: "ja_JP",
    },
  };
}

const PUBLISH_DATE = "2026-05-09";
const NEXT_REVIEW = "2026-11-09";

const faq = [
  {
    q: "なぜ日本語のテキストがPDFで□□□（豆腐）になってしまうのですか？",
    a: "ほとんどのMarkdown→PDF変換ツールはHelveticaやTimes New Romanなどの欧文フォントにフォールバックするため、日本語のグリフを持っていません。解決策は、(a) Noto Sans CJK JPのような日本語対応フォントをレンダリングパイプラインに埋め込む（Markdown Freeはこれを自動で行います）、または (b) ツールに対象フォントを設定する（Pandocの場合：--pdf-engine=xelatex -V mainfont=\"Noto Sans CJK JP\"）です。",
  },
  {
    q: "登録不要・広告なしの無料Markdown→PDF変換ツールはありますか？",
    a: "あります。Markdown Free（広告なし、トラッキングなし、登録不要）、Pandoc（CLI）、VS Code拡張のMarkdown PDFはいずれも無料で広告がありません。DillingerやOnline2PDFのようなホスト型エディターは広告で運営されているのが一般的です。",
  },
  {
    q: "インストール不要のおすすめMarkdown→PDF変換ツールは？",
    a: "Markdown Freeはブラウザのみで完結しインストール不要です。StackEditやDillingerもブラウザのみで動作しますが、システムフォントに依存するため、日本語が文字化けする場合があります。",
  },
  {
    q: "MarkdownをDOCX（Word）に変換する際、フォーマットを保ったままにできますか？",
    a: "はい。Markdown Free、Pandoc、Typoraはいずれも見出し、コードブロック、テーブル、タスクリストを保持したDOCXを生成できます。最も忠実なのはPandoc、ブラウザで最速なのはMarkdown Freeです。",
  },
  {
    q: "2026年でもPandocは依然としてベストな選択ですか？",
    a: "Pandocはスクリプト処理用途では今も最強のMarkdownコンバーターですが、LaTeX（約1.5GB）をインストールしたくない非エンジニアにとっては、Markdown Freeのようなブラウザベースのツールがほぼ同等のPDF品質をセットアップ不要で提供しています。",
  },
  {
    q: "機密文書を扱う場合、最も安全なMarkdown変換ツールは？",
    a: "ローカルで動作するもの（Pandoc、Typora、Markdown PDF (VS Code)、md-to-pdf）はファイルが手元から離れません。ブラウザツールの中ではMarkdown FreeはHTML/TXT/DOCXを完全クライアントサイドで処理し、PDFはサーバーレスのメモリ上で生成後すぐに破棄します。Online2PDFのようにサーバーへアップロードするツールはプライバシー上のリスクが最も高くなります。",
  },
  {
    q: "Markdown Freeにファイルサイズ制限はありますか？",
    a: "はい、現在は1ファイル5MBです。5MBのMarkdownはおおよそ75万語に相当し、実用上のドキュメントはほぼすべてカバーします。それより大きなファイルが必要な場合、コマンドラインのPandocに組み込みのサイズ制限はありません。",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  inLanguage: "ja",
  headline: "Markdown PDF変換ツール徹底比較 2026",
  description:
    "Markdown PDF変換ツール8種の正直な比較：Markdown Free、Pandoc、Typora、Dillinger、StackEdit、md-to-pdf、Markdown PDF、Online2PDF。",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
  author: { "@type": "Organization", name: "Markdown Free team", url: "https://www.markdown.free/ja/about" },
  publisher: { "@type": "Organization", name: "Markdown Free", url: "https://www.markdown.free" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.markdown.free/ja/markdown-henkan-hikaku" },
};

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

export default async function MarkdownHenkanHikakuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (localeParam !== "ja") notFound();

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <ConverterProvider>
      <LocaleTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Markdown PDF変換ツール徹底比較 2026</h1>

          <p className="text-sm text-slate-500">
            公開日 {PUBLISH_DATE} ・ 次回見直し {NEXT_REVIEW} ・ Markdown Freeチーム
          </p>

          <p className="lead text-lg text-slate-600">
            Markdown→PDFの変換ツール選びは、必要になるまで簡単に思えるものです。実際に使ってみると、1.5GBのLaTeXを入れる（Pandoc）、有料デスクトップアプリ（Typora）、広告つきのブラウザエディター（Dillinger）、自分でスクリプトを組む（md-to-pdf）といった選択肢に直面します。英文ならどれでも動きますが、日本語が入ると途端に挙動が変わります。文字化けが起きるかどうか、これが「一番いい」を決める分かれ目です。
          </p>

          <p>
            <strong>本記事では2026年に主要な8つのツールを比較します。</strong>結論を先に言うと、<Link href="/ja" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>はブラウザだけで日本語をそのまま扱いたい場合に最適、Pandocはバッチ処理のスクリプト運用に最適、Typoraは有料でもオフラインで仕上げたい人に最適です。
          </p>

          <h2>かんたん比較表</h2>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">ツール</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">向いている用途</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">価格</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">日本語対応</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">出力形式</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">インストール</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">プライバシー</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown Free</td><td className="px-3 py-3">ブラウザ・日本語そのまま</td><td className="px-3 py-3">無料</td><td className="px-3 py-3">完全対応・Notoフォント埋込み・設定不要</td><td className="px-3 py-3">PDF, DOCX, EPUB, HTML, TXT</td><td className="px-3 py-3">不要</td><td className="px-3 py-3">ファイルは保存せずメモリ処理</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Pandoc</td><td className="px-3 py-3">スクリプトでバッチ変換</td><td className="px-3 py-3">無料</td><td className="px-3 py-3">設定必要：<code>--pdf-engine=xelatex -V mainfont</code></td><td className="px-3 py-3">30以上の形式</td><td className="px-3 py-3">PDF出力にLaTeX（約1.5GB）必要</td><td className="px-3 py-3">ローカルのみ</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Dillinger</td><td className="px-3 py-3">英文の素早い編集</td><td className="px-3 py-3">無料・広告あり</td><td className="px-3 py-3">システムフォント依存</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">不要</td><td className="px-3 py-3">クラウド連携時はそちらに保存</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">StackEdit</td><td className="px-3 py-3">ブラウザ＋Driveなどの同期</td><td className="px-3 py-3">無料</td><td className="px-3 py-3">システムフォント依存</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">不要</td><td className="px-3 py-3">クラウド同期は任意</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td><td className="px-3 py-3">VS Code内で完結</td><td className="px-3 py-3">無料</td><td className="px-3 py-3">システムフォント・CSSで設定可</td><td className="px-3 py-3">PDF, HTML, PNG, JPEG</td><td className="px-3 py-3">VS Code＋Chromium（約170MB）</td><td className="px-3 py-3">ローカルのみ</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">md-to-pdf (npm)</td><td className="px-3 py-3">ビルドパイプライン</td><td className="px-3 py-3">無料</td><td className="px-3 py-3">CSSとPuppeteerで設定可</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Node.js＋Chromium</td><td className="px-3 py-3">ローカルのみ</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Typora</td><td className="px-3 py-3">オフラインの整った執筆環境</td><td className="px-3 py-3">買い切り（執筆時点では未確認）</td><td className="px-3 py-3">システムフォント・テーマ依存</td><td className="px-3 py-3">PDF, HTML, DOCX</td><td className="px-3 py-3">デスクトップアプリ</td><td className="px-3 py-3">ローカルのみ</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Online2PDF</td><td className="px-3 py-3">汎用ファイル変換</td><td className="px-3 py-3">無料・広告あり</td><td className="px-3 py-3">限定的・Markdown専用ではない</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">不要</td><td className="px-3 py-3">サーバーへアップロード</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Markdown Free</h2>
          <p>HTML/TXT/DOCX出力は完全クライアントサイド、PDF生成のみサーバーレスのメモリ上で行い処理後すぐに破棄するブラウザ型コンバーター。「30秒で終わる作業に登録や広告を挟まない」という方針で開発されています。</p>
          <p><strong>日本語の扱い：</strong>Noto Sans CJK JPをレンダリングパイプラインに直接埋め込んでおり、文字化けや豆腐は発生しません。設定もインストールも不要です。</p>
          <p><strong>強み：</strong>登録不要、追跡クッキーなし、プライバシー重視の解析、UIは10言語対応、AIが生成したMarkdownを社内文書のWordに変換する用途に強いDOCX出力。<br /><strong>弱み：</strong>1ファイル5MB上限、オフライン非対応（ブラウザ必須）、LaTeX/MathJax数式非対応、バッチ処理なし、PDFスタイルのカスタマイズ不可。<br /><strong>適している人：</strong>今すぐブラウザでPDF/DOCX/EPUBに変換したい人、特に日本語ドキュメントを扱う人。</p>
          <p><Link href="/ja" className="text-emerald-700 hover:text-emerald-800 hover:underline">markdown.free/ja</Link>（直接<Link href="/ja/markdown-docx-henkan" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown→DOCX変換</Link>や<Link href="/ja/readme-pdf-henkan" className="text-emerald-700 hover:text-emerald-800 hover:underline">README→PDF変換</Link>から開くこともできます）</p>

          <h2>Pandoc</h2>
          <p>30以上のフォーマット間を変換できるコマンドライン型の汎用コンバーター。バッチ処理やパイプライン用途では事実上の標準です。</p>
          <p><strong>日本語の扱い：</strong>デフォルトのLaTeXエンジン（<code>pdflatex</code>）は日本語を扱えません。読める出力にするには<code>--pdf-engine=xelatex</code>（または<code>lualatex</code>）と<code>-V mainfont=&quot;Noto Sans CJK JP&quot;</code>の指定が必要で、対応するNotoフォントもシステムにインストールしておく必要があります。</p>
          <p><strong>強み：</strong>もっとも強力で柔軟、巨大なプラグイン／フィルターのエコシステム、学術・技術文書での実績。<br /><strong>弱み：</strong>PDF生成にLaTeX（macOSではTeX Liveで約1.5GB）の導入が必要、学習コストが高く、初心者は日本語設定の存在自体を知らないことが多い。<br /><strong>適している人：</strong>スクリプトで変換を回したい技術者、学術出版、CLIに慣れている書き手。</p>
          <p><a href="https://pandoc.org" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">pandoc.org</a></p>

          <h2>Dillinger</h2>
          <p>ライブプレビュー付きのブラウザMarkdownエディター。dillinger.ioでホスト版が利用できます。</p>
          <p><strong>日本語の扱い：</strong>プレビューはブラウザのフォントフォールバックに従い、PDF出力もシステムフォントを使います。プレビューでは日本語が表示されてもPDFで化けるケースがあります。</p>
          <p><strong>強み：</strong>使い慣れた左右分割エディター、無料、Dropbox／Google Drive／GitHubと連携。<br /><strong>弱み：</strong>ホスト版は広告ありで、編集状態が連携先のクラウドに同期されることがある。PDFスタイルのコントロールは限定的。<br /><strong>適している人：</strong>欧文ドキュメントの一時的な編集と書き出し。</p>
          <p><a href="https://dillinger.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">dillinger.io</a></p>

          <h2>StackEdit</h2>
          <p>クラウド同期（Google Drive、Dropbox、GitHub）と数式（MathJax）に強いブラウザエディター。</p>
          <p><strong>日本語の扱い：</strong>Dillingerと同様にブラウザ／システムフォントに依存します。Notoフォントは同梱されません。</p>
          <p><strong>強み：</strong>洗練されたUI、数式、複数端末でのクラウド同期。<br /><strong>弱み：</strong>PDF出力はブラウザの印刷経路を使うためスタイルの自由度が低く、クラウド同期にはGoogle/Dropbox権限が必要。<br /><strong>適している人：</strong>クラウド同期と数式が必要な書き手。</p>
          <p><a href="https://stackedit.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">stackedit.io</a></p>

          <h2>Markdown PDF（VS Code拡張）</h2>
          <p>VS Code内のMarkdownファイルをPDF/HTML/PNG/JPEGに書き出す拡張。初回はChromium（約170MB）をダウンロードします。</p>
          <p><strong>日本語の扱い：</strong>Chromiumのフォントシステムをそのまま使うためOSに日本語フォントが入っていれば表示されます（最近のmacOS/Windows/Linuxでは多くの場合入っています）。CSSで<code>@font-face</code>を指定して特定フォントを埋め込むことも可能です。</p>
          <p><strong>強み：</strong>VS Codeのワークフローに自然に組み込め、CSSで自由にカスタマイズ可、ローカル完結。<br /><strong>弱み：</strong>VS Codeが必須、初回のChromiumダウンロード、初回起動が遅い、設定はJSONファイル経由。<br /><strong>適している人：</strong>普段からVS Codeで作業していてキーボード一発でPDFを出したい開発者。</p>
          <p><a href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">VS Codeマーケットプレイス</a></p>

          <h2>md-to-pdf（npm）</h2>
          <p>Puppeteer（内部でChromium）を使ってMarkdownをPDFに変換するNode.jsのCLI／ライブラリ。ビルドパイプラインに組み込む用途を想定しています。</p>
          <p><strong>日本語の扱い：</strong>Chromiumのフォントに依存。CSS経由でNotoなどのWebフォントを<code>@import</code>すれば確実に日本語を出せます。</p>
          <p><strong>強み：</strong>スクリプト可能、テーマ可能、設定後はバッチが速い、オープンソース。<br /><strong>弱み：</strong>Node.jsとPuppeteerのChromium（初回約170MB）が必要。デフォルトのスタイルは本番品質にするためCSSの作り込みが必要。<br /><strong>適している人：</strong>ドキュメントからPDFを生成するCI/CDを組む人。</p>
          <p><a href="https://github.com/simonhaenisch/md-to-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">github.com/simonhaenisch/md-to-pdf</a></p>

          <h2>Typora</h2>
          <p>macOS/Windows/Linux向けのデスクトップ型WYSIWYG Markdownエディター。2021年までは無料でしたが、現在は買い切り課金です（金額は執筆時点で未確認、公式サイトを参照ください）。</p>
          <p><strong>日本語の扱い：</strong>多くのスクリプトでシステムフォントを使ったまま素直に出ます。ただし日本語最適化のフォントスタックを持つかはテーマ次第です。</p>
          <p><strong>強み：</strong>WYSIWYGの完成度が高い、出力が綺麗、ライセンス購入後は広告も計測もなし。<br /><strong>弱み：</strong>有料、デスクトップのみでブラウザ版なし、チームやクラウドの機能はなし。<br /><strong>適している人：</strong>一人で書き物をする人で、買い切りでも構わない人。</p>
          <p><a href="https://typora.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">typora.io</a></p>

          <h2>Online2PDF</h2>
          <p>Word・Excel・PDF・画像など多形式に対応した汎用Webコンバーター。Markdownも一応扱えます。</p>
          <p><strong>日本語の扱い：</strong>限定的で、執筆時点では未検証です。Markdownネイティブの設計ではないため、コードブロック、テーブル、CJKフォントの扱いは安定しません。</p>
          <p><strong>強み：</strong>Markdown以外も扱える、インストール不要。<br /><strong>弱み：</strong>サーバーへのファイルアップロード（機密文書ではリスク）、広告が多い、Markdownのレンダリングが汎用的でテーブル等が崩れることがある、スタイルのカスタマイズ不可。<br /><strong>適している人：</strong>Markdownはついで、別形式の混在変換が主目的の場合。</p>
          <p><a href="https://online2pdf.com" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">online2pdf.com</a></p>

          <h2>選び方（用途別）</h2>
          <ul>
            <li><strong>今すぐブラウザでMarkdownをPDF/DOCX/EPUBにしたい、登録は嫌、特に日本語が入っている</strong> → <Link href="/ja" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link></li>
            <li><strong>CLIに慣れている、LaTeXは入れる（または既にある）、スクリプトで回したい</strong> → Pandoc</li>
            <li><strong>VS Codeで完結させたい、ワンショートカットでPDF出力</strong> → Markdown PDF（VS Code拡張）</li>
            <li><strong>CI/CDでドキュメントからPDFを生成したい</strong> → md-to-pdf または Pandoc</li>
            <li><strong>オフラインで整った執筆環境がほしい、有料でも構わない</strong> → Typora</li>
            <li><strong>クラウド同期と数式が必要</strong> → StackEdit</li>
            <li><strong>欧文だけの一時的な編集と書き出し</strong> → Dillinger または StackEdit</li>
          </ul>

          <h2>よくある質問</h2>
          {faq.map((item, i) => (<div key={i}><h3>{item.q}</h3><p>{item.a}</p></div>))}

          <h2>開示</h2>
          <p>本記事は上の比較に登場する<Link href="/ja" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>のチームが執筆しています。Pandocはスクリプト用途、Typoraはオフラインの仕上げ、VS CodeのMarkdown PDFはエディター内ワークフローと、他のツールが勝つ場面はそのまま記載しました。外部リンクは<code>rel=&quot;nofollow&quot;</code>を付けています。事実誤認に気づいた場合は<Link href="/ja/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">こちら</Link>からご一報ください、修正します。</p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">Markdown Freeを試す ― インストールも登録も豆腐もなし</p>
            <Link href="/ja" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800">Markdown Freeを開く<span aria-hidden="true">→</span></Link>
          </div>

          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">関連ページ</h2>
            <ul className="space-y-2">
              <li><Link href="/ja/markdown-pdf-henkan" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF変換 - 無料・登録不要</Link></li>
              <li><Link href="/ja/markdown-pdf-touroku-fuyou" className="text-emerald-700 hover:text-emerald-800 hover:underline">登録不要のMarkdown PDF変換</Link></li>
              <li><Link href="/ja/readme-pdf-henkan" className="text-emerald-700 hover:text-emerald-800 hover:underline">README.md PDF変換</Link></li>
              <li><Link href="/ja/markdown-docx-henkan" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown DOCX変換</Link></li>
            </ul>
          </div>
        </article>

        <Footer locale={locale} dict={dict} />
      </main>
    </ConverterProvider>
  );
}
