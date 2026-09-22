# Search the Catalogue, Then Answer From It

A customer of an online shop types **cheap keyboard for laptop**. The product that should come first is listed as *Slim wireless keyboard*, and its title says neither "cheap" nor "laptop". The keyword index puts *Laptop stand* on top instead, on one shared word. The shop needs two things the index cannot give: a search box that puts the keyboard first, and a one-paragraph answer written from the products the search found. What has to change for the right product to win, and for the answer to be written from it?

The chapter builds both from the same parts. Text becomes numbers a loss can move. Each text becomes one vector, so a catalogue of millions is scored without running the model on every pair. The tokens of a query look at each other, which is how *keyboard* comes to carry "for a laptop". And the same blocks, with one extra rule, write the answer one token at a time. The figure is the map; every example is synthetic and small enough to recompute.

<figure class="diagram">
<div class="pipeline-scroll" role="region" aria-label="Search and answer pipeline; scroll horizontally to follow all stages" tabindex="0">
<svg viewBox="0 0 720 340" width="100%" role="img" aria-label="Pipeline. Top row, the parts both models are built from: query text, tokenizer, token IDs, embedding rows plus positions, attention blocks. Search row: no mask and mean pool, unit vector, cosine against every catalogue vector, top titles. Answer row: prompt of question plus top titles, the generator's own blocks with a causal mask, scores divided by temperature then softmax, pick a token, which is appended and fed back." style="max-width:720px;font-family:inherit;font-size:12px">
  <defs>
    <marker id="stc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1.2">
    <rect x="10" y="20" width="120" height="48" rx="6"/>
    <rect x="150" y="20" width="120" height="48" rx="6"/>
    <rect x="290" y="20" width="120" height="48" rx="6"/>
    <rect x="430" y="20" width="130" height="48" rx="6"/>
    <rect x="580" y="20" width="130" height="48" rx="6"/>
    <rect x="580" y="140" width="130" height="48" rx="6"/>
    <rect x="430" y="140" width="130" height="48" rx="6"/>
    <rect x="290" y="140" width="120" height="48" rx="6"/>
    <rect x="150" y="140" width="120" height="48" rx="6"/>
    <rect x="150" y="250" width="120" height="48" rx="6"/>
    <rect x="290" y="250" width="120" height="48" rx="6"/>
    <rect x="430" y="250" width="130" height="48" rx="6"/>
    <rect x="580" y="250" width="130" height="48" rx="6"/>
  </g>
  <g stroke="currentColor" stroke-width="1.2" fill="none">
    <line x1="130" y1="44" x2="148" y2="44" marker-end="url(#stc-arrow)"/>
    <line x1="270" y1="44" x2="288" y2="44" marker-end="url(#stc-arrow)"/>
    <line x1="410" y1="44" x2="428" y2="44" marker-end="url(#stc-arrow)"/>
    <line x1="560" y1="44" x2="578" y2="44" marker-end="url(#stc-arrow)"/>
    <line x1="645" y1="68" x2="645" y2="138" marker-end="url(#stc-arrow)"/>
    <line x1="580" y1="164" x2="562" y2="164" marker-end="url(#stc-arrow)"/>
    <line x1="430" y1="164" x2="412" y2="164" marker-end="url(#stc-arrow)"/>
    <line x1="290" y1="164" x2="272" y2="164" marker-end="url(#stc-arrow)"/>
    <line x1="210" y1="188" x2="210" y2="248" marker-end="url(#stc-arrow)"/>
    <line x1="270" y1="274" x2="288" y2="274" marker-end="url(#stc-arrow)"/>
    <line x1="410" y1="274" x2="428" y2="274" marker-end="url(#stc-arrow)"/>
    <line x1="560" y1="274" x2="578" y2="274" marker-end="url(#stc-arrow)"/>
    <path d="M645,298 C645,318 350,318 350,300" marker-end="url(#stc-arrow)" stroke-dasharray="4 3"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="70" y="48">query text</text>
    <text x="210" y="48">tokenizer</text>
    <text x="350" y="48">token IDs</text>
    <text x="495" y="40">embedding rows</text><text x="495" y="56">+ positions</text>
    <text x="645" y="48">attention blocks</text>
    <text x="645" y="160">no mask,</text><text x="645" y="176">mean pool</text>
    <text x="495" y="168">one unit vector</text>
    <text x="350" y="160">cosine with</text><text x="350" y="176">every title</text>
    <text x="210" y="168">top titles</text>
    <text x="210" y="270">question</text><text x="210" y="286">+ top titles</text>
    <text x="350" y="270">generator blocks,</text><text x="350" y="286">causal mask</text>
    <text x="495" y="270">scores ÷ temperature,</text><text x="495" y="286">softmax</text>
    <text x="645" y="278">pick a token</text>
    <text x="500" y="330" font-size="12">append the token and run again</text>
  </g>
  <g fill="currentColor" font-size="12" text-anchor="start">
    <text x="10" y="160">search</text>
    <text x="10" y="270">answer</text>
  </g>
</svg>
</div>
<p class="pipeline-scroll-hint">Scroll the diagram sideways to follow all stages.</p>
<figcaption>The chapter's pipeline. The top row lists the parts both models are built from; each model has its own trained weights. Search averages its blocks' output into one vector; the answer runs the generator's blocks, with a mask, once per generated token.</figcaption>
</figure>

## Text becomes numbers a loss can move

A model computes with numbers, so the query is first cut into pieces from a fixed list, and each piece is replaced by its row number in that list. The pieces are **tokens**, the row numbers **token IDs**, the list the **vocabulary**, and the code that does the cutting the **tokenizer**, one call, `tokenizer.encode(text)`, returning integers. Each ID selects one row of the model's **embedding table**, a learned vector per token, and from that point the network never sees a character again. So a typo is several rare IDs where a frequent word is one; the tokenizer belongs to the weights, since another tokenizer selects the wrong rows without an error; and tokens are what the **context window** is measured in and what hosted models charge for.

<details>
<summary>Optional: how the vocabulary is built by counting</summary>

**Byte-pair encoding** counts. In a query log, *case* occurs 5 times, *cases* 3, *base* 2 and *cash* once. Count every pair of neighbouring characters, weighted by its word's count: a+s occurs 11 times, s+e 10, c+a 9. Merge the winner into `as`; recounting, as+e wins round 2, giving `ase`, and c+ase wins round 3, giving `case`. Three merges leave nine entries in sorted order: a 0, as 1, ase 2, b 3, c 4, case 5, e 6, h 7, s 8. To encode, replay the merges in order:

| Text | After replaying a+s, as+e, c+ase | IDs |
|---|---|---|
| case | case | [5] |
| cases | case · s | [5, 8] |
| base | b · ase | [3, 2] |
| cash | c · as · h | [4, 1, 7] |
| caes (a typo) | c · a · e · s | [4, 0, 6, 8] |

</details>

Start with the smallest search model that can learn: one query, two titles shown for it, a click on the first. The model gives each title a **score**, and at this size the scores are its entire set of parameters, a for *Slim wireless keyboard* and b for *Laptop stand*, both starting at 0. Scores become probabilities with the **softmax**:

<p class="formula">p<sub>i</sub> = e<sup>s<sub>i</sub></sup> / Σ<sub>j</sub> e<sup>s<sub>j</sub></sup></p>

s<sub>i</sub> is title i's score; e<sup>s<sub>i</sub></sup> raises e, about 2.718, to it, which makes every entry positive; Σ<sub>j</sub> adds the same over all titles j, so the probabilities sum to one. With a = b = 0 both titles get 0.5. The **loss** says how wrong the model is on the click, as one number:

<p class="formula">L = −ln p<sub>clicked</sub></p>

p<sub>clicked</sub> is the probability the model gave the clicked title, and ln the natural logarithm. At 0.5 it is ln 2 = 0.69315; it is 0 only when that probability is 1, and grows without limit as it falls towards 0. This is the **cross-entropy** loss, and the encoder, the generator and chapter 2's classifier all train on it.

Each step needs a direction for every parameter. The **gradient** is the list of the loss's slopes, one per parameter; for cross-entropy after a softmax the slope for title i is p<sub>i</sub> − y<sub>i</sub>, where y<sub>i</sub> is 1 for the clicked title and 0 for the rest: −0.5 for a and +0.5 for b. **Gradient descent** moves every parameter against its slope by an amount the **learning rate** η scales. With η = 1 the first step takes a to 0.5 and b to −0.5, the keyboard's probability to 0.731 and the loss to 0.3133; five steps reach 0.914 and 0.0901, in shrinking steps, because the slope shrinks as p approaches 1. In PyTorch the loop is four lines, the same four for every model in this book:

```python
loss = F.cross_entropy(scores, target)   # softmax, then minus the log-probability of the target
opt.zero_grad()                          # clear the previous step's slopes
loss.backward()                          # compute the slope of the loss for every parameter
opt.step()                               # move every parameter against its slope
```

What training produces is a file of numbers, here a and b, in a real search model many learned weights; the program you deploy is that file plus the tokenizer that turns text into its input.

<details>
<summary>Optional: five steps of gradient descent on the two scores</summary>

<p class="formula">s ← s − η · (p − y)</p>

Each score s is replaced by the value on the right; p − y is its slope and η the learning rate. With η = 1, a becomes 0 − 1 × (−0.5) = 0.5 and b becomes −0.5. Repeat:

| Step | a | b | p for the keyboard | Loss |
|---|---|---|---|---|
| 0 | 0 | 0 | 0.5 | 0.6931 |
| 1 | 0.5 | −0.5 | 0.731 | 0.3133 |
| 2 | 0.769 | −0.769 | 0.823 | 0.1946 |
| 3 | 0.946 | −0.946 | 0.869 | 0.1405 |
| 4 | 1.077 | −1.077 | 0.896 | 0.1098 |
| 5 | 1.181 | −1.181 | 0.914 | 0.0901 |

A real network's loss has valleys a large step can cross, which is why the learning rate is the first setting you lower when a loss starts rising.

</details>

## One vector per text, so the catalogue is scored once

Scoring every query–title pair with one model is ruled out by cost: with a catalogue of 2,000,000 titles and 1,000 queries a minute, a pair scorer runs 2,000,000 × 1,000 = 2,000,000,000 passes a minute. An **encoder** instead turns any text into one fixed-length vector: the catalogue is encoded once and stored, each query once when it arrives, 1,000 passes a minute, and ranking compares vectors.

The encoder's blocks, built in the next section, return one vector per token; the **mean pool** averages them, leaving out the padding that fills shorter texts in a batch. Vectors are compared with **cosine similarity**:

<p class="formula">cos(q, d) = (q · d) / (|q| × |d|)</p>

q is the query's vector and d a title's; q · d is their **dot product**, multiplied position by position and added; |q| and |d| are their lengths, the square root of the sum of squared entries. The result is the cosine of the angle between them: 1 when they point the same way, 0 at right angles, −1 when opposite. If every vector is divided by its length when stored, the cosine is the dot product, and scoring the whole catalogue is one matrix multiplication and a sort.

<details>
<summary>Optional: the mean pool with padding, and the index at millions of products</summary>

With the three token outputs of the next section, (0.107, 0.787), (0.333, 0.333) and (0.787, 0.107), and one padding row of invented numbers (5, −5), the plain mean is (1.557, −0.943); over the three real tokens it is (0.409, 0.409). The code multiplies each row by a mask of 1 for real tokens and 0 for padding, sums, and divides by the count of real tokens; attention needs the same mask. At millions of products, vector databases use an approximate nearest-neighbour index, which searches only likely neighbours grouped offline and may miss the true top match.

</details>

The training pairs come from the search log: a query and the title a customer clicked. A batch holds B pairs; encode both sides with the same encoder and compute the B × B table of cosines, entry (i, j) comparing query i with title j. The diagonal holds the clicks, every other entry pairs a query with somebody else's title, and each row is a classification over B titles trained with the cross-entropy above, the off-diagonal entries counting as wrong though the click log does not prove it.

One setting stands between the cosines and that softmax. Cosines lie between −1 and 1, and a softmax over numbers that close cannot become confident, so a **temperature** τ divides every cosine first; in the sentence-transformers library it is `MultipleNegativesRankingLoss(model, scale=20.0)`, `scale` being 1/τ, so the default is τ = 0.05. In the worked row below, *cheap keyboard for laptop* sits at cosine 0.6 from its clicked title and 0.8 from *Laptop stand*; one training step at τ = 0.05 moves them to 0.812 and 0.641, and the order flips. Two rules follow: a cosine threshold belongs to one model and one training temperature, and "similar" means whatever the pairs said, so a pretrained encoder earns trust on your catalogue only on a held-out set of your own pairs.

<details>
<summary>Optional: the worked row at τ = 1 and τ = 0.05, and the step that flips the order</summary>

With q = (1, 0), the clicked title at (0.6, 0.8) and *Laptop stand* at (0.8, −0.6), all unit length, the cosines are 0.6 and 0.8.

| | τ = 1 | τ = 0.05 (scale 20) |
|---|---|---|
| Scores, cosine ÷ τ | 0.6, 0.8 | 12, 16 |
| Probability of the keyboard | 0.450 | 0.018 |
| Loss, −ln of that | 0.798 | 4.018 |
| Slope of the loss per unit of the keyboard's cosine, (p − 1) ÷ τ | −0.550 | −19.64 |

At τ = 0.05 the slope, (p − 1) ÷ τ, is about 36 times larger.

A cosine changes with a unit vector d as q − cos × d, the part of q at right angles to d, since moving d along itself only changes its length. Multiply by the slope and step with a learning rate of 0.02, at τ = 0.05:

| | Slim wireless keyboard | Laptop stand |
|---|---|---|
| q − cos × d | (1, 0) − 0.6 × (0.6, 0.8) = (0.64, −0.48) | (1, 0) − 0.8 × (0.8, −0.6) = (0.36, 0.48) |
| × loss slope (−19.64 and +19.64) | (−12.570, 9.427) | (7.070, 9.427) |
| d − 0.02 × that | (0.8514, 0.6115) | (0.6586, −0.7885) |
| New cosine with q, after dividing by the length | 0.8514 ÷ 1.0482 = 0.8122 | 0.6586 ÷ 1.0274 = 0.6410 |

</details>

## How the shop tells "laptop keyboard" from "keyboard stand"

The pooled vector can only carry what the token vectors carry, and after the embedding lookup *keyboard* is the same vector in *keyboard for laptop* and in *keyboard stand*. Search needs the vector for *keyboard* in this query to carry "for a laptop", and **attention** is the layer that mixes context into each token's vector. From each token's vector, three learned weight matrices compute a **query** (what this position looks for), a **key** (what it offers to match) and a **value** (what it contributes). Each query is scored against every key, the scores become weights with a softmax, and the position's output is the weighted sum of all the values: a lookup that returns a blend instead of one entry. Take the three tokens of *keyboard for laptop* with invented vectors small enough to check by hand; the two value numbers read as "about a keyboard" and "about a laptop".

| Token | Key | Query | Value |
|---|---|---|---|
| 1 keyboard | (2, 0, 0, 0) | (0, 0, 2, 0) | (1, 0) |
| 2 for | (0, 2, 0, 0) | (1, 1, 1, 0) | (0, 0) |
| 3 laptop | (0, 0, 2, 0) | (2, 0, 0, 0) | (0, 1) |

**Score.** The keyboard's query (0, 0, 2, 0) against the three keys gives dot products 0, 0 and 4, each divided by √d<sub>k</sub>, the square root of the key length, here 2, which keeps long vectors from inflating scores: 0, 0, 2. **Weight.** The softmax of 0, 0, 2 is 1, 1 and e<sup>2</sup> = 7.389 over their total 9.389: 0.107, 0.107 and 0.787. **Blend.** 0.107 × (1, 0) + 0.107 × (0, 0) + 0.787 × (0, 1) = (0.107, 0.787). The keyboard's output now mostly carries the laptop's value; in *keyboard stand* the same token would blend the stand's value instead, and the two pooled vectors part company. For all rows, with the queries, keys and values stacked as the rows of matrices Q, K and V:

<p class="formula">Attention(Q, K, V) = softmax(Q·K<sup>T</sup> / √d<sub>k</sub>) · V</p>

Q·K<sup>T</sup> is the table of every query's dot product with every key (K<sup>T</sup> is K transposed); dividing by √d<sub>k</sub> scales it; the softmax runs along each row; multiplying by V blends the values, one output row per token. In PyTorch this is `F.scaled_dot_product_attention(q, k, v)`, exactly those four steps; a real layer adds a fourth projection on the blended output and runs several such **heads** side by side in each of many layers.

Attention on its own ignores order, so *keyboard for laptop* and *laptop for keyboard* would pool to the same vector; models add a **position** vector to each token's embedding before the first layer, in the lab a second learned table. The search encoder reads the whole query both ways: every token may attend to every other, including later ones, because the full query is given.

**If the answer writer were trained with the same both-ways attention as the search encoder, what would it learn to do?**

## The same blocks write the answer, one token at a time

The answer writer is a **generator**: a second model with the same kinds of layers, trained separately, plus one layer that turns each position's output vector into a score for every entry of the vocabulary. Those scores are **logits**, and a softmax turns them into next-token probabilities; the shop's prompt is the customer's question followed by the top titles from search. Training is the cross-entropy again: at every position of a document, the probability of the token that actually comes next, a loss of 0.44 if that probability is 0.644, 3.44 if it is 0.032. One pass computes it for every position of every document in a batch.

Here is where that one pass would cheat. Go back to the attention table for *keyboard for laptop*, now as the start of generated text. Position 2, *for*, is trained to predict token 3, *laptop*. Its query (1, 1, 1, 0) scores 1, 1, 1 against the three keys, so with both-ways attention its weights were 0.333 on each token, and a third of its output is *laptop*'s own value: the answer fed into its own prediction. A model trained like that learns to copy from the right, and fails as soon as it generates, because then the next token does not exist yet.

The requirement is exact: position i may use tokens 1 to i and nothing after, so every weight right of the diagonal must be exactly zero while each row still adds up to one. Zeroing weights after the softmax breaks the second condition; changing the scores before it satisfies both, because e<sup>−∞</sup> = 0 contributes nothing to the top of its fraction or to the row's total. That is the **causal mask**:

<p class="formula">weights = softmax(Q·K<sup>T</sup> / √d<sub>k</sub> + M)</p>

Q·K<sup>T</sup> / √d<sub>k</sub> is the scaled score table from the previous section. M has the same shape and holds 0 where the column is at or before the row and −∞ where it comes after, so adding it sends only the forbidden scores to −∞ before the softmax runs along each row; every layer applies it, because one layer that could see ahead would undo the rest, and in PyTorch it is one argument, `is_causal=True`. For the row that cheated:

| Row | Masked scores | Masked weights | Masked output | Both-ways output |
|---|---|---|---|---|
| 2 for | 1, 1, −∞ | 0.5, 0.5, 0 | (0.5, 0) | (0.333, 0.333) |

Nothing of *laptop* remains in row 2. The same property settles generation: with the mask, appending a token changes no earlier row by a digit, so a serving system can store the keys and values of rows already computed. That store is the **KV cache**, and chapter 7 starts from it.

<details>
<summary>Optional: the whole masked table, and what appending a fourth token changes</summary>

| Row | Masked scores | Masked weights | Masked output | Both-ways output |
|---|---|---|---|---|
| 1 keyboard | 0, −∞, −∞ | 1, 0, 0 | (1, 0) | (0.107, 0.787) |
| 2 for | 1, 1, −∞ | 0.5, 0.5, 0 | (0.5, 0) | (0.333, 0.333) |
| 3 laptop | 2, 0, 0 | 0.787, 0.107, 0.107 | (0.787, 0.107) | (0.787, 0.107) |

Append a fourth token with key (0, 0, 0, 2), query (1, 0, 1, 1) and value (1, 1): with the mask, rows 1 to 3 do not change; without it, row 1 moves to (0.193, 0.807).

</details>

Generating is a loop you could write: run the blocks on the prompt, take the logits at the last position, choose a token, append it, and run again until the end-of-text token or the request's `max_tokens` limit; every token of the answer costs one more pass. Hosted APIs expose the choice of token as a request field, `temperature`: at 0 the loop takes the highest-probability token every time, **greedy** decoding; above 0 it samples in proportion to probability after dividing every logit by T, which sharpens the distribution below 1 and flattens it above. This T and the encoder's τ are one pattern at two stages: both divide scores before a softmax, but τ is part of the training loss and decided where every catalogue vector was stored, while T acts only when a token is chosen, per request, and changes nothing stored. When chapter 4 tunes this generator on people's preferences, the probabilities it adjusts are these softmax outputs over tokens.

<details>
<summary>Optional: the sampling temperature on four candidate tokens</summary>

Four candidates with logits 3, 2, 1 and 0:

| T | Logits ÷ T | Probabilities |
|---|---|---|
| 0.5 | 6, 4, 2, 0 | 0.865, 0.117, 0.016, 0.002 |
| 1 | 3, 2, 1, 0 | 0.644, 0.237, 0.087, 0.032 |
| 2 | 1.5, 1, 0.5, 0 | 0.455, 0.276, 0.167, 0.102 |

T = 0 is the limit of this sharpening: the top token, always.

</details>

## Where it stops

Both halves fail as the mechanism predicts, and neither failure raises an error.

Search fails on pair types absent from training. Spanish-speaking customers arrive, typing *teclado para portátil*, while every training pair was English. No Spanish query appears in any row of the B × B table, so no term of any loss pulls it towards its title: words that occur only in Spanish queries keep exactly the embedding rows they started with, their query vectors still move through the shared weights, and nothing checks where they land. The lab shows both, and Spanish top-1 of 1 in 6. Part numbers and unrecorded misspellings are the same gap; the remedy is pairs of the missing kind.

The generator writes by probability, and nothing in the loop compares its sentence with the catalogue. For *chef knife* and *desk lamp*, titles it never saw an answer for, it writes the leather watch's and the steel kettle's answers at T = 0: search was right and the answer is still wrong. For the Spanish queries, search returns the watch and the generator describes the watch just as fluently. At T = 2, one of four samples for the keyboard mixes words from several products; temperature changes how often such text appears, not whether it can.

A real version differs in scale and evidence, not mechanism: an encoder pretrained elsewhere and fine-tuned on the click log, a noisy label since a click is not a purchase; a large pretrained generator; and every claim measured again on held-out real queries.

## Two questions to work

**1. The same row, a third temperature.** The worked row has the keyboard at cosine 0.6 and the stand at 0.8. At τ = 0.1, what are the two scores, the keyboard's probability, the row's loss and the slope per unit of the keyboard's cosine? Does the temperature change which title ranks first?

<details>
<summary>Worked answer</summary>

The scores are 6 and 8. The keyboard's probability is e<sup>6</sup> / (e<sup>6</sup> + e<sup>8</sup>) = 1 / (1 + e<sup>2</sup>) = 0.119, the loss −ln 0.119 = 2.127, the slope (0.119 − 1) ÷ 0.1 = −8.81, between the −0.550 of τ = 1 and the −19.64 of τ = 0.05. The ranking is untouched: the stand still has the larger cosine, and at serving time cosines are compared without any temperature. τ changes how hard each row pushes, not who ranks first; the lab's first variation shows a loss stuck above zero beside a perfect ranking.

</details>

**2. One model for both jobs.** A colleague proposes training the search encoder with the causal mask too, so that one set of weights can serve search and write answers. The mean pool still averages every token's vector, they argue, so nothing is lost. What does the query vector lose, and where is the wrong turn?

<details>
<summary>Worked answer</summary>

With the mask, the vector for *keyboard* at position 1 is computed from position 1 alone; it can never carry "for a laptop", because those tokens are to its right. The pool then averages one vector that saw nothing, one that saw two tokens and one that saw the query; averaging context-blind vectors does not put the context back. The wrong turn is treating the pool as if it mixed tokens. It only adds them; attention mixes, and the mask sets what it may mix. Shared weights are possible, but the encoder's pass must read both ways and the generator's must not.

</details>

## The lab

The lab, [train the search, break it, then generate](../labs/search-the-catalogue.md), trains the one-block encoder on six query–title pairs that share no words and should reach `english top-1 6/6` with `spanish top-1: 1/6`. It then trains the generator, answers from what search found, and ends by appending a token: `0.00e+00` change in the earlier positions with the mask, `1.35e-01` without. Two variations follow: τ = 1, and Spanish pairs added to the loss.

Every number in this chapter was measured on the pairs the models were trained on: six out of six is fit, not accuracy. The shop's next model, a classifier for product photos, comes back from its first run with a held-out score that looks ready to ship. Chapter 2 is about what such a number claims, and finds three ways one number can lie.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 3.7, 28.2, 34.2 and 34.4; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 1.29, 1.32, 3.11, 3.13, 3.20 and 7.22; Building LLMs like ChatGPT from Scratch and Cloud Deployment (Neuralearn.ai, Udemy), lecture 2.3; all paraphrased as study material. Uday Kamath et al., Large Language Models: A Deep Dive, pp. 63–68 and 88–89 (physical); Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 173–177 and 702–703 (physical); Sennrich, Haddow and Birch, arXiv:1508.07909, §3.2; the sentence-transformers 6.0.1 source and the PyTorch 2.14 documentation of scaled_dot_product_attention.*
