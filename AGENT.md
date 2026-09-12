# AGENT — working contract for any model writing in this repository

Read `CONTEXT.md` first, then `notes/BRIEF.md`, then the essay's pitch. This file is the rules of
engagement; it does not repeat them.

## Priority stack

1. **Never false.** No numbers from memory. A claim about a lecture or a page has a receipt a
   reader could check. Being dull is a failure; being wrong is a betrayal.
2. **The mechanism, explained.** If a reader finishes the essay and cannot recompute the worked
   example, the essay has failed whatever else it does.
3. **Fair to the sources.** A lecturer's number stays in the lecturer's mouth (`reported`). A
   book's claim is cited to a page that was read. No transcript sentence is reproduced.
4. **The reader in the essay.** Second person, their situation, their exercise; no scenes about
   an imaginary founder or student.

## Never drafted cold

No essay is written without a pitch the author has picked in `notes/pitches/<slug>.md`. Pitches
are three per slug, four sentences each: the problem, the mechanism, the worked example, the
exercise — each naming the lectures and pages it would use. The author picks, asks for a rewrite,
or rejects.

## Who does what

- **Main session (Claude):** pitches, drafting one essay per sitting, accepting or rejecting
  review findings, the register in `CONTEXT.md §6/§8`, anything that needs the whole constitution
  in one head.
- **Subagents:** only when several essays run in parallel. Each writes files as it goes, commits
  nothing, and owns exactly `essays/<slug>.md`, `corpus/<slug>/`, `notes/essays/<slug>.md`. Never
  the catalog, the generator, the CSS, or another essay.
- **codex:** mechanical work — scaffolding, the checks, catalog field fills from a decided
  register, applying accepted review findings verbatim, manifests. Run with
  `-s workspace-write`; it cannot commit, the main session commits.
- **Gemini via agy:** review lanes and persona reads only.

## Receipts are written during research, not after

Before a sentence with a number or a source claim is written, its row exists in
`corpus/<slug>/receipts.tsv`. A draft that arrives with an empty receipts file is not a draft.

## What an essay may not do

- Quote a transcript beyond a phrase; the paraphrase check will fail it anyway.
- Say a model "understands", "knows", "wants" or "decides" without saying what that stands for.
- Present a framework's API as the mechanism, or a product's behaviour as current without an
  "as of".
- Require a GPU, a paid API, the source, or a downloaded notebook for the exercise.
- Overlap an idea already carried by a book11 essay (Burkov's routing-cost example, Think Stats,
  DDIA).
- Sell anything, praise anyone, or end on a slogan.

## Checks before handing back

`npm run build && npm run check` green; the receipts file non-empty; word count noted in
`notes/essays/<slug>.md` with the pitch letter, the sources actually used, and anything the
essay owes.
