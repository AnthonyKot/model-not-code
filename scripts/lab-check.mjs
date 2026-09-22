// Headless-browser check of a reworked chapter and its lab page (STORY-MAP §5 step 1).
//
//   npm run build && node scripts/lab-check.mjs <slug> [screenshot-dir]
//
// Serves docs/ locally, opens docs/labs/<slug>.html, clicks "Mark exercise complete",
// and confirms the progress count and the chapter's entry in the contents both change;
// then opens the chapter page, checks the folds and the "Open the lab" block, and takes
// screenshots (desktop: lab top, lab button, first fold closed and open, lab block;
// phone: the chapter mid-page). Prints one JSON line; any console error fails it.
// Uses the project's Playwright and the cached Chromium headless shell.
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const slug = process.argv[2];
if (!slug) { console.error("usage: node scripts/lab-check.mjs <slug> [screenshot-dir]"); process.exit(2); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "docs");
const out = process.argv[3] || path.join(os.tmpdir(), "book20-lab-check", slug);
fs.mkdirSync(out, { recursive: true });

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\//, "") || "index.html";
  const file = path.resolve(docs, rel);
  if (!file.startsWith(docs) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return void res.writeHead(404).end();
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

// Playwright's browser download may be a different build than the one cached; fall back to any cached shell.
const cache = path.join(os.homedir(), ".cache", "ms-playwright");
const shells = fs.existsSync(cache) ? fs.readdirSync(cache).filter((d) => d.startsWith("chromium_headless_shell-")).sort() : [];
const executablePath = shells.length ? path.join(cache, shells[shells.length - 1], "chrome-headless-shell-linux64", "chrome-headless-shell") : undefined;
const browser = await chromium.launch({ headless: true, ...(executablePath && fs.existsSync(executablePath) ? { executablePath } : {}) });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto(`${base}/labs/${slug}.html`);
await page.screenshot({ path: `${out}/lab-top.png` });
await page.click("[data-complete-mission]");
const summary = await page.textContent("[data-progress-summary]");
const button = await page.textContent("[data-complete-mission]");
await page.locator("[data-mission-action]").scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}/lab-button.png` });

await page.goto(`${base}/chapters/${slug}.html`);
const navTicked = await page.evaluate((s) => document.querySelector(`[data-mission-link="${s}"]`)?.classList.contains("is-complete") ?? false, slug);
const chapterSummary = await page.textContent("[data-progress-summary]");
const folds = await page.locator("article.prose details").count();
const missionsOnChapter = await page.locator("article.prose .mission").count();
const labBlock = await page.locator(".lab-action a[href$='" + `labs/${slug}.html` + "']").count();
if (folds) {
  await page.locator("article.prose details").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${out}/fold-closed.png` });
  await page.locator("article.prose details").first().click();
  await page.screenshot({ path: `${out}/fold-open.png` });
}
await page.locator(".lab-action").scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}/lab-block.png` });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/chapters/${slug}.html`);
await page.evaluate(() => scrollTo(0, 3000));
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/phone.png` });

const result = { slug, summary, button, navTicked, chapterSummary, folds, missionsOnChapter, labBlock, errors, screenshots: out };
console.log(JSON.stringify(result));
await browser.close();
server.close();
const ok = summary.startsWith("1 of") && navTicked && missionsOnChapter === 0 && labBlock === 1 && errors.length === 0;
process.exit(ok ? 0 : 1);
