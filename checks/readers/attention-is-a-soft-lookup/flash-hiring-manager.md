### 1. Gut reaction after first read
This is refreshingly grounded systems thinking that strips the pseudo-mysticism out of attention. Framing causal attention around prefix invariance and state preservation immediately bridges the conceptual gap between training pipelines and sequential inference loops. If a six-month sabbatical turns a senior platform engineer into someone who understands model mechanics at this operational level rather than reciting paper abstracts, I would approve the budget tomorrow.

### 2. What landed
* **"The target is in the matrix; it is not in the row."** This cuts straight through the hand-waving about autoregressive generation and explains why batch training does not suffer from temporal data leakage.
* **"The mask hides work without saving it: in the plain form the S × S table is computed in full and half of it is then set to −∞."** Systems leads care about compute efficiency. Acknowledging that causal masking during training is quadratic compute waste before introducing KV caching connects math to real GPU bills.
* **"A serving system stores them instead of recomputing them; that store is the KV cache..."** Most candidates I interview treat the KV cache as an opaque performance trick; tying it directly to mathematical invariance grounds it as standard incremental memoization.

### 3. What didn't
* **Formula discrepancy:** `<p class="formula">weights = softmax((Q·K<sup>T</sup> + M) / √d<sub>k</sub>)</p>`. Writing $M$ inside the division implies scaling the mask matrix, whereas the accompanying Python code and standard production kernels scale first and mask second: `(Q·K^T / √d_k) + M`. With float constants like `-1e9`, dividing by $\sqrt{d_k}$ introduces an unnecessary implementation mismatch.
* **Orientation hitch:** *"Its column's scaled scores against rows 1 to 3 are 0.5, 1 and 0..."* I had to stop and re-read to confirm whether we were evaluating $q_4$ across past keys or past queries against $k_4$. The arithmetic came out cleanly—$q_1 \cdot k_4 / 2 = 0.5$, $q_2 \cdot k_4 / 2 = 1.0$, $q_3 \cdot k_4 / 2 = 0.0$, and row 4 output matched $(0.594, 1.000)$—but the column-versus-row projection is easy to invert mentally without a quick visual guide.
* **Tone:** *"if it mentions intent rather than arithmetic, it is not finished."* The schoolmaster scolding felt patronizing for experienced developers.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The script relies purely on Python's standard library `math` module and hardcoded tuples. Because it embeds explicit assertions (`assert o4[i] == o3[i]`) and lists expected rounded float values for every row, anyone running it gets immediate binary feedback: either it terminates cleanly with the assertions passing, or Python raises an `AssertionError`.

### 5. What changed between read one and read two
On read one, I bought the clean narrative and appreciated the conceptual bridge between training and generation. On read two, calculating the vector dot products by hand surfaced the notation clash between the mathematical formula and the Python implementation. I also paid closer attention to the operational caveats at the end—specifically that non-associative floating-point addition in GPU kernels breaks exact `==` invariance across batch sizes in production.

### 6. One concrete thing I'd tell the author to change
Update the mathematical formula to `softmax((Q·K^T / √d_k) + M)` so it strictly matches standard library implementations and your own Python code, eliminating ambiguity around scaling a finite negative float constant.
