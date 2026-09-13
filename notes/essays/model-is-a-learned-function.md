# model-is-a-learned-function — essay note

**Drafted by:** Claude Fable 5.1, main session (2026-09-13); **rewritten by codex gpt-5.6-sol** (2026-09-13, brief in workspace/model-is-a-learned-function/CODEX-REWRITE.md) after the author found it "a bit plump"; two fixes by the main session (Opus 5). Review lanes: Gemini 3.8 flash and Gemini 3.1 pro via agy; consolidation and one reader persona: codex gpt-5.6-sol (when not rate-limited).

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

**Review (2026-09-13):** Gemini flash 6 findings, pro 4; three reader personas (codex
rate-limited, consolidated by hand). Accepted and applied: "nine numbers" leaked from the
course's eight-feature model (both lanes + two readers) → "the same m and c"; "seven billion"
unreceipted and a close paraphrase of 03-05 → "billions"; "the only knob not derived from the
data" contradicted the loss-choice paragraph → step-size definition; "twenty lines" → "one
screen"; closing sentence overclaimed that the curve cannot distinguish 0.048 from 2 →
qualified; "a decision was made" → "the numbers were set"; readers: chain-rule sentence added
for the 2 × error × x gradient, "nothing conceptually new at scale" softened with autodiff and
mini-batches named, "the course" phrasing removed, the holdout claim in the opening now
explicitly deferred to the validation essay. Rejected: the pull-request opening as a
"manufactured scene" (second person, the reader's situation, is what BRIEF asks for); replacing
the collinear worked example with noisy points (the outlier exercise shows the non-zero floor;
the collinear case keeps the hand arithmetic exact).

**Author's read (2026-09-13):** "a bit plump". Rewritten by codex to a serious technical register a
curious non-technical reader can follow: prose 1,771 → 1,042 words (1,080 after the main session
restored one sentence tying the opening to the title's compile-step idea and repaired a truncated
sentence); the pull-request scene, reviewer framing and repeated commentary cut; the worked example
moved first and every calculation put in a table; both formulas glossed term by term; every number
unchanged and still receipted; script unchanged, output now quoted in full. Previous version kept
at workspace/model-is-a-learned-function/essay-before-codex.md.
