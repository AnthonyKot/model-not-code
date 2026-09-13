## Confirmed findings

1. **Category:** Missing mechanism step  
   **Severity:** Medium  
   **Offending text:** “The expected best score is 12.81 out of 20, 0.6405.”  
   **What is wrong:** The expectation appears without the order-statistic calculation needed to reproduce it. This violates the worked-example requirement in CONTEXT.md §3 and §5, even though the number has a receipt.  
   **Evidence verified:** Receipt `valid-14` points to `worked.py`, which computes the omitted distribution. Independently, I get  
   \(E[\max]=\sum_{k=1}^{20}(1-F(k-1)^6)=12.8106952868\), hence \(0.6405347643\), correctly rounded to 12.81 and 0.6405. The related exceedance probability is also correct: 0.5711010829. Lecture 7.20 supplies only the lucky-selection principle, not this arithmetic.  
   **Concrete fix:** Add the expectation formula and define \(F\) as the Binomial(20, 0.5) CDF, or remove the expected-score sentence and retain the fully derived 57.11% result.  
   **Agreement:** Reviewer A only; Reviewer B reported no finding.

2. **Category:** Exercise contract  
   **Severity:** Medium  
   **Offending text:** “Then change two things … Set `n_test` to 50 … Then let the test scores into the choice…”  
   **What is wrong:** The two variations are not specified as independent edits. Read cumulatively, the second retains a 50-item test set, whereas the published 0.8367 and 0.8118 require validation and test sets of equal size. Moreover, `best_of_n` returns only means, so merely changing `n_test` cannot display the promised `0.0562` spread; the third draw is also absent from the displayed code. The exercise therefore does not reproduce its expected results through the stated edits, contrary to CONTEXT.md §3.  
   **Evidence verified:** Receipt `valid-18`, `variants.py`, and `run.log` confirm that the printed figures come from separate, fully coded experiments. My exact calculation gives an expected selected test score of 0.8881317 when `n_val=200`, `n_test=50`, and selection uses `val + test`; with both sizes 200 it gives 0.8366118, consistent with the reported simulation value 0.8367. The stated SE is correct: \(\sqrt{0.16/50}=0.0565685\).  
   **Concrete fix:** Present two explicitly independent modifications. Show the `retest.std()` calculation for the first; for the second, reset `n_test=n_val`, create `third`, select with `val + test`, and gather both selected test and third-draw scores.  
   **Agreement:** Reviewer A only; Reviewer B reported no finding.

## Rejected findings

- Reviewer A’s implication that the variant numbers themselves are incorrect does not survive: receipt `valid-18`, `variants.py`, `run.log`, and independent calculation support them; the defect is the prose-to-code path.
- The claimed omission of `torch.manual_seed(0)` does not survive: it is present at the top of the displayed script, and rerunning the edited script resets the seed.

## Publication judgment

Not publishable as-is. The single most important change is to add the missing order-statistic derivation for 12.81—or remove that number—so every worked-example result is recomputable from the page.
