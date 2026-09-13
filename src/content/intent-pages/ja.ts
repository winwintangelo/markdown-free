import type { IntentPageContent } from "./types";

/**
 * 日本語ロングテール意図ページ（build plan Phase 1）。slug をキーにする。
 * 各形式の結果を正直に説明：PDF/HTML/画像/EPUB では KaTeX で数式を組版、
 * Word では数式を鮮明な画像にし、LaTeX ソースは代替テキストに保持（編集可能な数式はロードマップ上、Phase 0b）。
 */

const FAQ_HEADING = "よくある質問";

const demo = (sampleLabel: string, note: string) => ({
  heading: "⬇ .md ファイルをここにドロップ — またはサンプルで試す",
  hint: "数秒で変換 · 保存なし · 登録不要",
  readyHint: "下の形式を選んでください",
  sampleLabel,
  note,
});

const WORD_HONESTY = "Word では各数式がプレビューと同じ見た目の鮮明な画像になり、LaTeX ソースは画像の代替テキストに残ります。編集可能な Word 数式はロードマップ上にあります。";

const PRIVACY = "無料・登録不要・文書に透かしなし。1 ファイル 1MB まで。PDF と Word はサーバーのメモリ上で変換して即時破棄、その他の形式はすべてブラウザ内で完結します。";

function mathToWordPage(opts: {
  chatbot: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  lead: string;
  whyExtra?: string;
  faqExtra?: { q: string; a: string }[];
}): [string, IntentPageContent] {
  const { chatbot } = opts;
  return [
    opts.slug,
    {
      title: opts.title,
      description: opts.description,
      keywords: opts.keywords,
      h1: opts.h1,
      lead: opts.lead,
      ctaTop: `${chatbot} の数式を今すぐ直す`,
      ctaBottom: "回答を貼り付けるだけ — 無料・登録不要",
      sections: [
        {
          heading: `${chatbot} の数式を Word に貼ると崩れる理由`,
          paragraphs: [
            `${chatbot} は数式を LaTeX で書きます。回答をコピーすると、数式は \\( … \\) や \\[ … \\] で囲まれたソースのままクリップボードに入り、Word はそれをそのまま貼り付けます — バックスラッシュも波括弧もそのまま。Word の数式エディターは関与しないので、分数ではなくコードの行が表示されます。`,
            "スクリーンショットなら崩れませんが、検索も編集もできず、印刷するとぼやけます。正しい方法は、先に LaTeX をレンダリングし、組版済みの文書を Word や PDF に渡すことです。",
            ...(opts.whyExtra ? [opts.whyExtra] : []),
          ],
        },
        {
          heading: "30 秒で直す",
          steps: [
            { title: "回答をコピー", text: `${chatbot} のコピーボタンを使えば Markdown と LaTeX がそのまま残ります。` },
            { title: "ここに貼り付け", text: "貼り付け欄が「コードをコピー」やロール表示などの UI 残骸を自動で除去し、\\( … \\)・\\[ … \\] の区切りも認識します。" },
            { title: "エクスポート", text: "「PDF へ」で組版済みの数式、「Word (DOCX) へ」で編集できる文書に。" },
          ],
        },
        {
          heading: "形式ごとに得られるもの",
          bullets: [
            "PDF・HTML・画像・EPUB：すべての数式を KaTeX で組版 — 分数、総和、行列、ギリシャ文字、上下付き。",
            `Word (DOCX)：見出し、表、コード、リストは本物の Word スタイルに。${WORD_HONESTY}`,
            "表、コードブロック、見出し、リストはすべての形式で保持。",
            "保存は一切なし：PDF と Word はメモリ上で変換して破棄、他の形式はブラウザから出ません。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        {
          q: `${chatbot} の数式が Word で \\frac や \\sum と表示されるのはなぜ？`,
          a: `LaTeX ソースだからです。${chatbot} はチャット画面ではレンダリングしますが、クリップボードには生のテキストしか入りません。ここで先にレンダリングすれば、PDF でも Word でも組版済みの数式になります。`,
        },
        {
          q: "\\( を $ に書き換える必要はありますか？",
          a: "ありません。$ … $ / $$ … $$ と \\( … \\) / \\[ … \\] の両方を認識します。本文中の「$5 と $10」のような金額は数式として扱いません。",
        },
        {
          q: "Word で数式を編集できますか？",
          a: "数式としての編集はまだできません。Word では各数式が鮮明な画像になり、表示も印刷もきれいで、LaTeX ソースは画像の代替テキストに残ります。編集可能な数式（OMML）はロードマップ上です。PDF・HTML・画像・EPUB も完全に組版されます。",
        },
        { q: "無料ですか？登録は必要？", a: PRIVACY },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("数式入りのサンプルで試す", "インライン数式、ディスプレイ数式、行列、\\( … \\) 区切りを含むサンプル — 下でレンダリングされます。"),
    },
  ];
}

function sourceToWordPage(opts: {
  chatbot: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  lead: string;
  quirks: string[];
  faqExtra?: { q: string; a: string }[];
}): [string, IntentPageContent] {
  const { chatbot } = opts;
  return [
    opts.slug,
    {
      title: opts.title,
      description: opts.description,
      keywords: opts.keywords,
      h1: opts.h1,
      lead: opts.lead,
      ctaTop: `${chatbot} の回答を今すぐ変換`,
      ctaBottom: "回答を貼り付けるだけ — 無料・登録不要",
      sections: [
        {
          heading: `${chatbot} の回答を Word に貼ると崩れる箇所`,
          paragraphs: [
            `${chatbot} の回答は Markdown です：見出し、箇条書き、表、コードブロック、LaTeX 数式。Word に直接貼るとすべてプレーンテキストになります — 表はパイプ記号、見出しはシャープ、数式はバックスラッシュ、さらに「コードをコピー」やロール表示といった UI の残骸付きで。`,
          ],
          bullets: opts.quirks,
        },
        {
          heading: "30 秒の手順",
          steps: [
            { title: "回答をコピー", text: `${chatbot} のコピーボタンは Markdown を保持します。範囲選択してのコピーでもたいてい大丈夫です。` },
            { title: "ここに貼り付け", text: "貼り付け時にチャットの残骸を除去し、プレビューを表示します。" },
            { title: "エクスポート", text: "同僚が編集する文書なら「Word (DOCX) へ」、共有なら「PDF へ」・画像・EPUB。" },
          ],
        },
        {
          heading: "Word で得られるもの",
          bullets: [
            "見出し、リスト、太字、斜体は本物の Word スタイルに。",
            "表は Word の表に、コードブロックは等幅スタイルに。",
            `数式：${WORD_HONESTY}`,
            "表をスプレッドシートにしたいなら「Excel (XLSX) へ」— 表ごとに 1 シート。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: `${chatbot} の会話全体を一度に変換できますか？`, a: "必要な回答を順に同じ欄へ貼り付けてから、一度にエクスポートしてください。見出しの自動採番付きの複数回答マージはロードマップ上です。" },
        { q: `${chatbot} の表やコードは保持されますか？`, a: "はい。Markdown の表は Word の表（または Excel のシート）に、コードブロックは等幅書式のまま、見出しは Word の見出しスタイルに対応します。" },
        {
          q: "どの形式にエクスポートできますか？",
          a: "PDF、Word (DOCX)、画像 (PNG/JPG)、EPUB、Excel (XLSX、表ごとに 1 シート)、HTML、プレーンテキスト — 貼り付けた同じ回答からすべて、アカウントなしで。",
        },
        { q: "テキストは保存されますか？", a: "いいえ。Word と PDF はサーバーのメモリ上で生成し、ダウンロード直後に破棄します。HTML・画像・EPUB・Excel はブラウザから出ません。アカウント不要、追跡クッキーなし。" },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("サンプル回答で試す", "典型的な AI の回答：数式、表、コードブロック — それぞれがどう描画されるかご覧ください。"),
    },
  ];
}

export const ja: Record<string, IntentPageContent> = Object.fromEntries([
  mathToWordPage({
    chatbot: "ChatGPT",
    slug: "chatgpt-suushiki-word",
    title: "ChatGPT の数式を Word に貼ると崩れる時の直し方",
    description: "ChatGPT の数式が Word で \\frac や \\sum のまま？回答をここに貼れば、PDF でも Word でも数式をきれいに組版。無料・登録不要。",
    keywords: ["chatgpt 数式 word 貼り付け", "chatgpt 数式 word 崩れる", "chatgpt 数式 コピー", "chatgpt latex word", "chatgpt 数式 pdf", "chatgpt 数式 エクスポート"],
    h1: "ChatGPT の数式を Word へ — LaTeX が崩れない方法",
    lead: "数式だらけの ChatGPT の回答をコピーしたら、Word には分数ではなく \\frac{a}{b} が並んだ？ここに貼れば、PDF は組版済みの数式に、Word はすべての数式を保持したきれいな文書になります。",
    faqExtra: [
      { q: "ChatGPT の引用マークや「Copy code」の行は？", a: "貼り付け時に自動で除去します：コピーボタンのラベル、「You said / ChatGPT said」、「Thought for 8s」、【12†source】のような引用記号。" },
    ],
  }),
  mathToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-suushiki-word",
    title: "DeepSeek の数式を Word・PDF へ：貼り付けの崩れを直す",
    description: "DeepSeek の回答を Word に貼ると LaTeX ソースと <think> ブロックだらけ？ここに貼れば推論の残骸を除去し、PDF でも Word でも数式を組版。無料。",
    keywords: ["deepseek 数式 word", "deepseek 数式 貼り付け 崩れる", "deepseek latex word", "deepseek pdf 数式", "deepseek think 削除", "deepseek 数式 コピー"],
    h1: "DeepSeek の数式を Word と PDF へ",
    lead: "DeepSeek はチャット画面では美しい数式を表示しますが、クリップボードには生の \\[ … \\] LaTeX が入り、先頭に <think> ブロックが付くことも。ここに貼れば、PDF でもきれいな Word 文書でも数式が組版されます。",
    whyExtra: "DeepSeek のコピーには非表示の推論ブロック（<think> … </think>）と「已深度思考（用时 12 秒）」の行が含まれることがあります。どちらも貼り付け時に除去され、文書には入りません。",
    faqExtra: [
      { q: "DeepSeek の <think> 推論ブロックは処理されますか？", a: "はい。<think> … </think> ブロックと「已深度思考」/「Thought for Ns」の行は貼り付け時に除去され、回答本文はそのまま残ります。" },
    ],
  }),
  [
    "chatgpt-hyou-excel",
    {
      title: "ChatGPT の表を Excel へ：貼り付けて XLSX に",
      description: "ChatGPT（や他の AI）の Markdown 表を本物の Excel ブックに：表ごとに 1 シート、数値は数値、見出しは太字。ブラウザ内で生成、無料・登録不要。",
      keywords: ["chatgpt 表 excel", "chatgpt 表 コピー excel", "chatgpt excel 変換", "markdown 表 excel", "ai 表 xlsx", "chatgpt 表 崩れる"],
      h1: "ChatGPT の表をワンクリックで Excel に",
      lead: "ChatGPT の表は Markdown — パイプとハイフンです。回答をここに貼れば、表ごとに 1 シート、数値セル、太字見出しの .xlsx をダウンロードできます。手作業の整形は不要です。",
      ctaTop: "表を今すぐ変換",
      ctaBottom: "表を貼り付けるだけ — 無料・登録不要",
      sections: [
        {
          heading: "ChatGPT の表を Excel に貼ると崩れる理由",
          paragraphs: [
            "Markdown の表はテキストです：| 名前 | 点数 | と、その下のハイフンの行。Excel に貼ると 1 列に押し込まれるか、パイプ記号がセルの中身になります。「区切り位置」機能では半分しか直らず、整列行が残ります。",
            "先に Markdown をレンダリングすれば本物の行と列になり、ここの Excel ライターが回答内のすべての表をそれぞれ独立したシートに書き出します。",
          ],
        },
        {
          heading: "30 秒で直す",
          steps: [
            { title: "回答をコピー", text: "ChatGPT のコピーボタンを使えば表は Markdown のままです。" },
            { title: "ここに貼り付け", text: "プレビューに表が表示され、「Copy code」やロール表示は自動で除去されます。" },
            { title: "その他の形式 → Excel (XLSX) へ", text: "表ごとに 1 シート。ファイルは即座にダウンロードされます。" },
          ],
        },
        {
          heading: "ブックの中身",
          bullets: [
            "Markdown の表ごとに 1 シート。直前の見出しがシート名になります。",
            "数字は数値として保存（「1,234.56」は 1234.56 に）、それ以外はテキスト。",
            "見出し行は太字、列幅は内容に合わせて調整。",
            "Excel、Numbers、LibreOffice、Google スプレッドシートで開けます。完全にブラウザ内で生成 — 表は端末から出ません。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Claude、Gemini、DeepSeek、Kimi の表でも使えますか？", a: "はい。どのアシスタントが書いた表でも、Markdown の表なら変換できます。1 つの回答に複数の表があれば複数のシートになります。" },
        { q: "セル内の数式や太字はどうなりますか？", a: "セルはプレーンテキストとして書き出されます。セル内の書式は Excel に持ち込まれず、LaTeX の数式はソースのテキストになります。" },
        { q: "表を Word にもできますか？", a: "はい — 「Word (DOCX) へ」で同じ文書を、本物の Word の表として書き出します。" },
        { q: "無料ですか？", a: "無料・アカウント不要。Excel ファイルはブラウザ内で生成され、何もアップロードされません。" },
      ],
      demo: demo("表入りのサンプルで試す", "配置の異なる 2 つの Markdown 表 — 読み込んだら「その他の形式 → Excel へ」を選んでください。"),
    },
  ],
  [
    "ai-hyou-word",
    {
      title: "AI チャットの表を Word へ：ChatGPT・Gemini・Claude",
      description: "ChatGPT、Gemini、Claude の表を Word に貼るとパイプ記号の羅列に？回答をここに貼れば、本物の表を含む Word 文書、または Excel ブックを出力。無料・登録不要。",
      keywords: ["chatgpt 表 word 貼り付け", "gemini 表 word", "ai 表 word 変換", "markdown 表 word", "claude 表 word", "表 コピー word 崩れる"],
      h1: "AI チャットの表を Word へ — パイプ記号ではなく本物の表に",
      lead: "ChatGPT も Gemini も Claude も Markdown の表で答えます。Word ではそれが | パイプ | の行になります。回答をここに貼れば、配置も保持された本物の Word の表を含む文書を出力できます。",
      ctaTop: "表を今すぐ変換",
      ctaBottom: "回答を貼り付けるだけ — 無料・登録不要",
      sections: [
        {
          heading: "AI の表が Word で崩れる理由",
          paragraphs: [
            "Markdown の表はパイプ区切りと整列行（:--- 左寄せ、:--: 中央、---: 右寄せ）を持つプレーンテキストです。Word はそれが表だと分からないので、文字をそのまま貼り付けます。",
            "先に Markdown をレンダリングすれば、列の配置・見出し行・罫線を備えた正しい表になり、同じ文書を PDF・Excel・画像にもできます。",
          ],
        },
        {
          heading: "30 秒で直す",
          steps: [
            { title: "回答をコピー", text: "アシスタントのコピーボタンは Markdown をそのまま保持します。" },
            { title: "ここに貼り付け", text: "プレビューで表を確認 — 配置は書かれたとおりに表示されます。" },
            { title: "エクスポート", text: "「Word (DOCX) へ」で本物の Word の表、「その他の形式 → Excel (XLSX) へ」でスプレッドシート。" },
          ],
        },
        {
          heading: "得られるもの",
          bullets: [
            "Word：見出し行、罫線、左/中央/右寄せを備えたネイティブの表。",
            "Excel：表ごとに 1 シート、数値セルと太字見出し。",
            "PDF と画像：プレビューどおりに組版された表。日本語も文字化けなし。",
            "無料・アカウント不要。Word と PDF はメモリ上で変換して破棄、Excel と画像はブラウザ内で生成。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Gemini の表が 1 行につながって貼り付くのはなぜ？", a: "一部の画面からのコピーでは改行が落ちます。ここの入力欄に貼れば、パイプ記号が残っている限り Markdown パーサーが行を復元します。" },
        { q: "セルの結合は使えますか？", a: "標準の Markdown 表にセル結合はありません。rowspan/colspan を含む HTML の表はまだ非対応です。1 件 1 行で書いてください。" },
        { q: "表の前後の文章も一緒に変換されますか？", a: "はい — 回答全体が変換されます：見出し、段落、コード、表。" },
        { q: "無料ですか？", a: "無料・アカウント不要・文書に透かしなし。1 ファイル 1MB まで。" },
      ],
      demo: demo("表入りのサンプルで試す", "整列された 2 つの Markdown 表 — 読み込んで「Word (DOCX) へ」で本物の表を確認できます。"),
    },
  ],
  [
    "markdown-suushiki-pdf",
    {
      title: "Markdown の数式を PDF に（KaTeX で LaTeX を組版）",
      description: "$…$ や $$…$$ の LaTeX 数式を含む Markdown をブラウザで組版済み PDF に。KaTeX レンダリング、日本語フォント埋め込み、インストール不要、登録不要。Word・HTML・画像・EPUB も。",
      keywords: ["markdown 数式 pdf", "markdown latex pdf 変換", "markdown 数式 変換", "katex markdown pdf", "md 数式 pdf オンライン", "markdown 数式 レンダリング"],
      h1: "Markdown の数式を PDF に",
      lead: "$E = mc^2$ や $$\\int_0^\\infty$$、行列を含むノートがそのまま組版済みの PDF に — Pandoc も 1.5 GB の TeX インストールも不要。ファイルをドロップして「PDF へ」を押すだけ。",
      ctaTop: "Markdown を今すぐ変換",
      ctaBottom: ".md をドロップ — 無料・登録不要",
      sections: [
        {
          heading: "対応範囲",
          bullets: [
            "インライン数式 $ … $ と \\( … \\)、ディスプレイ数式 $$ … $$ と \\[ … \\]。",
            "分数、根号、総和、積分、極限、行列（pmatrix、bmatrix）、aligned 環境、ギリシャ文字、演算子、その他 KaTeX が対応するほとんどのコマンド。",
            "表、リスト、引用の中の数式。",
            "数式の隣の日本語：PDF に Noto Sans JP/SC/TC/KR を埋め込み。",
          ],
        },
        {
          heading: "使い方",
          steps: [
            { title: "ドロップまたは貼り付け", text: ".md ファイル（1MB まで）— プレビューで数式が即座に描画されます。" },
            { title: "確認", text: "非対応のコマンドはソースとともに赤で表示され、黙って失敗することはありません。" },
            { title: "「PDF へ」をクリック", text: "A4（地域によっては Letter）、KaTeX フォント埋め込み。" },
          ],
        },
        {
          heading: "他の形式",
          bullets: [
            "HTML：KaTeX スタイルシートを埋め込んだ単一ファイル。",
            "画像（PNG/JPG）と EPUB：数式をレンダリング済み、ブラウザ内で生成。",
            `Word (DOCX)：${WORD_HONESTY}`,
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "対応していない LaTeX コマンドは？", a: "KaTeX の関数リスト外のもの — 複雑な定義の \\newcommand マクロ、TikZ、完全な LaTeX 文書環境など。非対応コマンドはソースとともに赤で表示されます。" },
        { q: "本文中の $5 や $10 は数式になりますか？", a: "なりません。普通の文章に見える $ … $（複数の単語で数学記号なし）はテキストのまま残します。" },
        { q: "Pandoc と比べてどうですか？", a: "Pandoc と LaTeX エンジンの PDF は優れていますが、数 GB の TeX インストールと日本語フォントの設定が必要です。こちらはブラウザ上で動き、日本語フォントは埋め込み済み。ほとんどのノートや論文で同等の出力が得られます。" },
        { q: "無料ですか？", a: PRIVACY },
      ],
      demo: demo("数式入りのサンプルで試す", "インライン数式、ディスプレイ数式、行列、\\( … \\) 区切り — すべてプレビューで組版されます。"),
    },
  ],
  [
    "markdown-mermaid-pdf-henkan",
    {
      title: "Markdown の Mermaid 図を PDF・Word に変換",
      description: "```mermaid のフローチャート、シーケンス図、クラス図を含む Markdown を、図をレンダリングしたまま PDF、Word、画像、EPUB に。ブラウザ内で処理、無料・登録不要。",
      keywords: ["markdown mermaid pdf", "mermaid 図 pdf 出力", "markdown フローチャート pdf", "mermaid word 変換", "markdown mermaid オンライン", "mermaid docx 出力"],
      h1: "Markdown の Mermaid 図を PDF に",
      lead: "```mermaid のコードブロックが図として描画され — フローチャート、シーケンス図、クラス図、状態図、ガントチャート — コードブロックではなく鮮明な画像として PDF、Word、画像、EPUB に入ります。",
      ctaTop: "Markdown を今すぐ変換",
      ctaBottom: ".md をドロップ — 無料・登録不要",
      sections: [
        {
          heading: "図がすべての形式に入る仕組み",
          paragraphs: [
            "Mermaid はブラウザがないと描画できないため、図はあなたのブラウザ内で描画され、どの形式を生成するより前に画像として文書に埋め込まれます。PDF と Word には鮮明な PNG、HTML・EPUB・画像出力にはベクター SVG が入ります。",
            "Mermaid エンジンは文書に ```mermaid ブロックが実際にある場合だけ読み込まれるので、通常の文書は速いままです。",
          ],
        },
        {
          heading: "使い方",
          steps: [
            { title: "ドロップまたは貼り付け", text: "```mermaid ブロックを含む Markdown — プレビューにレンダリングされた図が表示されます。" },
            { title: "確認", text: "構文エラーのある図はコードブロックのまま残るので修正できます。" },
            { title: "エクスポート", text: "PDF へ、Word (DOCX) へ、画像 (PNG) へ、EPUB — 図はどれにも入ります。" },
          ],
        },
        {
          heading: "対応する図の種類",
          bullets: [
            "フローチャート / graph、シーケンス図、クラス図、状態図、ER 図、ガントチャート、円グラフ、マインドマップ、タイムラインなど Mermaid 11 の各種。",
            "日本語・中国語・韓国語のラベルは端末のフォントで描画されます。",
            "大きな図は印刷向けに 2 倍解像度で埋め込みます。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "図がコードブロックのままなのはなぜ？", a: "Mermaid が解析できなかったためです。構文を確認してください（mermaid.live が便利です）。解析エラーの場合はブロックをそのまま残し、エクスポート自体は失敗しません。" },
        { q: "図だけを画像として取り出せますか？", a: "文書を「画像 (PNG) へ」でエクスポートするか、レンダリングされたプレビューから図をコピーしてください。" },
        { q: "Word でも図は表示されますか？", a: "はい、印刷解像度の PNG 画像として埋め込まれます。" },
        { q: "無料ですか？", a: "無料・アカウント不要。図はブラウザ内でレンダリング、PDF と Word はメモリ上で変換して破棄します。" },
      ],
      demo: demo("図入りのサンプルで試す", "```mermaid のフローチャート — 下のプレビューでレンダリングされます。"),
    },
  ],
  [
    "markdown-excel-henkan",
    {
      title: "Markdown の表を Excel (XLSX) に変換",
      description: "Markdown の表をブラウザで Excel ブックに変換：表ごとに 1 シート、数値は数値、見出しは太字。無料・登録不要・アップロードなし。",
      keywords: ["markdown excel 変換", "markdown 表 excel", "md 表 xlsx", "markdown xlsx 変換", "markdown 表 エクスポート excel", "markdown スプレッドシート"],
      h1: "Markdown の表を Excel に",
      lead: "Markdown ファイルを貼り付けるかドロップして .xlsx をダウンロード：表はそれぞれ 1 シートに、数値セルは本物の数値に、見出し行は太字に。すべてブラウザ内で完結します。",
      ctaTop: "表を今すぐ変換",
      ctaBottom: ".md をドロップ — 無料・登録不要",
      sections: [
        {
          heading: "変換の流れ",
          steps: [
            { title: "ドロップまたは貼り付け", text: "Markdown — プレビューにすべての表が表示されます。" },
            { title: "その他の形式 → Excel (XLSX) へ", text: "ブックはローカルで生成され、表ごとに 1 シートになります。" },
            { title: "開く", text: "Excel、Numbers、LibreOffice、Google スプレッドシートで。" },
          ],
        },
        {
          heading: "保持されるもの",
          bullets: [
            "見出し行（太字）とすべてのデータ行。空セルは空のまま。",
            "桁区切りを含む数字は数値セルに、それ以外はテキストに。",
            "シート名は各表の直前の見出しから。",
            "列幅は最長のセルに合わせて調整。",
          ],
        },
        {
          heading: "保持されないもの",
          bullets: [
            "セル内のインライン書式（太字、リンク、コード）はプレーンテキストになります。",
            "HTML の表とセル結合は非対応 — 標準の Markdown 表を使ってください。",
            "数式は計算されません：=SUM(...) を含むセルはテキストとして保存されます。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "複数の表を一度に変換できますか？", a: "はい。文書内のすべての表が同じブックの別々のシートになります。" },
        { q: "表はアップロードされますか？", a: "いいえ。Excel ファイルはブラウザ内で生成され、サーバーには何も送られません。" },
        { q: "ChatGPT や Notion からコピーした表でも使えますか？", a: "はい、Markdown の表（パイプとハイフンの行）であれば。" },
        { q: "無料ですか？", a: "無料・アカウント不要。1MB のファイルサイズ以外に制限はありません。" },
      ],
      demo: demo("表入りのサンプルで試す", "2 つの Markdown 表 — 読み込んだら「その他の形式 → Excel (XLSX) へ」。"),
    },
  ],
  sourceToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-word-henkan",
    title: "DeepSeek を Word に：回答を DOCX で書き出す",
    description: "DeepSeek の回答を Word (DOCX) や PDF に変換：Markdown を貼り付ければチャットの残骸と <think> ブロックを除去し、数式と表を保持。無料・登録不要。",
    keywords: ["deepseek word 変換", "deepseek docx", "deepseek 回答 保存", "deepseek pdf 変換", "deepseek エクスポート word", "deepseek markdown word"],
    h1: "DeepSeek を Word (DOCX) に",
    lead: "DeepSeek の回答を、チームが編集できる Word 文書に — 見出し、表、コード、数式はそのまま、推論ブロックとコピーボタンの残骸は除去。",
    quirks: [
      "コピーした回答の先頭に付く <think> … </think> 推論ブロックと「已深度思考（用时 N 秒）」の行。",
      "\\( … \\) と \\[ … \\] の LaTeX ソースとしての数式。",
      "各コードブロックの後の「复制代码 / Copy code」の行。",
    ],
  }),
  [
    "claude-artifacts-pdf",
    {
      title: "Claude Artifacts を PDF に：Claude の出力をエクスポート",
      description: "Claude の Artifacts、コードブロック、回答を PDF や Word に。Claude から Markdown をコピーしてここに貼り付け、すぐダウンロード。無料・登録不要。",
      keywords: ["claude artifacts pdf", "claude pdf 出力", "claude 回答 保存 pdf", "claude artifact エクスポート", "claude word 変換", "claude markdown pdf"],
      h1: "Claude Artifacts を PDF に",
      lead: "Claude の Artifacts パネルには「PDF で出力」ボタンがありません。内容をコピーしてここに貼れば、書式付きの PDF、Word、画像が得られます — コードブロック、表、数式もそのまま。",
      ctaTop: "Claude の出力を今すぐ変換",
      ctaBottom: "内容を貼り付けるだけ — 無料・登録不要",
      sections: [
        {
          heading: "Claude Artifact を PDF として保存する手順",
          steps: [
            { title: "Artifact をコピー", text: "Claude の Artifact パネルでコピーを押します（Markdown 系の Artifact は書式を保持、コード Artifact はコードのテキストになります）。" },
            { title: "ここに貼り付け", text: "プレビューで組版結果を確認。チャットの残骸は自動で除去されます。" },
            { title: "エクスポート", text: "共有・印刷なら「PDF へ」、編集を続けるなら「Word (DOCX) へ」、SNS 用なら「画像へ」。" },
          ],
        },
        {
          heading: "保持されるもの",
          bullets: [
            "見出し構造、リスト、太字と斜体。",
            "コードブロック（等幅スタイル）、表、引用。",
            "LaTeX 数式：PDF・HTML・画像・EPUB で完全に組版、Word では鮮明な画像として表示（LaTeX ソースは代替テキストに保持）。",
            "Mermaid 図：画像としてレンダリングされ、すべての形式に入ります。",
          ],
        },
        {
          heading: "スクリーンショットではなく PDF にする理由",
          bullets: [
            "PDF の中は本物のテキスト — 検索もコピーもできます。",
            "コードブロックは PDF でもコピー可能。",
            "長い内容は自動で改ページされ印刷向き、ファイルも小さくなります。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "HTML / React 系の Artifact も変換できますか？", a: "コード自体は変換できます：コピーで得られるのはソースのテキストで、コードブロックとして PDF に入ります。レンダリングされた Web ページの見た目を出力したい場合は、Claude 上でブラウザの印刷機能を使ってください。" },
        { q: "Word にもできますか？", a: "はい。貼り付け後に「Word (DOCX) へ」を押してください。EPUB、HTML、プレーンテキストにもできます。" },
        { q: "内容は保存されますか？", a: "いいえ。PDF と Word はサーバーのメモリ上で生成後すぐに破棄されます。画像・HTML・EPUB はブラウザから出ません。" },
        { q: "無料ですか？", a: PRIVACY },
      ],
      demo: demo("サンプルで試す", "数式、表、コードを含む回答 — それぞれがどう描画されるかご覧ください。"),
    },
  ],
  sourceToWordPage({
    chatbot: "Gemini",
    slug: "gemini-word-henkan",
    title: "Gemini を Word に：回答を DOCX で書き出す",
    description: "Google Gemini の回答を、表・見出し・数式を保持したまま Word (DOCX) や PDF に変換。Markdown をここに貼るだけ — 無料・登録不要・保存なし。",
    keywords: ["gemini word 変換", "gemini docx", "gemini 回答 保存", "gemini pdf 変換", "gemini 表 word", "gemini エクスポート docx"],
    h1: "Gemini を Word (DOCX) に",
    lead: "Gemini の「ドキュメントにエクスポート」は Google ドキュメント派には便利です。.docx ファイル、PDF、あるいは表の Excel 出力が必要なら、回答をここに貼ってワンクリックでエクスポートしてください。",
    quirks: [
      "一部の Gemini 画面からコピーすると、表がパイプ記号の 1 行になる。",
      "数式は LaTeX ソース、コードブロックには言語タグ付き。",
      "Markdown の見出しの代わりに太字のセクション名 — 太字の段落として保持されます。",
    ],
    faqExtra: [
      { q: "Gemini の「ドキュメントにエクスポート」を使えば良いのでは？", a: "行き先が Google ドキュメントならそれで十分です。このページは、ダウンロードできる .docx、PDF、EPUB、あるいは表の Excel 出力が欲しいとき — しかも Google アカウントを介さずに — のためのものです。" },
    ],
  }),
]);
