**Drafted by:** Claude Fable 5.1 (main session), 2026-09-16, from scratch, from the approved outline (`build-the-assistant-outline.md`; two author decisions: ladder cut to the standard-error point and banked for chapter 8; the injected instruction targets the coupon tool)

# Chapter 6 — Build the Assistant

- Question: the assistant answered wrongly; which stage failed, and what would prove it? Four stages (retrieval, chunk,
  loop, writer), one measurement each.
- Sections: golden set, RR/MRR/recall@k by hand (six questions), keyword proxy vs judgement, judge separate → chunk
  boundary on the kettle sheet, header repetition and its cost, repairs and their failures, the run's chunking numbers
  with ten-seed means → the loop (code, hand trace of two calls, dispatch table, budget, constrained decoding; figure) →
  injected coupon line refused at the confirmation check, four lines of defence, the writer's false sentence as the case
  for the fourth line → standard error of a difference at n = 12 / 300 / 150 → real project → exercise → reader case (three
  turns: retrieval-behind-boundary, writer, loop-worked-answer-lied with an unsettleable second question).
- Length: file ≈ 37k chars; prose without code/SVG ≈ 20.7k (≈ 13.8k before the exercise). Tighter than chapters 4–5;
  within the plan's 20–35k band. One figure.
- Checks (scratch copy with status published): build and site check green; receipts 36 passed, 0 failed; paraphrase 0/0.

## Evidence

- `workspace/build-the-assistant/exercise.py` → `corpus/build-the-assistant/run.log` (≈3 s, two identical runs).
- `seeds.py` → `run-seeds.log` (ten training seeds × five chunkings; all questions and table questions).
- `variations.py` → `run-variations.log`; `reader_case.py` → `reader-case.log`; hand numbers → `run-worked.log`.
- Sources: `sources.md` and `receipts-draft.tsv` by a research subagent; locators spot-checked against the audit. The
  audit's "dictionary dispatch at 08-16" was wrong; it is 08-17 lines 102–108, and the receipts say so.
- Prototypes `proto1.py`, `proto2.py` are design history.

## What the runs changed from the outline (reported, not hidden)

- The first catalogue gave every table a distinct unit, so bare table chunks were identifiable by their words and the
  header made no difference; the sheets now share "gram". The encoder was then trained on table rows and memorised
  numbers; it now trains on descriptive lines only, which is what a click log would hold.
- Even so, the header's effect is small and noisy on this toy (table questions: 0.244 → 0.288, 0.178 → 0.236 over ten
  seeds); the mechanism is shown deterministically by hand and the run's numbers are reported with their spread. Whole
  sheets win because a sheet is eight lines; the prose says so.
- Case B produced an unplanned finding kept in the chapter: the loop refused the coupon and the writer still told the
  customer the kettle was free. This became the argument for output checking as the fourth line.
- The reader case's T1 answer was changed from an invented number to the backpack's 650 so that "faithful to the wrong
  chunk" is what the evidence shows; the kettle's chunk is at rank 5.
- Standard errors on the reported ladder could not be computed (no spreads reported); the section uses the exercise's
  own recalls and the course's 0.7298 → 0.7475 as a third example.

## Source traps (kept out of the prose)

05-31's "nine in ten" gloss of MRR 0.91; deep-dive's "MRR = 0 means always last"; 06-13 reports a 95% interval, the SE
is the book's arithmetic; 03-09 is machine-translated; course MRR is per-keyword over a model-generated golden set.

## Owed

- The author's read. Published 2026-09-16.

## Review decisions (2026-09-16)

Gemini actionable review (first round), `checks/reviews/build-the-assistant/proposal1-gemini.md`, 3 proposals, all
applied after verification: (1) the printed per-question rows now come from the header-repeated chunking the reader
case runs on, so the kettle chunk's rank 5 is in the expected output (exercise rerun, run.log and run-variations.log
replaced); (2) the binomial standard error was applied to MRR; the sentence now says the formula is for recall and that
an MRR change of 0.018 on a single run cannot be judged without the spread of reciprocal ranks (receipt bta-44 trimmed);
(3) "fine-tuning often loses" had no receipt; replaced by the course's own fine-tune that scored worse than its base,
receipt bta-46 (06-25, reported). Gemini's "author's decision" on the plan's "when fine-tuning lost" promise: already
decided by the author on 2026-09-16, the ladder is banked for chapter 8.
Blind Haiku solve (`notes/reviews/solver-06-2026-09-16/`) was on the pre-review packet; the review changed no task text
or discussion, only the printed rows now include the evidence the discussion cites, which makes the case easier, not
different.

### Revision 2026-09-17 (Claude, main session; Codex read findings 1 and 2)

Finding 1 verified and measured: `search` returned the top-1 chunk and case B queried `steel kettle`, which retrieved the kettle's table chunk, not the edited one; the coupon request was purely scripted. Probe: the nine injected words are unknown to the encoder, so the edited chunk drops from rank 1 to ranks 7–11 for every kettle query, but for the customer's own words `how much is the kettle` it sits at rank 2. Change: `search` returns the top three (as the T1–T3 cases already showed); `Writer` keeps its script plus one reading rule, a search result carrying `assistant :` becomes the next request for that product; case B uses the customer's question; a clean control (`B clean`, same question, unedited sheet: three chunks, no instruction, price returned) precedes it; both print the three chunks handed over, the injected one marked. Loop still refuses; scripted answer still wrong. The essay's injection section, the Part 2 bullet, the reading of the output and the expected output updated; the essay now says the rule is scripted and the rate at which a real writer follows such a line is a question about that writer. `run.log` and `run-variations.log` regenerated (Part 1 unchanged; the no-confirmation variation now reads `['ran search', 'ran apply_coupon']` through the reading rule). `reader_case.py` unaffected.
Finding 2 verified: the T1 discussion excluded the writer although the rank-3 chunk names the backpack and the answer attributes its weight to the kettle. Discussion rewritten: retrieval failure measured by the rank; the unsupported attribution accepted as a second, writer-stage failure observed once, with a controlled rerun named as what would establish it; naming the writer instead of retrieval remains not a pass. "Not a pass" line adjusted.

## Story-map rework — 2026-09-22

**By:** Claude Fable 5.1 (main session), following `notes/chapters/STORY-MAP.md` §3 (chapter 6 card) and the seven per-chapter steps in `RESUME.md`. Status stays `published`; the URL does not change; nothing pushed.

**Shape now.** Story paragraph (three wrong answers: the kettle's table chunk at rank 5 so a backpack's weight was quoted; the four-line chunk `2019 : 1200 gram …` with no product name, MRR 0.708 → 0.500; the injected coupon refused and the answer still "free today") and a two-sentence map; five beats with story-step headings; a short "Where it stops"; two worked questions with folded answers; the lab paragraph; the bridge to chapter 7's serving report. Prediction pause is the card's: "The tool rule refused the injected coupon. Is the customer's answer now correct?", placed before the case-B reveal; the chapter's two earlier pauses became plain prose.

**Headings** (old → new): "Measure retrieval before blaming the writer" (kept) · "The chunk is the unit of retrieval" → "Where you cut sets what can be found" · "Your loop calls the function" → "The loop is your code, and it calls the function" · "Untrusted text is an untrusted code path" → "A seller's text becomes a request, and the loop refuses it" · "Which rung did the shop need?" → "Which rung the shop needed, and how big a golden set can tell" · "What a real project adds" → "Where it stops" · new: "Two questions to work", "The lab".

**Counts** (`scripts/reading-path.py`): reading path 2325; folds 751 (24.4%); page 3076; 6 `<details>`. Per section on the path: intro 313, measure retrieval before blaming the writer 269, where you cut sets what can be found 353, the loop is your code 261, a seller's text becomes a request 469, which rung the shop needed 205, where it stops 138, two questions to work 102, the lab 158. Before: 3,264 on the path with only the reader case's two folds (15.7%) and the exercise on the page. The first draft landed short and over-folded (2,164 on the path, 29.5%), chapter 2's pattern; the SE formula with its gloss and the repairs paragraph went back on the page, one pass.

**Moved.** The whole `## Exercise` section, verbatim (code, walk-through, expected output, the two things to try, the reader case with its hints and discussion folds), to `labs/build-the-assistant.md` with the `<!--mission-->` marker, under a two-line header naming the chapter. Diffed against the chapter's previous text: identical. The lab's code block diffed against `workspace/build-the-assistant/exercise.py`: identical. No "section N" or heading references needed renaming. This was most of the chapter's rework, as the card predicted: the lab is 2,778 words against the old body's 2,522.

**Folded** (summary line → contents): "the two measures on six invented questions, and the keyword proxy" → the MRR formula glossed, the six-question table (0.672 / 0.833), the watch-weight keyword example · "the header's effect over ten seeds, and what training on the table rows changes" → whole sheets win because a sheet is eight lines; 0.244 → 0.288 and 0.178 → 0.236 over ten seeds; the second variation's 0.636 · "the loop's code, the confirmation rule, and constrained decoding" → the `run()` listing, `SCHEMA` / `TOOLS` / `WRITES` / `CONFIRMED`, constrained decoding · "why an MRR change is unreadable without its spread, and the rung that lost" → MRR's missing spread, the 0.730 → 0.748 example, the fine-tuned frontier model that scored worse than its base · two "Worked answer" folds. The SE-of-a-difference formula stays on the page with its gloss (chapter 8's comparisons lean on it).

**Cut or compressed** (nothing deleted without a line here): the intro's list of four failure places → the three wrong answers · "The set is small and hand-made, real customer questions where you have them and invented ones where you do not" → "hand-made" · "A judge model has errors of its own, and a strict one is worth more than a generous one" → cut (the judge's agreement rate stays in "Where it stops") · "Well formed is not the same as permitted" → kept inside the loop fold · "Chapter 7 is about what those calls cost" → the bridge · the two earlier prediction pauses ("retrieval put the right chunk first, and the answer is still wrong"; "the loop refused the write and the customer still read a false price") → prose; §2 allows one pause · "The averages over seeds matter because one seed does not settle it, which is the last section's subject" → one clause in the seeds fold · voice: "decides" (three), "knows" and "reported" rephrased.

**Added.** Story paragraph and map; worked question 1 (new numbers: recall@3 0.667 vs 0.917 at n = 12 → SE 0.158, 1.6 SE; three SE at n = 12 is 0.47; n = 43 for three SE; receipt `bta-47`; `workspace/build-the-assistant/worked.py` new, reproducing the five lines of the existing `run-worked.log` byte for byte and adding section 5); worked question 2 (the keyword-proxy wrong turn: 0.917 proxy against MRR 0.500 and rank 5); the lab paragraph; the bridge to chapter 7 (3.4 requests in flight, 1.4×).

**Checks.** `npm run build` green (8 chapters, 6 with labs); `npm run check`: site validation passed (29 pages), receipts 38 passed / 0 failed with the new `observed` row, paraphrase 0 twelve-word failures for the chapter and the lab; `npm run consistency`: 12 failing conditions, all archived essays (unchanged); voice lint clean on the chapter's prose; the lab's one hit ("reported" in the T3 discussion) is in text moved verbatim. Read once with every fold closed: the argument survives. `node scripts/lab-check.mjs build-the-assistant`: lab page renders with the mission and button; clicking gives "1 of 8 exercises" and ticks chapter 6; the chapter page has 6 folds, no mission, one "Open the lab" block; no console errors.

**Exercise re-run.** `~/.gemini/antigravity-cli/scratch/myenv/bin/python` (PyTorch 2.14.0+cu130 on CPU) on the lab's code block: output byte-identical to `corpus/build-the-assistant/run.log`. Not re-run: the two variations and the reader case (their code did not move).

**Not done.** The author's read and the author's own attempt at the three answers; chapters 7–8; the §6 site copy.
