import { hasMermaidFence, prerenderMermaid } from "./diagrams";
import { markdownHasMath } from "./math-delimiters";
import { renderMathAsImages } from "./math-images";
import { DOCX_MAX_BODY_BYTES } from "./math-image-marker";

/**
 * Client-side preparation step shared by the preview and every export.
 *
 * It pre-renders Mermaid fences into embedded images (see diagrams.ts). Math
 * needs no preparation for most formats: the shared markdown → HTML pipeline
 * typesets it on both client and server. Word is the exception — html-to-docx
 * has no equation support — so the DOCX export asks for `mathImages` and gets
 * every formula as an embedded PNG (see math-images.ts). The result also
 * carries the document facts the analytics layer reports (booleans only —
 * never content).
 */

export interface PrepareOptions {
  /** Embed diagrams as PNG (server-side targets: PDF, DOCX) instead of SVG. */
  raster?: boolean;
  /**
   * Replace formulas with PNG images (Word only). Skipped — formulas stay
   * LaTeX — if the images would push the request past the DOCX body cap.
   */
  mathImages?: boolean;
}

export interface PreparedMarkdown {
  markdown: string;
  hasMath: boolean;
  hasMermaid: boolean;
  diagramsRendered: number;
  diagramsFailed: number;
  formulasRendered: number;
  formulasFailed: number;
}

export async function prepareMarkdown(
  markdown: string,
  options: PrepareOptions = {}
): Promise<PreparedMarkdown> {
  const hasMath = markdownHasMath(markdown);
  const hasMermaid = hasMermaidFence(markdown);
  const prepared: PreparedMarkdown = {
    markdown,
    hasMath,
    hasMermaid,
    diagramsRendered: 0,
    diagramsFailed: 0,
    formulasRendered: 0,
    formulasFailed: 0,
  };
  if (typeof window === "undefined") return prepared;

  if (hasMermaid) {
    const result = await prerenderMermaid(prepared.markdown, { raster: options.raster });
    prepared.markdown = result.markdown;
    prepared.diagramsRendered = result.rendered;
    prepared.diagramsFailed = result.failed;
  }

  if (hasMath && options.mathImages) {
    const result = await renderMathAsImages(prepared.markdown, { maxBytes: DOCX_MAX_BODY_BYTES });
    prepared.markdown = result.markdown;
    prepared.formulasRendered = result.rendered;
    prepared.formulasFailed = result.failed;
  }

  return prepared;
}
