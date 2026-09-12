# Book20 handoff to Claude

Saved 2026-09-13 at the user's request, before their five-hour usage limit. Work stopped after source mapping; no need to repeat the inventory from scratch.

## Read first

Working repository: `/home/diablo/book20` (`~/book20`), intended GitHub repo `AnthonyKot/model-not-code`.

Read the repository's `CONTEXT.md`, `AGENT.md`, `PLAN.md`, and `notes/BRIEF.md`, then:

1. `/mnt/c/Users/CoderA/book20-source-map.md` — detailed findings, questions, checked source locations, source limitations, and editorial recommendations.
2. `/mnt/c/Users/CoderA/book20-source-inventory.tsv` — local paths for 59 relevant/potentially relevant files, including three duplicate copies.
3. `notes/pitches/PICKS-I-II.md` and the existing pitches, when comparing the proposed essays with the source map.

On Windows these saved handoff files are at `C:\Users\CoderA\`.

The reports were saved outside the repository because this Codex session's writable roots did not include `/home/diablo/book20`. They are durable files, not merely conversation context. Bring the paraphrased reports into an appropriate `notes/` location if useful and permitted. The inventory contains private local paths and belongs in local research material, not published site content.

## What the user actually wants now

The book should be a set of original, useful ML essays for experienced software developers, grounded in their downloaded Udemy transcripts and their books in `C:\Users\CoderA\Downloads\Telegram Desktop`.

We stepped back from executing the old pitch/pilot pipeline to assess the material editorially. The user authorised this task: map sources to concrete questions a developer might want to explain, calculate, debug, or decide; inspect actual passages rather than infer support from filenames. They now want Claude to continue from the saved findings and recommendations.

**Do not treat the example pitch sequence as approved.** The earlier continuation prompt contained `[fill in, e.g. 1A 2A 3B 4B 5A 6A 7A 8A 9B 10A 11B 12A]`. No actual picks were supplied. The existing file records agents' recommendations, not author decisions. No essays have been drafted in this session. The user has not approved a new outline either.

The initial scheduling interpretation was a Codex mistake. Nothing was scheduled, and no scheduling work should be resumed.

## Completed work

- Read the repository constitution, agent contract, plan, essay brief, catalog, source README/manifest, and Parts I–II recommendation sheet.
- Inventoried all seven downloaded course directories: 719 original lecture text files, plus 44 English translations of the Arabic course. Counts by course appear in the source map.
- Extracted 60 candidate book/document files to a private temporary workspace, excluded one unrelated document, and retained 59 inventory entries. Three copies are duplicates of other entries: 56 distinct files remain. This does **not** mean every page of those files was read.
- Sampled actual lecture passages from all seven courses and selected book/PDF/EPUB passages. The report distinguishes substantive checks from introductory/abstract-only leads.
- Verified an arithmetic error by viewing the actual rendered Raschka page, not only its extracted text.
- Saved an editorial map with reader questions and possible original exercises, plus a table of source contributions and cautions.
- No original source files, project essays, pitch choices, catalog, or repository metadata were changed. No project checks/review scripts were run, since no essay or code changes were made. No commit or push occurred. Repository status was clean when checked during inspection.

## Findings that matter most

1. **The library supports a stronger engineering spine than the current outline exposes.** There are checked passages for data leakage/feature availability, fitted preprocessing, data and model versioning, delayed labels, feedback selection, deployment evaluation gates, and intervention testing. Do not let architecture topics crowd those out simply because the courses feature them prominently.
2. **The deployed artifact includes fitted transformations.** Burkov PDF 77 and 139–140, Géron PyTorch PDF 116 and 130–132, and the OpenShift book PDF 155 give complementary support. This is a concrete bridge from software release engineering to ML.
3. **LoRA remains a good pilot, but its arithmetic needs independent derivation.** Raschka `machine.learning.q.and.ai.pdf`, physical PDF page 142 / printed 137, reports `25 × 50 = 6,250`; the correct product is 1,250. The factor counts 125 and 250 total 375. The page also has malformed matrix notation. The rendered page confirms the error.
4. **RAG evaluation in the LLM Engineering course uses proxies.** Lectures 05-18/05-19 use expected keywords, keyword coverage, and keyword reciprocal ranks. The instructor says most example questions were model-generated. Distinguish those checks from independent relevance judgments and from answer correctness. Don't transplant the result as our own measurement.
5. **Version/identity metadata matters.** Huyen is an early release; Burkov pages are marked Draft; Raschka is a 2023-05-21 Leanpub version; Moroney is an early release; Smolyakov is MEAP V09. The quantisation PDF is a slide deck titled *Автостопом по Квантизации*. `Modern_Software_Engineering_Doing_What_Works_to_Build_Better_Software.pdf` is SHA-256-identical to the Burkov ML engineering PDF.
6. **Some proposed source support is incomplete.** The checked LLM deep-dive tokenizer section names BPE without deriving merges. Staron demonstrates using a BPE trainer but the inspected passage still does not provide a complete merge derivation. The SHAP course excerpt demonstrates plots, not an exact Shapley derivation. Lapan/quantisation formulas are partially lost in text extraction and need visual inspection.
7. **Keep conclusions bounded.** The inspected time-series examples change both domain and frequency; they do not isolate frequency causally. PPO clipping is not automatically a hard bound on actual policy movement. Serving throughput depends on workload and hardware. RAG is not a correctness guarantee.

## Recommended continuation

Continue with the source-and-outline audit, not twelve pitch-letter choices in isolation. Assess each existing essay against a reader problem, one mechanism, verified support, and an original recomputable example. Recommend keep/merge/reframe/defer/drop, but distinguish your editorial recommendations from author-approved changes.

Give special consideration to these candidate questions, each with checked locations in the report:

- What information would actually have been available at prediction time?
- What must be versioned so rollback restores behaviour?
- What can be monitored before labels arrive?
- Does the model influence which feedback becomes training data?
- Did the prediction improve, or did the intervention cause improvement?
- What evidence must pass before a newly trained model can replace the deployed one?

The existing Part III is labelled evaluation and monitoring but uses substantial space for domain-model topics. Test whether its contents actually deliver that promise.

For sources to promote beyond the existing manifest, the most concrete discoveries are **Data Contracts**, **Data Engineering Design Patterns**, **Continuous Machine Learning with Kubeflow**, and **MLOps with Red Hat OpenShift**. The point is the mechanism in their checked passages, not making the book a tour of platforms.

After editorial direction and a pilot pitch are settled, the original workflow remains: receipts during research; draft LoRA in the main session; `npm run build` and `npm run check`; then `scripts/review.sh <slug>` and `scripts/readers.sh <slug>`; review findings by hand; record decisions. Don't mark anything author-read or published without the author's say. The earlier user also wanted pitch agents for Parts III and IV and explicit-path commit/push after the writing work, but the present task has stepped back to source assessment. Avoid launching the old pipeline before resolving the editorial questions.

## Local research cache (optional, temporary)

`/tmp/book20-source-audit.uyiiTh/` contains per-source JSON text extractions, `inventory.json`, the helper `source_scan.py`, and a rendered image of Raschka physical page 142. The durable reports above are sufficient to resume if `/tmp` is cleared. Original sources remain at the paths in the inventory.

Useful commands, if the cache survives:

```bash
python3 /tmp/book20-source-audit.uyiiTh/source_scan.py search huyen-dmls 'leakage'
python3 /tmp/book20-source-audit.uyiiTh/source_scan.py read huyen-dmls 163,164,165
python3 /tmp/book20-source-audit.uyiiTh/source_scan.py excerpt llm-serving 'Continuous Batching with Chunked Prefill' ch06
```

`search` returns at most 16 matching physical pages/EPUB documents. `read` accepts comma-separated physical PDF pages or an exact EPUB internal filename. `excerpt` returns bounded passages and optionally filters by document name or a minimum physical page such as `'>=35'`. Extractions omit image-only math and can contain formatting noise. No source dump should be committed or published.

The inventory is broader than the reading. For any claim not explicitly supported by a checked passage in the report, return to the original source before drafting it.
