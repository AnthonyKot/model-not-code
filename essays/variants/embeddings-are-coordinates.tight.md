# Similar Means Whatever the Training Pairs Said

An embedding is a vector, a fixed-length list of numbers representing an input. An encoder produces that vector from text. For search, training adjusts the encoder so matching queries and titles have similar vector directions. You can rank titles by comparing directions, but an accurate comparison cannot repair positions that training never arranged.

## Compare directions

Take an invented example: query q = (1, 0), matching document d<sub>1</sub> = (0.6, 0.8), and non-matching document d<sub>2</sub> = (0.8, −0.6). All have unit length, meaning length 1. Cosine similarity measures their alignment:

<p class="formula">cos(q, d) = (q · d) / (|q| × |d|)</p>

q and d are the query and document vectors. The dot product q · d multiplies corresponding entries and sums them. Each length, |q| or |d|, is the square root of the sum of squared entries. Their ratio gives the cosine of the angle: 1 for the same direction, 0 for right angles, −1 for opposite directions. Only direction counts.

Here the lengths cancel. The cosines are 1 × 0.6 + 0 × 0.8 = 0.6 and 1 × 0.8 + 0 × (−0.6) = 0.8. The wrong document ranks first.

For a catalogue, you encode each title once when storing it and each query when it arrives. Normalisation divides a vector by its length; normalised queries and titles need only dot products for ranking. A matrix, a rectangular table of numbers, holds the title vectors as rows. Matrix multiplication computes their dot products with the query together, then sorting orders the results. A model scoring each query–title pair directly instead runs once per item per query.

## Train on matching pairs

Contrastive training raises similarity for matching pairs and lowers it for alternatives. A batch is a group of pairs processed together. With B pairs, the same encoder produces B query vectors and B title vectors. Their B × B cosine table compares query i with title j. The diagonal entries, where i = j, hold the matches; other titles serve as negatives, examples treated as non-matches. Duplicate or otherwise relevant titles can therefore create incorrect negatives.

A loss measures error, with smaller values indicating a better fit. Softmax converts scores into probabilities by raising e, the base of the natural logarithm, to each score and dividing by the sum of those values. With two documents, cosines of +1 and −1 give the match at most 1/(1 + e<sup>−2</sup>) = 0.881 probability. The natural logarithm, ln, reverses raising e to a power. Cross-entropy, minus the natural logarithm of the correct answer's probability, then has a floor of −ln 0.881 = 0.127.

The temperature τ controls this scale: dividing cosines by τ below 1 widens score differences. Some systems learn it; here you fix it at 0.1. The row loss is:

<p class="formula">L<sub>i</sub> = −ln [ e<sup>s<sub>ii</sub>/τ</sup> / Σ<sub>j</sub> e<sup>s<sub>ij</sub>/τ</sup> ]</p>

L<sub>i</sub> is query i's loss; s<sub>ij</sub> is its cosine with title j, and s<sub>ii</sub> its matching cosine. τ is the temperature. e is the natural logarithm's base; Σ<sub>j</sub> sums over every title. The fraction is the matching title's softmax probability; −ln turns it into cross-entropy, zero at probability 1 and growing without limit as probability approaches zero. Averaging rows gives the batch loss, known as InfoNCE.

A gradient collects rates of change with respect to individual inputs or parameters, the adjustable numbers controlling a model’s output. Write p<sub>ij</sub> for title j's probability in row i. The loss gradient per unit of cosine is (p<sub>ii</sub> − 1)/τ for the match and p<sub>ij</sub>/τ for each negative. Gradient descent subtracts a multiple of the gradient, locally increasing the matching cosine and decreasing the others.

## One step by hand

Hold q fixed and move only the document vectors in this row:

| Step | d<sub>1</sub> (match) | d<sub>2</sub> (negative) |
|---|---|---|
| cosine | 0.6 | 0.8 |
| score, cosine / 0.1 | 6 | 8 |
| softmax, e<sup>6</sup>/(e<sup>6</sup> + e<sup>8</sup>) = 1/(1 + e<sup>2</sup>) = 1/(1 + 7.389) | 0.1192 | 0.8808 |
| loss gradient per unit of cosine | (0.1192 − 1)/0.1 = −8.808 | 0.8808/0.1 = +8.808 |

The loss is −ln 0.1192 = 2.127. Displayed values are rounded; calculations retain full precision.

For unit vectors, the cosine's gradient with respect to d is q − cos × d. Movement along d changes its length without changing its direction, so this gradient removes that component. Multiply by the loss gradient, then subtract a step with learning rate 0.05, the multiplier controlling the update size:

| | d<sub>1</sub> | d<sub>2</sub> |
|---|---|---|
| q − cos × d | (1, 0) − 0.6 × (0.6, 0.8) = (0.64, −0.48) | (1, 0) − 0.8 × (0.8, −0.6) = (0.36, 0.48) |
| × loss gradient | −8.808 × (0.64, −0.48) = (−5.637, 4.228) | 8.808 × (0.36, 0.48) = (3.171, 4.228) |
| after a step of 0.05: d − 0.05 × gradient | (0.8819, 0.5886) | (0.6415, −0.8114) |
| length | 1.0602 | 1.0343 |
| new cosine with q | 0.8819 / 1.0602 = 0.832 | 0.6415 / 1.0343 = 0.620 |

The match rises from 0.6 to 0.832; the negative falls from 0.8 to 0.620. The right title now ranks first.

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

## Scale and limits

A MiniLM sentence-encoder checkpoint had about 22 million parameters and emitted 384 numbers per text. A catalogue of 1.8 million titles becomes a 1.8 million × 384 matrix; comparison with a 384-number query can run on a CPU. A batch of 64 pairs gives 64 × 64 = 4,096 cosines and 64 − 1 = 63 negatives per query. Larger batches supply more negatives; an image–text model used batches of 32,768 pairs.

In an encoder, gradients update shared parameters rather than independent document vectors. A transformer, a neural network that combines information across text positions, produces vectors for tokens, the pieces into which text is split. Mean pooling averages these vectors, excluding padding positions added to equalise input lengths.

A name alone does not establish training coverage: in the Sentence Transformers checkpoint name `multi-qa-MiniLM`, “multi” denoted question–answer pairs from multiple sources; multilingual checkpoints said `multilingual` explicitly.

Missing pair types contribute no direct matching term to the loss. Shared parameters can still change their vectors through other pairs, but that loss does not test whether the missing pairs align. Training on web image–text pairs likewise can leave weaker results on satellite and medical images.

The exercise makes the omission exact: a lookup table stores a separate vector for each word. Words absent from training receive zero gradients. Without weight decay, an additional update that shrinks parameters, their vectors remain at their initial values. Adding the missing pairs supplies a training signal; success on those pairs does not establish performance on unseen ones.

Temperature also limits interpretation. At τ = 0.1, the exercise reaches loss 0.0061 while a matching cosine remains 0.33. A relevance threshold of 0.8 cannot be assumed to transfer between models with different training.

<!--mission-->
## Exercise: train a tiny encoder and leave a pair type out

Run the script with PyTorch on a CPU. Autograd, its automatic gradient calculation, first checks the hand-worked step. No model download is needed.

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

`F.normalize` makes rows unit length; `F.cross_entropy` applies the row loss; `loss.backward()` calculates gradients through normalisation. `EmbeddingBag` learns 8 numbers per word and averages word vectors. `contrastive_loss` puts correct titles on the diagonal. Its symmetric version adds `F.cross_entropy(sim.T / tau, target)` and halves the sum to average row and column losses.

`train` uses SGD, a gradient-descent update over training batches, and restarts from the same seeded values. Each title appears once per batch to avoid treating a duplicate match as a negative. Parts 3 and 4 compare Spanish queries before and after adding Spanish–English pairs.

Expected output, recorded with PyTorch 2.14 on a CPU:

```text
cosines before: [0.6, 0.8]  loss: 2.1269
gradient on docs: [[-5.6371, 4.2278], [3.1709, 4.2278]]
cosines after one step: [0.8317, 0.6202]
step   0  loss 4.3275  matching [-0.73, -0.1, 0.21, 0.38, 0.44, 0.02]  non-matching mean 0.05
step   1  loss 3.0909  matching [-0.65, 0.08, 0.25, 0.47, 0.51, 0.09]  non-matching mean 0.03
step  10  loss 0.1245  matching [0.01, 0.74, 0.42, 0.64, 0.61, 0.26]  non-matching mean -0.04
step  50  loss 0.0220  matching [0.19, 0.84, 0.54, 0.71, 0.7, 0.4]  non-matching mean -0.07
step 200  loss 0.0061  matching [0.33, 0.89, 0.63, 0.76, 0.76, 0.52]  non-matching mean -0.10
english queries -> (['wireless keyboard', 'graphite pencil', 'steel kettle', 'leather watch', 'canvas backpack', 'chef knife'], 6)
spanish queries -> (['graphite pencil', 'chef knife', 'wireless keyboard', 'steel kettle', 'canvas backpack', 'graphite pencil'], 1)
spanish vectors changed by training: False
with the pairs, spanish queries -> (['wireless keyboard', 'graphite pencil', 'steel kettle', 'leather watch', 'canvas backpack', 'chef knife'], 6)
```

All six English queries retrieve their titles without sharing words with them. Only one Spanish query does: `mochila` retrieves the backpack. Spanish vectors remain unchanged. Adding their pairs raises the count to six.

Try `tau = 1.0`: matching cosines reach 0.85–0.96 by step 200, but loss remains about 1.02 because the bounded cosine range prevents it approaching zero. Spanish queries still score 1, with their vectors unchanged.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 25.1, 34.2 and 34.4, and AI Engineer Core Track: LLM Engineering (Ed Donner, Udemy), lectures 5.4 and 5.5, paraphrased as study material; Sebastian Raschka, Machine Learning Q and AI, Leanpub edition of 2023-05-21, pp. 27–29 and 218 (physical); Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 702–704 (physical), the CLIP contrastive loss.*
