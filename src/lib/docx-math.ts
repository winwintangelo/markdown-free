import { createHash } from "crypto";
import JSZip from "jszip";
import { parseMathImageTitle } from "./math-image-marker";

/**
 * Server half of formulas-as-images in Word (the browser half is math-images.ts).
 *
 * html-to-docx sizes an <img> only from inline CSS, drops its alt text and has
 * no notion of a baseline. So around the conversion:
 *  - before: every math image (title marker, see math-image-marker.ts) gets an
 *    explicit CSS size, a display formula alone in its paragraph is centred,
 *    and the marker is removed;
 *  - after: each math picture gets its LaTeX as Word alt text, and inline ones
 *    are lowered by their depth (w:position) so they sit on the text line.
 * Pictures are matched back to formulas by content hash, never by order.
 */

export interface MathImageInfo {
  latex: string;
  display: boolean;
  depthPx: number;
}

// Keyed by PNG hash. Visually identical formulas (`E=mc^2` and `E = mc^2`) can
// rasterize to the same bytes, so each hash keeps its occurrences in document
// order; html-to-docx writes one picture per occurrence, in the same order.
export type MathImageIndex = Map<string, MathImageInfo[]>;

// Attribute values are quoted, and alt text (LaTeX) may contain a raw ">"
const IMG_TAG_RE = /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const DISPLAY_ATTR = "data-mdfree-math-display";
const MAX_ALT_CHARS = 4000;

const sha1 = (bytes: Buffer) => createHash("sha1").update(bytes).digest("hex");

function getAttr(tag: string, name: string): string | null {
  const m = new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag);
  return m ? m[1] : null;
}

function decodeAttr(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|lt|gt|apos);/gi, (whole, ref: string) => {
    const key = ref.toLowerCase();
    if (key === "amp") return "&";
    if (key === "quot") return '"';
    if (key === "lt") return "<";
    if (key === "gt") return ">";
    if (key === "apos") return "'";
    const code = key.startsWith("#x") ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });
}

function xmlEscape(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\r?\n/g, "&#10;");
}

/** Size math images, centre display formulas, and index them for finalizeMathImagesInDocx. */
export function prepareMathImagesForDocx(html: string): { html: string; index: MathImageIndex } {
  const index: MathImageIndex = new Map();

  let out = html.replace(IMG_TAG_RE, (tag) => {
    const title = getAttr(tag, "title");
    const box = title ? parseMathImageTitle(decodeAttr(title)) : null;
    if (!box) return tag;
    const payload = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(getAttr(tag, "src") ?? "");
    if (!payload) return tag;

    const latex = decodeAttr(getAttr(tag, "alt") ?? "").slice(0, MAX_ALT_CHARS);
    const hash = sha1(Buffer.from(payload[1], "base64"));
    const occurrences = index.get(hash) ?? [];
    occurrences.push({ latex, display: box.display, depthPx: box.depth });
    index.set(hash, occurrences);
    const extra = `style="width:${box.width}px;height:${box.height}px"${box.display ? ` ${DISPLAY_ATTR}` : ""}`;
    return tag.replace(/\stitle="[^"]*"/i, "").replace(/^<img\b/i, `<img ${extra}`);
  });

  if (index.size === 0) return { html, index };

  // A display formula alone in its paragraph is centred, as in the preview
  out = out.replace(
    new RegExp(`<p>(\\s*<img\\b(?:[^>"']|"[^"]*"|'[^']*')*\\s${DISPLAY_ATTR}(?:[^>"']|"[^"]*"|'[^']*')*>\\s*)</p>`, "gi"),
    '<p style="text-align:center">$1</p>'
  );
  out = out.replace(new RegExp(`\\s${DISPLAY_ATTR}(?==|\\s|/?>)(="")?`, "gi"), "");

  return { html: out, index };
}

// w:position must precede these in <w:rPr> (CT_RPr is an ordered sequence)
const AFTER_POSITION =
  /<w:(sz|szCs|highlight|u|effect|bdr|shd|fitText|vertAlign|rtl|cs|em|lang|eastAsianLayout|specVanish|oMath)\b/;

function withPosition(rPrBody: string, halfPoints: number): string {
  const position = `<w:position w:val="-${halfPoints}"/>`;
  const at = rPrBody.search(AFTER_POSITION);
  return at === -1 ? rPrBody + position : rPrBody.slice(0, at) + position + rPrBody.slice(at);
}

/** Add alt text and baseline offsets to the math pictures in a generated DOCX. */
export async function finalizeMathImagesInDocx(docx: Buffer, index: MathImageIndex): Promise<Buffer> {
  if (index.size === 0) return docx;

  const zip = await JSZip.loadAsync(docx);
  const documentFile = zip.file("word/document.xml");
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (!documentFile || !relsFile) return docx;

  const hashByRel = new Map<string, string>();
  const rels = await relsFile.async("string");
  for (const [rel] of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = /\bId="([^"]+)"/.exec(rel)?.[1];
    const target = /\bTarget="(media\/[^"]+)"/.exec(rel)?.[1];
    const media = id && target ? zip.file(`word/${target}`) : null;
    if (!id || !media) continue;
    const hash = sha1(await media.async("nodebuffer"));
    if (index.has(hash)) hashByRel.set(id, hash);
  }
  if (hashByRel.size === 0) return docx;

  // Pictures are visited in document order, so shifting each hash's queue
  // pairs identical images with their own occurrence
  const xml = (await documentFile.async("string")).replace(
    /<w:r>(\s*)(?:<w:rPr\/>|<w:rPr>((?:(?!<\/w:rPr>)[\s\S])*)<\/w:rPr>)(\s*)<w:drawing>([\s\S]*?)<\/w:drawing>/g,
    (run, lead: string, rPrBody: string | undefined, gap: string, drawing: string) => {
      const rel = /r:embed="([^"]+)"/.exec(drawing)?.[1];
      const queue = rel ? index.get(hashByRel.get(rel) ?? "") : undefined;
      const info = queue && (queue.length > 1 ? queue.shift() : queue[0]);
      if (!info) return run;

      const described = info.latex
        ? drawing.replace(/<wp:docPr\b((?:[^>"]|"[^"]*")*?)(\/?)>/, (tag, attrs: string, slash: string) =>
            /\sdescr=/.test(attrs) ? tag : `<wp:docPr${attrs} descr="${xmlEscape(info.latex)}"${slash}>`
          )
        : drawing;
      // 1 CSS px = 0.75 pt = 1.5 half-points
      const lower = info.display ? 0 : Math.round(info.depthPx * 1.5);
      const body = rPrBody ?? "";
      const rPr = lower > 0 ? `<w:rPr>${withPosition(body, lower)}</w:rPr>` : body ? `<w:rPr>${body}</w:rPr>` : "<w:rPr/>";
      return `<w:r>${lead}${rPr}${gap}<w:drawing>${described}</w:drawing>`;
    }
  );

  zip.file("word/document.xml", xml);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
