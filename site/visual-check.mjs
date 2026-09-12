import { chromium } from "playwright";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { essays } from "./catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "docs");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const file = path.resolve(docs, relative);
  if (!file.startsWith(docs) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const base = process.env.SITE_URL || `http://127.0.0.1:${address.port}`;
const cachedChromium = "/home/diablo/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || (fs.existsSync(cachedChromium) ? cachedChromium : undefined);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const errors = [];

async function inspect(name, viewport, route, screenshot) {
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${name}: console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`${name}: pageerror: ${error.message}`));
  const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  if (!response?.ok()) errors.push(`${name}: HTTP ${response?.status()}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) errors.push(`${name}: horizontal overflow ${overflow}px`);
  await page.screenshot({ path: screenshot, fullPage: true });
  return page;
}

// Focused captures make long chapters readable during manual visual review.
if (process.argv.includes("--readability-snapshots")) {
  for (const [slug, selector, label] of [
    ["designing-electronics-that-work", "table", "electronics-table"],
    ["algorithmic-thinking", "pre", "algorithms-example"],
    ["web-hacking-arsenal", ".mission blockquote", "report-exercise"],
    ["modern-concurrency-in-java", ".essay-hero", "java-introduction"],
  ]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${base}/essays/${slug}.html`, { waitUntil: "networkidle" });
    await page.locator(selector).first().screenshot({ path: `/tmp/finish-first-${label}.png` });
    await page.close();
  }
  await browser.close();
  server.close();
  console.log("Readability snapshots saved in /tmp/finish-first-*.png");
  process.exit(0);
}

const desktop = await inspect("desktop home", { width: 1440, height: 1000 }, "/", "/tmp/finish-first-home-desktop.png");
if (await desktop.locator(".shelf-card").count() !== essays.length) errors.push(`desktop home: expected ${essays.length} shelf cards`);
await desktop.close();

const article = await inspect("desktop essay", { width: 1440, height: 1000 }, "/essays/software-architecture-hard-parts.html", "/tmp/finish-first-essay-desktop.png");
if (await article.locator(".mission").count() !== 1) errors.push("desktop essay: mission missing");
await article.locator("[data-complete-mission]").click();
if ((await article.locator("[data-complete-mission]").getAttribute("aria-pressed")) !== "true") errors.push("desktop essay: completion did not persist in UI");
await article.close();

const selectedSlugs = process.argv.find((argument) => argument.startsWith("--slugs="))?.slice(8).split(",");
if (selectedSlugs?.some((slug) => !essays.some((essay) => essay.slug === slug))) throw new Error("Unknown chapter in --slugs");
const additions = essays.map((essay) => essay.slug).filter((slug) => !selectedSlugs || selectedSlugs.includes(slug));
for (const slug of additions) {
  const index = essays.findIndex((essay) => essay.slug === slug);
  for (const [size, viewport] of Object.entries({ desktop: { width: 1440, height: 1000 }, mobile: { width: 390, height: 844 } })) {
    const name = `${size} ${slug}`;
    const page = await inspect(name, viewport, `/essays/${slug}.html`, `/tmp/finish-first-${slug}-${size}.png`);
    if (await page.locator(".mission").count() !== 1) errors.push(`${name}: expected one mission`);
    if (await page.locator("h1").count() !== 1) errors.push(`${name}: expected one title`);
    const sourceSummary = page.locator(".source-notes summary");
    await sourceSummary.focus();
    await page.keyboard.press("Enter");
    if (await page.locator(".source-notes").getAttribute("open") === null) errors.push(`${name}: source notes did not open with the keyboard`);
    if (size === "mobile") {
      const tables = page.locator(".table-scroll");
      for (const table of await tables.all()) {
        if (await table.evaluate((node) => node.scrollWidth > node.clientWidth)) {
          await table.focus();
          await page.keyboard.press("ArrowRight");
          await page.waitForTimeout(150);
          if (await table.evaluate((node) => node.scrollLeft) === 0) errors.push(`${name}: wide table does not scroll with the keyboard`);
        }
      }
    }
    const button = page.locator(`[data-complete-mission="${slug}"]`);
    await button.click();
    await page.reload({ waitUntil: "networkidle" });
    if (await button.getAttribute("aria-pressed") !== "true") errors.push(`${name}: completion lost on reload`);
    const previous = essays[index - 1];
    const next = essays[index + 1];
    const expectedLinks = [previous && `${previous.slug}.html`, next ? `${next.slug}.html` : "../index.html"].filter(Boolean);
    const links = await page.locator(".essay-pager a").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    if (JSON.stringify(links) !== JSON.stringify(expectedLinks)) errors.push(`${name}: adjacent navigation is incorrect`);
    if (size === "mobile") {
      await page.locator(".source-notes summary").click();
      await page.locator(".source-notes > a").click();
      if (!page.url().endsWith(`/reviews/${slug}.html`)) errors.push(`${name}: source review link is incorrect`);
      if (await page.locator("h1").count() !== 1) errors.push(`${name}: source review needs one main heading`);
      if (await page.locator(".review-prose code.language-json").count()) errors.push(`${name}: internal catalog JSON leaked into source review`);
      const reviewOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (reviewOverflow > 1) errors.push(`${name}: source review has horizontal overflow ${reviewOverflow}px`);
    }
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    if (await page.locator(`[data-mission-card="${slug}"] .shelf-card__status`).textContent() !== "Exercise done") errors.push(`${name}: shelf lost mission state`);
    if (await page.locator("[data-progress-summary]").textContent() !== `1 of ${essays.length} exercises`) errors.push(`${name}: progress count is incorrect`);
    await page.close();
  }
}

const mobile = await inspect("mobile home", { width: 390, height: 844 }, "/", "/tmp/finish-first-home-mobile.png");
await mobile.locator("[data-menu-button]").click();
if ((await mobile.locator("[data-menu-button]").getAttribute("aria-expanded")) !== "true") errors.push("mobile home: menu did not open");
await mobile.waitForTimeout(300);
const menuBox = await mobile.locator("[data-book-nav]").boundingBox();
if (!menuBox || menuBox.x >= 390 || menuBox.x + menuBox.width <= 0) errors.push("mobile home: open menu is outside the viewport");
await mobile.screenshot({ path: "/tmp/finish-first-menu-mobile.png" });
await mobile.close();

await browser.close();
server.close();
if (errors.length) {
  console.error("Visual check failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Visual check passed: ${additions.length} essays on desktop/mobile, keyboard disclosures and tables, source review routes, completion persistence, adjacent navigation, and mobile menu.`);
