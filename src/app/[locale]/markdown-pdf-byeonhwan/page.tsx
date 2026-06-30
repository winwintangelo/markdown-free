import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { hreflangAlternates } from "@/lib/tool-links";
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
    title: "마크다운 PDF 변환 — 무료, 회원가입 없이, 한글 깨짐 없이 (2026) | Markdown Free",
    description:
      ".md 파일을 PDF로 즉시 변환. 드래그 앤 드롭, 즉시 다운로드. 무료, 회원가입 없이, 설치 없이, 한글 깨짐 없이. GFM 표·체크리스트·코드 블록 지원. Noto Sans CJK 폰트 내장. 2026 최신.",
    keywords: [
      "마크다운 pdf 변환",
      "md pdf 변환",
      "markdown pdf 변환",
      "md pdf 변환 무료",
      "markdown 변환 온라인",
      "마크다운 pdf 회원가입 없이",
      "markdown pdf 한글",
      "markdown pdf 2026",
    ],
    alternates: {
      canonical: "/ko/markdown-pdf-byeonhwan",
      languages: hreflangAlternates("pdf"),
    },
    openGraph: {
      title: "마크다운 PDF 변환 — 무료, 회원가입 없이 (2026)",
      description:
        ".md → PDF 무료 변환기. 드래그 앤 드롭, 즉시 다운로드. 한글 깨짐 없이.",
      locale: "ko_KR",
    },
  };
}

const faq = [
  { q: "마크다운을 PDF로 어떻게 변환하나요?", a: "Markdown Free에 .md 파일을 드래그 앤 드롭하거나 Markdown 텍스트를 붙여넣고, 미리보기로 확인한 뒤 \"PDF로 내보내기\"를 클릭하면 됩니다. 약 10초, 회원가입과 설치 없이." },
  { q: "마크다운 PDF 변환은 정말 무료인가요?", a: "네. Markdown Free는 100% 무료입니다. 프리미엄 등급, 회원가입, 사용량 제한, PDF 워터마크가 없습니다." },
  { q: "회원가입 없이 마크다운을 PDF로 변환할 수 있나요?", a: "가능합니다. Markdown Free는 계정이 필요 없습니다. 모든 파일은 브라우저(HTML/TXT) 또는 서버리스 메모리(PDF/DOCX/EPUB)에서 처리되며 절대 저장되지 않습니다." },
  { q: "한글이 들어 있는 마크다운도 PDF로 변환하면 깨지지 않나요?", a: "깨지지 않습니다. Markdown Free는 PDF 렌더 파이프라인에 Noto Sans CJK KR 글꼴을 임베드하므로 한글, 한자, 일본어, 중국어가 모두 □□□ 두부 글자 없이 정확하게 표시됩니다." },
  { q: "GitHub README.md도 PDF로 변환할 수 있나요?", a: "네. README.md, CHANGELOG.md, CONTRIBUTING.md 등 GitHub의 .md 파일을 \"Raw\" 버튼으로 저장한 뒤 Markdown Free에 업로드하면 됩니다." },
  { q: "마크다운 PDF 변환 파일 크기 제한은?", a: "현재 5MB / 파일입니다. 5MB Markdown은 약 75만 단어에 해당하며 거의 모든 실제 문서를 커버합니다." },
  { q: "내 마크다운 파일이 서버에 저장되나요?", a: "아니요. PDF는 서버리스 메모리에서 생성되고 즉시 폐기됩니다. HTML과 TXT 내보내기는 전적으로 브라우저에서 처리되며 컴퓨터 밖으로 나가지 않습니다." },
  { q: "표, 코드 블록, 체크리스트 같은 GFM 형식이 유지되나요?", a: "네. GFM의 표, 체크리스트, 코드 블록(구문 강조 포함), 취소선, 자동 링크 등이 모두 PDF 출력에 정확하게 보존됩니다." },
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
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
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

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            마크다운을 지금 바로 PDF로 변환해 보세요
          </p>
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            무료로 시작하기
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Related tool suite cross-links */}
        <RelatedTools locale={locale} current="pdf" />
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
    </>
  );
}
