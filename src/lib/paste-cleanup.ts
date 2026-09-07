/**
 * Paste cleanup for AI-chat copies (build plan Phase 0a).
 *
 * Text copied out of ChatGPT, DeepSeek, Kimi, Doubao, Gemini or Claude carries
 * UI residue that is not part of the answer: "Copy code" buttons, role labels
 * ("You said:", "ChatGPT said:"), hidden reasoning (`<think>…</think>`),
 * "Thought for 12s" lines, and citation glyphs. This strips the residue and
 * reports which chatbot the text most likely came from (a closed enum, for
 * analytics — never the text itself).
 *
 * Fenced code blocks are never modified. Math delimiters are normalized
 * separately in the render pipeline (math-delimiters.ts).
 */

export type ChatbotSource =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "deepseek"
  | "kimi"
  | "doubao"
  | "copilot"
  | "other";

export interface CleanupResult {
  text: string;
  /** Lines removed (UI residue) */
  removedLines: number;
  source: ChatbotSource | null;
  changed: boolean;
}

// Standalone lines that are copy-button labels in the UIs' languages
const COPY_BUTTON_RE =
  /^(?:copy code|copy|copied!?|复制代码|复制|已复制|コードをコピー|コピー|コピーしました|코드 복사|복사|복사됨|copiar código|copiar|copia codice|copia|salin kode|salin|sao chép mã|sao chép)$/i;

// Standalone role labels (with optional trailing colon)
const ROLE_LABEL_RE =
  /^(?:you said|chatgpt said|assistant said|user|assistant|you|chatgpt|claude|gemini|deepseek|kimi|copilot|豆包|用户|助手|你说|你|chatgpt 说|deepseek 说|kimi 说|豆包 说|あなた|アシスタント|사용자|어시스턴트)\s*[:：]?\s*$/i;

// "Thought for 8s" / "Reasoned for 12 seconds" / "已深度思考（用时 12 秒）" / "思考完成"
const THINKING_LINE_RE =
  /^(?:thought for [\d.]+ ?s(?:econds)?|reasoned for [\d.]+ ?s(?:econds)?|thinking\.{0,3}|已深度思考(?:（用时 ?[\d.]+ ?秒）|\(用时 ?[\d.]+ ?秒\))?|思考完成|深度思考|推理过程|思考中\.{0,3}|思考 [\d.]+ 秒)$/i;

// ChatGPT citation residue: 【12†source】, citeturn0search3, and the private-use glyphs it wraps them in
const CITATION_RE = /【[^】]{0,60}†[^】]{0,60}】|cite(?:turn\d+\w*)+|[-]/g;

const SOURCE_MARKERS: Array<[RegExp, ChatbotSource]> = [
  [/^chatgpt said|^chatgpt 说|chatgpt/i, "chatgpt"],
  [/^deepseek|deepseek 说|已深度思考|^<think>/i, "deepseek"],
  [/^kimi|kimi 说/i, "kimi"],
  [/^豆包|豆包 说/i, "doubao"],
  [/^claude/i, "claude"],
  [/^gemini/i, "gemini"],
  [/^copilot/i, "copilot"],
];

function detectSource(line: string, current: ChatbotSource | null): ChatbotSource | null {
  if (current && current !== "other") return current;
  for (const [re, source] of SOURCE_MARKERS) {
    if (re.test(line)) return source;
  }
  return current;
}

export function cleanPastedMarkdown(input: string): CleanupResult {
  if (!input) return { text: input, removedLines: 0, source: null, changed: false };

  let source: ChatbotSource | null = null;
  let removedLines = 0;

  // 1. Hidden reasoning blocks (DeepSeek-style), including unterminated ones
  let text = input.replace(/<think>[\s\S]*?<\/think>\s*/gi, (block) => {
    removedLines += block.split("\n").length - 1 || 1;
    source = source ?? "deepseek";
    return "";
  });
  if (/<think>/i.test(text) && !/<\/think>/i.test(text)) {
    // Opening tag with no close: drop from the tag to the next blank line
    text = text.replace(/<think>[\s\S]*?(?:\n\s*\n|$)/i, (block) => {
      removedLines += block.split("\n").length - 1 || 1;
      source = source ?? "deepseek";
      return "";
    });
  }

  // 2. Line-based residue, skipping fenced code
  const lines = text.split("\n");
  const kept: string[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const fenceMatch = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
    if (fence === null && fenceMatch) {
      fence = fenceMatch[1];
      kept.push(line);
      continue;
    }
    if (fence !== null) {
      kept.push(line);
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null;
      continue;
    }

    const trimmed = line.trim();
    if (COPY_BUTTON_RE.test(trimmed) || THINKING_LINE_RE.test(trimmed)) {
      removedLines++;
      if (THINKING_LINE_RE.test(trimmed)) source = detectSource(trimmed, source);
      continue;
    }
    if (ROLE_LABEL_RE.test(trimmed)) {
      removedLines++;
      source = detectSource(trimmed, source);
      continue;
    }

    // Inline citation residue
    const cleaned = line.replace(CITATION_RE, "");
    if (cleaned !== line) source = source ?? "chatgpt";
    kept.push(cleaned);
  }

  // 3. Collapse runs of blank lines the removals may have left behind
  let result = kept.join("\n").replace(/\n{4,}/g, "\n\n\n");
  result = result.replace(/^\s*\n/, "");

  return {
    text: result,
    removedLines,
    source,
    changed: result !== input,
  };
}

/** Human-readable label for the detected source (UI only). */
export const CHATBOT_LABELS: Record<ChatbotSource, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  deepseek: "DeepSeek",
  kimi: "Kimi",
  doubao: "豆包",
  copilot: "Copilot",
  other: "AI chat",
};
