**Drafted by:** Claude Opus 5 (main session), 2026-09-14, from scratch, at the author's request before the review of chapters 1–3

# Chapter 4 — Train From Reward

- Plan: CHAPTER-PLAN rev 2 chapter 4. Corridor (return, γ, Q) → Monte Carlo vs Q-learning (bias, target
  network, replay) → policy gradient as cross-entropy weighted by the advantage → PPO ratio and clip (four-row
  table; what the clip does not do) → the writer as a policy (mapping table; bandit episode) → preference
  pairs, noisy labels, reward model loss −ln σ(r_w − r_l) = ch 1's two-way softmax cross-entropy → measured /
  learned / assumed table → PPO on the writer: reward hacking without KL; KL penalty (InstructGPT eq. 2 without
  the pretraining term); β both ends → clip and KL are different guards (no clip + 10 epochs; ten seeds) → what a
  real project adds (labels, evaluating the RM, judging the writer by people, value net / PPO-ptx, Lapan's freeze
  + LR/10 = ch 3, hosted DPO / RFT graders) → exercise.
- Length: file ~51k chars; prose without code/SVG ≈ 31.6k (≈ 26.5k before the exercise). Figures: corridor;
  two-stage preference pipeline (redrawn once to remove crossing lines; screenshot checked).
- Exercise `workspace/train-from-reward/exercise.py` (≈11 s, deterministic, run twice): output `corpus/train-from-reward/run.log`.
  Variations `run-variations.log`: β 0.05 (hacks, 5.30/−0.20), β 1.0 (0.86, KL 0.50), no clip at 4 epochs (fine),
  seeds 3–12 for no-KL / clip-10 / no-clip-10.
- Honest findings kept:
  - The prototype note said "without the clip, 10 epochs escape"; across ten seeds that is 5 long/low, 1 collapse
    (great value), 4 fine. Prose states the count, not the one seed.
  - The reward model is perfect (64/64) on held-out pairs whose hidden scores differ; 0.770 against labels is label noise.
  - The pairs contain 1 answer (of 1,200) with a repeated word — prose says so rather than "never".
  - The hack is designed into the word-sum reward model; prose labels it as designed.
- Corrections to research notes: Lapan's later label rounds did NOT fail to improve (v3, 300 labels, 1820) — not used.
  InstructGPT's 77.3% is held-out labelers among themselves, not vs training labelers. DPO "without a reward model"
  is not in the sources; prose only says the job takes chosen/rejected answers.
- Checks: 32 receipts passed, 2 unchecked (papers); paraphrase 0/0 (one 12-word run from 4635836 13-01 reworded
  into the formula A = r + γ·V(s′) − V(s)). Build + site check green.
- Not done: review lanes; the author's read. Prototype log removed from corpus (superseded by run.log).

## Review decisions (2026-09-14)

Codex actionable review `checks/reviews/train-from-reward/codex-actionable.md` (9 proposals), all applied:
(1) demonstrations are 48, not 39 (my count error), and the exercise trains the writer from random weights — pretraining
is omitted and now said so; (2) measured returns cannot reuse old episodes as they are, PPO reuses one batch via the
ratio, no replay memory; (3) the clip removes incentive, no hard bound (three sentences); (4) corridor output relabelled
"mean episode length" (20-step cap; 7 of 16 first episodes reach the end, replayed), exercise rerun twice, identical;
(5) labeller agreement is not a ceiling; (6) bootstrapping samples a reward and a next state; (7) "eighteen-fold" on an
arbitrary-origin score replaced by the four numbers; (8) timing kept, now logged (10.7 s) and repeatability re-verified;
(9) source narration removed ("documented pipeline", "its authors").
