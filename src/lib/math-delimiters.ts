/**
 * Pre-parse normalization for math (build plan Phase 0a).
 *
 * 1. `\( … \)` and `\[ … \]` — what ChatGPT, DeepSeek, Kimi, Doubao and Gemini
 *    emit when their answers are copied — become `$ … $` / `$$ … $$`, the only
 *    delimiters remark-math understands. Without this, formulas render as
 *    literal backslashes and brackets (the most common "my formula broke"
 *    complaint for AI-chat paste).
 * 2. Currency false positives: "costs $5 and $10" would otherwise become an
 *    inline formula. A `$…$` span whose content is several plain words with no
 *    math markers is treated as prose and its dollar signs are escaped.
 * 3. `<think>…</think>` blocks (hidden reasoning some chat UIs copy along)
 *    are removed: as raw HTML they would be dropped anyway, but an HTML block
 *    swallows every following line up to the next blank one, taking the first
 *    heading with it.
 *
 * Fenced code blocks and inline code spans are never touched.
 */

// Something that only appears in formulas: a TeX command, sub/superscript,
// an equals sign, or an operator between operands.
const LOOKS_LIKE_MATH = /\\[a-zA-Z]+|[\^_=]|[0-9a-zA-Z)\]}]\s*[+\-*/]\s*[0-9a-zA-Z(\[{\\]/;

// Prose masquerading as a `$…$` span: two or more plain words, nothing math-like.
const PROSE_WORDS = /^\s*[^\s$]+(?:\s+[^\s$]+)+\s*$/;

function looksLikeProse(inner: string): boolean {
  return PROSE_WORDS.test(inner) && !LOOKS_LIKE_MATH.test(inner);
}

function convertSegment(text: string): string {
  // Display math: \[ … \] (may span lines). `\[` is also how Markdown escapes a
  // literal bracket, so require the content to look like a formula or to span
  // several lines (prose escapes are single-line).
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, inner: string) => {
    if (inner.includes("](")) return match;
    if (!LOOKS_LIKE_MATH.test(inner) && !inner.includes("\n")) return match;
    return `$$\n${inner.trim()}\n$$`;
  });

  // Inline math: \( … \) on a single line. `\(` has no other meaning in
  // Markdown prose, so anything short that isn't a link is converted.
  text = text.replace(/\\\(([^\n]*?)\\\)/g, (match, inner: string) => {
    const body = inner.trim();
    if (!body || body.length > 500 || body.includes("](") || /https?:\/\//.test(body)) return match;
    return `$${body}$`;
  });

  // Currency: `$5 and the upgrade costs $10` — escape the dollars so
  // remark-math cannot pair them. Only single-dollar spans on one line.
  text = text.replace(/(^|[^\\$])\$([^$\n]+)\$(?!\$)/g, (match, before: string, inner: string) => {
    if (!looksLikeProse(inner)) return match;
    return `${before}\\$${inner}\\$`;
  });

  return text;
}

/**
 * Split Markdown into code and non-code segments. Fenced blocks (``` / ~~~)
 * and inline code spans (`…`) are code; everything else is prose. Segment
 * texts concatenate back to the exact input (line breaks included).
 */
function splitByCode(markdown: string): Array<{ code: boolean; text: string }> {
  const out: Array<{ code: boolean; text: string }> = [];
  const lines = markdown.split("\n");
  let fence: string | null = null;
  let buffer = "";
  let bufferIsCode = false;

  const flush = () => {
    if (buffer.length === 0) return;
    out.push({ code: bufferIsCode, text: buffer });
    buffer = "";
  };

  for (let i = 0; i < lines.length; i++) {
    // Keep every line's own terminator so segments rejoin losslessly
    const line = lines[i] + (i < lines.length - 1 ? "\n" : "");
    const fenceMatch = lines[i].match(/^[ \t]{0,3}(`{3,}|~{3,})/);
    if (fence === null && fenceMatch) {
      flush();
      fence = fenceMatch[1];
      bufferIsCode = true;
      buffer += line;
      continue;
    }
    if (fence !== null) {
      buffer += line;
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) {
        fence = null;
        flush();
        bufferIsCode = false;
      }
      continue;
    }
    if (bufferIsCode) {
      flush();
      bufferIsCode = false;
    }
    buffer += line;
  }
  flush();

  // Second pass: split prose segments around inline code spans
  const result: Array<{ code: boolean; text: string }> = [];
  for (const seg of out) {
    if (seg.code) {
      result.push(seg);
      continue;
    }
    const parts = seg.text.split(/(`+[^`\n]*?`+)/);
    for (const part of parts) {
      if (!part) continue;
      result.push({ code: /^`+[^`\n]*?`+$/.test(part), text: part });
    }
  }
  return result;
}

const THINK_BLOCK = /<think>[\s\S]*?<\/think>\s*/gi;

export function stripThinkBlocks(markdown: string): string {
  if (!/<think>/i.test(markdown)) return markdown;
  return splitByCode(markdown)
    .map((seg) => (seg.code ? seg.text : seg.text.replace(THINK_BLOCK, "")))
    .join("");
}

export function normalizeMathDelimiters(markdown: string): string {
  if (!/\\[\[(]|\$/.test(markdown)) return markdown;
  return splitByCode(markdown)
    .map((seg) => (seg.code ? seg.text : convertSegment(seg.text)))
    .join("");
}

/** Everything the pipeline does before parsing. */
export function preprocessMarkdown(markdown: string): string {
  return normalizeMathDelimiters(stripThinkBlocks(markdown));
}

/** Cheap detector used for analytics and for deciding whether KaTeX assets are needed. */
export function markdownHasMath(markdown: string): boolean {
  return /\$\$[\s\S]+?\$\$|(^|[^\\$])\$[^$\n]+\$|\\\(|\\\[/.test(markdown);
}
