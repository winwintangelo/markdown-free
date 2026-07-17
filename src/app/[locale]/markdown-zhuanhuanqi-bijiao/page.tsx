import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { ComparisonCta } from "@/components/comparison-cta";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/tool-links";

export function generateStaticParams() {
  return [{ locale: "zh-Hans" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "zh-Hans") return {};
  return {
    title: "Markdown 转 PDF 工具对比 2026 | 8 款免费推荐",
    description: "对比 8 款 Markdown 转 PDF 工具：Markdown Free、Pandoc、Typora、Dillinger、StackEdit、md-to-pdf、Markdown PDF (VS Code)、Online2PDF。中文不乱码的选择。",
    keywords: ["markdown pdf 转换 对比", "markdown pdf 中文乱码", "pandoc 中文 pdf", "markdown 转换器 推荐", "在线 markdown pdf", "markdown 字体豆腐"],
    alternates: { canonical: "/zh-Hans/markdown-zhuanhuanqi-bijiao", languages: hreflangAlternates("comparison") },
    openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB" }], title: "Markdown 转 PDF 工具对比 2026", description: "诚实对比 8 款 Markdown 转 PDF 工具，按用途说明哪款适合你。", locale: "zh_CN" },
  };
}

const PUBLISH_DATE = "2026-05-09";
const NEXT_REVIEW = "2026-11-09";

const faq = [
  { q: "为什么我的中文在 PDF 里变成 □□□（豆腐方块）？", a: "大多数 Markdown 转 PDF 流水线会回退到 Helvetica 或 Times New Roman 等纯西文字体，这些字体没有中文字形。解决办法是 (a) 在渲染管线中嵌入支持中文的字体如 Noto Sans CJK SC（Markdown Free 自动处理），或 (b) 给转换工具显式指定字体（Pandoc：--pdf-engine=xelatex -V mainfont=\"Noto Sans CJK SC\"）。" },
  { q: "有没有免费、无广告的 Markdown 转 PDF 工具？", a: "有。Markdown Free（无广告、无追踪、无注册）、Pandoc（命令行）、VS Code 的 Markdown PDF 扩展都免费且无广告。Dillinger 和 Online2PDF 这类托管型网页工具通常依赖广告。" },
  { q: "无需安装的 Markdown 转 PDF 工具哪款最好？", a: "Markdown Free 完全在浏览器中运行，无需安装。StackEdit 和 Dillinger 也无需安装，但依赖系统字体，因此中文可能因系统而出现乱码。" },
  { q: "把 Markdown 转 DOCX（Word）会丢失格式吗？", a: "不会。Markdown Free、Pandoc 和 Typora 都能输出保留标题、代码块、表格和任务列表的 DOCX。Pandoc 最完整；Markdown Free 是浏览器中最快的。" },
  { q: "2026 年 Pandoc 还是最佳选择吗？", a: "在脚本批处理场景，Pandoc 仍是最强的 Markdown 转换器；但对不愿安装 LaTeX（约 1.5GB）的非技术用户，Markdown Free 这类浏览器工具能在零安装成本下提供相近的 PDF 质量。" },
  { q: "处理机密文档时，哪款转换器最安全？", a: "本地运行的工具（Pandoc、Typora、VS Code 的 Markdown PDF、md-to-pdf）让文件留在本机。浏览器工具中，Markdown Free 在客户端处理 HTML/TXT/DOCX，PDF 在 serverless 内存中生成后立即丢弃；上传到服务器的工具（Online2PDF）隐私风险最高。" },
  { q: "Markdown Free 有文件大小限制吗？", a: "有。目前单文件 5MB。5MB 的 Markdown 大约相当于 75 万字，几乎覆盖所有真实文档。需要更大的文件时，命令行 Pandoc 没有内置大小限制。" },
];

const articleJsonLd = {
  "@context": "https://schema.org", "@type": "Article", inLanguage: "zh-Hans",
  headline: "Markdown 转 PDF 工具对比 2026",
  description: "Markdown 转 PDF 工具 8 款的诚实对比：Markdown Free、Pandoc、Typora、Dillinger、StackEdit、md-to-pdf、Markdown PDF、Online2PDF。",
  datePublished: PUBLISH_DATE, dateModified: PUBLISH_DATE,
  author: { "@type": "Organization", name: "Markdown Free team", url: "https://www.markdown.free/zh-Hans/about" },
  publisher: { "@type": "Organization", name: "Markdown Free", url: "https://www.markdown.free" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.markdown.free/zh-Hans/markdown-zhuanhuanqi-bijiao" },
};
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "zh-Hans", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (localeParam !== "zh-Hans") notFound();
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <ConverterProvider>
      <LocaleTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Markdown 转 PDF 工具对比 2026</h1>
          <p className="text-sm text-slate-500">发布于 {PUBLISH_DATE} ・ 下次审阅 {NEXT_REVIEW} ・ Markdown Free 团队</p>
          <p className="lead text-lg text-slate-600">挑一个 Markdown 转 PDF 的工具，听起来像小事——直到你真的要用。然后你得在 1.5GB 的 LaTeX 安装（Pandoc）、付费桌面应用（Typora）、带广告的浏览器编辑器（Dillinger）和需要自己写脚本的方案（md-to-pdf）之间做选择。英文文档大多都能跑，但加入中文之后就开始翻车。&quot;最好&quot;的分水岭，正是中文是否会变成豆腐。</p>
          <p><strong>本文对比 2026 年的 8 款主流工具。</strong>结论：浏览器中处理中文不出问题，选 <Link href="/zh-Hans" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>；脚本批量转换，选 Pandoc；不介意付费、要离线打磨写作环境，选 Typora。</p>

          {/* 埋点 CTA — 长图优先（微信 webview 里下载文件不便，长图可直接分享）exp comparison-cta-2026-07-16 */}
          <ComparisonCta
            position="top"
            target="image"
            href="/zh-Hans"
            label="把 Markdown 转成长图（PNG）— 免费、无需注册"
            sub="也支持 PDF、Word、EPUB ・ 微信里长图可直接分享"
          />

          <h2>一览对比</h2>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-3 text-left font-semibold text-slate-700">工具</th><th className="px-3 py-3 text-left font-semibold text-slate-700">最适合</th><th className="px-3 py-3 text-left font-semibold text-slate-700">价格</th><th className="px-3 py-3 text-left font-semibold text-slate-700">中文支持</th><th className="px-3 py-3 text-left font-semibold text-slate-700">输出格式</th><th className="px-3 py-3 text-left font-semibold text-slate-700">安装</th><th className="px-3 py-3 text-left font-semibold text-slate-700">隐私</th>
              </tr></thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown Free</td><td className="px-3 py-3">浏览器，中文不乱码</td><td className="px-3 py-3">免费</td><td className="px-3 py-3">完全支持・嵌入 Noto 字体・无需配置</td><td className="px-3 py-3">PDF, DOCX, PNG, EPUB, HTML, TXT</td><td className="px-3 py-3">无</td><td className="px-3 py-3">内存处理，不存储</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Pandoc</td><td className="px-3 py-3">脚本批处理</td><td className="px-3 py-3">免费</td><td className="px-3 py-3">需配置：<code>--pdf-engine=xelatex -V mainfont</code></td><td className="px-3 py-3">30+ 格式</td><td className="px-3 py-3">PDF 需 LaTeX（约 1.5GB）</td><td className="px-3 py-3">仅本地</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Dillinger</td><td className="px-3 py-3">英文快速编辑</td><td className="px-3 py-3">免费、有广告</td><td className="px-3 py-3">依赖系统字体</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">无</td><td className="px-3 py-3">连云盘后会同步</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">StackEdit</td><td className="px-3 py-3">浏览器+网盘同步</td><td className="px-3 py-3">免费</td><td className="px-3 py-3">依赖系统字体</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">无</td><td className="px-3 py-3">同步可选</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td><td className="px-3 py-3">VS Code 工作流</td><td className="px-3 py-3">免费</td><td className="px-3 py-3">系统字体，可用 CSS 配置</td><td className="px-3 py-3">PDF, HTML, PNG, JPEG</td><td className="px-3 py-3">VS Code + Chromium（约 170MB）</td><td className="px-3 py-3">仅本地</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">md-to-pdf (npm)</td><td className="px-3 py-3">构建流水线</td><td className="px-3 py-3">免费</td><td className="px-3 py-3">通过 CSS 与 Puppeteer 配置</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Node.js + Chromium</td><td className="px-3 py-3">仅本地</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Typora</td><td className="px-3 py-3">离线打磨写作</td><td className="px-3 py-3">付费（一次性，写作时点未核实）</td><td className="px-3 py-3">系统字体，主题相关</td><td className="px-3 py-3">PDF, HTML, DOCX</td><td className="px-3 py-3">桌面应用</td><td className="px-3 py-3">仅本地</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Online2PDF</td><td className="px-3 py-3">通用文件转换</td><td className="px-3 py-3">免费、有广告</td><td className="px-3 py-3">有限，非 Markdown 原生</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">无</td><td className="px-3 py-3">文件上传到服务器</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Markdown Free</h2>
          <p>HTML/TXT/DOCX 输出在浏览器端完成，PDF 在 serverless 内存中生成后立刻丢弃。设计原则：&quot;30 秒能完成的事，不要塞注册和广告。&quot;</p>
          <p><strong>中文处理：</strong>把 Noto Sans CJK SC 直接嵌入 PDF 渲染管线，无字体参数、无安装、无豆腐。</p>
          <p><strong>优点：</strong>无注册、无追踪 cookie、隐私友好的分析、UI 支持 10 种语言、AI 生成的 Markdown 转公司 Word 文档时 DOCX 输出强劲。<br /><strong>缺点：</strong>单文件 5MB 上限、不支持离线（需要浏览器）、不支持 LaTeX/MathJax 数学、没有批处理、PDF 样式不可定制。<br /><strong>最适合：</strong>需要现在就在浏览器把 Markdown 转成 PDF/DOCX/EPUB 的人，特别是含中文的文档。</p>
          <p><Link href="/zh-Hans" className="text-emerald-700 hover:text-emerald-800 hover:underline">markdown.free/zh-Hans</Link>（也可直接打开 <Link href="/zh-Hans/markdown-zhuanhuan-word" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown 转 Word</Link> 或 <Link href="/zh-Hans/readme-pdf-zhuanhuan" className="text-emerald-700 hover:text-emerald-800 hover:underline">README 转 PDF</Link>）</p>

          <h2>Pandoc</h2>
          <p>命令行通用文档转换器，可在 30+ 种格式间互转。脚本批处理与流水线场景的事实标准。</p>
          <p><strong>中文处理：</strong>默认 LaTeX 引擎（<code>pdflatex</code>）不支持中文。要得到可读的输出，必须使用 <code>--pdf-engine=xelatex</code>（或 <code>lualatex</code>）并附 <code>-V mainfont=&quot;Noto Sans CJK SC&quot;</code>，且系统中需要安装对应的 Noto 字体。</p>
          <p><strong>优点：</strong>最强大灵活的转换器、巨大的插件/过滤器生态、学术与技术写作的标配。<br /><strong>缺点：</strong>PDF 输出需安装 LaTeX（macOS 的 TeX Live 约 1.5GB）、学习曲线陡、初学者不知道要做中文配置。<br /><strong>最适合：</strong>用脚本批量转换的工程师、学术出版、熟悉命令行的写作者。</p>
          <p><a href="https://pandoc.org" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">pandoc.org</a></p>

          <h2>Dillinger</h2>
          <p>带实时预览的浏览器 Markdown 编辑器，开源，托管版在 dillinger.io。</p>
          <p><strong>中文处理：</strong>预览继承浏览器字体回退；PDF 输出使用系统字体。预览看着正常，PDF 中文却变豆腐的情况并不少见。</p>
          <p><strong>优点：</strong>熟悉的左右分栏、免费、与 Dropbox/Google Drive/GitHub 集成。<br /><strong>缺点：</strong>托管版有广告，编辑状态可能同步到连接的云盘，PDF 样式控制有限。<br /><strong>最适合：</strong>纯英文文档的临时编辑与导出。</p>
          <p><a href="https://dillinger.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">dillinger.io</a></p>

          <h2>StackEdit</h2>
          <p>支持云盘同步（Google Drive、Dropbox、GitHub）和数学公式（MathJax）的浏览器编辑器。</p>
          <p><strong>中文处理：</strong>同 Dillinger，依赖浏览器/系统字体，未自带 Noto。</p>
          <p><strong>优点：</strong>UI 干净、支持数学公式、跨设备云同步。<br /><strong>缺点：</strong>PDF 走浏览器打印通道，样式自由度低；同步需 Google/Dropbox 授权。<br /><strong>最适合：</strong>需要云同步与数学公式的写作者。</p>
          <p><a href="https://stackedit.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">stackedit.io</a></p>

          <h2>Markdown PDF（VS Code 扩展）</h2>
          <p>把 VS Code 当前 Markdown 文件输出为 PDF/HTML/PNG/JPEG 的扩展。首次使用会下载 Chromium（约 170MB）。</p>
          <p><strong>中文处理：</strong>使用 Chromium 字体系统。系统装了中文字体即可显示（现代 macOS/Windows/Linux 大多已装）。可用 CSS 的 <code>@font-face</code> 嵌入特定字体。</p>
          <p><strong>优点：</strong>融入 VS Code 工作流、可用 CSS 灵活定制、本地完成（Chromium 下载完毕后）。<br /><strong>缺点：</strong>需要 VS Code、首次下载 ~170MB、首次导出较慢、配置走 JSON 文件。<br /><strong>最适合：</strong>本来就在 VS Code 里工作、想一键导出 PDF 的开发者。</p>
          <p><a href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">VS Code Marketplace</a></p>

          <h2>md-to-pdf（npm）</h2>
          <p>用 Puppeteer（内嵌 Chromium）把 Markdown 转 PDF 的 Node.js CLI/库，专为构建流水线设计。</p>
          <p><strong>中文处理：</strong>依赖 Chromium 字体。可在 CSS 中 <code>@import</code> Noto 等 Web 字体，稳定渲染中文。</p>
          <p><strong>优点：</strong>可脚本化、可换主题、配置好后批处理快、开源。<br /><strong>缺点：</strong>需要 Node.js 与 Puppeteer Chromium（首装约 170MB）、默认样式需 CSS 调整以达到生产质量。<br /><strong>最适合：</strong>用 CI/CD 从文档生成 PDF 的工程团队。</p>
          <p><a href="https://github.com/simonhaenisch/md-to-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">github.com/simonhaenisch/md-to-pdf</a></p>

          <h2>Typora</h2>
          <p>macOS/Windows/Linux 的桌面 WYSIWYG Markdown 编辑器。2021 年前免费，现在是一次性买断（具体价格写作时点未核实，请查看官网）。</p>
          <p><strong>中文处理：</strong>大多数情况下凭系统字体即可正常显示；是否针对中文做了字体栈优化取决于主题。</p>
          <p><strong>优点：</strong>WYSIWYG 完成度高、输出精致、购买后无广告无遥测。<br /><strong>缺点：</strong>付费、仅桌面、无团队/云功能。<br /><strong>最适合：</strong>独立写作、不介意一次性付费的人。</p>
          <p><a href="https://typora.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">typora.io</a></p>

          <h2>Online2PDF</h2>
          <p>支持 Word、Excel、PDF、图片等多种格式的通用网页转换器，Markdown 也算支持。</p>
          <p><strong>中文处理：</strong>有限，写作时点未做完整验证。它不是 Markdown 原生工具，代码块、表格、中文字体的表现不一致。</p>
          <p><strong>优点：</strong>能处理 Markdown 之外的多种格式、无需安装。<br /><strong>缺点：</strong>文件上传到服务器（机密文档有风险）、广告较多、Markdown 渲染通用化导致表格/任务列表可能变形、样式不可定制。<br /><strong>最适合：</strong>主要诉求是混合格式批量转换、Markdown 只是顺带的一次性场景。</p>
          <p><a href="https://online2pdf.com" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">online2pdf.com</a></p>

          <h2>怎么选（按场景）</h2>
          <ul>
            <li><strong>现在就要在浏览器里把 Markdown 转 PDF/DOCX/EPUB，免注册，特别是含中文</strong> → <Link href="/zh-Hans" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link></li>
            <li><strong>命令行熟手，已装或可装 LaTeX，要脚本化批量</strong> → Pandoc</li>
            <li><strong>VS Code 工作流，要一键导出</strong> → Markdown PDF（VS Code 扩展）</li>
            <li><strong>要在 CI/CD 中从文档生成 PDF</strong> → md-to-pdf 或 Pandoc</li>
            <li><strong>离线打磨写作环境，付费可接受</strong> → Typora</li>
            <li><strong>需要云同步与数学公式</strong> → StackEdit</li>
            <li><strong>纯英文文档的一次性编辑</strong> → Dillinger 或 StackEdit</li>
          </ul>

          <h2>常见问题</h2>
          {faq.map((item, i) => (<div key={i}><h3>{item.q}</h3><p>{item.a}</p></div>))}

          <h2>利益声明</h2>
          <p>本文由对比表中出现的 <Link href="/zh-Hans" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link> 团队撰写。我们尽量把其他工具更适合的场景写明：Pandoc 适合脚本流水线，Typora 适合离线打磨，VS Code 的 Markdown PDF 适合编辑器内工作流。外部链接均加 <code>rel=&quot;nofollow&quot;</code>。如果发现事实错误，请通过 <Link href="/zh-Hans/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">这里</Link> 联系我们，我们会修正。</p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-2 text-lg font-medium text-slate-700">试用 Markdown Free —— 无需安装、无需注册、无中文乱码</p>
            <ComparisonCta position="bottom" href="/zh-Hans" label="打开 Markdown Free" className="my-2" />
          </div>

          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">相关页面</h2>
            <ul className="space-y-2">
              <li><Link href="/zh-Hans/markdown-pdf-zhuanhuan" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF 转换 - 免费、无需注册</Link></li>
              <li><Link href="/zh-Hans/readme-pdf-zhuanhuan" className="text-emerald-700 hover:text-emerald-800 hover:underline">README.md PDF 转换</Link></li>
              <li><Link href="/zh-Hans/markdown-zhuanhuan-word" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown 转 Word</Link></li>
              <li><Link href="/zh-Hans/markdown-pdf-mianzhuce" className="text-emerald-700 hover:text-emerald-800 hover:underline">免注册 Markdown PDF</Link></li>
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
