import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { essays, skips } from "./catalog.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = path.join(root, "docs");

fs.rmSync(out, { recursive: true, force: true });
for (const directory of [out, path.join(out, "essays"), path.join(out, "reviews"), path.join(out, "assets")]) {
  fs.mkdirSync(directory, { recursive: true });
}

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

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
  let destination = href;
  if (/^\.\.\/notes\/review-.*\.md$/.test(href)) {
    destination = href.replace("../notes/review-", "../reviews/").replace(/\.md$/, ".html");
  } else if (/^notes\/review-.*\.md$/.test(href)) {
    destination = href.replace("notes/review-", "reviews/").replace(/\.md$/, ".html");
  } else if (/^essays\/.*\.md$/.test(href)) {
    destination = href.replace(/\.md$/, ".html");
  }
  const external = /^https?:\/\//.test(destination);
  const attributes = `${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noreferrer"' : ""}`;
  return `<a href="${escapeHtml(destination)}"${attributes}>${this.parser.parseInline(tokens)}</a>`;
};

marked.setOptions({ gfm: true, renderer });

function renderMarkdown(markdown) {
  return marked.parse(markdown);
}

function navItems(prefix, activeSlug = "") {
  return essays.map((essay, index) => `
    <a class="book-nav__item${essay.slug === activeSlug ? " is-active" : ""}" href="${prefix}essays/${essay.slug}.html" data-mission-link="${essay.slug}">
      <span class="book-nav__number">${String(index + 1).padStart(2, "0")}</span>
      <span><small>${escapeHtml(essay.domain)}</small>${escapeHtml(essay.title)}</span>
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
  <title>${escapeHtml(title)} · Finish First</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%23153b35'/%3E%3Ctext x='17' y='44' font-size='35' fill='%23fffdf8'%3EF%3C/text%3E%3C/svg%3E">
  <link rel="stylesheet" href="${prefix}assets/styles.css">
  <script defer src="${prefix}assets/app.js"></script>
</head>
<body class="${pageClass}" data-active-slug="${escapeHtml(activeSlug)}">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="reading-progress" aria-hidden="true"><span></span></div>
  <header class="site-header">
    <a class="wordmark" href="${prefix}index.html" aria-label="Finish First home">
      <span class="wordmark__mark">F<span>←</span></span>
      <span><strong>Finish First</strong><small>ideas you can put to work</small></span>
    </a>
    <div class="header-actions">
      <span class="progress-summary" data-progress-summary>0 of ${essays.length} exercises</span>
      <button class="menu-button" type="button" data-menu-button aria-expanded="false" aria-controls="book-navigation">Contents</button>
    </div>
  </header>
  <div class="page-shell">
    <aside class="book-nav" id="book-navigation" data-book-nav>
      <div class="book-nav__intro">
        <a href="${prefix}index.html">The shelf</a>
        <p>${essays.length} ideas. Examples and exercises included.</p>
      </div>
      <nav aria-label="Book contents">${navItems(prefix, activeSlug)}</nav>
      <a class="book-nav__skips" href="${prefix}index.html#transparent-skips">Editorial skips →</a>
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
  const missionLabel = essay.missionLabel ?? "Try the idea";
  const missionOpen = `<section class="mission" data-mission="${essay.slug}"><div class="mission__label">${escapeHtml(missionLabel)}</div>`;
  // Rewritten essays mark the closing section with <!--mission-->; older sourced drafts
  // are still matched on their fixed heading.
  if (article.includes("<!--mission-->")) {
    article = article.replace("<!--mission-->", missionOpen);
  } else {
    article = article.replace(/<h2 id="(?:your-)?one-reading-mission">/i, `${missionOpen}<h2 id="one-reading-mission">`);
  }
  if (article.includes('<h2 id="receipts">')) {
    article = article.replace('<h2 id="receipts">', `</section><h2 id="receipts">`);
  } else {
    article += "</section>";
  }
  const previous = essays[index - 1];
  const next = essays[index + 1];
  const pager = `<nav class="essay-pager" aria-label="Adjacent essays">
    ${previous ? `<a href="${previous.slug}.html"><span>Previous</span>${escapeHtml(previous.title)}</a>` : "<span></span>"}
    ${next ? `<a class="essay-pager__next" href="${next.slug}.html"><span>Next</span>${escapeHtml(next.title)}</a>` : `<a class="essay-pager__next" href="../index.html"><span>Return</span>The complete shelf</a>`}
  </nav>`;
  const body = `<main id="main" class="essay-page">
    <header class="essay-hero">
      <div class="essay-kicker"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(essay.domain)}</div>
      <h1 class="essay-title">${escapeHtml(essay.title)}</h1>
      <p class="essay-book">Based on <cite>${escapeHtml(essay.book)}</cite> by ${escapeHtml(essay.authors)}</p>
      <p class="essay-payoff">${escapeHtml(essay.payoff)}</p>
      <div class="essay-meta"><span>${escapeHtml(essay.mission)}</span><span>You leave with: ${escapeHtml(essay.artifact)}</span></div>
    </header>
    <article class="prose">${article}</article>
    <div class="mission-action" data-mission-action="${essay.slug}">
      <div><strong>Check your understanding.</strong><span>Try the exercise and compare your reasoning with the explanation.</span></div>
      <button type="button" data-complete-mission="${essay.slug}">Mark exercise complete</button>
    </div>
    ${pager}
    <details class="source-notes"><summary>Source and limits</summary><p>${escapeHtml(essay.caution)}</p><p>Based on <cite>${escapeHtml(essay.book)}</cite> by ${escapeHtml(essay.authors)}. The original book is optional further reading.</p><a href="../reviews/${essay.slug}.html">Source review and evidence notes</a></details>
  </main>`;
  return shell({ title: essay.title, description: essay.payoff, prefix: "../", activeSlug: essay.slug, body, pageClass: "article-view" });
}

function reviewPage(item, accepted = false) {
  const markdown = fs.readFileSync(path.join(root, "notes", `review-${item.slug}.md`), "utf8");
  const revisionPath = path.join(root, "notes", "standalone-review", `${item.slug}.md`);
  const revision = accepted && fs.existsSync(revisionPath)
    ? fs.readFileSync(revisionPath, "utf8")
      .replace(/(?:^##[^\n]*(?:catalog|metadata)[^\n]*\n\s*)?```json[\s\S]*?```/gim, "")
      .trim()
    : null;
  const record = revision
    ? `${renderMarkdown(revision)}<details class="source-notes"><summary>Original selection review (historical)</summary>${renderMarkdown(markdown.replace(/^# /m, "## "))}</details>`
    : renderMarkdown(markdown);
  const body = `<main id="main" class="review-page">
    <a class="back-link" href="../index.html${accepted ? '#the-shelf' : '#transparent-skips'}">← Back to the shelf</a>
    <div class="review-label">Editorial record · ${accepted ? 'selected' : 'not selected'}</div>
    <article class="prose review-prose">${record}</article>
    <footer class="article-footer">${accepted ? 'Source identity, extraction limits, and the editorial reasons for this companion.' : 'A skip is part of the shelf’s trust model: readable extraction alone does not create an essay obligation.'}</footer>
  </main>`;
  return shell({ title: `${item.book} — ${accepted ? 'editorial review' : 'skip verdict'}`, description: item.reason, prefix: "../", body, pageClass: "review-view" });
}

function homePage() {
  const cards = essays.map((essay, index) => `<article class="shelf-card${essay.recommended ? " shelf-card--recommended" : ""}" data-mission-card="${essay.slug}">
    <div class="shelf-card__top"><span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(essay.domain)}</span><span class="shelf-card__status">Unread</span></div>
    <h3><a href="essays/${essay.slug}.html">${escapeHtml(essay.title)}</a></h3>
    <p>${escapeHtml(essay.payoff)}</p>
    <div class="shelf-card__book"><cite>${escapeHtml(essay.book)}</cite><span>${escapeHtml(essay.mission)}</span></div>
    <a class="shelf-card__action" href="essays/${essay.slug}.html">${essay.recommended ? "Start here" : "Read the essay"} <span>→</span></a>
  </article>`).join("");
  const skipCards = skips.map((item) => `<article class="skip-card">
    <div><span>Skip verdict</span><h3>${escapeHtml(item.book)}</h3></div>
    <p>${escapeHtml(item.reason)}</p>
    <a href="reviews/${item.slug}.html">Read the evidence →</a>
  </article>`).join("");
  const body = `<main id="main" class="home-page">
    <section class="home-hero">
      <div class="home-hero__eyebrow">Clever essay overviews</div>
      <h1>Understand the idea.<br><em>Put it to work.</em></h1>
      <p>${essays.length} standalone essays explain useful ideas from technical books. Each includes a worked example, the limits of the idea, and an exercise with feedback. You do not need to read the original.</p>
      <p class="home-why"><em>Finish First</em> means exactly that: reach the idea a book was written to deliver first, and decide afterwards whether the book itself is worth your evening. Every essay names its source; none requires it.</p>
      <div class="home-hero__actions">
        <a class="button button--primary" href="essays/software-architecture-hard-parts.html">Read the recommended start</a>
        <a class="button button--quiet" href="#the-shelf">Browse ${essays.length} ideas</a>
      </div>
      <div class="home-proof"><span><strong>${essays.length}</strong> accepted books</span><span><strong>${skips.length}</strong> transparent skips</span><span><strong>1</strong> exercise per essay</span></div>
    </section>
    <section class="start-card" aria-labelledby="start-title">
      <div class="start-card__number">01</div>
      <div><span class="section-label">Recommended starting essay</span><h2 id="start-title">Turn the technology argument into a decision.</h2><p>The architecture essay supplies a method that transfers across the shelf: expose context, coupling, and consequences before choosing a tool.</p></div>
      <a href="essays/software-architecture-hard-parts.html">Begin with the trade-off table <span>→</span></a>
    </section>
    <section class="shelf-section" id="the-shelf">
      <div class="section-heading"><div><span class="section-label">The shelf</span><h2>${essays.length} ideas worth understanding</h2></div><p>Choose the idea that touches a decision you face now. The order is a recommendation, not a prerequisite chain.</p></div>
      <div class="shelf-grid">${cards}</div>
    </section>
    <section class="how-section">
      <div><span class="section-label">How to use this book</span><h2>An explanation you can use.</h2></div>
      <ol><li><span>01</span><strong>Choose a payoff</strong><p>Choose a problem or decision you want to understand.</p></li><li><span>02</span><strong>Work through an example</strong><p>Follow the steps and see why the result makes sense.</p></li><li><span>03</span><strong>Try the exercise</strong><p>Use the supplied scenario or apply the idea to your own work.</p></li><li><span>04</span><strong>Check your reasoning</strong><p>Compare with the worked answer and identify what you would change.</p></li></ol>
    </section>
    <section class="skip-section" id="transparent-skips">
      <div class="section-heading"><div><span class="section-label">Transparent skips</span><h2>Not every book earns an essay.</h2></div><p>These books were not selected during the original review. The records explain the evidence and edition limits behind those decisions.</p></div>
      <div class="skip-grid">${skipCards}</div>
    </section>
    <footer class="home-footer"><div><strong>Finish First</strong><p>Useful ideas, explained with examples you can follow.</p></div><p>Original companion prose. No source books or full-text extractions are published.</p></footer>
  </main>`;
  return shell({ title: "Understand the idea. Put it to work.", description: `${essays.length} standalone essays with clear explanations, worked examples, and exercises. No original-book reading required.`, body, pageClass: "home-view" });
}

fs.writeFileSync(path.join(out, "index.html"), homePage());
essays.forEach((essay, index) => fs.writeFileSync(path.join(out, "essays", `${essay.slug}.html`), essayPage(essay, index)));
skips.forEach((item) => fs.writeFileSync(path.join(out, "reviews", `${item.slug}.html`), reviewPage(item)));
for (const essay of essays) {
  const item = { slug: essay.slug, book: essay.book, reason: essay.caution };
  fs.writeFileSync(path.join(out, "reviews", `${essay.slug}.html`), reviewPage(item, true));
}
for (const asset of ["styles.css", "app.js"]) fs.copyFileSync(path.join(here, asset), path.join(out, "assets", asset));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
fs.writeFileSync(path.join(out, "404.html"), homePage());
console.log(`Built ${essays.length} essays and ${skips.length} skip records in docs/`);
