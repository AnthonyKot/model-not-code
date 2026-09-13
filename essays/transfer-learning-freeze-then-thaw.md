# Borrow the Eyes, Retrain the Judgement

You have a network pretrained on a large dataset and a few hundred labelled examples of your own. You set `requires_grad = False` on every parameter of the pretrained part, attach a new output layer, and train only that layer. Afterwards the pretrained weights are bit-identical to the copy you saved, yet the same fixed input produces a different output. In the exercise at the end of this essay, the original head, which reads the same "frozen" part, drops from 99.4% to 53.4% accuracy on its own task, and no weight changed.

The weights were frozen; the network was not. A batch-normalisation layer carries state that is not a parameter, and a flag that stops gradients does nothing to it. This essay is about that second kind of state, and about the three-step recipe it complicates: freeze, train the head, thaw.

## Freeze, train the head, then thaw

A pretrained image network splits into a backbone, everything from the input up to the last pooled feature vector, and a head, the small classifier on top sized for the original task's classes. Transfer learning keeps the backbone and replaces the head with one sized for yours.

The new head starts random, so its early loss gradients are large. They flow back into the backbone and can wreck weights that took a long pretraining run to reach. So the first stage freezes the backbone: with `requires_grad = False` autograd computes no gradient for its parameters and the optimiser has nothing to apply.

Once the head is sensible, the second stage thaws the backbone and trains everything, the backbone with a smaller learning rate. The learning rate is the step size: each update moves a weight by the rate times its gradient. A smaller rate lets the backbone adjust to your data without overwriting what it already computes; dividing the head's rate by 10 is a common start, and some setups go to 100. Adapter methods such as LoRA, in a later essay, keep the freeze and replace the thaw with a small trained diff.

## A layer has two kinds of state

Freezing acts on parameters: numbers that change only when an optimiser applies a gradient step. A batch-normalisation layer, BatchNorm for short, also holds buffers, numbers that change during the forward pass. For one input feature, over a mini-batch of m values x<sub>1</sub> … x<sub>m</sub>:

<p class="formula">x̂<sub>i</sub> = (x<sub>i</sub> − μ<sub>B</sub>) / √(σ<sub>B</sub><sup>2</sup> + ε),&nbsp;&nbsp;&nbsp; z<sub>i</sub> = γ · x̂<sub>i</sub> + β</p>

μ<sub>B</sub> is the mean of the m values in the batch and σ<sub>B</sub><sup>2</sup> their variance, so x̂<sub>i</sub> is the input re-expressed as "how many standard deviations from this batch's mean". ε is a tiny constant, 10<sup>−5</sup> by default in PyTorch, that keeps the division safe when the variance is near zero. γ and β are a learned scale and shift, one pair per feature, and z<sub>i</sub> is the layer's output. γ and β are the layer's parameters, and they let the network undo the normalisation if that fits the data better.

At prediction time there may be one row, and an output should not depend on what else is in the batch. So the layer keeps a running estimate of the mean and variance and uses those instead of μ<sub>B</sub> and σ<sub>B</sub><sup>2</sup>. PyTorch updates them after every forward pass in training mode:

<p class="formula">μ̂ ← (1 − momentum) · μ̂ + momentum · μ<sub>B</sub>,&nbsp;&nbsp;&nbsp; σ̂<sup>2</sup> ← (1 − momentum) · σ̂<sup>2</sup> + momentum · σ<sub>B</sub><sup>2</sup></p>

μ̂ is the stored `running_mean`, σ̂<sup>2</sup> the stored `running_var`. The momentum, 0.1 by default, is the weight given to the newest batch: each pass keeps 90% of the old estimate and mixes in 10% of the current batch. It is unrelated to an optimiser's momentum. Keras uses the complement under the same name (its default 0.99 means "keep 99%"), so convert a value copied between frameworks. PyTorch stores the unbiased batch variance, m/(m − 1) times the one it normalises with, a negligible difference for large batches.

Nothing in that update reads `requires_grad`. The buffers move whenever the layer runs in training mode, which is the mode a module is in after `model.train()`.

<figure class="diagram">
<svg viewBox="0 0 640 250" width="100%" role="img" aria-label="BatchNorm in train mode: batch mean and variance normalise the batch and are also written into running_mean and running_var. In eval mode: running_mean and running_var are read and nothing is written." style="max-width:640px;font-family:inherit;font-size:13px">
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="20" y="40" width="120" height="40"/><rect x="190" y="40" width="150" height="40"/><rect x="390" y="40" width="120" height="40"/>
    <rect x="190" y="120" width="150" height="44" stroke-dasharray="5 3"/>
    <rect x="20" y="190" width="120" height="40"/><rect x="390" y="190" width="120" height="40"/>
    <path d="M140 60 H190 M340 60 H390 M265 80 V120 M265 164 V210 H390 M140 210 H265"/>
  </g>
  <g fill="currentColor">
    <path d="M190 60 l-8 -4 v8 z M390 60 l-8 -4 v8 z M265 120 l-4 -8 h8 z M390 210 l-8 -4 v8 z"/>
    <text x="80" y="25" text-anchor="middle" font-weight="bold">train()</text>
    <text x="80" y="65" text-anchor="middle">batch x</text>
    <text x="265" y="65" text-anchor="middle">μ<tspan baseline-shift="sub" font-size="9">B</tspan>, σ<tspan baseline-shift="sub" font-size="9">B</tspan>² from batch</text>
    <text x="450" y="65" text-anchor="middle">γ·x̂ + β</text>
    <text x="275" y="102" font-size="12">writes (momentum)</text>
    <text x="265" y="147" text-anchor="middle">running_mean, running_var</text>
    <text x="80" y="180" text-anchor="middle" font-weight="bold">eval()</text>
    <text x="80" y="215" text-anchor="middle">input x</text>
    <text x="275" y="184" font-size="12">reads only</text>
    <text x="450" y="215" text-anchor="middle">γ·x̂ + β</text>
    <text x="530" y="65" font-size="12">γ, β: parameters</text>
    <text x="530" y="150" font-size="12">buffers: no</text>
    <text x="530" y="166" font-size="12">gradient involved</text>
  </g>
</svg>
<figcaption>One BatchNorm layer in its two modes. In <code>train()</code> it normalises with the batch's own statistics and writes them into the buffers; in <code>eval()</code> it normalises with the buffers and writes nothing. <code>requires_grad</code> governs only γ and β.</figcaption>
</figure>

## Worked example: one unit, fifty batches

The numbers below are the book's own. Take a single BatchNorm unit whose pretraining left running mean 0 and running variance 1, with γ = 1 and β = 0 so the output is just x̂. Your new data sits somewhere else: every batch has mean 2 and standard deviation 0.5, so variance 0.25. The backbone is frozen and you train the head in training mode.

Batch 1: the running mean becomes 0.9 × 0 + 0.1 × 2 = 0.2; the running variance, 0.9 × 1 + 0.1 × 0.25 = 0.925. Batch 2: 0.9 × 0.2 + 0.1 × 2 = 0.38, and 0.9 × 0.925 + 0.1 × 0.25 = 0.8575. Unroll the recurrence and after n batches the mean is 2 × (1 − 0.9<sup>n</sup>) and the variance 0.25 + 0.75 × 0.9<sup>n</sup>.

Now follow one input value, 2.5, through the unit in evaluation mode, where the output is (2.5 − running mean) / √(running variance), ignoring ε:

| Batches seen | Running mean | Running variance | Output for 2.5 |
|---|---|---|---|
| 0 (pretrained) | 0 | 1 | 2.500 |
| 1 | 0.200 | 0.925 | 2.391 |
| 2 | 0.380 | 0.858 | 2.289 |
| 3 | 0.542 | 0.797 | 2.194 |
| 10 | 1.303 | 0.512 | 1.674 |
| 20 | 1.757 | 0.341 | 1.272 |
| 50 | 1.990 | 0.254 | 1.013 |

Same input, same weights, and the output falls from 2.5 towards (2.5 − 2) / 0.5 = 1.0, the value the unit gives in training mode on every one of those batches. Every layer above receives the new number, and the shifts compound: in the exercise's two-layer backbone, the output for fixed inputs moves by up to 11.3.

## What actually freezes the statistics

**A: `requires_grad = False` alone** stops γ, β and every weight. The buffers keep updating on every training-mode forward pass, as in the table.

**B: the BatchNorm layers in `eval()`** stops the update and normalises with the stored statistics, so the backbone computes exactly what it did after pretraining. The trap: `model.train()` sets every submodule back to training mode, and loops call it every epoch, so re-apply `eval()` to the BatchNorm layers after each call. Dropout is the other common module with a mode. Keras couples the two ideas, since `trainable = False` on its BatchNormalization layer also switches it to inference mode; PyTorch keeps them separate.

**C: `momentum = 0`** stops the update, since each pass keeps 100% of the old estimate. But in training mode the layer still normalises with the current batch's statistics. The head learns on features computed one way and is evaluated on features computed another. In the exercise the same inputs give features that differ by up to 4.4 between the two modes, and the head scores 51.9%, close to guessing.

The strongest freeze is not to run the backbone during training at all: pass the dataset through it once in `eval()` under `torch.no_grad()`, store the feature vectors, and train the head on those. That works while the backbone stays frozen and inputs are not augmented afresh on each pass. Layer normalisation keeps no buffers at all, so this drift cannot happen there.

## Thaw with parameter groups

The thaw needs two learning rates, and PyTorch's mechanism for that is parameter groups: instead of one list of parameters, the optimiser takes a list of dictionaries, each holding some parameters and the hyperparameters that apply to them. Keep the BatchNorm layers in `eval()` through the thaw too. Fine-tuning batches are usually small, and a small batch's statistics are a noisy estimate of what the pretrained buffers measured on far more data.

## When the statistics should move

Freezing the statistics has a cost. In the exercise, letting the buffers follow the new data gave the new head 98.5%; keeping them frozen gave 80.6%, and a thaw at a tenth of the head's rate raised that to 89.4%. Normalised with the old statistics, the shifted inputs land far from the values the pretrained layers were fitted on, and re-estimating the statistics on the new domain is itself a form of adaptation.

What it cannot be is an accident. The same run took the old task from 99.4% to 53.4%. If the backbone is shared with another head, cached, or compared across runs, a drifted backbone is a different model under the same weights file. Choose which you want, set the BatchNorm mode to match, and measure both tasks. The exercise's shift is deliberately extreme; on real data the gaps will be smaller and may reverse, which is why they are measured rather than assumed.

<!--mission-->
## Exercise: freeze three ways, then thaw

The script builds a small backbone with two `nn.BatchNorm1d` layers, pretrains it on one distribution, then trains a new head on shifted data under each of the three freezes and finishes with a thaw. PyTorch only, CPU, a few seconds, nothing downloaded.

```python
import copy
import torch
import torch.nn as nn

torch.manual_seed(0)

# Part 1: one BatchNorm unit, pretrained statistics mean 0 and variance 1, fed new-domain batches.
unit = nn.BatchNorm1d(1)                     # momentum=0.1 by default; running_mean 0, running_var 1
z = torch.randn(10_000, 1)
batch = 2.0 + 0.5 * (z - z.mean()) / z.std(unbiased=False)   # mean exactly 2, std exactly 0.5
for n in range(1, 51):
    unit.train()
    unit(batch)                              # a forward pass in train() mode updates the buffers
    if n in (1, 10, 50):
        unit.eval()
        with torch.no_grad():
            out_eval = unit(torch.tensor([[2.5]])).item()
        print(f"after {n:2d} batches: running_mean {unit.running_mean.item():.4f}, "
              f"running_var {unit.running_var.item():.4f}, input 2.5 -> {out_eval:.4f}")


def source_batch(n=64):                      # the "pretraining" domain: mean 0, std 1
    x = torch.randn(n, 4)
    return x, (x[:, 0] + x[:, 1] > 0).long()


def target_batch(n=64):                      # the new domain: mean 2, std 0.5
    x = 2.0 + 0.5 * torch.randn(n, 4)
    return x, (x[:, 0] + x[:, 1] > 4.0).long()


# Part 2: a small pretrained backbone, a new head, three ways to "freeze", then a thaw.
torch.manual_seed(0)
backbone = nn.Sequential(nn.Linear(4, 8), nn.BatchNorm1d(8), nn.ReLU(),
                         nn.Linear(8, 8), nn.BatchNorm1d(8), nn.ReLU())
old_head = nn.Linear(8, 2)

# Stand-in for pretraining: fit backbone + old head on the source domain.
opt = torch.optim.Adam([*backbone.parameters(), *old_head.parameters()], lr=1e-2)
for _ in range(300):
    x, y = source_batch()
    loss = nn.functional.cross_entropy(old_head(backbone(x)), y)
    opt.zero_grad(); loss.backward(); opt.step()
pretrained = copy.deepcopy(backbone.state_dict())

bn = backbone[1]
batchnorms = [m for m in backbone.modules() if isinstance(m, nn.BatchNorm1d)]
print("BatchNorm1d parameters:", [n for n, _ in bn.named_parameters()], " buffers:", [n for n, _ in bn.named_buffers()])
print("LayerNorm parameters:", [n for n, _ in nn.LayerNorm(8).named_parameters()], " buffers:", [n for n, _ in nn.LayerNorm(8).named_buffers()])
probe = source_batch(1000)                   # fixed probe inputs, never trained on
target_val = target_batch(1000)              # held-out inputs from the new domain


def old_task_accuracy():
    backbone.eval()
    with torch.no_grad():
        return (old_head(backbone(probe[0])).argmax(1) == probe[1]).float().mean().item()


def new_task_accuracy(head):
    backbone.eval(); head.eval()
    with torch.no_grad():
        return (head(backbone(target_val[0])).argmax(1) == target_val[1]).float().mean().item()


def weights_moved():
    now = backbone.state_dict()
    return max((now[k] - pretrained[k]).abs().max().item()
               for k in now if k.endswith(("weight", "bias")))


def train_new_head(steps, bn_mode, momentum=None):
    backbone.load_state_dict(pretrained)
    for p in backbone.parameters():
        p.requires_grad = False              # "frozen": no gradient, no optimizer update
    for m in batchnorms:
        m.momentum = 0.1 if momentum is None else momentum
    torch.manual_seed(1)
    head = nn.Linear(8, 2)
    opt = torch.optim.Adam(head.parameters(), lr=1e-2)
    with torch.no_grad():
        backbone.eval(); probe_before = backbone(probe[0])
    for _ in range(steps):
        backbone.train(); head.train()       # what model.train() does every epoch
        if bn_mode == "eval":
            for m in batchnorms:
                m.eval()                     # freeze the statistics too
        x, y = target_batch()
        loss = nn.functional.cross_entropy(head(backbone(x)), y)
        opt.zero_grad(); loss.backward(); opt.step()
    with torch.no_grad():
        backbone.eval(); probe_after = backbone(probe[0])
    return head, (probe_after - probe_before).abs().max().item()


print(f"pretrained: running_mean[:3] {[round(v, 3) for v in bn.running_mean[:3].tolist()]}, "
      f"old-task accuracy {old_task_accuracy():.3f}")

for label, steps, mode, mom in [("A  requires_grad=False, train()", 200, "train", None),
                                ("B  requires_grad=False, BN eval()", 200, "eval", None),
                                ("C  requires_grad=False, momentum=0", 200, "train", 0.0)]:
    head, probe_change = train_new_head(steps, mode, mom)
    print(f"{label}: weights moved {weights_moved():.1e}, "
          f"running_mean[:3] {[round(v, 3) for v in bn.running_mean[:3].tolist()]}, "
          f"probe output changed by {probe_change:.3f}")
    print(f"   old-task accuracy {old_task_accuracy():.3f}, new-task accuracy {new_task_accuracy(head):.3f}")

# C trained its head on batch statistics but will be evaluated on running statistics.
x, _ = target_batch(256)
with torch.no_grad():
    backbone.train(); f_train = backbone(x)
    backbone.eval(); f_eval = backbone(x)
print(f"C  same target inputs, train() vs eval() features differ by up to {(f_train - f_eval).abs().max().item():.3f}")

# Thaw: start from B (statistics frozen), open the backbone at 1/10 of the head's learning rate.
head, _ = train_new_head(200, "eval")
for p in backbone.parameters():
    p.requires_grad = True
opt = torch.optim.Adam([
    {"params": head.parameters(), "lr": 1e-2},
    {"params": backbone.parameters(), "lr": 1e-3},
])
head_before = copy.deepcopy(head.state_dict())
for _ in range(300):
    backbone.train(); head.train()
    for m in batchnorms:
        m.eval()                             # thaw the weights, keep the statistics frozen
    x, y = target_batch()
    loss = nn.functional.cross_entropy(head(backbone(x)), y)
    opt.zero_grad(); loss.backward(); opt.step()
head_moved = max((head.state_dict()[k] - head_before[k]).abs().max().item() for k in head_before)
print("thaw: group learning rates", [g["lr"] for g in opt.param_groups],
      f"| max change head {head_moved:.4f}, backbone {weights_moved():.4f}",
      f"| new-task accuracy {new_task_accuracy(head):.3f}, old-task accuracy {old_task_accuracy():.3f}")
print(f"      running_mean[:3] {[round(v, 3) for v in bn.running_mean[:3].tolist()]}")
```

What each part does:

- **Part 1** is the worked example. `unit(batch)` in `train()` mode is an ordinary forward pass that updates the buffers as a side effect; the batch is rescaled to mean exactly 2 and standard deviation exactly 0.5 so the printout can be checked against the table.
- **`source_batch` and `target_batch`** stand in for the pretraining data and yours; the 300-step loop stands in for the downloaded checkpoint, and `state_dict()` saves weights and buffers together, as a checkpoint does.
- **The `named_buffers()` prints** show where the drift lives: three buffers in BatchNorm, none in LayerNorm.
- **`train_new_head`** is an ordinary head-training loop: `requires_grad = False` is the freeze, the optimiser gets only the head's parameters, and `backbone.train()` each step is what `model.train()` does each epoch. `bn_mode="eval"` re-applies `eval()` to the BatchNorm layers after it (option B); `momentum` sets option C.
- **`weights_moved`** compares only weights and biases with the checkpoint, and the probe runs fixed inputs through the backbone in `eval()` before and after, so a change there comes from the buffers.
- **The thaw** trains a head under option B, sets `requires_grad = True` on the backbone, and builds two parameter groups, the backbone at a tenth of the head's rate, BatchNorm still in `eval()`.

**Expected result.** PyTorch 2.14, CPU, seed 0; full output in the essay's corpus. Part 1: `running_mean 0.2000, running_var 0.9250, input 2.5 -> 2.3914` after one batch, `1.3026, 0.5115, 1.6741` after ten, `1.9897, 0.2539, 1.0127` after fifty, the table up to ε and the variance correction. Every freeze reports `weights moved 0.0e+00`. A: `running_mean[:3]` goes from `[-0.289, -0.19, -0.407]` to `[0.902, -0.47, -1.218]`, `probe output changed by 11.325`, `old-task accuracy 0.534, new-task accuracy 0.985`. B: `probe output changed by 0.000`, `old-task accuracy 0.994, new-task accuracy 0.806`. C: buffers unchanged, `new-task accuracy 0.519`, features `differ by up to 4.443`. Thaw: `group learning rates [0.01, 0.001]`, `max change head 1.3397, backbone 0.2451`, `new-task accuracy 0.894, old-task accuracy 0.967`, running mean still at its pretrained values.

*Sources: the Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 12.3, 13.1 and 13.2, paraphrased as study material; Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, chapter 11 (batch normalisation, reusing pretrained layers, parameter groups) and chapter 12 (pretrained models for transfer learning); Sebastian Raschka, Machine Learning Q and AI, chapter 19; the PyTorch `BatchNorm1d`, `LayerNorm` and `Module` documentation and the Keras `BatchNormalization` documentation, as of 2026-09-13.*
