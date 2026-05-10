import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

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
    title: "README.md PDF 변환 — 무료, 회원가입 없이 (2026) | Markdown Free",
    description:
      "GitHub README.md를 전문적인 PDF로 변환. 드래그 앤 드롭으로 .md 파일 업로드, 즉시 PDF 다운로드. 무료, 회원가입 없이, 한글 깨짐 없이. GFM 표·체크리스트·코드 블록 지원. 2026 최신.",
    keywords: [
      "readme pdf 변환",
      "readme.md pdf 변환",
      "github readme pdf",
      "readme 변환 무료",
      "readme pdf 회원가입 없이",
      "github readme pdf 한글",
      "markdown readme pdf 2026",
    ],
    alternates: {
      canonical: "/ko/readme-pdf-byeonhwan",
    },
    openGraph: {
      title: "README.md PDF 변환 — 무료, 회원가입 없이 (2026)",
      description:
        "GitHub README.md → PDF 무료 변환기. 드래그 앤 드롭, 즉시 다운로드. 한글 깨짐 없이.",
      locale: "ko_KR",
    },
  };
}

const faq = [
  { q: "GitHub README를 PDF로 어떻게 변환하나요?", a: "GitHub 저장소에서 README.md를 열어 \"Raw\" 버튼을 클릭하고 파일을 저장한 뒤, Markdown Free에 드래그 앤 드롭하고 \"PDF로 내보내기\"를 클릭하면 됩니다. 전체 과정 약 10초, 설치 불필요." },
  { q: "GitHub README를 PDF로 다운로드하는 방법은?", a: "GitHub에서 README.md를 열고 \"Raw\"를 클릭해 페이지를 .md 파일로 저장한 뒤, Markdown Free에 업로드하고 PDF로 내보내세요. 전체 흐름이 브라우저 안에서 진행됩니다." },
  { q: "이 README→PDF 변환기는 무료인가요?", a: "네. Markdown Free는 100% 무료이며, 프리미엄 등급, 회원가입, 사용량 제한, PDF 워터마크가 없습니다." },
  { q: "회원가입 없이 README.md를 PDF로 변환할 수 있나요?", a: "네. Markdown Free는 계정이 필요 없습니다. 파일은 브라우저(HTML/TXT) 또는 서버리스 메모리(PDF/DOCX/EPUB)에서 처리되고 절대 저장되지 않습니다." },
  { q: "한글이 들어 있는 README도 깨지지 않나요?", a: "깨지지 않습니다. Markdown Free는 PDF 렌더 파이프라인에 Noto Sans CJK KR 글꼴을 임베드하므로 한글, 한자, 일본어, 중국어가 모두 □□□ 두부 글자 없이 정확하게 표시됩니다." },
  { q: "README의 이미지도 PDF에 포함되나요?", a: "절대 URL(https://...)은 포함됩니다. 저장소의 상대 경로 이미지(./images/foo.png)는 GitHub 외부에서 해석되지 않으므로, 변환 전에 raw.githubusercontent.com URL로 교체하세요." },
  { q: "CHANGELOG.md, CONTRIBUTING.md 같은 다른 Markdown 파일도 변환되나요?", a: "네. .md 또는 .markdown 파일은 모두 가능합니다 — README.md, CHANGELOG.md, CONTRIBUTING.md, /docs 문서까지 전부." },
  { q: "README 파일이 서버에 저장되나요?", a: "아니요. PDF는 서버리스 메모리에서 생성되고 즉시 폐기됩니다. HTML과 TXT 내보내기는 전적으로 브라우저에서 처리되며 컴퓨터 밖으로 나가지 않습니다." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "ko",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

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
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
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

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            README를 프로페셔널한 문서로 변환하세요
          </p>
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            지금 무료로 시작
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">관련 페이지</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/ko/markdown-pdf-byeonhwan" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown PDF 변환 - 무료, 회원가입 불필요
              </Link>
            </li>
            <li>
              <Link href="/ko/markdown-pdf-hoewon-gaibeop-eobs-i" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                회원가입 없이 Markdown PDF 변환
              </Link>
            </li>
            <li>
              <Link href="/ko/markdown-byeonhwan-bigyo" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown 변환기 비교
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
    </>
  );
}
