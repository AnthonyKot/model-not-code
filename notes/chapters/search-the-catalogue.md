**Drafted by:** Claude Opus 5 (main session), 2026-09-13, from scratch (the pilot of the chapter form)

# Chapter 1 — Search the Catalogue, Then Answer From It

- Plan: CHAPTER-PLAN rev 2, chapter 1 sections 1–6, all present.
- Length: file 41.5k chars; prose without code, figure and tables ≈ 27,700 chars (≈ 4,800 words).
- Figure: one pipeline SVG (shared row, search row, answer row with the append loop).
- Worked numbers: all new (not the essays'), verified in `corpus/search-the-catalogue/run-worked.log`
  (workspace/search-the-catalogue/worked.py): two-score cross-entropy step; BPE on case/cases/base/cash;
  attention table for keyboard/for/laptop both ways and causal plus the 4th-token append; masked pooling;
  contrastive row at tau 1 and 0.05 with one vector step; loss floor; sampling-temperature table.
- Exercise: `workspace/search-the-catalogue/exercise.py` = the code in the chapter verbatim; output
  `run.log` (deterministic, run twice); both "things to try" run, `run-variations.log`. Finding while
  running: at scale 1 English top-1 still reaches 6/6 (loss 0.9187), so the chapter says a loss that
  cannot approach zero does not by itself mean a wrong ranking (the first draft said top-1 was "no
  longer guaranteed" — corrected before publishing).
- Practitioner anchors verified at primary: sentence-transformers 6.0.1 `MultipleNegativesRankingLoss`
  scale=20.0, docstring scale = 1/temperature (sdist source); PyTorch 2.14 `scaled_dot_product_attention`
  `is_causal` fills -inf above the diagonal (installed docstring).
- Precision rules from rev 2 applied: contrastive tau (training, stored vectors) vs sampling T (per
  request, nothing stored) stated as same pattern, different stage; generation introduced here, with
  forward links to ch 4 (preferences over these token probabilities) and ch 7 (KV cache, per-token cost).
- Removed during self-check: unsourced "hundreds of millions of pairs", "billions of weights", "most
  text search training fixes tau", "as large as the vectors themselves".
- Checks: receipts 31 passed, 4 unchecked (paper/URL), 0 failed; paraphrase 0/0 after one rewording.
- Not done yet: review lanes (`scripts/review.sh`, `readers.sh` take essay slugs and paths — need a
  chapters/ path before they can run); the author's read.

## Review decisions (2026-09-14)

- Codex actionable review: `checks/reviews/search-the-catalogue/codex-actionable.md` (9 proposals).
- **Author's decision:** amend the plan, not the exercise. Search encoder and answer generator share a block
  design, not trained weights (CHAPTER-PLAN ch 1 amended). Prose that implies one fitted model ("the same
  machine used twice", "The top row is shared") is proposal 2, still to be applied with the other proposals.

- **Applied 2026-09-14** (author: "let's apply improvements"): all 9 codex proposals — (1) exercise Part 2 rewritten
  so search's top title prompts a separately trained generator (Part 1 byte-identical; new output in run.log);
  (2) shared design, not weights, in intro, figure, caption and §5; (3) in-batch false negatives; (4) loss-floor
  sentence; (5) "chance" removed; (6) no determinism promise at temperature 0; (7) "a few hundred" removed;
  (8) forward link to ch 2/6 fixed; (9) "millions of weights" removed. Plus the Gemini findings accepted earlier:
  step-4 row, ln 2 = 0.69315, 4-decimal one-step table, 0.44/3.44, heading "Where the training pairs come from",
  output projection sentence (and ch 3's "chapter 1's attention layer has four" fixed), q − cos×d explained,
  approximate nearest-neighbour sentence (stc-36), no anthropomorphism in the gradient sentence, ch 2 tense.
- Gemini second round (proposal2.md, 2026-09-14): no proposals survived; it confirmed the codex fixes.


## Small learning-design fixes — 2026-09-16

Labelled English top-1 as fit on the six training query–title pairs, with Spanish excluded from those pairs. Kept the pipeline SVG at 720px inside a focusable horizontal scroll region and raised smaller labels to 12px. At 390px, the region is 358px wide, the SVG stays 720px, keyboard ArrowRight scrolls it, the hint is visible and the page itself has no horizontal overflow. Desktop keeps the full diagram without the hint. Visually inspected both ends of the mobile diagram.

Authorized targeted fixes only. No independent task added and no optional-section restructuring. Chapter 5 work was not touched. Build/check and focused desktop/mobile navigation, completion and layout checks passed; four existing eight-word paraphrase warnings remain in the archived augmentation essay. Changes are local, uncommitted and unpublished. Earlier review reports remain historical evidence.

## Story-map rework — 2026-09-22

**By:** Claude Fable 5.1 (main session), on the author's "Yes, please. Let's do ch.1" after the chapter 3 pilot, following `notes/chapters/STORY-MAP.md` §3 (chapter 1 card) and §5. Status stays `published`; not pushed.

**Shape now.** Story paragraph (the customer's *cheap keyboard for laptop*, the keyboard whose title has neither word, *Laptop stand* on top; the two things the shop needs, search and the written answer, so the generator is named in the story and is not a second story) and a four-sentence map; the pipeline figure kept as the map (its "§ 2 … § 5" labels removed, since sections are no longer numbered); four beats in the card's order; the pause before beat 4 (the card's own question); "Where it stops"; two worked questions; the lab paragraph; the bridge to chapter 2's held-out score.

**Headings** (old → new): "What you ship is a file of numbers" + "The query becomes integers" → "Text becomes numbers a loss can move" · "Tokens look at each other" → "How the shop tells \"laptop keyboard\" from \"keyboard stand\"" (STORY-MAP §2's model heading), moved after the encoder beat as the card orders · "One vector per text, trained on clicks" → "One vector per text, so the catalogue is scored once" · "The same blocks, one token at a time" → "The same blocks write the answer, one token at a time" (599 words, within the card's 600) · "Where it breaks, and what a real shop needs" → "Where it stops" · new: "Two questions to work", "The lab".

**Counts** (same counter as chapter 3: prose and table cells; code, the SVG and the sources line excluded): reading path 2,696; folds 898 (25.0%); page 3,594; eight `<details>`. Per section on the path: intro ≈ 185, beat 1 ≈ 480, beat 2 ≈ 410, beat 3 ≈ 510, beat 4 ≈ 600, where it stops ≈ 250, questions 109, lab + bridge ≈ 130. Meets §6 for the path; the page total is about 200 over §2's 3,400, as in chapter 3, because six display formulas each need a term-by-term gloss and the card keeps four tables on the page.

**Moved.** `## Exercise` verbatim to `labs/search-the-catalogue.md` with the mission marker (diffed: identical; code block identical to `workspace/search-the-catalogue/exercise.py`).

**Folded** (summary → contents): "how the vocabulary is built by counting" → BPE on case/cases/base/cash, the merge rounds in prose, the encoding table · "five steps of gradient descent on the two scores" → the update formula with its gloss, the six-row step table, the nudge check (−0.499), the learning-rate rule · "the mean pool with padding, and the index at millions of products" → the (5, −5) padding arithmetic, the mask-and-divide, the approximate nearest-neighbour sentence · "the worked row at τ = 1 and τ = 0.05, and the step that flips the order" → the four-row temperature table, q − cos × d, the one-step table (0.6 → 0.8122, 0.8 → 0.6410) · "the whole masked table, and what appending a fourth token changes" → the three-row masked table and the fourth-token append (0.193, 0.807) · "the sampling temperature on four candidate tokens" → the T table · two "Worked answer" folds.

**Cut or compressed.** The round-1 BPE pair table (now one sentence of counts inside the fold) · the "three consequences" of tokenization → one sentence on the page; the spelling-question sentence dropped · the loss-floor paragraph (ln(1 + 63 e<sup>−2/τ</sup>), 2.254) dropped; the lab's first variation still states the floor for six titles · "In a real encoder the step does not land on free-standing vectors…" dropped · the "other two rows" attention table dropped from the page; row 2's weights are derived in beat 4 from its query (1, 1, 1, 0) · the real-layer detail (nn.Linear projections, output projection, heads, feed-forward) → one sentence · the encoder/generator mask table (two rows) dropped; its content is in the text · the loop and `temperature` paragraphs merged; "two temperatures, one pattern" kept as two sentences · the chapter 7 cost forward-link in the token paragraph dropped (the KV-cache link stays) · "What the pairs never showed" moved from beat 2 into "Where it stops" · the real-shop paragraph → one sentence · "a click is not a purchase, and not every purchase was the best match" → first clause only.

**Added.** Story paragraph and map; the pause; worked question 1 (the same row at τ = 0.1: scores 6 and 8, p = 1/(1 + e²) = 0.119, loss 2.127, slope −8.81; receipt `stc-38`, `worked.py` section 4d, `run-worked.log` regenerated, earlier sections unchanged); worked question 2 (a causal encoder shared with the generator; the wrong turn is treating the pool as mixing); the lab paragraph; the bridge. Voice: "decides" → "sets", "reported" → removed.

**Checks.** Build green (8 chapters, 2 with labs); site validation 25 pages; receipts 34 passed, 0 failed, 4 unchecked (paper and URL, as before); paraphrase 0 failures for the chapter and the lab; voice lint clean; headless-browser check: the lab button ticks chapter 1 in the contents and the progress count, no console errors. Read once with every fold closed: the argument survives (story → tokens and the two-score model → one vector and the click-log diagonal → attention and the pause → the cheat, the mask, the KV cache → limits → questions → lab → bridge). Exercise re-run from the lab's code block with the interpreter noted in chapter 3's log: byte-identical to `corpus/search-the-catalogue/run.log`. Not re-run: the two variations (their code did not move).

**Not done.** The author's read; chapters 2 and 4–8.

**Author, 2026-09-22 (provisional):** OK, 7 of 10, given in chat as an assumption rather than a line-by-line read; no changes requested. Chapters 4–8 proceed on the same pattern.
