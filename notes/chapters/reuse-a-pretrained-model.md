**Drafted by:** Claude Opus 5 (main session), 2026-09-13, from scratch

# Chapter 3 — Reuse a Pretrained Model

- Plan: CHAPTER-PLAN rev 2 chapter 3. Freeze/thaw on the photo classifier (new supplier's garden range,
  shifted features); the BatchNorm buffer trap with three freezes; thaw with parameter groups; then the
  shop's answer writer: memory of a full fine-tune, LoRA on chapter 1's q/k/v/o projections, alpha/r
  stated precisely as a size-holding division like sqrt(d_k), not a temperature; Llama 3.2 3B adapter
  count; QLoRA pointer to ch 7; limits (rank ceiling; an attached adapter does not protect old behaviour,
  only the base file); a choosing table.
- Length: file ~36k chars; prose without code ≈ 22k (≈ 20k without tables). Figures: LoRA two-path diagram.
- New worked numbers: BatchNorm unit (mean 1.0, sd 0.6, input 1.6) checked against torch BatchNorm1d;
  rank-1 diff A = [2, -1, 0, 1], B = [1, 0, 3, -1]^T; memory table 12/12/12/12 = 48 GB. Reported model
  facts (13 GB, 3072/1024 widths, 73.4 MB, 2.2 GB, 33% -> 72.2%, 320 images < 50% vs 71.3%) re-receipted.
- Exercise: freezes, thaw, LoRA r=1 and r=4, unplug, merge, full fine-tune; deterministic (run twice);
  variations run (thaw at head's rate; q,v only). Honest findings kept: in this run moving BN statistics
  did NOT help the new task (differs from the archived essay's run); the attached adapter hurt the old
  text more than the full fine-tune did.
- Checks: 23 receipts passed, 3 unchecked (paper); paraphrase 0/0.
- Not done: review lanes; the author's read.

## Review decisions (2026-09-14)

Codex actionable review `checks/reviews/reuse-a-pretrained-model/codex-actionable.md` (12 proposals), applied at the
author's request: (1) LoRA memory row; (2) BatchNorm worked table's assumptions (γ = 1, β = 0, unbiased running
variance, ε left out; rpm-28); (3) α/r stated as reducing retuning, not guaranteeing equal size; α = 2r a rule to
validate (rpm-29); (4) new section "What the synthetic run leaves out"; (5) BatchNorm in eval() as default, re-estimation
a validated candidate; (6) QLoRA quantises large linear layers, embedding kept (rpm-27); (7) try-its tell the reader to
change the printed labels; (8) running_mean[0] is a post-Linear feature; (9) Adam receipts → Géron pp. 424–425;
(10) lora_dropout removed from the PEFT snippet; (11) Keras 0.99 momentum clause removed, the receipted trainable=False
coupling kept and dated in the catalog caution; (12) runtime kept, measured and logged (5.97 s → "about six seconds").
Also from the chapter 1 review: "Which W? A real attention layer has four" (chapter 1 builds three).
- Gemini second round (proposal2.md): 1 proposal, applied — the exercise docstring no longer says chapter 1's block had four projections (docstring only; output unchanged).


## Small learning-design fixes — 2026-09-16

Labelled writer losses as fit/interference on the adaptation and pretraining strings, distinguishing them from the photo validation examples. No executable code or numeric output changed.

Authorized targeted fixes only. No independent task added and no optional-section restructuring. Chapter 5 work was not touched. Build/check and focused desktop/mobile navigation, completion and layout checks passed; four existing eight-word paraphrase warnings remain in the archived augmentation essay. Changes are local, uncommitted and unpublished. Earlier review reports remain historical evidence.

## Story-map rework, pilot chapter — 2026-09-22

**By:** Claude Fable 5.1 (main session), following `notes/chapters/STORY-MAP.md` §3 (chapter 3 card) and §5. Status stays `published`; the URL does not change; nothing pushed. The author reads this before any other chapter moves.

**Shape now.** Story paragraph (the frozen backbone whose output slides 1.600 → 1.004 while the old head falls 0.981 → 0.952) and a two-sentence map; four beats with story-step headings; a short "Where it stops"; two worked questions with folded answers; the lab paragraph; the bridge to chapter 4. Prediction pause is the review's own: "Every weight is frozen. Must the output for a fixed input stay the same? Name the condition your answer depends on", placed before the six-row table.

**Headings** (old → new): "What a pretrained backbone gives you" + "Stage one: freeze the backbone, train a new head" → "What the checkpoint hands you, and what the freeze promises" · "The state that `requires_grad` does not freeze" → "Why the frozen backbone still moved" · "Stage two: thaw with a smaller learning rate" + "The same problem at a language model's size" + "Choosing how much of the model to change" → "How much of the model to let change" (the choice table is now the frame, second, as the card says) · "LoRA: a low-rank diff beside the attention matrices" → "Where the answer writer's change goes" · "What the rank and the freeze cannot do" + "What the synthetic run leaves out" → "Where it stops" · new: "Two questions to work", "The lab".

**Counts** (words in prose and table cells; code blocks, the SVG and the sources line excluded; `scratch` counter): reading path 2,698; folds 900 (25.0%); page 3,598; seven `<details>`. Per section on the path: intro 258, beat 1 ≈ 260, beat 2 ≈ 640, beat 3 ≈ 470, beat 4 ≈ 550, where it stops ≈ 215, questions 129, lab + bridge ≈ 170. The reading path meets §6 (2,000–2,700); the page total is above §2's 2,400–3,400 target by about 200 words — the six-row table, the choice table, the rank-1 table and the A/B/C list were all kept on the page as the card requires, and the folds were cut to the minimum that still glosses every formula. If the author wants the total down, the candidates are the Keras sentence, the "Which W?" paragraph, and the PEFT snippet inside the size fold.

**Moved.** The whole `## Exercise` section, verbatim (code, walk-through, expected output, the two things to try), to `labs/reuse-a-pretrained-model.md` with the `<!--mission-->` marker, under a two-line header naming the chapter. Diffed against the chapter's previous text: identical. The lab's code block diffed against `workspace/reuse-a-pretrained-model/exercise.py`: identical.

**Folded** (summary line → contents): "the update formulas, the unbiased variance and the closed form of the table" → both BatchNorm formulas with glosses, ε, momentum, m/(m − 1), 1 − 0.9ⁿ and 0.36 + 0.64 × 0.9ⁿ · "how much the smaller rate matters, and the BatchNorm layers during the thaw" → 33% / 72.2%, BN in `eval()` through the thaw, re-estimation as a validated candidate · "the 48 GB, row by row, and what an adapter removes" → the memory table, Adam's two averages, which rows the adapter removes · "what α/r does and does not do" → the α paragraph (retuning, not a temperature, α = 16 at rank 8 vs 64, α = 2r as a rule to validate, check the codebase's convention) · "the adapter's size for a three-billion-weight model, with the PEFT and QLoRA settings" → the Llama 3.2 table, 73.4 MB, 9,437,184 vs 196,608, the PEFT snippet (with the `q_proj`… names), QLoRA · two "Worked answer" folds.

**Cut or compressed** (nothing deleted without a line here): the benchmark-score sentence in beat 1 (chapter 2 already states the rule; the evaluation rule stays in "Where it stops") · the cached-features paragraph → one sentence at the end of beat 1 · the Keras paragraph → one sentence after the A/B/C numbers · "Four properties follow" → two on the page (starts at the pretrained model; separate file with unplug/merge numbers) and the memory property inside the 48 GB fold · "each with its own few megabytes" and "a sixth of the model" dropped · the `q_proj`/`k_proj`/`v_proj`/`o_proj` names moved into the size fold; the page names the four matrices in chapter 1's words · "Whether the statistics *should* follow the new photos…" compressed to two sentences · "What the synthetic run leaves out" merged into "Where it stops" and shortened to the split-by-product/validation/test-once rule plus peak memory; the versioned-adapter-configuration sentence dropped · "Every row ends in the same place as chapter 2" kept once, in "Where it stops" · the torchvision, freeze and parameter-group snippets kept; the PEFT snippet folded.

**Added.** Story paragraph and map; the prediction pause; worked question 1 (new numbers: batches with mean 0.4 and variance 0.25 under freeze A → running mean 0.398, variance 0.254, output for 1.6 = 2.386, towards 2.4; receipt `rpm-30`, `workspace/reuse-a-pretrained-model/worked.py` extended and `run-worked.log` regenerated, torch BatchNorm1d agrees at 0.3979 / 0.2539 / 2.3856); worked question 2 (the "protected" wrong turn on 12.50 vs 5.44; all numbers from the run); the lab paragraph with the numbers the lab prints; the bridge to chapter 4's story. Voice: "the shop wants" → "the shop needs" (twice); "the number that decides" → "the number that counts" (then cut).

**Build change** (`site/build.mjs`, `site/check.mjs`, `checks/paraphrase.mjs`, `site/styles.css`, `site/app.js`): `labs/<slug>.md` → `docs/labs/<slug>.html` with the chapter shell, a "Lab · Chapter N" kicker linking back, the mission wrapper and the completion button keyed to the chapter slug (progress count unchanged for readers who already marked it); a chapter with a lab gets an "Open the lab" block in place of the button and no mission on its own page; `labs/` links resolve to `.html`; the site check requires exactly one mission and the completion action on the lab page, none on the chapter, and links both ways; the paraphrase check scans each lab against its chapter's courses; `.prose details` fold style (summary in the accent colour, closed by default, opened in print by CSS and a `beforeprint` handler, as in book1).

**Checks.** `npm run build` green (8 chapters, 1 with a lab); `npm run check`: site validation passed (24 pages), receipts 25 passed / 0 failed / 5 unchecked (paper and URL sources, as before), paraphrase 0 twelve-word failures for the chapter and the lab (the 4 eight-word warnings are the archived augmentation essay's, pre-existing); `npm run consistency`: 12 failing conditions, all in the archived essays (it scans `essays/` only; unchanged by this work); voice lint clean on chapter and lab. Read once with every fold closed: the argument survives (story → promise → the pause and the table → A/B/C with numbers → the choice table as frame → thaw numbers → memory → the formula, the rank-1 diff and the lab's losses → limits → questions → lab → bridge).

**Exercise re-run.** The scratch venv named in `RESUME.md` no longer exists on this machine; the only PyTorch 2.14.0 interpreter is `~/.gemini/antigravity-cli/scratch/myenv/bin/python` (2.14.0+cu130, run on CPU; it prints a NumPy warning to stderr). The lab's code block produced output byte-identical to `corpus/reuse-a-pretrained-model/run.log` and to the lab's expected-result block. Not re-run: the two variations (their code did not move).

**Rendered.** Headless Chromium (Playwright's cached shell) on the built site: the lab page renders with the mission wrapper and button; clicking it gives "1 of 8 exercises" and ticks chapter 3 in the contents; the chapter page shows the folds closed, a fold opens with the styled summary, and the "Open the lab" block replaces the button; no console errors.

**Not done.** The author's read; the other seven chapters; `about.md`, `README.md` and `CONTEXT.md` §1 (STORY-MAP §6 leaves those until all eight are done).
