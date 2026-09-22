# The Program Is Now a Model

Eight project chapters on one online shop for a senior software developer moving into ML and AI
engineering, written from scratch; the earlier standalone essays are kept as an archive at `/old/`.
Each chapter tells one story stated in its first paragraph (the shape is `notes/chapters/STORY-MAP.md`;
the original plan is `notes/chapters/CHAPTER-PLAN.md`), keeps its derivations in folds, and links to a
lab page where the exercise runs on a CPU and prints an expected result. Three tool appendices are
planned in `notes/chapters/APPENDIX-PLAN.md`.

Published at https://anthonykot.github.io/model-not-code/ (GitHub Pages from `docs/`).

## How it is built

- `chapters/<slug>.md` — one markdown file per chapter; `labs/<slug>.md` — its exercise, with the
  `<!--mission-->` marker that gives the lab page its completion button; `essays/<slug>.md` — the
  archived essays. `site/catalog.mjs` is the register for chapters and essays (`chapters[]`, `essays[]`).
- `npm run build` renders `docs/`; `npm run check` runs the structural check, the receipt check
  and the paraphrase guard; `npm run consistency` reports shelf-wide repetition and hedging;
  `python3 scripts/reading-path.py chapters/<slug>.md` counts the reading path and the folds.
- `scripts/review.sh <slug>` and `scripts/readers.sh <slug>` run the review lanes; nothing is
  applied automatically.

## Sources and what is checked

The essays draw on seven Udemy courses the author is enrolled in and on books in the author's
library, all named on the page and in `about`. Lecture transcripts and book text stay local and
ignored by Git; every citation is a receipt that a check resolves to a lecture file or a manifest
page. `CONTEXT.md §8` says what the checks prove and what they cannot.

`CONTEXT.md` is the authoring constitution; `AGENT.md` the working contract; `notes/BRIEF.md`
the essay contract.
