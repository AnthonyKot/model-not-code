# Pitch picks — Part III (agents' recommendations, 2026-09-13)

Read each `notes/pitches/<slug>.md` (three pitches A/B/C with the sources each draws on; every number in
them was computed by running a script). Reply with one letter per essay, or `rewrite` / `drop`.
Nothing is drafted until you pick. Pitches written by Claude Opus 5 subagents.

| # | slug | rec. | A | B | C |
|---|---|---|---|---|---|
| 13 | `not-available-at-prediction-time` | **A** | a feature is computed "as of" a moment; churn AUC 0.996 offline, finds 2% of churners live | split by what you predict for: random split 0.975, split by patient 0.508 | a statistic of the label is the label: target encoding on all rows 0.919, out-of-fold 0.757 |
| 14 | `the-model-outputs-a-score` | **A** | a cost ratio is a threshold; ten items, three cost ratios, chosen threshold matches the formula | AUC ranks, it does not choose: equal AUC, different operating points | precision depends on live base rate: 0.853 balanced, 0.054 at 1% positives |
| 15 | `benchmark-is-a-claim-about-a-test-set` | **A** | a leaderboard gap is a claim about the same questions; only disagreements count; best model tops 22% of fresh sets | contamination is a score for remembering: rewritten questions drop 0.705 → 0.643 | no answer key: blind pairwise wins, Elo / Bradley–Terry |
| 16 | `measure-retrieval-before-blaming-the-model` (PILOT) | **A** | a metric is only as good as the relevance judgement: keyword check MRR 1.0, human judgement 0.7 | split wrong answers into retrieval vs generation failures first | when an answer needs two chunks: recall@k and nDCG |
| 17 | `labels-arrive-later` | **A** | three clocks, and the window that turns silence into a label | sliding vs cumulative accuracy under label delay | watch the score distribution before labels exist (KS test) and what it misses |
| 18 | `autoencoder-learns-normal` | **B** | the bottleneck is a line; distance to it is the score (2→1→2 = PCA) | a 95th-percentile threshold flags 5% of anything: refit on a dirty batch, recall 0.25 vs 0.99 frozen | first beat the do-nothing reconstruction (error 1.0) |
| 19 | `the-model-picks-its-own-training-data` | **C** | the top slot is the one people see: the random first leader stays on top 20/20 | an item never shown has no score: 10% exploration finds the better item 98/100 | position and quality are one column until position moves: fitted item gap +1.242 vs +0.012 with 10% random order |

Source notes the drafting step must honour (from the pitch writers):
- 13: no lecture supports it beyond the normaliser case; drafting rests on Huyen, *Data Science: The Hard Parts*, *ML System Design*.
- 15: Huyen and *LLM Deep Dive* p. 171 do not support contamination; pp. 237, 239 support the Elo section.
- 16: the course's "recall@k" is hit rate and its "MRR" averages over keywords; *LLM Deep Dive* p. 324 misstates MRR = 0; nDCG needs an `inferred` receipt.
- 17: the local Huyen copy is an early release; check which monitoring pages exist before citing.
- 18: the lecture's reported errors equal the do-nothing baseline; FFT-in/raw-out is not an autoencoder; add Géron pp. 728–729.
- 19: widen Huyen to pp. 323–326 (p. 326 has the prediction-time position setting).

Your picks (fill in):

- not-available-at-prediction-time:
- the-model-outputs-a-score:
- benchmark-is-a-claim-about-a-test-set:
- measure-retrieval-before-blaming-the-model:
- labels-arrive-later:
- autoencoder-learns-normal:
- the-model-picks-its-own-training-data:
