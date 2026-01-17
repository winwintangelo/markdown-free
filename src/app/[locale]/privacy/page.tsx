import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
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
    en: "Privacy Policy",
    it: "Informativa sulla Privacy",
    es: "Política de Privacidad",
    ja: "プライバシーポリシー",
    ko: "개인정보 처리방침",
    "zh-Hans": "隐私政策",
    "zh-Hant": "隱私政策",
    id: "Kebijakan Privasi",
    vi: "Chính sách Bảo mật",
  };

  const descriptions: Record<Locale, string> = {
    en: "Privacy policy for Markdown Free. Learn how we handle your files and data. No accounts, no tracking, no stored content.",
    it: "Informativa sulla privacy di Markdown Free. Scopri come gestiamo i tuoi file e dati. Nessun account, nessun tracciamento, nessun contenuto salvato.",
    es: "Política de privacidad de Markdown Free. Conoce cómo manejamos tus archivos y datos. Sin cuentas, sin rastreo, sin contenido almacenado.",
    ja: "Markdown Freeのプライバシーポリシー。ファイルとデータの取り扱いについて。アカウント不要、追跡なし、コンテンツ保存なし。",
    ko: "Markdown Free 개인정보 처리방침. 파일과 데이터 처리 방법을 알아보세요. 계정 불필요, 추적 없음, 저장된 콘텐츠 없음.",
    "zh-Hans": "Markdown Free 隐私政策。了解我们如何处理您的文件和数据。无需账户，无追踪，无存储内容。",
    "zh-Hant": "Markdown Free 隱私政策。了解我們如何處理您的檔案和資料。無需帳戶，無追蹤，無儲存內容。",
    id: "Kebijakan privasi Markdown Free. Pelajari cara kami menangani file dan data Anda. Tanpa akun, tanpa pelacakan, tanpa konten tersimpan.",
    vi: "Chính sách bảo mật của Markdown Free. Tìm hiểu cách chúng tôi xử lý tệp và dữ liệu của bạn. Không cần tài khoản, không theo dõi, không lưu trữ nội dung.",
  };
  
  return {
    title: titles[locale],
    description: descriptions[locale],
  };
}

// Localized content structure (new locales fall back to English)
const content: Partial<Record<Locale, {
  title: string;
  lead: string;
  shortVersion: { title: string; items: { title: string; text: string }[] };
  filesProcessed: {
    title: string;
    preview: { title: string; text: string };
    pdf: { title: string; text: string; items: string[] };
  };
  noCollect: { title: string; items: string[] };
  analytics: { title: string; text1: string; text2: string; items: string[]; notice: string };
  thirdParties: { title: string; text: string };
  security: { title: string; items: { title: string; text: string }[] };
  changes: { title: string; text: string; date: string };
  contact: { title: string; text: string };
}>> = {
  en: {
    title: "Privacy Policy",
    lead: "Your privacy matters. Here's exactly how Markdown Free handles your data.",
    shortVersion: {
      title: "The short version",
      items: [
        { title: "No accounts", text: "We don't collect any personal information" },
        { title: "No tracking cookies", text: "We don't use cookies or track your content" },
        { title: "No storage", text: "Your files are never stored on our servers" },
        { title: "HTTPS only", text: "All connections are encrypted" }
      ]
    },
    filesProcessed: {
      title: "How files are processed",
      preview: {
        title: "Preview, HTML & TXT export",
        text: "When you upload a file for preview or export to HTML/TXT, everything happens entirely in your browser. Your file never leaves your device. We use client-side JavaScript to parse and render the Markdown."
      },
      pdf: {
        title: "PDF export",
        text: "For PDF generation, your Markdown content is sent to our server, converted to PDF, and immediately returned to you. The content is:",
        items: [
          "Processed in memory only",
          "Never written to disk",
          "Immediately discarded after the PDF is generated",
          "Not logged, analyzed, or stored in any way"
        ]
      }
    },
    noCollect: {
      title: "Data we don't collect",
      items: [
        "Personal information (names, emails, accounts)",
        "Document content or file contents",
        "File names or metadata",
        "Your IP address in logs",
        "Cookies for tracking"
      ]
    },
    analytics: {
      title: "Analytics",
      text1: "We use Umami Cloud, a privacy-focused, cookieless analytics platform. It helps us understand how many people use Markdown Free and which features are most useful.",
      text2: "Umami does not use cookies and does not collect personal information such as names, email addresses, or IP addresses. We only see aggregated data like:",
      items: [
        "Page views and visitor counts",
        "Referrer information (where visitors come from)",
        "Counts of successful conversions (PDF, TXT, HTML)",
        "General device/browser information"
      ],
      notice: "We do not send your Markdown content, file names, or any text you paste to our analytics provider. Analytics respects your browser's Do Not Track setting."
    },
    thirdParties: {
      title: "Third parties",
      text: "We do not share any data with third parties. The PDF generation runs on our own serverless infrastructure (Vercel). No external services see your content."
    },
    security: {
      title: "Security",
      items: [
        { title: "HTTPS everywhere", text: "All traffic is encrypted" },
        { title: "XSS protection", text: "User content is sanitized before rendering" },
        { title: "No persistent storage", text: "Nothing to breach" }
      ]
    },
    changes: {
      title: "Changes to this policy",
      text: "If we make changes to this privacy policy, we'll update the date below. Significant changes will be noted on the homepage.",
      date: "Last updated: December 2024"
    },
    contact: {
      title: "Contact",
      text: "Questions about privacy? Click the Feedback button in the header to reach us."
    }
  },
  it: {
    title: "Informativa sulla Privacy",
    lead: "La tua privacy è importante. Ecco esattamente come Markdown Free gestisce i tuoi dati.",
    shortVersion: {
      title: "In breve",
      items: [
        { title: "Nessun account", text: "Non raccogliamo alcuna informazione personale" },
        { title: "Nessun cookie di tracciamento", text: "Non utilizziamo cookie e non tracciamo i tuoi contenuti" },
        { title: "Nessun salvataggio", text: "I tuoi file non vengono mai salvati sui nostri server" },
        { title: "Solo HTTPS", text: "Tutte le connessioni sono crittografate" }
      ]
    },
    filesProcessed: {
      title: "Come vengono elaborati i file",
      preview: {
        title: "Anteprima, esportazione HTML e TXT",
        text: "Quando carichi un file per l'anteprima o l'esportazione in HTML/TXT, tutto avviene interamente nel tuo browser. Il tuo file non lascia mai il tuo dispositivo. Utilizziamo JavaScript lato client per analizzare e renderizzare il Markdown."
      },
      pdf: {
        title: "Esportazione PDF",
        text: "Per la generazione del PDF, il contenuto Markdown viene inviato al nostro server, convertito in PDF e immediatamente restituito. Il contenuto è:",
        items: [
          "Elaborato solo in memoria",
          "Mai scritto su disco",
          "Immediatamente eliminato dopo la generazione del PDF",
          "Non registrato, analizzato o salvato in alcun modo"
        ]
      }
    },
    noCollect: {
      title: "Dati che non raccogliamo",
      items: [
        "Informazioni personali (nomi, email, account)",
        "Contenuto dei documenti o dei file",
        "Nomi dei file o metadati",
        "Il tuo indirizzo IP nei log",
        "Cookie per il tracciamento"
      ]
    },
    analytics: {
      title: "Analytics",
      text1: "Utilizziamo Umami Cloud, una piattaforma di analytics rispettosa della privacy e senza cookie. Ci aiuta a capire quante persone usano Markdown Free e quali funzionalità sono più utili.",
      text2: "Umami non utilizza cookie e non raccoglie informazioni personali come nomi, indirizzi email o IP. Vediamo solo dati aggregati come:",
      items: [
        "Visualizzazioni di pagina e conteggio visitatori",
        "Informazioni sui referrer (da dove arrivano i visitatori)",
        "Conteggio delle conversioni riuscite (PDF, TXT, HTML)",
        "Informazioni generali su dispositivo/browser"
      ],
      notice: "Non inviamo il contenuto Markdown, i nomi dei file o qualsiasi testo che incolli al nostro provider di analytics. Le analytics rispettano l'impostazione Do Not Track del tuo browser."
    },
    thirdParties: {
      title: "Terze parti",
      text: "Non condividiamo alcun dato con terze parti. La generazione PDF avviene sulla nostra infrastruttura serverless (Vercel). Nessun servizio esterno vede i tuoi contenuti."
    },
    security: {
      title: "Sicurezza",
      items: [
        { title: "HTTPS ovunque", text: "Tutto il traffico è crittografato" },
        { title: "Protezione XSS", text: "Il contenuto utente viene sanificato prima del rendering" },
        { title: "Nessun salvataggio persistente", text: "Nulla da violare" }
      ]
    },
    changes: {
      title: "Modifiche a questa policy",
      text: "Se apportiamo modifiche a questa informativa sulla privacy, aggiorneremo la data qui sotto. Le modifiche significative saranno indicate sulla homepage.",
      date: "Ultimo aggiornamento: Dicembre 2024"
    },
    contact: {
      title: "Contatti",
      text: "Domande sulla privacy? Clicca il pulsante Feedback nell'intestazione per contattarci."
    }
  },
  es: {
    title: "Política de Privacidad",
    lead: "Tu privacidad importa. Aquí explicamos exactamente cómo Markdown Free maneja tus datos.",
    shortVersion: {
      title: "La versión corta",
      items: [
        { title: "Sin cuentas", text: "No recopilamos información personal" },
        { title: "Sin cookies de rastreo", text: "No usamos cookies ni rastreamos tu contenido" },
        { title: "Sin almacenamiento", text: "Tus archivos nunca se guardan en nuestros servidores" },
        { title: "Solo HTTPS", text: "Todas las conexiones están encriptadas" }
      ]
    },
    filesProcessed: {
      title: "Cómo se procesan los archivos",
      preview: {
        title: "Vista previa, exportación HTML y TXT",
        text: "Cuando subes un archivo para vista previa o exportación a HTML/TXT, todo sucede completamente en tu navegador. Tu archivo nunca sale de tu dispositivo. Usamos JavaScript del lado del cliente para analizar y renderizar el Markdown."
      },
      pdf: {
        title: "Exportación PDF",
        text: "Para la generación de PDF, tu contenido Markdown se envía a nuestro servidor, se convierte a PDF y se te devuelve inmediatamente. El contenido es:",
        items: [
          "Procesado solo en memoria",
          "Nunca escrito en disco",
          "Eliminado inmediatamente después de generar el PDF",
          "No registrado, analizado ni almacenado de ninguna manera"
        ]
      }
    },
    noCollect: {
      title: "Datos que no recopilamos",
      items: [
        "Información personal (nombres, emails, cuentas)",
        "Contenido de documentos o archivos",
        "Nombres de archivos o metadatos",
        "Tu dirección IP en registros",
        "Cookies para rastreo"
      ]
    },
    analytics: {
      title: "Analytics",
      text1: "Usamos Umami Cloud, una plataforma de análisis enfocada en privacidad y sin cookies. Nos ayuda a entender cuántas personas usan Markdown Free y qué funciones son más útiles.",
      text2: "Umami no usa cookies y no recopila información personal como nombres, direcciones de email o IPs. Solo vemos datos agregados como:",
      items: [
        "Vistas de página y conteo de visitantes",
        "Información de referencia (de dónde vienen los visitantes)",
        "Conteo de conversiones exitosas (PDF, TXT, HTML)",
        "Información general de dispositivo/navegador"
      ],
      notice: "No enviamos tu contenido Markdown, nombres de archivos o cualquier texto que pegues a nuestro proveedor de analytics. Las analytics respetan la configuración Do Not Track de tu navegador."
    },
    thirdParties: {
      title: "Terceros",
      text: "No compartimos datos con terceros. La generación de PDF se ejecuta en nuestra propia infraestructura serverless (Vercel). Ningún servicio externo ve tu contenido."
    },
    security: {
      title: "Seguridad",
      items: [
        { title: "HTTPS en todas partes", text: "Todo el tráfico está encriptado" },
        { title: "Protección XSS", text: "El contenido del usuario se sanea antes de renderizar" },
        { title: "Sin almacenamiento persistente", text: "Nada que vulnerar" }
      ]
    },
    changes: {
      title: "Cambios a esta política",
      text: "Si hacemos cambios a esta política de privacidad, actualizaremos la fecha abajo. Los cambios significativos se notarán en la página principal.",
      date: "Última actualización: Diciembre 2024"
    },
    contact: {
      title: "Contacto",
      text: "¿Preguntas sobre privacidad? Haz clic en el botón de Comentarios en el encabezado para contactarnos."
    }
  },
  ja: {
    title: "プライバシーポリシー",
    lead: "あなたのプライバシーは重要です。Markdown Freeがデータをどのように扱うかを説明します。",
    shortVersion: {
      title: "概要",
      items: [
        { title: "アカウント不要", text: "個人情報を収集しません" },
        { title: "トラッキングCookieなし", text: "Cookieを使用せず、コンテンツを追跡しません" },
        { title: "保存なし", text: "ファイルはサーバーに保存されません" },
        { title: "HTTPSのみ", text: "すべての接続は暗号化されています" }
      ]
    },
    filesProcessed: {
      title: "ファイルの処理方法",
      preview: {
        title: "プレビュー、HTML＆TXTエクスポート",
        text: "プレビューやHTML/TXTへのエクスポート時、すべてブラウザ内で処理されます。ファイルはデバイスから離れることはありません。クライアントサイドのJavaScriptでMarkdownを解析・レンダリングします。"
      },
      pdf: {
        title: "PDFエクスポート",
        text: "PDF生成時、Markdownコンテンツはサーバーに送信され、PDFに変換後すぐに返されます。コンテンツは：",
        items: [
          "メモリ内でのみ処理",
          "ディスクに書き込まれない",
          "PDF生成後すぐに破棄",
          "ログ、分析、保存は一切なし"
        ]
      }
    },
    noCollect: {
      title: "収集しないデータ",
      items: [
        "個人情報（名前、メール、アカウント）",
        "ドキュメントやファイルの内容",
        "ファイル名やメタデータ",
        "ログ内のIPアドレス",
        "トラッキング用Cookie"
      ]
    },
    analytics: {
      title: "アナリティクス",
      text1: "プライバシー重視でCookieを使用しないアナリティクスプラットフォーム「Umami Cloud」を使用しています。Markdown Freeの利用者数や人気機能の把握に役立てています。",
      text2: "Umamiは、Cookieを使用せず、名前、メールアドレス、IPアドレスなどの個人情報を収集しません。集計データのみ確認できます：",
      items: [
        "ページビューと訪問者数",
        "リファラー情報（訪問元）",
        "変換成功数（PDF、TXT、HTML）",
        "一般的なデバイス/ブラウザ情報"
      ],
      notice: "Markdownコンテンツ、ファイル名、貼り付けたテキストはアナリティクスプロバイダーに送信されません。アナリティクスはブラウザのDo Not Track設定を尊重します。"
    },
    thirdParties: {
      title: "第三者",
      text: "第三者とデータを共有しません。PDF生成は自社のサーバーレスインフラ（Vercel）で実行されます。外部サービスがコンテンツを見ることはありません。"
    },
    security: {
      title: "セキュリティ",
      items: [
        { title: "完全HTTPS", text: "すべてのトラフィックは暗号化" },
        { title: "XSS対策", text: "レンダリング前にユーザーコンテンツをサニタイズ" },
        { title: "永続的保存なし", text: "漏洩するものがない" }
      ]
    },
    changes: {
      title: "ポリシーの変更",
      text: "このプライバシーポリシーに変更を加える場合、下記の日付を更新します。重要な変更はホームページでお知らせします。",
      date: "最終更新日: 2024年12月"
    },
    contact: {
      title: "お問い合わせ",
      text: "プライバシーに関するご質問は、ヘッダーのフィードバックボタンからお問い合わせください。"
    }
  },
  ko: {
    title: "개인정보 처리방침",
    lead: "귀하의 개인정보는 중요합니다. Markdown Free가 데이터를 어떻게 처리하는지 정확히 설명합니다.",
    shortVersion: {
      title: "요약",
      items: [
        { title: "계정 불필요", text: "개인정보를 수집하지 않습니다" },
        { title: "추적 쿠키 없음", text: "쿠키를 사용하지 않으며 콘텐츠를 추적하지 않습니다" },
        { title: "저장 안 함", text: "파일이 서버에 저장되지 않습니다" },
        { title: "HTTPS만 사용", text: "모든 연결이 암호화됩니다" }
      ]
    },
    filesProcessed: {
      title: "파일 처리 방법",
      preview: {
        title: "미리보기, HTML 및 TXT 내보내기",
        text: "미리보기나 HTML/TXT로 내보내기 위해 파일을 업로드하면 모든 것이 브라우저 내에서 처리됩니다. 파일이 기기를 떠나지 않습니다. 클라이언트 측 JavaScript를 사용하여 Markdown을 파싱하고 렌더링합니다."
      },
      pdf: {
        title: "PDF 내보내기",
        text: "PDF 생성 시 Markdown 콘텐츠가 서버로 전송되고, PDF로 변환된 후 즉시 반환됩니다. 콘텐츠는:",
        items: [
          "메모리에서만 처리됨",
          "디스크에 기록되지 않음",
          "PDF 생성 후 즉시 삭제됨",
          "어떤 방식으로도 로그, 분석, 저장되지 않음"
        ]
      }
    },
    noCollect: {
      title: "수집하지 않는 데이터",
      items: [
        "개인정보 (이름, 이메일, 계정)",
        "문서 또는 파일 내용",
        "파일명 또는 메타데이터",
        "로그의 IP 주소",
        "추적용 쿠키"
      ]
    },
    analytics: {
      title: "분석",
      text1: "개인정보 보호에 중점을 둔 쿠키리스 분석 플랫폼인 Umami Cloud를 사용합니다. Markdown Free 사용자 수와 가장 유용한 기능을 파악하는 데 도움이 됩니다.",
      text2: "Umami는 쿠키를 사용하지 않으며 이름, 이메일 주소, IP 주소 같은 개인정보를 수집하지 않습니다. 다음과 같은 집계 데이터만 볼 수 있습니다:",
      items: [
        "페이지 조회수 및 방문자 수",
        "리퍼러 정보 (방문자 유입 경로)",
        "성공적인 변환 횟수 (PDF, TXT, HTML)",
        "일반적인 기기/브라우저 정보"
      ],
      notice: "Markdown 콘텐츠, 파일명, 붙여넣은 텍스트는 분석 제공업체에 전송되지 않습니다. 분석은 브라우저의 Do Not Track 설정을 존중합니다."
    },
    thirdParties: {
      title: "제3자",
      text: "제3자와 데이터를 공유하지 않습니다. PDF 생성은 자체 서버리스 인프라(Vercel)에서 실행됩니다. 외부 서비스가 콘텐츠를 볼 수 없습니다."
    },
    security: {
      title: "보안",
      items: [
        { title: "전체 HTTPS", text: "모든 트래픽이 암호화됨" },
        { title: "XSS 보호", text: "렌더링 전에 사용자 콘텐츠를 살균" },
        { title: "영구 저장 없음", text: "유출될 것이 없음" }
      ]
    },
    changes: {
      title: "정책 변경",
      text: "이 개인정보 처리방침에 변경 사항이 있으면 아래 날짜를 업데이트합니다. 중요한 변경 사항은 홈페이지에서 공지합니다.",
      date: "최종 업데이트: 2024년 12월"
    },
    contact: {
      title: "문의",
      text: "개인정보 관련 질문이 있으시면 헤더의 피드백 버튼을 클릭해 문의해 주세요."
    }
  },
  "zh-Hans": {
    title: "隐私政策",
    lead: "您的隐私很重要。这里详细说明 Markdown Free 如何处理您的数据。",
    shortVersion: {
      title: "简要版本",
      items: [
        { title: "无需账户", text: "我们不收集任何个人信息" },
        { title: "无跟踪 Cookie", text: "我们不使用 Cookie，不跟踪您的内容" },
        { title: "不存储", text: "您的文件从不存储在我们的服务器上" },
        { title: "仅 HTTPS", text: "所有连接都经过加密" }
      ]
    },
    filesProcessed: {
      title: "文件处理方式",
      preview: {
        title: "预览、HTML 和 TXT 导出",
        text: "当您上传文件进行预览或导出为 HTML/TXT 时，所有处理都在您的浏览器中完成。您的文件永远不会离开您的设备。我们使用客户端 JavaScript 来解析和渲染 Markdown。"
      },
      pdf: {
        title: "PDF 导出",
        text: "生成 PDF 时，您的 Markdown 内容会发送到我们的服务器，转换为 PDF 后立即返回给您。内容：",
        items: [
          "仅在内存中处理",
          "从不写入磁盘",
          "PDF 生成后立即丢弃",
          "不以任何方式记录、分析或存储"
        ]
      }
    },
    noCollect: {
      title: "我们不收集的数据",
      items: [
        "个人信息（姓名、邮箱、账户）",
        "文档或文件内容",
        "文件名或元数据",
        "日志中的 IP 地址",
        "用于跟踪的 Cookie"
      ]
    },
    analytics: {
      title: "分析",
      text1: "我们使用 Umami Cloud，这是一个注重隐私、不使用 Cookie 的分析平台。它帮助我们了解有多少人使用 Markdown Free 以及哪些功能最有用。",
      text2: "Umami 不使用 Cookie，不收集姓名、邮箱地址或 IP 地址等个人信息。我们只能看到汇总数据，例如：",
      items: [
        "页面浏览量和访客数量",
        "来源信息（访客从哪里来）",
        "成功转换次数（PDF、TXT、HTML）",
        "一般设备/浏览器信息"
      ],
      notice: "我们不会将您的 Markdown 内容、文件名或任何粘贴的文本发送给分析服务提供商。分析会尊重您浏览器的「请勿跟踪」设置。"
    },
    thirdParties: {
      title: "第三方",
      text: "我们不与第三方共享任何数据。PDF 生成在我们自己的无服务器基础设施（Vercel）上运行。没有外部服务会看到您的内容。"
    },
    security: {
      title: "安全",
      items: [
        { title: "全程 HTTPS", text: "所有流量都经过加密" },
        { title: "XSS 防护", text: "用户内容在渲染前会被净化" },
        { title: "无持久存储", text: "没有可泄露的内容" }
      ]
    },
    changes: {
      title: "政策变更",
      text: "如果我们对此隐私政策进行更改，我们将更新下方的日期。重大变更将在首页公告。",
      date: "最后更新：2024年12月"
    },
    contact: {
      title: "联系方式",
      text: "对隐私有疑问？点击页眉的反馈按钮联系我们。"
    }
  },
  "zh-Hant": {
    title: "隱私政策",
    lead: "您的隱私很重要。這裡詳細說明 Markdown Free 如何處理您的資料。",
    shortVersion: {
      title: "簡要版本",
      items: [
        { title: "無需帳戶", text: "我們不收集任何個人資訊" },
        { title: "無追蹤 Cookie", text: "我們不使用 Cookie，不追蹤您的內容" },
        { title: "不儲存", text: "您的檔案從不儲存在我們的伺服器上" },
        { title: "僅 HTTPS", text: "所有連線都經過加密" }
      ]
    },
    filesProcessed: {
      title: "檔案處理方式",
      preview: {
        title: "預覽、HTML 和 TXT 匯出",
        text: "當您上傳檔案進行預覽或匯出為 HTML/TXT 時，所有處理都在您的瀏覽器中完成。您的檔案永遠不會離開您的裝置。我們使用客戶端 JavaScript 來解析和渲染 Markdown。"
      },
      pdf: {
        title: "PDF 匯出",
        text: "生成 PDF 時，您的 Markdown 內容會傳送到我們的伺服器，轉換為 PDF 後立即回傳給您。內容：",
        items: [
          "僅在記憶體中處理",
          "從不寫入磁碟",
          "PDF 生成後立即丟棄",
          "不以任何方式記錄、分析或儲存"
        ]
      }
    },
    noCollect: {
      title: "我們不收集的資料",
      items: [
        "個人資訊（姓名、電子郵件、帳戶）",
        "文件或檔案內容",
        "檔案名稱或中繼資料",
        "日誌中的 IP 位址",
        "用於追蹤的 Cookie"
      ]
    },
    analytics: {
      title: "分析",
      text1: "我們使用 Umami Cloud，這是一個注重隱私、不使用 Cookie 的分析平台。它幫助我們了解有多少人使用 Markdown Free 以及哪些功能最有用。",
      text2: "Umami 不使用 Cookie，不收集姓名、電子郵件地址或 IP 位址等個人資訊。我們只能看到匯總資料，例如：",
      items: [
        "頁面瀏覽量和訪客數量",
        "來源資訊（訪客從哪裡來）",
        "成功轉換次數（PDF、TXT、HTML）",
        "一般裝置/瀏覽器資訊"
      ],
      notice: "我們不會將您的 Markdown 內容、檔案名稱或任何貼上的文字傳送給分析服務提供商。分析會尊重您瀏覽器的「請勿追蹤」設定。"
    },
    thirdParties: {
      title: "第三方",
      text: "我們不與第三方共用任何資料。PDF 生成在我們自己的無伺服器基礎架構（Vercel）上執行。沒有外部服務會看到您的內容。"
    },
    security: {
      title: "安全",
      items: [
        { title: "全程 HTTPS", text: "所有流量都經過加密" },
        { title: "XSS 防護", text: "使用者內容在渲染前會被淨化" },
        { title: "無持久儲存", text: "沒有可洩漏的內容" }
      ]
    },
    changes: {
      title: "政策變更",
      text: "如果我們對此隱私政策進行更改，我們將更新下方的日期。重大變更將在首頁公告。",
      date: "最後更新：2024年12月"
    },
    contact: {
      title: "聯絡方式",
      text: "對隱私有疑問？點擊頁首的回饋按鈕聯絡我們。"
    }
  },
  id: {
    title: "Kebijakan Privasi",
    lead: "Privasi Anda penting. Berikut cara Markdown Free menangani data Anda.",
    shortVersion: {
      title: "Versi singkat",
      items: [
        { title: "Tanpa akun", text: "Kami tidak mengumpulkan informasi pribadi apa pun" },
        { title: "Tanpa cookie pelacakan", text: "Kami tidak menggunakan cookie atau melacak konten Anda" },
        { title: "Tanpa penyimpanan", text: "File Anda tidak pernah disimpan di server kami" },
        { title: "Hanya HTTPS", text: "Semua koneksi terenkripsi" }
      ]
    },
    filesProcessed: {
      title: "Cara file diproses",
      preview: {
        title: "Pratinjau, ekspor HTML & TXT",
        text: "Saat Anda mengunggah file untuk pratinjau atau ekspor ke HTML/TXT, semuanya terjadi sepenuhnya di browser Anda. File Anda tidak pernah meninggalkan perangkat. Kami menggunakan JavaScript sisi klien untuk mengurai dan merender Markdown."
      },
      pdf: {
        title: "Ekspor PDF",
        text: "Untuk pembuatan PDF, konten Markdown Anda dikirim ke server kami, dikonversi ke PDF, dan segera dikembalikan kepada Anda. Konten tersebut:",
        items: [
          "Hanya diproses di memori",
          "Tidak pernah ditulis ke disk",
          "Langsung dibuang setelah PDF dibuat",
          "Tidak dicatat, dianalisis, atau disimpan dengan cara apa pun"
        ]
      }
    },
    noCollect: {
      title: "Data yang tidak kami kumpulkan",
      items: [
        "Informasi pribadi (nama, email, akun)",
        "Konten dokumen atau file",
        "Nama file atau metadata",
        "Alamat IP Anda dalam log",
        "Cookie untuk pelacakan"
      ]
    },
    analytics: {
      title: "Analitik",
      text1: "Kami menggunakan Umami Cloud, platform analitik yang berfokus pada privasi dan tanpa cookie. Ini membantu kami memahami berapa banyak orang yang menggunakan Markdown Free dan fitur mana yang paling berguna.",
      text2: "Umami tidak menggunakan cookie dan tidak mengumpulkan informasi pribadi seperti nama, alamat email, atau alamat IP. Kami hanya melihat data agregat seperti:",
      items: [
        "Tampilan halaman dan jumlah pengunjung",
        "Informasi perujuk (dari mana pengunjung berasal)",
        "Jumlah konversi yang berhasil (PDF, TXT, HTML)",
        "Informasi perangkat/browser umum"
      ],
      notice: "Kami tidak mengirim konten Markdown, nama file, atau teks apa pun yang Anda tempel ke penyedia analitik kami. Analitik menghormati pengaturan Do Not Track browser Anda."
    },
    thirdParties: {
      title: "Pihak ketiga",
      text: "Kami tidak membagikan data apa pun dengan pihak ketiga. Pembuatan PDF berjalan di infrastruktur serverless kami sendiri (Vercel). Tidak ada layanan eksternal yang melihat konten Anda."
    },
    security: {
      title: "Keamanan",
      items: [
        { title: "HTTPS di mana-mana", text: "Semua lalu lintas terenkripsi" },
        { title: "Perlindungan XSS", text: "Konten pengguna dibersihkan sebelum dirender" },
        { title: "Tanpa penyimpanan permanen", text: "Tidak ada yang bisa diretas" }
      ]
    },
    changes: {
      title: "Perubahan kebijakan ini",
      text: "Jika kami membuat perubahan pada kebijakan privasi ini, kami akan memperbarui tanggal di bawah. Perubahan signifikan akan dicatat di halaman utama.",
      date: "Terakhir diperbarui: Desember 2024"
    },
    contact: {
      title: "Kontak",
      text: "Ada pertanyaan tentang privasi? Klik tombol Umpan Balik di header untuk menghubungi kami."
    }
  },
  vi: {
    title: "Chính sách Bảo mật",
    lead: "Quyền riêng tư của bạn rất quan trọng. Đây là cách Markdown Free xử lý dữ liệu của bạn.",
    shortVersion: {
      title: "Phiên bản ngắn gọn",
      items: [
        { title: "Không cần tài khoản", text: "Chúng tôi không thu thập bất kỳ thông tin cá nhân nào" },
        { title: "Không có cookie theo dõi", text: "Chúng tôi không sử dụng cookie hoặc theo dõi nội dung của bạn" },
        { title: "Không lưu trữ", text: "Tệp của bạn không bao giờ được lưu trữ trên máy chủ của chúng tôi" },
        { title: "Chỉ HTTPS", text: "Tất cả kết nối đều được mã hóa" }
      ]
    },
    filesProcessed: {
      title: "Cách xử lý tệp",
      preview: {
        title: "Xem trước, xuất HTML & TXT",
        text: "Khi bạn tải lên tệp để xem trước hoặc xuất sang HTML/TXT, mọi thứ đều xảy ra hoàn toàn trong trình duyệt của bạn. Tệp của bạn không bao giờ rời khỏi thiết bị. Chúng tôi sử dụng JavaScript phía máy khách để phân tích cú pháp và hiển thị Markdown."
      },
      pdf: {
        title: "Xuất PDF",
        text: "Để tạo PDF, nội dung Markdown của bạn được gửi đến máy chủ của chúng tôi, chuyển đổi thành PDF và ngay lập tức được trả về cho bạn. Nội dung:",
        items: [
          "Chỉ được xử lý trong bộ nhớ",
          "Không bao giờ được ghi vào đĩa",
          "Được xóa ngay lập tức sau khi tạo PDF",
          "Không được ghi nhật ký, phân tích hoặc lưu trữ dưới bất kỳ hình thức nào"
        ]
      }
    },
    noCollect: {
      title: "Dữ liệu chúng tôi không thu thập",
      items: [
        "Thông tin cá nhân (tên, email, tài khoản)",
        "Nội dung tài liệu hoặc tệp",
        "Tên tệp hoặc siêu dữ liệu",
        "Địa chỉ IP của bạn trong nhật ký",
        "Cookie để theo dõi"
      ]
    },
    analytics: {
      title: "Phân tích",
      text1: "Chúng tôi sử dụng Umami Cloud, một nền tảng phân tích tập trung vào quyền riêng tư, không sử dụng cookie. Nó giúp chúng tôi hiểu có bao nhiêu người sử dụng Markdown Free và tính năng nào hữu ích nhất.",
      text2: "Umami không sử dụng cookie và không thu thập thông tin cá nhân như tên, địa chỉ email hoặc địa chỉ IP. Chúng tôi chỉ thấy dữ liệu tổng hợp như:",
      items: [
        "Lượt xem trang và số lượng khách truy cập",
        "Thông tin nguồn giới thiệu (khách truy cập đến từ đâu)",
        "Số lần chuyển đổi thành công (PDF, TXT, HTML)",
        "Thông tin thiết bị/trình duyệt chung"
      ],
      notice: "Chúng tôi không gửi nội dung Markdown, tên tệp hoặc bất kỳ văn bản nào bạn dán cho nhà cung cấp phân tích của chúng tôi. Phân tích tôn trọng cài đặt Không Theo dõi của trình duyệt của bạn."
    },
    thirdParties: {
      title: "Bên thứ ba",
      text: "Chúng tôi không chia sẻ bất kỳ dữ liệu nào với bên thứ ba. Việc tạo PDF chạy trên cơ sở hạ tầng serverless của chúng tôi (Vercel). Không có dịch vụ bên ngoài nào nhìn thấy nội dung của bạn."
    },
    security: {
      title: "Bảo mật",
      items: [
        { title: "HTTPS toàn bộ", text: "Tất cả lưu lượng đều được mã hóa" },
        { title: "Bảo vệ XSS", text: "Nội dung người dùng được làm sạch trước khi hiển thị" },
        { title: "Không lưu trữ vĩnh viễn", text: "Không có gì để rò rỉ" }
      ]
    },
    changes: {
      title: "Thay đổi chính sách này",
      text: "Nếu chúng tôi thay đổi chính sách bảo mật này, chúng tôi sẽ cập nhật ngày bên dưới. Những thay đổi quan trọng sẽ được ghi nhận trên trang chủ.",
      date: "Cập nhật lần cuối: Tháng 12 năm 2024"
    },
    contact: {
      title: "Liên hệ",
      text: "Có câu hỏi về quyền riêng tư? Nhấp vào nút Phản hồi trong tiêu đề để liên hệ với chúng tôi."
    }
  }
};

export default async function PrivacyPage({
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
    <>
      <Header locale={locale} dict={dict} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>{c.title}</h1>
        <p className="lead">{c.lead}</p>

        <h2>{c.shortVersion.title}</h2>
        <ul>
          {c.shortVersion.items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> — {item.text}
            </li>
          ))}
        </ul>

        <h2>{c.filesProcessed.title}</h2>

        <h3>{c.filesProcessed.preview.title}</h3>
        <p>{c.filesProcessed.preview.text}</p>

        <h3>{c.filesProcessed.pdf.title}</h3>
        <p>{c.filesProcessed.pdf.text}</p>
        <ul>
          {c.filesProcessed.pdf.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{c.noCollect.title}</h2>
        <ul>
          {c.noCollect.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{c.analytics.title}</h2>
        <p><strong>Umami Cloud</strong> — {c.analytics.text1}</p>
        <p>{c.analytics.text2}</p>
        <ul>
          {c.analytics.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p><strong>{c.analytics.notice}</strong></p>

        <h2>{c.thirdParties.title}</h2>
        <p>{c.thirdParties.text}</p>

        <h2>{c.security.title}</h2>
        <ul>
          {c.security.items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> — {item.text}
            </li>
          ))}
        </ul>

        <h2>{c.changes.title}</h2>
        <p>{c.changes.text}</p>
        <p className="text-sm text-slate-500">{c.changes.date}</p>

        <h2>{c.contact.title}</h2>
        <p>{c.contact.text}</p>
      </article>

      <Footer locale={locale} dict={dict} />
    </main>
    </>
  );
}

