# Appendix A — Serving the Writer: vLLM, RunPod and Modal

**Drafted by:** Claude Fable 5.1 (main session), 2026-09-22, to `notes/chapters/APPENDIX-PLAN.md` §A. Status `published` in `site/catalog.mjs` (`appendices[]`); built to `docs/appendix/a.html`; not pushed until the author says.

## Shape

Version line (no tool versions in either recording; flag names from the serving book; code illustrative, not executed). "What the engine packages": vLLM's feature list read against chapter 7's three levers in a table, the two scheduler caps (`--max-num-seqs`, `--max-num-batched-tokens`) as the axes of chapter 7's crossover table, speculative decoding as the fourth lever for the same regime. A serverless endpoint (RunPod console: model id, token for gated models, GPU chosen by the platform, max workers 2, active workers 0, the health page's jobs and workers, the gated-model failure, the first run's download, 1.2 s warm, the ten-dollar minimum) with cold-start components from the inference-engineering book and the four-bit lever applied to the load (7.0 GB → 1.75 GB). A deployed function with a volume (Modal: 1 min 20 s, 1 min 8 s, 1 min 5 s; volume → about 30 s; warm call immediate; sleep after 2 min; keep one alive or 20 min). The week 37 report from the engine's side, line by line, with the two things chapter 7 could not say (a cap of 128 against 48 requests' caches; a draft model at a tenth of 7.0 GB = 0.7 GB of the 15.8 GB free). "Where it stops". Two folds: the quick start and request as recorded; the shape of the deployed class.

**Counts** (`scripts/reading-path.py`): reading path 2160, folds 264 (10.9%), page 2424; inside the plan's 2,000–4,000. Folds are optional for appendices (plan, "Rules that differ").

## Evidence

- Sources read in full: `course-6538601/04-01` (276 lines), `course-6100015/08-05` (261 lines); `inference-eng` physical 70 (PagedAttention, FlashAttention), 131–134 (speculative decoding, draft-target, Medusa named only in the source), 190–192 (cold starts); `llm-serving` ch. 6 (Example 6-1 flags, chunked prefill). Receipts `corpus/appendix-a/receipts.tsv`, apa-01…22: 20 passed, 2 skipped (EPUB page count unknown, as for chapter 7), 0 failed.
- Numbers: every timing and setting is a recording's, receipted as `reported`; apa-22 holds the appendix's own arithmetic on chapter 7's report lines (1.75 GB, 36 ms per step, 0.7 GB, 48 against 128).
- Nothing executed (`corpus/appendix-a/` has no run log): the plan says A cannot run on a CPU without downloads. The three code blocks are labelled illustrative; the Modal block is labelled "shape only".

## Source traps (kept out of the prose)

The transcript writes "VLM" for vLLM and "Chongqing prefilled" for chunked prefill. The RunPod recording's only timing (1.2 s) is one anecdotal warm response. The Modal recording's 1 min 20 s / 1 min 8 s / 1 min 5 s / 30 s are one session on one T4. No vLLM flag is named in either recording; `--max-num-seqs` and `--max-num-batched-tokens` come from the serving book's Example 6-1. The `Volume`, `@app.cls`, `@enter`, `@method` names in the shape block are the platform's as the recording describes them, not a file from the course. CUDA graphs are named in the feature list and nowhere explained in the sources; the table says only what FlashAttention does (p. 70).

## Site

`site/catalog.mjs` gains `appendices[]` and the `AP` helper; `site/build.mjs` builds `docs/appendix/<letter>.html` with the chapter shell, an "Appendices" group at the end of the contents with no `data-mission-link` (progress stays "N of 8 exercises"), a home-page section, and a pager from the last chapter; `site/check.mjs` validates title, one heading, no exercise section, no mission link, and a link to each chapter served; `checks/paraphrase.mjs` and `checks/receipts.mjs` include appendices. `about.md` already names the appendices (site copy, 2026-09-22).

## Checks

`npm run build` green (8 chapters, 1 appendix); `npm run check`: site validation 32 pages, receipts as above, paraphrase 0 twelve-word failures (2 courses); voice lint clean after replacing every "the lecture" with "the recording" / "recorded" (the book is the voice; provenance stays in the receipts and the credit line).

## Owed

The author's read. Appendices B and C.
