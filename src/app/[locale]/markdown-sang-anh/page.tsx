import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for the vi locale
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
    title: "Chuyển đổi Markdown sang Ảnh PNG – Miễn phí, Riêng tư, Không cần đăng ký | Markdown Free",
    description: "Chuyển Markdown thành ảnh PNG hoặc JPG sắc nét ngay trong trình duyệt. Miễn phí, không cần đăng ký, không tải lên gì cả. Tài liệu dài xuất thành một ảnh dài hoặc ZIP gồm nhiều phần.",
    keywords: ["markdown sang png", "markdown sang ảnh", "markdown sang jpg", "md sang png", "chuyển markdown thành ảnh"],
    alternates: {
      canonical: "/vi/markdown-sang-anh",
      languages: hreflangAlternates("image"),
    },
    openGraph: {
      title: "Chuyển đổi Markdown sang Ảnh PNG – Miễn phí, Riêng tư, Không cần đăng ký | Markdown Free",
      description: "Kết xuất tệp .md thành ảnh PNG sắc nét, hoàn toàn trong trình duyệt. Miễn phí và riêng tư.",
      locale: "vi_VN",
    },
  };
}

const faq = [
  {
    "question": "Công cụ chuyển Markdown sang PNG này có miễn phí không?",
    "answer": "Có! Markdown Free miễn phí 100%, không có chi phí ẩn, gói cao cấp hay yêu cầu đăng ký."
  },
  {
    "question": "Tài liệu dài được xử lý thế nào?",
    "answer": "Tài liệu tới khoảng mười màn hình luôn được xuất thành một ảnh duy nhất. Dài hơn thì bạn được chọn: một ảnh dài (dễ chia sẻ) hoặc ZIP gồm các phần vừa màn hình (sắc nét hơn với tài liệu rất dài)."
  },
  {
    "question": "Markdown của tôi có bị tải lên máy chủ không?",
    "answer": "Không. Ảnh được kết xuất hoàn toàn trong trình duyệt — Markdown không bao giờ rời khỏi thiết bị của bạn. Chỉ những ảnh từ xa được tham chiếu trong tài liệu mới có thể được lấy qua proxy của chúng tôi để hiển thị trong kết quả."
  },
  {
    "question": "Tiếng Việt có hiển thị đúng không?",
    "answer": "Có. Ảnh được kết xuất bằng phông chữ trên chính thiết bị của bạn, nên dấu tiếng Việt hiển thị chính xác như trong bản xem trước."
  },
  {
    "question": "Tôi có thể xuất JPG thay vì PNG không?",
    "answer": "Có. Xuất JPG nằm trong menu Định dạng khác. Với nội dung văn bản, nên dùng PNG vì không mất dữ liệu, viền chữ luôn sắc nét."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "vi",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default async function MarkdownSangAnhPage({
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Chuyển Markdown sang Ảnh (PNG) – Công cụ Miễn phí
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Biến Markdown của bạn thành ảnh PNG hoặc JPG sắc nét, được kết xuất hoàn toàn trong trình duyệt. Hoàn hảo để chia sẻ ghi chú qua ứng dụng chat, đăng văn bản có định dạng lên mạng xã hội, hoặc chèn vào slide.
        </p>
        <Link
          href="/vi"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          Bắt đầu Chuyển đổi <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why Image Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Tại sao nên chuyển Markdown thành ảnh?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Chia sẻ mọi nơi</strong> – ảnh hoạt động trong mọi ứng dụng chat, mạng xã hội và slide, kể cả nơi không hỗ trợ Markdown.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Chữ sắc nét</strong> – kết xuất theo mật độ điểm ảnh của thiết bị nên chữ luôn sắc nét, không như ảnh chụp màn hình bị mờ.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>Hỗ trợ tài liệu dài</strong> – xuất cả bài viết thành một ảnh dài, hoặc chia thành ZIP gồm các phần vừa màn hình.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>100% trong trình duyệt</strong> – không có gì được tải lên; Markdown của bạn không bao giờ rời khỏi thiết bị.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Cách chuyển Markdown sang PNG
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
            <div>
              <h3 className="font-medium text-slate-900">Tải lên hoặc dán</h3>
              <p className="text-sm text-slate-600">Kéo thả tệp .md của bạn, hoặc dán trực tiếp văn bản Markdown.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
            <div>
              <h3 className="font-medium text-slate-900">Xem trước</h3>
              <p className="text-sm text-slate-600">Xem tài liệu đã định dạng theo thời gian thực trước khi chuyển đổi.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
            <div>
              <h3 className="font-medium text-slate-900">Xuất thành ảnh</h3>
              <p className="text-sm text-slate-600">Nhấp Sang Ảnh (PNG) và ảnh sẽ tải xuống ngay. JPG nằm trong Định dạng khác.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Câu hỏi Thường gặp
        </h2>
        <div className="space-y-4">
          {faq.map((item) => (
            <details key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related tool suite cross-links */}
      <RelatedTools locale={locale} current="image" />

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/vi"
          className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          Chuyển Markdown sang PNG Ngay <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Miễn phí &bull; Không cần đăng ký &bull; Tải xuống ngay
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
