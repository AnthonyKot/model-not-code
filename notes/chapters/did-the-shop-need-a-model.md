**Drafted by:** Claude Fable 5.1 (main session), 2026-09-17, from scratch, from the approved outline (`did-the-shop-need-a-model-outline.md`; author's picks: the full eleven-rung ladder; the reader's ledger revisits chapter 2's classifier)

# Chapter 8 — Did the Shop Need a Model?

- Question: which of the shop's models earned their cost, and how would you have known before building? The ledger
  and its break-even inequality; baselines (zero-rule, heuristic, human); the rule and the encoder on chapter 6's
  golden set (rule wins on shared-word questions, encoder alone reads the six click-log paraphrases); read the table
  first (the course's ladder with the ±37 interval turned into standard errors; InstructGPT's 85 ± 3, K-choose-2 and
  labeller agreement; the forecasting book's two twelve-point tables); where the book's models sit; the ending, nothing
  sold. Reader case: chapter 2's classifier against a seller-declared rule on chapter 2's 500 test listings, priced at
  20,000 listings a month, where the classifier's 69 false flags per 500 are the cost that decides, and "the rule, and
  buy an audit for it" is the sound answer.
- Length: prose without code ≈ 19.4k (≈ 12.6k before the exercise). No figure (two ledgers and a ladder are tables).
- Checks (scratch copy, status published): build (8 of 8 chapters) and site check green; receipts 42 passed, 0 failed;
  paraphrase 0/0.

## Evidence

- `workspace/did-the-shop-need-a-model/exercise.py` → `corpus/.../run.log` (≈2 s, two identical runs); `variations.py`
  logic inline → `run-variations.log` (margin 1.0; share 0.05); `worked.py` → `run-worked.log` (K-choose-2, ±37 → SE,
  implied n for 85 ± 3, ts-foundation ratios, SE by per-item spread); `reader_case.py` → `reader-case.log` (chapter 2's
  test listings via `workspace/trust-the-number/exercise.py`; seller behaviour invented: 25% dodge, 2% false declaration).
- Sources: `sources.md` and `receipts-draft.tsv` by a research subagent that hit the session rate limit after writing
  both files; every ladder figure carries its lecture and lines. Corrections carried in: "800,000" is 06-27/06-13, not
  07-24; the "linear model wins when the truth is a weighted sum" clause is 06-14, not 06-07; ts-foundation printed
  pages are physical minus 20.

## What the runs changed from the outline (reported, not hidden)

- The first paraphrase set shared words with the chunks and the rule scored them; replaced by six click-log queries
  with no shared word, added to the encoder's training pairs as chapter 1 did with its clicks, and the prose says the
  encoder's score there is fit on its training pairs.
- A zero-match query fell to the first chunk by tie-break and counted as a rule hit; the rule now returns nothing.
- The ledger hard-coded top-1 counts; it now uses the scored ones (the two tie at 6/12 on the golden set).
- First draft claimed the rule wins below a 3% paraphrase share; the run shows the ledger (top-1 only) favours the
  encoder at any share above zero and does not price MRR, where the rule wins; the prose now says so.
- The reader case's rule wins by about 9,400 a month because of the classifier's review queue, not its accuracy; the
  discussion computes the dodge rate and the miss price at which that flips.

## Source traps (kept out of the prose)

Model names drift in the captions (Opus 4.5 / "4.7" / "4.5 sonnet"); the SFT run scored 67.75 in an earlier run of
the same setup; the random forest saw a subset; 06-21's Gemini run is 50 items; Huyen's 70% and 30% are illustrations;
InstructGPT's ± has no stated n on p. 3; ts-foundation's "50%" is 0.517 and 0.560 recomputed.

## Owed

- The author's read. Published 2026-09-17.

## Review decisions (2026-09-17)

Blind Haiku solve first (`notes/reviews/solver-08-2026-09-17/`): correct decision; found the flip-point arithmetic
wrong and the stated-vs-drawn dodge rate unclear; both fixed before the Gemini report arrived.
Gemini actionable review (first round), `checks/reviews/did-the-shop-need-a-model/proposal1-gemini.md`, 7 proposals:
(1) "1.6 standard errors of the larger one" → of the difference, with the pooled SE shown: applied; (2) flip points:
already fixed from the solver, Gemini's independent recomputation (44%, 72%) matches; (3)–(7) source narration ("the
course", "the lecturer", "the paper", "a forecasting book", "the text reads"): applied with the book as the voice,
keeping every figure and its single-run caveat; the credit line still names the sources. Gemini verified the ledger,
break-even, K-choose-2 and interval arithmetic against the logs and found no disclosure in the reader case.

## Author's read notes applied (2026-09-17)

(1) "Where the book's models sit" replaced by a closing table (component, demonstrated, not established, next
decision and its evidence) plus what the shop keeps without further evidence: the audit, the golden set, the ledger.
(2) The two research examples shortened so the ladder is the one long example and the chapter returns to the shop
sooner. (3) The rule/model asymmetry corrected: the ledger's "knowing it is still right" row and the real-project drift
paragraph now charge the audit to both columns, since sellers learn rules (the reader case's own point).

### Revision 2026-09-17 (Claude, main session; Codex read finding 3)

Finding verified: the six paraphrases were both training pairs and the evaluation, and the ledger used their 4/6; "share no word with any chunk" was also false for two of them (*the*, *for* are chunk words of other products), which is why the rule's rank was None rather than a match. Change: added `HELD_OUT`, six paraphrases built only from click-log words and never trained on; added `lookup_order`, the click log as an exact-query table with the rule behind it, as the fair comparator; Part 1 now scores rule, lookup and encoder on the click-log paraphrases (0/6, 6/6, 4/6) and on the held-out set (0/6, 0/6, 5/6; the rule's MRR 0.083 is one stopword hit at a low rank); the ledger scores both sides on the held-out rates and is labelled a scenario conditioned on them. New numbers at 15% new paraphrases: net +0.4998 per query, break-even 3,001 then 300 a month; at 30%, 1,500; margin 1.0 → 12,018 then 1,202; share 0.05 → 9,010 then 901. Prose, tables, expected output and both "things to try" updated; `workspace/did-the-shop-need-a-model/exercise.py` synced; `corpus/.../run.log` and `run-variations.log` replaced (PyTorch 2.14.0+cpu, scratch venv; Part 1 golden-set numbers unchanged). The chapter's reader case (chapter 2's classifier) is untouched. Not done: a held-out sample larger than six; the prose says so.
