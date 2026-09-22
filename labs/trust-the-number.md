# Lab: split, weight, threshold, then score the release

The lab for chapter 2, [Trust the Number Before You Ship the Classifier](../chapters/trust-the-number.md). It builds the synthetic catalogue, trains the same small network under both splits and with a class weight, chooses the blade threshold on validation, scores the release per listing, and measures the input pipeline the setup section below describes.

## Before you run it: the GPU waits on the JPEG decoder

The chapter answered its first two lies by training again and comparing, and its third with a threshold that costs no run at all; when the answer is a run, how fast one goes sets how many honest comparisons you can afford. Real product photos arrive as JPEG files that have to be read, decoded, resized and augmented on the CPU before the accelerator sees a tensor.

When that CPU work is slower than the training step, the accelerator sits idle between batches, and the fix is more loading processes, `DataLoader(num_workers=…)` in PyTorch, until loading stops being the slower side. Measure the two sides before buying a faster accelerator: if loading is the bottleneck, the new accelerator waits just as long.

<details>
<summary>Optional: forecast the step time and tune the loader</summary>

Split one training step in two. The **load** time L builds one batch on the CPU; the **compute** time C runs the forward pass, the loss, the backward pass and the optimiser step. A plain loop does them in turn, so a step takes L + C. With a separate loading process and a queue between the two, the next batch is built while the current one trains, and in steady state batches pass at the rate of the slower side:

<p class="formula">step = max(L / W, C)</p>

W is the number of loading processes, each building whole batches, and L/W their combined time per batch, as long as each has a free CPU core. C is the training step. The maximum is whichever side is slower, so speeding up the faster side changes nothing.

Say one photo takes 5 ms to decode and augment on one core, a batch is 64 photos, so L = 320 ms, and the training step takes C = 100 ms. An epoch of 100,000 photos is 1,563 steps.

| Configuration | Step | Accelerator busy, C ÷ step | Epoch |
|---|---|---|---|
| Load, then train, in one process | 320 + 100 = 420 ms | 23.8% | 656 s |
| One loading process | max(320, 100) = 320 ms | 31.2% | 500 s |
| Two | max(160, 100) = 160 ms | 62.5% | 250 s |
| Three | max(106.7, 100) = 106.7 ms | 93.8% | 167 s |
| Four | max(80, 100) = 100 ms | 100% | 156 s |
| Eight | max(40, 100) = 100 ms | 100% | 156 s |

The fourth process is the last one that helps. A faster accelerator that halves C leaves the one-loading-process pipeline at 320 ms a step, now busy 15.6% of the time. Measure before buying: in the plain loop, time the call that fetches a batch (L) and the training step (C), stopping the step's timer only after the accelerator has finished its queued work.

In PyTorch the loading side is `DataLoader`. `num_workers` is W; with the default 0, batches are built in the training process itself, which is the L + C row. `prefetch_factor` is how many batches each worker keeps ready, a buffer against slow batches rather than a speed setting. `pin_memory=True` puts finished batches in page-locked memory so the copy to the accelerator is faster, and `persistent_workers=True` keeps the workers alive between epochs instead of starting them again. The exercise's optional last part measures a real `DataLoader` against the forecast.

</details>

<!--mission-->
## Exercise: split, weight, threshold, then score the release

The script builds a synthetic catalogue, trains the same small network several ways and prints every number the chapter's release record uses. It needs PyTorch on a CPU and runs in about 10 seconds.

```python
import time
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader

S = 12                                                   # photos are 12 x 12 pixels, one channel
CATS = ["cable", "kettle", "lamp", "blade"]
FLAG_COST, MISS_COST = 2.0, 20.0                          # a reviewer's check; a blade sold without an age check
SHARE = torch.tensor([0.50, 0.30, 0.15, 0.05])           # blades are the rare category
SHAPES = torch.tensor([[[0, 0, 0], [1, 1, 1], [0, 0, 0]],   # cable
                       [[0, 1, 0], [0, 1, 0], [0, 1, 0]],   # kettle
                       [[0, 0, 1], [0, 1, 0], [1, 0, 0]],   # lamp
                       [[1, 0, 0], [0, 1, 0], [0, 0, 1]]]).float()  # blade

def make_products(n, gen):
    cat = torch.multinomial(SHARE, n, replacement=True, generator=gen)
    look = 1.5 * torch.randn(n, S, S, generator=gen)     # background and packaging: one per product
    look[:, 2:-2, 2:-2] = 0                              # ...around the border of every photo
    return cat, look

def photos(cat, look, gen, per_product=4):
    n = len(cat) * per_product
    x = look.repeat_interleave(per_product, 0) + 0.5 * torch.randn(n, S, S, generator=gen)
    y = cat.repeat_interleave(per_product)
    for i in range(n):                                   # the category's shape, somewhere in the middle
        r, c = torch.randint(2, S - 4, (2,), generator=gen).tolist()
        x[i, r:r + 3, c:c + 3] += 1.8 * SHAPES[y[i]]
    product = torch.arange(len(cat)).repeat_interleave(per_product)
    return x[:, None], y, product

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(1, 16, 3, padding=1)
        self.shape = nn.Linear(16, 4)                    # strongest response anywhere in the photo
        self.layout = nn.Linear(16 * S * S, 4)           # the whole map, border included
    def forward(self, x):
        h = F.relu(self.conv(x))
        return self.shape(h.amax(dim=(2, 3))) + self.layout(h.flatten(1))

def train(x, y, weight=None, epochs=8):
    torch.manual_seed(1)
    model = Net()
    opt = torch.optim.Adam(model.parameters(), lr=3e-3)
    loss_fn = nn.CrossEntropyLoss(weight=weight)
    for _ in range(epochs):
        for idx in torch.randperm(len(x)).split(64):
            opt.zero_grad()
            loss_fn(model(x[idx]), y[idx]).backward()
            opt.step()
    return model

def probs(model, x):
    with torch.no_grad():
        return F.softmax(model(x), dim=1)

def report(name, p, y, blade_threshold=None):
    """Two decisions: the category shown (argmax) and the age-check flag (blade score >= threshold)."""
    flagged = p.argmax(1) == 3 if blade_threshold is None else p[:, 3] >= blade_threshold
    blade = y == 3
    fp, fn = (flagged & ~blade).sum().item(), (~flagged & blade).sum().item()
    print(f"{name:34s} category accuracy {(p.argmax(1) == y).float().mean():.3f}  blade recall {(flagged & blade).sum() / blade.sum():.3f}"
          f"  false flags {fp:3d}  missed blades {fn:2d}  cost {FLAG_COST * fp + MISS_COST * fn:7.1f}")

class JpegFolder(Dataset):
    """Stands in for photos on disk: every item costs 2 ms of decoding."""
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __len__(self):
        return len(self.x)
    def __getitem__(self, i):
        time.sleep(0.002)
        return self.x[i], self.y[i]

def ms_per_step(loader, steps=12):
    it = iter(loader)
    for _ in range(4):                                   # warm up: start the workers, fill the queue
        next(it); time.sleep(0.020)
    start = time.perf_counter()
    for _ in range(steps):
        next(it)
        time.sleep(0.020)                                # stands in for forward + backward, C = 20 ms
    return 1000 * (time.perf_counter() - start) / steps

if __name__ == "__main__":
    gen = torch.Generator().manual_seed(0)
    cat, look = make_products(2500, gen)                 # the labelled catalogue: 10,000 photos
    x, y, product = photos(cat, look, gen)
    new_cat, new_look = make_products(500, gen)          # products listed after the model ships
    x_test, y_test, _ = photos(new_cat, new_look, gen)

    # 1. Split by photo, then by product.
    order = torch.randperm(len(x), generator=gen)
    held, rest = order[:2000], order[2000:]
    by_photo = train(x[rest], y[rest])
    sibling = torch.isin(product[held], product[rest]).float().mean()
    print(f"held-out photos whose product has a photo in training: {sibling:.3f}")
    val = product < 500                                  # 500 whole products held out
    by_product = train(x[~val], y[~val])
    acc = lambda m, xs, ys: (probs(m, xs).argmax(1) == ys).float().mean().item()
    print(f"split by photo:   held-out accuracy {acc(by_photo, x[held], y[held]):.3f}")
    print(f"split by product: held-out accuracy {acc(by_product, x[val], y[val]):.3f}")

    # 2. The rare category: accuracy, recall, and a class weight.
    x_val, y_val = x[val], y[val]
    print(f"never flag a blade, on validation: {(y_val != 3).float().mean():.3f} of photos answered right")
    counts = torch.bincount(y[~val], minlength=4).float()
    weight = counts.sum() / counts                       # inverse frequency
    print("class weights:", [round(w, 2) for w in weight.tolist()])
    weighted = train(x[~val], y[~val], weight=weight)
    report("unweighted, argmax", probs(by_product, x_val), y_val)
    report("weighted, argmax", probs(weighted, x_val), y_val)

    # 3. The threshold as a cost: FLAG_COST per false flag, MISS_COST per missed blade. Chosen on validation only.
    p_val = probs(by_product, x_val)
    grid = [0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001]
    cost = lambda t: FLAG_COST * ((p_val[:, 3] >= t) & (y_val != 3)).sum().item() + MISS_COST * ((p_val[:, 3] < t) & (y_val == 3)).sum().item()
    best = min(grid, key=cost)
    print("validation cost by blade threshold:", {t: round(cost(t), 2) for t in grid}, "-> chosen", best)

    # 4. The shop decides per listing: average its four photos, then choose on validation.
    def per_listing(p, labels):
        # photos() keeps each product's four photos together, including after the product split.
        return p.reshape(-1, 4, 4).mean(1), labels.reshape(-1, 4)[:, 0]

    listing_val, listing_y_val = per_listing(p_val, y_val)
    def listing_cost(t):
        flagged = listing_val[:, 3] >= t
        blade = listing_y_val == 3
        return FLAG_COST * (flagged & ~blade).sum().item() + MISS_COST * (~flagged & blade).sum().item()
    listing_best = min(grid, key=listing_cost)
    print("validation cost by LISTING threshold:", {t: listing_cost(t) for t in grid}, "-> chosen", listing_best)

    # 5. Score test data only after both thresholds are fixed. Photo rows are guided comparisons.
    report("TEST: split by photo, argmax", probs(by_photo, x_test), y_test)
    report("TEST: split by product, argmax", probs(by_product, x_test), y_test)
    report(f"TEST: per-photo, threshold {best}", probs(by_product, x_test), y_test, blade_threshold=best)

    listing_test, listing_y_test = per_listing(probs(by_product, x_test), y_test)
    report("LISTING TEST: argmax", listing_test, listing_y_test)
    report(f"LISTING TEST: shipped, t={listing_best}", listing_test, listing_y_test, blade_threshold=listing_best)
    listing_accuracy = (listing_test.argmax(1) == listing_y_test).float().mean().item()
    se = (listing_accuracy * (1 - listing_accuracy) / len(listing_y_test)) ** 0.5
    blades = listing_y_test == 3
    caught = ((listing_test[:, 3] >= listing_best) & blades).sum().item()
    print(f"release: {len(listing_y_test)} listings, accuracy SE {se:.3f}, blades caught {caught} of {blades.sum().item()}")

    # 6. The input pipeline: L = 32 x 2 ms per batch, C = 20 ms per step.
    ds = JpegFolder(x, y)
    for workers in (0, 1, 2, 4):
        loader = DataLoader(ds, batch_size=32, shuffle=True, num_workers=workers)
        forecast = 64 + 20 if workers == 0 else max(64 / workers, 20)
        print(f"num_workers={workers}: forecast {forecast:5.1f} ms/step, measured {ms_per_step(loader):5.1f}")
```

What each part does in real evaluation code:

- **`make_products` and `photos`** are the synthetic catalogue. Each product gets one random border, its "look", shared by its four photos; each photo gets its category's 3 × 3 shape at a random place in the middle plus fresh noise. The border carries no information about the category, which is what makes it a trap: a model can use it only by remembering products.
- **`Net`** is a one-layer convolutional network with two heads that are added together. `amax` keeps each filter's strongest response anywhere in the photo, which finds the shape wherever it sits; the `layout` head sees the whole feature map, border included, so it can also memorise a product's look. Real networks do not expose these routes as two labelled heads; the split here makes the shape route and the product-look route visible.
- **`train`** is the ordinary loop from chapter 1 with minibatches of 64. `nn.CrossEntropyLoss(weight=weight)` is the class weight; everything else is identical between runs, including the seed.
- **Part 1** holds out 2,000 photos at random, then 500 whole products (`product < 500`), and compares the two held-out accuracies. `torch.isin` counts how many random held-out photos have a sibling in training.
- **Part 2** computes inverse-frequency weights from the training labels only, trains a weighted model, and prints both models' blade recall on validation. `report` separates the two decisions: the category shown is the argmax; the flag is either the argmax being "blade" or the blade score clearing a threshold.
- **Part 3** is the cost sweep: for each candidate threshold, count false flags and missed blades on validation, price them, and keep the cheapest. Nothing in this part touches the test photos.
- **Part 4** averages the four softmax vectors per listing and chooses a separate threshold on validation listings. This synthetic generator keeps each product's four photos together, so reshaping is sufficient; real data must be grouped by product ID.
- **Part 5** scores the test data after both thresholds are fixed. The photo rows and listing argmax row are guided comparisons; the `LISTING TEST: shipped` row is the release result. The final line gives the listing count, accuracy standard error and caught/total blades. In a real release report only the chosen listing pipeline, without using the comparison rows to retune.
- **Part 6** (optional; nothing above depends on it) is a real `DataLoader` over a `Dataset` whose `__getitem__` sleeps 2 ms per photo, so L = 32 × 2 = 64 ms per batch, with a 20 ms sleep standing in for C. `ms_per_step` discards four warm-up steps, then averages twelve. The `if __name__ == "__main__":` guard is required where worker processes start by importing the script.

**Expected result.** PyTorch 2.14 on a CPU; the output is in the chapter's corpus. The recorded run used eight CPU threads. Training results can vary with the thread count or environment; the four measured timing lines also vary between runs.

```text
held-out photos whose product has a photo in training: 0.994
split by photo:   held-out accuracy 0.924
split by product: held-out accuracy 0.878
never flag a blade, on validation: 0.938 of photos answered right
class weights: [2.0, 3.24, 7.17, 19.23]
unweighted, argmax                 category accuracy 0.878  blade recall 0.266  false flags  25  missed blades 91  cost  1870.0
weighted, argmax                   category accuracy 0.865  blade recall 0.395  false flags  49  missed blades 75  cost  1598.0
validation cost by blade threshold: {0.5: 2062.0, 0.2: 1574.0, 0.1: 1426.0, 0.05: 1294.0, 0.02: 1266.0, 0.01: 1304.0, 0.005: 1432.0, 0.002: 1692.0, 0.001: 1936.0} -> chosen 0.02
validation cost by LISTING threshold: {0.5: 564.0, 0.2: 326.0, 0.1: 238.0, 0.05: 214.0, 0.02: 256.0, 0.01: 328.0, 0.005: 438.0, 0.002: 560.0, 0.001: 638.0} -> chosen 0.05
TEST: split by photo, argmax       category accuracy 0.873  blade recall 0.211  false flags  26  missed blades 60  cost  1252.0
TEST: split by product, argmax     category accuracy 0.886  blade recall 0.224  false flags  28  missed blades 59  cost  1236.0
TEST: per-photo, threshold 0.02    category accuracy 0.886  blade recall 0.711  false flags 337  missed blades 22  cost  1114.0
LISTING TEST: argmax               category accuracy 0.946  blade recall 0.211  false flags   5  missed blades 15  cost   310.0
LISTING TEST: shipped, t=0.05      category accuracy 0.946  blade recall 0.684  false flags  69  missed blades  6  cost   258.0
release: 500 listings, accuracy SE 0.010, blades caught 13 of 19
num_workers=0: forecast  84.0 ms/step, measured  87.2
num_workers=1: forecast  64.0 ms/step, measured  67.8
num_workers=2: forecast  32.0 ms/step, measured  33.9
num_workers=4: forecast  20.0 ms/step, measured  22.2
```

Read it against the chapter. The photo split promises 0.924 and new products give that model 0.873; the product split promises 0.878 and delivers 0.886, within its error bar. The weight lifts blade recall at a cost in accuracy; the threshold, chosen on validation, lifts it much further at test time without retraining. The listing step averages four photo scores before applying its separately chosen threshold of 0.05: it reports 0.946 accuracy, catches 13 of 19 blades and costs 258 against 310 for the listing argmax. The loader's measured steps sit a few milliseconds above the forecast, which is the per-batch overhead the formula leaves out.

Two things to try. First, add a random horizontal flip to the training loop, `xb = x[idx].clone(); flip = torch.rand(len(idx)) < 0.5; xb[flip] = torch.flip(xb[flip], dims=[-1])`, and train on `xb`: category accuracy stays at 0.878, blade recall on validation falls from 0.266 to 0.056, and 88 blade photos are shown as lamps instead of 26. Second, change `MISS_COST` to 5.0: missed blades are now cheap, the validation sweep chooses 0.2, and the per-photo row flags 73 photos by mistake and misses 52 blade photos, at a cost of 406.
