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
    title: "Markdown sang PDF không cần đăng ký | Markdown Free",
    description:
      "Chuyển đổi Markdown sang PDF mà không cần tạo tài khoản. Không đăng nhập, không email, không theo dõi. Chỉ cần tải lên và chuyển đổi.",
    keywords: [
      "markdown pdf không đăng ký",
      "chuyển đổi md không tài khoản",
      "markdown pdf ẩn danh",
      "chuyển đổi pdf không đăng nhập",
      "chuyển đổi markdown miễn phí",
    ],
    alternates: {
      canonical: "/vi/markdown-pdf-khong-dang-ky",
    },
    openGraph: {
      title: "Markdown sang PDF không cần đăng ký | Markdown Free",
      description:
        "Chuyển đổi Markdown sang PDF mà không cần tạo tài khoản. Không đăng nhập, không theo dõi.",
      locale: "vi_VN",
    },
  };
}

export default async function MarkdownPdfKhongDangKyPage({
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
        <h1>Markdown sang PDF không cần đăng ký</h1>

        <p className="lead text-lg text-slate-600">
          Chán với việc các công cụ trực tuyến luôn yêu cầu đăng ký tài khoản?
          Markdown Free cho phép bạn chuyển đổi Markdown sang PDF không cần đăng ký, không email, không theo dõi.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Chuyển đổi ngay — Không cần đăng nhập
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Tại sao &quot;Không cần đăng ký&quot; quan trọng</h2>
        <p>
          Tại sao nhiều công cụ chuyển đổi trực tuyến yêu cầu tạo tài khoản?
        </p>
        <ul>
          <li>Để bán gói trả phí cho bạn</li>
          <li>Để gửi email marketing</li>
          <li>Để theo dõi hoạt động người dùng</li>
          <li>Để kiếm tiền từ dữ liệu</li>
        </ul>
        <p>
          <strong>Chúng tôi khác biệt.</strong> Markdown Free là một công cụ đơn giản
          làm một việc và làm tốt việc đó. Không đòi hỏi gì đổi lại.
        </p>

        <h2>Cách sử dụng</h2>
        <ol>
          <li>Mở Markdown Free</li>
          <li>Kéo thả file <code>.md</code></li>
          <li>Nhấn &quot;Sang PDF&quot;</li>
          <li>Tải xuống — xong!</li>
        </ol>
        <p>
          Không có form nào phải điền. Không có &quot;xác minh email&quot;.
          Không có &quot;bắt đầu dùng thử miễn phí&quot;.
        </p>

        <h2>Cam kết về quyền riêng tư</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Không cần đăng ký tài khoản</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Không có cookie theo dõi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>File không được lưu trữ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Kết nối HTTPS được mã hóa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>Phân tích tôn trọng quyền riêng tư (Umami)</span>
            </li>
          </ul>
        </div>

        <h2>Câu hỏi thường gặp</h2>

        <h3>Thật sự không cần đăng ký sao?</h3>
        <p>
          Đúng vậy! Trên trang web của chúng tôi thậm chí không có nút &quot;Đăng ký&quot;.
          Mở trang, chuyển đổi file, đóng trang. Xong.
        </p>

        <h3>Các bạn kiếm tiền bằng cách nào?</h3>
        <p>
          Markdown Free là dự án cá nhân. Chúng tôi không kiếm tiền từ dữ liệu người dùng
          hoặc bán dịch vụ. Đây chỉ đơn giản là một công cụ hữu ích.
        </p>

        <h3>Tải lên tài liệu bảo mật có an toàn không?</h3>
        <p>
          Xem trước được xử lý hoàn toàn trong trình duyệt của bạn. Khi tạo PDF,
          file được xử lý trong bộ nhớ máy chủ rồi xóa ngay lập tức.
          Chúng tôi không lưu, không ghi log, không phân tích file của bạn.
        </p>

        <h3>Có giới hạn số lần chuyển đổi mỗi ngày không?</h3>
        <p>
          Không! Chuyển đổi bao nhiêu tùy thích, bất cứ lúc nào.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Không đăng ký. Không rắc rối. Dùng ngay.
          </p>
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Bắt đầu ngay
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
