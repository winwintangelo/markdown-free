import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary, type Locale } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/tool-links";

export function generateStaticParams() { return [{ locale: "id" }]; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "id") return {};
  return {
    title: "Konverter Markdown ke PDF Terbaik 2026 | Perbandingan 8 Tool",
    description: "Perbandingan 8 alat konversi Markdown ke PDF: Markdown Free, Pandoc, Typora, Dillinger, StackEdit, md-to-pdf, Markdown PDF (VS Code), Online2PDF. Mana yang cocok.",
    keywords: ["perbandingan konverter markdown", "markdown ke pdf terbaik 2026", "markdown pdf gratis", "markdown tanpa instal", "pandoc vs markdown free", "markdown pdf online"],
    alternates: { canonical: "/id/perbandingan-konverter-markdown", languages: hreflangAlternates("comparison") },
    openGraph: { title: "Konverter Markdown ke PDF Terbaik 2026", description: "Perbandingan jujur 8 alat Markdown→PDF, beserta yang menang untuk masing-masing kasus penggunaan.", locale: "id_ID" },
  };
}

const PUBLISH_DATE = "2026-05-09"; const NEXT_REVIEW = "2026-11-09";

const faq = [
  { q: "Mengapa karakter non-Latin saya berubah jadi □□□ (kotak rusak) di PDF?", a: "Sebagian besar pipeline Markdown→PDF jatuh ke font khusus Latin seperti Helvetica atau Times New Roman, yang tidak punya glyph untuk skrip non-Latin. Solusinya adalah (a) menyematkan font yang mendukung CJK seperti Noto Sans CJK pada pipeline render (Markdown Free melakukannya otomatis) atau (b) mengonfigurasi konverter Anda untuk memakainya (Pandoc: --pdf-engine=xelatex -V mainfont=\"Noto Sans CJK JP\")." },
  { q: "Apakah ada konverter Markdown→PDF gratis tanpa iklan?", a: "Ada. Markdown Free (tanpa iklan, tanpa pelacakan, tanpa pendaftaran), Pandoc (CLI), dan ekstensi Markdown PDF di VS Code semuanya gratis dan tanpa iklan. Editor browser ter-host seperti Dillinger dan Online2PDF biasanya didukung iklan." },
  { q: "Apa konverter Markdown→PDF terbaik tanpa instalasi?", a: "Markdown Free berjalan sepenuhnya di browser tanpa instalasi. StackEdit dan Dillinger juga berjalan hanya di browser, tetapi mengandalkan font sistem, sehingga skrip non-Latin bisa muncul sebagai kotak tergantung mesin pengguna." },
  { q: "Bisakah saya mengonversi Markdown ke DOCX (Word) tanpa kehilangan format?", a: "Bisa. Markdown Free, Pandoc, dan Typora menghasilkan DOCX yang mempertahankan judul, blok kode, tabel, dan checklist. Yang paling lengkap adalah Pandoc; yang tercepat di browser adalah Markdown Free." },
  { q: "Apakah Pandoc masih jadi pilihan terbaik di 2026?", a: "Pandoc masih konverter Markdown paling kuat untuk kasus penggunaan tertulis dengan skrip, tetapi bagi pengguna non-teknis atau yang tidak ingin memasang LaTeX (~1,5 GB), alat berbasis browser seperti Markdown Free kini menawarkan kualitas PDF yang sebanding tanpa biaya instalasi." },
  { q: "Konverter Markdown mana yang paling aman untuk dokumen sensitif?", a: "Apa pun yang berjalan secara lokal — Pandoc, Typora, Markdown PDF (VS Code), md-to-pdf — menyimpan file Anda tetap di mesin Anda. Di antara alat browser, Markdown Free memproses HTML/TXT/DOCX sepenuhnya di sisi klien dan PDF di memori serverless tanpa penyimpanan. Alat yang mengunggah ke server (Online2PDF) memiliki risiko privasi paling tinggi." },
  { q: "Apakah Markdown Free punya batas ukuran file?", a: "Ada — saat ini 5MB per file. Markdown 5MB setara sekitar 750.000 kata, mencakup hampir semua dokumen nyata. Untuk file lebih besar, Pandoc dari command line tidak punya batas ukuran bawaan." },
];

const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", inLanguage: "id", headline: "Konverter Markdown ke PDF Terbaik 2026", description: "Perbandingan 8 alat Markdown→PDF.", datePublished: PUBLISH_DATE, dateModified: PUBLISH_DATE, author: { "@type": "Organization", name: "Markdown Free team", url: "https://www.markdown.free/id/about" }, publisher: { "@type": "Organization", name: "Markdown Free", url: "https://www.markdown.free" }, mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.markdown.free/id/perbandingan-konverter-markdown" } };
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "id", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (localeParam !== "id") notFound();
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <ConverterProvider>
      <LocaleTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Konverter Markdown ke PDF Terbaik 2026</h1>
          <p className="text-sm text-slate-500">Diterbitkan {PUBLISH_DATE} ・ Tinjauan berikutnya {NEXT_REVIEW} ・ Tim Markdown Free</p>
          <p className="lead text-lg text-slate-600">Memilih alat Markdown→PDF terlihat sepele — sampai Anda benar-benar membutuhkannya. Lalu Anda harus memilih antara instalasi LaTeX 1,5 GB (Pandoc), aplikasi desktop berbayar (Typora), editor browser dengan banner iklan (Dillinger), atau skrip yang harus Anda rangkai sendiri (md-to-pdf). Untuk dokumen Inggris saja kebanyakan berfungsi. Mereka mulai gagal saat Anda menambahkan Korea, Jepang, Cina, atau Devanagari — di situlah &quot;terbaik&quot; benar-benar berbeda.</p>
          <p><strong>Panduan ini membandingkan 8 alat populer untuk 2026.</strong> Singkatnya: <Link href="/id" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link> menang untuk pemakaian browser tanpa setup (terutama dengan skrip non-Latin), Pandoc menang untuk batch tertulis dengan skrip, Typora menang untuk poles offline.</p>

          <h2>Perbandingan singkat</h2>
          <div className="not-prose my-6 overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Alat</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Cocok untuk</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Harga</th><th className="px-3 py-3 text-left font-semibold text-slate-700">CJK / non-Latin</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Output</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Instalasi</th><th className="px-3 py-3 text-left font-semibold text-slate-700">Privasi</th>
            </tr></thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown Free</td><td className="px-3 py-3">Browser, skrip non-Latin</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Ya — font Noto tertanam, tanpa setup</td><td className="px-3 py-3">PDF, DOCX, PNG, EPUB, HTML, TXT</td><td className="px-3 py-3">Tidak ada</td><td className="px-3 py-3">File di memori, tidak disimpan</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Pandoc</td><td className="px-3 py-3">Konversi batch tertulis</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Dengan konfigurasi: <code>--pdf-engine=xelatex -V mainfont</code></td><td className="px-3 py-3">30+ format</td><td className="px-3 py-3">LaTeX (~1,5 GB) untuk PDF</td><td className="px-3 py-3">Hanya lokal</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Dillinger</td><td className="px-3 py-3">Edit cepat di browser</td><td className="px-3 py-3">Gratis, beriklan</td><td className="px-3 py-3">Hanya font sistem</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">Tidak ada</td><td className="px-3 py-3">Bisa sync ke cloud</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">StackEdit</td><td className="px-3 py-3">Browser + sync Drive</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Hanya font sistem</td><td className="px-3 py-3">PDF, HTML, MD</td><td className="px-3 py-3">Tidak ada</td><td className="px-3 py-3">Sync cloud opsional</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td><td className="px-3 py-3">Alur kerja VS Code</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Font sistem; CSS dapat dikonfigurasi</td><td className="px-3 py-3">PDF, HTML, PNG, JPEG</td><td className="px-3 py-3">VS Code + Chromium (~170MB)</td><td className="px-3 py-3">Hanya lokal</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">md-to-pdf (npm)</td><td className="px-3 py-3">Pipeline build</td><td className="px-3 py-3">Gratis</td><td className="px-3 py-3">Dapat dikonfigurasi via CSS + Puppeteer</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Node.js + Chromium</td><td className="px-3 py-3">Hanya lokal</td></tr>
              <tr className="border-b border-slate-100"><td className="px-3 py-3 font-medium">Typora</td><td className="px-3 py-3">Editor offline rapi</td><td className="px-3 py-3">Berbayar (sekali bayar, belum diverifikasi saat penulisan)</td><td className="px-3 py-3">Font sistem; tergantung tema</td><td className="px-3 py-3">PDF, HTML, DOCX</td><td className="px-3 py-3">Aplikasi desktop</td><td className="px-3 py-3">Hanya lokal</td></tr>
              <tr className="border-b border-slate-100 bg-slate-50/50"><td className="px-3 py-3 font-medium">Online2PDF</td><td className="px-3 py-3">Konversi file generik</td><td className="px-3 py-3">Gratis, beriklan</td><td className="px-3 py-3">Terbatas; bukan asli Markdown</td><td className="px-3 py-3">PDF</td><td className="px-3 py-3">Tidak ada</td><td className="px-3 py-3">File diunggah ke server</td></tr>
            </tbody>
          </table></div>

          <h2>Markdown Free</h2>
          <p>Konverter Markdown berbasis browser yang berjalan sepenuhnya di sisi klien untuk ekspor HTML, TXT, dan DOCX; pembuatan PDF berjalan di infrastruktur serverless dengan file diproses di memori dan langsung dibuang. Dibangun atas prinsip bahwa menambahkan pendaftaran, iklan, atau tracker membuat tugas 30 detik jadi menyebalkan.</p>
          <p><strong>Penanganan skrip non-Latin:</strong> menyematkan Noto Sans CJK JP/KR/SC/TC dan Noto Sans Devanagari langsung ke pipeline render PDF. Tanpa flag font, tanpa instalasi, tanpa kotak rusak.</p>
          <p><strong>Kelebihan:</strong> tanpa pendaftaran, tanpa cookie pelacak, analitik ramah privasi, UI 10 bahasa, output DOCX kuat untuk mengonversi Markdown buatan AI ke dokumen Word korporat.<br /><strong>Kekurangan:</strong> batas 5MB per file, tanpa mode offline (butuh browser), tanpa render matematika LaTeX/MathJax, tanpa batch (satu file per kali), tidak bisa menyesuaikan gaya PDF.<br /><strong>Cocok untuk:</strong> siapa saja yang perlu mengonversi Markdown ke PDF, DOCX, atau EPUB sekarang juga tanpa instalasi, terutama untuk skrip non-Latin.</p>
          <p><Link href="/id" className="text-emerald-700 hover:text-emerald-800 hover:underline">markdown.free/id</Link> (atau langsung <Link href="/id/markdown-pdf-tanpa-daftar" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF tanpa daftar</Link>, <Link href="/id/konversi-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">README ke PDF</Link>)</p>

          <h2>Pandoc</h2>
          <p>Konverter dokumen universal berbasis command line, standar emas untuk pemakaian batch dan pipeline. Mengonversi 30+ format termasuk Markdown, LaTeX, DOCX, EPUB, dan PDF.</p>
          <p><strong>Skrip non-Latin:</strong> mesin LaTeX default (<code>pdflatex</code>) tidak menangani CJK, Devanagari, Arab, atau Ibrani. Untuk output yang dapat dibaca, Anda harus memakai <code>--pdf-engine=xelatex</code> (atau <code>lualatex</code>) dan menambahkan <code>-V mainfont=&quot;Noto Sans CJK JP&quot;</code> (atau font sesuai skrip Anda). Font Noto yang sesuai juga harus terpasang di sistem.</p>
          <p><strong>Kelebihan:</strong> konverter paling kuat dan fleksibel; ekosistem plugin/filter yang sangat besar; standar di publikasi akademik dan teknis.<br /><strong>Kekurangan:</strong> pembuatan PDF butuh pemasangan LaTeX (TeX Live ~1,5 GB di macOS); kurva pembelajaran curam; CJK dan skrip non-Latin lain butuh konfigurasi eksplisit yang tidak diketahui pengguna pemula.<br /><strong>Cocok untuk:</strong> pipeline konversi tertulis, publikasi akademik, penulis teknis yang nyaman dengan command line.</p>
          <p><a href="https://pandoc.org" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">pandoc.org</a></p>

          <h2>Dillinger</h2>
          <p>Editor Markdown berbasis browser dengan pratinjau langsung dan ekspor dasar. Open source, dengan instans ter-host di dillinger.io.</p>
          <p><strong>Skrip non-Latin:</strong> pratinjau mewarisi fallback font browser; ekspor PDF menggunakan font yang tersedia di sistem. Skrip non-Latin bisa terlihat benar di pratinjau tetapi jatuh ke font default saat ekspor PDF, tergantung sistem pengguna.</p>
          <p><strong>Kelebihan:</strong> editor split-pane yang familiar, gratis, integrasi Dropbox/Google Drive/GitHub.<br /><strong>Kekurangan:</strong> instans ter-host beriklan; status dokumen bisa tersinkron ke layanan cloud yang terhubung; kontrol gaya PDF terbatas.<br /><strong>Cocok untuk:</strong> edit cepat dan ekspor sesekali untuk dokumen skrip Latin.</p>
          <p><a href="https://dillinger.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">dillinger.io</a></p>

          <h2>StackEdit</h2>
          <p>Editor Markdown berbasis browser dengan dukungan sync cloud kuat (Google Drive, Dropbox, GitHub) dan dukungan MathJax untuk render matematika.</p>
          <p><strong>Skrip non-Latin:</strong> sama seperti Dillinger, mengandalkan font browser/sistem. Tidak ada Noto bawaan.</p>
          <p><strong>Kelebihan:</strong> UI bersih, render matematika, sync cloud lintas-perangkat.<br /><strong>Kekurangan:</strong> ekspor PDF lewat pipeline cetak browser, gaya output terbatas pada konvensi print stylesheet; sync cloud butuh izin Google/Dropbox.<br /><strong>Cocok untuk:</strong> penulis yang mau editor Markdown dengan sync cloud dan butuh matematika MathJax.</p>
          <p><a href="https://stackedit.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">stackedit.io</a></p>

          <h2>Markdown PDF (ekstensi VS Code)</h2>
          <p>Ekstensi VS Code yang mengekspor file Markdown saat ini ke PDF, HTML, PNG, atau JPEG. Render via instance Chromium yang dibundel (diunduh saat pertama digunakan, ~170MB).</p>
          <p><strong>Skrip non-Latin:</strong> menggunakan sistem font Chromium. CJK dan Devanagari muncul jika OS punya font yang terpasang (sebagian besar instalasi macOS/Windows/Linux modern punya untuk skrip utama). Dapat dikustomisasi via CSS — pengguna lanjutan bisa menentukan aturan <code>@font-face</code> untuk menyematkan font tertentu.</p>
          <p><strong>Kelebihan:</strong> menyatu dengan alur kerja VS Code; sangat dapat dikustomisasi via CSS; hanya lokal — tanpa ketergantungan jaringan setelah Chromium diunduh.<br /><strong>Kekurangan:</strong> butuh VS Code; pertama kali mengunduh ~170MB; ekspor pertama lambat.<br /><strong>Cocok untuk:</strong> developer yang sudah terbiasa di VS Code dan ingin ekspor PDF satu shortcut.</p>
          <p><a href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">VS Code Marketplace</a></p>

          <h2>md-to-pdf (npm)</h2>
          <p>CLI/library Node.js yang mengonversi Markdown ke PDF menggunakan Puppeteer (yang menyematkan Chromium). Dirancang untuk pipeline build dan alur kerja kustom.</p>
          <p><strong>Skrip non-Latin:</strong> menggunakan sistem font Chromium. Dapat dikustomisasi via injection CSS — pengguna lanjutan dapat <code>@import</code> font web (termasuk Noto) ke CSS render.</p>
          <p><strong>Kelebihan:</strong> dapat di-script, dapat di-tema, cepat untuk batch setelah terpasang, open source.<br /><strong>Kekurangan:</strong> butuh Node.js dan Chromium Puppeteer (~170MB pada instalasi pertama); gaya default butuh kerja CSS untuk kualitas produksi.<br /><strong>Cocok untuk:</strong> pipeline build kustom, CI/CD yang menghasilkan PDF dari dokumentasi.</p>
          <p><a href="https://github.com/simonhaenisch/md-to-pdf" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">github.com/simonhaenisch/md-to-pdf</a></p>

          <h2>Typora</h2>
          <p>Editor Markdown WYSIWYG rapi untuk desktop (macOS, Windows, Linux). Gratis hingga 2021; sekarang berbayar (lisensi sekali bayar, harga belum diverifikasi saat penulisan — cek typora.io).</p>
          <p><strong>Skrip non-Latin:</strong> bagus secara default untuk sebagian besar skrip via font sistem. Tergantung tema — beberapa tema mengirim stack yang dioptimalkan untuk CJK.</p>
          <p><strong>Kelebihan:</strong> editor WYSIWYG kelas atas; ekspor rapi; penanganan font solid; tanpa iklan atau telemetri setelah lisensi.<br /><strong>Kekurangan:</strong> berbayar; hanya desktop — tanpa versi browser; tanpa fitur tim atau cloud.<br /><strong>Cocok untuk:</strong> penulis solo yang ingin editor offline rapi dan tidak keberatan dengan biaya lisensi sekali bayar.</p>
          <p><a href="https://typora.io" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">typora.io</a></p>

          <h2>Online2PDF</h2>
          <p>Konverter file berbasis web generik yang menangani banyak format (Word, Excel, PDF, gambar, dll.). Markdown didukung melalui konversi generik.</p>
          <p><strong>Skrip non-Latin:</strong> terbatas dan belum diverifikasi saat penulisan. Tidak dirancang sebagai alat asli Markdown, sehingga perilaku dengan blok kode, tabel, dan font CJK tidak konsisten.</p>
          <p><strong>Kelebihan:</strong> menangani banyak format selain Markdown; tanpa instalasi.<br /><strong>Kekurangan:</strong> file diunggah ke server (kekhawatiran privasi untuk konten sensitif); antarmuka padat iklan; render Markdown generik — blok kode, tabel, dan checklist mungkin tidak ter-render benar; gaya output tidak dapat dikustomisasi.<br /><strong>Cocok untuk:</strong> konversi sesekali ketika Anda punya campuran format dan Markdown hanya kebetulan terlibat.</p>
          <p><a href="https://online2pdf.com" target="_blank" rel="nofollow noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">online2pdf.com</a></p>

          <h2>Cara memilih</h2>
          <ul>
            <li><strong>Anda perlu mengonversi file Markdown ke PDF/DOCX/EPUB sekarang di browser, tanpa pendaftaran — terutama dengan konten Korea/Jepang/Cina/Hindi/Arab</strong> → <Link href="/id" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link></li>
            <li><strong>Anda nyaman dengan CLI, sudah memasang LaTeX (atau bisa memasangnya), dan ingin pipeline tertulis</strong> → Pandoc</li>
            <li><strong>Anda hidup di VS Code dan ingin ekspor satu shortcut</strong> → Markdown PDF (ekstensi VS Code)</li>
            <li><strong>Anda membangun pipeline CI/CD yang menghasilkan PDF dari Markdown</strong> → md-to-pdf atau Pandoc</li>
            <li><strong>Anda ingin editor WYSIWYG offline rapi dan tidak keberatan membayar</strong> → Typora</li>
            <li><strong>Anda butuh Markdown ter-sync cloud dengan dukungan matematika</strong> → StackEdit</li>
            <li><strong>Anda mengerjakan edit sesekali hanya dalam skrip Latin</strong> → Dillinger atau StackEdit</li>
          </ul>

          <h2>Pertanyaan yang sering diajukan</h2>
          {faq.map((item, i) => (<div key={i}><h3>{item.q}</h3><p>{item.a}</p></div>))}

          <h2>Pengungkapan</h2>
          <p>Artikel ini diterbitkan oleh tim di balik <Link href="/id" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown Free</Link>, salah satu alat yang dibandingkan di atas. Kami berusaha spesifik tentang kasus di mana alat lain menang — Pandoc untuk pipeline tertulis, Typora untuk poles offline, VS Code Markdown PDF untuk alur kerja dalam editor. Tautan kompetitor menggunakan <code>rel=&quot;nofollow&quot;</code>. Jika Anda menemukan kesalahan fakta, <Link href="/id/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">beri tahu kami</Link> dan kami akan memperbaikinya.</p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">Coba Markdown Free — tanpa instal, tanpa daftar, tanpa kotak rusak</p>
            <Link href="/id" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800">Buka Markdown Free<span aria-hidden="true">→</span></Link>
          </div>

          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Halaman terkait</h2>
            <ul className="space-y-2">
              <li><Link href="/id/konversi-markdown-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">Konversi Markdown ke PDF - Gratis</Link></li>
              <li><Link href="/id/markdown-pdf-tanpa-daftar" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown PDF tanpa daftar</Link></li>
              <li><Link href="/id/konversi-readme-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">README.md ke PDF</Link></li>
              <li><Link href="/id/markdown-ke-word" className="text-emerald-700 hover:text-emerald-800 hover:underline">Markdown ke Word (DOCX)</Link></li>
            </ul>
          </div>
        </article>
        <Footer locale={locale} dict={dict} />
      </main>
    </ConverterProvider>
  );
}
