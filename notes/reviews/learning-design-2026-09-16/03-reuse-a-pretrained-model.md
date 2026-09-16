# Chapter 3 — Reuse a Pretrained Model

Reviewed 2026-09-16 against the five learning-design criteria. Chapter content unchanged.
[Coverage and evidence](README.md).

**Outcome:** the chapter convincingly exposes why unchanged weights do not imply an unchanged
function, and why an unplugged adapter differs from one that preserves behaviour while attached.
The next improvement is to let the reader choose an adaptation strategy under stated constraints.

Learner job: choose what may change in a pretrained system, specify what must remain intact and
identify the evaluation needed. Route: `/chapters/reuse-a-pretrained-model.html`.

## 1. Independent decisions versus guided execution

**Good:** the three freeze variants compare buffers, weight movement and old/new task accuracy;
the LoRA comparison includes removal and merging as well as loss
([line 65](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:65),
[line 385](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:385)). These are meaningful
controls, not just a successful training run. Preserve them.

**Improve — medium, observed gap relative to the new goal:** the 178-line mission runs every
preselected option and reports the conclusions; it never asks which one the shop should use
([line 220](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:220)). The chapter correctly
says it shows mechanics, not a release choice, so this is an extension rather than a correction of
a false learning claim.

**Smallest change:** add one changed constraint brief within the same mission. Ask for an adaptation
choice, a rejected alternative, what state must remain unchanged and the validation needed before
release. Give label availability, memory constraints and the required old-task behaviour openly.
A written decision suffices. **Verify:** the response must explain the trade-off under those constraints,
not just repeat “freeze, then thaw” or select the lowest new-task loss.

## 2. Answer leakage across prose, code and outputs

**Good:** labelled A/B/C variants and `weights_moved()` make the difference between buffers and
parameters unusually inspectable. The rank-one table makes the adapter computation recomputable.

**Improve — medium if the same cases are reused as independent work:** the outcomes are disclosed
in the prose at [line 71](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:71), again in the
printed labels and expected results, and in the explanation at
[line 437](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:437). The final variations name
the parameter groups/target modules to edit and supply their outcomes
([line 439](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:439)). A final question asking
which original freeze “works” would be fully signposted.

**Smallest change:** retain the guided labels and expected output. Ask the changed case to apply
the relationship under a new constraint, with the answer and diagnostic hints after the attempt.
If adding a prediction pause on the original examples, put it before the original results; do not
claim that such a pause demonstrates novel diagnosis. **Verify:** the new decision is not supplied
by the prose, names or feedback available before committing an answer.

## 3. Fair assessment and defensible alternatives

**Good:** the text explicitly allows re-estimating BatchNorm statistics if validation supports it
([line 73](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:73)). It also says old behaviour
must be evaluated while an adapter is attached, and that removing the adapter is a narrower
guarantee ([line 202](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:202)). That is a
strong basis for evaluating alternatives rather than teaching one universal configuration.

**Improve — medium design opportunity:** no reader-decision rubric currently defines how much
old-task degradation is acceptable, which constraint dominates, or when to defer. Those values
must be given in a changed task or explicitly left for the reader to request. There is no observed
grader rejecting alternative solutions.

**Smallest change:** assess consistency with the stated constraints, evidence for the trade-off and
the proposed validation. Permit keeping the existing model, a separate model or a justified request
for more measurements when supported by the case. Do not require every answer to use LoRA, thawing
or a repair. **Verify:** a sound alternative can pass the rubric and an answer that confuses adapter
removal with preservation while attached cannot, regardless of which configuration it names.

## 4. Explanatory focus and proportionate workload

**Good:** the opening unifies the classifier and writer around “which numbers may change”
([line 5](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:5)). The memory table and small
rank-one diff provide concrete reasons for different adaptation techniques. Two mechanisms here
serve the chapter's shared decision; splitting them into unrelated essays would lose that connection.

**Improve — medium editorial opportunity:** the explicit situation → change → reason table appears
late at [line 204](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:204), after both detailed
paths. Preview or adapt it near the start, with only the terminology needed for orientation, then
return to it after the mechanisms. Do not duplicate the whole table and explanation.

The exercise contains two pretraining/adaptation pipelines; “about six seconds” describes execution,
not the work of understanding 178 lines. Let the reader pause after the freeze/thaw comparison and
resume at the writer section, preserving one mission. **Verify:** each part names what it established
and what decision remains; a pause does not silently discard required state. Whether an earlier
map improves comprehension remains a hypothesis for an author read, not a measured effect.

## 5. Limits of model-based learning evidence

**Good:** the production API snippets are marked illustrative; the synthetic-run limitation at
[line 217](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:217) explicitly separates the
demonstration from release evidence and asks for held-out prompts, old-task evaluation and peak
memory measurement. This is the clearest reusable evidence boundary among the four chapters.

The language-model losses are evaluated on the same `shop_format` and `old_text` lists used for
their respective fitting stages ([lines 339–382](/home/diablo/book20/chapters/reuse-a-pretrained-model.md:339)).
They demonstrate fit and interference on those strings, not unseen-format generalization. The
photo portion separately creates validation examples. Do not collapse these into a single claim
that everything is tested on training data or everything is held out.

**Improve — low clarity opportunity:** label writer output as loss on the supplied training strings
beside the printed comparison. Retain the existing real-project section rather than adding repetitive
caveats throughout. **Verify:** a reader can identify what was trained on, what was independently
evaluated, and why bitwise restoration alone says nothing about their own learning. A model-solver
pass on a later decision brief would remain a solvability observation. Self-marked exercise completion
is not measured competence.

## Recommended order

Preserve the controls and evidence boundaries; bring the decision frame forward; add one constrained
choice with an alternative-friendly rubric; audit its disclosure. No extra model download, full
fine-tuning lab or variant quota is needed.
