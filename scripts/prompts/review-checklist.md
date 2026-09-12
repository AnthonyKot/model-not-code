# Essay review checklist

You are reviewing one essay of *The Program Is Now a Model*, a book of standalone essays for a
senior software developer (ten to twenty years of software, fluent in systems, new to ML
practice) moving into ML / AI engineering. Your job is to find what is wrong with it. Praise is
not useful output.

You have shell access to this repository. `CONTEXT.md` is the constitution — read §3, §4, §5 and
§5b before judging against them. `notes/BRIEF.md` is the essay contract. `site/catalog.mjs` holds
the essay's declared mechanism and sources. `corpus/<slug>/receipts.tsv` is the claim register.
The cited lecture transcripts are under `resources/udemy-subs/course-<id>/NN-NN-*.txt`; read the
cited lectures when a finding depends on what the source says. Do not read other essays unless a
finding depends on overlap.

## What the book is trying to be

- **One mechanism per essay**, named in the catalog, explained step by step so that the reader
  can recompute the worked example; then limits or a counterexample; then one exercise doable
  without a GPU, a paid API, the source, or a notebook, with an expected result.
- **Paraphrased study sources.** Courses and books are named; nothing is quoted beyond a phrase;
  lecture numbers are "as reported in the lecture"; worked-example numbers are the book's own.
- **Second person for the reader, third for the mechanism.** No scenes, no hero, no war metaphors,
  nothing sold, no anthropomorphism that hides the mechanism.

## Findings to look for, in priority order

1. **Toured, not explained.** The mechanism the catalog names is described but a step is missing,
   so the worked example cannot be recomputed from the page. Name the missing step.
2. **A number without a receipt.** Any figure not derived on the page and not in `receipts.tsv`,
   or a `reported` figure presented as the book's finding.
3. **Close paraphrase of a lecture.** A sentence that tracks the transcript's wording or order
   closely enough to be a rewrite of it. Quote both.
4. **Arithmetic that is wrong.** Recompute every worked-example number. Report the correct value.
5. **Framework or product presented as the mechanism**, or a product claim (an API, a default, a
   price, a model name) stated as current without an "as of".
6. **The exercise fails the contract**: needs a GPU, a paid API, the source, or a download; or has
   no expected result; or the expected result is wrong.
7. **An invented example not labelled** as an example, or a real source case attributed wrongly.
8. **Anthropomorphism that hides the mechanism**: "understands", "knows", "wants", "decides",
   "hallucinates" without the next clause saying what it stands for.
9. **Voice**: "we"; a scene; a slogan closing the essay; a lecturer praised rather than cited.
10. **Overlap** with a book11 essay's idea (Burkov's routing-cost example, Think Stats, DDIA), or
    with another essay in this book's catalog.

## Output

JSON only, an array of findings, each `{ "priority": 1-10, "severity": "high|medium|low",
"location": "<quoted phrase or heading>", "finding": "<what is wrong>", "evidence": "<what you
checked: lecture file, page, recomputation>", "fix": "<the concrete change>" }`. Empty array if
nothing survives your own checking. No prose outside the JSON.
