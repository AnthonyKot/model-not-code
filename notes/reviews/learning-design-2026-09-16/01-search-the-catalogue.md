# Chapter 1 — Search the Catalogue, Then Answer From It

Reviewed 2026-09-16 against the five learning-design criteria. Read-only assessment of chapter
content; proposals below are not implemented. [Coverage and evidence](README.md).

**Outcome:** a reader can trace and reproduce a search-to-answer pipeline, including two different
failure paths. The page does not yet ask them to diagnose a changed case independently. Preserve
the demonstration; add a small evidence-based diagnosis rather than a second implementation lab.

Learner job: given a query, retrieved material and an answer, distinguish what was retrieved from
what was generated and decide what evidence to inspect next. Route: `/chapters/search-the-catalogue.html`.

## 1. Independent decisions versus guided execution

**Good:** the code connects retrieval to generation directly: `answer()` passes the selected title
to the generator ([chapter line 385](/home/diablo/book20/chapters/search-the-catalogue.md:385)).
The output separates correct retrieval with a wrong answer from wrong retrieval with a faithful
description of that wrong product. This makes the two stages observable rather than just naming them.

**Improve — medium, observed gap relative to the new goal:** the mission supplies the full
115-line script, all expected outputs and their interpretation, then specifies both variations
([lines 283 onward](/home/diablo/book20/chapters/search-the-catalogue.md:283)). There is no required
reader diagnosis, prediction or evidence choice. Running it verifies reproduction, not whether the
reader can decide which stage to investigate. This is not a violation of the original guided contract.

**Smallest change:** retain this as guided work, then add one bounded changed-case diagnosis in the
same mission. Supply the query, relevant catalogue facts, retrieved titles and generated answer;
ask for the next investigation, evidence supporting it and one competing explanation. No model
training is necessary for that part. **Verify:** the response requires reasoning about the new case
and cannot be completed by copying a printed diagnosis from this page.

## 2. Answer leakage across prose, code and outputs

**Good:** the workings are inspectable. The English/Spanish pair lists, training loop and generator
examples explain exactly what the demonstration does. Those are useful disclosures for guided work.

**Improve — medium if this material is reused as independent practice:** the disclosure is combined:
the missing-pair explanation gives the remedy at
[line 231](/home/diablo/book20/chapters/search-the-catalogue.md:231); the failure section names the
wrong-answer cases at [line 278](/home/diablo/book20/chapters/search-the-catalogue.md:278); the script
labels its checks; and “Two things to try” supplies the exact extra loss and resulting score at
[line 445](/home/diablo/book20/chapters/search-the-catalogue.md:445). Merely hiding the final output
would not make those same questions independent. The rendered mission has no hint/answer disclosure.

**Smallest change:** leave the guided explanations intact. Use different evidence for the changed
case, state the task and success criteria openly, and place its diagnosis and diagnostic hints after
the attempt. **Verify:** inspect prose, names, comments and outputs together; none supplies the
changed case's conclusion before the reader commits to an explanation. Applying the taught mechanism
is expected; disguising all resemblance to the lesson is not the goal.

## 3. Fair assessment and defensible alternatives

**Good:** the text says a click need not prove relevance and recommends held-out query–title pairs
([line 203](/home/diablo/book20/chapters/search-the-catalogue.md:203),
[line 233](/home/diablo/book20/chapters/search-the-catalogue.md:233)). This supports uncertainty and
evidence gathering instead of treating one metric as an answer to every question.

**Improve — medium design opportunity:** current feedback is an expected transcript. It cannot judge
a diagnosis or distinguish a sound request for more evidence from an incorrect answer. There is no
observed unfair grader; there is no decision rubric yet.

**Smallest change:** assess whether the reader identifies the evidence available at each stage,
supports the investigation proposed and states what would change their conclusion. Permit a
justified “insufficient evidence” or “neither stage shown faulty,” where the authored case supports it.
Do not demand a code change or assume every case has exactly one broken stage. **Verify:** review a
sound alternative investigation and an unsupported confident diagnosis against the rubric; it should
distinguish them for their reasoning, not for matching reference wording.

## 4. Explanatory focus and proportionate workload

**Good:** the opening already states the two goals and introduces a pipeline map
([lines 3–5](/home/diablo/book20/chapters/search-the-catalogue.md:3)). The prior suggestion that the
chapter needs an initial map is therefore overstated if read as saying none exists. Small arithmetic
examples and the shared training loop make later chapters possible; removing them wholesale would
undermine the connected book.

**Improve — medium, observed presentation issue:** at 390px viewport width the 720-unit SVG renders
358px wide. Its nominal 10–12px labels scale to roughly 5–6px. The
[captured diagram](search-mobile-diagram.png) confirms that the map is much harder to read than its
caption. **Change:** provide a readable mobile arrangement or an accessible enlarged view.
**Verify:** its labels and connections can be read at normal mobile scale without relying on tiny text.

**Optional editorial hypothesis:** the cosine-gradient “One step” passage at
[line 219](/home/diablo/book20/chapters/search-the-catalogue.md:219) can become an optional deeper
derivation after the practical training explanation. It interrupts the query-to-answer progression,
but no learner timing or confusion was measured. Test a skippable version with the author while
retaining the worked result and necessary definitions. Do not add a setup-heavy diagnostic lab.

## 5. Limits of model-based learning evidence

**Good:** the synthetic scope is explicit at
[line 66](/home/diablo/book20/chapters/search-the-catalogue.md:66), and the real-project section asks
for held-out evidence. The six English training pairs also supply the displayed top-1 measure
([lines 337–348](/home/diablo/book20/chapters/search-the-catalogue.md:337)); the chapter does not
present that as a production evaluation. Its expected output matches the stored run log exactly.

**Improve — low clarity opportunity:** label that displayed measure as fit on the toy training pairs
where the reader encounters it. If adding a changed case, keep completion as self-reported practice
and record assistance separately from correctness. Browser inspection confirmed that the current
completion button needs no submitted reasoning and persists a self-marked state; it does not claim
certified mastery. **Verify:** neither a matching transcript, a model-solver pass nor a completion
click is described as demonstrated human learning. “A few seconds” remains execution time, not study time.

## Recommended order

Preserve the guided pipeline; add a short diagnosis and rubric; check its combined disclosure;
repair the mobile map. Trial any optional derivation change with the author. No new learner task
or reference answer has been authored in this review.
