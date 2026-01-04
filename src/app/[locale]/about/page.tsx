import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { 
  isValidLocale, 
  getDictionary,
  locales,
  type Locale 
} from "@/i18n";

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  
  const titles: Record<Locale, string> = {
    en: "About",
    it: "Chi Siamo",
    es: "Acerca de",
    ja: "概要",
    ko: "소개",
    "zh-Hans": "关于",
    "zh-Hant": "關於",
    id: "Tentang",
    vi: "Giới thiệu",
  };

  const descriptions: Record<Locale, string> = {
    en: "Learn about Markdown Free - a fast, free, web-based Markdown viewer and converter. No signup required.",
    it: "Scopri Markdown Free - un visualizzatore e convertitore Markdown gratuito, veloce e basato sul web. Nessuna registrazione richiesta.",
    es: "Conoce Markdown Free - un visor y convertidor de Markdown gratuito, rápido y basado en web. Sin necesidad de registro.",
    ja: "Markdown Free について - 高速で無料のWebベースのMarkdownビューアおよびコンバーター。登録不要。",
    ko: "Markdown Free에 대해 알아보기 - 빠르고 무료인 웹 기반 Markdown 뷰어 및 변환기. 가입 불필요.",
    "zh-Hans": "了解 Markdown Free - 快速、免费的网页版 Markdown 查看器和转换器。无需注册。",
    "zh-Hant": "了解 Markdown Free - 快速、免費的網頁版 Markdown 檢視器和轉換器。無需註冊。",
    id: "Pelajari tentang Markdown Free - penampil dan konverter Markdown berbasis web yang cepat dan gratis. Tanpa perlu daftar.",
    vi: "Tìm hiểu về Markdown Free - trình xem và chuyển đổi Markdown miễn phí, nhanh chóng trên web. Không cần đăng ký.",
  };
  
  return {
    title: titles[locale],
    description: descriptions[locale],
  };
}

// Localized content (new locales fall back to English)
const content: Partial<Record<Locale, {
  title: string;
  lead: string;
  whatIs: { title: string; text: string };
  whyBuilt: { title: string; text1: string; text2: string };
  principles: { title: string; items: { title: string; text: string }[] };
  howItWorks: { title: string; steps: { title: string; text: string }[] };
  technical: { title: string; items: { title: string; text: string }[] };
  contact: { title: string; text: string };
}>> = {
  // English content - also used as fallback for new locales
  en: {
    title: "About Markdown Free",
    lead: "A fast, free, web-based Markdown viewer and converter with an ultra-simple flow.",
    whatIs: {
      title: "What is Markdown Free?",
      text: "Markdown Free lets you upload a .md file, preview it instantly with beautiful formatting, then export to PDF, TXT, or HTML with a single click. No signup required, no complex interfaces—just drag, drop, and download."
    },
    whyBuilt: {
      title: "Why we built this",
      text1: "We noticed that many people receive Markdown files but don't have an easy way to view or convert them. Existing tools often require sign-ups, have complex interfaces, or raise privacy concerns.",
      text2: "Markdown Free solves this with a single-purpose tool that anyone can understand in under 3 seconds and complete their task in under 30 seconds."
    },
    principles: {
      title: "Our principles",
      items: [
        { title: "Free forever", text: "No accounts, no subscriptions, no hidden costs" },
        { title: "Privacy first", text: "Files are processed temporarily and never stored on our servers" },
        { title: "Simple by design", text: "One page, three buttons, done" },
        { title: "Open and transparent", text: "What you see is what you get" }
      ]
    },
    howItWorks: {
      title: "How it works",
      steps: [
        { title: "Upload", text: "Drag & drop your .md, .markdown, or .txt file" },
        { title: "Preview", text: "See your formatted Markdown instantly" },
        { title: "Export", text: "Click To PDF, To TXT, or To HTML to download" }
      ]
    },
    technical: {
      title: "Technical details",
      items: [
        { title: "Preview & HTML/TXT export:", text: "Processed entirely in your browser using modern web technologies" },
        { title: "PDF export:", text: "Generated server-side for high fidelity, then immediately discarded" },
        { title: "File size limit:", text: "Up to 5 MB per file" },
        { title: "Supported formats:", text: "GitHub Flavored Markdown (GFM) including tables, task lists, and strikethrough" }
      ]
    },
    contact: {
      title: "Questions or feedback?",
      text: "We'd love to hear from you! Click the Feedback button in the header to share your thoughts, report issues, or suggest improvements."
    }
  },
  it: {
    title: "Chi Siamo - Markdown Free",
    lead: "Un visualizzatore e convertitore Markdown veloce, gratuito e basato sul web, con un flusso ultra-semplice.",
    whatIs: {
      title: "Cos'è Markdown Free?",
      text: "Markdown Free ti permette di caricare un file .md, visualizzarlo istantaneamente con una formattazione elegante, e poi esportarlo in PDF, TXT o HTML con un solo clic. Nessuna registrazione, nessuna interfaccia complessa — solo trascina, rilascia e scarica."
    },
    whyBuilt: {
      title: "Perché l'abbiamo creato",
      text1: "Abbiamo notato che molte persone ricevono file Markdown ma non hanno un modo semplice per visualizzarli o convertirli. Gli strumenti esistenti spesso richiedono registrazioni, hanno interfacce complesse o sollevano preoccupazioni sulla privacy.",
      text2: "Markdown Free risolve questo problema con uno strumento a scopo singolo che chiunque può capire in meno di 3 secondi e completare il proprio compito in meno di 30 secondi."
    },
    principles: {
      title: "I nostri principi",
      items: [
        { title: "Gratis per sempre", text: "Nessun account, nessun abbonamento, nessun costo nascosto" },
        { title: "Privacy prima di tutto", text: "I file vengono elaborati temporaneamente e mai salvati sui nostri server" },
        { title: "Semplice per design", text: "Una pagina, tre pulsanti, fatto" },
        { title: "Aperto e trasparente", text: "Quello che vedi è quello che ottieni" }
      ]
    },
    howItWorks: {
      title: "Come funziona",
      steps: [
        { title: "Carica", text: "Trascina e rilascia il tuo file .md, .markdown o .txt" },
        { title: "Anteprima", text: "Visualizza il tuo Markdown formattato istantaneamente" },
        { title: "Esporta", text: "Clicca su In PDF, In TXT o In HTML per scaricare" }
      ]
    },
    technical: {
      title: "Dettagli tecnici",
      items: [
        { title: "Anteprima ed esportazione HTML/TXT:", text: "Elaborazione interamente nel tuo browser usando tecnologie web moderne" },
        { title: "Esportazione PDF:", text: "Generata lato server per alta fedeltà, poi immediatamente eliminata" },
        { title: "Limite dimensione file:", text: "Fino a 5 MB per file" },
        { title: "Formati supportati:", text: "GitHub Flavored Markdown (GFM) incluse tabelle, liste di attività e testo barrato" }
      ]
    },
    contact: {
      title: "Domande o feedback?",
      text: "Ci piacerebbe sentirti! Clicca il pulsante Feedback nell'intestazione per condividere i tuoi pensieri, segnalare problemi o suggerire miglioramenti."
    }
  },
  es: {
    title: "Acerca de Markdown Free",
    lead: "Un visor y convertidor de Markdown rápido, gratuito y basado en web, con un flujo ultra-simple.",
    whatIs: {
      title: "¿Qué es Markdown Free?",
      text: "Markdown Free te permite subir un archivo .md, previsualizarlo instantáneamente con un formato elegante, y luego exportarlo a PDF, TXT o HTML con un solo clic. Sin registro, sin interfaces complejas — solo arrastra, suelta y descarga."
    },
    whyBuilt: {
      title: "Por qué lo creamos",
      text1: "Notamos que muchas personas reciben archivos Markdown pero no tienen una forma fácil de verlos o convertirlos. Las herramientas existentes a menudo requieren registros, tienen interfaces complejas o generan preocupaciones de privacidad.",
      text2: "Markdown Free resuelve esto con una herramienta de propósito único que cualquiera puede entender en menos de 3 segundos y completar su tarea en menos de 30 segundos."
    },
    principles: {
      title: "Nuestros principios",
      items: [
        { title: "Gratis para siempre", text: "Sin cuentas, sin suscripciones, sin costos ocultos" },
        { title: "Privacidad primero", text: "Los archivos se procesan temporalmente y nunca se almacenan en nuestros servidores" },
        { title: "Simple por diseño", text: "Una página, tres botones, listo" },
        { title: "Abierto y transparente", text: "Lo que ves es lo que obtienes" }
      ]
    },
    howItWorks: {
      title: "Cómo funciona",
      steps: [
        { title: "Subir", text: "Arrastra y suelta tu archivo .md, .markdown o .txt" },
        { title: "Vista previa", text: "Ve tu Markdown formateado instantáneamente" },
        { title: "Exportar", text: "Haz clic en A PDF, A TXT o A HTML para descargar" }
      ]
    },
    technical: {
      title: "Detalles técnicos",
      items: [
        { title: "Vista previa y exportación HTML/TXT:", text: "Procesado completamente en tu navegador usando tecnologías web modernas" },
        { title: "Exportación PDF:", text: "Generado del lado del servidor para alta fidelidad, luego eliminado inmediatamente" },
        { title: "Límite de tamaño:", text: "Hasta 5 MB por archivo" },
        { title: "Formatos soportados:", text: "GitHub Flavored Markdown (GFM) incluyendo tablas, listas de tareas y texto tachado" }
      ]
    },
    contact: {
      title: "¿Preguntas o comentarios?",
      text: "¡Nos encantaría saber de ti! Haz clic en el botón de Comentarios en el encabezado para compartir tus pensamientos, reportar problemas o sugerir mejoras."
    }
  },
  ja: {
    title: "Markdown Free について",
    lead: "高速・無料・ウェブベースのMarkdownビューア＆コンバーター。シンプルな操作で完結。",
    whatIs: {
      title: "Markdown Free とは？",
      text: "Markdown Freeは、.mdファイルをアップロードし、美しいフォーマットで即座にプレビューし、ワンクリックでPDF、TXT、HTMLにエクスポートできます。登録不要、複雑なインターフェースなし—ドラッグ＆ドロップしてダウンロードするだけ。"
    },
    whyBuilt: {
      title: "開発の背景",
      text1: "多くの人がMarkdownファイルを受け取っても、簡単に閲覧・変換する方法がないことに気づきました。既存のツールは登録が必要だったり、複雑なインターフェースだったり、プライバシーの懸念がありました。",
      text2: "Markdown Freeは、誰でも3秒で理解し、30秒以内にタスクを完了できる単一目的のツールでこれを解決します。"
    },
    principles: {
      title: "私たちの方針",
      items: [
        { title: "永久無料", text: "アカウント不要、サブスクリプションなし、隠れたコストなし" },
        { title: "プライバシー最優先", text: "ファイルは一時的に処理され、サーバーに保存されることはありません" },
        { title: "シンプル設計", text: "1ページ、3つのボタン、完了" },
        { title: "オープンで透明", text: "見たままの結果を得られます" }
      ]
    },
    howItWorks: {
      title: "使い方",
      steps: [
        { title: "アップロード", text: ".md、.markdown、または.txtファイルをドラッグ＆ドロップ" },
        { title: "プレビュー", text: "フォーマットされたMarkdownを即座に確認" },
        { title: "エクスポート", text: "PDF、TXT、またはHTMLをクリックしてダウンロード" }
      ]
    },
    technical: {
      title: "技術的な詳細",
      items: [
        { title: "プレビュー＆HTML/TXTエクスポート:", text: "最新のウェブ技術を使用してブラウザ内で完全に処理" },
        { title: "PDFエクスポート:", text: "高品質のためサーバーサイドで生成し、即座に削除" },
        { title: "ファイルサイズ制限:", text: "ファイルあたり最大5MB" },
        { title: "対応フォーマット:", text: "GitHub Flavored Markdown（GFM）：テーブル、タスクリスト、取り消し線を含む" }
      ]
    },
    contact: {
      title: "ご質問・フィードバック",
      text: "ご意見をお聞かせください！ヘッダーのフィードバックボタンをクリックして、ご感想、問題の報告、改善提案をお寄せください。"
    }
  },
  ko: {
    title: "Markdown Free 소개",
    lead: "빠르고, 무료이며, 웹 기반의 Markdown 뷰어 및 변환기. 매우 간단한 흐름으로 작업 완료.",
    whatIs: {
      title: "Markdown Free란?",
      text: "Markdown Free를 사용하면 .md 파일을 업로드하고, 아름다운 포맷으로 즉시 미리 보고, 클릭 한 번으로 PDF, TXT 또는 HTML로 내보낼 수 있습니다. 가입 불필요, 복잡한 인터페이스 없음—드래그, 드롭, 다운로드만 하면 됩니다."
    },
    whyBuilt: {
      title: "개발 배경",
      text1: "많은 사람들이 Markdown 파일을 받지만 쉽게 보거나 변환할 방법이 없다는 것을 알게 되었습니다. 기존 도구들은 가입이 필요하거나, 복잡한 인터페이스를 가지고 있거나, 개인정보 보호 우려가 있었습니다.",
      text2: "Markdown Free는 누구나 3초 안에 이해하고 30초 안에 작업을 완료할 수 있는 단일 목적 도구로 이 문제를 해결합니다."
    },
    principles: {
      title: "우리의 원칙",
      items: [
        { title: "영구 무료", text: "계정 없음, 구독 없음, 숨겨진 비용 없음" },
        { title: "프라이버시 우선", text: "파일은 일시적으로 처리되며 서버에 저장되지 않습니다" },
        { title: "심플한 설계", text: "한 페이지, 세 개의 버튼, 끝" },
        { title: "개방적이고 투명함", text: "보이는 그대로 결과를 얻습니다" }
      ]
    },
    howItWorks: {
      title: "사용 방법",
      steps: [
        { title: "업로드", text: ".md, .markdown 또는 .txt 파일을 드래그 앤 드롭" },
        { title: "미리보기", text: "포맷된 Markdown을 즉시 확인" },
        { title: "내보내기", text: "PDF, TXT 또는 HTML을 클릭하여 다운로드" }
      ]
    },
    technical: {
      title: "기술 세부사항",
      items: [
        { title: "미리보기 및 HTML/TXT 내보내기:", text: "최신 웹 기술을 사용하여 브라우저에서 완전히 처리" },
        { title: "PDF 내보내기:", text: "고품질을 위해 서버 측에서 생성 후 즉시 삭제" },
        { title: "파일 크기 제한:", text: "파일당 최대 5MB" },
        { title: "지원 형식:", text: "GitHub Flavored Markdown(GFM): 표, 작업 목록, 취소선 포함" }
      ]
    },
    contact: {
      title: "질문이나 피드백이 있으신가요?",
      text: "의견을 듣고 싶습니다! 헤더의 피드백 버튼을 클릭하여 생각을 공유하고, 문제를 보고하거나, 개선 사항을 제안해 주세요."
    }
  },
  "zh-Hans": {
    title: "关于 Markdown Free",
    lead: "快速、免费、基于网页的 Markdown 查看器和转换器。操作流程极其简单。",
    whatIs: {
      title: "什么是 Markdown Free？",
      text: "Markdown Free 让您上传 .md 文件，即时预览美观的格式，然后一键导出为 PDF、TXT 或 HTML。无需注册，无复杂界面——只需拖放和下载。"
    },
    whyBuilt: {
      title: "为什么开发这个工具",
      text1: "我们注意到很多人收到 Markdown 文件，但没有简单的方法来查看或转换它们。现有工具往往需要注册、界面复杂，或存在隐私问题。",
      text2: "Markdown Free 通过一个单一用途的工具解决了这个问题，任何人都能在3秒内理解，30秒内完成任务。"
    },
    principles: {
      title: "我们的原则",
      items: [
        { title: "永久免费", text: "无需账户，无订阅，无隐藏费用" },
        { title: "隐私优先", text: "文件仅临时处理，从不存储在服务器上" },
        { title: "简约设计", text: "一个页面，三个按钮，搞定" },
        { title: "开放透明", text: "所见即所得" }
      ]
    },
    howItWorks: {
      title: "如何使用",
      steps: [
        { title: "上传", text: "拖放您的 .md、.markdown 或 .txt 文件" },
        { title: "预览", text: "即时查看格式化的 Markdown" },
        { title: "导出", text: "点击 PDF、TXT 或 HTML 下载" }
      ]
    },
    technical: {
      title: "技术细节",
      items: [
        { title: "预览和 HTML/TXT 导出:", text: "使用现代网页技术完全在浏览器中处理" },
        { title: "PDF 导出:", text: "在服务器端生成以保证高保真度，然后立即删除" },
        { title: "文件大小限制:", text: "每个文件最大 5MB" },
        { title: "支持格式:", text: "GitHub Flavored Markdown（GFM），包括表格、任务列表和删除线" }
      ]
    },
    contact: {
      title: "有问题或反馈？",
      text: "我们期待您的意见！点击页眉的反馈按钮，分享您的想法、报告问题或提出改进建议。"
    }
  },
  "zh-Hant": {
    title: "關於 Markdown Free",
    lead: "快速、免費、基於網頁的 Markdown 檢視器和轉換器。操作流程極其簡單。",
    whatIs: {
      title: "什麼是 Markdown Free？",
      text: "Markdown Free 讓您上傳 .md 檔案，即時預覽美觀的格式，然後一鍵匯出為 PDF、TXT 或 HTML。無需註冊，無複雜介面——只需拖放和下載。"
    },
    whyBuilt: {
      title: "為什麼開發這個工具",
      text1: "我們注意到很多人收到 Markdown 檔案，但沒有簡單的方法來檢視或轉換它們。現有工具往往需要註冊、介面複雜，或存在隱私問題。",
      text2: "Markdown Free 通過一個單一用途的工具解決了這個問題，任何人都能在3秒內理解，30秒內完成任務。"
    },
    principles: {
      title: "我們的原則",
      items: [
        { title: "永久免費", text: "無需帳戶，無訂閱，無隱藏費用" },
        { title: "隱私優先", text: "檔案僅臨時處理，從不儲存在伺服器上" },
        { title: "簡約設計", text: "一個頁面，三個按鈕，搞定" },
        { title: "開放透明", text: "所見即所得" }
      ]
    },
    howItWorks: {
      title: "如何使用",
      steps: [
        { title: "上傳", text: "拖放您的 .md、.markdown 或 .txt 檔案" },
        { title: "預覽", text: "即時檢視格式化的 Markdown" },
        { title: "匯出", text: "點擊 PDF、TXT 或 HTML 下載" }
      ]
    },
    technical: {
      title: "技術細節",
      items: [
        { title: "預覽和 HTML/TXT 匯出:", text: "使用現代網頁技術完全在瀏覽器中處理" },
        { title: "PDF 匯出:", text: "在伺服器端生成以保證高保真度，然後立即刪除" },
        { title: "檔案大小限制:", text: "每個檔案最大 5MB" },
        { title: "支援格式:", text: "GitHub Flavored Markdown（GFM），包括表格、任務列表和刪除線" }
      ]
    },
    contact: {
      title: "有問題或回饋？",
      text: "我們期待您的意見！點擊頁首的回饋按鈕，分享您的想法、報告問題或提出改進建議。"
    }
  },
  id: {
    title: "Tentang Markdown Free",
    lead: "Penampil dan konverter Markdown berbasis web yang cepat, gratis, dengan alur yang sangat sederhana.",
    whatIs: {
      title: "Apa itu Markdown Free?",
      text: "Markdown Free memungkinkan Anda mengunggah file .md, melihat pratinjau secara instan dengan format yang indah, lalu mengekspor ke PDF, TXT, atau HTML dengan satu klik. Tanpa perlu daftar, tanpa antarmuka yang rumit—cukup seret, lepas, dan unduh."
    },
    whyBuilt: {
      title: "Mengapa kami membuat ini",
      text1: "Kami menyadari bahwa banyak orang menerima file Markdown tetapi tidak memiliki cara mudah untuk melihat atau mengonversinya. Alat yang ada sering memerlukan pendaftaran, memiliki antarmuka yang rumit, atau menimbulkan masalah privasi.",
      text2: "Markdown Free mengatasi ini dengan alat tujuan tunggal yang dapat dipahami siapa pun dalam waktu kurang dari 3 detik dan menyelesaikan tugas dalam waktu kurang dari 30 detik."
    },
    principles: {
      title: "Prinsip kami",
      items: [
        { title: "Gratis selamanya", text: "Tanpa akun, tanpa langganan, tanpa biaya tersembunyi" },
        { title: "Privasi utama", text: "File diproses sementara dan tidak pernah disimpan di server kami" },
        { title: "Sederhana dari desain", text: "Satu halaman, tiga tombol, selesai" },
        { title: "Terbuka dan transparan", text: "Apa yang Anda lihat adalah apa yang Anda dapatkan" }
      ]
    },
    howItWorks: {
      title: "Cara kerja",
      steps: [
        { title: "Unggah", text: "Seret dan lepas file .md, .markdown, atau .txt Anda" },
        { title: "Pratinjau", text: "Lihat Markdown Anda yang diformat secara instan" },
        { title: "Ekspor", text: "Klik Ke PDF, Ke TXT, atau Ke HTML untuk mengunduh" }
      ]
    },
    technical: {
      title: "Detail teknis",
      items: [
        { title: "Pratinjau & ekspor HTML/TXT:", text: "Diproses sepenuhnya di browser Anda menggunakan teknologi web modern" },
        { title: "Ekspor PDF:", text: "Dibuat di sisi server untuk kualitas tinggi, lalu langsung dihapus" },
        { title: "Batas ukuran file:", text: "Hingga 5 MB per file" },
        { title: "Format yang didukung:", text: "GitHub Flavored Markdown (GFM) termasuk tabel, daftar tugas, dan coretan" }
      ]
    },
    contact: {
      title: "Pertanyaan atau masukan?",
      text: "Kami senang mendengar dari Anda! Klik tombol Umpan Balik di header untuk berbagi pemikiran, melaporkan masalah, atau menyarankan perbaikan."
    }
  },
  vi: {
    title: "Giới thiệu Markdown Free",
    lead: "Trình xem và chuyển đổi Markdown miễn phí, nhanh chóng, dựa trên web với quy trình cực kỳ đơn giản.",
    whatIs: {
      title: "Markdown Free là gì?",
      text: "Markdown Free cho phép bạn tải lên file .md, xem trước ngay lập tức với định dạng đẹp, sau đó xuất sang PDF, TXT hoặc HTML chỉ với một cú nhấp chuột. Không cần đăng ký, không có giao diện phức tạp—chỉ cần kéo, thả và tải xuống."
    },
    whyBuilt: {
      title: "Tại sao chúng tôi xây dựng công cụ này",
      text1: "Chúng tôi nhận thấy nhiều người nhận được file Markdown nhưng không có cách dễ dàng để xem hoặc chuyển đổi chúng. Các công cụ hiện có thường yêu cầu đăng ký, có giao diện phức tạp, hoặc gây lo ngại về quyền riêng tư.",
      text2: "Markdown Free giải quyết vấn đề này với một công cụ đơn mục đích mà bất kỳ ai cũng có thể hiểu trong dưới 3 giây và hoàn thành nhiệm vụ trong dưới 30 giây."
    },
    principles: {
      title: "Nguyên tắc của chúng tôi",
      items: [
        { title: "Miễn phí mãi mãi", text: "Không cần tài khoản, không đăng ký, không chi phí ẩn" },
        { title: "Quyền riêng tư là ưu tiên", text: "File được xử lý tạm thời và không bao giờ được lưu trữ trên máy chủ của chúng tôi" },
        { title: "Đơn giản theo thiết kế", text: "Một trang, ba nút, xong" },
        { title: "Mở và minh bạch", text: "Những gì bạn thấy là những gì bạn nhận được" }
      ]
    },
    howItWorks: {
      title: "Cách hoạt động",
      steps: [
        { title: "Tải lên", text: "Kéo và thả file .md, .markdown hoặc .txt của bạn" },
        { title: "Xem trước", text: "Xem Markdown đã định dạng của bạn ngay lập tức" },
        { title: "Xuất", text: "Nhấp Sang PDF, Sang TXT hoặc Sang HTML để tải xuống" }
      ]
    },
    technical: {
      title: "Chi tiết kỹ thuật",
      items: [
        { title: "Xem trước & xuất HTML/TXT:", text: "Được xử lý hoàn toàn trong trình duyệt của bạn bằng công nghệ web hiện đại" },
        { title: "Xuất PDF:", text: "Được tạo phía máy chủ để đảm bảo chất lượng cao, sau đó xóa ngay lập tức" },
        { title: "Giới hạn kích thước file:", text: "Tối đa 5 MB mỗi file" },
        { title: "Định dạng được hỗ trợ:", text: "GitHub Flavored Markdown (GFM) bao gồm bảng, danh sách công việc và gạch ngang" }
      ]
    },
    contact: {
      title: "Câu hỏi hoặc phản hồi?",
      text: "Chúng tôi rất muốn nghe từ bạn! Nhấp vào nút Phản hồi trong tiêu đề để chia sẻ suy nghĩ, báo cáo vấn đề hoặc đề xuất cải tiến."
    }
  }
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  
  if (!isValidLocale(localeParam)) {
    notFound();
  }
  
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);
  // Fall back to English content for locales without full page translation
  const c = content[locale] ?? content.en!;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>{c.title}</h1>
        <p className="lead">{c.lead}</p>

        <h2>{c.whatIs.title}</h2>
        <p>{c.whatIs.text}</p>

        <h2>{c.whyBuilt.title}</h2>
        <p>{c.whyBuilt.text1}</p>
        <p>{c.whyBuilt.text2}</p>

        <h2>{c.principles.title}</h2>
        <ul>
          {c.principles.items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> — {item.text}
            </li>
          ))}
        </ul>

        <h2>{c.howItWorks.title}</h2>
        <ol>
          {c.howItWorks.steps.map((step, i) => (
            <li key={i}>
              <strong>{step.title}</strong> — {step.text}
            </li>
          ))}
        </ol>

        <h2>{c.technical.title}</h2>
        <ul>
          {c.technical.items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> {item.text}
            </li>
          ))}
        </ul>

        <h2>{c.contact.title}</h2>
        <p>{c.contact.text}</p>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
  );
}

