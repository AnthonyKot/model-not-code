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

- The author's read. Published 2026-09-17.

## Review decisions (2026-09-16)

Gemini actionable review (first round), `checks/reviews/serve-the-assistant-cheaply/proposal1-gemini.md`, 4 proposals,
all applied after verification: (1) the prediction pause restated the reader case's exact numbers; replaced by a
different scenario (93% utilisation, forty in flight, compute-bound) with the next paragraph as its check, rather
than deleted; (2) GQA sentence read as if it raised the head count; reworded; (3) "0.7 GB of 16.3 GB free" → "0.7 GB,
leaving 16.3 GB free"; (4) "last three lines" → "last two". The blind Haiku solve was on the packet with the leaking
pause; its result is therefore weaker evidence than chapters 5–6's, noted in the solver README.

## Correction after publication (2026-09-17)

The author found the serving report internally inconsistent: 0.8 requests/s and 4.3 s per answer imply about 3.4
requests decoding at once (96 tokens/s ÷ 28 agrees), but the report said 2.0. `reader_case.py` now derives the figure
(3.4); the report block, cache memory (1.2 GB, 15.8 GB free), the hints, the discussion's batching arithmetic (4.7x at
batch 16, not 8x) and receipt sac-48 were updated. The decision and its reasons are unchanged. Republished.

## Story-map rework — 2026-09-22

**By:** Claude Fable 5.1 (main session), following `notes/chapters/STORY-MAP.md` §3 (chapter 7 card) and the seven per-chapter steps in `RESUME.md`. Status stays `published`; the URL does not change; nothing pushed.

**Shape now.** Story paragraph (the week 37 report: 3.4 requests decoding at once, 19% utilisation, 4.3 s an answer at 28 tokens/s; the proposal's card at 1.4× bandwidth for 830 more a month buys at most 1.4×; four-bit weights and batching buy more) and a two-sentence map; four beats with story-step headings; a short "Where it stops"; two worked questions with folded answers; the lab paragraph; the bridge to chapter 8's ledger. Prediction pause is the card's, before the lever table: "Given the report's numbers, 3.4 requests decoding at once, 19% utilisation, 28 tokens a second per request, rank the three levers before reading the table"; the chapter's earlier pause (a different shop's 93% dashboard) was cut, since §2 allows one. The story states the card's 1.4× cap, which the lab's reader case also derives; the lab still asks for the two report lines that establish the regime, the first lever with its cost and gain, a rejected option and what to measure, which the page does not answer.

**Headings** (old → new): "A token costs a pass over the weights" → "Where a generated token's cost goes" · "Four bits per weight" → "Read fewer bytes per weight" · "Batching is where throughput comes from" → "Make each read of the weights serve more customers" · "Which lever, from the numbers on a running server" → "Which lever the report's numbers point at" · "What a real project adds" → "Where it stops" · new: "Two questions to work", "The lab".

**Counts** (`scripts/reading-path.py`): reading path 2103; folds 717 (25.4%); page 2820; 5 `<details>`. Per section on the path: intro 274, where a generated token's cost goes 347, read fewer bytes per weight 349, make each read of the weights serve more customers 375, which lever the report's numbers point at 270, where it stops 135, two questions to work 108, the lab 209. Before: 2,802 on the path with only the reader case's two folds (15.9%) and the exercise on the page. The first draft landed at 2,092 and 25.9%; one small fold trim. The page total is inside §2's range.

**Moved.** The whole `## Exercise` section, verbatim (code, walk-through, expected output, the two things to try, the reader case with its hints and discussion folds), to `labs/serve-the-assistant-cheaply.md` with the `<!--mission-->` marker, under a two-line header naming the chapter. Diffed against the chapter's previous text: identical. The lab's code block diffed against `workspace/serve-the-assistant-cheaply/exercise.py`: identical. No "section N" or heading references needed renaming ("the chapter's arithmetic" in the reader case still resolves). As the card predicted, the lab (2,581 words) is larger than the old body.

**Folded** (summary line → contents): "the cache's size, term by term, and the two ways to shrink it" → the cache-bytes formula glossed, 96 KB per token and the 0.09 / 0.73 / 2.93 GB rows, grouped-query attention, the sliding window · "the block size, the bookkeeping, and a three-billion-weight model's bytes" → blocks of 8 vs 64 (1,120 vs 140 bytes, errors 0.1858 / 0.2151), the 5.59 / 2.79 / 1.40 + 0.17 GB arithmetic, LoRA beside a four-bit base · "the crossover on an invented machine, row by row" → the 300 GB/s / 60 TFLOP/s machine, ratio 200, the five-row table · two "Worked answer" folds. Kept on the page, as the card lists: 42 vs 9 with the figure, the one block by hand with the outlier, the CPU's crossover shape, the lever table.

**Cut or compressed** (nothing deleted without a line here): the intro's list of three levers → the map · "This is the number the opening promised" → "the number the opening turns on" · the 93%-utilisation prediction pause → cut · "the exercise prints both counts" → "the lab prints" · "Diagrams of equal-length requests arriving together are the happy path; real arrivals are ragged, and the continuous scheduler is what handles the rags" → cut · "Keeping one replica warm is a fixed cost against a variable one, and the trade is the shop's" → cut · "What a real project adds" → "Where it stops", same four points in one paragraph · the batching paragraph's "The numbers are this machine's" → "that machine's, and a rerun on another moves them" (see the re-run below).

**Added.** Story paragraph and map; worked question 1 (new numbers from the report's own lines: 1.2 / 3.4 = 0.353 GB per request, 15.8 GB free, 48 requests' caches on the 24 GB card and 116 on the 48 GB one; receipt `sac-49`; `worked.py` section 6, `run-worked.log` regenerated with the earlier sections diffing clean); worked question 2 (the "19% idle, buy a smaller card" wrong turn: utilisation counts arithmetic units, the load is 7.0 GB × 28 = 196 GB/s of weight traffic); the 1.4× cap on the page (28 → at most 39 tokens/s); the lab paragraph; the bridge to chapter 8 (3,001 then 300 a month).

**Checks.** `npm run build` green (8 chapters, 7 with labs); `npm run check`: site validation passed (30 pages), receipts 28 passed / 0 failed / 12 skipped (the EPUB sources, as before) with the new `observed` row, paraphrase 0 twelve-word failures for the chapter and the lab; `npm run consistency`: 12 failing conditions, all archived essays (unchanged); voice lint clean on the chapter; the lab's one hit is in the discussion moved verbatim. Read once with every fold closed: the argument survives. `node scripts/lab-check.mjs serve-the-assistant-cheaply`: lab page renders with the mission and button; clicking gives "1 of 8 exercises" and ticks chapter 7; the chapter page has 5 folds, no mission, one "Open the lab" block; no console errors.

**Exercise re-run.** `~/.gemini/antigravity-cli/scratch/myenv/bin/python` (PyTorch 2.14.0+cu130 on CPU) on the lab's code block: every exact line byte-identical to `corpus/serve-the-assistant-cheaply/run.log`; the six measured timing lines differ, as the lab says they will (this run: no-cache generation 2.0 ms against 1.2; steps 0.360 / 0.736 / 0.890 / 1.733 / 5.013 ms at B = 1 / 4 / 16 / 64 / 256, per token 360 → 19.6 µs). The step at batch 4 doubled here where the recorded run's barely moved, which is why the page now says "in the recorded run". Not re-run: the two variations and the reader case (their code did not move).

**Not done.** The author's read and the author's own attempt at the serving report; chapter 8; the §6 site copy.

**Cross-reference repair — 2026-09-22 (chapter 8 cross-check).** The bridge's last two sentences misread chapter 8's break-even ("3,001 questions a month, then at 300 once a 15% held-out rate is allowed for"); they now say the model pays back its build after 3,001 queries and its upkeep with 300 a month at a 15% paraphrase share. Nothing else in the chapter changed; path 2103 → 2111.

**Cross-read repairs — 2026-09-22 (pair review 6+7).** Reviewer reported: the map filed the KV cache under "bytes read per token", which the lever table denies, and said batching is measured "on chapter 1's generator" when the lab times a bare matrix product; "chapter 6's golden set" was named as the test of a quantised writer's answers, though it scores retrieval; "chapter 2's release comparison" does not exist; the fold's 1.40 GB for a three-billion base sat against chapter 3's 2.2 GB with no reconciliation; "Where it stops" told chapter 8 to use cost per answer, which chapter 8's ledger carries only as a cost line beside the encoder; the bridge's "the model pays back" reads as the generator where chapter 8's subject is the encoder; "block" named chapter 1's attention block and a group of eight weights; "writer" and "generator" were never tied; the report's 4.3 s "answer" against chapter 6's three calls per answer. Applied, one phrase each: the map now names the cache as the lever that stops recomputation and the matrix product as the batching lever, and the generator as standing in for the writer; the story's first sentence says a request is one writer call and a customer's wait is three; the block definition excludes chapter 1's; chapter 6's golden set "for retrieval and its judge for the answers"; "chapter 6's standard error on the difference"; "chapter 3's 2.2 GB … is larger than this 1.40 because only the large linear layers are quantised there" (chapter 3's own words); the cost line now includes calls per answer and is what chapter 8 carries beside the encoder's; the bridge says "the encoder pays back". Chapter 3's "four bits stand in for 32" → "for sixteen". No number changed. Path 2170, folds 25.5%.

**Cross-read repairs, round three — 2026-09-22 (pair review 7+8).** The bridge charged drift to the model column alone, which chapter 8's ledger refuses; it now says the audit that watches for drift is charged to both. Chapters 7 and 8 deferred the assistant's cost per query to each other with no number in either; "Where it stops" now prices it from the report's own lines, 620 / (96 × 30 × 86,400) = about 0.0000025 per generated token and 0.0003 for a 120-token answer before prefill (`worked.py` last section, `run-worked.log` regenerated with earlier lines clean, receipt sac-50), and chapter 8 quotes the 0.0003. Path 2198, folds 25.2%.
