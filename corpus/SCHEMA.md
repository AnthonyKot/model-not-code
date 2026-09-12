# Corpus schema

One directory per essay slug. Nothing from `resources/` or `workspace/` is copied here: no
transcript text, no book text, no page images.

```text
corpus/<slug>/
  receipts.tsv     # every number and source claim in the essay, one row each
  run.log          # optional: output of any code snippet the essay shows, if it was actually run
```

## receipts.tsv

Tab-separated, header row, one row per claim:

```
claim_id  paraphrase  label  source  locator  note
```

- `claim_id` — `<slug>-NN`, stable once written.
- `paraphrase` — the claim in the book's words (never a transcript sentence).
- `label` — `observed` (the essay's own arithmetic, recomputable from the page) ·
  `reported` (a number or claim as the lecturer or author states it) · `inferred` (the book's
  reading of a source) · `hypothesis` (the book's own claim, marked as such in the prose) ·
  `disputed` (source and a public primary disagree; `note` says which the essay follows).
- `source` — `course-<id>` · a `resources/MANIFEST.tsv` key · `arXiv:<id>` · a URL.
- `locator` — `NN-NN` lecture (must resolve to one file under `resources/udemy-subs/`), or
  `p. N` / `pp. N–M` for a book (must be within the manifest's page count), or a section for a
  paper. `unknown` when the location could not be established; never a plausible guess.
- `note` — free text: what the source actually says if the paraphrase compresses it, the date
  "as of" for product claims, or why a label is `disputed`.

`checks/receipts.mjs` resolves every `course` and `book` locator; it cannot check that the page
says what the paraphrase says. That is the reviewers' and the author's job.
