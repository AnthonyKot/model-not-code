# Pitch picks — Parts I and II (agents' recommendations, 2026-09-12)

Read each `notes/pitches/<slug>.md` (three four-sentence pitches, A/B/C, with the lectures each draws on). Reply with one letter per slug, or `rewrite` / `drop`. Nothing is drafted until you pick.

| # | slug | rec. | why |
|---|---|---|---|
| 1 | `model-is-a-learned-function` | **A** | one gradient-descent loop on three points at two learning rates; the exercise shows convergence and divergence |
| 2 | `tokens-not-characters` | **A** | four-word corpus, three merges by hand, then a 30-line trainer on your own prose; B if you want the cost/context angle |
| 3 | `attention-is-a-soft-lookup` | **B** | the causal mask with the row-invariance test when a fourth token is appended; A is the gentler entry |
| 4 | `embeddings-are-coordinates` | **B** | one contrastive step by hand, then why an embedding model fails on a domain; A if pure mechanics |
| 5 | `validation-set-is-a-budget` | **A** | the winner's curse of best-of-N validation scores; B for the early-stopping procedure |
| 6 | `class-imbalance-changes-the-loss` | **A** | the loss is a sum the majority owns; best constant predictor moves 0.05 → 0.5 under weights |
| 7 | `augmentation-declares-invariance` | **A** | a transform is a claim; validation got worse; the paper audit exercise; C carries mixup/cutmix |
| 8 | `input-pipeline-is-the-bottleneck` | **A** | step time = max(producer, consumer) once overlapped; forecast from two measured numbers |
| 9 | `transfer-learning-freeze-then-thaw` | **B** | frozen stops the gradient, not the statistics: the batch-norm distinction; A is the conventional choice |
| 10 | `lora-is-a-low-rank-diff` | **A** | the adapter is a diff of rank r; recompute the parameter count and check against the lecturer's 18M/73MB (PILOT) |
| 11 | `learn-the-action-or-learn-its-worth` | **B** | measured return versus bootstrapped guess: four-episode Q-table walk vs one-episode Monte Carlo |
| 12 | `ppo-clips-the-step` | **A** | ratio as a leash, clipped where it goes taut; four-row table; B foregrounds the trust region |

Your picks (author, 2026-09-13 — the recommendations accepted as picked; any may be changed before its essay is drafted):

- model-is-a-learned-function: A
- tokens-not-characters: A
- attention-is-a-soft-lookup: B
- embeddings-are-coordinates: B
- validation-set-is-a-budget: A
- class-imbalance-changes-the-loss: A
- augmentation-declares-invariance: A
- input-pipeline-is-the-bottleneck: A
- transfer-learning-freeze-then-thaw: B
- lora-is-a-low-rank-diff: A
- learn-the-action-or-learn-its-worth: B
- ppo-clips-the-step: A
