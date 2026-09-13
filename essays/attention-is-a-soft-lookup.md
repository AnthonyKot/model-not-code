# Attention Is a Dictionary Lookup That Returns a Weighted Mix

A language model is trained on whole documents: every token of a sentence is in memory at once, including the tokens it is being taught to predict. Yet when you use it, it produces one token at a time, each appended before the next is chosen. Those two facts look incompatible. Either training lets the model peek at the answer, which would make the training score meaningless, or generation runs a different computation from the one that was trained. Neither is true, and the reason is one small addition inside attention called the **causal mask**. This essay builds attention on numbers small enough to follow, shows exactly where the peeking would happen, and derives the mask from what is needed to stop it.

## Attention is a lookup that returns a blend

A dictionary lookup takes a key, finds the entry with exactly that key and returns its value. Attention keeps the shape of a lookup but changes two things. Instead of asking "is this key equal?", it gives every stored key a **score** for how well it matches. And instead of returning one value, it returns a **blend** of all the values, with better-matching entries contributing more.

The text is first split into **tokens**, pieces of words, and each token is turned into a list of numbers, a **vector**. From each token's vector the model computes three smaller vectors with its learned weights:

- a **query**: what this position is looking for;
- a **key**: what this position offers to be matched against;
- a **value**: what this position contributes to the blend if it matches.

Here are three tokens with invented vectors, kept small so every number can be checked by hand:

| token | key | value | query |
|---|---|---|---|
| 1 | (2, 0, 0, 0) | (1, 0) | (1, 1, 0, 0) |
| 2 | (0, 2, 0, 0) | (0, 1) | (0, 2, 0, 0) |
| 3 | (1, 0, 1, 0) | (1, 1) | (2, 0, 0, 0) |

**Step 1: score.** A query is scored against a key with the **dot product**: multiply the matching entries and add them up. Vectors that point the same way score high; unrelated ones score zero. Each score is then scaled down by the square root of the key's length, here √4 = 2, which keeps scores from growing just because vectors are long. For token 2's query:

| Key | Dot product with query (0, 2, 0, 0) | Scaled score |
|---|---|---|
| 1 | 0 × 2 + 2 × 0 + 0 × 0 + 0 × 0 = 0 | 0 / 2 = 0 |
| 2 | 0 × 0 + 2 × 2 + 0 × 0 + 0 × 0 = 4 | 4 / 2 = 2 |
| 3 | 0 × 1 + 2 × 0 + 0 × 1 + 0 × 0 = 0 | 0 / 2 = 0 |

Every token is a query, so doing this for all three gives a square table of scores. Row i holds token i's query scored against every key:

| row \ column | 1 | 2 | 3 |
|---|---|---|---|
| 1 | 1 | 1 | 0.5 |
| 2 | 0 | 2 | 0 |
| 3 | 2 | 0 | 1 |

**Step 2: turn scores into shares.** The **softmax** turns a row of scores into weights that are positive and add up to one. It raises the number e (about 2.718) to each score and divides each result by the row's total. The exponent makes a higher score take a disproportionately larger share. Row 2's scores 0, 2, 0 become e<sup>0</sup> = 1, e<sup>2</sup> ≈ 7.39 and e<sup>0</sup> = 1; the total is 9.39, so the weights are about 0.11, 0.79 and 0.11.

**Step 3: blend.** The output for row 2 is the values mixed by those weights: 0.11 × (1, 0) + 0.79 × (0, 1) + 0.11 × (1, 1) ≈ (0.21, 0.89). Token 2's own value dominates because its key matched best, but tokens 1 and 3 still leak in a little. That is the difference from a dictionary: nothing is ever fully excluded.

In symbols, for one query q against all keys K:

<p class="formula">out = Σ<sub>j</sub> w<sub>j</sub> v<sub>j</sub>, where w = softmax(q·K<sup>T</sup> / √d<sub>k</sub>)</p>

Read it right to left. q·K<sup>T</sup> is the list of dot products of the query with every key (the T, "transpose", just lines the keys up so one multiplication does them all). Dividing by √d<sub>k</sub> is step 1's scaling, with d<sub>k</sub> the key length. Softmax is step 2, producing the weights w<sub>j</sub>. The sum Σ<sub>j</sub> w<sub>j</sub> v<sub>j</sub> is step 3: each value v<sub>j</sub> times its weight, added up.

## Where training would cheat

Now connect this to how the model learns. During training, the output of row i is used to predict the next token, i + 1. Row 1 predicts token 2, row 2 predicts token 3, and so on, and all rows are computed in one pass over the document. That is what makes training on whole documents efficient.

Look at row 2 again. It is supposed to predict token 3, yet its blend just gave token 3's value a weight of 0.11. Row 1 is worse: it predicts token 2, and without any restriction its weights are 0.38, 0.38 and 0.23, so more than a third of its output is token 2's own value. The answer is being fed into the prediction of that answer. A model trained this way would learn to copy from the future, score well, and fail the moment it has to generate text where the future does not exist yet.

## From the requirement to the mask

The requirement can be stated exactly: row i may use tokens 1 to i and nothing after. This property is called **causal**, because information only flows from earlier positions to later ones, the way text is written. In the weight table it means every weight to the right of the diagonal must be exactly zero. A small weight is not enough; even a sliver of the answer is still the answer leaking in.

There is a second condition. Each row's remaining weights must still add up to one, or the output stops being a proper blend. The obvious fix, computing the weights and then zeroing the forbidden ones, breaks this: row 2 would be left with only about 0.89 of its weight.

The softmax offers a cleaner place to intervene. A weight is e<sup>score</sup> divided by the row's total, and e raised to minus infinity is zero. So if a forbidden score is replaced by −∞ before the softmax, that entry adds zero to the top of its fraction and zero to the total below it. Its weight is zero, and the remaining weights automatically share the whole. That is the causal mask, written as one added matrix:

<p class="formula">weights = softmax(Q·K<sup>T</sup> / √d<sub>k</sub> + M)</p>

Q·K<sup>T</sup> / √d<sub>k</sub> is the whole scaled score table from above, every query against every key at once. M is the **mask**, a table of the same shape holding 0 where the column is at or before the row and −∞ where the column comes after it. Adding M leaves the allowed scores untouched and turns the forbidden ones into −∞. The softmax then runs along each row. In code the −∞ is a very large negative number such as −10<sup>9</sup>, whose exponential is exactly 0.0 on a computer. The same mask is applied in every attention layer, because a later layer that could see the future would undo the earlier ones.

## The mask at work

Row 2 with the mask: column 3's score becomes −∞ and drops out, so the total is 1 + 7.39 = 8.39 and the weights are about 0.12 and 0.88. The output is 0.12 × (1, 0) + 0.88 × (0, 1) = (0.12, 0.88). Here is the whole table both ways, rounded to two places:

| Row (predicts) | Masked weights: col 1, 2, 3 | Masked output | Unmasked weights: col 1, 2, 3 | Unmasked output |
|---|---|---|---|---|
| 1 (token 2) | **1.00**, 0, 0 | (1.00, 0.00) | 0.38, 0.38, 0.23 | (0.62, 0.62) |
| 2 (token 3) | 0.12, **0.88**, 0 | (0.12, 0.88) | 0.11, 0.79, 0.11 | (0.21, 0.89) |
| 3 (token 4) | 0.67, 0.09, 0.24 | (0.91, 0.33) | 0.67, 0.09, 0.24 | (0.91, 0.33) |

The masked side has zeros above the diagonal: that is the causal rule, visible in the numbers. Row 3 is identical both ways, because in a three-token sequence nothing comes after it.

The payoff is a property you can test. Delete token 3 from the input and recompute row 2 with the mask: scores 0 and 2, weights 0.12 and 0.88, output (0.12, 0.88), exactly as before. Row 2 cannot tell whether token 3 exists or has not been generated yet. Now append a fourth token, with key (0, 1, 0, 2), value (0, 2) and query (1, 0, 1, 1), and compare the earlier rows:

| Row | Masked, 3 tokens | Masked, 4 tokens | Unmasked, 3 tokens | Unmasked, 4 tokens |
|---|---|---|---|---|
| 1 | (1.00, 0.00) | (1.00, 0.00) | (0.62, 0.62) | (0.50, 0.88) |
| 2 | (0.12, 0.88) | (0.12, 0.88) | (0.21, 0.89) | (0.17, 1.14) |
| 3 | (0.91, 0.33) | (0.91, 0.33) | (0.91, 0.33) | (0.83, 0.47) |

With the mask, no earlier row moves; the new token only adds row 4, which blends all four values with weights 0.30, 0.11, 0.30, 0.30 into (0.59, 1.00). Without the mask, every earlier row changes.

This resolves the opening puzzle. Training is not cheating: row i was computed exactly as if later tokens were absent, so comparing it with token i + 1 is a fair test. And generation is the same computation, run one row at a time: the rows already computed never change, so a serving system can keep their keys and values instead of recomputing them. That stored table is the **KV cache**, the subject of an essay in Part IV.

## When the mask applies, and when it does not

The mask answers one question: does any row predict a token that appears later in the same table? If yes, those later columns must be hidden. The same test, applied case by case, explains where the mask is used and where it is not.

| Situation | Is the causal mask used? | Why, in terms of that question |
|---|---|---|
| A model generating text left to right (a **decoder**, as in chat models) | Yes, in every layer | Each row predicts the next token, and that token is in the table during training. |
| A model reading a whole passage to understand it (an **encoder**, as in the BERT family) | No | No row predicts a later token; the whole passage is given, so letting every token see every other is allowed and helps understanding. Such a model cannot write the next token this way. |
| Translation-style models, where a decoder writes an output while reading a separate input | Yes for the decoder attending to its own output; no for its attention to the input | The output is being predicted, so it is masked. The input sentence is given in full, so it is not an answer and may be seen entirely. |
| Sentences of different lengths in one batch, filled out with **padding** tokens | A different mask with the same trick: −∞ on the padding columns | Padding is not text, so no row should blend it in; the same −∞-before-softmax step hides it. |
| **Masked language modelling**, how encoder models are trained | Not this mask, despite the name | Random input tokens are replaced by a placeholder, so the answer is removed from the input itself rather than hidden inside attention. |

Three practical notes. The simple version computes the full square and then discards half; optimised attention code skips the hidden half, so the result is the same and the saving is real. Real layers run several lookups side by side, called **heads**, for example eight heads of 64 numbers each in a model whose vectors have 512; every head uses the same mask. And the "earlier rows never change" guarantee holds only while earlier tokens and their position information stay fixed: edit the middle of a prompt and everything after the edit is recomputed. It is exact in arithmetic but not always on hardware, where two implementations may add numbers in a different order and differ in the last digits, so compare real models with a small tolerance; the script below can use exact equality because its masked terms add a literal zero.

<!--mission-->
## Exercise: append a token and watch the rows hold

Run this plain Python script:

```python
import math

NEG = -1e9  # minus infinity for practical purposes: exp(-1e9) is 0.0 in floating point

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

def softmax(row):
    e = [math.exp(s) for s in row]
    z = sum(e)
    return [x / z for x in e]

def attention(Q, K, V, causal):
    """Return (weights, outputs): one weight row and one output vector per query."""
    dk = len(K[0])
    weights, outputs = [], []
    for i, q in enumerate(Q):
        scores = [dot(q, k) / math.sqrt(dk) for k in K]          # scaled q·k against every key
        if causal:
            scores = [s if j <= i else NEG for j, s in enumerate(scores)]  # hide columns after i
        w = softmax(scores)                                       # row-wise: this row sums to one
        out = [sum(w[j] * V[j][c] for j in range(len(V))) for c in range(len(V[0]))]
        weights.append(w)
        outputs.append(out)
    return weights, outputs

def show(label, weights, outputs):
    print(label)
    for i, (w, o) in enumerate(zip(weights, outputs), 1):
        print(f"  row {i}: weights {[round(x, 3) for x in w]} -> output {[round(x, 3) for x in o]}")

# Three tokens. Keys are four numbers each (so sqrt(d_k) = 2), values two numbers each.
K = [(2, 0, 0, 0), (0, 2, 0, 0), (1, 0, 1, 0)]
V = [(1, 0), (0, 1), (1, 1)]
Q = [(1, 1, 0, 0), (0, 2, 0, 0), (2, 0, 0, 0)]

w3, o3 = attention(Q, K, V, causal=True)
show("masked, 3 tokens", w3, o3)
w3u, o3u = attention(Q, K, V, causal=False)
show("unmasked, 3 tokens", w3u, o3u)

# Append a fourth token. With the mask, rows 1-3 do not move.
K4 = K + [(0, 1, 0, 2)]
V4 = V + [(0, 2)]
Q4 = Q + [(1, 0, 1, 1)]
w4, o4 = attention(Q4, K4, V4, causal=True)
show("masked, 4 tokens", w4, o4)
for i in range(3):
    assert o4[i] == o3[i], f"row {i + 1} changed"
print("assertion with the mask: rows 1-3 unchanged after appending token 4")

# Without the mask the same append changes every earlier row.
w4u, o4u = attention(Q4, K4, V4, causal=False)
show("unmasked, 4 tokens", w4u, o4u)
try:
    for i in range(3):
        assert o4u[i] == o3u[i], f"row {i + 1} changed"
    print("assertion without the mask: passed (unexpected)")
except AssertionError as e:
    print(f"assertion without the mask: failed as expected ({e})")
```

`attention` scores, optionally masks, normalises and mixes each row. The first assertion checks unchanged earlier outputs after appending token 4. The unmasked comparison fails on row 1.

Recorded verification output follows exactly. Its scaled-score printout and two-token check are additional diagnostics from the verification run; the script above prints the remaining lines.

```text
scaled score table (row = query, column = key):
   [1.0, 1.0, 0.5]
   [0.0, 2.0, 0.0]
   [2.0, 0.0, 1.0]
masked, 3 tokens
  row 1: weights [1.0, 0.0, 0.0] -> output [1.0, 0.0]
  row 2: weights [0.119, 0.881, 0.0] -> output [0.119, 0.881]
  row 3: weights [0.665, 0.09, 0.245] -> output [0.91, 0.335]
unmasked, 3 tokens
  row 1: weights [0.384, 0.384, 0.233] -> output [0.616, 0.616]
  row 2: weights [0.107, 0.787, 0.107] -> output [0.213, 0.893]
  row 3: weights [0.665, 0.09, 0.245] -> output [0.91, 0.335]
masked, 2 tokens
  row 1: weights [1.0, 0.0] -> output [1.0, 0.0]
  row 2: weights [0.119, 0.881] -> output [0.119, 0.881]
masked, 4 tokens
  row 1: weights [1.0, 0.0, 0.0, 0.0] -> output [1.0, 0.0]
  row 2: weights [0.119, 0.881, 0.0, 0.0] -> output [0.119, 0.881]
  row 3: weights [0.665, 0.09, 0.245, 0.0] -> output [0.91, 0.335]
  row 4: weights [0.297, 0.109, 0.297, 0.297] -> output [0.594, 1.0]
assertion with the mask: rows 1-3 unchanged after appending token 4
unmasked, 4 tokens
  row 1: weights [0.311, 0.311, 0.189, 0.189] -> output [0.5, 0.878]
  row 2: weights [0.083, 0.61, 0.083, 0.225] -> output [0.165, 1.142]
  row 3: weights [0.61, 0.083, 0.225, 0.083] -> output [0.835, 0.472]
  row 4: weights [0.297, 0.109, 0.297, 0.297] -> output [0.594, 1.0]
assertion without the mask: failed as expected (row 1 changed)
```

Explain why row k cannot depend on later tokens. Then change `NEG` to `-30`: `math.exp(-30)` remains nonzero, later columns receive nonzero weight, and the first assertion fails. A negative score alone does not guarantee exclusion.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lecture 28.2, and Building LLMs like ChatGPT from Scratch (Neuralearn.ai, Udemy), lecture 2.2, paraphrased as study material; AI Engineer Core Track: LLM Engineering (Ed Donner, Udemy), lecture 3.18, for the four attention projections; Sebastian Raschka, Machine Learning Q and AI, Leanpub edition of 2023-05-21, pp. 117–126 (physical); Uday Kamath, Kevin Keenan, Garrett Somers and Sarah Sorenson, Large Language Models: A Deep Dive, pp. 63–68 and 81 (physical), §§2.2.1, 2.3.2, 2.3.5, 2.3.8 and 2.5.2.*
