import { test, expect } from "@playwright/test";
import { classifyReferrer, fileKind } from "../src/lib/analytics";

/**
 * Pure analytics helpers (src/lib/analytics.ts), run in the Playwright Node
 * process: the AI-referrer classifier behind `ai_referral`, and the file kind
 * a rejected upload reports in `upload_error`.
 */

test.describe("classifyReferrer", () => {
  const cases: [referrer: string, isAI: boolean, source: string][] = [
    ["https://chatgpt.com/", true, "chatgpt"],
    ["https://chat.openai.com/c/123", true, "chatgpt"],
    ["https://www.perplexity.ai/search?q=x", true, "perplexity"],
    ["https://gemini.google.com/app", true, "gemini"],
    ["https://claude.ai/chat/abc", true, "claude"],
    ["https://copilot.microsoft.com/", true, "copilot"],
    ["https://www.bing.com/chat?q=markdown", true, "copilot"],
    ["https://www.doubao.com/chat/", true, "doubao"],
    ["https://yuanbao.tencent.com/", true, "yuanbao"],
    ["https://chat.deepseek.com/", true, "deepseek"],
    ["https://kimi.moonshot.cn/", true, "kimi"],
    // Search engines and sites whose names merely contain an assistant's word
    ["https://cn.bing.com/", false, "cn.bing.com"],
    ["https://www.bing.com/search?q=markdown", false, "www.bing.com"],
    ["https://bing.com/", false, "bing.com"],
    ["https://www.youtube.com/watch?v=1", false, "www.youtube.com"],
    ["https://wechat.com/", false, "wechat.com"],
    ["https://www.google.com/", false, "www.google.com"],
    ["https://poems.example.org/", false, "poems.example.org"],
  ];
  for (const [referrer, isAI, source] of cases) {
    test(`${referrer} → ${isAI ? source : "not AI"}`, () => {
      expect(classifyReferrer(referrer)).toEqual({ isAI, source });
    });
  }

  test("no referrer is direct; garbage is unknown", () => {
    expect(classifyReferrer("")).toEqual({ isAI: false, source: "direct" });
    expect(classifyReferrer("not a url")).toEqual({ isAI: false, source: "unknown" });
  });
});

test.describe("fileKind", () => {
  const cases: [name: string, kind: string][] = [
    ["Quarterly Report.DOCX", "word"],
    ["notes.doc", "word"],
    ["paper.pdf", "pdf"],
    ["page.html", "html"],
    ["screenshot.PNG", "image"],
    ["data.csv", "sheet"],
    ["deck.pptx", "slides"],
    ["thesis.tex", "latex"],
    ["analysis.ipynb", "notebook"],
    ["post.mdx", "md_variant"],
    ["report.Rmd", "md_variant"],
    ["export.zip", "archive"],
    ["config.yaml", "data"],
    ["README", "none"],
    [".gitignore", "none"],
    ["trailing.", "none"],
    ["program.exe", "other"],
  ];
  for (const [name, kind] of cases) {
    test(`${name} → ${kind}`, () => {
      expect(fileKind(name)).toBe(kind);
    });
  }
});
