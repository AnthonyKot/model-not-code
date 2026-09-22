# Lab: ten weeks of a live classifier, then your call

The lab for chapter 5, [Keep It Right After Launch](../chapters/keep-it-right-after-launch.md). It trains chapter 2's classifier and its alarm, saves and reloads the release bundle, runs the ten weeks with the banner and the folding knives, tests the two explanations with the audit, retrains on the shop's labels and gates the result in shadow, then hands you another quarter's report to decide on.

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

The report has the same shape as the ten weeks in the chapter: the alarm has been up since the banner, and confirmed blades and precision fall together from week 6. Use the table from "Two explanations fit the reviewers, and the audit picks one" with this report's counts. For the threshold, compare the extra review work with the blades it could recover, estimated from the 37 audited listings in that score band.

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
