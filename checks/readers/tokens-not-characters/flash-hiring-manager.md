### 1. Gut reaction after first read
This is the first piece of writing on LLMs I’ve seen that treats an experienced engineer’s intelligence with respect instead of waving hands around "emergent reasoning." It locates a viral AI failure mode in a deterministic, pre-neural lookup table that can be written in thirty lines of code. If the rest of the book teaches machine learning by dissecting the mechanical boundaries where traditional software ends and tensor operations begin, I would sponsor my senior developer's six-month transition without hesitation.

### 2. What landed
- **"The first layer of the network says the same thing in its shape: a matrix with one row per entry in the tokenizer's table, so that the tokenized text is nothing more than a list of row numbers."** This is how systems engineers think. Framing embedding lookups as basic array/row indexing instantly demystifies how discrete text interfaces with matrix multiplication.
- **"the frequent word is cheap and opaque, the rare word expensive and transparent."** A crisp, production-minded synthesis of the engineering trade-off at the heart of subword tokenization.
- **"The failure is contingent on the corpus. The absence is not."** Rigorous discipline. It separates statistical correlation from architectural invariants—the exact distinction I screen for when interviewing ML engineers.

### 3. What didn't
- **"The vectors you may have heard of are produced later... they are not the input."** The phrasing felt slightly patronizing ("you may have heard of"), which is unnecessary for an audience of senior developers who already understand basic vector spaces.
- In the code, `best = max(pairs, key=lambda p: (pairs[p], p))`: the comment notes `"ties broken alphabetically"`, but in Python, `max()` on string tuples selects the lexicographically *highest* value (`'z'` over `'a'`), which is reverse alphabetical. 
- The arithmetic in the worked example did come out exactly as written: Round 1 (u+n=9), Round 2 (s+un=7), and Round 3 (sun+g=3), yielding 5 + 3 = 8 vocabulary entries.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The five-step algorithm translates cleanly into standard-library Python without third-party dependencies. The worked corpus (`sun`: 4, `sung`: 3, `gun`: 2, `gong`: 1) provides exact intermediate verification tables and deterministic target outputs (`sung` as 1 token, `gun` as 2, `gong` as 4, and `snug` as 4). A developer on my team could implement this in twenty minutes and know with 100% certainty whether their code worked.

### 5. What changed between read one and read two
On read one, I was carried by the conceptual punch of the explanation and the relief of seeing a hype-free explanation. On read two, I audited the engineering mechanics: I noticed that the titular word ("strawberry") is actually sidelined until an offhand mention in the final exercise notes, and I realized how heavily the "Limits" section has to lean on the omitted end-of-word marker (`</w>`) to explain why real tokenizers don't collapse word boundaries.

### 6. One concrete thing I'd tell the author to change
Deliver on the title in the core text: show the exact token breakdown of "strawberry" under a production tokenizer (e.g., `str` + `aw` + `berry`), and explicitly point out how the three 'r's are split across distinct integers before the model ever sees them, rather than leaving the title's namesake as an afterthought at the end of the exercise.
