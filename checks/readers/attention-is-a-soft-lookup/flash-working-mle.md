### 1. Gut reaction after first read
Strong, intuitive reframing of autoregressive equivalence. It tackles the exact conceptual hurdle software engineers hit when moving from batch training to streaming inference without drowning in generic transformer fluff. My immediate skepticism was whether the hand-worked toy arithmetic would actually hold up or gloss over numerical edge cases.

### 2. What landed
- *"The target is in the matrix; it is not in the row."* This cleanly separates activation computation from loss calculation, untangling a persistent point of confusion for engineers transitioning to autoregressive objectives.
- *"the position information added to each token must depend on its own position, not on the sequence length."* Spot-on caveat. Omitting this precondition is why developers get baffled when sequence-length-normalized position encodings break KV-cache invariance.
- *"a framework's batched kernel may sum a row in a different order from its single-token path, so compare with a tolerance there."* Speaks directly to production reality; floating-point non-associativity across different SIMD reduction trees routinely bites teams during parity validation.

### 3. What didn't
- **Formula inconsistency:**
  Quote: `<p class="formula">weights = softmax((Q·K<sup>T</sup> + M) / √d<sub>k</sub>)</p>`
  In standard attention and the author's own code (`scores = [dot(q, k) / math.sqrt(dk)...]`, then masked with `NEG`), the mask is added *after* scaling: `(Q·K^T / √d_k) + M`. While $-\infty / \sqrt{d_k} = -\infty$ symbolically, in finite float code scaling an additive mask is sloppy and contradicts the script.
- **Misleading claim on compute waste:**
  Quote: *"The mask hides work without saving it: in the plain form the S × S table is computed in full and half of it is then set to −∞."*
  Qualifying it as "plain form" is defensive, but presenting masking as fundamentally wasteful misleads engineers. Anyone deploying LLMs uses fused causal kernels (like FlashAttention) that skip upper-triangular tiles entirely to cut FLOPs and memory bandwidth by roughly half.
- **Worked example arithmetic:**
  I calculated the matrix by hand. Row 2 unmasked yields $(0.213, 0.893)$, Row 3 yields $(0.910, 0.335)$, and Row 4 yields weights $[0.297, 0.109, 0.297, 0.297]$ with output $(0.594, 1.000)$. The numbers printed on the page are completely accurate.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The code uses pure standard-library Python, defines all inputs explicitly, and contains unambiguous assertions (`assert o4[i] == o3[i]`). Running it gives immediate confirmation: the masked assertion passes, the unmasked assertion fails, and the printed values match the text.

### 5. What changed between read one and read two
On read one, I bought into the smooth narrative arc connecting causal masking to KV-cache invariance. On read two, looking at mechanics rather than flow, I caught the formula-versus-code discrepancy regarding where $\sqrt{d_k}$ divides, noticed the omission of modern block-sparse causal tiling under the compute-waste claim, and confirmed that the manual dot products and softmax normalizations were mechanically sound.

### 6. One concrete thing I'd tell the author to change
Update the mathematical formula to `softmax((Q·K^T / √d_k) + M)` so the notation matches both standard literature and the essay’s own Python implementation, where scores are scaled before the mask is applied.
