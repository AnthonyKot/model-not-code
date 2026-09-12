# Phase 0 mechanical work — spec for codex (2026-09-12)

You are working in `/home/diablo/book20`, a fresh fork of `/home/diablo/book11`'s site
generator. Read `CONTEXT.md`, `AGENT.md`, `corpus/SCHEMA.md`, `site/catalog.mjs` and
`resources/README.md` first. Do not draft essays. Do not edit `CONTEXT.md`, `AGENT.md`,
`site/catalog.mjs` (except as noted in step 6), or anything under `notes/` other than
`notes/codex/phase0-report.md`, which you write at the end. Do not commit. Write files as you
go; if you are interrupted, what is on disk must be usable.

## 1. `site/build.mjs` — adapt to this book's catalog

The catalog now exports `meta`, `parts`, `courses`, `essays`, `skips`. Essay fields:
`slug, part, title, mechanism, sources[], status, domain, payoff, artifact, mission,
missionLabel, caution, recommended`. `sources[]` entries are `{kind:"course", course, lectures[]}`,
`{kind:"book", key, pages}`, `{kind:"paper", id, section}`.

- Site name, subtitle and repo link come from `meta`. Remove all "Finish First" wording.
- Build only essays with `status === "published"` unless invoked with `--all` (also honour
  `BUILD_ALL=1`). The index groups essays by `parts` order with the part title as a heading; a
  part with no built essays shows the heading and one line "No essays published yet."
- Essay page: hero with title, part label ("Part IV · Serving and inference"), the `mechanism`
  sentence under the title, then the rendered markdown (leading H1 stripped as before), the
  mission wrapping exactly as before, then a collapsed `<details class="source-notes">` titled
  "Sources and limits" that lists every `sources[]` entry in words: course entries as
  "*<course title>* (Udemy, <by>), lectures 7.1, 7.3–7.6" — convert `NN-NN` to `N.N` and
  collapse consecutive runs; book entries as the `title` column of `resources/MANIFEST.tsv` for
  that key, plus `pages` if non-empty; paper entries as the id and section; then the `caution`
  text if non-empty. The translated course (`courses[id].note`) adds its note.
- Render `about.md` to `docs/about.html` with the same shell and add "About" to the nav next to
  the home link. Drop the `reviews/` pages and the "Transparent skips" grid unless `skips` is
  non-empty. Keep `docs/404.html`, `.nojekyll`, assets copy.
- Keep the prev/next pager, but only across built essays.

## 2. `site/check.mjs`

Keep every existing assertion. Extend the private-path leak check to also fail on
`/home/diablo/udemy-subs`, `resources/`, `Telegram Desktop`, `/mnt/c/`. Expect `about.html`.
Only check pages that were built (respect the same `--all` / `BUILD_ALL`).

## 3. `checks/receipts.mjs` (gating; exit 1 on any failure)

For every essay in the catalog whose `essays/<slug>.md` exists, and for every row of
`corpus/<slug>/receipts.tsv` if present:
- course receipts (`course` + `NN-NN`): exactly one file must match
  `resources/udemy-subs/course-<id>/<NN-NN>-*.txt`, excluding `.en.txt` unless the course's
  `lang` is not `en`, in which case the `.en.txt` is the one that must exist. Report the
  resolved filename.
- book receipts: the key must exist in `resources/MANIFEST.tsv`; if the row has a page or range
  and the manifest has a numeric `pages`, the page must be ≤ pages; if `pages` is `unknown`
  report **skipped** (never passed).
- paper receipts: the id must be non-empty; report as **unchecked**.
Also validate `receipts.tsv` columns against `corpus/SCHEMA.md` (six columns, allowed labels).
Print a per-essay summary line and a total; exit 1 if any failure.

## 4. `checks/paraphrase.mjs` (gating)

For every existing `essays/<slug>.md`: normalise text (lowercase; strip punctuation; collapse
whitespace; drop the tokens `um uh uhm er ah like`); build the set of 12-word shingles from every
lecture file of every course the essay cites in the catalog (`--all` = every course under
`resources/udemy-subs`, ~1.2M words; fine in memory); any essay 12-word shingle found in that set
is a failure (print the run and the lecture file); 8-word hits are warnings (print up to 20).
`checks/paraphrase-allow.tsv` (`slug	phrase`) lists deliberate quoted phrases of ≤ 8 words that
suppress the warning when they appear inside quotation marks in the essay. Exit 1 on failures.
Create the allow file with a header and a comment line.

## 5. `checks/consistency.mjs` (advisory except the 5-gram rule)

Across all existing essays: 5-grams shared by three or more essays → failure (print them);
the first word of each essay's first paragraph → fail if any two essays share it or if it is
Suppose/Consider/Imagine; hedge density per 1,000 words for `may might often usually perhaps
arguably somewhat` → warn above 5; anthropomorphism words `understands knows wants decides
believes thinks hallucinates` → warn with counts per essay. Exit 1 only on the two failures.

## 6. `resources/MANIFEST.tsv`

Columns: `key	kind	path	size_mb	pages	title	edition_note`. `path` is relative to
`resources/` (the symlinks `resources/books` → Telegram Desktop folder and
`resources/downloads` → Downloads root exist). Use `pdfinfo` for PDF page counts and titles;
`unknown` for EPUB pages. Rows, with the file to locate by name under the symlinks (use `ls`
with a glob if a name is truncated here):

| key | file |
|---|---|
| huyen-dmls | downloads/ABUIABA9GAAghIK0ugYowM2h3QY.pdf (title "Designing Machine Learning Systems") |
| geron-pytorch | books/hands.on.machine.learning.with.scikit.learn.and.pytorch.pdf |
| geron-keras | books/_Hands_On_Machine_Learning_with_Scikit_Learn,_Keras,_and_TensorFlow.pdf |
| raschka-qai | books/machine.learning.q.and.ai.pdf |
| burkov-mle | books/Machine_Learning_Engineering (Andriy Burkov) (2).pdf |
| lapan-drl | books/Deep_Reinforcement_Learning_Hands_On,_3rd_Edition_Maxim_Lapan (2).epub |
| dist-ml-patterns | books/Manning.Distributed.Machine.Learning.Patterns (2).pdf |
| inference-eng | books/Inference Engineering.pdf |
| llm-serving | books/hands.on.llm.serving.and.optimization (2).epub |
| building-llm-apps | books/building.llm.powered.applications.pdf |
| stats-programmers | books/statistics.every.programmer.Needs.pdf |
| quant-ru | books/Введение в Квантизацию.pdf |
| llm-deep-dive | books/Large_Language_Models_A_Deep_Dive_Bridging_Theory_and_Practice_Uday.pdf |
| owasp-llm | books/owasp.top.10.for.llms.pdf |
| llm-security-playbook | books/the.developers.playbook.for.llm.security.pdf |
| staff-eng-path | books/the.staff.engineer's.path.pdf |
| ml-system-design | books/machine.learning.system.design (2).epub |
| acing-sdi | books/Manning.Acing.the.System.Design.Interview.pdf |
| ds-hard-parts | books/data_science_the_hard_parts*.pdf |
| ts-foundation | books/time.series.forecasting.using.foundation.models.pdf |
| smol-playbook-ru | books/SMOL_*.pdf (Russian translation of the HF Smol training playbook) |
| instructgpt | books/2203.02155v1.pdf (kind `paper`, "Training language models to follow instructions with human feedback") |

Title column: `pdfinfo` Title if present, else a sensible title from the filename. If a file is
missing, keep the row with `path` = `MISSING:<pattern>` and say so in the report. In step 6 you
may add a one-line comment at the top of `site/catalog.mjs` noting that book keys are defined in
`resources/MANIFEST.tsv` — nothing else in that file.

## 7. `scripts/review.sh` and `scripts/readers.sh`

Port from `/home/diablo/book4/scripts/review.sh` and `readers.sh` (read them fully first).
Changes: input is a slug or `essays/<slug>.md`; the body is the markdown; `OUT=checks/reviews/<slug>`
and `checks/readers/<slug>`; default `FLASH_MODEL=gemini-3.8-flash-high`, `PRO_MODEL=gemini-3.1-pro-high`,
`CODEX_MODEL=gpt-5.6-sol`; the checklist is `scripts/prompts/review-checklist.md`; the
consolidation prompt tells codex to verify findings against `CONTEXT.md §3–§5b`,
`corpus/<slug>/receipts.tsv`, the cited lecture files under `resources/udemy-subs/`, and to
recompute any arithmetic finding, and to write `report.md` with "Confirmed findings", "Rejected
findings" and "Publication judgment" sections as book4's does. `readers.sh` lanes:
`codex:senior-dev`, `flash:working-mle`, `pro:stats-sceptic`, `flash:hiring-manager`, personas in
`scripts/prompts/readers/*.txt` with `_frame.txt` split on `---` as in book4; feed the essay
markdown with the `<!--mission-->` marker removed. Keep all of book4's failure handling (empty
output counts as failure; either lane may fail without aborting; `< /dev/null` for codex).
`chmod +x` both.

## 8. Smoke test, then clean up

Create a temporary placeholder `essays/kv-cache.md` (an H1, three short paragraphs of your own
words stating it is a placeholder, one `<!--mission-->`, a final "## Exercise" section, a
`*Sources: placeholder*` line) and a temporary `corpus/kv-cache/receipts.tsv` with the header
and one `observed` row citing `course-6538601` lecture `03-07`. Run `BUILD_ALL=1 npm run build`,
`BUILD_ALL=1 npm run check`, `node checks/consistency.mjs`, and `npm run build && npm run check`
without `--all` (empty shelf). Fix until all are green. Then **delete** the placeholder essay,
its corpus directory and `docs/` (docs is generated; it will be built at publish time). Confirm
`git status` shows no essay and no corpus directory.

## 9. Report

Write `notes/codex/phase0-report.md`: what was created or changed (paths), the smoke-test output
summary, the MANIFEST rows with `unknown` or `MISSING`, and anything you could not do. Keep it
under 120 lines.
