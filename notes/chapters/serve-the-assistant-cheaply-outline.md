# Chapter 7 outline — Serve the Assistant Cheaply (for the author's approval)

**Status:** approved 2026-09-16 (choices: stop at the scale-and-zero-point mapping, NF4 named in one sentence at most; timings printed with a variability note). Plan: CHAPTER-PLAN rev 2 §7 (Part IV 10, 11, 12: `kv-cache`,
`four-bits-per-weight`, `batching-is-where-throughput-comes-from`). Sources verified in the 2026-09-13 audit (#19, #21,
#22); locators re-read before use. Chapter 6's reader-task rules apply (reasoning step named; every figure's purpose stated).

## The chapter's question, stated in the opening

*The assistant works and the bill is too high. Where does a generated token's cost go, and which lever moves it?*
Chapter 1's encoder costs one pass per query; chapter 6's assistant costs three model calls per answer, and each call
is a generator producing tokens one at a time. Three levers, each a section: don't recompute what you already have
(the KV cache), store each weight in fewer bytes (quantisation), and serve many customers per pass (batching). The
opening names the one number that decides which lever helps: whether a decode step is waiting on arithmetic or on
memory.

## Sections (target ≈ 22–28k characters of prose)

1. **A token costs a pass over the weights.** The generator from chapter 1, one token at a time; the causal mask means
   token t's keys and values never change once computed. Hand example: four tokens, score matrices 1×1, 2×2, 3×3, 4×4
   without a cache against 1×1, 1×2, 1×3, 1×4 with one. Prefill (the prompt, all at once, compute-bound) against decode
   (one token, memory-bound). Cache size = 2 × layers × kv-heads × head-dim × bytes × tokens, computed for an invented
   small model at two context lengths; the limits: grouped-query attention and a sliding window as ways to shrink it.
2. **Four bits per weight.** A block of eight weights: scale = (max − min) / 15, zero point, integer codes 0–15, the
   dequantised values and the largest error, half a step. Then one outlier in the block stretching the scale and
   crushing the other seven, in arithmetic; why it breaks large models and what keeping outliers in 16 bits costs.
   Chapter 3's LoRA adapters stay in full precision beside the 4-bit base. Memory: an invented 3-billion-weight model at
   2 bytes, 1 byte, half a byte.
3. **Batching is where throughput comes from.** A d × d weight matrix and B tokens: 2·B·d² operations against 2·d² bytes
   read, so arithmetic intensity is B; below the machine's ops-per-byte ratio the step is paid in bytes and B sequences
   cost what one costs. Table of step time against B for an invented machine. Static, dynamic and continuous batching:
   a four-request arrival table with unequal lengths, slots occupied per step under static and continuous batching.
   Latency against throughput is the trade the shop chooses, in numbers. Cold starts as the limit that batching cannot fix.
4. **Which lever, from the numbers you can read off a running server.** Utilisation, memory, time to first token,
   tokens per second per request, requests in flight: a small table of what each lever changes and what it cannot.
   *Pause:* the GPU shows 20% utilisation and latency is high; which lever, and which number would you check first?
5. **What a real project adds:** hardware ratios are the vendor's and dated; quantised models need chapter 2's evaluation
   again, not a benchmark; the cache is per request and memory is the real capacity limit; forward to chapter 8's cost column.

## Exercise (one `<!--mission-->`, CPU PyTorch, timings labelled as measured and variable, target under 15 s)

Chapter 1's generator: (1) generate 32 tokens with and without a KV cache, count the key/value computations and time
both, showing the per-token cost flat with the cache and growing without; (2) quantise the generator's weights to
4-bit blocks with a scale and zero point, print the largest reconstruction error, the memory in bytes, and whether the
generated text changed; then one injected outlier and the error again; (3) time one matrix–vector product against a
matrix–matrix product at batch 1, 4, 16, 64 and print time per token, with the machine's own crossover. Walk-through,
expected output (deterministic parts exact; timings "as measured on eight CPU threads"), two things to try.

**Reader decision (bounded):** a serving report from the shop's assistant for one week: requests per second, tokens per
request, time to first token, tokens per second per request, GPU utilisation, memory used of memory available, and a
proposal ("buy the next GPU up") with its price. The reader must state, from those numbers, whether decode is
memory-bound or compute-bound (the reasoning step, named), which lever they would pull first, what it would cost, and one
option rejected with the number that rejects it. "The report cannot settle it without X" is acceptable when X is named.
Success criterion: a lever chosen for a reason the numbers do not support is not a pass. Hints and discussion in two
`<details>`. Blind Haiku solve before the author's read.

## Sources to read and receipt

6538601/03-07 (cache), 03-05 and 03-06 (GQA and sliding window; check 03-05 at drafting), 04-01 (engine features, names as
of the recording); 6100015/03-15, 07-03 (bit widths, base 4-bit with full-precision adapters), 08-05 (cold starts);
`inference-eng` pp. 64–65 (ops:byte, prefill/decode), 188–190 (batching kinds, concurrency); `llm-serving` ch. 6
(continuous batching, chunked prefill, the happy-path caveat), ch. 3 (queue and workload manager); `quant-ru`
pp. 12–14 (scale and zero point; render the slides, the equations do not extract); `llm-deep-dive` p. 188 (outliers).
Not used: 07-05's inconsistent footprints; 18-02/18-03; 08-01–08-04.

## Open choices for the author

1. Whether section 2 includes NF4 and double quantisation by name (one paragraph, `reported`) or stops at the uniform
   scale-and-zero-point mapping.
2. Whether the exercise's timings are in the expected output at all (chapter 2 printed them with a variability note) or
   only the deterministic counts are, with timings left to the reader's machine.
