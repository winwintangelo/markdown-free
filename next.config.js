/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @sparticuz/chromium to work on Vercel
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these packages - they need to be resolved at runtime
      config.externals = [...(config.externals || []), "@sparticuz/chromium"];
    }
    return config;
  },
};

module.exports = nextConfig;
