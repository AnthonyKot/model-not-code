# Fine-Tuning Without Touching the Weights

You have a model whose behaviour you need to change on your task, and it has about three billion weights. A full fine-tune updates every one of them, which means every one needs its value, its gradient and whatever the optimiser keeps per weight, all resident on the GPU at once. A Llama 3.2 base of that size takes about 13 GB of GPU memory just to hold at 32-bit precision, before training starts. The card you actually have is the free one in a notebook. The full fine-tune does not fit, and it would not fit with twice the card either.

The way out is not to make the model smaller. It is to stop treating the model as the thing you edit. You leave every weight where it is and train a separate, much smaller object that is added to the model's output. That object is a diff, and this essay is about why a diff of a particular shape is so much cheaper than the weights it changes.

## A weight update is a matrix, and a matrix can be factored

Take one weight matrix inside the model, call it W, with d<sub>in</sub> columns and d<sub>out</sub> rows. During a full fine-tune W becomes W + ΔW, where ΔW has exactly the same shape as W. That is where the cost comes from: the update has as many entries as the weight.

Low-rank adaptation, LoRA, replaces ΔW with a product of two thin matrices. A has r rows and d<sub>in</sub> columns; B has d<sub>out</sub> rows and r columns. Their product B·A has the shape of W, so it can be added to W, but its entries are not free: they are generated from (d<sub>in</sub> + d<sub>out</sub>) × r numbers rather than d<sub>in</sub> × d<sub>out</sub>. The number r is the adapter's rank, and it is chosen by you. The usual starting values are 8, 16 and 32.

Here is the whole mechanism as a forward pass. For an input vector x:

<p class="formula">h = W·x + s · B·(A·x)</p>

Read it term by term. x is the layer's input, a vector of d<sub>in</sub> numbers. W·x is what the layer computed before any fine-tuning: the frozen weights applied to the input, giving d<sub>out</sub> numbers. A·x squeezes the same input down to r numbers, and B·(A·x) stretches those r numbers back out to d<sub>out</sub>, so the second term has the same shape as the first and can be added to it. s is a fixed scale, discussed below. h is the layer's output, the base model's answer plus a correction that passes through an r-wide bottleneck.

<figure class="diagram">
<svg viewBox="0 0 640 230" width="100%" role="img" aria-label="Shapes of W, A and B: W is a square d_out by d_in; A is a short wide strip r by d_in; B is a tall narrow strip d_out by r; the product B·A has the shape of W" style="max-width:640px;font-family:inherit;font-size:14px">
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="20" y="40" width="150" height="150"/>
    <rect x="250" y="40" width="40" height="150"/>
    <rect x="330" y="40" width="150" height="30"/>
    <rect x="20" y="40" width="150" height="150" stroke-dasharray="4 3" transform="translate(470 0)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="95" y="120">W</text><text x="95" y="212" font-size="12">d<tspan baseline-shift="sub" font-size="9">in</tspan> wide, d<tspan baseline-shift="sub" font-size="9">out</tspan> tall</text>
    <text x="95" y="28" font-size="12">frozen, d<tspan baseline-shift="sub" font-size="9">in</tspan> × d<tspan baseline-shift="sub" font-size="9">out</tspan> entries</text>
    <text x="270" y="120">B</text><text x="270" y="212" font-size="12">r wide</text>
    <text x="405" y="60">A</text><text x="405" y="92" font-size="12">r tall, d<tspan baseline-shift="sub" font-size="9">in</tspan> wide</text>
    <text x="565" y="120">B·A</text><text x="565" y="212" font-size="12">same shape as W</text>
    <text x="565" y="28" font-size="12">never stored</text>
    <text x="210" y="120" font-size="20">+</text><text x="310" y="120" font-size="16">·</text><text x="500" y="120" font-size="20">=</text>
  </g>
</svg>
<figcaption>The frozen weight W and the two adapter matrices. B·A has W's shape but is generated from (d<sub>in</sub> + d<sub>out</sub>) × r numbers, and the forward pass never builds it: A·x is computed first, r numbers, then B stretches them back out.</figcaption>
</figure>

Four things follow from that one line.

**Only A and B receive gradients.** W is marked frozen, so the backward pass computes how the loss changes with A and with B and never allocates a gradient for W. The optimiser state, which for the Adam family is a running record per trainable parameter, is kept only for A and B too. The memory that scales with what you train, the gradients and the optimiser state, is now proportional to the diff rather than to the model. The frozen base still has to be resident, and the activations saved for the backward pass still grow with batch size and sequence length. LoRA removes the first cost and leaves the other two where they were.

**Training starts exactly at the base model.** The LoRA paper initialises A with random Gaussian entries and B with zeros, so B·A is the zero matrix at the first step and the first forward pass is the untouched model. Nothing about the base's behaviour changes until a non-zero gradient has moved B.

**The scale s is set by a second hyperparameter, alpha.** Every LoRA configuration carries two numbers: r, the rank you have just met, and alpha. Alpha does not appear in the formula as itself. The scale that multiplies the correction is alpha divided by r, so the same alpha means a smaller scale at a larger rank. The reason for the division is that B·(A·x) is a sum of r terms, one per column of B, and would tend to grow as r grows; dividing by r keeps the correction's size roughly independent of the rank, so that a learning rate tuned at one r still works at another. Two consequences are worth keeping in mind when you copy settings from somewhere else. With alpha = 16, an adapter of rank 8 is applied at scale 16/8 = 2, and the same adapter at rank 64 at scale 16/64 = 0.25, an eightfold difference from one changed number. And the common rule of thumb alpha = 2r keeps the scale at exactly 2 whatever r you pick: 64/32 and 512/256 both give 2. Descriptions that call alpha "a multiplier" are shorthand for all of this.

**The diff has rank at most r.** Write B·A out and it is the sum of r outer products: the first column of B times the first row of A, plus the second column times the second row, and so on. Each outer product is a rank-1 matrix, so their sum can express at most r independent directions of change. This is the bet LoRA makes: that the change your task needs is closer to a few directions than to an arbitrary matrix.

## Worked example: a diff of rank 1 you can write out, then the real sizes

The numbers below are the book's own and the models are invented.

Start small enough to write every entry. Take a layer with four inputs and four outputs, so W is 4 × 4 with 16 frozen entries, and attach an adapter of rank r = 1. A is then 1 × 4 and B is 4 × 1. Give them values:

<p class="formula">A = [1, 0, −1, 2],&nbsp;&nbsp;&nbsp; B = [1, 2, 0, 1]<sup>T</sup></p>

That is eight trainable numbers. Multiplying them gives the diff B·A, a 4 × 4 matrix whose row i is B<sub>i</sub> times the row A:

| Row of B·A | = B<sub>i</sub> × A | Entries |
|---|---|---|
| 1 | 1 × [1, 0, −1, 2] | 1, 0, −1, 2 |
| 2 | 2 × [1, 0, −1, 2] | 2, 0, −2, 4 |
| 3 | 0 × [1, 0, −1, 2] | 0, 0, 0, 0 |
| 4 | 1 × [1, 0, −1, 2] | 1, 0, −1, 2 |

Sixteen entries, produced from eight numbers, and every row is a multiple of the same row A. That is what "rank 1" means in practice: the diff can scale one pattern up or down per output, and nothing else. A rank-2 adapter would add a second row pattern with its own column of multipliers, and so on up to r.

Now run an input through it, to see the order of operations in the formula. Take x = (1, 1, 1, 1). A·x is one number: 1 + 0 − 1 + 2 = 2. B·(A·x) is B scaled by that number: (2, 4, 0, 2). Check it against the long way round, (B·A)·x, which sums each row of the table above: 2, 4, 0, 2. The same answer, but the short way never built the 4 × 4 matrix; it passed the input through a single number in the middle. That bottleneck is the adapter. The layer's output is then W·x, whatever the frozen weights give, plus s times (2, 4, 0, 2).

Now the real sizes, with the same arithmetic. Suppose one attention projection maps 512 inputs to 512 outputs and you attach an adapter of rank 8.

| Matrix | Shape | Entries | Trained? |
|---|---|---|---|
| W | 512 × 512 | 262,144 | no, frozen |
| A | 8 × 512 | 4,096 | yes |
| B | 512 × 8 | 4,096 | yes |
| B·A | 512 × 512 | 262,144 | never stored; produced from A and B |

The adapter trains 8,192 numbers and can produce a 262,144-entry change: 8,192 / 262,144 = 3.125% of the entries it stands in for. The general count is (d<sub>in</sub> + d<sub>out</sub>) × r against d<sub>in</sub> × d<sub>out</sub>, and the saving grows with the layer's width because the first is linear in the width and the second is quadratic.

Scale up once more to a small model with twelve layers, each with four such projections: 48 matrices. The frozen weights in those projections are 48 × 262,144 = 12,582,912. The adapters are 48 × 8,192 = 393,216. Stored at four bytes each, the adapter file is 393,216 × 4 = 1,572,864 bytes, about 1.57 MB, and it is shipped as its own file. Merge it into W when you want a single artefact for serving, or keep it beside the base and swap it for another task's adapter. Either way the base model is never patched in place.

## Checking the formula on a real model

Now a real model: Llama 3.2 with about three billion weights, 28 decoder layers and an inner width of 3072. A common adapter configuration puts rank-32 adapters on the four attention projections of every layer, called q, k, v and o, and the adapter file that results is 73.4 MB on disk. Does the formula give that?

Two of the projections keep the full width; the other two, k and v, are narrower on the output side, at 1024. Per layer:

| Projection | Shape | d<sub>in</sub> + d<sub>out</sub> | × r = 32 |
|---|---|---|---|
| q | 3072 → 3072 | 6,144 | 196,608 |
| o | 3072 → 3072 | 6,144 | 196,608 |
| k | 3072 → 1024 | 4,096 | 131,072 |
| v | 3072 → 1024 | 4,096 | 131,072 |
| **per layer** | | | **655,360** |

Over 28 layers that is 655,360 × 28 = 18,350,080 parameters, and at four bytes each, 73,400,320 bytes: 73.4 MB, the file size. (If the narrow width were a round 1,000 instead of 1024 the total would be 73.2 MB, so the file size itself pins the width; it is one of the few things about a model you can check from the outside.)

A heavier configuration on the same model, rank 256 with the three MLP matrices added as targets, gives a 1.56 GB adapter. The MLP matrices widen 3072 out to 8192 and back. Same table, more rows:

| Target | Shape | d<sub>in</sub> + d<sub>out</sub> | × r = 256 |
|---|---|---|---|
| q, o (two) | 3072 → 3072 | 6,144 each | 1,572,864 each |
| k, v (two) | 3072 → 1024 | 4,096 each | 1,048,576 each |
| gate, up (two) | 3072 → 8192 | 11,264 each | 2,883,584 each |
| down | 8192 → 3072 | 11,264 | 2,883,584 |
| **per layer** | | | **13,893,632** |
| × 28 layers | | | 389,021,696 |
| × 4 bytes | | | 1,556,086,784 ≈ 1.56 GB |

Both files come out of one rule: for each target matrix, add its two widths and multiply by r; sum over the targets in a layer; multiply by the number of layers; multiply by four bytes. That is the whole cost model for an adapter, and you can run it on any configuration you are handed before you train anything.

## What the rank cannot do

Rank is a ceiling, not a promise. If the change your task needs is spread across more independent directions than r, the adapter fits what it can and leaves the rest, and no number of training steps recovers it. Raising r raises the ceiling and the file size together, which is the trade behind the two configurations above: the heavier one was chosen when the training set grew from 20,000 rows to 800,000. There is no formula for the right r; target modules, r and alpha are found by trial against your evaluation metric.

A diff of rank r is not a full fine-tune with fewer parameters. It is a different function class. Two runs with different r or different alpha are two different experiments, and the alpha convention above means a setting copied from one codebase may not mean the same thing in another.

Finally, LoRA is only half of QLoRA. The other half, holding the frozen base in four-bit precision while the adapters stay in full precision, is why a 2.2 GB base plus a 73 MB adapter fits on the free card. How those four bits are chosen is the subject of a separate essay in Part IV. What matters here is that the quantisation is applied to the base and never to the diff.

<!--mission-->
## Exercise: the same mechanism in PyTorch

This is what a LoRA layer is in real code, stripped of the library that usually hides it. It runs on a CPU in seconds; PyTorch is the only dependency.

```python
import torch
import torch.nn as nn

torch.manual_seed(0)
d_in, d_out, r, alpha = 64, 64, 4, 8


class LoRALinear(nn.Module):
    """A frozen nn.Linear with a trainable low-rank diff beside it."""

    def __init__(self, base: nn.Linear, r: int, alpha: float):
        super().__init__()
        self.base = base
        for p in self.base.parameters():
            p.requires_grad = False                                   # freeze W (and its bias)
        self.A = nn.Parameter(0.01 * torch.randn(r, base.in_features))  # r x d_in, random start
        self.B = nn.Parameter(torch.zeros(base.out_features, r))        # d_out x r, zero start
        self.scale = alpha / r

    def forward(self, x):
        return self.base(x) + self.scale * (x @ self.A.T @ self.B.T)  # W·x + s · B·(A·x)

    def merge(self):
        with torch.no_grad():
            self.base.weight += self.scale * (self.B @ self.A)        # fold the diff into W
        return self.base


base = nn.Linear(d_in, d_out)
layer = LoRALinear(base, r, alpha)

trainable = sum(p.numel() for p in layer.parameters() if p.requires_grad)
frozen = sum(p.numel() for p in layer.parameters() if not p.requires_grad)
print(f"trainable {trainable}, frozen {frozen}")

# The behaviour we want: the base layer plus a rank-1 change. The adapter has to learn the change.
u, v = torch.randn(d_out, 1), torch.randn(1, d_in)
with torch.no_grad():
    W_target = base.weight + u @ v
target = nn.Linear(d_in, d_out)
with torch.no_grad():
    target.weight.copy_(W_target)
    target.bias.copy_(base.bias)

opt = torch.optim.Adam([p for p in layer.parameters() if p.requires_grad], lr=1e-2)
for step in range(1, 501):
    x = torch.randn(32, d_in)
    loss = ((layer(x) - target(x)) ** 2).mean()
    opt.zero_grad()
    loss.backward()
    opt.step()
    if step in (1, 10, 100, 500):
        print(f"step {step:3d}: loss {loss.item():.4f}   W.grad is None: {base.weight.grad is None}")

adapter = {k: v for k, v in layer.state_dict().items() if not k.startswith("base.")}
print("adapter file holds:", {k: tuple(v.shape) for k, v in adapter.items()},
      "=", sum(v.numel() for v in adapter.values()) * 4, "bytes")

x = torch.randn(8, d_in)
with torch.no_grad():
    before = layer(x)
    merged = layer.merge()
    print(f"max difference between adapter and merged outputs: {(merged(x) - before).abs().max().item():.2e}")
```

What each part does:

- **`for p in self.base.parameters(): p.requires_grad = False`** is the freeze. Autograd will still run through the base layer, because the adapter's gradient needs the layer's input, but it will not allocate or store a gradient for W or its bias. The printout confirms it on every step: `W.grad is None: True`.
- **`self.A` and `self.B`** are the two adapter matrices, with the starting values the mechanism requires: A small and random, B all zeros, so that B·A is zero and the first forward pass is the untouched layer.
- **`self.scale = alpha / r`** is the scale s from the formula, computed once from the two hyperparameters.
- **`forward`** is the formula line for line: the base layer's output plus s times the input pushed through A and then B. The order of the matrix products matters for cost: `x @ self.A.T` produces r numbers per row of x before `@ self.B.T` stretches them back out, so the d<sub>out</sub> × d<sub>in</sub> diff is never built.
- **The parameter count** prints as 512 trainable against 4,160 frozen: (64 + 64) × 4 for the adapter, 64 × 64 + 64 for the base weight and bias. That is the (d<sub>in</sub> + d<sub>out</sub>) × r rule on a layer small enough to check.
- **The optimiser** is handed only the parameters with `requires_grad` set, so its running state, the memory that a full fine-tune pays for every weight, exists for the 512 adapter numbers and nothing else.
- **The training loop** is an ordinary loop. The target here is the base layer plus a rank-1 change, built on purpose so that a rank-4 adapter can represent it exactly; the loss falls from about 70 to 0.0000 by step 500. Replace the target with an arbitrary matrix and the loss flattens above zero at whatever a rank-4 diff can reach, which is the ceiling the essay described.
- **The adapter file** is the state dict with the base's entries removed: two tensors, shapes (4, 64) and (64, 4), 2,048 bytes at four bytes a number. This is the object that a fine-tuning run saves and a serving system loads beside the base.
- **`merge`** folds the diff into W with one in-place addition, s·B·A, for serving without the extra matrix products; the maximum difference between the merged layer's output and the adapter's is about 10<sup>−5</sup>, floating-point noise. Merging is one-way: keep the adapter file if you want to remove the change later.

**Expected result.** Run with PyTorch 2.14 on a CPU, seed 0; the full output is in the essay's corpus. Trainable 512, frozen 4,160; `W.grad is None: True` on every printed step; the loss reaches 0.0000 by step 500; the adapter holds A (4, 64) and B (64, 4), 2,048 bytes; the merged and unmerged outputs differ by less than 10<sup>−5</sup>.

In a training library the same three moves, freeze, attach, train the attachment, are one configuration object. With the Hugging Face PEFT library, the configuration for the rank-32 attention-only setup from the tables above is:

```python
# illustrative, not executed; API as of the course's library versions
from peft import LoraConfig, get_peft_model

config = LoraConfig(r=32, lora_alpha=64, lora_dropout=0.1,
                    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"])
model = get_peft_model(base_model, config)
model.print_trainable_parameters()
```

Every field maps onto something in the snippet above: `r` and `lora_alpha` set the shapes and the scale, `target_modules` names which linear layers get wrapped, and `lora_dropout` drops a fraction of the adapter's input during training. The number `print_trainable_parameters` reports for that configuration is the 18,350,080 the essay computed.

*Sources: the LLM Engineering course (Ed Donner, Udemy), lectures 7.2 to 7.6, 7.11, 7.12 and 7.20, paraphrased as study material; Sebastian Raschka, Machine Learning Q and AI, Leanpub edition of 2023-05-21, pp. 141–142; Hu et al., LoRA: Low-Rank Adaptation of Large Language Models, arXiv:2106.09685, §4.1 and §4.2.*
