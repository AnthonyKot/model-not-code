# 95% Accuracy on a 95/5 Dataset Is the Baseline, Not a Result

You train a classifier to flag the rare case: a fraudulent payment, a failing part. In your data 95 rows in every 100 are the ordinary case. The first run reports 95% accuracy, which is exactly what a function returning `false` for every input scores. Accuracy counts a missed positive and a false alarm as one error each, so on a 95/5 split it says nothing about the 5.

The metric is the visible half. The other half is in training: the loss the optimiser minimises is a sum over rows, and 95 of every 100 terms belong to one class. This essay shows, on numbers you can check by hand, what answer that sum prefers and how a class weight changes it.

## The loss is a sum, and the majority writes most of it

For a binary classifier the usual loss is cross-entropy. For one row:

<p class="formula">ℓ = −[ y · ln p + (1 − y) · ln(1 − p) ]</p>

Term by term: y is the row's label, 1 for the rare class (the positive) and 0 for the ordinary one. p is the model's output, the probability it gives that the row is positive. When y = 1 only the first term survives and the loss is −ln p, large when p is near 0. When y = 0 only the second survives, −ln(1 − p), large when p is near 1. ℓ is that row's penalty, never negative.

The training loss adds ℓ over every row, or averages it, which has the same minimum. Every row enters the sum with the same weight of one, so 95 rows contribute 95 terms and 5 rows contribute 5.

The gradient says the same. A classifier produces p by passing a raw score z, the logit, through the sigmoid, p = σ(z), and the derivative of one row's cross-entropy with respect to its logit is p − y. A negative row pulls z down with strength p; a positive row pulls it up with strength 1 − p. The gradient on the model's bias is the sum of those pulls over all rows; on each other weight, every pull is first multiplied by the row's input value.

## Worked example: the best constant answer

The numbers below are the book's own. Take 100 rows, 95 negative and 5 positive, and a model that ignores the input and outputs the same p for every row. It is where a model with a bias lands when its inputs carry no useful signal.

The total loss is 95 copies of the negative row's loss plus 5 copies of the positive row's:

<p class="formula">L(p) = −[ 95 · ln(1 − p) + 5 · ln p ]</p>

Here 95 and 5 are the class counts, −ln(1 − p) is what each negative row pays, and −ln p what each positive row pays. To find the p that makes L smallest, set its derivative to zero. The derivative of −ln(1 − p) is 1/(1 − p) and of −ln p is −1/p, so:

<p class="formula">95 / (1 − p) − 5 / p = 0 &nbsp;⇒&nbsp; 5 · (1 − p) = 95 · p &nbsp;⇒&nbsp; p = 5 / 100 = 0.05</p>

The best constant is the base rate, 0.05. Check it with the gradient: the 95 negatives pull down with 95 × 0.05 = 4.75, the 5 positives pull up with 5 × 0.95 = 4.75, and the pulls cancel. At 0.05 every row is below the 0.5 cut-off, so every row is predicted negative. The loss did not fail; it found the minimum of the sum it was given.

Now the class weight: a number that multiplies every loss term of one class. It exists because the plain sum rewards being right about the common class, which is rarely the class you care about, and a weight changes that without touching the data. The usual convention is inverse frequency: total rows divided by that class's rows. Here that is 100/95 ≈ 1.053 for the negatives and 100/5 = 20 for the positives. Each class's weighted total is then the same: 95 × 100/95 = 100 and 5 × 20 = 100. The weighted loss is:

<p class="formula">L<sub>w</sub>(p) = −[ 100 · ln(1 − p) + 100 · ln p ]</p>

The derivative is 100/(1 − p) − 100/p, which is zero at p = 0.5. The same data, the same model, and the best answer has moved from 0.05 to 0.5.

| p | loss of one negative row, −ln(1 − p) | loss of one positive row, −ln p | unweighted total | weighted total |
|---|---|---|---|---|
| 0.05 | 0.0513 | 2.9957 | **19.85** | 304.70 |
| 0.2 | 0.2231 | 1.6094 | 29.25 | 183.26 |
| 0.5 | 0.6931 | 0.6931 | 69.31 | **138.63** |
| 0.8 | 1.6094 | 0.2231 | 154.01 | 183.26 |

Each unweighted total is 95 times the negative column plus 5 times the positive; each weighted total is 100 times both.

<figure class="diagram">
<svg viewBox="0 0 640 260" width="100%" role="img" aria-label="Average loss per row against the constant prediction p. The unweighted curve is low and flat with its minimum at p = 0.05; the weighted curve is a U with its minimum at p = 0.5" style="max-width:640px;font-family:inherit;font-size:13px">
  <g fill="none" stroke="currentColor" stroke-width="1">
    <line x1="60" y1="220" x2="600" y2="220"/>
    <line x1="60" y1="20" x2="60" y2="220"/>
  </g>
  <polyline fill="none" stroke="currentColor" stroke-width="2" points="62.7,202.0 65.4,204.0 70.8,205.7 76.2,206.4 81.6,206.7 87.0,206.8 97.8,206.5 114.0,205.7 141.0,203.4 168.0,200.5 195.0,197.2 222.0,193.4 249.0,189.2 276.0,184.6 303.0,179.5 330.0,173.8 357.0,167.4 384.0,160.3 411.0,152.1 438.0,142.6 465.0,131.2 492.0,117.3 519.0,99.3 546.0,73.8 562.2,51.3 573.0,30.1"/>
  <polyline fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" points="89.7,22.9 97.8,37.9 114.0,59.5 141.0,82.7 168.0,97.8 195.0,108.4 222.0,116.0 249.0,121.3 276.0,124.9 303.0,126.9 330.0,127.6 357.0,126.9 384.0,124.9 411.0,121.3 438.0,116.0 465.0,108.4 492.0,97.8 519.0,82.7 546.0,59.5 562.2,37.9 573.0,20.0"/>
  <g fill="currentColor">
    <circle cx="87.0" cy="206.8" r="4"/>
    <circle cx="330.0" cy="127.6" r="4"/>
    <text x="95" y="184">minimum at p = 0.05</text>
    <text x="330" y="148" text-anchor="middle">minimum at p = 0.5</text>
    <text x="400" y="190">unweighted (solid)</text>
    <text x="150" y="70">weighted (dashed)</text>
    <text x="60" y="238" text-anchor="middle">0</text>
    <text x="330" y="238" text-anchor="middle">0.5</text>
    <text x="600" y="238" text-anchor="middle">1</text>
    <text x="330" y="256" text-anchor="middle">constant prediction p</text>
    <text x="52" y="224" text-anchor="end">0</text>
    <text x="52" y="24" text-anchor="end">3</text>
    <text x="20" y="120" transform="rotate(-90 20 120)" text-anchor="middle">loss per row</text>
  </g>
</svg>
<figcaption>The two totals from the table divided by 100 rows, for every constant p. The weights do not scale the unweighted curve up; they give it a different shape with its bottom in a different place.</figcaption>
</figure>

The general rule, for any counts and weights, comes from the same derivative:

<p class="formula">p* = w<sub>1</sub> · n<sub>1</sub> / (w<sub>1</sub> · n<sub>1</sub> + w<sub>0</sub> · n<sub>0</sub>)</p>

n<sub>1</sub> and n<sub>0</sub> are the positive and negative counts, w<sub>1</sub> and w<sub>0</sub> their weights, p* the best constant. With both weights 1 it is the base rate; with inverse-frequency weights the products are equal and p* is 0.5. The weighted model is trained to the answer for a world where the classes are equally common, so on your real 95/5 test set its accuracy falls while its recall on the positives rises.

## What `pos_weight` does to each row

In PyTorch the binary loss is `nn.BCEWithLogitsLoss`, which takes the logit z rather than p. Its `pos_weight` argument multiplies only the positive term:

<p class="formula">ℓ = −[ w<sub>pos</sub> · y · ln σ(z) + (1 − y) · ln(1 − σ(z)) ]</p>

σ(z) is p, so this is the cross-entropy from above with one change: a positive row's loss, and so its pull on the gradient, is multiplied by `pos_weight`; a negative row is untouched. The conventional value is the ratio of counts, 95/5 = 19, which is the inverse-frequency pair (100/95, 20) times 0.95. Scaling every weight by one number does not move the minimum, so the best constant is again 0.5: the negatives pull down with 95 × 0.5 = 47.5, the positives up with 19 × 5 × 0.5 = 47.5.

For more than two classes the equivalent is `nn.CrossEntropyLoss(weight=…)`, which multiplies each row's loss by the weight of its true class. Its mean divides by the sum of those weights, not by the row count as `BCEWithLogitsLoss` does, so the logged losses of the two are not comparable even where the minimum is the same.

## What the weights cannot do

A weight adds no information. Five positive rows weighted by 19 are still five examples, and a mislabelled one now counts nineteen times.

The outputs also stop being frequencies. The weighted model's p is fitted to a balanced world and overstates how often positives occur in yours; anything downstream that reads p as a probability reads it wrong.

In the exercise below the weighted logistic model's two slopes barely change and its bias rises by 3.04, close to ln 19 = 2.94. Counting each positive 19 times makes the loss behave as if positives were 19 times as common, so the fitted odds are multiplied by 19, which adds ln 19 to the log-odds, and a free bias can absorb that alone. Because the ordering of rows by score hardly changes, most of what the weight buys at the 0.5 cut-off can also be had from the unweighted model with a lower cut-off (at a cut-off of 0.046 it also finds 77 positives, with 294 false alarms instead of 277); choosing that cut-off on the scores is a separate decision, and a Part III essay takes it up.

The alternative that leaves the loss alone is resampling, which changes the data instead: oversampling copies minority rows, undersampling drops majority rows. In a full-batch sum each positive appearing 19 times adds exactly the terms a weight of 19 adds; undersampling discards rows you paid for. Resample only the training set, never the rows you evaluate on. More real examples of the rare class are the remedy that adds information instead of redistributing it.

<!--mission-->
## Exercise: fit it with and without the weight

The script runs on a CPU in seconds with PyTorch as the only dependency: the per-row effect, the best constant, then a logistic model on 2,000 synthetic rows split 95/5.

```python
import torch
import torch.nn as nn

torch.manual_seed(0)


def make_data(n_neg, n_pos):
    """Two features; negatives centred at (0, 0), positives at (1.5, 1.5); both clouds overlap."""
    x = torch.cat([torch.randn(n_neg, 2), torch.randn(n_pos, 2) + 1.5])
    y = torch.cat([torch.zeros(n_neg), torch.ones(n_pos)])
    return x, y


# 1. What pos_weight does to one row's loss term
logits = torch.tensor([0.0, 0.0])          # both rows predicted at probability 0.5
labels = torch.tensor([0.0, 1.0])          # one negative row, one positive row
for pw in (1.0, 19.0):
    per_row = nn.BCEWithLogitsLoss(pos_weight=torch.tensor(pw), reduction="none")(logits, labels)
    print(f"pos_weight {pw:>4}: per-row loss [negative, positive] = {[round(v, 4) for v in per_row.tolist()]}")
mean_bce = nn.BCEWithLogitsLoss(pos_weight=torch.tensor(19.0))(logits, labels)
mean_ce = nn.CrossEntropyLoss(weight=torch.tensor([1.0, 19.0]))(torch.zeros(2, 2), labels.long())
print(f"mean over the two rows: BCEWithLogitsLoss {mean_bce.item():.4f}, CrossEntropyLoss {mean_ce.item():.4f}")

# 2. The best constant predictor on 95 negatives and 5 positives
y100 = torch.cat([torch.zeros(95), torch.ones(5)])
for pw in (1.0, 19.0):
    b = torch.zeros(1, requires_grad=True)                  # the model is one number: a bias
    loss_fn = nn.BCEWithLogitsLoss(pos_weight=torch.tensor(pw))
    opt = torch.optim.LBFGS([b], max_iter=100)

    def closure():
        opt.zero_grad()
        loss = loss_fn(b.expand(100), y100)
        loss.backward()
        return loss

    opt.step(closure)
    print(f"pos_weight {pw:>4}: bias {b.item():.4f}, constant prediction {torch.sigmoid(b).item():.4f}")

# 3. A logistic model on 2,000 rows, 95/5, with and without the weight
x_train, y_train = make_data(1900, 100)
x_test, y_test = make_data(1900, 100)
pos_weight = (y_train == 0).sum() / (y_train == 1).sum()    # 1900 / 100 = 19
print(f"pos_weight from the counts: {pos_weight.item():.1f}")

for name, loss_fn in [("unweighted", nn.BCEWithLogitsLoss()),
                      ("pos_weight", nn.BCEWithLogitsLoss(pos_weight=pos_weight))]:
    torch.manual_seed(1)
    model = nn.Linear(2, 1)
    opt = torch.optim.Adam(model.parameters(), lr=0.05)
    for step in range(2000):
        opt.zero_grad()
        loss = loss_fn(model(x_train).squeeze(1), y_train)
        loss.backward()
        opt.step()

    with torch.no_grad():
        p_test = torch.sigmoid(model(x_test).squeeze(1))
    pred = (p_test > 0.5).float()
    tn = ((pred == 0) & (y_test == 0)).sum().item()
    fp = ((pred == 1) & (y_test == 0)).sum().item()
    fn = ((pred == 0) & (y_test == 1)).sum().item()
    tp = ((pred == 1) & (y_test == 1)).sum().item()
    print(f"\n{name}: weights {[round(v, 3) for v in model.weight.squeeze().tolist()]}, bias {model.bias.item():.3f}")
    print(f"  mean predicted probability on test rows: {p_test.mean().item():.3f}")
    print(f"  confusion matrix at 0.5 (rows = actual neg, pos; cols = predicted neg, pos): [[{tn}, {fp}], [{fn}, {tp}]]")
    print(f"  recall: negative {tn / (tn + fp):.3f}, positive {tp / (tp + fn):.3f}; accuracy {(tn + tp) / len(y_test):.3f}")
```

What each part does:

- **`make_data`** builds two overlapping clouds, so no line separates the classes and the model must trade one error for the other. The test set is drawn separately at the same 95/5, because the data you evaluate on is never rebalanced.
- **`reduction="none"`** returns one loss per row instead of the mean, which is how you see a weight act on a row: at logit 0 both rows cost ln 2, and `pos_weight` 19 multiplies only the positive row.
- **The two means** show the reduction difference: `BCEWithLogitsLoss` divides the per-row sum by two rows, `CrossEntropyLoss(weight=…)` by the weight sum 1 + 19 = 20.
- **Section 2** is the worked example as code: a model that is only a bias, `b.expand(100)` giving every row the same logit, fitted with LBFGS, which solves a one-parameter problem in a few iterations.
- **`pos_weight = n_neg / n_pos`** is the conventional value, computed from the training labels.
- **The training loop** is ordinary full-batch training of `nn.Linear(2, 1)`, a logistic regression once its output goes through the sigmoid. Only the loss object differs between the runs; the seed is reset so both start from the same weights.
- **The confusion matrix** is four counts at the 0.5 cut-off. Each class's recall is its row's diagonal count over the row total, the number accuracy averages away.

**Expected result.** Run with PyTorch 2.14 on a CPU; the full output is in the essay's corpus. Per-row losses `[0.6931, 0.6931]` and `[0.6931, 13.1698]`; means `BCEWithLogitsLoss 6.9315, CrossEntropyLoss 0.6931`. The constant model prints `bias -2.9443, constant prediction 0.0500` unweighted and `bias 0.0000, constant prediction 0.5000` with `pos_weight` 19. The unweighted logistic model prints `weights [1.605, 1.193], bias -5.090`, `[[1890, 10], [74, 26]]`, `recall: negative 0.995, positive 0.260; accuracy 0.958`: 26 of 100 positives found, less than a point above the always-negative 0.950. With the weight: `weights [1.518, 1.185], bias -2.050`, `[[1623, 277], [23, 77]]`, `recall: negative 0.854, positive 0.770; accuracy 0.850`, and the mean predicted probability rises from `0.044` to `0.238`. Then try `pos_weight` 5 and 50: the bias moves to about −3.43 and −1.09, the negative and positive recalls to 0.963 and 0.570, then 0.723 and 0.860, while the slopes stay close to where they were.

*Sources: the Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 6.2, 6.3 and 15.2, paraphrased as study material; Chip Huyen, Designing Machine Learning Systems, O'Reilly early release (third release, 2022), pp. 120–133; PyTorch documentation for `BCEWithLogitsLoss` and `CrossEntropyLoss`, as of version 2.14.*
