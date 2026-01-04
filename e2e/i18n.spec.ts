import { test, expect } from "@playwright/test";

test.describe("Markdown Free - Internationalization", () => {
  test.describe("Locale Routes", () => {
    test("English (default) page loads with English content", async ({ page }) => {
      await page.goto("/");
      
      // Check HTML lang attribute
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("en");
      
      // Check English content
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown to PDF");
      await expect(page.getByText("Free • No signup • Instant export")).toBeVisible();
    });

    test("Italian page (/it) loads with Italian content", async ({ page }) => {
      await page.goto("/it");
      
      // Check HTML lang attribute
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("it");
      
      // Check Italian content
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown a PDF");
      await expect(page.getByText("Gratis • Senza account")).toBeVisible();
    });

    test("Spanish page (/es) loads with Spanish content", async ({ page }) => {
      await page.goto("/es");

      // Check HTML lang attribute
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("es");

      // Check Spanish content
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown a PDF");
      await expect(page.getByText("Gratis • Sin cuenta")).toBeVisible();
    });

    test("Japanese page (/ja) loads with Japanese content", async ({ page }) => {
      await page.goto("/ja");

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("ja");

      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown");
      await expect(page.getByText("無料 • 登録不要")).toBeVisible();
    });

    test("Korean page (/ko) loads with Korean content", async ({ page }) => {
      await page.goto("/ko");

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("ko");

      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown");
      await expect(page.getByText("무료 • 가입 불필요")).toBeVisible();
    });

    test("Simplified Chinese page (/zh-Hans) loads with Chinese content", async ({ page }) => {
      await page.goto("/zh-Hans");

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("zh-Hans");

      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown");
      await expect(page.getByText("免费 • 无需注册")).toBeVisible();
    });

    test("Traditional Chinese page (/zh-Hant) loads with Chinese content", async ({ page }) => {
      await page.goto("/zh-Hant");

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("zh-Hant");

      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown");
      await expect(page.getByText("免費 • 無需註冊")).toBeVisible();
    });

    test("Indonesian page (/id) loads with Indonesian content", async ({ page }) => {
      await page.goto("/id");

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("id");

      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown");
      await expect(page.getByText("Gratis • Tanpa daftar")).toBeVisible();
    });

    test("Vietnamese page (/vi) loads with Vietnamese content", async ({ page }) => {
      await page.goto("/vi");

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("vi");

      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown");
      await expect(page.getByText("Miễn phí • Không cần đăng ký")).toBeVisible();
    });
  });

  test.describe("Localized About Pages", () => {
    test("English About page loads correctly", async ({ page }) => {
      await page.goto("/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("About Markdown Free");
    });

    test("Italian About page loads correctly", async ({ page }) => {
      await page.goto("/it/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Chi Siamo");
    });

    test("Spanish About page loads correctly", async ({ page }) => {
      await page.goto("/es/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Acerca de Markdown Free");
    });

    test("Japanese About page loads correctly", async ({ page }) => {
      await page.goto("/ja/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown Free について");
    });

    test("Korean About page loads correctly", async ({ page }) => {
      await page.goto("/ko/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown Free 소개");
    });

    test("Simplified Chinese About page loads correctly", async ({ page }) => {
      await page.goto("/zh-Hans/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("关于 Markdown Free");
    });

    test("Traditional Chinese About page loads correctly", async ({ page }) => {
      await page.goto("/zh-Hant/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("關於 Markdown Free");
    });

    test("Indonesian About page loads correctly", async ({ page }) => {
      await page.goto("/id/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Tentang Markdown Free");
    });

    test("Vietnamese About page loads correctly", async ({ page }) => {
      await page.goto("/vi/about");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Giới thiệu Markdown Free");
    });
  });

  test.describe("Localized Privacy Pages", () => {
    test("English Privacy page loads correctly", async ({ page }) => {
      await page.goto("/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy Policy");
    });

    test("Italian Privacy page loads correctly", async ({ page }) => {
      await page.goto("/it/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Informativa sulla Privacy");
    });

    test("Spanish Privacy page loads correctly", async ({ page }) => {
      await page.goto("/es/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Política de Privacidad");
    });

    test("Japanese Privacy page loads correctly", async ({ page }) => {
      await page.goto("/ja/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("プライバシーポリシー");
    });

    test("Korean Privacy page loads correctly", async ({ page }) => {
      await page.goto("/ko/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("개인정보 처리방침");
    });

    test("Simplified Chinese Privacy page loads correctly", async ({ page }) => {
      await page.goto("/zh-Hans/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("隐私政策");
    });

    test("Traditional Chinese Privacy page loads correctly", async ({ page }) => {
      await page.goto("/zh-Hant/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("隱私政策");
    });

    test("Indonesian Privacy page loads correctly", async ({ page }) => {
      await page.goto("/id/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Kebijakan Privasi");
    });

    test("Vietnamese Privacy page loads correctly", async ({ page }) => {
      await page.goto("/vi/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Chính sách Bảo mật");
    });
  });

  test.describe("Language Switcher", () => {
    test("language switcher is visible in header", async ({ page }) => {
      await page.goto("/");
      
      // Desktop view - language switcher should be visible
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page.getByRole("button", { name: /English/ })).toBeVisible();
    });

    test("language switcher dropdown opens and shows options", async ({ page }) => {
      await page.goto("/");
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Click the language switcher
      await page.getByRole("button", { name: /English/ }).click();
      
      // Check dropdown options
      await expect(page.getByRole("button", { name: "Italiano" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Español" })).toBeVisible();
    });

    test("clicking Italian in switcher navigates to /it", async ({ page }) => {
      await page.goto("/");
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Click the language switcher
      await page.getByRole("button", { name: /English/ }).click();
      
      // Click Italian
      await page.getByRole("button", { name: "Italiano" }).click();
      
      // Should navigate to Italian page
      await expect(page).toHaveURL("/it");
      
      // Content should be Italian
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("it");
    });

    test("clicking Spanish in switcher navigates to /es", async ({ page }) => {
      await page.goto("/");
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Click the language switcher
      await page.getByRole("button", { name: /English/ }).click();
      
      // Click Spanish
      await page.getByRole("button", { name: "Español" }).click();
      
      // Should navigate to Spanish page
      await expect(page).toHaveURL("/es");
      
      // Content should be Spanish
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("es");
    });

    test("language preference is saved to localStorage", async ({ page }) => {
      await page.goto("/");
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Click the language switcher
      await page.getByRole("button", { name: /English/ }).click();
      
      // Click Italian
      await page.getByRole("button", { name: "Italiano" }).click();
      
      // Wait for navigation
      await expect(page).toHaveURL("/it");
      
      // Check localStorage
      const preferredLocale = await page.evaluate(() => localStorage.getItem("preferred-locale"));
      expect(preferredLocale).toBe("it");
    });
  });

  test.describe("SEO", () => {
    test("hreflang tags are present on English page", async ({ page }) => {
      await page.goto("/");
      
      // Check for hreflang links
      const hreflangEn = await page.locator('link[hreflang="en"]').getAttribute("href");
      const hreflangIt = await page.locator('link[hreflang="it"]').getAttribute("href");
      const hreflangEs = await page.locator('link[hreflang="es"]').getAttribute("href");
      const hreflangXDefault = await page.locator('link[hreflang="x-default"]').getAttribute("href");
      
      expect(hreflangEn).toContain("/");
      expect(hreflangIt).toContain("/it");
      expect(hreflangEs).toContain("/es");
      expect(hreflangXDefault).toBeTruthy();
    });

    test("canonical is self-referential on Italian page", async ({ page }) => {
      await page.goto("/it");
      
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toContain("/it");
    });

    test("canonical is self-referential on Spanish page", async ({ page }) => {
      await page.goto("/es");
      
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toContain("/es");
    });

    test("sitemap includes localized URLs", async ({ page }) => {
      const response = await page.goto("/sitemap.xml");
      expect(response?.status()).toBe(200);
      
      const content = await response?.text();
      expect(content).toContain("https://www.markdown.free/");
      expect(content).toContain("https://www.markdown.free/it");
      expect(content).toContain("https://www.markdown.free/es");
      expect(content).toContain("hreflang");
    });
  });

  test.describe("No Forced Redirects", () => {
    test("visiting /it directly works without redirect", async ({ page }) => {
      // Directly navigate to Italian page
      const response = await page.goto("/it");
      
      // Should not redirect (status 200, not 30x)
      expect(response?.status()).toBe(200);
      
      // URL should remain /it
      expect(page.url()).toContain("/it");
    });

    test("visiting /es directly works without redirect", async ({ page }) => {
      // Directly navigate to Spanish page
      const response = await page.goto("/es");
      
      // Should not redirect (status 200, not 30x)
      expect(response?.status()).toBe(200);
      
      // URL should remain /es
      expect(page.url()).toContain("/es");
    });

    test("shared links open in the URL's language", async ({ page }) => {
      // Simulate opening a shared Italian link
      await page.goto("/it/about");
      
      // Should stay on Italian page
      await expect(page).toHaveURL("/it/about");
      
      // Content should be Italian
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Chi Siamo");
    });
  });

  test.describe("UI Translations", () => {
    test("upload card text is translated in Italian", async ({ page }) => {
      await page.goto("/it");
      
      // Check Italian upload text
      await expect(page.getByText("Trascina e rilascia")).toBeVisible();
      await expect(page.getByText("Prova un file di esempio")).toBeVisible();
    });

    test("export buttons are translated in Spanish", async ({ page }) => {
      await page.goto("/es");
      
      // Check Spanish export button text
      await expect(page.getByRole("button", { name: "A PDF" })).toBeVisible();
      await expect(page.getByRole("button", { name: "A TXT" })).toBeVisible();
      await expect(page.getByRole("button", { name: "A HTML" })).toBeVisible();
    });

    test("header navigation is translated in Italian", async ({ page }) => {
      await page.goto("/it");
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Check Italian navigation (desktop nav only, first match)
      const desktopNav = page.locator("header nav").first();
      await expect(desktopNav.getByRole("link", { name: "Chi Siamo" })).toBeVisible();
      await expect(desktopNav.getByRole("link", { name: "Privacy" })).toBeVisible();
    });
  });

  test.describe("Italian Intent Pages", () => {
    test("convertire-markdown-pdf page loads correctly", async ({ page }) => {
      await page.goto("/it/convertire-markdown-pdf");
      
      // Check page title
      await expect(page).toHaveTitle(/Convertire Markdown in PDF Gratis/);
      
      // Check main heading
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Convertire Markdown in PDF Gratis");
      
      // Check CTA button (first one)
      await expect(page.getByRole("link", { name: "Inizia Ora — È Gratis" })).toBeVisible();
      
      // Check key sections
      await expect(page.getByRole("heading", { name: "Come Funziona" })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Perché Scegliere/ })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Domande Frequenti" })).toBeVisible();
    });

    test("markdown-pdf-senza-registrazione page loads correctly", async ({ page }) => {
      await page.goto("/it/markdown-pdf-senza-registrazione");
      
      // Check page title
      await expect(page).toHaveTitle(/Senza Registrazione/);
      
      // Check main heading
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Senza Registrazione");
      
      // Check CTA button
      await expect(page.getByRole("link", { name: /Converti Ora|Nessun Login/ })).toBeVisible();
      
      // Check privacy promise section
      await expect(page.getByText("Nessun account richiesto")).toBeVisible();
    });

    test("convertire-readme-pdf page loads correctly", async ({ page }) => {
      await page.goto("/it/convertire-readme-pdf");
      
      // Check page title
      await expect(page).toHaveTitle(/README.*PDF/);
      
      // Check main heading
      await expect(page.getByRole("heading", { level: 1 })).toContainText("README");
      
      // Check CTA button
      await expect(page.getByRole("link", { name: /Converti il Tuo README/ })).toBeVisible();
      
      // Check GFM features list
      await expect(page.getByText("Supporto Completo per GitHub Flavored Markdown")).toBeVisible();
    });

    test("Italian intent pages are not accessible from other locales", async ({ page }) => {
      // These pages should 404 when accessed with /en or /es prefix
      const response = await page.goto("/es/convertire-markdown-pdf");
      expect(response?.status()).toBe(404);
    });

    test("Italian intent pages have correct canonical URLs", async ({ page }) => {
      await page.goto("/it/convertire-markdown-pdf");
      
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toContain("/it/convertire-markdown-pdf");
    });
  });

  test.describe("Spanish Intent Pages", () => {
    test("convertir-markdown-pdf page loads correctly", async ({ page }) => {
      await page.goto("/es/convertir-markdown-pdf");
      
      // Check page title
      await expect(page).toHaveTitle(/Convertir Markdown a PDF Gratis/);
      
      // Check main heading
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Convertir Markdown a PDF Gratis");
      
      // Check CTA button
      await expect(page.getByRole("link", { name: "Comenzar Ahora — Es Gratis" })).toBeVisible();
      
      // Check key sections
      await expect(page.getByRole("heading", { name: "Cómo Funciona" })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Por Qué Elegir/ })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Preguntas Frecuentes" })).toBeVisible();
    });

    test("markdown-pdf-sin-registro page loads correctly", async ({ page }) => {
      await page.goto("/es/markdown-pdf-sin-registro");
      
      // Check page title
      await expect(page).toHaveTitle(/Sin Registro/);
      
      // Check main heading
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Sin Registro");
      
      // Check CTA button
      await expect(page.getByRole("link", { name: /Convertir Ahora/ })).toBeVisible();
      
      // Check privacy promise section
      await expect(page.getByText("Sin cuenta requerida")).toBeVisible();
    });

    test("convertir-readme-pdf page loads correctly", async ({ page }) => {
      await page.goto("/es/convertir-readme-pdf");
      
      // Check page title
      await expect(page).toHaveTitle(/README.*PDF/);
      
      // Check main heading
      await expect(page.getByRole("heading", { level: 1 })).toContainText("README");
      
      // Check CTA button
      await expect(page.getByRole("link", { name: /Convierte Tu README/ })).toBeVisible();
      
      // Check GFM features list
      await expect(page.getByText("Soporte Completo para GitHub Flavored Markdown")).toBeVisible();
    });

    test("Spanish intent pages are not accessible from other locales", async ({ page }) => {
      // These pages should 404 when accessed with /it prefix
      const response = await page.goto("/it/convertir-markdown-pdf");
      expect(response?.status()).toBe(404);
    });

    test("Spanish intent pages have correct canonical URLs", async ({ page }) => {
      await page.goto("/es/convertir-markdown-pdf");
      
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toContain("/es/convertir-markdown-pdf");
    });
  });

  test.describe("Comparison Pages", () => {
    test("Italian comparison page loads correctly", async ({ page }) => {
      await page.goto("/it/confronto-convertitori-markdown");
      
      // Check page title
      await expect(page).toHaveTitle(/Markdown Free vs CloudConvert/);
      
      // Check main heading
      await expect(page.getByRole("heading", { level: 1 })).toContainText("vs Altri Convertitori");
      
      // Check comparison table exists
      await expect(page.locator("table")).toBeVisible();
      
      // Check key comparison points in table
      await expect(page.locator("table").getByText("100% Gratuito")).toBeVisible();
      await expect(page.locator("table").getByText("Senza Registrazione")).toBeVisible();
      
      // Check CTA
      await expect(page.getByRole("link", { name: "Prova Markdown Free" })).toBeVisible();
    });

    test("Spanish comparison page loads correctly", async ({ page }) => {
      await page.goto("/es/comparacion-convertidores-markdown");
      
      // Check page title
      await expect(page).toHaveTitle(/Markdown Free vs CloudConvert/);
      
      // Check main heading
      await expect(page.getByRole("heading", { level: 1 })).toContainText("vs Otros Convertidores");
      
      // Check comparison table exists
      await expect(page.locator("table")).toBeVisible();
      
      // Check key comparison points in table
      await expect(page.locator("table").getByText("100% Gratis")).toBeVisible();
      await expect(page.locator("table").getByText("Sin Registro")).toBeVisible();
      
      // Check CTA
      await expect(page.getByRole("link", { name: "Prueba Markdown Free" })).toBeVisible();
    });

    test("comparison pages are locale-specific", async ({ page }) => {
      // Italian comparison page should 404 on Spanish locale
      const response = await page.goto("/es/confronto-convertitori-markdown");
      expect(response?.status()).toBe(404);
    });
  });
});

