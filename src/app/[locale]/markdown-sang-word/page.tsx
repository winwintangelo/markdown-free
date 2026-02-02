import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

// This page is only for vi locale
export function generateStaticParams() {
  return [{ locale: "vi" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Chuyển đổi Markdown sang Word (DOCX) | Công cụ Miễn phí | Markdown Free",
    description: "Chuyển đổi tệp Markdown thành tài liệu Word (DOCX) ngay lập tức. 100% miễn phí, không cần đăng ký, không quảng cáo. Tệp được xử lý an toàn và không bao giờ được lưu trữ.",
    keywords: [
      "markdown sang word",
      "markdown sang docx",
      "chuyển đổi markdown word",
      "md sang word",
      "markdown to word tiếng việt",
    ],
    alternates: {
      canonical: "https://www.markdown.free/vi/markdown-sang-word",
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
      title: "Chuyển đổi Markdown sang Word (DOCX) | Công cụ Miễn phí",
      description: "Chuyển đổi tệp .md sang định dạng Microsoft Word. Miễn phí, riêng tư, tải xuống ngay lập tức.",
      url: "https://www.markdown.free/vi/markdown-sang-word",
      type: "website",
      locale: "vi_VN",
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownSangWordPage({ params }: PageProps) {
  const { locale } = await params;

  // Only allow vi
  if (locale !== "vi") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Chuyển đổi Markdown sang Word (DOCX) – Công cụ Miễn phí
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Chuyển đổi tệp Markdown của bạn thành tài liệu Microsoft Word chuyên nghiệp.
            Hoàn hảo để chia sẻ tài liệu với đồng nghiệp, nộp báo cáo,
            hoặc tạo tài liệu có thể chỉnh sửa từ ghi chú của bạn.
          </p>
          <Link
            href="/vi"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Bắt đầu Chuyển đổi →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Tại sao chuyển đổi Markdown sang Word?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Tương thích phổ biến</strong> – Tài liệu Word (.docx) hoạt động ở mọi nơi: Microsoft Office, Google Docs, LibreOffice.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Đầu ra có thể chỉnh sửa</strong> – Khác với PDF, tệp Word/DOCX có thể dễ dàng chỉnh sửa bởi người nhận.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Định dạng chuyên nghiệp</strong> – Bảng, khối mã và tiêu đề được giữ nguyên như các kiểu Word phù hợp.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Sẵn sàng cho doanh nghiệp</strong> – Hoàn hảo để nộp tài liệu, báo cáo hoặc đề xuất trong môi trường công ty.</span>
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Ai sử dụng chuyển đổi Markdown sang Word?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Sinh viên</h3>
              <p className="text-sm text-slate-600">Chuyển đổi bản nháp luận văn và báo cáo từ Markdown sang Word để nộp.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Lập trình viên</h3>
              <p className="text-sm text-slate-600">Chuyển đổi tệp README và tài liệu kỹ thuật thành đặc tả Word cho người không chuyên.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Nhà văn</h3>
              <p className="text-sm text-slate-600">Xuất bản thảo viết bằng Markdown sang Word để chỉnh sửa và cộng tác.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Nhóm</h3>
              <p className="text-sm text-slate-600">Chia sẻ tài liệu Markdown dưới dạng tệp Word với đồng nghiệp thích dùng Office.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Cách chuyển đổi Markdown sang Word (DOCX)
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Tải lên hoặc dán</h3>
                <p className="text-sm text-slate-600">Kéo và thả tệp .md của bạn, hoặc dán văn bản Markdown trực tiếp.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Xem trước</h3>
                <p className="text-sm text-slate-600">Xem tài liệu đã định dạng của bạn theo thời gian thực trước khi chuyển đổi.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Xuất sang Word</h3>
                <p className="text-sm text-slate-600">Nhấp "Sang DOCX" và tải xuống tài liệu Word ngay lập tức.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Quyền riêng tư và Bảo mật
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Tệp được xử lý tạm thời trong bộ nhớ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Không bao giờ được lưu trữ trên máy chủ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Kết nối mã hóa HTTPS</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Không cần tạo tài khoản</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Câu hỏi Thường gặp
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Công cụ chuyển đổi Markdown sang Word này có miễn phí không?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Có! Markdown Free hoàn toàn miễn phí 100% không có chi phí ẩn, gói cao cấp hay yêu cầu đăng ký.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Sự khác biệt giữa Word và DOCX là gì?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                DOCX là định dạng tệp được Microsoft Word sử dụng từ năm 2007. Khi nói "tài liệu Word", chúng tôi muốn nói tệp .docx có thể mở trong Word, Google Docs, LibreOffice và các trình xử lý văn bản khác.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Tệp của tôi có được lưu trữ trên máy chủ của bạn không?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Không. Tệp được xử lý trong bộ nhớ và xóa ngay sau khi chuyển đổi. Chúng tôi không bao giờ lưu trữ nội dung của bạn.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Định dạng như bảng và khối mã có được giữ nguyên không?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Có! Bảng, khối mã, tiêu đề, danh sách và các định dạng Markdown khác được chuyển đổi sang các kiểu Word phù hợp.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Chuyển đổi Markdown sang Word Ngay →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Miễn phí • Không cần đăng ký • Tải xuống ngay
          </p>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
