# Editorial review: priorities for chapters 1–4

Date: 2026-09-16

Scope: the current published chapters **Search the Catalogue**, **Trust the Number**, **Reuse a Pretrained Model**, and **Train From Reward**. This is a review of human readability, explanatory focus and learning design. It is not a code audit or a request to replace the chapters with the archived essays.

The author has noted the direction: preserve the examples and connected shop story; reduce mandatory detours, introduce each chapter's decision map earlier, and give the reader small pauses to think. The recommendations below are ordered by expected reader benefit. They are editorial judgments, not findings from measured learner trials. Creating this document does not apply the proposed revisions.

## 1. Make the main argument easier to follow

**Highest priority: reduce how much the reader must hold in memory before seeing why it matters.** The individual explanations are often clear, but their accumulation makes the chapters demanding. Preserve the substantial chapter format and the shop; give each chapter one visible question that its sections progressively answer.

At the beginning, briefly establish the problem, the main decisions and the observable outcome. Use ordinary prose or a small map rather than adding another list of unfamiliar terms. Review every section against that question: does it advance the argument, supply a necessary prerequisite, or belong in optional reading?

| Chapter | Organizing question | Concrete revision to consider |
|---|---|---|
| 1. Search the Catalogue | How does the shop find a relevant product, and why can the answer still be wrong? | Make the retrieval and generation stages explicit early. Consider making the cosine-gradient “One step” derivation optional. After retrieval, briefly establish what was learned, what is stored and what runs for a new query before introducing generation. |
| 2. Trust the Number | What evidence makes an accuracy number useful for a release decision? | Preserve the sequence from leakage through rare categories and costs. Move the JPEG loader discussion into an optional practical section or appendix so the release argument keeps its momentum. |
| 3. Reuse a Pretrained Model | How much of an existing model should change for the new task? | Move or adapt “Choosing how much of the model to change” near the beginning. Establish the head-only, thaw and adapter choices before the extended BatchNorm explanation. Keep the rank-one LoRA example. |
| 4. Train From Reward | How can preference tuning improve answers while avoiding a misleading reward? | Preview the reward-hacking result before entering the corridor. Explain what the corridor will help the reader understand, and reconnect it to the writer at the major transitions. Keep the distinction between the PPO clip and the reference penalty. |

**Review criterion:** a reader can explain the chapter's question and why the next section is needed without reconstructing the whole preceding chapter. Optional passages can be skipped without breaking the main explanation.

## 2. Add small pauses for prediction and explanation

The current pattern asks the reader to follow a long explanation and then inspect a substantial completed script. Add a few short checkpoints at conceptual transitions, before revealing the relevant result. These should interrupt passive reading without turning every section into a quiz.

Possible prompts:

- **Search:** if retrieval returns the right product, what could still make the answer wrong?
- **Evaluation:** what would change in the meaning of the score if all photos of one product stayed together?
- **Transfer:** if the weights are frozen, must the output for a fixed input remain unchanged? Explain the condition your answer depends on.
- **Reward:** if the reward-model score rises, what additional observation would make that improvement convincing?

Ask for a prediction or a short explanation, then provide nearby feedback after an explicit pause or reveal. Tie feedback to the reasoning rather than merely announcing the right answer. Do not introduce a checkpoint quota.

**Review criterion:** the reader has opportunities to formulate the important relationships before reading their explanations, and feedback helps resolve a plausible misunderstanding.

## 3. Separate guided exploration from independent judgment

Preserve the runnable scripts, worked outputs and suggested variations. They are useful guided demonstrations. The existing “Two things to try” passages often disclose both the change and its expected result; describe them as guided exploration rather than treating them as evidence of independent understanding.

Add one bounded changed situation where it serves the chapter's outcome. Define it with the question: **what must the reader discover, decide and demonstrate?** A short written decision can be sufficient; more code is not inherently better practice.

| Chapter | Possible independent task | What the reader produces |
|---|---|---|
| Search | Inspect an unfamiliar query, retrieved products and generated answer. Choose which stage needs investigation. | A diagnosis or competing explanations, plus the evidence that would distinguish them. |
| Evaluation | Compare two evaluation reports for a release decision. | A justified choice, or a request for missing evidence, tied to the deployment decision. |
| Transfer | Choose an adaptation strategy under label, memory and old-task constraints. | A choice, one rejected alternative and an evaluation plan. |
| Reward | Compare several tuning results without assuming the highest learned reward wins. | A recommendation or a decision to defer, with supporting observations and remaining uncertainty. |

State requirements, relevant constraints and success criteria before the attempt. Put diagnostic hints and answers afterwards. Inspect the combined disclosure across the question, surrounding prose, examples and any supplied outputs: moving one answer into a collapsed block does not help if the preceding paragraph already reveals it.

Accept defensible alternatives and “insufficient evidence” where appropriate. Do not imply that every case contains a defect or needs a model change.

**Review criterion:** the reader must make a consequential choice that the instructions have not already made, and the feedback explains how to judge that choice. A supplied answer or a successful script run is not evidence that a learner can do this independently.

## 4. Remove secondary reading friction while keeping necessary limits

Once the main path is clear, edit locally for momentum:

- Introduce terminology when it first helps answer a question the reader already has.
- Move incidental setup, environment and execution details into a run note where they interrupt the explanation. Keep code and arithmetic that actually teach the mechanism beside that explanation.
- Keep a qualification beside a claim when omitting it would mislead. For example, successful retrieval does not ensure a correct generated answer, and removing a LoRA adapter differs from preserving old behaviour while it is attached.
- Consolidate repeated reminders about synthetic data and production limitations where doing so preserves their meaning. Do not remove limitations simply to make the prose more confident.
- Vary endings and section transitions. End with the particular decision or unresolved limitation the chapter has earned, rather than a repeated generic structure.

**Review criterion:** each paragraph adds an explanation, consequence, example or necessary limitation. The text remains technically honest without repeatedly defending the teaching setup.

## 5. Make the diagrams readable at the point of use

The opening search pipeline becomes difficult to read at a phone width of 390 pixels: the entire SVG shrinks and its labels become tiny. Review the other diagrams for the same problem.

Consider a vertically arranged mobile version, a readable minimum width with horizontal scrolling, or an accessible enlarged view. Preserve captions and text alternatives. Choose the smallest change that lets the reader inspect the relationships without deciphering miniature labels.

**Review criterion:** the diagram's labels and connections remain usable at normal phone reading size, and the chapter still makes sense without relying on the image alone.

## 6. Validate the revisions through reading and a changed case

Revise one chapter first and use the author's response to adjust the method. Chapter 1 is the most useful opening pilot because it establishes the reading rhythm and contains the largest accumulation of new concepts. Chapter 2 provides a useful comparison for a strong organizing question; it is not a template every chapter must copy.

For the revised chapter, ask where the reader first lost the thread, which explanation needed rereading, and what they can now explain or decide in a changed situation. Distinguish unclear prose, missing prerequisites and a deliberately demanding concept. Record assistance used without treating it as failure.

If study-time guidance is added, separate reading, setup, guided exploration and independent work. Script execution time is not study time. Keep estimates provisional until a person reports an actual attempt. A later brief revisit can check whether the relationship remains explainable after the immediate example is gone.

**Review criterion:** revision decisions respond to specific reading observations and attempts. Passing code checks, a model review or an AI solver's success must not be presented as proof of human comprehension, difficulty or retention.

## What to preserve

- The shared shop and connections between chapters.
- Small worked examples whose calculations can be followed.
- The distinction between a mechanism demonstration and evidence for a real deployment.
- The chapter 2 progression from an attractive accuracy number to a defensible decision.
- The BatchNorm demonstration, rank-one LoRA example and reward-hacking payoff.
- CPU-based guided exercises that make the mechanisms observable.

## Guidance adopted into the review workflow (2026-09-16)

The reusable method is now in [the chapter review guide](notes/chapters/REVIEW-GUIDE.md).
The chapter checklist and actionable Codex/Gemini prompt load it explicitly, including review of
combined disclosure, independent decisions, assessment fairness and limits of model evidence.
This connects the recommendations to future reviews; it does not apply the chapter edits above.

## Guidance borrowed from Book21

The relevant local references are:

- [Series review: practice independence and reading friction](../book21/notes/reviews/claude-series-01-14.md).
- [Practice rework recipe](../book21/notes/practice-rework-recipe.md), especially defining an independent outcome, explanatory focus, visible requirements and proportionate task design.
- [Reusable review prompts](../book21/notes/practice-rework-prompts.md).

Borrow the editorial principles, not the entire security-book workflow. Book21's short-essay word targets, security repair sequence, weekly study budget, extensive evidence packs and external-review procedure are not automatically requirements for this ML book. Keep its connected chapter format. Add complexity only when it serves a specific reader outcome.
