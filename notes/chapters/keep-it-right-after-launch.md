**Drafted by:** Claude Opus 5 (main session), 2026-09-16, from scratch, after the author approved the outline with three decisions (`keep-it-right-after-launch-outline.md`)

# Chapter 5 — Keep It Right After Launch

- Question: has quality changed enough to justify action, and how would you know when labels arrive selectively?
- Sections: artifact bundle (normaliser table; `state_dict` buffers; `torch.load` weights_only default; ONNX boundary) →
  three clocks (vertical SVG; selective labels; presumed negatives; priced audit and M̂ = (F/A)·U) → autoencoder
  (hand table on y = x; 99th-percentile trap) → ten weeks (banner week 3, folding knives week 6) → two explanations
  tested with audit counts (Poisson) → alarm is not an instruction (response list; threshold does not fix knives) →
  retraining on the shop's labels (feedback loop) → shadow gate (Δ exact on disagreements; margin and floor; canary)
  → what a real project adds → exercise → reader decision (report table, hints and discussion in separate `<details>`).
- Length: file ~45k chars; prose without code/SVG ≈ 31.9k (≈ 22.4k before the exercise, the rest is the exercise text and the reader case). One figure.
- Checks (scratch copy of the repo with status set to published, because `docs/` in the working tree carries other
  sessions' uncommitted changes): build and site check green; receipts 38 passed, 0 failed, 4 skipped (EPUB sections),
  2 unchecked (PyTorch source URLs); paraphrase 0/0. Phone width 390 px: no horizontal overflow, figure legible, one mission.

## Evidence

- `workspace/keep-it-right-after-launch/exercise.py` → `corpus/.../run.log` (7.6 s, two identical runs).
- `variations.py` → `run-variations.log` (audit 3%; true labels for all launch weeks).
- `checks.py` → `run-checks.log` (20,000 listings each: no change / banner / folding knives / both, at 0.05 and 0.02;
  torch.load and state_dict facts).
- `reader_case.py` → `reader-case.log` (shop-visible report, discussion numbers, simulation truth; seed 5 chosen after
  seeds 5–7 all showed the same pattern: audit finds 3, 5 and 2 in weeks 6–10).
- `worked.py` → `run-worked.log` (normaliser, autoencoder table, audit Poisson sd).
- Prototypes `proto1`–`proto9.py` and `sim.py` are design history only; no chapter number comes from them.
- Sources: `sources.md` and `receipts-draft.tsv` by a research subagent (locators re-checked by hand for Burkov 249
  and 260, Géron 133, Kubeflow 283–284, ML System Design §14.4.4). Final receipts in `corpus/.../receipts.tsv`, 44 rows.

## What the runs changed from the outline (reported, not hidden)

- The outline's "harmless" change: every candidate the model tolerated perfectly also left the alarm quiet. The banner
  was kept because at 20,000 listings it leaves the blade flag's cost unchanged or lower (456 vs 476 per 1,000) and
  recall close (0.742 vs 0.763), while costing 1.8 points of displayed-category accuracy; the prose says so.
- A 10% audit estimates misses but gives far too few labels to fix them (3 folding knives audited over 8 weeks in a
  prototype). Section 5's fix is labels for the knives (variation 2), not "the audit repairs training".
- Retraining on the shop's labels lowers cost (more photos, banner included) yet catches fewer folding knives (10 vs 14
  of 62). The chapter shows both instead of claiming the loop makes the model worse overall.
- Chapter 2's model is data-limited in this world: any retraining on ten more weeks helps (prototypes 7–9). A
  reader decision about "retrain or not" would therefore be answered by the lowest cost, which the author ruled out; the
  reader's case has no candidate model and turns on the audit counts and a threshold proposal instead.
- Threshold 0.02 does not rescue the folding knives (cost 718 → 770 per 1,000).

## Source traps (kept out of the prose)

Course 5004958/08-02: MSE ≈ 1 on standardised data read as success, target is the time signal, "best" model is the
first fold. Course 4735368/18-02: deploy preprocessing divides by 225 and skips training normalisation. Burkov p. 234:
5% × 2% read as a 0.1% chance of discovery. OpenShift p. 173: 77% + 33%. Kubeflow −1e-10 change threshold has no
noise margin (the chapter states the rule, not the source). Huyen p. 332 misstates significance.

## Owed

- The author's read. Codex review not run (author's remaining codex run unused).
- Optional blind solvability check of the reader case (REVIEW-GUIDE) not run.
- Published 2026-09-16 (build and check in the working tree after chapters 1–4's fixes were committed).

## Review decisions (2026-09-16)

Gemini actionable review (first round; the script's second-round note did not apply, so the same prompt was run with a
first-review scope note), `checks/reviews/keep-it-right-after-launch/proposal1-gemini.md`, 2 proposals, both applied:
(1) "the live model decided… is taught" → flags determined which listings were checked; fitting the labels pulls the
knife scores towards cable (CONTEXT §4 anthropomorphism); (2) "selective label" redefined as a label whose existence
depends on the model's decision, since the spam-filter example has labels for items the model passed, not flagged.
Reader case: no disclosure found. Added by the main session at the same time: one sentence naming chapter 1's click log
and chapter 4's thumbs up as selective labels, keeping chapter 4's closing promise. No number changed; exercise not rerun.

## Blind solver and task tightening (2026-09-16)

Haiku solved the packet without hints: correct action, wrong diagnosis (see `notes/reviews/solver-05-2026-09-16/`).
Question 1 now requires naming the supported explanation and its strength; the last column's purpose is stated; the
success criteria reject an unsupported diagnosis. Discussion unchanged; no number changed. The author's own attempt
is still owed and is the evidence about human reading.
