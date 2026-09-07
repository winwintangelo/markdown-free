import { hasMermaidFence, prerenderMermaid } from "./diagrams";
import { markdownHasMath } from "./math-delimiters";

/**
 * Client-side preparation step shared by the preview and every export.
 *
 * Today it pre-renders Mermaid fences into embedded images (see diagrams.ts).
 * Math needs no preparation: the shared markdown → HTML pipeline handles it on
 * both client and server. The result also carries the document facts the
 * analytics layer reports (booleans only — never content).
 */

export interface PrepareOptions {
  /** Embed diagrams as PNG (server-side targets: PDF, DOCX) instead of SVG. */
  raster?: boolean;
}

export interface PreparedMarkdown {
  markdown: string;
  hasMath: boolean;
  hasMermaid: boolean;
  diagramsRendered: number;
  diagramsFailed: number;
}

export async function prepareMarkdown(
  markdown: string,
  options: PrepareOptions = {}
): Promise<PreparedMarkdown> {
  const hasMath = markdownHasMath(markdown);
  const hasMermaid = hasMermaidFence(markdown);

  if (!hasMermaid || typeof window === "undefined") {
    return { markdown, hasMath, hasMermaid, diagramsRendered: 0, diagramsFailed: 0 };
  }

  const result = await prerenderMermaid(markdown, { raster: options.raster });
  return {
    markdown: result.markdown,
    hasMath,
    hasMermaid,
    diagramsRendered: result.rendered,
    diagramsFailed: result.failed,
  };
}
