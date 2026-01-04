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
    title: "Markdown 변환기 비교 2026 | Markdown Free vs 다른 서비스",
    description:
      "Markdown PDF 변환 도구 철저 비교. Markdown Free, CloudConvert, LightPDF의 차이점. 무료, 회원가입 불필요, 개인정보 보호.",
    keywords: [
      "markdown 변환 비교",
      "markdown free vs cloudconvert",
      "pdf변환도구 비교",
      "추천 markdown 변환",
      "무료 md pdf 변환",
    ],
    alternates: {
      canonical: "/ko/markdown-byeonhwan-bigyo",
    },
    openGraph: {
      title: "Markdown 변환기 비교 2026 | Markdown Free vs 다른 서비스",
      description:
        "Markdown PDF 변환 도구 철저 비교. 무료, 회원가입 불필요, 개인정보 보호.",
      locale: "ko_KR",
    },
  };
}

export default async function MarkdownByeonhwanBigyoPage({
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
        <h1>Markdown 변환기 비교</h1>

        <p className="lead text-lg text-slate-600">
          최적의 Markdown PDF 변환 도구를 찾고 계신가요? Markdown Free와
          인기 있는 다른 서비스를 솔직하게 비교합니다.
        </p>

        {/* Comparison Table */}
        <div className="not-prose my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">기능</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-700">Markdown Free</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">CloudConvert</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">LightPDF</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">PDFForge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">완전 무료</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">일일 제한</td>
                <td className="px-4 py-3 text-center text-slate-500">일일 제한</td>
                <td className="px-4 py-3 text-center text-slate-500">데스크톱만</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">회원가입 불필요</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">개인정보 보호 (파일 미저장)</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">임시 저장</td>
                <td className="px-4 py-3 text-center text-slate-500">클라우드 저장</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓ (로컬)</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">실시간 미리보기</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">GitHub Flavored Markdown</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-slate-500">일부 지원</td>
                <td className="px-4 py-3 text-center text-slate-500">일부 지원</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-3 font-medium">HTML/TXT 출력</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-slate-500">PDF만</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">한국어 인터페이스</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
                <td className="px-4 py-3 text-center text-red-500">✗</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Markdown Free를 선택해야 하는 이유</h2>

        <h3>완전 무료</h3>
        <p>
          CloudConvert와 LightPDF는 무료 플랜에 엄격한 제한(하루 25회 변환 등)이
          있지만, Markdown Free는 완전 무료로 제한이 없습니다.
          &quot;Pro&quot; 플랜은 존재하지 않습니다. 모든 기능을 이미 이용할 수 있습니다.
        </p>

        <h3>개인정보 보호 우선</h3>
        <p>
          CloudConvert와 LightPDF는 파일을 서버에 (일시적으로라도) 저장합니다.
          Markdown Free는 파일을 저장하지 않습니다. 미리보기는 브라우저 내에서 처리되고,
          PDF는 메모리에서 생성 후 즉시 삭제됩니다.
        </p>

        <h3>심플함</h3>
        <p>
          계정 생성 없음, 복잡한 대시보드 없음, &quot;크레딧&quot; 관리 없음.
          페이지를 열고, 파일을 드래그하고, PDF를 다운로드. 그게 전부입니다.
        </p>

        <h3>실시간 미리보기</h3>
        <p>
          다른 변환 도구와 달리, Markdown Free는 변환 전에 문서의
          포맷된 미리보기를 보여줍니다. 테이블, 코드,
          포맷이 올바른지 확인할 수 있습니다.
        </p>

        <h2>다른 도구가 적합한 경우</h2>
        <p>
          공정하게, 다른 솔루션이 적합한 경우도 소개합니다:
        </p>
        <ul>
          <li>
            <strong>CloudConvert</strong> — Markdown 외에 다양한 포맷 간
            변환이 필요한 경우
          </li>
          <li>
            <strong>PDFForge</strong> — 로컬에 설치된
            데스크톱 앱을 선호하는 경우
          </li>
          <li>
            <strong>Pandoc</strong> — 개발자로서 커맨드 라인에서
            완전한 제어를 원하는 경우
          </li>
        </ul>

        <h2>직접 사용해 보세요</h2>
        <p>
          결정하는 가장 좋은 방법은? Markdown Free를 사용해 보는 것입니다.
          문자 그대로 10초면 됩니다.
        </p>

        {/* CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            제한 없음. 회원가입 없음. 비용 없음.
          </p>
          <Link
            href="/ko"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Markdown Free 사용해 보기
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}
