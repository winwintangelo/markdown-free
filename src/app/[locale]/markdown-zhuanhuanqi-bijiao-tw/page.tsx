import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/tool-links";

export function generateStaticParams() { return [{ locale: "zh-Hant" }]; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "zh-Hant") return {};
  return {
    title: "Markdown 轉 PDF 工具比較 2026 | 8 款免費推薦",
    description: "比較 8 款 Markdown 轉 PDF 工具：Markdown Free、Pandoc、Typora、Dillinger、StackEdit、md-to-pdf、Markdown PDF (VS Code)、Online2PDF。中文不亂碼的選擇。",
    keywords: ["markdown pdf 轉換 比較", "markdown pdf 中文亂碼", "pandoc 中文 pdf", "markdown 轉換器 推薦", "線上 markdown pdf", "markdown 字型豆腐"],
    alternates: { canonical: "/zh-Hant/markdown-zhuanhuanqi-bijiao-tw", languages: hreflangAlternates("comparison") },
    openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB" }], title: "Markdown 轉 PDF 工具比較 2026", description: "誠實比較 8 款 Markdown 轉 PDF 工具，按用途說明哪款適合你。", locale: "zh_TW" },
  };
}

const PUBLISH_DATE = "2026-05-09"; const NEXT_REVIEW = "2026-11-09";

const faq = [
  { q: "為什麼我的中文在 PDF 裡變成 □□□（豆腐方塊）？", a: "大多數 Markdown 轉 PDF 流程會回退到 Helvetica 或 Times New Roman 等純西文字型，這些字型沒有中文字形。解決辦法是 (a) 在算繪管線中嵌入支援中文的字型如 Noto Sans CJK TC（Markdown Free 自動處理），或 (b) 給轉換工具明確指定字型（Pandoc：--pdf-engine=xelatex -V mainfont=\"Noto Sans CJK TC\"）。" },
  { q: "有沒有免費、無廣告的 Markdown 轉 PDF 工具？", a: "有。Markdown Free（無廣告、無追蹤、無註冊）、Pandoc（命令列）、VS Code 的 Markdown PDF 擴充功能都免費且無廣告。Dillinger 與 Online2PDF 等託管型網頁工具通常依靠廣告。" },
  { q: "免安裝的 Markdown 轉 PDF 工具哪款最好？", a: "Markdown Free 完全在瀏覽器內執行，無需安裝。StackEdit 與 Dillinger 也免安裝，但依賴系統字型，因此中文可能因系統而出現亂碼。" },
  { q: "把 Markdown 轉 DOCX（Word）會失去格式嗎？", a: "不會。Markdown Free、Pandoc 與 Typora 都能輸出保留標題、程式碼區塊、表格與待辦清單的 DOCX。Pandoc 最完整；Markdown Free 是瀏覽器中最快的。" },
  { q: "2026 年 Pandoc 仍是最佳選擇嗎？", a: "在腳本批次處理場景，Pandoc 仍是最強的 Markdown 轉換器；但對不想安裝 LaTeX（約 1.5GB）的非技術使用者，Markdown Free 等瀏覽器工具能在零安裝成本下提供相近的 PDF 品質。" },
  { q: "處理機密文件時，哪款轉換器最安全？", a: "本機執行的工具（Pandoc、Typora、VS Code 的 Markdown PDF、md-to-pdf）會把檔案留在自己的電腦上。瀏覽器工具中，Markdown Free 在用戶端處理 HTML/TXT/DOCX，PDF 在 serverless 記憶體中產生後立即丟棄；上傳到伺服器的工具（Online2PDF）隱私風險最高。" },
  { q: "Markdown Free 有檔案大小限制嗎？", a: "有。目前單檔 5MB。5MB 的 Markdown 約等於 75 萬字，幾乎涵蓋所有真實文件。需要更大檔案時，命令列 Pandoc 沒有內建大小限制。" },
];

const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", inLanguage: "zh-Hant", headline: "Markdown 轉 PDF 工具比較 2026", description: "Markdown 轉 PDF 工具 8 款的誠實比較。", datePublished: PUBLISH_DATE, dateModified: PUBLISH_DATE, author: { "@type": "Organization", name: "Markdown Free team", url: "https://www.markdown.free/zh-Hant/about" }, publisher: { "@type": "Organization", name: "Markdown Free", url: "https://www.markdown.free" }, mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.markdown.free/zh-Hant/markdown-zhuanhuanqi-bijiao-tw" } };
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "zh-Hant", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (localeParam !== "zh-Hant") notFound();
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <ConverterProvider>
      <LocaleTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Markdown 轉 PDF 工具比較 2026</h1>
          <p className="text-sm text-slate-500">發表於 {PUBLISH_DATE} ・ 下次審閱 {NEXT_REVIEW} ・ Markdown Free 團隊</p>
          <p className="lead text-lg text-slate-600">挑一個 Markdown 轉 PDF 的工具，聽起來像小事——直到你真的要用。然後你得在 1.5GB 的 LaTeX 安裝（Pandoc）、付費桌面應用（Typora）、有廣告的瀏覽器編輯器（Dillinger）、或要自己寫腳本的方案（md-to-pdf）之間做選擇。英文文件大多都能跑，但加入中文後就開始翻車。&quot;最好&quot;的分水嶺，正是中文是否會變成豆腐。</p>
          <p><strong>本文比較 2026 年的 8 款主流工具。</strong>結論：在瀏覽器中要中文不亂碼，選 <Link href="/zh-Hant" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>；腳本批次轉換，選 Pandoc；不介意付費、要離線打磨寫作環境，選 Typora。</p>

          <h2>一覽比較</h2>
          <div className="not-prose my-6 overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 text-left font-semibold text-slate-700">工具</th><th className="px-3 py-3 text-left font-semibold text-slate-700">最適合</th><th className="px-3 py-3 text-left font-semibold text-slate-700">價格</th><th className="px-3 py-3 text-left font-semibold text-slate-700">中文支援</th><th className="px-3 py-3 text-left font-semibold text-slate-700">輸出格式</th><th className="px-3 py-3 text-left font-semibold text-slate-700">安裝</th><th className="px-3 py-3 text-left font-semibold text-slate-700">隱私</th>
            </tr></thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown Free</td><td className="px-3 py-3">瀏覽器，中文不亂碼</td><td className="px-3 py-3">免費</td><td className="px-3 py-3">完全支援・嵌入 Noto 字型・無需設定</td><td className="px-3 py-3">PDF, DOCX, PNG, EPUB, HTML, TXT</td><td className="px-3 py-3">無</td><td className="px-3 py-3">記憶體處理，不儲存</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Pandoc</td><td className="px-3 py-3">腳本批次處理</td><td className="px-3 py-3">免費</td><td className="px-3 py-3">需設定：<code>--pdf-engine=xelatex -V mainfont</code></td><td className="px-3 py-3">30+ 格式</td><td className="px-3 py-3">PDF 需 LaTeX（約 1.5GB）</td><td className="px-3 py-3">僅本機</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Dillinger</td><td className="px-3 py-3">英文快速編輯</td><td className="px-3 py-3">免費、有廣告</td><td className="px-3 py-3">依賴系統字型</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">無</td><td className="px-3 py-3">連雲端後會同步</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">StackEdit</td><td className="px-3 py-3">瀏覽器+雲端同步</td><td className="px-3 py-3">免費</td><td className="px-3 py-3">依賴系統字型</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">無</td><td className="px-3 py-3">同步可選</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td><td className="px-3 py-3">VS Code 工作流</td><td className="px-3 py-3">免費</td><td className="px-3 py-3">系統字型，可用 CSS 設定</td><td className="px-3 py-3">PDF, HTML, PNG, JPEG</td><td className="px-3 py-3">VS Code + Chromium（約 170MB）</td><td className="px-3 py-3">僅本機</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">md-to-pdf (npm)</td><td className="px-3 py-3">建置流水線</td><td className="px-3 py-3">免費</td><td className="px-3 py-3">透過 CSS 與 Puppeteer 設定</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Node.js + Chromium</td><td className="px-3 py-3">僅本機</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Typora</td><td className="px-3 py-3">離線打磨寫作</td><td className="px-3 py-3">付費（一次性，撰文時點未核實）</td><td className="px-3 py-3">系統字型，主題相關</td><td className="px-3 py-3">PDF, HTML, DOCX</td><td className="px-3 py-3">桌面應用</td><td className="px-3 py-3">僅本機</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Online2PDF</td><td className="px-3 py-3">通用檔案轉換</td><td className="px-3 py-3">免費、有廣告</td><td className="px-3 py-3">有限，非 Markdown 原生</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">無</td><td className="px-3 py-3">檔案上傳到伺服器</td></tr>
            </tbody>
          </table></div>

          <h2>Markdown Free</h2>
          <p>HTML/TXT/DOCX 輸出在瀏覽器端完成，PDF 在 serverless 記憶體中產生後立刻丟棄。設計原則：「30 秒能完成的事，不要塞註冊和廣告。」</p>
          <p><strong>中文處理：</strong>把 Noto Sans CJK TC 直接嵌入 PDF 算繪管線，無字型參數、無安裝、無豆腐。</p>
          <p><strong>優點：</strong>無註冊、無追蹤 cookie、隱私友善的分析、UI 支援 10 種語言、把 AI 生成的 Markdown 轉成公司 Word 文件時 DOCX 輸出強。<br /><strong>缺點：</strong>單檔 5MB 上限、不支援離線（需瀏覽器）、不支援 LaTeX/MathJax 數學、沒有批次處理、PDF 樣式不可自訂。<br /><strong>最適合：</strong>需要現在就在瀏覽器把 Markdown 轉成 PDF/DOCX/EPUB 的人，特別是含中文的文件。</p>
          <p><Link href="/zh-Hant" className="text-emerald-700 hover:text-emerald-800 hover:underline">markdown.free/zh-Hant</Link>（也可直接打開 <Link href="/zh-Hant/markdown-docx-zhuanhuan" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown 轉 DOCX</Link> 或 <Link href="/zh-Hant/readme-pdf-zhuanhuan-tw" className="text-emerald-700 hover:text-emerald-800 hover:underline">README 轉 PDF</Link>）</p>

          <h2>Pandoc</h2>
          <p>命令列通用文件轉換器，可在 30+ 種格式間互轉。腳本批次處理與流水線場景的事實標準。</p>
          <p><strong>中文處理：</strong>預設 LaTeX 引擎（<code>pdflatex</code>）不支援中文。要得到可讀的輸出，必須使用 <code>--pdf-engine=xelatex</code>（或 <code>lualatex</code>）並附 <code>-V mainfont=&quot;Noto Sans CJK TC&quot;</code>，且系統需先安裝對應的 Noto 字型。</p>
          <p><strong>優點：</strong>最強大彈性的轉換器、龐大的外掛/過濾器生態、學術與技術寫作的事實標準。<br /><strong>缺點：</strong>PDF 輸出需安裝 LaTeX（macOS 的 TeX Live 約 1.5GB）、學習曲線陡、初學者不知道要做中文設定。<br /><strong>最適合：</strong>用腳本批次轉換的工程師、學術出版、熟悉命令列的寫作者。</p>
          <p><a href="https://pandoc.org" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">pandoc.org</a></p>

          <h2>Dillinger</h2>
          <p>有即時預覽的瀏覽器 Markdown 編輯器，開源，託管版在 dillinger.io。</p>
          <p><strong>中文處理：</strong>預覽繼承瀏覽器字型回退；PDF 輸出使用系統字型。預覽看起來正常，PDF 中文卻變豆腐的情況並不少見。</p>
          <p><strong>優點：</strong>熟悉的左右分欄、免費、與 Dropbox/Google Drive/GitHub 整合。<br /><strong>缺點：</strong>託管版有廣告、編輯狀態可能同步到連接的雲端、PDF 樣式控制有限。<br /><strong>最適合：</strong>純英文文件的臨時編輯與輸出。</p>
          <p><a href="https://dillinger.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">dillinger.io</a></p>

          <h2>StackEdit</h2>
          <p>支援雲端同步（Google Drive、Dropbox、GitHub）與數學公式（MathJax）的瀏覽器編輯器。</p>
          <p><strong>中文處理：</strong>同 Dillinger，依賴瀏覽器/系統字型，未自帶 Noto。</p>
          <p><strong>優點：</strong>UI 乾淨、支援數學公式、跨裝置雲端同步。<br /><strong>缺點：</strong>PDF 走瀏覽器列印通道，樣式自由度低；同步需 Google/Dropbox 授權。<br /><strong>最適合：</strong>需要雲端同步與數學公式的寫作者。</p>
          <p><a href="https://stackedit.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">stackedit.io</a></p>

          <h2>Markdown PDF（VS Code 擴充）</h2>
          <p>把 VS Code 目前的 Markdown 檔輸出為 PDF/HTML/PNG/JPEG 的擴充功能。首次使用會下載 Chromium（約 170MB）。</p>
          <p><strong>中文處理：</strong>使用 Chromium 字型系統。系統裝了中文字型即可顯示（現代 macOS/Windows/Linux 大多已裝）。可用 CSS 的 <code>@font-face</code> 嵌入特定字型。</p>
          <p><strong>優點：</strong>融入 VS Code 工作流、可用 CSS 靈活自訂、本機完成（Chromium 下載完畢後）。<br /><strong>缺點：</strong>需要 VS Code、首次下載約 170MB、首次輸出較慢、設定走 JSON 檔。<br /><strong>最適合：</strong>本來就在 VS Code 工作、想一鍵輸出 PDF 的開發者。</p>
          <p><a href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">VS Code Marketplace</a></p>

          <h2>md-to-pdf（npm）</h2>
          <p>用 Puppeteer（內嵌 Chromium）把 Markdown 轉 PDF 的 Node.js CLI/函式庫，專為建置流水線設計。</p>
          <p><strong>中文處理：</strong>依賴 Chromium 字型。可在 CSS 中 <code>@import</code> Noto 等網頁字型，穩定算繪中文。</p>
          <p><strong>優點：</strong>可腳本化、可換主題、設定好後批次處理快、開源。<br /><strong>缺點：</strong>需要 Node.js 與 Puppeteer Chromium（首裝約 170MB）、預設樣式需 CSS 調整以達生產品質。<br /><strong>最適合：</strong>用 CI/CD 從文件產生 PDF 的工程團隊。</p>
          <p><a href="https://github.com/simonhaenisch/md-to-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">github.com/simonhaenisch/md-to-pdf</a></p>

          <h2>Typora</h2>
          <p>macOS/Windows/Linux 的桌面 WYSIWYG Markdown 編輯器。2021 年前免費，現為一次性買斷（具體價格撰文時點未核實，請查看官網）。</p>
          <p><strong>中文處理：</strong>大多數情況下憑系統字型即可正常顯示；是否針對中文做了字型堆疊最佳化取決於主題。</p>
          <p><strong>優點：</strong>WYSIWYG 完成度高、輸出精緻、購買後無廣告無遙測。<br /><strong>缺點：</strong>付費、僅桌面、無團隊/雲端功能。<br /><strong>最適合：</strong>獨立寫作、不介意一次性付費的人。</p>
          <p><a href="https://typora.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">typora.io</a></p>

          <h2>Online2PDF</h2>
          <p>支援 Word、Excel、PDF、圖片等多種格式的通用網頁轉換器，Markdown 也算支援。</p>
          <p><strong>中文處理：</strong>有限，撰文時點未做完整驗證。它不是 Markdown 原生工具，程式碼區塊、表格、中文字型的表現不一致。</p>
          <p><strong>優點：</strong>能處理 Markdown 之外的多種格式、無需安裝。<br /><strong>缺點：</strong>檔案上傳到伺服器（機密文件有風險）、廣告較多、Markdown 算繪通用化導致表格/待辦清單可能變形、樣式不可自訂。<br /><strong>最適合：</strong>主要訴求是混合格式批次轉換、Markdown 只是順帶的一次性場景。</p>
          <p><a href="https://online2pdf.com" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">online2pdf.com</a></p>

          <h2>怎麼選（按場景）</h2>
          <ul>
            <li><strong>現在就要在瀏覽器把 Markdown 轉 PDF/DOCX/EPUB，免註冊，特別是含中文</strong> → <Link href="/zh-Hant" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link></li>
            <li><strong>命令列熟手，已裝或可裝 LaTeX，要腳本化批次</strong> → Pandoc</li>
            <li><strong>VS Code 工作流，要一鍵輸出</strong> → Markdown PDF（VS Code 擴充）</li>
            <li><strong>要在 CI/CD 中從文件產生 PDF</strong> → md-to-pdf 或 Pandoc</li>
            <li><strong>離線打磨寫作環境，付費可接受</strong> → Typora</li>
            <li><strong>需要雲端同步與數學公式</strong> → StackEdit</li>
            <li><strong>純英文文件的一次性編輯</strong> → Dillinger 或 StackEdit</li>
          </ul>

          <h2>常見問題</h2>
          {faq.map((item, i) => (<div key={i}><h3>{item.q}</h3><p>{item.a}</p></div>))}

          <h2>利益聲明</h2>
          <p>本文由比較表中出現的 <Link href="/zh-Hant" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link> 團隊撰寫。我們盡量寫明其他工具更適合的場景：Pandoc 適合腳本流水線，Typora 適合離線打磨，VS Code 的 Markdown PDF 適合編輯器內工作流。外部連結均加 <code>rel=&quot;nofollow&quot;</code>。如果發現事實錯誤，請透過 <Link href="/zh-Hant/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">這裡</Link> 聯繫我們，我們會修正。</p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">試用 Markdown Free —— 無需安裝、無需註冊、無中文亂碼</p>
            <Link href="/zh-Hant" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800">打開 Markdown Free<span aria-hidden="true">→</span></Link>
          </div>

          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">相關頁面</h2>
            <ul className="space-y-2">
              <li><Link href="/zh-Hant/markdown-pdf-zhuanhuan-tw" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF 轉換 - 免費、無需註冊</Link></li>
              <li><Link href="/zh-Hant/readme-pdf-zhuanhuan-tw" className="text-emerald-700 hover:text-emerald-800 hover:underline">README.md PDF 轉換</Link></li>
              <li><Link href="/zh-Hant/markdown-docx-zhuanhuan" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown DOCX 轉換</Link></li>
              <li><Link href="/zh-Hant/markdown-pdf-wuxu-zhuce" className="text-emerald-700 hover:text-emerald-800 hover:underline">無需註冊 Markdown PDF</Link></li>
            </ul>
          </div>
        </article>
        <Footer locale={locale} dict={dict} />
              {/* Related tool suite cross-links */}
        <RelatedTools locale={locale} current="comparison" />
      </main>
    </ConverterProvider>
  );
}
