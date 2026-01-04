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
    title: "README.md PDF 변환 | Markdown Free",
    description:
      "GitHub README.md를 전문적인 PDF로 변환. 문서화, 포트폴리오, 프레젠테이션에 최적. 무료, 회원가입 불필요.",
    keywords: [
      "readme pdf 변환",
      "readme.md pdf",
      "github readme pdf",
      "markdown 문서 pdf",
      "readme 변환 무료",
    ],
    alternates: {
      canonical: "/ko/readme-pdf-byeonhwan",
    },
    openGraph: {
      title: "README.md PDF 변환 | Markdown Free",
      description:
        "GitHub README.md를 전문적인 PDF로 변환. 무료, 회원가입 불필요.",
      locale: "ko_KR",
    },
  };
}

export default async function ReadmePdfByeonhwanPage({
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
        <h1>README.md PDF 변환</h1>

        <p className="lead text-lg text-slate-600">
          GitHub 프로젝트의 README.md가 있으신가요? 전문적인 PDF로
          변환하여 문서화, 포트폴리오, 프레젠테이션에 활용하세요.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            README 변환하기
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>README를 PDF로 변환하는 이유</h2>
        <ul>
          <li>
            <strong>오프라인 문서화</strong> — 인터넷 연결 없이
            문서 공유
          </li>
          <li>
            <strong>프로페셔널 포트폴리오</strong> — 프로젝트를
            세련된 형식으로 프레젠테이션
          </li>
          <li>
            <strong>프레젠테이션</strong> — 기술 문서를 슬라이드에 포함
          </li>
          <li>
            <strong>아카이브</strong> — 문서의 정적 버전 저장
          </li>
          <li>
            <strong>인쇄</strong> — 미팅이나 리뷰용 인쇄물
          </li>
        </ul>

        <h2>GitHub Flavored Markdown 완전 지원</h2>
        <p>
          Markdown Free는 GitHub Flavored Markdown(GFM)의 모든 기능을 지원합니다:
        </p>
        <ul>
          <li>✓ 테이블</li>
          <li>✓ 체크리스트 / 태스크 리스트</li>
          <li>✓ 취소선</li>
          <li>✓ 문법 하이라이팅</li>
          <li>✓ 자동 링크</li>
          <li>✓ 이모지 :smile:</li>
        </ul>

        <h2>README 변환 방법</h2>
        <ol>
          <li>
            <strong>README 다운로드</strong> — GitHub 저장소에서 README.md를 열고,
            &quot;Raw&quot;를 클릭하여 파일 저장
          </li>
          <li>
            <strong>Markdown Free에 업로드</strong> — 파일을
            업로드 영역에 드래그 앤 드롭
          </li>
          <li>
            <strong>미리보기 확인</strong> — 포맷이 올바른지 확인
          </li>
          <li>
            <strong>내보내기</strong> — &quot;PDF&quot;를 클릭하여 다운로드
          </li>
        </ol>

        <h2>예시: 일반적인 README</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# 프로젝트명

프로젝트에 대한 간단한 설명.

## 설치

\`\`\`bash
npm install project-name
\`\`\`

## 사용법

\`\`\`javascript
import { myFunction } from 'project-name';
myFunction();
\`\`\`

## 기능

- [x] 완료된 기능
- [ ] 개발 중인 기능

## 라이선스

MIT`}</pre>
        </div>
        <p>
          이 README는 완벽한 포맷으로 PDF로 변환됩니다:
          제목, 코드 블록(문법 하이라이팅 포함), 체크리스트 등
          모든 것이 아름답게 표시됩니다.
        </p>

        <h2>자주 묻는 질문</h2>

        <h3>README 내의 이미지가 포함되나요?</h3>
        <p>
          절대 URL(예: https://...)의 이미지는 PDF에 포함됩니다.
          상대 경로의 이미지는 올바르게 표시되지 않을 수 있습니다.
          전체 URL 사용을 권장합니다.
        </p>

        <h3>저장소의 다른 마크다운 파일도 변환할 수 있나요?</h3>
        <p>
          물론입니다! CHANGELOG.md, CONTRIBUTING.md, /docs 폴더 내의
          문서 등 모든 <code>.md</code> 파일을 지원합니다.
        </p>

        <h3>PDF 포맷을 커스터마이즈할 수 있나요?</h3>
        <p>
          현재 PDF는 가독성을 중시한 전문적인 레이아웃으로
          출력됩니다. 향후 버전에서 커스터마이즈 옵션을 고려 중입니다.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            README를 프로페셔널한 문서로 변환하세요
          </p>
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            지금 무료로 시작
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
