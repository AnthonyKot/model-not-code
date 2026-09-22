# APPENDIX-PLAN — three tool appendices (planned 2026-09-22, not started)

**Status: plan only, agreed with the author in chat on 2026-09-22.** Nothing is written. The rework's
own order comes first: chapter 8, then the §6 site copy in `STORY-MAP.md`, then the push. The
appendices follow, A first. Up to three appendices of 2,000–4,000 words each; optional reading
after chapter 8; the chapter rules in `CONTEXT.md` §4–§5 apply unchanged.

**Why.** The chapters teach the mechanism and keep frameworks as dated examples (`CONTEXT.md` §4).
The courses in `resources/udemy-subs/` also walk through the tools themselves (vLLM on RunPod, a
model on Modal, Ollama, Gradio, tool-calling APIs, ONNX Runtime, FastAPI, TensorBoard), which the
chapters deliberately leave out. The author's read of chapter 7 (2026-09-22) asked for that material
to have a home; these appendices are it, one per group of chapters.

## A. Serving the writer: vLLM, RunPod and Modal (chapter 7's tools)

- **Covers.** A vLLM server as the packaged form of chapter 7's three levers, naming what the lecture
  only lists: paged attention as the KV-cache memory manager, continuous batching and chunked prefill
  as the scheduler, quantised weights as a load-time option, speculative decoding as the one lever the
  chapter never touched. Then the two deployment walkthroughs: a serverless endpoint on RunPod with its
  worker and cold-start settings, and a fine-tuned model on Modal with a persistent volume. Ends by
  reading chapter 7's week 37 report against what a vLLM dashboard actually exposes.
- **Sources on hand.** Neuralearn 4.1 (`course-6538601/04-01`: vLLM, RunPod, the ~80 s cold start),
  Donner 8.5 (`course-6100015/08-05`: Modal, 1 min 20 s); the serving book (`llm-serving`, EPUB) for
  paged attention and chunked prefill; the inference-engineering book (`inference-eng`) for
  speculative decoding.
- **Example.** An OpenAI-compatible request against a local vLLM, and the settings that map to each
  lever. Illustrative, not executed (needs a GPU and downloads).

## B. The assistant's toolbox: Ollama, the chat API, Gradio and tool calling (chapters 1, 4 and 6's tools)

- **Covers.** Running an open-weight model locally with Ollama behind the same chat-completions
  endpoint as a hosted model; the request fields the chapters named (`temperature`, `max_tokens`,
  system versus user role); a Gradio chat interface with streaming; and chapter 6's loop written
  against a real tool-calling API instead of the scripted writer, with the same three checks in the
  same places.
- **Sources on hand.** Donner 1.1, 1.16, 1.19, 2.4 (Ollama and endpoints), 2.7–2.13 (Gradio),
  2.15–2.18 (tool calling, the airline assistant), 2.5 (LangChain versus LiteLLM, treated as a choice,
  not a recommendation).
- **Example.** The chapter 6 loop, runnable on a CPU against Ollama, with the coupon case refused by
  the same confirmation rule. Executed and logged if a small model runs on this CPU; otherwise
  illustrative.

## C. Shipping the classifier: ONNX Runtime, FastAPI, TensorBoard and Gradio for evaluation (chapters 2, 3 and 5's tools)

- **Covers.** Exporting chapter 2's classifier to an ONNX graph and what the file does and does not
  carry (chapter 5's bundle boundary, shown on a real export); serving it behind a FastAPI endpoint with
  the preprocessing written beside it; profiling training with TensorBoard; and a Gradio page for the
  reviewers' side of chapter 5, where a person checks a flag.
- **Sources on hand.** The TensorFlow masterclass (`course-4735368`) 18.2 (ONNX Runtime), 18.3
  (FastAPI), 17.4 (Gradio for evaluation), 10.5 (TensorBoard), 33.14 (deployment); the Kubeflow and
  OpenShift books for the gate and canary if the appendix reaches that far.
- **Example.** The export, one request, and the check that the served function flags the same
  validation listings as the saved one: chapter 5's reload test made real. Executable on a CPU
  (`onnxruntime` install, no downloads).
- **Trap already logged.** The masterclass's deployment lecture divides by 225 and skips training
  normalisation (chapter 5's note, "Source traps"); the appendix states the correct version and does
  not stage the disagreement.

## Rules that differ from the chapters

- Most of A cannot run on a CPU without downloads: its code is "illustrative, not executed", labelled
  as chapter 3's torchvision snippet is. B's Ollama loop and C's ONNX export are run and logged under
  `corpus/appendix-<letter>/`.
- Tool walkthroughs go stale fastest: each appendix opens with a version line (tool versions and the
  recording dates of the lectures it matches), and its note records which lecture's version it followed.
- No story paragraph or prediction pause is required; the shape is a short "what this packages"
  paragraph tying back to the chapter's levers or checks, then the walkthrough, then "where it stops".
  Folds and a lab page are optional.
- Receipts as for chapters (`corpus/appendix-<letter>/receipts.tsv`); paraphrase check as for chapters.

## Site

Before A ships: an appendix section in `site/catalog.mjs` and the contents, `docs/appendix/<letter>.html`
built by `site/build.mjs` with the chapter shell and no mission (the progress count stays "N of 8
exercises"). `about.md` gains one sentence on the appendices when the §6 site copy is written.

## Order and cost

A, then B, then C. Each is roughly a chapter's work at the rework's pace, less the story-shaping.
