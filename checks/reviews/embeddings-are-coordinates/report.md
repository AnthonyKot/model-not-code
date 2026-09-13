## **Confirmed findings**

1. **Category:** wrong arithmetic · **Severity:** medium  
   **Offending text:** “(0.119 − 1)/0.1 = −8.808”, “0.881/0.1 = +8.808”, and “−ln 0.119 = 2.127.”  
   **What is wrong:** The displayed operands do not produce the displayed results. I get −8.810, +8.810, and 2.12863 (2.129). Using the unrounded softmax probabilities, \(p=0.119202922\) and \(1-p=0.880797078\), gives gradients ±8.80797078 and loss 2.12692801; the downstream vectors and cosines then agree with the run log and receipt.  
   **Evidence:** CONTEXT.md §3 and §5 require recomputable worked arithmetic; receipts rows `embeddings-18`–`embeddings-22`; `corpus/embeddings-are-coordinates/run.log`.  
   **Fix:** Show probabilities as 0.1192 and 0.8808, then use those values in both gradient expressions and write “−ln 0.1192 = 2.127.” This merges Reviewer A’s two arithmetic findings.

2. **Category:** current product claim · **Severity:** medium  
   **Offending text:** “A small sentence encoder of about 22 million parameters produces 384 numbers per text.”  
   **What is wrong:** This turns properties of a particular checkpoint into an unnamed, present-tense product claim.  
   **Evidence:** CONTEXT.md §4 requires product/framework examples to be bounded where currency matters. Receipt `embeddings-05` identifies the `multi-qa` MiniLM checkpoint and marks the figures “as of the course recording.” Lecture `course-4735368/34-04-building-training-and-testing-model.txt` states that the selected model had about 22 million parameters and 384-dimensional outputs.  
   **Fix:** Make it a historical, named example: “The MiniLM checkpoint used for this example had about 22 million parameters and emitted 384 numbers per text.”

3. **Category:** current product naming convention · **Severity:** medium  
   **Offending text:** “in one family of sentence encoders ‘multi’ means multiple sources, not multiple languages.”  
   **What is wrong:** A specific Sentence Transformers checkpoint convention is generalized and stated as current. **Both reviewers independently identified this problem.**  
   **Evidence:** CONTEXT.md §4; receipt `embeddings-14`, explicitly bounded to the recording. Lecture `course-4735368/34-04-building-training-and-testing-model.txt` says specifically that `multi-qa-MiniLM` used `multi` for QA pairs from diverse sources, while multilingual models were labelled `multilingual`.  
   **Fix:** Name the fixed artifact and use past tense: “In the Sentence Transformers checkpoint name `multi-qa-MiniLM`, `multi` denoted QA pairs from diverse sources; multilingual checkpoints used `multilingual` explicitly.”

4. **Category:** anthropomorphism hiding the mechanism · **Severity:** low  
   **Offending text:** “training never stops pushing.”  
   **What is wrong:** “Pushing” obscures which derivative remains non-zero and overstates the result: at cosine extrema, the score-level cross-entropy derivative is non-zero, but the cosine gradient with respect to an already aligned vector can be zero.  
   **Evidence:** CONTEXT.md §4; recomputation at τ=1 gives probability 0.880797, loss 0.126928, and score/cosine derivatives ±0.119203.  
   **Fix:** Say: “Even at the largest possible cosine margin, the loss remains 0.127; temperature rescales the logits and lowers that floor.”

## **Rejected findings**

- **Reviewer A — “both are renormalised onto the circle”:** The caption describes the diagram’s unit-circle projection; the table plainly retains lengths 1.0602 and 1.0343, and the code normalizes copies when computing cosine. It does not establish a false in-place update.
- **Reviewer A — unexplained step size 0.05:** The preceding prose defines stepping against the gradient, and the table supplies the complete update \(d-0.05\times\text{gradient}\). The arbitrary hyperparameter need not be derived for the reader to recompute the step.
- **Reviewer A — “The loss is satisfied”:** The same sentence immediately states the operational condition—when the true score exceeds the others sufficiently—and follows it with the measured loss and cosine. The metaphor does not hide the mechanism here.

## **Publication judgment**

Not publishable as-is. The single most important change is to make the probability, gradient, and loss rows use consistent precision so every displayed equality recomputes correctly.
