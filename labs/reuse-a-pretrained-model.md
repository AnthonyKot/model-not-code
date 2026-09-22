# Lab: freeze three ways, thaw, then fit a LoRA adapter

The lab for chapter 3, [Reuse a Pretrained Model](../chapters/reuse-a-pretrained-model.md). It shows the three freezes and the thaw on a small photo backbone with BatchNorm layers, then LoRA and a full fine-tune on the shop's answer writer, with the numbers the chapter quotes.

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

**Expected result.** PyTorch 2.14 on a CPU; the output is in the chapter's corpus and is identical between runs. The writer's `shop-format loss` and `own-text loss` are measured on the same strings used for adaptation and pretraining, respectively: fit and interference on those strings, not performance on held-out prompts. The photo accuracies use separate validation examples.

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
