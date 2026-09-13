# embeddings-are-coordinates — essay note

**Drafted by:** Claude Opus 5, subagent (2026-09-13). Review lanes: Gemini 3.8 flash and Gemini 3.1 pro via agy; consolidation and one reader persona: codex gpt-5.6-sol (when not rate-limited).

**Pitch:** B ("similar" means whatever the training pairs said it meant), picked by the author
2026-09-13. **Drafted:** 2026-09-13 by a subagent, receipts before prose. Status to set: `drafted`.

**Shape as drafted.** Reader's situation (English queries fine, Spanish / jargon queries noise) →
the search step as setup (encode once, cosine formula glossed, normalised vectors make the whole
catalogue one matrix product, a two-number ranking where the wrong document wins) → pairs and the
in-batch contrastive loss (B × B cosine matrix, diagonal targets; temperature introduced and
justified before its value; InfoNCE formula glossed; softmax-cross-entropy gradient in words) →
worked example: one row, one step, two tables, one SVG figure → realistic sizes (B = 64, 384) →
limits (untrained pair types get no pull; shared weights in a transformer; web-trained image–text
encoder weaker on satellite/medical; cosine thresholds do not transfer because of the temperature;
what to do: model card, "multi" naming, own pairs, fine-tune on target-domain pairs) → exercise.

**Sources actually used** (page dumps in `workspace/embeddings-are-coordinates/pages/`, lecture
notes in `workspace/embeddings-are-coordinates/lectures.md`):
- course-4735368 34-02: pair scorer vs encoder, siamese pairs with 1/0 labels, mean pooling,
  cosine derived from the dot product (embeddings-01, -02, -06).
- course-4735368 34-04: masked mean pooling, 1.8 million × 384 matrix product + argsort on a CPU,
  ~22 million parameters, output width 384, the Spanish/Japanese failure and the "multi-qa is not
  multilingual" remark (embeddings-03, -04, -05, -13, -14).
- course-4735368 25-01: word2vec skip-gram with negative sampling as pairs labelled 1/0 (-07).
- course-6100015 05-04, 05-05: framing only (encoder maps an input to one vector; close points,
  similar meaning; model trained to have the property). No arithmetic in either (-15).
- raschka-qai physical pp. 27–29 (Q2, contrastive learning, siamese setup) and p. 218 (answer
  19-A, fine-tune for a new target domain) (-08, -16). pp. 19–21 (Q1) read, not cited.
- geron-pytorch physical pp. 702–703 (CLIP: normalise, m × m cosine matrix, per-row/column
  cross-entropy with diagonal targets, trainable temperature, large batches, batch 32,768,
  footnote naming InfoNCE) and p. 704 (weaker on domain-specific images) (-09, -10, -11, -12).
  pp. 632–633 (SBERT, all-MiniLM-L6-v2) read, cited only in receipt notes.

**Source problems hit.**
1. None of the cited lectures contains an in-batch / InfoNCE loss or a temperature. The course's
   sentence encoder is trained with a sigmoid head over (u, v, |u − v|) and binary cross-entropy.
   The slug instructions ask for InfoNCE with a temperature, so the loss is sourced to
   `geron-pytorch` (not in the catalog's sources) and the essay describes it as "a common way to
   train", not as what the course's model did.
2. The pitch names Raschka's *Build a Large Language Model (From Scratch)*; `raschka-qai` is
   *Machine Learning Q and AI*. Its relevant material is Q1/Q2 (descriptive, no formulas).
3. The Spanish failure in 34-04 is confounded: the lecturer blames same-language training pairs,
   then notices the checkpoint was not multilingual at all and swaps it. The essay therefore does
   not tell that case as evidence. It keeps the reader's situation in the opening and
   demonstrates the mechanism on its own toy (receipt embeddings-13 is `inferred` and records
   both causes).
4. **The 384 in the title.** It is receipted: 34-04, the output width of both MiniLM checkpoints
   the course uses (as of the recording; 34-02 also uses 384 as its illustrative width). The
   essay carries it in "a small sentence encoder of about 22 million parameters produces 384
   numbers per text", the 1.8 million × 384 catalogue and the B = 64 sizes paragraph. But the
   title contradicts Pitch B: the essay's point is that nearest neighbour is *not* the whole
   trick; the pairs are. Title change proposed below.

**Word count:** 2,768 words in the file; 1,780 words of prose (code block, tables, figure,
headings, formula lines and the source line excluded; walk-through bullets and expected result
included).

**Numbers and provenance.**
- Ranking example q = (1, 0), d1 = (0.6, 0.8), d2 = (0.8, −0.6), cosines 0.6 / 0.8: book's own
  (embeddings-17).
- τ = 0.1 → scores 6 / 8; softmax 1/(1 + e^2) = 1/(1 + 7.389) = 0.119 / 0.881; loss 2.127;
  score gradients ∓8.808 (embeddings-18, -20). e^2 from math.exp.
- τ = 1 bound: 1/(1 + e^−2) = 0.881 at best with two documents, loss floor 0.127 (-19).
- Cosine gradients (0.64, −0.48), (0.36, 0.48); loss gradients (−5.637, 4.228), (3.171, 4.228);
  after a 0.05 step (0.8819, 0.5886) length 1.0602 cosine 0.832, (0.6415, −0.8114) length 1.0343
  cosine 0.620 (-21, -22). Autograd prints [[-5.6371, 4.2278], [3.1709, 4.2278]] and
  [0.8317, 0.6202]. The pitch's own step used a different, simplified loss (sum of cosines) and a
  0.5 step; its numbers (0.854 etc.) are not used. The pitch's cosine-gradient (0.64, −0.48) is
  the same vector and is correct.
- 64 × 64 = 4,096 cosines, 63 negatives (-23, own arithmetic). 384, 22 million, 1.8 million
  (-04, -05, reported). 32,768 (-11, reported).
- Exercise figures (-24): loss 4.3275 → 0.0061; matching cosines; 6/6 English; Spanish 1/6 with
  vectors unchanged; 6/6 with pairs. Robustness checked in scratch runs over seeds 0–9: unseen
  Spanish 1, 3, 2, 1, 1, 0, 1, 0, 2, 1 of 6 (chance = 1); with pairs 6/6 every seed. Seed 0 is
  the script's seed and was not chosen for its result (a first version with seed 0 and four pairs
  had the unseen query landing on the right title by chance; the design was changed to six
  single-word Spanish queries so the result is a count, not one lucky or unlucky rank).
- τ = 1.0 variant (-25): loss 1.0168 at step 200, matching cosines 0.85–0.96, Spanish still 1/6 —
  from a modified copy, not saved in run.log. Floor claim: with six items per row the best
  possible row probability is 1/(1 + 5e^−2) = 0.596, loss ≥ 0.52, so "cannot drive it near zero"
  holds.

**Exercise:** `workspace/embeddings-are-coordinates/exercise.py` (identical to the essay's code
block, checked with diff), PyTorch 2.14 CPU, about 3 s; output `corpus/embeddings-are-coordinates/run.log`.
Uses `nn.EmbeddingBag(mode="mean")` as the encoder, `F.normalize`, `F.cross_entropy` over a
similarity matrix divided by τ, plain SGD. No downloads, no sentence-transformer.

**Deviations from the pitch.**
- Loss: pitch B's "cosine of positive minus cosine of negative with renormalising" replaced by
  in-batch InfoNCE with a temperature (per the slug instructions), so the hand step and the code
  compute the same thing.
- Exercise: pitch's 2-D points with random negatives replaced by a bag-of-words encoder over six
  hand-made query–title pairs, and the "leave a pair type out" test made concrete as Spanish
  queries against English titles, then fixed by adding those pairs.
- Pitch's "expected: matching cosines reach 1.000" does not happen with InfoNCE at τ = 0.1 (the
  loss is satisfied earlier); the essay turns that into a point about cosine thresholds.
- The word2vec ancestry is kept to one sentence.

**Checks (this slug only, 2026-09-13):** `node checks/receipts.mjs` — 25 passed, 0 failed,
0 skipped, 0 unchecked. `node checks/paraphrase.mjs --all` — 0 twelve-word failures, 0 eight-word
warnings. Exactly one `<!--mission-->`. Build not run (parallel agents; brief forbids it), so the
SVG and tables have not been seen rendered.

**Suggested catalog changes (not applied):**
- Title: **"Similar Means Whatever the Training Pairs Said"** (Pitch B's own heading). Alternative
  keeping the number: "384 Numbers Arranged by the Pairs You Trained On". The current title says
  nearest neighbour is the whole trick, which is the belief this essay argues against.
- `payoff`: "How an embedding model comes to put matching texts close together, worked through
  one training step by hand, and why queries of a kind it never trained on can come back as
  noise."
- `caution`: "Worked numbers and the toy encoder are the book's own. The course's model used a
  sigmoid pair classifier, not the in-batch loss shown here. In the exercise's lookup-table
  encoder an untrained pair's vectors do not move at all; in a transformer encoder they move as a
  side effect of other pairs, so real failures are less clean."
- `mechanism` (optional tightening): "Cosine similarity ranks stored vectors; an in-batch
  contrastive loss with a temperature pulls each training pair together and pushes the rest of
  the batch apart, so only pair types present in training are arranged."
- `sources[]`: C("4735368", "34-02", "34-04", "25-01"), C("6100015", "05-04", "05-05"),
  B("raschka-qai", "pp. 27–29, 218"), **add** B("geron-pytorch", "pp. 702–704").

**Owes:** measuring retrieval (recall of the right title, MRR) to
`measure-retrieval-before-blaming-the-model` (Part III), referenced in one sentence. Fine-tuning
an encoder on domain pairs is mentioned as the remedy without mechanics; LoRA/transfer essays do
not cover encoders specifically. Masked mean pooling (Pitch C) is one clause.
