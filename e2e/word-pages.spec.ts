import { test, expect } from "@playwright/test";

test.describe("Word Power Pages - Wave 1", () => {
  test.describe("English - /markdown-to-word", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/markdown-to-word");
    });

    test("should load with correct H1 containing Word and DOCX", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
    });

    test("should have correct meta title", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown to Word");
      expect(title).toContain("DOCX");
    });

    test("should have CTA link to homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /Start Converting/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/");
    });

    test("should have FAQ section with Word/DOCX questions", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "Frequently Asked Questions" });
      await expect(faqHeading).toBeVisible();

      // Check for Word/DOCX difference question
      const diffQuestion = page.getByText("What's the difference between Word and DOCX?");
      await expect(diffQuestion).toBeVisible();
    });

    test("should have Privacy & Security section", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "Privacy & Security" });
      await expect(privacyHeading).toBeVisible();
    });

    test("should have Who Uses section with use cases", async ({ page }) => {
      const whoHeading = page.getByRole("heading", { name: /Who Uses/ });
      await expect(whoHeading).toBeVisible();

      // Check for use cases
      await expect(page.getByText("Students")).toBeVisible();
      await expect(page.getByText("Developers")).toBeVisible();
    });

    test("should have footer", async ({ page }) => {
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });
  });

  test.describe("Indonesian - /id/markdown-ke-word", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/id/markdown-ke-word");
    });

    test("should load with correct H1 in Indonesian", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
      expect(text).toContain("Gratis");
    });

    test("should have correct meta title in Indonesian", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown ke Word");
      expect(title).toContain("DOCX");
      expect(title).toContain("Gratis");
    });

    test("should have CTA link to Indonesian homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /Mulai Konversi/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/id");
    });

    test("should have FAQ section in Indonesian", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "Pertanyaan yang Sering Diajukan" });
      await expect(faqHeading).toBeVisible();
    });

    test("should have Privacy section in Indonesian", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "Privasi & Keamanan" });
      await expect(privacyHeading).toBeVisible();
    });
  });

  test.describe("Japanese - /ja/markdown-word-henkan", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/ja/markdown-word-henkan");
    });

    test("should load with correct H1 in Japanese", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
      expect(text).toContain("変換");
    });

    test("should have correct meta title in Japanese", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown Word");
      expect(title).toContain("DOCX");
      expect(title).toContain("変換");
    });

    test("should have CTA link to Japanese homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /変換を開始/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/ja");
    });

    test("should have FAQ section in Japanese", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "よくある質問" });
      await expect(faqHeading).toBeVisible();
    });

    test("should have Privacy section in Japanese", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "プライバシーとセキュリティ" });
      await expect(privacyHeading).toBeVisible();
    });
  });

  test.describe("Existing DOCX pages - Updated titles", () => {
    test("English /markdown-to-docx should have Word in title", async ({ page }) => {
      await page.goto("/markdown-to-docx");
      const title = await page.title();
      expect(title).toContain("DOCX");
      expect(title).toContain("Word");
    });

    test("Japanese /ja/markdown-docx-henkan should have Word in title", async ({ page }) => {
      await page.goto("/ja/markdown-docx-henkan");
      const title = await page.title();
      expect(title).toContain("DOCX");
      expect(title).toContain("Word");
    });
  });
});

test.describe("Word Power Pages - Wave 2", () => {
  test.describe("Spanish - /es/markdown-a-word", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/es/markdown-a-word");
    });

    test("should load with correct H1 in Spanish", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
      expect(text).toContain("Gratis");
    });

    test("should have correct meta title in Spanish", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown a Word");
      expect(title).toContain("DOCX");
      expect(title).toContain("Gratis");
    });

    test("should have CTA link to Spanish homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /Comenzar a Convertir/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/es");
    });

    test("should have FAQ section in Spanish", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "Preguntas Frecuentes" });
      await expect(faqHeading).toBeVisible();
    });

    test("should have Privacy section in Spanish", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "Privacidad y Seguridad" });
      await expect(privacyHeading).toBeVisible();
    });
  });

  test.describe("Korean - /ko/markdown-word-byeonhwan", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/ko/markdown-word-byeonhwan");
    });

    test("should load with correct H1 in Korean", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
      expect(text).toContain("변환");
    });

    test("should have correct meta title in Korean", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown Word");
      expect(title).toContain("DOCX");
      expect(title).toContain("변환");
    });

    test("should have CTA link to Korean homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /변환 시작하기/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/ko");
    });

    test("should have FAQ section in Korean", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "자주 묻는 질문" });
      await expect(faqHeading).toBeVisible();
    });

    test("should have Privacy section in Korean", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "개인정보 보호 및 보안" });
      await expect(privacyHeading).toBeVisible();
    });
  });

  test.describe("Vietnamese - /vi/markdown-sang-word", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/vi/markdown-sang-word");
    });

    test("should load with correct H1 in Vietnamese", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
      expect(text).toContain("Miễn phí");
    });

    test("should have correct meta title in Vietnamese", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown sang Word");
      expect(title).toContain("DOCX");
      expect(title).toContain("Miễn phí");
    });

    test("should have CTA link to Vietnamese homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /Bắt đầu Chuyển đổi/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/vi");
    });

    test("should have FAQ section in Vietnamese", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "Câu hỏi Thường gặp" });
      await expect(faqHeading).toBeVisible();
    });

    test("should have Privacy section in Vietnamese", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "Quyền riêng tư và Bảo mật" });
      await expect(privacyHeading).toBeVisible();
    });
  });
});

test.describe("Word Power Pages - Wave 3", () => {
  test.describe("Simplified Chinese - /zh-Hans/markdown-zhuanhuan-word", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/zh-Hans/markdown-zhuanhuan-word");
    });

    test("should load with correct H1 in Simplified Chinese", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
      expect(text).toContain("免费");
    });

    test("should have correct meta title in Simplified Chinese", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown转换Word");
      expect(title).toContain("DOCX");
      expect(title).toContain("免费");
    });

    test("should have CTA link to Simplified Chinese homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /开始转换/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/zh-Hans");
    });

    test("should have FAQ section in Simplified Chinese", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "常见问题" });
      await expect(faqHeading).toBeVisible();
    });

    test("should have Privacy section in Simplified Chinese", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "隐私与安全" });
      await expect(privacyHeading).toBeVisible();
    });
  });

  test.describe("Traditional Chinese - /zh-Hant/markdown-word-zhuanhuan", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/zh-Hant/markdown-word-zhuanhuan");
    });

    test("should load with correct H1 in Traditional Chinese", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
      expect(text).toContain("免費");
    });

    test("should have correct meta title in Traditional Chinese", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown轉換Word");
      expect(title).toContain("DOCX");
      expect(title).toContain("免費");
    });

    test("should have CTA link to Traditional Chinese homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /開始轉換/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/zh-Hant");
    });

    test("should have FAQ section in Traditional Chinese", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "常見問題" });
      await expect(faqHeading).toBeVisible();
    });

    test("should have Privacy section in Traditional Chinese", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "隱私與安全" });
      await expect(privacyHeading).toBeVisible();
    });
  });

  test.describe("Italian - /it/markdown-in-word", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/it/markdown-in-word");
    });

    test("should load with correct H1 in Italian", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text).toContain("Word");
      expect(text).toContain("DOCX");
      expect(text).toContain("Gratis");
    });

    test("should have correct meta title in Italian", async ({ page }) => {
      const title = await page.title();
      expect(title).toContain("Markdown in Word");
      expect(title).toContain("DOCX");
      expect(title).toContain("Gratis");
    });

    test("should have CTA link to Italian homepage", async ({ page }) => {
      const ctaLink = page.getByRole("link", { name: /Inizia a Convertire/ });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute("href", "/it");
    });

    test("should have FAQ section in Italian", async ({ page }) => {
      const faqHeading = page.getByRole("heading", { name: "Domande Frequenti" });
      await expect(faqHeading).toBeVisible();
    });

    test("should have Privacy section in Italian", async ({ page }) => {
      const privacyHeading = page.getByRole("heading", { name: "Privacy e Sicurezza" });
      await expect(privacyHeading).toBeVisible();
    });
  });
});
