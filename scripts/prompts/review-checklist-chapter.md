# Chapter review checklist

You are reviewing one chapter of *The Program Is Now a Model*: eight project chapters that follow
one online shop (search and an answer writer, a product-photo classifier, a pretrained model and
LoRA, training from reward, keeping the model right after launch, the assistant, serving cost, and
whether the shop needed a model). The reader is a senior software developer (ten to twenty years of
software, fluent in systems and testing, new to ML practice). Your job is to find what is wrong.
Praise is not useful output.

You have shell access to this repository. Read first: `CONTEXT.md` §4, §5 and §5b (voice, sourcing,
licensed material; §4 overrides anything older), `notes/chapters/CHAPTER-PLAN.md` (what this chapter
must cover and how it connects to the others), `notes/essays/DRAFTING-BRIEF.md` "The author's rules",
and `notes/chapters/<slug>.md` (the drafting note). The claim register is
`corpus/<slug>/receipts.tsv`; run logs are in `corpus/<slug>/`. Lecture transcripts are under
`resources/udemy-subs/course-<id>/NN-NN-*.txt`; read them when a finding depends on what the source
says. Read earlier chapters in `chapters/` when a finding depends on a forward or back reference.

## What a chapter is trying to be

- **One project step, end to end**, 20,000–35,000 characters of prose, written from scratch (not a
  concatenation of the archived essays in `essays/`), covering the plan's section list for this
  chapter.
- **Every mechanism explained until the worked example can be recomputed from the page**: numbers
  small enough to write first, then realistic sizes; every display formula glossed term by term;
  arithmetic over three terms in a table.
- **The practitioner's framing**: a knob is introduced where a practitioner meets it (an API field, a
  library argument, a line of PyTorch), and connected precisely to the same knob elsewhere in the book.
- **Synthetic demonstrations labelled as such**, and a section saying what a real project would add.
- **No source narration.** The prose never says "the course", "the lecturer", "reported", or names a
  book or paper as the source of a fact; provenance is in receipts and the italic credit line.
- **One exercise** (exactly one `<!--mission-->`): real PyTorch on a CPU, no downloads, run, with its
  output in `corpus/<slug>/run.log`, a line-by-line walk-through and an expected result quoted as printed.
- Second person for the reader, third for the mechanism; no "we"; no scenes beyond the shop's
  situation; no anthropomorphism; nothing sold; no slogan closing a section.

## Findings to look for, in priority order

1. **A step missing** from a mechanism, so a worked number cannot be recomputed. Name the step.
2. **A number without a receipt or run log**, or a claim stated more strongly than its source or run
   supports ("usually", "always", "most" without evidence).
3. **Wrong arithmetic** or an expected result that does not match `corpus/<slug>/run.log`. Recompute.
4. **Imprecision about a recurring knob** (temperature, the softmax, the learning rate, α/r, the
   threshold): the chapter says two things are the same when they differ in stage or purpose, or
   contradicts an earlier chapter.
5. **A plan section missing or thin**, or a broken promise to/from another chapter.
6. **Close paraphrase of a lecture.** Quote both.
7. **Framework or product as the mechanism**, or a product claim without an "as of" in the catalog
   caution or receipts.
8. **The exercise fails the contract**, or a "thing to try" states a result that no log supports.
9. **Source narration, anthropomorphism, voice violations.**
10. **Length or register**: padding, trivia a practitioner never uses, basics defined at length.

## Output

JSON only, an array of findings, each `{ "priority": 1-10, "severity": "high|medium|low",
"location": "<quoted phrase or heading>", "finding": "<what is wrong>", "evidence": "<what you
checked>", "fix": "<the concrete change>" }`. Empty array if nothing survives your own checking. No
prose outside the JSON.
