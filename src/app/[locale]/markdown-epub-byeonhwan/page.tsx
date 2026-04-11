import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, isValidLocale, type Locale } from "@/i18n";

// Only show this page for Korean locale
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
    title: "마크다운 EPUB 변환 – 무료 온라인 도구 | Markdown Free",
    description:
      "마크다운 파일을 EPUB로 무료로 변환하세요. 회원가입 불필요, 제한 없음. Kindle, Apple Books, Kobo 등 전자책 리더에서 읽기에 완벽합니다.",
    keywords: [
      "마크다운 epub 변환",
      "markdown epub 무료",
      "md epub 변환기",
      "마크다운 전자책",
      "markdown ebook 한국어",
    ],
    alternates: {
      canonical: "/ko/markdown-epub-byeonhwan",
    },
    openGraph: {
      title: "마크다운 EPUB 변환 – 무료 온라인 도구 | Markdown Free",
      description:
        "마크다운 파일을 EPUB로 무료로 변환하세요. 회원가입 불필요, 개인정보 보호.",
      locale: "ko_KR",
    },
  };
}

export default async function MarkdownEpubByeonhwanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  // Only render for Korean
  if (localeParam !== "ko") {
    notFound();
  }

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          마크다운을 EPUB로 변환 – 무료 도구
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          마크다운 파일을 EPUB 전자책으로 변환하세요. Kindle, Apple Books,
          Kobo 등 전자책 리더에서 문서를 읽기에 완벽합니다.
          제목에서 목차와 챕터를 자동으로 생성합니다.
        </p>
        <Link
          href="/ko"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          지금 시작하기 — 무료 <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Why EPUB Section */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          왜 마크다운을 EPUB로 변환할까요?
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>어디서든 읽기</strong> – EPUB는 Kindle, Apple Books, Kobo, Google Play 북스 등 모든 주요 전자책 리더에서 작동합니다.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>리플로우 텍스트</strong> – PDF와 달리 EPUB 콘텐츠는 화면 크기, 글꼴 설정, 읽기 모드에 맞게 조정됩니다.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>자동 챕터 생성</strong> – 마크다운 제목이 탐색 가능한 챕터와 목차로 변환됩니다.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500">&#10003;</span>
            <span><strong>오프라인 읽기</strong> – 한 번 다운로드하면 인터넷 연결 없이 어디서든 읽을 수 있습니다.</span>
          </li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          마크다운을 EPUB로 변환하는 방법
        </h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
            <div>
              <h3 className="font-medium text-slate-900">업로드 또는 붙여넣기</h3>
              <p className="text-sm text-slate-600">.md 파일을 드래그 앤 드롭하거나 마크다운 텍스트를 직접 붙여넣으세요.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
            <div>
              <h3 className="font-medium text-slate-900">미리보기</h3>
              <p className="text-sm text-slate-600">변환 전에 포맷된 문서를 실시간으로 확인하세요.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
            <div>
              <h3 className="font-medium text-slate-900">EPUB로 내보내기</h3>
              <p className="text-sm text-slate-600">&ldquo;EPUB로&rdquo;를 클릭하면 전자책이 즉시 다운로드됩니다.</p>
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
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              이 마크다운-EPUB 변환기는 무료인가요?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              네! Markdown Free는 숨겨진 비용, 프리미엄 플랜, 회원가입 요구 없이 100% 무료입니다.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              EPUB가 Kindle에서 작동하나요?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              네. 최신 Kindle 기기는 EPUB를 기본 지원합니다. 구형 모델의 경우 &ldquo;Kindle로 보내기&rdquo; 기능이나 Calibre를 사용하여 EPUB를 MOBI로 변환할 수 있습니다.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              챕터는 어떻게 생성되나요?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Markdown Free는 H1 제목(H1이 없으면 H2)에서 문서를 자동으로 챕터로 나누고 탐색 가능한 목차를 생성합니다.
            </p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              파일이 서버에 저장되나요?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              아니요. 파일은 메모리에서 처리되며 변환 후 즉시 삭제됩니다. 콘텐츠를 저장하지 않습니다.
            </p>
          </details>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">관련 도구</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/ko" className="text-purple-600 hover:text-purple-700 hover:underline">
            마크다운 → PDF
          </Link>
          <Link href="/markdown-to-docx" className="text-purple-600 hover:text-purple-700 hover:underline">
            마크다운 → DOCX
          </Link>
          <Link href="/readme-to-pdf" className="text-purple-600 hover:text-purple-700 hover:underline">
            README → PDF
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/ko"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          지금 마크다운을 EPUB로 변환 <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          무료 &bull; 회원가입 불필요 &bull; 즉시 다운로드
        </p>
      </section>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
