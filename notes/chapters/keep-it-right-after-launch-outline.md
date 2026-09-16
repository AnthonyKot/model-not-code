# Chapter 5 outline — Keep It Right After Launch (for the author's approval)

**Status:** outline only, 2026-09-16. No prose, receipts or exercise yet. Plan: CHAPTER-PLAN rev 2 §5
(Part III 6, 7, 8 + Part IV 9, 13 of the audit: `labels-arrive-later`, `autoencoder-learns-normal`,
`the-model-picks-its-own-training-data`, `the-artifact-is-the-pipeline`, `the-new-model-must-beat-the-blessed-one`).

## The chapter's question, stated in the opening

*The photo classifier from chapter 2 is live. How do you know it is still right when the labels that would
say so arrive weeks later, and what are you allowed to change when it is not?* Four decisions answer it, and
the opening names them before any mechanism (review.md §1): what you can roll back to; what to watch before
labels exist; what an alarm obliges you to do; what must pass before a retrained model replaces the live one.

Project continuity: chapter 2's release record (per-listing accuracy 0.946, blade threshold 0.05, costs 2 per
false flag and 20 per missed blade, the review queue) is the starting state. The reviewers who handle flags
are the label source that the whole chapter turns on. Chapter 3's garden range is not reused; its BatchNorm
buffers are (they are part of what ships).

## Sections (target ≈ 26–30k characters of prose; ch 4 was 31.6k)

1. **What ships is a function, not a weights file.** A prediction depends on weights, the fitted normaliser,
   the category list, the threshold and the code that joins them. Worked example small enough to write: one
   input, the same weights, the launch normaliser vs one refitted on this week's photos → two scores, one
   flag and one miss. Practitioner framing: `state_dict` carries buffers (chapter 3's BatchNorm trap from the
   other side); put the normaliser in the module with `register_buffer`; ONNX export as the illustrative
   instance of "the graph travels, the preprocessing may not". Version by id, never overwrite; a rollback
   restores all of it.
2. **Three clocks: what you can measure, and when.** Prediction time (flag rate, score distribution, input
   statistics), review time, a day later (precision of flags, and only of flags), complaint or audit time,
   weeks later (missed blades). Presumed negatives under-count misses; a cumulative rate hides a dip that a
   sliding window shows. One table; one figure, a vertical timeline so it reads at phone width (review.md §5).
   *Pause:* the flag rate doubles in week 3 — name two explanations that predict opposite reviewer precision.
3. **Watching the photos without labels.** An autoencoder's reconstruction error as a label-free score:
   hand example of 2-D points near a line with a 1-D bottleneck (error = distance to the line), then the
   PyTorch module and `MSELoss(reduction="none")`. The threshold trap stated inside the mechanism: a
   percentile of launch-week errors fixes the alarm rate on ordinary weeks; it does not discover an anomaly
   rate. One sentence on per-feature statistics as the cheaper first check.
4. **An alarm is a reason to look, not a verdict.** Two synthetic changes, designed to split the two
   questions: sellers switch to white backgrounds (the score alarms, category accuracy holds) and folding
   knives that resemble tools arrive (no alarm, blade recall falls). What the investigation does: a labelled
   sample of the alarmed and unalarmed weeks, per-category recall, then a decision. *Pause* before the result.
5. **The model chooses which labels it gets.** Reviewers see only flagged listings. Retrain on reviewed
   flags plus "not flagged = not a blade", and the missed blades enter training as negatives; two rounds show
   recall sinking. A small random audit of unflagged listings fixes both problems at once, an unbiased
   recall estimate now and honest labels for the next model, and costs review time priced with chapter 2's 2
   per check. One paragraph connects the same shape to chapter 1's search clicks and chapter 4's thumbs up on
   shown answers (the promise made at the end of chapter 4).
6. **The new model must beat the live one.** A gate of two inequalities on the same audited listings: a
   floor (blade recall) and a margin against the deployed model (cost no worse). Chapter 2's standard error on
   listings decides whether a margin is inside noise; a canary sends a share of traffic before full rollout;
   the rollback is section 1's artifact.
7. **What a real project adds** (short): real drift is gradual and mixed; audit budgets are negotiated;
   label definitions change (a category split); the monitoring job itself needs an owner and a test.

## Exercise (one `<!--mission-->`, CPU PyTorch, target under 20 s, run and logged)

Guided part: one script trains the chapter 2-style classifier, saves the artifact with its buffers, simulates
launch weeks with the two changes, fits the autoencoder on launch-week photos and prints weekly alarm and
recall, runs the feedback-loop retraining with and without the audit, and applies the gate. Walk-through and
expected output as printed.

Independent part, bounded (review.md §3, REVIEW-GUIDE step 3–5): a week-8 report the script prints but the
chapter does not interpret (alarm level, flag rate, reviewer precision, audit counts, a candidate's gate
numbers). The reader writes one decision: ship the candidate, keep the live model, or buy more audit labels,
with the evidence and one rejected option. "More evidence needed" is an acceptable answer if the numbers
support it. Discussion follows after an explicit pause; the surrounding prose must not give it away.

**Every result above is a design intent.** A prototype runs first; if a change does not split the two
questions as designed, the section reports what the run shows, not what the outline promised.

## Sources to read and receipt during research (locators from the 2026-09-13 audit, re-read before use)

- `huyen-dmls` pp. 316–319 (natural labels, feedback length, presumed negatives), 323–326 (degenerate
  feedback loops, randomisation, positional features), 331–336 (label-free monitoring, windows, label schema change).
- `geron-pytorch` pp. 130–132 (keep models and scores; custom code travels with the file; live monitoring
  via downstream metrics and raters), 727, 733 (autoencoder anomaly score and threshold).
- `burkov-mle` p. 77 and pp. 139–140 (model = code + data; the saved pipeline is the model).
- `kubeflow-cml` pp. 262, 283–284, 290 (skew validator; value and change thresholds against the last
  blessed model; push only a blessed model). `openshift-mlops` pp. 155, 171 (never overwrite; weighted canary).
- `ml-system-design` ch. 14 (delayed ground truth → drift detection). Courses: 5004958/08-01, 08-02
  (autoencoder; known traps: sigmoid output on standardised data, MSE ≈ 1 read as success — not repeated);
  4735368/18-02 (ONNX export); 6100015/04-18 (business metric arrives later), 06-08 (evaluation continues in
  production).

## Ideas taken from review.md, and what was not

Taken: the organizing question and decision map up front; two prediction pauses; a bounded independent
decision inside the one mission with the discussion after it; a phone-readable figure; synthetic caveats
consolidated into one place plus section 7. Not taken here: revisions to chapters 1–4 (a separate job).

## Author's decisions (2026-09-16)

The chapter's question becomes: **has quality changed enough to justify action, and how would you know when
labels arrive selectively?** Every section serves that judgment.

1. **Two changes, verified in the synthetic runs:** one harmless change that raises the alarm, and one
   consequential error that aggregate results hide. The prose reports what the runs show. A detected change
   never implies "retrain" by default; the possible actions include doing nothing, auditing more, adjusting
   the threshold, rolling back and retraining.
2. **One bounded reader decision in this chapter now**, whatever happens to chapters 1–4. It comes after the
   guided run, on a changed situation; "keep the live model" and "buy more audit labels first" are acceptable
   when the evidence supports them. Diagnostic hints and the worked judgment come after the attempt. The task
   must not be answerable by picking the lowest printed cost or by reacting to every drift alert.
3. **The random audit is priced** in chapter 2's units, with its own explicitly synthetic cost per audited
   listing (not the false-flag cost: auditing an unflagged listing is different work from reviewing a flag).
   The chapter states the audit budget and keeps its cost separate from the estimated cost of missed blades.
