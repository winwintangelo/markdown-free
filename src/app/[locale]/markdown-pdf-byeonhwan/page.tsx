import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";

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
    title: "마크다운 PDF 변환 무료 | Markdown PDF 변환 | Markdown Free",
    description:
      "마크다운 PDF 변환 무료 — .md 파일을 PDF로 변환. 회원가입 불필요, 파일 저장 없음. 드래그 앤 드롭으로 간편하게.",
    keywords: [
      "마크다운 pdf 변환",
      "마크다운 pdf",
      "markdown pdf 변환",
      "md pdf 변환 무료",
      "markdown 변환 온라인",
      "readme pdf 변환",
    ],
    alternates: {
      canonical: "/ko/markdown-pdf-byeonhwan",
    },
    openGraph: {
      title: "마크다운 PDF 변환 무료 | Markdown Free",
      description:
        "마크다운 PDF 변환 — .md 파일을 PDF로 무료 변환. 회원가입 불필요.",
      locale: "ko_KR",
    },
  };
}

export default async function MarkdownPdfByeonhwanPage({
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
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>마크다운 PDF 변환 - 무료, 회원가입 불필요</h1>

        <p className="lead text-lg text-slate-600">
          <strong>마크다운 PDF 변환</strong>을 찾고 계신가요?
          <code>.md</code> 파일을 드래그 앤 드롭하면 몇 초 만에 전문적인 PDF로 변환됩니다.
          회원가입도 설치도 필요 없습니다. 완전 무료!
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            지금 무료로 변환하기
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>사용 방법</h2>
        <ol>
          <li>
            <strong>파일 업로드</strong> — <code>.md</code> 또는 <code>.markdown</code> 파일을 드래그 앤 드롭
          </li>
          <li>
            <strong>미리보기 확인</strong> — 포맷된 마크다운을 즉시 확인
          </li>
          <li>
            <strong>PDF 다운로드</strong> — &quot;PDF&quot; 버튼을 클릭하여 다운로드
          </li>
        </ol>

        <h2>Markdown Free를 선택하는 이유</h2>
        <ul>
          <li>
            <strong>완전 무료</strong> — 숨겨진 비용이나 구독료가 없습니다
          </li>
          <li>
            <strong>회원가입 불필요</strong> — 이메일이나 개인정보를 요청하지 않습니다
          </li>
          <li>
            <strong>개인정보 보호</strong> — 파일이 서버에 저장되지 않습니다
          </li>
          <li>
            <strong>빠른 변환</strong> — 몇 초 만에 변환 완료
          </li>
          <li>
            <strong>GFM 지원</strong> — 테이블, 체크리스트, 취소선 등 지원
          </li>
        </ul>

        <h2>지원 포맷</h2>
        <p>
          PDF 외에도 다음 형식으로 내보낼 수 있습니다:
        </p>
        <ul>
          <li><strong>HTML</strong> — 웹 게시용</li>
          <li><strong>TXT</strong> — 일반 텍스트</li>
        </ul>

        <h2>자주 묻는 질문</h2>

        <h3>정말 무료인가요?</h3>
        <p>
          네! Markdown Free는 완전히 무료입니다. 프리미엄 플랜도, 일일 제한도,
          숨겨진 유료 기능도 없습니다.
        </p>

        <h3>파일이 안전한가요?</h3>
        <p>
          걱정 없이 사용하세요. 미리보기는 브라우저 내에서 처리되고,
          PDF 변환 시에도 파일은 메모리에서 처리 후 즉시 삭제됩니다.
          파일이 저장되는 일은 절대 없습니다.
        </p>

        <h3>파일 크기 제한이 있나요?</h3>
        <p>
          5MB까지의 파일을 지원합니다. 일반적인 마크다운 문서에는
          충분한 크기입니다.
        </p>

        <h3>모바일에서도 사용할 수 있나요?</h3>
        <p>
          네! 스마트폰과 태블릿에 최적화된 인터페이스로
          이용하실 수 있습니다.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            마크다운을 지금 바로 PDF로 변환해 보세요
          </p>
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            무료로 시작하기
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">관련 페이지</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/ko/markdown-pdf-hoewon-gaibeop-eobs-i" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                회원가입 없이 Markdown PDF 변환
              </Link>
            </li>
            <li>
              <Link href="/ko/readme-pdf-byeonhwan" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                README.md PDF 변환
              </Link>
            </li>
            <li>
              <Link href="/ko/markdown-byeonhwan-bigyo" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Markdown 변환기 비교
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
