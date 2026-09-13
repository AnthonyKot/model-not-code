# Attention Is a Dictionary Lookup That Returns a Weighted Mix

You are told two things about the language model you are about to serve. It was trained on whole documents, every token present, including the ones it was being asked to predict. And at serving time it produces one token at a time, each appended to the prompt before the next. Read as a programmer, the two do not match: either training let the model read the token it was predicting, which is cheating, or serving runs a different program from the one that was trained and the loss you measured says nothing about the thing you deployed.

Both worries resolve in one place: a mask applied to one table inside every attention layer. This essay builds the table, applies the mask, and shows what the mask buys: the numbers computed for the tokens already in the sequence do not change when a new token is appended, and that invariance is what makes the training pass and the generation loop the same computation.

## A lookup whose equality test is a score

A dictionary takes a key, finds an exact match and returns the value stored there, or finds nothing. Attention has the same shape with the equality test replaced by a score and the single return replaced by a mix.

Every token carries three vectors, each produced from the token's embedding by its own learned matrix: a query q, a key k and a value v. The query is what a token is matched with, the key is what each token is matched against, and the value is what each token contributes to the result. For one query against every stored key:

1. Score each key by the dot product q·k<sub>j</sub>. A large product means the query and that key are aligned and long; a short key pointing the same way scores less than a long one, so magnitude counts as well as direction.
2. Divide every score by the square root of d<sub>k</sub>, the number of entries in a key. Dot products of wide vectors spread wide; without the divisor the next step would return almost exactly one entry every time, with tiny gradients.
3. Turn the scaled scores into weights with a softmax: exponentiate each and divide by the sum of the exponentials. The weights are positive and sum to one.
4. Return the sum of the values, each multiplied by its weight.

<p class="formula">out = Σ<sub>j</sub> w<sub>j</sub> v<sub>j</sub>, where w = softmax(q·K<sup>T</sup> / √d<sub>k</sub>)</p>

The best-matching key dominates the mix and the others still contribute; that is the whole difference from the dictionary.

## Every token is a query, so the scores form a square

In self-attention every token is a query, a key and a value at once. With S tokens the scores form an S × S table: row i holds token i's query scored against all S keys. The softmax runs row by row, so each row sums to one and produces one output vector, the mix that replaces token i's embedding on the way into the next layer. No row waits for another, so all S rows are computed at once.

That parallelism is the training pass. One pass over S tokens produces S output rows; row i is scored against token i + 1, the next one in the document, and the loss averages −log P(x<sub>i+1</sub> | x<sub>≤i</sub>) over every position i. One document, one pass, S predictions. Now read the table with that loss in mind. Row 3 is supposed to predict token 4, but column 4 of row 3 holds token 3's query scored against token 4's key, and token 4's value is in row 3's mix. Row 3 is being asked to predict a token it can read. That is the cheating you were worried about, and nothing in the computation so far prevents it.

## From the requirement to the mask

The requirement can be stated exactly. Row i is the prediction for token i + 1, so row i must be computed as if tokens i + 1 onward did not exist: its output may depend on positions 1 to i and on nothing later. This property is called **causal**, because information flows only from earlier positions to later ones, the way a sentence is produced. In the table it means that every weight to the right of the diagonal, column j greater than row i, must be exactly zero. Small is not enough; a weight of 0.001 on token 4 still lets a trace of token 4's value into row 3.

Two things must stay true at the same time. The forbidden weights must be zero, and each row's remaining weights must still sum to one, or the row's output stops being a weighted average of the values it is allowed to see. The obvious fix fails the second condition: compute the softmax, then set the forbidden weights to zero, and row 2 of the worked example below would keep only about 0.89 of its weight instead of 1. You would have to divide by that sum again.

The softmax itself offers a cleaner place to intervene. A weight is e<sup>score</sup> divided by the sum of e<sup>score</sup> over the row, and e<sup>−∞</sup> is 0. So if a forbidden score is replaced by −∞ before the softmax, that entry contributes 0 to the numerator and 0 to the denominator: its weight is zero, and the division already renormalises over the columns that remain. That is the whole mechanism of the causal mask, written as one added matrix:

<p class="formula">weights = softmax(Q·K<sup>T</sup> / √d<sub>k</sub> + M)</p>

Q·K<sup>T</sup> / √d<sub>k</sub> is the scaled score table from above. M is the mask, a matrix of the same S × S shape with 0 wherever the column is at most the row and −∞ wherever the column comes after the row. Adding M leaves allowed scores unchanged and turns forbidden ones into −∞; the softmax then runs across each row.

In code the −∞ is a large negative number such as −10<sup>9</sup>; `exp` of that is 0.0 in floating point and the effect is the same. The weight table comes out **lower-triangular**, zero everywhere above the diagonal: row k has weights on columns 1 to k that sum to one, and exact zeros beyond. The same mask is applied inside every layer of the stack, because a later layer that could see the future would undo the earlier ones.

## Worked example: three tokens, then a fourth

The numbers below are the book's own; the vectors are invented so the arithmetic can be done by hand. Keys and queries have four entries, so √d<sub>k</sub> = 2; values have two.

| token | key | value | query |
|---|---|---|---|
| 1 | (2, 0, 0, 0) | (1, 0) | (1, 1, 0, 0) |
| 2 | (0, 2, 0, 0) | (0, 1) | (0, 2, 0, 0) |
| 3 | (1, 0, 1, 0) | (1, 1) | (2, 0, 0, 0) |

Dot each query with each key and divide by 2. Row 2, for instance: (0, 2, 0, 0)·(2, 0, 0, 0) = 0, (0, 2, 0, 0)·(0, 2, 0, 0) = 4 and (0, 2, 0, 0)·(1, 0, 1, 0) = 0, so 0, 2, 0 after scaling. The full scaled table:

| row \ column | 1 | 2 | 3 |
|---|---|---|---|
| 1 | 1 | 1 | 0.5 |
| 2 | 0 | 2 | 0 |
| 3 | 2 | 0 | 1 |

A weight is e raised to the score, divided by the row's total of those exponentials. Take row 2, whose scaled scores are 0, 2 and 0. With the mask, column 3's score becomes −∞ and drops out, so the total is e<sup>0</sup> + e<sup>2</sup> ≈ 1 + 7.39 = 8.39 and the two weights are 1 / 8.39 ≈ 0.12 and 7.39 / 8.39 ≈ 0.88. Every other weight below comes from the same two steps. The output is the weighted sum of the values: 0.12 × (1, 0) + 0.88 × (0, 1) = (0.12, 0.88).

Here is the whole table both ways, rounded to two places. Read each row as "how much of each token's value this position mixes in".

| Row (predicts) | Masked weights: col 1, 2, 3 | Masked output | Unmasked weights: col 1, 2, 3 | Unmasked output |
|---|---|---|---|---|
| 1 (token 2) | **1.00**, 0, 0 | (1.00, 0.00) | 0.38, 0.38, 0.23 | (0.62, 0.62) |
| 2 (token 3) | 0.12, **0.88**, 0 | (0.12, 0.88) | 0.11, 0.79, 0.11 | (0.21, 0.89) |
| 3 (token 4) | 0.67, 0.09, 0.24 | (0.91, 0.33) | 0.67, 0.09, 0.24 | (0.91, 0.33) |

The masked side has zeros above the diagonal, which is the causal rule made visible. The unmasked side puts weight on later tokens: row 1 takes 0.38 of token 2, the very token it is supposed to predict. Row 3 is the same both ways, because in a three-token sequence it has no later column to hide.

Now the property that matters. Delete token 3 from the input and recompute row 2 with the mask: its scores are 0 and 2, its weights 0.12 and 0.88, its output (0.12, 0.88), exactly as before. Row 2 cannot tell whether token 3 is in the input or has not been generated yet.

Append a fourth token with key (0, 1, 0, 2), value (0, 2) and query (1, 0, 1, 1), and compare rows 1 to 3 before and after:

| Row | Masked, 3 tokens | Masked, 4 tokens | Unmasked, 3 tokens | Unmasked, 4 tokens |
|---|---|---|---|---|
| 1 | (1.00, 0.00) | (1.00, 0.00) | (0.62, 0.62) | (0.50, 0.88) |
| 2 | (0.12, 0.88) | (0.12, 0.88) | (0.21, 0.89) | (0.17, 1.14) |
| 3 | (0.91, 0.33) | (0.91, 0.33) | (0.91, 0.33) | (0.83, 0.47) |

With the mask, no earlier row moves; the new token only adds row 4, which mixes all four values with weights 0.30, 0.11, 0.30, 0.30 and outputs (0.59, 1.00). Without the mask, every earlier row changes.

## Why the rows cannot move

Row k's weights are exponentials of its scores over their sum, and after the mask the sum runs over columns 1 to k only. Those scores are q<sub>k</sub> against k<sub>1</sub> to k<sub>k</sub>, and the output mixes v<sub>1</sub> to v<sub>k</sub>, each computed from its own token's input to the layer. So row k is a function of the layer's inputs at positions 1 to k and of nothing else. The layer below satisfies the same statement, so it holds all the way down to the embeddings. Appending token S + 1 adds a row and a column; every existing row's arithmetic is untouched.

Two consequences follow, and they answer the opening worry. Training on a whole document is not cheating: row k's output was computed as if tokens k + 1 onward were absent, in the arithmetic rather than by intent, and the loss compares it with token k + 1. The target is in the matrix; it is not in the row. And generation is the same program run incrementally: producing token S + 1 needs row S + 1, whose keys and values for positions 1 to S are the ones the earlier pass computed. A serving system stores them instead of recomputing them; that store is the KV cache, the subject of a separate essay in Part IV.

## What the mask does not do

The mask is the decoder's. An encoder-only model of the BERT family has no causal mask: every row mixes every column, which is what makes it good at embedding a whole sentence and unusable for generating one. In an encoder–decoder model the decoder's attention over the encoder's output is not masked either; only its attention over its own tokens is. And the word "mask" names something else in those encoder models: masked language modelling replaces random input tokens with a placeholder and trains the model to predict them. Same word, different object.

In the plain form the mask hides work without saving it: the S × S table is computed in full and half of it is then set to −∞. Production attention kernels know the mask's shape in advance and skip the blocks above the diagonal, so the saving is real there; the arithmetic that survives is the same.

The invariance has preconditions. The earlier keys and values must stay put: edit the prefix and every row from that point on is recomputed, and the position information added to each token must depend on its own position, not on the sequence length. It also holds exactly only in exact arithmetic: the exercise passes an `==` check because the masked terms add a literal 0.0, but a framework's batched kernel may sum a row in a different order from its single-token path, so compare with a tolerance there.

Finally, this is one head. Real layers run several such lookups side by side on narrower projections and concatenate the results, for instance eight heads of width 64 in a 512-wide model; the mask is the same in every head.

<!--mission-->
## Exercise: append a token and watch the rows hold

Plain Python; `math.exp` is all it needs. The script builds the three-token table above, masks it, softmaxes each row and mixes the values, then appends the fourth token and asserts that rows 1 to 3 have not changed, with and without the mask.

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

**Expected result.** Run with Python 3.12 and nothing else; the output is in the essay's corpus. The masked three-token rows print as `[1.0, 0.0]`, `[0.119, 0.881]` and `[0.91, 0.335]`; after the append they print the same numbers and the first assertion passes, and row 4 prints (0.594, 1.000). The unmasked rows all differ from their three-token versions, and the second assertion fails on row 1. Then write one sentence, in your own words, on why "the model saw the future during training" is false. The test of the sentence is whether it says what row k is a function of.

One thing to try once that matches: change `NEG` to `-30` and rerun. `math.exp(-30)` is small but not 0.0, so the masked columns carry a sliver of weight and the first assertion fails, which is why the number must underflow rather than merely be negative.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lecture 28.2, and Building LLMs like ChatGPT from Scratch (Neuralearn.ai, Udemy), lecture 2.2, paraphrased as study material; AI Engineer Core Track: LLM Engineering (Ed Donner, Udemy), lecture 3.18, for the four attention projections; Sebastian Raschka, Machine Learning Q and AI, Leanpub edition of 2023-05-21, pp. 117–126 (physical); Uday Kamath, Kevin Keenan, Garrett Somers and Sarah Sorenson, Large Language Models: A Deep Dive, pp. 63–68 and 81 (physical), §§2.2.1, 2.3.2, 2.3.5, 2.3.8 and 2.5.2.*
