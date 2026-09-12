# Handover for codex — state as of 2026-09-13 (night)

Read `CONTEXT.md` (constitution; §4 has tonight's prose rules), `AGENT.md` (who does what), `PLAN.md`,
then this file. Codex does mechanical work only (AGENT.md "Who does what"); the main Claude session
drafts, reviews and commits. Run with `-s workspace-write`; do not commit.

## What exists

- Published: `lora-is-a-low-rank-diff` (Part II pilot) — on Pages, revised through seven of the
  author's read notes (`notes/essays/lora-is-a-low-rank-diff.md`, "Author's read").
- Reviewed, unpublished: `model-is-a-learned-function`, `tokens-not-characters`,
  `attention-is-a-soft-lookup` (Part I, essays 1–3). Preview with `BUILD_ALL=1 npm run build`.
- Picks for Parts I–II: CONTEXT §6 / `notes/pitches/PICKS-I-II.md`. Not started: essay 4
  `embeddings-are-coordinates` (pitch B) and Part II essays 5–9, 11–12.
- Parts III–VI: `notes/research/outline-audit-2026-09-13.md` — a recommendation only. **The author
  has not decided.** Do not change the catalog for Parts III–VI until CONTEXT §9 records a decision.

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
