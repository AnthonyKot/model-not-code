**Drafted by:** Claude Opus 5 (main session), 2026-09-13, from scratch

# Chapter 2 — Trust the Number Before You Ship the Classifier

- Plan: CHAPTER-PLAN rev 2 chapter 2 (essays 5–8 ground + Part III leakage, threshold, benchmark). All six
  plan sections present, in this order: SE and the three splits; split by product (+ feature not
  available at prediction time); winner's curse (+ public benchmark as a claim, contamination);
  rare category (best constant, class weight); threshold as cost (+ precision vs prevalence, ROC/PR);
  augmentation as a claim; input pipeline; the release record table.
- Project device: the age-check flag on the rare "blade" category turns imbalance and the threshold
  into one shop decision. Synthetic photos: per-product border ("look") = the leakage trap; a 3x3
  shape = the category; blade and lamp shapes are mirror images, so a horizontal flip changes the
  label (augmentation section).
- Length: file ~36k chars; prose without code/figure ≈ 24.6k chars, ≈ 22.4k without tables. Within
  the 20–35k range, lower half.
- Figure: split by photo vs split by product (12 photos, 3 products).
- Verification: `corpus/trust-the-number/run-worked.log` (SE, sibling probability, winner's curse
  simulation, best constant, ten-listing threshold sweep, precision vs prevalence, pipeline table);
  `run.log` (exercise verbatim; decisions deterministic, timings vary by a few ms);
  `run-variations.log` (flip: blade recall 0.266 -> 0.056, blades as lamps 26 -> 88, accuracy unchanged
  0.878; calibration bins: 12.0% blades among scores 0.02–0.091; MISS_COST 5 -> threshold 0.2).
- Tuning history (honest): the synthetic generator was tuned in workspace/trust-the-number/proto.py and
  probe.py until the photo split and product split differed visibly and blades were learnable at all;
  first shapes overlapped (lamp contained the blade diagonal), fixed by choosing low-overlap shapes.
- Corrections before publishing: credit line had the wrong authors for Data Science: The Hard Parts
  (written from memory; PDF metadata says Daniel Vaughan) — fixed; unsourced "usually"/"often"/"for
  years" softened; the third "thing to try" no longer asserts an unmeasured result.
- Checks: receipts 32 passed, 2 unchecked (URLs); paraphrase 0/0.
- Not done: review lanes; the author's read (author asked to review chapters 1 and 2 together).

## Review decisions (2026-09-14)

Codex actionable review `checks/reviews/trust-the-number/codex-actionable.md` (9 proposals), applied at the author's
request ("let's apply improvements"):
- (1) Unit of decision: NOT a full rebuild of the exercise per listing. The photo-level walkthrough stays with its unit
  named ("73 photos", "52 blade photos"); a new paragraph measures per-listing scoring (mean of four softmax vectors,
  threshold on validation listings: 0.946, 13/19 blades, cost 258 vs 310; `listing_check.py`, run-variations.log), and
  the release record now reports listings. Open: the author may still want the whole exercise per listing.
- (2) Winner's curse: exact binomial numbers (0.0932, 0.6909, 0.9031) and the independence caveat; table 69.6% → 69.1%.
- (3) Class-count table. (4) "one-loading-process". (5) Rotation advice conditional on real uploads.
- (6) Chapter 1's forward link to chapter 2 fixed (both sentences). (7) Balanced malaria dataset sentence (04-03, ttn-38).
- (8) "every layer" overclaim removed. (9) Runtime kept and now logged in run.log's header (11.7 s).
- Gemini second round (`checks/reviews/trust-the-number/proposal2.md`, 2 proposals), both applied: the unlogged third
  "thing to try" (workers past free cores) removed; release-record column renamed "Measured value, synthetic" because it
  now mixes the exercise's photo numbers with the per-listing variation.
