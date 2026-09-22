# RESUME — The Program Is Now a Model (book20)

Read this first in any new session, then only the files it names. Updated 2026-09-14 (evening). Review tooling: `scripts/codex-review.sh` (codex, read-only, exact replacements) and `scripts/gemini-review.sh` (second round → proposal2.md); reports in `checks/reviews/<slug>/`, decisions logged in `notes/chapters/<slug>.md`. Author: one more codex run allowed if needed; none running.

## Rework in progress — 2026-09-22

**Authority: `notes/chapters/STORY-MAP.md`.** The author's read of the whole book: chapters are visible
concatenations of the essays, and they go so deep into specific computations that the picture is lost.
Decision: keep the eight chapters and the shop; rebuild each around one story stated in its opening
paragraph; fold derivations into `<details>`; move every exercise to `labs/<slug>.md` with the
`<!--mission-->` marker; target 2,000–2,700 words on the reading path. Yardstick is `~/book1`.
Order: chapter 3 is the pilot (author reads it first), then 1, 2, 4, then 5–8. Where STORY-MAP
disagrees with `CHAPTER-PLAN.md` or `review.md`, STORY-MAP wins.

**Pilot done, 2026-09-22 (Claude main session):** chapter 3 reworked to the card (story paragraph, pause, four
story-step beats, seven folds, two worked questions, bridge; reading path 2,698 words, 25% folded); its exercise
moved verbatim to `labs/reuse-a-pretrained-model.md`; `site/build.mjs` now builds `docs/labs/<slug>.html` with the
mission wrapper and completion button, and `check.mjs` / `paraphrase.mjs` cover labs. Exercise re-run identical.
Decisions and counts: `notes/chapters/reuse-a-pretrained-model.md`. **Chapter 1 reworked the same way on the author's go-ahead (2026-09-22; reading path 2,696 words, 25% folded;
lab moved; exercise re-run identical).** Owed: the author's read of chapters 3 and 1; then chapters 2 and 4. Interpreter: the scratch venv is gone; PyTorch 2.14.0 (cu130 build, CPU) is at
`~/.gemini/antigravity-cli/scratch/myenv/bin/python`. Chapters 1, 2, 4–8 untouched; not pushed.

## The book is complete — 2026-09-17

**Rework applied, 2026-09-17 (Claude main session, Codex out of tokens):** chapter 6's case B now retrieves the edited chunk for the customer's question (top-3 search, a scripted reading rule, a clean control), and its T1 discussion accepts retrieval plus an unsupported attribution; chapter 8 adds six held-out paraphrases and a click-log lookup comparator and conditions the ledger on the held-out rates (break-even 3,001 then 300 a month at 15%). Independent AGY review: chapter 6 pass, chapter 8 three text fixes applied; `checks/reviews/rework-2026-09-17/report.md`. Decisions in both chapter notes; exercises re-run on PyTorch 2.14.0+cpu (scratch venv; the earlier interpreter no longer exists). The tabular chapter stays deferred. The author's read of chapters 5–8 remains outstanding.

**Agent editorial read, 2026-09-17:** at the author's request, Codex read chapters 5–8 in full before reassessing a proposed tabular-ML addition. Recommendation: defer expansion; repair chapter 6's injection demonstration and diagnostic feedback first, then tighten chapter 8's training-pair comparison. Evidence and bounded follow-up: `notes/reviews/chapters-05-08-read-2026-09-17.md`. This was an agent read, not the author's read or a fresh exercise run; chapter content is unchanged.

All eight chapters are published. Owed: the author's read of chapters 5–8 (each has a bounded reader decision; the
author's own attempt is the only human evidence about them). Ideas still in the pool for chapters 1–4: a prediction pause
per chapter, a preview of chapter 3's choice table, reader decisions modelled on chapters 5–8, chapter 1's cosine
derivation folded if it interrupted the author. Solver records: `notes/reviews/solver-0{5,6,7,8}-*`.

## Chapter 8 published — 2026-09-17

`did-the-shop-need-a-model`: the ledger and its break-even; a rule and the encoder on chapter 6's golden set; the
course's ladder read with intervals; a closing table of what the shop keeps, questions and would need to see; the
reader's ledger on chapter 2's classifier. Evidence and decisions: `notes/chapters/did-the-shop-need-a-model.md`.

## Chapter 7 published — 2026-09-17

`serve-the-assistant-cheaply`: KV cache (42 vs 9 key/value rows), four-bit blocks by hand with the outlier, batching
as arithmetic intensity with the CPU's own crossover, a lever table, and a reader case on a serving report where the
proposed bigger card is capped at 1.4x and four-bit weights are the first lever. Evidence and decisions:
`notes/chapters/serve-the-assistant-cheaply.md`.

## Chapter 6 published — 2026-09-16

`build-the-assistant`: golden-set retrieval metrics, chunk boundary, tool loop with dispatch table and confirmation
rule, injected coupon instruction refused while the writer still misreports it, reader case of three wrong answers.
Evidence and decisions: `notes/chapters/build-the-assistant.md`. Reader-task rules from the chapter 5 solver applied.

## Chapter 5 published — 2026-09-16

`keep-it-right-after-launch`: artifact bundle, three clocks, autoencoder alarm, banner (loud alarm, flag intact) and
folding knives (silent, recall 0.763 → 0.491), audit priced at 3 per listing, feedback loop, shadow gate (margin and
recall floor), reader decision on a second quarter. Evidence and decisions: `notes/chapters/keep-it-right-after-launch.md`.
Chapters 1–4 targeted fixes committed and published in the same push. Proposed next (not started, author to confirm):
move chapter 2's loader section after the release record as a practical aside; cut chapter 4's target-network/replay
paragraph to one sentence; preview chapter 3's choice table near its opening; chapter 1's cosine derivation only if the
author found it interrupting; one prediction pause per chapter 1–4.

## Local targeted fixes — 2026-09-16

The author authorized small fixes from the learning-design reports. Chapter 2 now includes the listing-level release step in its mission, rerun with the expected release values; chapter 1 labels training-pair fit and has a readable, scrollable mobile pipeline; chapter 3 labels writer training-string losses; chapter 4 clarifies the policy and the same-product held-out pairs. Details and verification are appended to each chapter note. These changes are local and not published; the status table below describes the earlier published baseline. The author reports chapter 5 work proceeding separately; the old 5–8 row predates that work.

Next discussion: whether the chapter 2 loader, chapter 4 Q-learning/replay material and chapter 1 cosine-gradient derivation should be optional. The author explicitly asked to discuss before restructuring; all sections remain in place.

## Guidance update — 2026-09-16

Author requested improving Markdown prompts and guidance from Book21's review findings.
`notes/chapters/REVIEW-GUIDE.md` now defines the shared method; the chapter checklist and
Codex/Gemini actionable prompt include focus, independent judgment, combined disclosure and
assessment fairness. `review.md` remains editorial leads, not completed revisions. The archived
essay checklist also points to the applicable principles. No chapter content, review history or
publication state changed, and no external review was run for this documentation update.
For the next authorized chapter revision, read the guide and verify its chapter-specific leads first.

## Where the book is

Eight project chapters on one online shop, written from scratch (plan: `notes/chapters/CHAPTER-PLAN.md`,
revision 2, approved). The twelve earlier essays are an archive at `/old/` on the site; old URLs redirect.

| Ch | Slug | State |
|---|---|---|
| 1 | `search-the-catalogue` | published; codex actionable review + verified Gemini findings applied, exercise Part 2 now retrieval → generator (2026-09-14); Gemini round 2: 0 proposals |
| 2 | `trust-the-number` | published; codex review applied (release reported per listing; exercise stays per photo — author may want a full per-listing rebuild); Gemini round 2: 2 applied |
| 3 | `reuse-a-pretrained-model` | published; codex review applied (12) incl. new "What the synthetic run leaves out"; Gemini round 2: 1 applied |
| 4 | `train-from-reward` | published 2026-09-14; codex review applied (48 demonstrations, corridor label, clip wording); Gemini round 2: 0 proposals |
| 5 | `keep-it-right-after-launch` | published 2026-09-16 from an approved outline (author's three decisions in `notes/chapters/keep-it-right-after-launch-outline.md`); Gemini first-round review: 2 proposals applied; first chapter with a bounded reader decision (hints and discussion collapsed); author's read owed |
| 6 | `build-the-assistant` | published 2026-09-16 from an approved outline; Gemini first round: 3 applied; blind Haiku solve clean; author's read owed |
| 7 | `serve-the-assistant-cheaply` | published 2026-09-17; Gemini first round: 4 applied (one was a leaking prediction pause); blind Haiku solve on the pre-review packet; author's read owed |
| 8 | `did-the-shop-need-a-model` | published 2026-09-17; Gemini first round: 7 applied; blind Haiku solve found two arithmetic errors, fixed; author's three ending notes applied; author's read owed |

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
