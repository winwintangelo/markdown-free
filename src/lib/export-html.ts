import { downloadFile, generateFilename } from "./download";

/**
 * Minimal CSS styles extracted from Tailwind prose classes
 * This ensures exported HTML matches the preview styling
 */
const EMBEDDED_STYLES = `
/* Base styles */
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.25;
}
h1 { font-size: 1.5rem; }
h2 { font-size: 1.25rem; }
h3 { font-size: 1.125rem; }

/* Paragraphs */
p {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

/* Links */
a {
  color: #059669;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* Lists */
ul, ol {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}
li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

/* Code */
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
  background-color: rgba(2, 6, 23, 0.9);
  color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

/* Blockquotes */
blockquote {
  border-left: 4px solid #e2e8f0;
  margin: 1rem 0;
  padding-left: 1rem;
  color: #64748b;
  font-style: italic;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}
th, td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
th {
  background-color: #f8fafc;
  font-weight: 600;
}

/* Horizontal rule */
hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2rem 0;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
}
`.trim();

/**
 * Generate HTML template with embedded styles
 */
function generateHtmlTemplate(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
${EMBEDDED_STYLES}
  </style>
</head>
<body>
  <article class="markdown-body">
${content}
  </article>
</body>
</html>`;
}

/**
 * Escape HTML special characters for use in title
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Export rendered HTML as a standalone HTML file
 */
export function exportHtml(
  renderedHtml: string,
  originalFilename: string | null
): void {
  const filename = generateFilename(originalFilename, "html");
  const title = originalFilename
    ? originalFilename.replace(/\.(md|markdown|txt)$/i, "")
    : "Markdown Document";
  
  const fullHtml = generateHtmlTemplate(title, renderedHtml);
  downloadFile(fullHtml, filename, "text/html;charset=utf-8");
}

