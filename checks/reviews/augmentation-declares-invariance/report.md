## Confirmed findings

1. **Category:** mechanism contradiction  
   **Severity:** high  
   **Offending text:** “facing task: left” and “what the flip does to the label depends only on what the label means.”  
   **What is wrong:** The diagram conflates the transformed image’s true class with the unchanged label supplied to training. The actual pair is `(left-facing pixels, "right")`; presenting “left” as the label contradicts the essay’s central mechanism.  
   **Evidence:** `CONTEXT.md` §3 requires a recomputable mechanism. The essay defines `(x,y) → (T(x),y)`, and `random_hflip` changes only `x`. Receipt `aug-21` registers the resulting contradictory facing task.  
   **Fix:** Under the mirror show “true facing: left; training label: right.” Make the aria-label and caption distinguish true orientation from the label handed to the loss.

2. **Category:** missing mechanism premise  
   **Severity:** high  
   **Offending text:** “With p = 0.5 both directions arrive under both labels equally often.”  
   **What is wrong:** This requires an unstated balanced starting distribution for the facing task. With all originals facing right, only the `"right"` label occurs: half the presentations have right-facing pixels and half left-facing pixels, both labelled `"right"`. With an initially balanced facing task and an independent 0.5 flip, each pixel-direction/label combination has expected probability `0.5 × 0.5 = 0.25`.  
   **Evidence:** `CONTEXT.md` §§3 and 5 require recomputability. The exercise’s `dataset()` supplies the missing premise with `torch.rand(n) < 0.5`; the preceding worked-example prose does not.  
   **Fix:** State that the facing-task training set begins with an equal expected mix of left- and right-facing hooks, then give the four 25% combinations.

3. **Category:** catalog mechanism toured, not explained  
   **Severity:** high  
   **Offending text:** “Label-preserving transforms enlarge the training distribution; mixup and cutmix mix the labels too.”  
   **What is wrong:** Both reviewers independently found this. The catalog names label mixing as part of the essay’s mechanism, but the essay gives it only one sentence and no formula or worked computation.  
   **Evidence:** `CONTEXT.md` §3 requires the cataloged mechanism to be explained step by step. Receipt `aug-13` explicitly says this mechanism belongs to a separate essay. Lecture `08-03` supplies the omitted steps: choose two samples and compute `x′ = λx₁ + (1−λ)x₂` and `y′ = λy₁ + (1−λ)y₂`.  
   **Fix:** Remove the mixup/cutmix clause from the catalog mechanism line. It is outside this essay’s chosen mechanism.

4. **Category:** number without a receipt  
   **Severity:** medium  
   **Offending text:** `mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]`  
   **What is wrong:** These six external normalization constants are not stated in any receipt. Receipt `aug-16` registers that the cited pipeline uses `Normalize`, but not its numeric arguments.  
   **Evidence:** `CONTEXT.md` §4 requires every number to be derived or receipted. The essay note attributes the values to Géron pp. 492–493, but `receipts.tsv` is the required claim register under §5.  
   **Fix:** Expand `aug-16` or add a receipt containing the exact mean and standard-deviation values and page locator.

5. **Category:** incomplete source register  
   **Severity:** low  
   **Offending text:** “torchvision documentation for RandomRotation, as of 2026-09-13.”  
   **What is wrong:** The documentation appears in the credit line and receipt `aug-23` but is absent from the catalog entry’s `sources[]`.  
   **Evidence:** `CONTEXT.md` §5 requires sources in both the catalog and receipts. The catalog currently lists only the course and Géron.  
   **Fix:** Add `P("https://docs.pytorch.org/vision/stable/generated/torchvision.transforms.v2.RandomRotation.html", "degrees parameter")` to the catalog sources.

## Rejected findings

- **“Presentations carrying any one transform” arithmetic:** No arithmetic is wrong. I get 10,000 presentations for each specified transform, 7,500 carrying exactly one transform, and 17,500 carrying at least one; the next sentence disambiguates the intended first meaning.
- **Unreceipted 80% crop:** Receipt `aug-22` registers the entire audit table as the book’s own hypothesis, and the prose labels it a starting judgment rather than an externally reported figure.
- **Unlabelled `b/d` and `6/9` examples:** They immediately instantiate the explicitly introduced category “It can change the label,” so their exemplary role is already clear; `6/9` is also covered by the registered audit-table hypothesis.
- **Unlabelled `7/1` crop scenario:** It explicitly explains a `look` cell in the table labelled as the book’s own starting judgment and covered by receipt `aug-22`.

## Publication judgment

Not publishable as-is. The single most important change is to repair the SVG and caption so they show the unchanged training label separately from the transformed image’s true facing; the current figure visually contradicts the essay’s central mechanism.
