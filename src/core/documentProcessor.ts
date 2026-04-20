import fs from "fs-extra";
import { marked } from "marked";
import puppeteer from "puppeteer";

export async function generatePDF(markdownPath: string, outputPath: string) {
  const markdown = await fs.readFile(markdownPath, "utf-8");
  const htmlContent = await marked(markdown);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const styledHtml = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 50px; line-height: 1.6; color: #333; }
          h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
          h2 { color: #2c5282; margin-top: 30px; }
          code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
          pre { background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
          blockquote { border-left: 5px solid #1a365d; padding-left: 20px; color: #555; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `;

  await page.setContent(styledHtml);
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
  });
  await browser.close();
}
