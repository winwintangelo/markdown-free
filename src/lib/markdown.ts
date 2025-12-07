import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

/**
 * Markdown processing pipeline with XSS sanitization
 * 
 * Pipeline: remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify
 * 
 * - remark-parse: Parse markdown to mdast
 * - remark-gfm: Add GitHub Flavored Markdown support (tables, strikethrough, etc.)
 * - remark-rehype: Transform mdast to hast (HTML AST)
 * - rehype-sanitize: Sanitize HTML to prevent XSS attacks (uses GitHub schema)
 * - rehype-stringify: Serialize hast to HTML string
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize)
  .use(rehypeStringify);

/**
 * Convert markdown string to sanitized HTML
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await processor.process(markdown);
  return String(result);
}

/**
 * Synchronous version for simpler use cases
 * Note: Using processSync which may not work with all plugins
 */
export function markdownToHtmlSync(markdown: string): string {
  const result = processor.processSync(markdown);
  return String(result);
}

