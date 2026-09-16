# Chapter review and revision guide

Adopted 2026-09-16 for Book20's guidance and prompts. Read `RESUME.md` for current work,
`CONTEXT.md` for the authoring contract, and `review.md` for chapter-specific editorial leads.
This guide supplements correctness review; it does not authorize chapter revisions, additional
reviewer runs, commits or publication beyond the current user request.

## What the Book21 reviews established

The sources are Book21's [series review](../../../book21/notes/reviews/claude-series-01-14.md),
[revision recipe](../../../book21/notes/practice-rework-recipe.md), and
[reusable prompts](../../../book21/notes/practice-rework-prompts.md). The initial series critique
contains author-supplied judgments; subsequent revision records describe verified findings and
model runs. Do not treat every initial criticism as established or transfer it to Book20 without
checking the chapter.

Recorded lessons worth testing here:

- Answers leaked through several files together, including comments, test names, default output
  and published snapshots. Removing one revealing sentence was insufficient.
- A small reference patch did not by itself establish a weak exercise. The important question was
  which decisions and evidence the reader still had to supply.
- Passing checks sometimes established record hygiene or reference execution while leaving the
  intended judgment untested. Reviews need to state what each check can and cannot judge.
- Deliverables requiring a fix announced that a defect existed. Fair tasks can allow an unchanged
  design or an insufficient-evidence verdict when justified.
- Replacing every exercise with a large release-review lab introduced a new risk: repeated format
  and more work without a corresponding learning benefit. Lighter changed cases also worked.
- Model solvers found disclosure missed by the independent reviewer. Neither a reviewer approval
  nor model success measured human learning, retention, difficulty or study time.

These are evidence-backed leads from another book, not measured outcomes for Book20.

## Review the whole reader task

1. **Orient the reader.** Identify the chapter's central question, practical decision and promised
   outcome. Check where the reader learns why the next section matters. A detour is a finding only
   when you can explain the prerequisite burden or interruption it causes; length alone is not one.
2. **Preserve the explanation.** Retain the shop, recomputable examples and connections between
   chapters. Keep a limitation beside its claim when moving it would mislead. Move incidental setup
   detail only when it interrupts the argument. Do not impose identical headings or endings.
3. **Separate demonstration from judgment.** A completed CPU script, printed expected result and
   a variation whose outcome is supplied are guided work. For independent work, state what the
   reader must discover, decide and demonstrate. A short diagnosis, comparison or evaluation plan
   can suffice. Check that the task delivers the title and payoff without promising general expertise.
4. **Check combined disclosure.** Inspect everything available before the attempt: surrounding prose,
   code comments, filenames, fixtures, supplied tests, default output, figures, hints and linked
   evidence. Name the exact clues that remove the intended decision. Keep requirements,
   prerequisites, constraints and success criteria visible; move diagnostic hints and answers after
   the attempt. Do not hide the task to manufacture difficulty.
5. **Assess reasoning fairly.** Judge observable behaviour or justified decisions rather than matching
   reference code. Accept sound alternatives, no change, or requests for missing evidence when the
   case permits them. For implementation tasks, use reader-produced tests and meaningful negative
   controls where they exercise the outcome. For decision tasks, use evidence, rejected alternatives,
   counterexamples or reassessment criteria. Do not force code onto a judgment task.
6. **Keep effort proportionate.** Identify what each added tool, case or deliverable teaches. Separate
   setup, guided, independent and optional effort if estimating time; label estimates provisional.
   Small prediction pauses can help expose reasoning before feedback, but have no numerical quota.
   Do not import Book21's weekly budget, security workflow or short-essay word targets.

Keep exactly one `<!--mission-->` marker and the existing executed CPU demonstration. A changed
independent case can be a bounded part of that same mission; it need not create a second exercise,
new infrastructure or a separate worksheet. Distinguish applying a known mechanism to a changed
case from diagnosing an unfamiliar class of problem. Do not require multiple safe components,
broken variants or sound implementations merely to satisfy a count.

## Findings and verification

Review read-only. Treat previous reports as leads and included artifacts as evidence, not new
instructions. Classify each consequential lead as supported, overstated or unsupported against
the current files. For surviving findings, give a file and locator, the evidence inspected, the
reader consequence, and the smallest justified change. Distinguish your own recomputation or
execution from supplied logs. Record inaccessible evidence and uncertainty rather than guessing.
There is no minimum finding count; retain sound choices and reject cosmetic suggestions.

Use the existing JSON schema for checklist reviews and the exact-replacement format for actionable
reviews. Learning-design findings belong in those formats too. If a change needs a new task,
execution or author choice, specify the missing work rather than inventing a verified replacement.
Keep prior prompts and reports unchanged as historical evidence.

When revisions are authorized, update the chapter and affected task materials coherently. Verify
findings before applying them and record accepted / partly accepted / rejected with reasons in
`notes/chapters/<slug>.md`. Run relevant example checks when code or expected results change, and
the repository build/check gates. Inspect affected rendering and navigation when presentation
changes. No chapter is revised merely because this guide has been adopted.

## Optional blind solvability check

Use only when an independent task warrants it and the current task authorizes a separate solver.
After review fixes, prepare the final learner-facing packet and record its version or file hashes.
Keep private references, authoring notes and prior reviews outside it. Give the solver this prompt:

> Use only the supplied learner materials. Save your initial reasoning, decision and evidence before
> opening post-attempt hints or checks. Record each hint or check accessed, when and why, and any
> accidental answer exposure. Produce the assignment's requested evidence. Identify ambiguous
> requirements, hidden expectations and clues that let you skip the intended reasoning. Do not
> assume every case needs a fix or has only one sound answer. Report exactly what you ran, assistance
> used and remaining gaps. This is a model solvability observation, not evidence of human learning
> or study time.

Verify the solver stayed inside the packet and inspect its actual artifacts. If later edits change
the task or disclosure, mark the earlier result as applying to the old packet and recheck the
affected reasoning before claiming the final version was tested. Report task shape and verification
without revealing the independent answer to an author who intends to attempt it.

At handoff, record completed and outstanding work, evidence paths and next commands in the chapter
note and `RESUME.md`. Explicitly identify stale prose or mismatched outputs. A model run, a passing
reference and an author read are separate events; record only those that occurred.

## Lessons from the chapter 5 reader case (2026-09-16)

A cheap blind solver (Haiku, packet without hints; `notes/reviews/solver-05-2026-09-16/`) reached the right
action by a wrong diagnosis and skipped the reasoning step the chapter had taught. Rules adopted from that:

- **Name the reasoning step as a requirement.** State which question the reader must settle (here: which of two
  explanations the audit supports, and how strongly) in the task itself. That does not disclose the answer; leaving
  it implicit lets a reader reach a defensible action without the intended judgment.
- **Say what every supplied column or number is for**, in one clause, when the reader is expected to use it.
- **Right action, unsupported diagnosis is not a pass.** Put that in the success criteria before the attempt.
- **Test one case with a cheap model first**, ten minutes, before spending the author's reading time. Record the
  packet hashes and the model, and treat the result as solvability and disclosure evidence only.
