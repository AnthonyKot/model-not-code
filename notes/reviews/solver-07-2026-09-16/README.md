# Blind solvability check, chapter 7 reader case (2026-09-16)

Solver: Claude Haiku 4.5, background subagent, given the draft chapter (before receipts and the Gemini review) with
the two `<details>` blocks removed (packet sha256 prefixes: chapter b83e55a127e016c9, hints b7daf239ebbbc9e1,
discussion d8c2cb418c8156c5). Protocol: REVIEW-GUIDE "Optional blind solvability check". No code run.

Result: memory-bound from the 19% and batch-2 lines; four-bit weights first (7 → 1.75 GB per step, about 4× if
bandwidth-bound, re-evaluation as the cost); proposal rejected on the 19% line with the 1.4× cap computed; the two
measurements named. Batching correctly set aside as throughput, not latency. Hints not needed. The solver reported
section 4's rule ("low utilisation and a small batch → memory-bound") as disclosure; that is the taught mechanism
applied to a changed case, which the guide expects, not the answer to the case. No task change. Solvability
observation only, not evidence of human learning.

Note: the packet contained a prediction pause that restated the case's numbers (found by the Gemini review, since replaced), so this solve is weaker evidence of independence than the chapter 5 and 6 solves.
