# Attention Is a Dictionary Lookup That Returns a Weighted Mix

Attention returns a weighted mix of stored values. A **causal mask** restricts that mix to the current position and earlier ones. You can therefore train on a complete document without letting later text affect earlier predictions. Appending text leaves earlier outputs unchanged, subject to the numerical limits below.

A dictionary returns the value at an exactly matching key, or no match. Attention replaces equality with a numerical score and combines values instead of selecting one. For finite scores, every unmasked entry receives positive weight; a low score reduces its contribution without removing it.

## Three tokens and a weighted lookup

A **token** is a unit of text processed by the model. Its **embedding** is a vector, an ordered list of numbers representing it. Each attention layer, a stage of the model's computation, transforms its input vectors using separate learned matrices: tables of multipliers fitted during training. These produce a **query** to score against stored **keys**, and **values** to mix according to those scores.

Use these invented vectors. Keys and queries contain four entries; values contain two.

| token | key | value | query |
|---|---|---|---|
| 1 | (2, 0, 0, 0) | (1, 0) | (1, 1, 0, 0) |
| 2 | (0, 2, 0, 0) | (0, 1) | (0, 2, 0, 0) |
| 3 | (1, 0, 1, 0) | (1, 1) | (2, 0, 0, 0) |

The **dot product** multiplies corresponding entries and adds the products. It measures alignment and magnitude: a longer key can score higher even with the same direction. Divide each product by the square root of the key width: √4 = 2. For row 2:

| Key | Dot product with query (0, 2, 0, 0) | Scaled score |
|---|---|---|
| 1 | 0 × 2 + 2 × 0 + 0 × 0 + 0 × 0 = 0 | 0 / 2 = 0 |
| 2 | 0 × 0 + 2 × 2 + 0 × 0 + 0 × 0 = 4 | 4 / 2 = 2 |
| 3 | 0 × 1 + 2 × 0 + 0 × 1 + 0 × 0 = 0 | 0 / 2 = 0 |

Repeat for each query:

| row \ column | 1 | 2 | 3 |
|---|---|---|---|
| 1 | 1 | 1 | 0.5 |
| 2 | 0 | 2 | 0 |
| 3 | 2 | 0 | 1 |

**Softmax** converts scores into weights: raise e, the natural exponential base, to each score, then divide by their sum. The weights sum to one. Scaling limits the spread of scores from wide vectors; excessive spread concentrates weight near one entry and produces small **gradients**, the rates of change used in training.

**Mask row 2** by replacing column 3's score with −∞, negative infinity. Its exponential is zero. The remaining exponentials are e<sup>0</sup> = 1 and e<sup>2</sup> ≈ 7.389, summing to 8.389. Weights are 1 / 8.389 ≈ 0.119 and 7.389 / 8.389 ≈ 0.881, with 0 for column 3. The output is 0.119 × (1, 0) + 0.881 × (0, 1) = (0.119, 0.881).

Remove token 3 entirely: row 2 still has scores (0, 2), weights (0.119, 0.881), and output (0.119, 0.881). The mask makes its presence irrelevant.

**Without the mask**, row 2's scores (0, 2, 0) give exponentials (1, 7.389, 1), sum 9.389, and weights (0.107, 0.787, 0.107). Its output is 0.107 × (1, 0) + 0.787 × (0, 1) + 0.107 × (1, 1) ≈ (0.213, 0.893) using unrounded weights. The displayed weights instead give (0.214, 0.894). Token 3 now contributes to the prediction intended for token 3.

Masked row 1 has weight 1 on itself and output (1, 0); unmasked, its output is (0.616, 0.616). Row 3 has no later column to exclude. Scores (2, 0, 1) give exponentials (7.389, 1, 2.718), sum 11.107, and weights (0.665, 0.090, 0.245). Its output is (0.910, 0.335), compared with (1, 0) if you return only the highest-scoring key's value.

## From one query to a masked table

For any query, attention is:

<p class="formula">out = Σ<sub>j</sub> w<sub>j</sub> v<sub>j</sub>, where w = softmax(q·K<sup>T</sup> / √d<sub>k</sub>)</p>

Here out is the output vector; Σ adds over key positions j; w<sub>j</sub> multiplies value v<sub>j</sub>. The vector w contains the softmax weights. q is the query, K holds the keys, and T means transpose, exchanging rows and columns so q·K<sup>T</sup> computes all query–key dot products. d<sub>k</sub> is the key width; √ takes its square root.

In **self-attention**, queries, keys and values come from the same sequence. With S tokens, you obtain an S × S score table and compute all rows in parallel. Each output mixes information for its position. During training, row i predicts token i + 1. The **loss**, a numerical prediction-error measure, averages −log P(x<sub>i+1</sub> | x<sub>≤i</sub>): the negative natural logarithm of the probability assigned to the next token given tokens through i. The correct next token supplies the answer against which you measure error; it must not supply information to that prediction. For example, row 3 predicts token 4, so column 4 must contribute nothing to row 3 even when the document already contains it. Later columns must be excluded in every layer:

<p class="formula">weights = softmax(Q·K<sup>T</sup> / √d<sub>k</sub> + M)</p>

Here weights is the table of mixing weights; Q and K hold queries and keys; T transposes K; their product gives dot-product scores. √d<sub>k</sub> scales by the square root of key width. M is the mask, with 0 where the column is at most the row and −∞ elsewhere. Softmax operates separately on each row.

Masked entries contribute zero to both numerator and denominator, leaving each row normalised to sum to one. Zeroing weights after softmax would break that sum. The resulting table is **lower-triangular**: entries above its diagonal are zero. The script uses −10<sup>9</sup>; its exponential rounds to 0.0 in floating-point arithmetic, the computer's finite-precision representation of numbers.

## Append a fourth token

Add key (0, 1, 0, 2), value (0, 2), and query (1, 0, 1, 1). Its column has scaled scores 0.5, 1 and 0 in rows 1–3. Masking replaces all three with −∞, preserving those rows. Row 4 includes every key:

| Column | Raw score | Scaled score | Exponential, rounded | Weight, rounded |
|---|---|---|---|---|
| 1 | 2 | 1 | 2.718 | 0.297 |
| 2 | 0 | 0 | 1 | 0.109 |
| 3 | 2 | 1 | 2.718 | 0.297 |
| 4 | 2 | 1 | 2.718 | 0.297 |
| Sum of exponentials | | | 2.718 + 1 + 2.718 + 2.718 ≈ 9.155 | |
| Output | | | | 0.297 × (1, 0) + 0.109 × (0, 1) + 0.297 × (1, 1) + 0.297 × (0, 2) ≈ (0.594, 1.000) |

Totals and output use unrounded values. Without masking, earlier outputs become (0.500, 0.878), (0.165, 1.142), and (0.835, 0.472).

Row k depends only on scores and values at positions 1 through k. The same restriction holds in each preceding layer, down to the embeddings. Appending a row and column therefore leaves earlier arithmetic unchanged. Training can compute every position together; generation uses the last available row to predict the next token, then appends that token and computes its row. A **KV cache** stores earlier keys and values for reuse.

## Limits

This restriction applies to a **decoder**, the part that generates successive tokens. An **encoder** processes an input sequence; BERT-style encoders mix information from both directions and cannot directly use that computation for next-token generation. In an encoder–decoder model, the decoder's lookup over encoder outputs is unmasked; its self-attention is causal. **Masked language modelling** instead replaces input tokens with placeholders and trains predictions of those tokens.

A plain implementation computes the full square before masking. Optimised attention routines can skip blocks above the diagonal. Multiple **heads**, separate parallel lookups, use the same mask: for example, eight heads of width 64 in a 512-wide model, with results joined together.

Earlier inputs and position information must remain fixed. Editing the prefix requires recomputation from the edit onward; position information must depend on position rather than sequence length. Exact equality holds mathematically, but different summation orders can change floating-point results. Use a tolerance when comparing implementations; this script's equality check passes because its masked terms add literal zero.

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
