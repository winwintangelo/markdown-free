import type { IntentPageContent } from "./types";

/**
 * 简体中文长尾意图页（build plan Phase 1）。按 slug 索引。
 * 每页如实说明各格式的结果：PDF/HTML/图片/EPUB 中公式用 KaTeX 排版；
 * Word 中公式为清晰图片，LaTeX 源码在替代文字里（可编辑公式在路线图上，Phase 0b）。
 */

const FAQ_HEADING = "常见问题";

const demo = (sampleLabel: string, note: string) => ({
  heading: "⬇ 把 .md 文件拖到这里，或先试试示例",
  hint: "几秒完成 · 不存储 · 无需注册",
  readyHint: "在下方选择格式",
  sampleLabel,
  note,
});

const WORD_HONESTY = "在 Word 中，每个公式都会变成清晰的图片，效果与预览一致，LaTeX 源码保留在图片的替代文字里；可编辑的 Word 公式已在开发路线图上。";

const PRIVACY = "免费、无需注册、文档不加水印。单文件 1MB 以内；PDF 与 Word 在服务器内存中转换后立即丢弃，其他格式完全在浏览器内完成。";

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
      ctaTop: `立即修复 ${chatbot} 公式`,
      ctaBottom: "粘贴回答即可 — 免费、无需注册",
      sections: [
        {
          heading: `为什么 ${chatbot} 的公式粘贴到 Word 就乱码`,
          paragraphs: [
            `${chatbot} 用 LaTeX 书写数学公式。复制回答时，公式以 \\( … \\) 和 \\[ … \\] 包裹的源码形式进入剪贴板，Word 原样粘贴——反斜杠、花括号一个不少。Word 的公式编辑器根本没有介入，所以你看到的是一行代码，而不是分数。`,
            "截图能避开乱码，但无法搜索、无法编辑，打印还会发虚。正确做法是先把 LaTeX 渲染出来，再把排好版的文档交给 Word 或 PDF。",
            ...(opts.whyExtra ? [opts.whyExtra] : []),
          ],
        },
        {
          heading: "30 秒修好",
          steps: [
            { title: "复制回答", text: `用 ${chatbot} 的复制按钮，Markdown 和 LaTeX 会完整保留。` },
            { title: "粘贴到这里", text: "粘贴框会自动去掉「复制代码」、角色标签等界面残留，并识别 \\( … \\)、\\[ … \\] 分隔符。" },
            { title: "导出", text: "点「转 PDF」得到排版好的公式；点「转 Word (DOCX)」得到可编辑文档。" },
          ],
        },
        {
          heading: "各格式分别得到什么",
          bullets: [
            "PDF、HTML、图片、EPUB：每个公式都用 KaTeX 排版——分数、求和、矩阵、希腊字母、上下标。",
            `Word (DOCX)：标题、表格、代码、列表都变成真正的 Word 样式。${WORD_HONESTY}`,
            "表格、代码块、标题和列表在所有格式中都保留。",
            "不存储任何内容：PDF 和 Word 在内存中转换后丢弃，其他格式不离开你的浏览器。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        {
          q: `为什么 ${chatbot} 的公式在 Word 里显示成 \\frac、\\sum？`,
          a: `因为那是 LaTeX 源码。${chatbot} 在聊天窗口里把它渲染成公式，但剪贴板里只有原始文本。先在这里渲染，PDF 和 Word 里得到的都是排版好的公式。`,
        },
        {
          q: "需要手动把 \\( 改成 $ 吗？",
          a: "不需要。$ … $ / $$ … $$ 和 \\( … \\) / \\[ … \\] 都能识别。正文里像「$5 和 $10」这样的金额不会被当成公式。",
        },
        {
          q: "Word 里的公式可以编辑吗？",
          a: "暂时还不能作为公式编辑。Word 中每个公式是一张清晰的图片，显示和打印都正常，LaTeX 源码保存在图片的替代文字里；可编辑公式（OMML）在路线图上。PDF、HTML、图片和 EPUB 同样是完整排版。",
        },
        { q: "免费吗？需要注册吗？", a: PRIVACY },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("试试含公式的示例", "示例含行内公式、独立公式、矩阵和 \\( … \\) 分隔符——看看下方的渲染效果。"),
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
      ctaTop: `立即转换 ${chatbot} 回答`,
      ctaBottom: "粘贴回答即可 — 免费、无需注册",
      sections: [
        {
          heading: `${chatbot} 回答粘贴到 Word 会坏在哪里`,
          paragraphs: [
            `${chatbot} 的回答是 Markdown：标题、列表、表格、代码块和 LaTeX 公式。直接粘贴到 Word 全是纯文本——表格变成竖线、标题变成井号、公式变成反斜杠，还夹着「复制代码」和角色标签这类界面残留。`,
          ],
          bullets: opts.quirks,
        },
        {
          heading: "30 秒流程",
          steps: [
            { title: "复制回答", text: `${chatbot} 的复制按钮会保留 Markdown；直接选中复制通常也可以。` },
            { title: "粘贴到这里", text: "粘贴时自动清理聊天残留，并实时预览。" },
            { title: "导出", text: "「转 Word (DOCX)」给同事编辑；「转 PDF」、图片或 EPUB 用于分享。" },
          ],
        },
        {
          heading: "Word 里会得到什么",
          bullets: [
            "标题、列表、加粗、斜体变成真正的 Word 样式。",
            "表格变成 Word 表格，代码块保留等宽样式。",
            `公式：${WORD_HONESTY}`,
            "表格想要进 Excel？「转 Excel (XLSX)」会把每个表格写成一个工作表。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        {
          q: `能一次转换整段 ${chatbot} 对话吗？`,
          a: "把需要的每条回答依次粘贴到同一个框里，再一次导出即可。带自动编号的多回答合并功能在路线图上。",
        },
        {
          q: `${chatbot} 的表格和代码会保留吗？`,
          a: "会。Markdown 表格变成 Word 表格（或 Excel 工作表），代码块保留等宽格式，标题映射为 Word 标题样式。",
        },
        {
          q: "可以导出哪些格式？",
          a: "PDF、Word (DOCX)、图片 (PNG/JPG)、EPUB、Excel (XLSX，每个表格一个工作表)、HTML 和纯文本——同一段粘贴的回答即可全部导出，无需账号。",
        },
        { q: "我的文本会被存储吗？", a: "不会。Word 和 PDF 在服务器内存中生成，下载后立即丢弃；HTML、图片、EPUB 和 Excel 不离开你的浏览器。无需账号，无追踪 Cookie。" },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("试试示例回答", "一段典型的 AI 回答：公式、表格和代码块——看看各部分如何渲染。"),
    },
  ];
}

export const zhHans: Record<string, IntentPageContent> = Object.fromEntries([
  mathToWordPage({
    chatbot: "ChatGPT",
    slug: "chatgpt-gongshi-word",
    title: "ChatGPT 公式复制到 Word 乱码怎么办",
    description: "ChatGPT 的数学公式粘贴到 Word 变成 \\frac、\\sum？把回答粘贴到这里：PDF 和 Word 中的公式都完整排版。免费、无需注册。",
    keywords: ["chatgpt 公式 复制 word 乱码", "chatgpt 公式 导出 word", "chatgpt 数学公式 word", "chatgpt latex word", "chatgpt 公式 转 pdf", "chatgpt 公式 粘贴 乱码"],
    h1: "ChatGPT 公式复制到 Word 乱码？这样修",
    lead: "复制了一段满是公式的 ChatGPT 回答，Word 里却显示 \\frac{a}{b} 而不是分数？粘贴到这里：公式为 PDF 完整排版，Word 得到保留所有公式的干净文档。",
    faqExtra: [
      { q: "ChatGPT 的引用标记和「Copy code」行怎么办？", a: "粘贴时自动去掉：复制按钮标签、「You said / ChatGPT said」、「Thought for 8s」以及【12†source】这类引用符号。" },
    ],
  }),
  mathToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-gongshi-word",
    title: "DeepSeek 公式复制到 Word 乱码怎么办",
    description: "DeepSeek 回答粘贴到 Word 全是 LaTeX 源码和 <think> 思考块？粘贴到这里：自动去掉推理残留，PDF 和 Word 中的公式都完整排版。免费。",
    keywords: ["deepseek 公式 复制 word 乱码", "deepseek 公式 导出 word", "deepseek 数学公式 word", "deepseek 转 pdf 公式", "deepseek think 去掉", "deepseek 公式 粘贴"],
    h1: "DeepSeek 公式复制到 Word 乱码？这样修",
    lead: "DeepSeek 在聊天窗口里公式很漂亮，剪贴板里却是原始的 \\[ … \\] LaTeX，顶上还常带一段 <think> 思考块。粘贴到这里，PDF 和干净的 Word 文档里都是排版好的公式。",
    whyExtra: "DeepSeek 复制的内容还可能包含隐藏的推理块（<think> … </think>）和「已深度思考（用时 12 秒）」一行。粘贴时都会自动去掉，不会进入你的文档。",
    faqExtra: [
      { q: "DeepSeek 的 <think> 思考块能处理吗？", a: "可以。<think> … </think> 块以及「已深度思考」/「Thought for Ns」这类行在粘贴时被去掉，回答本身原样保留。" },
    ],
  }),
  [
    "chatgpt-biaoge-excel",
    {
      title: "ChatGPT 表格导出 Excel：粘贴即得 XLSX",
      description: "把 ChatGPT（或任何 AI）的 Markdown 表格变成真正的 Excel 工作簿：每个表格一个工作表，数字识别为数值，表头加粗。浏览器内完成，免费、无需注册。",
      keywords: ["chatgpt 表格 导出 excel", "chatgpt 表格 复制到 excel", "chatgpt 转 excel", "markdown 表格 转 excel", "ai 表格 转 xlsx", "chatgpt 表格 乱"],
      h1: "ChatGPT 表格一键导出 Excel",
      lead: "ChatGPT 的表格是 Markdown：竖线加横线。把回答粘贴到这里，下载一个 .xlsx——每个表格一个工作表、数值单元格、加粗表头，不用手动整理。",
      ctaTop: "立即转换表格",
      ctaBottom: "粘贴表格即可 — 免费、无需注册",
      sections: [
        {
          heading: "为什么 ChatGPT 表格粘贴到 Excel 会乱",
          paragraphs: [
            "Markdown 表格是文本：| 名称 | 分数 |，下面一行横线。粘贴到 Excel 会挤在一列里，或者每个竖线都成了单元格内容的一部分。「分列」只能解决一半，还会留下对齐行。",
            "先把 Markdown 渲染成真正的行列，再由这里的 Excel 写入器把回答里的每个表格写成独立的工作表。",
          ],
        },
        {
          heading: "30 秒修好",
          steps: [
            { title: "复制回答", text: "用 ChatGPT 的复制按钮，表格保持 Markdown 格式。" },
            { title: "粘贴到这里", text: "实时预览显示表格；「复制代码」和角色标签自动去掉。" },
            { title: "更多格式 → 转 Excel (XLSX)", text: "每个表格一个工作表，文件立即下载。" },
          ],
        },
        {
          heading: "工作簿里有什么",
          bullets: [
            "每个 Markdown 表格一个工作表，以最近的标题命名。",
            "数字存为数值（「1,234.56」变成 1234.56），其余为文本。",
            "表头加粗，列宽按内容自动调整。",
            "可用 Excel、Numbers、LibreOffice 和 Google 表格打开。完全在浏览器内生成——表格不离开你的设备。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Claude、Gemini、DeepSeek、Kimi 的表格也可以吗？", a: "可以。只要是 Markdown 表格，无论哪个助手写的都行。一个回答里的多个表格会变成多个工作表。" },
        { q: "单元格里的公式或加粗怎么处理？", a: "单元格按纯文本导出。单元格内的格式不会带入 Excel；LaTeX 公式以源码文本出现。" },
        { q: "也能把表格转进 Word 吗？", a: "可以——「转 Word (DOCX)」会把同一份文档导出，表格是真正的 Word 表格。" },
        { q: "免费吗？", a: "免费、无需账号，Excel 文件在浏览器内生成——不上传任何内容。" },
      ],
      demo: demo("试试含表格的示例", "两个不同对齐方式的 Markdown 表格——加载后选「更多格式 → 转 Excel」。"),
    },
  ],
  [
    "kimi-biaoge-word",
    {
      title: "Kimi / DeepSeek 表格导出 Word：真表格不是竖线",
      description: "Kimi、DeepSeek、豆包的表格粘贴到 Word 全是竖线和横线？把回答粘贴到这里，导出带真正表格的 Word 文档，或 Excel 工作簿。免费、无需注册。",
      keywords: ["kimi 表格 导出 word", "deepseek 表格 复制到 word", "豆包 表格 导出 word", "ai 表格 转 word", "markdown 表格 转 word", "kimi 表格 复制"],
      h1: "Kimi / DeepSeek 表格导出 Word——真表格，不是竖线",
      lead: "Kimi、DeepSeek、豆包都用 Markdown 表格回答。到了 Word 里就成了一行行 | 竖线 |。把回答粘贴到这里，导出的文档里表格是真正的 Word 表格，对齐方式也保留。",
      ctaTop: "立即转换表格",
      ctaBottom: "粘贴回答即可 — 免费、无需注册",
      sections: [
        {
          heading: "为什么 AI 表格到了 Word 就散架",
          paragraphs: [
            "Markdown 表格是带竖线分隔和对齐行（:--- 左对齐、:--: 居中、---: 右对齐）的纯文本。Word 不知道这是表格，所以原样粘贴字符。",
            "先渲染 Markdown，就能得到带列对齐、表头和边框的正规表格——同一份文档还可以转 PDF、Excel 或图片。",
          ],
        },
        {
          heading: "30 秒修好",
          steps: [
            { title: "复制回答", text: "助手的复制按钮会完整保留 Markdown。" },
            { title: "粘贴到这里", text: "在实时预览里检查表格，对齐方式按原样显示。" },
            { title: "导出", text: "「转 Word (DOCX)」得到真正的 Word 表格；「更多格式 → 转 Excel (XLSX)」得到电子表格。" },
          ],
        },
        {
          heading: "你会得到",
          bullets: [
            "Word：带表头、边框和左/中/右对齐的原生表格。",
            "Excel：每个表格一个工作表，数值单元格、加粗表头。",
            "PDF 和图片：表格按预览原样排版，中文无乱码。",
            "免费、无需账号；Word 和 PDF 在内存中转换后丢弃，Excel 和图片在浏览器内生成。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "为什么 Kimi 的表格复制出来是一整行？", a: "部分界面复制时会丢掉换行。粘贴到这里的输入框：只要竖线还在，Markdown 解析器就能恢复行。" },
        { q: "合并单元格支持吗？", a: "标准 Markdown 表格没有合并单元格。带 rowspan/colspan 的 HTML 表格暂不支持；请一条记录一行。" },
        { q: "表格前后的文字也会一起转吗？", a: "会——整段回答都会转换：标题、段落、代码和表格。" },
        { q: "免费吗？", a: "免费、无需账号，文档不加水印。单文件 1MB 以内。" },
      ],
      demo: demo("试试含表格的示例", "两个对齐的 Markdown 表格——加载后「转 Word (DOCX)」看看真正的表格。"),
    },
  ],
  [
    "markdown-gongshi-pdf",
    {
      title: "Markdown 公式转 PDF（KaTeX 渲染 LaTeX）",
      description: "把含 $…$、$$…$$ LaTeX 公式的 Markdown 在浏览器里转成排版好的 PDF。KaTeX 渲染、中文字体内嵌、免安装、无需注册。还可转 Word、HTML、图片和 EPUB。",
      keywords: ["markdown 公式 转 pdf", "markdown latex 转 pdf", "markdown 数学公式 pdf", "katex markdown pdf", "md 公式 转 pdf 在线", "markdown 公式 渲染"],
      h1: "Markdown 公式转 PDF",
      lead: "带 $E = mc^2$、$$\\int_0^\\infty$$ 和矩阵的笔记直接变成排版好的 PDF——不用 Pandoc，不用装 1.5 GB 的 TeX。拖入文件，点「转 PDF」。",
      ctaTop: "立即转换 Markdown",
      ctaBottom: "拖入 .md 文件 — 免费、无需注册",
      sections: [
        {
          heading: "支持范围",
          bullets: [
            "行内公式 $ … $ 与 \\( … \\)；独立公式 $$ … $$ 与 \\[ … \\]。",
            "分数、根号、求和、积分、极限、矩阵（pmatrix、bmatrix）、aligned 环境、希腊字母、运算符，以及 KaTeX 支持的绝大多数命令。",
            "表格、列表、引用中的公式。",
            "公式旁的中文：PDF 内嵌 Noto Sans SC/TC/JP/KR 字体。",
          ],
        },
        {
          heading: "怎么用",
          steps: [
            { title: "拖入或粘贴", text: ".md 文件（1MB 以内）——预览立即渲染公式。" },
            { title: "检查", text: "不支持的命令会以红色显示源码，不会悄悄出错。" },
            { title: "点「转 PDF」", text: "A4（或按地区 Letter），KaTeX 字体内嵌。" },
          ],
        },
        {
          heading: "其他格式",
          bullets: [
            "HTML：单文件，内嵌 KaTeX 样式表。",
            "图片（PNG/JPG）和 EPUB：公式已渲染，在浏览器内生成。",
            `Word (DOCX)：${WORD_HONESTY}`,
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "哪些 LaTeX 命令不支持？", a: "KaTeX 函数列表之外的——比如定义复杂的 \\newcommand 宏、TikZ 或完整的 LaTeX 文档环境。不支持的命令会以红色显示源码。" },
        { q: "正文里的 $5 和 $10 会被当成公式吗？", a: "不会。像普通句子（多个词、没有数学符号）的 $ … $ 会按文本保留。" },
        { q: "和 Pandoc 比怎么样？", a: "Pandoc 配 LaTeX 引擎的 PDF 很好，但要装几 GB 的 TeX 并配置中文字体。这里在浏览器里运行，中文字体已内嵌；对绝大多数笔记和论文，输出效果相当。" },
        { q: "免费吗？", a: PRIVACY },
      ],
      demo: demo("试试含公式的示例", "行内公式、独立公式、矩阵和 \\( … \\) 分隔符——预览里全部排版。"),
    },
  ],
  [
    "markdown-mermaid-pdf",
    {
      title: "Markdown Mermaid 图表转 PDF / Word",
      description: "把含 ```mermaid 流程图、时序图、类图的 Markdown 转成 PDF、Word、图片或 EPUB，图表照常渲染。浏览器内完成，免费、无需注册。",
      keywords: ["markdown mermaid 转 pdf", "mermaid 图表 导出 pdf", "markdown 流程图 pdf", "mermaid 转 word", "markdown mermaid 在线", "mermaid 导出 docx"],
      h1: "Markdown Mermaid 图表转 PDF",
      lead: "```mermaid 代码块渲染成图——流程图、时序图、类图、状态图、甘特图——并以清晰图像进入 PDF、Word、图片和 EPUB，而不是一段代码。",
      ctaTop: "立即转换 Markdown",
      ctaBottom: "拖入 .md 文件 — 免费、无需注册",
      sections: [
        {
          heading: "图表如何进入每种格式",
          paragraphs: [
            "Mermaid 需要浏览器才能渲染，所以图表就在你的浏览器里画好，在生成任何格式之前以图片形式嵌入文档。PDF 和 Word 得到清晰的 PNG；HTML、EPUB 和图片导出得到矢量 SVG。",
            "只有文档里真的有 ```mermaid 代码块时才会加载 Mermaid 引擎，普通文档不受影响。",
          ],
        },
        {
          heading: "怎么用",
          steps: [
            { title: "拖入或粘贴", text: "带 ```mermaid 块的 Markdown——预览里显示渲染好的图。" },
            { title: "检查", text: "语法有误的图会保持为代码块，方便你修改。" },
            { title: "导出", text: "转 PDF、转 Word (DOCX)、转图片 (PNG) 或 EPUB——图表都在。" },
          ],
        },
        {
          heading: "支持的图表类型",
          bullets: [
            "流程图 / graph、时序图、类图、状态图、ER 图、甘特图、饼图、思维导图、时间线等 Mermaid 11 支持的类型。",
            "中文、日文、韩文标签用你设备的字体渲染。",
            "大图以 2 倍分辨率嵌入，适合打印。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "为什么我的图还是代码块？", a: "Mermaid 没能解析。检查语法（可用 mermaid.live 验证）；解析错误会保留原代码块，不会导致导出失败。" },
        { q: "能单独得到图表图片吗？", a: "把文档「转图片 (PNG)」，或直接从预览里复制图表。" },
        { q: "Word 里能看到图吗？", a: "能，以打印分辨率的 PNG 图片嵌入。" },
        { q: "免费吗？", a: "免费、无需账号。图表在浏览器内渲染；PDF 和 Word 在内存中转换后丢弃。" },
      ],
      demo: demo("试试含图表的示例", "一个 ```mermaid 流程图——在下方预览里渲染。"),
    },
  ],
  [
    "markdown-zhuan-excel",
    {
      title: "Markdown 表格转 Excel (XLSX) 在线工具",
      description: "在浏览器里把 Markdown 表格转成 Excel 工作簿：每个表格一个工作表，数字识别为数值，表头加粗。免费、无需注册、不上传。",
      keywords: ["markdown 转 excel", "markdown 表格 转 excel", "md 表格 转 xlsx", "markdown 转 xlsx", "markdown 表格 导出 excel", "markdown 转 电子表格"],
      h1: "Markdown 表格转 Excel",
      lead: "粘贴或拖入 Markdown 文件，下载 .xlsx：每个表格变成一个工作表，数值单元格是真正的数字，表头加粗。完全在浏览器内完成。",
      ctaTop: "立即转换表格",
      ctaBottom: "拖入 .md 文件 — 免费、无需注册",
      sections: [
        {
          heading: "转换过程",
          steps: [
            { title: "拖入或粘贴", text: "Markdown；预览显示所有表格。" },
            { title: "更多格式 → 转 Excel (XLSX)", text: "工作簿在本地生成，每个表格一个工作表。" },
            { title: "打开", text: "Excel、Numbers、LibreOffice 或 Google 表格均可。" },
          ],
        },
        {
          heading: "会保留什么",
          bullets: [
            "表头行（加粗）和每一数据行；空单元格保持为空。",
            "数字（包括千位分隔符）变成数值单元格，其余为文本。",
            "工作表以表格上方最近的标题命名。",
            "列宽按最长单元格自动调整。",
          ],
        },
        {
          heading: "不会保留什么",
          bullets: [
            "单元格内的行内格式（加粗、链接、代码）会变成纯文本。",
            "HTML 表格和合并单元格不支持——请使用标准 Markdown 表格。",
            "不计算公式：内容为 =SUM(...) 的单元格按文本存储。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "能一次转多个表格吗？", a: "能。文档里的每个表格都会成为同一个工作簿里的一个工作表。" },
        { q: "我的表格会被上传吗？", a: "不会。Excel 文件在浏览器内生成，不发送到任何服务器。" },
        { q: "从 ChatGPT 或 Notion 复制的表格也行吗？", a: "行，只要是 Markdown 表格（竖线和横线行）。" },
        { q: "免费吗？", a: "免费、无需账号，除 1MB 文件大小外没有限制。" },
      ],
      demo: demo("试试含表格的示例", "两个 Markdown 表格——加载后「更多格式 → 转 Excel (XLSX)」。"),
    },
  ],
  sourceToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-zhuan-word",
    title: "DeepSeek 转 Word：回答导出 DOCX",
    description: "把 DeepSeek 回答转成 Word (DOCX) 或 PDF：粘贴 Markdown，自动去掉聊天残留和 <think> 块，公式和表格保留。免费、无需注册。",
    keywords: ["deepseek 转 word", "deepseek 导出 word", "deepseek 回答 保存 word", "deepseek 转 pdf", "deepseek 导出 docx", "deepseek markdown 转 word"],
    h1: "DeepSeek 转 Word (DOCX)",
    lead: "把 DeepSeek 的回答变成同事可编辑的 Word 文档——标题、表格、代码和公式都在，推理块和复制按钮残留全部去掉。",
    quirks: [
      "复制的回答顶部常带 <think> … </think> 推理块和「已深度思考（用时 N 秒）」一行。",
      "公式是 \\( … \\) 和 \\[ … \\] 的 LaTeX 源码。",
      "每个代码块后面跟着「复制代码」。",
    ],
  }),
  [
    "claude-artifacts-pdf",
    {
      title: "Claude Artifacts 转 PDF：导出 Claude 内容",
      description: "把 Claude 的 Artifacts、代码块和回答导出为 PDF 或 Word。从 Claude 复制 Markdown，粘贴到这里，立即下载。免费、无需注册。",
      keywords: ["claude artifacts 转 pdf", "claude 导出 pdf", "claude 回答 保存 pdf", "claude artifact 导出", "claude 转 word", "claude markdown 转 pdf"],
      h1: "Claude Artifacts 转 PDF",
      lead: "Claude 的 Artifacts 面板没有「导出 PDF」按钮。复制内容，粘贴到这里，就能得到带格式的 PDF、Word 或图片——代码块、表格和公式都保留。",
      ctaTop: "立即转换 Claude 内容",
      ctaBottom: "粘贴内容即可 — 免费、无需注册",
      sections: [
        {
          heading: "怎么把 Claude Artifact 存成 PDF",
          steps: [
            { title: "复制 Artifact", text: "在 Claude 的 Artifact 面板点复制（Markdown 类 Artifact 会保留格式；代码 Artifact 会得到代码文本）。" },
            { title: "粘贴到这里", text: "实时预览显示排版效果；聊天残留自动去掉。" },
            { title: "导出", text: "「转 PDF」用于分享和打印；「转 Word (DOCX)」用于继续编辑；「转图片」用于发朋友圈或公众号。" },
          ],
        },
        {
          heading: "会保留什么",
          bullets: [
            "标题结构、列表、加粗与斜体。",
            "代码块（等宽样式）、表格、引用。",
            "LaTeX 公式：PDF、HTML、图片、EPUB 中完整排版；Word 中以清晰图片呈现（LaTeX 源码保留在替代文字里）。",
            "Mermaid 图表：渲染成图片进入所有格式。",
          ],
        },
        {
          heading: "为什么不直接截图",
          bullets: [
            "PDF 里是真正的文字，可搜索、可复制。",
            "代码块在 PDF 里仍可复制。",
            "长内容自动分页，打印友好，文件更小。",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "HTML / React 类的 Artifact 也能转吗？", a: "能转出代码本身：复制得到的是源码文本，会以代码块形式进入 PDF。要导出渲染后的网页效果，请在 Claude 中用浏览器打印。" },
        { q: "能转成 Word 吗？", a: "能。粘贴后点「转 Word (DOCX)」，也可以转 EPUB、HTML 或纯文本。" },
        { q: "我的内容会被存储吗？", a: "不会。PDF 和 Word 在服务器内存中生成后立即丢弃；图片、HTML、EPUB 不离开你的浏览器。" },
        { q: "免费吗？", a: PRIVACY },
      ],
      demo: demo("试试示例内容", "一段含公式、表格和代码的回答——看看各部分如何渲染。"),
    },
  ],
  sourceToWordPage({
    chatbot: "Gemini",
    slug: "gemini-zhuan-word",
    title: "Gemini 转 Word：回答导出 DOCX",
    description: "把 Google Gemini 的回答转成 Word (DOCX) 或 PDF，表格、标题、公式完整保留。把 Markdown 粘贴到这里——免费、无需注册、不存储。",
    keywords: ["gemini 转 word", "gemini 导出 word", "gemini 回答 保存", "gemini 转 pdf", "gemini 表格 导出 word", "gemini 导出 docx"],
    h1: "Gemini 转 Word (DOCX)",
    lead: "Gemini 的「导出到 Google 文档」适合用 Google Docs 的人。如果你要的是 .docx 文件、PDF，或把表格导成 Excel，把回答粘贴到这里一键导出。",
    quirks: [
      "从部分 Gemini 界面复制时，表格会变成一整行竖线。",
      "公式是 LaTeX 源码，代码块带语言标记。",
      "用加粗代替 Markdown 标题——会以加粗段落保留。",
    ],
    faqExtra: [
      { q: "为什么不直接用 Gemini 的「导出到 Google 文档」？", a: "目标是 Google Docs 就用它。这个页面解决的是：要一个可下载的 .docx、PDF、EPUB，或把表格导成 Excel——而且不需要 Google 账号。" },
    ],
  }),
  sourceToWordPage({
    chatbot: "Kimi",
    slug: "kimi-zhuan-word",
    title: "Kimi 转 Word：回答导出 DOCX",
    description: "把 Kimi 的回答转成 Word (DOCX) 或 PDF：粘贴 Markdown，自动去掉「复制」等残留，表格、代码、公式保留。免费、无需注册。",
    keywords: ["kimi 转 word", "kimi 导出 word", "kimi 回答 保存 word", "kimi 转 pdf", "kimi 导出 docx", "kimi markdown 转 word"],
    h1: "Kimi 转 Word (DOCX)",
    lead: "把 Kimi 的长回答变成可编辑的 Word 文档——标题、表格、代码和公式都在，界面残留全部去掉。",
    quirks: [
      "代码块后面的「复制」按钮文字。",
      "公式是 \\( … \\) 和 \\[ … \\] 的 LaTeX 源码。",
      "长回答里的表格在 Word 中变成竖线。",
    ],
  }),
  sourceToWordPage({
    chatbot: "豆包",
    slug: "doubao-zhuan-word",
    title: "豆包转 Word：回答导出 DOCX",
    description: "把豆包的回答转成 Word (DOCX) 或 PDF：粘贴 Markdown，自动去掉复制残留，表格、代码、公式保留。免费、无需注册。",
    keywords: ["豆包 转 word", "豆包 导出 word", "豆包 回答 保存 word", "豆包 转 pdf", "豆包 导出 docx", "豆包 markdown 转 word"],
    h1: "豆包转 Word (DOCX)",
    lead: "把豆包的回答变成可编辑的 Word 文档——标题、表格、代码和公式都在，复制按钮和角色标签残留全部去掉。",
    quirks: [
      "「复制」按钮文字和「用户 / 豆包」角色标签。",
      "公式是 \\( … \\) 和 \\[ … \\] 的 LaTeX 源码。",
      "表格在 Word 中变成竖线。",
    ],
  }),
]);
