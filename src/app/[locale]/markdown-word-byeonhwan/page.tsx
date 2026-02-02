import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

// This page is only for ko locale
export function generateStaticParams() {
  return [{ locale: "ko" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markdown Word(DOCX) 변환 | 무료 온라인 도구 | Markdown Free",
    description: "Markdown 파일을 Word 문서(DOCX)로 즉시 변환하세요. 100% 무료, 회원가입 불필요, 광고 없음. 파일은 안전하게 처리되며 저장되지 않습니다.",
    keywords: [
      "markdown word 변환",
      "markdown docx 변환",
      "md word 변환",
      "마크다운 워드 변환",
      "markdown to word 한국어",
    ],
    alternates: {
      canonical: "https://www.markdown.free/ko/markdown-word-byeonhwan",
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
      title: "Markdown Word(DOCX) 변환 | 무료 온라인 도구",
      description: ".md 파일을 Microsoft Word 형식으로 변환합니다. 무료, 프라이빗, 즉시 다운로드.",
      url: "https://www.markdown.free/ko/markdown-word-byeonhwan",
      type: "website",
      locale: "ko_KR",
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarkdownWordByeonhwanPage({ params }: PageProps) {
  const { locale } = await params;

  // Only allow ko
  if (locale !== "ko") {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Markdown Word(DOCX) 변환 – 무료 온라인 도구
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Markdown 파일을 전문적인 Microsoft Word 문서로 변환하세요.
            비기술직 동료와 문서를 공유하거나, 보고서를 제출하거나,
            메모에서 편집 가능한 문서를 만들기에 완벽합니다.
          </p>
          <Link
            href="/ko"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            변환 시작하기 →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            왜 Markdown을 Word로 변환하나요?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>범용 호환성</strong> – Word 문서(.docx)는 Microsoft Office, Google Docs, LibreOffice 등 어디서나 작동합니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>편집 가능한 출력</strong> – PDF와 달리 Word/DOCX 파일은 수신자가 쉽게 편집할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>전문적인 서식</strong> – 표, 코드 블록, 제목이 적절한 Word 스타일로 유지됩니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>비즈니스 대응</strong> – 기업 환경에서 문서, 보고서, 제안서를 제출하기에 적합합니다.</span>
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Markdown에서 Word 변환 사용자
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">학생</h3>
              <p className="text-sm text-slate-600">논문과 보고서 초안을 Markdown에서 Word로 변환하여 제출합니다.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">개발자</h3>
              <p className="text-sm text-slate-600">README 파일과 기술 문서를 비기술자용 Word 사양서로 변환합니다.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">작가</h3>
              <p className="text-sm text-slate-600">Markdown으로 작성한 원고를 Word로 내보내 편집 및 협업합니다.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">팀</h3>
              <p className="text-sm text-slate-600">Office를 선호하는 동료와 Markdown 문서를 Word 파일로 공유합니다.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Markdown을 Word(DOCX)로 변환하는 방법
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">업로드 또는 붙여넣기</h3>
                <p className="text-sm text-slate-600">.md 파일을 드래그 앤 드롭하거나 Markdown 텍스트를 직접 붙여넣으세요.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">미리보기</h3>
                <p className="text-sm text-slate-600">변환 전에 서식이 적용된 문서를 실시간으로 확인하세요.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Word로 내보내기</h3>
                <p className="text-sm text-slate-600">"DOCX로"를 클릭하여 Word 문서를 즉시 다운로드하세요.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            개인정보 보호 및 보안
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>파일은 메모리에서 일시적으로 처리</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>서버에 저장되지 않음</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>HTTPS 암호화 연결</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>계정 생성 불필요</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                이 Markdown Word 변환 도구는 무료인가요?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                네! Markdown Free는 숨겨진 비용, 프리미엄 플랜, 회원가입 없이 100% 무료입니다.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Word와 DOCX의 차이점은 무엇인가요?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                DOCX는 2007년 이후 Microsoft Word에서 사용되는 파일 형식입니다. "Word 문서"라고 하면 Word, Google Docs, LibreOffice 및 기타 워드 프로세서에서 열 수 있는 .docx 파일을 의미합니다.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                내 파일이 서버에 저장되나요?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                아니요. 파일은 메모리에서 처리되고 변환 후 즉시 삭제됩니다. 콘텐츠를 저장하지 않습니다.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                표와 코드 블록 같은 서식이 유지되나요?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                네! 표, 코드 블록, 제목, 목록 및 기타 Markdown 서식이 적절한 Word 스타일로 변환됩니다.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            지금 Markdown을 Word로 변환 →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            무료 • 회원가입 불필요 • 즉시 다운로드
          </p>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
