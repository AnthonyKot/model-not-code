# augmentation-declares-invariance — essay note

**Pitch:** A (a transform is a claim that the label does not change; a wrong claim costs accuracy), picked by the author 2026-09-13. **Drafted:** 2026-09-13 by a subagent, receipts first, following `notes/essays/DRAFTING-BRIEF.md` and the slug notes in the dispatch prompt.

## Sources actually used
- course-4735368 (Deep Learning Masterclass with TensorFlow 2): **11-04** (face-expression stack of rotation/flip/contrast; 75% → 54%; upside-down faces; rotation factor as a fraction of a full turn, 0.25 → 90°, 0.025 → 9°; ≈78% after limiting; add transforms one at a time; training-only augmentation); **11-02** (three-class angry/happy/sad dataset); **08-05** (per-transform probability p; rotation safe and crop avoided for malaria cell images; grid shuffle, cutout; visualise outputs; boxes and masks must move with spatial transforms); **08-03** (single-image transforms keep the label, mixup changes it; one sentence only). 08-02 and 08-04 have no captions and were not read.
- geron-pytorch physical p. 468 (printed 438, "Data Augmentation" sidebar: realistic variants, a person should not tell; flip except text and asymmetrical objects), p. 469 (printed 439, training-only, TTA exception; only in aug-07 note), pp. 492–493 (printed 462–463, `torchvision.transforms.v2` pipeline). Physical = printed + 30. Dumps in `workspace/augmentation-declares-invariance/pages/`.
- torchvision `RandomRotation` docs, fetched 2026-09-13 (degrees d → range −d to +d; sampling distribution not stated, so the essay does not say "uniform").

## Word counts
2,664 words in the file; about 1,740 prose (code blocks, tables, figure, headings, mission marker and credit line excluded; about 1,795 with headings).

## Provenance of every number
- 75%, 54%, ≈78%, ±9°, three classes — `reported` (aug-01..04).
- 0.25 × 360 = 90°, 0.025 × 360 = 9° — arithmetic on the page; convention `reported` aug-05. The failing run's exact factor is not clearly shown in 11-04, so the essay says only that the range turned faces sideways and upside down (not "0.25 was used").
- p = 0.3 → three in ten — `reported` aug-08 (essay drops the lecture's 10,000-image figures).
- Worked-example table 1,000 × 20 = 20,000; 0.5³ = 0.125; 2,500; 17,500; 10,000 — `observed` aug-17/18. **The pitch's arithmetic was correct.**
- Hook matrix and its flip, `[0.762, 1.0]` / `[0.531, 1.0]` (shape) and `[1.0, 0.492]` / `[1.0, 0.513]` (facing) — `observed`, `corpus/augmentation-declares-invariance/run.log` (aug-19..21). Seeds 2–5: shape no-flip 0.818/0.695/0.73/0.709, flip 1.0 every time; facing no-flip 0.979/0.954/0.969/0.994, flip 0.535/0.491/0.502/0.508 (receipt notes; the essay quotes the 0.695–0.818 range).
- Variation "shape task trained on both facings → `[1.0, 1.0]`" — run once, `observed` aug-24 (not in run.log).
- Audit table verdicts — `hypothesis` aug-22, labelled in the prose as the book's own starting judgement.
- `degrees=10`, ImageNet mean/std in the illustrative snippet — from geron-pytorch pp. 492–493 (the book uses degrees=30; the essay uses 10 to match the "small rotation" row); not executed.

## Deviations from the pitch
- Exercise replaced as instructed: the pitch's paper audit became a body section (audit table, five transforms × four tasks, with "look" cells), and the exercise is an executed PyTorch run with a synthetic 8 × 8 glyph task and `torch.flip`, showing the flip help one labelling and break the other on the same pixels.
- The pitch's eight transforms trimmed to six rows (vertical flip merged with 180° turn; cutout dropped) to keep the table readable.
- A 3 × 3 hook figure replaces a flip table (shape of the example is visual).
- Mixup/cutmix: one sentence in limits (Pitch C territory).
- All four eight-word paraphrase warnings are digit runs ("0 0 0 0 0 1 0 0") from the SVG/matrix text matching a numeric printout in 11-03 — generic, left as is.

## Suggested catalog fields
- **title:** keep "Augmentation Is Telling the Model What Does Not Matter".
- **payoff:** "Why adding a standard flip or rotation can lower validation accuracy, and how to check which transforms your labels actually allow before you train."
- **caution:** "The audit table is a starting judgement, not a rule; the exercise data is synthetic and the face-classifier figures come from one run."
- **mechanism line** (current mentions mixup/cutmix, which this essay only names): "Each transform keeps the label and so declares an invariance; a false declaration trains on contradictory or unseen inputs."
- **sources[]:** C("4735368", "08-03", "08-05", "11-02", "11-04"), B("geron-pytorch", "pp. 468–469, 492–493"), plus the torchvision RandomRotation docs URL (as of 2026-09-13). Adds 11-02.

## Owed
- Pitch C (mixup/cutmix) is referenced as "a separate essay"; if C is never drafted, that sentence needs cutting.
- `input-pipeline-is-the-bottleneck` may want to point back here for "augmentation runs inside the training input map".
