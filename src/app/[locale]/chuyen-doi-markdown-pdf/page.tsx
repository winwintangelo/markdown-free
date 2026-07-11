import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { hreflangAlternates } from "@/lib/tool-links";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for Vietnamese locale
export function generateStaticParams() {
  return [{ locale: "vi" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "vi") {
    return {};
  }

  return {
    title: "Chuyển đổi Markdown sang PDF — Miễn phí, Không Đăng ký (2026) | Markdown Free",
    description:
      "Công cụ chuyển đổi Markdown sang PDF trực tuyến miễn phí. Kéo thả file .md, tải PDF ngay lập tức. Không đăng ký, không cài đặt, không watermark. Dấu tiếng Việt hiển thị chính xác. Bảng, checklist, khối mã GFM được giữ nguyên. Phiên bản 2026.",
    keywords: [
      "chuyển đổi markdown pdf",
      "md sang pdf miễn phí",
      "công cụ chuyển đổi markdown",
      "markdown pdf trực tuyến",
      "markdown sang pdf không đăng ký",
      "markdown pdf tiếng việt",
      "readme sang pdf",
      "markdown pdf 2026",
    ],
    alternates: {
      canonical: "/vi/chuyen-doi-markdown-pdf",
      languages: hreflangAlternates("pdf"),
    },
    openGraph: {
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB" }],
      title: "Chuyển đổi Markdown sang PDF — Miễn phí, Không Đăng ký (2026)",
      description:
        "Kéo thả .md, tải PDF ngay lập tức. Không đăng ký, không cài đặt, dấu tiếng Việt hiển thị chuẩn.",
      locale: "vi_VN",
    },
  };
}

const faq = [
  { q: "Làm thế nào để chuyển đổi file Markdown sang PDF?", a: "Mở Markdown Free, kéo thả file .md vào khu vực tải lên (hoặc dán văn bản Markdown), xem trước kết quả, rồi nhấn \"Sang PDF\" để tải xuống. Toàn bộ quá trình khoảng 10 giây, không cần cài đặt." },
  { q: "Công cụ chuyển đổi Markdown sang PDF này có miễn phí không?", a: "Có. Markdown Free hoàn toàn miễn phí 100%, không có gói cao cấp, không cần đăng ký, không giới hạn sử dụng và không có watermark trên PDF xuất ra." },
  { q: "Có thể chuyển đổi Markdown sang PDF mà không cần đăng ký không?", a: "Được. Markdown Free không yêu cầu tài khoản. File được xử lý trong trình duyệt (HTML/TXT) hoặc trong bộ nhớ serverless (PDF/DOCX/EPUB) và không bao giờ được lưu trữ." },
  { q: "Dấu tiếng Việt có hiển thị đúng trong PDF không?", a: "Có. Markdown Free nhúng font hỗ trợ đầy đủ Unicode trong pipeline render PDF, nên dấu tiếng Việt, ký tự Hán-Nôm, và các ngôn ngữ khác (Hàn, Nhật, Trung) đều hiển thị chính xác mà không bị □□□ hoặc thiếu dấu." },
  { q: "Có thể chuyển đổi GitHub README.md sang PDF không?", a: "Có. Mở README.md trong repository GitHub, nhấn nút \"Raw\" và lưu file, sau đó tải lên Markdown Free và xuất PDF. CHANGELOG.md, CONTRIBUTING.md và bất kỳ file .md nào cũng được hỗ trợ." },
  { q: "Giới hạn kích thước file là bao nhiêu?", a: "Hiện tại 5MB mỗi file, đủ cho hầu hết tài liệu Markdown thực tế (~750.000 từ Markdown thuần)." },
  { q: "File Markdown của tôi có được lưu trên máy chủ không?", a: "Không. PDF được tạo trong bộ nhớ serverless và bị loại bỏ ngay lập tức. Xuất HTML và TXT được xử lý hoàn toàn trong trình duyệt và không bao giờ rời khỏi máy của bạn." },
  { q: "Bảng, khối mã, checklist GFM có được giữ nguyên trong PDF không?", a: "Có. Tất cả các tính năng GFM — bảng, danh sách công việc, khối mã (với syntax highlighting), gạch ngang, autolink — đều được bảo toàn chính xác trong PDF." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "vi",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function ChuyenDoiMarkdownPdfPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (localeParam !== "vi") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Chuyển đổi Markdown sang PDF - Miễn phí</h1>

        <p className="lead text-lg text-slate-600">
          Bạn muốn chuyển file <code>.md</code> thành PDF chuyên nghiệp?
          Với Markdown Free, hoàn thành trong vài giây. Không cần đăng ký, không cần cài đặt.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Chuyển đổi ngay - Miễn phí
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Cách sử dụng</h2>
        <ol>
          <li>
            <strong>Tải file lên</strong> — Kéo thả file <code>.md</code> hoặc <code>.markdown</code> vào vùng tải lên
          </li>
          <li>
            <strong>Xem trước</strong> — Xem Markdown đã được định dạng ngay lập tức
          </li>
          <li>
            <strong>Tải PDF</strong> — Nhấn nút &quot;Sang PDF&quot; để tải xuống
          </li>
        </ol>

        <h2>Tại sao chọn Markdown Free?</h2>
        <ul>
          <li>
            <strong>100% Miễn phí</strong> — Không có phí ẩn hoặc đăng ký
          </li>
          <li>
            <strong>Không cần đăng ký</strong> — Không yêu cầu email hoặc thông tin cá nhân
          </li>
          <li>
            <strong>Bảo mật riêng tư</strong> — File không được lưu trên máy chủ
          </li>
          <li>
            <strong>Chuyển đổi nhanh</strong> — Hoàn thành trong vài giây
          </li>
          <li>
            <strong>Hỗ trợ GFM</strong> — Bảng, danh sách kiểm tra, gạch ngang, và nhiều hơn
          </li>
        </ul>

        <h2>Định dạng được hỗ trợ</h2>
        <p>
          Ngoài PDF, bạn cũng có thể xuất ra:
        </p>
        <ul>
          <li><strong>HTML</strong> — Để đăng lên web</li>
          <li><strong>TXT</strong> — Văn bản thuần</li>
        </ul>

        <h2>Câu hỏi thường gặp</h2>

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Chuyển đổi Markdown sang PDF ngay bây giờ
          </p>
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Dùng thử miễn phí
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Trang liên quan</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/vi/markdown-pdf-khong-dang-ky" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown sang PDF không cần đăng ký
              </Link>
            </li>
            <li>
              <Link href="/vi/chuyen-doi-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Chuyển đổi README.md sang PDF
              </Link>
            </li>
            <li>
              <Link href="/vi/so-sanh-cong-cu-markdown" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                So sánh công cụ chuyển đổi Markdown
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
            {/* Related tool suite cross-links */}
        <RelatedTools locale={locale} current="pdf" />
      </main>
    </>
  );
}
