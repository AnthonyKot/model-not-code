# RESUME — The Program Is Now a Model (book20)

Read this first in any new session, then only the files it names. Updated 2026-09-13 (night).

## Where the book is

Eight project chapters on one online shop, written from scratch (plan: `notes/chapters/CHAPTER-PLAN.md`,
revision 2, approved). The twelve earlier essays are an archive at `/old/` on the site; old URLs redirect.

| Ch | Slug | State |
|---|---|---|
| 1 | `search-the-catalogue` | published; Gemini review in, findings verified, **not applied** |
| 2 | `trust-the-number` | published; Gemini review + 3 readers finished (2026-09-13 22:54), findings not yet verified |
| 3 | `reuse-a-pretrained-model` | published; Gemini review + 3 readers finished, findings not yet verified |
| 4 | `train-from-reward` | **prepared, no prose**: `workspace/train-from-reward/NOTES.md`, `PROTOTYPE.md`, `exercise_proto.py`; draft receipts `corpus/train-from-reward/receipts.tsv` |
| 5–8 | see plan | not started; each needs a one-page outline approved by the author before prose |

Live: https://anthonykot.github.io/model-not-code/ (chapters) · `/old/` (archive).

## The author's review (in progress)

The author reads chapters 1–3 on Pages and gives feedback in chat. Feedback can be anything: a rule for all
chapters (register, length, exercise style), or a passage to change. **Apply chapter-specific feedback to
that chapter; record any general rule in `CONTEXT.md` §4 and `notes/essays/DRAFTING-BRIEF.md` so chapters
4–8 follow it, then check chapters 1–3 against the new rule.**

External review (Gemini lanes; codex consolidation failed on quota until 2026-09-14 01:36):
- Reports: `checks/reviews/<slug>/{flash,pro}.json`, `checks/readers/<slug>/*.md`. Nothing is applied automatically.
- Chapter 1 findings already verified (accept all unless the author objects): worked training table skips
  step 4; three rounding slips in the contrastive-step table and the next-token loss (display 4 decimals or
  recompute from printed values); chapter 3 says chapter 1's attention has four projections but chapter 1's
  block has q, k, v only (add the output projection sentence in ch 1 §3, fix ch 3's wording); explain the
  `q − cos × d` step in one line; one sentence on approximate nearest-neighbour indexes at catalogue scale
  (source: course-6199297 03-04 / 03-14, machine-translated captions); "Training needs to know" → no
  anthropomorphism; rename "Where the positions come from" (collides with position vectors).
- Chapters 2–3: consolidate by hand (or rerun `scripts/review.sh <slug>` after codex resets), verify each
  finding against `corpus/<slug>/run*.log` and receipts, apply the confirmed ones, log accepted/rejected in
  `notes/chapters/<slug>.md`.
- After any edit: rerun the exercise if code changed, `npm run build && npm run check`, commit, push.

## Next section after the review: chapter 4 prose

Write `chapters/train-from-reward.md` from `workspace/train-from-reward/NOTES.md` + `PROTOTYPE.md`, applying
the review feedback first. Re-run the final exercise into `corpus/train-from-reward/run.log` (the prototype
log is not the final one); run every "thing to try" before stating it. Precision rules are in NOTES.md
(measured vs learned vs assumed; clip vs KL penalty are different guards; the designed-in reward hack must
be labelled as designed). Register the chapter in `site/catalog.mjs` (`status: "published"`, sources,
caution), write `notes/chapters/train-from-reward.md`, update CONTEXT §9, this file and the plan's process list.

## Rules that bind every session (full text: CONTEXT.md §4–§5b, DRAFTING-BRIEF "The author's rules")

- The book is the source of truth: prose never says "the course", "the lecturer", "reported", or names a
  source for a fact; provenance lives in `corpus/<slug>/receipts.tsv` and the italic credit line.
- No numbers from memory: derived on the page, run in a script (log in `corpus/<slug>/`), or receipted.
  Check book authors and product facts against the primary (PDF metadata, installed package source).
- Practitioner register: introduce a knob where a practitioner meets it (an API field, a library argument,
  a PyTorch line); connect it precisely across chapters; no trivia, no defining basics at length.
- Every display formula glossed term by term; worked examples small enough to write, then real sizes;
  arithmetic over three terms in a table; a shape or flow gets an inline SVG.
- One exercise per chapter: real PyTorch on CPU, no downloads, run, walk-through, expected result as printed.
  Synthetic demonstrations labelled; a section on what a real project adds.
- Paid course captions: paraphrase only (`checks/paraphrase.mjs` must pass).
- Main session writes chapters sequentially; codex for mechanical work; no subagent drafting unless asked.
- Commit with the session's attribution trailer; push; Pages builds from `docs/`.
