### 1. Gut reaction after first read (2-4 sentences).
Finally, an explanation for why PR metrics drop in staging that doesn't hide behind hand-wavy academic jargon about "generalization." It treats data splits like an engineering budget and checkpoint selection like an active maximization loop, which any senior backend developer will immediately respect. If an ML candidate walked me through validation leakage using the winner's curse like this, I would hire them on the spot.

### 2. What landed — specific passages (quote briefly) and why they worked for someone like me.
- **"Early stopping is best-of-N you run every day."** Candidates regularly cite early stopping as a silver-bullet regularizer; almost none recognize that saving the lowest validation loss is an optimization step that produces upward bias.
- **"The three splits are three budgets"** and **"every look at test that changes a choice turns it into validation."** Treating held-out data as an un-replenishable capital budget maps directly to systems engineering intuitions about state mutation and information leakage.
- **"The first number was never an estimate of the model's accuracy. It was the largest of twenty noisy measurements..."** This is the exact language needed to shut down pointless post-mortems when production metrics come back lower than the PR description.

### 3. What didn't — where I got lost, doubted the author, felt talked down to, or could not follow the mechanism. Quote the spot. If the worked example's numbers did not come out for me, say what I got.
- **The missing math on 12.81:** The toy arithmetic works ($11/16 = 0.6875$), and $\binom{20}{\ge 13} / 2^{20} = 137,980 / 1,048,576 \approx 0.1316$ checks out. But the author abruptly states: *"The expected best score is 12.81 out of 20, 0.6405"*. After painstakingly tabulating the $2 \times 2$ grid earlier, dropping a raw number without explaining how the expectation over the maximum of six binomials is calculated felt like a sudden hand-wave.
- **Unexplained EVT rule of thumb:** *"Divided by the standard error, the inflation depends on N alone: about 1.2 standard errors for five candidates..."* Senior developers will sniff that extreme value theory is at play here and wonder why the underlying dependency suddenly became an empirical assertion.
- **Sloppy environment detail:** Citing *"PyTorch 2.14 on a CPU"* immediately triggers skepticism—PyTorch 2.14 does not exist.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes for the base script: it is self-contained, runs fast on CPU, sets a fixed seed, and provides explicit printouts to verify against. However, for the follow-up modification (*"Set `n_test` to 50... its spread across trials is 0.0562"*), a reader will hit a wall unless they modify the harness: `best_of_n()` averages out the distribution and returns only scalar means (`.mean().item()`), discarding the raw trial vectors needed to calculate the spread (`.std()`).

### 5. What changed between read one and read two.
On read one, I loved the framing—the budget metaphor and the takedown of naive early stopping sold me immediately. On read two, putting on my sponsor hat, I noticed the gaps in rigor: the jump to 12.81 without derivation, the asserted inflation-per-SE ratios, and the fact that the follow-up exercise asks you to verify numbers that the printed code actively discards.

### 6. One concrete thing I'd tell the author to change.
Update `best_of_n()` to return standard deviations alongside means (or return the raw trial tensors), and explicitly show the code adjustment for the $n_{test} = 50$ check so the reader isn't asked to inspect a spread that the script actively suppresses.
