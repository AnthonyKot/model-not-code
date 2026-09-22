# STORY-MAP — one story per chapter (rework instructions, 2026-09-22)

**Status: approved by the author 2026-09-22. This file is the authority for the rework.** Where it
disagrees with `CHAPTER-PLAN.md` (revision 2, 2026-09-13), this file wins. Every other rule in
`CONTEXT.md` and `AGENT.md` still holds: never false, numbers derived on the page or absent, receipts,
no source narration, practitioner register, second person for the reader.

## 1. The decision

The eight chapters stay. The shop stays. Each chapter is rebuilt around **one story** — a concrete
thing that went wrong or surprised, stated in the opening paragraph and answered by the chapter — with
everything else demoted to a beat of that story, a fold, or the lab.

**Why.** The author's read (2026-09-22): "It's visible that chapters are concatenation of smaller
pieces. They go too deep in some specific computations and examples so it's easy to lose focus and
clear picture." The evidence agrees:

- Chapters 1–4 were assembled from the archived essays section by section (`CHAPTER-PLAN.md` §
  tables: ch. 1 = essays 1–4, ch. 2 = essays 5–8 + three Part III essays, ch. 3 = 9–10, ch. 4 =
  11–12). The section headings are still the essay titles. That is the seam the author sees.
- Depth is inverted. In ch. 3 the BatchNorm buffer section is 852 words; "Choosing how much of the
  model to change" — the decision the chapter exists for — is 197 words and second from last. In
  ch. 4 the corridor runs 2,139 words before the answer writer appears (341 words). In ch. 2 the
  frame ("What a held-out accuracy claims") is 292 words against 891 for the threshold table.
- The exercises have become the centre of mass: 52–56% of chapters 6, 7 and 8 by word count
  (2,581–2,778 words each), 25–36% of the rest. Chapter word counts today: 4,879–7,582; the plan
  said 20,000–35,000 characters and five of eight exceed 35,000.

**The yardstick is `~/book1`** (the rework the author approved as "very readable"): one question per
essay, 1,800–3,200 words, 18–22% of the text inside `<details>` folds, the exercise reduced to what
a reader can check without leaving the page, a bridge paragraph explaining why the next essay
follows. Book1's `notes/REWORK-PLAN.md` §4 is the template; this file adapts it.

**What is not changing.** Chapter count and order. The shop and its numbers. Every receipt. The labs'
code and expected outputs (they move, they are not rewritten). The review pipeline.

## 2. The shape of a reworked chapter

Target **2,400–3,400 words on the page**, of which 18–25% inside folds. The reading path (everything
outside folds) is therefore about 2,000–2,700 words. Chapter 2 may run to 3,800 because its story
has three beats.

Reading flow, in order. Headings are steps of the story, never the name of a mechanism.

1. **The story, in one paragraph.** A specific thing the shop measured, shipped or saw, with its
   number, and the question it raises. Not "this chapter builds X". The reader must be able to say
   what went wrong before anything is explained.
2. **The map, in two or three sentences.** What the chapter will show and in what order, in plain
   prose. Not a list of terms. (The 2026-09-16 review's first recommendation.)
3. **Beats.** Two to four sections, each one step of the answer. Each opens by saying why it must
   follow the previous one. Each carries exactly the arithmetic needed to make its step believable
   — one table or one derived number — and folds the rest.
4. **Folds.** `<details><summary>Optional: …</summary>` for derivations, second worked instances,
   library-specific detail, and any computation longer than a short table. A fold is never
   load-bearing: the reading path must make sense with every fold closed. Summary lines name what
   is inside ("Optional: where the 0.05 minimum comes from"), never "More detail".
5. **A prediction pause** at the chapter's main turn: one question in bold, then the reveal. One per
   chapter, placed before the surprising number, not a quiz. (Review §2.)
6. **Where it stops.** The limit or counterexample, short. Keep "What a real project adds" only if
   it is under 200 words and says something the story did not; otherwise fold it or cut it.
7. **Two worked questions** in `<details>`: one varies the example, one is conceptual and its answer
   names the plausible wrong turn. About 120 words each, answer folded. These replace the in-page
   exercise for a reader who will not open a terminal.
8. **The lab link.** One paragraph: what the lab lets you run, what number it should print. Links to
   `labs/<slug>.md`. The `<!--mission-->` marker moves to the lab page so the "Mark exercise
   complete" button and progress count live with the code.
9. **Bridge.** Final paragraph: why the next chapter's story follows from this one. Chapter 8 closes
   the book instead.

Voice rules unchanged. Add to them: no section may be titled with a noun phrase that could be an
essay ("Attention", "The chunk is the unit of retrieval"). Title it with what it does for the story
("How the shop tells 'laptop keyboard' from 'keyboard stand'").

## 3. The stories

The "keep on the page" column is the arithmetic that stays in the reading path. Everything else
that exists in the current chapter is either folded or moved to the lab; nothing is deleted without
a note in `notes/chapters/<slug>.md`.

### Chapter 1 — Search the Catalogue, Then Answer From It

**Story.** The customer types *cheap keyboard for laptop*. The product that should come first is
*Slim wireless keyboard*, whose title contains neither word. A keyword index puts *Laptop stand* on
top instead. What has to change for the right product to win?

**Beats.** (1) Text becomes numbers a loss can move — what you ship is a file of numbers.
(2) One vector per text, because a pair scorer costs 2,000,000 × 1,000 passes a minute and an
encoder costs 1,000. (3) Tokens look at each other — how the model tells *laptop keyboard* from
*keyboard stand* when the words are the same. (4) The same blocks write one token at a time: why a
model trained to read both ways cannot write (position 2 draws a third of its output from the token
it must predict), and the mask that fixes it.

**Keep on the page.** The 2,000,000,000 vs 1,000 count. The cosine formula. The one small attention
table that shows blending. The one row showing the both-ways leak. The click-log diagonal in two
sentences.

**Fold.** The cosine-gradient "one step" derivation. Mean-pool padding arithmetic. The full Q·Kᵀ
table. Temperature (both kinds — keep the two-sentence distinction, fold the numbers). Sampling.

**Prediction pause.** Before beat 4: "If the answer writer were trained with the same both-ways
attention as the search encoder, what would it learn to do?"

**Lab.** The current exercise unchanged: train the search, break it, then generate.

**Note.** This is the chapter most at risk of staying two chapters (encoder, generator). Beat 4 is
allowed 600 words, not the current 1,098; the generator is introduced as the second thing the shop
needs, in the story paragraph, so it is not a second story.

### Chapter 2 — Trust the Number

**Story.** The classifier scored 92.4% on held-out photos and the shop was ready to ship it. One
number, and three ways it was lying: about the split, about the rare row, and about who decides.

**Beats.** (1) The split: 99.2% of "unseen" photos had a sibling in training; split by product.
(2) The rare row: a flagger that never flags scores 93.8% and it is the true minimum of the loss
(p = 0.05) — recall per category, and the class weight. (3) Who decides: a false flag costs 2, a
missed blade 20; the threshold is the decision, the model is the score. Close with what the release
evaluation reports (the existing section, shortened).

**Keep on the page.** The 0.992 sibling number. The never-flag 0.938. The p = 0.05 result with the
pull-balance sentence (950 × 0.05 = 47.5 both ways). The ten-listing threshold table, cut to the
rows that change the decision.

**Fold.** The sibling probability derivation. The derivative of L(p). The category weight table.
"Every look at the test set spends it" (becomes a fold under beat 1). Augmentation (fold under beat
2: "Optional: what a flipped photo claims about its label"). The JPEG decoder section moves to the
lab entirely; it belongs to running the exercise, not to the story.

**Prediction pause.** Before beat 2: "The optimiser is given 950 non-blades and 50 blades and no
class weight. What blade probability does it settle on, and what does that flag?"

**Lab.** Split, weight, threshold, then score the release. The input-pipeline material becomes the
lab's setup section.

**Note.** This is the chapter most likely to slide back into three essays. The test is the
transition sentences: each beat must be introduced as *the next way the same number lied*.

### Chapter 3 — Reuse a Pretrained Model

**Story.** You set `requires_grad = False` on every weight of the backbone. Nothing has a gradient.
The same input goes in, and the output slides 1.600 → 1.550 → 1.242 → 1.004 as training batches
pass; the old head that shares the backbone falls from 0.981 to 0.952. A frozen backbone became a
different function under an unchanged weights file.

**Beats.** (1) What the checkpoint gives you and what a "freeze" is supposed to promise. (2) The
state `requires_grad` does not freeze: BatchNorm buffers, the six-row table, the three freezes A/B/C
and their measured accuracies (0.952 / 0.981 / new head 0.765, 0.824, 0.639). (3) How much of the
model to change — head only, thaw with a smaller learning rate, or an adapter — promoted from 197
words at the end to the frame after the story. (4) LoRA as the adapter case at a language model's
size: the low-rank diff beside the attention matrices from chapter 1, one rank-one instance.

**Keep on the page.** The six-row buffer table. The A/B/C list with numbers. The choice table.
The rank-one LoRA example (one matrix, one product).

**Fold.** The μ̂/σ̂ update formulas and the unbiased-variance detail. The Keras vs PyTorch coupling.
The closed forms 1 − 0.9ⁿ. The stage-two learning-rate arithmetic. "What the rank and the freeze
cannot do" and "What the synthetic run leaves out" merge into one short "where it stops".

**Prediction pause.** After the story's first sentence and before the table: "Every weight is
frozen. Must the output for a fixed input stay the same? Name the condition your answer depends on."
(This is the review's own suggested pause for this chapter.)

**Lab.** Freeze three ways, thaw, then fit a LoRA adapter — unchanged.

**Note.** This corrects `review.md` §1's suggestion to open on the choice table with BatchNorm
demoted. The frozen backbone is the story; the choice table is its frame and comes second. What is
demoted is the arithmetic, not the puzzle. **This is the pilot chapter.**

### Chapter 4 — Train From Reward

**Story.** The shop tuned its answer writer on human preferences. The reward model's score rose
every epoch, and the answers got worse. Why does the number you optimise stop meaning what it
measured?

**Beats.** (1) Learning when nobody labels the answer: a score arrives at the end, and the corridor
shows what "return" means — one beat, at most 700 words, one value table. (2) The answer writer is
a policy: the same idea applied to tokens. (3) Where preferences enter: pairs, the reward model, and
what it can and cannot have learned. (4) Tune the writer and watch it game the reward — the run, the
rising score, the degraded answers. (5) The two guards are different: the clip bounds the step, the
reference penalty bounds the drift.

**Keep on the page.** One corridor value table. The reward-vs-quality run (the table that shows the
score rising while the held-out judgement falls). The one-sentence statement of each guard with its
one number.

**Fold.** Actor-critic and the estimate-from-the-next-cell derivation. "Reuse the batch, but not
too far" (the PPO ratio arithmetic). The clip-vs-KL derivation. The preference-loss formula.

**Prediction pause.** Before beat 4: "If the reward-model score rises, what additional observation
would make that improvement convincing?" (Review §2.)

**Lab.** Learn from reward, then from preferences — unchanged; the corridor exercise stays in the
lab in full.

**Note.** The current chapter spends 2,139 words in the corridor before the writer appears. In the
rework the writer is named in the story paragraph and the corridor is one beat in its service.

### Chapter 5 — Keep It Right After Launch

**Story.** Ten weeks after launch. A promotional banner set off a loud alarm, and the flag was
intact. Folding knives set off nothing, and recall fell from 0.763 to 0.491. Which alarm did the
shop need, and how would it have known?

**Beats.** (1) What ships is more than the weights, and the three clocks — what you can know and
when — compressed to one beat. (2) The score for photos nobody labelled, and the two alarms: loud
and harmless, silent and expensive. (3) Fewer blades listed, or more blades missed? Two explanations
fit the drop; the audit at 3 per listing tells them apart (2.5 vs 15.0 expected, 13 found). (4) An
alarm is a reason to look; retraining learns the shop's labels including the wrong ones; the
candidate must beat the live model on evidence both are judged by (shadow gate) — one beat, three
short steps.

**Keep on the page.** The two-alarm contrast with its numbers. The two-row expected-count table and
the 13. The audit's cost against the misses' cost. The shadow-gate margin.

**Fold.** The three clocks' detail. The autoencoder score construction. The Poisson formula and the
tail probabilities. The feedback-loop mechanics.

**Prediction pause.** Before beat 3: "Confirmed blades halved. Name two explanations, and say what
the audit would count under each."

**Lab.** Ten weeks of a live classifier, then your call — unchanged, including the reader decision
and its hints/discussion folds (already `<details>`).

### Chapter 6 — Build the Assistant

**Story.** Three wrong answers from the shop's assistant, three different causes: one where
retrieval never found the chunk, one where the chunk boundary cut the fact in half, and one where an
injected instruction was refused and the answer was still wrong. Which part do you fix?

**Beats.** (1) Measure retrieval before blaming the writer — the golden set and its metrics. (2) The
chunk is the unit of retrieval — where you cut decides what you can find. (3) The loop calls the
function — tools, dispatch, the confirmation rule. (4) Untrusted text is an untrusted code path —
the coupon injection: refused by the tool rule, misreported by the writer. Close on which rung the
shop needed.

**Keep on the page.** The golden-set numbers for the three answers. One chunking contrast. The
injected instruction and the two outcomes (refused / misreported).

**Fold.** Metric definitions. The dispatch table listing. The confirmation-rule code.

**Prediction pause.** Before beat 4: "The tool rule refused the injected coupon. Is the customer's
answer now correct?"

**Lab.** Score retrieval, chunk two ways, run the loop, then diagnose three answers — unchanged.
This lab is 2,778 words and the chapter body 2,522; moving it out is most of this chapter's rework.

### Chapter 7 — Serve the Assistant Cheaply

**Story.** The serving report shows 3.4 requests in flight and a proposal to buy the bigger card.
The bigger card buys 1.4×. Four-bit weights buy more, and batching more still. Why is the obvious
lever the weakest?

**Beats.** (1) A token costs a pass over the weights — and the KV cache (42 vs 9 key/value rows).
(2) Four bits per weight, one block by hand with the outlier. (3) Batching is where throughput
comes from: arithmetic intensity and the CPU's own crossover. (4) Which lever, from the numbers on
the running server — the lever table and the 1.4× cap.

**Keep on the page.** 42 vs 9. One four-bit block. The crossover number. The lever table.

**Fold.** The full quantisation block arithmetic. GQA. The intensity derivation.

**Prediction pause.** Before beat 4: "Given the report's numbers, rank the three levers before
reading the table."

**Lab.** Cache the keys, quantise the weights, batch the tokens — unchanged. Lab 2,581 words vs
body 2,032: same situation as chapter 6.

### Chapter 8 — Did the Shop Need a Model?

**Story.** On one ledger, a rule costs a test and a model costs data, evaluation and drift. The model
breaks even at 3,001 questions a month — then at 300, once a 15% held-out rate is allowed for. What
would the shop have to see to choose it?

**Beats.** (1) The ledger: what each side is charged for, monitoring on both. (2) The same catalogue,
a rule and a model, on chapter 6's golden set, with intervals. (3) Read the table first: the flip
points. (4) What the shop keeps, questions, and would need to see — the closing table. The reader's
ledger on chapter 2's classifier stays as the book's last decision.

**Keep on the page.** The ledger. The comparison table with intervals. The two break-even numbers.
The closing table.

**Fold.** The pooled-SE arithmetic. The held-out paraphrase set. The click-log comparator detail.

**Prediction pause.** Before beat 3: "Before reading the flip points: at what monthly volume do you
expect the model to pay for itself?"

**Lab.** The same questions, a rule and a model, on one ledger — unchanged. This chapter closes the
book; no bridge.

## 4. Labs

`labs/<slug>.md`, one per chapter, same slug. Contents: the current `## Exercise` section moved
verbatim (code, expected outputs, hints and discussion folds), preceded by a two-line header naming
the chapter and what the lab demonstrates, and by any setup material folded out of the chapter (ch.
2's input pipeline; ch. 4's corridor exercise). The `<!--mission-->` marker moves here.

Build change (`site/build.mjs`): read `labs/*.md`, emit `docs/labs/<slug>.html` with the chapter
shell, the mission wrapper and the completion button; chapter pages link forward to their lab and
labs link back. The progress count ("N of 8 exercises") keeps counting per slug, so nothing changes
for a reader who already marked one complete. Add a `details` style if `site/styles.css` has none
(book1's `.fold` rule is the model: summary in the accent colour, closed by default, prints open).

Nothing in a lab is rewritten during this rework. Exercises are re-run once after the move to
confirm the expected outputs still match (PyTorch 2.14.0+cpu, scratch venv — see `RESUME.md`).

## 5. Process

Order: **chapter 3 first, as the pilot**, read by the author before anything else moves. Then 1, 2,
4 (the assembled chapters — real recomposition). Then 5–8 (mostly the lab move, the story paragraph,
the pause, and heading rewrites).

Who: the main session writes each chapter directly, one at a time (the author's rule). Mechanical
steps — lab extraction, build change, heading and link updates across all eight — may go to Codex
after the pilot fixes the pattern. Reviews as before: `scripts/codex-review.sh` for exact-replacement
correctness, one independent read for focus (`notes/chapters/REVIEW-GUIDE.md`), findings logged in
`notes/chapters/<slug>.md`.

Per chapter, in order:

1. Move the exercise to `labs/<slug>.md`; build; confirm the page renders and the button works.
2. Write the story paragraph and the map. Read them alone: can a reader state the question?
3. Recompose the beats. Every section heading rewritten. Every transition sentence written fresh.
4. Fold. For each computation, ask: does the reading path still make its step without this? If
   yes, fold it; if no, it stays and something else folds.
5. Add the prediction pause and the two worked questions.
6. Bridge.
7. Checks: `npm run check` (receipts, paraphrase), `npm run consistency`, the voice lint, word count
   on the page and outside folds, and a read with every fold closed.
8. Log decisions and what was folded or moved in `notes/chapters/<slug>.md`. Status stays
   `published` — the URL does not change.

## 6. Done

A chapter is done when: the story is stated in its first paragraph with its number; the page reads
correctly with every fold closed; the reading path is 2,000–2,700 words (2,900 for ch. 2); no
section heading names a mechanism; the lab is on its own page with the completion button; the
receipts and consistency checks pass; the exercise still prints its expected result; and the author
has read it.

The book is done when all eight are done, `about.html` describes the shape (story, folds, labs),
and `README.md`, `RESUME.md` and `CONTEXT.md` §1 point here instead of at the 20,000–35,000
character target.

## 7. Status and lessons (2026-09-22, after all eight chapters)

**Done:** chapter 3 (pilot), then 1 and 2, in that order, by the main session; commits `1115505`,
`8840699`, `eeb9442`, `fa86b08`. The author's provisional verdict on the three: OK, 7 of 10 (given as an
assumption in chat, not a line-by-line read). Site support for labs is built (§4 done). Chapters 4, 5, 6, 7 and 8 followed later the same day (their notes have the
entries). **Next:** the cross-check of 8 against 1–7, then the §6 site copy, then push.

| Ch | Reading path | Folds | Page | Notes |
|---|---|---|---|---|
| 3 | 2,698 | 900 (25.0%) | 3,598 | seven folds; page ~200 over §2's 3,400 |
| 1 | 2,696 | 898 (25.0%) | 3,594 | eight folds; beat 4 at 599 words; six glossed formulas on the path |
| 2 | 2,431 | 794 (24.6%) | 3,225 | six folds; input pipeline moved to the lab as setup |
| 4 | 2,696 | 902 (25.1%) | 3,598 | six folds; corridor one beat of 443 words; eight trims; five tables kept on the path |
| 5 | 2,697 | 916 (25.4%) | 3,613 | 7 folds incl. two worked answers; bundle + clocks one beat, investigation + loop + gate one beat; five trims |
| 6 | 2,325 | 751 (24.4%) | 3,076 | 6 folds; first draft short and 29.5% folded, SE formula and repairs back on the page; one pass |
| 7 | 2,103 | 717 (25.4%) | 2,820 | 5 folds; page inside §2's range; one fold trim |
| 8 | 2,694 | 792 (22.7%) | 3,486 | 6 folds; five tables on the path; pause before the break-even reveal; the old vendor-table pause became worked question 2; no bridge |

**What the three taught, for chapters 4–8.**

- The first draft lands long. Writing to the card produced 3,200–3,400 words on the path with 30% folded
  every time; two or three trimming passes got each one under 2,700. Budget time for that, and trim by
  cutting whole sentences and merging paragraphs rather than shaving words.
- Folding can overshoot. Chapter 2's first draft folded the standard error and the precision paragraph and
  came out at 35% folded with a 2,100-word path; both went back on the page. If a later chapter (6 uses
  chapter 2's standard error) depends on a passage, it stays on the page.
- A display formula costs 60–80 words with its gloss, and the gloss is not optional (CONTEXT §4). Chapter
  1 keeps six. Where the page total matters more than the formula, fold the formula with its gloss as a
  unit (chapter 1's gradient-descent update and step table are one fold).
- The page total (§2's 2,400–3,400) is the target most often missed, by about 200 words, and only when the
  card keeps several tables on the page. The reading path and the fold share are the criteria that
  matter (§6); log the page total and move on.
- Every "section N" in a moved lab walk-through goes stale. Replace with the new heading's name at move
  time.
- The worked questions want one new derived number each (chapter 3: a second supplier's drift to 2.386;
  chapter 1: the row at τ = 0.1; chapter 2: a 2% blade rate and `pos_weight` 49), verified in
  `worked.py`, logged and receipted. Reusing a number already on the page makes a weaker question.
- The voice lint still catches "decides" and "reported" in fresh prose; run it on the chapter and the lab.
- Tools: `scripts/reading-path.py` (counts), `scripts/lab-check.mjs` (browser check), the interpreter
  named in `RESUME.md`.
