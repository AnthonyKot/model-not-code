# RESUME — The Program Is Now a Model (book20)

Read this first in any new session, then only the files it names. Updated 2026-09-22 (the rework section below is current; everything under it is history). Review tooling: `scripts/codex-review.sh` (codex, read-only, exact replacements) and `scripts/gemini-review.sh` (second round → proposal2.md); reports in `checks/reviews/<slug>/`, decisions logged in `notes/chapters/<slug>.md`. Author: one more codex run allowed if needed; none running.

## Rework in progress — 2026-09-22: all eight chapters done; next is the cross-check of 8, then the site copy

**Authority: `notes/chapters/STORY-MAP.md`** (its §7 has the status and the lessons from the first three).
The author's read of the whole book: chapters are visible concatenations of the essays, and they go so
deep into specific computations that the picture is lost. Decision: keep the eight chapters and the shop;
rebuild each around one story stated in its opening paragraph; fold derivations into `<details>`; move
every exercise to `labs/<slug>.md` with the `<!--mission-->` marker. Where STORY-MAP disagrees with
`CHAPTER-PLAN.md` or `review.md`, STORY-MAP wins.

**State.** Chapters 3 (pilot), 1 and 2 are reworked and committed (`1115505`, `8840699`, `eeb9442`,
lab link repairs `fa86b08`); the author's provisional verdict on all three is OK, 7 of 10 (2026-09-22,
given as an assumption in chat rather than a line-by-line read). Chapter 4 is reworked (2026-09-22,
later the same day; path 2,696, folds 25.1%, page 3,598; the corridor is one beat of 443 words and the
writer is named in the first sentence; see the note's "Story-map rework" entry). Chapter 5 is reworked (2026-09-22; path 2697, folds 25.4%, page 3613; the "chapter 1's mean squared error"
reference now points at the formula glossed beside it). Chapter 6 is reworked (2026-09-22; path 2325,
folds 24.4%, page 3076; its first draft came in short and over-folded, and two folds went back on the
page). Chapter 7 is reworked (2026-09-22; path 2103, folds 25.4%, page 2820; its re-run matched every
exact line and, as its text says, not the timing lines). Chapter 8 is reworked (2026-09-22; path 2694, folds 22.7%, page 3486; the pause sits before the break-even
reveal, the old vendor-table pause became worked question 2, and receipt `dsn-42` was repaired; its re-run
matched `run.log` byte for byte). Nothing is pushed; catalog status is still `published` for all eight, so
the live site is unchanged until the next push. Every chapter now has its exercise in `labs/<slug>.md`. Site support for labs is in place:
`site/build.mjs` builds `docs/labs/<slug>.html` with the mission wrapper and completion button when
`labs/<slug>.md` exists, the chapter page gets an "Open the lab" block, `site/check.mjs` and
`checks/paraphrase.mjs` cover labs, `site/styles.css` has the fold style, and `site/app.js` opens folds
for print.

**Next, in order.** Cross-check chapter 8 against 1–7 (bridges, cross-references, numbers quoted from
another chapter's run, old heading names in chapters, labs and site copy; chapter 7's bridge misreads the
break-even as "3,001 a month" and needs the repair). Then:
`about.md`, the home-page copy in `site/build.mjs`, `README.md` and `CONTEXT.md` §1 (they still say the
exercise is on the chapter page), then push. After the push: the three tool appendices planned in
`notes/chapters/APPENDIX-PLAN.md` (agreed 2026-09-22; A first).

**Per chapter** (STORY-MAP §5, as run three times):

1. `labs/<slug>.md`: a `# Lab: …` title, a two-line header naming the chapter and linking
   `../chapters/<slug>.md`, any setup material the card sends to the lab, then `<!--mission-->` and the
   `## Exercise` section moved verbatim (diff it). Replace any "section N" or "above" phrases in the
   moved walk-through with the new heading names; change nothing else in it.
2. Rewrite the chapter to the card: story paragraph with its number, a two-to-four-sentence map, beats
   with story-step headings (no heading may be a mechanism name), each beat opening as the step that
   follows the previous one, the pause in bold before the surprising number, `<details><summary>Optional:
   …</summary>` folds with named summaries, a short "Where it stops", "## Two questions to work" (one
   varies the example with new derived numbers, one conceptual naming the wrong turn; answers in
   `<details><summary>Worked answer</summary>`), "## The lab" with the numbers it prints and a link to
   `../labs/<slug>.md`, and the bridge paragraph. Keep the sources line.
3. New numbers in a worked question: derive them on the page, extend `workspace/<slug>/worked.py`,
   regenerate `corpus/<slug>/run-worked.log` (earlier sections must diff clean), add an `observed`
   receipt row.
4. Count: `python3 scripts/reading-path.py chapters/<slug>.md`. Reading path 2,000–2,700 (2,900 for
   ch. 2), folds 18–25%. Expect the first draft to land at about 3,200–3,500 words and 30% folded and to need
   two or three trimming passes (chapter 4 took eight: sentence shaving gave 50 words a pass, and only
   folding a formula, moving a paragraph or cutting a whole topic moved the count); chapter 2 went the
   other way (35% folded) and two folds went back on the page. Page totals have run about 200 words over §2's 3,400 when a chapter carries several glossed
   formulas; the path and fold share are the binding criteria.
5. `npm run build && npm run check && npm run consistency`; the voice lint pattern from
   `scripts/lint-voice.sh` applied to `chapters/<slug>.md` and the lab (watch "decides", "reported",
   "wants"); `node scripts/lab-check.mjs <slug>` (clicks the lab button, checks the progress count and
   the contents tick, screenshots). Read the page once with every fold closed (strip `<details>` blocks
   and read what is left) before calling it done.
6. Re-run the lab's code block and diff against `corpus/<slug>/run.log`. Interpreter: the scratch venv
   named below no longer exists; use `~/.gemini/antigravity-cli/scratch/myenv/bin/python` (PyTorch
   2.14.0+cu130, runs on CPU, prints a harmless NumPy warning to stderr). Chapters 1–7 reproduced their
   logs byte for byte (chapter 7's six timing lines vary, as its text says) (chapter 5 writes `release.pt`, so run it in a scratch directory) (chapter 2's four `num_workers` timings vary, as its text says).
7. Log what was folded, moved and cut in `notes/chapters/<slug>.md` under a dated "Story-map rework"
   heading (the three existing entries are the template); update this section; commit with the
   session's trailer. Status stays `published`; do not push until the author says.

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
