# model-is-a-learned-function — essay note

**Pitch:** A (the diff you cannot read: the four-step loop, one hand-computed step, divergence),
author's pick 2026-09-13. **Drafted:** 2026-09-13 by the main session, receipts first.

**Sources actually used:** course-4735368 03-05, 03-06, 03-07, 03-09 (03-08 read; adds only
the RMSE metric, dropped from the catalog row); geron-pytorch physical pp. 173–177 (printed
143–147; chapter 4, gradient descent). No paper.

**Word count:** 1,984 in the file; 1,771 prose (code and source line excluded).

**Numbers:** the worked example (three points on y = 2x, start (0, 0), η = 0.05 and 0.5) and
the two exercise variants (η = 0.005; outlier (3, 12)) are the book's own, run with
`workspace/model-is-a-learned-function/exercise.py` (plain Python); output in
`corpus/model-is-a-learned-function/run.log`. Receipts learned-14..18. The first draft claimed
the slow run "sits above 1" and the outlier run "flattens near 2.7, m near 3.5" from expectation;
both were wrong on running (0.048; loss 2.0, m → 5, c → −4) and were corrected before checks.
The lecture's own loss trace (308,519 → 308,485) is receipted and not used.

**Prose rule:** no inline lecture citations (CONTEXT §4, 2026-09-13); the course is named as
"the course this essay draws on" three times; sources in the credit line.

**Checks:** `BUILD_ALL=1 npm run build && npm run check` green 2026-09-13: 18 receipts passed,
0 twelve-word paraphrase failures; four eight-word warnings on the generic phrase "partial
derivative of the loss with respect to", reworded once.

**Owes:** `validation-set-is-a-budget` is pointed to ("a later essay in this book is about how
much you can trust that number"); `class-imbalance-changes-the-loss` owns the loss-choice
mechanism, this essay gives it one paragraph as a limit.

**Review:** pending.
