# Lab: learn from reward, then from preferences

The lab for chapter 4, [Train From Reward](../chapters/train-from-reward.md). It fills the corridor's value table both ways and trains the corridor policy with `ppo_loss`, then trains the shop's tiny answer writer on demonstrations, labels pairs with a hidden scorer, fits a reward model and tunes the writer four ways, printing the reward-model and hidden scores the chapter quotes.

<!--mission-->
## Exercise: learn from reward, then from preferences

The script fills the corridor's value table both ways, checks the four clip rows, trains the corridor policy with `ppo_loss`, then trains a tiny answer writer on demonstrations, labels 600 pairs with a hidden scorer, fits a reward model, and tunes the writer with PPO four ways. PyTorch on a CPU, about eleven seconds.

```python
import copy
import torch
import torch.nn as nn
import torch.nn.functional as F

def ppo_loss(new_logp, old_logp, advantage, mask, eps=0.2):
    """PPO's clipped objective as a loss, averaged over the positions in mask. Used by both parts."""
    ratio = torch.exp(new_logp - old_logp)                     # pi_new(action) / pi_old(action)
    clipped = torch.clamp(ratio, 1 - eps, 1 + eps)
    return -(torch.min(ratio * advantage, clipped * advantage) * mask).sum() / mask.sum()

# ---------- Part 1: a corridor with no labels, only a reward at the end ----------
N, GAMMA = 5, 0.9                                              # cells 0..4; reaching cell 4 pays 1

def step(cell, action):                                        # action 0 = left, 1 = right
    nxt = max(0, min(N - 1, cell + (1 if action == 1 else -1)))
    return nxt, float(nxt == N - 1), nxt == N - 1              # next cell, reward, episode over

straight = [(0, 1), (1, 1), (2, 1), (3, 1)]                    # one episode: right four times

mc = torch.zeros(N, 2)
G = 0.0
for cell, action in reversed(straight):                        # Monte Carlo: wait for the end, look back
    _, reward, _ = step(cell, action)
    G = reward + GAMMA * G
    mc[cell, action] = G                                       # the measured return
print("Monte Carlo after 1 episode:   Q(cell, right) =", [round(v, 3) for v in mc[:4, 1].tolist()])

td = torch.zeros(N, 2)
for episode in range(1, 5):
    for cell, action in straight:                              # Q-learning: update after every step
        nxt, reward, done = step(cell, action)
        td[cell, action] = reward + (0.0 if done else GAMMA * td[nxt].max())   # uses its own estimate
    print(f"Q-learning after {episode} episode(s): Q(cell, right) =", [round(v, 3) for v in td[:4, 1].tolist()])

for p_old, p_new, adv in [(0.25, 0.50, +1.0), (0.25, 0.50, -1.0), (0.50, 0.35, -1.0), (0.50, 0.35, +1.0)]:
    new_logp = torch.tensor([p_new]).log().requires_grad_()
    loss = ppo_loss(new_logp, torch.tensor([p_old]).log(), torch.tensor([adv]), torch.ones(1))
    loss.backward()
    print(f"clip check: {p_old:.2f} -> {p_new:.2f}, advantage {adv:+.0f}: loss {loss.item():+.2f}, gradient {new_logp.grad.item():+.2f}")

torch.manual_seed(0)
logits = torch.zeros(N, 2, requires_grad=True)                 # the policy: two action scores per cell
opt = torch.optim.Adam([logits], lr=0.1)
for rnd in range(1, 31):
    cells, actions, returns, lengths = [], [], [], []
    for _ in range(16):                                        # collect 16 episodes with the current policy
        cell, trajectory = 0, []
        for _ in range(20):
            action = torch.multinomial(F.softmax(logits[cell], -1), 1).item()
            nxt, reward, done = step(cell, action)
            trajectory.append((cell, action, reward))
            cell = nxt
            if done:
                break
        G = 0.0
        for c, a, r in reversed(trajectory):
            G = r + GAMMA * G
            cells.append(c); actions.append(a); returns.append(G)
        lengths.append(len(trajectory))
    S, A, R = torch.tensor(cells), torch.tensor(actions), torch.tensor(returns)
    advantage = (R - R.mean()) / (R.std() + 1e-8)              # better or worse than this batch's average
    with torch.no_grad():
        old_logp = F.log_softmax(logits[S], -1).gather(1, A[:, None]).squeeze(1)   # stored at collection
    for _ in range(4):                                         # reuse the batch four times
        new_logp = F.log_softmax(logits[S], -1).gather(1, A[:, None]).squeeze(1)
        loss = ppo_loss(new_logp, old_logp, advantage, torch.ones_like(advantage))
        opt.zero_grad(); loss.backward(); opt.step()
    if rnd in (1, 10, 30):
        p_right = F.softmax(logits, -1)[:4, 1].tolist()
        print(f"policy round {rnd:2d}: mean episode length {sum(lengths) / len(lengths):4.1f}, P(right) by cell {[round(p, 2) for p in p_right]}")

# ---------- Part 2: preferences, a reward model, and PPO on the answer writer ----------
PRODUCTS = ["kettle", "watch", "lamp"]
PHRASES = [["in", "stock"], ["ships", "today"], ["great", "value"], ["buy", "now"]]
vocab = ["<pad>", "</s>", ":"] + PRODUCTS + sorted({w for p in PHRASES for w in p})
ids = {w: i for i, w in enumerate(vocab)}
MAX_NEW = 8

def hidden_score(words):                                       # stands in for what people want
    text = " ".join(words)
    score = 1.0 * (("in stock" in text) or ("ships today" in text))   # says something useful
    score -= 1.0 * text.count("buy now")                                # pushy
    score -= 0.3 * max(0, len(words) - 4)                               # long
    return score

demonstrations = []                                            # every product with one or two phrases
for product in PRODUCTS:
    for a in PHRASES:
        demonstrations.append([product, ":"] + a)
        for b in PHRASES:
            if a != b:
                demonstrations.append([product, ":"] + a + b)

class Writer(nn.Module):
    """Chapter 1's block with the output projection (q, k, v, o) and a small feed-forward layer added."""
    def __init__(self, dim=32, max_len=12):
        super().__init__()
        self.tok, self.pos = nn.Embedding(len(vocab), dim), nn.Embedding(max_len, dim)
        self.q, self.k, self.v, self.o = (nn.Linear(dim, dim) for _ in range(4))
        self.ff = nn.Sequential(nn.Linear(dim, 64), nn.ReLU(), nn.Linear(64, dim))
        self.head = nn.Linear(dim, len(vocab))
    def forward(self, x):
        h = self.tok(x) + self.pos(torch.arange(x.shape[1]))
        h = h + self.o(F.scaled_dot_product_attention(self.q(h), self.k(h), self.v(h), is_causal=True))
        h = h + self.ff(h)
        return self.head(h)

def pad(seqs):
    width = max(map(len, seqs))
    return torch.tensor([[ids[w] for w in s] + [0] * (width - len(s)) for s in seqs])

torch.manual_seed(0)
policy = Writer()
opt = torch.optim.Adam(policy.parameters(), lr=3e-3)
data = pad([d + ["</s>"] for d in demonstrations])
for _ in range(400):                                           # supervised training on demonstrations, from random weights
    logits = policy(data[:, :-1])
    loss = F.cross_entropy(logits.reshape(-1, len(vocab)), data[:, 1:].reshape(-1), ignore_index=0)
    opt.zero_grad(); loss.backward(); opt.step()
reference = copy.deepcopy(policy).eval()                       # the frozen starting writer
for p in reference.parameters():
    p.requires_grad = False
start_state = copy.deepcopy(policy.state_dict())

def sample(model, n, gen):
    seqs = [[PRODUCTS[i], ":"] for i in torch.randint(0, 3, (n,), generator=gen).tolist()]
    done = [False] * n
    with torch.no_grad():
        for _ in range(MAX_NEW):
            logits = model(pad(seqs))
            last = logits[torch.arange(n), torch.tensor([len(s) for s in seqs]) - 1]
            nxt = torch.multinomial(F.softmax(last, -1), 1, generator=gen).squeeze(1).tolist()
            for i in range(n):
                if not done[i]:
                    seqs[i].append(vocab[nxt[i]])
                    done[i] = vocab[nxt[i]] == "</s>"
            if all(done):
                break
    return seqs

def token_logps(model, seqs):
    """Log-probability of every generated token, and a mask that is 1 on those positions."""
    x = pad(seqs)
    logp = F.log_softmax(model(x[:, :-1]), -1).gather(2, x[:, 1:].unsqueeze(2)).squeeze(2)
    mask = torch.zeros_like(logp)
    for i, s in enumerate(seqs):
        mask[i, 1:len(s) - 1] = 1                              # predictions of the tokens after "product :"
    return logp, mask

words_of = lambda s: [w for w in s[2:] if w != "</s>"]

gen = torch.Generator().manual_seed(1)
first, second = sample(policy, 600, gen), sample(policy, 600, gen)
pairs, agree, differ = [], 0, 0
for a, b in zip(first, second):                                # one comparison per pair, same product
    b = [a[0]] + b[1:]
    d = hidden_score(words_of(a)) - hidden_score(words_of(b))
    prefer_a = torch.rand(1, generator=gen).item() < torch.sigmoid(torch.tensor(2.0 * d)).item()
    pairs.append((a, b) if prefer_a else (b, a))               # (chosen, rejected)
    if d != 0:
        differ += 1
        agree += prefer_a == (d > 0)
print(f"\npreference pairs: {len(pairs)}; where the hidden scores differ ({differ}), the label picks the better answer {agree / differ:.3f} of the time")

class RewardModel(nn.Module):
    """One learned number per word, summed over the answer, plus a bias."""
    def __init__(self):
        super().__init__()
        self.w, self.b = nn.Embedding(len(vocab), 1), nn.Parameter(torch.zeros(1))
    def forward(self, seqs):
        return torch.stack([self.w(torch.tensor([ids[w] for w in words_of(s)] or [0])).sum() for s in seqs]) + self.b

rm = RewardModel()
ropt = torch.optim.Adam(rm.parameters(), lr=0.05)
train_pairs, held_out = pairs[:500], pairs[500:]
for _ in range(200):
    chosen, rejected = zip(*train_pairs)
    loss = -F.logsigmoid(rm(list(chosen)) - rm(list(rejected))).mean()   # -log sigma(r_w - r_l)
    ropt.zero_grad(); loss.backward(); ropt.step()
with torch.no_grad():
    chosen, rejected = zip(*held_out)
    accuracy = (rm(list(chosen)) > rm(list(rejected))).float().mean().item()
    better = [(a, b) if hidden_score(words_of(a)) > hidden_score(words_of(b)) else (b, a)
              for a, b in held_out if hidden_score(words_of(a)) != hidden_score(words_of(b))]
    ranks_better = (rm([a for a, _ in better]) > rm([b for _, b in better])).float().mean().item()
print(f"reward model: held-out pair accuracy {accuracy:.3f}; ranks the better answer first in {ranks_better:.3f} of {len(better)} held-out pairs that differ")
print("  weights",
      {t: round(rm.w.weight[ids[t]].item(), 2) for t in ["in", "stock", "ships", "today", "great", "value", "buy", "now"]})

def evaluate(model, n=300):
    seqs = sample(model, n, torch.Generator().manual_seed(7))
    words = [words_of(s) for s in seqs]
    with torch.no_grad():
        reward = rm(seqs).mean().item()
        logp, mask = token_logps(model, seqs)
        ref_logp, _ = token_logps(reference, seqs)
    kl = ((logp - ref_logp) * mask).sum(1).mean().item()
    return reward, sum(map(hidden_score, words)) / n, sum(map(len, words)) / n, kl, " ".join(words[0])

REPORT = "%-28s reward model %5.2f  hidden score %5.2f  words %.1f  KL %5.2f | %s"
print(REPORT % (("before RL",) + evaluate(policy)))

def tune(beta, eps, epochs, rounds=40):
    policy.load_state_dict(start_state)
    popt = torch.optim.Adam(policy.parameters(), lr=1e-3)
    gen = torch.Generator().manual_seed(3)
    for _ in range(rounds):
        seqs = sample(policy, 64, gen)                         # 64 answers from the current writer
        with torch.no_grad():
            old_logp, mask = token_logps(policy, seqs)
            ref_logp, _ = token_logps(reference, seqs)
            kl = ((old_logp - ref_logp) * mask).sum(1)         # how far each answer is from the reference
            reward = rm(seqs) - beta * kl                      # learned reward minus the KL penalty
            advantage = (reward - reward.mean()) / (reward.std() + 1e-8)
        for _ in range(epochs):
            new_logp, _ = token_logps(policy, seqs)
            loss = ppo_loss(new_logp, old_logp, advantage[:, None], mask, eps)   # tokens share the answer's advantage
            popt.zero_grad(); loss.backward(); popt.step()
    return evaluate(policy)

for label, beta, eps, epochs in [("no KL, clip 0.2, 4 epochs", 0.0, 0.2, 4),
                                 ("KL 0.2, clip 0.2, 4 epochs", 0.2, 0.2, 4),
                                 ("KL 0.2, clip 0.2, 10 epochs", 0.2, 0.2, 10),
                                 ("KL 0.2, no clip, 10 epochs", 0.2, float("inf"), 10)]:
    print(REPORT % ((label,) + tune(beta, eps, epochs)))
```

What each part does in real reinforcement-learning and preference-tuning code:

- **`ppo_loss`** is the clipped objective as the negative mean over the positions in `mask`. Implementations commonly subtract an entropy bonus from it and train a value network alongside; the clip itself is these three lines.
- **`step`** is the environment: a simulator's `step(action)` returns the next state, the reward and whether the episode is over, as this one does.
- **The Monte Carlo loop** walks the episode backwards with G = r + γ·G; **the Q-learning loop** replaces each entry by one reward plus γ times the next cell's larger entry, inside the step loop, so the table changes mid-episode. With α = 1 both write their target directly.
- **The clip check** calls `ppo_loss` on one sample per row of the chapter's table and prints the loss and its slope with respect to the current log-probability.
- **The corridor policy** is a table of two scores per cell. Each round collects 16 episodes, turns returns into advantages by normalising over the batch, stores the old log-probabilities under `torch.no_grad()`, and reuses the batch for 4 epochs.
- **`hidden_score`** stands in for people and is used only to label pairs and to report; the policy's optimization uses the learned reward model and the reference penalty instead. **`demonstrations`** are the 48 curated answers.
- **`Writer`** is chapter 1's block with the output projection plus a feed-forward layer, trained from random weights on the demonstrations with chapter 1's next-token cross-entropy. **`reference`** is its frozen copy and **`start_state`** lets every tuning run start from the same writer.
- **`sample`** generates at temperature 1 up to `MAX_NEW` tokens; **`token_logps`** returns the log-probability of every generated token and a mask over them, the per-token numbers PPO and the KL penalty need.
- **The pair loop** samples two answers per product from the fine-tuned writer and labels them with probability σ(2 × score difference), counting how often the label agrees with the hidden score.
- **`RewardModel`** sums one learned weight per word. It trains on 500 pairs with `-F.logsigmoid(r_w - r_l)`, the chapter's loss, and is scored on the other 100, both against the labels and against the hidden order.
- **`tune`** is the preference-tuning loop: 64 answers per round, reward = reward model minus β times the summed log-ratio against the reference, normalised advantages shared by all tokens of an answer, then `epochs` passes through `ppo_loss`. `eps=float("inf")` removes the clip. **`evaluate`** reports on 300 fresh answers from a fixed seed.

**Expected result.** PyTorch 2.14 on a CPU; the output is in the chapter's corpus and is identical between runs.

```text
Monte Carlo after 1 episode:   Q(cell, right) = [0.729, 0.81, 0.9, 1.0]
Q-learning after 1 episode(s): Q(cell, right) = [0.0, 0.0, 0.0, 1.0]
Q-learning after 2 episode(s): Q(cell, right) = [0.0, 0.0, 0.9, 1.0]
Q-learning after 3 episode(s): Q(cell, right) = [0.0, 0.81, 0.9, 1.0]
Q-learning after 4 episode(s): Q(cell, right) = [0.729, 0.81, 0.9, 1.0]
clip check: 0.25 -> 0.50, advantage +1: loss -1.20, gradient +0.00
clip check: 0.25 -> 0.50, advantage -1: loss +2.00, gradient +2.00
clip check: 0.50 -> 0.35, advantage -1: loss +0.80, gradient +0.00
clip check: 0.50 -> 0.35, advantage +1: loss -0.70, gradient -0.70
policy round  1: mean episode length 16.5, P(right) by cell [0.63, 0.64, 0.67, 0.68]
policy round 10: mean episode length  4.2, P(right) by cell [0.85, 0.97, 0.99, 0.99]
policy round 30: mean episode length  4.0, P(right) by cell [0.99, 1.0, 1.0, 1.0]

preference pairs: 600; where the hidden scores differ (374), the label picks the better answer 0.904 of the time
reward model: held-out pair accuracy 0.770; ranks the better answer first in 1.000 of 64 held-out pairs that differ
  weights {'in': 0.24, 'stock': 0.84, 'ships': 0.68, 'today': 0.58, 'great': 0.63, 'value': -0.57, 'buy': -2.2, 'now': 0.57}
before RL                    reward model  0.34  hidden score  0.33  words 3.5  KL  0.00 | buy now ships today
no KL, clip 0.2, 4 epochs    reward model  6.12  hidden score -0.20  words 8.0  KL 49.51 | in stock stock stock stock stock stock stock
KL 0.2, clip 0.2, 4 epochs   reward model  2.39  hidden score  0.97  words 4.1  KL  2.34 | in stock ships today
KL 0.2, clip 0.2, 10 epochs  reward model  2.31  hidden score  1.00  words 4.0  KL  2.07 | in stock ships today
KL 0.2, no clip, 10 epochs   reward model  5.16  hidden score -0.20  words 8.0  KL 26.58 | in stock ships ships ships ships ships ships
```

Read it against the chapter. The Monte Carlo column is right after one episode; Q-learning's reward walks back one cell per episode. The clip check zeroes the gradient exactly where the table says. The reward model is perfect on the pairs that differ and still only 0.770 against the labels. Its weights for *great* and *value* nearly cancel, +0.63 and −0.57, which matches the hidden score: the phrase is neither useful nor pushy. Its weights for *buy* and *now* do not separate the phrase's penalty evenly, −2.20 and +0.57, because the two words always appeared together and only their sum was ever tested. Without the penalty the reward model's score is the highest on the page and the hidden score the lowest; with the penalty and the clip, the writer says what a customer needs in four words; without the clip, the reused batches undo the penalty.

Two things to try. Change β in the second run from `0.2` to `0.05`: the reward model's score reaches 5.30, the hidden score falls to −0.20, and the answers repeat again, so a weak penalty only slows the exploit. Then set it to `1.0`: the KL stays at 0.50, the hidden score reaches only 0.86, and the sample answer is still *buy now ships today*, so a strong penalty keeps the writer too close to the reference to fix what was wrong with it.
