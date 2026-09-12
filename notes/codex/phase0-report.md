# Phase 0 report (Sonnet, codex unavailable)

Codex hit its usage limit (see `tools/log/codex-phase0.log`); this Phase 0 was done by a
Claude Sonnet agent following `notes/codex/phase0-spec.md` step by step.

## Files created or changed

- `site/build.mjs` — rewritten for the `meta/parts/courses/essays/skips` catalog shape.
  Builds essays that are `status === "published"` (or all, with `--all`/`BUILD_ALL=1`) **and**
  have an `essays/<slug>.md` file on disk — most catalog entries are still `pitched` with no
  file yet, so this filter matters. Index groups built essays by `parts` order; a part with none
  shows the heading and "No essays published yet." Essay hero shows the part label and the
  `mechanism` sentence; a `<details class="source-notes">` lists every `sources[]` entry in
  words (course lectures collapsed to ranges, e.g. "lectures 2.3, 3.5–3.7"; book entries pull
  the title from `resources/MANIFEST.tsv`; paper entries show id + section), plus `caution`.
  Renders `about.md` to `docs/about.html`, added "About" next to the home link. Drops
  `reviews/`/skip-grid unless `skips` is non-empty. All "Finish First" wording removed.
- `site/check.mjs` — rewritten to mirror build.mjs's essay-selection filter (only checks pages
  that were actually built), expects `about.html`, and extends the leaked-path check to
  `/home/diablo/udemy-subs`, `resources/`, `Telegram Desktop`, `/mnt/c/`.
- `site/app.js` — one string changed: the localStorage key `finish-first:completed-missions` →
  `model-not-code:completed-missions` (the only other "Finish First" residue).
- `site/catalog.mjs` — one comment line added per spec step 6 ("Book keys used in sources[] are
  defined in resources/MANIFEST.tsv."); nothing else touched.
- `checks/receipts.mjs` (new) — resolves course/book/paper receipts for every essay with a
  drafted `.md` file, validates the six-column schema and label set against
  `corpus/SCHEMA.md`, exits 1 on any failure.
- `checks/paraphrase.mjs` (new) — 12-word shingle failures (gating) and 8-word warnings against
  every cited course's full lecture set, with a quote+allow-list suppression for deliberate
  ≤8-word quotations.
- `checks/paraphrase-allow.tsv` (new, auto-created by the script) — header + comment line only.
- `checks/consistency.mjs` (new) — 5-grams shared by ≥3 essays and opener-word collisions/bans
  are the two gating failures; hedge density and anthropomorphism are advisory warnings.
- `resources/MANIFEST.tsv` (new) — all 22 rows resolved on disk (see below); no `MISSING` rows.
- `scripts/review.sh`, `scripts/readers.sh` (new, `chmod +x`) — ported from
  `book4/scripts/{review,readers}.sh`. Input accepts a slug or `essays/<slug>.md`; output to
  `checks/reviews/<slug>`/`checks/readers/<slug>`; default models
  `gemini-3.8-flash-high`/`gemini-3.1-pro-high`/`gpt-5.6-sol`; consolidation prompt asks codex
  to verify against `CONTEXT.md §3–§5b`, `corpus/<slug>/receipts.tsv` and the cited lecture
  files, recompute arithmetic, and write "Confirmed findings / Rejected findings / Publication
  judgment". Reader lanes `codex:senior-dev`, `flash:working-mle`, `pro:stats-sceptic`,
  `flash:hiring-manager`, feeding the essay with `<!--mission-->` stripped. Failure handling
  (empty output = failure, either lane may fail without aborting, `< /dev/null` for codex) kept.
- `.gitignore` — added `!resources/MANIFEST.tsv` (the file is documented as committed in
  `resources/README.md` and `CONTEXT.md §9`/step 6, but the existing ignore rule excepted only
  `README.md`; without this the manifest could not be committed).
- `package-lock.json` — produced by `npm install` (`node_modules` did not exist; no new
  dependency was added, `marked` was already in `package.json`).

Not touched: `CONTEXT.md`, `AGENT.md`, `notes/BRIEF.md`, `notes/pitches/` (other agents were
writing there), `site/styles.css` (no new CSS classes were required; existing classes were
reused).

## Smoke test (spec step 8)

Created a temporary `essays/kv-cache.md` (H1 matching the catalog title exactly, three
paragraphs, one `<!--mission-->`, an "## Exercise" section, `*Sources: placeholder*`) and
`corpus/kv-cache/receipts.tsv` with one `observed` row citing `course-6538601` lecture `03-07`.

- `BUILD_ALL=1 npm run build` → `Built 1 of 30 essays in docs/ (0 skip records).`
- `BUILD_ALL=1 npm run check` → site check passed (3 HTML pages); receipts: 1 passed/0 failed;
  paraphrase: 0 failures/0 warnings (checked against all 7 courses, since `BUILD_ALL=1` doubles
  as `--all` for the paraphrase corpus per spec).
- `node checks/consistency.mjs` → 1 essay scanned, 0 failing conditions.
- `npm run build && npm run check` (no flags, empty shelf) → `Built 0 of 30 essays`; site check
  passed (2 HTML pages: index + about); receipts/paraphrase still scan the drafted `.md` file
  (0 failures) since those two checks run on every existing essay file regardless of build
  status, per spec §3/§4.

All four runs green. Deleted `essays/kv-cache.md`, `corpus/kv-cache/`, and `docs/` afterward;
`git status` shows no essay, no corpus directory, no `docs/`.

## `resources/MANIFEST.tsv` — rows needing a note

No row is `MISSING`; every file in the spec's table was found on disk (one filename in the
spec table used underscores where the real file uses spaces/parens — `burkov-mle` resolved to
`books/Machine Learning Engineering (Andriy Burkov) (2).pdf`).

- `pages: unknown` — three EPUBs (`pdfinfo` doesn't read EPUB page counts): `lapan-drl`,
  `llm-serving`, `ml-system-design`. Their titles came from each EPUB's `dc:title` metadata
  instead (clean: "Deep Reinforcement Learning Hands-On", "Hands-On LLM Serving and
  Optimization", "Machine Learning System Design").
- No embedded PDF `Title` (title built from the filename instead): `burkov-mle`, `llm-deep-dive`,
  `owasp-llm`, `instructgpt` (used the paper's known title from the spec table itself, since
  `pdfinfo` returned an empty Title on `2203.02155v1.pdf`).
- `quant-ru` and `smol-playbook-ru` keep their Russian titles (from the PDF metadata / filename
  respectively) per `CONTEXT.md §10`'s Russian-language sources.

## Not done / left for the author or a later session

- `checks/receipts.mjs`'s book-page check trusts the manifest's `pages` count but, as the schema
  says, cannot confirm a cited page says what the paraphrase claims — that's the reviewer/author
  job, unchanged from the spec's stated limits.
- The `resources/` symlink targets are on the Windows side (`/mnt/c/...`); `pdfinfo`/`unzip`
  read them fine here, but if this repo runs on a machine without that mount the manifest will
  need to be re-verified (not re-generated — the committed TSV should still be correct).
- `scripts/review.sh`/`readers.sh` were syntax-checked (`bash -n`) and structurally ported but
  not run end-to-end (no essay is drafted yet, and `agy`/`codex`/model calls were not exercised
  in this session to avoid burning review-lane quota on a placeholder).
- Did not touch `site/styles.css` or add any new CSS classes; the "About" link and empty-part
  message use existing classes/plain anchors, so they render but are not specially styled.
