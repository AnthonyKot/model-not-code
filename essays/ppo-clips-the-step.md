# PPO: Reuse the Samples, But Not Too Much

You are training a policy: a network that takes the state of an environment and outputs a probability for each action. Experience costs slow environment steps, so you train on each collected batch for several epochs instead of one. The reward curve rises for a while, then drops and does not come back.

It does not come back for a reason specific to reinforcement learning. In supervised learning a bad update leaves the data untouched. Here the next batch is collected by the policy you now have. A policy fitted too closely to one batch picks bad actions elsewhere, those actions lead to states where nothing good happens, and the data gathered there teaches it little that would get it out. The policy has collapsed, and it feeds itself the evidence that keeps it there.

Using each batch once avoids this and wastes most of what the samples could teach. Proximal policy optimisation, PPO, takes a middle path: reuse the batch for many epochs, but stop each sample from pushing once the policy has moved far enough on its account. One ratio and one clip do that; this essay is about both, and about what they do not do.

## The ratio: how far one sample's action has moved

A policy-gradient update needs two things per sample: the probability the policy gives to the action that was taken, and the advantage. The advantage, written A, is an estimate of how much better or worse that action turned out than the value estimate expected from that state. The simplest form takes the reward that followed, adds the value network's estimate for the state reached, discounted by a factor γ below 1, and subtracts its estimate for the state left. A positive A means the action beat expectations and should become more likely; a negative A means it should become less likely.

To reuse a batch you need to know how far the policy has already moved on each sample, so at collection time you store the probability of each taken action, and on every later pass you divide the current probability by the stored one:

<p class="formula">r = π<sub>θ</sub>(a | s) / π<sub>θ<sub>old</sub></sub>(a | s)</p>

Term by term: s is the state in the stored sample and a the action that was taken there. π<sub>θ</sub>(a | s) is the probability the policy gives that action now, with its current parameters θ. π<sub>θ<sub>old</sub></sub>(a | s) is the stored probability from collection time, fixed for all the epochs on this batch. r is their ratio: exactly 1 on the first pass, 2 if the action has become twice as likely, 0.7 if it has lost 30% of its probability.

Multiply r by A and average over the batch, and you have an objective whose gradient at r = 1 is the ordinary policy gradient. Maximise it without limit and one batch can drive r to any size: the oversized update that ends in collapse. Trust-region methods, the older fix, draw a boundary around the current policy, measured as the average KL divergence between the old and new action distributions (one number for how differently they spread probability), and search for an improvement inside it. PPO replaces that boundary with something much cheaper: a cap on each sample's ratio.

## The clip: where the leash goes taut

The capped objective is:

<p class="formula">L<sup>CLIP</sup> = mean over samples of min( r·A,&nbsp; clip(r, 1 − ε, 1 + ε)·A )</p>

Term by term. r·A is the uncapped term from above. ε, epsilon, is a hyperparameter you choose: the fraction by which a sample's action probability may grow or shrink before that sample stops pushing. clip(r, 1 − ε, 1 + ε) returns r if it lies between 1 − ε and 1 + ε, and otherwise the nearer edge. min takes the lower of the two terms, the more pessimistic estimate of how good the change is. Training maximises L<sup>CLIP</sup>; code minimises its negative.

As for its value: PPO was introduced with ε = 0.2, which makes the band [0.8, 1.2], and this essay uses it throughout.

The min gives the clip a direction. Take a positive advantage. While r is below 1 + ε the two terms are equal or the uncapped one is lower, so the sample pushes with its full gradient. Past 1 + ε the capped term, the constant 1.2·A, is lower; the min selects it, and a constant has zero gradient, so further growth earns nothing. If instead the probability of this good action had fallen, the uncapped term is the lower one, the min keeps it, and the sample keeps pushing. The clip never excuses a move in the wrong direction; it only stops rewarding a move in the right one once that move exceeds ε. For a negative advantage the picture is mirrored: the sample stops pushing once r has fallen below 1 − ε.

<figure class="diagram">
<svg viewBox="0 0 640 250" width="100%" role="img" aria-label="Two plots of one sample's clipped objective against the ratio r. Left, positive advantage: the objective rises along r until r = 1.2 and is flat after it; the table's row 4 sits on the rising part at r = 0.7 and row 1 on the flat part at r = 2. Right, negative advantage: the objective is flat at minus 0.8 for r below 0.8 and falls along minus r after it; row 3 sits on the flat part at r = 0.7 and row 2 on the falling part at r = 2." style="max-width:640px;font-family:inherit;font-size:13px">
  <g fill="none" stroke="currentColor">
    <path d="M40 180 H285 M40 185 V35" stroke-width="1"/>
    <path d="M40 180 L171 75 L280 75" stroke-width="2.5"/>
    <path d="M171 75 L214 40" stroke-width="1.2" stroke-dasharray="4 3"/>
    <path d="M149 180 V35 M171 180 V35" stroke-width="0.8" stroke-dasharray="2 3"/>
    <g transform="translate(330 0)">
      <path d="M40 40 H285 M40 35 V205" stroke-width="1"/>
      <path d="M40 98 L127 98 L280 200" stroke-width="2.5"/>
      <path d="M40 40 L127 98" stroke-width="1.2" stroke-dasharray="4 3"/>
      <path d="M127 40 V205 M149 40 V205" stroke-width="0.8" stroke-dasharray="2 3"/>
    </g>
  </g>
  <g fill="currentColor">
    <circle cx="258" cy="75" r="5"/><circle cx="116" cy="119" r="5"/>
    <circle cx="446" cy="98" r="5"/><circle cx="588" cy="185" r="5"/>
  </g>
  <g fill="currentColor" font-size="12">
    <text x="258" y="64" text-anchor="middle">row 1</text>
    <text x="104" y="112" text-anchor="end">row 4</text>
    <text x="446" y="88" text-anchor="middle">row 3</text>
    <text x="578" y="190" text-anchor="end">row 2</text>
    <text x="149" y="198" text-anchor="middle">1</text><text x="175" y="198" text-anchor="start">1.2</text>
    <text x="285" y="198" text-anchor="end">r</text>
    <text x="36" y="80" text-anchor="end">1.2</text>
    <text x="160" y="14" text-anchor="middle">A &gt; 0: flat above 1 + ε</text>
    <text x="453" y="32" text-anchor="end">0.8</text><text x="483" y="32" text-anchor="middle">1</text>
    <text x="615" y="32" text-anchor="end">r</text>
    <text x="366" y="102" text-anchor="end">−0.8</text>
    <text x="490" y="14" text-anchor="middle">A &lt; 0: flat below 1 − ε</text>
    <text x="320" y="232" text-anchor="middle">solid: L<tspan baseline-shift="super" font-size="9">CLIP</tspan>; dashed: r·A where they differ</text>
  </g>
</svg>
<figcaption>One sample's term of L<sup>CLIP</sup> as a function of r, at ε = 0.2 and A = ±1. A flat stretch has zero slope, so a sample sitting on it contributes no gradient. The flat stretch is always on the side the advantage asked for.</figcaption>
</figure>

## Worked example: four samples, one ε

The numbers are the book's own and invented. Two stored samples, each looked at once with a positive and once with a negative advantage, ε = 0.2. The first had probability 0.30 at collection and 0.60 now, so r = 0.60 / 0.30 = 2, clipped to 1.2. The second had 0.50 and now 0.35, so r = 0.35 / 0.50 = 0.7, clipped to 0.8.

| Row | π<sub>old</sub> → π<sub>θ</sub> | A | r·A | clip(r)·A | min | Gradient |
|---|---|---|---|---|---|---|
| 1 | 0.30 → 0.60 | +1 | 2 | 1.2 | 1.2 (clipped) | zero |
| 2 | 0.30 → 0.60 | −1 | −2 | −1.2 | −2 (uncapped) | live |
| 3 | 0.50 → 0.35 | −1 | −0.7 | −0.8 | −0.8 (clipped) | zero |
| 4 | 0.50 → 0.35 | +1 | 0.7 | 0.8 | 0.7 (uncapped) | live |

The clip bites in rows 1 and 3, where the policy has already moved the way the advantage wanted by more than ε. In row 2 the action became twice as likely despite a negative advantage; the min charges the full −2 rather than a softened −1.2, and the sample keeps pulling. Row 4 is the mirror: a good action lost probability, and the sample keeps pushing. A sample whose r is still inside [0.8, 1.2] has equal terms and a live gradient either way.

How large is the live gradient? Implementations store log-probabilities, so r is computed as e raised to (log π<sub>θ</sub> − log π<sub>old</sub>). The derivative of that with respect to log π<sub>θ</sub> is r itself, so the derivative of r·A is A·r. Row 2: −1 × 2 = −2, so raising the log-probability lowers the objective and the optimiser lowers the probability. Row 4: +1 × 0.7 = 0.7. The loss is the negative objective, so its gradients are +2 and −0.7, as the exercise prints.

## What the clip does not do

The clip removes a sample's incentive to move further. It is not a limit on how far the policy actually moves.

Two things carry the policy past the edge. The first is step size: the gradient is computed at the current r, and one step with a large learning rate can carry r from 1 to nearly 4, as the exercise shows. There the sample sits on a flat stretch and nothing pulls it back. The second is shared parameters. A zero gradient does not freeze a sample's probability; the other samples still move the same weights, and in a softmax, lowering one action raises the others. In the exercise below, action 0's two positive-advantage samples stop pushing once its ratio passes 1.2, yet the negative-advantage samples of action 1 keep raising it, and it ends at 1.299. An action with no advantage at all ends at 1.248.

So the number of epochs, the steps within each and the learning rate still bound the real move; the clip only decides which samples are still pushing. One PyTorch implementation, for scale, collects 2,049 steps, normalises their advantages to mean 0 and standard deviation 1, and runs 10 epochs over them in minibatches of 64. After the epochs, the updated policy becomes the new old policy, every ratio resets to 1, and the next batch can move it again: the clip bounds the incentive per batch, not the distance over training.

Finally, the clip takes its direction from the sign of A. An advantage estimate with the wrong sign sends its sample the wrong way, and the clip limits that move exactly as it would limit a right one.

The same algorithm is used to fine-tune language models from human preferences. There the environment is one prompt and one response, the reward comes from a learned reward model scoring that response, and the episode ends. A per-token KL penalty against the supervised starting model is subtracted from the reward, to limit over-optimising the reward model: drifting toward responses it scores ever higher but the supervised model would be unlikely to write.

<!--mission-->
## Exercise: watch the gradient switch off

PyTorch only, a few seconds on a CPU. Part 1 is the table; Part 2 reuses one batch for 50 epochs on a three-action policy, uncapped, then clipped at a small and a large learning rate.

```python
import torch

torch.manual_seed(0)
eps = 0.2

# Part 1: one sample at a time, the four cells of the table.
cases = [  # (pi_old, pi_new, advantage)
    (0.30, 0.60, +1.0),
    (0.30, 0.60, -1.0),
    (0.50, 0.35, -1.0),
    (0.50, 0.35, +1.0),
]
for pi_old, pi_new, A in cases:
    old_logp = torch.tensor(pi_old).log()                     # stored when the batch was collected
    logp = torch.tensor(pi_new).log().requires_grad_()       # what the current policy gives now
    r = torch.exp(logp - old_logp)                           # ratio new / old
    objective = torch.min(r * A, torch.clamp(r, 1 - eps, 1 + eps) * A)
    loss = -objective                                        # optimisers minimise
    loss.backward()
    print(f"old {pi_old:.2f} new {pi_new:.2f} A {A:+.0f}: r {r.item():.3f}  "
          f"objective {objective.item():+.3f}  d loss/d logp {logp.grad.item():+.3f}")

# Part 2: a tiny categorical policy, one batch reused for many epochs.
start_logits = torch.tensor([-1.0, 0.5, 0.0])                # three actions, one state
actions = torch.tensor([0, 0, 1, 1, 1, 2, 2, 2])             # the batch that was collected
adv = torch.tensor([1.0, 1.0, -1.0, -1.0, -1.0, 0.0, 0.0, 0.0])
pi_old = torch.softmax(start_logits, -1)
print("pi_old", [round(x, 3) for x in pi_old.tolist()])


def run(label, clip, lr, epochs=50):
    print(label)
    logits = torch.nn.Parameter(start_logits.clone())
    old_logp = torch.log_softmax(start_logits, -1)[actions]  # stored once, never updated
    opt = torch.optim.SGD([logits], lr=lr)
    for epoch in range(1, epochs + 1):
        logp = torch.log_softmax(logits, -1)[actions]
        r = torch.exp(logp - old_logp)
        unclipped = r * adv
        clipped = torch.clamp(r, 1 - eps, 1 + eps) * adv
        obj = torch.min(unclipped, clipped) if clip else unclipped
        loss = -obj.mean()
        opt.zero_grad()
        loss.backward()
        opt.step()
        if epoch in (1, 2, 5, 10, 50):
            live = int(((adv > 0) & (r < 1 + eps)).sum() + ((adv < 0) & (r > 1 - eps)).sum()) if clip else int((adv != 0).sum())
            ratio = (torch.softmax(logits, -1) / pi_old).detach()
            print(f"  after epoch {epoch:2d}: ratio per action {[round(x, 3) for x in ratio.tolist()]}  "
                  f"samples with gradient this epoch {live}")


run("unclipped r*A, lr 0.5", clip=False, lr=0.5)
run("clipped, lr 0.5", clip=True, lr=0.5)
run("clipped, lr 5.0", clip=True, lr=5.0)
```

What each part does:

- **`old_logp`** is what a real PPO loop stores at collection time, one number per sample. Here it comes from a plain tensor, so no gradient can flow into it; production code calls `.detach()` on it for the same reason.
- **`logp ... requires_grad_()`** marks the current log-probability as the thing to differentiate. In a real network it is the output of `log_softmax` over the policy's logits, as in Part 2, and the gradient continues into the weights.
- **`r = torch.exp(logp - old_logp)`** forms the ratio from log-probabilities: the same number as the division, from what the network already produces.
- **`torch.clamp(r, 1 - eps, 1 + eps)`** is clip: outside the band its output is constant, gradient zero; inside, it passes r through.
- **`torch.min(...)`** is the pessimistic choice. Autograd sends the gradient down whichever branch was selected, which is how a clipped branch switches a sample off.
- **`loss = -obj.mean()`** turns the maximisation into the minimisation every optimiser performs.
- **`run`** reuses the same eight samples for 50 epochs with fixed advantages, as PPO's inner loop does. `live` counts the samples that contributed a gradient that epoch.
- **`ratio`** reports how far the policy has actually moved, per action, after the step.

**Expected result.** Run with PyTorch 2.14 on a CPU; the full output is in the essay's corpus. Part 1 prints `d loss/d logp +0.000`, `+2.000`, `+0.000` and `-0.700` for rows 1 to 4, with objectives `+1.200`, `-2.000`, `-0.800` and `+0.700`. Part 2 prints `pi_old [0.122, 0.547, 0.331]`. Uncapped, the ratios reach `[8.085, 0.011, 0.025]` by epoch 50, action 0 near its ceiling of 1 / 0.122 ≈ 8.2. Clipped at learning rate 0.5, the live count falls from `5` to `3` to `0` and the policy stops at `[1.299, 0.783, 1.248]`: close to the band, and past both edges. Clipped at learning rate 5.0, the first step lands at `[3.824, 0.219, 1.249]`, no sample has a gradient from epoch 2 on, and the policy stays there, nearly four times as likely to pick action 0 as at collection.

*Sources: Advanced Reinforcement Learning: policy gradient methods (Udemy), lectures 11.1, 11.2, 11.3, 11.6, 12.1, 12.5, 12.6 and 13.1, paraphrased as study material; Maxim Lapan, Deep Reinforcement Learning Hands-On, 3rd edition, chapter 16, the PPO section; Schulman et al., Proximal Policy Optimization Algorithms, arXiv:1707.06347, §3 and §5; Ouyang et al., Training language models to follow instructions with human feedback, arXiv:2203.02155, §3.5.*
