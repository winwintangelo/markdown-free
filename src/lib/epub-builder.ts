import JSZip from "jszip";

/**
 * Minimal EPUB 3 package builder that runs in the browser (build plan Phase
 * 0a — EPUB moved off the server). Produces a standards-shaped container:
 *
 *   mimetype (stored, first entry)
 *   META-INF/container.xml
 *   OEBPS/content.opf, nav.xhtml, toc.ncx (EPUB 2 fallback), style.css
 *   OEBPS/chapter-N.xhtml, OEBPS/images/…
 *
 * Chapter HTML is converted to XHTML with the browser's own serializer, so
 * the output is well-formed without a second parser dependency.
 */

export interface EpubChapter {
  title: string;
  /** Sanitized HTML fragment (from the shared markdown pipeline) */
  html: string;
}

export interface EpubImage {
  /** Path relative to OEBPS/, e.g. images/img-1.png */
  href: string;
  mediaType: string;
  data: Uint8Array;
}

export interface EpubBuildOptions {
  title: string;
  language: string;
  css: string;
  chapters: EpubChapter[];
  images: EpubImage[];
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

function uuid(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c) {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** HTML fragment → well-formed XHTML body markup via the browser DOM. */
export function htmlFragmentToXhtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<!DOCTYPE html><html><body>${html}</body></html>`, "text/html");
  const serializer = new XMLSerializer();
  let out = "";
  doc.body.childNodes.forEach((node) => {
    out += serializer.serializeToString(node);
  });
  // The serializer stamps the XHTML namespace on every top-level element;
  // the document root already declares it.
  return out.replace(/ xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, "");
}

function chapterXhtml(title: string, bodyXhtml: string, language: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE html>\n` +
    `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${escapeXml(language)}" lang="${escapeXml(language)}">\n` +
    `<head><meta charset="utf-8"/><title>${escapeXml(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>\n` +
    `<body>\n${bodyXhtml}\n</body>\n</html>\n`
  );
}

export async function buildEpubBlob(options: EpubBuildOptions): Promise<Blob> {
  const { title, language, css, chapters, images } = options;
  if (chapters.length === 0) throw new Error("EPUB needs at least one chapter");

  const zip = new JSZip();
  const id = `urn:uuid:${uuid()}`;
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  // The mimetype entry must be first and uncompressed
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n` +
      `  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>\n` +
      `</container>\n`
  );

  const chapterFiles = chapters.map((chapter, i) => {
    const href = `chapter-${i + 1}.xhtml`;
    const body = htmlFragmentToXhtml(chapter.html);
    const hasMathml = /<math\b/i.test(body);
    zip.file(`OEBPS/${href}`, chapterXhtml(chapter.title, body, language));
    return { id: `ch${i + 1}`, href, title: chapter.title, properties: hasMathml ? "mathml" : "" };
  });

  images.forEach((image) => zip.file(`OEBPS/${image.href}`, image.data));
  zip.file("OEBPS/style.css", css);

  const navItems = chapterFiles
    .map((c) => `      <li><a href="${c.href}">${escapeXml(c.title)}</a></li>`)
    .join("\n");
  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<!DOCTYPE html>\n` +
      `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">\n` +
      `<head><meta charset="utf-8"/><title>Table of Contents</title></head>\n` +
      `<body>\n  <nav epub:type="toc" id="toc"><h1>Table of Contents</h1>\n    <ol>\n${navItems}\n    </ol>\n  </nav>\n</body>\n</html>\n`
  );

  const navPoints = chapterFiles
    .map(
      (c, i) =>
        `    <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}"><navLabel><text>${escapeXml(c.title)}</text></navLabel><content src="${c.href}"/></navPoint>`
    )
    .join("\n");
  zip.file(
    "OEBPS/toc.ncx",
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n` +
      `  <head><meta name="dtb:uid" content="${id}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head>\n` +
      `  <docTitle><text>${escapeXml(title)}</text></docTitle>\n` +
      `  <navMap>\n${navPoints}\n  </navMap>\n</ncx>\n`
  );

  const manifest = [
    `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `    <item id="style" href="style.css" media-type="text/css"/>`,
    ...chapterFiles.map(
      (c) =>
        `    <item id="${c.id}" href="${c.href}" media-type="application/xhtml+xml"${c.properties ? ` properties="${c.properties}"` : ""}/>`
    ),
    ...images.map((img, i) => `    <item id="img${i + 1}" href="${img.href}" media-type="${img.mediaType}"/>`),
  ].join("\n");
  const spine = chapterFiles.map((c) => `    <itemref idref="${c.id}"/>`).join("\n");

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${escapeXml(language)}">\n` +
      `  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n` +
      `    <dc:identifier id="bookid">${id}</dc:identifier>\n` +
      `    <dc:title>${escapeXml(title)}</dc:title>\n` +
      `    <dc:language>${escapeXml(language)}</dc:language>\n` +
      `    <meta property="dcterms:modified">${modified}</meta>\n` +
      `  </metadata>\n` +
      `  <manifest>\n${manifest}\n  </manifest>\n` +
      `  <spine toc="ncx">\n${spine}\n  </spine>\n` +
      `</package>\n`
  );

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
  });
}
