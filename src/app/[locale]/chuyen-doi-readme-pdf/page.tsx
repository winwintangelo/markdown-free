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
    title: "Chuyển đổi README.md sang PDF | Markdown Free",
    description:
      "Chuyển đổi README.md từ GitHub thành PDF chuyên nghiệp. Phù hợp cho tài liệu, portfolio, thuyết trình. Miễn phí, không cần đăng ký.",
    keywords: [
      "chuyển đổi readme pdf",
      "readme.md pdf",
      "github readme pdf",
      "tài liệu markdown pdf",
      "chuyển đổi readme miễn phí",
    ],
    alternates: {
      canonical: "/vi/chuyen-doi-readme-pdf",
    },
    openGraph: {
      title: "Chuyển đổi README.md sang PDF | Markdown Free",
      description:
        "Chuyển đổi README.md từ GitHub thành PDF chuyên nghiệp. Miễn phí, không cần đăng ký.",
      locale: "vi_VN",
    },
  };
}

export default async function ChuyenDoiReadmePdfPage({
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
        <h1>Chuyển đổi README.md sang PDF</h1>

        <p className="lead text-lg text-slate-600">
          Bạn có README.md từ dự án GitHub? Chuyển đổi thành PDF chuyên nghiệp
          cho tài liệu, portfolio, hoặc thuyết trình.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Chuyển đổi README
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Tại sao chuyển README sang PDF?</h2>
        <ul>
          <li>
            <strong>Tài liệu offline</strong> — Chia sẻ tài liệu không cần internet
          </li>
          <li>
            <strong>Portfolio chuyên nghiệp</strong> — Trình bày dự án với định dạng đẹp
          </li>
          <li>
            <strong>Thuyết trình</strong> — Đưa tài liệu kỹ thuật vào slide
          </li>
          <li>
            <strong>Lưu trữ</strong> — Lưu phiên bản tĩnh của tài liệu
          </li>
          <li>
            <strong>In ấn</strong> — Tài liệu giấy cho họp hoặc đánh giá
          </li>
        </ul>

        <h2>Hỗ trợ đầy đủ GitHub Flavored Markdown</h2>
        <p>
          Markdown Free hỗ trợ tất cả tính năng của GitHub Flavored Markdown (GFM):
        </p>
        <ul>
          <li>✓ Bảng</li>
          <li>✓ Danh sách kiểm tra / Task list</li>
          <li>✓ Gạch ngang</li>
          <li>✓ Tô màu cú pháp</li>
          <li>✓ Liên kết tự động</li>
          <li>✓ Emoji :smile:</li>
        </ul>

        <h2>Cách chuyển đổi README</h2>
        <ol>
          <li>
            <strong>Tải README</strong> — Trong repository GitHub, mở README.md,
            nhấn &quot;Raw&quot;, rồi lưu file
          </li>
          <li>
            <strong>Tải lên Markdown Free</strong> — Kéo thả file vào vùng tải lên
          </li>
          <li>
            <strong>Kiểm tra xem trước</strong> — Đảm bảo định dạng đúng
          </li>
          <li>
            <strong>Xuất</strong> — Nhấn &quot;Sang PDF&quot; để tải xuống
          </li>
        </ol>

        <h2>Ví dụ: README thông thường</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# Tên Dự Án

Mô tả ngắn về dự án.

## Cài đặt

\`\`\`bash
npm install ten-du-an
\`\`\`

## Cách dùng

\`\`\`javascript
import { hamCuaToi } from 'ten-du-an';
hamCuaToi();
\`\`\`

## Tính năng

- [x] Tính năng đã hoàn thành
- [ ] Tính năng đang phát triển

## Giấy phép

MIT`}</pre>
        </div>
        <p>
          README này sẽ được chuyển đổi sang PDF với định dạng hoàn hảo:
          tiêu đề, khối code (với tô màu cú pháp), danh sách kiểm tra,
          tất cả đều hiển thị đẹp mắt.
        </p>

        <h2>Câu hỏi thường gặp</h2>

        <h3>Hình ảnh trong README có được bao gồm không?</h3>
        <p>
          Hình ảnh với URL tuyệt đối (như https://...) sẽ được bao gồm trong PDF.
          Hình ảnh với đường dẫn tương đối có thể không hiển thị đúng.
          Khuyến nghị sử dụng URL đầy đủ.
        </p>

        <h3>Có thể chuyển đổi file Markdown khác trong repository không?</h3>
        <p>
          Tất nhiên! CHANGELOG.md, CONTRIBUTING.md, tài liệu trong thư mục /docs,
          tất cả file <code>.md</code> đều được hỗ trợ.
        </p>

        <h3>Có thể tùy chỉnh định dạng PDF không?</h3>
        <p>
          Hiện tại PDF sử dụng bố cục chuyên nghiệp được tối ưu cho khả năng đọc.
          Chúng tôi đang xem xét các tùy chọn tùy chỉnh cho phiên bản tương lai.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Chuyển README thành tài liệu chuyên nghiệp
          </p>
          <Link
            href="/vi"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Dùng thử miễn phí ngay
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
