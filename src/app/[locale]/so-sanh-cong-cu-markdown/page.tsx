import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/tool-links";

export function generateStaticParams() { return [{ locale: "vi" }]; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "vi") return {};
  return {
    title: "Công cụ chuyển đổi Markdown sang PDF tốt nhất 2026 | So sánh 8 lựa chọn",
    description: "So sánh 8 công cụ chuyển đổi Markdown sang PDF: Markdown Free, Pandoc, Typora, Dillinger, StackEdit, md-to-pdf, Markdown PDF (VS Code), Online2PDF. Lựa chọn nào phù hợp.",
    keywords: ["so sánh markdown converter", "markdown sang pdf tốt nhất 2026", "markdown pdf miễn phí", "markdown không cần cài đặt", "pandoc vs markdown free", "markdown pdf trực tuyến"],
    alternates: { canonical: "/vi/so-sanh-cong-cu-markdown", languages: hreflangAlternates("comparison") },
    openGraph: { title: "Công cụ chuyển đổi Markdown sang PDF tốt nhất 2026", description: "So sánh trung thực 8 công cụ Markdown→PDF, kèm theo công cụ thắng cho từng trường hợp sử dụng.", locale: "vi_VN" },
  };
}

const PUBLISH_DATE = "2026-05-09"; const NEXT_REVIEW = "2026-11-09";

const faq = [
  { q: "Tại sao dấu tiếng Việt của tôi bị hỏng hoặc hiện □□□ trong PDF?", a: "Hầu hết các pipeline Markdown→PDF rơi về font chỉ hỗ trợ Latin cơ bản như Helvetica hoặc Times New Roman, không có glyph cho ký tự có dấu hoặc chữ viết phi-Latin. Cách khắc phục là (a) nhúng font hỗ trợ đầy đủ Unicode/CJK như Noto Sans CJK vào pipeline render (Markdown Free làm tự động) hoặc (b) cấu hình bộ chuyển đổi của bạn để dùng nó (Pandoc: --pdf-engine=xelatex -V mainfont=\"Noto Sans CJK JP\")." },
  { q: "Có công cụ chuyển đổi Markdown→PDF miễn phí nào không có quảng cáo?", a: "Có. Markdown Free (không quảng cáo, không theo dõi, không đăng ký), Pandoc (CLI), và tiện ích mở rộng Markdown PDF cho VS Code đều miễn phí và không có quảng cáo. Các trình soạn thảo trình duyệt được lưu trữ như Dillinger và Online2PDF thường được hỗ trợ bằng quảng cáo." },
  { q: "Công cụ chuyển đổi Markdown→PDF tốt nhất không cần cài đặt là gì?", a: "Markdown Free chạy hoàn toàn trong trình duyệt mà không cần cài đặt. StackEdit và Dillinger cũng chạy thuần trình duyệt, nhưng dựa vào font hệ thống nên chữ viết phi-Latin có thể hiện thành ô vuông tùy theo máy người dùng." },
  { q: "Tôi có thể chuyển đổi Markdown sang DOCX (Word) mà không mất định dạng không?", a: "Có. Markdown Free, Pandoc và Typora đều xuất DOCX giữ nguyên tiêu đề, khối mã, bảng và checklist. Đầy đủ nhất là Pandoc; nhanh nhất trong trình duyệt là Markdown Free." },
  { q: "Pandoc còn là lựa chọn tốt nhất vào năm 2026 không?", a: "Pandoc vẫn là bộ chuyển đổi Markdown mạnh nhất cho các trường hợp sử dụng dạng kịch bản, nhưng đối với người dùng không kỹ thuật hoặc không muốn cài LaTeX (~1,5 GB), các công cụ trên trình duyệt như Markdown Free hiện cung cấp chất lượng PDF tương đương mà không cần chi phí cài đặt." },
  { q: "Công cụ chuyển đổi Markdown nào an toàn nhất cho tài liệu nhạy cảm?", a: "Bất kỳ công cụ nào chạy cục bộ — Pandoc, Typora, Markdown PDF (VS Code), md-to-pdf — đều giữ tệp của bạn trên máy của bạn. Trong số các công cụ trình duyệt, Markdown Free xử lý HTML/TXT/DOCX hoàn toàn ở phía client và PDF trong bộ nhớ serverless không lưu trữ. Các công cụ tải lên server (Online2PDF) có rủi ro riêng tư cao nhất." },
  { q: "Markdown Free có giới hạn kích thước tệp không?", a: "Có — hiện tại 5MB mỗi tệp. 5MB Markdown tương đương khoảng 750.000 từ, bao gồm gần như tất cả tài liệu thực. Đối với tệp lớn hơn, Pandoc từ command line không có giới hạn kích thước tích hợp." },
];

const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", inLanguage: "vi", headline: "Công cụ chuyển đổi Markdown sang PDF tốt nhất 2026", description: "So sánh 8 công cụ Markdown→PDF.", datePublished: PUBLISH_DATE, dateModified: PUBLISH_DATE, author: { "@type": "Organization", name: "Markdown Free team", url: "https://www.markdown.free/vi/about" }, publisher: { "@type": "Organization", name: "Markdown Free", url: "https://www.markdown.free" }, mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.markdown.free/vi/so-sanh-cong-cu-markdown" } };
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "vi", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (localeParam !== "vi") notFound();
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <ConverterProvider>
      <LocaleTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Công cụ chuyển đổi Markdown sang PDF tốt nhất 2026</h1>
          <p className="text-sm text-slate-500">Xuất bản {PUBLISH_DATE} ・ Đánh giá tiếp theo {NEXT_REVIEW} ・ Nhóm Markdown Free</p>
          <p className="lead text-lg text-slate-600">Việc chọn công cụ Markdown→PDF tưởng chừng tầm thường — cho đến khi bạn thực sự cần. Lúc đó bạn phải chọn giữa cài LaTeX 1,5 GB (Pandoc), ứng dụng máy tính trả phí (Typora), trình soạn thảo trình duyệt với banner quảng cáo (Dillinger), hoặc một script bạn phải tự ráp lại (md-to-pdf). Với tài liệu chỉ tiếng Anh, hầu hết đều hoạt động. Chúng bắt đầu hỏng khi bạn thêm tiếng Việt có dấu, Hàn, Nhật, Trung hoặc Devanagari — đó là lúc &quot;tốt nhất&quot; thực sự khác biệt.</p>
          <p><strong>Hướng dẫn này so sánh 8 công cụ phổ biến cho năm 2026.</strong> Tóm lại: <Link href="/vi" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link> thắng cho việc dùng trình duyệt không cần cài đặt (đặc biệt với chữ viết phi-Latin), Pandoc thắng cho lô tài liệu kịch bản hóa, Typora thắng cho việc tinh chỉnh ngoại tuyến.</p>

          <h2>So sánh nhanh</h2>
          <div className="not-prose my-6 overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Công cụ</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Phù hợp với</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Giá</th><th className="px-3 py-3 text-left font-semibold text-slate-700">CJK / phi-Latin</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Đầu ra</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Cài đặt</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Riêng tư</th>
            </tr></thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown Free</td><td className="px-3 py-3">Trình duyệt, chữ viết phi-Latin</td><td className="px-3 py-3">Miễn phí</td><td className="px-3 py-3">Có — font Noto được nhúng, không cần thiết lập</td><td className="px-3 py-3">PDF, DOCX, PNG, EPUB, HTML, TXT</td><td className="px-3 py-3">Không có</td><td className="px-3 py-3">Tệp trong bộ nhớ, không lưu trữ</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Pandoc</td><td className="px-3 py-3">Chuyển đổi lô kịch bản hóa</td><td className="px-3 py-3">Miễn phí</td><td className="px-3 py-3">Có cấu hình: <code>--pdf-engine=xelatex -V mainfont</code></td><td className="px-3 py-3">30+ định dạng</td><td className="px-3 py-3">LaTeX (~1,5 GB) cho PDF</td><td className="px-3 py-3">Chỉ cục bộ</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Dillinger</td><td className="px-3 py-3">Chỉnh sửa nhanh trên trình duyệt</td><td className="px-3 py-3">Miễn phí, có quảng cáo</td><td className="px-3 py-3">Chỉ font hệ thống</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">Không có</td><td className="px-3 py-3">Có thể đồng bộ lên cloud</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">StackEdit</td><td className="px-3 py-3">Trình duyệt + đồng bộ Drive</td><td className="px-3 py-3">Miễn phí</td><td className="px-3 py-3">Chỉ font hệ thống</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">Không có</td><td className="px-3 py-3">Đồng bộ cloud tùy chọn</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td><td className="px-3 py-3">Quy trình VS Code</td><td className="px-3 py-3">Miễn phí</td><td className="px-3 py-3">Font hệ thống; CSS có thể tùy chỉnh</td><td className="px-3 py-3">PDF, HTML, PNG, JPEG</td><td className="px-3 py-3">VS Code + Chromium (~170MB)</td><td className="px-3 py-3">Chỉ cục bộ</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">md-to-pdf (npm)</td><td className="px-3 py-3">Pipeline build</td><td className="px-3 py-3">Miễn phí</td><td className="px-3 py-3">Có thể tùy chỉnh qua CSS + Puppeteer</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Node.js + Chromium</td><td className="px-3 py-3">Chỉ cục bộ</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Typora</td><td className="px-3 py-3">Trình soạn thảo ngoại tuyến tinh tế</td><td className="px-3 py-3">Trả phí (mua một lần, chưa xác minh tại thời điểm viết)</td><td className="px-3 py-3">Font hệ thống; phụ thuộc vào theme</td><td className="px-3 py-3">PDF, HTML, DOCX</td><td className="px-3 py-3">Ứng dụng máy tính</td><td className="px-3 py-3">Chỉ cục bộ</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Online2PDF</td><td className="px-3 py-3">Chuyển đổi tệp tổng quát</td><td className="px-3 py-3">Miễn phí, có quảng cáo</td><td className="px-3 py-3">Hạn chế; không phải Markdown gốc</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Không có</td><td className="px-3 py-3">Tệp được tải lên server</td></tr>
            </tbody>
          </table></div>

          <h2>Markdown Free</h2>
          <p>Trình chuyển đổi Markdown trên trình duyệt chạy hoàn toàn phía client cho xuất HTML, TXT và DOCX; tạo PDF chạy trên hạ tầng serverless với tệp được xử lý trong bộ nhớ và bị loại bỏ ngay lập tức. Được xây dựng trên nguyên tắc rằng việc thêm đăng ký, quảng cáo hoặc trình theo dõi sẽ làm tác vụ 30 giây trở nên khó chịu.</p>
          <p><strong>Xử lý chữ viết phi-Latin:</strong> nhúng Noto Sans CJK JP/KR/SC/TC và Noto Sans Devanagari trực tiếp vào pipeline render PDF. Không cần cờ font, không cần cài đặt, không có ô vuông hỏng.</p>
          <p><strong>Ưu điểm:</strong> không đăng ký, không cookie theo dõi, phân tích thân thiện với riêng tư, UI 10 ngôn ngữ, đầu ra DOCX mạnh để chuyển đổi Markdown do AI tạo ra thành tài liệu Word doanh nghiệp.<br /><strong>Nhược điểm:</strong> giới hạn 5MB mỗi tệp, không có chế độ ngoại tuyến (cần trình duyệt), không render toán LaTeX/MathJax, không hàng loạt (mỗi lần một tệp), không thể tùy chỉnh kiểu PDF.<br /><strong>Phù hợp với:</strong> bất kỳ ai cần chuyển đổi Markdown sang PDF, DOCX hoặc EPUB ngay bây giờ mà không cần cài đặt, đặc biệt cho chữ viết phi-Latin.</p>
          <p><Link href="/vi" className="text-emerald-700 hover:text-emerald-800 hover:underline">markdown.free/vi</Link> (hoặc trực tiếp <Link href="/vi/markdown-pdf-khong-dang-ky" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF không cần đăng ký</Link>, <Link href="/vi/chuyen-doi-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">README sang PDF</Link>)</p>

          <h2>Pandoc</h2>
          <p>Trình chuyển đổi tài liệu phổ quát dòng lệnh, tiêu chuẩn vàng cho việc sử dụng theo lô và pipeline. Chuyển đổi 30+ định dạng bao gồm Markdown, LaTeX, DOCX, EPUB và PDF.</p>
          <p><strong>Chữ viết phi-Latin:</strong> engine LaTeX mặc định (<code>pdflatex</code>) không xử lý CJK, Devanagari, tiếng Ả Rập hoặc tiếng Do Thái. Để có đầu ra đọc được, bạn phải dùng <code>--pdf-engine=xelatex</code> (hoặc <code>lualatex</code>) và thêm <code>-V mainfont=&quot;Noto Sans CJK JP&quot;</code> (hoặc font phù hợp với chữ viết của bạn). Font Noto thích hợp cũng phải được cài đặt trên hệ thống.</p>
          <p><strong>Ưu điểm:</strong> trình chuyển đổi mạnh mẽ và linh hoạt nhất; hệ sinh thái plugin/filter khổng lồ; tiêu chuẩn trong xuất bản học thuật và kỹ thuật.<br /><strong>Nhược điểm:</strong> tạo PDF cần cài LaTeX (TeX Live ~1,5 GB trên macOS); đường cong học tập dốc; CJK và các chữ viết phi-Latin khác cần cấu hình rõ ràng mà người mới không biết.<br /><strong>Phù hợp với:</strong> pipeline chuyển đổi kịch bản hóa, xuất bản học thuật, người viết kỹ thuật quen với dòng lệnh.</p>
          <p><a href="https://pandoc.org" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">pandoc.org</a></p>

          <h2>Dillinger</h2>
          <p>Trình soạn thảo Markdown trên trình duyệt với xem trước trực tiếp và xuất cơ bản. Mã nguồn mở, với phiên bản được lưu trữ tại dillinger.io.</p>
          <p><strong>Chữ viết phi-Latin:</strong> xem trước kế thừa fallback font của trình duyệt; xuất PDF dùng font có sẵn trong hệ thống. Chữ viết phi-Latin có thể trông đúng trong xem trước nhưng rơi về font mặc định khi xuất PDF, tùy thuộc vào hệ thống của người dùng.</p>
          <p><strong>Ưu điểm:</strong> trình soạn thảo split-pane quen thuộc, miễn phí, tích hợp Dropbox/Google Drive/GitHub.<br /><strong>Nhược điểm:</strong> phiên bản lưu trữ có quảng cáo; trạng thái tài liệu có thể đồng bộ với các dịch vụ cloud được kết nối; kiểm soát kiểu PDF hạn chế.<br /><strong>Phù hợp với:</strong> chỉnh sửa nhanh và xuất thỉnh thoảng cho tài liệu chữ viết Latin.</p>
          <p><a href="https://dillinger.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">dillinger.io</a></p>

          <h2>StackEdit</h2>
          <p>Trình soạn thảo Markdown trên trình duyệt với hỗ trợ đồng bộ cloud mạnh (Google Drive, Dropbox, GitHub) và hỗ trợ MathJax cho render toán học.</p>
          <p><strong>Chữ viết phi-Latin:</strong> giống như Dillinger, dựa vào font trình duyệt/hệ thống. Không có Noto tích hợp.</p>
          <p><strong>Ưu điểm:</strong> UI sạch, render toán học, đồng bộ cloud đa thiết bị.<br /><strong>Nhược điểm:</strong> xuất PDF qua pipeline in của trình duyệt, kiểu đầu ra hạn chế bởi quy ước print stylesheet; đồng bộ cloud cần quyền Google/Dropbox.<br /><strong>Phù hợp với:</strong> người viết muốn trình soạn thảo Markdown với đồng bộ cloud và cần toán học MathJax.</p>
          <p><a href="https://stackedit.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">stackedit.io</a></p>

          <h2>Markdown PDF (tiện ích VS Code)</h2>
          <p>Tiện ích VS Code xuất tệp Markdown hiện tại sang PDF, HTML, PNG hoặc JPEG. Render qua phiên bản Chromium được đóng gói (tải xuống lần đầu sử dụng, ~170MB).</p>
          <p><strong>Chữ viết phi-Latin:</strong> dùng font hệ thống của Chromium. CJK và Devanagari xuất hiện nếu OS có font cài đặt (hầu hết các bản cài đặt macOS/Windows/Linux hiện đại đều có cho các chữ viết chính). Có thể tùy chỉnh qua CSS — người dùng nâng cao có thể chỉ định quy tắc <code>@font-face</code> để nhúng font cụ thể.</p>
          <p><strong>Ưu điểm:</strong> tích hợp với quy trình VS Code; có thể tùy chỉnh cao qua CSS; chỉ cục bộ — không phụ thuộc mạng sau khi tải Chromium.<br /><strong>Nhược điểm:</strong> cần VS Code; lần đầu tải ~170MB; xuất đầu tiên chậm.<br /><strong>Phù hợp với:</strong> developer đã thoải mái trong VS Code và muốn xuất PDF một phím tắt.</p>
          <p><a href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">VS Code Marketplace</a></p>

          <h2>md-to-pdf (npm)</h2>
          <p>CLI/thư viện Node.js chuyển đổi Markdown sang PDF dùng Puppeteer (đi kèm Chromium). Được thiết kế cho pipeline build và quy trình tùy chỉnh.</p>
          <p><strong>Chữ viết phi-Latin:</strong> dùng font hệ thống của Chromium. Có thể tùy chỉnh qua injection CSS — người dùng nâng cao có thể <code>@import</code> font web (bao gồm Noto) vào CSS render.</p>
          <p><strong>Ưu điểm:</strong> có thể script hóa, có thể tạo theme, nhanh cho lô sau khi cài đặt, mã nguồn mở.<br /><strong>Nhược điểm:</strong> cần Node.js và Chromium Puppeteer (~170MB cài đặt lần đầu); kiểu mặc định cần làm việc CSS để có chất lượng sản xuất.<br /><strong>Phù hợp với:</strong> pipeline build tùy chỉnh, CI/CD tạo PDF từ tài liệu.</p>
          <p><a href="https://github.com/simonhaenisch/md-to-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">github.com/simonhaenisch/md-to-pdf</a></p>

          <h2>Typora</h2>
          <p>Trình soạn thảo Markdown WYSIWYG tinh tế cho máy tính (macOS, Windows, Linux). Miễn phí đến năm 2021; hiện trả phí (giấy phép một lần, giá chưa xác minh tại thời điểm viết — kiểm tra typora.io).</p>
          <p><strong>Chữ viết phi-Latin:</strong> tốt theo mặc định cho hầu hết các chữ viết qua font hệ thống. Phụ thuộc vào theme — một số theme cung cấp stack được tối ưu hóa cho CJK.</p>
          <p><strong>Ưu điểm:</strong> trình soạn thảo WYSIWYG đẳng cấp; xuất tinh tế; xử lý font vững chắc; không quảng cáo hoặc telemetry sau khi cấp phép.<br /><strong>Nhược điểm:</strong> trả phí; chỉ máy tính — không có phiên bản trình duyệt; không có tính năng nhóm hoặc cloud.<br /><strong>Phù hợp với:</strong> người viết solo muốn trình soạn thảo ngoại tuyến tinh tế và không ngại chi phí giấy phép một lần.</p>
          <p><a href="https://typora.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">typora.io</a></p>

          <h2>Online2PDF</h2>
          <p>Trình chuyển đổi tệp web tổng quát xử lý nhiều định dạng (Word, Excel, PDF, hình ảnh, v.v.). Markdown được hỗ trợ thông qua chuyển đổi tổng quát.</p>
          <p><strong>Chữ viết phi-Latin:</strong> hạn chế và chưa được xác minh tại thời điểm viết. Không được thiết kế là công cụ Markdown gốc, vì vậy hành vi với khối mã, bảng và font CJK không nhất quán.</p>
          <p><strong>Ưu điểm:</strong> xử lý nhiều định dạng ngoài Markdown; không cần cài đặt.<br /><strong>Nhược điểm:</strong> tệp được tải lên server (lo ngại về riêng tư cho nội dung nhạy cảm); giao diện đầy quảng cáo; render Markdown tổng quát — khối mã, bảng và checklist có thể không render đúng; kiểu đầu ra không thể tùy chỉnh.<br /><strong>Phù hợp với:</strong> chuyển đổi thỉnh thoảng khi bạn có hỗn hợp các định dạng và Markdown chỉ tình cờ tham gia.</p>
          <p><a href="https://online2pdf.com" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">online2pdf.com</a></p>

          <h2>Cách chọn</h2>
          <ul>
            <li><strong>Bạn cần chuyển đổi tệp Markdown sang PDF/DOCX/EPUB ngay bây giờ trong trình duyệt, không cần đăng ký — đặc biệt với nội dung tiếng Việt có dấu, Hàn/Nhật/Trung/Hindi/Ả Rập</strong> → <Link href="/vi" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link></li>
            <li><strong>Bạn thoải mái với CLI, đã cài LaTeX (hoặc có thể cài), và muốn pipeline kịch bản hóa</strong> → Pandoc</li>
            <li><strong>Bạn sống trong VS Code và muốn xuất một phím tắt</strong> → Markdown PDF (tiện ích VS Code)</li>
            <li><strong>Bạn xây dựng pipeline CI/CD tạo PDF từ Markdown</strong> → md-to-pdf hoặc Pandoc</li>
            <li><strong>Bạn muốn trình soạn thảo WYSIWYG ngoại tuyến tinh tế và không ngại trả phí</strong> → Typora</li>
            <li><strong>Bạn cần Markdown được đồng bộ cloud với hỗ trợ toán</strong> → StackEdit</li>
            <li><strong>Bạn làm chỉnh sửa thỉnh thoảng chỉ trong chữ viết Latin</strong> → Dillinger hoặc StackEdit</li>
          </ul>

          <h2>Câu hỏi thường gặp</h2>
          {faq.map((item, i) => (<div key={i}><h3>{item.q}</h3><p>{item.a}</p></div>))}

          <h2>Tiết lộ</h2>
          <p>Bài viết này được xuất bản bởi nhóm đứng sau <Link href="/vi" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>, một trong các công cụ được so sánh ở trên. Chúng tôi cố gắng cụ thể về các trường hợp công cụ khác thắng — Pandoc cho pipeline kịch bản hóa, Typora cho tinh chỉnh ngoại tuyến, VS Code Markdown PDF cho quy trình trong trình soạn thảo. Liên kết đến đối thủ cạnh tranh dùng <code>rel=&quot;nofollow&quot;</code>. Nếu bạn tìm thấy lỗi sự kiện, <Link href="/vi/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">cho chúng tôi biết</Link> và chúng tôi sẽ sửa.</p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">Thử Markdown Free — không cài đặt, không đăng ký, không có ô vuông hỏng</p>
            <Link href="/vi" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800">Mở Markdown Free<span aria-hidden="true">→</span></Link>
          </div>

          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Trang liên quan</h2>
            <ul className="space-y-2">
              <li><Link href="/vi/chuyen-doi-markdown-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">Chuyển đổi Markdown sang PDF - Miễn phí</Link></li>
              <li><Link href="/vi/markdown-pdf-khong-dang-ky" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF không cần đăng ký</Link></li>
              <li><Link href="/vi/chuyen-doi-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">README.md sang PDF</Link></li>
              <li><Link href="/vi/markdown-sang-word" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown sang Word (DOCX)</Link></li>
            </ul>
          </div>
        </article>
        <Footer locale={locale} dict={dict} />
      </main>
    </ConverterProvider>
  );
}
