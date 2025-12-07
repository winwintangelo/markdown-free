/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @sparticuz/chromium to work on Vercel
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium"],
  },
  // Exclude puppeteer packages from webpack bundling
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these packages as external - they should not be bundled
      config.externals = config.externals || [];
      config.externals.push({
        "@sparticuz/chromium": "commonjs @sparticuz/chromium",
        "puppeteer-core": "commonjs puppeteer-core",
      });
    }
    return config;
  },
};

module.exports = nextConfig;
