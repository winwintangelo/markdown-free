/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @sparticuz/chromium-min to work on Vercel
  // See: https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
  },
};

module.exports = nextConfig;
