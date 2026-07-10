import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { getDictionary, type Locale } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

// Only show this page for the ko locale
export function generateStaticParams() {
  return [{ locale: "ko" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "ko") {
    return {};
  }

  return {
    title: "마크다운 이미지 변환 (PNG) – 무료, 가입 불필요, 글자 깨짐 없음 | Markdown Free",
    description: "마크다운을 브라우저에서 바로 선명한 PNG/JPG 이미지로 변환하세요. 무료, 가입 불필요, 파일 업로드 없음. 긴 문서는 세로 긴 이미지 한 장 또는 ZIP 분할로 내보낼 수 있습니다.",
    keywords: ["마크다운 이미지 변환", "markdown png 변환", "md 이미지 변환", "마크다운 이미지 저장", "markdown jpg"],
    alternates: {
      canonical: "/ko/markdown-imiji-byeonhwan",
      languages: hreflangAlternates("image"),
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og-markdown-to-png.png"],
    },
    openGraph: {
      images: [{ url: "/og-markdown-to-png.png", width: 1200, height: 630, alt: "Markdown to Image (PNG) — Markdown Free" }],
      title: "마크다운 이미지 변환 (PNG) – 무료, 가입 불필요, 글자 깨짐 없음 | Markdown Free",
      description: "마크다운을 브라우저에서 선명한 PNG 이미지로 렌더링. 무료, 가입 불필요.",
      locale: "ko_KR",
    },
  };
}

const faq = [
  {
    "question": "이 마크다운 이미지 변환 도구는 무료인가요?",
    "answer": "네! Markdown Free는 100% 무료이며 숨겨진 비용, 유료 플랜, 가입 요구가 없습니다."
  },
  {
    "question": "긴 문서는 어떻게 처리되나요?",
    "answer": "약 10화면 분량까지는 항상 이미지 한 장으로 내보냅니다. 더 길면 세로로 긴 이미지 한 장(공유하기 쉬움) 또는 ZIP 분할(긴 문서도 선명함) 중에서 선택할 수 있습니다."
  },
  {
    "question": "마크다운이 서버에 업로드되나요?",
    "answer": "아니요. 이미지는 브라우저 안에서 완전히 렌더링되며 마크다운이 기기를 떠나지 않습니다. 문서에서 참조하는 외부 이미지만 표시를 위해 프록시를 통해 가져올 수 있습니다."
  },
  {
    "question": "한글이 깨지지 않나요?",
    "answer": "깨지지 않습니다. 기기에 설치된 글꼴로 렌더링하므로 미리보기 그대로 출력됩니다."
  },
  {
    "question": "JPG로도 내보낼 수 있나요?",
    "answer": "네. 다른 형식 메뉴에서 JPG로 내보낼 수 있습니다. 텍스트 위주 콘텐츠에는 무손실 PNG를 권장합니다."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "ko",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default async function MarkdownImijiByeonhwanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (localeParam !== "ko") {
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
          마크다운을 이미지(PNG)로 변환 – 무료 도구
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          마크다운을 브라우저 안에서 선명한 PNG/JPG 이미지로 렌더링하세요. 카카오톡·슬랙 공유, SNS 게시, 슬라이드 삽입에 딱 맞습니다. 스크린샷 불필요, 글자 깨짐 없음.
        </p>
        <Link
          href="/ko"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          지금 변환하기 — 무료 <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why Image Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          마크다운을 이미지로 변환하는 이유
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>어디서나 공유</strong> – 이미지는 마크다운을 지원하지 않는 채팅 앱, SNS, 슬라이드에서도 그대로 보입니다.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>선명한 글자</strong> – 기기의 픽셀 밀도에 맞춰 렌더링되어 스크린샷보다 훨씬 선명합니다.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>긴 문서 지원</strong> – 글 전체를 세로로 긴 이미지 한 장으로, 또는 화면 크기 단위의 ZIP으로 내보낼 수 있습니다.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">&#10003;</span>
            <span><strong>100% 브라우저 처리</strong> – 업로드가 전혀 없습니다. 마크다운이 기기를 떠나지 않습니다.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          마크다운을 PNG로 변환하는 방법
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
            <div>
              <h3 className="font-medium text-slate-900">업로드 또는 붙여넣기</h3>
              <p className="text-sm text-slate-600">.md 파일을 드래그하거나 마크다운 텍스트를 붙여넣으세요.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
            <div>
              <h3 className="font-medium text-slate-900">미리보기</h3>
              <p className="text-sm text-slate-600">변환 전에 서식이 적용된 문서를 실시간으로 확인하세요.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
            <div>
              <h3 className="font-medium text-slate-900">이미지로 내보내기</h3>
              <p className="text-sm text-slate-600">이미지로 (PNG)를 클릭하면 즉시 다운로드됩니다. JPG는 다른 형식 메뉴에 있습니다.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          자주 묻는 질문
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
          href="/ko"
          className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
        >
          지금 마크다운을 이미지로 변환 <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          무료 &bull; 가입 불필요 &bull; 즉시 다운로드
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
