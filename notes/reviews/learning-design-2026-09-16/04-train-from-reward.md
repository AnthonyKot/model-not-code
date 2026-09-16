# Chapter 4 — Train From Reward

Reviewed 2026-09-16 against the five learning-design criteria. Chapter content unchanged.
[Coverage and evidence](README.md).

**Outcome:** the chapter gives a strong, inspectable demonstration that optimizing a learned reward
can worsen the objective it represents. The independent task should ask the reader to judge evidence
for a tuning decision, not merely reproduce the provided preference for a particular setting.

Learner job: decide whether observed tuning results justify proceeding, distinguish reward from
independent evaluation and name the next evidence needed. Route: `/chapters/train-from-reward.html`.

## 1. Independent decisions versus guided execution

**Good:** the same `ppo_loss` is used for the corridor and the writer, with scalar gradient checks
and controlled clip/penalty comparisons
([line 274](/home/diablo/book20/chapters/train-from-reward.md:274),
[line 490](/home/diablo/book20/chapters/train-from-reward.md:490)). This shows how the relationship
transfers between the two systems, rather than presenting two unrelated recipes.

**Improve — medium, observed gap relative to the new goal:** all four tuning configurations, the
failure interpretation and both beta variations are supplied. The 226-line script offers no decision
the reader must justify before seeing its interpretation
([line 266](/home/diablo/book20/chapters/train-from-reward.md:266),
[lines 537–539](/home/diablo/book20/chapters/train-from-reward.md:537)).

**Smallest change:** retain the entire guided comparison, then add a short changed-run evidence
packet. Ask whether to continue, stop, keep the reference or gather more evidence; require the
supporting observations and a falsifying follow-up check. No new training stack is needed.
**Verify:** selecting the largest reward or copying a known beta value is insufficient to satisfy
the task, while a justified deferral can be sufficient.

## 2. Answer leakage across prose, code and outputs

**Good:** the synthetic scoring rule and word-sum reward model are inspectable, so readers can
understand precisely why the exploit happens. This transparency is appropriate for demonstration.

**Improve — medium if converted directly into assessment:** the heading “watch it game the reward,”
the reward-weight explanation, full run tables, labelled configurations and closing variations all
announce the diagnosis and outcomes
([line 162](/home/diablo/book20/chapters/train-from-reward.md:162),
[line 216](/home/diablo/book20/chapters/train-from-reward.md:216),
[line 539](/home/diablo/book20/chapters/train-from-reward.md:539)). Hiding only the last table would
not make selecting among these same runs independent. Supply a changed judgment problem rather
than removing the evidence that teaches this one.

**Low, observed wording ambiguity:** “It is never shown to the learner” at
[line 142](/home/diablo/book20/chapters/train-from-reward.md:142) and “the learner never calls it”
at [line 504](/home/diablo/book20/chapters/train-from-reward.md:504) refer to the trained model,
not the human reader. The human sees `hidden_score` at
[line 348](/home/diablo/book20/chapters/train-from-reward.md:348). Inspection of `tune()` confirms
that the optimization reward uses the reward model and KL, not `hidden_score` directly; evaluation
does call it. This is not a discovered leak into the policy's training reward.

**Smallest change:** explicitly name the policy/reward-model training process instead of “learner.”
For future independent practice, keep diagnostic answers separate while making its evaluation
requirements visible. **Verify:** readers can distinguish what the model can access from what the
person doing the exercise can inspect.

## 3. Fair assessment and defensible alternatives

**Good:** the ten-seed discussion reports exceptions: unclipped runs sometimes succeed, and a repeated
phrase can receive the maximum hidden score
([line 245](/home/diablo/book20/chapters/train-from-reward.md:245)). The chapter says the clip is
not a hard bound ([line 117](/home/diablo/book20/chapters/train-from-reward.md:117)). These prevent
the example from becoming a universal “always enable these settings and you are safe” rule.

**Improve — medium design opportunity:** the last interpretation returns to the selected run's
clean contrast. An independent exercise needs a rubric that accepts justified uncertainty and
does not make the supplied hidden score the final definition of good answers. No unfair automated
decision grader currently exists; the gap is the missing decision assessment.

**Smallest change:** assess separation of optimized reward, independent observations and untested
assumptions; require comparison with the reference and an explanation of remaining uncertainty.
Allow changes to data, evaluation or stopping criteria rather than requiring one hyperparameter fix.
State the quality constraints before the attempt. **Verify:** a high-reward run unsupported by
independent evidence is not accepted just because it wins numerically, and a reasoned request for
fresh comparisons can pass without proposing a code change.

## 4. Explanatory focus and proportionate workload

**Good:** the opening already previews the reward-hacking result and says why the corridor precedes
the writer ([line 5](/home/diablo/book20/chapters/train-from-reward.md:5)). The prior recommendation
to add that preview is overstated if taken literally. The corridor-to-writer mapping table at
[line 125](/home/diablo/book20/chapters/train-from-reward.md:125) is a strong bridge worth preserving.

**Improve — medium editorial opportunity:** Monte Carlo, Q-learning, target networks and replay
arrive before the policy-gradient route the writer actually uses
([lines 40–67](/home/diablo/book20/chapters/train-from-reward.md:40)). These belong to the approved
chapter plan, so deletion is not the default. Clarify their role as a comparison, keep the hand-worked
contrast, and consider making the target-network/replay extension optional before returning to the writer.

The full mission spans return calculation, gradient checks, corridor training, supervised fitting,
preference labels, reward fitting and PPO. “Eleven seconds” is an execution estimate, not a learning
budget. Add explicit pause points after the gradient/corridor work and after reward fitting, with
what has been established at each point. **Verify:** readers can resume the guided path with the
needed state and know which result the next stage tests. Improved comprehension/time remains an
unmeasured hypothesis; do not prescribe a larger lab to compensate for dense prose.

## 5. Limits of model-based learning evidence

**Good:** the measured/learned/assumed table is particularly valuable
([line 154](/home/diablo/book20/chapters/train-from-reward.md:154)). The text admits the exploit was
built into the toy reward model, reports seed variation and asks for people to judge fresh prompts
in real release evaluation ([lines 247–255](/home/diablo/book20/chapters/train-from-reward.md:247)).
Stored baseline and variation logs support the examples as recorded synthetic runs, not human preferences.

**Improve — medium clarity opportunity:** distinguish unseen sampled answers from unseen prompt
types beside the reported held-out agreement. `pairs[:500]` and `pairs[500:]` split sampled pairs
from the same three product prompts; `evaluate()` samples with a fixed seed from those products
([line 394](/home/diablo/book20/chapters/train-from-reward.md:394),
[line 444](/home/diablo/book20/chapters/train-from-reward.md:444),
[line 459](/home/diablo/book20/chapters/train-from-reward.md:459)). The real-project section already
requires splitting by prompt. Keep that distinction close to the toy result so “fresh answers” is
not read as a new-prompt evaluation. The deterministic hidden scorer is also a limited proxy, not
ground truth about human satisfaction; the repeated-phrase exception demonstrates its limit.

**Verify:** feedback distinguishes reward optimization, toy held-out pairs, new-prompt evaluation
and human preference evidence. None establishes that the reader learned the mechanism. A future
blind model solving the decision packet would test solvability and disclosure only; the current
self-marked completion button records neither learning nor correctness.

## Recommended order

Add a compact run-judgment task and fair rubric; clarify “learner” and the toy evaluation boundary;
trial pause points and optional background. Preserve the shared loss, counterexamples and seed
exceptions. No new independent case or answer key was created in this review.
