import type { IntentPageContent } from "./types";

/**
 * 繁體中文長尾意圖頁（build plan Phase 1）。以 slug 索引。
 * 各格式結果如實說明：PDF/HTML/圖片/EPUB 以 KaTeX 排版公式；
 * Word 中公式為清晰圖片，LaTeX 原始碼在替代文字裡（可編輯公式在路線圖上，Phase 0b）。
 */

const FAQ_HEADING = "常見問題";

const demo = (sampleLabel: string, note: string) => ({
  heading: "⬇ 把 .md 檔拖到這裡，或先試試範例",
  hint: "幾秒完成 · 不儲存 · 免註冊",
  readyHint: "在下方選擇格式",
  sampleLabel,
  note,
});

const WORD_HONESTY = "在 Word 中，每個公式都會變成清晰的圖片，效果與預覽一致，LaTeX 原始碼保留在圖片的替代文字裡；可編輯的 Word 公式已在開發路線圖上。";

const PRIVACY = "免費、免註冊、文件不加浮水印。單檔 1MB 以內；PDF 與 Word 在伺服器記憶體中轉換後立即丟棄，其他格式完全在瀏覽器內完成。";

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
      ctaTop: `立即修復 ${chatbot} 公式`,
      ctaBottom: "貼上回答即可 — 免費、免註冊",
      sections: [
        {
          heading: `為什麼 ${chatbot} 的公式貼到 Word 就變亂碼`,
          paragraphs: [
            `${chatbot} 以 LaTeX 撰寫數學公式。複製回答時，公式以 \\( … \\) 和 \\[ … \\] 包住的原始碼進入剪貼簿，Word 原封不動貼上——反斜線、大括號一個不少。Word 的方程式編輯器完全沒有介入，所以你看到的是一行程式碼，而不是分數。`,
            "截圖能避開亂碼，但無法搜尋、無法編輯，列印還會模糊。正確做法是先把 LaTeX 渲染出來，再把排好版的文件交給 Word 或 PDF。",
            ...(opts.whyExtra ? [opts.whyExtra] : []),
          ],
        },
        {
          heading: "30 秒修好",
          steps: [
            { title: "複製回答", text: `用 ${chatbot} 的複製按鈕，Markdown 與 LaTeX 會完整保留。` },
            { title: "貼到這裡", text: "貼上框會自動去掉「複製程式碼」、角色標籤等介面殘留，並辨識 \\( … \\)、\\[ … \\] 分隔符。" },
            { title: "匯出", text: "按「轉 PDF」得到排版好的公式；按「轉 Word (DOCX)」得到可編輯文件。" },
          ],
        },
        {
          heading: "各格式分別得到什麼",
          bullets: [
            "PDF、HTML、圖片、EPUB：每個公式都以 KaTeX 排版——分數、總和、矩陣、希臘字母、上下標。",
            `Word (DOCX)：標題、表格、程式碼、清單都成為真正的 Word 樣式。${WORD_HONESTY}`,
            "表格、程式碼區塊、標題與清單在所有格式中都保留。",
            "不儲存任何內容：PDF 與 Word 在記憶體中轉換後丟棄，其他格式不離開你的瀏覽器。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        {
          q: `為什麼 ${chatbot} 的公式在 Word 裡顯示成 \\frac、\\sum？`,
          a: `因為那是 LaTeX 原始碼。${chatbot} 在聊天視窗把它渲染成公式，但剪貼簿裡只有原始文字。先在這裡渲染，PDF 和 Word 裡得到的都是排版好的公式。`,
        },
        {
          q: "需要手動把 \\( 改成 $ 嗎？",
          a: "不需要。$ … $ / $$ … $$ 與 \\( … \\) / \\[ … \\] 都能辨識。內文裡像「$5 和 $10」這樣的金額不會被當成公式。",
        },
        {
          q: "Word 裡的公式可以編輯嗎？",
          a: "暫時還不能當作公式編輯。Word 中每個公式是一張清晰的圖片，顯示與列印都正常，LaTeX 原始碼保存在圖片的替代文字裡；可編輯公式（OMML）在路線圖上。PDF、HTML、圖片與 EPUB 同樣是完整排版。",
        },
        { q: "免費嗎？需要註冊嗎？", a: PRIVACY },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("試試含公式的範例", "範例含行內公式、獨立公式、矩陣與 \\( … \\) 分隔符——看看下方的渲染效果。"),
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
      ctaTop: `立即轉換 ${chatbot} 回答`,
      ctaBottom: "貼上回答即可 — 免費、免註冊",
      sections: [
        {
          heading: `${chatbot} 回答貼到 Word 會壞在哪裡`,
          paragraphs: [
            `${chatbot} 的回答是 Markdown：標題、清單、表格、程式碼區塊與 LaTeX 公式。直接貼到 Word 全是純文字——表格變成直線、標題變成井號、公式變成反斜線，還夾著「複製程式碼」與角色標籤這類介面殘留。`,
          ],
          bullets: opts.quirks,
        },
        {
          heading: "30 秒流程",
          steps: [
            { title: "複製回答", text: `${chatbot} 的複製按鈕會保留 Markdown；直接選取複製通常也可以。` },
            { title: "貼到這裡", text: "貼上時自動清理聊天殘留，並即時預覽。" },
            { title: "匯出", text: "「轉 Word (DOCX)」給同事編輯；「轉 PDF」、圖片或 EPUB 用於分享。" },
          ],
        },
        {
          heading: "Word 裡會得到什麼",
          bullets: [
            "標題、清單、粗體、斜體成為真正的 Word 樣式。",
            "表格成為 Word 表格，程式碼區塊保留等寬樣式。",
            `公式：${WORD_HONESTY}`,
            "表格想進 Excel？「轉 Excel (XLSX)」會把每個表格寫成一個工作表。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: `能一次轉換整段 ${chatbot} 對話嗎？`, a: "把需要的每則回答依序貼到同一個框裡，再一次匯出即可。含自動編號的多回答合併功能在路線圖上。" },
        { q: `${chatbot} 的表格與程式碼會保留嗎？`, a: "會。Markdown 表格成為 Word 表格（或 Excel 工作表），程式碼區塊保留等寬格式，標題對應到 Word 標題樣式。" },
        {
          q: "可以匯出哪些格式？",
          a: "PDF、Word (DOCX)、圖片 (PNG/JPG)、EPUB、Excel (XLSX，每個表格一個工作表)、HTML 和純文字——同一段貼上的回答即可全部匯出，免帳號。",
        },
        { q: "我的文字會被儲存嗎？", a: "不會。Word 與 PDF 在伺服器記憶體中產生，下載後立即丟棄；HTML、圖片、EPUB 與 Excel 不離開你的瀏覽器。免帳號、無追蹤 Cookie。" },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("試試範例回答", "一段典型的 AI 回答：公式、表格與程式碼區塊——看看各部分如何渲染。"),
    },
  ];
}

export const zhHant: Record<string, IntentPageContent> = Object.fromEntries([
  mathToWordPage({
    chatbot: "ChatGPT",
    slug: "chatgpt-gongshi-word-tw",
    title: "ChatGPT 公式貼到 Word 亂碼怎麼辦",
    description: "ChatGPT 的數學公式貼到 Word 變成 \\frac、\\sum？把回答貼到這裡：PDF 與 Word 中的公式都完整排版。免費、免註冊。",
    keywords: ["chatgpt 公式 貼到 word 亂碼", "chatgpt 公式 匯出 word", "chatgpt 數學公式 word", "chatgpt latex word", "chatgpt 公式 轉 pdf", "chatgpt 公式 複製 亂碼"],
    h1: "ChatGPT 公式貼到 Word 亂碼？這樣修",
    lead: "複製了一段滿是公式的 ChatGPT 回答，Word 卻顯示 \\frac{a}{b} 而不是分數？貼到這裡：公式為 PDF 完整排版，Word 得到保留所有公式的乾淨文件。",
    faqExtra: [
      { q: "ChatGPT 的引用標記與「Copy code」行怎麼辦？", a: "貼上時自動去掉：複製按鈕標籤、「You said / ChatGPT said」、「Thought for 8s」以及【12†source】這類引用符號。" },
    ],
  }),
  mathToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-gongshi-word-tw",
    title: "DeepSeek 公式貼到 Word 亂碼怎麼辦",
    description: "DeepSeek 回答貼到 Word 全是 LaTeX 原始碼和 <think> 思考區塊？貼到這裡：自動去掉推理殘留，PDF 與 Word 中的公式都完整排版。免費。",
    keywords: ["deepseek 公式 貼到 word 亂碼", "deepseek 公式 匯出 word", "deepseek 數學公式 word", "deepseek 轉 pdf 公式", "deepseek think 移除", "deepseek 公式 複製"],
    h1: "DeepSeek 公式貼到 Word 亂碼？這樣修",
    lead: "DeepSeek 在聊天視窗裡公式很漂亮，剪貼簿裡卻是原始的 \\[ … \\] LaTeX，頂端還常帶一段 <think> 思考區塊。貼到這裡，PDF 和乾淨的 Word 文件裡都是排版好的公式。",
    whyExtra: "DeepSeek 複製的內容還可能包含隱藏的推理區塊（<think> … </think>）和「已深度思考（用時 12 秒）」一行。貼上時都會自動去掉，不會進入你的文件。",
    faqExtra: [
      { q: "DeepSeek 的 <think> 思考區塊能處理嗎？", a: "可以。<think> … </think> 區塊以及「已深度思考」/「Thought for Ns」這類行在貼上時被去掉，回答本身原樣保留。" },
    ],
  }),
  [
    "chatgpt-biaoge-excel-tw",
    {
      title: "ChatGPT 表格匯出 Excel：貼上即得 XLSX",
      description: "把 ChatGPT（或任何 AI）的 Markdown 表格變成真正的 Excel 活頁簿：每個表格一個工作表，數字辨識為數值，表頭粗體。瀏覽器內完成，免費、免註冊。",
      keywords: ["chatgpt 表格 匯出 excel", "chatgpt 表格 複製到 excel", "chatgpt 轉 excel", "markdown 表格 轉 excel", "ai 表格 轉 xlsx", "chatgpt 表格 跑掉"],
      h1: "ChatGPT 表格一鍵匯出 Excel",
      lead: "ChatGPT 的表格是 Markdown：直線加橫線。把回答貼到這裡，下載一個 .xlsx——每個表格一個工作表、數值儲存格、粗體表頭，不用手動整理。",
      ctaTop: "立即轉換表格",
      ctaBottom: "貼上表格即可 — 免費、免註冊",
      sections: [
        {
          heading: "為什麼 ChatGPT 表格貼到 Excel 會跑掉",
          paragraphs: [
            "Markdown 表格是文字：| 名稱 | 分數 |，下面一行橫線。貼到 Excel 會擠在一欄裡，或者每個直線都成了儲存格內容的一部分。「資料剖析」只能解決一半，還會留下對齊行。",
            "先把 Markdown 渲染成真正的列與欄，再由這裡的 Excel 寫入器把回答裡的每個表格寫成獨立的工作表。",
          ],
        },
        {
          heading: "30 秒修好",
          steps: [
            { title: "複製回答", text: "用 ChatGPT 的複製按鈕，表格保持 Markdown 格式。" },
            { title: "貼到這裡", text: "即時預覽顯示表格；「複製程式碼」與角色標籤自動去掉。" },
            { title: "更多格式 → 轉 Excel (XLSX)", text: "每個表格一個工作表，檔案立即下載。" },
          ],
        },
        {
          heading: "活頁簿裡有什麼",
          bullets: [
            "每個 Markdown 表格一個工作表，以最近的標題命名。",
            "數字存為數值（「1,234.56」變成 1234.56），其餘為文字。",
            "表頭粗體，欄寬依內容自動調整。",
            "可用 Excel、Numbers、LibreOffice 與 Google 試算表開啟。完全在瀏覽器內產生——表格不離開你的裝置。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Claude、Gemini、DeepSeek、Kimi 的表格也可以嗎？", a: "可以。只要是 Markdown 表格，無論哪個助手寫的都行。一則回答裡的多個表格會變成多個工作表。" },
        { q: "儲存格裡的公式或粗體怎麼處理？", a: "儲存格以純文字匯出。儲存格內的格式不會帶入 Excel；LaTeX 公式以原始碼文字出現。" },
        { q: "也能把表格轉進 Word 嗎？", a: "可以——「轉 Word (DOCX)」會把同一份文件匯出，表格是真正的 Word 表格。" },
        { q: "免費嗎？", a: "免費、免帳號，Excel 檔在瀏覽器內產生——不上傳任何內容。" },
      ],
      demo: demo("試試含表格的範例", "兩個不同對齊方式的 Markdown 表格——載入後選「更多格式 → 轉 Excel」。"),
    },
  ],
  [
    "ai-biaoge-word-tw",
    {
      title: "AI 表格匯出 Word：ChatGPT、Gemini、Claude",
      description: "ChatGPT、Gemini、Claude 的表格貼到 Word 全是直線和橫線？把回答貼到這裡，匯出帶真正表格的 Word 文件，或 Excel 活頁簿。免費、免註冊。",
      keywords: ["chatgpt 表格 貼到 word", "gemini 表格 匯出 word", "ai 表格 轉 word", "markdown 表格 轉 word", "claude 表格 word", "表格 複製到 word 跑掉"],
      h1: "AI 表格匯出 Word——真表格，不是直線",
      lead: "ChatGPT、Gemini、Claude 都用 Markdown 表格回答。到了 Word 就成了一行行 | 直線 |。把回答貼到這裡，匯出的文件裡表格是真正的 Word 表格，對齊方式也保留。",
      ctaTop: "立即轉換表格",
      ctaBottom: "貼上回答即可 — 免費、免註冊",
      sections: [
        {
          heading: "為什麼 AI 表格到了 Word 就散掉",
          paragraphs: [
            "Markdown 表格是帶直線分隔與對齊行（:--- 靠左、:--: 置中、---: 靠右）的純文字。Word 不知道這是表格，所以原樣貼上字元。",
            "先渲染 Markdown，就能得到帶欄位對齊、表頭與框線的正規表格——同一份文件還可以轉 PDF、Excel 或圖片。",
          ],
        },
        {
          heading: "30 秒修好",
          steps: [
            { title: "複製回答", text: "助手的複製按鈕會完整保留 Markdown。" },
            { title: "貼到這裡", text: "在即時預覽裡檢查表格，對齊方式按原樣顯示。" },
            { title: "匯出", text: "「轉 Word (DOCX)」得到真正的 Word 表格；「更多格式 → 轉 Excel (XLSX)」得到試算表。" },
          ],
        },
        {
          heading: "你會得到",
          bullets: [
            "Word：帶表頭、框線與靠左/置中/靠右對齊的原生表格。",
            "Excel：每個表格一個工作表，數值儲存格、粗體表頭。",
            "PDF 與圖片：表格按預覽原樣排版，中文不亂碼。",
            "免費、免帳號；Word 與 PDF 在記憶體中轉換後丟棄，Excel 與圖片在瀏覽器內產生。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "為什麼 Gemini 的表格複製出來是一整行？", a: "部分介面複製時會丟掉換行。貼到這裡的輸入框：只要直線還在，Markdown 解析器就能還原列。" },
        { q: "合併儲存格支援嗎？", a: "標準 Markdown 表格沒有合併儲存格。帶 rowspan/colspan 的 HTML 表格暫不支援；請一筆資料一列。" },
        { q: "表格前後的文字也會一起轉嗎？", a: "會——整段回答都會轉換：標題、段落、程式碼與表格。" },
        { q: "免費嗎？", a: "免費、免帳號，文件不加浮水印。單檔 1MB 以內。" },
      ],
      demo: demo("試試含表格的範例", "兩個對齊的 Markdown 表格——載入後「轉 Word (DOCX)」看看真正的表格。"),
    },
  ],
  [
    "markdown-gongshi-pdf-tw",
    {
      title: "Markdown 公式轉 PDF（KaTeX 渲染 LaTeX）",
      description: "把含 $…$、$$…$$ LaTeX 公式的 Markdown 在瀏覽器裡轉成排版好的 PDF。KaTeX 渲染、中文字型內嵌、免安裝、免註冊。還可轉 Word、HTML、圖片與 EPUB。",
      keywords: ["markdown 公式 轉 pdf", "markdown latex 轉 pdf", "markdown 數學公式 pdf", "katex markdown pdf", "md 公式 轉 pdf 線上", "markdown 公式 渲染"],
      h1: "Markdown 公式轉 PDF",
      lead: "帶 $E = mc^2$、$$\\int_0^\\infty$$ 與矩陣的筆記直接變成排版好的 PDF——不用 Pandoc，不用裝 1.5 GB 的 TeX。拖入檔案，按「轉 PDF」。",
      ctaTop: "立即轉換 Markdown",
      ctaBottom: "拖入 .md 檔 — 免費、免註冊",
      sections: [
        {
          heading: "支援範圍",
          bullets: [
            "行內公式 $ … $ 與 \\( … \\)；獨立公式 $$ … $$ 與 \\[ … \\]。",
            "分數、根號、總和、積分、極限、矩陣（pmatrix、bmatrix）、aligned 環境、希臘字母、運算子，以及 KaTeX 支援的絕大多數指令。",
            "表格、清單、引用中的公式。",
            "公式旁的中文：PDF 內嵌 Noto Sans TC/SC/JP/KR 字型。",
          ],
        },
        {
          heading: "怎麼用",
          steps: [
            { title: "拖入或貼上", text: ".md 檔（1MB 以內）——預覽立即渲染公式。" },
            { title: "檢查", text: "不支援的指令會以紅色顯示原始碼，不會悄悄出錯。" },
            { title: "按「轉 PDF」", text: "A4（或依地區 Letter），KaTeX 字型內嵌。" },
          ],
        },
        {
          heading: "其他格式",
          bullets: [
            "HTML：單一檔案，內嵌 KaTeX 樣式表。",
            "圖片（PNG/JPG）與 EPUB：公式已渲染，在瀏覽器內產生。",
            `Word (DOCX)：${WORD_HONESTY}`,
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "哪些 LaTeX 指令不支援？", a: "KaTeX 函式清單之外的——例如定義複雜的 \\newcommand 巨集、TikZ 或完整的 LaTeX 文件環境。不支援的指令會以紅色顯示原始碼。" },
        { q: "內文裡的 $5 和 $10 會被當成公式嗎？", a: "不會。像普通句子（多個詞、沒有數學符號）的 $ … $ 會按文字保留。" },
        { q: "和 Pandoc 比如何？", a: "Pandoc 配 LaTeX 引擎的 PDF 很好，但要裝好幾 GB 的 TeX 並設定中文字型。這裡在瀏覽器裡執行，中文字型已內嵌；對絕大多數筆記與論文，輸出效果相當。" },
        { q: "免費嗎？", a: PRIVACY },
      ],
      demo: demo("試試含公式的範例", "行內公式、獨立公式、矩陣與 \\( … \\) 分隔符——預覽裡全部排版。"),
    },
  ],
  [
    "markdown-mermaid-pdf-tw",
    {
      title: "Markdown Mermaid 圖表轉 PDF / Word",
      description: "把含 ```mermaid 流程圖、循序圖、類別圖的 Markdown 轉成 PDF、Word、圖片或 EPUB，圖表照常渲染。瀏覽器內完成，免費、免註冊。",
      keywords: ["markdown mermaid 轉 pdf", "mermaid 圖表 匯出 pdf", "markdown 流程圖 pdf", "mermaid 轉 word", "markdown mermaid 線上", "mermaid 匯出 docx"],
      h1: "Markdown Mermaid 圖表轉 PDF",
      lead: "```mermaid 程式碼區塊渲染成圖——流程圖、循序圖、類別圖、狀態圖、甘特圖——並以清晰影像進入 PDF、Word、圖片與 EPUB，而不是一段程式碼。",
      ctaTop: "立即轉換 Markdown",
      ctaBottom: "拖入 .md 檔 — 免費、免註冊",
      sections: [
        {
          heading: "圖表如何進入每種格式",
          paragraphs: [
            "Mermaid 需要瀏覽器才能渲染，所以圖表就在你的瀏覽器裡畫好，在產生任何格式之前以圖片形式嵌入文件。PDF 與 Word 得到清晰的 PNG；HTML、EPUB 與圖片匯出得到向量 SVG。",
            "只有文件裡真的有 ```mermaid 程式碼區塊時才會載入 Mermaid 引擎，一般文件不受影響。",
          ],
        },
        {
          heading: "怎麼用",
          steps: [
            { title: "拖入或貼上", text: "帶 ```mermaid 區塊的 Markdown——預覽裡顯示渲染好的圖。" },
            { title: "檢查", text: "語法有誤的圖會保持為程式碼區塊，方便你修改。" },
            { title: "匯出", text: "轉 PDF、轉 Word (DOCX)、轉圖片 (PNG) 或 EPUB——圖表都在。" },
          ],
        },
        {
          heading: "支援的圖表類型",
          bullets: [
            "流程圖 / graph、循序圖、類別圖、狀態圖、ER 圖、甘特圖、圓餅圖、心智圖、時間軸等 Mermaid 11 支援的類型。",
            "中文、日文、韓文標籤用你裝置的字型渲染。",
            "大圖以 2 倍解析度嵌入，適合列印。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "為什麼我的圖還是程式碼區塊？", a: "Mermaid 沒能解析。檢查語法（可用 mermaid.live 驗證）；解析錯誤會保留原程式碼區塊，不會導致匯出失敗。" },
        { q: "能單獨得到圖表圖片嗎？", a: "把文件「轉圖片 (PNG)」，或直接從預覽裡複製圖表。" },
        { q: "Word 裡看得到圖嗎？", a: "看得到，以列印解析度的 PNG 圖片嵌入。" },
        { q: "免費嗎？", a: "免費、免帳號。圖表在瀏覽器內渲染；PDF 與 Word 在記憶體中轉換後丟棄。" },
      ],
      demo: demo("試試含圖表的範例", "一個 ```mermaid 流程圖——在下方預覽裡渲染。"),
    },
  ],
  [
    "markdown-zhuan-excel-tw",
    {
      title: "Markdown 表格轉 Excel (XLSX) 線上工具",
      description: "在瀏覽器裡把 Markdown 表格轉成 Excel 活頁簿：每個表格一個工作表，數字辨識為數值，表頭粗體。免費、免註冊、不上傳。",
      keywords: ["markdown 轉 excel", "markdown 表格 轉 excel", "md 表格 轉 xlsx", "markdown 轉 xlsx", "markdown 表格 匯出 excel", "markdown 轉 試算表"],
      h1: "Markdown 表格轉 Excel",
      lead: "貼上或拖入 Markdown 檔，下載 .xlsx：每個表格變成一個工作表，數值儲存格是真正的數字，表頭粗體。完全在瀏覽器內完成。",
      ctaTop: "立即轉換表格",
      ctaBottom: "拖入 .md 檔 — 免費、免註冊",
      sections: [
        {
          heading: "轉換過程",
          steps: [
            { title: "拖入或貼上", text: "Markdown；預覽顯示所有表格。" },
            { title: "更多格式 → 轉 Excel (XLSX)", text: "活頁簿在本機產生，每個表格一個工作表。" },
            { title: "開啟", text: "Excel、Numbers、LibreOffice 或 Google 試算表皆可。" },
          ],
        },
        {
          heading: "會保留什麼",
          bullets: [
            "表頭列（粗體）與每一資料列；空儲存格保持為空。",
            "數字（含千分位）變成數值儲存格，其餘為文字。",
            "工作表以表格上方最近的標題命名。",
            "欄寬依最長儲存格自動調整。",
          ],
        },
        {
          heading: "不會保留什麼",
          bullets: [
            "儲存格內的行內格式（粗體、連結、程式碼）會變成純文字。",
            "HTML 表格與合併儲存格不支援——請使用標準 Markdown 表格。",
            "不計算公式：內容為 =SUM(...) 的儲存格按文字儲存。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "能一次轉多個表格嗎？", a: "能。文件裡的每個表格都會成為同一個活頁簿裡的一個工作表。" },
        { q: "我的表格會被上傳嗎？", a: "不會。Excel 檔在瀏覽器內產生，不傳送到任何伺服器。" },
        { q: "從 ChatGPT 或 Notion 複製的表格也行嗎？", a: "行，只要是 Markdown 表格（直線與橫線列）。" },
        { q: "免費嗎？", a: "免費、免帳號，除 1MB 檔案大小外沒有限制。" },
      ],
      demo: demo("試試含表格的範例", "兩個 Markdown 表格——載入後「更多格式 → 轉 Excel (XLSX)」。"),
    },
  ],
  sourceToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-zhuan-word-tw",
    title: "DeepSeek 轉 Word：回答匯出 DOCX",
    description: "把 DeepSeek 回答轉成 Word (DOCX) 或 PDF：貼上 Markdown，自動去掉聊天殘留與 <think> 區塊，公式與表格保留。免費、免註冊。",
    keywords: ["deepseek 轉 word", "deepseek 匯出 word", "deepseek 回答 儲存 word", "deepseek 轉 pdf", "deepseek 匯出 docx", "deepseek markdown 轉 word"],
    h1: "DeepSeek 轉 Word (DOCX)",
    lead: "把 DeepSeek 的回答變成同事可編輯的 Word 文件——標題、表格、程式碼與公式都在，推理區塊與複製按鈕殘留全部去掉。",
    quirks: [
      "複製的回答頂端常帶 <think> … </think> 推理區塊與「已深度思考（用時 N 秒）」一行。",
      "公式是 \\( … \\) 與 \\[ … \\] 的 LaTeX 原始碼。",
      "每個程式碼區塊後面跟著「複製程式碼」。",
    ],
  }),
  [
    "claude-artifacts-pdf-tw",
    {
      title: "Claude Artifacts 轉 PDF：匯出 Claude 內容",
      description: "把 Claude 的 Artifacts、程式碼區塊與回答匯出為 PDF 或 Word。從 Claude 複製 Markdown，貼到這裡，立即下載。免費、免註冊。",
      keywords: ["claude artifacts 轉 pdf", "claude 匯出 pdf", "claude 回答 儲存 pdf", "claude artifact 匯出", "claude 轉 word", "claude markdown 轉 pdf"],
      h1: "Claude Artifacts 轉 PDF",
      lead: "Claude 的 Artifacts 面板沒有「匯出 PDF」按鈕。複製內容，貼到這裡，就能得到帶格式的 PDF、Word 或圖片——程式碼區塊、表格與公式都保留。",
      ctaTop: "立即轉換 Claude 內容",
      ctaBottom: "貼上內容即可 — 免費、免註冊",
      sections: [
        {
          heading: "怎麼把 Claude Artifact 存成 PDF",
          steps: [
            { title: "複製 Artifact", text: "在 Claude 的 Artifact 面板按複製（Markdown 類 Artifact 會保留格式；程式碼 Artifact 會得到程式碼文字）。" },
            { title: "貼到這裡", text: "即時預覽顯示排版效果；聊天殘留自動去掉。" },
            { title: "匯出", text: "「轉 PDF」用於分享與列印；「轉 Word (DOCX)」用於繼續編輯；「轉圖片」用於社群分享。" },
          ],
        },
        {
          heading: "會保留什麼",
          bullets: [
            "標題結構、清單、粗體與斜體。",
            "程式碼區塊（等寬樣式）、表格、引用。",
            "LaTeX 公式：PDF、HTML、圖片、EPUB 中完整排版；Word 中以清晰圖片呈現（LaTeX 原始碼保留在替代文字裡）。",
            "Mermaid 圖表：渲染成圖片進入所有格式。",
          ],
        },
        {
          heading: "為什麼不直接截圖",
          bullets: [
            "PDF 裡是真正的文字，可搜尋、可複製。",
            "程式碼區塊在 PDF 裡仍可複製。",
            "長內容自動分頁，列印友善，檔案更小。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "HTML / React 類的 Artifact 也能轉嗎？", a: "能轉出程式碼本身：複製得到的是原始碼文字，會以程式碼區塊形式進入 PDF。要匯出渲染後的網頁效果，請在 Claude 中用瀏覽器列印。" },
        { q: "能轉成 Word 嗎？", a: "能。貼上後按「轉 Word (DOCX)」，也可以轉 EPUB、HTML 或純文字。" },
        { q: "我的內容會被儲存嗎？", a: "不會。PDF 與 Word 在伺服器記憶體中產生後立即丟棄；圖片、HTML、EPUB 不離開你的瀏覽器。" },
        { q: "免費嗎？", a: PRIVACY },
      ],
      demo: demo("試試範例內容", "一段含公式、表格與程式碼的回答——看看各部分如何渲染。"),
    },
  ],
  sourceToWordPage({
    chatbot: "Gemini",
    slug: "gemini-zhuan-word-tw",
    title: "Gemini 轉 Word：回答匯出 DOCX",
    description: "把 Google Gemini 的回答轉成 Word (DOCX) 或 PDF，表格、標題、公式完整保留。把 Markdown 貼到這裡——免費、免註冊、不儲存。",
    keywords: ["gemini 轉 word", "gemini 匯出 word", "gemini 回答 儲存", "gemini 轉 pdf", "gemini 表格 匯出 word", "gemini 匯出 docx"],
    h1: "Gemini 轉 Word (DOCX)",
    lead: "Gemini 的「匯出到 Google 文件」適合用 Google Docs 的人。如果你要的是 .docx 檔、PDF，或把表格匯成 Excel，把回答貼到這裡一鍵匯出。",
    quirks: [
      "從部分 Gemini 介面複製時，表格會變成一整行直線。",
      "公式是 LaTeX 原始碼，程式碼區塊帶語言標記。",
      "用粗體代替 Markdown 標題——會以粗體段落保留。",
    ],
    faqExtra: [
      { q: "為什麼不直接用 Gemini 的「匯出到 Google 文件」？", a: "目標是 Google Docs 就用它。這個頁面解決的是：要一個可下載的 .docx、PDF、EPUB，或把表格匯成 Excel——而且不需要 Google 帳號。" },
    ],
  }),
]);
