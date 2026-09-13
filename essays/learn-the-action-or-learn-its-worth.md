# Measure the Return, or Guess It From the Next State

You move a small network from a supervised task to a reinforcement-learning one. The optimiser and the mean squared error are the same, but the loss that fell smoothly before now wanders and the predictions drift. The network is not the problem; the labels are. In a supervised dataset each target is fixed on disk. In this loop each target is computed from the network's own output, so every step toward the target moves the target.

That is a deliberate choice, and it separates the two families of reinforcement learning. A policy-gradient method learns what to do: it outputs a probability per action and shifts them. A value method learns what each action is worth: it outputs an estimated return per action and takes the largest. Both need a number saying how good an action turned out to be. REINFORCE, the simplest policy-gradient method, waits for the episode to end and measures it. Q-learning, the simplest value method, guesses it from its own estimate of the next state. That difference decides when learning happens, how errors travel, and why deep Q-learning needs machinery REINFORCE does without.

## The quantity both families need

An episode is a sequence of steps: in a state, take an action, receive a reward and a next state, until the task ends. What you want to maximise is not one reward but the return, the discounted sum of rewards from some step to the end:

<p class="formula">G<sub>t</sub> = r<sub>t</sub> + γ·r<sub>t+1</sub> + γ<sup>2</sup>·r<sub>t+2</sub> + … + γ<sup>T−t</sup>·r<sub>T</sub></p>

G<sub>t</sub> is the return counted from step t. r<sub>t</sub> is the reward for the action taken at step t, and r<sub>T</sub> the reward at the last step T. γ, the discount factor, is a number between 0 and 1 that you choose: each reward one step further away is multiplied by one more γ, so sooner rewards count for more. Written from the back, G<sub>t</sub> = r<sub>t</sub> + γ·G<sub>t+1</sub>: a step's return is its reward plus the discounted return of the next step, and the last step's return is its reward.

The Q-value Q(s, a) is the return you expect from state s if you take action a and then carry on with the policy. A value method keeps a table, or a network, of estimates of Q. The question is what to move each estimate toward.

## Measured: wait for the end and average

A Monte Carlo method plays an episode to its end, computes every G<sub>t</sub> with the backwards form, and moves the estimate for each visited state and action toward the return that actually followed:

<p class="formula">Q(s, a) ← Q(s, a) + α · (G − Q(s, a))</p>

Q(s, a) on the right is the old estimate, G the return observed after taking a in s, and G − Q(s, a) the error. α, the learning rate, is the fraction of the error applied. With α = 1/N, where N counts the returns observed for that pair so far, the estimate is exactly their average.

No estimate here uses any other estimate, so each is correct on average for the policy that played, however wrong the rest of the table is. And nothing is learned before the episode ends, because G needs every later reward. REINFORCE scales each action's probability update by the same measured G<sub>t</sub> and inherits both properties.

## Guessed: one reward, then the table's own opinion

Q-learning updates after every step, with the transition (s, a, r, s′) in hand:

<p class="formula">Q(s, a) ← Q(s, a) + α · (r + γ · max<sub>a′</sub> Q(s′, a′) − Q(s, a))</p>

r is the reward just received and s′ the state reached. max<sub>a′</sub> Q(s′, a′) is the largest current estimate among the actions in s′, the table's opinion of s′ if the best-looking action is taken there. So the target, r + γ · max<sub>a′</sub> Q(s′, a′), is one real reward plus a guess for everything after. The bracket is the error and α the fraction applied, as before. If the step ended the episode, the target is r alone.

Updating one estimate from another is called bootstrapping. It buys an update per step instead of per episode, and while the table is wrong, the target is built from a wrong number. It has one more consequence. The target uses the best action in s′, not the action actually taken next, so the data can come from any exploratory behaviour and the update still estimates the value of acting greedily. That is what "off-policy" means here.

## Worked example: a four-state corridor

This corridor is invented and its numbers are the book's own. Four states in a row, S0 to S3; episodes start in S0. The action right moves one state along, and right from S3 ends the episode with reward 1; every other reward is 0. An action left also exists, which these episodes never take, so its estimates stay 0. Take γ = 0.9.

<figure class="diagram">
<svg viewBox="0 0 640 150" width="100%" role="img" aria-label="Corridor of four states S0 to S3 and an end square; arrows between them carry reward 0, 0, 0 and plus 1 on the last; under each state its measured return 0.729, 0.81, 0.9 and 1" style="max-width:640px;font-family:inherit;font-size:14px">
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <circle cx="60" cy="60" r="26"/><circle cx="190" cy="60" r="26"/><circle cx="320" cy="60" r="26"/><circle cx="450" cy="60" r="26"/>
    <rect x="555" y="36" width="56" height="48"/>
    <path d="M86 60 H160 M216 60 H290 M346 60 H420 M476 60 H551"/>
    <path d="M152 54 L162 60 L152 66 M282 54 L292 60 L282 66 M412 54 L422 60 L412 66 M543 54 L553 60 L543 66"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="60" y="65">S0</text><text x="190" y="65">S1</text><text x="320" y="65">S2</text><text x="450" y="65">S3</text><text x="583" y="65">end</text>
    <text x="125" y="48" font-size="12">r = 0</text><text x="255" y="48" font-size="12">r = 0</text><text x="385" y="48" font-size="12">r = 0</text><text x="513" y="48" font-size="12">r = +1</text>
    <text x="60" y="118" font-size="12">G = 0.729</text><text x="190" y="118" font-size="12">G = 0.81</text><text x="320" y="118" font-size="12">G = 0.9</text><text x="450" y="118" font-size="12">G = 1</text>
  </g>
</svg>
<figcaption>The corridor, taking right at every step. The rewards are on the arrows; under each state is the discounted return that follows taking right there.</figcaption>
</figure>

**Monte Carlo, one episode.** From the back: S3's return is 1; S2's is 0 + 0.9 × 1 = 0.9; S1's, 0 + 0.9 × 0.9 = 0.81; S0's, 0 + 0.9 × 0.81 = 0.729. When the first episode ends, the table for right holds exactly these four numbers, and identical episodes after it change nothing.

**Q-learning, four episodes, α = 1.** With α = 1 the update replaces Q(s, a) by its target. Start from zeros. In episode 1, the step from S0 has target 0 + 0.9 × max Q(S1) = 0.9 × 0 = 0, and so do the steps from S1 and S2. The step from S3 ends the episode, so its target is 1. In episode 2, S0 and S1 still see zeros ahead. At S2 the target is 0.9 × max(Q(S3, left), Q(S3, right)) = 0.9 × max(0, 1) = 0.9. Episode 3 reaches S1, episode 4 reaches S0:

| After episode | Q(S0, right) | Q(S1, right) | Q(S2, right) | Q(S3, right) |
|---|---|---|---|---|
| 1 | 0 | 0 | 0 | 1 |
| 2 | 0 | 0 | 0.9 | 1 |
| 3 | 0 | 0.81 | 0.9 | 1 |
| 4 | 0.729 | 0.81 | 0.9 | 1 |
| Monte Carlo, after episode 1 | 0.729 | 0.81 | 0.9 | 1 |

The tables agree at the end. Monte Carlo needed one episode because it measured each return. Q-learning moved the reward back one state per episode, because an update sees one step ahead, and within an episode S1 is updated before S2, so it reads S2's value from the previous episode. The zeros in the first three rows are not noise but an error in the same direction every time: bias.

With a realistic learning rate the walk is slower. At α = 0.5 each update goes halfway, and the halves compound: after episode 4, Q(S0, right) is 0.5 × 0.9 × 0.10125 = 0.0456, where 0.10125 is S1's value after episode 3. The start state first comes within 10% of 0.729 (at least 0.6561) after episode 12, at 0.6758.

## When the table becomes a network

Table entries are independent. Network outputs are not, because every output is computed from the same shared weights. The prediction Q(s, a) and the target's Q(s′, ·) both depend on those weights, so when their inputs produce overlapping activations, one optimiser step that changes the prediction also changes the target it was aimed at. That is the wandering loss from the opening.

Deep Q-learning damps it with two additions. A target network is a frozen copy used only to compute the targets, re-copied from the trained network periodically, so the labels hold still between copies. A replay memory is a bounded store of past transitions, oldest evicted first, from which each update samples a random batch, so consecutive near-identical states do not arrive together.

REINFORCE needs neither. Its target is measured, so there is no estimate inside it to chase. And it cannot replay: a stored return measures the policy that played that episode, which is no longer the current one. Q-learning can replay because its target uses the greedy action, not the one the old policy took. The exercise measures that difference.

## What each choice costs

Measurement is unbiased but noisy. When the environment is random or the policy explores, each return is a different sum of many random rewards, so the average settles slowly, and nothing updates until the episode's last step. Bootstrapping updates every step and each target contains only one random reward, but it is biased while the estimates are wrong, as the corridor's zeros showed. Methods in between use several real rewards before switching to the estimate. Which cost you can afford depends on how long your episodes are and how noisy your rewards are.

<!--mission-->
## Exercise: both updates on the corridor, in PyTorch

This runs on a CPU in a few seconds with PyTorch alone. The Q-table is a `torch.zeros` tensor, a row per state and a column per action: the same shape a deep Q-network outputs for a batch of states.

```python
import torch

torch.manual_seed(0)
GAMMA = 0.9
N_STATES = 4                      # S0..S3; moving right from S3 ends the episode with reward 1
LEFT, RIGHT = 0, 1


def step(s, a):
    """Deterministic chain: returns (next_state, reward, done)."""
    if a == RIGHT:
        if s == N_STATES - 1:
            return None, 1.0, True
        return s + 1, 0.0, False
    return max(s - 1, 0), 0.0, False


def q_learning_episode(Q, behaviour, alpha):
    """Update Q after every step: target = r + gamma * max_a' Q(s', a')."""
    s, done = 0, False
    while not done:
        a = behaviour(s)
        s2, r, done = step(s, a)
        target = r if done else r + GAMMA * Q[s2].max()
        Q[s, a] += alpha * (target - Q[s, a])
        s = s2


def monte_carlo_episode(Q, N, behaviour):
    """Play to the end, then average in the measured return G for each first visit."""
    s, done, trajectory = 0, False, []
    while not done:
        a = behaviour(s)
        s2, r, done = step(s, a)
        trajectory.append((s, a, r))
        s = s2
    G, returns = 0.0, []
    for s, a, r in reversed(trajectory):
        G = r + GAMMA * G              # discounted return from this step to the end
        returns.append((s, a, G))
    seen = set()
    for s, a, G in reversed(returns):  # forward order, so the first visit wins
        if (s, a) in seen:
            continue
        seen.add((s, a))
        N[s, a] += 1
        Q[s, a] += (G - Q[s, a]) / N[s, a]   # running average of observed returns


def fmt(Q):
    return [round(v, 4) for v in Q[:, RIGHT].tolist()]


always_right = lambda s: RIGHT

print("Part A: four identical episodes, alpha = 1 for Q-learning")
Q_td = torch.zeros(N_STATES, 2)
Q_mc, N_mc = torch.zeros(N_STATES, 2), torch.zeros(N_STATES, 2)
for ep in range(1, 5):
    q_learning_episode(Q_td, always_right, alpha=1.0)
    monte_carlo_episode(Q_mc, N_mc, always_right)
    print(f"episode {ep}: Q-learning Q(s, right) {fmt(Q_td)}   Monte Carlo {fmt(Q_mc)}")

print("\nPart B: alpha = 0.5, episodes until Q(S0, right) is within 10% of 0.729")
Q_td = torch.zeros(N_STATES, 2)
for ep in range(1, 100):
    q_learning_episode(Q_td, always_right, alpha=0.5)
    if ep in (1, 4, 5, 8) or Q_td[0, RIGHT] >= 0.9 * 0.729:
        print(f"episode {ep}: Q-learning Q(s, right) {fmt(Q_td)}")
    if Q_td[0, RIGHT] >= 0.9 * 0.729:
        break

print("\nPart C: a wandering behaviour (right with probability 0.7), same episodes for both")
wander = lambda s: RIGHT if torch.rand(()) < 0.7 else LEFT
Q_td = torch.zeros(N_STATES, 2)
Q_mc, N_mc = torch.zeros(N_STATES, 2), torch.zeros(N_STATES, 2)
for ep in range(1, 2001):
    g = torch.get_rng_state()
    q_learning_episode(Q_td, wander, alpha=0.1)
    torch.set_rng_state(g)                     # replay the identical episode for Monte Carlo
    monte_carlo_episode(Q_mc, N_mc, wander)
    if ep in (1, 10, 100, 2000):
        print(f"episode {ep:4d}: Q-learning Q(S0, right) {Q_td[0, RIGHT].item():.4f}"
              f"   Monte Carlo Q(S0, right) {Q_mc[0, RIGHT].item():.4f}")

# Exact value of the wandering policy, for comparison: iterate the Bellman expectation to a fixed point.
V = torch.zeros(N_STATES + 1)                  # index N_STATES is the terminal state, value 0
for _ in range(2000):
    Qpi = torch.zeros(N_STATES, 2)
    for s in range(N_STATES):
        for a in (LEFT, RIGHT):
            s2, r, done = step(s, a)
            Qpi[s, a] = r + (0.0 if done else GAMMA * V[s2])
    V[:N_STATES] = 0.3 * Qpi[:, LEFT] + 0.7 * Qpi[:, RIGHT]
print(f"exact Q(S0, right) of the wandering policy {Qpi[0, RIGHT].item():.4f}; of always-right {GAMMA**3:.4f}")
```

What each part does:

- **`step`** is the environment. A simulator's `step(action)` returns the same next state, reward and end-of-episode flag, plus extras.
- **`Q[s2].max()`** is max<sub>a′</sub> Q(s′, a′). In a deep Q-network the row comes from the target network, and the result is detached (`.detach()` or `torch.no_grad()`) so no gradient flows into the target.
- **`target = r if done else ...`** is the terminal rule. Batched code writes it as a mask that zeroes the next-state value wherever `done` is true.
- **`Q[s, a] += alpha * (target - Q[s, a])`** runs inside the step loop, so the table changes mid-episode. With a network it becomes a squared-error loss between the prediction and the target, then `optimizer.step()`.
- **`monte_carlo_episode`** touches the table only after the episode. The backward loop is G<sub>t</sub> = r<sub>t</sub> + γ·G<sub>t+1</sub>; `seen` keeps each pair's first visit; dividing by `N[s, a]` keeps a running average.
- **Part A** is the worked example. **Part B** uses α = 0.5. **Part C** acts right with probability 0.7, restores the random state so both methods see identical episodes, and runs 2,000 of them. **The last block** computes the exact Q(S0, right) of that wandering behaviour from the known transitions.

**Expected result.** PyTorch 2.14, CPU, seed 0; full output in the essay's corpus. Part A prints `[0.0, 0.0, 0.0, 1.0]`, `[0.0, 0.0, 0.9, 1.0]`, `[0.0, 0.81, 0.9, 1.0]` and `[0.729, 0.81, 0.9, 1.0]` for Q-learning, and `[0.729, 0.81, 0.9, 1.0]` for Monte Carlo on every line. Part B prints `[0.0456, 0.2531, 0.6187, 0.9375]` at episode 4 and stops at episode 12 with `[0.6758, 0.7944, 0.8971, 0.9998]`. Part C prints Q-learning at `0.0000`, `0.0366`, `0.7286`, `0.7290` after episodes 1, 10, 100 and 2,000, and Monte Carlo at `0.5905`, `0.5263`, `0.5420`, `0.5373`; the last line gives `0.5361` for the wandering policy and `0.7290` for always-right.

In Part C, Monte Carlo is noisy early (its first episode took two extra steps and measured 0.9<sup>5</sup> = 0.5905) and settles near 0.5361, the value of the behaviour that played. Q-learning converges to 0.729, the value of always going right, learned from episodes that did not always go right. That gap is why Q-learning may learn from a replay memory and REINFORCE must keep collecting fresh episodes.

*Sources: Reinforcement Learning beginner to master — AI in Python (Udemy), lectures 2.5, 2.6, 2.8, 4.1, 4.9, 5.1, 5.3, 5.8, 6.3, 9.3, 9.4, 10.1, 11.1 and 11.5, paraphrased as study material; Maxim Lapan, Deep Reinforcement Learning Hands-On, 3rd edition (EPUB), chapter 5 "Value, state, and optimality", chapter 6 "Tabular Q-learning", "Correlation between steps" and "The final form of DQN training", chapter 11 "The REINFORCE method" and "REINFORCE issues".*
