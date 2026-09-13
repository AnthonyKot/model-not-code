# You Only Get to Look at the Test Set Once

A validation set contains examples you reserve for choosing between models. Its accuracy—the fraction of answers a model gets right—varies with the examples drawn. Choosing the highest score also selects favourable sampling error: the chance difference between measured and true accuracy. This upward bias is the **winner's curse**. You need a separate test set, unused in choosing, to estimate the chosen model's accuracy without that bias.

## Two checkpoints, two items

Take two **checkpoints**, saved versions of a model, whose true accuracy is 0.5: each gets half the items right on unlimited data from the same source. On two validation items, each gets 0, 1 or 2 right with probabilities 1/4, 1/2 and 1/4. Assume independent draws, so knowing either score gives no information about the other. You keep the higher score.

| Reported best | Pairs of scores that produce it | Probability |
|---|---|---|
| 0/2 | (0, 0) | 1/4 × 1/4 = 1/16 |
| 1/2 | (0, 1), (1, 0), (1, 1) | 1/8 + 1/8 + 1/4 = 8/16 |
| 2/2 | any pair containing a 2 | 1 − (3/4)<sup>2</sup> = 7/16 |

The expected best accuracy, its average over repeated trials, is 0 × 1/16 + 0.5 × 8/16 + 1 × 7/16 = 11/16 = 0.6875. On two fresh, independent items the winner's expected accuracy remains 0.5. Selection alone produced the 0.1875 gap.

Now take six independent checkpoints, all truly 0.5, and twenty items. One scores 13 or more with probability 137,980 / 1,048,576 = 0.1316: the number of ways to get 13 to 20 heads in 20 tosses, divided by all 2<sup>20</sup> outcomes. None of six reaches that score with probability 0.8684<sup>6</sup> = 0.4289; at least one does with probability 1 − 0.4289 = 0.5711. More often than not, your best validation score is at least 65%. On twenty fresh items, whichever checkpoint you chose still averages 10 of 20 correct.

## How much a score varies

For true accuracy p and n independent items from the same source, **standard error**, SE, measures the typical sampling error in accuracy:

<p class="formula">SE = √( p · (1 − p) / n )</p>

p is true accuracy and 1 − p the error rate. Their product is the variance of one outcome, coded 1 for right and 0 for wrong; variance measures average squared deviation from the mean. Dividing by n gives the variance of the average. The square root restores accuracy's units. The product is largest at p = 0.5.

At p = 0.8 and n = 200, SE = √(0.16 / 200) = √0.0008 = 0.0283, almost three percentage points. At n = 2,000, SE = √0.00008 = 0.0089. Ten times the data reduces SE by √10 ≈ 3.16.

Each validation score is true accuracy plus sampling error, also called noise. Taking the maximum selects favourable noise alongside real quality. An independent test score is **unbiased**: across repeated trials, its average equals the chosen model's true accuracy. It still has sampling error.

## Three splits, three uses

The training split fits the **weights**, numbers controlling the model's predictions, by adjusting them to reduce errors on these examples. It also fits preprocessing: transformations applied before prediction. A normaliser uses the training mean and spread to centre and scale inputs; a missing-field replacement uses a training-derived fill value. Fitting either on all rows lets evaluation data shape the model's inputs.

<figure class="diagram">
<svg viewBox="0 0 640 170" width="100%" role="img" aria-label="Three splits: training rows fit the weights and every fitted statistic; validation rows are looked at many times to choose checkpoints and settings, and those choices flow back into training; test rows are looked at once to report the final number" style="max-width:640px;font-family:inherit;font-size:14px">
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="10" y="40" width="170" height="70" rx="6"/>
    <rect x="235" y="40" width="170" height="70" rx="6"/>
    <rect x="460" y="40" width="170" height="70" rx="6" stroke-dasharray="5 3"/>
    <path d="M235 95 C 200 95 215 95 180 95"/>
    <path d="M405 75 L 460 75"/>
    <path d="M186 91 L180 95 L186 99"/>
    <path d="M454 71 L460 75 L454 79"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="95" y="68">training rows</text>
    <text x="95" y="90" font-size="12">weights, normaliser</text>
    <text x="320" y="68">validation rows</text>
    <text x="320" y="90" font-size="12">many looks: choose</text>
    <text x="545" y="68">test rows</text>
    <text x="545" y="90" font-size="12">one look: report</text>
    <text x="208" y="128" font-size="12">choices flow back</text>
    <text x="432" y="62" font-size="12">winner</text>
    <text x="320" y="155" font-size="12">every look at test that changes a choice turns it into validation</text>
  </g>
</svg>
<figcaption>What each split may be used for. The training rows set the weights and every statistic fitted from data; the validation rows are spent on choices; the test rows are spent once, on the number you report.</figcaption>
</figure>

The validation split guides your choices of settings and checkpoints. Those choices fit the selection procedure to these rows, so its best score increasingly reflects the selection itself.

The test split supplies the final evaluation after your choices are fixed. If its score or errors prompt a change, including a new input feature, it becomes another validation set. A fresh evaluation then requires new, untouched rows. When labelled examples are scarce, reserving validation and test rows also reduces the data available for training.

## Checkpoint selection repeats the comparison

**Loss** measures prediction error, with smaller values preferred. **Early stopping** halts training when validation loss stops improving; keeping the checkpoint with the lowest validation loss selects among the evaluations already made. Automatic save-best logic replaces the saved weights whenever a lower loss appears. A falling training loss does not guarantee a falling validation loss.

Selection bias also applies to loss: an average over finitely many items has sampling error, and minimising it selects favourable error. Searching **hyperparameters**, settings you choose rather than fit as weights, adds another selection layer. Twenty configurations each supplying their best checkpoint produce a best-of-twenty comparison of already selected scores.

Consecutive checkpoints usually have correlated errors: they get many of the same items right. This reduces the independent noise available for selection. Differences in true quality also let selection find real improvements. Neither guarantees that the winning validation score is unbiased.

## Candidate count and set size

For N independent candidates, each truly 0.80 accurate, the simulation measures inflation as best validation accuracy minus fresh test accuracy:

| N candidates | Inflation at n = 200 | Inflation at n = 2,000 | Inflation / SE |
|---|---|---|---|
| 5 | 0.0328 | 0.0104 | 1.16 |
| 20 | 0.0517 | 0.0165 | 1.83 to 1.85 |
| 100 | 0.0680 | 0.0221 | 2.40 to 2.47 |

Inflation is about 1.2 standard errors for five candidates, 1.8 for twenty and 2.4 for a hundred. These approach 1.16, 1.87 and 2.51, the average maxima of N independent standard normal draws: bell-shaped noise with mean zero and standard deviation one. Standard deviation measures typical spread around a mean. Here each score's sampling error is approximately normal with spread SE, so scaling the maximum by SE largely removes the effect of set size.

This is an approximation for independent, equal-quality candidates. Going from 20 to 100 adds less than one SE; increasing n tenfold shrinks inflation by 0.0517 / 0.0165 = 3.13. With twenty true accuracies spread evenly from 0.78 to 0.80 on 2,000 items, the winner's validation accuracy averages 0.8103, its true accuracy 0.7959. You select the truly best model in only 18.6% of trials.

<!--mission-->
## Exercise: measure the winner's curse without training a model

Run this PyTorch script on a CPU. A **binomial draw** counts successes in a fixed number of independent trials with the same success probability; dividing by the item count simulates accuracy.

```python
import torch
from torch.distributions import Binomial

torch.manual_seed(0)
TRIALS = 20_000
p = 0.80                                    # every candidate's true accuracy


def best_of_n(N, n_val, n_test, trials=TRIALS):
    """Score N equal candidates on one validation set, keep the best, re-score it on a fresh test set."""
    val = Binomial(total_count=n_val, probs=torch.full((trials, N), p)).sample() / n_val
    test = Binomial(total_count=n_test, probs=torch.full((trials, N), p)).sample() / n_test
    winner = val.argmax(dim=1)                                  # the checkpoint you would ship
    reported = val.max(dim=1).values                            # the number you would report
    retest = test.gather(1, winner.unsqueeze(1)).squeeze(1)     # the same winner, scored on unseen data
    return reported.mean().item(), retest.mean().item()


print(" N  n_val  SE      reported  test    inflation  inflation/SE")
for n_val in (200, 2000):
    se = (p * (1 - p) / n_val) ** 0.5
    for N in (1, 5, 20, 100):
        rep, tst = best_of_n(N, n_val, n_test=n_val)
        print(f"{N:3d} {n_val:5d}  {se:.4f}  {rep:.4f}    {tst:.4f}  {rep - tst:+.4f}    {(rep - tst) / se:.2f}")

# Checkpoints from one run are not independent: they get most of the same items right.
# Each checkpoint copies a shared answer sheet except on a fraction `churn` of items, where it redraws.
def correlated_checkpoints(N, n_val, churn, trials=2_000):
    shared = torch.rand(trials, 1, n_val) < p
    own = torch.rand(trials, N, n_val) < p
    redraw = torch.rand(trials, N, n_val) < churn
    correct = torch.where(redraw, own, shared)                  # still p accurate on average
    val = correct.float().mean(dim=2)
    return val.max(dim=1).values.mean().item() - p

print("\n20 checkpoints, n_val 2000, inflation by churn between checkpoints")
for churn in (1.0, 0.3, 0.1, 0.02):
    print(f"churn {churn:4.2f}: {correlated_checkpoints(20, 2000, churn):+.4f}")

# Candidates that really differ: true accuracies spread evenly from 0.78 to 0.80.
N, n_val = 20, 2000
true_acc = torch.linspace(0.78, 0.80, N)
val = Binomial(total_count=n_val, probs=true_acc.expand(TRIALS, N)).sample() / n_val
test = Binomial(total_count=n_val, probs=true_acc.expand(TRIALS, N)).sample() / n_val
winner = val.argmax(dim=1)
print("\nspread 0.78..0.80, N 20, n_val 2000")
print("reported", round(val.max(dim=1).values.mean().item(), 4),
      "winner's true", round(true_acc[winner].mean().item(), 4),
      "test", round(test.gather(1, winner.unsqueeze(1)).mean().item(), 4),
      "picked the truly best", round((winner == N - 1).float().mean().item(), 3))
```

Each array row is a trial and each column a candidate. `argmax` selects the winning column; `max` extracts its validation score; `gather` retrieves that winner's independent test score. The main comparison repeats 20,000 times.

`correlated_checkpoints` creates a shared answer sheet, then redraws a fraction `churn` of each checkpoint's answers. Redrawing can leave an answer unchanged: churn is not the disagreement rate. The final block uses evenly spaced true accuracies to measure selection when quality differs.

The N = 1 rows show essentially no inflation. For twenty checkpoints on 2,000 items, reducing churn from 1.00 to 0.02 reduces inflation from +0.0166 to +0.0032. Shared outcomes reduce the bias, but it remains positive in this experiment.

Expected output with PyTorch 2.14 on a CPU, seed 0 (the initial setting for reproducible random draws):

```text
 N  n_val  SE      reported  test    inflation  inflation/SE
  1   200  0.0283  0.7999    0.8002  -0.0003    -0.01
  5   200  0.0283  0.8325    0.7998  +0.0328    1.16
 20   200  0.0283  0.8514    0.7997  +0.0517    1.83
100   200  0.0283  0.8679    0.7999  +0.0680    2.40
  1  2000  0.0089  0.8000    0.8000  -0.0000    -0.00
  5  2000  0.0089  0.8104    0.8000  +0.0104    1.16
 20  2000  0.0089  0.8165    0.8000  +0.0165    1.85
100  2000  0.0089  0.8222    0.8000  +0.0221    2.47

20 checkpoints, n_val 2000, inflation by churn between checkpoints
churn 1.00: +0.0166
churn 0.30: +0.0120
churn 0.10: +0.0072
churn 0.02: +0.0032

spread 0.78..0.80, N 20, n_val 2000
reported 0.8103 winner's true 0.7959 test 0.796 picked the truly best 0.186
```

Run each variation separately with the imports, `TRIALS` and `p` above. First, reduce the test set to 50 items:

```python
torch.manual_seed(0)
val = Binomial(total_count=2000, probs=torch.full((TRIALS, 20), p)).sample() / 2000
test = Binomial(total_count=50, probs=torch.full((TRIALS, 20), p)).sample() / 50
retest = test.gather(1, val.argmax(1, keepdim=True)).squeeze(1)
print("test mean", round(retest.mean().item(), 4), "spread", round(retest.std().item(), 4))
```

```text
test mean 0.8003 spread 0.0562
```

The mean remains near 0.80, but the spread matches SE = √(0.16 / 50) = 0.0566. An unbiased score can be imprecise.

Next, let validation and test jointly choose the winner, then evaluate it on an untouched third draw:

```python
torch.manual_seed(0)
for n in (200, 2000):
    draw = lambda: Binomial(total_count=n, probs=torch.full((TRIALS, 20), p)).sample() / n
    val, test, third = draw(), draw(), draw()
    winner = (val + test).argmax(1, keepdim=True)          # the test set now helps choose
    print(n, round(test.gather(1, winner).mean().item(), 4), round(third.gather(1, winner).mean().item(), 4))
```

```text
200 0.8364 0.8001
2000 0.8118 0.8001
```

The test scores inflate to 0.8364 and 0.8118 because test now influences selection. The independent third draw still averages 0.8001.

*Sources: the Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 3.9 and 7.4, and the LLM Engineering course (Ed Donner, Udemy), lectures 7.19 and 7.20, paraphrased as study material; Chip Huyen, Designing Machine Learning Systems, physical pp. 116, 164–166 and 223.*
