# Chapter 2 — Trust the Number Before You Ship the Classifier

Reviewed 2026-09-16 against the five learning-design criteria. Chapter content unchanged.
[Coverage and evidence](README.md).

**Outcome:** this has the strongest explicit decision frame of the four chapters: what evidence
would justify release? Its guided exercise has a concrete mismatch with that promise: the release
record is per listing, while the supplied script reports per photo. Resolve that before expanding practice.

Learner job: assess whether an evaluation supports the proposed listing-level release, and name
the missing evidence or justified decision. Route: `/chapters/trust-the-number.html`.

## 1. Independent decisions versus guided execution

**Good:** the opening explains how the initial accuracy claim will change without changing the model
architecture ([line 5](/home/diablo/book20/chapters/trust-the-number.md:5)). The cost table, separate
category/flag decisions, augmentation counterexample and release record make consequential choices visible.

**Improve — medium, observed gap relative to the new goal:** the script chooses the split, weights,
threshold grid and cheapest threshold for the reader; the closing variations prescribe the flip and
new cost ([line 285](/home/diablo/book20/chapters/trust-the-number.md:285),
[line 360](/home/diablo/book20/chapters/trust-the-number.md:360)). There is no release recommendation
for the reader to justify. The original guided exercise still has value.

**Smallest change:** after the corrected guided example, supply a short changed evaluation packet
and ask whether it supports release, conditional release or a request for more evidence. Include
the decision unit and operational constraints, and ask for one rejected alternative and a reason.
**Verify:** the response must connect the report to the deployment decision, rather than simply
select the largest accuracy or rerun `min(grid, key=cost)`.

## 2. Answer leakage across prose, code and outputs

**Good:** the author makes the demonstration's constructed leakage visible: shared product borders,
the photo split and the sibling count explain why the comparison changes. Concealing those would
make the guided mechanism harder to understand.

**Improve — medium if reused as assessment:** the complete answer path is already on the page.
The main prose explains the flip failure at
[line 133](/home/diablo/book20/chapters/trust-the-number.md:133); the code names each evaluation
stage and prints the chosen threshold; the last paragraph gives the edit and outcome for both
variations. A “predict the same flip” question at the end would mostly test recall of those results.

**Smallest change:** keep these as guided comparisons. Give the independent packet a changed
evidence problem and separate its feedback from its brief. Do not label candidate reports “leaky”
or “correct,” and do not hide the split metadata the reader needs to judge them. **Verify:** a combined
read of packet headings, prose, data and output leaves the decision open while the requirements remain clear.

## 3. Fair assessment and defensible alternatives

**Good:** the chapter admits that mistake costs need an owner, that review capacity matters, and
that averaging four scores is a choice to compare with alternatives
([lines 99–119](/home/diablo/book20/chapters/trust-the-number.md:99)). Those are strong foundations
for accepting a conditional decision or deferral rather than forcing one threshold.

**Improve — high, observed reproducibility defect:** the exercise introduction says it “prints every
number the release record above uses”
([line 190](/home/diablo/book20/chapters/trust-the-number.md:190)). The release record reports 0.946
accuracy on 500 listings, threshold 0.05, recall 0.684 and cost 258
([line 175](/home/diablo/book20/chapters/trust-the-number.md:175)). The mission code instead evaluates
photo tensors, and its shipped output is 0.886 accuracy, threshold 0.02, recall 0.711 and cost 1114
([lines 307–317](/home/diablo/book20/chapters/trust-the-number.md:307),
[line 351](/home/diablo/book20/chapters/trust-the-number.md:351)). A faithful run cannot reproduce the
promised record; readers may wrongly diagnose their setup or aggregate at the wrong unit.

This is not an invented or unsupported release number. The separate
`workspace/trust-the-number/listing_check.py` aggregates four probability vectors per listing and
the existing `corpus/trust-the-number/run-variations.log` contains the claimed listing results.
The [earlier drafting note](/home/diablo/book20/notes/chapters/trust-the-number.md:35) explicitly
records a partial conversion. That supports the cause: a prose update not carried through to the mission.

**Smallest correction:** narrow the exercise's promise to its photo-level comparison and explicitly
separate the listing result. **Preferred learning fix:** add a short listing aggregation/report stage
to the same guided script, using the existing verified variation, while retaining the photo comparison.
No new lab is needed. **Verify:** the publicly supplied instructions reproduce every result they claim,
with units and validation/test choices explicit. Keep tests of reader judgment distinct from numeric reproduction.

For a future decision rubric, accept deferral when the packet omits acceptable risk, review capacity
or sufficient evidence. Do not penalize an alternative aggregation solely because the reference uses a mean;
ask what validation supports it.

## 4. Explanatory focus and proportionate workload

**Good:** the split → rare category → cost → release sequence answers a practical question throughout.
The chapter also distinguishes nondeterministic loader timings from the deterministic results
([line 338](/home/diablo/book20/chapters/trust-the-number.md:338)). Preserve those distinctions.

**Improve — medium editorial opportunity:** the loader section introduces a second job, throughput
tuning, just before the release record ([line 146](/home/diablo/book20/chapters/trust-the-number.md:146)).
It is relevant to the comparison budget, but its worker, prefetch and memory detail delays the release
decision. Consider an optional practical section and make the final timing stage skippable independently.
The existing mission has 132 Python lines; its short execution estimate does not measure reading or setup.

**Verify:** the main argument and release result remain complete when loader tuning is skipped, while
readers who need it can still run that demonstration. Actual time saved or improved comprehension
needs author/learner feedback; it was not measured here.

## 5. Limits of model-based learning evidence

**Good:** synthetic data is declared, real label quality and production drift are called out, and
the listing recall's small sample is acknowledged
([line 119](/home/diablo/book20/chapters/trust-the-number.md:119),
[line 185](/home/diablo/book20/chapters/trust-the-number.md:185)). Expected output matches the stored
baseline log; that does not resolve the separate listing promise above.

**Improve — low clarity opportunity:** distinguish reproduced evaluation code from a justified release
recommendation in the mission's feedback. The shared “Check your understanding” action currently
asks only for output comparison, and completion is self-marked. Do not describe that as demonstrated
release judgment. A future model review of the packet can test ambiguity and solvability, not human
readiness or a safe real-world deployment. **Verify:** evidence records state the unit, data, assistance
and exact claim supported, without converting test success into competence.

## Recommended order

Resolve the photo/listing promise first; add one short release-decision packet and rubric; then test
whether making loader work optional improves the reading path. Do not rebuild all evaluation tooling
merely to add independent judgment.
