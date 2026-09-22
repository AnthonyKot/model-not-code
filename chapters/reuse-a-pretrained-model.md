# Reuse a Pretrained Model

Chapter 2's classifier learned its categories from 8,000 labelled photos. A new supplier brings a garden range, photographed under different lighting, and the shop has a few hundred labelled photos of it: not enough to train from zero, enough to adapt a model somebody else trained on far more. The standard move is to download a pretrained backbone, set `requires_grad = False` on every one of its weights, and train a new output layer on top. Nothing in the backbone has a gradient. Yet in the worked run below, one fixed input goes into one frozen layer and the output slides 1.600 → 1.550 → 1.242 → 1.004 as training batches pass, and in the lab the old head that reads the same backbone falls from 0.981 to 0.952 on the categories it was trained for. A frozen backbone became a different function under an unchanged weights file. What did the freeze not freeze?

The chapter first says what the checkpoint hands you and what a freeze promises, then finds the state that `requires_grad` leaves loose and measures three ways of freezing against each other. That answer then goes into the frame the shop needs: how much of a pretrained model to let change, from a new head on frozen weights, through a slow thaw, to a small diff trained beside weights that never move, which is what the answer writer needs at a size where nothing can move at all. The runs are synthetic and small enough to recompute.

## What the checkpoint hands you, and what the freeze promises

A pretrained image network splits into two parts. The **backbone** runs from the input to the last pooled feature vector: one list of numbers per photo, computed by layers that learned edges, textures and shapes on a large photo collection. The **head** is the small layer on top that turns that vector into scores for the original task's classes. Those classes are not the shop's, so the head is replaced and the backbone is kept. Two words shift meaning here: the **checkpoint** is the downloaded file, not chapter 2's snapshots of your own run to choose among; and the head is one layer, where chapter 2's lab called its two summed output layers heads. In code it is a download and one assignment:

```python
# illustrative, not executed (torchvision is not installed here); API as of the time of writing
from torchvision.models import resnet50, ResNet50_Weights
model = resnet50(weights=ResNet50_Weights.DEFAULT)          # the backbone and its original head
model.fc = nn.Linear(model.fc.in_features, n_garden_categories)  # replace the head
```

The payoff is largest when labels are scarce: on a 320-image subset of a three-class photo task, a small network trained from scratch stayed below 50% validation accuracy, while a pretrained backbone with a new head reached 71.3%.

The new head starts with random weights, so its first predictions are poor and its gradients are large. Those gradients would flow back through the backbone, and a few large steps can undo weights a long pretraining run reached. So the first stage **freezes** the backbone:

```python
for p in backbone.parameters():
    p.requires_grad = False                      # autograd computes no gradient for these
opt = torch.optim.Adam(head.parameters(), lr=1e-2)   # the optimiser only ever sees the head
```

With `requires_grad = False`, the backward pass computes no gradient for the backbone's weights and the optimiser has nothing to apply to them. Only the head learns. That is the promise a freeze appears to make: the backbone computes exactly what it computed when you downloaded it, and anything else that reads it, the old head included, is undisturbed. If nothing is augmented, the frozen backbone can even run once, its feature vectors stored, and the head trained on the stored file, which then belongs to the exact backbone that produced it.

## Why the frozen backbone still moved

The promise holds for every number the optimiser touches. It says nothing about numbers the optimiser never touches, and most image backbones contain a layer that changes some of its own numbers on every forward pass.

That layer is **batch normalisation**, BatchNorm for short. For each feature it subtracts a mean and divides by a standard deviation, then applies a learned scale γ and shift β. In training mode the mean and variance are the current batch's; since a single photo has no batch, the layer also keeps a running estimate of both and uses that in evaluation mode. γ and β are **parameters**: they change only when an optimiser applies a gradient, and `requires_grad = False` stops them. The running mean and variance are **buffers**: saved in the checkpoint beside the weights, and updated by the forward pass whenever the layer is in training mode, each pass keeping 90% of the old estimate and taking 10% from the new batch. Nothing in that update reads `requires_grad`, and training a head in training mode runs a batch through the frozen backbone at every step.

**Every weight is frozen. Must the output for a fixed input stay the same? Name the condition your answer depends on.**

Only if no BatchNorm layer ran in training mode. Follow one feature through stage one, with γ = 1 and β = 0 so the output is the normalised value itself. The checkpoint left its running mean at 0 and running variance at 1; the new supplier's photos give this feature a mean of 1.0 and a standard deviation of 0.6, so take every batch's contribution to the buffers as exactly that mean and a variance of 0.36. In evaluation mode the layer then does this to one fixed input of 1.6, computed as (1.6 − running mean) / √(running variance):

| Batches seen | Running mean | Running variance | Output for 1.6 |
|---|---|---|---|
| 0 (checkpoint) | 0 | 1 | 1.600 |
| 1 | 0.1 | 0.936 | 1.550 |
| 2 | 0.19 | 0.878 | 1.504 |
| 10 | 0.651 | 0.583 | 1.242 |
| 20 | 0.878 | 0.438 | 1.091 |
| 50 | 0.995 | 0.363 | 1.004 |

The output approaches (1.6 − 1.0) / 0.6 = 1.0: the layer has re-centred on the new photos. Same input, same weights, a different output, and every layer above receives the new number.

<details>
<summary>Optional: the update formulas, the unbiased variance and the closed form of the table</summary>

Over a batch of m values x<sub>1</sub> … x<sub>m</sub> of one feature:

<p class="formula">x̂<sub>i</sub> = (x<sub>i</sub> − μ<sub>B</sub>) / √(σ<sub>B</sub><sup>2</sup> + ε),&nbsp;&nbsp;&nbsp; z<sub>i</sub> = γ · x̂<sub>i</sub> + β</p>

μ<sub>B</sub> and σ<sub>B</sub><sup>2</sup> are the batch's mean and variance, so x̂<sub>i</sub> is the value in standard deviations from the batch mean; ε, 10<sup>−5</sup> by default, keeps the division safe and changes none of the table's decimals; z<sub>i</sub> is the output. On every forward pass in training mode the buffers move:

<p class="formula">μ̂ ← (1 − momentum) · μ̂ + momentum · μ<sub>B</sub>,&nbsp;&nbsp;&nbsp; σ̂<sup>2</sup> ← (1 − momentum) · σ̂<sup>2</sup> + momentum · σ<sub>B</sub><sup>2</sup></p>

μ̂ is the stored `running_mean` and σ̂<sup>2</sup> the stored `running_var`; the momentum, 0.1 by default, is the share given to the newest batch. PyTorch feeds this update the batch's unbiased variance, m/(m − 1) times the one it normalises with, hence the table's wording, a contribution to the buffers. After n batches the mean is 1 − 0.9<sup>n</sup> and the variance 0.36 + 0.64 × 0.9<sup>n</sup>, and every row is those two expressions put through (1.6 − μ̂) / σ̂.

</details>

There are three ways to "freeze", and only one freezes everything:

- **A. `requires_grad = False` alone** stops γ, β and every weight. The buffers keep moving, as in the table.
- **B. BatchNorm layers in `eval()` as well** stops the buffers and normalises with the checkpoint's statistics, so the backbone computes exactly what it did when downloaded. The trap: `model.train()` switches every submodule back to training mode, training loops call it every epoch, and the BatchNorm layers must be put back after each call.
- **C. `momentum = 0` in training mode** stops the buffers too, but the layer still normalises each training batch with that batch's own statistics, so the head learns on features computed one way and is evaluated on features computed another.

In the lab, all three report that no weight moved. Under A the old head, which reads the same backbone, falls from 0.981 to 0.952 on the original task, and the new head reaches 0.765 on the garden photos. Under B the old head stays at 0.981 and the new head reaches 0.824. Under C the new head reaches 0.639. Keras couples the two settings, `trainable = False` also putting its BatchNormalization layer in inference mode; PyTorch keeps them separate, which is why this is a PyTorch trap.

Re-estimated statistics can be a form of adaptation; here they cost the old task three points and did not help the new one. What the buffers cannot be is an accident. If another head reads the same backbone, or a stored feature file came from it, a drifted backbone quietly breaks both.

## How much of the model to let change

Stage one now carries a condition: the freeze keeps its promise only while the BatchNorm layers stay in evaluation mode. It is also only the first of the answers to one question, how much of the pretrained model to let change. The garden classifier has more labels than a frozen backbone can use, and the answer writer has a job no new head can do.

| Situation | Change | Why |
|---|---|---|
| Few labels; the pretrained features already separate your classes | A new head on a frozen backbone; stored features if nothing is augmented | Cheapest; nothing drifts once BatchNorm is in `eval()` |
| More labels; the model and its optimiser state fit in memory | Head first, then thaw with parameter groups at a smaller rate; BatchNorm in `eval()` unless re-estimating it wins on validation | The backbone adapts; the head's early gradients never reach it |
| The weights, gradients and optimiser state do not fit | LoRA on the attention projections; QLoRA if even the frozen base does not fit | Gradients and optimiser state scale with the adapter; the frozen weights and the activations still scale with the model |
| Several tasks share one base | One adapter per task | The base file stays unchanged; adapters are swapped or merged per deployment |

**The second row is the thaw.** Once the head is trained, the backbone can move too, slowly. The **learning rate** is the step size of every update, so a smaller rate for the backbone lets it adjust without overwriting what it computes. PyTorch expresses two rates with **parameter groups**, a list of dictionaries in place of one parameter list:

```python
for p in backbone.parameters():
    p.requires_grad = True
opt = torch.optim.Adam([
    {"params": head.parameters(),     "lr": 1e-2},
    {"params": backbone.parameters(), "lr": 1e-3},   # a tenth of the head's rate
])
```

A factor of 10 is a common starting point. In the lab the thaw lifts the garden head from 0.824 to 0.980. The backbone's weights now move, by up to 0.215, and the old head falls from 0.981 to 0.932, because it reads a backbone that is no longer the one it was trained on. Thawing at the head's own rate instead lands at 0.942 and 0.882: faster steps, worse on both. If two heads share one backbone, thawing for one changes the other, and both belong in the evaluation.

<details>
<summary>Optional: how much the smaller rate matters, and the BatchNorm layers during the thaw</summary>

On one photo task, thawing at the unchanged learning rate dropped validation accuracy to 33%, and dividing the rate by 100 raised it to 72.2%. The lab keeps the BatchNorm layers in `eval()` through the thaw as well, the usual default: fine-tuning batches are small, and their statistics are a noisy estimate of what the checkpoint measured on far more photos. Re-estimating them is a separate candidate, compared on validation for both tasks.

</details>

**The third row is the answer writer's.** The shop needs answers in its own format, `kettle : boils water fast : in stock`, and chapter 1's writer produces ordinary sentences. The writer is a language model with about three billion weights; holding it on an accelerator at 32 bits takes about 12 GB before training starts, and a full fine-tune needs the weight, its gradient and Adam's two running averages: 16 bytes a weight, 48 GB for three billion, before the activations saved for the backward pass. A new head does not help, because the format of an answer is produced by the whole stack, not by the last layer. The way out is to keep every weight frozen, as in stage one, and train something much smaller beside it.

<details>
<summary>Optional: the 48 GB, row by row, and what an adapter removes</summary>

| What sits in memory per weight | Bytes | For 3 billion weights |
|---|---|---|
| The weight itself, 32-bit | 4 | 12 GB |
| Its gradient | 4 | 12 GB |
| Adam's running average of gradients | 4 | 12 GB |
| Adam's running average of squared gradients | 4 | 12 GB |
| Total, before activations | 16 | 48 GB |

Adam's two running averages per parameter double what a plain gradient step needs. An adapter removes the last three rows for every frozen weight; the first row stays, and so do the activations.

</details>

## Where the answer writer's change goes

Take one weight matrix W inside the model, with d<sub>in</sub> inputs and d<sub>out</sub> outputs. A full fine-tune turns it into W + ΔW, and ΔW has as many entries as W. **Low-rank adaptation**, LoRA, writes the change as the product of two thin matrices instead: A with r rows and d<sub>in</sub> columns, B with d<sub>out</sub> rows and r columns. For an input x the layer computes:

<p class="formula">h = W·x + (α / r) · B·(A·x)</p>

x is the layer's input, d<sub>in</sub> numbers, and W·x is what the frozen layer computed all along. A·x squeezes the input down to r numbers, and B stretches them back to d<sub>out</sub>, so the second term has the shape of the first and can be added to it. r is the adapter's **rank**, chosen by you; 8, 16 and 32 are common starting values. α is a second setting, and α/r is a fixed scale on the correction, the same kind of fixed division as the √d<sub>k</sub> in chapter 1's attention, not a temperature. h is the output: the pretrained answer plus a correction that passed through an r-wide bottleneck.

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

Which W? Usually the four attention matrices of every layer: chapter 1's projections for queries, keys and values, and the output projection that maps the blended result back. The feed-forward matrices are the next targets.

**A worked diff of rank 1.** Take a 4 × 4 layer and r = 1, with A = [2, −1, 0, 1] and B = [1, 0, 3, −1]<sup>T</sup>. Eight trainable numbers produce a 4 × 4 diff whose row i is B<sub>i</sub> times the row A:

| Row of B·A | B<sub>i</sub> × A | Entries |
|---|---|---|
| 1 | 1 × [2, −1, 0, 1] | 2, −1, 0, 1 |
| 2 | 0 × [2, −1, 0, 1] | 0, 0, 0, 0 |
| 3 | 3 × [2, −1, 0, 1] | 6, −3, 0, 3 |
| 4 | −1 × [2, −1, 0, 1] | −2, 1, 0, −1 |

Every row is a multiple of one pattern, which is what rank 1 means: the diff can scale one direction of change per output and nothing else, and a rank-r diff is a sum of r such patterns. Now pass x = (1, 0, 2, 1) the way the formula does: A·x = 2 + 0 + 0 + 1 = 3, one number, and B·(A·x) = 3 × B = (3, 0, 9, −3). The rows of the table give the same answer, but the short way never built the 4 × 4 matrix: the diff is cheap to run as well as to store.

Two more things follow; the lab checks both. B starts at zero, so training starts at the pretrained model. And the diff is a separate file: load it, unplug it, swap in another task's, or merge it into W with one addition, W ← W + (α/r)·B·A. Unplugging the lab's adapter gives back the pretrained writer bit for bit, and merging changes outputs by 1.2 × 10<sup>−5</sup>, floating-point noise.

The lab's writer starts at a loss of 10.3556 on the shop's format. A rank-1 adapter on all four attention matrices, 256 trainable numbers, brings it to 0.8303 and writes `kettle : boils water in stock`; rank 4, 1,024 numbers, reaches 0.3883 and writes the whole format; a full fine-tune of every weight reaches 0.1934.

<details>
<summary>Optional: what α/r does and does not do</summary>

B·(A·x) is a sum of r terms, and dividing by r with α held fixed reduces how much the other settings need retuning when r changes. It does not guarantee a correction of the same size at every rank, because A and B are learned. Unlike chapter 1's temperatures τ and T, which make a softmax sharper or flatter, α/r scales the adapter's path directly: with α = 16, rank 8 applies the correction at scale 2 and rank 64 at 0.25. The common rule α = 2r keeps the scale at 2 whatever r is, a configuration to validate rather than a consequence of the division, and a codebase may apply α differently; check before copying a setting.

</details>

<details>
<summary>Optional: the adapter's size for a three-billion-weight model, with the PEFT and QLoRA settings</summary>

An adapter has (d<sub>in</sub> + d<sub>out</sub>) × r numbers per target matrix, against d<sub>in</sub> × d<sub>out</sub> for the matrix. For Llama 3.2 with three billion weights, 28 layers, a width of 3072, and k and v projections that output 1024:

| Projection | Shape | (d<sub>in</sub> + d<sub>out</sub>) × 32 |
|---|---|---|
| q | 3072 → 3072 | 196,608 |
| o | 3072 → 3072 | 196,608 |
| k | 3072 → 1024 | 131,072 |
| v | 3072 → 1024 | 131,072 |
| Per layer | | 655,360 |
| × 28 layers, × 4 bytes | | 73,400,320 bytes |

The q projection alone has 9,437,184 entries against 196,608 in its rank-32 adapter, about 2%; the whole adapter is 73.4 MB, the file such a fine-tune saves. In the Hugging Face PEFT library, which names the four matrices `q_proj`, `k_proj`, `v_proj` and `o_proj`:

```python
# illustrative, not executed; PEFT API as of the time of writing
from peft import LoraConfig, get_peft_model
config = LoraConfig(r=32, lora_alpha=64,
                    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"])
model = get_peft_model(base_model, config)    # wraps each named nn.Linear the way the lab does
model.print_trainable_parameters()            # 18,350,080 for this model: 655,360 x 28
```

**QLoRA** stores the frozen base's large linear layers in four bits per weight, while layers such as the embedding table keep their format: about 2.2 GB for the three-billion-weight base, plus about 70 MB of adapters at full precision. How four bits stand in for 32 is chapter 7's; only the frozen base is compressed, never the diff being trained.

</details>

## Where it stops

Rank is a ceiling. If the change the task needs spans more independent directions than r, the adapter fits what it can and stops. Raising r raises the ceiling and the file size together; target modules, r and α are settings, chosen on validation.

The adapter does not protect the old behaviour while it is plugged in. With the rank-4 adapter attached, the writer's loss on its original sentences is 12.50, worse than the full fine-tune's 5.44: both runs were trained only on the new format, and nothing asked either to keep the old one. What LoRA guarantees is narrower: the base weights are never edited, so removing the adapter restores the original model exactly, and one base can serve several tasks. If the old behaviour must survive in the same model, it has to be in the training data and in the evaluation.

The runs show the mechanics, not a release choice. Every row of the choice table ends where chapter 2 did, with the old task and the new task measured on held-out products, chosen on validation, the test scored once.

## Two questions to work

**1. The same freeze, a different supplier.** Keep everything in the worked table except the photos: the new supplier's images give the feature a mean of 0.4 and a standard deviation of 0.5, so each batch contributes a mean of 0.4 and a variance of 0.25. Under freeze A, what does the layer output for the fixed input 1.6 after 50 batches, and which way did it move?

<details>
<summary>Worked answer</summary>

After 50 batches the running mean is 0.4 × (1 − 0.9<sup>50</sup>) = 0.4 × 0.9949 = 0.398 and the running variance is 0.25 + 0.75 × 0.9<sup>50</sup> = 0.25 + 0.0039 = 0.254. The output is (1.6 − 0.398) / √0.254 = 1.202 / 0.504 = 2.386, on its way to (1.6 − 0.4) / 0.5 = 2.4. The same input that fell from 1.600 to 1.004 in the chapter's table now rises to 2.386. The direction and size of the drift are set by the new photos' statistics, not by anything in the freeze, so the weights file alone cannot tell you what a freeze-A backbone computes.

</details>

**2. Which protection did the adapter give?** With the rank-4 adapter attached, the writer's loss on its own original sentences was 12.50; after a full fine-tune it was 5.44. A colleague concludes that LoRA protected the old behaviour less than full fine-tuning did, and proposes a full fine-tune instead. What is right in that reading, and what is the wrong turn?

<details>
<summary>Worked answer</summary>

The numbers are right: the attached adapter interfered more. The wrong turn is the word *protected*. Neither run was asked to keep the old behaviour, so both numbers measure interference nobody tried to prevent, and a full fine-tune that interfered less this time has no mechanism to do so next time. What the adapter protects is the base file: unplug it and the loss on the old sentences returns to 0.2502 exactly, which the full fine-tune cannot do without a second copy of every weight. If the old sentences matter in the same deployment, the fix is the same for both methods: put them in the training data and score them on held-out prompts before choosing.

</details>

## The lab

The lab, [freeze three ways, thaw, then fit a LoRA adapter](../labs/reuse-a-pretrained-model.md), runs both halves in about six seconds on a CPU. It should print `weights moved 0.0e+00` for freezes A, B and C, with the old task at 0.952, 0.981 and 0.981 and the new head at 0.765, 0.824 and 0.639, then 0.932 and 0.980 for the thaw, and end with `base weights unchanged: True` after the rank-4 adapter is unplugged. Two variations, the thaw at the head's rate and adapters on q and v only, follow it with their outputs.

Every change in this chapter was scored against a label: a category for a photo, the next token of a format string. The next thing the shop needs from the writer is answers that are *good*, and nobody can write that down as a label at every position. People can say which of two answers they prefer. Chapter 4 trains the writer from that, and watches the score it optimises rise while the answers get worse.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 13.1 and 13.2; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 7.2 to 7.6, 7.12 and 7.20; all paraphrased as study material. Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 406–409, 414–416, 424–425, 436 and 492–493 (physical); Sebastian Raschka, Machine Learning Q and AI, pp. 132–134 (physical); Hu et al., LoRA: Low-Rank Adaptation of Large Language Models, arXiv:2106.09685, §4.1; the PyTorch 2.14 BatchNorm1d documentation.*
