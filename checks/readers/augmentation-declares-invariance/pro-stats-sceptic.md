### 1. Gut reaction after first read
I appreciated the framing of data augmentation as a rigorous, verifiable claim rather than a mystical incantation. However, I found myself immediately checking the arithmetic in the middle section and squinting at the terminology in the probability breakdown, wondering if the author was playing fast and loose with basic definitions of compound events. 

### 2. What landed
The central thesis—"A transform is a sentence about your labels"—is excellent. Framing the equation `(x, y) → (T(x), y)` as the explicit statement "the correct label of T(x) is y" gives a concrete mechanism to evaluate an otherwise fuzzy process. I also respected the audit table evaluating transforms against specific datasets. Designating the crop operation on handwritten digits as "look" (meaning it depends entirely on the sample) rather than "safe" or "label" appeals to my preference for empirical validation over sweeping assumptions. 

### 3. What didn't
I tripped over the probability table. The author lists the chance of an untouched image as `0.5 × 0.5 × 0.5 = 0.125`, which correctly models independent coin flips. But then they calculate "Presentations carrying any one transform" as `20,000 × 0.5 = 10,000`. This phrasing is ambiguous and mathematically frustrating. Do they mean the expected number of presentations touched by *at least* one transform? If so, that is `20,000 × (1 - 0.125) = 17,500`. Do they mean *exactly* one transform? That would be `20,000 × (3 × 0.5 × 0.5 × 0.5) = 7,500`. They clearly mean the expected number of presentations carrying *a specific* transform (like the horizontal flip), but "any one" implies the union or a singular constraint. 

Additionally, the claim that changing rotation from a quarter turn to ±9° caused validation accuracy to come "back to about 78%, above the unaugmented 75%" feels like a carefully cherry-picked number chosen to make a tidy narrative, rather than a statistically robust finding with error bars.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The provided Python code is completely self-contained and generates its own tensors, requiring no external data downloads—a rare and welcome trait. I would know exactly if I got it right because the author explicitly provides the expected arrays for both tasks (e.g., `[0.762, 1.0]` and `[1.0, 0.492]`) and even accounts for variance by listing the acceptable range of outcomes (`0.695 to 0.818`) across different random seeds. 

### 5. What changed between read one and read two
On the first read, the "Worked example" grid showing the 3×3 hook felt insultingly simple, like a toy constructed just to make the arithmetic easy. On the second read, I realized it was the exact minimum viable matrix required to prove that the facing task label is obliterated by the flip. I stopped scoffing at the toy example when I saw how directly and perfectly it mapped to the deterministic tensors in the Python script.

### 6. One concrete thing I'd tell the author to change
Fix the wording in the probability table. Change "Presentations carrying any one transform" to "Presentations carrying a specific transform (e.g., the flip)." As currently written, the phrasing invites the reader to conflate the marginal probability of a single independent event with the probability of exactly one event occurring, which derails anyone who actually checks the numbers.
