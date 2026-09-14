# Chapter plan, revision 2 — one shop, eight chapters (2026-09-13, for the author's approval)

**Decision (author, 2026-09-13):** the standalone essays read as "separate islands". Merge them into
bigger chapters, each explaining one thing end to end on a real project. Length **20,000–35,000
characters** of prose per chapter (today one essay is 7,000–13,600). **Plan everything first, then
write.** No prose changes until this revision is approved; then chapter 1 is the pilot.

**Revision 2** applies the Codex review of revision 1 (five remarks, all adopted) and the author's
choice to run the image classifier on the shop's product photos, so the whole book follows one shop.

## What changed from revision 1, and why

1. **Generation was missing.** Revision 1 called chapter 6 "the chapter 1 model at volume", but
   chapter 1 built a search *encoder*, and a KV cache belongs to an autoregressive *generator* — a
   different workload. Nothing before chapter 6 introduced generation, yet chapter 4's RLHF bridge
   needed it too. Fix: chapter 1 ends with a generator built from the same kind of blocks as the encoder but trained separately (the causal-mask material
   from essay 3 already lives there, unused by a search encoder), and the assistant chapter now comes
   *before* the serving chapter, so the reader sees what the generator does before paying for it.
2. **LoRA's project resolved.** Freeze/thaw stays on the classifier; LoRA is shown on the shop's
   language model, as the sources do (Llama), adapting the attention matrices from chapter 1.
3. **Chapters 2 and 5 have a boundary.** Chapter 2 = evaluation you can trust *before* release.
   Chapter 5 = evidence and decisions *after* release. An anomaly score triggers investigation; it does
   not say accuracy fell, nor that retraining will repair it.
4. **Recurring knobs stated precisely.** Revision 1 said temperature is "the same knob" everywhere.
   Contrastive temperature scales similarity logits during *training*; generation temperature scales
   next-token logits at *sampling*. Same pattern (divide the logits before the softmax), different stage
   — the chapters say both halves. The game-to-RLHF bridge must show where human preference labels
   enter (pairs of answers → a reward model) and where the learned reward enters (PPO's reward, with
   the clip from the game).
5. **Chapter 8 is a project decision.** Its two source essays did not cover "the job". It now closes
   the project: a rule, search and a model compared on measured quality and operating cost.
6. **One project, not three.** The image classifier becomes the shop's product-photo classifier.
   Rare categories give real imbalance (the course's malaria dataset is balanced, which revision 1 had
   to explain away); drift after launch is a new product line. The courses' own projects are still the
   ground: 4735368 §34 builds the search engine, §4 the cell classifier, §13/§30 pretrained models,
   6100015 §7 LoRA on Llama. Each chapter names the course project as the same pipeline on public data.

Cross-cutting rules for every chapter: rewrite around one project progression, never concatenate
essays; exercises stay CPU-runnable (venv per DRAFTING-BRIEF); every synthetic demonstration is
labelled as such and separated from what validating a real project would take; all existing prose
rules (CONTEXT §4, the two 2026-09-13 recommendations) hold.

## The spine: one shop

An online shop. Its catalogue search and its answer generator (ch 1); its product-photo classifier,
evaluated before release (ch 2), built from a pretrained model (ch 3), kept right after launch (ch 5);
a game agent whose method tunes the generator on human preferences (ch 4); the assistant built on
search and the generator (ch 6); the cost of serving it (ch 7); and the closing question of whether
the shop needed a model at all (ch 8).

| Ch | Working title | Built from | Project step |
|---|---|---|---|
| 1 | Search the catalogue, then answer from it | essays 1–4 (+ generation from essay 3's mask) | encoder for search; decoder for answers |
| 2 | Trust the number before you ship the classifier | essays 5–8 + Part III 1, 2, 3 | product-photo categories: split, leakage, rare categories, threshold, augmentation, input pipeline |
| 3 | Reuse a pretrained model | essays 9–10 | freeze/thaw on the photo classifier; LoRA on the shop's language model |
| 4 | Train from reward | essays 11–12 | game agent → preference labels → learned reward → PPO tunes the generator |
| 5 | Keep it right after launch | Part III 6, 7, 8 + Part IV 9, 13 | artifact, labels later, anomaly → investigate, gate, feedback loop |
| 6 | Build the assistant | Part III 4 + Part V 14, 15, 16 + injection | measure retrieval; chunks; the loop calls the function; untrusted text; when fine-tuning lost |
| 7 | Serve the assistant cheaply | Part IV 10, 11, 12 | KV cache for the generator; four bits per weight; batching |
| 8 | Did the shop need a model? | Part VI 17, 18 | rule vs search vs model on measured quality and cost |

## Chapters

### 1. Search the catalogue, then answer from it  *(essays 1–4; ~32k chars; the pilot)*
Project: type "cheap keyboard for laptop", get products that never say "cheap"; then a one-paragraph
answer written from the products found.
1. The search box is now a model: a function whose numbers are fitted by a loss (essay 1, cut to the
   loop and one worked step).
2. The query becomes tokens (essay 2: merges, why "strawberry" letters vanish; production detail cut).
3. Tokens look at each other: attention as a blended lookup (essay 3). A search encoder reads both
   ways; the cases table stays.
4. Tokens become one vector; similar means what the training pairs said (essay 4, redone in the
   practitioner register: temperature as the training knob that sharpens the contrastive softmax; the
   MiniLM trivia gone).
5. The same blocks, one token at a time: the causal mask (essay 3's mask, from the requirement),
   next-token sampling, and *sampling* temperature — same division before the softmax as in 4, at a
   different stage; forward to ch 4 (tuning this generator) and ch 7 (its cost).
6. Where search breaks: a pair type the training never showed → forward to ch 6 (measure retrieval).
One exercise: a tiny encoder over a toy catalogue, tokenize → rank, then the missing-pair failure;
then a separately trained generator, the same block design with a causal mask, generating a few tokens.
Synthetic; labelled so. (Amended 2026-09-14, author: the two models share a design, not trained weights.)

### 2. Trust the number before you ship the classifier  *(essays 5–8 + Part III 1, 2, 3; ~35k chars)*
Project: product photos in, category out, for a catalogue where most categories are rare.
1. Split the data, and why the test set is looked at once (essay 5; "benchmark is a claim about a
   test set" folds in — the same winner's curse).
2. Leakage: the same product's photos on both sides of the split; a feature not available at
   prediction time ("not available at prediction time").
3. Rare categories: 95% accuracy is the baseline; `pos_weight` (essay 6). The course's malaria set is
   named as the balanced public example of the same pipeline.
4. The model outputs a score; the threshold is a cost decision ("the model outputs a score").
5. Augmentation: a flipped product is the same product; a flipped label text is not (essay 7).
6. The GPU waits on the decoder: the input pipeline (essay 8).
One exercise: a small CNN on synthetic product-like images, carrying split → weight → threshold →
loader timing. Ends with what a real release evaluation adds (real photos, real costs) that the
synthetic run cannot show.

### 3. Reuse a pretrained model instead of training from zero  *(essays 9–10; ~25k chars)*
Project: the photo classifier with a few hundred labelled photos; then the shop's language model.
1. Freeze the backbone, train the head, then thaw — the BatchNorm statistics trap (essay 9).
2. Transfer the adaptation problem to the language model: billions of weights, don't touch them,
   learn a low-rank diff (essay 10). The matrices LoRA adapts are chapter 1's attention matrices;
   alpha's scaling is the same divide-before-use pattern, named as such.
3. Choosing: head only, thaw, or LoRA — by labelled data and memory.

### 4. Train from reward instead of labels  *(essays 11–12; ~25k chars)*
Project: a corridor/game agent, then the generator from chapter 1 tuned on human preferences.
1. No labels, only rewards: measure the return or guess it from the next state (essay 11).
2. From values to a policy; reuse samples without drifting too far — PPO's clip (essay 12).
3. The bridge, precisely: people compare pairs of the generator's answers (preference labels); a
   reward model is fitted to those pairs; PPO uses that learned reward, with the same clip, over the
   generator's softmax over tokens. What is measured, what is learned, what is assumed.

### 5. Keep it right after launch  *(Part III 6, 7, 8 + Part IV 9, 13; to be drafted)*
Project: the photo classifier in production; a new product line arrives.
The artifact is weights plus fitted preprocessing; true labels arrive weeks later — what can be
measured before them; a label-free anomaly score (autoencoder) flags that inputs changed, which is a
reason to investigate, not evidence that accuracy fell or that retraining will fix it; the new model
must beat the deployed one before it replaces it; only shown items get feedback, so the next model
trains on the last model's choices. "The score is not the lift" stays deferred; would join here.

### 6. Build the assistant on the catalogue  *(Part III 4 + Part V 14, 15, 16 + injection; to be drafted)*
Project: the shop's assistant = chapter 1's search + chapter 1's generator (as tuned in ch 4).
Measure retrieval before blaming the model; the chunk is the unit of retrieval; your loop calls the
function; untrusted text in that loop is an untrusted code path (prompt injection, its own section);
when fine-tuning lost to retrieval.

### 7. Serve the assistant cheaply  *(Part IV 10, 11, 12; to be drafted)*
Project: the assistant at volume. The generator's cost is per token: the KV cache; four bits per
weight; batching is where throughput comes from. The encoder's cost (one pass per query) is the
contrast that opens the chapter.

### 8. Did the shop need a model?  *(Part VI 17, 18; ~20k chars; to be drafted)*
Project decision: a keyword rule, the search encoder, and the assistant, compared on quality the book
measured and on operating cost. Read the table first; the rule was cheaper — and when it was not.
Numbers come from the book's own exercises and are labelled synthetic.

## How it matches the Part III–VI decisions (CONTEXT §9)
Every item has a home. Prompt injection, decided standalone, is a section of chapter 6 (the chapter
form makes "standalone" moot). "Benchmark is a claim about a test set" merges into chapter 2.
"The score is not the lift" stays deferred.

## Process (approved 2026-09-13; amended by the author the same night)

**Amendment:** every chapter is written **from scratch**, not converted from the essays. The twelve
essays stay online unchanged as an archive at `docs/old/` (source still `essays/`), old URLs redirect
there, and each archived page links to the chapter that replaces it. Chapter sources are
`chapters/<slug>.md`, registered in `site/catalog.mjs` `chapters[]`; receipts in `corpus/<slug>/`.

Original process, as amended:
1. Main session writes chapter 1 as the pilot of the form (sequential pass rule); publish; author reads.
2. Then chapters 2–4, written from scratch on the essays' ground; the essays stay in the archive.
3. Chapters 5–8 drafted fresh, pitch per chapter (project + section list), then prose.
4. Receipts: each chapter writes its own `corpus/<chapter-slug>/receipts.tsv`; the essays' receipts stay with the archive.
5. **Chapter 1 (`search-the-catalogue`) written and published 2026-09-13** as the pilot; awaits the author's read.
6. **Chapter 2 (`trust-the-number`) written and published 2026-09-13** at the author's request; the author reviews chapters 1 and 2 together.
7. **Chapter 3 (`reuse-a-pretrained-model`) written and published 2026-09-13** at the author's request, before the review of 1–2.
8. Chapter 4 prepared, not written (2026-09-13): research notes, verified exercise prototype and draft receipts;
   prose waits for the author's feedback on chapters 1–3.
9. **Chapter 4 (`train-from-reward`) written and published 2026-09-14** at the author's request, before the review of 1–3.
