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
    title: "회원가입 없이 Markdown PDF 변환 | Markdown Free",
    description:
      "계정 생성 없이 마크다운을 PDF로 변환. 로그인 없음, 이메일 없음, 추적 없음. 업로드하고 변환하기만 하면 됩니다.",
    keywords: [
      "markdown pdf 회원가입 없이",
      "md 변환 계정 불필요",
      "markdown pdf 익명",
      "pdf변환 로그인 없이",
      "markdown 변환 무료",
    ],
    alternates: {
      canonical: "/ko/markdown-pdf-hoewon-gaibeop-eobs-i",
    },
    openGraph: {
      title: "회원가입 없이 Markdown PDF 변환 | Markdown Free",
      description:
        "계정 생성 없이 마크다운을 PDF로 변환. 로그인 없음, 추적 없음.",
      locale: "ko_KR",
    },
  };
}

export default async function MarkdownPdfNoSignupPage({
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
        <h1>회원가입 없이 Markdown PDF 변환</h1>

        <p className="lead text-lg text-slate-600">
          매번 계정을 만들라고 요구하는 온라인 도구에 지치셨나요?
          Markdown Free는 회원가입 없이, 이메일 없이, 추적 없이 마크다운을 PDF로 변환합니다.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            지금 바로 변환 — 로그인 불필요
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>&quot;회원가입 불필요&quot;가 중요한 이유</h2>
        <p>
          많은 온라인 변환 도구가 왜 계정 생성을 요구할까요?
        </p>
        <ul>
          <li>유료 플랜 업셀링</li>
          <li>마케팅 이메일 발송</li>
          <li>사용자 행동 추적</li>
          <li>데이터 수익화</li>
        </ul>
        <p>
          <strong>저희는 다릅니다.</strong> Markdown Free는 한 가지 일을 심플하게
          처리하는 도구입니다. 대가를 요구하지 않고 순수하게 유용한 서비스를 제공합니다.
        </p>

        <h2>사용 방법</h2>
        <ol>
          <li>Markdown Free 열기</li>
          <li><code>.md</code> 파일 드래그 앤 드롭</li>
          <li>&quot;PDF&quot; 클릭</li>
          <li>다운로드 — 끝!</li>
        </ol>
        <p>
          입력 폼 없음. &quot;이메일 확인&quot; 없음. &quot;무료 체험 시작&quot; 없음.
        </p>

        <h2>개인정보 보호 약속</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>회원가입 불필요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>추적 쿠키 없음</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>파일 저장 안 함</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>HTTPS 암호화 연결</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>프라이버시 중심 분석 도구 (Umami)</span>
            </li>
          </ul>
        </div>

        <h2>자주 묻는 질문</h2>

        <h3>정말로 회원가입 안 해도 되나요?</h3>
        <p>
          네! 저희 사이트에는 &quot;가입&quot; 버튼조차 없습니다.
          페이지를 열고, 파일을 변환하고, 닫으면 됩니다. 그게 전부입니다.
        </p>

        <h3>어떻게 수익을 내나요?</h3>
        <p>
          Markdown Free는 개인 프로젝트입니다. 사용자의 데이터를 수익화하거나
          서비스를 판매하지 않습니다. 단순히 유용한 도구로 존재합니다.
        </p>

        <h3>기밀 문서를 업로드해도 괜찮나요?</h3>
        <p>
          미리보기는 완전히 브라우저 내에서 처리됩니다. PDF 생성 시,
          서버 메모리에서 처리되고 즉시 삭제됩니다.
          파일의 저장, 로그 기록, 분석은 전혀 하지 않습니다.
        </p>

        <h3>하루 변환 횟수에 제한이 있나요?</h3>
        <p>
          없습니다! 원하는 만큼, 언제든지 변환할 수 있습니다.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            회원가입 없이. 번거로움 없이. 바로 시작.
          </p>
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            지금 시작하기
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
