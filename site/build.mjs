import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { meta, parts, courses, essays, skips } from "./catalog.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = path.join(root, "docs");

const buildAll = process.argv.includes("--all") || process.env.BUILD_ALL === "1";

// An essay is built when its status says so (or --all / BUILD_ALL overrides the status
// filter) AND essays/<slug>.md actually exists on disk. Most catalog entries are still
// "pitched" with no file yet — those are skipped, never an error.
const builtEssays = essays.filter((essay) =>
  (buildAll || essay.status === "published") &&
  fs.existsSync(path.join(root, "essays", `${essay.slug}.md`))
);
const partsById = Object.fromEntries(parts.map((part) => [part.id, part]));

fs.rmSync(out, { recursive: true, force: true });
for (const directory of [out, path.join(out, "essays"), path.join(out, "assets")]) {
  fs.mkdirSync(directory, { recursive: true });
}
if (skips.length) fs.mkdirSync(path.join(out, "reviews"), { recursive: true });

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

// -- resources/MANIFEST.tsv: key -> {kind, path, size_mb, pages, title, edition_note} ------
function loadManifest() {
  const file = path.join(root, "resources", "MANIFEST.tsv");
  if (!fs.existsSync(file)) return {};
  const lines = fs.readFileSync(file, "utf8").split("\n").filter((line) => line.trim());
  const [header, ...rows] = lines;
  const columns = header.split("\t");
  const byKey = {};
  for (const row of rows) {
    const cells = row.split("\t");
    const record = Object.fromEntries(columns.map((column, index) => [column, cells[index] ?? ""]));
    byKey[record.key] = record;
  }
  return byKey;
}
const manifest = loadManifest();

// Convert ["07-01","07-02","07-06"] into "lectures 7.1–7.2, 7.6" — sorted, consecutive
// lectures within the same chapter collapsed into a range.
function formatLectures(lectures) {
  const parsed = lectures
    .map((token) => {
      const [chapter, lecture] = token.split("-").map((part) => parseInt(part, 10));
      return { chapter, lecture };
    })
    .sort((a, b) => a.chapter - b.chapter || a.lecture - b.lecture);
  const groups = [];
  for (const item of parsed) {
    const last = groups[groups.length - 1];
    if (last && last.chapter === item.chapter && item.lecture === last.end + 1) {
      last.end = item.lecture;
    } else {
      groups.push({ chapter: item.chapter, start: item.lecture, end: item.lecture });
    }
  }
  const formatted = groups.map((group) =>
    group.start === group.end
      ? `${group.chapter}.${group.start}`
      : `${group.chapter}.${group.start}–${group.chapter}.${group.end}`
  );
  const word = lectures.length === 1 ? "lecture" : "lectures";
  return `${word} ${formatted.join(", ")}`;
}

function sourceLine(source) {
  if (source.kind === "course") {
    const course = courses[source.course];
    if (!course) return `course ${escapeHtml(source.course)}, ${formatLectures(source.lectures)}`;
    let line = `<em>${escapeHtml(course.title)}</em> (Udemy, ${escapeHtml(course.by)}), ${formatLectures(source.lectures)}`;
    if (course.note) line += ` — ${escapeHtml(course.note)}`;
    return line;
  }
  if (source.kind === "book") {
    const record = manifest[source.key];
    const title = record ? record.title : source.key;
    return source.pages ? `${escapeHtml(title)}, ${escapeHtml(source.pages)}` : escapeHtml(title);
  }
  if (source.kind === "paper") {
    return source.section ? `${escapeHtml(source.id)}, ${escapeHtml(source.section)}` : escapeHtml(source.id);
  }
  return "";
}

function sourceNotes(essay) {
  const items = essay.sources.map((source) => `<li>${sourceLine(source)}</li>`).join("");
  const caution = essay.caution ? `<p>${escapeHtml(essay.caution)}</p>` : "";
  return `<details class="source-notes"><summary>Sources and limits</summary><ul>${items}</ul>${caution}</details>`;
}

const renderer = new marked.Renderer();
renderer.table = function (token) {
  const table = marked.Renderer.prototype.table.call(this, token);
  if (token.header.length <= 3) return table;
  return `<div class="table-scroll" role="region" aria-label="Comparison table; scroll horizontally if needed" tabindex="0">${table}</div><p class="table-hint">Scroll the table sideways to see all columns.</p>`;
};
renderer.heading = function ({ tokens, depth }) {
  const rendered = this.parser.parseInline(tokens);
  const text = rendered.replace(/<[^>]+>/g, "");
  const id = slugify(text);
  return `<h${depth} id="${id}">${rendered}</h${depth}>\n`;
};
renderer.link = function ({ href, title, tokens }) {
  const destination = /^essays\/.*\.md$/.test(href) ? href.replace(/\.md$/, ".html") : href;
  const external = /^https?:\/\//.test(destination);
  const attributes = `${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noreferrer"' : ""}`;
  return `<a href="${escapeHtml(destination)}"${attributes}>${this.parser.parseInline(tokens)}</a>`;
};

marked.setOptions({ gfm: true, renderer });

function renderMarkdown(markdown) {
  return marked.parse(markdown);
}

function navItems(prefix, activeSlug = "") {
  return builtEssays.map((essay, index) => `
    <a class="book-nav__item${essay.slug === activeSlug ? " is-active" : ""}" href="${prefix}essays/${essay.slug}.html" data-mission-link="${essay.slug}">
      <span class="book-nav__number">${String(index + 1).padStart(2, "0")}</span>
      <span>${essay.domain ? `<small>${escapeHtml(essay.domain)}</small>` : ""}${escapeHtml(essay.title)}</span>
      <span class="book-nav__check" aria-label="Exercise completed">✓</span>
    </a>`).join("");
}

function shell({ title, description, prefix = "", activeSlug = "", body, pageClass = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#153b35">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <title>${escapeHtml(title)} · ${escapeHtml(meta.title)}</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%23153b35'/%3E%3Ctext x='17' y='44' font-size='35' fill='%23fffdf8'%3E${escapeHtml(meta.title.charAt(0))}%3C/text%3E%3C/svg%3E">
  <link rel="stylesheet" href="${prefix}assets/styles.css">
  <script defer src="${prefix}assets/app.js"></script>
</head>
<body class="${pageClass}" data-active-slug="${escapeHtml(activeSlug)}">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="reading-progress" aria-hidden="true"><span></span></div>
  <header class="site-header">
    <a class="wordmark" href="${prefix}index.html" aria-label="${escapeHtml(meta.title)} home">
      <span class="wordmark__mark">${escapeHtml(meta.title.charAt(0))}</span>
      <span><strong>${escapeHtml(meta.title)}</strong><small>${escapeHtml(meta.subtitle)}</small></span>
    </a>
    <div class="header-actions">
      <a href="${prefix}about.html">About</a>
      <span class="progress-summary" data-progress-summary>0 of ${builtEssays.length} exercises</span>
      <button class="menu-button" type="button" data-menu-button aria-expanded="false" aria-controls="book-navigation">Contents</button>
    </div>
  </header>
  <div class="page-shell">
    <aside class="book-nav" id="book-navigation" data-book-nav>
      <div class="book-nav__intro">
        <a href="${prefix}index.html">The shelf</a>
        <p>${builtEssays.length} essay${builtEssays.length === 1 ? "" : "s"}. Worked examples and exercises included.</p>
      </div>
      <nav aria-label="Book contents">${navItems(prefix, activeSlug)}</nav>
      ${skips.length ? `<a class="book-nav__skips" href="${prefix}index.html#transparent-skips">Editorial skips →</a>` : ""}
    </aside>
    ${body}
  </div>
</body>
</html>`;
}

function essayPage(essay, index) {
  const source = fs.readFileSync(path.join(root, "essays", `${essay.slug}.md`), "utf8");
  let article = renderMarkdown(source);
  article = article.replace(/^<h1[^>]*>.*?<\/h1>\s*/s, "");
  const missionLabel = essay.missionLabel || "Try the exercise";
  const missionOpen = `<section class="mission" data-mission="${essay.slug}"><div class="mission__label">${escapeHtml(missionLabel)}</div>`;
  if (article.includes("<!--mission-->")) {
    article = article.replace("<!--mission-->", missionOpen) + "</section>";
  }
  const previous = builtEssays[index - 1];
  const next = builtEssays[index + 1];
  const pager = `<nav class="essay-pager" aria-label="Adjacent essays">
    ${previous ? `<a href="${previous.slug}.html"><span>Previous</span>${escapeHtml(previous.title)}</a>` : "<span></span>"}
    ${next ? `<a class="essay-pager__next" href="${next.slug}.html"><span>Next</span>${escapeHtml(next.title)}</a>` : `<a class="essay-pager__next" href="../index.html"><span>Return</span>The complete shelf</a>`}
  </nav>`;
  const part = partsById[essay.part];
  const partLabel = part ? `Part ${part.id} · ${part.title}` : essay.part;
  const body = `<main id="main" class="essay-page">
    <header class="essay-hero">
      <div class="essay-kicker"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(partLabel)}</div>
      <h1 class="essay-title">${escapeHtml(essay.title)}</h1>
      <p class="essay-payoff">${escapeHtml(essay.mechanism)}</p>
    </header>
    <article class="prose">${article}</article>
    <div class="mission-action" data-mission-action="${essay.slug}">
      <div><strong>Check your understanding.</strong><span>Try the exercise and compare your reasoning with the explanation.</span></div>
      <button type="button" data-complete-mission="${essay.slug}">Mark exercise complete</button>
    </div>
    ${pager}
    ${sourceNotes(essay)}
  </main>`;
  return shell({ title: essay.title, description: essay.payoff || essay.mechanism, prefix: "../", activeSlug: essay.slug, body, pageClass: "article-view" });
}

function skipReviewPage(item) {
  const title = item.title || item.slug;
  const body = `<main id="main" class="review-page">
    <a class="back-link" href="../index.html#transparent-skips">← Back to the shelf</a>
    <div class="review-label">Editorial record · not selected</div>
    <article class="prose review-prose"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(item.reason || "")}</p></article>
    <footer class="article-footer">A skip is part of the shelf's trust model: a pitch does not create an essay obligation.</footer>
  </main>`;
  return shell({ title: `${title} — skip verdict`, description: item.reason || "", prefix: "../", body, pageClass: "review-view" });
}

function partSection(part) {
  const partEssays = builtEssays.filter((essay) => essay.part === part.id);
  const heading = `<div class="section-heading"><div><span class="section-label">Part ${escapeHtml(part.id)}</span><h2>${escapeHtml(part.title)}</h2></div></div>`;
  if (!partEssays.length) {
    return `<section class="shelf-section" id="part-${slugify(part.id)}">${heading}<p class="part-empty">No essays published yet.</p></section>`;
  }
  const cards = partEssays.map((essay) => {
    const globalIndex = builtEssays.indexOf(essay);
    return `<article class="shelf-card${essay.recommended ? " shelf-card--recommended" : ""}" data-mission-card="${essay.slug}">
    <div class="shelf-card__top"><span>${String(globalIndex + 1).padStart(2, "0")}${essay.domain ? ` · ${escapeHtml(essay.domain)}` : ""}</span><span class="shelf-card__status">Unread</span></div>
    <h3><a href="essays/${essay.slug}.html">${escapeHtml(essay.title)}</a></h3>
    <p>${escapeHtml(essay.payoff || essay.mechanism)}</p>
    <a class="shelf-card__action" href="essays/${essay.slug}.html">${essay.recommended ? "Start here" : "Read the essay"} <span>→</span></a>
  </article>`;
  }).join("");
  return `<section class="shelf-section" id="part-${slugify(part.id)}">${heading}<div class="shelf-grid">${cards}</div></section>`;
}

function homePage() {
  const recommended = builtEssays.find((essay) => essay.recommended);
  const skipCards = skips.map((item) => `<article class="skip-card">
    <div><span>Skip verdict</span><h3>${escapeHtml(item.title || item.slug)}</h3></div>
    <p>${escapeHtml(item.reason || "")}</p>
    <a href="reviews/${item.slug}.html">Read the evidence →</a>
  </article>`).join("");
  const body = `<main id="main" class="home-page">
    <section class="home-hero">
      <div class="home-hero__eyebrow">${escapeHtml(meta.subtitle)}</div>
      <h1>${escapeHtml(meta.title)}</h1>
      <p>${builtEssays.length} standalone essay${builtEssays.length === 1 ? "" : "s"}. Each explains one mechanism with a worked example you can recompute, and closes with an exercise you can do without a GPU, a paid API, or the source.</p>
      <div class="home-hero__actions">
        ${recommended ? `<a class="button button--primary" href="essays/${recommended.slug}.html">Read the recommended start</a>` : ""}
        <a class="button button--quiet" href="#the-shelf">Browse the shelf</a>
      </div>
      <div class="home-proof"><span><strong>${builtEssays.length}</strong> essays published</span>${skips.length ? `<span><strong>${skips.length}</strong> transparent skips</span>` : ""}</div>
    </section>
    <section class="shelf-section" id="the-shelf">
      <div class="section-heading"><div><span class="section-label">The shelf</span><h2>Reading order</h2></div><p>Each essay is standalone; read in any order.</p></div>
    </section>
    ${parts.map(partSection).join("")}
    ${skips.length ? `<section class="skip-section" id="transparent-skips">
      <div class="section-heading"><div><span class="section-label">Transparent skips</span><h2>Not every candidate earns an essay.</h2></div><p>These pitches were not selected. The records explain why.</p></div>
      <div class="skip-grid">${skipCards}</div>
    </section>` : ""}
    <footer class="home-footer"><div><strong>${escapeHtml(meta.title)}</strong><p>${escapeHtml(meta.subtitle)}</p></div><p><a href="${escapeHtml(meta.repo)}">Source on GitHub</a></p></footer>
  </main>`;
  return shell({ title: meta.title, description: meta.subtitle, body, pageClass: "home-view" });
}

function aboutPage() {
  const source = fs.readFileSync(path.join(root, "about.md"), "utf8");
  let article = renderMarkdown(source);
  const titleMatch = source.match(/^# (.+)$/m);
  const aboutTitle = titleMatch ? titleMatch[1] : "About";
  article = article.replace(/^<h1[^>]*>.*?<\/h1>\s*/s, "");
  const body = `<main id="main" class="essay-page about-page">
    <header class="essay-hero"><h1 class="essay-title">${escapeHtml(aboutTitle)}</h1></header>
    <article class="prose">${article}</article>
  </main>`;
  return shell({ title: aboutTitle, description: `How ${meta.title} is made and checked.`, body, pageClass: "article-view" });
}

fs.writeFileSync(path.join(out, "index.html"), homePage());
fs.writeFileSync(path.join(out, "about.html"), aboutPage());
builtEssays.forEach((essay, index) => fs.writeFileSync(path.join(out, "essays", `${essay.slug}.html`), essayPage(essay, index)));
skips.forEach((item) => fs.writeFileSync(path.join(out, "reviews", `${item.slug}.html`), skipReviewPage(item)));
for (const asset of ["styles.css", "app.js"]) fs.copyFileSync(path.join(here, asset), path.join(out, "assets", asset));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
fs.writeFileSync(path.join(out, "404.html"), homePage());
console.log(`Built ${builtEssays.length} of ${essays.length} essays in docs/ (${skips.length} skip records).`);
