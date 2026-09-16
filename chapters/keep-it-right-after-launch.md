# Keep It Right After Launch

Chapter 2 shipped the photo classifier with a release record: listings scored as the average of their four photos, a blade flagged when its score reaches 0.05, recall on blades 0.684 on the test listings. Reviewers check every flag before the listing goes live. That record described the photos sellers uploaded before launch. Every week after launch, the photos are new.

This chapter asks one question: **has quality changed enough to justify action, and how would you know, when the only labels you get are the ones the model chose to send to a reviewer?** It answers in four steps. First, what you have to keep so that "the model from launch" still means one function you can restore. Second, what can be measured at each moment after a prediction, and what cannot. Third, a score that notices changed photos without any labels, and why its alarm is not a verdict. Fourth, what a retrained model must show before it replaces the live one, when its training labels came from the live model's own flags.

Everything runs on chapter 2's synthetic photos, 1,000 new listings a week, with two changes introduced on purpose: sellers start adding a sales banner to their photos, and later a line of folding knives arrives. The exercise runs the whole story on a CPU in about eight seconds and ends with a report for you to judge.

## What ships is more than the weights

A prediction is computed from several things, and the weights are one of them. Take the smallest case: one input number x, a normaliser that turns it into z = (x − mean) / sd, one weight w = 1.0 and one bias b = −4.0, a sigmoid, and the threshold 0.05. The mean and sd were fitted on the launch photos. Refit them on this week's brighter photos and the same weights give a different decision:

| | Mean | Sd | z for x = 140 | Logit w·z + b | Score | Flagged at 0.05 |
|---|---|---|---|---|---|---|
| Normaliser from launch | 100 | 20 | 2.00 | −2.00 | 0.1192 | yes |
| Normaliser refitted this week | 130 | 25 | 0.40 | −3.60 | 0.0266 | no |

Neither row is corrupt. They are two different functions sharing a weights file. The released function is the weights, the fitted preprocessing, the threshold, the list of category names in output order, and the code that joins them. Restoring the weights without the rest restores something else.

In PyTorch, `model.state_dict()` saves the parameters and the **buffers**: tensors a module keeps that training does not update by gradient, such as the BatchNorm running statistics from chapter 3. A normaliser registered with `self.register_buffer("mean", ...)` travels with the weights. A plain attribute such as `self.categories = [...]` does not, and neither does a buffer registered with `persistent=False`. The threshold and the category list are not tensors at all. The exercise therefore saves one bundle:

```python
bundle = {"version": "classifier-2026-09-01", "categories": CATS, "classifier": net.state_dict(),
          "blade_threshold": threshold, "autoencoder": ae.state_dict(), "alarm_level": alarm_level}
torch.save(bundle, "release.pt")
loaded = torch.load("release.pt")        # weights_only=True by default: tensors, strings, numbers, lists
```

`torch.load` in PyTorch 2.14 refuses arbitrary pickled objects by default and accepts a dictionary of tensors, strings, numbers and lists, which is what this bundle is. An exported graph, such as an ONNX file, has the same boundary: it holds the computation from an input tensor to logits, and the resizing, normalising and category names are written again by hand wherever the file is served. Whatever format you use, keep every release under its own version, never overwrite one, and make "roll back" mean loading a whole earlier bundle. The exercise checks this: the reloaded bundle flags exactly the same validation listings as the model that was saved.

## Three clocks: what you can know, and when

A prediction produces its evidence in stages. For the blade flag there are four moments:

<figure class="diagram">
<svg viewBox="0 0 360 330" width="100%" role="img" aria-label="A vertical timeline with four moments. At prediction: blade scores, flag rate and the alarm share are known; nothing is known about correctness. After review, about a day: whether each flagged listing is a blade, so precision and the cost of false flags. After the weekly audit: blades among a random sample of unflagged listings, an estimate of misses. Weeks to months: complaints and returns reveal some missed blades." style="max-width:420px;font-size:13px">
  <g stroke="currentColor" stroke-width="1.5" fill="none">
    <path d="M24,16 V314"/>
    <circle cx="24" cy="30" r="6"/><circle cx="24" cy="110" r="6"/><circle cx="24" cy="190" r="6"/><circle cx="24" cy="270" r="6"/>
  </g>
  <g fill="currentColor">
    <text x="42" y="35" font-weight="600">Prediction, seconds</text>
    <text x="42" y="54">scores, flag rate, alarm share</text>
    <text x="42" y="72" opacity="0.75">nothing about right or wrong</text>
    <text x="42" y="115" font-weight="600">Review, about a day</text>
    <text x="42" y="134">flagged listings: blade or not</text>
    <text x="42" y="152" opacity="0.75">precision; unflagged stay unknown</text>
    <text x="42" y="195" font-weight="600">Audit, each week</text>
    <text x="42" y="214">a random sample of unflagged</text>
    <text x="42" y="232" opacity="0.75">an estimate of missed blades</text>
    <text x="42" y="275" font-weight="600">Complaints, weeks to months</text>
    <text x="42" y="294">some missed blades surface</text>
    <text x="42" y="312" opacity="0.75">never all of them</text>
  </g>
</svg>
<figcaption>When each kind of evidence about the blade flag arrives. Only the audit looks at listings the model did not flag.</figcaption>
</figure>

At prediction time you know the scores, how many listings were flagged and anything computed from the photos alone. A day later the reviewers have checked every flag, so you know how many flags were blades: **precision**, and the cost of the false flags, exactly. You still know nothing about the listings that were not flagged, and that is where every missed blade is. A label whose existence depends on the model's own decision is a **selective label**, and it is the ordinary case, not a quirk of this shop: a spam filter gets corrections mostly for messages it let into the inbox, a recommender gets clicks only for items it showed. The shop has two more: chapter 1's search learns from clicks on the products it ranked high enough to be seen, and chapter 4's thumbs up exists only for answers the writer actually gave.

Treating every unflagged listing as "not a blade" gives you a complete label table, and its recall is 1.0 by construction: every blade the table knows about was flagged. These **presumed negatives** are the only labels most systems get for what they passed over. Where feedback does eventually arrive, it arrives late: a customer complaint or a returned knife takes weeks, and labels that wait for a dispute window take one to three months, which is fine for a quarterly report and too slow to catch a failing model.

The shop's answer is an **audit**: each week, a random 10% of unflagged listings go to a person who checks them as carefully as a flag. That is different work from checking a flag, which arrives with the model's reason attached, so it has its own price here: 3 per audited listing, invented like chapter 2's prices of 2 per false flag and 20 per missed blade. At about 90 audited listings a week, the audit costs about 270 a week. Because the sample is random, its blades estimate the blades among all unflagged listings:

<p class="formula">M̂ = (F / A) · U</p>

F is the number of blades the audit found, A the number of listings audited, and U the number of unflagged listings in the same weeks; F / A is the share of unflagged listings that are blades, and multiplying by U turns the share into a count of missed blades. An estimated recall follows as C / (C + M̂), with C the blades the reviewers confirmed. The estimate is only as steady as F is large, and F is a count of a few rare events.

## A score for photos nobody has labelled

The audit is slow and small. Something has to watch every listing the moment it arrives, without labels. One way is to train a model whose only job is to reproduce its input through a narrow middle, an **autoencoder**, and score each new photo by how badly it is reproduced.

The hand-sized version: points in the plane that lie near the line y = x, and a code of one number. The encoder maps a point to its position along the line, (x + y) / √2, and the decoder maps that number back to the point on the line, ((x + y) / 2, (x + y) / 2). A point on the line comes back unchanged; a point off it comes back moved onto the line. The error is the mean squared difference over the two coordinates:

<p class="formula">e = (1/d) · Σ<sub>j</sub> (x̂<sub>j</sub> − x<sub>j</sub>)<sup>2</sup></p>

x<sub>j</sub> is coordinate j of the input, x̂<sub>j</sub> the same coordinate of the reconstruction, and d the number of coordinates, here 2; for this encoder and decoder the error works out to (x − y)<sup>2</sup> / 4.

| Point | Reconstruction | Error |
|---|---|---|
| (1.0, 1.2) | (1.10, 1.10) | 0.0100 |
| (2.0, 1.8) | (1.90, 1.90) | 0.0100 |
| (3.0, 3.1) | (3.05, 3.05) | 0.0025 |
| (4.0, 3.9) | (3.95, 3.95) | 0.0025 |
| (2.0, 0.5) | (1.25, 1.25) | 0.5625 |

The code cannot hold both coordinates, so the fitted encoder keeps what the training points have in common, their position along the line, and discards what they do not. A point unlike them loses more. In the exercise the input is a 12 × 12 photo, 144 numbers, and the code has 16:

```python
ae = nn.Sequential(nn.Flatten(), nn.Linear(S * S, 16), nn.ReLU(), nn.Linear(16, S * S))
fit(ae, x[train_rows], x[train_rows].flatten(1), 10, 3e-3, nn.MSELoss())   # the target is the photo itself
```

The loss is chapter 1's mean squared error with the input as its own target, so no label is used. A listing's **surprise** is the error averaged over its four photos.

A score needs a threshold before it can raise an alarm, and the usual choice hides a trap. Set the alarm level at the 99th percentile of surprise on the launch validation listings, and on any ordinary week about 1% of listings exceed it, 10 in 1,000, whether or not anything is wrong. The percentile fixes the rate of alarms you accept on unchanged photos; it does not discover a rate of anomalies. What the alarm can show is a change in that share. In the exercise the alarm level is 1.820 and an ordinary week's share is 0.004 or 0.005.

The autoencoder is one choice. A cheaper first check compares summary statistics of this week's inputs, such as means and spreads per pixel, with the launch photos; a two-sample test does the same for one number at a time. Matching statistics do not prove that nothing changed, and a statistically significant difference on thousands of photos need not be a large one. Every such check answers "are the photos different?", which is not the question the shop needs answered.

## Ten weeks after launch

The exercise runs ten weeks of 1,000 listings. From week 3 every seller's photos carry a bright sales banner along the bottom edge. From week 6, half the blades listed are folding knives photographed closed, whose shape shows only part of a blade's diagonal. The left side of each row is what the shop sees that week; the right side is what only the simulation knows.

| Week | Alarm share | Flags | Confirmed blades | Precision | Audited | Blades found | True blades | Missed | True recall |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.005 | 142 | 36 | 0.25 | 78 | 1 | 46 | 10 | 0.78 |
| 2 | 0.004 | 138 | 32 | 0.23 | 106 | 0 | 39 | 7 | 0.82 |
| 3 | 0.150 | 164 | 54 | 0.33 | 99 | 2 | 67 | 13 | 0.81 |
| 4 | 0.168 | 139 | 43 | 0.31 | 83 | 1 | 56 | 13 | 0.77 |
| 5 | 0.155 | 138 | 41 | 0.30 | 90 | 1 | 57 | 16 | 0.72 |
| 6 | 0.155 | 115 | 26 | 0.23 | 93 | 4 | 51 | 25 | 0.51 |
| 7 | 0.156 | 126 | 17 | 0.13 | 81 | 1 | 34 | 17 | 0.50 |
| 8 | 0.140 | 127 | 16 | 0.13 | 98 | 2 | 48 | 32 | 0.33 |
| 9 | 0.143 | 135 | 17 | 0.13 | 83 | 2 | 43 | 26 | 0.40 |
| 10 | 0.138 | 137 | 31 | 0.23 | 92 | 4 | 53 | 22 | 0.58 |

The banner makes the loudest signal in the table: the alarm share jumps from half a percent to about 15% in week 3 and stays there. The flag decisions barely notice. Weeks 3 to 5 have true recall 0.81, 0.77 and 0.72, against 0.78 and 0.82 before; with about fifty blades a week, recall moves by about ±0.06 from week to week by chance alone. One week is too small to settle it, so the chapter's check script scores 20,000 listings each way. With the banner, blade recall is 0.742 against 0.763 without it, and the cost of flags and misses is 456 per 1,000 listings against 476. The banner does cost something elsewhere: the category shown to customers is right for 0.921 of listings instead of 0.939.

The folding knives make almost no signal at all. Their photos are ordinary photos with a slightly different shape in the middle, so the alarm share stays where the banner put it. The flag count drifts down a little, because most flags were false flags to begin with. Category accuracy over all listings hardly moves: 0.936 on the 20,000-listing check against 0.939, because blades are one listing in twenty. Meanwhile blade recall on the same check falls from 0.763 to 0.491, and the cost rises from 476 to 718 per 1,000 listings, half as much again. The change that matters is inside one rare category, and every aggregate the shop watches averages it away.

What the shop can see in week 6 onward is the reviewers' side: confirmed blades fall from 54, 43 and 41 to 26, 17, 16, 17 and 31, and precision from about 0.30 to 0.13 in three of those weeks.

**Before reading on:** write down two explanations for confirmed blades halving while the alarm stays flat, and for each, what the audit should find in weeks 6 to 10.

## Fewer blades listed, or more blades missed?

Two explanations fit the reviewers' numbers equally well. Sellers may simply be listing fewer blades, in which case the model misses the same share as before and fewer blades hide among the unflagged listings. Or as many blades are listed as before and the model is missing the rest, in which case many more hide there. The reviewers cannot tell these apart, because both produce fewer confirmed blades. The audit can, because the two explanations predict different counts.

Start from weeks 1 to 5: 206 confirmed blades, 5 blades found among 456 audited listings, and 4,279 unflagged listings. The formula above estimates 5 / 456 × 4,279 = 46.9 missed blades, so about 252.9 blades were listed and recall was about 206 / 252.9 = 0.815. In weeks 6 to 10 the reviewers confirmed 107 blades, 447 listings were audited and 4,360 were unflagged.

| Weeks 6–10, if | Blades per unflagged listing | Expected blades in 447 audited |
|---|---|---|
| fewer blades were listed, recall unchanged | 5 / 456 × 107 / 206 = 0.0057 | 2.5 |
| as many were listed, the rest were missed | (252.9 − 107) / 4,360 = 0.0335 | 15.0 |

The first row scales the old share of hidden blades by how much the confirmed blades fell. The second takes the old number of blades listed, removes the ones confirmed, and spreads the rest over this period's unflagged listings.

The audit found 13. How likely is a count like that under each explanation? A count of rare events in a random sample follows, closely enough here, a **Poisson distribution** whose mean m is the expected count:

<p class="formula">P(F = k) = e<sup>−m</sup> · m<sup>k</sup> / k!</p>

k is a possible count, m the expected count from the table, and k! the product 1 × 2 × … × k; summing the right-hand side over k from 0 to 13 gives the chance of finding 13 or fewer. If fewer blades were listed, m = 2.5 and a count of 13 or more has a chance below one in a thousand. If more were missed, m = 15.0 and a count of 13 or fewer has a chance of 0.367, an ordinary result. The audit says the model is missing blades, and it says so without anyone having labelled a folding knife in advance.

It cost something to know this. Over the ten weeks the audit checked 903 listings, 2,709 at 3 each, about 270 a week. By its own estimate the misses in weeks 1 to 5 cost about 940 at 20 each, less than the audit cost in the same weeks; in weeks 6 to 10 its estimate is 13 / 447 × 4,360 = 127 missed blades, about 2,540. An audit is bought against the size of the change it must reveal. At a 3% rate, the variation at the end of the exercise, the audit finds 3 blades in weeks 6 to 10 where the two explanations predict 0.6 and 4.4: the chance under the first is 0.022, suggestive rather than clear, and the same thin sample makes the recall estimates later in the run badly optimistic.

## An alarm is a reason to look, not an instruction

The two changes give opposite lessons about the alarm. It fired on the change that left the blade flag intact and stayed silent on the one that halved recall. An alarm says the photos are different; it cannot say whether the decisions got worse, and it cannot say what to do.

When it fires, the work is an investigation, and its outcomes are several. The alarm may be a data problem upstream, such as a broken resize, and the fix is not in the model. It may be a real change that the model handles, and the answer is to note it and, if it is permanent, to refit the alarm level on the new photos so the next change can be seen. It may be a real change that costs something, and then there is a list of possible responses, each with a price: audit more to measure it better, move the threshold, roll back to an earlier bundle, or retrain. Retraining is one entry on the list, not its default.

For the banner, the investigation ends with the first two: the audit and the reviewers show no change in the blade flag, and the 1.8-point loss of category accuracy is a separate question for whoever owns the displayed category. For the folding knives there was no alarm to investigate; the reviewers' falling counts and the audit's 13 blades were the evidence. Moving the threshold is the cheapest response and it does not help here. On the 20,000-listing check with folding knives, lowering the threshold from 0.05 to 0.02 catches 180 of 508 folding knives instead of 105, and the extra false flags push the cost from 718 to 770 per 1,000 listings. The knives score low because the model has never seen one; a threshold moves every listing's decision, not just theirs. That leaves retraining.

## Retraining learns the shop's labels, including the wrong ones

The shop has ten weeks of new photos. Its labels for them come from three places: the reviewers' verdicts on flagged listings, the auditors' verdicts on the sample, and for everything else the category the shop displayed, presumed correct because nobody complained yet. A folding knife that was not flagged and not audited is in that last group, and the category displayed for it was cable. The exercise fine-tunes a copy of the live model on the launch training photos plus these ten weeks, for three passes at a learning rate of 0.001.

This is a **feedback loop**: the live model's flags determined which listings were checked, the checked listings became the training labels, and the next model is fitted to them. Of the folding knives that went through the live model, most were never flagged, so most are in the training set labelled as something else. Fitting those labels pulls the retrained model's scores for a closed folding knife towards cable.

**Before reading on:** the retrained model will turn out to cost less than the live model on new listings. Decide what else you would want to know before replacing the live model with it.

## The candidate must beat the live model, on evidence both are judged by

To compare the two models on new listings, run the candidate in **shadow**: for two weeks both models score every listing, only the live model's flags reach sellers, and a reviewer checks every listing that either model flags. That extra review is 52 listings the candidate flagged and the live model did not.

The comparison needs fewer labels than it seems. A listing that neither model flags costs both models the same, 20 if it is a blade and nothing otherwise, so it cancels out of the difference. Every listing where the models disagree was flagged by one of them and has been reviewed. The difference in cost is therefore exact on the listings scored:

<p class="formula">Δ = Σ<sub>i</sub> (cost<sub>candidate, i</sub> − cost<sub>live, i</sub>),  SE = s<sub>d</sub> · √n</p>

The sum runs over the n = 2,000 shadow listings; cost<sub>candidate, i</sub> is 2 if the candidate falsely flags listing i, 20 if it misses a blade there and 0 otherwise, and cost<sub>live, i</sub> the same for the live model. s<sub>d</sub> is the standard deviation of the per-listing differences, and SE is the standard error of their sum, the amount Δ would move if two different weeks had been drawn. In the run the models disagree on 190 listings and Δ = −414 ± 107: the candidate costs 414 less over two weeks, about four standard errors below zero. It is cheaper, and not by chance.

That is half a gate. The other half is the promise the release made. Chapter 2's record said blade recall 0.684, and a model that keeps the cost down by catching fewer blades than that has broken a different rule. Recall needs the blades neither model flagged, and only the audit sees those: 167 audited listings in the shadow weeks, 3 blades, so an estimated 30 unseen blades, with a Poisson standard deviation of about 17. Putting that into the recall estimate:

| Model | Estimated recall | True recall, simulation only | Folding knives caught, of 62 |
|---|---|---|---|
| Live | 0.550 | 0.484 | 14 |
| Candidate | 0.651 | 0.573 | 10 |

Both estimates are optimistic, because three audit finds is a thin base, and both are still below 0.684. The candidate is cheaper overall, largely because it has seen ten more weeks of photos, banner included. It is also worse than the live model at the one thing that changed: it catches 10 folding knives where the live model caught 14, which is the feedback loop showing up in a number.

A gate for replacing a model is two inequalities checked on the same listings: a **margin**, that the candidate's cost is lower than the live model's by more than the noise, and a **floor**, that its estimated recall is at least the recall the release promised. The baseline for the margin is the last model that passed the gate, not the first model ever shipped, and only a model that passed is pushed. A margin of "no worse, to the last decimal" is not a margin: it passes and fails by chance. After a pass, a **canary** sends a small share of live traffic to the new model through weighted routing before the rest.

Here the candidate passes the margin and fails the floor, and so does nothing else the shop has. The gate refuses the push, and overriding it is a decision somebody should sign with the numbers above attached: shipping the candidate would cut cost now and make the folding knives slightly worse. What fixes the knives is labels that say what they are. In the second variation at the end of the exercise, the same retraining with true labels for every launch week catches 30 of 62 folding knives, reaches estimated recall 0.793 against a true 0.742, and passes both inequalities. In a real shop those labels come from a targeted review, for example of every audited or reviewed folding knife and the listings like them, at the audit's price per listing.

## What a real project adds

Real changes are gradual and mixed. A new product line, a camera update and a seasonal shift arrive in overlapping weeks, and the clean "from week 6" of the simulation becomes a slope you notice late.

The audit is a budget someone owns. Its sample has to stay random, its checkers disagree with each other like any labellers, and its rate is a trade between the cost of checking and the size of change you need to see within a few weeks. Report the audit's own agreement rate beside its estimates.

Label definitions change. If the shop splits "blades" into kitchen knives and tools, last quarter's labels no longer mean this quarter's categories, and the recall floor has to be restated before any comparison means anything.

The monitoring is code. The alarm level, the audit sampler and the shadow comparison need tests and an owner, and they are versioned with the release they watch: an alarm level refitted on banner photos belongs to that release's bundle.

Complaints are labels too, and biased ones: a blade sold to an adult who does not complain never becomes one. Use them to confirm what the audit estimates, not to replace it. And a canary splits requests, not people, so a seller who uploads many listings may see both models on the same day.

<!--mission-->
## Exercise: ten weeks of a live classifier, then your call

The script trains chapter 2's classifier and its alarm, saves and reloads the release bundle, runs ten weeks with the banner and the folding knives, tests the two explanations with the audit, retrains on the shop's labels and gates the result in shadow. It writes `release.pt` to the current directory, needs PyTorch on a CPU and runs in about eight seconds. After it, a report from another quarter waits for your decision.

```python
import copy
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

S, WEEK = 12, 1000                                        # 12 x 12 photos; 1,000 new listings a week
CATS = ["cable", "kettle", "lamp", "blade"]
FLAG_COST, MISS_COST = 2.0, 20.0                          # chapter 2's prices: a false flag, a missed blade
AUDIT_RATE, AUDIT_COST = 0.10, 3.0                        # audit 10% of unflagged listings at 3 each (synthetic)
SHARE = torch.tensor([0.50, 0.30, 0.15, 0.05])
SHAPES = torch.tensor([[[0, 0, 0], [1, 1, 1], [0, 0, 0]],   # cable
                       [[0, 1, 0], [0, 1, 0], [0, 1, 0]],   # kettle
                       [[0, 0, 1], [0, 1, 0], [1, 0, 0]],   # lamp
                       [[1, 0, 0], [0, 1, 0], [0, 0, 1]]]).float()  # blade
FOLDED = torch.tensor([[0, 0, 0], [1, 1, 0], [0, 0, 0]]).float()    # a folding knife, photographed closed

def listings(n, gen, banner=False, folding=0.0):
    """n listings of four photos each, as in chapter 2; optionally a sales banner or folding knives."""
    cat = torch.multinomial(SHARE, n, replacement=True, generator=gen)
    look = 1.5 * torch.randn(n, S, S, generator=gen)
    look[:, 2:-2, 2:-2] = 0                               # background and packaging around the border
    shape = SHAPES[cat].clone()
    folded = (cat == 3) & (torch.rand(n, generator=gen) < folding)
    shape[folded] = FOLDED
    x = look.repeat_interleave(4, 0) + 0.5 * torch.randn(4 * n, S, S, generator=gen)
    for i in range(4 * n):
        r, c = torch.randint(2, S - 4, (2,), generator=gen).tolist()
        x[i, r:r + 3, c:c + 3] += 1.8 * shape[i // 4]
    if banner:
        x[:, S - 1, :] += 2.0                             # a bright strip along the bottom edge
    return x[:, None], cat, folded

class Net(nn.Module):                                     # chapter 2's classifier
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(1, 16, 3, padding=1)
        self.shape = nn.Linear(16, 4)
        self.layout = nn.Linear(16 * S * S, 4)
    def forward(self, x):
        h = F.relu(self.conv(x))
        return self.shape(h.amax(dim=(2, 3))) + self.layout(h.flatten(1))

def fit(model, x, y, epochs, lr, loss_fn):
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    for _ in range(epochs):
        for idx in torch.randperm(len(x)).split(64):
            opt.zero_grad(); loss_fn(model(x[idx]), y[idx]).backward(); opt.step()
    return model

def blade_score(model, x):                                # mean of the four photos' softmax, per listing
    with torch.no_grad():
        return F.softmax(model(x), dim=1).view(-1, 4, 4).mean(1)[:, 3]

def surprise(ae, x):                                      # reconstruction error, averaged over a listing's photos
    with torch.no_grad():
        return ((ae(x) - x.flatten(1)) ** 2).mean(1).view(-1, 4).mean(1)

def cost(flag, blade):                                    # per listing: 2 for a false flag, 20 for a miss
    return FLAG_COST * (flag & ~blade) + MISS_COST * (~flag & blade)

if __name__ == "__main__":
    # ---------- Part 1: the release, saved as one bundle ----------
    gen = torch.Generator().manual_seed(0)
    torch.manual_seed(1)
    x, cat, _ = listings(2500, gen)
    train_rows = torch.arange(10000) >= 2000               # the first 500 listings are validation
    y = cat.repeat_interleave(4)
    net = fit(Net(), x[train_rows], y[train_rows], 8, 3e-3, nn.CrossEntropyLoss())
    val_score, val_blade = blade_score(net, x[~train_rows]), cat[:500] == 3
    grid = [0.5, 0.2, 0.1, 0.05, 0.02, 0.01]
    threshold = min(grid, key=lambda t: cost(val_score >= t, val_blade).sum().item())
    ae = nn.Sequential(nn.Flatten(), nn.Linear(S * S, 16), nn.ReLU(), nn.Linear(16, S * S))
    fit(ae, x[train_rows], x[train_rows].flatten(1), 10, 3e-3, nn.MSELoss())   # no labels: the target is the photo
    alarm_level = torch.quantile(surprise(ae, x[~train_rows]), 0.99).item()
    bundle = {"version": "classifier-2026-09-01", "categories": CATS, "classifier": net.state_dict(),
              "blade_threshold": threshold, "autoencoder": ae.state_dict(), "alarm_level": alarm_level}
    torch.save(bundle, "release.pt")
    loaded = torch.load("release.pt")
    live = Net(); live.load_state_dict(loaded["classifier"])
    T = loaded["blade_threshold"]
    same = torch.equal(blade_score(live, x[~train_rows]) >= T, val_score >= threshold)
    print(f"release {loaded['version']}: blade threshold {T}, alarm level {alarm_level:.3f}, reloaded flags identical: {same}")

    # ---------- Part 2: ten weeks after launch ----------
    history = []
    print("week  alarm  flags  confirmed  precision  audited  found | true blades  missed  recall  cost")
    for week in range(1, 11):
        xw, cw, _ = listings(WEEK, gen, banner=week >= 3, folding=0.5 if week >= 6 else 0.0)
        flag, blade = blade_score(live, xw) >= T, cw == 3
        audit = ~flag & (torch.rand(WEEK, generator=gen) < AUDIT_RATE)
        alarm = (surprise(ae, xw) > alarm_level).float().mean().item()
        conf, found = (flag & blade).sum().item(), (audit & blade).sum().item()
        print(f"{week:4d}  {alarm:5.3f}  {flag.sum().item():5d}  {conf:9d}  {conf / flag.sum().item():9.2f}  {audit.sum().item():7d}  "
              f"{found:5d} | {blade.sum().item():11d}  {(~flag & blade).sum().item():6d}  {conf / blade.sum().item():6.2f}  {cost(flag, blade).sum().item():4.0f}")
        history.append((xw, cw, flag, audit))

    # ---------- Part 3: fewer blades listed, or more blades missed? ----------
    def pooled(weeks):
        hs = [history[w - 1] for w in weeks]
        return (sum((h[2] & (h[1] == 3)).sum().item() for h in hs), sum((h[3] & (h[1] == 3)).sum().item() for h in hs),
                sum(h[3].sum().item() for h in hs), sum((~h[2]).sum().item() for h in hs))
    conf_a, found_a, aud_a, unflag_a = pooled(range(1, 6))
    conf_b, found_b, aud_b, unflag_b = pooled(range(6, 11))
    miss_rate = found_a / aud_a                            # blades per unflagged listing, weeks 1-5
    fewer = miss_rate * (conf_b / conf_a) * aud_b          # blades listed fell, recall unchanged
    recall_a = conf_a / (conf_a + miss_rate * unflag_a)
    missed = (conf_a / recall_a - conf_b) / unflag_b * aud_b   # blades listed unchanged, the rest were missed
    poisson_le = lambda k, m: sum(math.exp(-m) * m ** i / math.factorial(i) for i in range(k + 1))
    print(f"weeks 1-5: confirmed {conf_a}, audit found {found_a} in {aud_a}; weeks 6-10: confirmed {conf_b}, audit found {found_b} in {aud_b}")
    print(f"expected finds, weeks 6-10: {fewer:.1f} if fewer blades were listed, {missed:.1f} if more were missed")
    print(f"P(finds >= {found_b} | {fewer:.1f}) = {1 - poisson_le(found_b - 1, fewer):.3f}   P(finds <= {found_b} | {missed:.1f}) = {poisson_le(found_b, missed):.3f}")

    # ---------- Part 4: retrain on the labels the shop has, then gate the candidate ----------
    xs = torch.cat([h[0] for h in history]); cs = torch.cat([h[1] for h in history])
    fs = torch.cat([h[2] for h in history]); au = torch.cat([h[3] for h in history])
    with torch.no_grad():
        shown = F.softmax(live(xs), dim=1).view(-1, 4, 4).mean(1).argmax(1)   # the category the shop displayed
    presumed = torch.where(shown == 3, torch.zeros_like(shown), shown)     # unflagged, so presumed not a blade
    labels = torch.where(fs | au, cs, presumed)                            # reviewed or audited: the true category
    torch.manual_seed(1)
    candidate = fit(copy.deepcopy(live), torch.cat([x[train_rows], xs]), torch.cat([y[train_rows], labels.repeat_interleave(4)]),
                    3, 1e-3, nn.CrossEntropyLoss())
    xg, cg, knife = listings(2 * WEEK, gen, banner=True, folding=0.5)   # two shadow weeks: both models score every listing
    blade = cg == 3
    f_live, f_cand = blade_score(live, xg) >= T, blade_score(candidate, xg) >= T
    reviewed = f_live | f_cand                               # a reviewer checks anything either model flags
    audit = ~reviewed & (torch.rand(2 * WEEK, generator=gen) < AUDIT_RATE)
    diff = cost(f_cand, blade) - cost(f_live, blade)         # zero wherever neither model flags
    print(f"shadow: reviewed {reviewed.sum().item()}, the models disagree on {(f_live ^ f_cand).sum().item()}; "
          f"candidate minus live cost {diff.sum().item():.0f} ± {diff.std().item() * math.sqrt(2 * WEEK):.0f}")
    unseen = (audit & blade).sum().item() / AUDIT_RATE      # estimated blades that neither model flagged
    for name, f in (("live", f_live), ("candidate", f_cand)):
        caught, other = (f & blade).sum().item(), (reviewed & ~f & blade).sum().item()
        print(f"{name:9s}: estimated recall {caught / (caught + other + unseen):.3f} (true {caught / blade.sum().item():.3f}); "
              f"folding knives caught {(f & knife).sum().item()} of {knife.sum().item()}")
    print(f"audit: {audit.sum().item()} listings, {(audit & blade).sum().item()} blades, cost {AUDIT_COST * audit.sum().item():.0f}; "
          f"shadow review of candidate-only flags: {(f_cand & ~f_live).sum().item()}")
```

What each part does in real monitoring code:

- **`listings`** is chapter 2's photo generator with two switches. `banner` adds a bright strip to the bottom row of every photo; `folding` replaces a share of blade shapes with a partial diagonal and returns which listings those were, so the simulation can report what no reviewer would know in advance.
- **Part 1** trains the classifier, chooses the threshold on validation listings with chapter 2's prices, trains the autoencoder with `nn.MSELoss()` against the photos themselves, and puts the alarm level at the 99th percentile of validation surprise. Everything a prediction and its alarm depend on goes into one dictionary; `torch.load` reads it back with its default `weights_only=True`, and `torch.equal` confirms the reloaded model flags the same listings.
- **Part 2** is the weekly job. `blade_score(live, xw) >= T` is the decision; `audit` draws a random 10% of the unflagged listings; the alarm share is the fraction of listings whose surprise exceeds the saved level. Everything left of the `|` in the printout is known to the shop that week; the columns to its right use `cw`, the true categories, which only the simulation has.
- **Part 3** pools weeks 1–5 and 6–10 and computes the two expected audit counts and their Poisson probabilities exactly as the chapter's table does.
- **Part 4** builds the training labels the shop would have: `torch.where(fs | au, cs, presumed)` keeps true categories for reviewed and audited listings and the displayed category, with blade replaced by cable, for the rest. `fit(copy.deepcopy(live), ...)` fine-tunes a copy, so the live model is untouched. The shadow section scores two weeks with both models, reviews anything either flags, audits a random 10% of the rest, and computes Δ with its standard error and the audit-based recall estimate for each model.

**Expected result**, deterministic on a CPU:

```
release classifier-2026-09-01: blade threshold 0.05, alarm level 1.820, reloaded flags identical: True
week  alarm  flags  confirmed  precision  audited  found | true blades  missed  recall  cost
   1  0.005    142         36       0.25       78      1 |          46      10    0.78   412
   2  0.004    138         32       0.23      106      0 |          39       7    0.82   352
   3  0.150    164         54       0.33       99      2 |          67      13    0.81   480
   4  0.168    139         43       0.31       83      1 |          56      13    0.77   452
   5  0.155    138         41       0.30       90      1 |          57      16    0.72   514
   6  0.155    115         26       0.23       93      4 |          51      25    0.51   678
   7  0.156    126         17       0.13       81      1 |          34      17    0.50   558
   8  0.140    127         16       0.13       98      2 |          48      32    0.33   862
   9  0.143    135         17       0.13       83      2 |          43      26    0.40   756
  10  0.138    137         31       0.23       92      4 |          53      22    0.58   652
weeks 1-5: confirmed 206, audit found 5 in 456; weeks 6-10: confirmed 107, audit found 13 in 447
expected finds, weeks 6-10: 2.5 if fewer blades were listed, 15.0 if more were missed
P(finds >= 13 | 2.5) = 0.000   P(finds <= 13 | 15.0) = 0.367
shadow: reviewed 317, the models disagree on 190; candidate minus live cost -414 ± 107
live     : estimated recall 0.550 (true 0.484); folding knives caught 14 of 62
candidate: estimated recall 0.651 (true 0.573); folding knives caught 10 of 62
audit: 167 listings, 3 blades, cost 501; shadow review of candidate-only flags: 52
```

Read it against the chapter. The first line is the release from chapter 2, with the same threshold. The alarm column jumps at week 3 and ignores week 6; the confirmed and precision columns drop at week 6 and the true recall column says why. The audit line decides between the two explanations, and the last three lines are the gate: cheaper by about four standard errors, below the recall floor, and worse on folding knives than the model it would replace.

Two things to try. First, set `AUDIT_RATE` to `0.03`: the weeks are the same, the audit finds 1 blade in 128 and then 3 in 145, the expected counts become 0.6 and 4.4 with probabilities 0.022 and 0.359, and in the shadow weeks 66 audited listings contain no blade, so the recall estimates jump to 0.769 and 0.910 while the truth stays at 0.484 and 0.573. A cheaper audit does not just blur the answer; it makes the floor look passed. Second, replace `labels = torch.where(fs | au, cs, presumed)` with `labels = cs`, as if every launch week had been labelled: the candidate catches 30 of 62 folding knives, its estimated recall is 0.793 (true 0.742), and the cost difference is −616 ± 130.

### Your call: the same release in another quarter

The same bundle is live in another quarter: same threshold, same alarm level, the sales banner in every photo since week 3, and the audit at 10% of unflagged listings for 3 each. This is the report the shop sees. The last column counts the extra listings that would have been flagged if the threshold had been 0.02, which the shop can compute from the logged scores; it is there so the proposal can be priced.

| Week | Alarm share | Flags | Confirmed blades | Precision | Audited | Blades found | Unflagged | Extra flags at 0.02 |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.004 | 144 | 44 | 0.31 | 70 | 2 | 856 | 102 |
| 2 | 0.004 | 146 | 40 | 0.27 | 85 | 1 | 854 | 90 |
| 3 | 0.169 | 163 | 41 | 0.25 | 81 | 2 | 837 | 76 |
| 4 | 0.138 | 137 | 41 | 0.30 | 84 | 0 | 863 | 71 |
| 5 | 0.130 | 123 | 40 | 0.33 | 83 | 1 | 877 | 86 |
| 6 | 0.173 | 114 | 12 | 0.11 | 93 | 1 | 886 | 80 |
| 7 | 0.152 | 130 | 14 | 0.11 | 85 | 1 | 870 | 85 |
| 8 | 0.161 | 117 | 18 | 0.15 | 86 | 0 | 883 | 94 |
| 9 | 0.142 | 108 | 16 | 0.15 | 75 | 1 | 892 | 92 |
| 10 | 0.146 | 117 | 17 | 0.15 | 81 | 0 | 883 | 75 |

In weeks 6 to 10 the audit also checked 37 listings whose blade score was between 0.02 and 0.05; 1 of them was a blade. The analytics team proposes lowering the threshold to 0.02 from next week "to win back the confirmed blades".

Write down, before opening the discussion below:

1. Whether the blade flag's quality has changed enough to justify any action. Confirmed blades fell; say which explanation of that fall the audit supports, how strongly, and the numbers behind it.
2. What you would do next week: for example keep everything, lower the threshold, retrain, roll back, or change the audit, or something else. "Keep the live model and gather more evidence" is an acceptable answer if you say what evidence and what it costs.
3. One option you rejected, and why.
4. What you would need to see in the next two weeks to change your decision.

A sound answer uses the audit to judge the missed blades rather than the confirmed count alone, prices both sides of any threshold change in the chapter's units, and does not treat the alarm share as evidence about the flag either way. Arriving at a defensible action by a diagnosis the numbers do not support is not a pass.

<details>
<summary>Hints, if you are stuck</summary>

The report has the same shape as the ten weeks in the chapter: the alarm has been up since the banner, and confirmed blades and precision fall together from week 6. Use the table from "Fewer blades listed, or more blades missed?" with this report's counts. For the threshold, compare the extra review work with the blades it could recover, estimated from the 37 audited listings in that score band.

</details>

<details>
<summary>Discussion — open after writing your decision</summary>

**The two explanations.** Weeks 1 to 5: 206 confirmed, 6 blades found in 403 audited, 4,287 unflagged, so about 6 / 403 × 4,287 = 63.8 missed and recall about 206 / 269.8 = 0.763. Weeks 6 to 10: 77 confirmed, 3 blades in 420 audited, 4,414 unflagged. If fewer blades were listed and recall is unchanged, the audit should find about 6 / 403 × 77 / 206 × 420 = 2.34; if as many were listed and the rest were missed, about (269.8 − 77) / 4,414 × 420 = 18.35. It found 3. A count of 3 or more has a chance of 0.414 when 2.34 is expected, and a count of 3 or fewer has a chance of about 0.00001 when 18.35 is expected. The evidence says sellers are listing fewer blades and the flag catches them as well as before.

**The threshold proposal.** In weeks 6 to 10, 0.02 would have added 426 flags, 852 in review cost at 2 each. The audited band suggests 1 blade in 37 among them, about 11.5 blades or 230 in avoided misses, and one blade in 37 is too thin to promise even that. The proposal answers a fall in confirmed blades that the audit attributes to fewer blades listed, and pays about 850 for about 230. Rejecting it is well supported.

**The alarm.** It rose with the banner in week 3 and confirmed blades stayed at 41, 41 and 40 through week 5, so the banner is not what moved week 6. It is not a reason to retrain, and nothing in the report says retraining would help the flag.

**Decisions that hold up.** Keep the live model and the threshold. Keep the audit at 10%: it is what separated the two explanations, and cutting it because confirmed blades fell would remove the one measurement of misses. Ask whoever owns seller categories whether blade listings actually fell in week 6, which is evidence independent of the model. Refitting the alarm level on banner photos is a reasonable housekeeping step, logged with the release. Reconsider if the audit finds several blades in the next two weeks, or if blade listings turn out not to have fallen.

**Decisions that do not.** Lowering the threshold because confirmed blades fell; retraining because the alarm is up; cutting the audit because there seem to be fewer blades to find.

**What the simulation knows.** Blades listed per week fell from about 53 to about 23 in week 6. True recall in weeks 6 to 10 was 0.52, 0.67, 0.69, 0.73 and 0.77, week-to-week noise on about two dozen blades each around the earlier level. The true cost of those five weeks was 1,758 at 0.05 and would have been 2,192 at 0.02.

</details>

*Sources: Machine Learning Engineering by Andriy Burkov, pp. 77, 139–140, 235–236, 249 and 260 (physical); Chip Huyen, Designing Machine Learning Systems, early release, pp. 318–319, 323–325 and 331–336 (physical); Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 129, 131, 133, 728 and 733 (physical); Machine Learning System Design (EPUB), §13.1 and §14.4.4; Continuous Machine Learning with Kubeflow, pp. 283–284 and 289–290 (physical); MLOps with Red Hat OpenShift, pp. 155 and 171–173 (physical); Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lecture 18.2; Machine Learning Projects for Industry 4.0 (Udemy), lectures 8.1 and 8.2; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 4.18 and 6.8; all courses paraphrased as study material. PyTorch 2.14 source for `torch.load` and `Module.state_dict`.*
