# Trust the Number Before You Ship the Classifier

Sellers list products on the shop from chapter 1 by uploading photos, usually four per product: front, side, box, label. A classifier looks at the photos and suggests the category, so a kettle lands under kettles without a person reading the listing. One category carries a rule: **blades** need an age check at checkout, and a blade listed as a lamp is sold to anyone. The first training run prints 92.4% accuracy on held-out photos, and the shop is ready to ship it. That one number was lying three times over: about which photos were held out, about the one category the rule exists for, and about who was making the decision.

This chapter takes the three lies in turn. The split first, because the held-out photos were not new; then the rare row, where a model that never flags a blade scores well and the optimiser finds exactly that model; then the decision, which belongs to the shop and not to the softmax. It closes with what the release evaluation reports instead of the 92.4%. Everything runs on synthetic photos, 12 × 12 pixels, four categories, a shape in the middle that says the category and a border that stands in for a product's background, small enough to train in seconds and built so that each failure is visible.

## The first lie: the held-out photos were not new

The 92.4% came from holding out 20% of the photos at random. A held-out photo's product has three other photos, and each landed in training with probability 0.8, so the chance that at least one sibling is in training is 1 − 0.2<sup>3</sup> = 0.992; the lab measures 0.994. Nearly every "unseen" photo belongs to a product the model has already seen from another side.

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

A model can score well on such photos by recognising the product rather than its category: the background the seller always uses, the box, the lighting. That skill is worth nothing on the day a new product is listed, because the shop never asks the model about a product it was trained on. In the lab the same model and data give 0.924 when split by photo and 0.878 when 500 whole products are held out. On 2,000 photos of products listed later, the photo-split model scores 0.873. The split by product predicted that; the split by photo promised 5 points that did not exist.

The rule is to split by the unit the live system predicts for. Here that is a new product, so every photo of a product goes to the same side; when the catalogue changes over time, split by listing date as well, and remove duplicates first, because the same stock photo uploaded by two sellers is one item. The same lie has a form in the columns. A historical field such as `age_check_required` identifies blades almost perfectly and is filled in by a reviewer *after* the listing is categorised, so it is empty at the moment a seller uploads. For every input ask whether its value exists when the prediction is made, and treat a test score much better than the first weeks in production as a sign that some input did not.

Three splits then give the numbers different jobs. The **training** split fits the weights, and anything else fitted from data such as a normaliser's mean and spread. The **validation** split is where settings, checkpoints and thresholds are compared. The **test** split is scored once, after every choice is fixed, and gives the number you report, because every comparison made on a set spends it.

How much can the number it gives be trusted? Accuracy is an estimate of a number you cannot compute, the fraction the model would get right on the photos the shop will actually receive, and like any estimate from a sample it moves when the sample changes. For a true accuracy p measured on n independent items, the typical movement is the **standard error**:

<p class="formula">SE = √( p · (1 − p) / n )</p>

p is the true accuracy and 1 − p the error rate; their product is the variance of one right-or-wrong outcome, dividing by n gives the variance of an average of n outcomes, and the square root returns to accuracy's units. At p = 0.878 on 2,000 photos, SE = √(0.878 × 0.122 / 2,000) = 0.0073. But the 2,000 photos show 500 products, and photos of one product rise and fall together; counting products, SE = √(0.878 × 0.122 / 500) = 0.0146. The honest error bar lies between the two, and two models that differ by one point on this set may be the same model.

<details>
<summary>Optional: every look at the validation set spends it, by the numbers</summary>

Try twelve settings of learning rate and epochs, score each on the same 500 validation photos, and keep the best. Suppose all twelve are equally good, with a true accuracy of 0.88: each score is 0.88 plus sampling error, and the maximum picks the most favourable error. Treating the twelve as independent, a score of at least 0.90 needs 450 right answers of 500, probability 0.0932, so the best of twelve reaches it with probability 1 − (1 − 0.0932)<sup>12</sup> = 0.6909.

| | One setting | Best of twelve |
|---|---|---|
| Mean validation score | 0.880 | 0.903 |
| Chance the score shown is at least 0.90 | 9.3% | 69.1% |
| The chosen setting's score on 500 fresh photos | 0.880 | 0.880 |

The best of twelve reports 0.903 on average and is still 0.880 on photos it was not chosen on: a 2.3-point promise from the choice alone. This is the **winner's curse**; it grows with the number of candidates and shrinks with the validation set, and keeping the checkpoint with the lowest validation loss is the same selection every epoch. If the test number changes a decision, it has become a second validation set; a public benchmark score is the same kind of claim about one test set many teams have tuned against.

</details>

## The second lie: right 94% of the time by never flagging

The split is fixed and the number is honest about new products. It is still silent about the one row the rule exists for. Blades are 5% of listings, so a flagger that never flags answers "does this listing need an age check?" correctly 95% of the time, and on the lab's validation photos, where blades happen to be 6.2%, it scores 0.938. Overall accuracy averages away the rare category; report each category's **recall**, the fraction of true blades the model called blades. The imbalance comes from the shop's mix, not from the method: on a public dataset of cell images with equal numbers of infected and uninfected cells, a model that never says "infected" scores 50%.

**The optimiser is given 950 non-blades and 50 blades and no class weight. What blade probability does it settle on, and what does that flag?**

The cause is in training as well as in the metric. The loss is a sum over rows, and 95 of every 100 rows are not blades. Take the blade question alone and a model that ignores the photo and gives every listing the same blade probability p. Its cross-entropy is:

<p class="formula">L(p) = −[ 950 · ln(1 − p) + 50 · ln p ]</p>

950 and 50 are the counts; −ln(1 − p) is what each other listing pays for being given blade probability p, and −ln p what each blade pays. The minimum is at p = 50/1,000 = 0.05, and chapter 1's gradient says why: p − y per row, so the 950 others pull the score down with 950 × 0.05 = 47.5 and the 50 blades pull it up with 50 × 0.95 = 47.5, in balance. At 0.05 every listing is below 0.5, so nothing is flagged. The optimiser found the minimum of the loss it was given.

<details>
<summary>Optional: the derivative of L(p)</summary>

The derivative of L(p) is 950/(1 − p) − 50/p. Setting it to zero gives 950p = 50(1 − p), so 1,000p = 50 and p = 0.05. The same calculation with counts n<sub>0</sub> and n<sub>1</sub> gives p = n<sub>1</sub>/(n<sub>0</sub> + n<sub>1</sub>): the best constant is always the class frequency.

</details>

A **class weight** multiplies every loss term of one class, so the rare class writes more of the sum. For a yes-or-no output PyTorch spells it `nn.BCEWithLogitsLoss(pos_weight=torch.tensor(19.0))`: each blade's term counts 950/50 = 19 times, the pulls at 0.5 are 950 × 0.5 = 475 down and 19 × 50 × 0.5 = 475 up, and the best constant moves from 0.05 to 0.5. For the four-category model the equivalent is `nn.CrossEntropyLoss(weight=w)`, with total count ÷ category count as the weights. On the lab's validation photos the weight raises blade recall from 0.266 to 0.395 and lowers category accuracy from 0.878 to 0.865. It adds no information: 50 blades counted 19 times are still 50 examples, and a mislabelled blade counts 19 times too. And the weighted model's scores stop being frequencies, because it was trained for a world where blades are as common as everything else. More labelled blades are the remedy that adds information; the next lie hides a lever that turned out cheaper.

<details>
<summary>Optional: the category weights the lab uses</summary>

Over the 8,000 training photos:

| Category | Training photos | Weight |
|---|---|---|
| cable | 3,996 | 8,000 ÷ 3,996 = 2.00 |
| kettle | 2,472 | 8,000 ÷ 2,472 = 3.24 |
| lamp | 1,116 | 8,000 ÷ 1,116 = 7.17 |
| blade | 416 | 8,000 ÷ 416 = 19.23 |

`CrossEntropyLoss` divides its mean by the sum of the weights in the batch, not by the number of rows, so weighted and unweighted loss values are not comparable in a log.

</details>

<details>
<summary>Optional: what a flipped photo claims about its label</summary>

With few photos per category, the usual next step is **augmentation**: during training each photo is sometimes replaced by a transformed copy, mirrored or tilted or brightened, under the same label:

<p class="formula">(x, y) → (T(x), y)</p>

x is the photo, T a transform and y the label, unchanged on both sides of the arrow. That is a statement the pipeline never checks: *the correct category of T(x) is y*. For a kettle or a cable a horizontal flip is true. For the lab's photos it is false in one place: the blade's shape is a diagonal and the lamp's the other diagonal, so a mirrored blade is, pixel for pixel, a lamp's shape labelled "blade". Train with a random horizontal flip on half the photos and category accuracy stays at 0.878, because cables and kettles gain what blades and lamps lose; blade recall falls from 0.266 to 0.056, and blades shown as lamps rise from 26 to 88. Real photos have the same trap in smaller places, such as left- and right-handed scissors. Augment only training batches, add one transform at a time, keep it only if validation recall improves for every category you care about, and look at a batch of augmented photos first.

</details>

## The third lie: the model was deciding who gets checked

The rare row now has a number of its own, and it is low. The third lie is about who chose it. The classifier's last layer produces a score per category, and a softmax turns them into four numbers that add up to one; showing the most likely category is the default, and it flags a blade only when the blade score beats the other three, which on these photos is rare. "Flag for an age check" is a separate decision on one of the four numbers: flag when the blade score is at least a **threshold** t, and the threshold is the shop's to choose.

The two mistakes cost different amounts. A false flag sends a harmless listing to a reviewer, say 2 per check; a missed blade is a blade sold without an age check, say 20. Both prices are invented here, and in a real shop somebody in operations or compliance has to name them; until then the threshold is a guess. With them it is a calculation. Ten listings, sorted by blade score, four of them blades:

| Blade score | 0.92 | 0.61 | 0.40 | 0.18 | 0.12 | 0.07 | 0.05 | 0.03 | 0.02 | 0.01 |
|---|---|---|---|---|---|---|---|---|---|---|
| Is a blade | yes | no | yes | no | yes | no | no | yes | no | no |

| Threshold t | Flagged | False flags | Missed blades | Cost, 2 × false + 20 × missed |
|---|---|---|---|---|
| 0.5 | 2 | 1 | 3 | 62 |
| 0.1 | 5 | 2 | 1 | 24 |
| 0.03 | 8 | 4 | 0 | 8 |
| 0.01 | 10 | 6 | 0 | 12 |

The cheapest threshold is 0.03, far from the 0.5 the default implies. If the scores were true probabilities the break-even would follow from the prices alone, flag when 20p > 2(1 − p), that is p > 2/22 = 0.091. Scores from a trained network need not be true probabilities, which is why the threshold is chosen on validation photos by computing the cost at each candidate. The lab's sweep picks 0.02, and the reason is measurable: of the 209 validation photos whose blade score lies between 0.02 and 0.091, 12.0% are blades, above the 9.1% at which flagging pays. The scores understate how often those listings are blades, and the cost sweep corrects for it without anyone having to know why.

On the test photos, scored once, the choice holds. Showing the most likely category flags blades with recall 0.224 and costs 1,236; the same model with the threshold at 0.02 reaches recall 0.711 and costs 1,114. The weight was not needed for that: on validation, the weighted model at its default decision cost 1,598 and the unweighted model with a chosen threshold 1,266. The threshold needs no retraining and leaves the scores as they were. Its price is also on the printout, 337 false flags among 2,000 test photos, a queue somebody has to staff.

Every count so far treats each photo as a decision, but the shop flags listings, and a listing has four photos. Average each listing's four sets of scores and choose the threshold again on the 500 validation listings with the same prices. On the 500 test listings, category accuracy is 0.946, the chosen threshold of 0.05 catches 13 of the 19 blades, recall 0.684, and the cost is 258 against 310 for the default, with 69 false flags. Nineteen blades make that recall an estimate with a wide error bar, about ±0.11. Report the release at the unit the shop acts on.

Two numbers reported alongside a threshold behave differently when blades become rarer or more common. **Recall** (the true positive rate, TPR) is computed among blades and the **false positive rate** (FPR) among everything else, so neither depends on how many blades there are. **Precision**, the fraction of flags that are blades, mixes the two groups:

<p class="formula">precision = TPR · π / (TPR · π + FPR · (1 − π))</p>

π is the share of listings that are blades; TPR · π is the share of all listings that are correctly flagged blades and FPR · (1 − π) the share wrongly flagged. At TPR 0.8 and FPR 0.1, precision is 0.889 on a test set that is half blades and 0.296 on a catalogue where they are 5%, from the same model and threshold, so an evaluation set balanced for convenience flatters precision. A **ROC curve** plots TPR against FPR and a **precision–recall curve** precision against recall, one point per threshold; when the positive class is rare, the second shows what the flags will look like.

## What the release evaluation reports

The number that started the chapter is replaced by a record like this one, each line tied to a decision:

| Claim | How it was measured | Measured value, synthetic |
|---|---|---|
| Category accuracy on new products | Split by product (and by listing date on real data), scored per listing, test scored once | 0.946 on 500 test listings |
| Its uncertainty | Standard error on listings, not photos | about ±0.010 |
| The rare category | Per-category recall at the chosen threshold | blade recall 0.684, 13 of 19 |
| The flag threshold | Minimum cost on validation listings, prices named by the business | 0.05; test cost 258 against 310 at the default |
| Its side effects | False flags per 500 listings, the review queue | 69 |
| Augmentation | One transform at a time, kept only if per-category recall improved | horizontal flip rejected |
| Inputs | Every feature available at listing time | photos only |

Synthetic photos cannot tell you four things a real release needs. Real photos vary in ways no generator was told about: phone cameras, lighting, a seller's watermark. Real labels are noisy, because sellers miscategorise and reviewers disagree, so the test set's labels need their own check. The prices of the two mistakes are guesses until the people who pay them name them. And the mix of listings changes after launch, which is where chapter 5 picks the classifier up again.

## Two questions to work

**1. A rarer blade.** A different shop lists 1,000 products a month of which 20 are blades. With no class weight, what constant blade probability minimises the loss, what does the model flag, and what `pos_weight` puts the two pulls in balance at 0.5?

<details>
<summary>Worked answer</summary>

The best constant is the class frequency, 20/1,000 = 0.02: the 980 others pull down with 980 × 0.02 = 19.6 and the 20 blades pull up with 20 × 0.98 = 19.6. Every listing sits at 0.02, below 0.5, so nothing is flagged, and accuracy on the flag question is 98%. Balancing the pulls at 0.5 needs each blade to count 980/20 = 49 times: 980 × 0.5 = 490 down against 49 × 20 × 0.5 = 490 up, so `pos_weight=torch.tensor(49.0)`. The rarer the class, the larger the weight and the fewer real examples stand behind it; 20 blades counted 49 times are still 20 blades, and the threshold on the unweighted scores remains the cheaper lever to try first.

</details>

**2. Checking the threshold once more.** The threshold was chosen at 0.02 on the validation photos. A colleague, seeing the 337 false flags on test, proposes recomputing the cost sweep on the test photos and shipping whichever threshold is cheapest there. What is right in the instinct, and where is the wrong turn?

<details>
<summary>Worked answer</summary>

The instinct is right that 337 false flags is a real cost and that a price of 2 may be wrong; if so, the fix is a better price, and the sweep is rerun on validation. The wrong turn is the test set. A threshold picked on test has been chosen on the photos that are supposed to report it, so its test cost is a validation cost with the winner's curse built in, and the shop has no unbiased number left. If test and validation disagree about the best threshold, the disagreement is what the error bar looks like on a few hundred blades, not a reason to move. Choose on validation, score test once, and if the test number must change a decision, hold out photos no choice has touched.

</details>

## The lab

The lab, [split, weight, threshold, then score the release](../labs/trust-the-number.md), opens with the input pipeline, why a training run waits on the JPEG decoder and how many loading processes it takes, then runs the chapter's numbers on the synthetic catalogue in about ten seconds. It should print 0.994 for held-out photos with a sibling in training, 0.924 against 0.878 for the two splits, 0.938 for never flagging, the sweep choosing 0.02 per photo and 0.05 per listing, and a release line of `blades caught 13 of 19`. Two variations follow: a horizontal flip, and a missed blade priced at 5.

The shop's next classifier job arrives with a new supplier: a garden range, photographed under different lighting, with a few hundred labelled photos. Chapter 3 starts from a model somebody else trained, freezes it, trains a new head on top, and watches the frozen part change anyway.

*Sources: Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 3.9, 3.11, 4.3, 6.2, 6.3, 6.4, 7.4, 8.5, 11.4, 11.5 and 15.2; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 4.4 and 7.20; all paraphrased as study material. Chip Huyen, Designing Machine Learning Systems, early release, pp. 116, 120–133, 163–166 and 223 (physical); Daniel Vaughan, Data Science: The Hard Parts, pp. 139–143 (physical); Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, pp. 146–151, 367 and 468–469 (physical); Yuan Tang, Distributed Machine Learning Patterns, pp. 29 and 59–60; the PyTorch 2.14 documentation and source for CrossEntropyLoss and DataLoader.*
