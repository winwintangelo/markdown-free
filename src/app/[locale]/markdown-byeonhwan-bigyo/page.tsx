import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

export function generateStaticParams() {
  return [{ locale: "ko" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "ko") return {};

  return {
    title: "마크다운 PDF 변환기 비교 2026 | 추천 도구 8선",
    description:
      "마크다운을 PDF로 변환하는 도구 8가지 비교. Markdown Free, Pandoc, Typora, Dillinger, StackEdit, md-to-pdf, Markdown PDF (VS Code), Online2PDF. 한글 깨짐 없는 선택법.",
    keywords: [
      "마크다운 pdf 변환기 비교",
      "마크다운 pdf 추천",
      "markdown pdf 한글 깨짐",
      "pandoc 한글 pdf",
      "마크다운 변환기 비교",
      "브라우저 마크다운 pdf",
    ],
    alternates: {
      canonical: "/ko/markdown-byeonhwan-bigyo",
    },
    openGraph: {
      title: "마크다운 PDF 변환기 비교 2026",
      description:
        "마크다운 PDF 변환 도구 8가지를 솔직하게 비교. 한글 깨짐 없이 쓸 수 있는 도구를 용도별로 정리.",
      locale: "ko_KR",
    },
  };
}

const PUBLISH_DATE = "2026-05-09";
const NEXT_REVIEW = "2026-11-09";

const faq = [
  {
    q: "PDF로 변환하면 한글이 □□□(네모 박스)로 보이는 이유는?",
    a: "대부분의 마크다운→PDF 도구는 Helvetica나 Times New Roman 같은 영문 폰트로 폴백되는데, 이 폰트들에는 한글 글리프가 없습니다. 해결책은 (a) Noto Sans CJK KR처럼 한글을 지원하는 폰트를 렌더링 파이프라인에 임베드하거나(Markdown Free는 자동으로 처리), (b) 변환기에 한글 폰트를 직접 설정하는 것입니다(Pandoc: --pdf-engine=xelatex -V mainfont=\"Noto Sans CJK KR\").",
  },
  {
    q: "광고 없는 무료 마크다운 PDF 변환기가 있나요?",
    a: "있습니다. Markdown Free(광고/추적/가입 없음), Pandoc(CLI), VS Code 확장 Markdown PDF는 모두 무료이며 광고가 없습니다. Dillinger와 Online2PDF처럼 호스팅되는 웹 도구는 광고로 운영되는 경우가 많습니다.",
  },
  {
    q: "설치 필요 없이 쓸 수 있는 마크다운 PDF 변환기는?",
    a: "Markdown Free는 브라우저에서만 동작하며 설치가 필요 없습니다. StackEdit과 Dillinger도 브라우저로만 동작하지만 시스템 폰트에 의존하므로 사용자의 환경에 따라 한글이 깨질 수 있습니다.",
  },
  {
    q: "마크다운을 DOCX(워드)로 변환할 때 서식이 그대로 유지되나요?",
    a: "네. Markdown Free, Pandoc, Typora 모두 제목, 코드 블록, 표, 체크리스트를 보존한 DOCX를 생성합니다. 가장 충실한 것은 Pandoc이며, 브라우저에서 가장 빠른 경로는 Markdown Free입니다.",
  },
  {
    q: "2026년에도 Pandoc이 가장 좋은 선택인가요?",
    a: "Pandoc은 스크립트 기반 사용에서는 여전히 가장 강력한 마크다운 변환기지만, LaTeX(약 1.5GB) 설치를 원하지 않는 일반 사용자에게는 Markdown Free 같은 브라우저 도구가 거의 동일한 PDF 품질을 설정 비용 없이 제공합니다.",
  },
  {
    q: "기밀 문서를 다룰 때 가장 안전한 도구는?",
    a: "로컬에서 실행되는 도구(Pandoc, Typora, Markdown PDF for VS Code, md-to-pdf)는 파일이 자기 컴퓨터에 머무릅니다. 브라우저 도구 중에서는 Markdown Free가 HTML/TXT/DOCX를 완전히 클라이언트 사이드로 처리하고 PDF는 서버리스 메모리에서 생성 즉시 폐기합니다. 서버에 파일을 업로드하는 도구(Online2PDF)는 프라이버시 위험이 가장 높습니다.",
  },
  {
    q: "Markdown Free에 파일 크기 제한이 있나요?",
    a: "있습니다. 현재 한 파일당 5MB입니다. 5MB 마크다운은 약 75만 단어 분량이라 일반적인 문서는 거의 모두 커버됩니다. 더 큰 파일이 필요하면 명령줄 Pandoc은 내장 크기 제한이 없습니다.",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  inLanguage: "ko",
  headline: "마크다운 PDF 변환기 비교 2026",
  description: "마크다운 PDF 변환 도구 8가지의 솔직한 비교: Markdown Free, Pandoc, Typora, Dillinger, StackEdit, md-to-pdf, Markdown PDF, Online2PDF.",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
  author: { "@type": "Organization", name: "Markdown Free team", url: "https://www.markdown.free/ko/about" },
  publisher: { "@type": "Organization", name: "Markdown Free", url: "https://www.markdown.free" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.markdown.free/ko/markdown-byeonhwan-bigyo" },
};

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

export default async function MarkdownByeonhwanBigyoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (localeParam !== "ko") notFound();

  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <ConverterProvider>
      <LocaleTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>마크다운 PDF 변환기 비교 2026</h1>

          <p className="text-sm text-slate-500">
            발행 {PUBLISH_DATE} ・ 다음 검토 {NEXT_REVIEW} ・ Markdown Free 팀
          </p>

          <p className="lead text-lg text-slate-600">
            마크다운 PDF 변환 도구 선택은 막상 필요해지기 전까지는 쉬워 보입니다. 하지만 실제로 쓰려고 하면 1.5GB짜리 LaTeX 설치(Pandoc), 유료 데스크톱 앱(Typora), 광고 배너가 있는 브라우저 에디터(Dillinger), 직접 스크립트를 짜야 하는 도구(md-to-pdf) 중에서 골라야 합니다. 영문이라면 어느 것이든 동작하지만, 한글이 들어가는 순간 결과가 갈립니다. 이 글에서 &quot;가장 좋은&quot;이 실제로 갈리는 지점이 바로 거기입니다.
          </p>

          <p>
            <strong>이 글에서는 2026년 기준 8가지 주요 도구를 비교합니다.</strong> 결론부터 말하면, 브라우저에서 한글을 그대로 다루고 싶다면 <Link href="/ko" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>, 스크립트로 일괄 처리하려면 Pandoc, 유료라도 오프라인에서 깔끔하게 쓰고 싶으면 Typora가 좋습니다.
          </p>

          <h2>한눈에 보는 비교표</h2>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">도구</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">잘 맞는 용도</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">가격</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">한글 지원</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">출력 형식</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">설치</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">프라이버시</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown Free</td><td className="px-3 py-3">브라우저, 한글 그대로</td><td className="px-3 py-3">무료</td><td className="px-3 py-3">완벽 지원 ・ Noto 폰트 임베드 ・ 설정 불필요</td><td className="px-3 py-3">PDF, DOCX, EPUB, HTML, TXT</td><td className="px-3 py-3">없음</td><td className="px-3 py-3">메모리에서 처리, 저장 안 함</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Pandoc</td><td className="px-3 py-3">스크립트 기반 일괄 변환</td><td className="px-3 py-3">무료</td><td className="px-3 py-3">설정 필요: <code>--pdf-engine=xelatex -V mainfont</code></td><td className="px-3 py-3">30+ 형식</td><td className="px-3 py-3">PDF에는 LaTeX(약 1.5GB) 필요</td><td className="px-3 py-3">로컬만</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Dillinger</td><td className="px-3 py-3">영문 빠른 편집</td><td className="px-3 py-3">무료, 광고</td><td className="px-3 py-3">시스템 폰트에 의존</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">없음</td><td className="px-3 py-3">클라우드 연동 시 동기화</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">StackEdit</td><td className="px-3 py-3">브라우저 + Drive 동기화</td><td className="px-3 py-3">무료</td><td className="px-3 py-3">시스템 폰트에 의존</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">없음</td><td className="px-3 py-3">선택적 클라우드 동기화</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td><td className="px-3 py-3">VS Code 작업 흐름</td><td className="px-3 py-3">무료</td><td className="px-3 py-3">시스템 폰트, CSS로 설정 가능</td><td className="px-3 py-3">PDF, HTML, PNG, JPEG</td><td className="px-3 py-3">VS Code + Chromium(약 170MB)</td><td className="px-3 py-3">로컬만</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">md-to-pdf (npm)</td><td className="px-3 py-3">빌드 파이프라인</td><td className="px-3 py-3">무료</td><td className="px-3 py-3">CSS와 Puppeteer로 설정</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Node.js + Chromium</td><td className="px-3 py-3">로컬만</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Typora</td><td className="px-3 py-3">오프라인 정돈된 에디터</td><td className="px-3 py-3">유료(평생 라이선스, 작성 시점 미확인)</td><td className="px-3 py-3">시스템 폰트, 테마 의존</td><td className="px-3 py-3">PDF, HTML, DOCX</td><td className="px-3 py-3">데스크톱 앱</td><td className="px-3 py-3">로컬만</td></tr>
                <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Online2PDF</td><td className="px-3 py-3">범용 파일 변환</td><td className="px-3 py-3">무료, 광고</td><td className="px-3 py-3">제한적, 마크다운 전용 아님</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">없음</td><td className="px-3 py-3">서버에 파일 업로드</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Markdown Free</h2>
          <p>HTML/TXT/DOCX 출력은 완전히 클라이언트 사이드에서 동작하고, PDF만 서버리스 메모리에서 생성한 후 즉시 폐기하는 브라우저 기반 변환기. &quot;30초면 끝나는 작업에 가입과 광고를 끼워 넣지 않는다&quot;는 원칙으로 만들어졌습니다.</p>
          <p><strong>한글 처리:</strong> Noto Sans CJK KR을 PDF 렌더링 파이프라인에 직접 임베드하므로 글자 깨짐이 없습니다. 폰트 플래그도 설치도 필요 없습니다.</p>
          <p><strong>강점:</strong> 가입 없음, 추적 쿠키 없음, 프라이버시 친화적 분석, UI 10개 언어 지원, AI가 만든 마크다운을 회사 워드 문서로 옮길 때 강한 DOCX 출력.<br /><strong>약점:</strong> 한 파일 5MB 제한, 오프라인 모드 없음(브라우저 필요), LaTeX/MathJax 수식 미지원, 일괄 처리 없음, PDF 스타일 커스터마이징 불가.<br /><strong>잘 맞는 사람:</strong> 지금 당장 브라우저에서 마크다운을 PDF/DOCX/EPUB로 바꿔야 하는 사람, 특히 한글 문서를 다루는 사람.</p>
          <p><Link href="/ko" className="text-emerald-700 hover:text-emerald-800 hover:underline">markdown.free/ko</Link> (바로 <Link href="/ko/markdown-word-byeonhwan" className="text-emerald-700 hover:text-emerald-800 hover:underline">마크다운→워드 변환</Link>이나 <Link href="/ko/readme-pdf-byeonhwan" className="text-emerald-700 hover:text-emerald-800 hover:underline">README→PDF 변환</Link>으로 이동 가능)</p>

          <h2>Pandoc</h2>
          <p>30개 이상 형식 사이를 변환하는 명령줄 기반 범용 변환기. 일괄/파이프라인 작업에서는 사실상 표준입니다.</p>
          <p><strong>한글 처리:</strong> 기본 LaTeX 엔진(<code>pdflatex</code>)은 한글을 다루지 못합니다. 읽을 수 있는 결과물을 얻으려면 <code>--pdf-engine=xelatex</code>(또는 <code>lualatex</code>)에 <code>-V mainfont=&quot;Noto Sans CJK KR&quot;</code>을 지정해야 하고, 해당 Noto 폰트도 시스템에 설치되어 있어야 합니다.</p>
          <p><strong>강점:</strong> 가장 강력하고 유연한 변환기, 방대한 플러그인/필터 생태계, 학술/기술 문서에서 사실상 표준.<br /><strong>약점:</strong> PDF 출력에 LaTeX(macOS의 TeX Live는 약 1.5GB) 설치 필요, 학습 곡선이 가파르며, 처음 쓰는 사람은 한글 설정의 존재 자체를 모름.<br /><strong>잘 맞는 사람:</strong> 스크립트로 변환을 돌리는 기술자, 학술 출판, CLI에 익숙한 작성자.</p>
          <p><a href="https://pandoc.org" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">pandoc.org</a></p>

          <h2>Dillinger</h2>
          <p>실시간 미리보기가 있는 브라우저 마크다운 에디터. dillinger.io에서 호스팅 버전 사용 가능.</p>
          <p><strong>한글 처리:</strong> 미리보기는 브라우저 폰트 폴백을 따르고, PDF 출력은 시스템 폰트를 씁니다. 미리보기에서는 한글이 보여도 PDF에서 깨지는 경우가 종종 있습니다.</p>
          <p><strong>강점:</strong> 익숙한 좌우 분할 에디터, 무료, Dropbox/Google Drive/GitHub 연동.<br /><strong>약점:</strong> 호스팅 버전은 광고 있음, 편집 상태가 연동된 클라우드로 동기화될 수 있음, PDF 스타일 제어 제한적.<br /><strong>잘 맞는 사람:</strong> 영문 문서의 일회성 편집과 출력.</p>
          <p><a href="https://dillinger.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">dillinger.io</a></p>

          <h2>StackEdit</h2>
          <p>클라우드 동기화(Google Drive, Dropbox, GitHub)와 수식(MathJax)에 강한 브라우저 에디터.</p>
          <p><strong>한글 처리:</strong> Dillinger와 마찬가지로 브라우저/시스템 폰트에 의존. Noto 폰트가 동봉되지 않습니다.</p>
          <p><strong>강점:</strong> 깔끔한 UI, 수식 렌더링, 여러 기기 간 클라우드 동기화.<br /><strong>약점:</strong> PDF 출력이 브라우저 인쇄 경로를 거쳐 스타일 자유도가 낮음, 클라우드 동기화에 Google/Dropbox 권한 필요.<br /><strong>잘 맞는 사람:</strong> 클라우드 동기화와 수식이 필요한 작성자.</p>
          <p><a href="https://stackedit.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">stackedit.io</a></p>

          <h2>Markdown PDF (VS Code 확장)</h2>
          <p>VS Code의 마크다운 파일을 PDF/HTML/PNG/JPEG로 출력하는 확장. 첫 사용 시 Chromium(약 170MB)을 다운로드합니다.</p>
          <p><strong>한글 처리:</strong> Chromium의 폰트 시스템을 그대로 사용하므로, 시스템에 한글 폰트가 설치되어 있으면 표시됩니다(최신 macOS/Windows/Linux는 대부분 설치됨). CSS의 <code>@font-face</code>로 특정 폰트를 임베드할 수도 있습니다.</p>
          <p><strong>강점:</strong> VS Code 작업 흐름과 자연스럽게 어울림, CSS로 자유로운 커스터마이징, 로컬 완결.<br /><strong>약점:</strong> VS Code 필요, 첫 실행 시 Chromium 다운로드, 첫 출력은 느림, 설정은 JSON 파일로.<br /><strong>잘 맞는 사람:</strong> VS Code에서 작업하며 한 번의 단축키로 PDF 출력을 원하는 개발자.</p>
          <p><a href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">VS Code 마켓플레이스</a></p>

          <h2>md-to-pdf (npm)</h2>
          <p>Puppeteer(내부적으로 Chromium)를 사용해 마크다운을 PDF로 바꾸는 Node.js CLI/라이브러리. 빌드 파이프라인용입니다.</p>
          <p><strong>한글 처리:</strong> Chromium 폰트에 의존. CSS로 Noto 같은 웹폰트를 <code>@import</code>하면 한글을 안정적으로 렌더링할 수 있습니다.</p>
          <p><strong>강점:</strong> 스크립팅 가능, 테마 가능, 설정 후 일괄 처리는 빠름, 오픈소스.<br /><strong>약점:</strong> Node.js와 Puppeteer Chromium(첫 설치 약 170MB) 필요, 기본 스타일은 운영 품질을 위해 CSS 손질 필요.<br /><strong>잘 맞는 사람:</strong> 문서로부터 PDF를 만드는 CI/CD를 짜는 사람.</p>
          <p><a href="https://github.com/simonhaenisch/md-to-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">github.com/simonhaenisch/md-to-pdf</a></p>

          <h2>Typora</h2>
          <p>macOS/Windows/Linux 데스크톱용 WYSIWYG 마크다운 에디터. 2021년까지는 무료였고 현재는 평생 라이선스 유료(가격은 작성 시점 미확인, 공식 사이트 참조).</p>
          <p><strong>한글 처리:</strong> 시스템 폰트로 대부분 자연스럽게 표시됩니다. 다만 한글에 최적화된 폰트 스택을 갖췄는지는 테마에 따라 다릅니다.</p>
          <p><strong>강점:</strong> WYSIWYG 완성도가 높고 출력이 깔끔, 라이선스 구입 후에는 광고/계측 없음.<br /><strong>약점:</strong> 유료, 데스크톱 전용, 팀/클라우드 기능 없음.<br /><strong>잘 맞는 사람:</strong> 혼자 글을 쓰며 일회성 결제는 괜찮은 사람.</p>
          <p><a href="https://typora.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">typora.io</a></p>

          <h2>Online2PDF</h2>
          <p>워드/엑셀/PDF/이미지 등 다양한 형식을 다루는 범용 웹 변환기. 마크다운도 처리는 됩니다.</p>
          <p><strong>한글 처리:</strong> 제한적이며 작성 시점 미검증입니다. 마크다운 전용으로 설계되지 않아 코드 블록, 표, 한글 폰트 처리가 일정하지 않습니다.</p>
          <p><strong>강점:</strong> 마크다운 외 형식도 다룸, 설치 불필요.<br /><strong>약점:</strong> 서버에 파일 업로드(기밀 문서 위험), 광고가 많음, 마크다운 렌더링이 범용적이라 표/체크리스트가 깨질 수 있음, 스타일 커스터마이징 불가.<br /><strong>잘 맞는 사람:</strong> 마크다운은 옵션이고 다른 형식이 더 중요한 일회성 변환.</p>
          <p><a href="https://online2pdf.com" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">online2pdf.com</a></p>

          <h2>고르는 법(용도별)</h2>
          <ul>
            <li><strong>지금 브라우저에서 마크다운을 PDF/DOCX/EPUB로, 가입 없이, 특히 한글이 들어간다</strong> → <Link href="/ko" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link></li>
            <li><strong>CLI에 익숙하고 LaTeX는 깔거나 이미 있고 스크립트로 돌리고 싶다</strong> → Pandoc</li>
            <li><strong>VS Code에서 단축키 한 번으로 PDF 출력</strong> → Markdown PDF (VS Code 확장)</li>
            <li><strong>문서로부터 PDF를 만드는 CI/CD를 짠다</strong> → md-to-pdf 또는 Pandoc</li>
            <li><strong>오프라인의 정돈된 에디터, 유료여도 괜찮음</strong> → Typora</li>
            <li><strong>클라우드 동기화와 수식이 필요</strong> → StackEdit</li>
            <li><strong>영문 문서의 일회성 편집</strong> → Dillinger 또는 StackEdit</li>
          </ul>

          <h2>자주 묻는 질문</h2>
          {faq.map((item, i) => (<div key={i}><h3>{item.q}</h3><p>{item.a}</p></div>))}

          <h2>이해 상충 고지</h2>
          <p>이 글은 위 비교에 등장한 <Link href="/ko" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link> 팀이 작성했습니다. Pandoc은 스크립트 작업, Typora는 오프라인 마무리, VS Code의 Markdown PDF는 에디터 내 워크플로처럼, 다른 도구가 더 나은 경우는 그대로 적었습니다. 외부 링크에는 <code>rel=&quot;nofollow&quot;</code>를 적용했습니다. 사실 오류를 발견하시면 <Link href="/ko/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">여기</Link>로 알려주세요. 수정하겠습니다.</p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">Markdown Free 써보기 ― 설치도, 가입도, 한글 깨짐도 없음</p>
            <Link href="/ko" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800">Markdown Free 열기<span aria-hidden="true">→</span></Link>
          </div>

          {/* Related tool suite cross-links */}
          <RelatedTools locale={locale} current="comparison" />
        </article>

        <Footer locale={locale} dict={dict} />
      </main>
    </ConverterProvider>
  );
}
