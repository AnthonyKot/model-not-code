# RESUME — The Program Is Now a Model (book20)

Read this first in any new session, then only the files it names. Updated 2026-09-14.

## Where the book is

Eight project chapters on one online shop, written from scratch (plan: `notes/chapters/CHAPTER-PLAN.md`,
revision 2, approved). The twelve earlier essays are an archive at `/old/` on the site; old URLs redirect.

| Ch | Slug | State |
|---|---|---|
| 1 | `search-the-catalogue` | published; Gemini review in, findings verified, **not applied** |
| 2 | `trust-the-number` | published; Gemini review + 3 readers finished (2026-09-13 22:54), findings not yet verified |
| 3 | `reuse-a-pretrained-model` | published; Gemini review + 3 readers finished, findings not yet verified |
| 4 | `train-from-reward` | published 2026-09-14 (before the review); not yet through review lanes; notes `notes/chapters/train-from-reward.md` |
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

## Next after the review

Chapter 4 is written (2026-09-14). After the author's feedback on chapters 1–4: apply it (general rules to
chapters 1–4 alike), run `scripts/review.sh train-from-reward` and `scripts/readers.sh train-from-reward`, and
verify findings against `corpus/train-from-reward/run*.log`. Then chapter 5: a one-page outline (project +
sections + exercise idea + sources) for the author's approval before any prose.

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
