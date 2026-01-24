#!/usr/bin/env node

/**
 * IndexNow URL Submission Script
 * 
 * Submits URLs to search engines (Bing, Yandex, etc.) for fast indexing.
 * IndexNow is supported by Bing, Yandex, Seznam, and Naver.
 * 
 * Usage:
 *   node scripts/indexnow-submit.mjs [urls...]
 *   node scripts/indexnow-submit.mjs --all          # Submit all pages from sitemap
 *   node scripts/indexnow-submit.mjs --new          # Submit only new intent pages
 * 
 * Environment variables:
 *   INDEXNOW_KEY - Your IndexNow key (default: from key file)
 */

const SITE_HOST = "www.markdown.free";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "3074aa8265cdc58e5af0ded9f519972f";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// New pages that need indexing
const NEW_PAGES = [
  // FAQ pages
  "/faq",
  "/zh-Hant/faq",
  "/zh-Hans/faq",
  "/ja/faq",
  "/ko/faq",
  "/es/faq",
  "/it/faq",
  "/id/faq",
  "/vi/faq",
  // New intent pages
  "/github-readme-to-pdf",
  "/obsidian-markdown-to-pdf",
  "/markdown-to-pdf-no-watermark",
  "/markdown-to-pdf-online-free",
  // AI-utility pages
  "/chatgpt-to-pdf",
  "/claude-artifacts-to-pdf",
];

// All key pages for --all flag
const ALL_KEY_PAGES = [
  "/",
  "/faq",
  "/about",
  "/privacy",
  "/markdown-to-docx",
  "/readme-to-pdf",
  "/github-readme-to-pdf",
  "/obsidian-markdown-to-pdf",
  "/markdown-to-pdf-no-watermark",
  "/markdown-to-pdf-online-free",
  "/chatgpt-to-pdf",
  "/claude-artifacts-to-pdf",
  // Localized homepages
  "/zh-Hant",
  "/zh-Hans",
  "/ja",
  "/ko",
  "/es",
  "/it",
  "/id",
  "/vi",
  // Localized FAQ
  "/zh-Hant/faq",
  "/zh-Hans/faq",
  "/ja/faq",
  "/ko/faq",
  "/es/faq",
  "/it/faq",
  "/id/faq",
  "/vi/faq",
];

async function submitUrls(urls) {
  const fullUrls = urls.map(u => `https://${SITE_HOST}${u}`);
  
  console.log("📤 IndexNow URL Submission");
  console.log("==========================");
  console.log(`🔑 Key: ${INDEXNOW_KEY.slice(0, 8)}...`);
  console.log(`📄 URLs to submit: ${fullUrls.length}`);
  console.log("");

  // IndexNow API payload
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: fullUrls,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (response.status === 200 || response.status === 202) {
      console.log("✅ URLs submitted successfully!");
      console.log("");
      console.log("Submitted URLs:");
      fullUrls.forEach(url => console.log(`  - ${url}`));
    } else if (response.status === 400) {
      console.log("❌ Bad request - check URL format");
    } else if (response.status === 403) {
      console.log("❌ Key not valid or key file not accessible");
    } else if (response.status === 422) {
      console.log("❌ URLs don't belong to the host");
    } else if (response.status === 429) {
      console.log("⚠️ Too many requests - try again later");
    } else {
      const text = await response.text();
      console.log(`❌ Unexpected response: ${text}`);
    }
  } catch (error) {
    console.error("❌ Error submitting URLs:", error.message);
  }
}

// Parse command line args
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage:");
  console.log("  node scripts/indexnow-submit.mjs --new     # Submit new pages");
  console.log("  node scripts/indexnow-submit.mjs --all     # Submit all key pages");
  console.log("  node scripts/indexnow-submit.mjs /path1 /path2  # Submit specific paths");
  process.exit(0);
}

let urlsToSubmit = [];

if (args.includes("--new")) {
  urlsToSubmit = NEW_PAGES;
} else if (args.includes("--all")) {
  urlsToSubmit = ALL_KEY_PAGES;
} else {
  urlsToSubmit = args;
}

submitUrls(urlsToSubmit);
