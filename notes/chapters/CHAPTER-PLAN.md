# Chapter plan — merging essays into project chapters (2026-09-13, for the author's approval)

**Decision (author, 2026-09-13):** the standalone essays read as "separate islands". Merge them into
bigger chapters, each explaining one thing end to end on a real project. Length **20,000–35,000
characters** of prose per chapter (today one essay is 7,000–13,600). Grouping: essay 9 (transfer)
moves beside LoRA. **Plan everything first, then write.** No prose changes until this plan is approved.

## The spine: three projects that run through the book

The projects are the ones the courses themselves build, so the chapters start from how the sources
explain things in practice:

1. **Product search for an online shop** — a query box that finds products with no shared word
   (course 4735368 §34 builds exactly this). Carries chapters 1, 6, 7.
2. **A blood-cell classifier that flags malaria** — images in, "parasitized / uninfected" out
   (course 4735368 §4; imbalance §15, augmentation §8/§11, pretrained models §13, serving §18).
   Carries chapters 2, 3, 5.
3. **A game agent trained from reward** — a small environment first, then the same method
   used to tune a chat model on human preferences. Carries chapter 4 and connects back to 1 and 7.

Knobs that recur are named as the same knob where they reappear: loss and gradient (1 → every
chapter), softmax and temperature (1 attention and similarity → 4 action probabilities → 6
generation), frozen weights (3), the test set you only look at once (2 → 5).

## Chapters

### 1. Search a product catalogue with a language model  *(essays 1–4; ~30k chars)*
Project: type "cheap keyboard for laptop", get products that never say "cheap".
1. The search box is now a model: a function with numbers fitted by a loss (essay 1, cut to the loop
   and one worked step).
2. The query becomes tokens (essay 2: merges, why "strawberry" letters vanish; production detail cut).
3. Tokens look at each other: attention as a blended lookup (essay 3). The causal mask moves to a
   short "when generation needs it" part, since a search encoder reads both ways — the cases table stays.
4. Tokens become one vector; similarity is what the training pairs said (essay 4, redone in the
   practitioner register: temperature from the API knob, the MiniLM trivia gone).
5. Where it breaks: a pair type the training never showed → forward to chapter 7 (measure retrieval).
One exercise: a tiny encoder over a toy catalogue, from tokenizing to ranking, then the missing-pair failure.

### 2. Ship an image classifier that holds up  *(essays 5–8 + Part III items 1, 2, 3; ~35k chars)*
Project: the malaria cell classifier, from folder of images to a number you can trust.
1. Split the data, and why the test set is looked at once (essay 5; Part III "benchmark is a claim
   about a test set" folds in here — it is the same winner's curse).
2. Leakage: cells from the same patient on both sides of the split (Part III "not available at
   prediction time").
3. Rare positives: 95% accuracy is the baseline; `pos_weight` (essay 6). *Check while writing:* the
   public cell dataset is balanced; the rarity is the screening population, so the chapter says so.
4. The model outputs a score; the threshold is a cost decision (Part III "the model outputs a score").
5. Augmentation: a rotated cell is still the same cell; a flipped letter is not (essay 7).
6. The GPU waits on the decoder: the input pipeline (essay 8).
One exercise: a small CNN on synthetic cell-like images, carrying split → weight → threshold → loader timing.

### 3. Reuse a pretrained model instead of training from zero  *(essays 9–10; ~25k chars)*
Project: the same classifier with a few hundred labelled cells, starting from a pretrained backbone.
1. Freeze the backbone, train the head, then thaw — and the BatchNorm statistics trap (essay 9).
2. When the backbone is billions of weights: don't touch the weights at all, learn a low-rank diff
   (essay 10). The attention matrices LoRA adapts are the ones from chapter 1.
3. Choosing: head only, thaw, or LoRA — by labelled data and memory.
*Open question:* LoRA's sources fine-tune a language model; the plan shows the mechanism on the
backbone's linear layers and gives the LLM sizes as the realistic case. Alternatively LoRA's section
uses the chapter 1 search model. Author to choose.

### 4. Train from reward instead of labels  *(essays 11–12; ~25k chars)*
Project: a corridor/game agent, then the bridge to chat models.
1. There are no labels, only rewards: measure the return or guess it from the next state (essay 11).
2. From values to a policy; reuse samples without drifting too far — PPO's clip (essay 12).
3. The same clip tunes a chat model on human preferences — ties back to chapter 1's model and the
   softmax over tokens.

### 5. Keep the model right after launch  *(Part III 6, 7, 8 + Part IV 9, 13; to be drafted)*
Project: the cell classifier in production.
The artifact is weights plus preprocessing; the new model must beat the deployed one; true labels
arrive weeks later; a label-free anomaly score (autoencoder) for drift; the model picks its own
training data.

### 6. Serve a language model cheaply  *(Part IV 10, 11, 12; to be drafted)*
Project: the chapter 1 model answering queries at volume. KV cache, four bits per weight, batching.
Temperature at generation is the same knob as in chapter 1.

### 7. Build an assistant on the catalogue  *(Part III 4 + Part V 14, 15, 16 + injection; to be drafted)*
Project: the shop's assistant. Measure retrieval before blaming the model; the chunk is the unit of
retrieval; your loop calls the function, and untrusted text in that loop is an untrusted code path;
when fine-tuning lost to retrieval.

### 8. The job  *(Part VI 17, 18; ~20k chars; to be drafted)*
Read the table first; the rule was cheaper.

**Not placed:** "the score is not the lift" stays deferred (as decided); could join chapter 5.

## How it matches the outline pasted on 2026-09-13
Every item in Parts III–VI has a home above. Two differences from that list, both from earlier
decisions: prompt injection was decided *standalone*, here it becomes a section of chapter 7 (the
chapter form makes "standalone" moot); "the score is not the lift" was *deferred*, still deferred.
"Benchmark is a claim about a test set" overlaps essay 5 and is merged into it.

## Process once approved
1. Main session writes chapter 1 as the pilot of the form (sequential pass rule); publish; author reads.
2. Then chapters 2–4 from existing essays; old essays stay in git history, pages replaced.
3. Chapters 5–8 drafted fresh, pitch per chapter (project + section list), then prose.
4. Receipts: merge the essays' `corpus/<slug>/receipts.tsv` into `corpus/<chapter>/`.
