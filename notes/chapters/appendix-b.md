# Appendix B — The Assistant's Toolbox: Ollama, the Chat API, Gradio and Tool Calling

**Drafted by:** Claude Fable 5.1 (main session), 2026-09-22, to `notes/chapters/APPENDIX-PLAN.md` §B. Status `published` in `site/catalog.mjs`; built to `docs/appendix/b.html`; not pushed until the author says.

## Shape

Version line (model names as of the recordings, libraries unversioned; nothing executed and why). Opening paragraph tying each part to the stand-in it replaces: chapter 1's `temperature` and `max_tokens`, chapter 6's scripted writer, messages and three checks. Three sections: the open-weight writer behind the same endpoint (Ollama sizes and the two-coins result, the OpenAI-format request against `localhost:11434/v1`, native clients, routers and abstraction layers); the loop's window as one Gradio callback (Interface, ChatInterface with `type="messages"`, the history scrub, streaming as a generator, `share` and `auth` sent to chapter 5's side); the three checks against a real tool-calling API (the bare-prompt demonstration, the tool JSON for chapter 6's three tools, `finish_reason == "tool_calls"`, the `tool` message with `tool_call_id`, chapter 6's `run()` rewritten with schema, confirmation and dispatch in the same places, the three recorded lessons: `while` not `if` with tools on every call, iterate over several requests, a call cap). "Where it stops". Three folds: runner versus Transformers and distillation; per-call cost and prompt caching; the system message and multi-shot prompting.

**Counts** (`scripts/reading-path.py`): reading path 1760, folds 453 (20.5%), page 2213; the page is inside the plan's 2,000–4,000. Four code blocks, all labelled illustrative.

## Evidence

- Sources read in full: `course-6100015` lectures 01-01, 01-16, 01-19, 02-04, 02-05, 02-07 to 02-13, 02-15 to 02-18 (2,801 transcript lines). Receipts `corpus/appendix-b/receipts.tsv`, apb-01…21: 21 passed, 0 failed, 0 skipped.
- Every number is a recording's and receipted `reported`: 270 M, 2.2 GB, 20 B / 16 GB / 20 GB, two thirds, 53,000 tokens, half a cent, a fifth, a week, 799. The appendix derives nothing new; its claims about chapter 6 are chapter 6's (three checks, refused coupon, "the action was stopped; the sentence was not").
- Not executed: `ollama` is not installed on the machine (`which ollama` empty, 2026-09-22); installing it and pulling a model is a download, which the book's exercise rule excludes, so the plan's "otherwise illustrative" branch applies. `corpus/appendix-b/` has no run log. The rewritten `run()` mirrors `labs/build-the-assistant.md` lines 151–165 line for line in its three checks; it has not been run against any endpoint.

## Source traps (kept out of the prose)

01-01 line 188 says "16MB" for the 20 B model's memory; 02-04 line 598 says 16 GB and the appendix follows it. 02-05's cent figures are garbled in the transcript ("0.004 $0.03", "0.023 $0.04"); the appendix keeps only "a small fraction of a cent" and "half a cent" (line 900–901, clear). 02-17 transcribes Berlin's price as "4.99" (line 2481); the appendix uses only London's 799 (02-18 line 2632). Model names ("GEMA", "Fei", "Quinn", "FY three") are transcription; the appendix writes Gemma, Phi, Qwen. Chapter 4 is named in the plan's title for B but the appendix links chapters 1 and 6, whose stand-ins it replaces; chapter 4's writer is mentioned only as "the writer".

## Checks

`npm run build` green (8 chapters, 2 appendices); `npm run check`: site validation 33 pages, receipts as above, paraphrase 0 twelve-word failures (1 course); voice lint clean ("reported back as cached" → "came back counted as cached"; the sources line is excluded as for every chapter).

## Owed

The author's read. Appendix C. A run of the rewritten loop against a local runner, if the author installs one; the appendix says which lines change.

## Cross-read repairs — 2026-09-22 (appendix B against chapters 1 and 6)

Six repairs from a read-only review: the trade of a local model against a hosted one is attributed to chapter 8's ledger, not chapter 7; "3-billion-parameter" (inferred from a model name, unreceipted) → "the small model" / "the recorded small local model"; the schema check compares against the tool's full parameter list (`properties`), as chapter 6's does, not the `required` subset; the checks paragraph names the permissions item chapter 6's figure carries between schema and confirmation; the coupon sentence says the answer is governed by chapter 6's fourth line, the check of the answer against the tool results, and its judge, and states chapter 6's finding as settled; "chapter 5's side of the shop" and "not chapter 5's audit" (chapter 5 has no login or tunnel) → "whoever runs the page" and "not a release process"; "golden set" → "golden set and judge" in "Where it stops". No number changed. The reviewer's note that the "three checks" triple differs from chapter 6's figure is left to chapter 6.
