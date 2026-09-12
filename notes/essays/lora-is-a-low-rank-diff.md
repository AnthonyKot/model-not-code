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

**Review:** `scripts/review.sh` and `scripts/readers.sh` run 2026-09-13; findings and the
accept/reject log follow below once read.

**Owes:** nothing to another essay. `four-bits-per-weight` (Part IV) owns the quantisation
mechanism and may cite 07-03/07-05 for the 4-bit levels; this essay uses only the byte counts.
