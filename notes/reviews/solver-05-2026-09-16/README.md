# Blind solvability check, chapter 5 reader case (2026-09-16)

Solver: Claude Haiku 4.5, background subagent, given only the chapter text at commit 0176d41 with the two
`<details>` blocks removed (packet sha256 prefixes: chapter a82642f98389f0d4, hints 8f41f92a6e747b29,
discussion 6e55adf1126325b7). Protocol: REVIEW-GUIDE "Optional blind solvability check". No code run.

Result: action correct (keep model and threshold, refuse 0.02: 852 review cost vs about 230 recovered), diagnosis
wrong ("the model degraded"); the two-explanation Poisson test was recognised but not applied; proposed raising the
audit rate; did not suggest checking seller data independently. No answer disclosure found; hints not needed.
Ambiguity reported: the last report column's purpose was not stated; the hypothesis test was taught but not required.

Applied to the chapter: question 1 now requires naming which explanation the audit supports and how strongly; the
last column's purpose is stated; the success criterion says a defensible action reached by an unsupported diagnosis
is not a pass. Discussion text unchanged. This is a model solvability observation, not evidence of human learning.
