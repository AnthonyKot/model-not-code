# Chapter 8 outline — Did the Shop Need a Model? (for the author's approval)

**Status:** approved 2026-09-16 (full eleven-rung ladder; the reader's ledger revisits chapter 2's classifier). Plan: CHAPTER-PLAN rev 2 §8 (Part VI 17, 18: `read-the-table-first`,
`the-rule-was-cheaper`), plus the fine-tuning ladder banked from chapter 6
(`did-the-shop-need-a-model-material.md`). Sources verified in the 2026-09-13 audit (#26, #27, #30). Reader-task rules
from chapters 5–7 apply.

## The chapter's question, stated in the opening

*Seven chapters built models for the shop. Which of them earned their cost, and how would you have known before
building?* The chapter closes the project by putting a rule, chapter 1's encoder and chapter 6's assistant on one
ledger: quality the book measured, cost the book counted. The answer is not "the rule" or "the model"; it is an
inequality with the shop's volume in it, and the chapter shows where each of the book's models sits on it.

## Sections (target ≈ 20–25k characters of prose)

1. **A rule costs a test; a model costs data, evaluation and drift.** The ledger, one line each: labelling, training,
   the golden set, the audit (chapter 5's 3 per listing), serving (chapter 7's cost per answer), the retrain cycle.
   The break-even inequality, glossed term by term: the model pays when (gain per decision × decisions) exceeds its
   fixed and running costs minus the rule's. Baselines before models: zero-rule, a heuristic, a person.
2. **The same catalogue, three ways.** A keyword rule for search ("every query word in the title"), chapter 1's encoder,
   and chapter 6's assistant, scored on the same golden set: top-1 and MRR for the rule and the encoder, answer accuracy
   for the assistant, with standard errors on a set this small. Cost per query in each: string matches, one encoder
   pass, three writer calls at chapter 7's per-token price. A table; the rule is not last on every row.
3. **Read the table first.** How to read someone else's ladder: claim, table, method, what was held fixed, then re-derive
   one number. The course's price-prediction ladder as the worked example: random $382.08 ± $37, the constant and
   linear baselines, trees, a small network, frontier prompts, a fine-tune that scored worse than its base, LoRA at
   $39.85, all `reported`, single runs on 200 items. The book's contribution: the standard error the ±37 implies, and
   which adjacent rungs are inside it. A model name on a rung is "as of"; the rung is a number with an interval.
4. **Where the book's own models sit.** Chapter 2's classifier against "never flag" and a keyword rule on listing text;
   chapter 5's audit as a running cost the rule never needed; chapter 4's tuning as a cost that bought a measured
   preference; chapter 6's retrieval against the keyword rule at the volume where the encoder's per-query cost is paid.
   Each is one line in the ledger with the book's own numbers, labelled synthetic.
5. **What a real project adds:** the prices are the business's; volume is a forecast; drift makes the ledger a
   time series; a rule's coverage gap is a cost too (what it cannot reach), which is the one line the ledger can hide.
   The book ends here; nothing is sold.

## Exercise (one `<!--mission-->`, CPU, target under 10 s)

The keyword rule, chapter 1's encoder and a two-call version of chapter 6's loop on the six-sheet catalogue and twelve
golden questions from chapter 6: prints top-1, MRR, recall@3 and answer correctness per method, the standard error on
twelve, and a cost column from counted operations (comparisons, encoder passes, writer tokens) priced with invented
per-unit costs; then the break-even volume solved from the ledger. Walk-through, expected output, two things to try
(a different price per token; a golden set with more table questions, where the rule falls).

**Reader decision (bounded):** chapter 2's blade classifier revisited as a ledger. The reader gets what chapters 2
and 5 measured (per-listing accuracy 0.946, blade recall 0.684 at the release, the audit's estimate after launch) and
three things those chapters never priced: the shop's listing volume per month, the reviewers' hourly cost, and a
keyword rule's measured quality on the same 500 test listings (a new number, run for this chapter: "blade", "knife",
"cutter" in the title). The reader must first say which quality differences clear the standard error on 500 listings
(the reasoning step), then fill the ledger for the rule and the classifier at the stated volume, choose one, reject
the other with the number that rejects it, and say at what volume or price the decision flips. "The rule, and revisit
at ten times the volume" is an acceptable answer. Because chapters 2 and 5 are in the book, the ledger's prices and
volume are new and the decision cannot be read off an earlier chapter; the discussion says which numbers came from
where. Success criterion: a rung chosen for a reason the ledger's numbers do not support is not a pass. Hints and
discussion in two `<details>`; blind Haiku solve before the author's read.

## Sources to read and receipt

`huyen-dmls` pp. 115, 226, 236 (heuristics first; zero-rule, heuristic and human baselines); 6100015/06-07 lines 52–73
(plain code and classical baselines first); the ladder, 6100015/06-13, 06-14, 06-16, 06-19, 06-20, 06-21, 06-25, 06-26,
06-27, 07-23, 07-24 (all reported); `instructgpt` p. 3 (85 ± 3%), p. 8 (labeller agreement), §3.5 (K-choose-2) as the
"read the table" example; `ts-foundation` pp. 47–48, 51 (a conclusion that outruns its table) if the author wants a
second table. Not used: `ds-hard-parts` heuristic pages (about leakage); 6538601/03-06.

## Open choices for the author

1. (Decided: the full eleven-rung ladder, every number reported.)
2. (Decided: the reader's ledger revisits chapter 2's classifier, with new prices, volume and a keyword-rule baseline
   measured on chapter 2's test listings.)
