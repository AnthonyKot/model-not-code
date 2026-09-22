# Keep It Right After Launch

Chapter 2 shipped the photo classifier: a blade flagged when its score reaches 0.05, blade recall 0.684 on the test listings, reviewers checking every flag before a listing goes live. Ten weeks later two things had happened to the photos. From week 3 sellers added a sales banner to every photo, and a change alarm the shop had set on the photos jumped from half a percent of listings to 15% and stayed there; the blade flag was intact, recall 0.742 against 0.763 on a 20,000-listing check. From week 6 a line of folding knives arrived, photographed closed; the alarm stayed flat, and blade recall fell from 0.763 to 0.491. The loud alarm was harmless, the silent change expensive. Which alarm did the shop need, and how would it have known, when the only labels it gets are for the listings the model chose to flag?

The chapter first fixes what "the model from launch" is and what can be known after a prediction, then builds the score that watches every photo without labels and runs the ten weeks that produced the two alarms. It then shows how an audit of unflagged listings tells "fewer blades listed" from "more blades missed", and ends with what a retrained model has to prove before it replaces the live one, when its training labels came from the live model's own flags. Everything runs on chapter 2's synthetic photos, 1,000 new listings a week.

## What ships, and what you can know afterwards

A prediction is computed from several things, and the weights are one of them. The released function is the weights, the fitted preprocessing, the threshold, the list of category names in output order, and the code that joins them; refit the normaliser on this week's brighter photos and the same weights give a different decision. So the lab saves one bundle under its own version and checks that the reloaded bundle flags exactly the same validation listings as the model that was saved:

```python
bundle = {"version": "classifier-2026-09-01", "categories": CATS, "classifier": net.state_dict(),
          "blade_threshold": threshold, "autoencoder": ae.state_dict(), "alarm_level": alarm_level}
torch.save(bundle, "release.pt")
loaded = torch.load("release.pt")        # weights_only=True by default: tensors, strings, numbers, lists
```

<details>
<summary>Optional: the same weights, a different function, and what `state_dict` does not save</summary>

The smallest case: one input x, a normaliser z = (x − mean) / sd fitted on the launch photos, one weight w = 1.0, one bias b = −4.0, a sigmoid, and the threshold 0.05.

| | Mean | Sd | z for x = 140 | Logit w·z + b | Score | Flagged at 0.05 |
|---|---|---|---|---|---|---|
| Normaliser from launch | 100 | 20 | 2.00 | −2.00 | 0.1192 | yes |
| Normaliser refitted this week | 130 | 25 | 0.40 | −3.60 | 0.0266 | no |

Neither row is corrupt: they are two different functions sharing a weights file. In PyTorch, `model.state_dict()` saves the parameters and the **buffers**, tensors a module keeps that training does not update by gradient, such as a normaliser registered with `self.register_buffer("mean", ...)` or chapter 3's BatchNorm statistics. A plain attribute such as `self.categories = [...]` does not travel, and the threshold is not a tensor at all. Never overwrite a release, and make "roll back" mean loading a whole earlier bundle.

</details>

Once it is live, a prediction produces its evidence in stages:

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

At prediction time you know the scores and the flag rate, nothing about correctness. A day later the reviewers have checked every flag, so you know **precision** and the cost of the false flags exactly, and still nothing about the listings that were not flagged, which is where every missed blade is. A label whose existence depends on the model's own decision is a **selective label**, and it is the ordinary case: chapter 1's search learns from clicks on the products it ranked high enough to be seen, and chapter 4's preference labels exist only for answers the writer gave. The shop's answer is an **audit**: each week a random 10% of unflagged listings, about 90, go to a person who checks them as carefully as a flag, at 3 per listing, a price invented like chapter 2's 2 per false flag and 20 per missed blade. Because the sample is random, its blades estimate the blades among all unflagged listings:

<p class="formula">M̂ = (F / A) · U</p>

F is the number of blades the audit found, A the number of listings audited, and U the number of unflagged listings in the same weeks; F / A is the share of unflagged listings that are blades, and multiplying by U turns the share into a count of missed blades. An estimated recall follows as C / (C + M̂), with C the blades the reviewers confirmed.

<details>
<summary>Optional: presumed negatives, late feedback, and what a complaint is worth</summary>

Treating every unflagged listing as "not a blade" gives a complete label table whose recall is 1.0 by construction. These **presumed negatives** are the only labels most systems get for what they passed over. Where feedback does arrive, it arrives late: a returned knife takes weeks, a dispute window one to three months, too slow to catch a failing model. Complaints are biased labels too, since a blade sold to an adult who does not complain never becomes one; they confirm what the audit estimates and do not replace it.

</details>

## A score for photos nobody labelled, and the two alarms it gave

The audit is slow and small, and something has to watch every listing the moment it arrives, without labels. The lab trains a model whose only job is to reproduce its input through a narrow middle, an **autoencoder**, and scores each new photo by how badly it is reproduced: a 12 × 12 photo, 144 numbers, squeezed through a code of 16. The code cannot hold everything, so the fitted model keeps what the training photos have in common and discards what they do not, and a photo unlike them loses more. A listing's **surprise** is that error averaged over its four photos.

<details>
<summary>Optional: the autoencoder by hand, and its loss</summary>

Points in the plane near the line y = x, and a code of one number: the encoder maps a point to its position along the line, (x + y) / √2, and the decoder maps that number back to ((x + y) / 2, (x + y) / 2), so a point off the line comes back moved onto it. The error is the mean squared difference over the coordinates:

<p class="formula">e = (1/d) · Σ<sub>j</sub> (x̂<sub>j</sub> − x<sub>j</sub>)<sup>2</sup></p>

x<sub>j</sub> is coordinate j of the input, x̂<sub>j</sub> the same coordinate of the reconstruction, and d the number of coordinates, here 2; for this encoder and decoder the error works out to (x − y)<sup>2</sup> / 4.

| Point | Reconstruction | Error |
|---|---|---|
| (1.0, 1.2) | (1.10, 1.10) | 0.0100 |
| (2.0, 1.8) | (1.90, 1.90) | 0.0100 |
| (3.0, 3.1) | (3.05, 3.05) | 0.0025 |
| (4.0, 3.9) | (3.95, 3.95) | 0.0025 |
| (2.0, 0.5) | (1.25, 1.25) | 0.5625 |

In the lab:

```python
ae = nn.Sequential(nn.Flatten(), nn.Linear(S * S, 16), nn.ReLU(), nn.Linear(16, S * S))
fit(ae, x[train_rows], x[train_rows].flatten(1), 10, 3e-3, nn.MSELoss())   # the target is the photo itself
```

`nn.MSELoss()` is the mean squared error above, with the input as its own target, so no label is used.

</details>

A score needs a level before it can raise an alarm, and the usual choice hides a trap: set it at the 99th percentile of surprise on the launch validation listings, and on any ordinary week about 1% of listings exceed it, 10 in 1,000, whether or not anything is wrong. The percentile fixes the rate of alarms you accept on unchanged photos; what the alarm can show is a change in that share. In the lab the level is 1.820 and an ordinary week's share is 0.004 or 0.005, below the 1% because a 99th percentile of 500 validation listings is about the fifth-highest surprise, a noisy level.

From week 3 every photo carries a bright banner along its bottom edge; from week 6, half the blades listed are folding knives photographed closed, showing only part of a blade's diagonal. The left side of each row is what the shop sees that week; the right side is what only the simulation can report.

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

The banner is the loud alarm: the share jumps from half a percent to about 15% in week 3 and stays there, and the flag decisions barely notice. With about fifty blades a week, recall moves by about ±0.06 from week to week by chance alone, so the chapter's check script scores 20,000 listings each way: with the banner, blade recall is 0.742 against 0.763 without it, and the cost of flags and misses 456 per 1,000 listings against 476. The banner costs something elsewhere, the category shown to customers right for 0.921 of listings instead of 0.939.

The folding knives are the silent alarm. Their photos are ordinary photos with a slightly different shape in the middle, so the alarm share stays where the banner put it, and category accuracy hardly moves, 0.936 on the 20,000-listing check against 0.939, because blades are one listing in twenty. On the same check blade recall falls from 0.763 to 0.491 and the cost rises from 476 to 718 per 1,000 listings, half as much again. The change that matters is inside one rare category, and every aggregate the shop watches averages it away. What the shop can see from week 6 is the reviewers' side: confirmed blades fall from 54, 43 and 41 to 26, 17, 16, 17 and 31, and precision from about 0.30 to 0.13.

**Confirmed blades halved while the alarm stayed flat. Name two explanations, and say what the audit would count in weeks 6 to 10 under each.**

## Two explanations fit the reviewers, and the audit picks one

Sellers may simply be listing fewer blades, in which case the model misses the same share as before and fewer blades hide among the unflagged listings. Or as many blades are listed as before and the model is missing the rest, in which case many more hide there. The reviewers cannot tell these apart, because both produce fewer confirmed blades. The audit can, because the two explanations predict different counts.

Start from weeks 1 to 5: 206 confirmed blades, 5 blades found among 456 audited listings, and 4,279 unflagged listings. The formula above estimates 5 / 456 × 4,279 = 46.9 missed blades, so about 252.9 blades were listed and recall was about 206 / 252.9 = 0.815. In weeks 6 to 10 the reviewers confirmed 107 blades, 447 listings were audited and 4,360 were unflagged.

| Weeks 6–10, if | Blades per unflagged listing | Expected blades in 447 audited |
|---|---|---|
| fewer blades were listed, recall unchanged | 5 / 456 × 107 / 206 = 0.0057 | 2.5 |
| as many were listed, the rest were missed | (252.9 − 107) / 4,360 = 0.0335 | 15.0 |

The first row scales the old share of hidden blades by how much the confirmed blades fell. The second takes the old number of blades listed, removes the ones confirmed, and spreads the rest over this period's unflagged listings. The audit found 13. If fewer blades were listed, a count of 13 or more has a chance below one in a thousand; if more were missed, a count of 13 or fewer has a chance of 0.367, an ordinary result. The audit says the model is missing blades, and it says so without anyone having labelled a folding knife in advance.

<details>
<summary>Optional: where the two chances come from</summary>

A count of rare events in a random sample follows, closely enough here, a **Poisson distribution** whose mean m is the expected count:

<p class="formula">P(F = k) = e<sup>−m</sup> · m<sup>k</sup> / k!</p>

k is a possible count, m the expected count from the table, and k! the product 1 × 2 × … × k; summing over k from 0 to 13 gives the chance of 13 or fewer, and one minus the sum to 12 the chance of 13 or more: below 0.001 with m = 2.5, and 0.367 with m = 15.0. M̂ inherits the same spread: 13 finds at a 10% rate estimate 130 unseen blades, 127 with the exact counts of weeks 6 to 10 below, with a standard deviation of about 36, and 3 finds estimate 30 with about 17.

</details>

It cost something to know this. Over the ten weeks the audit checked 903 listings, 2,709 at 3 each, about 270 a week. By its own estimate the misses in weeks 1 to 5 cost about 940 at 20 each, less than the audit in the same weeks; in weeks 6 to 10 its estimate is 13 / 447 × 4,360 = 127 missed blades, about 2,540. An audit is bought against the size of the change it must reveal. At a 3% rate, the lab's first variation, the audit finds 3 blades in weeks 6 to 10 where the two explanations predict 0.6 and 4.4: the chance under the first is 0.022, suggestive rather than clear, and the same thin sample makes the recall estimates later in the run badly optimistic.

## An alarm is a reason to look, and a candidate has to prove itself

The alarm fired on the change that left the blade flag intact and stayed silent on the one that halved recall. An alarm says the photos are different; it cannot say whether the decisions got worse, and it cannot say what to do. When it fires, the work is an investigation with several outcomes: an upstream data problem, whose fix is not in the model; a real change the model handles, noted and, if permanent, followed by refitting the alarm level; or a real change that costs something, with responses each carrying a price: audit more, move the threshold, roll back to an earlier bundle, or retrain. For the banner the investigation ends at the second outcome. For the knives there was no alarm; the reviewers' falling counts and the audit's 13 blades were the evidence, and the cheapest response does not help: lowering the threshold to 0.02 catches 180 of 508 folding knives on the 20,000-listing check instead of 105, and the extra false flags push the cost from 718 to 770 per 1,000 listings, because a threshold moves every listing's decision. That leaves retraining.

The shop's labels for the ten weeks come from the reviewers' verdicts on flagged listings, the auditors' verdicts on the sample, and for everything else the category the shop displayed, presumed correct because nobody complained; a folding knife that was neither flagged nor audited is in that last group, labelled cable. This is a **feedback loop**: the live model's flags determined which listings were checked, the checked listings became the training labels, and the next model is fitted to them, so most folding knives enter training labelled as something else. The lab fine-tunes a copy of the live model on those labels and finds it cheaper on new listings. Whether it should replace the live model is a different question.

To compare the two on new listings, run the candidate in **shadow**: for two weeks both models score every listing, only the live model's flags reach sellers, and a reviewer checks every listing that either model flags, 52 extra here. A listing that neither model flags costs both the same and cancels out of the difference, and every disagreement has been reviewed, so the cost difference is exact on the listings scored: the models disagree on 190 of 2,000, and the candidate costs 414 less, with a standard error of 107, four standard errors below zero, cheaper and not by chance.

That is half a gate. The other half is the promise the release made, blade recall 0.684, and recall needs the blades neither model flagged, which only the audit sees: 167 audited listings in the shadow weeks, 3 blades, an estimated 30 unseen blades.

| Model | Estimated recall | True recall, simulation only | Folding knives caught, of 62 |
|---|---|---|---|
| Live | 0.550 | 0.484 | 14 |
| Candidate | 0.651 | 0.573 | 10 |

Both estimates are optimistic, because three finds is a thin base, and both are below 0.684. The candidate is cheaper overall, largely because it has seen ten more weeks of photos, banner included, and worse at the one thing that changed: 10 folding knives caught where the live model caught 14, the feedback loop showing up in a number. A gate for replacing a model is two inequalities on the same listings: a **margin**, that the candidate's cost is lower than the live model's by more than the noise, and a **floor**, that its estimated recall is at least the recall the release promised. The candidate passes the margin and fails the floor, and so does everything else the shop has; the gate refuses the push, and overriding it is a decision somebody signs with these numbers attached. What fixes the knives is labels that say what they are: in the lab's second variation, the same retraining with true labels for every launch week catches 30 of 62 folding knives, reaches estimated recall 0.793 against a true 0.742, and passes both inequalities.

<details>
<summary>Optional: the cost difference and its standard error, the baseline, and the canary</summary>

<p class="formula">Δ = Σ<sub>i</sub> (cost<sub>candidate, i</sub> − cost<sub>live, i</sub>),  SE = s<sub>d</sub> · √n</p>

The sum runs over the n = 2,000 shadow listings; cost<sub>candidate, i</sub> is 2 if the candidate falsely flags listing i, 20 if it misses a blade there and 0 otherwise, and cost<sub>live, i</sub> the same for the live model. s<sub>d</sub> is the standard deviation of the per-listing differences, and SE is the standard error of their sum, the amount Δ would move if two different weeks had been drawn: Δ = −414 ± 107. The baseline for the margin is the last model that passed the gate, not the first ever shipped; "no worse, to the last decimal" is not a margin, because it passes and fails by chance.

</details>

## Where it stops

Real changes are gradual and mixed: a new product line, a camera update and a seasonal shift arrive in overlapping weeks, and the clean "from week 6" becomes a slope you notice late. The audit is a budget someone owns; its sample has to stay random, its checkers disagree like any labellers, and its rate is a trade between the cost of checking and the size of change you need to see within a few weeks, so report its agreement rate beside its estimates. Label definitions change: split "blades" into kitchen knives and tools and the recall floor has to be restated before any comparison means anything. And the monitoring is code: the alarm level, the audit sampler and the shadow comparison need tests and an owner, and are versioned with the release they watch.

## Two questions to work

**1. Half the audit.** The shop halves the audit to 5% of unflagged listings, so weeks 6 to 10 audit about 224 listings instead of 447, with everything else in the two-row table unchanged. What does each explanation now expect the audit to find, and if it finds 6, how strongly does the count separate them?

<details>
<summary>Worked answer</summary>

The shares per unflagged listing do not change, so the expected counts halve with the sample: 0.0057 × 224 = 1.3 if fewer blades were listed, and 0.0335 × 224 = 7.5 if more were missed. A count of 6 or more when 1.3 is expected has a Poisson chance of 0.002, and 6 or fewer when 7.5 is expected 0.379. The audit still points the same way, but its estimate is coarser: 6 finds at 5% estimate 120 missed blades with a standard deviation of about 49, against 127 with about 36 at 10%. Halving the audit saves about 135 a week, and the same count of finds takes twice as many weeks.

</details>

**2. Retrain because the alarm is up?** The alarm share has been near 15% since week 3. A colleague reads eight weeks of alarm as eight weeks of a degraded model and proposes retraining on that ground alone. What is right in that reading, and what is the wrong turn?

<details>
<summary>Worked answer</summary>

The alarm is right that the photos changed, in week 3, for a reason the shop can name. The wrong turn is reading an alarm on the inputs as a verdict on the decisions. The change that raised it cost the blade flag nothing measurable, recall 0.742 against 0.763, and the change that halved recall raised it by nothing at all. Retraining on that trigger would have answered the banner and not the knives, and the retrain the shop could run on its own labels caught fewer folding knives than the live model, 10 against 14. What the alarm earns is an investigation, which for a permanent harmless change ends with the alarm level refitted and logged with the release.

</details>

## The lab

The lab, [ten weeks of a live classifier, then your call](../labs/keep-it-right-after-launch.md), runs the whole story on a CPU in about eight seconds. It should print the release line with threshold 0.05 and alarm level 1.820, the ten-week table above, the audit test with 2.5 against 15.0 expected and 13 found, and the shadow difference −414 ± 107 with the recall table. Two variations follow, the audit at 3% and true labels for every week, and after them a report from another quarter waits for your decision, with hints and a discussion folded until you have written it.

The classifier now has a gate, and the writer from chapter 4 sits beside it. Chapter 6 puts that writer inside the shop's assistant, between chapter 1's search and the tools it may call, and starts from wrong answers: one where the search found the right text but ranked it fifth, below the three handed over, because a chunk boundary had cut the table from its header; and one where the loop refused an injected instruction and the answer was wrong anyway. Which part do you fix?

*Sources: Machine Learning Engineering by Andriy Burkov, pp. 77, 139–140, 235–236, 249 and 260 (physical); Chip Huyen, Designing Machine Learning Systems, early release, pp. 318–319, 323–325 and 331–336 (physical); Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 129, 131, 133, 728 and 733 (physical); Machine Learning System Design (EPUB), §13.1 and §14.4.4; Continuous Machine Learning with Kubeflow, pp. 283–284 and 289–290 (physical); MLOps with Red Hat OpenShift, pp. 155 and 171–173 (physical); Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lecture 18.2; Machine Learning Projects for Industry 4.0 (Udemy), lectures 8.1 and 8.2; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 4.18 and 6.8; all courses paraphrased as study material. PyTorch 2.14 source for `torch.load` and `Module.state_dict`.*
