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
