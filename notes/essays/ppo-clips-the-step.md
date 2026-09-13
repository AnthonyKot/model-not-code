# ppo-clips-the-step — drafting note (2026-09-13, subagent)

**Pitch:** A (the ratio is the leash, the clip is where it goes taut).

**Word count:** 2,618 in the file; 1,782 prose (code, table, figure, headings and source line
excluded; 1,814 with headings).

## Sources actually used

- course-4635836 12-01 (reuse → overfit → collapse; stored probability and ratio; clip; min; case
  analysis; run-then-K-epochs loop), 11-01 (sample efficiency, step reliability), 11-02 (bad step →
  bad data, unlike fixed supervised data), 11-03 and 11-06 (trust region as a bound; mean-KL
  constraint), 12-05 and 12-06 (implementation: exp of log-prob difference, two surrogates, negative
  min, entropy bonus), 13-01 (one-step advantage). 11-04 and 11-05 skimmed, not used in prose.
- lapan-drl, EPUB `ch020.xhtml` (Chapter 16, section "PPO" and its Implementation): the J_clip and
  r_t equations (images eq55–eq57, read), PPO_EPS 0.2, 10 epochs, minibatch 64, trajectory 2049,
  advantage normalisation, the actor-loss code. Locator `unknown` per EPUB rule.
- arXiv:1707.06347 v2 (fetched to `workspace/ppo-clips-the-step/`, not in `resources/`): §3 eq. 7,
  "removes the incentive" / pessimistic lower bound / first-order agreement, Figure 1; §5 Algorithm 1.
  Suggest adding it to the catalog `sources[]`.
- arXiv:2203.02155 §3.5 (resources/books/2203.02155v1.pdf, physical pp. 8–9): RL paragraph and eq. 2.
  Used for one short paragraph only.

## Provenance of every number

- Table (0.30→0.60, 0.50→0.35, A = ±1, ε = 0.2; r = 2 / 0.7; clipped 1.2 / 0.8; terms and mins):
  book's own, derived on the page, identical to run.log lines 1–4 (ppo-16..19). Pitch arithmetic
  verified correct.
- Gradients +2.000 / −0.700 / 0: derived on the page (d r / d log π = r) and printed (ppo-20).
- Part 2 values (pi_old 0.122/0.547/0.331; 8.085; 1.299/0.783/1.248; 3.824/0.219/1.249; live
  5→3→0; ceiling 1/0.122 ≈ 8.2): run.log (ppo-21, ppo-22).
- ε = 0.2 as introduced value (ppo-10); 2,049 / 10 / 64 and advantage normalisation (ppo-12).
- The lecture's ε = 0.3 and 30% → 60% example is not used.

## Deviations from the pitch

- Exercise is PyTorch, not numpy (brief rule), and in two parts as the slug note asked: the four
  table cells with `.backward()`, then a three-action softmax policy (one batch of 8 samples, 50 SGD
  epochs) run uncapped, clipped at lr 0.5 and clipped at lr 5.0. The pitch's "(ii) stalls near 1.2"
  is what happens to the live-sample count; the ratio itself ends at 1.299 (coupling through the
  softmax) and at 3.824 (one oversized step), which is the limit the slug note asked to state:
  the clip removes the incentive on reused samples, it does not bound how far the policy moves.
- Pitch's "ratios in the tens" for the uncapped run: the ceiling here is 1/π_old ≈ 8.2; the essay
  says 8.085 near a ceiling of 8.2.
- Trust region gets two sentences of motivation (catalog mechanism line); RLHF one paragraph from
  §3.5 only.
- Advantage defined in one sentence (one-step TD form); GAE not mentioned (that is pitch C).

## Suggested catalog fields

- title: keep "PPO: Reuse the Samples, But Not Too Much".
- payoff: "Why training a reinforcement-learning policy on the same batch for several epochs can wreck
  it, and how PPO's clipped ratio switches off each sample's gradient once the policy has moved
  far enough on its account."
- caution: "The clip removes the incentive to move further; it does not cap how far the policy
  actually moves: step size and shared weights carry it past the edge, as the exercise shows."
- sources[]: add P("arXiv:1707.06347", "3", "5"); C list could drop 11-04 and 11-05 and add 12-05,
  12-06 (used for implementation details).

## Owed

- Nothing to other essays. `learn-the-action-or-learn-its-worth` (essay 11) presumably introduces
  the advantage and value network; this essay re-defines the advantage in one sentence so it stands
  alone.
