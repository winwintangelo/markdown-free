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
    title: "So sánh công cụ chuyển đổi Markdown 2026 | Markdown Free vs Khác",
    description:
      "So sánh đầy đủ công cụ chuyển đổi Markdown sang PDF. Markdown Free, CloudConvert, LightPDF. Miễn phí, không đăng ký, bảo mật riêng tư.",
    keywords: [
      "so sánh markdown converter",
      "markdown free vs cloudconvert",
      "công cụ chuyển đổi pdf so sánh",
      "converter markdown tốt nhất",
      "chuyển đổi md pdf miễn phí",
    ],
    alternates: {
      canonical: "/vi/so-sanh-cong-cu-markdown",
    },
    openGraph: {
      title: "So sánh công cụ chuyển đổi Markdown 2026 | Markdown Free vs Khác",
      description:
        "So sánh đầy đủ công cụ chuyển đổi Markdown sang PDF. Miễn phí, không đăng ký, bảo mật riêng tư.",
      locale: "vi_VN",
    },
  };
}

export default async function SoSanhCongCuMarkdownPage({
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
        <h1>So sánh công cụ chuyển đổi Markdown</h1>

        <p className="lead text-lg text-slate-600">
          Đang tìm công cụ chuyển đổi Markdown sang PDF tốt nhất? Dưới đây là so sánh
          trung thực giữa Markdown Free và các lựa chọn phổ biến khác.
        </p>

        {/* Comparison Table */}
        <div className="not-prose my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tính năng</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-700">Markdown Free</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">CloudConvert</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">LightPDF</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">PDFForge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Miễn phí hoàn toàn</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Giới hạn hàng ngày</td>
                <td className="px-4 py-3 text-center text-slate-500">Giới hạn hàng ngày</td>
                <td className="px-4 py-3 text-center text-slate-500">Chỉ desktop</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Không cần đăng ký</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Riêng tư (Không lưu file)</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Lưu tạm thời</td>
                <td className="px-4 py-3 text-center text-slate-500">Cloud storage</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓ (local)</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Xem trước thời gian thực</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">GitHub Flavored Markdown</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">Một phần</td>
                <td className="px-4 py-3 text-center text-slate-500">Một phần</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">Xuất HTML/TXT</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-slate-500">Chỉ PDF</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">Giao diện tiếng Việt</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tại sao chọn Markdown Free</h2>

        <h3>Miễn phí hoàn toàn</h3>
        <p>
          CloudConvert và LightPDF có giới hạn nghiêm ngặt trên gói miễn phí
          (25 lần chuyển đổi mỗi ngày, v.v.), nhưng Markdown Free hoàn toàn miễn phí không giới hạn.
          Không có gói &quot;Pro&quot;. Tất cả tính năng đều có sẵn.
        </p>

        <h3>Ưu tiên riêng tư</h3>
        <p>
          CloudConvert và LightPDF lưu file của bạn trên server (dù là tạm thời).
          Markdown Free không lưu file. Xem trước được xử lý trong trình duyệt,
          PDF được tạo trong bộ nhớ rồi xóa ngay lập tức.
        </p>

        <h3>Đơn giản</h3>
        <p>
          Không cần tạo tài khoản, không có bảng điều khiển phức tạp, không có &quot;credits&quot; phải quản lý.
          Mở trang, kéo file, tải PDF. Xong.
        </p>

        <h3>Xem trước thời gian thực</h3>
        <p>
          Khác với các công cụ chuyển đổi khác, Markdown Free hiển thị xem trước
          tài liệu đã được định dạng trước khi chuyển đổi. Bạn có thể xác nhận
          bảng, code, và định dạng đã đúng.
        </p>

        <h2>Khi nào các công cụ khác phù hợp hơn</h2>
        <p>
          Để công bằng, đây là những tình huống mà các giải pháp khác có thể phù hợp hơn:
        </p>
        <ul>
          <li>
            <strong>CloudConvert</strong> — Nếu bạn cần chuyển đổi giữa
            nhiều định dạng khác ngoài Markdown
          </li>
          <li>
            <strong>PDFForge</strong> — Nếu bạn thích ứng dụng desktop
            cài đặt cục bộ
          </li>
          <li>
            <strong>Pandoc</strong> — Nếu bạn là developer và muốn kiểm soát hoàn toàn
            qua command line
          </li>
        </ul>

        <h2>Tự mình thử</h2>
        <p>
          Cách tốt nhất để quyết định? Thử Markdown Free.
          Thực sự chỉ mất 10 giây.
        </p>

        {/* CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Không giới hạn. Không đăng ký. Không phí.
          </p>
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Thử Markdown Free
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">Trang liên quan</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/vi/chuyen-doi-markdown-pdf" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Chuyển đổi Markdown sang PDF Miễn phí
              </Link>
            </li>
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
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
