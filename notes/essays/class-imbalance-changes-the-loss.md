# class-imbalance-changes-the-loss — essay note

**Drafted by:** Claude Opus 5, subagent (2026-09-13). Review lanes: Gemini 3.8 flash and Gemini 3.1 pro via agy; consolidation and one reader persona: codex gpt-5.6-sol (when not rate-limited).

**Pitch:** A (the loss is a sum and the majority class owns the sum), picked 2026-09-13.
**Drafted:** 2026-09-13 by a subagent, receipts first. Status to set: `drafted`.

**Sources actually used**
- course-4735368 15-02 (class weighting as a heavier penalty on the rare class; weight = 1/count
  scaled by the total; random over- and undersampling; gather more data first). The lecture's
  counts (1,525 / 3,019 / 2,255) and printed weights (4.45 / 2.25 / 3.01) are receipted (imbal-05)
  but not used in the prose. Recomputed: 6799/1525 = 4.458, so the printed 4.45 is truncated, not
  rounded; not staged in the essay.
- course-4735368 06-02 (accuracy treats both error types alike; recall formula; threshold trade),
  06-03 (confusion-matrix cells at a 0.5 threshold). Used only for the cells and per-class recall.
- huyen-dmls physical pp. 120, 122, 126, 130, 131, 133 (early release, third release 2022-02-03;
  dumps in workspace/class-imbalance-changes-the-loss/pages/huyen-118-138.txt).
- PyTorch docstrings for BCEWithLogitsLoss and CrossEntropyLoss, read from the installed
  torch 2.14.0+cpu on 2026-09-13 (receipts cite the docs.pytorch.org URLs; "unchecked" in the gate).

**Word count:** 2,451 in the file; about 1,763 prose (code block, figure, table, mission marker and
source line excluded; formulas, headings, walk-through and expected result included).

**Numbers and provenance**
- 100/95 ≈ 1.053, 100/5 = 20, weighted totals 100 and 100; p* = 0.05 and 0.5 from the derivative;
  gradient balances 4.75 / 4.75 and 47.5 / 47.5; pos_weight 19 = 0.95 × (100/95, 20) — own
  arithmetic (imbal-13, 14, 16, 17). **The pitch's numbers were correct** (except that its
  "95 × 1.05 = 100" is approximate; the essay uses the exact 100/95).
- Loss table (0.0513, 2.9957, 19.85 / 304.70, etc.) — python math (imbal-15). Figure polylines
  computed from the same functions divided by 100.
- Per-row 0.6931 / 13.1698, means 6.9315 vs 0.6931, constant biases −2.9443 / 0.0000, logistic
  weights, biases, confusion matrices, recalls, accuracies, mean probabilities 0.044 / 0.238 —
  `corpus/class-imbalance-changes-the-loss/run.log` (imbal-18, 19).
- Bias shift 3.04 vs ln 19 = 2.94 (imbal-20); cut-off 0.046 result [[1606, 294], [23, 77]],
  pos_weight 5 and 50 results, AUC ≈ 0.888 for all weights and rank correlation 0.9997 — side
  check `workspace/class-imbalance-changes-the-loss/check_weights_and_cutoff.py` + `.log`
  (imbal-23). Not in corpus run.log because the essay's exercise does not print them; if a
  reviewer wants them in the corpus, append that log.

**Deviations from the pitch**
- Exercise is PyTorch (per brief and slug notes), not a spreadsheet: per-row pos_weight effect,
  bias-only fit reproducing 0.05 / 0.5, logistic model with and without pos_weight, confusion
  matrix and per-class recall at 0.5. The pitch's loss table of constant predictors moved into the
  worked example.
- The lecture's three-class counts are not used as a reader exercise (they would stage the
  source's number); the reader instead varies pos_weight to 5 and 50.
- Added the CrossEntropyLoss(weight=) reduction difference (mean divides by the weight sum) — from
  the docstring, confirmed in run.log.
- Added the bias-shift ≈ ln 19 observation; it is what makes the one-sentence handoff to the
  threshold essay concrete. The threshold itself is named in one sentence only.
- Focal loss and SMOTE not mentioned.

**Boundary owed:** `the-model-outputs-a-score` (Part III) owns choosing a cut-off on scores; this
essay's handoff sentence says an unweighted model at cut-off 0.046 finds the same count of
positives (77) with 294 false alarms vs 277. That essay may want to reuse or avoid this example.
It also owes the calibration point only touched here ("outputs stop being frequencies").

**Suggested catalog fields**
- title: keep "95% Accuracy on a 95/5 Dataset Is the Baseline, Not a Result".
- payoff: "When one class is 95% of your rows the training loss is mostly written by that class;
  a class weight changes what the model is trained to predict, and the confusion matrix shows what
  that costs."
- caution: "PyTorch loss arguments as of 2.14; the synthetic data is invented; weighting changes
  the scores' meaning as probabilities; choosing a cut-off is a separate essay."
- sources[]: C("4735368", "15-02", "06-02", "06-03"), B("huyen-dmls", "pp. 120–133"), plus the two
  PyTorch docs URLs if the catalog carries documentation sources.

**Review (2026-09-13, applied by the main session, Opus 5):** codex consolidation confirmed one finding (both lanes agreed): "The loss did not fail; it found the minimum" assigned the search to the loss — now "The optimiser did not fail". Nothing rejected. Reader persona reports kept in checks/readers/class-imbalance-changes-the-loss/; their points were read and none changed facts beyond the above.
