# The Program Is Now a Model

Standalone essays (being merged into project chapters — `notes/chapters/CHAPTER-PLAN.md`) for a senior software developer moving into ML and AI engineering. One
mechanism per essay, explained so you can recompute the worked example, with an exercise you can
do without a GPU or a paid API.

Published at https://anthonykot.github.io/model-not-code/ (GitHub Pages from `docs/`).

## How it is built

- `essays/<slug>.md` — one markdown file per essay; `site/catalog.mjs` is the register (order,
  part, mechanism, sources, status).
- `npm run build` renders `docs/`; `npm run check` runs the structural check, the receipt check
  and the paraphrase guard; `npm run consistency` reports shelf-wide repetition and hedging.
- `scripts/review.sh <slug>` and `scripts/readers.sh <slug>` run the review lanes; nothing is
  applied automatically.

## Sources and what is checked

The essays draw on seven Udemy courses the author is enrolled in and on books in the author's
library, all named on the page and in `about`. Lecture transcripts and book text stay local and
ignored by Git; every citation is a receipt that a check resolves to a lecture file or a manifest
page. `CONTEXT.md §8` says what the checks prove and what they cannot.

`CONTEXT.md` is the authoring constitution; `AGENT.md` the working contract; `notes/BRIEF.md`
the essay contract.
