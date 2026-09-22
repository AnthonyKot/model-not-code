# Train From Reward

Chapter 3 taught the shop's answer writer a format. The shop now needs its answers to be *good*: a customer asking about a kettle is served by *in stock ships today*, not by *buy now*, and four words beat eight. Nobody can write "good" down as a label at every token, but people shown two answers can say which they prefer, so the shop collected 600 such comparisons, trained a scorer on them, and tuned the writer to raise that score. After 40 rounds the scorer's mean over fresh answers had risen from 0.34 to 6.12, and the writer's typical answer was *in stock stock stock stock stock stock stock*. Judged by the hidden scorer that stands in for the people, the one the labels were sampled from, the answers had got worse, from 0.33 to −0.20. Why does the number you optimise stop meaning what it measured?

The chapter first shows what can be learned from a score that arrives only when an answer is finished, on a corridor small enough to follow by hand, then reads the writer as the same learner with tokens for moves. It then shows where the people's preferences enter and what the scorer built from them cannot have learned, runs the tuning and watches it exploit that gap, and ends with the two guards that keep it honest. Everything is synthetic; a hidden scorer stands in for the people.

## What a score at the end can teach

A signal that says "this was better" without saying what the right output was is a **reward**, and learning from rewards is reinforcement learning. The corridor has five cells, numbered 0 to 4. An episode starts in cell 0 and at each step the agent chooses left or right; moving into cell 4 pays a reward of 1 and ends the episode, every other step pays 0, and moving left from cell 0 goes nowhere.

<figure class="diagram">
<svg viewBox="0 0 660 150" width="100%" role="img" aria-label="A corridor of five cells, 0 to 4. Arrows to the right between them carry reward 0, 0, 0 and plus 1 into cell 4, which ends the episode. Under cells 0 to 3, the return after moving right: 0.729, 0.81, 0.9 and 1." style="max-width:660px;font-family:inherit;font-size:14px">
  <defs><marker id="tfr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="20" y="36" width="60" height="48" rx="4"/><rect x="150" y="36" width="60" height="48" rx="4"/><rect x="280" y="36" width="60" height="48" rx="4"/><rect x="410" y="36" width="60" height="48" rx="4"/>
    <rect x="560" y="36" width="80" height="48" rx="4" stroke-width="2.5"/>
  </g>
  <g stroke="currentColor" stroke-width="1.3" fill="none">
    <path d="M80,60 H146" marker-end="url(#tfr-arrow)"/><path d="M210,60 H276" marker-end="url(#tfr-arrow)"/><path d="M340,60 H406" marker-end="url(#tfr-arrow)"/><path d="M470,60 H556" marker-end="url(#tfr-arrow)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="50" y="65">cell 0</text><text x="180" y="65">cell 1</text><text x="310" y="65">cell 2</text><text x="440" y="65">cell 3</text><text x="600" y="65">cell 4, end</text>
    <text x="113" y="50" font-size="12">r = 0</text><text x="243" y="50" font-size="12">r = 0</text><text x="373" y="50" font-size="12">r = 0</text><text x="513" y="50" font-size="12">r = +1</text>
    <text x="50" y="112" font-size="12">G = 0.729</text><text x="180" y="112" font-size="12">G = 0.81</text><text x="310" y="112" font-size="12">G = 0.9</text><text x="440" y="112" font-size="12">G = 1</text>
  </g>
</svg>
<figcaption>The corridor, moving right at every step. Rewards are on the arrows; under each cell is the discounted return that follows moving right from it, with γ = 0.9.</figcaption>
</figure>

A reward of 1 arrives after the fourth step, and nothing says the first step deserved any of it. What the agent maximises is the **return**, the discounted sum of rewards from a step to the end of the episode:

<p class="formula">G<sub>t</sub> = r<sub>t</sub> + γ·r<sub>t+1</sub> + γ<sup>2</sup>·r<sub>t+2</sub> + … = r<sub>t</sub> + γ·G<sub>t+1</sub></p>

G<sub>t</sub> is the return counted from step t, r<sub>t</sub> the reward for the action at step t. γ, the **discount factor**, is a number between 0 and 1 that you choose; each reward one step further away is multiplied by one more γ. The right-hand form computes returns from the back, each one its reward plus γ times the next. With γ = 0.9 the four steps right have returns 1, 0.9, 0.81 and 0.729.

**Q(s, a)** is the return to expect after taking action a in state s and carrying on as you do. A **Monte Carlo** method fills it by playing an episode to its end and writing each measured return into its entry: after one straight episode the column for right holds exactly 0.729, 0.81, 0.9 and 1. **Q-learning** does not wait for the end: after every step it sets the entry to the reward just received plus γ times the larger of the table's two entries for the next cell, its own estimate of what comes after. Run the straight episode four times:

| After episode | Q(0, right) | Q(1, right) | Q(2, right) | Q(3, right) |
|---|---|---|---|---|
| 1 | 0 | 0 | 0 | 1 |
| 2 | 0 | 0 | 0.9 | 1 |
| 3 | 0 | 0.81 | 0.9 | 1 |
| 4 | 0.729 | 0.81 | 0.9 | 1 |

In episode 1, every step before the last reads a next cell whose entries are still 0, so it learns 0; only the step into cell 4 learns 1. In episode 2 the step from cell 2 reads that 1 and learns 0.9, and so on back, one cell per episode. The zeros are a **bias**, an error in the same direction until the estimates are right; a measured return has none, and instead varies from episode to episode and teaches nothing until the episode ends. The answer writer takes the measured route: one answer is one short episode, and its reward arrives when it ends.

<details>
<summary>Optional: the two update rules, and what changes when the table becomes a network</summary>

Both methods move an entry towards a target by a fraction α of the error, a learning rate:

<p class="formula">Q(s, a) ← Q(s, a) + α · (G − Q(s, a))&nbsp;&nbsp;&nbsp;&nbsp;Q(s, a) ← Q(s, a) + α · (r + γ · max<sub>a′</sub> Q(s′, a′) − Q(s, a))</p>

G is the measured return after taking a in s; r is the one reward the step paid and s′ the cell it led to; max<sub>a′</sub> Q(s′, a′) is the larger of the table's entries for s′, and 0 if the step ended the episode. With α = 1 the entry is replaced by the target, as in the table. Updating one estimate from another is **bootstrapping**. Once the table is a network, a step for one state also moves the estimate for the next, so deep Q-learning computes targets from a frozen copy, a **target network**, and reuses old transitions from a **replay memory**, which a measured return cannot do. Methods that also train a value network V, estimating a state's return, use r + γ·V(s′) − V(s) as the advantage below: what the step earned and led to, against what was expected.

</details>

## The writer is a policy, one token at a time

A **policy** skips the value table and outputs the probability of each action directly: a score per action, turned into probabilities by a softmax. That is what chapter 1's generator does at every position:

| | Corridor | Answer writer |
|---|---|---|
| State | The current cell | The prompt and the tokens written so far |
| Action | Left or right | The next token, from the whole vocabulary |
| Policy | A softmax over two scores | Chapter 1's softmax over the vocabulary |
| Episode | A walk to cell 4 | One answer, up to `</s>` or the length limit |
| Reward | 1 on reaching the end | One number for the finished answer |
| Stored at collection | Log-probability of each move | Log-probability of each token |

The policy-gradient update makes an action that turned out well more likely and one that turned out badly less likely. For one step where action a was taken in state s, the loss is:

<p class="formula">loss = −A · ln π(a | s)</p>

π(a | s) is the probability the policy gives to the action it took, and A, the **advantage**, says how much better that action turned out than expected. With A = 1 this is chapter 1's cross-entropy with the sampled action as the label, slope p − y; the advantage scales that slope, towards the action when A is positive and away when it is negative. The lab's advantage is the return minus the batch's average, divided by the batch's standard deviation; every token of an answer shares its answer's advantage.

Collecting episodes is the slow part, so the standard method, **proximal policy optimisation** or PPO, reuses each batch for a few epochs with a guard: it stores each action's probability at collection, and on every later pass a sample whose probability has already moved more than a chosen fraction, commonly 20%, in the direction its advantage asked for stops pushing. That is the **clip**. It removes the incentive, not the ability, to move further, so the epochs and the learning rate still control the real change.

<details>
<summary>Optional: the ratio, the clipped objective and the four samples that show what the clip does</summary>

On each later pass PPO compares the current probability with the stored one:

<p class="formula">ratio = π<sub>θ</sub>(a | s) / π<sub>old</sub>(a | s) = e<sup>ln π<sub>θ</sub>(a | s) − ln π<sub>old</sub>(a | s)</sup></p>

π<sub>θ</sub> is the policy with its current weights θ, and π<sub>old</sub> the stored probability from collection, fixed for all epochs on this batch. The clipped objective is:

<p class="formula">L = min( ratio · A,&nbsp; clip(ratio, 1 − ε, 1 + ε) · A )</p>

ε is a setting you choose, commonly 0.2, which makes the band [0.8, 1.2]; clip returns the ratio if it lies inside the band and the nearer edge otherwise; min takes the lower of the two terms. The loss is −L averaged over the batch:

```python
def ppo_loss(new_logp, old_logp, advantage, mask, eps=0.2):
    ratio = torch.exp(new_logp - old_logp)                     # pi_new(action) / pi_old(action)
    clipped = torch.clamp(ratio, 1 - eps, 1 + eps)
    return -(torch.min(ratio * advantage, clipped * advantage) * mask).sum() / mask.sum()
```

Four samples at ε = 0.2, with the slope of the loss with respect to the current log-probability:

| Stored → current probability | A | ratio | ratio · A | clip · A | Loss | Gradient |
|---|---|---|---|---|---|---|
| 0.25 → 0.50 | +1 | 2 | 2 | 1.2 | −1.20 | 0 |
| 0.25 → 0.50 | −1 | 2 | −2 | −1.2 | +2.00 | +2.00 |
| 0.50 → 0.35 | −1 | 0.7 | −0.7 | −0.8 | +0.80 | 0 |
| 0.50 → 0.35 | +1 | 0.7 | 0.7 | 0.8 | −0.70 | −0.70 |

In the first row a good action has already doubled its probability; the min picks the constant 1.2, which has no slope, and the sample stops pushing. In the second it doubled despite a negative advantage; the min keeps the full −2 and pulls it back; rows three and four mirror them.

</details>

In the lab this loop takes the corridor's policy from a coin flip per cell, 16.5 steps an episode, to a straight walk by round 30, with right at 0.99 or above in every cell. What the writer lacks is the reward: the corridor had one built in, and for answers somebody has to supply it.

## Where the people's preferences become the score

People are shown two answers to the same prompt and pick the better one. Comparisons are noisy: in one such pipeline the training labellers agreed with each other on about 73% of them. They come after pretraining and chapter 3's supervised stage that taught the format, in larger numbers, since comparing is easier than writing. The lab's writer is not chapter 3's: it is chapter 1's block with a feed-forward layer, trained from random weights on 48 demonstrations, each a product with one or two of the phrases *in stock*, *ships today*, *great value*, *buy now*.

A hidden scoring function stands in for the people: +1 if the answer says *in stock* or *ships today*, −1 for every *buy now*, and −0.3 for every word beyond four. It is never shown to the writer being tuned. Each of 600 pairs of answers sampled from the writer is labelled at random, with a probability that rises with the gap between their hidden scores, so that tied pairs are a coin flip; where the scores differed, 374 pairs, the label picked the better answer 0.904 of the time.

The labels train a **reward model**: a network that reads a prompt and an answer and outputs one number, r. It is a two-way classifier: the probability it gives to the chosen answer being preferred is σ(r<sub>chosen</sub> − r<sub>rejected</sub>), chapter 1's softmax over two scores, and the loss is cross-entropy with the chosen answer as the label.

<details>
<summary>Optional: the preference loss, one worked pair, and where the zero goes</summary>

The reward model's loss on a pair is:

<p class="formula">loss = −ln σ(r<sub>w</sub> − r<sub>l</sub>)</p>

r<sub>w</sub> is the reward model's score for the answer people chose, the winner, and r<sub>l</sub> its score for the loser; σ, the sigmoid, maps any number to a probability between 0 and 1, so σ(r<sub>w</sub> − r<sub>l</sub>) is the probability the model gives to the chosen answer being preferred, the two-way softmax e<sup>r<sub>w</sub></sup> / (e<sup>r<sub>w</sub></sup> + e<sup>r<sub>l</sub></sup>) rewritten, so the slope is p − y again. A worked pair: the model scores the chosen answer 0.5 and the rejected one 1.0. Then σ(−0.5) = 0.3775, the loss is −ln 0.3775 = 0.9741, and the slope is −0.6225 on r<sub>w</sub> and +0.6225 on r<sub>l</sub>. Only the difference enters, so the zero is arbitrary; a bias can fix it, and in the lab the bias receives no gradient and stays at 0.

</details>

The lab's reward model is deliberately the smallest that can learn from pairs: one learned number per word, summed over the answer. Trained on 500 pairs and scored on the 100 held back, it agrees with the labels on 0.770 of them. On the 64 held-out pairs whose hidden scores differ, it ranks the better answer first every time, and the rest of the gap is the labels' own noise. The learned weights are readable: *buy* −2.20, *stock* +0.84, *ships* +0.68, *today* +0.58, *in* +0.24. Three different things are now in play:

| | What it is | In the lab |
|---|---|---|
| Measured | Which of two answers a person preferred; noisy | 600 labels, 0.904 right where scores differ |
| Learned | A score r fitted so that σ(r<sub>w</sub> − r<sub>l</sub>) matches the labels | One weight per word; 1.000 on held-out pairs that differ |
| Assumed | That r keeps ranking answers correctly on answers unlike the ones in the pairs | Not tested yet |

## Tune the writer, and watch it game the reward

The tuning loop is PPO with the reward model in place of the corridor: each round the writer answers 64 prompts, each answer gets a reward, and the batch is reused for a few epochs through the clipped loss.

<figure class="diagram">
<svg viewBox="0 0 720 330" width="100%" role="img" aria-label="Two stages. Stage one, top row: the demonstration-trained writer answers prompts twice; people choose one answer of each pair; the pairs train the reward model with minus log sigma of r winner minus r loser. Stage two, a loop below: the writer being tuned writes 64 answers; each is scored by the reward model minus beta times its summed log-probability ratio against a frozen reference copy of the demonstration-trained writer; the scores become advantages normalised over the 64; ppo_loss updates the writer being tuned, and the loop repeats." style="max-width:720px;font-family:inherit;font-size:12px">
  <defs><marker id="tfr-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
  <g fill="none" stroke="currentColor" stroke-width="1.3">
    <rect x="10" y="20" width="130" height="46" rx="5"/>
    <rect x="190" y="20" width="130" height="46" rx="5"/>
    <rect x="370" y="20" width="130" height="46" rx="5"/>
    <rect x="550" y="20" width="160" height="46" rx="5" stroke-width="2.2"/>
    <rect x="10" y="160" width="150" height="46" rx="5" stroke-dasharray="5 3"/>
    <rect x="280" y="160" width="190" height="46" rx="5"/>
    <rect x="540" y="160" width="170" height="46" rx="5" stroke-width="2.2"/>
    <rect x="280" y="250" width="190" height="46" rx="5"/>
    <rect x="540" y="250" width="170" height="46" rx="5"/>
  </g>
  <g stroke="currentColor" stroke-width="1.2" fill="none">
    <path d="M140,43 H186" marker-end="url(#tfr-arrow2)"/>
    <path d="M320,43 H366" marker-end="url(#tfr-arrow2)"/>
    <path d="M500,43 H546" marker-end="url(#tfr-arrow2)"/>
    <path d="M75,66 V156" stroke-dasharray="4 3" marker-end="url(#tfr-arrow2)"/>
    <path d="M630,66 V115 H375 V156" marker-end="url(#tfr-arrow2)"/>
    <path d="M160,183 H276" marker-end="url(#tfr-arrow2)"/>
    <path d="M540,183 H474" marker-end="url(#tfr-arrow2)"/>
    <path d="M375,206 V246" marker-end="url(#tfr-arrow2)"/>
    <path d="M470,273 H536" marker-end="url(#tfr-arrow2)"/>
    <path d="M625,250 V210" marker-end="url(#tfr-arrow2)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="75" y="40">trained writer</text><text x="75" y="56" font-size="11">answers twice</text>
    <text x="255" y="40">people choose</text><text x="255" y="56" font-size="11">one of each pair</text>
    <text x="435" y="40">pairs</text><text x="435" y="56" font-size="11">(chosen, rejected)</text>
    <text x="630" y="40">reward model r</text><text x="630" y="56" font-size="11">−ln σ(r<tspan baseline-shift="sub" font-size="8">w</tspan> − r<tspan baseline-shift="sub" font-size="8">l</tspan>)</text>
    <text x="85" y="180">frozen reference</text><text x="85" y="196" font-size="11">copy, never updated</text>
    <text x="375" y="180">r(answer) − β · Σ log ratio</text><text x="375" y="196" font-size="11">one reward per answer</text>
    <text x="625" y="180">writer being tuned</text><text x="625" y="196" font-size="11">writes 64 answers</text>
    <text x="375" y="270">advantages</text><text x="375" y="286" font-size="11">normalised over the 64</text>
    <text x="625" y="270">ppo_loss</text><text x="625" y="286" font-size="11">a few epochs, then repeat</text>
    <text x="250" y="105" font-size="11">stage 1: the reward is learned</text>
    <text x="495" y="320" font-size="11">stage 2: the writer is tuned, round after round</text>
  </g>
</svg>
<figcaption>Where people and the learned reward enter. People only label pairs; the reward model turns their labels into a score; PPO tunes another copy of the demonstration-trained writer against that score, held near a frozen reference copy.</figcaption>
</figure>

**If the reward model's score rises round after round, what additional observation would make that improvement convincing?**

The first run uses the reward model's score alone; after 40 rounds, averaged over 300 fresh answers:

| Run | Reward model | Hidden score | Words | KL to reference | A sample answer |
|---|---|---|---|---|---|
| Demonstration-trained writer, before tuning | 0.34 | 0.33 | 3.5 | 0.00 | buy now ships today |
| Reward model only, clip 0.2, 4 epochs | 6.12 | −0.20 | 8.0 | 49.51 | in stock stock stock stock stock stock stock |

The reward model's mean rose while the hidden score, the thing it stood for, fell, and eight words is the length limit. Score the sample answer yourself from the printed weights: *in* 0.24 plus seven times *stock* 0.84 is 6.12, while the hidden scorer gives it +1 for *in stock* and −0.3 for each of the four words past the fourth, −0.20. The answers in its pairs came from the demonstration-trained writer: every one of the 1,200 had two or four words, and one of them repeated a word. Nothing in that data could teach it that a second *stock* is worth less than the first, or that a sixth word costs anything; each extra *stock* adds 0.84, and PPO found it. A real reward model is a large network and fails less transparently, but what carries over is the assumed row of the table: the writer being tuned produces answers unlike anything in the pairs, and the reward model's score on those answers was never checked against anyone.

The standard guard keeps the writer near where it started. Keep a frozen copy of the demonstration-trained writer, the **reference**, and subtract from each answer's reward β times how much more likely, in log terms and summed over the answer's tokens, the writer being tuned made those tokens than the reference would have. Averaged over the answers the writer produces, that sum is the **KL divergence** between the two writers, one number for how differently they spread probability, 0 while they are the same; β sets how hard the penalty pulls and is a setting you choose. The lab copies its small writer whole; at chapter 3's size the tuned weights are an adapter on a frozen base and the reference is that base with the adapter as it was, so chapter 3's unaffordable second copy is never made. The penalty is part of the reward, computed once per answer when the batch is collected.

<details>
<summary>Optional: the penalised reward, term by term</summary>

<p class="formula">reward = r(prompt, answer) − β · Σ<sub>t</sub> ( ln π<sub>θ</sub>(token<sub>t</sub> | earlier tokens) − ln π<sub>ref</sub>(token<sub>t</sub> | earlier tokens) )</p>

r is the reward model's score for the whole answer. The sum runs over the answer's tokens; π<sub>θ</sub> is the writer being tuned and π<sub>ref</sub> the frozen reference, so each term is the log of how many times more likely the tuned writer made that token than the reference would have. The average of the sum over answers sampled from π<sub>θ</sub> is the KL divergence from the reference.

</details>

| Run | Reward model | Hidden score | Words | KL to reference | A sample answer |
|---|---|---|---|---|---|
| β = 0.2, clip 0.2, 4 epochs | 2.39 | 0.97 | 4.1 | 2.34 | in stock ships today |
| β = 0.2, clip 0.2, 10 epochs | 2.31 | 1.00 | 4.0 | 2.07 | in stock ships today |

The reward model's score is far lower than in the unguarded run, and the hidden score is at its maximum of 1.00. β is a dial with a failure at each end: at 0.05 the run still ends in repeated words, and at 1.0 the writer stays so close to the reference that the hidden score reaches only 0.86. Like chapter 2's threshold, it is chosen by comparing runs on something other than the reward being maximised.

## Two guards, and why one of them was not enough

The reference penalty is not a second clip. The clip compares the writer with π<sub>old</sub>, the writer that collected *this batch*, which changes every round; the penalty compares it with the reference, which never changes. The lab's last run takes the clip away and keeps the penalty, with the batch reused for 10 epochs:

| Run | Reward model | Hidden score | Words | KL to reference | A sample answer |
|---|---|---|---|---|---|
| β = 0.2, no clip, 10 epochs | 5.16 | −0.20 | 8.0 | 26.58 | in stock ships ships ships ships ships ships |

With the penalty on, the writer still escaped into repetition, because of where the penalty sits: it was folded into the reward when the batch was collected, so during the ten epochs nothing in the loss measures the distance from the reference, and without the clip nothing stops the reused batch from pushing its favoured tokens as far as the optimiser will take them. The next batch is collected from the pushed writer, and the penalty arrives a round too late. Across ten seeds, every unguarded run ended in repeated words and every clipped run with a hidden score of 0.99 or 1.00 and a KL between 2.07 and 2.80; of the unclipped runs, four reached the maximum, five ended with answers of 6.9 to 8 words and hidden scores of 0.13 or below, and one collapsed onto *great value*, hidden score 0.

## Where it stops

A real run has to establish what the synthetic one assumed. The labels are the product: who labels, with what instructions, and how often they disagree bound what the reward model can learn, so measure their agreement on a sample labelled twice and report it beside the reward model's. The reward model is a model with errors, evaluated as chapter 2 evaluates a classifier, on pairs held out and split by prompt, then checked where it will be used: on answers sampled from partly tuned writers. And the tuned writer is judged by people choosing between its answers and the reference's on fresh prompts, not by its reward, which is expected to rise. Hosted tuning services hide most of this behind a job type, and the grader you hand one, a program or another model that scores each answer, is a reward function: the tuned model learns what it rewards, whether or not that is what you meant.

## Two questions to work

**1. The shortest answer that beats the best one.** From the printed weights, the best four-word answer, *in stock ships today*, scores 0.24 + 0.84 + 0.68 + 0.58 = 2.34 on the reward model, and the hidden scorer gives it its maximum, 1.0. Find an answer of three words or fewer that the reward model scores above 2.34, give the hidden scorer's verdict, and say what the pair means for the assumed row.

<details>
<summary>Worked answer</summary>

*stock stock stock* scores 3 × 0.84 = 2.52 on the reward model, above the best answer's 2.34. The hidden scorer gives it 0: the phrase *in stock* does not appear, nothing pushy is said, and three words carry no length penalty. A three-word answer that says nothing a customer can use outranks the ideal answer on the learned score, and nothing in the pairs contradicts it, since only one of them repeated a word. That is what "assumed" meant; the tuning run found the eight-word version.

</details>

**2. Is 0.770 the reward model's error?** A colleague reads the reward model's held-out agreement of 0.770, calls it too weak to tune against, and proposes more pairs and a larger reward model before touching the writer. What is right in that reading, and what is the wrong turn?

<details>
<summary>Worked answer</summary>

The wrong turn is reading agreement with noisy labels as the model's error. Of the 100 held-out pairs, 64 have hidden scores that differ and 36 are ties whose label was a coin flip. A reward model that ranks every differing pair correctly agrees with the label on those 64 only as often as the label itself was right, 0.904, and on the 36 ties half the time: 64 × 0.904 + 36 × 0.5 = 57.9 + 18 = 75.9, so a perfect ranker scores about 0.76 against these labels, and the lab's 0.770 sits at that ceiling, within the noise of 100 pairs, not a shortfall. More pairs help only if they are the missing check: labels on answers sampled from the writer being tuned.

</details>

## The lab

The lab, [learn from reward, then from preferences](../labs/train-from-reward.md), runs both halves on a CPU in about eleven seconds. It should print the reward model's 0.770 and 1.000 and the four tuning runs, whose printed labels write β as KL: 6.12 / −0.20 without the penalty, 0.97 and 1.00 with it, and 5.16 / −0.20 with the penalty but no clip. Two variations, β at 0.05 and at 1.0, follow it.

The writer is now tuned, and the shop ships it beside chapter 2's classifier, both scored before release on answers and photos the shop chose. After launch the only labels that arrive are the ones the shop's own decisions produce: a preference label on answers that were shown, a reviewer's verdict on a photo that was flagged. Chapter 5 follows the classifier through ten weeks of that, and watches a loud alarm go off for nothing while a silent change costs it more than a third of its recall.

*Sources: Reinforcement Learning beginner to master — AI in Python (Udemy), lectures 2.5, 2.6, 2.8, 4.1, 5.3, 5.8, 6.3, 9.3, 9.4 and 11.5; Advanced Reinforcement Learning: policy gradient methods (Udemy), lectures 11.2, 12.1, 12.6 and 13.1; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lecture 6.22; all paraphrased as study material. Maxim Lapan, Deep Reinforcement Learning Hands-On, 3rd edition (EPUB), chapter 16, the PPO section, and chapter 19, "Reinforcement Learning with Human Feedback"; Schulman et al., Proximal Policy Optimization Algorithms, arXiv:1707.06347, §3 and §5; Ouyang et al., Training language models to follow instructions with human feedback, arXiv:2203.02155, §3.5 (pp. 8–9).*
