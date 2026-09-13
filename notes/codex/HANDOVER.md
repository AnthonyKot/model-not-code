# Handover for codex — state as of 2026-09-13 (night)

> **2026-09-13 night — read first:** the book is being restructured from standalone essays into
> project chapters; plan in `notes/chapters/CHAPTER-PLAN.md`, awaiting the author's approval. Do not
> rewrite or draft essays until it is approved. Chapters 1–5 have one page each (variants removed).


Read `CONTEXT.md` (constitution; §4 has tonight's prose rules), `AGENT.md` (who does what), `PLAN.md`,
then this file. Codex does mechanical work only (AGENT.md "Who does what"); the main Claude session
drafts, reviews and commits. Run with `-s workspace-write`; do not commit.

## What exists (updated 2026-09-13, afternoon)

- **All twelve Part I–II essays are published.**
- **Version comparison:** `essays/variants/<slug>.<label>.md` builds to `docs/essays/<slug>--<label>.html`
  with a "Compare versions" bar. Live comparisons: essay 1 (`--previous`, the pre-rewrite text),
  `tokens-not-characters--tight`, `attention-is-a-soft-lookup--tight`, `embeddings-are-coordinates--tight`;
  `validation-set-is-a-budget.tight.md` was being written when the author stopped the chain (quota) —
  verify and publish it with `scripts/publish-variant.sh validation-set-is-a-budget` if the file exists.
- **Not rewritten (author stopped new rewrites to save quota):** class-imbalance, augmentation,
  input-pipeline, transfer, LoRA, learn-the-action, PPO. Resume only on the author's say, one essay per
  run: `codex exec … "Follow notes/codex/tight-rewrite-brief.md exactly with SLUG=<slug>."`, then
  `scripts/publish-variant.sh <slug>`.
- **Author's pending choice:** for each compared essay, keep the current text or adopt the tight one
  (adopted text → `essays/<slug>.md`; the other → `essays/variants/<slug>.previous.md` or deleted).
- **Parts III–VI:** decided (CONTEXT §9); the author wants Parts I–II final first. Then: reshape the
  catalog (job 2), pitches for III–IV, the two pilots.
- Manifest has the four new books. Prompts that worked: `notes/codex/codex.md`.

## Mechanical jobs codex may take when asked

1. **Manifest rows** — the four rows drafted in the audit's "Manifest rows to add" section
   (`data-contracts`, `dedp`, `kubeflow-cml`, `openshift-mlops`) into `resources/MANIFEST.tsv`, after
   verifying the files exist under `resources/books/` and `pdfinfo` page counts match.
2. **Catalog reshaping** for Parts III–VI — only after the author's decision is logged in CONTEXT §9;
   then slugs, parts, titles, mechanisms, sources and `payoff` lines as the decision says.
3. **Applying accepted review findings** verbatim from `notes/essays/<slug>.md` when the main session
   lists them as accepted but not yet applied (none pending right now).
4. **Consistency pass** later: `npm run consistency` output triage.

## Rules that bite

- Prose never says "the course", "the lecturer", "reported", or names a source book for a fact; no
  inline lecture citations; sources live in `corpus/<slug>/receipts.tsv` and the italic credit line.
- Every essay has a `payoff` (reader-facing) besides `mechanism` (register).
- `BUILD_ALL=1` rewrites tracked files under `docs/`; run plain `npm run build` before handing back
  and remove any `docs/essays/*.html` for unpublished essays.
- `npm run check` must be green; the paraphrase guard fails on any 12-word run shared with a lecture.
- `resources/` and `workspace/` are gitignored and hold licensed text; nothing from them enters the repo.

## Tooling notes

`scripts/review.sh` and `scripts/readers.sh` use Gemini via `agy` plus codex for consolidation and one
persona; when codex is rate-limited those parts fail and the main session consolidates by hand.
PyTorch (CPU) and numpy for exercises live in a session venv, not system python; recreate with
`python3 -m venv .venv && .venv/bin/pip install numpy torch --index-url https://download.pytorch.org/whl/cpu`
(`.venv` must stay untracked — add to `.gitignore` if created in the repo).
