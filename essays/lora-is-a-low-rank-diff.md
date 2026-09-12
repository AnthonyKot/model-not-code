# Fine-Tuning Without Touching the Weights

You have a model whose behaviour you need to change on your task, and it has about three billion weights. A full fine-tune updates every one of them, which means every one needs its value, its gradient and whatever the optimiser keeps per weight, all resident on the GPU at once. A Llama 3.2 base of that size takes about 13 GB of GPU memory just to hold at 32-bit precision, before training starts. The card you actually have is the free one in a notebook. The full fine-tune does not fit, and it would not fit with twice the card either.

The way out is not to make the model smaller. It is to stop treating the model as the thing you edit. You leave every weight where it is and train a separate, much smaller object that is added to the model's output. That object is a diff, and this essay is about why a diff of a particular shape is so much cheaper than the weights it changes.

## A weight update is a matrix, and a matrix can be factored

Take one weight matrix inside the model, call it W, with d<sub>in</sub> columns and d<sub>out</sub> rows. During a full fine-tune W becomes W + ΔW, where ΔW has exactly the same shape as W. That is where the cost comes from: the update has as many entries as the weight.

Low-rank adaptation, LoRA, replaces ΔW with a product of two thin matrices. A has r rows and d<sub>in</sub> columns; B has d<sub>out</sub> rows and r columns. Their product B·A has the shape of W, so it can be added to W, but its entries are not free: they are generated from (d<sub>in</sub> + d<sub>out</sub>) × r numbers rather than d<sub>in</sub> × d<sub>out</sub>. The number r is the adapter's rank, and it is chosen by you. The usual starting values are 8, 16 and 32.

Here is the whole mechanism as a forward pass. For an input vector x:

<p class="formula">h = W·x + s · B·(A·x)</p>

Four things follow from that one line.

**Only A and B receive gradients.** W is marked frozen, so the backward pass computes how the loss changes with A and with B and never allocates a gradient for W. The optimiser state, which for the Adam family is a running record per trainable parameter, is kept only for A and B too. The memory that scales with what you train, the gradients and the optimiser state, is now proportional to the diff rather than to the model. The frozen base still has to be resident, and the activations saved for the backward pass still grow with batch size and sequence length. LoRA removes the first cost and leaves the other two where they were.

**Training starts exactly at the base model.** The LoRA paper initialises A with random Gaussian entries and B with zeros, so B·A is the zero matrix at the first step and the first forward pass is the untouched model. Nothing about the base's behaviour changes until a non-zero gradient has moved B.

**The scale s is alpha divided by r.** The adapter's second hyperparameter, alpha, does not multiply the product directly; the LoRA paper defines the applied scale as alpha / r, and descriptions that call alpha a plain multiplier are shorthand for that. Keep the two apart when you copy settings: with alpha = 16, an adapter of rank 8 is applied at scale 2 and the same adapter at rank 64 at scale 0.25. The common rule of thumb alpha = 2r keeps the scale at 2 whatever r you pick: 64/32 and 512/256 both give 2.

**The diff has rank at most r.** Write B·A out and it is the sum of r outer products: the first column of B times the first row of A, plus the second column times the second row, and so on. Each outer product is a rank-1 matrix, so their sum can express at most r independent directions of change. This is the bet LoRA makes: that the change your task needs is closer to a few directions than to an arbitrary matrix. The exercise at the end lets you see both cases.

## Worked example: a 512 × 512 projection at rank 8

The numbers below are the book's own and the model is invented; the shapes are chosen to be easy to check by hand.

Suppose one attention projection maps 512 inputs to 512 outputs. W has 512 × 512 = 262,144 entries, and a full fine-tune would train every one of them.

Now attach an adapter of rank 8. A is 8 × 512, which is 4,096 numbers. B is 512 × 8, another 4,096. The adapter trains 8,192 numbers and can produce a 262,144-entry change. That is 8,192 / 262,144 = 3.125% of the entries it stands in for.

Scale it up to a small model with twelve layers, each with four such projections: 48 matrices. The frozen weights in those projections are 48 × 262,144 = 12,582,912. The adapters are 48 × 8,192 = 393,216. Stored at four bytes each, the adapter file is 393,216 × 4 = 1,572,864 bytes, or about 1.57 MB, and it is shipped as its own file. Merge it into W when you want a single artefact for serving, or keep it beside the base and swap it for another task's adapter. Either way the base model is never patched in place.

## Checking the formula against a reported configuration

The same formula can be checked against a real configuration reported in the course this essay draws on: adapters of rank 32 on the four attention projections q, k, v and o of each of 28 decoder layers, quoted there as 18 million parameters and 73 MB, with the saved adapter file at 73.4 MB on disk.

The course gives the model's inner width as 3072 and describes the k and v projections in round numbers, as having about 1,000 outputs. Take 3072 for the width. Per layer:

| Projection | d<sub>in</sub> + d<sub>out</sub> | × r = 32 |
|---|---|---|
| q, 3072 → 3072 | 6,144 | 196,608 |
| o, 3072 → 3072 | 6,144 | 196,608 |
| k, 3072 → 1024 | 4,096 | 131,072 |
| v, 3072 → 1024 | 4,096 | 131,072 |
| per layer | | 655,360 |

Over 28 layers that is 655,360 × 28 = 18,350,080 parameters, and at four bytes each, 73,400,320 bytes: 73.4 MB. A width of 1,000 in place of 1024 would give 18,307,072 parameters and 73.2 MB, so the reported file size is what fixes the k and v width at 1024.

The course's heavier configuration reproduces the same way: rank 256 on the attention projections and on the three MLP matrices, which widen 3072 to about 8,000 and back, reported as 389 million parameters and 1.56 GB. With widths 3072 and 8192, the attention projections contribute (6,144 + 6,144 + 4,096 + 4,096) × 256 = 5,242,880 per layer and the three MLP matrices (3072 + 8192) × 256 × 3 = 8,650,752, together 13,893,632 per layer and 389,021,696 over 28 layers, which is 1,556,086,784 bytes. Both reported figures fall out of (d<sub>in</sub> + d<sub>out</sub>) × r, summed over the target modules, times the layer count, times four bytes. That is the whole cost model, and you can now run it on any configuration you are handed.

## What the rank cannot do

Rank is a ceiling, not a promise. If the change your task needs is spread across more independent directions than r, the adapter fits what it can and leaves the rest, and no number of training steps recovers it; the exercise shows this directly. Raising r raises the ceiling and the file size together, which is the trade behind the two configurations above: the heavier one was chosen when the training set grew from 20,000 rows to 800,000. There is no formula for the right r; target modules, r and alpha are found by trial against your evaluation metric.

A diff of rank r is not a full fine-tune with fewer parameters. It is a different function class. Two runs with different r or different alpha are two different experiments, and the alpha convention above means a setting copied from one codebase may not mean the same thing in another.

The example arithmetic in the sources also deserves the recomputation this essay asks of you. The Q&A book used here gives an update matrix of 25 × 50 with inner dimension 5 and correctly counts the factors at 125 and 250, 375 in total; the local edition, dated 2023-05-21, prints the size of the full update as 6,250, where 25 × 50 is 1,250 (Raschka, *Machine Learning Q and AI*, pp. 141–142). The saving is still real, 375 against 1,250, but the point stands: count the entries yourself.

Finally, LoRA is only half of QLoRA. The other half, holding the frozen base in four-bit precision while the adapters stay in full precision, is why a 2.2 GB base plus a 73 MB adapter fits on the free card. How those four bits are chosen is the subject of a separate essay in Part IV. What matters here is that the quantisation is applied to the base and never to the diff.

<!--mission-->
## Exercise: see what a rank-4 diff can and cannot express

You need Python with numpy and nothing else; no GPU, no model, no download. The script freezes a random 64 × 64 matrix W, attaches an adapter of rank 4 with A random and B zero, and trains A and B alone by gradient descent so that W + B·A approaches W + T. It does this for two targets T: one that is a single outer product, so it has rank 1, and one that is fully random. Real training never sees a target update; the gradient arrives through the task loss. The exercise removes that layer on purpose so that one question is left: what can a product of rank r express?

```python
import numpy as np

rng = np.random.default_rng(0)
d, r, steps, lr = 64, 4, 3000, 1e-3

W = rng.standard_normal((d, d))          # the frozen base weight; never updated
u, v = rng.standard_normal(d), rng.standard_normal(d)
targets = {
    "rank-1 target": np.outer(u, v),      # one column times one row
    "random target": rng.standard_normal((d, d)),
}

for name, T in targets.items():
    A = 0.1 * rng.standard_normal((r, d))  # random start, as in the paper
    B = np.zeros((d, r))                   # zero start: B @ A == 0, so training begins at W
    assert np.all(W + B @ A == W)
    for _ in range(steps):
        R = (W + B @ A) - (W + T)          # how far the adapted weight is from the target weight
        gB, gA = 2 * R @ A.T, 2 * B.T @ R  # gradients of sum(R**2), both taken from the same R
        B -= lr * gB
        A -= lr * gA
    S = np.linalg.svd(T, compute_uv=False) # singular values, largest first
    best = (S[r:] ** 2).sum() / (S ** 2).sum()  # what the best rank-r matrix would leave
    remaining = (R ** 2).sum() / (T ** 2).sum()
    print(f"{name}: left unexplained after {steps} steps = {remaining:.3f}; best any rank-{r} matrix can do = {best:.3f}")
```

**Expected result.** This script was run with numpy 2.5.3 and seed 0 (the output is in the essay's corpus). The rank-1 target is fitted to 0.000 remaining: a rank-4 adapter contains a rank-1 change with room to spare. The random target stalls at 0.780 remaining, and no extra steps move it. The last two lines of the loop say why. The squared singular values of T add up to its total squared size, and the best rank-r matrix keeps the r largest, so the fraction any rank-4 matrix must leave behind is the sum of the squared singular values from the fifth onward over the sum of all of them. For this random matrix that is 0.780, the same number gradient descent reached. The adapter found the ceiling, and the ceiling is r.

Two things to try once that matches. First, confirm the assertion before the loop is doing real work by changing B's start to random and checking that W + B·A no longer equals W at step zero. Second, raise r to 8 and 16 for the random target and record the remaining fraction each time. It falls, and each doubling of r doubles the adapter's 2 × 64 × r numbers, which is the trade the rest of the essay was about.

*Sources: the LLM Engineering course (Ed Donner, Udemy), lectures 7.2 to 7.6, 7.11, 7.12 and 7.20, paraphrased as study material; Sebastian Raschka, Machine Learning Q and AI, Leanpub edition of 2023-05-21, pp. 141–142; Hu et al., LoRA: Low-Rank Adaptation of Large Language Models, arXiv:2106.09685, §4.1 and §4.2.*
