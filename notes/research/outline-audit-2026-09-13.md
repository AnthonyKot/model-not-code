# Outline audit — Parts III–VI (2026-09-13)

Editorial audit of the eighteen catalogued essays in Parts III–VI of *The Program Is Now a Model*,
run before the pitch gate for those parts, as the author asked. It follows the four requirements
named in `notes/research/source-map-2026-09-13.md` §"What I would carry forward":

1. a reader problem a senior developer actually brings;
2. one explainable mechanism;
3. checked supporting passages (the cited lectures and pages were opened, not inferred from titles);
4. an original worked example the reader can recompute, plus a no-GPU exercise.

**Status of everything below: recommendation only. Nothing here is author-approved.** Parts I and
II are outside the audit's focus; their pitches are picked and the LoRA pilot is being drafted.
Verdict words: *keep* (as catalogued, possibly with source corrections) · *merge* (fold into a named
essay) · *reframe* (same slot, different mechanism or sources) · *defer* (out of the 30 for now,
reasons recorded) · *drop*.

How the checks were done. Lectures: the `.txt` caption files under `resources/udemy-subs/`
(`.en.txt` for the translated course), read in full by me for Part III and the evaluation lectures,
and by four reader agents for Parts IV–VI, each reporting line ranges; I re-read the passages that
carry a verdict. Books: `pdftotext` page dumps of the manifest files (physical PDF pages, one-based,
as in the source map) and EPUB section text. Numbers below are what those pages and lines say; lecture
numbers are the lecturer's and would be `reported` in an essay. No transcript sentence is quoted.

## Summary table

| # | slug | current part | verdict | one line |
|---|---|---|---|---|
| 13 | the-model-outputs-a-score | III | keep | best-supported essay in Part III; add Géron pp. 146–147 and name the label-polarity trap from 06-04 |
| 14 | benchmark-is-a-claim-about-a-test-set | III | keep (reframe the mechanism) | the recomputable mechanism is selection on a fixed test set (04-04), not "contamination"; Huyen has no contamination passage — fix sources |
| 15 | measure-retrieval-before-blaming-the-model | III | keep (pilot) | MRR/nDCG/recall@k defined in 05-18; the course's checks are keyword proxies — the essay must say so; add `llm-deep-dive` pp. 324–325 |
| 16 | which-feature-moved-the-prediction | III | defer | no source in the library derives Shapley values; the SHAP lectures read plots; its useful use (attribution to detect leakage or a feedback loop) moves into two new essays |
| 17 | autoencoder-learns-normal | III | keep (fix sources, reposition) | 08-01/08-02 and Géron p. 733 support it; 14-02..14-04 are a supervised pump classifier and must be dropped; place it as the label-free detector after `labels-arrive-later` |
| 18 | predict-the-time-left | III | reframe → defer | the real lesson in 10-02..10-04 is that the label is constructed (clipping alone moved RMSE 31.95→21.90, reported); no room under the cap this round |
| 19 | kv-cache | IV | keep (pilot) | 03-07 gives the reuse mechanism without prefill/decode words or sizes; the books supply both; trim the mechanism sentence to the cache |
| 20 | position-is-a-rotation | IV | defer (cut candidate) | well sourced (03-03, 03-04) but an architecture internal with the weakest reader problem in Part IV; first to go under the cap |
| 21 | four-bits-per-weight | IV | keep (fix sources) | the four lectures are analogies plus library flags; the scale/zero-point mechanism is in `quant-ru` pp. 12–14 (slides, equations need visual check); 07-05's size figures are inconsistent |
| 22 | batching-is-where-throughput-comes-from | IV | keep (sources rebuilt) | none of the eleven cited lectures explains batching; `inference-eng` pp. 64–65, 188–190 and `llm-serving` ch. 6 do; bound the "a batch costs the same as one" claim |
| 23 | the-chunk-is-the-unit-of-retrieval | V | keep | the table-header-lost-at-a-boundary case is literally in 6199297/03-09.en; chunk-size→MRR numbers in 05-22; nDCG appears in no lecture |
| 24 | your-loop-calls-the-function | V | keep (absorbs #25) | 02-15 and 08-17 give schema→call→dispatch→append and the `while not done` stop rule; budget and permissions come from OWASP, not the course |
| 25 | untrusted-text-is-an-untrusted-code-path | V | merge → #24 | none of 02-10, 05-16, 03-06.en mentions injection; OWASP p. 9/27 and playbook p. 100 do, and p. 100 pairs design limits *with* output filtering, so the catalogue's "not filtering" is too absolute |
| 26 | when-fine-tuning-lost | V | keep (reframe the mechanism) | the ladder is fully supported with numbers; "format cheap, knowledge expensive" is only loosely in 06-24/06-26 — make the mechanism the ladder plus the test-set confidence interval |
| 27 | read-the-table-first | VI | keep | InstructGPT pp. 3 and 8 give recomputable numbers (85 ± 3 %, K choose 2 comparisons); 6538601/03-06 is thin as a second example |
| 28 | show-the-eval-not-the-demo | VI | drop | 01-03 is a course-sequencing talk, 08-19 a wrap-up, staff-eng p. 99 is about strategy documents; nothing checked supports what hiring engineers trust |
| 29 | design-the-data-loop-first | VI | merge → new `labels-arrive-later` | 06-07/06-08 give five steps and a drift mention; acing-sdi p. 316 says ML is usually out of scope in a design interview; the feedback-path content is the new essay |
| 30 | the-rule-was-cheaper | VI | keep (fix sources) | Huyen pp. 226, 236, 115 and 06-07 lines 52–73 carry it; `ds-hard-parts` "heuristic" hits are about leakage detection, not rules — drop that citation |

Proposed additions (detail in the section of that name): `not-available-at-prediction-time`,
`the-artifact-is-the-pipeline`, `labels-arrive-later`, `the-model-picks-its-own-training-data`,
`the-score-is-not-the-lift`, `the-new-model-must-beat-the-blessed-one`. Data contracts / backfill is
recorded as a watch item, not an essay. Net count stays at 30 (12 + 18).

## Per-essay assessments

Each section: reader problem · mechanism · what the cited sources actually hold (with locators) ·
worked example and exercise · verdict.

### Part III — Evaluation and monitoring

#### 13. the-model-outputs-a-score — keep

**Reader problem.** Real and common: a developer is handed a classifier that "is 94 % accurate"
and has to decide what to do with a 0.3. The lecture opens on exactly that (4735368/06-02, lines
20–37: 94 % accuracy on a malaria test set and what a false negative costs).

**Mechanism.** One: precision, recall, TPR and FPR are functions of a threshold over scores; the
ROC curve is the set of (FPR, TPR) pairs you get by sweeping it; the threshold is chosen from a
cost preference, not learned. Clean and single.

**Sources checked.**
- 4735368/06-02 lines 162–250 define precision, recall, accuracy, F1, specificity, TPR, FPR;
  lines 258–302 lower the threshold from 0.5 to 0.2 and explain why false negatives fall and why
  0.001 would be absurd; lines 303–424 read the ROC as a set of thresholds and pick a region
  according to whether recall or precision matters; lines 425–458 AUC as a model comparison.
  Lecturer-reported test figures at lines 495–498 (1,323 true positives on a 2,750-item test set)
  — `reported` only.
- 4735368/06-03 lines 104–155: confusion matrix from predictions at thresholds 0.5, 0.25 and 0.75,
  showing FN fall and FP rise as the threshold drops; lines 165–182: manual threshold search called
  inefficient, motivating the ROC.
- 4735368/06-04 lines 11–19 (330 thresholds returned with the FPR/TPR arrays), 46–79 (annotating
  thresholds on the curve), 117–159: the dataset encodes parasitised as 0, so the lecturer's
  "false positive" is the clinically dangerous case — a real label-polarity trap; a threshold of
  0.6265 gives 87 false positives against 99 at 0.5 (reported).
- `huyen-dmls` p. 129: classification as regression plus a threshold; ROC as the curve of TPR vs
  FPR over thresholds; AUC; the note that ROC ignores the negative class and the pointer to
  precision–recall curves. Short but exact.
- `stats-programmers` pp. 165–166: AUC vs accuracy on an imbalanced example (90 pass / 10 fail),
  ROC definition and plotting code; AUC 0.8678 on a balanced raisin dataset (reported).
- Not in the catalogue but stronger than either book: `geron-pytorch` pp. 146–147 — instances
  ranked by score, a threshold placed between them, precision 4/5 and recall 4/6 at one position,
  100 % and 3/6 after raising it; `decision_function` scores and `precision_recall_curve`. This
  is the worked example's model.

**Worked example / exercise.** Ten invented scored items with labels; compute (FPR, TPR) at three
thresholds and draw the three ROC points; show a cost ratio turning into a threshold. Exercise:
a 20-row table of scores and labels, the reader computes the ROC points and picks the threshold
for a stated FN:FP cost of 5:1; expected result is a single threshold and its confusion matrix.
Paper and pencil.

**Verdict: keep.** Add `geron-pytorch` pp. 146–147 to `sources[]`; give the two book citations
page ranges (129; 165–166). Name the polarity trap inside the principle (06-04 lines 117–148). One
boundary to state in the pitch: `class-imbalance-changes-the-loss` (Part II) owns the confusion
matrix and class weights; this essay owns the threshold.

#### 14. benchmark-is-a-claim-about-a-test-set — keep, reframe the mechanism

**Reader problem.** Yes: which model to pick from a leaderboard, and why the number moved when
the questions were paraphrased.

**Mechanism as catalogued.** "Public benchmarks leak into training data" is a fact about the world,
not a mechanism a reader can recompute. The recomputable mechanism in the sources is *selection on
a fixed test set*: 6100015/04-04 lines 61–81 describe picking the best of several candidate models
on one benchmark and note that repeated selection is implicit training on the metric and that the
lucky candidate loses its edge when the questions are altered. That is the order-statistics
argument (the maximum of N noisy scores is biased upward) and it is the same mechanism that makes
a private, once-used evaluation set the defence.

**Sources checked.**
- 6100015/04-03: tour of benchmarks (448 questions in the "Google-proof" set, line 22; reported);
  lines 3–7 already say benchmarks are early guidance, not validation.
- 6100015/04-04 lines 9–29: training-data contamination, the paraphrase study that dropped
  scores, secrecy and rotation as defences; 30–36 inconsistent application and self-reporting;
  37–56 narrow scope and multiple choice; 57–60 saturation; 61–81 selection overfitting;
  82–118 the speculative "evaluation awareness" point, which the lecturer flags as unproven — leave
  it out or label `hypothesis`.
- 6100015/04-05: a Connect-Four leaderboard the lecturer built — a fun private benchmark, no
  mechanism; keep at most as one sentence.
- 6100015/04-09 lines 14–15: blind human pairwise evaluation aggregated as an Elo-style rating;
  line 67 a reported near-tie. Supports "pairwise comparison".
- 6100015/04-18 lines 31–134: model-centric vs business-centric metrics and the delay before the
  business metric can be measured — this belongs to `labels-arrive-later`, not here.
- `huyen-dmls`: a full-text search for "contaminat" returns no page. The catalogue's Huyen citation
  has no passage behind it. The closest Huyen material is the test-set discipline in the splitting
  section (pp. 163–165), which is the leakage essay's.
- `llm-deep-dive` p. 171: "data contamination" there means fine-tuning a model on its own outputs
  — a different sense; p. 449 is about synthetic data. Neither supports benchmark contamination.
- Better book support, checked: `geron-pytorch` p. 130 (the temptation to tune hyperparameters
  until the test-set number looks good, and why it will not generalise) and `ml-system-design`
  chapter 7 §7.3.1 "Nested validation" (access to the test score while fitting anything is a
  direct route to overfitting; inner/outer folds).

**Worked example / exercise.** Five candidate models with identical true quality and a 200-item
test set: compute the expected spread of their scores and show that "the best of five" is above the
true value by a computable margin; then paraphrase the test set and watch the margin vanish. All
arithmetic on the page. Exercise: given ten reported scores and the test-set size, compute the
standard error and say which differences are real. No GPU.

**Verdict: keep, with the mechanism sentence rewritten** around selection and the once-used private
set; contamination becomes the first of two ways a public number stops being evidence. Sources:
keep 04-04 and 04-09, demote 04-03/04-05 to context, drop 04-18 (moves), replace `huyen-dmls` and
`llm-deep-dive` with `geron-pytorch` p. 130 and `ml-system-design` ch. 7. Boundary with
`validation-set-is-a-budget` (Part II): that essay is about spending your own test set during
training; this one is about someone else's number. Say so in both pitches.

#### 15. measure-retrieval-before-blaming-the-model — keep (pilot)

**Reader problem.** Yes: the RAG answer is wrong and the developer does not know whether retrieval
or generation failed. The lecture frames it that way (6100015/05-17 lines 22–24).

**Mechanism.** One: rank-based retrieval metrics computed against a golden set, separately from
answer judgement. MRR and recall@k are explained; nDCG is named but only described qualitatively.

**Sources checked.**
- 6100015/05-18 lines 7–44: build a golden set of questions with expected keywords in the relevant
  chunk; the set is living and the system will be tuned to it (line 44 is the overfitting warning).
  Lines 149–161: MRR defined by first relevant position; 164–177: nDCG described only as "relevant
  chunks near the top"; 179–191: recall@k; 193–198: keyword coverage as a recall variant. Lines
  86–118: LLM-as-judge with accuracy / completeness / relevance.
- 6100015/05-19 lines 78–98: test rows carry question, keywords, reference answer, category; line
  107: most questions were model-generated; 145–161: the harness averages reciprocal ranks over
  keywords and computes coverage and nDCG.
- 6100015/05-20 lines 63–76: one worked row — two of three keywords found, coverage two-thirds;
  91–124: judge fields; 171: the judge is a small model with structured outputs.
- 6100015/05-21 lines 53–58: MRR 0.7298, nDCG 0.7387, coverage just over 80 %, 150 tests
  (reported). 05-31 lines 137–163: MRR 0.7903 then 0.9116, coverage 96 % (reported).
- 6199297/05-09.en lines 3–25: retrieval vs generation metrics, ground truth needed for
  correctness, keyword/n-gram overlap called weak, LLM-as-judge with a chosen score range.
  Machine translation — `caution` field required.
- `llm-deep-dive` pp. 324–325 (not in the catalogue): precision@K, MRR defined, hit rate as the
  companion that disambiguates a low MRR. This is the best written definition in the library.
- `huyen-dmls` is cited but I found no retrieval-metric passage; recommend replacing it.

**Worked example / exercise.** Five questions, each with a ranked list of six chunk ids and a
relevance judgement made by the reader (not by keyword); compute reciprocal ranks, MRR, recall@3
and one nDCG by hand, and include one row where the keyword is present in an irrelevant chunk so
keyword coverage says "hit" and the judgement says "miss". Exercise: the reader scores a supplied
second batch and then judges one answer against its retrieved evidence. Paper only.

**Verdict: keep.** The pilot is sound, provided the essay states that the course's checks are
keyword proxies over largely model-generated questions (source map item 3) and defines nDCG
itself from `llm-deep-dive` or first principles. Add `llm-deep-dive` pp. 324–325; drop or repoint
`huyen-dmls`. The 0.73→0.91 numbers stay in the lecturer's mouth.

#### 16. which-feature-moved-the-prediction — defer

**Reader problem.** Yes ("why did it predict that?").

**Mechanism.** Shapley attribution with the additivity property. Explainable — but not from these
sources.

**Sources checked.** 5004958/17-01 (285 words) announces a random-forest regressor on a power-plant
dataset and "interpretability". 17-02 trains the model (train R² 0.99, test 0.96, lines 137–138,
reported) and calls a tree explainer, then reads summary, force, bar and dependence plots (lines
66–188). 17-03 lines 9–41 read a force plot: base value about 454, prediction 431.84, three named
contributions of −0.91, +1.66 and +1.49 — which do not sum to the −22 gap, because the plot shows
only some features; no coalition, marginal contribution or additivity statement appears in any of
the three. 4735368/14-02 is "visualising intermediate layers" of a CNN — not attribution. No book
in the manifest treats Shapley values (the statistics book has no hit; Géron's hits are for the
word "shape").

**Verdict: defer.** The mechanism could be derived from first principles in three features, but
CONTEXT §5 wants a checked source and there is none. Two of its uses survive elsewhere: Huyen
p. 165 (ablation and feature–label correlation to detect leakage) goes into
`not-available-at-prediction-time`; Huyen p. 324 (feature importance to detect a self-reinforcing
feature X) goes into `the-model-picks-its-own-training-data`. Revisit if a source with the
enumeration is added to the library.

#### 17. autoencoder-learns-normal — keep, fix sources, reposition

**Reader problem.** Moderate: "we have no labelled failures; can we still flag the odd ones?" It
becomes a real problem once the monitoring essays exist — reconstruction error is a label-free
signal.

**Mechanism.** One: a bottleneck forces the network to reconstruct what is common; the anomaly
score is the reconstruction error; a threshold turns it into a flag.

**Sources checked.**
- 5004958/08-01 lines 6–29: vibration data, FFT, encoder/decoder, k-fold, noise augmentation,
  an MSE threshold. 08-02 lines 113–138: encoder and decoder layers (decoder widths 32/64/128 are
  named; the bottleneck width is not stated in the captions); 169–193 training setup; 200–225:
  reconstruction MSE, threshold at the 95th percentile, top 5 % flagged; 232–234 train MSE about
  1.0018 and validation about 0.9967 (reported).
- 5004958/14-02, 14-03, 14-04: a different project — pump sensors, 52 sensors, 220,320 rows,
  labels normal / recovering / broken, supervised logistic regression, SVM, random forest and
  XGBoost with macro-F1 0.96–0.99 (reported). No autoencoder appears. These citations are wrong
  and must be removed.
- `geron-pytorch` p. 727 (why a constrained autoencoder must find patterns), p. 733 (out-of-
  distribution inputs reconstruct badly; MSE between input and output; set a threshold and call
  what exceeds it an anomaly). Exact support.

**Worked example / exercise.** A two-dimensional dataset lying near a line, a one-dimensional
bottleneck (the projection), reconstruction error as the distance to the line, and a point off
the line with a large error — computable by hand. Name the failure mode inside the principle: a
95th-percentile threshold flags 5 % of any dataset, anomalies or not (08-02 lines 221–225), so the
rate is chosen, not discovered. Exercise: twelve points, the reader computes the errors and sets a
threshold two ways. No GPU.

**Verdict: keep**, with 14-02..14-04 removed, `geron-pytorch` pp. 727, 733 given as pages, and the
essay placed after `labels-arrive-later` as the label-free detector. If the cap binds harder than
proposed below, this is the second cut candidate after `position-is-a-rotation`.

#### 18. predict-the-time-left — reframe, then defer

**Reader problem.** Weak as catalogued (few readers own turbines). Strong once reframed: "where
does the label come from, and how much of my score is the label's design?"

**Mechanism as catalogued.** Three things: regression on run-to-failure cycles, a clipped label,
sliding windows. The lectures support the first two and only one lecture the third.

**Sources checked.**
- 5004958/03-08 and 03-09: conceptual overviews, no data, no code.
- 10-01: the NASA turbofan dataset, four sub-datasets, 21 sensors (lines 1–30). 10-02 lines
  86–105: label = last cycle of the engine minus current cycle, grouped per engine; 25–40: 20,631
  rows, 100 engines. 10-03 lines 37–39 and 10-04 lines 3–4: the label is clipped at 125. 10-04
  lines 78 and 161–175 (reported): baseline RMSE 31.95, clipped-label linear model 21.90, scaled
  SVR 21.58, polynomial 20.59, feature-selected 20.54. 10-05: lag features and stationarity tests,
  RMSE 21.14 then 20.85 (reported). 10-12: a different sub-dataset, sequence length 20 (line 345),
  clip at 125 again, and the lesson stops before the LSTM is trained (lines 403–405).
- `ts-foundation` pp. 47–48, 51: N-BEATS pretrained vs fine-tuned vs trained, MAE 1.59 / 1.99 /
  1.90 monthly and 2.59 vs 1.34 daily (reported). Nothing about turbofans or labels; the source
  map's caution that the two examples change domain and frequency together stands. Drop.

**The reframe.** The largest single improvement in the lecturer's own ladder came from changing the
*label* (31.95 → 21.90), and the RMSE after clipping is computed against the clipped label — so the
two numbers are not on the same scale. That is a lesson a developer brings: the target is a design
decision and the metric follows it. Slug in the book's style: `the-label-is-a-design-decision`.
Worked example: eight run-to-failure sequences, compute the linear label, clip it, and show how
the same predictions score differently under the two labels.

**Verdict: reframe as above, then defer** — under the 30-essay cap the monitoring and evaluation
additions rank higher, and Part II (where label construction belongs) is already at its picked
eight. Record the reframe for the next round.

### Part IV — Serving and inference

#### 19. kv-cache — keep (pilot)

**Reader problem.** Yes: why the first token is slow and the rest are fast, and why memory runs out
at long contexts.

**Mechanism.** The catalogue sentence carries three: the cache, prefill vs decode, and GQA plus
sliding-window as ways to shrink it. Trim to the cache; the other two are the limits section.

**Sources checked.**
- 6538601/03-07 lines 1–27: generation without a cache recomputes keys and values for every
  position at every step (1×1, 2×2, 3×3, 4×4 score matrices); 28–46: keep previous keys and values,
  compute only the new token's; 54–71: the score computation shrinks from n×n to 1×n. No
  prefill/decode vocabulary and no memory figures.
- 6538601/03-06 (664 words): sliding-window attention as a diagram walk-through with an
  "effective context" argument across layers; no formulas or sizes. 03-05 (grouped-query
  attention per the catalogue) was not opened in this audit — check at drafting.
- `inference-eng` p. 65: prefill determines time to first token and is compute-bound; decode
  determines tokens per second and is memory-bound. p. 64: ops:byte ratio and arithmetic intensity
  (the book's H100 figure of about 295 is its own and dated — cite as `reported`).
- `llm-serving` ch. 6 "Continuous Batching with Chunked Prefill": prefill has high arithmetic
  intensity, decode low; the "happy path" diagram is called cherry-picked.

**Worked example / exercise.** Cache bytes = 2 × layers × kv-heads × head-dim × bytes-per-value ×
tokens, computed for an invented small model at two context lengths; then the same with kv-heads
reduced (GQA) and with a fixed window. Exercise: the reader recomputes for a model card of their
choosing with the formula given. Paper only.

**Verdict: keep.** Trim the mechanism sentence; the pilot plan stands.

#### 20. position-is-a-rotation — defer (cut candidate)

**Reader problem.** Weak for this reader: it surfaces only when a context window is extended or a
model degrades past its training length, and the essay would have to manufacture the problem.

**Mechanism.** One, and well explained: rotate each (2i, 2i+1) pair of a query and key by position
× θ_i, so the dot product depends only on the position difference.

**Sources checked.** 6538601/03-03 lines 42–83 (the toy: the same two words at positions 1 and 4
and at 6 and 9 keep the same relative angle), 96–133 (the 2×2 rotation matrix; the product depends
on n − m), 190–256 (pairs of dimensions, block-diagonal form, closed form). 03-04 lines 1–61
(θ_i = 10000^(−(2i−1)/d); for d = 8 the four values 1, 0.1, 0.01, 0.001 — reported), 62–113
(position × θ), 193–380 (applying the rotation with tensor shapes). Neither lecture computes a full
attention score numerically. `llm-deep-dive` pp. 70–71 only names RoPE among positional schemes.

**Worked example / exercise.** Two-dimensional q and k, positions (3, 7) and (10, 14), show equal
dot products; then change θ and watch the decay with distance. Fully recomputable.

**Verdict: defer.** Everything is in place except the reader problem, and the cap has to be paid
somewhere. If the author wants one architecture-internal essay in Part IV beyond the cache, this is
the one to restore; note also that it has no overlap with anything else.

#### 21. four-bits-per-weight — keep, fix sources

**Reader problem.** Yes: "will the 4-bit model fit, and what did I lose?"

**Mechanism.** One: a block of floats is mapped to small integers by a scale and a zero point; the
error is bounded by half a step; NF4 and double quantisation are variants.

**Sources checked.**
- 6100015/03-15 lines 22–65: bit widths as a dimmer switch, 256 vs 16 levels, a fourfold memory
  saving from 16 to 4 bits (reported); 66–102: why it is not like pruning three-quarters of the
  weights, which the lecturer himself calls hand-waving at line 101; 103–121: NF4 named as a
  non-integer mapping, no formula.
- 6100015/03-16 lines 87–103: the same description while setting library flags; line 17 a GPU
  memory figure (reported).
- 6100015/07-03 lines 100–108: 3 billion weights at 4 bytes ≈ 13 GB (reported); 175–197: 4-bit
  values are not integers 0–15; only the base model is quantised, adapters stay in higher
  precision. No scale, zero point or block size.
- 6100015/07-05 lines 21, 33, 87, 108: reported footprints 0.9 GB → 3.6 GB (8-bit) → 2.2 GB (4-bit)
  → 2.27 GB with adapters. The 8-bit figure exceeds the first, so the sequence is inconsistent as
  transcribed; do not use these sizes. Lines 61–76: double quantisation and NF4 named, not
  explained. Lines 140–194: an adapter parameter count (18 million, 73 MB — reported; the LoRA
  pilot already re-derives this).
- `quant-ru` pp. 12–14: classification (scalar, uniform/non-uniform, INT/FP, symmetric/asymmetric,
  k-means); uniform quantisation with scale and zero point, zero point 0 for symmetric; weights
  usually symmetric, activations asymmetric. Equations are on slides and did not survive text
  extraction — render the pages before deriving.
- `llm-deep-dive` p. 188: outlier features are why naive quantisation breaks past about 6.7 B
  parameters; LLM.int8 keeps outliers in 16-bit; GPTQ and others at 4, 3, 2 bits (all reported
  from the book's citations). This is the "where you lose" half.
- `inference-eng` is cited; its quantisation pages were not opened here.

**Worked example / exercise.** Eight weights, one block, compute scale and zero point, the
integer codes, the dequantised values and the largest error; then show one outlier stretching the
scale and crushing the others — the p. 188 point in arithmetic. Exercise: a second block with a
different range. Paper only.

**Verdict: keep.** Cite `quant-ru` pp. 12–14 and `llm-deep-dive` p. 188 as the mechanism sources;
keep 03-15 and 07-03 as the course context; drop 03-16 and 07-05 (flags and inconsistent sizes).
Boundary with `lora-is-a-low-rank-diff`: that essay owns "the base is 4-bit, the adapters are not";
this one owns the mapping.

#### 22. batching-is-where-throughput-comes-from — keep, sources rebuilt

**Reader problem.** Yes: "why is my GPU at 20 % and my latency high?"

**Mechanism.** One: decode is memory-bound, so a batch of sequences costs nearly the same time as
one until arithmetic intensity reaches the hardware's ops:byte ratio; continuous batching keeps the
batch full. The catalogue's "about the same" must be bounded by that ratio (source map item 8).

**Sources checked.**
- 6538601/04-01 lines 1–10: continuous batching, paged attention and chunked prefill are named
  as features of a serving engine; the rest (11–277) is a cloud-console deployment and a Gradio
  demo; one anecdotal 1.2-second response (line 144). Names only.
- 4735368/18-02 and 18-03: single-image ONNX export and a one-endpoint FastAPI service; no
  batching or throughput at all.
- 6100015/08-01 to 08-04: course roadmap, platform choice, a hello-world remote call, secrets and
  a single-call model function. 08-05 lines 11, 59, 135, 160–162, 204, 236–262: single-request
  cold-start timings (about 80 s, 68 s, 65 s, then about 30 s with a persistent volume, then
  near-instant warm — reported) and the idle-to-sleep mechanism. Useful for a "cold start" limit,
  nothing on batching.
- `inference-eng` pp. 64–65: ops:byte ratio, arithmetic intensity, roofline, compute- vs
  memory-bound, prefill vs decode. pp. 188–190: static, dynamic and continuous batching defined;
  batch size trades latency for throughput; concurrency target and replica scaling; cold starts.
- `llm-serving` ch. 6: continuous batching with chunked prefill and the caveat that equal-length,
  simultaneous-arrival diagrams are the happy path; ch. 3: a task queue, a worker process and a
  workload manager tracking each prompt.

**Worked example / exercise.** A d×d weight matrix in 2-byte floats and a batch of B tokens: FLOPs
2·B·d², bytes read 2·d², intensity B; below the machine's ops:byte ratio the step time is set by
bytes, so B sequences cost what one costs; above it, compute takes over. Then a four-request
arrival table with unequal lengths, counting occupied slots per step under static and continuous
batching. Exercise: the reader repeats the table for a different arrival order. Paper only.

**Verdict: keep.** Make the two books the mechanism sources; keep 04-01 (as the list of names, "as
of" the recording) and 08-05 (cold starts as a limit); drop 18-02, 18-03, 08-01–08-04. The
hardware figure in `inference-eng` p. 64 is the book's and dated — the essay's example uses an
invented machine.

### Part V — LLM systems

#### 23. the-chunk-is-the-unit-of-retrieval — keep

**Reader problem.** Yes, and the title's table-header case is real in the sources.

**Mechanism.** The catalogue sentence names one mechanism and three repairs. The mechanism: a chunk
boundary fixes what one embedding can represent, and anything that relies on context outside the
boundary (a header row, a name at the top of the document) is lost. Repairs go in the limits
section.

**Sources checked.**
- 6199297/03-09.en lines 1–3: fixed-size chunking splits a table so the first chunk holds the
  year headers and the second holds bare numbers with no year; semantic chunking repeats the
  header in every chunk, which requires a parser that exposes table structure; lines 6–11:
  header-aware splitting and a custom chunker with a header flag. Exact support (machine
  translation — `caution`).
- 6199297/03-08.en: a document-intelligence parser returning rows, columns and cell-to-paragraph
  links; Markdown output preserving headers. Tool description, not mechanism.
- 6100015/05-08 lines 184–198: chunk size 1000 → 800 characters raises the count from 413 to 532
  (reported); overlap never given numerically.
- 6100015/05-22 lines 50–166 (reported): 1000-character chunks at k = 5 give MRR 0.7298; about
  1667 at k = 3 give 0.7475; a Markdown-header splitter gives 0.738 because header-bounded chunks
  are too large; 500 at k = 10 improved all metrics (number not restated).
- 6100015/05-25 lines 121–167 and 05-26 lines 14–31: rewriting tables into query-friendly text,
  semantic chunking, query rewriting, reranking of k×n candidates — explained as ideas, no code.
- 6100015/05-28 lines 92–147 and 05-29 lines 1–22, 140–159: reranking by structured output moves a
  buried fact from rank 5 to rank 1; query rewriting can inject the company name and dilute
  retrieval — a named failure of a repair. 05-30 lines 138–190: query expansion (original plus
  rewritten query, merged and deduplicated, reranked against the original).
- 6100015/05-16 lines 112–121 (cited under #25, better here): the person's full name sits at the
  top of the document and the awarded-chunk lower down does not repeat it — a second boundary-loss
  case.
- nDCG appears in none of these lectures; drop it from this essay's vocabulary.

**Worked example / exercise.** A twelve-line invented document with a three-column table split
at two chunk sizes; show which chunks can answer "what was the 2020 figure?" and which cannot;
then repeat with the header repeated. Exercise: the reader chunks a supplied page two ways and
lists the questions each chunking can answer. Paper only.

**Verdict: keep.** Add 05-16 to the sources; keep 05-22 numbers `reported`; the three repairs
become the limits paragraph.

#### 24. your-loop-calls-the-function — keep, absorbing #25

**Reader problem.** Yes: "does the model run my code?" The lecture addresses it head-on.

**Mechanism.** One: a tool schema is text in the prompt; the model emits a structured request; your
code validates and dispatches it, appends the result and calls again; the loop ends when no call is
emitted. "Budget" and "permissions" are not in the course — they come from OWASP and are the book's
addition, labelled as such.

**Sources checked.**
- 6100015/02-15 lines 56–94 and 137–144: the model never executes anything; the code describes
  tools as JSON, the model returns a request, an if-statement dispatches, the second call includes
  the result; 112–134 a demonstration of a model emitting the request as plain text.
- 6100015/02-17 lines 118–227: schema, a finish reason of "tool call", a tool-role message
  appended, a second model call. Single shot.
- 6100015/08-12 lines 27–118: structured outputs and constrained decoding — tokens that would
  break the schema get zero probability at each step. A clean sub-mechanism.
- 6100015/08-16 lines 133–155: dispatch through a dictionary rather than globals. 08-17 lines
  27–40, 112–118: the `while not done` loop, done when the reply contains no tool call; no
  iteration cap, no error path. 08-18 lines 4–16: the title's 34 calls accounted (29 model calls
  and 5 small-network calls — reported). 02-14, 02-16, 08-15, 08-19: framing only.
- `owasp-llm` p. 27: excessive functionality, excessive permissions, excessive autonomy with
  concrete examples (an extension that can delete as well as read; a shared high-privilege
  identity; deletions without confirmation) and the mitigations (minimise extensions and their
  functions). p. 9: least privilege, human approval for high-risk actions, segregating external
  content, and seven attack scenarios including a modified document in a RAG store.
- `llm-security-playbook` p. 100: design-level limits on agency *and* aggressive output
  filtering as a pair, with the keyword-list failure named.

**Worked example / exercise.** A three-tool loop traced by hand for a request that needs two
calls, then for a retrieved document containing an instruction to call the delete tool: show at
which line (schema, validation, permission of the executing identity, confirmation) the call is
refused. Exercise: the reader writes the dispatch table and the allow-list for a given tool set
and marks which of the OWASP p. 27 examples each line prevents. No API needed.

**Verdict: keep, absorbing `untrusted-text-is-an-untrusted-code-path`.** The injection case is the
failure mode inside this essay's principle (the loop is the trust boundary), which is how the
constitution wants failure modes placed. Add `owasp-llm` pp. 9, 27 and `llm-security-playbook`
p. 100 as sources; keep 02-15, 02-17, 08-12, 08-16, 08-17; drop the rest.

#### 25. untrusted-text-is-an-untrusted-code-path — merge into #24

**Sources checked.** 6100015/02-10 is about Markdown output and streaming; 05-16 is about
conversation-history bugs; 6199297/03-06.en is a RAG architecture tour with "guardrails" used for
persona instructions. None mentions injection, adversarial documents or the instruction/data
distinction. The essay's real sources are the OWASP and playbook pages listed under #24, plus
`llm-deep-dive` p. 387 (prompt injection named in a risk-assessment list; human-in-the-loop and
content filtering as mitigations).

**Two corrections to the catalogue text.** (a) The mechanism sentence says the defence is limiting
what the model may do, "not filtering what it reads"; playbook p. 100 argues for both, with design
limits first and output filtering as the safety net. (b) The reader problem is real, but as a
standalone essay it would repeat #24's loop to explain where the boundary is.

**Verdict: merge.** If the author wants it standalone (there is an argument: prompt injection is
the question developers ask by name), the sources above are sufficient and the course citations
must go. Check overlap with the author's OWASP book (book17) before deciding.

#### 26. when-fine-tuning-lost — keep, reframe the mechanism

**Reader problem.** Yes: "should I fine-tune?" and "why did the fine-tune get worse?"

**Mechanism as catalogued.** Two halves. The ladder is fully supported. "Format cheap, knowledge
expensive" is only loosely in the sources: 06-24 lines 139–171 attribute the fast loss drop to
learning the output format; 06-26 lines 10–33 say frontier fine-tuning suits style, tone and format
rather than expertise a prompt could supply, and diagnose the failure as added noise; 07-24 lines
85–96 explain the small model's win by 800,000 task-specific examples, not by a format/knowledge
split. The essay should make the *ladder* the mechanism and keep the format observation as the
lecturer's reading (`reported`), with the book's own hypothesis labelled.

**Sources checked (all figures reported, single runs of 200 test items unless noted).**
06-13 lines 25–29: 800,000 / 10,000 / 10,000 split; 152–208: random pricer $382.08 with a ±$37
confidence interval. 06-14: constant pricer $106.18, weak-feature linear regression $101.56.
06-15: bag-of-words linear regression $76.81. 06-16: random forest $72.28, XGBoost $68.23. 06-18:
the lecturer's own 100-item human baseline $87.62. 06-19: an 8-layer network with 669,000
parameters $63.97. 06-20/06-21: frontier models from $62.51 down to $44.74 (a 50-item sample for
one of them). 06-23–06-25: SFT of a small frontier model on 20,000 examples, cost $3.42, result
$75.91 — worse than its own base. 06-27: a 289 M-parameter home-built network $46.49. 07-23:
LoRA on attention only $65.40; 07-24: LoRA on attention and MLP at rank 256, two epochs, $39.85.
07-22 lines 35–82: cross-entropy as minus the log probability of the correct token, illustrated
but not computed. 07-23 lines 32–34: validation and test sets kept distinct.

**What the numbers allow.** With a ±$37 interval on n = 200 for the random baseline, the reader
can compute the standard error for the better models and see that several adjacent rungs are
inside noise ($62.51 vs $63.97, for instance). That is the essay's own recomputable contribution
and the antidote to reading the ladder as a ranking of products. Model names are "as of" the
recording and never the finding (source map, course-map caution).

**Verdict: keep.** Mechanism: a baseline ladder with confidence intervals tells you which rung you
needed; fine-tuning is a rung, not a guarantee. Trim the citation list from twenty lectures to
06-13, 06-14, 06-16, 06-19, 06-20, 06-21, 06-25, 06-26, 06-27, 07-23, 07-24. Huyen pp. 226 and
236 (phases of adoption; heuristic, zero-rule and human baselines — the zero-rule 70 % app example
is the book's) fit here as the written baseline taxonomy.

### Part VI — The job

#### 27. read-the-table-first — keep

**Reader problem.** Yes for this reader: papers are the documentation now.

**Mechanism.** A reading order — claim, table, method, what was held fixed — then re-derive one
number. It is a procedure rather than a model mechanism, which is fine for Part VI.

**Sources checked.** `instructgpt` p. 3: the three-step figure; 175 B InstructGPT outputs preferred
to 175 B GPT-3 85 ± 3 % of the time and 71 ± 4 % against few-shot; hallucination 21 % vs 41 % on
closed-domain tasks; the alignment tax on public datasets. p. 8: inter-annotator agreement 72.6 ±
1.5 % (training labellers) and 77.3 ± 1.3 % (held-out); §3.5: SFT for 16 epochs overfits on
validation loss after one epoch yet keeps improving on the reward-model score; labellers rank K =
4 to 9 responses, giving K-choose-2 comparisons per prompt, and shuffling correlated comparisons
overfits the reward model in one pass. 6538601/03-06: a diagram walk-through of a paper figure —
thin as the second example; consider `ts-foundation` pp. 47–51 instead (two tables, MAE and sMAPE,
and a conclusion that outruns the experiment — the source map's caution becomes the exercise).

**Worked example / exercise.** Re-derive K-choose-2 for K = 9 (36 comparisons per prompt) and
explain why one pass overfits; read the 85 ± 3 % as a proportion with its interval and say what
n it implies. Exercise: the reader takes the `ts-foundation` table 2.2 and writes down what
changed between the two rows besides frequency.

**Verdict: keep.** Replace 6538601/03-06 with `ts-foundation` pp. 47–48, 51 as the second table.

#### 28. show-the-eval-not-the-demo — drop

**Sources checked.** 6100015/01-03 (692 words) is the course's six-course sequencing and what a
graduate can call themselves; 08-19 (491 words) is a wrap-up of the agent loop; `staff-eng-path`
p. 99 is about writing a technical strategy (diagnosis, guiding policy, actions). None says
anything about portfolios or what a hiring engineer trusts. The source map reached the same
conclusion.

**Verdict: drop.** The one usable sentence — lead a repository with the baseline table and the
harness — is the exercise of #26 and needs no essay. If the author wants a hiring essay, it needs
a source that does not exist in the library.

#### 29. design-the-data-loop-first — merge into `labels-arrive-later`

**Sources checked.** 6100015/06-07 lines 20–24, 52–81: the five steps (understand, prepare with
baselines and candidate models, select, apply, productionise); 89–108 the four application
techniques; 06-08 lines 15–28: productionising, continual evaluation and drift. No feature design,
serving or feedback diagram. `acing-sdi` p. 316: ML is usually outside a system-design interview;
the discussion is about experiment platforms that split users and serve different models.
`huyen-dmls` p. 229: evaluation should be the same offline and in production but ground truth is
often missing in production; pp. 317–318: natural labels and feedback-loop length. `ml-system-design`
ch. 14 (delayed ground truth → drift detection) and ch. 7 (validation schemas).

**Verdict: merge.** The interview framing is unsupported (p. 316 undercuts it) and the essay's
genuine content — the path from prediction to feedback to label to retrain — is the mechanism of
the proposed `labels-arrive-later`. The five-step process can be one paragraph there, `reported`.

#### 30. the-rule-was-cheaper — keep, fix sources

**Reader problem.** Yes, and it is the one the author's other books already trained this reader
to ask (cost before capability).

**Mechanism.** One: a ledger — a rule costs a test; a model costs data, evaluation and drift — with
the break-even condition stated as an inequality the reader can fill in.

**Sources checked.** `huyen-dmls` p. 226 (phase one, before ML: start with heuristics; the three
most common letters guess correctly 30 % of the time; a chronological feed for five years —
reported); p. 236 (simple-heuristic baseline, zero-rule baseline with the 70 % app example, human
baseline); p. 115 (why train a model if heuristics work: coverage of what the rules do not reach);
pp. 110–111 (labelling functions as rules that encode expertise). 6100015/06-07 lines 52–73: start
with plain code and classical baselines; a linear model wins when the truth is a weighted sum of
features (reported). `ds-hard-parts` pp. 142–143: the "heuristic" hits are about detecting leakage
from suspiciously high scores — not rules; drop this citation. Note the AGENT rule against
overlapping book11's Burkov routing-cost example: none of the pages above is that example.

**Worked example / exercise.** An invented ledger, labelled as an example: rule accuracy from the
zero-rule baseline, model accuracy from the ladder, the cost lines, and the inequality solved for
the volume at which the model pays. Exercise: the reader fills the ledger for one of their own
systems with three numbers they can look up. No tools.

**Verdict: keep.** Sources: Huyen pp. 115, 226, 236 with pages; 06-07 lines 52–73; drop
`ds-hard-parts`. If Part VI shrinks to two essays this is one of them.

## Proposed additions

The source map's seven candidate questions, each tested against the four requirements. Slugs are
in the book's style (a statement the reader can carry). "Displaces" names the slot the essay takes
under the 30 cap; nothing here is approved. Passages marked *verified here* were opened in this
audit; the rest are the source map's locators, carried but not re-read.

### A. `not-available-at-prediction-time` — new, Part III opener

- **Reader question.** Why did the offline result disappear in production?
- **Mechanism.** A feature that carries information which does not exist at prediction time —
  the label, a function of it, a future timestamp, a statistic fitted on rows you will only see
  later — makes the offline score a claim about a different function from the one you deploy.
  Split by time; fit every transformation on the training split only; check the highest-correlated
  features and ablate.
- **Sources.** `huyen-dmls` pp. 163–165 (*verified*: definition; the CT-scanner example; time-based
  splitting with the four-weeks-then-week-five layout; scaling before splitting; imputation with
  test statistics; duplicates; group leakage; detection by feature–label correlation and ablation).
  `ds-hard-parts` pp. 139–143 (*verified*: three-part definition; outcome as feature; a function of
  the outcome; bad controls; a timestamp labelled at the wrong end of the period; a sloppy join
  across time windows; standardising with the full sample's moments; detection by comparing
  production and test performance, and a simulation where the leaky model's MSE is about a quarter
  of the honest one). 4735368/03-09 lines 110–128 and 224–227 (*verified*: normalising with the
  mean of all data leaks validation and test into training; the normaliser is adapted on the train
  split only). `ml-system-design` ch. 7 §7.3.1 (*verified*: nested validation).
- **Worked example / exercise.** A six-row table with entity id, event time, label time and a
  feature computed from a window; the reader marks the rows whose feature uses events after the
  prediction time, then refits a scaler on the honest rows and recomputes one standardised value
  both ways. Exercise: a second table with a group-leak (two rows of one entity in different
  splits). Paper only.
- **Displaces.** Takes the slot vacated by `which-feature-moved-the-prediction`; absorbs that
  essay's detection use (Huyen p. 165).

### B. `the-artifact-is-the-pipeline` — new, Part IV opener

- **Reader question.** What exactly do I version and roll back?
- **Mechanism.** A prediction is f(θ, s): weights θ and fitted preprocessing s (imputation values,
  scaler mean and variance, vocabularies, thresholds). Restoring θ without s — or s without the
  code that defines the custom transformers — restores a different function. The deployed unit is
  the whole pipeline plus its data snapshot and configuration.
- **Sources.** `burkov-mle` p. 77 (*verified*: a deployed model is a mix of code and data; three
  levels of data versioning; without versioned data you cannot return to the previous performance)
  and pp. 139–140 (*verified*: a pipeline is a sequence of transformations ending in a model; the
  saved pipeline is what is deployed and scored; from that point "model" means the whole pipeline).
  `geron-pytorch` p. 116 (*verified*: an imputer-then-scaler pipeline; `fit` calls `fit_transform`
  in sequence), pp. 130–131 (*verified*: save every experimental model with its scores; loading in
  production requires importing the custom classes and functions first — the code travels with the
  file). MLOps with Red Hat OpenShift p. 155 (*verified*: never overwrite a served model; version
  by timestamp, integer scheme or commit hash so a failed release can be rolled back). Kubeflow
  p. 262 (*verified*: a validator that compares serving data statistics against the training
  schema and flags training–serving skew) as the limit: the artefact can be intact and the inputs
  still drift.
- **Worked example / exercise.** One weight vector, two scaler statistics (old and new), one
  input: the same θ gives two different outputs; then a "rollback" that restores θ but keeps the
  new scaler, and what the reader would see. Exercise: two release manifests — the reader lists
  what each restores and why one cannot reproduce last week's number. Paper only.
- **Displaces.** The slot of `show-the-eval-not-the-demo` (dropped).

### C. `labels-arrive-later` — new, Part III

- **Reader question.** What can I monitor before the labels exist?
- **Mechanism.** Three clocks — prediction time, feedback time, label time — and the set of
  quantities available at each: operational health at once; input distributions and prediction
  distributions without any label; presumed labels after a window; true labels after the dispute
  period. A short window under-counts positives; a cumulative metric hides a dip.
- **Sources.** `huyen-dmls` pp. 317–318 (*verified*: natural labels; feedback-loop length from
  seconds to weeks; presumed negatives after a window; the ads-team finding that most clicks land
  within five minutes but some hours later, so short windows under-estimate the click rate —
  reported), p. 332 (*verified*: monitor P(X) without labels; summary statistics as a first step;
  two-sample tests; the KS test is one-dimensional), pp. 334–335 (*verified*: window size trades
  detection speed against false alarms; sliding vs cumulative accuracy and the dip that cumulative
  hides). `geron-pytorch` p. 132 (*verified*: infer live performance from downstream metrics or
  from human raters on a sample of low-confidence predictions; monitoring is often more work than
  training). 6100015/04-18 lines 109–134 (*verified*: the business metric arrives later than the
  model metric; you optimise the one you can measure now). `ml-system-design` ch. 14 (*verified*
  excerpt: with delayed ground truth, switch to drift detection over key features and raise the
  threshold for weak ones to limit false positives). 6100015/06-08 lines 15–28 as the course's
  productionising step (from the merged essay).
- **Worked example / exercise.** A timeline of 1,000 predictions with an invented late-click
  fraction: compute the click rate seen after a five-minute window, after an hour, and the true
  rate; then a two-hour accuracy series where the cumulative curve moves by a fraction of the
  sliding drop. Exercise: the reader marks, for a supplied system description, which metric is
  available at each of the three clocks. Paper only.
- **Displaces.** `design-the-data-loop-first` (merged).

### D. `the-model-picks-its-own-training-data` — new, Part III

- **Reader question.** Can the system create the evidence used to train its replacement?
- **Mechanism.** Only displayed items receive feedback; undisplayed items receive presumed
  negatives; the next model is trained on both; a small initial ranking difference grows. The
  fixes are exposure randomisation for a small slice and a positional feature, so the position's
  effect is learned rather than confused with the item's.
- **Sources.** `huyen-dmls` pp. 323–325 (*verified*: definition — outputs used to create the same
  system's inputs; the two-song example; the résumé feature-X example; detection by popularity
  buckets and hit rate per bucket; correction by random initial exposure and by positional
  features, with a note that randomisation costs user experience). Huyen p. 324 also names feature
  importance as the way to spot the self-reinforcing feature — where the deferred attribution
  essay's use survives.
- **Worked example / exercise.** Two items with equal true quality; a five-round simulation on
  paper where click probability is proportional to exposure and the next round's ranking is set by
  observed clicks; the gap after five rounds. Then rerun with 10 % random exposure. Exercise: the
  reader repeats it for three items and says what can be concluded about the item never shown.
  Paper only.
- **Displaces.** Slot freed by the merge of `untrusted-text-is-an-untrusted-code-path`.

### E. `the-score-is-not-the-lift` — new, Part III

- **Reader question.** Does a better score mean the change caused a better outcome?
- **Mechanism.** A predictive score ranks who will convert anyway; the intervention's value is the
  difference between treated and untreated *within* a score band. The 2×2 design (score high/low ×
  lever on/off) separates the two questions; segmentation without random assignment does not.
- **Sources.** `ds-hard-parts` pp. 51–52 (*verified*: the 2×2 design; randomisation makes groups
  equal on average before the test; the cross-selling example with a classifier score on one axis
  and the lever on the other; groups A–D; the monotonicity hypothesis CR_A > CR_B and CR_D > CR_C;
  the explicit caveat that non-experimental segmentation cannot hold everything else constant).
  `huyen-dmls` p. 229 (*verified*: offline evaluation has ground truth; production often does
  not; user feedback is biased). Boundary with book11: this is Vaughan, not Burkov's routing-cost
  example.
- **Worked example / exercise.** Four invented cells with counts: high-score users convert at
  30 % with or without the lever, low-score users at 5 % vs 10 % — the model is predictive and the
  lever helps only where the score is low. Exercise: a second table where the lever helps nowhere
  and the score is still predictive. Paper only.
- **Displaces.** Slot freed by deferring `predict-the-time-left`.

### F. `the-new-model-must-beat-the-blessed-one` — new, Part IV closer

- **Reader question.** What has to pass before the retrained model replaces the deployed one?
- **Mechanism.** Two inequalities on the same evaluation set — an absolute floor and a
  relative-to-baseline change — evaluated against the last accepted model; only a model that
  passes is pushed; then a weighted canary exposes a fraction of traffic. The noise limit: with
  n evaluation items the "no worse than baseline" test passes and fails by chance, so the gate
  needs the interval from #26.
- **Sources.** Kubeflow pp. 283–284 (*verified*: an evaluation configuration with a value
  threshold — accuracy lower bound 0.5 — and a change threshold relative to the baseline, direction
  higher-is-better, absolute margin −1e-10; a resolver fetches the last blessed model as the
  baseline for the evaluator), p. 290 (*verified*: the pusher publishes only a model the evaluator
  blessed), p. 262 (*verified*: the example validator detects schema anomalies, training–serving
  skew and drift before training). MLOps with Red Hat OpenShift p. 171 (*verified*: canary by
  weighted routing between two model servers holding two versions). `geron-pytorch` p. 130
  (*verified*: keep every model and its cross-validation scores to compare). Framework names are
  the instance the source used; the mechanism is the two inequalities.
- **Worked example / exercise.** Baseline 0.842 and candidate 0.847 on n = 200: compute the
  standard error and show the change threshold passes inside noise; then n = 2,000. Exercise: the
  reader writes the two inequalities for a stated floor and margin and decides three candidates.
  Paper only.
- **Displaces.** Slot freed by deferring `position-is-a-rotation`.

### G. Data contracts / backfill reproducibility — watch, not an essay this round

- **Reader question.** The schema still passes; did the meaning change? Does replaying today's
  table reproduce yesterday's inputs?
- **What was verified.** Data Contracts p. 130 (building blocks: assets, contract definition
  with schema and business logic, detection categories), pp. 147–148 (semantic constraints in the
  spec — null thresholds, a max-of-today date — and a business-logic lifecycle in which data
  quality fails when the data stops representing the logic), p. 156 (detection at code level for
  schema and at runtime for semantics; prevention via CI, code review, alerts), p. 162 (the
  write-audit-publish pattern with a dead-letter queue). Data Engineering Design Patterns ch. 4
  "Backfilling" under the Merger pattern (a corrected upstream dataset is re-merged as long as row
  identity is stable; idempotency granularity with truncate/drop) and ch. 8 (manifest files that
  make a load replayable). `huyen-dmls` p. 331 (label schema change: a score range moving from
  300–850 to 250–900; classes split). Kubeflow p. 262 as above.
- **Why not yet.** The checked passages support "semantic checks beyond schema" and "idempotent
  replay", but no passage checked here shows point-in-time reconstruction of training inputs (the
  ch. 8 "snapshot" hits are about table manifests). Two mechanisms are also competing for one
  essay. Recommendation: fold the label-schema-change and semantic-constraint points into
  `the-artifact-is-the-pipeline`'s limits paragraph now; revisit a full essay when a checked
  point-in-time passage exists. Keeps the count at 30.

## Proposed Part III–VI outline

Reading order. Numbers continue from Part II's twelve. "New" and "merged" are this audit's
proposals; every row is unapproved.

| # | slug | part | status | one-sentence mechanism (proposed) |
|---|---|---|---|---|
| 13 | not-available-at-prediction-time | III | new | A feature that uses information absent at prediction time makes the offline score a claim about a different function; split by time and fit every transform on the training split. |
| 14 | the-model-outputs-a-score | III | keep | Precision, recall, TPR and FPR are functions of a threshold over scores; the ROC is the sweep; the threshold is a cost decision. |
| 15 | benchmark-is-a-claim-about-a-test-set | III | keep, reframed | Selecting the best of N on a fixed test set inflates the number; contamination is the extreme case; a once-used private set and blind pairwise comparison are the defence. |
| 16 | measure-retrieval-before-blaming-the-model | III | keep (pilot) | Rank-based metrics over a golden set score retrieval on its own; the answer is judged separately; keyword checks are proxies. |
| 17 | the-score-is-not-the-lift | III | new | A predictive score ranks who converts anyway; the lift is the treated–untreated difference within a score band; the 2×2 design separates them. |
| 18 | labels-arrive-later | III | new (absorbs design-the-data-loop-first) | Three clocks — prediction, feedback, label — and what is measurable at each; short windows under-count, cumulative metrics hide dips. |
| 19 | autoencoder-learns-normal | III | keep, sources fixed | A bottleneck forces reconstruction of what is common; the error is a label-free score; a quantile threshold fixes the flag rate, not the anomaly rate. |
| 20 | the-model-picks-its-own-training-data | III | new | Only shown items get feedback; presumed negatives train the successor; small ranking gaps grow; random exposure and positional features break the loop. |
| 21 | the-artifact-is-the-pipeline | IV | new | Prediction = f(weights, fitted preprocessing); restoring one without the other restores a different function; version the pipeline, its data snapshot and its code. |
| 22 | kv-cache | IV | keep (pilot) | Keys and values are stored per layer so each new token attends over stored ones; prefill is compute-bound, decode memory-bound; the cache grows with the sequence. |
| 23 | four-bits-per-weight | IV | keep, sources fixed | A block of floats maps to small integers by a scale and a zero point; the error is half a step; an outlier stretches the scale for the whole block. |
| 24 | batching-is-where-throughput-comes-from | IV | keep, sources rebuilt | Below the hardware's ops:byte ratio a decode step is paid in bytes, so a batch costs what one sequence costs; continuous batching keeps the batch full. |
| 25 | the-new-model-must-beat-the-blessed-one | IV | new | An absolute floor and a relative-to-baseline margin on the same evaluation set gate the push; a weighted canary gates the traffic; n sets the noise. |
| 26 | the-chunk-is-the-unit-of-retrieval | V | keep | A chunk boundary fixes what one embedding can represent; a header row or a name outside the boundary is lost; header repetition, rewriting and reranking are repairs with their own failures. |
| 27 | your-loop-calls-the-function | V | keep (absorbs untrusted-text) | A tool schema is prompt text; the model emits a request; your code validates, dispatches, appends and loops until no request comes; the loop is the trust boundary, so retrieved text with instructions is stopped by permissions, not by the model. |
| 28 | when-fine-tuning-lost | V | keep, reframed | A baseline ladder with confidence intervals tells you which rung you needed; a fine-tune is a rung, not a guarantee. |
| 29 | read-the-table-first | VI | keep | Claim, table, method, what was held fixed; then re-derive one number. |
| 30 | the-rule-was-cheaper | VI | keep, sources fixed | A rule costs a test; a model costs data, evaluation and drift; the break-even is an inequality you can fill in. |

Deferred with their reframes recorded: `position-is-a-rotation` (restore first if an
architecture slot opens), `the-label-is-a-design-decision` (formerly `predict-the-time-left`),
`which-feature-moved-the-prediction` (needs a Shapley source). Dropped:
`show-the-eval-not-the-demo`. Merged: `untrusted-text-is-an-untrusted-code-path` → 27,
`design-the-data-loop-first` → 18.

Part sizes under this proposal: III = 8, IV = 5, V = 3, VI = 2 (total 18; with Parts I–II, 30).
Part VI at two essays reopens CONTEXT §10's question about whether Part VI belongs in this book;
the two survivors are the ones with checked sources.

## Manifest rows to add

Filenames as they exist under `resources/books/`; size from the filesystem in whole megabytes;
page counts from `pdfinfo` (physical pages). The EPUB has no page count, following the manifest's
convention for EPUBs. Keys are proposals. Do not edit the manifest on this audit's say-so.

```
data-contracts	book	books/data.contracts.pdf	11	349	Data Contracts	O'Reilly; Sanderson, Freeman and Schmidt; cited pp. 130, 147–148, 156, 162 are physical pages
dedp	book	books/data.engineering.design.patterns.epub	6	unknown	Data Engineering Design Patterns	EPUB (Konieczny, metadata date 2025-04-21); cite by OEBPS section, e.g. ch04.html "Backfilling", ch08.html
kubeflow-cml	book	books/Continuous_Machine_Learning_with_Kubeflow_Performing_Reliable_MLOps.pdf	11	552	Continuous Machine Learning with Kubeflow	BPB first edition 2022, Choudhury; PDF produced by calibre, embedded title is a number, so title is from the title page
openshift-mlops	book	books/mlops.with.red.hat.openshift.pdf	13	238	MLOps with Red Hat OpenShift	Packt 2024, Brigoli and Masood; printed page = physical page − 17 on the pages checked (155 → 138, 171 → 154)
```

Two manifest hygiene notes from the source map, confirmed incidentally: the file
`Modern_Software_Engineering_Doing_What_Works_to_Build_Better_Software.pdf` is reported identical
to the Burkov file and must not be added as a second source; `quant-ru`'s title page reads
*Автостопом по Квантизации* and it is a slide deck — the manifest's title could carry that note.

## Open questions for the author

1. **Merge or keep prompt injection standalone?** #24/#25 above. The mechanism is one (the loop is
   the boundary), but developers ask about injection by name. Also: does book17 (the OWASP Top 10
   book) already carry the LLM-injection case in a way that makes a second treatment redundant?
2. **Which architecture internal survives the cap?** `position-is-a-rotation` is the best-sourced
   essay to be deferred here; `autoencoder-learns-normal` is the weakest-problem essay to be kept.
   Swapping them is defensible; I ranked the monitoring spine higher because it has no other home.
3. **Part VI at two essays.** Keep it as a short closing part, fold the two into V, or move
   `the-rule-was-cheaper` to open Part III as the cost frame for everything after it?
4. **Part III at eight.** It is now the largest part. If that is too heavy, `the-score-is-not-the-
   lift` is the essay least tied to the course material (Vaughan only) and could wait for a
   companion.
5. **Course citations that carry no support.** Several catalogue rows cite lectures that do not
   contain the essay's mechanism (18-02/18-03 and 08-01–08-04 for batching; 14-02–14-04 for the
   autoencoder; 02-10/05-16/03-06 for injection; 01-03/08-19 for the portfolio essay; 4735368/14-02
   for attribution). The author may want a rule that a lecture is cited only if the pitch names the
   lines it uses — the receipts check cannot catch this, as CONTEXT §8 says.
6. **Huyen as a catch-all.** `huyen-dmls` is cited on five Part III–VI rows; on two (benchmarks,
   retrieval metrics) I could find no passage. Its real weight is pp. 163–165, 226–242 and 317–335,
   all in the proposed new essays.
7. **A Shapley source.** If attribution matters to the author, the library needs one book page
   that enumerates coalitions; none of the 22 manifest files or the four proposed additions was
   found to.
8. **Parts I–II, briefly.** Nothing here changes their picks. Two boundaries should be written into
   the Part III pitches so they do not re-explain Part II: threshold vs class weights (#14 vs
   `class-imbalance-changes-the-loss`) and someone-else's-benchmark vs your-own-test-set (#15 vs
   `validation-set-is-a-budget`). The LoRA pilot's source correction (Raschka pp. 141–142 with the
   1,250 vs 6,250 error re-derived, paper §4.1 for the alpha/r convention) is already in the
   catalogue as of this audit.

*Audit complete 2026-09-13. Recommendation only; no catalogue, pitch, essay or manifest change was
made. Lecture line numbers refer to the `.txt` caption files; book pages are physical PDF pages.*
