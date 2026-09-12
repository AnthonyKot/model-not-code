import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { essays, skips } from "./catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "docs");
const errors = [];
const pages = [path.join(out, "index.html"), ...essays.map((e) => path.join(out, "essays", `${e.slug}.html`)), ...[...essays, ...skips].map((e) => path.join(out, "reviews", `${e.slug}.html`))];

for (const page of pages) {
  if (!fs.existsSync(page)) { errors.push(`Missing ${path.relative(root, page)}`); continue; }
  const html = fs.readFileSync(page, "utf8");
  if (!/<main id="main"/.test(html)) errors.push(`${path.relative(root, page)} has no main landmark`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${path.relative(root, page)} has no title`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|data:|#|mailto:)/.test(target)) continue;
    const clean = target.split("#", 1)[0];
    if (!clean) continue;
    const resolved = path.resolve(path.dirname(page), clean);
    if (!fs.existsSync(resolved)) errors.push(`${path.relative(root, page)} → missing ${target}`);
  }
}

for (const essay of essays) {
  const html = fs.readFileSync(path.join(out, "essays", `${essay.slug}.html`), "utf8");
  const source = fs.readFileSync(path.join(root, "essays", `${essay.slug}.md`), "utf8");
  if (source.match(/^# (.+)$/m)?.[1] !== essay.title) errors.push(`${essay.slug}: catalog title disagrees with the chapter`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${essay.slug}: expected one main heading`);
  const missions = (html.match(/class="mission"/g) || []).length;
  if (missions !== 1) errors.push(`${essay.slug} has ${missions} exercise sections`);
  if (!html.includes(`data-complete-mission="${essay.slug}"`)) errors.push(`${essay.slug} has no completion action`);
}

const publishedText = pages.map((page) => fs.readFileSync(page, "utf8")).join("\n");
if (publishedText.includes("/mnt/c/Users/") || publishedText.includes("resources/modern-software-engineering.pdf")) errors.push("A private source path leaked into the site");

if (errors.length) {
  console.error("Site validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Site validation passed: ${pages.length} HTML pages, ${essays.length} exercise sections, local links resolved, no private source paths.`);
