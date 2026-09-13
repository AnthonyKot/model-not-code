### 1. Gut reaction after first read
This is a refreshingly rigorous explanation of bi-encoder mechanics and InfoNCE loss that completely avoids the hand-wavy "embeddings capture semantic meaning" fluff common in software blogs. Walking through the actual gradient arithmetic on a 2D sphere is a fantastic pedagogical choice. My immediate hesitation was whether using an `EmbeddingBag` to demonstrate out-of-distribution failure oversimplifies things to the point of misleading engineers about modern subword tokenizers.

### 2. What landed
- **The bi-encoder cost argument**: *"An encoder runs once per item when it is stored and once per query when it arrives; ranking then compares vectors without consulting the model."* This immediately anchors why we accept representation limits instead of running cross-encoders everywhere.
- **The geometric gradient**: *"the gradient of the cosine with respect to d is q minus the cosine times d."* Explaining that movement along $d$ doesn't alter angle, leaving only the component orthogonal to $d$ (tangent to the unit sphere), is elegant and demystifies why the vector updates work without resorting to differential geometry jargon.
- **Demystifying similarity thresholds**: *"A threshold such as 'above 0.8 means relevant' belongs to one model and its training temperature, not to another model."* Having watched teams copy-paste arbitrary cosine thresholds across models trained with different scale factors, I appreciated seeing this called out directly.

### 3. What didn't
- **The lookup-table sleight of hand**: *"In an encoder built from a lookup table this is literal: the rows for words that occur in no training pair receive a zero gradient... and finish exactly where initialisation put them."* In production, we use subword tokenizers (BPE/WordPiece). Unseen Spanish words or domain part numbers share subword fragments with training data, so their representations *do* move—they just move into corrupted, unaligned positions. Passing off zero gradient as the underlying mechanism conflates a toy implementation detail with the real failure mode of dense retrieval.
- **Version slip**: The text specifies *"PyTorch 2.14 on a CPU"*. PyTorch uses standard minor versioning (e.g., 2.1, 2.4); `2.14` looks like a careless typo that slipped past review.
- **The arithmetic**: The numbers completely held up. I ran the worked example by hand:
  - $\text{softmax}(6, 8) \to p_1 = 0.1192, p_2 = 0.8808$
  - Loss $= -\ln(0.1192) = 2.1269$
  - Loss gradients w.r.t. cosines: $(0.1192 - 1)/0.1 = -8.808$ and $0.8808/0.1 = +8.808$
  - Vector gradients: $-8.808 \times (0.64, -0.48) = (-5.637, 4.228)$ and $8.808 \times (0.36, 0.48) = (3.171, 4.228)$
  - After a $0.05$ step: $d_1 \to (0.8819, 0.5886)$ with norm $1.0602$ ($\cos = 0.832$); $d_2 \to (0.6415, -0.8114)$ with norm $1.0343$ ($\cos = 0.620$). The author's math is exact.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The script has zero external dataset dependencies, runs on CPU in standard PyTorch, and provides exact expected outputs: the Part 1 gradient values, step loss milestones (`4.3275` down to `0.0061`), matching cosine spreads, and exact retrieval hit counts (6 for English, 1 for untrained Spanish, 6 after retraining). A reader can verify their run line by line.

### 5. What changed between read one and read two
On read one, I focused on the clarity of the contrastive loss derivation and enjoyed how clean the math was. On read two, I looked harder at the pedagogical substitution: replacing a transformer with an `EmbeddingBag` makes the code compact and produces a clean boolean test (`spanish vectors changed: False`), but it conceals the true complexity of why multilingual retrieval fails in modern systems.

### 6. One concrete thing I'd tell the author to change
Explicitly warn the reader that the `EmbeddingBag`'s exact zero gradient is a toy artifact of whole-word tokenization. Clarify that modern transformer encoders will move out-of-domain queries via shared subwords, but without aligned training pairs, that movement creates uncalibrated distortion rather than useful alignment.
