# Reuse a Pretrained Model

Chapter 2's classifier learned its categories from 10,000 labelled photos. A new supplier now brings a garden range, photographed under different lighting, and the shop has a few hundred labelled photos of it. Chapter 1's answer writer has a new job too: the shop wants answers in its own format, `kettle : boils water fast : in stock`, and the writer produces ordinary sentences.

Neither job is worth training from zero. Both start from a model somebody else trained on far more data, and both come down to deciding which of its numbers you let change. For the photo classifier the answer is a sequence: freeze the pretrained part, train a new output layer, then let the pretrained part move slowly. That sequence has a trap, a kind of state that the freeze does not freeze. For the language model the weights are too many to let move at all, and the answer is to leave them untouched and train a small diff beside chapter 1's attention matrices.

As in the earlier chapters, the examples are synthetic and small enough to recompute. The exercise runs both halves on a CPU in about six seconds.

## What a pretrained backbone gives you

A pretrained image network splits into two parts. The **backbone** runs from the input to the last pooled feature vector: one list of numbers per photo, computed by layers that have learned edges, textures and shapes on a large photo collection. The **head** is the small layer on top that turns that vector into scores for the original task's classes. Its classes are not the shop's, so the head is replaced by one sized for the shop's categories, and the backbone is kept.

In code you meet it as a download and one assignment. With torchvision it looks like this:

```python
# illustrative, not executed (torchvision is not installed here); API as of the time of writing
from torchvision.models import resnet50, ResNet50_Weights
model = resnet50(weights=ResNet50_Weights.DEFAULT)          # the backbone and its original head
model.fc = nn.Linear(model.fc.in_features, n_garden_categories)  # replace the head
```

The payoff is largest when labels are scarce. On a 320-image subset of a three-class photo task, a small network trained from scratch stayed below 50% validation accuracy, while a pretrained backbone with a new head reached 71.3%. The backbone arrives with a score on a public benchmark as well, and chapter 2 already said what that is: evidence about someone else's test set. The number that decides is measured on the shop's garden photos, split by product.

## Stage one: freeze the backbone, train a new head

The new head starts with random weights, so its first predictions are poor, the loss is large, and so are the gradients. Those gradients flow back through the backbone, and a few large steps can undo weights that took a long pretraining run to reach. So the first stage **freezes** the backbone:

```python
for p in backbone.parameters():
    p.requires_grad = False                      # autograd computes no gradient for these
opt = torch.optim.Adam(head.parameters(), lr=1e-2)   # the optimiser only ever sees the head
```

With `requires_grad = False`, the backward pass computes no gradient for the backbone's weights and the optimiser has nothing to apply to them. Only the head learns.

When the backbone stays frozen and the training photos are not augmented afresh on each pass, there is a cheaper way to do the same thing: run every photo through the backbone once, store the feature vectors, and train the head on the stored vectors. Each epoch then costs one small layer instead of the whole network, and the frozen part cannot change, because it no longer runs during training at all. The next section is about why that last property matters.

## The state that `requires_grad` does not freeze

Most image backbones contain **batch normalisation** layers, BatchNorm for short. For one feature, over a batch of m values x<sub>1</sub> … x<sub>m</sub>, the layer computes:

<p class="formula">x̂<sub>i</sub> = (x<sub>i</sub> − μ<sub>B</sub>) / √(σ<sub>B</sub><sup>2</sup> + ε),&nbsp;&nbsp;&nbsp; z<sub>i</sub> = γ · x̂<sub>i</sub> + β</p>

μ<sub>B</sub> is the mean of the batch's m values and σ<sub>B</sub><sup>2</sup> their variance, so x̂<sub>i</sub> says how many standard deviations the value sits from the batch mean. ε is a tiny constant, 10<sup>−5</sup> by default, that keeps the division safe. γ and β are a learned scale and shift, one pair per feature; z<sub>i</sub> is the output. γ and β are **parameters**: they change only when an optimiser applies a gradient, and `requires_grad = False` stops them.

A photo classified alone has no batch to take a mean over, and a prediction should not depend on what else happens to be in the batch. So the layer also keeps a running estimate of the mean and variance, used instead of μ<sub>B</sub> and σ<sub>B</sub><sup>2</sup> when the model is in evaluation mode. PyTorch updates the estimate on every forward pass in training mode, using the batch's unbiased variance, m/(m − 1) times the one it normalises with:

<p class="formula">μ̂ ← (1 − momentum) · μ̂ + momentum · μ<sub>B</sub>,&nbsp;&nbsp;&nbsp; σ̂<sup>2</sup> ← (1 − momentum) · σ̂<sup>2</sup> + momentum · σ<sub>B</sub><sup>2</sup></p>

μ̂ is the stored `running_mean` and σ̂<sup>2</sup> the stored `running_var`. The momentum, 0.1 by default, is the share given to the newest batch: each pass keeps 90% of the old estimate. It has nothing to do with an optimiser's momentum. The running statistics are **buffers**, not parameters. They are saved in the checkpoint with the weights, they are changed by the forward pass, and nothing in their update reads `requires_grad`.

Follow one feature through stage one, with γ = 1 and β = 0 so the output is the normalised value itself. The checkpoint left its running mean at 0 and running variance at 1. Garden photos from the new supplier give that feature a mean of 1.0 and a standard deviation of 0.6; take every batch's contribution to the buffers as exactly that mean and a variance of 0.36. Training the head in training mode runs a batch through the frozen backbone at every step, and each run moves the buffers. Here is what the layer then does, in evaluation mode, to one fixed input value of 1.6, computed as (1.6 − running mean) / √(running variance), leaving out ε, which changes none of the three decimals shown:

| Batches seen | Running mean | Running variance | Output for 1.6 |
|---|---|---|---|
| 0 (checkpoint) | 0 | 1 | 1.600 |
| 1 | 0.1 | 0.936 | 1.550 |
| 2 | 0.19 | 0.878 | 1.504 |
| 10 | 0.651 | 0.583 | 1.242 |
| 20 | 0.878 | 0.438 | 1.091 |
| 50 | 0.995 | 0.363 | 1.004 |

After n batches the mean is 1 − 0.9<sup>n</sup> and the variance 0.36 + 0.64 × 0.9<sup>n</sup>, and the output approaches (1.6 − 1.0) / 0.6 = 1.0. Same input, same weights, a different output, and every layer above receives the new number. A frozen backbone has become a different function under an unchanged weights file.

There are three ways to "freeze", and only one freezes everything:

- **A. `requires_grad = False` alone** stops γ, β and every weight. The buffers keep moving, as in the table.
- **B. BatchNorm layers in `eval()` as well** stops the buffers and normalises with the checkpoint's statistics, so the backbone computes exactly what it did when you downloaded it. The trap is that `model.train()` switches every submodule back to training mode, and training loops call it every epoch, so the BatchNorm layers must be put back into `eval()` after each call.
- **C. `momentum = 0` in training mode** stops the buffers too, but the layer still normalises each training batch with that batch's own statistics. The head learns on features computed one way and is evaluated on features computed another.

In the exercise, all three report that no weight moved. Under A the old head, which reads the same backbone, falls from 0.981 to 0.952 accuracy on the original task, and the new head reaches 0.765 on the garden photos. Under B the old head stays at 0.981 and the new head reaches 0.824. Under C the new head reaches 0.639. Keras couples the two ideas: `trainable = False` on its BatchNormalization layer also switches it to inference mode. PyTorch keeps them separate, which is why the trap is a PyTorch trap.

Whether the statistics *should* follow the new photos is a question with an answer only on your data. Re-estimated statistics are a form of adaptation, and on some datasets they help the new task. In this run they did not, and they cost the old task three points. What the buffers cannot be is an accident: if another head reads the same backbone, or a cached feature file was computed from it, a drifted backbone quietly breaks both.

## Stage two: thaw with a smaller learning rate

Once the head is trained, the backbone can move too, slowly. The **learning rate** is the step size of every update, so a smaller rate for the backbone lets it adjust to garden photos without overwriting what it computes. PyTorch expresses two rates with **parameter groups**, a list of dictionaries in place of one parameter list:

```python
for p in backbone.parameters():
    p.requires_grad = True
opt = torch.optim.Adam([
    {"params": head.parameters(),     "lr": 1e-2},
    {"params": backbone.parameters(), "lr": 1e-3},   # a tenth of the head's rate
])
```

A factor of 10 is a common starting point. How much it matters is easy to underestimate: on one small photo task, thawing at the unchanged learning rate dropped validation accuracy to 33%, and dividing the rate by 100 instead raised it to 72.2%. The exercise keeps the BatchNorm layers in `eval()` through the thaw as well, the usual default: fine-tuning batches are small, and their statistics are a noisy estimate of what the checkpoint measured on far more photos. Re-estimating them on the new photos is a separate candidate, to compare on validation for both tasks rather than let `model.train()` choose by accident.

In the exercise the thaw lifts the garden head from 0.824 to 0.980. The backbone's weights now move, by up to 0.215, and the old head's accuracy falls from 0.981 to 0.932, because it reads a backbone that is no longer the one it was trained on. Thawing at the head's own rate instead lands at 0.942 on garden photos and 0.882 on the old task: faster steps, worse on both. If the shop's existing categories and the garden range share one backbone, thawing for one changes the other, and both belong in the evaluation.

## The same problem at a language model's size

The answer writer is a language model with about three billion weights. Holding it on an accelerator at 32 bits takes about 13 GB before training starts. A full fine-tune, where every weight moves, needs more than the weights:

| What sits in memory per weight | Bytes | For 3 billion weights |
|---|---|---|
| The weight itself, 32-bit | 4 | 12 GB |
| Its gradient | 4 | 12 GB |
| Adam's running average of gradients | 4 | 12 GB |
| Adam's running average of squared gradients | 4 | 12 GB |
| Total, before activations | 16 | 48 GB |

Adam keeps two running averages for every parameter it updates, which is why it doubles the memory a plain gradient step would need. The activations saved for the backward pass come on top, and they grow with batch size and sequence length. Freezing the backbone and training a head does not help here: the behaviour the shop wants to change, the format of the answer, is produced by the whole stack, not by the last layer.

The way out is to keep every weight frozen, as in stage one, and train something much smaller that is added to what the frozen layers compute.

## LoRA: a low-rank diff beside the attention matrices

Take one weight matrix W inside the model, with d<sub>in</sub> inputs and d<sub>out</sub> outputs. A full fine-tune turns it into W + ΔW, and ΔW has as many entries as W. **Low-rank adaptation**, LoRA, writes the change as the product of two thin matrices instead: A with r rows and d<sub>in</sub> columns, B with d<sub>out</sub> rows and r columns. For an input x the layer computes:

<p class="formula">h = W·x + (α / r) · B·(A·x)</p>

x is the layer's input, d<sub>in</sub> numbers. W·x is what the frozen layer computed all along. A·x squeezes the input down to r numbers, and B stretches them back to d<sub>out</sub>, so the second term has the shape of the first and can be added to it. r is the adapter's **rank**, chosen by you; 8, 16 and 32 are common starting values. α is a second setting, and α/r is the fixed scale on the correction. h is the output: the pretrained answer plus a correction that passes through an r-wide bottleneck.

<figure class="diagram">
<svg viewBox="0 0 620 230" width="100%" role="img" aria-label="Two paths from input x to output h. Upper path: x passes through the frozen square matrix W. Lower path: x passes through A, a short wide matrix, to r numbers, then through B, a tall narrow matrix, back to full width, scaled by alpha over r. The two paths are added." style="max-width:620px;font-family:inherit;font-size:13px">
  <defs><marker id="rpm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
  <g fill="none" stroke="currentColor" stroke-width="1.3">
    <rect x="20" y="60" width="18" height="110" rx="3"/>
    <rect x="160" y="20" width="110" height="110" rx="4" stroke-dasharray="5 3"/>
    <rect x="150" y="175" width="110" height="22" rx="3"/>
    <rect x="320" y="150" width="10" height="10" rx="2"/>
    <rect x="380" y="120" width="22" height="100" rx="3"/>
    <circle cx="500" cy="115" r="14"/>
    <rect x="570" y="60" width="18" height="110" rx="3"/>
  </g>
  <g stroke="currentColor" stroke-width="1.2" fill="none">
    <path d="M38,90 L158,75" marker-end="url(#rpm-arrow)"/>
    <path d="M270,75 L486,110" marker-end="url(#rpm-arrow)"/>
    <path d="M38,140 L148,186" marker-end="url(#rpm-arrow)"/>
    <path d="M260,186 L318,157" marker-end="url(#rpm-arrow)"/>
    <path d="M330,155 L378,168" marker-end="url(#rpm-arrow)"/>
    <path d="M402,160 L487,122" marker-end="url(#rpm-arrow)"/>
    <path d="M514,115 L568,115" marker-end="url(#rpm-arrow)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="29" y="50">x</text>
    <text x="215" y="72">W</text><text x="215" y="92" font-size="11">frozen, d<tspan baseline-shift="sub" font-size="8">out</tspan> × d<tspan baseline-shift="sub" font-size="8">in</tspan></text>
    <text x="205" y="215" font-size="11">A: r × d<tspan baseline-shift="sub" font-size="8">in</tspan>, trained</text>
    <text x="325" y="143" font-size="11">r numbers</text>
    <text x="391" y="112" font-size="11">B: d<tspan baseline-shift="sub" font-size="8">out</tspan> × r</text>
    <text x="462" y="160" font-size="11">× α / r</text>
    <text x="500" y="120">+</text>
    <text x="579" y="50">h</text>
  </g>
</svg>
<figcaption>The frozen path and the adapter path. W is used as downloaded; the correction squeezes x to r numbers through A and stretches them back through B, so B·A is never built.</figcaption>
</figure>

Which W? A real attention layer has four: chapter 1's three projections that compute queries, keys and values, and the output projection that maps the blended result back, usually named `q_proj`, `k_proj`, `v_proj` and `o_proj`. The usual first targets are those four in every layer; the feed-forward matrices can be added when attention alone is not enough, at the cost of a larger adapter.

**A worked diff of rank 1.** Take a 4 × 4 layer and r = 1, with A = [2, −1, 0, 1] and B = [1, 0, 3, −1]<sup>T</sup>. Eight trainable numbers produce a 4 × 4 diff whose row i is B<sub>i</sub> times the row A:

| Row of B·A | B<sub>i</sub> × A | Entries |
|---|---|---|
| 1 | 1 × [2, −1, 0, 1] | 2, −1, 0, 1 |
| 2 | 0 × [2, −1, 0, 1] | 0, 0, 0, 0 |
| 3 | 3 × [2, −1, 0, 1] | 6, −3, 0, 3 |
| 4 | −1 × [2, −1, 0, 1] | −2, 1, 0, −1 |

Every row is a multiple of one pattern, which is what rank 1 means: the diff can scale one direction of change up or down per output and nothing else. A rank-r diff is a sum of r such patterns. Now pass x = (1, 0, 2, 1) the way the formula does. A·x = 2 + 0 + 0 + 1 = 3, one number; B·(A·x) = 3 × B = (3, 0, 9, −3). The long way, multiplying x by each row of the table, gives the same (3, 0, 9, −3), but the short way never built the 4 × 4 matrix. That is why the diff is cheap to run as well as to store.

Four properties follow from the formula.

**Training starts at the pretrained model.** A starts small and random and B starts at zero, so B·A is zero at the first step and the first forward pass is the untouched model.

**Only A and B cost training memory.** The frozen W gets no gradient and no Adam state; the two running averages exist only for A and B. The frozen weights still have to be held, and the activations still grow with the batch. LoRA removes three of the four rows of the memory table for everything except the adapter.

**α/r separates the adapter's scale from its rank.** B·(A·x) is a sum of r terms, and dividing by r, with α held fixed, reduces how much the other settings, such as the learning rate, need retuning when r changes. It does not guarantee a correction of the same size at every rank, because A and B are learned. It is the same kind of fixed division as the √d<sub>k</sub> in chapter 1's attention, which stops scores from growing with the key width. It is not a temperature: τ and T make a softmax sharper or flatter, while α/r scales the adapter's path directly. Two consequences are worth checking before copying a configuration. With α = 16, rank 8 applies the correction at scale 2 and rank 64 at scale 0.25, eight times smaller from one changed number. The common starting rule α = 2r does something different: it keeps the scale at 2 whatever r is, a configuration to validate rather than a consequence of dividing by r. The scale is α/r in the original method; check that a codebase applies α the same way before copying a setting from it, or the copy is a different experiment.

**The diff is a separate file.** Count its size as (d<sub>in</sub> + d<sub>out</sub>) × r per target matrix, against d<sub>in</sub> × d<sub>out</sub> for the matrix itself. For Llama 3.2 with three billion weights, 28 layers, a width of 3072, and k and v projections that output 1024:

| Projection | Shape | (d<sub>in</sub> + d<sub>out</sub>) × 32 |
|---|---|---|
| q | 3072 → 3072 | 196,608 |
| o | 3072 → 3072 | 196,608 |
| k | 3072 → 1024 | 131,072 |
| v | 3072 → 1024 | 131,072 |
| Per layer | | 655,360 |
| × 28 layers, × 4 bytes | | 73,400,320 bytes |

The q projection alone has 9,437,184 entries; its rank-32 adapter has 196,608, about 2% of that. The whole adapter is 73.4 MB, and that is also the size of the file such a fine-tune saves. It ships beside the base: load it, unplug it, swap in another task's adapter, or merge it into W with one addition, W ← W + (α/r)·B·A, when serving should not pay for the extra matrix products. In the exercise, unplugging the adapter gives back the pretrained writer bit for bit, and merging changes outputs by 1.2 × 10<sup>−5</sup>, floating-point noise.

With the Hugging Face PEFT library, that configuration is one object:

```python
# illustrative, not executed; PEFT API as of the time of writing
from peft import LoraConfig, get_peft_model
config = LoraConfig(r=32, lora_alpha=64,
                    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"])
model = get_peft_model(base_model, config)    # wraps each named nn.Linear the way the exercise does
model.print_trainable_parameters()            # 18,350,080 for this model: 655,360 x 28
```

LoRA is half of what usually runs on a single small card. The other half, **QLoRA**, stores the frozen base's large linear layers, the attention projections among them, in four bits per weight, while layers such as the embedding table keep their original format. That brings the three-billion-weight base to about 2.2 GB, and the adapters stay at full precision, about 70 MB more. How four bits can stand in for 32 is part of chapter 7; what matters here is that only the frozen base is compressed, never the diff being trained.

## What the rank and the freeze cannot do

Rank is a ceiling. If the change the task needs spans more independent directions than r, the adapter fits what it can and stops. In the exercise the shop format's loss reaches 0.8303 at rank 1, 0.3883 at rank 4, and 0.1934 with a full fine-tune of every weight. Rank 1 writes `kettle : boils water in stock`, rank 4 writes the whole format. Raising r raises the ceiling and the file size together, and target modules, r and α are chosen the way chapter 2 chose settings: by comparison on validation, with the test scored once.

The adapter does not protect the old behaviour while it is plugged in. With the rank-4 adapter attached, the writer's loss on its original sentences is 12.50, worse than the full fine-tune's 5.44: both runs were trained only on the new format, and nothing asked either to keep the old one. What LoRA guarantees is narrower and still valuable. The base weights are never edited, so removing the adapter restores the original model exactly, and one base can serve several tasks, each with its own few megabytes. If the old behaviour must survive in the same model, it has to be in the training data and in the evaluation.

## Choosing how much of the model to change

| Situation | Change | Why |
|---|---|---|
| Few labels, the pretrained features already separate your classes | A new head on a frozen backbone; precompute features if nothing is augmented | Cheapest; nothing pretrained can drift |
| More labels, and the model and its optimiser state fit in memory | Head first, then thaw with parameter groups at a smaller rate; BatchNorm in `eval()` unless re-estimating it wins on validation | The backbone adapts; the head's early gradients never reach it |
| The weights, gradients and optimiser state do not fit | LoRA on the attention projections; QLoRA if even the frozen base does not fit | Gradients and optimiser state scale with the adapter; the frozen weights and the activations still scale with the model |
| Several tasks share one base | One adapter per task | The base file stays unchanged; adapters are swapped or merged per deployment |

Every row ends in the same place as chapter 2: the old task and the new task measured on held-out products, with the choice made on validation and the test set scored once.

## What the synthetic run leaves out

The exercise shows the mechanics, not a release choice. A real photo project repeats chapter 2's split by product and compares head-only training, each BatchNorm policy and the thaw on validation, then scores the chosen pipeline once on test; cached features belong to the exact backbone weights and buffers that produced them. A real language-model project treats the target modules, rank, α, learning rate and training data as one versioned adapter configuration. It evaluates the new format and the old behaviour that must survive on held-out prompts, and it measures peak memory at the batch size and sequence length it will train with, because the activations are not in the adapter's budget.

<!--mission-->
## Exercise: freeze three ways, thaw, then fit a LoRA adapter

The script pretrains a small photo backbone with BatchNorm layers, adapts it to a shifted product line under each freeze and a thaw, then pretrains chapter 1's attention block as a tiny answer writer and adapts it to the shop's format with LoRA and with a full fine-tune. PyTorch on a CPU, about six seconds.

```python
import copy
import torch
import torch.nn as nn
import torch.nn.functional as F

# ---------- Part 1: a pretrained photo backbone, a new product line ----------
def catalogue_photos(n):                     # the photos the backbone was pretrained on
    x = torch.randn(n, 6)
    return x, (x[:, 0] - x[:, 2] > 0).long()

def new_supplier_photos(n):                  # a new product line, shot under different lighting
    x = 1.0 + 0.6 * torch.randn(n, 6)
    return x, (x[:, 1] + x[:, 3] > 2.0).long()

torch.manual_seed(0)
backbone = nn.Sequential(nn.Linear(6, 16), nn.BatchNorm1d(16), nn.ReLU(),
                         nn.Linear(16, 16), nn.BatchNorm1d(16), nn.ReLU())
old_head = nn.Linear(16, 2)
opt = torch.optim.Adam([*backbone.parameters(), *old_head.parameters()], lr=1e-2)
for _ in range(300):                         # stands in for the downloaded checkpoint
    x, y = catalogue_photos(64)
    opt.zero_grad(); F.cross_entropy(old_head(backbone(x)), y).backward(); opt.step()
checkpoint = copy.deepcopy(backbone.state_dict())   # weights and BatchNorm buffers together
batchnorms = [m for m in backbone if isinstance(m, nn.BatchNorm1d)]
old_val, new_val = catalogue_photos(1000), new_supplier_photos(1000)

def accuracy(head, data):
    backbone.eval()
    with torch.no_grad():
        return (head(backbone(data[0])).argmax(1) == data[1]).float().mean().item()

def weights_moved():
    now = backbone.state_dict()
    return max((now[k] - checkpoint[k]).abs().max().item() for k in now if k.endswith(("weight", "bias")))

def train_head(bn_eval, momentum=0.1, steps=200):
    backbone.load_state_dict(checkpoint)
    for p in backbone.parameters():
        p.requires_grad = False                          # the freeze
    for m in batchnorms:
        m.momentum = momentum
    torch.manual_seed(1)
    head = nn.Linear(16, 2)
    opt = torch.optim.Adam(head.parameters(), lr=1e-2)
    for _ in range(steps):
        backbone.train()                                 # what model.train() does every epoch
        if bn_eval:
            for m in batchnorms:
                m.eval()                                 # ...undone here for the BatchNorm layers
        x, y = new_supplier_photos(64)
        opt.zero_grad(); F.cross_entropy(head(backbone(x)), y).backward(); opt.step()
    return head

print("pretrained: old-task accuracy", round(accuracy(old_head, old_val), 3))
for label, bn_eval, momentum in [("A requires_grad=False only  ", False, 0.1),
                                 ("B + BatchNorm in eval()     ", True, 0.1),
                                 ("C + momentum=0, train mode  ", False, 0.0)]:
    head = train_head(bn_eval, momentum)
    print(f"{label} weights moved {weights_moved():.1e}  running_mean[0] {batchnorms[0].running_mean[0].item():+.3f}"
          f"  old task {accuracy(old_head, old_val):.3f}  new task {accuracy(head, new_val):.3f}")

head = train_head(bn_eval=True)                          # stage 1 as in B, then thaw
for p in backbone.parameters():
    p.requires_grad = True
opt = torch.optim.Adam([{"params": head.parameters(), "lr": 1e-2},
                        {"params": backbone.parameters(), "lr": 1e-3}])   # parameter groups
for _ in range(300):
    backbone.train()
    for m in batchnorms:
        m.eval()
    x, y = new_supplier_photos(64)
    opt.zero_grad(); F.cross_entropy(head(backbone(x)), y).backward(); opt.step()
print(f"thaw at 1/10 the head's rate: weights moved {weights_moved():.3f}  old task {accuracy(old_head, old_val):.3f}"
      f"  new task {accuracy(head, new_val):.3f}")

# ---------- Part 2: LoRA on the attention matrices of the shop's answer writer ----------
old_text = ["the steel kettle boils water fast", "the leather watch tells the time",
            "the canvas backpack carries school books", "the desk lamp lights the desk",
            "note : the kettle is in stock", "note : the watch ships today"]
shop_format = ["kettle : boils water fast : in stock", "watch : tells the time : ships today",
               "backpack : carries school books : in stock", "lamp : lights the desk : ships today"]
vocab = ["<pad>", "<s>", "</s>"] + sorted({w for t in old_text + shop_format for w in t.split()})
ids = {w: i for i, w in enumerate(vocab)}

def batch(texts):
    rows = [["<s>"] + t.split() + ["</s>"] for t in texts]
    width = max(len(r) for r in rows)
    return torch.tensor([[ids[w] for w in r] + [0] * (width - len(r)) for r in rows])

class Writer(nn.Module):
    """Chapter 1's block plus an output projection, named q, k, v, o."""
    def __init__(self, n_vocab, dim=32, max_len=12):
        super().__init__()
        self.tok, self.pos = nn.Embedding(n_vocab, dim), nn.Embedding(max_len, dim)
        self.q, self.k, self.v, self.o = (nn.Linear(dim, dim) for _ in range(4))
        self.head = nn.Linear(dim, n_vocab)
    def forward(self, x):
        h = self.tok(x) + self.pos(torch.arange(x.shape[1]))
        a = F.scaled_dot_product_attention(self.q(h), self.k(h), self.v(h), is_causal=True)
        return self.head(h + self.o(a))

class LoRALinear(nn.Module):
    """A frozen nn.Linear plus a trainable rank-r diff: W x + (alpha / r) B A x."""
    def __init__(self, base, r, alpha):
        super().__init__()
        self.base = base
        for p in base.parameters():
            p.requires_grad = False
        self.A = nn.Parameter(0.01 * torch.randn(r, base.in_features))   # r x d_in, small random
        self.B = nn.Parameter(torch.zeros(base.out_features, r))         # d_out x r, zeros
        self.scale = alpha / r
    def forward(self, x):
        return self.base(x) + self.scale * (x @ self.A.T @ self.B.T)

def loss_on(model, texts):
    x = batch(texts)
    logits = model(x[:, :-1])
    return F.cross_entropy(logits.reshape(-1, len(vocab)), x[:, 1:].reshape(-1), ignore_index=0).item()

def fit(model, params, texts, steps=300):
    opt = torch.optim.Adam(params, lr=1e-2)
    x = batch(texts)
    for _ in range(steps):
        logits = model(x[:, :-1])
        loss = F.cross_entropy(logits.reshape(-1, len(vocab)), x[:, 1:].reshape(-1), ignore_index=0)
        opt.zero_grad(); loss.backward(); opt.step()

def write(model, prompt):
    out = ["<s>"] + prompt.split()
    with torch.no_grad():
        for _ in range(8):
            out.append(vocab[int(model(torch.tensor([[ids[w] for w in out]]))[0, -1].argmax())])
            if out[-1] == "</s>":
                break
    return " ".join(out[1:])

torch.manual_seed(0)
writer = Writer(len(vocab))
fit(writer, writer.parameters(), old_text)              # stands in for the pretrained language model
pretrained = copy.deepcopy(writer.state_dict())
print(f"\npretrained writer: loss on its own text {loss_on(writer, old_text):.4f}, on the shop format {loss_on(writer, shop_format):.4f}")
print("  writes:", write(writer, "kettle :"))

for r in (1, 4):
    writer = Writer(len(vocab))
    writer.load_state_dict(pretrained)
    for p in writer.parameters():
        p.requires_grad = False
    torch.manual_seed(2)
    adapters = {name: LoRALinear(getattr(writer, name), r, alpha=2 * r) for name in "qkvo"}
    for name, lora in adapters.items():
        setattr(writer, name, lora)                      # wrap chapter 1's attention projections
    trainable = [p for p in writer.parameters() if p.requires_grad]
    fit(writer, trainable, shop_format)
    n_train = sum(p.numel() for p in trainable)
    n_frozen = sum(p.numel() for p in writer.parameters() if not p.requires_grad)
    print(f"LoRA r={r} on q,k,v,o: trainable {n_train}, frozen {n_frozen}, adapter {4 * n_train} bytes"
          f"  | shop-format loss {loss_on(writer, shop_format):.4f}, own-text loss {loss_on(writer, old_text):.4f}")
    print("  writes:", write(writer, "kettle :"), "|", write(writer, "backpack :"))

x = batch(shop_format)[:, :-1]
with torch.no_grad():
    with_adapter = writer(x)
for name, lora in adapters.items():
    setattr(writer, name, lora.base)                     # unplug the r=4 adapters
print(f"adapter unplugged: own-text loss {loss_on(writer, old_text):.4f}, base weights unchanged:",
      all(torch.equal(v, pretrained[k]) for k, v in writer.state_dict().items()))
with torch.no_grad():                                    # plug back in by merging: W <- W + (alpha / r) B A
    for name, lora in adapters.items():
        lora.base.weight += lora.scale * (lora.B @ lora.A)
    print(f"merged into W: largest output difference {(writer(x) - with_adapter).abs().max().item():.1e}")

writer = Writer(len(vocab))
writer.load_state_dict(pretrained)
torch.manual_seed(2)
fit(writer, writer.parameters(), shop_format)            # full fine-tune: every weight moves
print(f"full fine-tune: trainable {sum(p.numel() for p in writer.parameters())}"
      f"  | shop-format loss {loss_on(writer, shop_format):.4f}, own-text loss {loss_on(writer, old_text):.4f}")
```

What each part does in real fine-tuning code:

- **`catalogue_photos` and `new_supplier_photos`** stand in for pretraining data and the garden range: six features per photo, with the new supplier's features shifted to mean 1.0 and spread 0.6 and labelled by a different rule. The 300-step loop stands in for the checkpoint you would download, and `state_dict()` copies weights and BatchNorm buffers together, as a checkpoint file does.
- **`train_head`** is stage one. `requires_grad = False` is the freeze; the optimiser receives only the new head's parameters; `backbone.train()` at every step is what `model.train()` does at every epoch. `bn_eval=True` puts the BatchNorm layers back into `eval()` after it (freeze B), and `momentum=0.0` gives freeze C.
- **`weights_moved`** compares only weights and biases with the checkpoint, so its zero under every freeze shows that the accuracy changes come from the buffers.
- **The thaw** reopens the backbone with `requires_grad = True` and builds two parameter groups, the backbone at a tenth of the head's rate, with BatchNorm kept in `eval()`.
- **`Writer`** is chapter 1's block with the four attention projections as separate `nn.Linear` layers named the way real models name them. Trained on `old_text`, it stands in for the pretrained language model.
- **`LoRALinear`** is the formula: the wrapped layer's parameters get `requires_grad = False`, A starts small and random, B starts at zero, and `forward` computes `x @ A.T` first, r numbers per token, before `@ B.T` stretches them back, so the full diff is never built. `setattr(writer, name, lora)` is what PEFT's `get_peft_model` does to every module named in `target_modules`.
- **The rank loop** trains rank 1 and rank 4 from the same pretrained weights and counts trainable and frozen numbers; each 32 × 32 projection gets (32 + 32) × r adapter numbers.
- **Unplugging and merging** put the original `nn.Linear` layers back and compare every tensor with the pretrained state, then fold (α/r)·B·A into each W and compare outputs with the adapter version.
- **The full fine-tune** gives the optimiser every parameter, for comparison.

**Expected result.** PyTorch 2.14 on a CPU; the output is in the chapter's corpus and is identical between runs.

```text
pretrained: old-task accuracy 0.981
A requires_grad=False only   weights moved 0.0e+00  running_mean[0] -0.044  old task 0.952  new task 0.765
B + BatchNorm in eval()      weights moved 0.0e+00  running_mean[0] +0.162  old task 0.981  new task 0.824
C + momentum=0, train mode   weights moved 0.0e+00  running_mean[0] +0.162  old task 0.981  new task 0.639
thaw at 1/10 the head's rate: weights moved 0.215  old task 0.932  new task 0.980

pretrained writer: loss on its own text 0.2502, on the shop format 10.3556
  writes: kettle : the watch ships today </s>
LoRA r=1 on q,k,v,o: trainable 256, frozen 6428, adapter 1024 bytes  | shop-format loss 0.8303, own-text loss 6.6182
  writes: kettle : boils water in stock </s> | backpack : carries school books : the stock </s>
LoRA r=4 on q,k,v,o: trainable 1024, frozen 6428, adapter 4096 bytes  | shop-format loss 0.3883, own-text loss 12.4983
  writes: kettle : boils water fast : in stock </s> | backpack : carries school books : in stock </s>
adapter unplugged: own-text loss 0.2502, base weights unchanged: True
merged into W: largest output difference 1.2e-05
full fine-tune: trainable 6428  | shop-format loss 0.1934, own-text loss 5.4382
```

Read it against the chapter. `running_mean[0]` belongs to a feature computed by the `nn.Linear` before the first BatchNorm, not to a raw input, so it is not expected to approach the worked table's 1.0. Under freeze A it has moved from +0.162 to −0.044 with no weight changed, and the old head lost three points. Freeze C kept the buffers still and left the new head at 0.639, because it was trained on batch statistics and evaluated on stored ones. The rank-4 adapter trains 1,024 numbers, a sixth of the model, and writes the full format. Unplugged, the writer is its pretrained self again, tensor for tensor.

Two things to try. Give the backbone's parameter group the head's learning rate, `1e-2`, and change the printed label to match: the thawed garden head reaches 0.942 instead of 0.980, and the old head falls to 0.882 instead of 0.932. Then wrap only `"qv"` instead of `"qkvo"`, again changing the label that prints `q,k,v,o`: at rank 4 the adapter halves to 512 numbers and the shop-format loss is 0.4027 against 0.3883, most of the effect for half the file, which is why query and value projections are a common minimal target.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 13.1 and 13.2; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 7.2 to 7.6, 7.12 and 7.20; all paraphrased as study material. Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 406–409, 414–416, 424–425, 436 and 492–493 (physical); Sebastian Raschka, Machine Learning Q and AI, pp. 132–134 (physical); Hu et al., LoRA: Low-Rank Adaptation of Large Language Models, arXiv:2106.09685, §4.1; the PyTorch 2.14 BatchNorm1d documentation.*
