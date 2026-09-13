## Confirmed findings

1. **Category:** Licensed-material provenance  
   **Severity:** High  
   **Offending text:** “The numbers are the book’s own and invented… probability 0.30 at collection and 0.60 now.”  
   **What is wrong:** The 0.30→0.60 case is not the book’s own invention.  
   **Evidence:** `CONTEXT.md` §5b requires worked examples to use original numbers. Lecture `course-4635836/12-01`, lines 54–60, uses exactly 30%→60%, ratio 2, “twice as likely.” Receipt `ppo-06` and the drafting note incorrectly say this example was not used; receipt `ppo-16` incorrectly labels it invented. Recomputed values are correct: \(r=2\), clipped value \(1.2\), objectives \(1.2\) for \(A=+1\) and \(-2\) for \(A=-1\).  
   **Fix:** Replace 0.30→0.60 with genuinely original probabilities, such as 0.25→0.50, throughout the prose, table, exercise, run log, receipt, and drafting note.

2. **Category:** Anthropomorphism  
   **Severity:** Low  
   **Offending text:** “the way the advantage wanted”; also “the side the advantage asked for.”  
   **What is wrong:** These give agency to a scalar instead of naming what its sign indicates. Reviewers A and B independently identified the first occurrence.  
   **Evidence:** `CONTEXT.md` §4 permits such wording only when the following clause explains the mechanism; “by more than ε” does not do that.  
   **Fix:** Use “the direction indicated by the advantage’s sign” in both places.

3. **Category:** Anthropomorphism  
   **Severity:** Low  
   **Offending text:** “the clip only decides which samples are still pushing.”  
   **What is wrong:** “Decides” and “pushing” replace the precise gradient effect with agency metaphors. Reviewers A and B independently agreed.  
   **Evidence:** `CONTEXT.md` §4’s anthropomorphism rule applies; `checks/consistency.mjs` also emits `decides:1` for this essay.  
   **Fix:** Write: “the clip only determines which samples still contribute gradient.”

## Rejected findings

- **Symmetric clipping description:** Does not survive reading the full mechanism. The disputed sentence describes the two sign-dependent alternatives, and the immediately following paragraphs explicitly state that clipping occurs only in the advantage-favoured direction. Recalculation confirms rows 2 and 4 remain live outside the band, with loss gradients \(+2.000\) and \(-0.700\).
- **PyTorch presented as the source/framework default:** “One PyTorch implementation” ordinarily means an implementation written using PyTorch, not a native PyTorch algorithm or default. Receipt `ppo-12` correctly attributes 2,049 steps, 10 epochs, batch size 64, and normalisation to the Lapan implementation.

## Publication judgment

Not publishable as-is. The single most important change is replacing the lecture-derived 0.30→0.60 example and correcting every record that calls it invented.
