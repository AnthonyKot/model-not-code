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

## Story-map rework — 2026-09-22

**By:** Claude Fable 5.1 (main session), following `notes/chapters/STORY-MAP.md` §3 (chapter 8 card) and the seven per-chapter steps in `RESUME.md`. Status stays `published`; the URL does not change; nothing pushed. The chapter closes the book: no bridge; the lab paragraph is the last paragraph and ends on the reader's ledger and the book's closing sentence.

**Shape now.** Story paragraph (the encoder beside the afternoon rule on chapter 6's twelve golden questions: recall@3 12/12 against 7/12; on six held-out paraphrases top-1 0/6 against 5/6; on one ledger the encoder pays back its build after 3,001 queries and its upkeep with 300 a month at a 15% paraphrase share) and a map; four beats with story-step headings; a short "Where it stops"; two worked questions with folded answers; the lab paragraph, which closes the book. Prediction pause is the card's, placed before the break-even reveal at the end of beat 2 rather than before beat 3, because the "flip points" the card names are the 3,001 / 300 numbers and they live there: "Before reading the ledger's answer: with the held-out rates above … at what volume do you expect the encoder to pay for itself?" The chapter's earlier pause (the vendor's 0.91 against 0.88) became worked question 2, since §2 allows one pause.

**Headings** (old → new): "A rule costs a test; a model costs data, evaluation and drift" → "What each side is charged for" · "The same catalogue, a rule and a model" → "The rule and the encoder on the same questions" · "Read the table first" → "Read somebody else's table before buying from it" · "What the shop keeps, questions, and would need to see" → unchanged but for the comma · "What a real project adds" → "Where it stops" · new: "Two questions to work", "The lab".

**Counts** (`scripts/reading-path.py`): reading path 2694; folds 792 (22.7%); page 3486; 6 `<details>`. Per section on the path: intro 282, what each side is charged for 368, the rule and the encoder on the same questions 656, read somebody else's table 476, what the shop keeps 384, where it stops 159, two questions 103, the lab 219. Before: 3,287 on the path with only the reader case's two folds (14.4%) and the exercise on the page. The first draft landed at 2,806 and 20.1%; one pass folded the forecasting paragraph and shaved three sentences. Page total about 90 over §2's 3,400, as the lessons predict for a chapter carrying four tables on the path (ledger, golden, held-out, ladder, closing).

**Moved.** The whole `## Exercise` section, verbatim (code, walk-through, expected output, the two things to try, the reader case "Your call: chapter 2's classifier on the ledger" with its hints and discussion folds), to `labs/did-the-shop-need-a-model.md` with the `<!--mission-->` marker, under a two-line header naming the chapter. Diffed against the chapter's previous text: identical. The lab's code block diffed against `workspace/did-the-shop-need-a-model/exercise.py`: identical. No "section N" or heading references needed renaming ("Read it against the chapter" and "Everything below" still resolve). The chapter's own "the reader case below" (twice) became "the lab's reader case".

**Folded** (summary line → contents): "the click-log lookup, and why its 6 of 6 is not a score" → the second table (rule 0/6, lookup 6/6, encoder 4/6) and the fit-on-training-pairs reading; on the page the six click-log queries, the lookup in one sentence and the two counts stay · "how the six held-out paraphrases were built, and the rule's one lucky hit" → the six held-out queries, the *the* stopword at rank 2, the *travelling type* miss · "the standard error behind 'a few dollars', from the one rung that states an interval" → 37 / 1.96 = 18.9, spread 267, 2.8 / 5.7 / 11.3 by per-item spread, plus the InstructGPT table (85 ± 3% as 544 or 142 comparisons; labeller agreement 72.6 ± 1.5%) · "the opposite failure, a table too small to carry its conclusion" → the forecasting tables (1.59 / 1.99 / 1.90; 2.59 against 1.34) · two "Worked answer" folds. Kept on the page, as the card lists: the ledger table and the break-even formula glossed, the golden and held-out tables with intervals, the two break-even numbers, the ladder, the closing table.

**Cut or compressed** (nothing deleted without a line here): the intro's "The chapter's question:" paragraph and "The exercise runs on a CPU in about two seconds" → the story paragraph, the map and the lab paragraph · "The rule wins:" kept · the InstructGPT paragraph's K-choose-2 sentences (6 at K = 4, 36 at K = 9, the shuffling overfit) → cut (receipts dsn-33, dsn-34 stay in the file; `worked.py` still prints them) · the SE paragraph's 18.9 / 267 / 2.8 / 5.7 → the fold; the page keeps "a few dollars", "twice that" for 50 items, and the 1.46 gap · "What a real project adds" (four paragraphs and "The book ends here") → "Where it stops" in one paragraph of 159 words; the closing two sentences moved to the end of the lab paragraph · "forecasts are what the last row of the ledger is about" → "the last row of the ledger is where forecasts go wrong" · "and the rule has to be the best rule, not a straw one" (first draft) → cut.

**Added.** Story paragraph and map; worked question 1 (new numbers: one held-out hit fewer at a 15% share gives encoder 0.525 against 0.425, net 0.3998, break-even 3,752 then 375; 3 of 6 gives 0.2998, 5,003 then 500; one held-out hit in six is worth 0.15 × 4 / 6 = 0.10 a query; receipt `dsn-47`; `worked.py` section 2, `run-worked.log` regenerated with the earlier section diffing clean, and the 5/6 row reproduces run.log's 3,001 / 300); worked question 2 (the vendor's table as the ranking wrong turn, with the SE of the difference between 0.91 and 0.88 on 200 items, √(0.91 · 0.09 / 200 + 0.88 · 0.12 / 200) = 0.031, one SE, three SE at 2,000 items; receipt `dsn-48`; `worked.py` section 3); the lab paragraph with the reader case's counts (13/19, 17/19, 19/19; 69, 8, 75 false flags) from `reader-case.log`. Receipt `dsn-42` was stale (it still carried the pre-held-out ledger's 0.40 / 3,752 / 1,875) and now states the 2026-09-17 numbers; `dsn-46` receipts the held-out table, which had no row.

**Checks.** `npm run build` green (8 chapters, 8 with labs); `npm run check`: site validation passed (31 pages), receipts 45 passed / 0 failed / 0 skipped with the four changed rows, paraphrase 0 twelve-word failures for the chapter and the lab; `npm run consistency`: 12 failing conditions, all archived essays (unchanged); voice lint clean on the chapter and on the lab. Read once with every fold closed: the argument survives (the two folds after the ladder sit back to back; the page reads through them). `node scripts/lab-check.mjs did-the-shop-need-a-model`: lab page renders with the mission and button; clicking gives "1 of 8 exercises" and ticks chapter 8; the chapter page has 6 folds, no mission, one "Open the lab" block; no console errors.

**Exercise re-run.** `~/.gemini/antigravity-cli/scratch/myenv/bin/python` (PyTorch 2.14.0+cu130 on CPU) on the lab's code block, in a scratch directory: byte-identical to `corpus/did-the-shop-need-a-model/run.log`. Not re-run: the two variations and the reader case (their code did not move).

**Not done.** The author's read and the author's own attempt at the reader's ledger; the cross-check of chapter 8 against 1–7 (next step; chapter 7's bridge describes the break-even as "3,001 questions a month, then at 300 once a 15% held-out rate is allowed for", which misreads run.log: 3,001 is the one-off payback and 300 the monthly, both at the 15% share); the §6 site copy.

### Cross-check against chapters 1–7 — 2026-09-22

Bridges, cross-references, numbers quoted from another chapter's run, old heading names in chapters, labs and site copy. Findings and repairs:

- **Chapter 7's bridge** described the break-even as "3,001 questions a month, then at 300 once a 15% held-out rate is allowed for", which misreads `run.log` (3,001 is the one-off payback of the 1,500 build, 300 the monthly upkeep, both at the 15% share). Repaired in `chapters/serve-the-assistant-cheaply.md` to "If 15% of the shop's queries are paraphrases the rule cannot reach, the model pays back its build after 3,001 queries and its upkeep with 300 a month." The STORY-MAP §3 card carried the same wording and now states it correctly. A finished chapter was touched for this repair only.
- **Closing table, answer-writer row**, was false on both halves and predates the rework: "learns a format from a few hundred examples" (chapter 3's writer learns its format from four strings through an adapter; the few hundred are the garden photos) and "a tuned version pleases a hidden scorer more than the reference" (chapter 4's tuned writer pleases the reward model, 0.34 → 6.12, while the hidden scorer that stands for the preferences falls 0.33 → −0.20, until the reference guard holds it near 0.97). Now: "learns a format from four strings through an adapter; tuned against a scorer, it raises the scorer's mean from 0.34 to 6.12 while the preferences behind it fall from 0.33 to −0.20, until a reference guard holds it". Beat 4's opening sentence shortened to pay for it; path 2698, folds 22.7%, page 3490.
- **Catalog caution** for chapter 8 in `site/catalog.mjs` still said "the encoder's paraphrase score is fit on its training pairs", which the 2026-09-17 held-out set superseded; now "the encoder's click-log score is fit on its training pairs, and the ledger rests on six held-out paraphrases".
- **Verified, no change:** chapter 6's "a rung is a number with an error bar, not a rank; chapter 8 compares them" (the ladder beat does); chapter 7's "cost per answer is the number chapter 8 needs" (the ledger prices it per query); the closing table's other rows against their chapters (0.684 and 13 of 19 at threshold 0.05 in chapter 2 and its lab; chapter 5's audit at about 270 a week; chapter 6's refused coupon and "stages in the order the evidence separates them"; chapter 7's four-bit first lever and bandwidth cap); the lab's reader case against chapter 2 (2 per false flag, 20 per missed blade; the 20,000 listings a month is chapter 8's own stated volume, not chapter 2's, which prices a different shop at 1,000). No old chapter 8 heading name appears in chapters, labs, about, README, CONTEXT or the site build; the catalog's one-line description already uses the story's words. No "section N" or "below" reference in any lab is stale.
- Checks after the repairs: build green, receipts 45 / 0 / 0 for chapter 8 and 28 / 0 / 12 for chapter 7 (unchanged), paraphrase clean on both chapters and labs.
