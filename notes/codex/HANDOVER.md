# Handover for codex — state as of 2026-09-13 (night)

Read `CONTEXT.md` (constitution; §4 has tonight's prose rules), `AGENT.md` (who does what), `PLAN.md`,
then this file. Codex does mechanical work only (AGENT.md "Who does what"); the main Claude session
drafts, reviews and commits. Run with `-s workspace-write`; do not commit.

## What exists (updated 2026-09-13, ~10:30)

- Published (5): `lora-is-a-low-rank-diff`, `model-is-a-learned-function` (codex rewrite accepted),
  `tokens-not-characters`, `attention-is-a-soft-lookup`, and nothing else yet.
- Drafted, not published (8, all Part I–II): `embeddings-are-coordinates` (retitled "Similar Means
  Whatever the Training Pairs Said"), `validation-set-is-a-budget` (reviewed + fixes applied),
  `class-imbalance-changes-the-loss`, `augmentation-declares-invariance`,
  `input-pipeline-is-the-bottleneck`, `transfer-learning-freeze-then-thaw`,
  `learn-the-action-or-learn-its-worth` (retitled "Measure the Return, or Guess It From the Next
  State"), `ppo-clips-the-step`.
- Review status: all eight are `reviewed` (findings applied 2026-09-13; logs in each essay note). They are
  waiting only for the author's say to publish (`python3 scripts/register.py <slug> published`, then
  `npm run build`, commit docs/). Codex hit its usage limit at ~11:30 (resets 14:32) while applying
  reports; the main session finished the application.
- Parts III–VI: the author's decisions are in CONTEXT §9 (2026-09-13 morning). Catalog reshaping for
  III–VI is the next mechanical job once the eight reviews above are applied (the catalog is edited
  by the review step, so do not reshape concurrently).
- Manifest: four books added (data-contracts, dedp, kubeflow-cml, openshift-mlops).
- The accepted rewrite prompt is `notes/codex/codex.md`; the author may want the same register
  applied to other essays.

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
