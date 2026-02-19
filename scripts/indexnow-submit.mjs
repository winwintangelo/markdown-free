#!/usr/bin/env node

/**
 * IndexNow URL Submission Script
 *
 * Submits URLs to search engines (Bing, Yandex, Seznam, Naver) for fast indexing.
 *
 * Usage:
 *   npm run indexnow                            # Show help
 *   npm run indexnow:new                        # Submit recently changed pages
 *   npm run indexnow:all                        # Submit ALL pages from sitemap.xml
 *   node scripts/indexnow-submit.mjs /ja /ko    # Submit specific paths
 *
 * Environment variables:
 *   INDEXNOW_KEY - Your IndexNow key (default: from key file)
 */

import fs from 'fs';
import path from 'path';

const SITE_HOST = "www.markdown.free";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "3074aa8265cdc58e5af0ded9f519972f";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// ============================================================================
// Recently changed pages (update this when deploying significant changes)
// ============================================================================
const NEW_PAGES = [
  // All locale homepages (title dedup fix + Umami proxy - Feb 8)
  "/",
  "/ja",
  "/ko",
  "/it",
  "/es",
  "/zh-Hans",
  "/zh-Hant",
  "/id",
  "/vi",
  // FAQ pages (title fix)
  "/faq",
  "/ja/faq",
  "/ko/faq",
  "/it/faq",
  "/es/faq",
  // About/Privacy (brand added to title)
  "/about",
  "/privacy",
  "/ja/about",
  "/ja/privacy",
  "/ko/about",
  "/ko/privacy",
];

// ============================================================================
// Parse sitemap.xml to get ALL page URLs (used by --all)
// ============================================================================
function getAllUrlsFromSitemap() {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

  if (!fs.existsSync(sitemapPath)) {
    console.error("sitemap.xml not found at public/sitemap.xml");
    process.exit(1);
  }

  const xml = fs.readFileSync(sitemapPath, 'utf-8');
  const locRegex = /<loc>https:\/\/www\.markdown\.free(\/[^<]*)?<\/loc>/g;
  const urls = new Set();
  let match;

  while ((match = locRegex.exec(xml)) !== null) {
    urls.add(match[1] || "/");
  }

  return [...urls].sort();
}

// ============================================================================
// Submit URLs to IndexNow API
// ============================================================================
async function submitUrls(urls) {
  const fullUrls = urls.map(u => `https://${SITE_HOST}${u}`);

  console.log("IndexNow URL Submission");
  console.log("=======================");
  console.log(`Key: ${INDEXNOW_KEY.slice(0, 8)}...`);
  console.log(`URLs to submit: ${fullUrls.length}`);
  console.log("");

  // IndexNow allows max 10,000 URLs per request; batch at 100 for safety
  const BATCH_SIZE = 100;
  let totalSubmitted = 0;

  for (let i = 0; i < fullUrls.length; i += BATCH_SIZE) {
    const batch = fullUrls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(fullUrls.length / BATCH_SIZE);

    if (totalBatches > 1) {
      console.log(`Batch ${batchNum}/${totalBatches} (${batch.length} URLs)`);
    }

    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: batch,
    };

    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200 || response.status === 202) {
        totalSubmitted += batch.length;
        console.log(`  Submitted ${batch.length} URLs (${response.status})`);
      } else if (response.status === 400) {
        console.log("  Bad request - check URL format");
      } else if (response.status === 403) {
        console.log("  Key not valid or key file not accessible");
        console.log(`  Verify: https://${SITE_HOST}/${INDEXNOW_KEY}.txt`);
      } else if (response.status === 422) {
        console.log("  URLs don't belong to the host");
      } else if (response.status === 429) {
        console.log("  Too many requests - try again later");
        break;
      } else {
        const text = await response.text();
        console.log(`  Unexpected response (${response.status}): ${text}`);
      }
    } catch (error) {
      console.error(`  Error submitting:`, error.message);
    }

    // Small delay between batches
    if (i + BATCH_SIZE < fullUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log("");
  console.log(`Total: ${totalSubmitted}/${fullUrls.length} submitted`);
  console.log("");
  console.log("URLs:");
  fullUrls.forEach(url => console.log(`  ${url}`));
}

// ============================================================================
// CLI
// ============================================================================
const args = process.argv.slice(2);

if (args.length === 0) {
  const sitemapCount = getAllUrlsFromSitemap().length;
  console.log("IndexNow URL Submission");
  console.log("=======================");
  console.log("");
  console.log("Usage:");
  console.log("  npm run indexnow:new                     # Submit recently changed pages");
  console.log("  npm run indexnow:all                     # Submit ALL pages from sitemap.xml");
  console.log("  node scripts/indexnow-submit.mjs /path   # Submit specific paths");
  console.log("");
  console.log(`Recently changed (--new): ${NEW_PAGES.length} URLs`);
  console.log(`All sitemap pages (--all): ${sitemapCount} URLs`);
  process.exit(0);
}

let urlsToSubmit = [];

if (args.includes("--new")) {
  urlsToSubmit = NEW_PAGES;
} else if (args.includes("--all")) {
  urlsToSubmit = getAllUrlsFromSitemap();
} else {
  urlsToSubmit = args;
}

submitUrls(urlsToSubmit);
