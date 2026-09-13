### 1. Gut reaction after first read
This is the antidote to the vendor and LinkedIn fluff my team gets bombarded with daily. It cuts through the mystical "semantic meaning" pitch and pins retrieval quality directly to training pair distribution and linear algebra. If a senior dev brought me this level of mechanistic clarity when diagnosing a broken production search service, I would greenlight their ML study sabbatical immediately.

### 2. What landed
* **"Scoring a catalogue of 1.8 million titles is then one matrix multiplication... followed by a sort. That runs on a CPU."** It grounds ML in mechanical sympathy my systems engineers already possess, stripping away the cargo-cult assumption that you need GPUs just to query embeddings.
* **"A threshold such as 'above 0.8 means relevant' belongs to one model and its training temperature, not to another model."** In hiring loops, candidates constantly recite hardcoded 0.8 cosine similarity thresholds as universal truths; seeing the temperature math dismantle that myth makes this immediately useful for production sanity.
* **"names mislead, and in one family of sentence encoders 'multi' means multiple sources, not multiple languages."** That is a battle-scarred engineering reality that saves teams weeks of dead-end triage.

### 3. What didn't
The arithmetic checked out completely: my hand calculations matched the author's table ($d_1$ cosine moved from 0.6 to 0.832, $d_2$ fell from 0.8 to 0.620, loss began at 2.127). 

Where I balked was this geometric leap:
> "For unit vectors, stretching d along its own direction leaves the angle unchanged, so only movement across d counts, and the gradient of the cosine with respect to d is q minus the cosine times d"

Asserting that "only movement across d counts" feels like hand-waving to an engineer looking for a derivation. A developer trying to follow the math will pause and wonder where the quotient rule went. Furthermore, shifting $d_1$ and $d_2$ directly as free-floating vectors sidesteps the harder mental hurdle; brushing it off with *"The gradient does not land on free-standing vectors: it flows back through the encoder..."* glides right over the chain rule that connects this toy step to real weights.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The script is self-contained, CPU-friendly, and has zero external data dependencies. I would know right away if I got it right because the author provides concrete numerical checkpoints: the step-1 gradients (`[-5.6371, 4.2278]`), the step-0 loss (`4.3275`), the step-200 loss (`0.0061`), and the final retrieval scores (English hits 6, Spanish hits 1, retraining reaches 6).

### 5. What changed between read one and read two
On read one, I was sold on the high-level operational lesson: out-of-distribution queries silently fail because no loss pulled them. On read two, doing the vector math myself, I realized the worked example isn't training a model at all—it's manually nudging coordinates on a 2D circle. The leap from manipulating free coordinates to updating an `nn.EmbeddingBag` via backprop in the code is much steeper than the prose admits.

### 6. One concrete thing I'd tell the author to change
Provide the one-line quotient rule derivation showing why $\nabla_d \frac{q \cdot d}{\|d\|} = \frac{q - (q \cdot d)d}{\|d\|}$ when $\|d\|=1$, instead of hand-waving that "only movement across d counts." Developers trust calculus more than spatial metaphors.
