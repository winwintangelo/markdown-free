import type { IntentPageContent } from "./types";

/**
 * 한국어 롱테일 인텐트 페이지 (build plan Phase 1). slug 기준.
 * 형식별 결과를 솔직하게 설명: PDF/HTML/이미지/EPUB은 KaTeX로 수식 조판,
 * Word에서는 수식을 선명한 이미지로, LaTeX 원본은 대체 텍스트에 보존 (편집 가능한 수식은 로드맵, Phase 0b).
 */

const FAQ_HEADING = "자주 묻는 질문";

const demo = (sampleLabel: string, note: string) => ({
  heading: "⬇ .md 파일을 여기에 놓거나 샘플로 먼저 체험",
  hint: "몇 초면 완료 · 저장 없음 · 가입 불필요",
  readyHint: "아래에서 형식을 선택하세요",
  sampleLabel,
  note,
});

const WORD_HONESTY = "Word에서는 각 수식이 미리보기와 똑같은 선명한 이미지로 들어가고, LaTeX 원본은 이미지의 대체 텍스트에 보존됩니다. 편집 가능한 Word 수식은 로드맵에 있습니다.";

const PRIVACY = "무료, 가입 불필요, 문서에 워터마크 없음. 파일당 1MB까지. PDF와 Word는 서버 메모리에서 변환 후 즉시 폐기되며, 다른 형식은 모두 브라우저 안에서 처리됩니다.";

function mathToWordPage(opts: {
  chatbot: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  lead: string;
  whyExtra?: string;
  faqExtra?: { q: string; a: string }[];
}): [string, IntentPageContent] {
  const { chatbot } = opts;
  return [
    opts.slug,
    {
      title: opts.title,
      description: opts.description,
      keywords: opts.keywords,
      h1: opts.h1,
      lead: opts.lead,
      ctaTop: `${chatbot} 수식 지금 고치기`,
      ctaBottom: "답변을 붙여 넣기만 하세요 — 무료, 가입 불필요",
      sections: [
        {
          heading: `${chatbot} 수식을 Word에 붙여 넣으면 깨지는 이유`,
          paragraphs: [
            `${chatbot}은 수식을 LaTeX로 씁니다. 답변을 복사하면 수식은 \\( … \\)와 \\[ … \\]로 감싼 원본 그대로 클립보드에 들어가고, Word는 백슬래시와 중괄호까지 그대로 붙여 넣습니다. Word의 수식 편집기는 전혀 개입하지 않으므로 분수 대신 코드 한 줄이 보입니다.`,
            "스크린샷은 깨지진 않지만 검색도 편집도 안 되고 인쇄하면 흐려집니다. 올바른 방법은 LaTeX를 먼저 렌더링한 뒤, 조판된 문서를 Word나 PDF로 넘기는 것입니다.",
            ...(opts.whyExtra ? [opts.whyExtra] : []),
          ],
        },
        {
          heading: "30초 만에 고치기",
          steps: [
            { title: "답변 복사", text: `${chatbot}의 복사 버튼을 쓰면 Markdown과 LaTeX가 온전히 유지됩니다.` },
            { title: "여기에 붙여 넣기", text: "붙여넣기 칸이 '코드 복사', 역할 표시 같은 UI 잔여물을 자동으로 지우고 \\( … \\), \\[ … \\] 구분자도 인식합니다." },
            { title: "내보내기", text: "'PDF로'를 누르면 조판된 수식, 'Word(DOCX)로'를 누르면 편집 가능한 문서를 얻습니다." },
          ],
        },
        {
          heading: "형식별로 얻는 것",
          bullets: [
            "PDF, HTML, 이미지, EPUB: 모든 수식을 KaTeX로 조판 — 분수, 합, 행렬, 그리스 문자, 위·아래 첨자.",
            `Word(DOCX): 제목, 표, 코드, 목록이 실제 Word 스타일이 됩니다. ${WORD_HONESTY}`,
            "표, 코드 블록, 제목, 목록은 모든 형식에서 유지됩니다.",
            "아무것도 저장하지 않습니다: PDF와 Word는 메모리에서 변환 후 폐기, 다른 형식은 브라우저를 떠나지 않습니다.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        {
          q: `${chatbot} 수식이 Word에서 \\frac, \\sum으로 보이는 이유는?`,
          a: `LaTeX 원본이기 때문입니다. ${chatbot}은 채팅 창에서는 렌더링하지만 클립보드에는 원시 텍스트만 담깁니다. 여기서 먼저 렌더링하면 PDF에서도 Word에서도 조판된 수식을 얻습니다.`,
        },
        {
          q: "\\( 를 $ 로 직접 바꿔야 하나요?",
          a: "아니요. $ … $ / $$ … $$ 와 \\( … \\) / \\[ … \\] 모두 인식합니다. 본문의 '$5와 $10' 같은 금액은 수식으로 처리하지 않습니다.",
        },
        {
          q: "Word에서 수식을 편집할 수 있나요?",
          a: "수식으로 편집하는 것은 아직 안 됩니다. Word에서는 각 수식이 선명한 이미지로 들어가 화면과 인쇄 모두 깔끔하고, LaTeX 원본은 이미지의 대체 텍스트에 보존됩니다. 편집 가능한 수식(OMML)은 로드맵에 있습니다. PDF, HTML, 이미지, EPUB도 완전히 조판됩니다.",
        },
        { q: "무료인가요? 가입이 필요한가요?", a: PRIVACY },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("수식 샘플로 체험", "인라인 수식, 디스플레이 수식, 행렬, \\( … \\) 구분자가 포함된 샘플 — 아래에서 렌더링됩니다."),
    },
  ];
}

function sourceToWordPage(opts: {
  chatbot: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  lead: string;
  quirks: string[];
  faqExtra?: { q: string; a: string }[];
}): [string, IntentPageContent] {
  const { chatbot } = opts;
  return [
    opts.slug,
    {
      title: opts.title,
      description: opts.description,
      keywords: opts.keywords,
      h1: opts.h1,
      lead: opts.lead,
      ctaTop: `${chatbot} 답변 지금 변환`,
      ctaBottom: "답변을 붙여 넣기만 하세요 — 무료, 가입 불필요",
      sections: [
        {
          heading: `${chatbot} 답변을 Word에 붙여 넣으면 깨지는 부분`,
          paragraphs: [
            `${chatbot} 답변은 Markdown입니다: 제목, 글머리 목록, 표, 코드 블록, LaTeX 수식. Word에 바로 붙여 넣으면 전부 일반 텍스트가 됩니다 — 표는 파이프 기호, 제목은 샵 기호, 수식은 백슬래시로, 게다가 '코드 복사'와 역할 표시 같은 UI 잔여물까지 함께요.`,
          ],
          bullets: opts.quirks,
        },
        {
          heading: "30초 워크플로",
          steps: [
            { title: "답변 복사", text: `${chatbot}의 복사 버튼은 Markdown을 유지합니다. 드래그해서 복사해도 대개 괜찮습니다.` },
            { title: "여기에 붙여 넣기", text: "붙여 넣을 때 채팅 잔여물이 제거되고 미리보기가 표시됩니다." },
            { title: "내보내기", text: "동료가 편집할 문서라면 'Word(DOCX)로', 공유용이면 'PDF로', 이미지, EPUB." },
          ],
        },
        {
          heading: "Word에서 얻는 것",
          bullets: [
            "제목, 목록, 굵게, 기울임이 실제 Word 스타일이 됩니다.",
            "표는 Word 표로, 코드 블록은 고정폭 스타일로.",
            `수식: ${WORD_HONESTY}`,
            "표를 스프레드시트로 원하면 'Excel(XLSX)로' — 표마다 시트 하나.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: `${chatbot} 대화 전체를 한 번에 변환할 수 있나요?`, a: "필요한 답변을 같은 칸에 차례로 붙여 넣은 뒤 한 번에 내보내세요. 제목 자동 번호가 붙는 다중 답변 병합은 로드맵에 있습니다." },
        { q: `${chatbot}의 표와 코드가 유지되나요?`, a: "네. Markdown 표는 Word 표(또는 Excel 시트)가 되고, 코드 블록은 고정폭 서식을 유지하며, 제목은 Word 제목 스타일에 대응합니다." },
        {
          q: "어떤 형식으로 내보낼 수 있나요?",
          a: "PDF, Word(DOCX), 이미지(PNG/JPG), EPUB, Excel(XLSX, 표마다 시트 하나), HTML, 일반 텍스트 — 붙여 넣은 같은 답변에서 전부, 계정 없이.",
        },
        { q: "제 텍스트가 저장되나요?", a: "아니요. Word와 PDF는 서버 메모리에서 생성되어 다운로드 직후 폐기됩니다. HTML, 이미지, EPUB, Excel은 브라우저를 떠나지 않습니다. 계정 불필요, 추적 쿠키 없음." },
        ...(opts.faqExtra ?? []),
      ],
      demo: demo("샘플 답변으로 체험", "전형적인 AI 답변: 수식, 표, 코드 블록 — 각 부분이 어떻게 렌더링되는지 확인하세요."),
    },
  ];
}

export const ko: Record<string, IntentPageContent> = Object.fromEntries([
  mathToWordPage({
    chatbot: "챗GPT",
    slug: "chatgpt-susik-word",
    title: "챗GPT 수식 워드에 붙여넣으면 깨질 때 해결법",
    description: "챗GPT 수식이 워드에서 \\frac, \\sum으로 보이나요? 답변을 여기에 붙여 넣으면 PDF와 Word 모두 조판된 수식으로. 무료, 가입 불필요.",
    keywords: ["챗gpt 수식 워드", "chatgpt 수식 워드 붙여넣기", "챗gpt 수식 깨짐", "chatgpt latex 워드", "챗gpt 수식 pdf", "챗gpt 수식 복사"],
    h1: "챗GPT 수식을 워드로 — LaTeX 깨짐 없이",
    lead: "수식이 가득한 챗GPT 답변을 복사했더니 워드에 분수 대신 \\frac{a}{b}가 보이나요? 여기에 붙여 넣으세요. PDF는 조판된 수식으로, Word는 모든 수식이 보존된 깔끔한 문서로 나옵니다.",
    faqExtra: [
      { q: "챗GPT의 인용 표시와 'Copy code' 줄은요?", a: "붙여 넣을 때 자동으로 제거됩니다: 복사 버튼 라벨, 'You said / ChatGPT said', 'Thought for 8s', 【12†source】 같은 인용 기호." },
    ],
  }),
  mathToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-susik-word",
    title: "DeepSeek 수식을 워드·PDF로: 붙여넣기 깨짐 해결",
    description: "DeepSeek 답변이 워드에 LaTeX 원본과 <think> 블록으로 붙나요? 여기에 붙여 넣으면 추론 잔여물을 제거하고, PDF와 Word 모두 수식을 조판. 무료.",
    keywords: ["deepseek 수식 워드", "딥시크 수식 워드", "deepseek latex 워드", "deepseek pdf 수식", "deepseek think 제거", "딥시크 수식 복사"],
    h1: "DeepSeek 수식을 워드와 PDF로",
    lead: "DeepSeek은 채팅 창에서는 예쁜 수식을 보여 주지만 클립보드에는 원시 \\[ … \\] LaTeX가 담기고, 맨 위에 <think> 블록이 붙기도 합니다. 여기에 붙여 넣으면 PDF와 깔끔한 Word 문서 모두 조판된 수식이 됩니다.",
    whyExtra: "DeepSeek 복사본에는 숨겨진 추론 블록(<think> … </think>)과 '已深度思考(用时 12 秒)' 줄이 포함될 수 있습니다. 둘 다 붙여 넣을 때 제거되어 문서에 들어가지 않습니다.",
    faqExtra: [
      { q: "DeepSeek의 <think> 추론 블록도 처리되나요?", a: "네. <think> … </think> 블록과 '已深度思考' / 'Thought for Ns' 줄은 붙여 넣을 때 제거되고, 답변 본문은 그대로 유지됩니다." },
    ],
  }),
  [
    "chatgpt-pyo-excel",
    {
      title: "챗GPT 표를 엑셀로: 붙여 넣고 XLSX 받기",
      description: "챗GPT(또는 다른 AI)의 Markdown 표를 실제 Excel 통합 문서로: 표마다 시트 하나, 숫자는 숫자로, 머리글은 굵게. 브라우저에서 생성, 무료, 가입 불필요.",
      keywords: ["챗gpt 표 엑셀", "chatgpt 표 엑셀 복사", "챗gpt 엑셀 변환", "markdown 표 엑셀", "ai 표 xlsx", "챗gpt 표 깨짐"],
      h1: "챗GPT 표를 한 번에 엑셀로",
      lead: "챗GPT 표는 Markdown입니다 — 파이프와 대시. 답변을 여기에 붙여 넣고 표마다 시트 하나, 숫자 셀, 굵은 머리글이 있는 .xlsx를 내려받으세요. 손으로 정리할 게 없습니다.",
      ctaTop: "표 지금 변환",
      ctaBottom: "표를 붙여 넣기만 하세요 — 무료, 가입 불필요",
      sections: [
        {
          heading: "챗GPT 표를 엑셀에 붙여 넣으면 깨지는 이유",
          paragraphs: [
            "Markdown 표는 텍스트입니다: | 이름 | 점수 | 아래에 대시 한 줄. 엑셀에 붙여 넣으면 한 열에 몰리거나 파이프 기호가 셀 내용의 일부가 됩니다. '텍스트 나누기'로는 절반만 해결되고 정렬 행이 남습니다.",
            "Markdown을 먼저 렌더링하면 진짜 행과 열이 되고, 여기의 Excel 작성기가 답변 속 모든 표를 각각의 시트로 만듭니다.",
          ],
        },
        {
          heading: "30초 만에 고치기",
          steps: [
            { title: "답변 복사", text: "챗GPT의 복사 버튼을 쓰면 표가 Markdown으로 유지됩니다." },
            { title: "여기에 붙여 넣기", text: "미리보기에 표가 보이고 'Copy code'와 역할 표시는 자동으로 제거됩니다." },
            { title: "더 많은 형식 → Excel(XLSX)로", text: "표마다 시트 하나. 파일이 바로 내려받아집니다." },
          ],
        },
        {
          heading: "통합 문서에 담기는 것",
          bullets: [
            "Markdown 표마다 시트 하나, 가장 가까운 제목이 시트 이름이 됩니다.",
            "숫자는 숫자로 저장('1,234.56'은 1234.56), 나머지는 텍스트.",
            "머리글 행은 굵게, 열 너비는 내용에 맞게.",
            "Excel, Numbers, LibreOffice, Google 스프레드시트에서 열립니다. 전부 브라우저에서 생성 — 표가 기기를 떠나지 않습니다.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Claude, Gemini, DeepSeek, Kimi의 표도 되나요?", a: "네. 어떤 어시스턴트가 작성했든 Markdown 표면 됩니다. 한 답변에 표가 여러 개면 시트도 여러 개가 됩니다." },
        { q: "셀 안의 수식이나 굵은 글씨는요?", a: "셀은 일반 텍스트로 내보냅니다. 셀 안 서식은 Excel로 옮겨지지 않고, LaTeX 수식은 원본 텍스트로 나타납니다." },
        { q: "표를 Word로도 받을 수 있나요?", a: "네 — 'Word(DOCX)로'가 같은 문서를 실제 Word 표로 내보냅니다." },
        { q: "무료인가요?", a: "무료, 계정 불필요. Excel 파일은 브라우저에서 생성되며 아무것도 업로드되지 않습니다." },
      ],
      demo: demo("표 샘플로 체험", "정렬이 다른 Markdown 표 두 개 — 불러온 뒤 '더 많은 형식 → Excel로'를 선택하세요."),
    },
  ],
  [
    "ai-pyo-word",
    {
      title: "AI 채팅 표를 워드로: 챗GPT, Gemini, Claude",
      description: "챗GPT, Gemini, Claude의 표가 워드에 파이프와 대시로 붙나요? 답변을 여기에 붙여 넣고 실제 표가 있는 Word 문서 또는 Excel 통합 문서를 내보내세요. 무료, 가입 불필요.",
      keywords: ["챗gpt 표 워드", "gemini 표 워드", "ai 표 워드 변환", "markdown 표 워드", "claude 표 워드", "표 복사 워드 깨짐"],
      h1: "AI 채팅 표를 워드로 — 파이프 기호가 아닌 진짜 표로",
      lead: "챗GPT, Gemini, Claude 모두 Markdown 표로 답합니다. 워드에서는 그것이 | 파이프 | 줄이 됩니다. 답변을 여기에 붙여 넣으면 정렬까지 보존된 실제 Word 표가 있는 문서를 내보낼 수 있습니다.",
      ctaTop: "표 지금 변환",
      ctaBottom: "답변을 붙여 넣기만 하세요 — 무료, 가입 불필요",
      sections: [
        {
          heading: "AI 표가 워드에서 무너지는 이유",
          paragraphs: [
            "Markdown 표는 파이프 구분자와 정렬 행(:--- 왼쪽, :--: 가운데, ---: 오른쪽)이 있는 일반 텍스트입니다. Word는 이것이 표인지 모르므로 글자를 그대로 붙여 넣습니다.",
            "Markdown을 먼저 렌더링하면 열 정렬, 머리글 행, 테두리가 있는 제대로 된 표가 되고, 같은 문서를 PDF, Excel, 이미지로도 만들 수 있습니다.",
          ],
        },
        {
          heading: "30초 만에 고치기",
          steps: [
            { title: "답변 복사", text: "어시스턴트의 복사 버튼은 Markdown을 온전히 유지합니다." },
            { title: "여기에 붙여 넣기", text: "미리보기에서 표를 확인하세요. 정렬은 작성된 대로 표시됩니다." },
            { title: "내보내기", text: "'Word(DOCX)로'는 실제 Word 표, '더 많은 형식 → Excel(XLSX)로'는 스프레드시트." },
          ],
        },
        {
          heading: "얻는 것",
          bullets: [
            "Word: 머리글 행, 테두리, 왼쪽/가운데/오른쪽 정렬이 있는 기본 표.",
            "Excel: 표마다 시트 하나, 숫자 셀과 굵은 머리글.",
            "PDF와 이미지: 미리보기 그대로 조판된 표, 한글 깨짐 없음.",
            "무료, 계정 불필요. Word와 PDF는 메모리에서 변환 후 폐기, Excel과 이미지는 브라우저에서 생성.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "Gemini 표가 한 줄로 길게 붙는 이유는?", a: "일부 화면에서 복사하면 줄바꿈이 사라집니다. 여기 입력 칸에 붙여 넣으세요. 파이프 기호만 남아 있으면 Markdown 파서가 행을 복원합니다." },
        { q: "셀 병합도 되나요?", a: "표준 Markdown 표에는 셀 병합이 없습니다. rowspan/colspan이 있는 HTML 표는 아직 지원하지 않습니다. 항목당 한 행으로 작성하세요." },
        { q: "표 앞뒤의 글도 같이 변환되나요?", a: "네 — 답변 전체가 변환됩니다: 제목, 문단, 코드, 표." },
        { q: "무료인가요?", a: "무료, 계정 불필요, 문서에 워터마크 없음. 파일당 1MB까지." },
      ],
      demo: demo("표 샘플로 체험", "정렬된 Markdown 표 두 개 — 불러온 뒤 'Word(DOCX)로'로 실제 표를 확인하세요."),
    },
  ],
  [
    "markdown-susik-pdf",
    {
      title: "마크다운 수식 PDF 변환 (KaTeX로 LaTeX 조판)",
      description: "$…$, $$…$$ LaTeX 수식이 있는 Markdown을 브라우저에서 조판된 PDF로. KaTeX 렌더링, 한글 글꼴 내장, 설치 불필요, 가입 불필요. Word, HTML, 이미지, EPUB도.",
      keywords: ["마크다운 수식 pdf", "markdown latex pdf 변환", "마크다운 수식 변환", "katex markdown pdf", "md 수식 pdf 온라인", "마크다운 수식 렌더링"],
      h1: "마크다운 수식을 PDF로",
      lead: "$E = mc^2$, $$\\int_0^\\infty$$, 행렬이 담긴 노트가 그대로 조판된 PDF가 됩니다 — Pandoc도, 1.5GB짜리 TeX 설치도 필요 없습니다. 파일을 놓고 'PDF로'를 누르세요.",
      ctaTop: "마크다운 지금 변환",
      ctaBottom: ".md를 놓으세요 — 무료, 가입 불필요",
      sections: [
        {
          heading: "지원 범위",
          bullets: [
            "인라인 수식 $ … $ 와 \\( … \\); 디스플레이 수식 $$ … $$ 와 \\[ … \\].",
            "분수, 근호, 합, 적분, 극한, 행렬(pmatrix, bmatrix), aligned 환경, 그리스 문자, 연산자, 그 밖에 KaTeX가 지원하는 대부분의 명령.",
            "표, 목록, 인용 안의 수식.",
            "수식 옆의 한글: PDF에 Noto Sans KR/SC/TC/JP를 내장.",
          ],
        },
        {
          heading: "사용법",
          steps: [
            { title: "놓거나 붙여 넣기", text: ".md 파일(1MB까지) — 미리보기에서 수식이 즉시 렌더링됩니다." },
            { title: "확인", text: "지원하지 않는 명령은 원본과 함께 빨간색으로 표시되어 조용히 실패하지 않습니다." },
            { title: "'PDF로' 클릭", text: "A4(지역에 따라 Letter), KaTeX 글꼴 내장." },
          ],
        },
        {
          heading: "다른 형식",
          bullets: [
            "HTML: KaTeX 스타일시트가 내장된 단일 파일.",
            "이미지(PNG/JPG)와 EPUB: 수식 렌더링 완료, 브라우저에서 생성.",
            `Word(DOCX): ${WORD_HONESTY}`,
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "지원하지 않는 LaTeX 명령은?", a: "KaTeX 함수 목록 밖의 것들 — 복잡한 정의의 \\newcommand 매크로, TikZ, 완전한 LaTeX 문서 환경 등. 지원하지 않는 명령은 원본과 함께 빨간색으로 표시됩니다." },
        { q: "본문의 $5와 $10이 수식이 되나요?", a: "아니요. 일반 문장처럼 보이는 $ … $(여러 단어, 수학 기호 없음)는 텍스트로 남습니다." },
        { q: "Pandoc과 비교하면요?", a: "Pandoc과 LaTeX 엔진의 PDF는 훌륭하지만 수 GB의 TeX 설치와 한글 글꼴 설정이 필요합니다. 이것은 브라우저에서 실행되고 한글 글꼴이 이미 내장되어 있어, 대부분의 노트와 논문에서 동등한 결과를 냅니다." },
        { q: "무료인가요?", a: PRIVACY },
      ],
      demo: demo("수식 샘플로 체험", "인라인 수식, 디스플레이 수식, 행렬, \\( … \\) 구분자 — 미리보기에서 모두 조판됩니다."),
    },
  ],
  [
    "markdown-mermaid-pdf-byeonhwan",
    {
      title: "마크다운 Mermaid 다이어그램 PDF·워드 변환",
      description: "```mermaid 플로차트, 시퀀스, 클래스 다이어그램이 있는 Markdown을 다이어그램이 렌더링된 채로 PDF, Word, 이미지, EPUB으로. 브라우저에서 처리, 무료, 가입 불필요.",
      keywords: ["markdown mermaid pdf", "mermaid 다이어그램 pdf", "마크다운 플로차트 pdf", "mermaid 워드 변환", "markdown mermaid 온라인", "mermaid docx 내보내기"],
      h1: "마크다운 Mermaid 다이어그램을 PDF로",
      lead: "```mermaid 코드 블록이 다이어그램으로 렌더링되어 — 플로차트, 시퀀스, 클래스, 상태, 간트 — 코드 블록이 아니라 선명한 이미지로 PDF, Word, 이미지, EPUB에 들어갑니다.",
      ctaTop: "마크다운 지금 변환",
      ctaBottom: ".md를 놓으세요 — 무료, 가입 불필요",
      sections: [
        {
          heading: "다이어그램이 모든 형식에 들어가는 방식",
          paragraphs: [
            "Mermaid는 브라우저가 있어야 렌더링되므로, 다이어그램은 여러분의 브라우저에서 그려진 뒤 어떤 형식이든 만들기 전에 이미지로 문서에 삽입됩니다. PDF와 Word는 선명한 PNG를, HTML·EPUB·이미지 내보내기는 벡터 SVG를 받습니다.",
            "Mermaid 엔진은 문서에 실제로 ```mermaid 블록이 있을 때만 로드되므로 일반 문서는 빠른 그대로입니다.",
          ],
        },
        {
          heading: "사용법",
          steps: [
            { title: "놓거나 붙여 넣기", text: "```mermaid 블록이 있는 Markdown — 미리보기에 렌더링된 다이어그램이 보입니다." },
            { title: "확인", text: "문법 오류가 있는 다이어그램은 코드 블록으로 남아 있어 고칠 수 있습니다." },
            { title: "내보내기", text: "PDF로, Word(DOCX)로, 이미지(PNG)로, EPUB — 다이어그램이 모두 들어갑니다." },
          ],
        },
        {
          heading: "지원하는 다이어그램 종류",
          bullets: [
            "플로차트 / graph, 시퀀스, 클래스, 상태, ER, 간트, 파이, 마인드맵, 타임라인 등 Mermaid 11의 종류들.",
            "한글, 중국어, 일본어 라벨은 기기의 글꼴로 렌더링됩니다.",
            "큰 다이어그램은 인쇄용으로 2배 해상도로 삽입됩니다.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "다이어그램이 여전히 코드 블록인 이유는?", a: "Mermaid가 파싱하지 못했습니다. 문법을 확인하세요(mermaid.live가 편리합니다). 파싱 오류는 블록을 그대로 두며 내보내기를 깨뜨리지 않습니다." },
        { q: "다이어그램만 이미지로 받을 수 있나요?", a: "문서를 '이미지(PNG)로' 내보내거나, 렌더링된 미리보기에서 다이어그램을 복사하세요." },
        { q: "Word에서도 다이어그램이 보이나요?", a: "네, 인쇄 해상도의 PNG 이미지로 삽입됩니다." },
        { q: "무료인가요?", a: "무료, 계정 불필요. 다이어그램은 브라우저에서 렌더링되고, PDF와 Word는 메모리에서 변환 후 폐기됩니다." },
      ],
      demo: demo("다이어그램 샘플로 체험", "```mermaid 플로차트 — 아래 미리보기에서 렌더링됩니다."),
    },
  ],
  [
    "markdown-excel-byeonhwan",
    {
      title: "마크다운 표 엑셀(XLSX) 변환기",
      description: "Markdown 표를 브라우저에서 Excel 통합 문서로: 표마다 시트 하나, 숫자는 숫자로, 머리글은 굵게. 무료, 가입 불필요, 업로드 없음.",
      keywords: ["마크다운 엑셀 변환", "markdown 표 엑셀", "md 표 xlsx", "markdown xlsx 변환", "마크다운 표 내보내기 엑셀", "마크다운 스프레드시트"],
      h1: "마크다운 표를 엑셀로",
      lead: "Markdown 파일을 붙여 넣거나 놓고 .xlsx를 내려받으세요: 표는 각각 시트가 되고, 숫자 셀은 진짜 숫자, 머리글 행은 굵게. 전부 브라우저에서 처리됩니다.",
      ctaTop: "표 지금 변환",
      ctaBottom: ".md를 놓으세요 — 무료, 가입 불필요",
      sections: [
        {
          heading: "변환 과정",
          steps: [
            { title: "놓거나 붙여 넣기", text: "Markdown — 미리보기에 모든 표가 보입니다." },
            { title: "더 많은 형식 → Excel(XLSX)로", text: "통합 문서가 로컬에서 생성되고 표마다 시트 하나가 됩니다." },
            { title: "열기", text: "Excel, Numbers, LibreOffice, Google 스프레드시트에서." },
          ],
        },
        {
          heading: "유지되는 것",
          bullets: [
            "머리글 행(굵게)과 모든 데이터 행. 빈 셀은 빈 채로.",
            "천 단위 구분 기호를 포함한 숫자는 숫자 셀로, 나머지는 텍스트로.",
            "시트 이름은 각 표 위의 가장 가까운 제목에서.",
            "열 너비는 가장 긴 셀에 맞게.",
          ],
        },
        {
          heading: "유지되지 않는 것",
          bullets: [
            "셀 안의 인라인 서식(굵게, 링크, 코드)은 일반 텍스트가 됩니다.",
            "HTML 표와 셀 병합은 지원하지 않습니다 — 표준 Markdown 표를 쓰세요.",
            "수식은 계산하지 않습니다: =SUM(...)이 든 셀은 텍스트로 저장됩니다.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "표 여러 개를 한 번에 변환할 수 있나요?", a: "네. 문서 안의 모든 표가 같은 통합 문서의 각각 다른 시트가 됩니다." },
        { q: "제 표가 업로드되나요?", a: "아니요. Excel 파일은 브라우저에서 생성되며 서버로 아무것도 보내지 않습니다." },
        { q: "챗GPT나 Notion에서 복사한 표도 되나요?", a: "네, Markdown 표(파이프와 대시 행)이기만 하면 됩니다." },
        { q: "무료인가요?", a: "무료, 계정 불필요. 1MB 파일 크기 외에는 제한이 없습니다." },
      ],
      demo: demo("표 샘플로 체험", "Markdown 표 두 개 — 불러온 뒤 '더 많은 형식 → Excel(XLSX)로'."),
    },
  ],
  sourceToWordPage({
    chatbot: "DeepSeek",
    slug: "deepseek-word-byeonhwan",
    title: "DeepSeek 워드 변환: 답변을 DOCX로 내보내기",
    description: "DeepSeek 답변을 Word(DOCX)나 PDF로: Markdown을 붙여 넣으면 채팅 잔여물과 <think> 블록을 제거하고 수식과 표를 보존. 무료, 가입 불필요.",
    keywords: ["deepseek 워드 변환", "딥시크 워드", "deepseek docx", "deepseek 답변 저장", "deepseek pdf 변환", "딥시크 내보내기"],
    h1: "DeepSeek를 Word(DOCX)로",
    lead: "DeepSeek 답변을 팀이 편집할 수 있는 Word 문서로 — 제목, 표, 코드, 수식은 그대로, 추론 블록과 복사 버튼 잔여물은 제거.",
    quirks: [
      "복사한 답변 맨 위의 <think> … </think> 추론 블록과 '已深度思考(用时 N 秒)' 줄.",
      "\\( … \\)와 \\[ … \\] LaTeX 원본 형태의 수식.",
      "코드 블록마다 뒤따르는 '复制代码 / Copy code' 줄.",
    ],
  }),
  [
    "claude-artifacts-pdf",
    {
      title: "Claude Artifacts PDF 변환: Claude 결과물 내보내기",
      description: "Claude의 Artifacts, 코드 블록, 답변을 PDF나 Word로. Claude에서 Markdown을 복사해 여기에 붙여 넣고 바로 다운로드. 무료, 가입 불필요.",
      keywords: ["claude artifacts pdf", "claude pdf 내보내기", "claude 답변 저장 pdf", "claude artifact 내보내기", "claude 워드 변환", "claude markdown pdf"],
      h1: "Claude Artifacts를 PDF로",
      lead: "Claude의 Artifacts 패널에는 'PDF로 내보내기' 버튼이 없습니다. 내용을 복사해 여기에 붙여 넣으면 서식이 살아 있는 PDF, Word, 이미지를 얻습니다 — 코드 블록, 표, 수식까지 그대로.",
      ctaTop: "Claude 결과물 지금 변환",
      ctaBottom: "내용을 붙여 넣기만 하세요 — 무료, 가입 불필요",
      sections: [
        {
          heading: "Claude Artifact를 PDF로 저장하는 법",
          steps: [
            { title: "Artifact 복사", text: "Claude의 Artifact 패널에서 복사를 누르세요(Markdown 계열 Artifact는 서식 유지, 코드 Artifact는 코드 텍스트)." },
            { title: "여기에 붙여 넣기", text: "미리보기에서 조판 결과를 확인하세요. 채팅 잔여물은 자동으로 제거됩니다." },
            { title: "내보내기", text: "공유·인쇄는 'PDF로', 계속 편집은 'Word(DOCX)로', SNS용은 '이미지로'." },
          ],
        },
        {
          heading: "유지되는 것",
          bullets: [
            "제목 구조, 목록, 굵게와 기울임.",
            "코드 블록(고정폭 스타일), 표, 인용.",
            "LaTeX 수식: PDF, HTML, 이미지, EPUB에서 완전 조판, Word에서는 선명한 이미지로 표시(LaTeX 원본은 대체 텍스트에 보존).",
            "Mermaid 다이어그램: 이미지로 렌더링되어 모든 형식에 들어갑니다.",
          ],
        },
        {
          heading: "스크린샷 대신 PDF인 이유",
          bullets: [
            "PDF 안은 진짜 텍스트 — 검색과 복사가 됩니다.",
            "코드 블록은 PDF에서도 복사 가능.",
            "긴 내용은 자동으로 페이지가 나뉘어 인쇄에 적합하고 파일도 작습니다.",
          ],
        },
      ],
      faqHeading: FAQ_HEADING,
      faq: [
        { q: "HTML / React 계열 Artifact도 변환되나요?", a: "코드 자체는 변환됩니다: 복사하면 원본 텍스트가 나오고 코드 블록으로 PDF에 들어갑니다. 렌더링된 웹 페이지 모양을 내보내려면 Claude에서 브라우저 인쇄 기능을 쓰세요." },
        { q: "Word로도 되나요?", a: "네. 붙여 넣은 뒤 'Word(DOCX)로'를 누르세요. EPUB, HTML, 일반 텍스트로도 가능합니다." },
        { q: "제 내용이 저장되나요?", a: "아니요. PDF와 Word는 서버 메모리에서 생성된 뒤 즉시 폐기됩니다. 이미지, HTML, EPUB은 브라우저를 떠나지 않습니다." },
        { q: "무료인가요?", a: PRIVACY },
      ],
      demo: demo("샘플로 체험", "수식, 표, 코드가 든 답변 — 각 부분이 어떻게 렌더링되는지 확인하세요."),
    },
  ],
  sourceToWordPage({
    chatbot: "Gemini",
    slug: "gemini-word-byeonhwan",
    title: "Gemini 워드 변환: 답변을 DOCX로 내보내기",
    description: "Google Gemini 답변을 표, 제목, 수식이 보존된 Word(DOCX)나 PDF로. Markdown을 여기에 붙여 넣기만 — 무료, 가입 불필요, 저장 없음.",
    keywords: ["gemini 워드 변환", "제미나이 워드", "gemini docx", "gemini 답변 저장", "gemini pdf 변환", "gemini 표 워드"],
    h1: "Gemini를 Word(DOCX)로",
    lead: "Gemini의 'Docs로 내보내기'는 Google 문서를 쓰는 분께 편리합니다. .docx 파일, PDF, 또는 표의 Excel 내보내기가 필요하다면 답변을 여기에 붙여 넣고 한 번에 내보내세요.",
    quirks: [
      "일부 Gemini 화면에서 복사하면 표가 파이프 기호 한 줄이 됩니다.",
      "수식은 LaTeX 원본, 코드 블록은 언어 태그 포함.",
      "Markdown 제목 대신 굵은 섹션 제목 — 굵은 문단으로 유지됩니다.",
    ],
    faqExtra: [
      { q: "Gemini의 'Docs로 내보내기'를 쓰면 되지 않나요?", a: "목적지가 Google 문서라면 그걸 쓰세요. 이 페이지는 다운로드 가능한 .docx, PDF, EPUB, 또는 표의 Excel 내보내기가 필요할 때 — 그것도 Google 계정 없이 — 를 위한 것입니다." },
    ],
  }),
]);
