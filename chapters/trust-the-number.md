# Trust the Number Before You Ship the Classifier

Sellers list products on the shop from chapter 1 by uploading photos, usually four per product: front, side, box, label. A classifier looks at the photos and suggests the category, so a kettle lands under kettles without a person reading the listing. One category carries a rule: **blades** need an age check at checkout. A blade listed as a lamp is sold to anyone.

The first training run prints 92.4% accuracy on held-out photos. This chapter is about what that number claims, and what it has to become before the shop ships the model. The evaluation changes six times along the way: the split, the count of how often you looked at the result, a row of its own for the rare category, prices for the two kinds of mistake, a check on augmentation, and a pipeline fast enough to run the whole evaluation more than once. None of those changes touches the model's architecture.

Everything here runs on synthetic photos: 12 × 12 pixels, four categories, a shape in the middle that says the category and a border that stands in for a product's background and packaging. They are small enough to train in seconds and built so that each failure is visible. The last section lists what a release evaluation on real photos adds.

## What a held-out accuracy claims

**Accuracy** is the fraction of held-out photos whose predicted category is right. It is an estimate of a number you cannot compute: the fraction the model would get right on the photos the shop will actually receive. Like any estimate from a sample, it moves when the sample changes. For a true accuracy p measured on n independent items, the typical size of that movement is the **standard error**:

<p class="formula">SE = √( p · (1 − p) / n )</p>

p is the true accuracy and 1 − p the error rate; their product is the variance of one right-or-wrong outcome. Dividing by n gives the variance of an average of n such outcomes, and the square root returns to accuracy's units. At p = 0.878 on 2,000 photos, SE = √(0.878 × 0.122 / 2,000) = 0.0073.

The formula assumes the 2,000 outcomes are independent, and here they are not. The 2,000 photos show 500 products, four photos each, and photos of one product share a background and a shape, so their outcomes rise and fall together. Counting products instead, SE = √(0.878 × 0.122 / 500) = 0.0146. The honest error bar lies between the two, and two models that differ by one percentage point on this set may be the same model.

Three splits give the numbers different jobs. The **training** split fits the weights and anything else fitted from data, such as the mean and spread a normaliser subtracts and divides by; compute those on training rows only, or the evaluation rows shape the inputs. The **validation** split is where you compare settings, checkpoints and thresholds. The **test** split is scored once, after every choice is fixed, and gives the number you report.

## Split by product, not by photo

The 92.4% came from holding out 20% of the photos at random. A held-out photo's product has three other photos, and each landed in training with probability 0.8, so the chance that at least one sibling is in training is 1 − 0.2<sup>3</sup> = 0.992. The exercise measures 0.994. Nearly every "unseen" photo belongs to a product the model has already seen from another side.

<figure class="diagram">
<svg viewBox="0 0 640 210" width="100%" role="img" aria-label="Two ways to split the same three products with four photos each. Split by photo: photos of every product are scattered across training and held out. Split by product: product C's four photos are all held out, products A and B are all in training." style="max-width:640px;font-family:inherit;font-size:13px">
  <g fill="currentColor" text-anchor="middle">
    <text x="160" y="20" font-weight="700">split by photo</text>
    <text x="480" y="20" font-weight="700">split by product</text>
    <text x="30" y="62">A</text><text x="30" y="112">B</text><text x="30" y="162">C</text>
    <text x="350" y="62">A</text><text x="350" y="112">B</text><text x="350" y="162">C</text>
  </g>
  <g stroke="currentColor" stroke-width="1.2">
    <rect x="50" y="42" width="40" height="34" rx="4" fill="none"/><rect x="100" y="42" width="40" height="34" rx="4" fill="none"/><rect x="150" y="42" width="40" height="34" rx="4" fill="currentColor" fill-opacity="0.35"/><rect x="200" y="42" width="40" height="34" rx="4" fill="none"/>
    <rect x="50" y="92" width="40" height="34" rx="4" fill="currentColor" fill-opacity="0.35"/><rect x="100" y="92" width="40" height="34" rx="4" fill="none"/><rect x="150" y="92" width="40" height="34" rx="4" fill="none"/><rect x="200" y="92" width="40" height="34" rx="4" fill="none"/>
    <rect x="50" y="142" width="40" height="34" rx="4" fill="none"/><rect x="100" y="142" width="40" height="34" rx="4" fill="none"/><rect x="150" y="142" width="40" height="34" rx="4" fill="none"/><rect x="200" y="142" width="40" height="34" rx="4" fill="currentColor" fill-opacity="0.35"/>
    <rect x="370" y="42" width="40" height="34" rx="4" fill="none"/><rect x="420" y="42" width="40" height="34" rx="4" fill="none"/><rect x="470" y="42" width="40" height="34" rx="4" fill="none"/><rect x="520" y="42" width="40" height="34" rx="4" fill="none"/>
    <rect x="370" y="92" width="40" height="34" rx="4" fill="none"/><rect x="420" y="92" width="40" height="34" rx="4" fill="none"/><rect x="470" y="92" width="40" height="34" rx="4" fill="none"/><rect x="520" y="92" width="40" height="34" rx="4" fill="none"/>
    <rect x="370" y="142" width="40" height="34" rx="4" fill="currentColor" fill-opacity="0.35"/><rect x="420" y="142" width="40" height="34" rx="4" fill="currentColor" fill-opacity="0.35"/><rect x="470" y="142" width="40" height="34" rx="4" fill="currentColor" fill-opacity="0.35"/><rect x="520" y="142" width="40" height="34" rx="4" fill="currentColor" fill-opacity="0.35"/>
  </g>
  <g fill="currentColor" font-size="12">
    <rect x="50" y="190" width="14" height="12" fill="none" stroke="currentColor"/><text x="70" y="200">training photo</text>
    <rect x="190" y="190" width="14" height="12" fill="currentColor" fill-opacity="0.35" stroke="currentColor"/><text x="210" y="200">held-out photo</text>
    <text x="370" y="200">every held-out photo is of a product training never saw</text>
  </g>
</svg>
<figcaption>The same twelve photos split two ways. On the left, every held-out photo has three siblings in training; on the right, the held-out product is new, which is what a live listing is.</figcaption>
</figure>

A model can score well on such photos by recognising the product rather than its category: the background the seller always uses, the box, the lighting. That skill is worth nothing on the day a new product is listed, because the shop never asks the model about a product it was trained on. In the exercise the same model and data give 0.924 when split by photo and 0.878 when 500 whole products are held out. On 2,000 photos of products listed later, the photo-split model scores 0.873. The split by product predicted that; the split by photo promised 5 points that did not exist.

The rule is to split by the unit the live system predicts for. Here that is a new product, so every photo of a product goes to the same side. When the catalogue changes over time, split by listing date as well: train on products listed before a cut-off and evaluate on products listed after it, because the shop's next month is never a random sample of its last year. Remove duplicates before splitting: the same stock photo uploaded by two sellers is one item, not two.

The same failure has a second form, in the columns rather than the rows. Suppose you feed the model the listing's text fields alongside the photos, and the historical table has a field `age_check_required`. In that table it identifies blades almost perfectly. It is also filled in by a reviewer *after* the listing has been categorised, so at the moment a seller uploads photos it is empty. A model trained with it learns to read the answer from a column that will not exist when it has to answer. For every input, ask one question: does this value exist at the moment the prediction is made? Build training rows from values as they stood at that moment, and treat a test score much better than the first weeks in production as a sign that some input did not.

## Every look at the test set spends it

The split is fixed; now you tune. You try twelve settings of learning rate and epochs, score each on the same 500 validation photos, and keep the best. Suppose all twelve are equally good, with a true accuracy of 0.88. Each validation score is 0.88 plus sampling error, and taking the maximum picks the setting whose error happened to be most favourable. To size the effect, treat the twelve scores as independent. One setting's number of right answers X on 500 photos is then binomial, and a score of at least 0.90 needs X ≥ 450, which has probability 0.0932. None of twelve reaches it with probability (1 − 0.0932)<sup>12</sup> = 0.3091, so the best does with probability 0.6909.

| | One setting | Best of twelve |
|---|---|---|
| Mean validation score | 0.880 | 0.903 |
| Chance the score shown is at least 0.90 | 9.3% | 69.1% |
| The chosen setting's score on 500 fresh photos | 0.880 | 0.880 |

The best of twelve reports 0.903 on average and is still 0.880 on photos it was not chosen on; with equal settings, the choice added nothing but a 2.3-point promise. Settings scored on the same photos share some of their errors, which shrinks the effect below this independent calculation without removing it. This is the **winner's curse**, and it grows with the number of candidates and shrinks with the size of the validation set, in units of the standard error from the first section. Settings of unequal quality do get sorted by the comparison; the winning score is inflated all the same. Keeping the checkpoint with the lowest validation loss, which save-best logic does automatically, is the same selection repeated every epoch.

So the test set is scored once, at the end. If its number changes a decision (another setting, one more feature), it has become a second validation set, and an unbiased number needs photos no choice has touched.

The same reasoning applies to numbers other people publish. The pretrained backbone chapter 3 will start from comes with a score on a public benchmark. That score was measured on one fixed, public test set that many teams have tuned against, and public test items can end up in the training data of later models. It is evidence about that test set. The number that decides whether the shop ships is the one measured on the shop's own products, split as above.

## The rare category: right 95% of the time by never flagging

Blades are 5% of listings. A flagger that never flags answers the question "does this listing need an age check?" correctly 95% of the time, and on the exercise's validation photos, where blades happen to be 6.2%, it scores 0.938. Overall accuracy averages away the one row the rule exists for. The imbalance comes from the shop's mix of products, not from the method: a public dataset of malaria cell images used to teach the same classification pipeline has equal numbers of infected and uninfected cells, and there a model that never says "infected" scores 50%. Report each category's **recall**: of the photos that truly are blades, the fraction the model called blades.

The cause is in training as well as in the metric. The loss is a sum over rows, and 95 of every 100 rows are not blades. Take the blade question alone, 950 other listings and 50 blades, and a model that ignores the photo and gives every listing the same blade probability p. Its cross-entropy is:

<p class="formula">L(p) = −[ 950 · ln(1 − p) + 50 · ln p ]</p>

950 and 50 are the counts. −ln(1 − p) is what each other listing pays for being given blade probability p, and −ln p is what each blade pays. Setting the derivative, 950/(1 − p) − 50/p, to zero gives p = 50/1,000 = 0.05. Check it with the gradient from chapter 1, p − y per row: the 950 others pull the score down with 950 × 0.05 = 47.5 and the 50 blades pull it up with 50 × 0.95 = 47.5. At 0.05 every listing is below 0.5, so nothing is flagged. The optimiser found the minimum of the loss it was given.

A **class weight** multiplies every loss term of one class, so the rare class writes more of the sum. For a yes-or-no output PyTorch spells it `nn.BCEWithLogitsLoss(pos_weight=torch.tensor(19.0))`: each blade's term counts 950/50 = 19 times. The pulls at 0.5 are then 950 × 0.5 = 475 down and 19 × 50 × 0.5 = 475 up, so the best constant moves from 0.05 to 0.5. For the four-category model the equivalent is `nn.CrossEntropyLoss(weight=w)`, which multiplies each row's loss by the weight of its true category; the exercise uses total count ÷ category count over its 8,000 training photos:

| Category | Training photos | Weight |
|---|---|---|
| cable | 3,996 | 8,000 ÷ 3,996 = 2.00 |
| kettle | 2,472 | 8,000 ÷ 2,472 = 3.24 |
| lamp | 1,116 | 8,000 ÷ 1,116 = 7.17 |
| blade | 416 | 8,000 ÷ 416 = 19.23 |

Its mean divides by the sum of the weights in the batch, not by the number of rows, so weighted and unweighted loss values are not comparable in a log.

On the exercise's validation photos the weight raises blade recall from 0.266 to 0.395 and lowers category accuracy from 0.878 to 0.865. It does not add information: 50 blades counted 19 times are still 50 examples, and a blade photo mislabelled as a lamp now counts 19 times too. And the weighted model's scores stop being frequencies: it was trained for a world where blades are as common as everything else, so its blade score overstates how often a listing is a blade. More labelled blades are the remedy that adds information. The next section shows a lever that turned out cheaper here.

## The model outputs a score; the shop chooses the threshold

The classifier's last layer produces a score per category, and a softmax turns them into four numbers that add up to one. "Flag for an age check" is a separate decision on one of them: flag when the blade score is at least a **threshold** t. Showing the most likely category is the default, and it flags a blade only when the blade score beats the other three, which on these photos means rarely.

The two mistakes cost different amounts. A false flag sends a harmless listing to a reviewer, say 2 per check. A missed blade is a blade sold without an age check, say 20. Both prices are invented here; in a real shop somebody in operations or compliance has to name them, and until then the threshold is a guess. With them, the threshold becomes a calculation. Ten listings, sorted by blade score:

| Blade score | 0.92 | 0.61 | 0.40 | 0.18 | 0.12 | 0.07 | 0.05 | 0.03 | 0.02 | 0.01 |
|---|---|---|---|---|---|---|---|---|---|---|
| Is a blade | yes | no | yes | no | yes | no | no | yes | no | no |

| Threshold t | Flagged | False flags | Missed blades | Cost, 2 × false + 20 × missed |
|---|---|---|---|---|
| 0.5 | 2 | 1 | 3 | 62 |
| 0.2 | 3 | 1 | 2 | 42 |
| 0.1 | 5 | 2 | 1 | 24 |
| 0.03 | 8 | 4 | 0 | 8 |
| 0.01 | 10 | 6 | 0 | 12 |

The cheapest threshold is 0.03, far from the 0.5 you get by default. If the scores were true probabilities, the break-even would follow from the prices alone: flagging a listing with blade probability p costs 2 × (1 − p) in expected false flags and saves 20 × p in expected misses, so flag when 20p > 2(1 − p), that is p > 2/22 = 0.091.

Scores from a trained network need not be true probabilities, which is why the threshold is chosen on validation photos by computing the cost at each candidate, not by formula. In the exercise the validation sweep picks 0.02. The reason is measurable: of the 209 validation photos whose blade score lies between 0.02 and 0.091, 12.0% are blades, above the 9.1% at which flagging pays. The scores understate how often those listings are blades, and the cost sweep corrects for it without anyone having to know why.

On the test photos, scored once, the choice holds up. Showing the most likely category flags blades with recall 0.224 and costs 1,236; the same model with the blade threshold at 0.02 reaches recall 0.711 and costs 1,114. The weight was not needed for that. On validation, the weighted model at its default decision cost 1,598, and the unweighted model with a chosen threshold cost 1,266. Here the threshold was the cheaper lever: it needs no retraining, and it leaves the scores as they were. The cost of that recall is also on the printout: 337 false flags among 2,000 test photos, a queue somebody has to staff, which is a cost the formula only counts if you price it.

Every count so far treats each photo as a decision, but the shop flags listings, and a listing has four photos. So the evaluation needs one more rule and one more pass at that unit. Average each listing's four sets of category scores, then choose the blade threshold on the 500 validation listings with the same prices. On the 500 test listings, category accuracy is 0.946, the chosen threshold of 0.05 catches 13 of the 19 blades, recall 0.684, and the cost is 258 against 310 for showing the most likely category, with 69 false flags. Nineteen blades make that recall an estimate with a wide error bar, about ±0.11. Averaging is itself a choice, to be compared on validation with alternatives such as taking the highest blade score among the four photos. Report the release at the unit the shop decides on.

Two numbers people report alongside a threshold behave differently when blades become rarer or more common. **Recall** (true positive rate) is computed among blades and **false positive rate** among everything else, so neither depends on how many blades there are. **Precision**, the fraction of flags that are blades, mixes the two groups:

<p class="formula">precision = TPR · π / (TPR · π + FPR · (1 − π))</p>

TPR is recall, FPR the false positive rate, and π the share of listings that are blades. TPR · π is the share of all listings that are correctly flagged blades; FPR · (1 − π) the share that are wrongly flagged. At TPR 0.8 and FPR 0.1, precision is 0.889 on a test set that is half blades and 0.296 on a catalogue where they are 5%. The same model and threshold give both numbers, so an evaluation set balanced for convenience flatters precision. A **ROC curve** plots TPR against FPR and a **precision–recall curve** plots precision against recall, one point per threshold. When the positive class is rare, the precision–recall curve is the one that shows what the flags will look like.

## Augmentation is a claim about your labels

With few photos per category, the usual next step is **augmentation**: during training, each photo is sometimes replaced by a transformed copy, mirrored or tilted or brightened, under the same label:

<p class="formula">(x, y) → (T(x), y)</p>

x is the photo, T a transform, y the label, and the label is unchanged on both sides of the arrow. That is a statement the pipeline never checks: *the correct category of T(x) is y*. A horizontal flip declares that a mirrored product has the same category. For a kettle or a cable, true. For the exercise's photos it is false in one place: the blade's shape is a diagonal and the lamp's is the other diagonal, so a mirrored blade is, pixel for pixel, a lamp's shape labelled "blade". Train with a random horizontal flip on half the photos and category accuracy stays at 0.878, because cables and kettles gain what blades and lamps lose. Blade recall falls from 0.266 to 0.056, and blades shown as lamps rise from 26 to 88. The overall number did not move; the rare row collapsed.

Real product photos have the same trap in smaller places: scissors and guitars come in left- and right-handed versions that are mirror images of each other. A transform can also keep the label and still mislead: if the photos sellers upload are upright, a 180° rotation trains on photos unlike the ones the model will be asked about, and a mirrored box shows backwards print. Check a sample of real uploads before ruling a transform in or out. Whether a transform is honest depends on the label, not the photo:

| Transform | Category | Handedness attribute | Colour attribute |
|---|---|---|---|
| Horizontal flip | keeps it, except shapes that mirror into another category | changes it | keeps it |
| Upside down | keeps it; check whether uploads ever look like this | keeps it; same check | keeps it; same check |
| Tilt of a few degrees | keeps it | keeps it | keeps it |
| Hue shift | keeps it | keeps it | changes it |

Augment only training batches, with a fresh random draw each time a photo is presented; validation and test photos stay as uploaded, because they stand in for what sellers send. Add one transform at a time and keep it only if validation recall improves for every category you care about, not only overall accuracy. And look at a batch of augmented photos before training on them.

## The GPU waits on the JPEG decoder

Every section so far ends in "train again and compare", so how fast one training run goes decides how many honest comparisons you can afford. Real product photos arrive as JPEG files that have to be read, decoded, resized and augmented on the CPU before the accelerator sees a tensor.

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

In PyTorch the loading side is `DataLoader`. `num_workers` is W; with the default 0, batches are built in the training process itself, which is the L + C row. `prefetch_factor` is how many batches each worker keeps ready, a buffer against slow batches rather than a speed setting. `pin_memory=True` puts finished batches in page-locked memory so the copy to the accelerator is faster, and `persistent_workers=True` keeps the workers alive between epochs instead of starting them again. The exercise's last lines measure a real `DataLoader` against the forecast.

## What the release evaluation reports

The number that started the chapter, 92.4% on random photos, is replaced by a record like this one, each line tied to a decision:

| Claim | How it was measured | Measured value, synthetic |
|---|---|---|
| Category accuracy on new products | Split by product (and by listing date on real data), scored per listing, test scored once | 0.946 on 500 test listings (0.886 per photo) |
| Its uncertainty | Standard error on listings, not photos | about ±0.010 |
| The rare category | Per-category recall, not overall accuracy | blade recall 0.684, 13 of 19 blades, at the chosen threshold |
| The flag threshold | Minimum cost on validation listings, prices named by the business | 0.05; test cost 258 against 310 at the default |
| Its side effects | False flags per 500 listings, the review queue | 69 |
| Augmentation | One transform at a time, kept only if per-category recall improved | horizontal flip rejected |
| Inputs | Every feature available at listing time | photos only |

Synthetic photos cannot tell you four things a real release needs. Real photos vary in ways no generator was told about: phone cameras, lighting, a seller's watermark. Real labels are noisy, because sellers miscategorise and reviewers disagree, so the test set's labels need their own check. The prices of the two mistakes are guesses until the people who pay them name them. And the mix of listings changes after launch, with new product lines, which is where chapter 5 picks the classifier up again.

<!--mission-->
## Exercise: split, weight, threshold, then time the loader

The script builds a synthetic catalogue, trains the same small network several ways and prints every number the release record above uses. It needs PyTorch on a CPU and runs in about 10 seconds.

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

    # 4. One look at the test set, with every choice fixed.
    report("TEST: split by photo, argmax", probs(by_photo, x_test), y_test)
    report("TEST: split by product, argmax", probs(by_product, x_test), y_test)
    report(f"TEST: shipped, blade threshold {best}", probs(by_product, x_test), y_test, blade_threshold=best)

    # 5. The input pipeline: L = 32 x 2 ms per batch, C = 20 ms per step.
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
- **Part 4** scores the test photos after the choices are fixed. The shipped row is the release number; the two argmax rows are printed only so you can see what the alternatives would have measured. In a real release you would print the shipped row alone.
- **Part 5** is a real `DataLoader` over a `Dataset` whose `__getitem__` sleeps 2 ms per photo, so L = 32 × 2 = 64 ms per batch, with a 20 ms sleep standing in for C. `ms_per_step` discards four warm-up steps, then averages twelve. The `if __name__ == "__main__":` guard is required where worker processes start by importing the script.

**Expected result.** PyTorch 2.14 on a CPU; the output is in the chapter's corpus. Every number except the four timing lines is deterministic; the measured timings vary by a few milliseconds between runs.

```text
held-out photos whose product has a photo in training: 0.994
split by photo:   held-out accuracy 0.924
split by product: held-out accuracy 0.878
never flag a blade, on validation: 0.938 of photos answered right
class weights: [2.0, 3.24, 7.17, 19.23]
unweighted, argmax                 category accuracy 0.878  blade recall 0.266  false flags  25  missed blades 91  cost  1870.0
weighted, argmax                   category accuracy 0.865  blade recall 0.395  false flags  49  missed blades 75  cost  1598.0
validation cost by blade threshold: {0.5: 2062.0, 0.2: 1574.0, 0.1: 1426.0, 0.05: 1294.0, 0.02: 1266.0, 0.01: 1304.0, 0.005: 1432.0, 0.002: 1692.0, 0.001: 1936.0} -> chosen 0.02
TEST: split by photo, argmax       category accuracy 0.873  blade recall 0.211  false flags  26  missed blades 60  cost  1252.0
TEST: split by product, argmax     category accuracy 0.886  blade recall 0.224  false flags  28  missed blades 59  cost  1236.0
TEST: shipped, blade threshold 0.02 category accuracy 0.886  blade recall 0.711  false flags 337  missed blades 22  cost  1114.0
num_workers=0: forecast  84.0 ms/step, measured  89.3
num_workers=1: forecast  64.0 ms/step, measured  68.8
num_workers=2: forecast  32.0 ms/step, measured  34.2
num_workers=4: forecast  20.0 ms/step, measured  21.8
```

Read it against the chapter. The photo split promises 0.924 and new products give that model 0.873; the product split promises 0.878 and delivers 0.886, within its error bar. The weight lifts blade recall at a cost in accuracy; the threshold, chosen on validation, lifts it much further at test time without retraining. The loader's measured steps sit a few milliseconds above the forecast, which is the per-batch overhead the formula leaves out.

Two things to try. First, add a random horizontal flip to the training loop, `xb = x[idx].clone(); flip = torch.rand(len(idx)) < 0.5; xb[flip] = torch.flip(xb[flip], dims=[-1])`, and train on `xb`: category accuracy stays at 0.878, blade recall on validation falls from 0.266 to 0.056, and 88 blade photos are shown as lamps instead of 26. Second, change `MISS_COST` to 5.0: missed blades are now cheap, the validation sweep chooses 0.2, and the shipped row flags 73 photos by mistake and misses 52 blade photos, at a cost of 406.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 3.9, 3.11, 4.3, 6.2, 6.3, 6.4, 7.4, 8.5, 11.4, 11.5 and 15.2; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 4.4 and 7.20; all paraphrased as study material. Chip Huyen, Designing Machine Learning Systems, early release, pp. 116, 120–133, 163–166 and 223 (physical); Daniel Vaughan, Data Science: The Hard Parts, pp. 139–143 (physical); Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 146–151, 367 and 468–469 (physical); Yuan Tang, Distributed Machine Learning Patterns, pp. 29 and 59–60; the PyTorch 2.14 documentation and source for CrossEntropyLoss and DataLoader.*
