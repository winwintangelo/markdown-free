import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

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
    title: "Chuyển đổi Markdown sang PDF Miễn phí | Markdown Free",
    description:
      "Chuyển đổi file Markdown sang PDF miễn phí. Không cần đăng ký, file không được lưu trữ. Kéo thả để chuyển đổi. Hỗ trợ GitHub Flavored Markdown.",
    keywords: [
      "chuyển đổi markdown pdf",
      "md sang pdf miễn phí",
      "công cụ chuyển đổi markdown",
      "chuyển đổi markdown trực tuyến",
      "readme sang pdf",
    ],
    alternates: {
      canonical: "/vi/chuyen-doi-markdown-pdf",
    },
    openGraph: {
      title: "Chuyển đổi Markdown sang PDF Miễn phí | Markdown Free",
      description:
        "Chuyển đổi file Markdown sang PDF miễn phí. Không cần đăng ký, bảo mật riêng tư.",
      locale: "vi_VN",
    },
  };
}

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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>Có thật sự miễn phí không?</h3>
        <p>
          Có! Markdown Free hoàn toàn miễn phí. Không có gói cao cấp, không giới hạn hàng ngày,
          không có tính năng trả phí ẩn.
        </p>

        <h3>File của tôi có an toàn không?</h3>
        <p>
          An toàn và bảo mật. Xem trước được xử lý trong trình duyệt của bạn,
          và khi chuyển đổi PDF, file được xử lý trong bộ nhớ rồi xóa ngay lập tức.
          File không bao giờ được lưu trữ.
        </p>

        <h3>Giới hạn kích thước file là bao nhiêu?</h3>
        <p>
          Hỗ trợ file lên đến 5MB. Quá đủ cho tài liệu Markdown thông thường.
        </p>

        <h3>Có dùng được trên điện thoại không?</h3>
        <p>
          Có! Giao diện đã được tối ưu cho điện thoại thông minh và máy tính bảng.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Chuyển đổi Markdown sang PDF ngay bây giờ
          </p>
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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
              <Link href="/vi/markdown-pdf-khong-dang-ky" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown sang PDF không cần đăng ký
              </Link>
            </li>
            <li>
              <Link href="/vi/chuyen-doi-readme-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Chuyển đổi README.md sang PDF
              </Link>
            </li>
            <li>
              <Link href="/vi/so-sanh-cong-cu-markdown" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                So sánh công cụ chuyển đổi Markdown
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
