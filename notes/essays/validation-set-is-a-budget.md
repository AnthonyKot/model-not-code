# validation-set-is-a-budget — essay note

**Drafted by:** Claude Opus 5, subagent; review fixes applied by the main session (Opus 5) (2026-09-13). Review lanes: Gemini 3.8 flash and Gemini 3.1 pro via agy; consolidation and one reader persona: codex gpt-5.6-sol (when not rate-limited).

**Pitch:** A (selection is a kind of training; winner's curse of best-of-N validation scores), picked by the
author 2026-09-13. **Drafted:** 2026-09-13 by a subagent, receipts before prose.

**Sources actually used:** course-4735368 03-09 (why seen-data evaluation overstates; three splits;
normaliser fitted on train only) and 07-04 (ModelCheckpoint save-best-only on validation loss);
course-6100015 07-19 (periodic checkpoints so the best step can be picked; training loss is no guide to eval
loss) and 07-20 (picking the best checkpoint on validation is a kind of training, may be lucky noise, so a
separate test split); huyen-dmls physical pp. 116 (choosing among many on one set picks the one that overfits
it; validation rows cost training rows), 164–165 (split before scaling/imputing), 166 (any use of the test
split beyond the final report leaks), 223 (never tune on test). Page dumps in
`workspace/validation-set-is-a-budget/pages/`; lecture notes in `workspace/validation-set-is-a-budget/lectures.md`.
Not used: course-4735368 03-10 (underfitting; nothing for this pitch). No lecture figure appears in the prose.

**Word count:** 2,460 in the file; 1,795 prose (code block, tables, figure, mission marker and source line
excluded; headings, formula line and walk-through bullets counted).

**Numbers and their provenance (all `observed`, the book's own):**
- SE = sqrt(p(1-p)/n): 0.0283 (p 0.8, n 200), 0.0089 (n 2,000), 0.0566 (n 50); √10 ≈ 3.16 — valid-12, hand
  arithmetic, `workspace/validation-set-is-a-budget/worked.py`.
- Two checkpoints × two items: 1/16, 8/16, 7/16; expected reported 11/16 = 0.6875 vs 0.5 — valid-13.
- Six checkpoints × twenty items at p 0.5: P(≥13) = 137,980 / 1,048,576 = 0.1316; best of six 1 − 0.8684⁶ =
  0.5711; expected best 12.81/20 = 0.6405 — valid-14. **The pitch's 13% and 57% are correct.**
- Simulation table (p 0.80, 20,000 trials, seed 0): reported / inflation / inflation-over-SE for N 1, 5, 20, 100
  at n_val 200 and 2,000 — valid-15; correlated checkpoints +0.0166/+0.0120/+0.0072/+0.0032 — valid-16; spread
  0.78..0.80 case 0.8103 / 0.7959 / 0.796 / 0.186 — valid-17; ratio 0.0517/0.0165 = 3.13 from the same run.
  `workspace/validation-set-is-a-budget/exercise.py`, output `corpus/validation-set-is-a-budget/run.log`
  (PyTorch 2.14 CPU, ~6 s).
- Follow-up variants in the exercise's last paragraph (n_test 50: mean 0.8003, spread 0.0562; choosing on
  val+test: 0.8367 at n 200, 0.8118 at n 2,000, third draw 0.8001) — valid-18, `variants.py`, appended to
  run.log under a header.
- Observed receipts are anchored to course-6100015 07-20 (the lucky-noise point they illustrate) because
  `checks/receipts.mjs` requires a resolvable source.

**Deviations from the pitch:**
- The pitch's exercise (eight fair coins, 200 flips, plain Python) became a PyTorch simulation per the drafting
  brief and slug notes: p = 0.80 rather than 0.5 (closer to a real model), N ∈ {1, 5, 20, 100}, n ∈ {200, 2000}.
- Worked example starts smaller than the pitch (two checkpoints, two items, fully enumerated) before the pitch's
  six-by-twenty case.
- Added two measured limits the pitch did not have: correlated checkpoints (a toy "churn" model, labelled in the
  code comments) and candidates with genuinely different accuracies.
- The normaliser-on-train rule is one paragraph only; leakage beyond that is left to Pitch C's territory. No
  contamination or public-benchmark material (owed to `benchmark-is-a-claim-about-a-test-set`).
- 03-09's 90/10/10 ratio slip is not used.

**Hypotheses / simplifications declared in prose:** candidates independent and equal in the main table
("the case in which the selection has nothing but noise to find"); the churn correlation model is invented.
The claim that a hyperparameter search over per-run best checkpoints compounds the selection is stated
qualitatively, not measured.

**Suggested catalog fields:**
- title: keep "You Only Get to Look at the Test Set Once".
- payoff: "The best validation score out of many tries is inflated by the trying; here is how much, and why the
  test set is scored once."
- caution: "Simulated scores, not trained models; real checkpoints are correlated and differ in quality, which
  shrinks but does not remove the inflation."
- sources[]: C("4735368", "03-09", "07-04"), C("6100015", "07-19", "07-20"), B("huyen-dmls") — drop 03-10.

**Owed to other essays:** `benchmark-is-a-claim-about-a-test-set` (Part III) for public benchmarks and
contamination; leakage through fitted preprocessing is only touched.

**Review (2026-09-13):** codex consolidation (flash 2 confirmed, pro lane empty) and three reader
personas. Accepted and applied: the 12.81 expected best was unexplained (report + hiring-manager) —
removed in favour of the fully derived 57% and the fresh-items 10/20; the two exercise variations
were not reproducible from the stated edits (report + hiring-manager) — now two explicit seeded
snippets, run as printed (0.8364 replaces 0.8367 because the snippet reseeds); the 1.2/1.8/2.4
standard-error pattern was an unexplained empirical claim (hiring-manager) — tied to the mean
maximum of N standard normals (receipt valid-19); loss versus accuracy (working-mle) — a sentence
that the mechanism holds for any averaged metric. Rejected: "PyTorch 2.14 does not exist" (two
readers) — it is the installed version, 2.14.0+cpu; "stop calling sampling error noise" (stats
sceptic) — the essay defines the term on first use; independent equal candidates as "artificial" —
the limits section and the correlated-checkpoint run already measure the realistic case.
Receipt valid-14 (12.81) withdrawn.

**Author's pick (2026-09-13 evening):** the codex tight rewrite is now the essay; the previous version is in git history only.
