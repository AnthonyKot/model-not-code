# Chapter 8 material, banked from the chapter 6 outline (2026-09-16)

The baseline ladder and "when fine-tuning lost" were cut from chapter 6 (author's decision) and belong to chapter 8's
question, whether the shop needed a model. Sources verified in `notes/research/outline-audit-2026-09-13.md` #26;
all figures are the course's single runs on 200 test items and stay `reported`.

- The ladder, 6100015/06-13..06-27, 07-23, 07-24: random pricer $382.08 with a ±$37 interval; constant $106.18;
  weak-feature linear regression $101.56; bag-of-words linear regression $76.81; random forest $72.28; XGBoost
  $68.23; the lecturer's own 100-item human baseline $87.62; an 8-layer 669,000-parameter network $63.97; frontier
  prompts from $62.51 to $44.74 (one on a 50-item sample); SFT of a small frontier model on 20,000 examples $75.91,
  worse than its own base ($3.42 to run); a 289M-parameter home-built network $46.49; LoRA attention-only $65.40;
  LoRA attention+MLP rank 256, two epochs, $39.85.
- The book's contribution: the standard error on n = 200 shows adjacent rungs inside noise ($62.51 vs $63.97);
  the ladder is not a ranking of products. Model names are "as of" the recording.
- Lecturer's readings, `reported` only: the fast loss drop is format learning (06-24); frontier fine-tuning suits
  style and format, not knowledge a prompt could supply, and the failure is added noise (06-26); the small model's
  win comes from 800,000 task-specific examples (07-24).
- Baseline taxonomy for the written form: `huyen-dmls` pp. 226 (phases of adoption), 236 (heuristic, zero-rule and
  human baselines); `the-rule-was-cheaper` sources, Huyen pp. 115, 226, 236 and 6100015/06-07 lines 52–73.
- Chapter 8 shape from the plan: a keyword rule, chapter 1's encoder and the assistant compared on quality the book
  measured and on operating cost; numbers from the book's own exercises, labelled synthetic; the ladder above is the
  external example of the same comparison done on real data.
