import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { meta, parts, courses, essays, skips, chapters, appendices } from "./catalog.mjs";

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
// Chapters (the book since 2026-09-13): built when published (or --all) and chapters/<slug>.md exists.
const builtChapters = chapters.filter((chapter) =>
  (buildAll || chapter.status === "published") &&
  fs.existsSync(path.join(root, "chapters", `${chapter.slug}.md`))
);
const chapterFor = (essaySlug) => chapters.find((chapter) => chapter.builtFrom.includes(essaySlug));
// Labs (since 2026-09-22): labs/<slug>.md holds a chapter's exercise and its <!--mission--> marker.
// A chapter with a lab links forward to it; the completion button lives on the lab page.
const labPath = (chapter) => path.join(root, "labs", `${chapter.slug}.md`);
// Appendices: appendix/<letter>.md, built when published (or --all) and present on disk.
const appendixPath = (appendix) => path.join(root, "appendix", `${appendix.letter}.md`);
const builtAppendices = appendices.filter((appendix) =>
  (buildAll || appendix.status === "published") && fs.existsSync(appendixPath(appendix))
);
const hasLab = (chapter) => fs.existsSync(labPath(chapter));
const pad2 = (n) => String(n).padStart(2, "0");

fs.rmSync(out, { recursive: true, force: true });
for (const directory of [out, path.join(out, "essays"), path.join(out, "assets"), path.join(out, "chapters"), path.join(out, "labs"), path.join(out, "appendix"), path.join(out, "old", "essays")]) {
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
  if (!essay.sources.length) return "";
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
  const destination = /^(?:\.\.\/)?(?:essays|chapters|labs|appendix)\/.*\.md$/.test(href) ? href.replace(/\.md$/, ".html") : href;
  const external = /^https?:\/\//.test(destination);
  const attributes = `${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noreferrer"' : ""}`;
  return `<a href="${escapeHtml(destination)}"${attributes}>${this.parser.parseInline(tokens)}</a>`;
};

marked.setOptions({ gfm: true, renderer });

function renderMarkdown(markdown) {
  return marked.parse(markdown);
}

// Two navigations share one shell: the chapters (the book) and the archived essays (docs/old/).
function essayNavItems(prefix, activeSlug = "") {
  return builtEssays.map((essay, index) => `
    <a class="book-nav__item${essay.slug === activeSlug ? " is-active" : ""}" href="${prefix}old/essays/${essay.slug}.html" data-mission-link="${essay.slug}">
      <span class="book-nav__number">${pad2(index + 1)}</span>
      <span>${essay.domain ? `<small>${escapeHtml(essay.domain)}</small>` : ""}${escapeHtml(essay.title)}</span>
      <span class="book-nav__check" aria-label="Exercise completed">✓</span>
    </a>`).join("");
}

function chapterNavItems(prefix, activeSlug = "") {
  return chapters.map((chapter) => builtChapters.includes(chapter) ? `
    <a class="book-nav__item${chapter.slug === activeSlug ? " is-active" : ""}" href="${prefix}chapters/${chapter.slug}.html" data-mission-link="${chapter.slug}">
      <span class="book-nav__number">${pad2(chapter.number)}</span>
      <span>${escapeHtml(chapter.title)}</span>
      <span class="book-nav__check" aria-label="Exercise completed">✓</span>
    </a>` : `
    <span class="book-nav__item book-nav__item--planned">
      <span class="book-nav__number">${pad2(chapter.number)}</span>
      <span>${escapeHtml(chapter.title)}<small class="book-nav__planned">in writing</small></span>
      <span></span>
    </span>`).join("");
}

// The appendices follow the chapters in the contents; no data-mission-link, so they do not count as exercises.
function appendixNavItems(prefix, activeSlug = "") {
  if (!builtAppendices.length) return "";
  return `<div class="book-nav__group">Appendices</div>` + builtAppendices.map((appendix) => `
    <a class="book-nav__item${appendix.slug === activeSlug ? " is-active" : ""}" href="${prefix}appendix/${appendix.letter}.html">
      <span class="book-nav__number">${escapeHtml(appendix.letter.toUpperCase())}</span>
      <span>${escapeHtml(appendix.title.replace(/^Appendix [A-Z]\.\s*/, ""))}</span>
      <span></span>
    </a>`).join("");
}

function shell({ title, description, prefix = "", activeSlug = "", body, pageClass = "", archive = false }) {
  const count = archive ? builtEssays.length : builtChapters.length;
  const intro = archive
    ? `<a href="${prefix}old/index.html">Archived essays</a><p>The twelve essays the chapters replaced, kept for reference. <a href="${prefix}index.html">Back to the chapters →</a></p>`
    : `<a href="${prefix}index.html">The chapters</a><p>One shop, eight chapters. ${builtChapters.length} of ${chapters.length} written. <a href="${prefix}old/index.html">Archived essays →</a></p>`;
  const nav = archive ? essayNavItems(prefix, activeSlug) : chapterNavItems(prefix, activeSlug) + appendixNavItems(prefix, activeSlug);
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
      <span class="progress-summary" data-progress-summary>0 of ${count} exercises</span>
      <button class="menu-button" type="button" data-menu-button aria-expanded="false" aria-controls="book-navigation">Contents</button>
    </div>
  </header>
  <div class="page-shell">
    <aside class="book-nav" id="book-navigation" data-book-nav>
      <div class="book-nav__intro">${intro}</div>
      <nav aria-label="${archive ? "Archived essays" : "Book contents"}">${nav}</nav>
    </aside>
    ${body}
  </div>
</body>
</html>`;
}

// Comparison variants: essays/variants/<slug>.<label>.md, built to essays/<slug>--<label>.html.
// Labels: "tight" = codex rewrite in the essay-1 register; "previous" = the version before a rewrite.
const VARIANT_NAMES = { tight: "Tighter rewrite", previous: "Previous version" };
function variantsOf(slug) {
  const dir = path.join(root, "essays", "variants");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.startsWith(`${slug}.`) && f.endsWith(".md"))
    .map((f) => ({ label: f.slice(slug.length + 1, -3), file: path.join(dir, f) }));
}
function compareBanner(essay, current) {
  const variants = variantsOf(essay.slug);
  if (!variants.length) return "";
  const links = [`<a href="${essay.slug}.html"${current === "" ? ' aria-current="page"' : ""}>Current version</a>`]
    .concat(variants.map((v) => `<a href="${essay.slug}--${v.label}.html"${current === v.label ? ' aria-current="page"' : ""}>${escapeHtml(VARIANT_NAMES[v.label] || v.label)}</a>`));
  return `<nav class="compare-banner" aria-label="Versions of this essay"><span>Compare versions:</span> ${links.join(" · ")}</nav>`;
}

function essayPage(essay, index, variant = null) {
  const source = variant ? fs.readFileSync(variant.file, "utf8") : fs.readFileSync(path.join(root, "essays", `${essay.slug}.md`), "utf8");
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
    ${next ? `<a class="essay-pager__next" href="${next.slug}.html"><span>Next</span>${escapeHtml(next.title)}</a>` : `<a class="essay-pager__next" href="../index.html"><span>Return</span>The archive</a>`}
  </nav>`;
  const chapter = chapterFor(essay.slug);
  const archiveBanner = `<nav class="compare-banner archive-banner" aria-label="Archive notice"><span>Archived essay, kept for reference.</span> ${chapter
    ? (builtChapters.includes(chapter)
      ? `Its ground is rewritten in <a href="../../chapters/${chapter.slug}.html">Chapter ${chapter.number}: ${escapeHtml(chapter.title)}</a>.`
      : `Its ground will be rewritten in Chapter ${chapter.number}: ${escapeHtml(chapter.title)} (in writing).`)
    : `<a href="../../index.html">Read the chapters</a>.`}</nav>`;
  const part = partsById[essay.part];
  const partLabel = part ? `Part ${part.id} · ${part.title}` : essay.part;
  const body = `<main id="main" class="essay-page">
    <header class="essay-hero">
      <div class="essay-kicker"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(partLabel)}</div>
      <h1 class="essay-title">${escapeHtml(essay.title)}</h1>
      <p class="essay-payoff">${escapeHtml(essay.payoff || essay.mechanism)}</p>
    </header>
    ${archiveBanner}
    ${compareBanner(essay, variant ? variant.label : "")}
    <article class="prose">${article}</article>
    <div class="mission-action" data-mission-action="${essay.slug}">
      <div><strong>Check your understanding.</strong><span>Try the exercise and compare your reasoning with the explanation.</span></div>
      <button type="button" data-complete-mission="${essay.slug}">Mark exercise complete</button>
    </div>
    ${pager}
    ${sourceNotes(essay)}
  </main>`;
  return shell({ title: essay.title, description: essay.payoff || essay.mechanism, prefix: "../../", activeSlug: essay.slug, body, pageClass: "article-view", archive: true });
}

function chapterPage(chapter) {
  const source = fs.readFileSync(path.join(root, "chapters", `${chapter.slug}.md`), "utf8");
  let article = renderMarkdown(source).replace(/^<h1[^>]*>.*?<\/h1>\s*/s, "");
  const lab = hasLab(chapter);
  const missionOpen = `<section class="mission" data-mission="${chapter.slug}"><div class="mission__label">${escapeHtml(chapter.missionLabel || "Try the exercise")}</div>`;
  if (!lab && article.includes("<!--mission-->")) article = article.replace("<!--mission-->", missionOpen) + "</section>";
  const index = builtChapters.indexOf(chapter);
  const previous = builtChapters[index - 1];
  const next = chapters.find((c) => c.number === chapter.number + 1);
  const nextLink = next && builtChapters.includes(next)
    ? `<a class="essay-pager__next" href="${next.slug}.html"><span>Next</span>${escapeHtml(next.title)}</a>`
    : `<a class="essay-pager__next" href="../index.html"><span>${next ? `Chapter ${next.number} is in writing` : "Return"}</span>The chapters</a>`;
  const pager = `<nav class="essay-pager" aria-label="Adjacent chapters">
    ${previous ? `<a href="${previous.slug}.html"><span>Previous</span>${escapeHtml(previous.title)}</a>` : "<span></span>"}
    ${nextLink}
  </nav>`;
  const archived = chapter.builtFrom.map((slug) => essays.find((e) => e.slug === slug)).filter((e) => e && builtEssays.includes(e));
  const archiveNote = archived.length
    ? `<p class="archive-note">Earlier standalone essays on this ground, kept for reference: ${archived.map((e) => `<a href="../old/essays/${e.slug}.html">${escapeHtml(e.title)}</a>`).join(" · ")}.</p>`
    : "";
  const body = `<main id="main" class="essay-page">
    <header class="essay-hero">
      <div class="essay-kicker"><span>${pad2(chapter.number)}</span>Chapter ${chapter.number} of ${chapters.length}</div>
      <h1 class="essay-title">${escapeHtml(chapter.title)}</h1>
      <p class="essay-payoff">${escapeHtml(chapter.payoff)}</p>
    </header>
    <article class="prose">${article}</article>
    ${lab ? `<div class="mission-action lab-action">
      <div><strong>The lab.</strong><span>${escapeHtml(labTitle(chapter))} — the code, its expected output and the completion button are on the lab page.</span></div>
      <a class="button-link" href="../labs/${chapter.slug}.html">Open the lab</a>
    </div>` : `<div class="mission-action" data-mission-action="${chapter.slug}">
      <div><strong>Check your understanding.</strong><span>Run the exercise and compare your output with the expected result.</span></div>
      <button type="button" data-complete-mission="${chapter.slug}">Mark exercise complete</button>
    </div>`}
    ${pager}
    ${sourceNotes(chapter)}
    ${archiveNote}
  </main>`;
  return shell({ title: chapter.title, description: chapter.payoff, prefix: "../", activeSlug: chapter.slug, body, pageClass: "article-view" });
}

// The lab's H1 ("Lab: …") is its title; the build strips it from the article as it does for chapters.
function labTitle(chapter) {
  const match = fs.readFileSync(labPath(chapter), "utf8").match(/^# (.+)$/m);
  return match ? match[1].replace(/^Lab:\s*/i, "") : `Lab for chapter ${chapter.number}`;
}

function labPage(chapter) {
  const source = fs.readFileSync(labPath(chapter), "utf8");
  let article = renderMarkdown(source).replace(/^<h1[^>]*>.*?<\/h1>\s*/s, "");
  const missionOpen = `<section class="mission" data-mission="${chapter.slug}"><div class="mission__label">${escapeHtml(chapter.missionLabel || "Try the exercise")}</div>`;
  if (article.includes("<!--mission-->")) article = article.replace("<!--mission-->", missionOpen) + "</section>";
  const next = chapters.find((c) => c.number === chapter.number + 1);
  const nextLink = next && builtChapters.includes(next)
    ? `<a class="essay-pager__next" href="../chapters/${next.slug}.html"><span>Next</span>${escapeHtml(next.title)}</a>`
    : `<a class="essay-pager__next" href="../index.html"><span>${next ? `Chapter ${next.number} is in writing` : "Return"}</span>The chapters</a>`;
  const pager = `<nav class="essay-pager" aria-label="Back to the chapter">
    <a href="../chapters/${chapter.slug}.html"><span>Back to chapter ${chapter.number}</span>${escapeHtml(chapter.title)}</a>
    ${nextLink}
  </nav>`;
  const description = `The lab for chapter ${chapter.number}, ${chapter.title}: ${labTitle(chapter)}.`;
  const body = `<main id="main" class="essay-page lab-page">
    <header class="essay-hero">
      <div class="essay-kicker"><span>${pad2(chapter.number)}</span>Lab · <a href="../chapters/${chapter.slug}.html">Chapter ${chapter.number}, ${escapeHtml(chapter.title)}</a></div>
      <h1 class="essay-title">${escapeHtml(labTitle(chapter))}</h1>
      <p class="essay-payoff">Runs on a laptop CPU. The expected output is printed below the code; mark the exercise complete when yours matches.</p>
    </header>
    <article class="prose">${article}</article>
    <div class="mission-action" data-mission-action="${chapter.slug}">
      <div><strong>Check your understanding.</strong><span>Run the exercise and compare your output with the expected result.</span></div>
      <button type="button" data-complete-mission="${chapter.slug}">Mark exercise complete</button>
    </div>
    ${pager}
    ${sourceNotes(chapter)}
  </main>`;
  return shell({ title: `Lab: ${labTitle(chapter)}`, description, prefix: "../", activeSlug: chapter.slug, body, pageClass: "article-view" });
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
    <a class="shelf-card__action" href="essays/${essay.slug}.html">Read the archived essay <span>→</span></a>
  </article>`;
  }).join("");
  return `<section class="shelf-section" id="part-${slugify(part.id)}">${heading}<div class="shelf-grid">${cards}</div></section>`;
}

function archiveHomePage() {
  const body = `<main id="main" class="home-page">
    <section class="home-hero">
      <div class="home-hero__eyebrow">Archive</div>
      <h1>The standalone essays</h1>
      <p>Before the book became eight project chapters on one shop, it was written as standalone essays, one mechanism each. They are kept here unchanged for reference. The chapters are written from scratch and supersede them.</p>
      <div class="home-hero__actions">
        <a class="button button--primary" href="../index.html">Read the chapters</a>
      </div>
      <div class="home-proof"><span><strong>${builtEssays.length}</strong> archived essays</span></div>
    </section>
    ${parts.filter((part) => builtEssays.some((essay) => essay.part === part.id)).map(partSection).join("")}
    <footer class="home-footer"><div><strong>${escapeHtml(meta.title)}</strong><p>Archived essays</p></div><p><a href="${escapeHtml(meta.repo)}">Source on GitHub</a></p></footer>
  </main>`;
  return shell({ title: "Archived essays", description: "The standalone essays the chapters replaced, kept for reference.", prefix: "../", body, pageClass: "home-view", archive: true });
}

function homePage() {
  const first = builtChapters[0];
  const cards = chapters.map((chapter) => {
    const built = builtChapters.includes(chapter);
    return `<article class="shelf-card${built ? " shelf-card--recommended" : " shelf-card--planned"}"${built ? ` data-mission-card="${chapter.slug}"` : ""}>
    <div class="shelf-card__top"><span>Chapter ${chapter.number}</span><span class="shelf-card__status">${built ? "Unread" : "In writing"}</span></div>
    <h3>${built ? `<a href="chapters/${chapter.slug}.html">${escapeHtml(chapter.title)}</a>` : escapeHtml(chapter.title)}</h3>
    <p>${escapeHtml(chapter.payoff)}</p>
    ${built ? `<a class="shelf-card__action" href="chapters/${chapter.slug}.html">Read the chapter <span>→</span></a>` : ""}
  </article>`;
  }).join("");
  const body = `<main id="main" class="home-page">
    <section class="home-hero">
      <div class="home-hero__eyebrow">${escapeHtml(meta.subtitle)}</div>
      <h1>${escapeHtml(meta.title)}</h1>
      <p>One online shop, followed from its first search box to the question of whether it needed a model at all. Each chapter tells one story of the shop, with its number in the first paragraph, the derivations folded away until you want them, and a lab page where the exercise runs on a laptop CPU and prints an expected result. Three appendices on the tools the chapters leave out are planned.</p>
      <div class="home-hero__actions">
        ${first ? `<a class="button button--primary" href="chapters/${first.slug}.html">Start with chapter ${first.number}</a>` : ""}
        <a class="button button--quiet" href="old/index.html">Archived essays</a>
      </div>
      <div class="home-proof"><span><strong>${builtChapters.length}</strong> of ${chapters.length} chapters written</span></div>
    </section>
    <section class="shelf-section" id="the-chapters">
      <div class="section-heading"><div><span class="section-label">The chapters</span><h2>Reading order</h2></div><p>Read in order: each chapter builds on the shop the previous one left.</p></div>
      <div class="shelf-grid">${cards}</div>
    </section>
    ${builtAppendices.length ? `<section class="shelf-section" id="the-appendices">
      <div class="section-heading"><div><span class="section-label">Appendices</span><h2>The tools, after the mechanisms</h2></div><p>Optional reading after chapter 8: the serving engines and platforms the chapters keep out of the story. No exercise; nothing to mark complete.</p></div>
      <div class="shelf-grid">${builtAppendices.map((appendix) => `<article class="shelf-card shelf-card--recommended">
    <div class="shelf-card__top"><span>Appendix ${escapeHtml(appendix.letter.toUpperCase())}</span><span class="shelf-card__status">Optional</span></div>
    <h3><a href="appendix/${appendix.letter}.html">${escapeHtml(appendix.title.replace(/^Appendix [A-Z]\.\s*/, ""))}</a></h3>
    <p>${escapeHtml(appendix.payoff)}</p>
    <a class="shelf-card__action" href="appendix/${appendix.letter}.html">Read the appendix <span>→</span></a>
  </article>`).join("")}</div>
    </section>` : ""}
    <footer class="home-footer"><div><strong>${escapeHtml(meta.title)}</strong><p>${escapeHtml(meta.subtitle)}</p></div><p><a href="${escapeHtml(meta.repo)}">Source on GitHub</a></p></footer>
  </main>`;
  return shell({ title: meta.title, description: meta.subtitle, body, pageClass: "home-view" });
}

function appendixPage(appendix) {
  const source = fs.readFileSync(appendixPath(appendix), "utf8");
  const article = renderMarkdown(source).replace(/^<h1[^>]*>.*?<\/h1>\s*/s, "");
  const forChapters = appendix.chapters.map((n) => chapters.find((c) => c.number === n)).filter(Boolean);
  const chapterLinks = forChapters.map((c) => `<a href="../chapters/${c.slug}.html">chapter ${c.number}, ${escapeHtml(c.title)}</a>`).join(" and ");
  const index = builtAppendices.indexOf(appendix);
  const previous = builtAppendices[index - 1];
  const next = builtAppendices[index + 1];
  const last = builtChapters[builtChapters.length - 1];
  const pager = `<nav class="essay-pager" aria-label="Adjacent pages">
    ${previous ? `<a href="${previous.letter}.html"><span>Previous</span>${escapeHtml(previous.title)}</a>` : last ? `<a href="../chapters/${last.slug}.html"><span>Previous</span>${escapeHtml(last.title)}</a>` : "<span></span>"}
    ${next ? `<a class="essay-pager__next" href="${next.letter}.html"><span>Next</span>${escapeHtml(next.title)}</a>` : `<a class="essay-pager__next" href="../index.html"><span>Return</span>The chapters</a>`}
  </nav>`;
  const body = `<main id="main" class="essay-page appendix-page">
    <header class="essay-hero">
      <div class="essay-kicker"><span>${escapeHtml(appendix.letter.toUpperCase())}</span>Appendix · the tools behind ${chapterLinks}</div>
      <h1 class="essay-title">${escapeHtml(appendix.title)}</h1>
      <p class="essay-payoff">${escapeHtml(appendix.payoff)}</p>
    </header>
    <article class="prose">${article}</article>
    ${pager}
    ${sourceNotes(appendix)}
  </main>`;
  return shell({ title: appendix.title, description: appendix.payoff, prefix: "../", activeSlug: appendix.slug, body, pageClass: "article-view" });
}

function redirectPage(target, title) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)} · ${escapeHtml(meta.title)}</title>
<meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${target}"></head>
<body><main id="main"><p>This essay moved to the archive: <a href="${target}">${escapeHtml(title)}</a>.</p></main></body></html>`;
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
fs.writeFileSync(path.join(out, "old", "index.html"), archiveHomePage());
builtChapters.forEach((chapter) => fs.writeFileSync(path.join(out, "chapters", `${chapter.slug}.html`), chapterPage(chapter)));
builtChapters.filter(hasLab).forEach((chapter) => fs.writeFileSync(path.join(out, "labs", `${chapter.slug}.html`), labPage(chapter)));
builtAppendices.forEach((appendix) => fs.writeFileSync(path.join(out, "appendix", `${appendix.letter}.html`), appendixPage(appendix)));
builtEssays.forEach((essay, index) => {
  fs.writeFileSync(path.join(out, "old", "essays", `${essay.slug}.html`), essayPage(essay, index));
  fs.writeFileSync(path.join(out, "essays", `${essay.slug}.html`), redirectPage(`../old/essays/${essay.slug}.html`, essay.title));
});
for (const asset of ["styles.css", "app.js"]) fs.copyFileSync(path.join(here, asset), path.join(out, "assets", asset));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
fs.writeFileSync(path.join(out, "404.html"), homePage());
console.log(`Built ${builtChapters.length} of ${chapters.length} chapters (${builtChapters.filter(hasLab).length} with labs) and ${builtEssays.length} archived essays in docs/.`);
