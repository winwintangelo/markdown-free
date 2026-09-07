import JSZip from "jszip";
import { downloadBlob, generateFilename } from "./download";

/**
 * Table → Excel (XLSX) export, entirely in the browser (build plan Phase 0a).
 *
 * Every <table> in the rendered document becomes one worksheet. Cells are
 * written as inline strings (or numbers when the text is a plain number), the
 * header row is bold, and column widths follow the longest cell. This is a
 * minimal, dependency-free OOXML writer over JSZip — enough for Excel, Numbers,
 * LibreOffice and Google Sheets to open the result cleanly.
 */

export interface ExtractedTable {
  name: string;
  rows: string[][];
  /** Number of leading rows that came from <thead> (bolded) */
  headerRows: number;
}

const MAX_SHEET_NAME = 31;
const MAX_COLUMN_WIDTH = 60;
const NUMBER_RE = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;

function normalizeCell(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function sanitizeSheetName(raw: string, taken: Set<string>, index: number): string {
  let name = raw.replace(/[\\/?*[\]:]/g, " ").replace(/\s+/g, " ").trim();
  if (!name) name = `Table ${index + 1}`;
  name = name.slice(0, MAX_SHEET_NAME);
  let candidate = name;
  let n = 2;
  while (taken.has(candidate.toLowerCase())) {
    const suffix = ` (${n++})`;
    candidate = name.slice(0, MAX_SHEET_NAME - suffix.length) + suffix;
  }
  taken.add(candidate.toLowerCase());
  return candidate;
}

/** Nearest heading above the table, used as the sheet name. */
function nearestHeading(table: Element): string {
  let node: Element | null = table.previousElementSibling;
  while (node) {
    if (/^H[1-6]$/.test(node.tagName)) return normalizeCell(node.textContent || "");
    node = node.previousElementSibling;
  }
  return "";
}

/** Extract every table from rendered (sanitized) HTML. Browser only. */
export function extractTablesFromHtml(html: string): ExtractedTable[] {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const taken = new Set<string>();
  const tables: ExtractedTable[] = [];

  doc.querySelectorAll("table").forEach((table, index) => {
    const headerRows: string[][] = [];
    const bodyRows: string[][] = [];
    table.querySelectorAll("thead tr").forEach((tr) => {
      headerRows.push([...tr.querySelectorAll("th,td")].map((c) => normalizeCell(c.textContent || "")));
    });
    table.querySelectorAll("tbody tr, :scope > tr").forEach((tr) => {
      bodyRows.push([...tr.querySelectorAll("th,td")].map((c) => normalizeCell(c.textContent || "")));
    });
    const rows = [...headerRows, ...bodyRows].filter((r) => r.length > 0);
    if (rows.length === 0) return;
    tables.push({
      name: sanitizeSheetName(nearestHeading(table), taken, index),
      rows,
      headerRows: headerRows.length,
    });
  });

  return tables;
}

function escapeXml(text: string): string {
  return text
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnLetter(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function sheetXml(table: ExtractedTable): string {
  const columnCount = Math.max(...table.rows.map((r) => r.length));
  const widths = Array.from({ length: columnCount }, (_, c) =>
    Math.min(MAX_COLUMN_WIDTH, Math.max(8, ...table.rows.map((r) => (r[c] || "").length + 2)))
  );
  const cols = widths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join("");

  const rows = table.rows
    .map((row, r) => {
      const cells = row
        .map((value, c) => {
          const ref = `${columnLetter(c)}${r + 1}`;
          const style = r < table.headerRows ? ' s="1"' : "";
          if (value !== "" && NUMBER_RE.test(value)) {
            return `<c r="${ref}"${style}><v>${value.replace(/,/g, "")}</v></c>`;
          }
          if (value === "") return `<c r="${ref}"${style}/>`;
          return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<cols>${cols}</cols><sheetData>${rows}</sheetData></worksheet>`
  );
}

const STYLES_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
  `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
  `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  `</styleSheet>`;

/** Build the .xlsx package. */
export async function buildXlsxBlob(tables: ExtractedTable[]): Promise<Blob> {
  if (tables.length === 0) throw new Error("No tables to export");
  const zip = new JSZip();

  const sheetOverrides = tables
    .map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
    .join("");
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
      `<Default Extension="xml" ContentType="application/xml"/>` +
      `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
      `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
      sheetOverrides +
      `</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
      `</Relationships>`
  );

  const sheets = tables
    .map((t, i) => `<sheet name="${escapeXml(t.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
    .join("");
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
      `<sheets>${sheets}</sheets></workbook>`
  );

  const sheetRels = tables
    .map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`)
    .join("");
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      sheetRels +
      `<Relationship Id="rId${tables.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
      `</Relationships>`
  );

  zip.file("xl/styles.xml", STYLES_XML);
  tables.forEach((t, i) => zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(t)));

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE",
  });
}

export interface XlsxExportResult {
  success: boolean;
  tables: number;
  error?: { code: "NO_TABLES" | "GENERATION_FAILED"; message: string };
}

/** Extract tables from rendered HTML, build the workbook, and download it. */
export async function exportXlsx(
  renderedHtml: string,
  originalFilename: string | null
): Promise<XlsxExportResult> {
  const tables = extractTablesFromHtml(renderedHtml);
  if (tables.length === 0) {
    return { success: false, tables: 0, error: { code: "NO_TABLES", message: "No tables found in this document." } };
  }
  try {
    const blob = await buildXlsxBlob(tables);
    downloadBlob(blob, generateFilename(originalFilename, "xlsx"));
    return { success: true, tables: tables.length };
  } catch (error) {
    return {
      success: false,
      tables: tables.length,
      error: { code: "GENERATION_FAILED", message: error instanceof Error ? error.message : "Excel export failed." },
    };
  }
}
