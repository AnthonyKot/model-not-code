# transfer-learning-freeze-then-thaw — drafting note (2026-09-13)

**Drafted by:** Claude Opus 5, subagent (2026-09-13). Review lanes: Gemini 3.8 flash and Gemini 3.1 pro via agy; consolidation and one reader persona: codex gpt-5.6-sol (when not rate-limited).

**Pitch:** B, "frozen stops the gradient, not the statistics". Drafted by a subagent under `notes/essays/DRAFTING-BRIEF.md`.

## Sources actually used
- course-4735368 13-01 (backbone/head split, freezing, small learning rate for fine-tuning), 13-02 (trainable vs training; BN in inference mode during fine-tuning; dropout mode; thaw at unchanged vs /100 learning rate — figures not used), 12-03 (BN algorithm, gamma/beta can undo normalisation). 12-05 not used (pitch C material).
- geron-pytorch physical pp. 406–409 (BN algorithm, moving averages, eval(), buffers, momentum default and small-batch advice), 413–416 (reuse, freeze with requires_grad, large head gradients, unfreeze with lower LR), 436 (parameter groups), 492–493 (freeze all/unfreeze head; lower LR typically by 10; differential learning rates).
- raschka-qai pp. 132–133 (frozen model as feature extractor, precomputed features).
- PyTorch docstrings from the installed torch 2.14.0+cpu (BatchNorm1d momentum rule and unbiased running variance; Module.train/eval), receipted to the pytorch.org URLs; Keras BatchNormalization docs (momentum 0.99 convention; trainable=False implies inference mode), fetched 2026-09-13.
- course-6100015 07-02 for the one-sentence LoRA cross-reference.

## Word counts
- File: 2,810 words. Prose (code, table, figure, credit line excluded): 1,785.

## Provenance of every number
- 99.4% / 53.4% / 98.5% / 80.6% / 51.9% / 89.4% / 11.3 / 4.4: script run, `corpus/.../run.log` lines 6–14 (thaw-24, thaw-25).
- Worked-example table (0.2, 0.38, 0.542, 1.303, 1.757, 1.990; variances; outputs 2.391 … 1.013): book arithmetic from the PyTorch update rule, closed form 2(1 − 0.9^n) and 0.25 + 0.75·0.9^n (thaw-22); script Part 1 reproduces n = 1, 10, 50 (thaw-23; 1.0127 printed vs 1.0128 by hand, eps and the m/(m−1) variance correction).
- momentum 0.1, eps 1e-5 (thaw-09); Keras 0.99 (thaw-18); "divide by 10, some go to 100" (thaw-05, thaw-06).
- Expected-result values quoted verbatim from run.log.

## Deviations from the pitch
- Pitch B used Keras momentum 0.99 and a numpy exercise; per the slug notes and brief the essay uses PyTorch's convention (momentum 0.1 weights the new batch) and an executed PyTorch exercise. The pitch's worked numbers (0.19, 1.27, 1.73 at 10/100/200 batches) are correct under the Keras convention; the essay's table is the PyTorch equivalent at 1/2/3/10/20/50 batches, with the eval-mode output of a probe value added.
- Momentum 0 is not a full freeze: it stops the buffers but train() still normalises with batch statistics. The slug note said "eval() (or momentum 0)"; the essay and exercise show momentum 0 as a distinct third option with a train/eval mismatch (head reaches 0.519).
- The run showed that letting the statistics adapt (option A) gave the best new-task accuracy (0.985 vs 0.806 frozen), at the cost of the old task (0.994 -> 0.534). The essay does not claim frozen statistics are always better; the limits section presents re-estimation as a legitimate choice that must be deliberate and measured. The pitch's claim that accuracy falls at thaw even with a small rate is not made.
- Thaw uses 1/10 of the head's rate (Géron's typical factor) rather than 1/100; a 1/100 thaw for 50–300 steps barely moved the toy backbone (explored, not in the essay).
- Géron p. 409's momentum equation loses its hat marks in the PDF text layer, so which term carries momentum cannot be read from the dump; the essay follows the PyTorch docstring, which the script confirms (0.2000 after one batch). Not staged in prose.
- The toy target task shares its label rule with the source task (x0 + x1 against its mean); an earlier variant with an unrelated label gave frozen-head accuracy near chance, which would have measured task mismatch rather than the mechanism.

## Suggested catalog fields
- title: keep "Borrow the Eyes, Retrain the Judgement".
- payoff: "Why a backbone you froze with requires_grad=False can still change during training, and how to freeze, train a new head and thaw without that happening by accident."
- caution: "The exercise's domain shift is deliberately extreme; on real data, whether frozen or re-estimated BatchNorm statistics serve the new task better has to be measured."
- mechanism line (optional update): "requires_grad=False stops gradients but not BatchNorm's running statistics; eval() on those layers freezes them, and parameter groups give the thawed backbone a smaller learning rate."
- sources[]: C("4735368", "13-01", "13-02", "12-03") (drop 12-05); B("geron-pytorch", "pp. 406–409, 413–416, 436, 492–493"); B("raschka-qai", "pp. 132–133"); P("https://pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html", "momentum note").

## Owed
- One sentence points to the LoRA essay (Part II, 10) as keeping the freeze and replacing the thaw with a diff.
- The "strongest freeze" paragraph (precomputed features) overlaps nothing drafted so far; an input-pipeline essay could cross-reference it.

**Review applied by codex — 2026-09-13.** Finding 1: explicitly attributed the old-task accuracy change from 99.4% to 53.4% to option A, removing the ambiguous reference to the thaw. Finding 2: recorded the requested catalog `sources[]` additions: https://pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html (docstring and momentum note), https://pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html (module buffers), https://pytorch.org/docs/stable/generated/torch.nn.Module.html (train / eval docstrings), and https://keras.io/api/layers/normalization_layers/batch_normalization/ (momentum argument and trainable note). Finding 3: recorded the requested addition to catalog `caution`: “PyTorch and Keras defaults and behaviours as of 2026-09-13 (PyTorch 2.14)”. Finding 4: replaced “Once the head is sensible” with “After the head-only training stage, thaw the backbone…” to state the stage transition without anthropomorphism. Catalog edits were excluded by the user's instruction; no confirmed finding requests a mechanism change. Rejected findings were ignored. No exercise numbers or code changed, so the existing run log, expected output and receipts remain applicable and no exercise rerun was needed. Post-edit essay word count: 2,811 (whitespace-delimited, whole file).

**Review (2026-09-13):** codex consolidation (Gemini flash + pro lanes) and reader personas. Applied by the main session (Opus 5) after codex hit its usage limit — four findings: the 99.4% → 53.4% collapse now named as option A (applied by codex before its usage limit); documentation URLs added to catalog sources and a dated PyTorch/Keras caution (main session); "Once the head is sensible" was no longer in the text at application time.
