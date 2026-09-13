# Similar Means Whatever the Training Pairs Said

You have put an off-the-shelf embedding model in front of a product catalogue. English queries find the right items, including queries that share no word with the title they match. Then the Spanish queries arrive, or the queries written in your industry's part numbers and abbreviations, and the top results are noise. You want to know what would fix it, and you cannot say, because you do not know what the model was trained to do.

The search itself is not the problem. Ranking is a few lines of arithmetic that treat every query alike. Which texts count as near each other was fixed earlier, by the pairs the model was trained on. This essay computes one training step by hand to show how a pair moves two vectors together, then shows what happens to a pair type the training never contained.

## The search step: encode once, compare by angle

An encoder is a model that turns a whole text into one fixed-length list of numbers, a vector. A transformer encoder produces one vector per token; a common way to get one vector for the whole text is to average them, leaving padding out of the average. A small sentence encoder of about 22 million parameters produces 384 numbers per text.

The reason to want vectors is cost. A model that scores a query and a title together has to run once per catalogue item for every query. An encoder runs once per item when it is stored and once per query when it arrives; ranking then compares vectors without consulting the model. The comparison is cosine similarity:

<p class="formula">cos(q, d) = (q · d) / (|q| × |d|)</p>

q is the query's vector and d a document's. q · d is the dot product: multiply the two vectors position by position and add the results. |q| and |d| are the lengths, the square root of the sum of squared entries. The ratio is the cosine of the angle between the two vectors, 1 when they point the same way, 0 at right angles, −1 when opposite. Only direction counts.

If every vector is normalised to length 1 when it is stored, the lengths drop out and the cosine is just the dot product. Scoring a catalogue of 1.8 million titles is then one matrix multiplication, a 1.8 million × 384 table times the query's 384 numbers, followed by a sort. That runs on a CPU.

Take a two-number example, the book's own. The query is q = (1, 0). Two documents are already unit length: d<sub>1</sub> = (0.6, 0.8) and d<sub>2</sub> = (0.8, −0.6). The cosines are 1 × 0.6 + 0 × 0.8 = 0.6 and 1 × 0.8 + 0 × (−0.6) = 0.8, so d<sub>2</sub> ranks first. Suppose d<sub>1</sub> is the right answer. Nothing in the search step can fix that. The vectors are where training left them.

## Where the positions come from: pairs and a loss

An embedding model for search is trained on pairs: a query and a title that matches it. The same encoder, with the same weights, encodes both sides. The idea is older than transformers: word2vec paired a word with a word near it in running text, labelled 1, and with a random word, labelled 0, so its labels cost nothing.

A common way to train is to take a batch of B pairs, encode all B queries and B titles, and compute the B × B table of cosines. Entry (i, j) compares query i with title j. The diagonal holds the true pairs; every other entry compares a query with some other pair's title, which serves as a negative for free. Each row is then treated as a classification over B titles whose correct answer is the diagonal one.

One more quantity is needed first. Cosines lie between −1 and 1, too close together for a softmax to become confident. With two documents, even a perfect +1 against −1 gives the right one a probability of only 1/(1 + e<sup>−2</sup>) = 0.881, so the loss can never drop below −ln 0.881 = 0.127 and training never stops pushing. The *temperature* τ fixes the scale: every cosine is divided by τ before the softmax, and a τ below 1 stretches the range. Some systems learn τ during training; the example here fixes it at 0.1. The loss for row i is:

<p class="formula">L<sub>i</sub> = −ln [ e<sup>s<sub>ii</sub>/τ</sup> / Σ<sub>j</sub> e<sup>s<sub>ij</sub>/τ</sup> ]</p>

s<sub>ij</sub> is the cosine between query i and title j. Dividing by τ turns each cosine into a score. The fraction is the softmax: e raised to the true pair's score, over the sum of e raised to every score in the row, which gives the probability the row assigns to its own title. Minus its log is the cross-entropy: 0 when the probability is 1, growing without limit as it falls. The batch loss is the average over rows. This loss is known as InfoNCE.

The gradient of cross-entropy after a softmax has a simple form. Write p<sub>ij</sub> for the probability the row gives title j. The loss changes by (p<sub>ii</sub> − 1)/τ per unit of the true pair's cosine and by p<sub>ij</sub>/τ per unit of each other cosine. A step against the gradient therefore raises the matching cosine in proportion to the probability it is missing and lowers each wrong cosine in proportion to the probability that title took.

## Worked example: one step by hand

Keep q, d<sub>1</sub> and d<sub>2</sub>, with d<sub>1</sub> as q's true title and d<sub>2</sub> another pair's title. Follow this one row, and move only the two document vectors.

| Step | d<sub>1</sub> (match) | d<sub>2</sub> (negative) |
|---|---|---|
| cosine | 0.6 | 0.8 |
| score, cosine / 0.1 | 6 | 8 |
| softmax, e<sup>6</sup>/(e<sup>6</sup> + e<sup>8</sup>) = 1/(1 + e<sup>2</sup>) = 1/(1 + 7.389) | 0.119 | 0.881 |
| loss gradient per unit of cosine | (0.119 − 1)/0.1 = −8.808 | 0.881/0.1 = +8.808 |

The loss is −ln 0.119 = 2.127.

Next, how a cosine changes when a document vector moves. For unit vectors, stretching d along its own direction leaves the angle unchanged, so only movement across d counts, and the gradient of the cosine with respect to d is q minus the cosine times d:

| | d<sub>1</sub> | d<sub>2</sub> |
|---|---|---|
| q − cos × d | (1, 0) − 0.6 × (0.6, 0.8) = (0.64, −0.48) | (1, 0) − 0.8 × (0.8, −0.6) = (0.36, 0.48) |
| × loss gradient | −8.808 × (0.64, −0.48) = (−5.637, 4.228) | 8.808 × (0.36, 0.48) = (3.171, 4.228) |
| after a step of 0.05: d − 0.05 × gradient | (0.8819, 0.5886) | (0.6415, −0.8114) |
| length | 1.0602 | 1.0343 |
| new cosine with q | 0.8819 / 1.0602 = 0.832 | 0.6415 / 1.0343 = 0.620 |

One step moves the match from 0.6 to 0.832 and the negative from 0.8 to 0.620. The order has flipped, and the right title now ranks first.

<figure class="diagram">
<svg viewBox="0 0 480 240" width="100%" role="img" aria-label="Unit circle with the query q along the horizontal axis; d1 rotates from 53 degrees down to 34 degrees, towards q; d2 rotates from minus 37 degrees down to minus 52 degrees, away from q" style="max-width:480px;font-family:inherit;font-size:13px">
  <defs>
    <marker id="emb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1">
    <circle cx="150" cy="120" r="90" stroke-opacity="0.35"/>
    <line x1="50" y1="120" x2="250" y2="120" stroke-opacity="0.2"/>
  </g>
  <g stroke="currentColor" stroke-width="2" fill="none">
    <line x1="150" y1="120" x2="238" y2="120" marker-end="url(#emb-arrow)"/>
    <line x1="150" y1="120" x2="203" y2="50" stroke-dasharray="5 4" stroke-width="1.5" marker-end="url(#emb-arrow)"/>
    <line x1="150" y1="120" x2="223" y2="71" marker-end="url(#emb-arrow)"/>
    <line x1="150" y1="120" x2="220" y2="173" stroke-dasharray="5 4" stroke-width="1.5" marker-end="url(#emb-arrow)"/>
    <line x1="150" y1="120" x2="205" y2="189" marker-end="url(#emb-arrow)"/>
  </g>
  <g fill="currentColor">
    <text x="246" y="124">q</text>
    <text x="190" y="40">d<tspan baseline-shift="sub" font-size="9">1</tspan> before</text>
    <text x="230" y="70">d<tspan baseline-shift="sub" font-size="9">1</tspan> after</text>
    <text x="228" y="176">d<tspan baseline-shift="sub" font-size="9">2</tspan> before</text>
    <text x="178" y="212">d<tspan baseline-shift="sub" font-size="9">2</tspan> after</text>
    <text x="300" y="90">cos(q, d<tspan baseline-shift="sub" font-size="9">1</tspan>): 0.600 → 0.832</text>
    <text x="300" y="112">cos(q, d<tspan baseline-shift="sub" font-size="9">2</tspan>): 0.800 → 0.620</text>
    <text x="300" y="140" font-size="12">dashed: before the step</text>
    <text x="300" y="158" font-size="12">solid: after</text>
  </g>
</svg>
<figcaption>The step from the tables, drawn to scale. The match rotates towards the query and the negative away from it; both are renormalised onto the circle.</figcaption>
</figure>

At realistic size the table grows but the step does not change. A batch of 64 pairs gives 64 × 64 = 4,096 cosines, 63 negatives per query, each a comparison of two 384-number vectors. The gradient does not land on free-standing vectors: it flows back through the encoder into weights every text shares. The loss needs large batches so each query meets enough negatives; one image–text model was trained with batches of 32,768 pairs.

## What the pairs never showed

The gradient in that example exists only because q and d<sub>1</sub> sat in the same row. A pair type that never appears in any batch, a Spanish query next to an English title, contributes no term to any loss, so nothing pulls its two sides together. In an encoder built from a lookup table this is literal: the rows for words that occur in no training pair receive a zero gradient on every step and, with no weight decay, finish exactly where initialisation put them. The exercise shows it.

In a transformer encoder the weights are shared, so untrained pairings do move, as a side effect of training on other pairs. They may land where they belong or not; nothing in the loss checked. The same limit appears outside text: an image–text encoder trained on web pairs does noticeably worse on satellite and medical images.

A second consequence comes from the temperature. The loss is satisfied once the true pair beats the others by enough, and at τ = 0.1 a small gap is enough: in the exercise the loss falls to 0.0061 while one matching cosine is still 0.33. A threshold such as "above 0.8 means relevant" belongs to one model and its training temperature, not to another model.

The opening problem becomes questions you can answer. Read the training-data section of the model card and ask whether your pair type is in it; names mislead, and in one family of sentence encoders "multi" means multiple sources, not multiple languages. Build a few hundred of your own query–title pairs and measure how often the right title ranks first. If it does not, the remedy is pairs of your type: fine-tuning on target-domain data with the same loss. Measuring retrieval properly is a separate essay in Part III.

<!--mission-->
## Exercise: train a tiny encoder and leave a pair type out

The script checks the worked step with autograd, then trains a tiny text encoder with the in-batch loss. PyTorch on a CPU, no downloads, a few seconds.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# Part 1: the worked example. One query, two documents, one step, checked by autograd.
tau = 0.1                                                         # temperature
q = torch.tensor([[1.0, 0.0]])                                    # the query, held fixed here
docs = torch.tensor([[0.6, 0.8], [0.8, -0.6]], requires_grad=True)  # row 0 is its match
sims = F.normalize(q, dim=1) @ F.normalize(docs, dim=1).T         # cosines, shape (1, 2)
loss = F.cross_entropy(sims / tau, torch.tensor([0]))             # the right answer is column 0
loss.backward()
print("cosines before:", [round(s, 4) for s in sims[0].tolist()], " loss:", round(loss.item(), 4))
print("gradient on docs:", [[round(g, 4) for g in row] for row in docs.grad.tolist()])
with torch.no_grad():
    docs -= 0.05 * docs.grad                                      # one plain gradient step
    sims = F.normalize(q, dim=1) @ F.normalize(docs, dim=1).T
print("cosines after one step:", [round(s, 4) for s in sims[0].tolist()])

# Part 2: a tiny text encoder trained with an in-batch contrastive loss.
english = ["typing device", "writing tool", "boil water", "wrist time", "carry books", "cut bread"]
spanish = ["teclado", "lapiz", "hervidor", "reloj", "mochila", "cuchillo"]
titles = ["wireless keyboard", "graphite pencil", "steel kettle", "leather watch",
          "canvas backpack", "chef knife"]                        # query i matches title i
vocab = sorted({w for t in english + spanish + titles for w in t.split()})
ids = {w: i for i, w in enumerate(vocab)}

class Encoder(nn.Module):
    def __init__(self, n_words, dim=8):
        super().__init__()
        self.bag = nn.EmbeddingBag(n_words, dim, mode="mean")     # look up each word, average them
    def forward(self, texts):
        flat = torch.tensor([ids[w] for t in texts for w in t.split()])
        offsets = torch.tensor([0] + [len(t.split()) for t in texts[:-1]]).cumsum(0)
        return F.normalize(self.bag(flat, offsets), dim=1)        # unit length, so dot = cosine

def contrastive_loss(enc, queries, docs):
    sim = enc(queries) @ enc(docs).T                              # B x B cosine matrix
    target = torch.arange(len(queries))                           # row i's answer is column i
    return F.cross_entropy(sim / tau, target), sim

def train(batches, steps=200, report=False):
    torch.manual_seed(0)                                          # same starting table every run
    enc = Encoder(len(vocab))
    opt = torch.optim.SGD(enc.parameters(), lr=0.2)
    for step in range(steps + 1):
        losses = [contrastive_loss(enc, qs, ds) for qs, ds in batches]
        loss = sum(l for l, _ in losses)
        if report and step in (0, 1, 10, 50, 200):
            sim = losses[0][1]
            off = sim[~torch.eye(len(sim), dtype=torch.bool)].mean().item()
            print(f"step {step:3d}  loss {loss.item():.4f}  matching {[round(s, 2) for s in sim.diagonal().tolist()]}"
                  f"  non-matching mean {off:.2f}")
        if step < steps:
            opt.zero_grad()
            loss.backward()
            opt.step()
    return enc

def top_hits(enc, queries):
    with torch.no_grad():
        best = (enc(queries) @ enc(titles).T).argmax(dim=1)       # nearest title by cosine
    return [titles[i] for i in best.tolist()], sum(int(b == i) for i, b in enumerate(best.tolist()))

torch.manual_seed(0)
spanish_at_start = Encoder(len(vocab))(spanish).detach()

enc = train([(english, titles)], report=True)
print("english queries ->", top_hits(enc, english))

# Part 3: queries whose pair type never appeared in training.
print("spanish queries ->", top_hits(enc, spanish))
print("spanish vectors changed by training:", not torch.equal(spanish_at_start, enc(spanish).detach()))

# Part 4: add Spanish-query / English-title pairs as a second batch and train again.
enc2 = train([(english, titles), (spanish, titles)])
print("with the pairs, spanish queries ->", top_hits(enc2, spanish))
```

What each part does:

- **Part 1** is the worked example. `F.normalize` divides each row by its length, so the matrix product is a table of cosines. `F.cross_entropy(sims / tau, target)` is the loss formula in one call: a log-softmax over each row, then minus the log-probability at the target column. `loss.backward()` differentiates through the normalisation, which produces the "q minus cosine times d" of the second table.
- **`nn.EmbeddingBag(..., mode="mean")`** is a lookup table with one learnable row of 8 numbers per word, plus the averaging: each text becomes the mean of its words' rows. It stands in for a transformer and its pooling, and makes a missing pair visible row by row.
- **`contrastive_loss`** is the in-batch loss from the essay: a B × B cosine matrix, divided by τ, cross-entropy per row with `torch.arange(B)` as the targets, which puts every correct answer on the diagonal. Adding `F.cross_entropy(sim.T / tau, target)` and halving gives the symmetric version that also runs the columns.
- **`train`** is an ordinary SGD loop. Each call restarts from the same seeded table, so the two runs differ only in their pairs. Each batch holds a title once; a duplicate would make one row's correct answer another row's negative.
- **Parts 3 and 4** query with Spanish words from no training pair, check whether their vectors moved, then add Spanish–English pairs as a second batch and retrain.

**Expected result.** PyTorch 2.14 on a CPU; the full output is in the essay's corpus. Part 1 prints `cosines before: [0.6, 0.8]  loss: 2.1269`, `gradient on docs: [[-5.6371, 4.2278], [3.1709, 4.2278]]` and `cosines after one step: [0.8317, 0.6202]`, the tables to four places. Training starts at `loss 4.3275  matching [-0.73, -0.1, 0.21, 0.38, 0.44, 0.02]` and ends at `loss 0.0061  matching [0.33, 0.89, 0.63, 0.76, 0.76, 0.52]  non-matching mean -0.10`: matching pairs moved together, though not to 1. All six English queries find their titles, `6`, though none shares a word with its title. The Spanish queries score `1`, chance for six titles (`mochila` finds the backpack), and the script prints `spanish vectors changed by training: False`. With the Spanish pairs added, they score `6`.

One thing to try: set `tau = 1.0`. The matching cosines climb to between 0.85 and 0.96 by step 200, but the loss is still about 1.02, because at that temperature no arrangement of the vectors can drive it near zero. The Spanish queries still score 1, with their vectors unchanged.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 25.1, 34.2 and 34.4, and AI Engineer Core Track: LLM Engineering (Ed Donner, Udemy), lectures 5.4 and 5.5, paraphrased as study material; Sebastian Raschka, Machine Learning Q and AI, Leanpub edition of 2023-05-21, pp. 27–29 and 218 (physical); Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 702–704 (physical), the CLIP contrastive loss.*
