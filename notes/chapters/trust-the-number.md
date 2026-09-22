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
  the release record now reports listings. Closed 2026-09-17: the listing step was added to the exercise (2026-09-16) and the per-photo rows stay as the guided contrast; no full per-listing rebuild.
- (2) Winner's curse: exact binomial numbers (0.0932, 0.6909, 0.9031) and the independence caveat; table 69.6% → 69.1%.
- (3) Class-count table. (4) "one-loading-process". (5) Rotation advice conditional on real uploads.
- (6) Chapter 1's forward link to chapter 2 fixed (both sentences). (7) Balanced malaria dataset sentence (04-03, ttn-38).
- (8) "every layer" overclaim removed. (9) Runtime kept and now logged in run.log's header (11.7 s).
- Gemini second round (`checks/reviews/trust-the-number/proposal2.md`, 2 proposals), both applied: the unlogged third
  "thing to try" (workers past free cores) removed; release-record column renamed "Measured value, synthetic" because it
  now mixes the exercise's photo numbers with the per-listing variation.


## Small learning-design fixes — 2026-09-16

Added the listing-level stage to the existing mission and matching workspace script. Average four softmax vectors per listing; choose threshold on validation listings before test scoring; print listing accuracy, recall, false flags, missed blades, cost, standard error and caught/total blades. Fresh run with PyTorch 2.14.0+cpu and default eight CPU threads reproduced the prior photo results and listing release record: threshold 0.05, accuracy 0.946, recall 0.684 (13/19), 69 false flags, 6 misses, cost 258 vs 310, SE 0.010. Updated expected output from that run and clarified the per-photo comparison row. The prior canonical log is preserved as corpus/trust-the-number/run-before-listing-step-2026-09-16.log. A one-thread sandbox attempt produced slightly different photo counts and then blocked on DataLoader sockets; the complete approved run used the original default eight-thread configuration. The expected-output note now acknowledges environment/thread effects.

Authorized targeted fixes only. No independent task added and no optional-section restructuring. Chapter 5 work was not touched. Build/check and focused desktop/mobile navigation, completion and layout checks passed; four existing eight-word paraphrase warnings remain in the archived augmentation essay. Changes are local, uncommitted and unpublished. Earlier review reports remain historical evidence.

## Loader detail made optional (2026-09-16, author's decision)

The section "The GPU waits on the JPEG decoder" stays in place with its motivation paragraph plus a two-sentence
takeaway (idle accelerator → more loading processes, `DataLoader(num_workers=…)`; measure both sides before buying).
The step formula, the worked table and the `DataLoader` settings are in a collapsed "Optional" block. Exercise title
now "…then score the release"; Part 6 marked optional. No code, number or expected output changed; exercise not rerun.
Chapters 1 and 4 left structurally unchanged, as decided. Phone-width check: block renders closed and open, table
scrolls, no page overflow.

## Story-map rework — 2026-09-22

**By:** Claude Fable 5.1 (main session), on the author's "Ok, let's do ch2", following `notes/chapters/STORY-MAP.md` §3 (chapter 2 card) and §5. Status stays `published`; not pushed.

**Shape now.** Story paragraph (the 92.4% the shop was ready to ship, "lying three times over": the split, the rare row, who decides) and a map naming the three lies in order; three beats, each opening as the next way the same number lied ("The split is fixed and the number is honest about new products. It is still silent about…", "The rare row now has a number of its own, and it is low. The third lie is about who chose it."); the pause before beat 2 (the card's question); the release record as the close; "Synthetic photos cannot tell you four things" as where it stops; two worked questions; the lab paragraph; the bridge to chapter 3's frozen backbone.

**Headings** (old → new): "What a held-out accuracy claims" + "Split by product, not by photo" + "Every look at the test set spends it" → "The first lie: the held-out photos were not new" (the three splits and the standard error stay on the page as the frame; the winner's curse is a fold) · "The rare category: right 95% of the time by never flagging" + "Augmentation is a claim about your labels" → "The second lie: right 94% of the time by never flagging" (augmentation is a fold) · "The model outputs a score; the shop chooses the threshold" → "The third lie: the model was deciding who gets checked" · "The GPU waits on the JPEG decoder" → moved to the lab as its setup section · "What the release evaluation reports" kept · new: "Two questions to work", "The lab".

**Counts** (same counter as chapters 3 and 1): reading path 2,431; folds 794 (24.6%); page 3,225; six `<details>`. Per section on the path: intro ≈ 225, lie 1 ≈ 500, lie 2 ≈ 450, lie 3 ≈ 710, release record ≈ 215, questions 97, lab + bridge ≈ 145. Within §2's chapter-2 allowance (2,900 path, 3,800 page) with room to spare; the first draft folded the standard error and the precision paragraph too and came out at 35% folded, so both went back on the page.

**Moved.** `## Exercise` verbatim to `labs/trust-the-number.md` (diffed: identical; code identical to `workspace/trust-the-number/exercise.py`). The input-pipeline section (the L + C paragraphs and the "forecast the step time" fold) moved verbatim into the lab ahead of the mission marker under "Before you run it: the GPU waits on the JPEG decoder", as STORY-MAP §4 says for chapter 2.

**Folded** (summary → contents): "every look at the validation set spends it, by the numbers" → the winner's-curse table and the binomial numbers, the save-best remark, the second-validation-set rule and the public-benchmark sentence · "the derivative of L(p)" → 950/(1 − p) − 50/p and the general n₁/(n₀ + n₁) · "the category weights the lab uses" → the four-row weight table and the weighted-mean caveat · "what a flipped photo claims about its label" → the (x, y) → (T(x), y) formula, the mirrored-blade result (0.878 unchanged, recall 0.266 → 0.056, lamps 26 → 88), the four rules · two "Worked answer" folds.

**Kept on the page as the card lists.** 1 − 0.2³ = 0.992 (the derivation is one line, so no separate fold); 0.938; L(p), p = 0.05 with the 47.5-each-way pull balance; the ten-listing table cut from five threshold rows to the four that change the decision (0.5, 0.1, 0.03, 0.01; the 0.2 row went); the validation sweep's 0.02 and the 12.0% reason; the test and listing results; the release record.

**Cut or compressed.** The transform-by-label table (four transforms × three attributes) and the rotation/mirrored-print sentences · "Settings scored on the same photos share some of their errors…" and "Settings of unequal quality do get sorted…" · the malaria sentence shortened to "a public dataset of cell images" · the column-leak paragraph halved · "Averaging is itself a choice, to be compared on validation with alternatives such as taking the highest blade score" dropped · the release-record cells shortened ("0.886 per photo" dropped from the accuracy row).

**Added.** Story paragraph, map, pause, the transition sentences; worked question 1 (980 non-blades and 20 blades: best constant 0.02, pulls 19.6 each way, `pos_weight` 49, pulls 490 each way; receipt `ttn-39`, `worked.py` section 4b, `run-worked.log` regenerated with earlier sections unchanged); worked question 2 (re-sweeping the threshold on test: the wrong turn is spending the test set); the lab paragraph; the bridge. Voice: "the unit the shop decides on" → "the unit the shop acts on".

**Checks.** Build green (8 chapters, 3 with labs); site validation 26 pages; receipts 37 passed, 0 failed, 2 unchecked (URLs, as before); paraphrase 0 failures for chapter and lab; voice lint clean on the chapter (the lab's setup section keeps the original "decides how many honest comparisons" verbatim); headless-browser check: the lab button ticks chapter 2 in the contents and the progress count, no console errors. Read once with every fold closed: the argument survives. Exercise re-run from the lab's code block with the interpreter noted in chapter 3's log: identical to `corpus/trust-the-number/run.log` on every line except the four `num_workers` timings (90.3 / 70.0 / 36.3 / 23.6 ms against 87.2 / 67.8 / 33.9 / 22.2), which the lab's expected-result note already says vary between runs. Not re-run: the two variations.

**Not done.** The author's read; chapters 4–8.
