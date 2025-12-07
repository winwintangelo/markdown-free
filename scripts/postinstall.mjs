import { execSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

async function main() {
  try {
    console.log("📦 Starting postinstall script...");

    // Find chromium package in node_modules
    const chromiumDir = resolve(projectRoot, "node_modules/@sparticuz/chromium");
    const binDir = join(chromiumDir, "bin");

    console.log("   Looking for chromium at:", chromiumDir);
    console.log("   Bin directory:", binDir);

    if (!existsSync(binDir)) {
      console.log(
        "⚠️  Chromium bin directory not found, skipping archive creation"
      );
      console.log("   This is expected in production builds (Vercel)");
      return;
    }

    // Create tar archive in public folder
    const publicDir = join(projectRoot, "public");
    const outputPath = join(publicDir, "chromium-pack.tar");

    console.log("📦 Creating chromium tar archive...");
    console.log("   Source:", binDir);
    console.log("   Output:", outputPath);

    // Tar the contents of bin/ directly (without bin prefix)
    execSync(`mkdir -p "${publicDir}" && tar -cf "${outputPath}" -C "${binDir}" .`, {
      stdio: "inherit",
      cwd: projectRoot,
    });

    console.log("✅ Chromium archive created successfully!");
  } catch (error) {
    console.error("❌ Failed to create chromium archive:", error.message);
    console.log("⚠️  This is not critical for local development");
    process.exit(0); // Don't fail the install
  }
}

main();
