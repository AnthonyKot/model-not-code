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
