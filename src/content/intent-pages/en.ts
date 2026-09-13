import type { IntentPageContent } from "./types";

/**
 * English long-tail intent pages (build plan Phase 1, §8 query families).
 * Keyed by slug; the manifest decides which pages exist and how they group.
 *
 * Every page states honestly what each format gets: formulas render with
 * KaTeX in PDF/HTML/image/EPUB, and as images in Word (LaTeX source in the alt
 * text) until editable equations ship (Phase 0b).
 */

const FAQ_HEADING = "Frequently asked questions";

const demo = (sampleLabel: string, note: string) => ({
  heading: "⬇ Drop your .md here — or try the sample",
  hint: "Converts in seconds · nothing stored · no signup",
  readyHint: "pick a format below",
  sampleLabel,
  note,
});

const WORD_HONESTY =
  "In Word each formula becomes a sharp image that looks just like the preview, with its LaTeX source kept as the image's alt text; editable Word equations are on the roadmap.";

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
      ctaTop: `Fix ${chatbot} formulas now`,
      ctaBottom: "Paste your answer — free, no signup",
      sections: [
        {
          heading: `Why ${chatbot} formulas break when you paste into Word`,
          paragraphs: [
            `${chatbot} writes mathematics as LaTeX. When you copy an answer, the formulas travel as raw source wrapped in \\( … \\) and \\[ … \\], and Word pastes exactly that: backslashes, braces and all. Word's equation editor never sees it, so you get a line of code instead of a fraction.`,
            `Screenshots avoid the mess but are not searchable, not editable and blur when printed. The fix is to render the LaTeX first and then hand Word (or PDF) a properly typeset document.`,
            ...(opts.whyExtra ? [opts.whyExtra] : []),
          ],
        },
        {
          heading: "Fix it in 30 seconds",
          steps: [
            { title: "Copy the answer", text: `use ${chatbot}'s copy button so the Markdown and LaTeX come through intact.` },
            { title: "Paste it here", text: "the paste box strips copy-button labels and role lines automatically and recognises \\( … \\) and \\[ … \\] delimiters." },
            { title: "Export", text: "click To PDF for typeset formulas, or To Word (DOCX) for an editable document." },
          ],
        },
        {
          heading: "What you get, format by format",
          bullets: [
            "PDF, HTML, image and EPUB: every formula typeset with KaTeX — fractions, sums, matrices, Greek letters, subscripts.",
            `Word (DOCX): the document structure, tables, code and lists come through as real Word styles. ${WORD_HONESTY}`,
            "Tables, code blocks, headings and lists are preserved in every format.",
            "Nothing is stored: PDF and Word are converted in memory and discarded; the other formats never leave your browser.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        {
          q: `Why do ${chatbot}'s formulas show as \\frac and \\sum in Word?`,
          a: `Because they are LaTeX source. ${chatbot} renders it in the chat window, but the clipboard carries the raw text. Rendering it here first turns it into typeset math, in PDF and in Word alike.`,
        },
        {
          q: "Do I need to change $ or \\( delimiters?",
          a: "No. Both $ … $ / $$ … $$ and \\( … \\) / \\[ … \\] are recognised. Dollar amounts in prose such as \"$5 and $10\" are left alone.",
        },
        {
          q: "Will the equations be editable in Word?",
          a: "Not as equations yet. In Word each formula is a sharp image that looks right and prints cleanly, with its LaTeX source in the image's alt text; editable equations (OMML) are on the roadmap. PDF, HTML, image and EPUB output is fully typeset too.",
        },
        {
          q: "Is this free? Do I need an account?",
          a: "Free, no account, no watermark on your documents. Files up to 1 MB; the conversion runs in your browser except PDF and Word, which are converted in memory on our server and discarded immediately.",
        },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("Try a sample with formulas", "The sample has inline and display math, a matrix and \\( … \\) delimiters — watch it render below."),
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
      ctaTop: `Convert a ${chatbot} answer now`,
      ctaBottom: "Paste your answer — free, no signup",
      sections: [
        {
          heading: `What breaks when you paste ${chatbot} into Word`,
          paragraphs: [
            `${chatbot} answers are Markdown: headings, bullet lists, tables, fenced code and LaTeX formulas. Pasted straight into Word they arrive as plain text — pipes instead of tables, hashes instead of headings, backslashes instead of formulas — plus UI leftovers such as "Copy code" and role labels.`,
          ],
          bullets: opts.quirks,
        },
        {
          heading: "The 30-second workflow",
          steps: [
            { title: "Copy the answer", text: `${chatbot}'s copy button keeps the Markdown; select-and-copy usually does too.` },
            { title: "Paste it here", text: "chat residue is removed on paste and you get a live preview." },
            { title: "Export", text: "To Word (DOCX) for a document your colleagues can edit; To PDF, image or EPUB for sharing." },
          ],
        },
        {
          heading: "What arrives in Word",
          bullets: [
            "Headings, lists, bold and italic as real Word styles.",
            "Tables as Word tables, code blocks in a monospace style.",
            `Formulas: ${WORD_HONESTY}`,
            "Need the tables in a spreadsheet instead? To Excel (XLSX) writes one worksheet per table.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        {
          q: `Can I convert a whole ${chatbot} conversation at once?`,
          a: "Copy each answer you need and paste them one after another into the same box, then export once. A multi-answer merge with automatic heading numbering is on the roadmap.",
        },
        {
          q: `Does it keep ${chatbot}'s tables and code?`,
          a: "Yes. Markdown tables become Word tables (or Excel worksheets), fenced code keeps its monospace formatting, and headings map to Word heading styles.",
        },
        {
          q: "Which formats can I export to?",
          a: "PDF, Word (DOCX), image (PNG/JPG), EPUB, Excel (XLSX, one worksheet per table), HTML and plain text — all from the same pasted answer, with no account.",
        },
        {
          q: "Is my text stored anywhere?",
          a: "No. Word and PDF are generated in memory on our server and discarded right after the download; HTML, image, EPUB and Excel never leave your browser. No account, no tracking cookies.",
        },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("Try a sample answer", "A typical AI answer: formulas, a table and a code block — see how each part renders."),
    },
  ];
}

export const en: Record<string, IntentPageContent> = Object.fromEntries([
  mathToWordPage({
    chatbot: "ChatGPT",
    slug: "chatgpt-formulas-to-word",
    title: "ChatGPT Formulas to Word: Fix Broken LaTeX Math",
    description:
      "ChatGPT math pastes into Word as \\frac and \\sum? Paste the answer here for typeset formulas in both PDF and Word. Free.",
    keywords: ["chatgpt formulas to word", "chatgpt math to word", "chatgpt latex to word", "chatgpt equation word broken", "chatgpt math to pdf", "copy chatgpt formula"],
    h1: "ChatGPT formulas to Word — without the broken LaTeX",
    lead: "Copied a ChatGPT answer full of equations and Word shows \\frac{a}{b} instead of a fraction? Paste it here: the math is typeset for PDF, and Word gets a clean document with every formula preserved.",
    faqExtra: [
      {
        q: "What about ChatGPT's citation marks and \"Copy code\" lines?",
        a: "They are stripped automatically when you paste: copy-button labels, \"You said / ChatGPT said\" lines, \"Thought for 8s\" and the 【12†source】 citation glyphs.",
      },
    ],
  }),
  mathToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-formulas-to-word",
    title: "DeepSeek Formulas to Word: Fix Math Paste",
    description:
      "DeepSeek answers paste into Word with raw LaTeX and <think> blocks? Paste here: residue is removed and formulas are typeset in PDF and Word. Free.",
    keywords: ["deepseek formulas to word", "deepseek math to word", "deepseek latex word", "deepseek to pdf math", "deepseek think block", "deepseek copy formula"],
    h1: "DeepSeek formulas to Word and PDF",
    lead: "DeepSeek writes beautiful math in the chat and raw \\[ … \\] LaTeX on the clipboard, often with a <think> block on top. Paste it here to get typeset formulas in PDF and in a clean Word document.",
    whyExtra:
      "DeepSeek copies can also include the hidden reasoning block (<think> … </think>) and a \"Thought for 12s\" line. Both are removed on paste so they never end up in your document.",
    faqExtra: [
      {
        q: "Does it handle DeepSeek's <think> reasoning block?",
        a: "Yes. The <think> … </think> block and \"已深度思考\" / \"Thought for Ns\" lines are stripped on paste; the answer itself is untouched.",
      },
    ],
  }),
  [
    "chatgpt-table-to-excel",
    {
      title: "ChatGPT Table to Excel: Paste, Get an XLSX",
      description:
        "Turn a ChatGPT (or any AI) Markdown table into a real Excel workbook: one worksheet per table, numbers as numbers, bold headers. In your browser, free.",
      keywords: ["chatgpt table to excel", "chatgpt to excel", "markdown table to excel", "ai table to xlsx", "copy chatgpt table to excel", "chatgpt table to spreadsheet"],
      h1: "ChatGPT table to Excel in one click",
      lead: "ChatGPT tables are Markdown: pipes and dashes. Paste the answer here and download an .xlsx with one worksheet per table, numeric cells and bold headers — nothing to clean up by hand.",
      ctaTop: "Convert a table now",
      ctaBottom: "Paste your table — free, no signup",
      sections: [
        {
          heading: "Why pasting a ChatGPT table into Excel goes wrong",
          paragraphs: [
            "A Markdown table is text: | Name | Score | with a row of dashes underneath. Pasted into Excel it lands in a single column, or every pipe becomes part of the cell. Text-to-columns gets you halfway and leaves the alignment row behind.",
            "Rendering the Markdown first gives you real rows and columns, and the Excel writer here turns every table in the answer into its own worksheet.",
          ],
        },
        {
          heading: "Fix it in 30 seconds",
          steps: [
            { title: "Copy the answer", text: "use ChatGPT's copy button so the table stays Markdown." },
            { title: "Paste it here", text: "the live preview shows the table; \"Copy code\" and role labels are removed automatically." },
            { title: "More formats → To Excel (XLSX)", text: "one worksheet per table; the file downloads immediately." },
          ],
        },
        {
          heading: "What the workbook contains",
          bullets: [
            "One worksheet per Markdown table, named after the nearest heading.",
            "Numbers stored as numbers (\"1,234.56\" becomes 1234.56), everything else as text.",
            "Bold header row and column widths fitted to the content.",
            "Opens in Excel, Numbers, LibreOffice and Google Sheets. Built entirely in your browser — the table never leaves your device.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Does it work with tables from Claude, Gemini, DeepSeek or Kimi?", a: "Yes. Any Markdown table works, whichever assistant wrote it. Several tables in one answer become several worksheets." },
        { q: "What happens to formulas or bold text inside cells?", a: "Cells are exported as their plain text. Formatting inside cells is not carried into Excel; formulas written in LaTeX arrive as their source text." },
        { q: "Can I also get the table in Word?", a: "Yes — To Word (DOCX) exports the same document with the table as a real Word table." },
        { q: "Is it free?", a: "Free, no account, and the Excel file is generated in your browser — nothing is uploaded." },
      ],
      demo: demo("Try a sample with tables", "Two Markdown tables with mixed alignment — load it, then pick More formats → To Excel."),
    },
  ],
  [
    "ai-table-to-word",
    {
      title: "AI Chat Table to Word: Gemini, ChatGPT, Claude",
      description:
        "Tables from Gemini, ChatGPT or Claude paste into Word as pipes and dashes? Paste the answer here and export a Word document with real tables, or Excel. Free.",
      keywords: ["gemini table to word", "chatgpt table to word", "ai table to word", "markdown table to word", "copy table from chatgpt to word", "claude table to word"],
      h1: "AI chat tables to Word — real tables, not pipes",
      lead: "Gemini, ChatGPT and Claude all answer with Markdown tables. In Word those become lines of | pipes |. Paste the answer here and export a document where the table is a real Word table with alignment preserved.",
      ctaTop: "Convert a table now",
      ctaBottom: "Paste your answer — free, no signup",
      sections: [
        {
          heading: "Why AI tables fall apart in Word",
          paragraphs: [
            "Markdown tables are plain text with pipe separators and an alignment row (:--- for left, :--: for centre, ---: for right). Word has no idea that this is a table, so it pastes the characters verbatim.",
            "Rendering the Markdown first produces a proper table with column alignment, header row and borders — and the same document can go to PDF, Excel or an image.",
          ],
        },
        {
          heading: "Fix it in 30 seconds",
          steps: [
            { title: "Copy the answer", text: "the assistant's copy button keeps the Markdown intact." },
            { title: "Paste it here", text: "check the table in the live preview; alignment is shown as written." },
            { title: "Export", text: "To Word (DOCX) for a real Word table; More formats → To Excel (XLSX) for a spreadsheet." },
          ],
        },
        {
          heading: "What you get",
          bullets: [
            "Word: a native table with header row, borders and left/centre/right alignment.",
            "Excel: one worksheet per table with numeric cells and bold headers.",
            "PDF and image: the table typeset exactly as previewed, including CJK text.",
            "Free, no account; Word and PDF are converted in memory and discarded, Excel and images are built in your browser.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Why does Gemini's table paste as one long line?", a: "Gemini's copy sometimes flattens line breaks. Paste it into the box here: the Markdown parser restores the rows as long as the pipes are present." },
        { q: "Do merged cells work?", a: "Standard Markdown tables have no merged cells. HTML tables with rowspan/colspan are not yet supported; use one row per entry." },
        { q: "Can I keep the table and the text around it?", a: "Yes — the whole answer converts: headings, paragraphs, code and the tables." },
        { q: "Is it free?", a: "Free, no account, no watermark on documents. Files up to 1 MB." },
      ],
      demo: demo("Try a sample with tables", "Two aligned Markdown tables — load them and export To Word (DOCX) to see real tables."),
    },
  ],
  [
    "markdown-to-pdf-with-latex-math",
    {
      title: "Markdown to PDF with LaTeX Math (KaTeX)",
      description:
        "Convert Markdown with $…$ and $…$ LaTeX formulas to a typeset PDF in your browser. KaTeX rendering, CJK fonts, no install, no signup. Word and EPUB too.",
      keywords: ["markdown to pdf latex", "markdown to pdf with latex math", "markdown math to pdf", "katex markdown pdf", "markdown to pdf with math online", "md to pdf formulas"],
      h1: "Markdown to PDF with LaTeX math",
      lead: "Notes with $E = mc^2$, $$\\int_0^\\infty$$ and matrices become a typeset PDF — no Pandoc, no 1.5 GB TeX install. Drop the file, click To PDF.",
      ctaTop: "Convert a Markdown file now",
      ctaBottom: "Drop your .md — free, no signup",
      sections: [
        {
          heading: "What is supported",
          bullets: [
            "Inline math $ … $ and \\( … \\); display math $$ … $$ and \\[ … \\].",
            "Fractions, roots, sums, integrals, limits, matrices (pmatrix, bmatrix), aligned environments, Greek letters, operators and most KaTeX-supported commands.",
            "Math inside tables, lists and blockquotes.",
            "CJK text next to formulas: Noto Sans SC/TC/JP/KR are embedded in the PDF.",
          ],
        },
        {
          heading: "How it works",
          steps: [
            { title: "Drop or paste", text: "your .md file (up to 1 MB) — the preview renders the formulas immediately." },
            { title: "Check", text: "unsupported commands show in red with the source, so nothing fails silently." },
            { title: "Click To PDF", text: "A4 or Letter (by your region), typeset with KaTeX fonts embedded." },
          ],
        },
        {
          heading: "Other formats",
          bullets: [
            "HTML: standalone file with the KaTeX stylesheet inlined.",
            "Image (PNG/JPG) and EPUB: formulas rendered, built in your browser.",
            `Word (DOCX): ${WORD_HONESTY}`,
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Which LaTeX commands are not supported?", a: "Anything outside KaTeX's function list — for example custom \\newcommand macros with complex definitions, TikZ, or full LaTeX document environments. Unsupported commands are shown in red with their source." },
        { q: "Does $5 and $10 in my text turn into math?", a: "No. A $ … $ span that is plain prose (several words, no math symbols) is left as text." },
        { q: "How does this compare to Pandoc?", a: "Pandoc with a LaTeX engine produces excellent PDFs but needs a multi-gigabyte TeX install and CJK font configuration. This runs in the browser with CJK fonts already embedded; for most notes and papers the output is equivalent." },
        { q: "Is it free?", a: "Free, no account, no watermark. PDF is converted in memory on our server and discarded; the other formats never leave your browser." },
      ],
      demo: demo("Try a sample with formulas", "Inline math, display equations, a matrix and \\( … \\) delimiters — all typeset in the preview."),
    },
  ],
  [
    "markdown-to-pdf-with-mermaid",
    {
      title: "Markdown to PDF with Mermaid Diagrams",
      description:
        "Convert Markdown containing ```mermaid flowcharts, sequence and class diagrams to PDF, Word, image or EPUB with the diagrams rendered. Free, no signup.",
      keywords: ["markdown to pdf mermaid", "markdown pdf mermaid", "mermaid diagram to pdf", "markdown to pdf with mermaid online", "export mermaid to word", "mermaid markdown to docx"],
      h1: "Markdown to PDF with Mermaid diagrams",
      lead: "```mermaid fences render as diagrams — flowcharts, sequence, class, state and Gantt — and travel into PDF, Word, image and EPUB as crisp graphics instead of code blocks.",
      ctaTop: "Convert a Markdown file now",
      ctaBottom: "Drop your .md — free, no signup",
      sections: [
        {
          heading: "How diagrams get into every format",
          paragraphs: [
            "Mermaid needs a browser to render, so the diagrams are drawn right here in your browser and embedded into the document as images before any format is produced. PDF and Word receive a sharp PNG; HTML, EPUB and image exports receive vector SVG.",
            "The Mermaid engine loads only when a document actually contains a ```mermaid fence, so ordinary documents stay fast.",
          ],
        },
        {
          heading: "How it works",
          steps: [
            { title: "Drop or paste", text: "the Markdown with your ```mermaid blocks — the preview shows the rendered diagrams." },
            { title: "Check", text: "a diagram with a syntax error stays as a code block so you can fix it." },
            { title: "Export", text: "To PDF, To Word (DOCX), To Image (PNG) or EPUB — the diagram is in all of them." },
          ],
        },
        {
          heading: "Supported diagram types",
          bullets: [
            "Flowchart / graph, sequence, class, state, entity-relationship, Gantt, pie, mindmap, timeline and the other Mermaid 11 types.",
            "Labels in Chinese, Japanese and Korean render with your device's fonts.",
            "Very large diagrams are embedded at 2× resolution for print.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Why is my diagram still a code block?", a: "Mermaid could not parse it. Check the syntax (mermaid.live is handy); a parse error leaves the fence untouched rather than breaking the export." },
        { q: "Can I get the diagram as a separate image?", a: "Export the document To Image (PNG) — or copy the diagram from the rendered preview." },
        { q: "Does Word show the diagram?", a: "Yes, as an embedded PNG image at print resolution." },
        { q: "Is it free?", a: "Free, no account. Diagrams are rendered in your browser; PDF and Word are converted in memory and discarded." },
      ],
      demo: demo("Try a sample with a diagram", "A flowchart in a ```mermaid fence — it renders in the preview below."),
    },
  ],
  [
    "markdown-table-to-excel",
    {
      title: "Markdown Table to Excel (XLSX) Converter",
      description:
        "Convert Markdown tables to an Excel workbook in your browser: one worksheet per table, numbers as numbers, bold headers. Free, no signup, nothing uploaded.",
      keywords: ["markdown table to excel", "markdown to excel", "md table to xlsx", "convert markdown table to excel", "markdown to xlsx", "markdown to spreadsheet"],
      h1: "Markdown table to Excel",
      lead: "Paste or drop a Markdown file and download an .xlsx: every table becomes a worksheet, numeric cells are real numbers, and the header row is bold. Built entirely in your browser.",
      ctaTop: "Convert tables now",
      ctaBottom: "Drop your .md — free, no signup",
      sections: [
        {
          heading: "How the conversion works",
          steps: [
            { title: "Drop or paste", text: "the Markdown; the preview shows every table." },
            { title: "More formats → To Excel (XLSX)", text: "the workbook is generated locally with one worksheet per table." },
            { title: "Open", text: "in Excel, Numbers, LibreOffice or Google Sheets." },
          ],
        },
        {
          heading: "What is preserved",
          bullets: [
            "Header row (bold) and every data row; empty cells stay empty.",
            "Numbers, including thousands separators, become numeric cells; everything else is text.",
            "Worksheet names come from the nearest heading above each table.",
            "Column widths are fitted to the longest cell.",
          ],
        },
        {
          heading: "What is not",
          bullets: [
            "Inline formatting inside cells (bold, links, code) is flattened to plain text.",
            "HTML tables and merged cells are not supported — use standard Markdown tables.",
            "Formulas are not evaluated: a cell containing =SUM(...) is stored as text.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Can I convert several tables at once?", a: "Yes. Every table in the document becomes its own worksheet in the same workbook." },
        { q: "Are my tables uploaded?", a: "No. The Excel file is built in your browser; nothing is sent to a server." },
        { q: "Does it work with tables copied from ChatGPT or Notion?", a: "Yes, as long as they are Markdown tables (pipes and a dash row)." },
        { q: "Is it free?", a: "Free, no account, no limits beyond the 1 MB file size." },
      ],
      demo: demo("Try a sample with tables", "Two Markdown tables — load them, then More formats → To Excel (XLSX)."),
    },
  ],
  sourceToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-to-word",
    title: "DeepSeek to Word: Export Answers as DOCX",
    description:
      "Convert DeepSeek answers to Word (DOCX) or PDF: paste the Markdown, chat residue and <think> blocks are removed, formulas and tables kept. Free, no signup.",
    keywords: ["deepseek to word", "deepseek to docx", "export deepseek answer", "deepseek to pdf", "save deepseek response", "deepseek markdown to word"],
    h1: "DeepSeek to Word (DOCX)",
    lead: "Turn a DeepSeek answer into a Word document your team can edit — headings, tables, code and formulas included, reasoning blocks and copy-button residue removed.",
    quirks: [
      "A <think> … </think> reasoning block and a \"Thought for Ns\" line at the top of copied answers.",
      "Formulas as \\( … \\) and \\[ … \\] LaTeX source.",
      "\"复制代码\" / \"Copy code\" lines after every code block.",
    ],
  }),
  sourceToWordPage({
    chatbot: "Gemini",
    slug: "gemini-to-word",
    title: "Gemini to Word: Export Answers as DOCX",
    description:
      "Convert Google Gemini answers to Word (DOCX) or PDF with real tables, headings and formulas. Paste the Markdown here — free, no signup, nothing stored.",
    keywords: ["gemini to word", "gemini to docx", "export gemini answer", "gemini to pdf", "gemini table to word", "save gemini response"],
    h1: "Gemini to Word (DOCX)",
    lead: "Gemini's \"Export to Docs\" is handy if you live in Google Docs. If you need a .docx file, a PDF or an Excel sheet of the tables, paste the answer here and export in one click.",
    quirks: [
      "Tables that arrive as a single line of pipes when copied from some Gemini views.",
      "Formulas as LaTeX source, and code blocks with the language tag.",
      "Bold section titles instead of Markdown headings — they are kept as bold paragraphs.",
    ],
    faqExtra: [
      {
        q: "Why not just use Gemini's Export to Docs?",
        a: "Use it when the destination is Google Docs. This page is for a downloadable .docx, a PDF, an EPUB or an Excel export of the tables — without a Google account involved.",
      },
    ],
  }),
]);
