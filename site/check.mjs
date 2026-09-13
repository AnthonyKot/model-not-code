import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { essays, chapters } from "./catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "docs");
const errors = [];

const buildAll = process.argv.includes("--all") || process.env.BUILD_ALL === "1";

// Mirror build.mjs's essay selection: status filter (or --all/BUILD_ALL) plus an
// existing essays/<slug>.md file. Only pages that were actually built are checked.
const builtEssays = essays.filter((essay) =>
  (buildAll || essay.status === "published") &&
  fs.existsSync(path.join(root, "essays", `${essay.slug}.md`))
);

const builtChapters = chapters.filter((chapter) =>
  (buildAll || chapter.status === "published") &&
  fs.existsSync(path.join(root, "chapters", `${chapter.slug}.md`))
);

const pages = [
  path.join(out, "index.html"),
  path.join(out, "about.html"),
  path.join(out, "old", "index.html"),
  ...builtChapters.map((c) => path.join(out, "chapters", `${c.slug}.html`)),
  ...builtEssays.map((e) => path.join(out, "old", "essays", `${e.slug}.html`)),
];
// Old essay URLs stay alive as redirects into the archive.
for (const essay of builtEssays) {
  const stub = path.join(out, "essays", `${essay.slug}.html`);
  if (!fs.existsSync(stub) || !fs.readFileSync(stub, "utf8").includes(`../old/essays/${essay.slug}.html`)) {
    errors.push(`essays/${essay.slug}.html does not redirect to the archive`);
  }
}

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

const documents = [
  ...builtEssays.map((e) => ({ ...e, html: path.join(out, "old", "essays", `${e.slug}.html`), md: path.join(root, "essays", `${e.slug}.md`) })),
  ...builtChapters.map((c) => ({ ...c, html: path.join(out, "chapters", `${c.slug}.html`), md: path.join(root, "chapters", `${c.slug}.md`) })),
];
for (const essay of documents) {
  const html = fs.readFileSync(essay.html, "utf8");
  const source = fs.readFileSync(essay.md, "utf8");
  if (source.match(/^# (.+)$/m)?.[1] !== essay.title) errors.push(`${essay.slug}: catalog title disagrees with the chapter`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${essay.slug}: expected one main heading`);
  const missions = (html.match(/class="mission"/g) || []).length;
  if (missions !== 1) errors.push(`${essay.slug} has ${missions} exercise sections`);
  if (!html.includes(`data-complete-mission="${essay.slug}"`)) errors.push(`${essay.slug} has no completion action`);
}

const publishedText = pages.map((page) => fs.readFileSync(page, "utf8")).join("\n");
const leakPatterns = [
  "/mnt/c/Users/",
  "resources/modern-software-engineering.pdf",
  "/home/diablo/udemy-subs",
  "resources/",
  "Telegram Desktop",
  "/mnt/c/",
];
const leaked = leakPatterns.find((pattern) => publishedText.includes(pattern));
if (leaked) errors.push(`A private source path leaked into the site ("${leaked}")`);

if (errors.length) {
  console.error("Site validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Site validation passed: ${pages.length} HTML pages (${builtChapters.length} chapters, ${builtEssays.length} archived essays), ${documents.length} exercise sections, local links resolved, no private source paths.`);
