# learn-the-action-or-learn-its-worth — essay note

**Drafted by:** Claude Opus 5, subagent (2026-09-13). Review lanes: Gemini 3.8 flash and Gemini 3.1 pro via agy; consolidation and one reader persona: codex gpt-5.6-sol (when not rate-limited).

**Pitch:** B (one family measures the return, the other bootstraps it), author's pick 2026-09-13.
**Drafted:** 2026-09-13 by a subagent, receipts before prose, exercise run before the Expected result.

## Sources actually used

- course-3725442 (Reinforcement Learning beginner to master): 02-05 (reward vs return), 02-06
  (discount factor), 02-08 (V and Q defined), 04-01 (Monte Carlo = average of observed returns,
  no bootstrapping), 04-09 (constant-alpha MC, rule spoken in words), 05-01 (TD = MC + DP
  bootstrapping; MC waits for episode end), 05-03 (MC table unchanged mid-episode; note only),
  05-08 (Q-learning off-policy), 06-03 (bias vs variance), 09-03 (replay memory), 09-04 (moving
  target, target network), 10-01 (deep Q-learning uses both), 11-01 (policy vs value families),
  11-05 (REINFORCE = Monte Carlo, no bootstrapping). Also read, not used: 04-02, 05-02, 05-04,
  05-12, 09-02, 11-04.
- lapan-drl (EPUB, locator `unknown`): ch. 5 "Value, state, and optimality" (V as expected
  discounted sum, image eq8); ch. 6 "Tabular Q-learning" (update rule, images eq18/eq19 — read as
  images because the EPUB's alt text is a placeholder), "SGD optimization" (replay buffer),
  "Correlation between steps" (bootstrapping + target network), "The final form of DQN training"
  (terminal target y = r, images eq22/eq23), "Training" (calc_loss: target net, detach, dones
  mask); ch. 11 "The REINFORCE method" (discounted total reward, image eq40; on-policy, no replay,
  no target network), "REINFORCE issues / Full episodes are required".
- Formula provenance: G<sub>t</sub> and its backward form — 02-06 + lapan ch. 5/ch. 11 (worth-02,
  -03); Q-learning update — lapan ch. 6 eq19, written in the algebraically equal
  Q + α(target − Q) form (worth-09); terminal target — lapan ch. 6 (worth-10); Monte Carlo
  update Q + α(G − Q) and α = 1/N as average — 04-09 in words and 04-01 (worth-05, -06).

## Word counts

File 2,685 words; prose 1,762 (code block, figure, the results table and the credit line excluded;
walk-through bullets and Expected result included).

## Numbers

All worked-example and exercise numbers are the book's own (receipts worth-18..21, labelled
`observed`, attached to the lecture that supplies the rule since the receipts check rejects a
`book` source key). `workspace/learn-the-action-or-learn-its-worth/exercise.py` (PyTorch 2.14.0+cpu,
seed 0) printed every value quoted; output in `corpus/learn-the-action-or-learn-its-worth/run.log`.
Hand checks: MC returns 1, 0.9, 0.81, 0.729; Q-learning α = 1 table rows [0,0,0,1], [0,0,0.9,1],
[0,0.81,0.9,1], [0.729,0.81,0.9,1]; α = 0.5 episode 4 Q(S0) = 0.5 × 0.9 × 0.10125 = 0.0456
(S1 after ep. 3 = 0.5 × 0.9 × 0.225; S2 after ep. 2 = 0.5 × 0.9 × 0.5); threshold 0.9 × 0.729 =
0.6561 first crossed at episode 12 (0.6758, script). Part C (wandering behaviour, right w.p. 0.7):
Q-learning 0.0000/0.0366/0.7286/0.7290 at 1/10/100/2,000; first-visit MC 0.5905/0.5263/0.5420/
0.5373; exact 0.5361 by fixed-point iteration in the script. 0.5905 = 0.9<sup>5</sup>.
No lecture or book figure is used in the prose.

## Deviations from the pitch

- Pitch B's exercise was numpy with a five-state corridor, α = 0.5, ε = 0.1 and a claim that the
  Q table needs at least four episodes before the start state is non-zero and that MC is
  "unbiased from the first successful episode". Replaced (per the brief and the caller) with
  PyTorch on the same four-state chain as the worked example: Part A reproduces the table,
  Part B shows α = 0.5 (12 episodes to within 10%), Part C shows MC converging to the behaviour
  policy's value (0.5361) while Q-learning converges to the greedy value (0.729) from the same
  episodes. Part C is what backs the replay-memory/on-policy paragraph with a measurement.
- The pitch's 0.9⁴ ≈ 0.656 target belongs to its five-state corridor; on the essay's four-state chain
  the start value is 0.9³ = 0.729, and the 10% threshold is 0.9 × 0.729 = 0.6561 (numerically
  the same figure). Pitch arithmetic otherwise checks out (0.729, 0.81, 0.9, 1.0).
- The Monte Carlo side is Monte Carlo value estimation (as the caller asked), with REINFORCE named
  as the policy-gradient method that uses the same measured return; the REINFORCE update itself
  (∇log π) is not written out — it belongs to Pitch A/C territory and `ppo-clips-the-step`.
- The pitch's frozen-target sync "every K episodes" is stated as "periodically" (lecture says K
  episodes for deep SARSA, the book N steps for DQN).

## Title and catalog suggestions

The catalog title "Learn What To Do, or Learn What It Is Worth" and mechanism line describe policy
vs value methods (Pitch A). Pitch B's content is measured return vs bootstrapped target; the essay
keeps the catalog title (required) and ties it in the second paragraph, but a better fit is:

- **title:** "Measure the Return, or Guess It From the Next State"
- **mechanism:** "Monte Carlo methods wait for the episode to end and average the returns they
  observed; Q-learning updates every step toward one reward plus its own estimate of the next
  state, which is why a deep Q-network needs a target network and can use a replay memory."
- **payoff:** "Why a Q-learning network chases a target that moves as it learns, and why waiting
  for the whole episode avoids that at the price of noisier, slower updates."
- **caution:** "Tabular and deterministic; the corridor shows bias and propagation speed exactly,
  but variance only through an exploratory behaviour, not through random rewards."
- **sources[]:** C("3725442", "02-05", "02-06", "02-08", "04-01", "04-09", "05-01", "05-03",
  "05-08", "06-03", "09-03", "09-04", "10-01", "11-01", "11-05"), B("lapan-drl"). Drop 11-02,
  11-03, 11-04 (not used).

## Checks

`node checks/receipts.mjs`: 22 passed, 0 failed for this slug. `node checks/paraphrase.mjs --all`:
0 twelve-word failures; 2 eight-word warnings, both runs of table digits ("0 0 0 0 1 0 0 0")
matched against course-4735368 — not language, left as is. `consistency.mjs` shows only the
shared boilerplate phrases all essays use ("in the essay's corpus", figure markup).

## Owes

- `ppo-clips-the-step` inherits "REINFORCE must learn from fresh samples"; this essay gives the
  reason by measurement (Part C) but does not show the ∇log π update.
- A Part IV or later essay on deep Q-learning, if any, should not re-explain the target network
  and replay memory from scratch; this essay gives each one paragraph.
- 05-03's maze demonstration is cited only in a receipt note.
