# You Only Get to Look at the Test Set Once

You trained twenty configurations, kept the checkpoint with the lowest validation loss from each, and wrote the best validation accuracy of the lot into the pull request. Then the chosen model was scored on rows that played no part in any of that, and the number came back lower. Nothing broke between the two measurements. The first number was never an estimate of the model's accuracy. It was the largest of twenty noisy measurements, and the largest of several noisy measurements is biased upward by construction.

That bias is the winner's curse, and it is why a dataset is cut into three parts rather than two. Below it is enumerated on tiny numbers, measured in a simulation, and then found where it hides in everyday training.

## A score on a finite set is a draw

Accuracy on a validation set of n items is a count divided by n. Each item is either right or wrong, so if a model's true accuracy is p, meaning the fraction it would get right on unlimited data from the same source, the count on any particular n items is a random draw that lands near p·n but rarely on it. Repeat the measurement on another n items and you get a different count. How far a single measurement typically sits from p is the standard error:

<p class="formula">SE = √( p · (1 − p) / n )</p>

Term by term: p is the true accuracy; 1 − p is the true error rate; their product, p · (1 − p), is the variance of one item's outcome, scored 1 for right and 0 for wrong, and it is largest at p = 0.5, where each item is closest to a coin toss. Dividing by n averages that variance over the items, and the square root turns a variance back into the units of accuracy. SE is the typical size of the gap between a measured accuracy and the true one.

Two consequences follow from the square root. At p = 0.8 and n = 200 the standard error is √(0.16 / 200) = √0.0008 = 0.0283, almost three points of accuracy. At n = 2,000 it is √0.00008 = 0.0089. Ten times the data buys a gap about √10 ≈ 3.16 times smaller, not ten times smaller. And the gap exists whether or not you do anything with the number. The problem starts when you choose.

## Worked example: two checkpoints, two items

The numbers below are the book's own, and the checkpoints are invented.

Take two checkpoints whose true accuracy is exactly 0.5 and a validation set of two items. Each checkpoint gets 0, 1 or 2 items right, with probabilities 1/4, 1/2 and 1/4, and the two draws are independent. You keep whichever scores higher and report its score.

| Reported best | Pairs of scores that produce it | Probability |
|---|---|---|
| 0/2 | (0, 0) | 1/4 × 1/4 = 1/16 |
| 1/2 | (0, 1), (1, 0), (1, 1) | 1/8 + 1/8 + 1/4 = 8/16 |
| 2/2 | any pair containing a 2 | 1 − (3/4)<sup>2</sup> = 7/16 |

The expected reported accuracy is 0 × 1/16 + 0.5 × 8/16 + 1 × 7/16 = 11/16 = 0.6875. Neither checkpoint is better than a coin. Score the winner on two fresh items and its expected accuracy is 0.5, because the two fresh items were drawn after the choice and have no connection to it. The 0.1875 between the two numbers was produced entirely by the choice.

Scale it up once. Six checkpoints, all truly 0.5, on twenty items. A single checkpoint scores 13 or more with probability 137,980 / 1,048,576 = 0.1316: the ways to get 13 to 20 heads in 20 tosses, over all 2<sup>20</sup> outcomes. The chance that none of six does is 0.8684<sup>6</sup> = 0.4289, so the chance the best of six reports 65% or better is 1 − 0.4289 = 0.5711. More often than not, a set of coin-toss checkpoints produces a "65% on validation" headline. Whichever checkpoint wins, the same checkpoint on twenty fresh items is expected to return 10 of 20, because nothing about the fresh items was involved in picking it.

The mechanism, stated once: a validation score is true accuracy plus a noise term, and taking the maximum over candidates selects for large noise terms as much as for high true accuracy. The winner's score is therefore not a measurement of the winner. A score on data that played no part in the choice has noise independent of the choice, and so it is an unbiased estimate. That is what the third split is for.

## The three splits are three budgets

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

The training split fits the weights, and everything else estimated from data belongs to it too: the mean and spread a normalisation layer uses, the fill value for a missing field. Fitting those on all rows lets a little of the held-out data into every training input, which is the same rule as the one above applied earlier in the pipeline: nothing that is later used to judge the model may shape it.

The validation split exists to be spent on decisions. You watch it during training, you compare settings on it, you pick checkpoints by it. Each of those picks is a small act of fitting, with the validation rows as the data, so after enough picks the validation score describes the picking as much as the model.

The test split is spent once, on the final number. If you look at it, dislike the result and change a feature, a learning rate or the checkpoint, the test set has just taken part in a choice. It is now a second validation set, its next score carries the same upward bias, and there is no clean number left unless you hold out new rows. The same holds for ideas: a feature added after reading the test set's errors is a choice shaped by the test set.

## Early stopping is best-of-N you run every day

Hyperparameter searches make the selection obvious. Early stopping hides it. Halting a run once the validation loss stops improving, and its everyday companion, keeping the checkpoint with the lowest validation loss, both take the best of however many evaluations the run made. A checkpoint callback set to save only the best weights does exactly this, overwriting its file whenever a new lowest loss appears; fine-tuning runs save periodic checkpoints so that the best step can be picked afterwards. That is a sound procedure, and it means the lowest validation loss in the log is a best-of-N number. The training loss beside it is no help: a falling training loss does not imply a falling validation loss. The mechanism does not depend on the metric being accuracy: validation loss is also an average over a finite set of items, so it carries the same kind of sampling error, and taking its minimum over checkpoints selects for favourable error just as taking the maximum accuracy does. The simulation below uses accuracy only because a count of correct items is easy to draw.

Two things make the everyday case milder than the coin-toss example. Consecutive checkpoints of one run get mostly the same items right, so their noise terms are correlated and the maximum has less to select from. And they genuinely differ in true accuracy, so part of what the selection finds is real. Both are measured in the exercise. Neither removes the bias, and a hyperparameter search multiplies it: twenty configurations each choosing its own best checkpoint is a best-of-twenty over numbers that were already maxima.

## How big, and what it depends on

The simulation below measures the inflation for candidates whose true accuracy is 0.80.

| N candidates | Inflation at n = 200 | Inflation at n = 2,000 | Inflation / SE |
|---|---|---|---|
| 5 | 0.0328 | 0.0104 | 1.16 |
| 20 | 0.0517 | 0.0165 | 1.83 to 1.85 |
| 100 | 0.0680 | 0.0221 | 2.40 to 2.47 |

Divided by the standard error, the inflation depends on N alone: about 1.2 standard errors for five candidates, 1.8 for twenty, 2.4 for a hundred. Those are close to the average largest value among N independent draws from a standard normal distribution, 1.16, 1.87 and 2.51, because each candidate's measured score is its true accuracy plus a roughly normal sampling error of one standard error. The maximum of N such errors grows, but slowly: going from 20 candidates to 100 adds less than one standard error. Growing n tenfold shrinks it by the same √10 as the standard error: 0.0517 / 0.0165 = 3.13. Both levers work: cutting the candidates from 100 to 5 halves the inflation, and ten times the validation data cuts it by about three.

Limits. The table assumes independent candidates of equal quality, the case in which the selection has nothing but noise to find. When candidates really differ, the run shows twenty models spread evenly from 0.78 to 0.80 on 2,000 items: the winner reports 0.8103, its true accuracy averages 0.7959, and the truly best model is picked in 18.6% of trials. The test score is unbiased but not exact; it still carries its own standard error. And a validation set is not free: when labels are scarce, every row held out for choosing is a row the model did not train on.

<!--mission-->
## Exercise: measure the winner's curse without training a model

The script simulates the scores directly, which is all the mechanism needs: a model's accuracy on n items is a binomial draw around its true accuracy. It runs on a CPU in about six seconds.

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

What each part does:

- **`Binomial(total_count=n_val, probs=...).sample() / n_val`** stands in for running each candidate over a validation set and computing accuracy. In real code this line is an evaluation loop: `model.eval()`, `torch.no_grad()`, sum `(logits.argmax(1) == labels)` over the batches, divide by the dataset length. For a fixed model and a random draw of items, that count is this binomial. One row per trial, one column per candidate, so all 20,000 repetitions run at once.
- **`val.argmax(dim=1)` and `val.max(dim=1).values`** are the selection: the index of the checkpoint you would ship and the number you would report. A save-best-only callback computes both incrementally.
- **`test.gather(1, winner.unsqueeze(1))`** looks up the winner's score on a second, independent draw: the one look at the test set.
- **`correlated_checkpoints`** builds item-level outcomes with `torch.rand(...) < p` comparisons. Every checkpoint starts from one shared answer sheet and redraws a fraction `churn` of its items; churn 1.0 is the independent case. A redraw can land on the same answer, so churn is not the disagreement rate: at churn 0.02 two checkpoints redraw about one item in fifty and disagree on fewer.
- **The last block** gives the candidates different true accuracies with `torch.linspace`, so the selection has something real to find, and reports how often it finds the truly best one.

**Expected result.** Run with PyTorch 2.14 on a CPU, seed 0; the full output is in the essay's corpus. The N = 1 rows show no inflation (`-0.0003`, `-0.0000`). At n_val 200 the reported best is `0.8325`, `0.8514`, `0.8679` for N = 5, 20, 100, while every test column stays within `0.7997` to `0.8002`; at n_val 2000 the reported best is `0.8104`, `0.8165`, `0.8222`. The correlated checkpoints print `+0.0166`, `+0.0120`, `+0.0072`, `+0.0032` for churn 1.00 down to 0.02. The spread case prints `reported 0.8103 winner's true 0.7959 test 0.796 picked the truly best 0.186`.

Two further experiments, each a separate script that reuses the imports, `TRIALS` and `p` from above and starts from `torch.manual_seed(0)`. First, a small test set: the winner's test score stays unbiased but becomes imprecise.

```python
torch.manual_seed(0)
val = Binomial(total_count=2000, probs=torch.full((TRIALS, 20), p)).sample() / 2000
test = Binomial(total_count=50, probs=torch.full((TRIALS, 20), p)).sample() / 50
retest = test.gather(1, val.argmax(1, keepdim=True)).squeeze(1)
print("test mean", round(retest.mean().item(), 4), "spread", round(retest.std().item(), 4))
```

It prints `test mean 0.8003 spread 0.0562`; the spread matches the standard error √(0.16 / 50) = 0.0566. Unbiased is not the same as precise.

Second, let the test set take part in the choice, then score the winner on a third draw that played no part:

```python
torch.manual_seed(0)
for n in (200, 2000):
    draw = lambda: Binomial(total_count=n, probs=torch.full((TRIALS, 20), p)).sample() / n
    val, test, third = draw(), draw(), draw()
    winner = (val + test).argmax(1, keepdim=True)          # the test set now helps choose
    print(n, round(test.gather(1, winner).mean().item(), 4), round(third.gather(1, winner).mean().item(), 4))
```

It prints `200 0.8364 0.8001` and `2000 0.8118 0.8001`. The old test number inflated like a validation score because it had become one; only the untouched third draw still reads 0.80.

*Sources: the Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 3.9 and 7.4, and the LLM Engineering course (Ed Donner, Udemy), lectures 7.19 and 7.20, paraphrased as study material; Chip Huyen, Designing Machine Learning Systems, physical pp. 116, 164–166 and 223.*
