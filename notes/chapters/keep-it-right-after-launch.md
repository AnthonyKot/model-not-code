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

## Story-map rework — 2026-09-22

**By:** Claude Fable 5.1 (main session), following `notes/chapters/STORY-MAP.md` §3 (chapter 5 card) and the seven per-chapter steps in `RESUME.md`. Status stays `published`; the URL does not change; nothing pushed.

**Shape now.** Story paragraph (the banner's alarm 0.005 → 0.150 with recall 0.742 against 0.763; the folding knives' silence with recall 0.763 → 0.491) and a two-sentence map; four beats with story-step headings, the bundle and the three clocks compressed into one and the alarm-investigation, feedback loop and shadow gate into one; a short "Where it stops"; two worked questions with folded answers; the lab paragraph; the bridge to chapter 6's story. One prediction pause, the card's: "Confirmed blades halved while the alarm stayed flat. Name two explanations, and say what the audit would count in weeks 6 to 10 under each", before the two-row table; the chapter's second pause (before the gate) became a plain sentence, since §2 allows one per chapter.

**Headings** (old → new): "What ships is more than the weights" + "Three clocks: what you can know, and when" → "What ships, and what you can know afterwards" · "A score for photos nobody has labelled" + "Ten weeks after launch" → "A score for photos nobody labelled, and the two alarms it gave" · "Fewer blades listed, or more blades missed?" → "Two explanations fit the reviewers, and the audit picks one" · "An alarm is a reason to look, not an instruction" + "Retraining learns the shop's labels, including the wrong ones" + "The candidate must beat the live model, on evidence both are judged by" → "An alarm is a reason to look, and a candidate has to prove itself" · "What a real project adds" → "Where it stops" · new: "Two questions to work", "The lab".

**Counts** (`scripts/reading-path.py`): reading path 2697; folds 916 (25.4%); page 3613; 7 `<details>`. Per section on the path: intro 245, what ships 324, a score for photos nobody labelled 612, two explanations fit the reviewers 398, an alarm is a reason to look 653, where it stops 135, two questions to work 106, the lab 171. Before: 4,881 on the path with only the reader case's two folds (9.7%) and the exercise on the page. The first draft landed at 2,834 on the path and 30.9% folded; five trimming passes.

**Fix requested by the author.** "The loss is chapter 1's mean squared error with the input as its own target", which chapter 1 never introduces (no chapter or lab mentions mean squared error before this one), now reads "`nn.MSELoss()` is the mean squared error above, with the input as its own target", pointing at the glossed formula e = (1/d) · Σ (x̂ − x)² two paragraphs earlier in the same fold.

**Moved.** The whole `## Exercise` section, verbatim (code, walk-through, expected output, the two things to try, the reader case with its hints and discussion folds), to `labs/keep-it-right-after-launch.md` with the `<!--mission-->` marker, under a two-line header naming the chapter. Diffed against the chapter's previous text: identical apart from one renamed reference, the hint's "Use the table from \"Fewer blades listed, or more blades missed?\"" → the new heading "Two explanations fit the reviewers, and the audit picks one". The lab's code block diffed against `workspace/keep-it-right-after-launch/exercise.py`: identical.

**Folded** (summary line → contents): "the same weights, a different function, and what `state_dict` does not save" → the two-row normaliser table (0.1192 / 0.0266), parameters vs buffers, `register_buffer`, plain attributes, never overwrite a release · "presumed negatives, late feedback, and what a complaint is worth" → presumed negatives, the one-to-three-month dispute window, complaints as biased labels · "the autoencoder by hand, and its loss" → the y = x example, the glossed error formula, the five-point table, the `nn.MSELoss()` line, and the mean-squared-error fix · "where the two chances come from" → the Poisson formula glossed, the two tails, the M̂ standard deviations (36, 17) · "the cost difference and its standard error, the baseline, and the canary" → the Δ / SE formula glossed, −414 ± 107, the last-passed baseline, "no worse to the last decimal" · two "Worked answer" folds.

**Cut or compressed** (nothing deleted without a line here): the timeline figure stays on the page; the clocks' prose → one paragraph (precision, selective labels with chapter 1's clicks and chapter 4's thumbs up, the audit and its price) · the spam-filter and recommender examples of selective labels → cut · the summary-statistics / two-sample-test paragraph → cut (receipts `kra-14`, `kra-15` stay) · `torch.load`'s `weights_only` behaviour → the code comment only (receipt `kra-41` stays) · the ONNX boundary sentence → cut (receipt `kra-08` stays) · "what only the simulation knows" → "can report" (voice lint) · the banner's displayed-category loss → one clause; "a separate question for whoever owns the displayed category" cut · the alarm-investigation outcomes → one sentence each · the feedback-loop section → one paragraph · the canary → one sentence in the Δ fold, then cut for length (receipt `kra-32` stays); "splits requests, not people" cut · "the chapter's check script scores 20,000 listings each way" kept · "In a real shop those labels come from a targeted review…" cut · "What a real project adds" → "Where it stops" (135 words): gradual changes, the audit as a budget with its agreement rate, label definitions, monitoring as versioned code; the complaints paragraph moved into the presumed-negatives fold.

**Added.** Story paragraph and map; worked question 1 (new numbers: the audit at 5% in weeks 6–10, 224 audited → expected 1.3 vs 7.5; a count of 6 → P(≥ 6 | 1.3) = 0.002, P(≤ 6 | 7.5) = 0.379; 120 missed with sd 49; 135 a week saved; receipt `kra-52`; `worked.py` section 5, `run-worked.log` regenerated with the earlier sections diffing clean); worked question 2 (the "retrain because the alarm is up" wrong turn, with 0.742 / 0.763 and 10 / 14 from the run); the lab paragraph; the bridge to chapter 6's three wrong answers.

**Checks.** `npm run build` green (8 chapters, 5 with labs); `npm run check`: site validation passed (28 pages), receipts 39 passed / 0 failed / 4 skipped / 2 unchecked (the EPUB and GitHub sources, as before) with the new `observed` row, paraphrase 0 twelve-word failures for the chapter and the lab; `npm run consistency`: 12 failing conditions, all archived essays (unchanged); voice lint clean on the chapter's prose (its one hit, `x_j` in the fold's formula gloss, is the subscript markup); the lab's hits ("decides", "knows") are in the walk-through and discussion moved verbatim. Read once with every fold closed: the argument survives. `node scripts/lab-check.mjs keep-it-right-after-launch`: lab page renders with the mission and button; clicking gives "1 of 8 exercises" and ticks chapter 5; the chapter page has 7 folds, no mission, one "Open the lab" block; no console errors.

**Exercise re-run.** `~/.gemini/antigravity-cli/scratch/myenv/bin/python` (PyTorch 2.14.0+cu130 on CPU) on the lab's code block, in a scratch directory for its `release.pt`: output byte-identical to `corpus/keep-it-right-after-launch/run.log`. Not re-run: the two variations and the reader case (their code did not move).

**Not done.** The author's read and the author's own attempt at the reader case; chapters 6–8; the §6 site copy.

**Cross-check of chapters 4–6 (2026-09-22, same session).** Two repairs in this chapter: the story paragraph said the banner's 0.742 against 0.763 was "on the same test" as chapter 2's 0.684, but those numbers come from the 20,000-listing check, and now say so; the bridge said "the writer refused an injected instruction", but in chapter 6 the loop refuses it and the writer's answer is still wrong, and now says so. Nothing else between chapters 4, 5 and 6, or in the chapters that cite them (2, 7, 8), needed a change.

### Cross-read repairs — 2026-09-22 (pair reviews 4+5 and 5+6)

Reviewers reported: "chapter 4's thumbs up" (chapter 4 has preference labels); the alarm paragraph promised about 1% of listings over the level and then reported the lab's 0.004–0.005 without comment; 130 and 127 for the same missed-blade estimate four lines apart; the bridge said chapter 6's first wrong answer was text the search "never found" and listed the chunk cut as a second answer, where chapter 6 has the chunk found at rank 5 and the cut as its cause. Applied: "preference labels"; one clause saying the lab's share is below 1% because a 99th percentile of 500 validation listings is about the fifth-highest surprise, a noisy level; "130 …, 127 with the exact counts of weeks 6 to 10 below"; the bridge rewritten to rank 5 below the three handed over, the chunk boundary as cause, and the refused injection. Not applied: the reviewer's optional link between "baseline", "live model" and chapter 4's "reference" (the quoted sentence was not found verbatim). No number changed. Path 2728 (28 over the guideline; folds 25.4%, at the ceiling).
