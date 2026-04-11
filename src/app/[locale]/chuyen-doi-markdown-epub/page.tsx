import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";

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
    title: "Chuyển đổi Markdown sang EPUB miễn phí | Markdown Free",
    description:
      "Chuyển đổi file Markdown sang EPUB miễn phí. Không cần đăng ký, không giới hạn. Hoàn hảo để đọc trên Kindle, Apple Books, Kobo và các thiết bị đọc sách điện tử khác.",
    keywords: [
      "chuyển đổi markdown sang epub",
      "markdown epub miễn phí",
      "công cụ chuyển đổi markdown epub",
      "md sang epub tiếng việt",
      "markdown ebook miễn phí",
    ],
    alternates: {
      canonical: "/vi/chuyen-doi-markdown-epub",
    },
    openGraph: {
      title: "Chuyển đổi Markdown sang EPUB miễn phí | Markdown Free",
      description:
        "Chuyển đổi file Markdown sang EPUB miễn phí. Không cần đăng ký, bảo mật đảm bảo.",
      locale: "vi_VN",
    },
  };
}

export default async function ChuyenDoiMarkdownEpubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  // Only render for Vietnamese
  if (localeParam !== "vi") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Chuyển đổi Markdown sang EPUB miễn phí
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Chuyển đổi file Markdown của bạn thành ebook EPUB. Hoàn hảo để đọc
          tài liệu trên Kindle, Apple Books, Kobo hoặc bất kỳ thiết bị đọc sách điện tử nào.
          Tự động tạo mục lục và chương từ các tiêu đề của bạn.
        </p>
        <Link
          href="/vi"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Bắt đầu ngay — Miễn phí <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why EPUB Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Tại sao chuyển đổi Markdown sang EPUB?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Đọc mọi nơi</strong> – EPUB hoạt động trên Kindle, Apple Books, Kobo, Google Play Sách và tất cả các thiết bị đọc sách điện tử chính.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Văn bản tự điều chỉnh</strong> – Khác với PDF, nội dung EPUB tự động điều chỉnh theo kích thước màn hình, tùy chọn phông chữ và chế độ đọc.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Tự động tạo chương</strong> – Các tiêu đề Markdown của bạn trở thành các chương có thể điều hướng với mục lục tự động.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>Đọc ngoại tuyến</strong> – Tải xuống một lần, đọc mọi nơi mà không cần kết nối internet.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Cách chuyển đổi Markdown sang EPUB
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
            <div>
              <h3 className="font-medium text-slate-900">Tải lên hoặc Dán</h3>
              <p className="text-sm text-slate-600">Kéo và thả file .md của bạn, hoặc dán trực tiếp văn bản Markdown.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
            <div>
              <h3 className="font-medium text-slate-900">Xem trước</h3>
              <p className="text-sm text-slate-600">Xem tài liệu đã được định dạng theo thời gian thực trước khi chuyển đổi.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
            <div>
              <h3 className="font-medium text-slate-900">Xuất sang EPUB</h3>
              <p className="text-sm text-slate-600">Nhấn &ldquo;Sang EPUB&rdquo; và tải xuống ebook của bạn ngay lập tức.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Câu hỏi thường gặp
        </h2>
        <div className="space-y-4">
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Công cụ chuyển đổi Markdown sang EPUB này có miễn phí không?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Có! Markdown Free miễn phí 100% không có chi phí ẩn, gói cao cấp hay yêu cầu đăng ký.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              EPUB có hoạt động trên Kindle không?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Có. Các thiết bị Kindle hiện đại hỗ trợ EPUB gốc. Đối với các mẫu cũ hơn, bạn có thể sử dụng tính năng &ldquo;Gửi đến Kindle&rdquo; hoặc Calibre để chuyển đổi EPUB sang MOBI.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Các chương được tạo như thế nào?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Markdown Free tự động chia tài liệu của bạn thành các chương tại tiêu đề H1 (hoặc H2 nếu không có H1) và tạo mục lục có thể điều hướng.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              File của tôi có được lưu trữ trên máy chủ của bạn không?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Không. File của bạn được xử lý trong bộ nhớ và xóa ngay sau khi chuyển đổi. Chúng tôi không bao giờ lưu trữ nội dung của bạn.
            </p>
          </details>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Công cụ liên quan</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/vi" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown sang PDF
          </Link>
          <Link href="/markdown-to-docx" className="text-purple-600 hover:text-purple-700 hover:underline">
            Markdown sang DOCX
          </Link>
          <Link href="/readme-to-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            README sang PDF
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/vi"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Chuyển đổi Markdown sang EPUB ngay <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Miễn phí &bull; Không cần đăng ký &bull; Tải xuống ngay
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
