# attention-is-a-soft-lookup — essay note

**Drafted by:** Claude Fable 5.1, subagent; review fixes applied by the main session (Fable 5.1) (2026-09-13). Review lanes: Gemini 3.8 flash and Gemini 3.1 pro via agy; consolidation and one reader persona: codex gpt-5.6-sol (when not rate-limited).

**Pitch:** B (the causal mask; row invariance when a token is appended), picked by the author
2026-09-13. The opening two steps borrow Pitch A's soft-lookup framing on the same toy keys and
values; row 3 of the worked table is Pitch A's lookup (0.665 / 0.090 / 0.245 → (0.910, 0.335)),
so A's example survives inside B's table. **Drafted:** 2026-09-13 by a subagent, receipts first.

**Sources actually used:** course-4735368 28-02 (the fullest: shapes, √d_k, row-wise softmax,
the mask as zeroed future weights, token-by-token decoding, cross-attention unmasked);
course-6538601 02-02 (Q/K/V from the same embeddings, the "database" framing, the divisor's
reason as read from the paper, mask skipped as optional, decoder input shifted right);
course-6100015 03-18 (only for the four attention projections; intuition-level, no arithmetic);
raschka-qai physical pp. 117–119 (Q17: context vector = attention-weighted sum), 123–126 (Q18:
BERT's masked LM; the decoder's masked self-attention and the autoregressive property);
llm-deep-dive physical pp. 63 (§2.2.1, eqs. 2.11–2.12), 64 (§2.3.2), 66 (§2.3.5), 68 (§2.3.8,
eq. 2.19 — the mask as a matrix of −∞ added before the softmax), 81 (§2.5.2.1 causal LM loss;
§2.5.2.2 masked LM). Page dumps in `workspace/attention-is-a-soft-lookup/pages/`.

**Source problems hit.** (1) The pitch names Raschka's *Build a Large Language Model (From
Scratch)*; it is not in the manifest. `raschka-qai` is *Machine Learning Q and AI*, whose
attention material is Q17–Q18: it states the masked decoder and the autoregressive property but
nothing about the −∞ implementation. (2) The −∞-before-softmax form is therefore NOT the book's
own restatement: `llm-deep-dive` physical p. 68 states it in so many words with a formula, and
the essay cites that page (`attention-12`, reported). The −1e9 stand-in for −∞ in the code is the
book's implementation choice and the receipt says so. (3) The TensorFlow lecture describes the
mask as zeroing the weights of future positions on a diagram of an already computed table; that
description would leave rows that do not sum to one. Under CONTEXT §4 the essay states the correct
(additive, pre-softmax) version and does not stage the disagreement; the receipt for
`attention-06` records what the lecture says. (4) Lecturer slips not repeated: 28-02 says "the
square of 32" before reading √d_k from the paper; 02-02 says 1/d_k before correcting to 1/√d_k;
28-02's multi-head walk-through concatenates four 5 × 64 heads to 5 × 256 and then says the
output linear layer gives 5 × 64 (it must give d_model for the residual add). None of these is
in the prose.

**Word count:** 2,462 in the file; 1,900 prose by the pilot's method (code block, tables and
source line excluded), 1,829 with headings and the two formula lines also excluded. Over the
1,800 guide by a little; the "What the mask does not do" section is the part to trim if a
reviewer asks (the quadratic-cost sentence and the multi-head sentence are Pitch C's territory
and could go first).

**Numbers and provenance.** Every figure in the prose is either derived on the page or in a
`reported` receipt:
- Worked table (keys, values, queries, raw and scaled scores): the book's own, `attention-16`,
  recomputable by hand (d_k = 4, divisor 2).
- Masked row 2: 0.119 / 0.881 → (0.119, 0.881); two-token row 2 identical (`attention-17`).
- Unmasked row 2: 0.107 / 0.787 / 0.107 → (0.213, 0.893); row 1 unmasked 0.384 / 0.384 / 0.233
  → (0.616, 0.616); row 1 masked (1, 0) (`attention-18`).
- Row 3: 0.665 / 0.090 / 0.245 → (0.910, 0.335) (`attention-19`).
- Fourth token: rows 1–3 unchanged under Python `==`; row 4 0.297 / 0.109 / 0.297 / 0.297 →
  (0.594, 1.000); unmasked rows become (0.500, 0.878), (0.165, 1.142), (0.835, 0.472)
  (`attention-20`).
- e^2 = 7.389, e^1 = 2.718, e^0.5 = 1.649: from `math.exp`, in the receipts' notes.
- 8 heads, d_k 64, d_model 512: `reported`, TensorFlow course 28-02 (`attention-10`), named as
  the course's report in the prose per the 2026-09-13 rule.
- The pitch's numbers (0.665/0.090/0.245, (0.910, 0.335), 0.119/0.881, (0.119, 0.881),
  0.107/0.787/0.107, (0.213, 0.893)) all verified; the pitch was right. The pitch gave no
  concrete key/query vectors; the essay's are chosen so that rows 2 and 3 reproduce them.
- Exercise "try": `math.exp(-30)` = 9.36e-14 ≠ 0.0 and the `==` assertion fails — verified
  with a modified copy of the script (not saved); the prose gives no number for it.

**Exercise:** plain Python, no numpy; `workspace/attention-is-a-soft-lookup/exercise.py`, run
with Python 3.12.3, output in `corpus/attention-is-a-soft-lookup/run.log`. The essay's code
block is the same script minus the two-token check (which the prose states and run.log shows).

**Checks:** `BUILD_ALL=1 npm run build && BUILD_ALL=1 npm run check` 2026-09-13: this slug
22 receipts passed, 0 failed, 0 unchecked; 0 twelve-word paraphrase failures, 0 eight-word
warnings; site validation passed. Note that `BUILD_ALL=1 npm run build` rewrites tracked files
under `docs/` (index, about, 404, the LoRA page); nothing there was edited by hand.

**Suggested catalog changes (not applied — catalog not owned):**
- Add `B("llm-deep-dive")` to the essay's sources: it is the only cited page that states the
  −∞ additive mask (physical p. 68) and the causal-LM loss (p. 81); the essay depends on it.
- Keep `raschka-qai` but note in `caution` that its attention material (Q17–Q18) is
  descriptive: no formulas, no mask implementation.
- Title unchanged and matching. Optional `caution`: "worked numbers are the book's own; the
  8 × 64 / 512 configuration is the TensorFlow course's report of the 2017 paper".

**Owes:** the KV cache mechanism to `kv-cache` (Part IV), referenced in one sentence; the
quadratic-cost point (Pitch C) is stated in one sentence without numbers and could be dropped if
a cost essay is ever added. Nothing borrowed from other essays.

**Style checks done by hand:** no "we"; no inline lecture citations; the course named once
where the 8/64/512 figure is its report; "attends to" avoided throughout (the lecture's phrase
is not used); no slogan ending (the last prose paragraph is a limit, the exercise closes).

**Review (2026-09-13, main session):** three reader personas read (review lanes launched; report
to be read next session in checks/reviews/attention-is-a-soft-lookup/). Applied from readers:
formula now scales before masking, matching the code; dot-product sentence now says magnitude
counts as well as direction; the "hides work without saving it" claim bounded (production kernels
skip masked blocks); "not finished" tone softened; the (0.213, 0.893) value confirmed against the
exact softmax (0.8935 rounds to 0.893 from the unrounded weights); "the TensorFlow course reports"
removed. Rejected: replacing the hand-sized integer vectors with "realistic" ones.
Flash lane (read 2026-09-13, late): applied — row-index/target notation (row i predicts i + 1),
row 4's own scores and softmax written out, rounding note on (0.213, 0.893), expected-result
strings matched to the script's printed lists. Rejected — attributing the eight-heads/512 figure
to the course in prose (against §4). Pro lane idled out twice; not rerun.
