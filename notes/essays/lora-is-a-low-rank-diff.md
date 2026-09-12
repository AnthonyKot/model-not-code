# lora-is-a-low-rank-diff — essay note

**Pitch:** A (the adapter is a diff of rank r; parameter count = (d_in + d_out) × r), picked by
the author 2026-09-13. **Drafted:** 2026-09-13 by the main session, receipts first.

**Sources actually used:** course-6100015 lectures 07-02, 07-03, 07-04, 07-05, 07-06, 07-11,
07-12, 07-20 (Ed Donner, LLM Engineering); raschka-qai pp. 141–142 (physical; printed 136–137;
Leanpub version 2023-05-21); arXiv:2106.09685 §4.1–4.2 (fetched 2026-09-13). Dropped from the
pitch: Raschka's *Build an LLM* (not in the manifest) and quant-ru (the quantisation mechanism
stays in `four-bits-per-weight`).

**Word count:** 2,088 in the file; 1,802 prose (code block, table and source line excluded).
Slightly over the 1,800 guide; the reported-configuration check is the part to trim if a
reviewer asks.

**Numbers:** every figure is either derived on the page (receipts lora-13..15, 18..20, with
the arithmetic in `workspace/lora-is-a-low-rank-diff/lectures.md`) or `reported` in the
lecturer's mouth. Two `disputed` rows: the alpha convention (lecture: plain multiplier; paper:
alpha / r — essay follows the paper and says so) and Raschka's 25 × 50 printed as 6,250 (the
essay gives 1,250 and names the page). The lecture's "17MB" slip (07-06) is noted in the
receipt and not repeated in the prose.

**Inferences the essay makes and labels:** the k/v projection width 1024 and the MLP width
8192 are not stated in any lecture; they are inferred because they reproduce the reported
73.4 MB and 1.56 GB exactly where the spoken round numbers do not.

**Exercise:** numpy only; `workspace/lora-is-a-low-rank-diff/exercise.py`, run with numpy
2.5.3, output in `corpus/lora-is-a-low-rank-diff/run.log` (rank-1 target → 0.000 remaining;
random target → 0.780 = the SVD's best rank-4 residual).

**Checks:** `BUILD_ALL=1 npm run build && BUILD_ALL=1 npm run check` green 2026-09-13
(15 receipts passed, 5 paper receipts unchecked by design, 0 paraphrase hits).

**Review (2026-09-13):** `scripts/review.sh` ran both Gemini lanes (flash: 6 findings, pro: 2);
codex consolidation and the codex reader persona failed on the codex usage limit (resets 05:19),
so the main session consolidated by hand. `scripts/readers.sh`: three of four personas returned
(working-mle, stats-sceptic, hiring-manager). Raw output in `checks/reviews/` and `checks/readers/`.

Accepted and applied:
1. (flash high, working-mle) "memory is now proportional to the diff" overclaimed — qualified:
   gradients and optimiser state scale with the diff; the frozen base and the activations do not.
2. (flash, stats-sceptic) the SVD check gave no formula — the script now computes
   `(S[r:]**2).sum()/(S**2).sum()` and prints it; prose explains the ratio.
3. (flash + pro, independent agreement) 20,000 / 800,000 rows had no receipt — lora-21 added;
   attribution corrected to lectures 7.5 and 7.6.
4. (flash, working-mle, hiring-manager) exercise updated B before taking A's gradient — both
   gradients now taken from the same residual; rerun, same results (0.000 / 0.780).
5. (flash low) "first line of the loop" — now "before the loop".
6. (pro low) "until the gradient says so" — anthropomorphism removed.
7. (hiring-manager) why weight-space reconstruction stands in for the task loss — one sentence
   added before the exercise.
8. (flash rerun) "found by trial against your evaluation metric" was cited to 7.11; the
   lecturer says it in 7.6 — citation corrected.

Rejected:
- (working-mle, hiring-manager) drop the "as reported in the lecture" citations and state the
  Llama dimensions as known facts / name grouped-query attention for the 1024 width — rejected:
  CONTEXT §4 and §5 require lecture citations and forbid numbers from memory; the inference
  from the reported file size is the honest route. Citation density can be thinned in the
  consistency pass if the author agrees.
- (stats-sceptic) explain Raschka's 6,250 as 1,250 × 5 — plausible but a guess about the
  author's error; not added.

**Owes:** nothing to another essay. `four-bits-per-weight` (Part IV) owns the quantisation
mechanism and may cite 07-03/07-05 for the 4-bit levels; this essay uses only the byte counts.
