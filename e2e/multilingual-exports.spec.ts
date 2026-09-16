import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { openMoreFormats } from "./export-helpers";

/**
 * The input document can be in any language, whatever the UI locale.
 *
 * multilingual.spec.ts covers PDF for the languages the site ships in. This
 * suite takes the other direction: many scripts, every OTHER format, checking
 * that the text itself survives the round trip — including scripts the site has
 * no UI for (Arabic, Hebrew, Hindi, Thai, Russian, Greek) and the ones where
 * encoding usually breaks (RTL, Indic conjuncts, emoji ZWJ sequences).
 *
 * Assertions are on the text in the produced file, not on rendering: Word and
 * EPUB and Excel are XML, so the characters must appear verbatim.
 */

interface Script {
  name: string;
  heading: string;
  paragraph: string;
  cell: string;
  item: string;
}

const SCRIPTS: Script[] = [
  {
    name: "Simplified Chinese",
    heading: "简体中文文档",
    paragraph: "你好，世界！这是一次转换测试，包含全角标点“引号”和《书名号》。",
    cell: "中文单元格",
    item: "列表项目",
  },
  {
    name: "Traditional Chinese",
    heading: "繁體中文文件",
    paragraph: "你好，世界！這是一次轉換測試，包含「直角引號」與『雙引號』。",
    cell: "中文儲存格",
    item: "清單項目",
  },
  {
    name: "Japanese",
    heading: "日本語のドキュメント",
    paragraph: "こんにちは世界！変換テストです。半角ｶﾀｶﾅと全角ＡＢＣ１２３も含みます。",
    cell: "セルの内容",
    item: "リスト項目",
  },
  {
    name: "Korean",
    heading: "한국어 문서",
    paragraph: "안녕하세요 세계! 변환 테스트입니다. 받침과 띄어쓰기를 확인합니다.",
    cell: "셀 내용",
    item: "목록 항목",
  },
  {
    name: "Arabic (RTL)",
    heading: "مستند عربي",
    paragraph: "مرحبا بالعالم! هذا اختبار تحويل يحتوي على أرقام ١٢٣ وعلامات ترقيم،",
    cell: "خلية",
    item: "عنصر قائمة",
  },
  {
    name: "Hebrew (RTL)",
    heading: "מסמך בעברית",
    paragraph: "שלום עולם! זוהי בדיקת המרה עם ניקוד: בָּדַק, וסימני פיסוק.",
    cell: "תא",
    item: "פריט ברשימה",
  },
  {
    name: "Hindi",
    heading: "हिन्दी दस्तावेज़",
    paragraph: "नमस्ते दुनिया! यह रूपांतरण परीक्षण है जिसमें संयुक्ताक्षर क्ष्, त्र् और ज्ञ् हैं।",
    cell: "कक्ष",
    item: "सूची आइटम",
  },
  {
    name: "Thai",
    heading: "เอกสารภาษาไทย",
    paragraph: "สวัสดีชาวโลก! นี่คือการทดสอบการแปลงที่มีสระบนล่าง เช่น ที่ ปู่ และ เก้า",
    cell: "เซลล์",
    item: "รายการ",
  },
  {
    name: "Russian",
    heading: "Документ на русском",
    paragraph: "Привет, мир! Это тест конвертации с ё, ъ и «кавычками».",
    cell: "ячейка",
    item: "элемент списка",
  },
  {
    name: "Greek",
    heading: "Ελληνικό έγγραφο",
    paragraph: "Γεια σου κόσμε! Δοκιμή μετατροπής με τόνους: ά έ ή ί ό ύ ώ.",
    cell: "κελί",
    item: "στοιχείο λίστας",
  },
  {
    name: "Vietnamese",
    heading: "Tài liệu tiếng Việt",
    paragraph: "Xin chào thế giới! Đây là bài kiểm tra chuyển đổi với dấu: ắ ặ ẫ ở ự.",
    cell: "ô dữ liệu",
    item: "mục danh sách",
  },
  {
    name: "Emoji and ZWJ",
    heading: "Emoji 🎉 document",
    paragraph: "Family 👨‍👩‍👧 flags 🇯🇵 🇰🇷 🇨🇳 and symbols ✅ 🚀 — all in one line.",
    cell: "🚀 cell",
    item: "✅ item",
  },
];

function documentFor(s: Script): string {
  return [
    `# ${s.heading}`,
    "",
    s.paragraph,
    "",
    `| ${s.cell} | Value |`,
    "|---|---|",
    `| ${s.cell} | 42 |`,
    "",
    `- ${s.item}`,
    "",
  ].join("\n");
}

async function loadDocument(page: Page, s: Script) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "multilingual.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(documentFor(s), "utf8"),
  });
  await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });
}

async function download(page: Page, trigger: () => Promise<void>) {
  const downloadPromise = page.waitForEvent("download", { timeout: 90000 });
  await trigger();
  const dl = await downloadPromise;
  const file = path.join("tmp", `i18n-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await dl.saveAs(file);
  const buffer = fs.readFileSync(file);
  fs.unlinkSync(file);
  return buffer;
}

test.describe("Input in any script survives every export", () => {
  for (const s of SCRIPTS) {
    test(`${s.name}: preview, TXT, HTML and Word keep the text`, async ({ page }) => {
      test.slow();
      await page.goto("/");
      await loadDocument(page, s);

      // Preview
      const preview = page.locator(".prose").first();
      await expect(preview.getByText(s.paragraph)).toBeVisible();

      // TXT: the source, byte for byte
      const txt = await download(page, async () => {
        await openMoreFormats(page);
        await page.getByRole("button", { name: /To TXT/i }).click();
      });
      expect(txt.toString("utf8")).toContain(s.paragraph);

      // HTML: declared UTF-8, text intact
      const html = (
        await download(page, async () => {
          await openMoreFormats(page);
          await page.getByRole("button", { name: /To HTML/i }).click();
        })
      ).toString("utf8");
      expect(html.toLowerCase()).toContain('charset="utf-8"');
      expect(html).toContain(s.paragraph);
      expect(html).toContain(s.heading);

      // Word: heading, paragraph, table cell and list item all present
      const docx = await download(page, () =>
        page.getByRole("button", { name: /To Word/i }).first().click()
      );
      const zip = await JSZip.loadAsync(docx);
      const document = await zip.file("word/document.xml")!.async("string");
      const text = [...document.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("\n");
      for (const needle of [s.heading, s.paragraph, s.cell, s.item]) {
        expect(text, `Word keeps ${needle}`).toContain(needle);
      }
    });
  }
});

test.describe("Every script at once", () => {
  const combined = SCRIPTS.map((s) => `## ${s.heading}\n\n${s.paragraph}\n`).join("\n");

  async function loadCombined(page: Page) {
    await page.locator('input[type="file"]').setInputFiles({
      name: "all-scripts.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(`# All scripts\n\n${combined}`, "utf8"),
    });
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });
  }

  test("EPUB keeps every script, and declares the document language", async ({ page }) => {
    await page.goto("/");
    await loadCombined(page);
    const buffer = await download(page, async () => {
      await openMoreFormats(page);
      await page.getByRole("button", { name: /To EPUB/i }).click();
    });
    const zip = await JSZip.loadAsync(buffer);
    const opf = await zip.file("OEBPS/content.opf")!.async("string");
    expect(opf).toContain("<dc:language>");
    const chapters = Object.keys(zip.files).filter((f) => f.endsWith(".xhtml"));
    const body = (await Promise.all(chapters.map((c) => zip.file(c)!.async("string")))).join("\n");
    for (const s of SCRIPTS) {
      expect(body, `EPUB keeps ${s.name}`).toContain(s.paragraph);
    }
  });

  test("Excel keeps every script in its cells", async ({ page }) => {
    await page.goto("/");
    // One table whose rows are each script's text
    await page.locator('input[type="file"]').setInputFiles({
      name: "scripts-table.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(
        ["# Scripts", "", "| Script | Text |", "|---|---|", ...SCRIPTS.map((s) => `| ${s.name} | ${s.cell} |`), ""].join("\n"),
        "utf8"
      ),
    });
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });

    const buffer = await download(page, async () => {
      await openMoreFormats(page);
      await page.getByRole("button", { name: /To Excel/i }).click();
    });
    const zip = await JSZip.loadAsync(buffer);
    // (JSZip lists folders as entries too, and zip.file() returns null for them)
    const sheets = Object.keys(zip.files).filter(
      (f) => /^xl\/(worksheets|sharedStrings)/.test(f) && !zip.files[f].dir
    );
    const content = (await Promise.all(sheets.map((s) => zip.file(s)!.async("string")))).join("\n");
    for (const s of SCRIPTS) {
      expect(content, `Excel keeps ${s.cell}`).toContain(s.cell);
    }
  });
});
