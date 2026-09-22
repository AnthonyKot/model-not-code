# Appendix C — Shipping the Classifier: ONNX Runtime, FastAPI, TensorBoard and a Page for the Reviewers

**Drafted by:** Claude Fable 5.1 (main session), 2026-09-22, to `notes/chapters/APPENDIX-PLAN.md` §C. Status `published` in `site/catalog.mjs`; built to `docs/appendix/c.html`.

## Shape

Version line (TensorFlow-course recordings applied to chapter 2's classifier in PyTorch 2.14.0, onnx 1.23.0, onnxruntime 1.30.0, legacy exporter, opset 17; what ran and what did not). Opening paragraph tying the appendix to chapter 5's bundle boundary. Sections: what the graph carries against the bundle (the export call; the seven nodes and six tensors; a six-row table of bundle against graph); the reload test made real (the served function; 4.77e-06 / 1.19e-07 / 68 = 68; the recordings' 225-against-255 slip staged on chapter 2's photos, 61 flags; the two timings); the endpoint with preprocessing beside it (the recorded lifespan/route shape, with the threshold and version read from the bundle); what a profiler shows (10-05's 68.4% input time read against chapter 2's lab setup; the PyTorch profiler sketch); a page for the reviewers (17-04's interface plus the reviewer's verdict the shop needs; the recording's error-free confusion matrix read against chapter 2's standard error); "Where it stops". Two folds: the export script and reading the graph back; the recorded service step by step.

**Counts** (`scripts/reading-path.py`): reading path 1769, folds 271 (13.3%), page 2040; the first draft came in at 1,950 on the page and a paragraph on the opset and the dynamic axis (both from the run and the recorded export) brought it inside the plan's 2,000–4,000. Two folds; four code blocks, one executed (the export call and the served function are lines of `export.py`), three illustrative.

## Evidence

- Executed: `workspace/appendix-c/export.py`, run in a scratch directory holding `release.pt` produced by `workspace/keep-it-right-after-launch/exercise.py` (that run reproduced `corpus/keep-it-right-after-launch/run.log` byte for byte first). Output in `corpus/appendix-c/run.log`; a second run reproduced every exact line, with the two timing lines varying (0.193 → 0.165 ms torch; 0.084 → 0.083 ms onnxruntime). Interpreter `~/.gemini/antigravity-cli/scratch/myenv/bin/python`; `pip install onnx onnxruntime` added onnx 1.23.0 and onnxruntime 1.30.0 (a package install, no model download). The script imports chapter 5's `listings`, `Net`, `blade_score` unchanged and regenerates the validation listings from the lab's seeds.
- Not executed: FastAPI, TensorBoard/the profiler viewer and Gradio are not installed; their blocks are labelled illustrative. Lecture 33-14 named in the plan is a transcript of the same vLLM/RunPod deployment as Neuralearn 04-01 (appendix A), not a classifier deployment; it is not used here and not in the catalog entry.
- Receipts `corpus/appendix-c/receipts.tsv`, apc-01…11 (eight `reported`, three `observed`).

## Source traps (kept out of the prose)

18-02 divides by 225 (line 168) and 18-03 by 255 (line 382); neither applies the training normalisation; the appendix states the correct version and stages the slip on chapter 2's photos (which need no rescaling) rather than staging the disagreement. 17-04's "100% accuracy" is the recording's reading of a small test set; the appendix says what chapter 2's standard error would say about it without quoting a number it did not derive. 10-05 is a TensorFlow profiler; the PyTorch equivalent is sketched, not run. The recorded export uses opset 14 and the appendix opset 17; the deprecation notice for the legacy exporter is noted in the fold.

## Checks

`npm run build` green (8 chapters, 3 appendices); `npm run check`: site validation 34 pages, receipts 11 passed / 0 failed / 0 skipped, paraphrase 0 twelve-word failures (1 course); voice lint clean (one "reported" → "showed").

## Owed

The author's read. A run of the endpoint and the reviewers' page if the author installs FastAPI and Gradio; the appendix says which lines are the book's additions.

## Cross-read repairs — 2026-09-22 (appendix C against chapters 2 and 5)

Five repairs from a read-only review: the torch timing now reads the logged 0.19 ms (the 0.17 was the unlogged second run, receipt apc-11); the node list is stated in the graph's order (flatten between the two matrix products); "chapter 5's bundle boundary" is glossed as the appendix's phrase for the released function chapter 5 lists; "chapter 5's audit log" → the reviewers' and auditors' records chapter 5 keeps; "the lab's two timings" → chapter 2's lab's four step timings against a forecast, and the profiler as the loader's and the step's time at every operation. Every corpus number and the staged 255/225 slip were confirmed by the reviewer against run.log and export.py.
