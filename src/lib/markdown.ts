import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import rehypeKatex, { type Options as KatexOptions } from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import type { Root, Element } from "hast";
import { preprocessMarkdown } from "./math-delimiters";

/**
 * Markdown processing pipeline with XSS sanitization (shared by the browser
 * preview/exports and the server convert routes).
 *
 * Pipeline: preprocess (strip <think>, normalize math delimiters, guard currency)
 *   → remark-parse → remark-math → remark-gfm → remark-rehype → rehype-sanitize
 *   → rehype-katex → restrict data: images → rehype-stringify
 *
 * - preprocessMarkdown (math-delimiters.ts): `\( … \)` / `\[ … \]` (what AI chats
 *   emit) → `$ … $` / `$$ … $$`; `$5 and $10` prose stays prose; `<think>` residue dropped
 * - remark-math: `$ … $` inline and `$$ … $$` display math nodes
 * - remark-gfm: GitHub Flavored Markdown (tables, task lists, strikethrough…)
 * - rehype-sanitize: GitHub schema, extended to keep the math classes and to
 *   allow `data:` image sources (needed for the pre-rendered Mermaid diagrams)
 * - rehype-katex: renders the math nodes AFTER sanitization (its own output is
 *   trusted; `trust: false` blocks \href/\url/\includegraphics-style commands)
 * - restrictDataImages: only base64 raster/SVG image data URIs survive; any other
 *   `data:` source is dropped. SVG in an <img> never executes script.
 */

const schema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // remark-math emits <code class="language-math math-inline|math-display">
    code: [["className", /^language-./, "math-inline", "math-display"]],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), "data"],
  },
};

const ALLOWED_DATA_IMAGE = /^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,/i;

function restrictDataImages() {
  return (tree: Root) => {
    const walk = (node: Root | Element) => {
      for (const child of node.children) {
        if (child.type !== "element") continue;
        if (child.tagName === "img" && typeof child.properties?.src === "string") {
          const src = child.properties.src;
          if (src.startsWith("data:") && !ALLOWED_DATA_IMAGE.test(src)) {
            delete child.properties.src;
          }
        }
        walk(child);
      }
    };
    walk(tree);
  };
}

// rehype-katex always renders with throwOnError:false (errors show inline in errorColor).
// Also used by math-images.ts, so formulas rendered for Word obey the same limits.
export const katexOptions: KatexOptions = {
  output: "htmlAndMathml",
  errorColor: "#b91c1c",
  strict: "ignore",
  trust: false,
  // Bound pathological macro expansion (the PDF route renders server-side)
  maxExpand: 1000,
  maxSize: 50,
};

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, schema)
  .use(rehypeKatex, katexOptions)
  .use(restrictDataImages)
  .use(rehypeStringify);

/**
 * Same pipeline without KaTeX: math stays as
 * <code class="language-math math-inline|math-display">LaTeX source</code>.
 * Used by the DOCX route (html-to-docx would otherwise dump KaTeX's HTML +
 * MathML as duplicated garbage text). The browser sends formulas to Word as
 * images (math-images.ts), so only ones KaTeX could not parse reach this.
 */
const sourceMathProcessor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, schema)
  .use(restrictDataImages)
  .use(rehypeStringify);

export interface MarkdownRenderOptions {
  /** Render formulas with KaTeX (default true); false keeps the LaTeX source in <code> */
  renderMath?: boolean;
}

/**
 * Convert markdown string to sanitized HTML
 */
export async function markdownToHtml(
  markdown: string,
  options: MarkdownRenderOptions = {}
): Promise<string> {
  const engine = options.renderMath === false ? sourceMathProcessor : processor;
  const result = await engine.process(preprocessMarkdown(markdown));
  return String(result);
}

/**
 * Synchronous version for simpler use cases
 * Note: Using processSync which may not work with all plugins
 */
export function markdownToHtmlSync(markdown: string, options: MarkdownRenderOptions = {}): string {
  const engine = options.renderMath === false ? sourceMathProcessor : processor;
  const result = engine.processSync(preprocessMarkdown(markdown));
  return String(result);
}
