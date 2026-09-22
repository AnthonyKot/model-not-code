**Drafted by:** Claude Opus 5 (main session), 2026-09-14, from scratch, at the author's request before the review of chapters 1–3

# Chapter 4 — Train From Reward

- Plan: CHAPTER-PLAN rev 2 chapter 4. Corridor (return, γ, Q) → Monte Carlo vs Q-learning (bias, target
  network, replay) → policy gradient as cross-entropy weighted by the advantage → PPO ratio and clip (four-row
  table; what the clip does not do) → the writer as a policy (mapping table; bandit episode) → preference
  pairs, noisy labels, reward model loss −ln σ(r_w − r_l) = ch 1's two-way softmax cross-entropy → measured /
  learned / assumed table → PPO on the writer: reward hacking without KL; KL penalty (InstructGPT eq. 2 without
  the pretraining term); β both ends → clip and KL are different guards (no clip + 10 epochs; ten seeds) → what a
  real project adds (labels, evaluating the RM, judging the writer by people, value net / PPO-ptx, Lapan's freeze
  + LR/10 = ch 3, hosted DPO / RFT graders) → exercise.
- Length: file ~51k chars; prose without code/SVG ≈ 31.6k (≈ 26.5k before the exercise). Figures: corridor;
  two-stage preference pipeline (redrawn once to remove crossing lines; screenshot checked).
- Exercise `workspace/train-from-reward/exercise.py` (≈11 s, deterministic, run twice): output `corpus/train-from-reward/run.log`.
  Variations `run-variations.log`: β 0.05 (hacks, 5.30/−0.20), β 1.0 (0.86, KL 0.50), no clip at 4 epochs (fine),
  seeds 3–12 for no-KL / clip-10 / no-clip-10.
- Honest findings kept:
  - The prototype note said "without the clip, 10 epochs escape"; across ten seeds that is 5 long/low, 1 collapse
    (great value), 4 fine. Prose states the count, not the one seed.
  - The reward model is perfect (64/64) on held-out pairs whose hidden scores differ; 0.770 against labels is label noise.
  - The pairs contain 1 answer (of 1,200) with a repeated word — prose says so rather than "never".
  - The hack is designed into the word-sum reward model; prose labels it as designed.
- Corrections to research notes: Lapan's later label rounds did NOT fail to improve (v3, 300 labels, 1820) — not used.
  InstructGPT's 77.3% is held-out labelers among themselves, not vs training labelers. DPO "without a reward model"
  is not in the sources; prose only says the job takes chosen/rejected answers.
- Checks: 32 receipts passed, 2 unchecked (papers); paraphrase 0/0 (one 12-word run from 4635836 13-01 reworded
  into the formula A = r + γ·V(s′) − V(s)). Build + site check green.
- Not done: review lanes; the author's read. Prototype log removed from corpus (superseded by run.log).

## Review decisions (2026-09-14)

Codex actionable review `checks/reviews/train-from-reward/codex-actionable.md` (9 proposals), all applied:
(1) demonstrations are 48, not 39 (my count error), and the exercise trains the writer from random weights — pretraining
is omitted and now said so; (2) measured returns cannot reuse old episodes as they are, PPO reuses one batch via the
ratio, no replay memory; (3) the clip removes incentive, no hard bound (three sentences); (4) corridor output relabelled
"mean episode length" (20-step cap; 7 of 16 first episodes reach the end, replayed), exercise rerun twice, identical;
(5) labeller agreement is not a ceiling; (6) bootstrapping samples a reward and a next state; (7) "eighteen-fold" on an
arbitrary-origin score replaced by the four numbers; (8) timing kept, now logged (10.7 s) and repeatability re-verified;
(9) source narration removed ("documented pipeline", "its authors").
- Gemini second round (proposal2.md, 2026-09-14): no proposals; it re-verified every run.log number and the codex fixes.


## Small learning-design fixes — 2026-09-16

Replaced the ambiguous human/model “learner” wording with the writer being tuned and the policy optimization. Clarified that held-out pairs are sampled answers to the same three products, not new prompts, and answers can recur. No executable code or numeric output changed.

Authorized targeted fixes only. No independent task added and no optional-section restructuring. Chapter 5 work was not touched. Build/check and focused desktop/mobile navigation, completion and layout checks passed; four existing eight-word paraphrase warnings remain in the archived augmentation essay. Changes are local, uncommitted and unpublished. Earlier review reports remain historical evidence.

## Story-map rework — 2026-09-22

**By:** Claude Fable 5.1 (main session), following `notes/chapters/STORY-MAP.md` §3 (chapter 4 card) and the seven per-chapter steps in `RESUME.md`. Status stays `published`; the URL does not change; nothing pushed.

**Shape now.** Story paragraph (the writer tuned on 600 comparisons; the scorer's mean 0.34 → 6.12 while the hidden score fell 0.33 → −0.20; the typical answer *in stock stock stock stock stock stock stock*) and a two-sentence map; five beats with story-step headings; a short "Where it stops"; two worked questions with folded answers; the lab paragraph; the bridge to chapter 5's story. The writer is named in the first sentence, as the card requires, and the corridor is one beat of 443 words on the path. Prediction pause is the review's own, placed before the first run table: "If the reward model's score rises round after round, what additional observation would make that improvement convincing?"

**Headings** (old → new): "No label, only a reward at the end" + "Measure the return, or estimate it from the next cell" → "What a score at the end can teach" · "Learn the action, not its worth" + "Reuse the batch, but not too far" + "The answer writer is a policy" → "The writer is a policy, one token at a time" · "Where people's preferences enter" → "Where the people's preferences become the score" · "Tune the writer, and watch it game the reward" (kept) · "The clip and the penalty are different guards" → "Two guards, and why one of them was not enough" · "What a real project adds" → "Where it stops" · new: "Two questions to work", "The lab".

**Counts** (`scripts/reading-path.py`): reading path 2,696; folds 902 (25.1%); page 3,598; six `<details>`. Per section on the path: intro 230, beat 1 443, beat 2 378, beat 3 387, beat 4 515, beat 5 228, where it stops 192, questions 119, lab + bridge 151. Before: 5,351 words on the page with no folds and the exercise on the page. The first draft landed at 3,545 on the path and 29.6% folded; eight trimming passes, as §7 warned. The page total is about 200 over §2's 3,400, as for chapter 3, because the card keeps five tables on the path (the Q-learning table, the corridor/writer mapping, the measured/learned/assumed table, and three run tables).

**Moved.** The whole `## Exercise` section, verbatim (code, walk-through, expected output, the two things to try), to `labs/train-from-reward.md` with the `<!--mission-->` marker, under a two-line header naming the chapter. Diffed against the chapter's previous text: identical. The lab's code block diffed against `workspace/train-from-reward/exercise.py`: identical. No "section N" or "above" phrases needed renaming; the walk-through's "the chapter's table" (the clip rows) and "the chapter's loss" still resolve, the table now inside a fold.

**Folded** (summary line → contents): "the two update rules, and what changes when the table becomes a network" → the Monte Carlo and Q-learning update formulas with α, glossed; bootstrapping; target network and replay memory in one sentence; the actor-critic advantage r + γ·V(s′) − V(s) · "the ratio, the clipped objective and the four samples that show what the clip does" → the ratio and clipped-objective formulas glossed, `ppo_loss`, the four-row clip table and its reading · "the preference loss, one worked pair, and where the zero goes" → −ln σ(r_w − r_l) glossed, the two-way softmax equivalence, the 0.5/1.0 pair (0.3775, 0.9741, ∓0.6225), the arbitrary zero and the lab's bias · "the penalised reward, term by term" → the KL-penalty formula glossed (the page states the guard in prose, as the card's "one-sentence statement of each guard") · two "Worked answer" folds.

**Cut or compressed** (nothing deleted without a line here): the policy-gradient step by hand (scores (0, 0), A = ±1 → P(right) 0.731 / 0.269): cut; receipt `tfr-31` keeps it and the lab does not print it · the bias-vs-variance discussion after the Q-learning table → two sentences on the page · the target-network and replay-memory paragraph → one sentence inside the update fold (the 2026-09-16 proposal) · "the writer collects its answers at temperature 1, so the stored probabilities are the policy's own" → cut · the 4-to-9 ranking sentence and the 77% held-out-labeller figure → cut (the 73% stays; chapter 8 carries its own 72.6 ± 1.5) · the σ(2 × gap) labelling formula and the 88% → cut from the page; the page says the label probability rises with the hidden-score gap and ties are a coin flip · "A held-out agreement with noisy labels measures the model and the labels together, which is chapter 2's warning" → now worked question 2 · the reward model's "common design" (start from the fine-tuned model with a scalar head) → cut; receipt `tfr-25` stays · "This failure was built in… certain to be exploitable" → one clause · the ten-seed comparison → three sentences on the page in beat 5, unguarded and clipped and unclipped together · "What a real project adds" → "Where it stops", 192 words: labels, reward-model evaluation, people judge the writer, hosted preference tuning and graders; the value-network / pretraining-mix / game-agent paragraph (`tfr-21`, `tfr-27`) cut · the mapping-table sentence "There is no next prompt whose value needs estimating" → one clause at the end of beat 1.

**Added.** Story paragraph and map; the prediction pause; on the page, the sample answer scored by hand from the printed weights (0.24 + 7 × 0.84 = 6.12; hidden +1 − 4 × 0.3 = −0.20); worked question 1 (new numbers: *in stock ships today* 2.34 vs *stock stock stock* 2.52 on the reward model, hidden 1.0 vs 0; receipt `tfr-36`; `workspace/train-from-reward/worked.py` new, `corpus/train-from-reward/run-worked.log` new; a probe with the unrounded weights agrees at 2.339 / 2.521 / 6.121); worked question 2 (a perfect ranker's expected agreement 64 × 0.904 + 36 × 0.5 = 75.9, about 0.76, so the lab's 0.770 is the labels' ceiling; receipt `tfr-37`; the "wrong turn" is reading agreement with noisy labels as the model's error); the lab paragraph with the numbers the lab prints; the bridge to chapter 5 ("more than a third of its recall": 0.763 → 0.491 is 0.272 / 0.763 = 36%). Voice: "Nothing in that loop knows it was written for a corridor" dropped.

**Checks.** `npm run build` green (8 chapters, 4 with labs); `npm run check`: site validation passed (27 pages), receipts pass with the two new `observed` rows, paraphrase 0 twelve-word failures for the chapter and the lab (the 4 eight-word warnings are the archived augmentation essay's, pre-existing); `npm run consistency`: 12 failing conditions, all in the archived essays (unchanged); voice lint clean on the chapter's prose and the lab (its only hits are `ppo_loss` inside the SVG's text nodes). Read once with every fold closed: the argument survives (story → return and the Q-learning table → the writer as a policy and the clip → the hidden scorer, the reward model and the assumed row → the pause, the run, the by-hand score → the reference penalty and the β rows → no clip, the seeds → limits → questions → lab → bridge). `node scripts/lab-check.mjs train-from-reward`: lab page renders with the mission and button; clicking gives "1 of 8 exercises" and ticks chapter 4 in the contents; the chapter page has 6 folds, no mission, one "Open the lab" block; no console errors.

**Exercise re-run.** `~/.gemini/antigravity-cli/scratch/myenv/bin/python` (PyTorch 2.14.0+cu130 on CPU) on the lab's code block: output byte-identical to `corpus/train-from-reward/run.log`. Not re-run: the two variations (their code did not move).

**Not done.** The author's read; chapters 5–8; `about.md`, `README.md`, `CONTEXT.md` §1 and the home-page copy (after all eight).
