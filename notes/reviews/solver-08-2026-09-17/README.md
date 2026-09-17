# Blind solvability check, chapter 8 reader case (2026-09-17)

Solver: Claude Haiku 4.5, background subagent, given the draft chapter (before the Gemini review) with the two
`<details>` blocks removed (packet sha256 prefixes: chapter d65c1fcdcc3756ff, hints dbc779aa27a73cb2, discussion
13c2d0ce9d8a78b3). Protocol: REVIEW-GUIDE "Optional blind solvability check". No code run.

Result: the rule at about 2,240 a month, both and the classifier rejected on their review queues, "buy an audit for
the rule" named as the missing measurement. Hints opened but not needed. No disclosure found. Two ambiguities the
solver raised were real: (1) the stated 25% dodge probability against 2 of 19 observed in the draw, now stated in the
task; (2) the discussion's flip-point dodge rates were miscomputed (80% and "near 100%"); recomputed from the ledger
they are about 44% (against both) and 72% (against the classifier alone), which matches the solver's 44–46%. Both
fixed in the chapter. Solvability observation only, not evidence of human learning.
