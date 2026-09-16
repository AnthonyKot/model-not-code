**Drafted by:** Claude Fable 5.1 (main session), 2026-09-16, from scratch, from the approved outline (`serve-the-assistant-cheaply-outline.md`; author's picks: plain scale-and-zero-point quantisation, timings printed with a variability note)

# Chapter 7 — Serve the Assistant Cheaply

- Question: where does a generated token's cost go, and which lever moves it? The deciding number: whether a decode
  step waits on memory or on arithmetic.
- Sections: KV cache (42 vs 9 key/value rows, n×n vs 1×n; figure; prefill vs decode; cache-size formula on an invented
  model; GQA and sliding window as the shrinkers) → four bits per weight (eight-weight block by hand: codes, scale
  0.03867, error 0.0180 under half a step; the 2.4 outlier; block 8 vs 64 bookkeeping; 3e9-weight arithmetic; adapters in
  full precision) → batching (intensity B; invented machine's roofline table, crossover at B = 200; the CPU's measured
  shape; static vs continuous on a four-request table, 62% → 81%; chunked prefill; cold starts) → which lever from the
  dashboard (table; pause) → real project → exercise → reader case (week 37 report + "buy the next card" proposal; the
  named reasoning step is memory- vs compute-bound; four-bit weights is the first lever for latency, batching for
  throughput, the card capped at 1.4×).
- Length: prose without code/SVG ≈ 19.4k (≈ 12.1k before the exercise). One figure.
- Checks (scratch copy, status published): build and site check green; paraphrase 0/0. Receipts pending the research
  subagent's draft.

## Evidence

- `workspace/serve-the-assistant-cheaply/exercise.py` → `corpus/.../run.log` (≈4 s; deterministic parts identical over
  two runs; timing lines labelled measured, eight CPU threads).
- `variations.py` → `run-variations.log` (2-bit; 512 × 512). `worked.py` → `run-worked.log` (cache sizes, 3e9 bytes,
  roofline table, arrival table, the reader case's implied bandwidth). `reader_case.py` → `reader-case.log`.
- Prototype `proto1.py` is design history.

## Design notes

- The reader case is built so the chapter's headline lever (batching) is the wrong answer to the stated complaint
  (latency at low load), and the proposal's headline number (2× arithmetic) is the irrelevant one; the four-bit lever
  wins only with its re-evaluation cost attached. "Buy it anyway" is allowed with a stated reason.
- Block-of-8 bookkeeping equalling the codes was a finding of the run, kept as the block-size trade.

## Owed

- Receipts from the research pass; Gemini review; blind Haiku solve; the author's read; publish on the author's say.

## Review decisions (2026-09-16)

Gemini actionable review (first round), `checks/reviews/serve-the-assistant-cheaply/proposal1-gemini.md`, 4 proposals,
all applied after verification: (1) the prediction pause restated the reader case's exact numbers; replaced by a
different scenario (93% utilisation, forty in flight, compute-bound) with the next paragraph as its check, rather
than deleted; (2) GQA sentence read as if it raised the head count; reworded; (3) "0.7 GB of 16.3 GB free" → "0.7 GB,
leaving 16.3 GB free"; (4) "last three lines" → "last two". The blind Haiku solve was on the packet with the leaking
pause; its result is therefore weaker evidence than chapters 5–6's, noted in the solver README.
