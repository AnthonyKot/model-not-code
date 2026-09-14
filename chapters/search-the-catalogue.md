# Search the Catalogue, Then Answer From It

A customer of an online shop types **cheap keyboard for laptop**. The product that should come first is listed as *Slim wireless keyboard*. Its title says neither "cheap" nor "laptop". A keyword index ranks *Laptop stand* above it, because that title shares a word with the query. The shop wants two things. First, a search box that puts the keyboard on top. Second, a one-paragraph answer written from the products the search found, the kind a shop assistant would give.

This chapter builds both as two models made from the same parts, each trained separately. Text becomes integers, the integers become vectors, the vectors look at each other through attention, and then the road forks. For search, the vectors of a text are averaged into one vector and compared with every product's vector. For the answer, a second model built from the same kind of blocks runs with one extra rule, the causal mask, and produces one token at a time. The figure is the map for the whole chapter; each section builds one box.

<figure class="diagram">
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
    <text x="210" y="41">tokenizer</text><text x="210" y="57" font-size="10">§ 2</text>
    <text x="350" y="48">token IDs</text>
    <text x="495" y="40">embedding rows</text><text x="495" y="56">+ positions</text>
    <text x="645" y="41">attention blocks</text><text x="645" y="57" font-size="10">§ 3</text>
    <text x="645" y="160">no mask,</text><text x="645" y="176">mean pool</text>
    <text x="495" y="160">one unit vector</text><text x="495" y="176" font-size="10">§ 4</text>
    <text x="350" y="160">cosine with</text><text x="350" y="176">every title</text>
    <text x="210" y="168">top titles</text>
    <text x="210" y="270">question</text><text x="210" y="286">+ top titles</text>
    <text x="350" y="270">generator blocks,</text><text x="350" y="286">causal mask</text>
    <text x="495" y="270">scores ÷ temperature,</text><text x="495" y="286">softmax · § 5</text>
    <text x="645" y="278">pick a token</text>
    <text x="500" y="330" font-size="11">append the token and run again</text>
  </g>
  <g fill="currentColor" font-size="11" text-anchor="start">
    <text x="10" y="160">search</text>
    <text x="10" y="270">answer</text>
  </g>
</svg>
<figcaption>The chapter's pipeline. The top row lists the parts both models are built from; each model has its own trained weights. Search averages its blocks' output into one vector; the answer runs the generator's blocks, with a mask, once per generated token.</figcaption>
</figure>

Every example in this chapter is synthetic: the catalogue, the click log and every vector are chosen small enough to recompute by hand, and the exercise trains on a few sentences in seconds. The last section says what the same pipeline needs on a real catalogue.

## What you ship is a file of numbers

Start with the smallest search model that can learn. One query, two titles the shop showed for it, and a click on the first. The model gives each title a **score**, and at this size the scores are the model's entire set of parameters: two numbers, a for *Slim wireless keyboard* and b for *Laptop stand*, both starting at 0. Nothing about keyboards is written anywhere. The click log will set a and b.

Scores become probabilities with the **softmax**:

<p class="formula">p<sub>i</sub> = e<sup>s<sub>i</sub></sup> / Σ<sub>j</sub> e<sup>s<sub>j</sub></sup></p>

s<sub>i</sub> is title i's score. e<sup>s<sub>i</sub></sup> raises e, about 2.718, to that score, which makes every entry positive and lets a higher score take a disproportionately larger share. Σ<sub>j</sub> adds the same quantity over all titles j, so dividing by it makes the probabilities add up to one. With a = b = 0 both titles get 0.5.

The **loss** says how wrong the model is on the click, as one number:

<p class="formula">L = −ln p<sub>clicked</sub></p>

p<sub>clicked</sub> is the probability the model gave the title the customer clicked, and ln is the natural logarithm. The loss is 0 when that probability is 1 and grows without limit as it falls towards 0. At 0.5 it is ln 2 = 0.69315. This is the **cross-entropy** loss, and it is worth meeting carefully here, because the encoder in this chapter trains on it, the generator trains on it, and the classifier in chapter 2 will train on it.

Each training step needs a direction for every score. The **gradient** is the list of the loss's slopes, one per parameter: how much the loss changes per unit of change in that parameter. For cross-entropy after a softmax, the slope for title i is p<sub>i</sub> − y<sub>i</sub>, where y<sub>i</sub> is 1 for the clicked title and 0 for the rest. Here that gives −0.5 for a and +0.5 for b. You do not have to take the formula on trust: raise a from 0 to 0.01 and recompute, and the loss falls to 0.68816, a change of −0.00499 for a step of 0.01, a slope of −0.499. Automatic differentiation, `loss.backward()` in PyTorch, returns the exact slopes without the nudging.

**Gradient descent** moves every parameter against its slope, by an amount the **learning rate** η scales:

<p class="formula">s ← s − η · (p − y)</p>

The arrow replaces each score with the value on its right; p − y is its slope. With η = 1, a becomes 0 − 1 × (−0.5) = 0.5 and b becomes 0 − 1 × 0.5 = −0.5. Repeat:

| Step | a | b | p for the keyboard | Loss |
|---|---|---|---|---|
| 0 | 0 | 0 | 0.5 | 0.6931 |
| 1 | 0.5 | −0.5 | 0.731 | 0.3133 |
| 2 | 0.769 | −0.769 | 0.823 | 0.1946 |
| 3 | 0.946 | −0.946 | 0.869 | 0.1405 |
| 4 | 1.077 | −1.077 | 0.896 | 0.1098 |
| 5 | 1.181 | −1.181 | 0.914 | 0.0901 |

The steps shrink because the slope p − 1 shrinks as p approaches 1. In this two-number model no learning rate is too large, since the loss has no bottom to jump over; it keeps falling as the gap between a and b widens. A real network's loss has valleys a large step can cross and land higher on the far side, and a small step makes too little progress before your budget runs out. That is why the learning rate is the first setting you lower when a training loss starts rising.

In PyTorch the whole loop is four lines, and you will see the same four lines three more times in this chapter:

```python
loss = F.cross_entropy(scores, target)   # softmax, then minus the log-probability of the target
opt.zero_grad()                          # clear the previous step's slopes
loss.backward()                          # compute the slope of the loss for every parameter
opt.step()                               # move every parameter against its slope
```

What training produces is a file of numbers. Here it holds a and b; for a real search model it holds many learned weights, and the program you deploy is that file plus the code that turns text into the model's input. That code is the next section, and it ships with the weights.

## The query becomes integers

A model computes with numbers, so the query is first cut into pieces from a fixed list, and each piece is replaced by its row number in that list. The pieces are **tokens**, the row numbers **token IDs**, the list the **vocabulary**, and the code that does the cutting the **tokenizer**. In practice you meet it as one call, `tokenizer.encode(text)`, which returns a list of integers. Each ID then selects one row of the model's **embedding table**, a learned vector per token, and from that point the network never sees a character again.

The shop does not choose the vocabulary by hand. The usual procedure, **byte-pair encoding**, builds it by counting. Take a tiny query log in which four words occur: *case* 5 times, *cases* 3 times, *base* twice and *cash* once. Start with single characters: a, b, c, e, h, s. Count every pair of neighbouring symbols, weighting each word by how often it occurs, and merge the most frequent pair into a new symbol.

| Round 1 pair | Where it occurs | Count |
|---|---|---|
| a+s | case 5, cases 3, base 2, cash 1 | 11 |
| s+e | case 5, cases 3, base 2 | 10 |
| c+a | case 5, cases 3, cash 1 | 9 |
| e+s | cases 3 | 3 |
| b+a | base 2 | 2 |
| s+h | cash 1 | 1 |

Merge a+s into `as`. Recount over the new symbols: as+e now occurs 10 times and c+as 9, so round 2 merges `ase`. In round 3, c+ase occurs 8 times (case 5, cases 3) and wins, giving `case`. Three merges on six characters leave a vocabulary of nine entries, numbered in sorted order: a 0, as 1, ase 2, b 3, c 4, case 5, e 6, h 7, s 8.

To encode a word, replay the merges in the order they were learned:

| Text | After replaying a+s, as+e, c+ase | IDs |
|---|---|---|
| case | case | [5] |
| cases | case · s | [5, 8] |
| base | b · ase | [3, 2] |
| cash | c · as · h | [4, 1, 7] |
| caes (a typo) | c · a · e · s | [4, 0, 6, 8] |

Three consequences follow for the shop, and all three hold in production tokenizers, whose vocabularies run to more than a hundred thousand entries.

The frequent word is one ID; the typo is four rare ones. The model receives *case* and *caes* as unrelated inputs of different lengths, and whatever it does with the typo, it learned from how often such pieces appeared in training text. Product codes, sizes and rare brand names fall into pieces the same way.

The letters are gone. *cases* arrives as [5, 8]; the network never receives an s as a separate input unless the tokenizer split one off. A question about the spelling of a product name reaches the model as row numbers, not letters.

The tokenizer belongs to the weights. Row 5 of the embedding table was trained to mean whatever ID 5 meant under this tokenizer's list. Encode with a different tokenizer and the same text selects different rows, so the model computes with the wrong vectors and raises no error. Ship the tokenizer file with the model and load both from the same place.

Tokens are also the unit of cost. The **context window**, the most a model can take in one pass, is a number of tokens, and it must hold the prompt and everything the model generates. Hosted models charge per token in and per token out. When section 5 puts retrieved product titles into the answer writer's prompt, every title is paid for in tokens; chapter 7 is about that bill.

## Tokens look at each other

After the embedding lookup, *keyboard* is the same vector wherever it appears: in *keyboard for laptop*, in *keyboard cleaner*, in *laptop for keyboard*. Search needs the vector for *keyboard* in this query to carry "for a laptop". **Attention** is the layer that mixes context into each token's vector.

It works like a dictionary lookup that returns a blend instead of one entry. From each token's vector, three learned weight matrices compute three shorter vectors: a **query** (what this position is looking for), a **key** (what it offers to be matched against) and a **value** (what it contributes if it matches). Each query is scored against every key, the scores become weights with a softmax, and the output for that position is the weighted sum of all the values.

Take the three tokens of *keyboard for laptop* with invented vectors, chosen so each number can be checked by hand. Keys and queries have four numbers each; the two value numbers can be read as "is about a keyboard" and "is about a laptop".

| Token | Key | Query | Value |
|---|---|---|---|
| 1 keyboard | (2, 0, 0, 0) | (0, 0, 2, 0) | (1, 0) |
| 2 for | (0, 2, 0, 0) | (1, 1, 1, 0) | (0, 0) |
| 3 laptop | (0, 0, 2, 0) | (2, 0, 0, 0) | (0, 1) |

**Score.** The **dot product** multiplies two vectors position by position and adds the results. The keyboard's query (0, 0, 2, 0) against the three keys gives 0, 0 and 4. Each score is divided by √d<sub>k</sub>, the square root of the key length, here √4 = 2, which stops scores from growing merely because vectors are long: 0, 0, 2.

**Weight.** The softmax of 0, 0, 2 is 1, 1 and e<sup>2</sup> = 7.389 over their total 9.389: 0.107, 0.107 and 0.787.

**Blend.** 0.107 × (1, 0) + 0.107 × (0, 0) + 0.787 × (0, 1) = (0.107, 0.787). The keyboard's output now mostly carries the laptop's value. Doing the same for every row:

| Row | Scaled scores against keys 1, 2, 3 | Weights | Output |
|---|---|---|---|
| 1 keyboard | 0, 0, 2 | 0.107, 0.107, 0.787 | (0.107, 0.787) |
| 2 for | 1, 1, 1 | 0.333, 0.333, 0.333 | (0.333, 0.333) |
| 3 laptop | 2, 0, 0 | 0.787, 0.107, 0.107 | (0.787, 0.107) |

For all rows at once, with the queries, keys and values stacked as the rows of matrices Q, K and V:

<p class="formula">Attention(Q, K, V) = softmax(Q·K<sup>T</sup> / √d<sub>k</sub>) · V</p>

Q·K<sup>T</sup> is the table of every query's dot product with every key (K<sup>T</sup>, K transposed, lines the keys up as columns so one matrix multiplication computes the whole table). Dividing by √d<sub>k</sub> is the scaling step. The softmax runs along each row and gives the weights. Multiplying by V blends the values, one output row per token.

In PyTorch this is `F.scaled_dot_product_attention(q, k, v)`, and its reference implementation is exactly the table above: multiply, scale, softmax along the last dimension, multiply by the values. In a real model the query, key and value vectors come from `nn.Linear` layers applied to every token vector, and a fourth `nn.Linear`, the output projection, maps each blended output before it is added back to the token's vector; the exercise leaves that fourth one out. A model runs several attentions side by side, **heads**, in each of many stacked layers. The arithmetic of each one is this table.

Attention on its own ignores order: shuffle the tokens and the rows come out shuffled, with the same numbers. *keyboard for laptop* and *laptop for keyboard* would then give the same set of outputs, and the same average in the next section. Models add a **position** vector to each token's embedding before the first layer, so the same word at a different position enters with a different vector; the exercise does this with a second, learned table indexed by position.

A search model reads the whole query both ways: every token may attend to every other, including later ones, because the full query is given. That changes in section 5.

## One vector per text, trained on clicks

Search could run a model on the query and each title together and score the pair. The cost rules it out. With a catalogue of 2,000,000 titles and 1,000 queries a minute, a pair scorer runs 2,000,000 × 1,000 = 2,000,000,000 passes a minute. An **encoder** instead turns any text into one fixed-length vector: the catalogue is encoded once and stored, each query is encoded once when it arrives (1,000 passes a minute), and ranking compares vectors without running the model again.

**One vector from many.** The attention blocks return one vector per token. The common way to get one vector for the text is the **mean pool**: average the token vectors. Queries in a batch have different lengths, so shorter ones are filled out with padding tokens, and the average must leave padding out. With the three outputs above and one padding row of invented numbers (5, −5), the plain mean is (1.557, −0.943), dragged by a row that is not text; the mean over the three real tokens is (0.409, 0.409). The code multiplies each row by a mask of 1 for real tokens and 0 for padding, sums, and divides by the number of real tokens. Padding also needs a mask inside attention, so no real token blends it in; the exercise passes one as `attn_mask`.

**Comparing by angle.** Vectors are compared with **cosine similarity**:

<p class="formula">cos(q, d) = (q · d) / (|q| × |d|)</p>

q is the query's vector and d a title's. q · d is their dot product; |q| and |d| are their lengths, the square root of the sum of squared entries. The result is the cosine of the angle between them: 1 when they point the same way, 0 at right angles, −1 when opposite. If every vector is divided by its length when stored, the denominator is 1 and the cosine is the dot product, so scoring the whole catalogue is one matrix multiplication and a sort. That exact comparison with every stored vector grows with the catalogue; at millions of products, vector databases use an approximate nearest-neighbour index, which first narrows the query to a small group of likely neighbours, such as a bucket of similar vectors built offline, and accepts that it may occasionally miss the true top match.

**Where the training pairs come from.** The encoder is trained on pairs: a query and the title a customer clicked, taken from the search log. A batch holds B pairs. Encode the B queries and the B titles with the same encoder and compute the B × B table of cosines, entry (i, j) comparing query i with title j. The diagonal holds the clicks. Every other entry pairs a query with somebody else's title; the loss treats it as a wrong answer at no extra cost, even though the click log does not prove that it is irrelevant. Each row is then a classification over B titles whose correct answer is on the diagonal, trained with section 1's cross-entropy.

One setting stands between the cosines and that softmax. Cosines lie between −1 and 1, and a softmax over numbers that close cannot become confident. The **temperature** τ divides every cosine before the softmax. You meet it in the sentence-transformers library as `MultipleNegativesRankingLoss(model, scale=20.0)`; `scale` is 1/τ, so the default means τ = 0.05. Some image–text models learn τ as one more parameter; this loss keeps it fixed.

Here is one row of that table: the query *cheap keyboard for laptop* at q = (1, 0), its clicked title *Slim wireless keyboard* at (0.6, 0.8), and *Laptop stand*, another pair's title, at (0.8, −0.6). All three are unit length, so the cosines are 1 × 0.6 + 0 × 0.8 = 0.6 for the keyboard and 0.8 for the stand. The stand ranks first, as it did in the keyword index.

| | τ = 1 | τ = 0.05 (scale 20) |
|---|---|---|
| Scores, cosine ÷ τ | 0.6, 0.8 | 12, 16 |
| Probability of the keyboard | 0.450 | 0.018 |
| Loss, −ln of that | 0.798 | 4.018 |
| Slope of the loss per unit of the keyboard's cosine, (p − 1) ÷ τ | −0.550 | −19.64 |

The slope is section 1's p − y, divided by τ, because the score is the cosine divided by τ. At τ = 0.05 the training signal on this row is about 36 times stronger. τ also sets how far the loss can fall. In a batch of 64 pairs, even with the clicked title at cosine +1 and all 63 others at −1, the loss for the row is ln(1 + 63 × e<sup>−2/τ</sup>): 2.254 at τ = 1 and effectively zero at τ = 0.05. At τ = 1 this row still pays 2.254 in the most favourable arrangement of cosines, so its loss curve cannot approach zero however well the ranking is learned; at τ = 0.05 the same arrangement makes the loss effectively zero.

**One step.** How a cosine changes when a unit vector d moves is q − cos × d. For unit vectors cos = q · d, so cos × d is the part of q that lies along d, and subtracting it leaves the part of q at right angles to d: moving d along itself only changes its length, which the division by length cancels, so only a move across d turns it towards q or away. Multiply by the loss's slope and step with a learning rate of 0.02, at τ = 0.05:

| | Slim wireless keyboard | Laptop stand |
|---|---|---|
| q − cos × d | (1, 0) − 0.6 × (0.6, 0.8) = (0.64, −0.48) | (1, 0) − 0.8 × (0.8, −0.6) = (0.36, 0.48) |
| × loss slope (−19.64 and +19.64) | (−12.570, 9.427) | (7.070, 9.427) |
| d − 0.02 × that | (0.8514, 0.6115) | (0.6586, −0.7885) |
| New cosine with q, after dividing by the length | 0.8514 ÷ 1.0482 = 0.8122 | 0.6586 ÷ 1.0274 = 0.6410 |

The keyboard moves from 0.6 to 0.812, the stand from 0.8 to 0.641, and the order flips. In a real encoder the step does not land on free-standing vectors; the same slopes flow back through pooling and attention into the weights every text shares, and a batch of 64 does this for 4,096 cosines at once.

**What the pairs never showed.** The keyboard moved because it sat in a row with its query. Now let Spanish-speaking customers arrive, typing *teclado para portátil*, while every training pair was an English query with an English title. No Spanish query appears in any row, so no term of any loss pulls it towards its title. Words that occur only in Spanish queries keep exactly the embedding rows they started with, because their slope is zero on every step. Their vectors still move, because attention and position weights are shared with the English words, but nothing checks where they land. The exercise shows both: the Spanish rows unchanged, the Spanish query vectors changed, and Spanish top-1 accuracy of 1 in 6. The remedy is pairs of the missing kind, Spanish queries with the titles they should find, trained with the same loss.

Two practical rules follow. A cosine means nothing across models: a threshold such as "above 0.8 is relevant" belongs to one model and one training temperature. And "similar" means whatever the training pairs said. Before you trust a pretrained encoder on your catalogue, build a held-out set of your own query–title pairs that it never saw and measure how often the right title ranks first. Chapter 2 applies the same discipline of splits and test sets to the shop's photo classifier; chapter 6 measures retrieval inside the assistant.

## The same blocks, one token at a time

Search returns titles. The shop's answer — "The Slim wireless keyboard is the lightest keyboard in the catalogue and fits a laptop bag" — has to be written. The answer writer is a **generator**: a second model with the same kinds of layers, embeddings, positions and attention blocks, trained separately and followed by one more layer that turns each position's output vector into a score for every entry of the vocabulary. Those scores are called **logits**, and a softmax turns them into a probability for each token that could come next. The shop's prompt is the customer's question followed by the top titles from search, tokenized as in section 2; the generator continues it. The exercise's prompt is the top title alone.

**Training is section 1 again.** Take a document, and at every position ask for the probability of the token that actually comes next. The loss at that position is −ln of that probability, the same cross-entropy. If the next token's probability is 0.644 the loss is 0.44; if it is 0.032 the loss is 3.44. Training computes this for all positions of all documents in a batch in one pass, which is what makes training on large amounts of text affordable.

**Where that one pass would cheat.** Go back to the attention table for *keyboard for laptop*, now as the start of generated text. Position 2, *for*, is trained to predict token 3, *laptop*. With both-ways attention its weights were 0.333 on each token, so a third of its output is *laptop*'s own value: the answer fed into its own prediction. A model trained like that learns to copy from the right and fails as soon as it generates, because when it generates the next token does not exist yet.

The requirement is exact: position i may use tokens 1 to i and nothing after. Every weight right of the diagonal must be exactly zero, not small, and each row's remaining weights must still add up to one. Zeroing weights after the softmax breaks the second condition. Changing the scores before the softmax satisfies both: e<sup>−∞</sup> = 0, so a score of −∞ contributes nothing to the top of its fraction or to the row's total, and the remaining weights share the whole. That is the **causal mask**:

<p class="formula">weights = softmax(Q·K<sup>T</sup> / √d<sub>k</sub> + M)</p>

Q·K<sup>T</sup> / √d<sub>k</sub> is the scaled score table from section 3. M is a table of the same shape holding 0 where the column is at or before the row and −∞ where it comes after. Adding M leaves the allowed scores alone and sends the forbidden ones to −∞; the softmax then runs along each row. Code uses −inf or a very large negative number, and every attention layer applies the same mask, because one layer that could see ahead would undo the rest. In PyTorch it is one argument: `F.scaled_dot_product_attention(q, k, v, is_causal=True)`, whose reference implementation fills the cells above the diagonal with −inf before the softmax.

| Row | Masked scores | Masked weights | Masked output | Both-ways output |
|---|---|---|---|---|
| 1 keyboard | 0, −∞, −∞ | 1, 0, 0 | (1, 0) | (0.107, 0.787) |
| 2 for | 1, 1, −∞ | 0.5, 0.5, 0 | (0.5, 0) | (0.333, 0.333) |
| 3 laptop | 2, 0, 0 | 0.787, 0.107, 0.107 | (0.787, 0.107) | (0.787, 0.107) |

Row 3 is the same either way, because nothing comes after it. Now append a fourth token, with key (0, 0, 0, 2), query (1, 0, 1, 1) and value (1, 1). With the mask, rows 1 to 3 do not change by a digit. Without it, row 1 moves from (0.107, 0.787) to (0.193, 0.807), because its softmax now has a fourth term. This one property settles two things. Training is fair: row i was computed exactly as if the later tokens were absent. And generation is the same computation as training, run one row at a time, with rows already computed never changing, so a serving system can store their keys and values instead of recomputing them. That store is the **KV cache**, and chapter 7 starts from it.

| Model | Mask | Why |
|---|---|---|
| Search encoder | Padding mask only | The whole query is given and nothing is predicted, so every token may see every other |
| Generator | Causal mask in every layer | Each position predicts the next token, which is in the table during training |

**The loop.** Generating is a loop you could write: run the blocks on the prompt, take the logits at the last position, choose a token, append it, and run again, until the model produces its end-of-text token or the `max_tokens` limit in your request is reached. Every token of the answer costs one more pass.

**Choosing the token.** Hosted APIs expose the choice as a field in the request, `temperature`. At `temperature=0` the loop takes the highest-probability token every time, which is **greedy** decoding. Above 0 the loop samples: it draws the next token at random in proportion to its probability, after dividing every logit by the temperature T. Take four candidate next tokens after *The keyboard costs*, with logits 3, 2, 1 and 0:

| T | Logits ÷ T | Probabilities |
|---|---|---|
| 0.5 | 6, 4, 2, 0 | 0.865, 0.117, 0.016, 0.002 |
| 1 | 3, 2, 1, 0 | 0.644, 0.237, 0.087, 0.032 |
| 2 | 1.5, 1, 0.5, 0 | 0.455, 0.276, 0.167, 0.102 |

Below 1, the top token takes more of the probability and answers vary less; above 1, the distribution flattens and less likely tokens get picked more often. T = 0 is not a division by zero; it is the limit of this sharpening, implemented as simply taking the top token.

**Two temperatures, one pattern.** Section 4's τ and this T both divide logits before a softmax, and a small value sharpens the result in both. They act at different stages. τ is part of the training loss: it decided where every catalogue vector was stored, so changing it means retraining and re-encoding the catalogue. T acts only when a token is chosen; it is set per request, changes nothing stored, and two requests to the same weights may use different values. When chapter 4 tunes this generator on people's preferences, the probabilities it adjusts are these softmax outputs over tokens; when chapter 7 counts the generator's cost, it counts passes of this loop.

## Where it breaks, and what a real shop needs

Both halves fail in ways the mechanism predicts, and neither failure raises an error.

Search fails on pair types absent from training. The Spanish queries are one kind; so are part numbers, misspellings the log never recorded and a product line the shop starts selling next year. The vectors are wherever training left them, and the ranking returns its top titles regardless. Only a measured rate of right answers on pairs of your own tells you whether a type is covered.

The generator writes by probability, and nothing in the loop compares its sentence with the catalogue. In the exercise the generator is prompted with the title search found. For the four titles it was trained on, it writes their answers. For *chef knife* and *desk lamp*, titles it never saw an answer for, it writes the leather watch's and the steel kettle's answers at T = 0: search was right and the answer is still wrong. For the Spanish queries, search returns the leather watch, and the generator describes the watch just as fluently. At T = 2, one of four samples for the keyboard mixes words from several products. Temperature changes how often such text appears, not whether it can. Putting the retrieved titles into the prompt is meant to make text that agrees with them more probable; nothing in the loop enforces it. Chapter 6 measures what the assistant retrieves and says, and treats the retrieved text as input the model cannot be trusted to obey.

A real version of this pipeline differs in scale and in evidence, not in mechanism. The encoder starts pretrained on someone else's pairs and is fine-tuned on the shop's click log, which is a noisy label: a click is not a purchase, and not every purchase was the best match. The catalogue is encoded in batches and stored, the tokenizer loaded from the model's own files. The generator is a large pretrained model, prompted with the question and the retrieved titles. And every claim in this chapter's toy runs — six out of six, zero change after appending — becomes a number measured on held-out real queries. Chapter 2 builds that evaluation discipline on product photos; chapter 6 applies it to retrieval and answers.

<!--mission-->
## Exercise: train the search, break it, then generate

The script trains a one-block attention encoder on a toy click log, measures top-1 accuracy, shows what happens to a pair type that never appeared, then trains a separate generator of the same block class, prompts it with the title search found, and samples from it. PyTorch on a CPU, no downloads, a few seconds.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# A toy shop. Query i was clicked through to title i; no English query shares a word with its title.
titles  = ["slim wireless keyboard", "steel kettle", "leather watch", "canvas backpack", "chef knife", "desk lamp"]
english = ["typing device for laptop", "boil water fast", "tell the time", "carry books to school", "cut bread", "light for reading"]
spanish = ["teclado para portatil", "hervir agua", "reloj de pulsera", "mochila escolar", "cuchillo de pan", "luz de lectura"]
answers = ["the slim wireless keyboard fits a laptop bag", "the steel kettle boils water fast",
           "the leather watch tells the time", "the canvas backpack carries school books"]

words = sorted({w for t in titles + english + spanish + answers for w in t.split()})
vocab = ["<pad>", "<s>", "</s>"] + words
ids = {w: i for i, w in enumerate(vocab)}
PAD = 0

def batch(texts, add_marks=False):
    rows = [(["<s>"] + t.split() + ["</s>"]) if add_marks else t.split() for t in texts]
    width = max(len(r) for r in rows)
    return torch.tensor([[ids[w] for w in r] + [PAD] * (width - len(r)) for r in rows])

class Block(nn.Module):
    """Embedding + position + one attention layer. The same class serves search and generation."""
    def __init__(self, n_vocab, dim=16, max_len=12):
        super().__init__()
        self.tok = nn.Embedding(n_vocab, dim)
        self.pos = nn.Embedding(max_len, dim)
        self.q, self.k, self.v = nn.Linear(dim, dim), nn.Linear(dim, dim), nn.Linear(dim, dim)
    def forward(self, x, causal):
        h = self.tok(x) + self.pos(torch.arange(x.shape[1]))
        if causal:
            a = F.scaled_dot_product_attention(self.q(h), self.k(h), self.v(h), is_causal=True)
        else:  # read both ways, but never attend to padding
            keep = (x != PAD)[:, None, :]
            a = F.scaled_dot_product_attention(self.q(h), self.k(h), self.v(h), attn_mask=keep)
        return h + a

def embed(block, texts):
    x = batch(texts)
    h = block(x, causal=False)
    keep = (x != PAD).unsqueeze(-1).float()
    pooled = (h * keep).sum(1) / keep.sum(1)          # mean over real tokens only
    return F.normalize(pooled, dim=1)                  # unit length: dot product = cosine

def top1(block, queries):
    with torch.no_grad():
        best = (embed(block, queries) @ embed(block, titles).T).argmax(1)
    return sum(int(b == i) for i, b in enumerate(best.tolist()))

# Part 1: search. In-batch contrastive loss, scale 20 = temperature 0.05.
torch.manual_seed(0)
enc = Block(len(vocab))
spanish_rows = torch.tensor(sorted({ids[w] for t in spanish for w in t.split()} - {ids[w] for t in english + titles for w in t.split()}))
rows_before = enc.tok.weight[spanish_rows].detach().clone()
spanish_before = embed(enc, spanish).detach()
opt = torch.optim.Adam(enc.parameters(), lr=0.01)
for step in range(301):
    sim = embed(enc, english) @ embed(enc, titles).T  # 6 x 6 cosines; the diagonal holds the clicks
    loss = F.cross_entropy(sim * 20.0, torch.arange(len(titles)))
    if step in (0, 100, 300):
        print(f"step {step:3d}  loss {loss.item():.4f}  english top-1 {top1(enc, english)}/6")
    if step < 300:
        opt.zero_grad(); loss.backward(); opt.step()
print("spanish top-1:", f"{top1(enc, spanish)}/6")
print("rows of spanish-only words changed:", not torch.equal(rows_before, enc.tok.weight[spanish_rows]))
print("spanish query vectors changed:", not torch.allclose(spanish_before, embed(enc, spanish), atol=1e-4))

# Part 2: answer from what search found. A separately trained Block of the same class, causal mask on,
# plus a layer that scores every vocabulary entry. Each training text is a title followed by its answer.
torch.manual_seed(0)
gen, head = Block(len(vocab), max_len=16), nn.Linear(16, len(vocab))
opt = torch.optim.Adam(list(gen.parameters()) + list(head.parameters()), lr=0.01)
x = batch([f"{t} {a}" for t, a in zip(titles, answers)], add_marks=True)   # the four titles that have answers
for step in range(301):
    logits = head(gen(x[:, :-1], causal=True))       # position t predicts token t + 1
    loss = F.cross_entropy(logits.reshape(-1, len(vocab)), x[:, 1:].reshape(-1), ignore_index=PAD)
    if step in (0, 300):
        print(f"generator step {step:3d}  next-token loss {loss.item():.4f}")
    if step < 300:
        opt.zero_grad(); loss.backward(); opt.step()

def generate(prompt, temperature, seed=0, max_new=10):
    g = torch.Generator().manual_seed(seed)
    out = ["<s>"] + prompt.split()
    with torch.no_grad():
        for _ in range(max_new):
            last = head(gen(torch.tensor([[ids[w] for w in out]]), causal=True))[0, -1]
            if temperature == 0:
                nxt = int(last.argmax())                                    # greedy
            else:
                probs = F.softmax(last / temperature, dim=-1)               # divide, then softmax
                nxt = int(torch.multinomial(probs, 1, generator=g))
            out.append(vocab[nxt])
            if vocab[nxt] == "</s>":
                break
    return " ".join(out[1 + len(prompt.split()):])                          # the answer only

def answer(query):
    with torch.no_grad():
        best = int((embed(enc, [query]) @ embed(enc, titles).T).argmax())   # search: the top title
    return titles[best], generate(titles[best], 0)                          # the prompt is that title

for query in english + spanish[:2]:
    title, text = answer(query)
    print(f"{query} -> {title} -> {text}")
for seed in range(4):
    print(f"T=2 seed {seed}:", generate("slim wireless keyboard", 2.0, seed))

# The mask's promise: appending a token does not change any earlier position.
with torch.no_grad():
    short = torch.tensor([[ids[w] for w in "<s> steel kettle the".split()]])
    longer = torch.tensor([[ids[w] for w in "<s> steel kettle the steel".split()]])
    for causal in (True, False):
        diff = (gen(short, causal)[0] - gen(longer, causal)[0, :4]).abs().max().item()
        print(f"causal={causal}: largest change in the first four positions after appending: {diff:.2e}")
```

What each part does in real training code:

- **`batch`** is the tokenizer's job at toy size: whole words instead of byte-pair pieces, IDs from a fixed list, and padding to the longest text in the batch. A real pipeline calls the model's own tokenizer with padding switched on and gets the same two things back, IDs and a mask of which positions are real.
- **`Block`** is section 3. `nn.Embedding` is the embedding table, and a second table adds a learned vector per position. The three `nn.Linear` layers compute queries, keys and values, and `F.scaled_dot_product_attention` computes the score table, the softmax and the blend. `attn_mask=keep` gives the padding columns −inf; `is_causal=True` gives the future columns −inf. `h + a` adds the attention output back to its input, the residual connection every transformer layer uses. A real encoder stacks many such layers with several heads each and a small feed-forward network between them.
- **`embed`** is section 4: the masked mean pool, then `F.normalize` to unit length so the matrix product in `top1` is a table of cosines.
- **Part 1** is the in-batch loss. `sim * 20.0` is the sentence-transformers default scale, τ = 0.05, and `torch.arange(6)` puts every correct answer on the diagonal. The script records the Spanish-only embedding rows and the Spanish query vectors before training, so it can compare them afterwards.
- **Part 2** trains a separate `Block` with the mask on and a `head` that turns each position's vector into logits over the vocabulary. Each training text is a title followed by its answer, for the four titles that have one. `x[:, :-1]` is the input and `x[:, 1:]` the targets, the same text shifted by one token, so every position is trained to predict its successor in one pass. `ignore_index=PAD` leaves padding out of the loss.
- **`generate`** is the loop from section 5: run the blocks, take the last position's logits, pick greedily or divide by the temperature and sample, append, stop at `</s>`. It returns only the tokens after the prompt.
- **`answer`** is the chapter's pipeline at toy size: search picks the top title with the Part 1 encoder, and that title becomes the generator's prompt.
- **The last block** appends one token and measures the largest change in the first four positions, with the mask and without it.

**Expected result.** PyTorch 2.14 on a CPU; the output is in the chapter's corpus.

```text
step   0  loss 7.9249  english top-1 1/6
step 100  loss 0.0008  english top-1 6/6
step 300  loss 0.0002  english top-1 6/6
spanish top-1: 1/6
rows of spanish-only words changed: False
spanish query vectors changed: True
generator step   0  next-token loss 4.3681
generator step 300  next-token loss 0.1435
typing device for laptop -> slim wireless keyboard -> the slim wireless keyboard fits a laptop bag </s>
boil water fast -> steel kettle -> the steel kettle boils water fast </s>
tell the time -> leather watch -> the leather watch tells the time </s>
carry books to school -> canvas backpack -> the canvas backpack carries school books </s>
cut bread -> chef knife -> the leather watch tells the time </s>
light for reading -> desk lamp -> the steel kettle boils water fast </s>
teclado para portatil -> leather watch -> the leather watch tells the time </s>
hervir agua -> leather watch -> the leather watch tells the time </s>
T=2 seed 0: the slim wireless keyboard fits a laptop bag </s>
T=2 seed 1: the slim wireless keyboard fits a laptop bag </s>
T=2 seed 2: the leather carries water leather keyboard fits the boils keyboard
T=2 seed 3: the slim wireless keyboard fits a laptop bag </s>
causal=True: largest change in the first four positions after appending: 0.00e+00
causal=False: largest change in the first four positions after appending: 1.35e-01
```

Read it against the chapter. All six English queries find their titles without sharing a word with them. The Spanish queries score 1 out of 6. Their own embedding rows are untouched while their vectors moved: the section 4 failure in both halves. The answers show the two failures of section 6 separately. *cut bread* finds *chef knife*, and the generator, which never saw an answer for that title, writes the watch's answer; *teclado para portatil* finds the wrong title, and the answer faithfully describes that wrong product. At T = 2, seed 2 writes a sentence about nothing in the catalogue. With the mask, appending a token changes nothing earlier; without it, the first four positions move by up to 0.135.

Two things to try. Change `20.0` to `1.0` in Part 1. The loss stops at `0.9187`, above the 0.517 that ln(1 + 5 × e<sup>−2</sup>) allows for six titles at τ = 1, yet English top-1 still reaches `6/6`: a loss that cannot approach zero says nothing, on its own, about whether the ranking is right. Then add Spanish–title pairs as a second loss term, `F.cross_entropy(embed(enc, spanish) @ embed(enc, titles).T * 20.0, torch.arange(6))`, and rerun. Spanish top-1 reaches `6/6`, and now the Spanish-only rows do change, because the missing pair type is in the loss.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 3.7, 28.2, 34.2 and 34.4; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 1.29, 1.32, 3.11, 3.13, 3.20 and 7.22; Building LLMs like ChatGPT from Scratch and Cloud Deployment (Neuralearn.ai, Udemy), lecture 2.3; all paraphrased as study material. Uday Kamath et al., Large Language Models: A Deep Dive, pp. 63–68 and 88–89 (physical); Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 173–177 and 702–703 (physical); Sennrich, Haddow and Birch, arXiv:1508.07909, §3.2; the sentence-transformers 6.0.1 source and the PyTorch 2.14 documentation of scaled_dot_product_attention.*
