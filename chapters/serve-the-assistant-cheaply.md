# Serve the Assistant Cheaply

Chapter 6's assistant answers a question with three calls to the writer, and the writer produces its answer one token at a time. The shop's serving report for week 37 shows one GPU with 3.4 requests decoding at once, its arithmetic units busy 19% of the time, an answer of 120 tokens taking 4.3 seconds at 28 tokens a second, and a proposal from the platform team: move to the next card up, twice the arithmetic and 1.4 times the memory bandwidth, for 830 more a month, "to bring latency down". Worked through on the report's own lines, the bigger card buys at most 1.4×. Storing the weights in four bits instead of sixteen buys more on the same card, and letting each pass over the weights serve more customers buys more still, for a bill or a queue. Why is the obvious lever the weakest?

The chapter first counts what one generated token costs and finds that most of it is reading the weights, not arithmetic, which is what a bigger arithmetic unit cannot fix. It then works the two levers that change the bytes read per token, a cache of keys and values and four bits per weight, and the one that changes how many tokens each read serves, batching, on chapter 1's generator, before reading the shop's dashboard to say which lever the report's numbers point at. Everything is synthetic and small: chapter 1's sixteen-dimensional generator, an eight-weight block quantised by hand, a 2,048 × 2,048 matrix timed on a CPU. The timings are measured and vary from machine to machine; the counts and the arithmetic do not.

## Where a generated token's cost goes

Chapter 1 generated an answer by feeding the whole sequence to the block at every step and taking the last position's output as the next token. The causal mask makes that wasteful in a specific way: position t attends only to positions up to t, so once token t's key and value are computed, nothing that comes later changes them, and feeding the whole sequence again recomputes every key and value that already existed. Count it for a two-word prompt and a seven-token answer. Without a cache, step 1 computes keys and values for three positions and a 3 × 3 table of scores, step 2 for four positions and a 4 × 4 table, and so on to 9 × 9: 3 + 4 + … + 9 = 42 key/value rows and a score table whose area grows with the square of the length. With a **KV cache**, the prompt is processed once, the **prefill**, giving three rows and a 3 × 3 table; then each **decode** step computes one new row and one row of scores against everything stored, 1 × 4, 1 × 5, up to 1 × 9. Nine rows in all, and the lab prints both counts and the same answer from both.

<figure class="diagram">
<svg viewBox="0 0 360 200" width="100%" role="img" aria-label="Score matrices for four decode steps. Without a cache: squares of side 3, 4, 5 and 6, one per step, every entry recomputed. With a cache: one 3 by 3 square for the prompt, then single rows of length 4, 5 and 6, one new row per step." style="max-width:420px;font-size:12px">
  <g fill="currentColor"><text x="8" y="16" font-weight="600">without a cache</text><text x="8" y="112" font-weight="600">with a cache</text></g>
  <g fill="none" stroke="currentColor" stroke-width="1.2">
    <rect x="8" y="26" width="24" height="24"/><rect x="44" y="26" width="32" height="32"/><rect x="88" y="26" width="40" height="40"/><rect x="140" y="26" width="48" height="48"/>
    <rect x="8" y="122" width="24" height="24"/><rect x="44" y="122" width="32" height="8"/><rect x="88" y="122" width="40" height="8"/><rect x="140" y="122" width="48" height="8"/>
  </g>
  <g fill="currentColor" opacity="0.8">
    <text x="20" y="90" text-anchor="middle">3×3</text><text x="60" y="90" text-anchor="middle">4×4</text><text x="108" y="90" text-anchor="middle">5×5</text><text x="164" y="90" text-anchor="middle">6×6</text>
    <text x="20" y="160" text-anchor="middle">3×3</text><text x="60" y="160" text-anchor="middle">1×4</text><text x="108" y="160" text-anchor="middle">1×5</text><text x="164" y="160" text-anchor="middle">1×6</text>
    <text x="210" y="50">step 1, 2, 3, 4 →</text><text x="210" y="70">area grows as n²</text>
    <text x="210" y="134">prefill, then one</text><text x="210" y="150">row per step</text>
  </g>
</svg>
<figcaption>The attention scores computed at each step for a three-token prompt. The cache turns a square per step into a row per step.</figcaption>
</figure>

The two phases behave differently under load, and this is the number the opening turns on. Prefill handles the whole prompt in one pass, many tokens for one read of the weights, so the arithmetic units are busy and the time to the first token depends on how fast they are. Decode handles one token per pass, one read of the weights for a single token's worth of arithmetic, so each step is bound by how fast the weights can be read, and tokens per second depends on memory bandwidth. A decode step at a small batch is **memory-bound**, and the levers that help it are the ones that reduce bytes read per token or make each read serve more tokens. The cache is memory too: it grows with every token in every request being served, and for a model of ordinary size it runs to gigabytes per long request.

<details>
<summary>Optional: the cache's size, term by term, and the two ways to shrink it</summary>

<p class="formula">cache bytes = 2 · L · H<sub>kv</sub> · d<sub>head</sub> · b · T</p>

The 2 is for keys and values; L the number of layers; H<sub>kv</sub> the number of key/value heads; d<sub>head</sub> the width of each; b the bytes per number; T the tokens in the sequence. For an invented model with 24 layers, 8 key/value heads of width 128 and 2-byte numbers, one token costs 96 KB of cache: 0.09 GB at 1,000 tokens, 0.73 GB at 8,000, 2.93 GB at 32,000, per request. Two ways to shrink it follow from the formula. **Grouped-query attention** lets several query heads share one key/value head, cutting H<sub>kv</sub>: without it, a model with 32 key/value heads would need 2.93 GB for the same 8,000-token request. A **sliding window** caps how many past positions a layer attends to, capping T for that layer: a window of 4,096 holds the cache at 0.38 GB however long the conversation runs, and tokens beyond the window are reachable only through what later positions carried forward.

</details>

## Read fewer bytes per weight

If the step is paid in bytes read, the first lever is the number of bytes each weight takes, which is a choice. Sixteen-bit floats are the usual training format; storing each weight in four bits reads a quarter of the bytes per step, which for a memory-bound decode is close to a quarter of the time. The mapping is a scale and an offset per **block** of weights. Take a block of eight:

| Weight | 0.12 | −0.31 | 0.05 | 0.27 | −0.08 | 0.19 | −0.22 | 0.02 |
|---|---|---|---|---|---|---|---|---|

The block's smallest value is −0.31 and its largest 0.27, a range of 0.58. Four bits give sixteen levels, so the **scale** is 0.58 / 15 = 0.03867 and the **offset** is −0.31. Each weight becomes the integer code nearest to (w − offset) / scale:

<p class="formula">code = round( (w − offset) / scale ),  ŵ = code · scale + offset</p>

w is the original weight, ŵ its reconstruction from the code; the offset places level 0 at the block's minimum and the scale is the distance between levels. The eight codes are 11, 0, 9, 15, 6, 13, 2, 9, and the reconstructions 0.1153, −0.31, 0.038, 0.27, −0.078, 0.1927, −0.2327, 0.038. The largest error is 0.0180, below half a step, 0.0193, and it always is: rounding to the nearest level can never miss by more than half the distance between levels. Two weights, 0.05 and 0.02, now share a code and a value; four bits cannot tell them apart.

Now put 2.4 in the fourth slot. The range becomes 2.71, the scale 0.1807, and the other seven weights are squeezed into the bottom four levels: codes 2, 0, 2, 1, 3, 0, 2. The largest error among them is 0.09, five times what it was, because one outlier bought its own precision with everyone else's. Real weight matrices have such outliers, and past a few billion parameters a handful of dimensions carry them, which is why a naive four-bit mapping degrades large models and why the working schemes keep the outliers in sixteen bits and quantise the rest. Whether the shop's answers survived the mapping is chapter 2's question, on chapter 6's golden set, not a benchmark's.

<details>
<summary>Optional: the block size, the bookkeeping, and a three-billion-weight model's bytes</summary>

Every block carries a scale and an offset, two 16-bit numbers, so at blocks of eight the bookkeeping weighs as much as the codes: the lab's 2,240-weight generator takes 1,120 bytes of codes and 1,120 bytes of scales and offsets. At blocks of 64 the bookkeeping drops to 140 bytes and the largest error rises from 0.1858 to 0.2151, because a bigger block is more likely to hold an outlier. The toy generator's answer is unchanged either way. For an invented three-billion-weight model the arithmetic is 5.59 GB at two bytes, 2.79 at one, 1.40 at half a byte plus 0.17 GB of bookkeeping at blocks of 64. Chapter 3's LoRA adapters sit beside a four-bit base in full precision; the base is what is read per step, and it is what shrinks.

</details>

## Make each read of the weights serve more customers

A decode step at batch 1 reads every weight to produce one token. At batch B it reads every weight once and produces B tokens, so the second lever is B. For one d × d weight matrix and B tokens, the arithmetic is 2·B·d² operations and the bytes read are 2·d² at two bytes a weight, so the operations per byte, the **arithmetic intensity**, is B. A machine has a ratio of its own, how many operations it can do in the time it takes to read one byte; below that ratio the step is paid in bytes and its time does not depend on B, above it the arithmetic units become the limit and the step time grows with B. Up to the ratio, the cost per token falls by B for free.

The lab measures that shape on its own CPU with a 2,048 × 2,048 matrix. In the recorded run the step barely moves from batch 1 to 4 while the cost per token falls from 360 µs to 92, then compute takes over, and by batch 256 the per-token cost has flattened near 19 µs. The numbers are that machine's, and a rerun on another moves them; the shape is every machine's, and the crossover is the number to measure on the card you run.

<details>
<summary>Optional: the crossover on an invented machine, row by row</summary>

For a machine that reads 300 GB/s and computes 60 TFLOP/s, the ratio is 200. A 4,096 × 4,096 matrix is 33.6 MB and takes 112 µs to read:

| Batch B | Memory time | Compute time | Step | Per token |
|---|---|---|---|---|
| 1 | 111.8 µs | 0.6 µs | 111.8 µs | 111.85 µs |
| 8 | 111.8 µs | 4.5 µs | 111.8 µs | 13.98 µs |
| 64 | 111.8 µs | 35.8 µs | 111.8 µs | 1.75 µs |
| 200 | 111.8 µs | 111.8 µs | 111.8 µs | 0.56 µs |
| 400 | 111.8 µs | 223.7 µs | 223.7 µs | 0.56 µs |

Up to B = 200 the step costs the same and the cost per token falls by B. Past it, the per-token cost stops falling. Memory time is the matrix's bytes over the bandwidth, compute time 2·B·d² over the machine's rate, and the step the larger of the two.

</details>

Batching pays in latency. A customer's token waits for the step, and the step at a full batch is longer. **Static** batching collects B requests, runs them together and returns them together, so a short answer waits for the longest one in its batch: four requests of 3, 1, 4 and 2 decode steps occupy 16 slot-steps and use 10. **Continuous** batching frees a slot the moment a request finishes and admits the next request into it, so a fifth request arriving at step 2 fills a freed slot and the same 16 slot-steps carry 13. The prefill of the newcomer is the wrinkle, a big compute-bound pass in the middle of memory-bound decode steps, and splitting it into chunks keeps the decode steps flowing. What batching cannot fix is the empty machine: a server that has scaled to zero takes tens of seconds to load weights before its first token, and the first customer pays it.

## Which lever the report's numbers point at

**Given the report's numbers, 3.4 requests decoding at once, 19% utilisation, 28 tokens a second per request, rank the three levers before reading the table.**

A serving dashboard shows utilisation of the arithmetic units, memory in use, time to first token, tokens per second per request, and requests in flight. Each lever changes some of those and not others:

| Lever | Reduces | Does not change | Costs |
|---|---|---|---|
| KV cache | work per decode step, from the sequence length to one row | bytes of weights read per step | memory per request |
| Four-bit weights | bytes read per step, so time per token at small batch | arithmetic; the cache | an evaluation of the answers again |
| Batching | cost per token, by B, while memory-bound | time per token for one request | latency per request; scheduler complexity |
| A faster card | memory time by its bandwidth ratio; compute time by its arithmetic ratio | which of the two you are waiting on | money |

The reading order is fixed by the opening's number. If utilisation is low and the batch is small, decode is memory-bound: bytes per step and batch size are the levers, and a card with more arithmetic buys nothing that the dashboard is waiting on; its bandwidth ratio is the whole of what it can buy, and the proposal's 1.4 caps the gain at 1.4×, 28 tokens a second becoming at most 39. If utilisation is high at a full batch, the arithmetic units are the limit and the faster card is the honest lever. Which lever the shop pulls first, what it costs and what it cannot do is the lab's report, with the numbers to work it.

## Where it stops

The machine's ratio is the vendor's number and dated: measure your own step time against batch size, as the lab does, on your card, and use the crossover you observe. A quantised model is a different model, whose answers go back through chapter 6's golden set and chapter 2's release comparison before it serves anyone, with the standard error on that set saying whether a change is real. The cache is per request and memory is the real capacity limit: the number of requests a card can decode at once is the free memory divided by the cache per request, before any batching arithmetic applies. And cost per answer is the number chapter 8 needs: tokens per answer, steps per second at the batch you actually run, and the card's price per hour, multiplied out.

## Two questions to work

**1. Does the report need the 48 GB?** The week 37 card has 24 GB, of which the weights take 7.0 GB and the caches of 3.4 requests 1.2 GB. From those lines, how much cache does one request take, how many requests' caches would fit on this card, and how many on the proposed 48 GB one?

<details>
<summary>Worked answer</summary>

One request's cache is 1.2 / 3.4 = 0.353 GB. The card has 24.0 − 7.0 − 1.2 = 15.8 GB free, room for 15.8 / 0.353 = 45 more requests, 48 in all; the 48 GB card, with 41 GB left after the weights, would hold 116. At 3.4 requests decoding at once neither number is near a limit, so memory is not what the report is short of, and the 48 GB is headroom the proposal charges for. What would change this is the batch the shop chooses to run: batching to 48 fills this card's memory before any ordinary machine's arithmetic crossover, and then the bigger card's memory, not its arithmetic, is the reason to buy it.

</details>

**2. The card is mostly idle, so buy a smaller one.** A colleague reads the 19% utilisation as a card doing a fifth of its work and proposes moving down a size to cut the 620 a month. What is right in that reading, and what is the wrong turn?

<details>
<summary>Worked answer</summary>

The arithmetic units are indeed idle four fifths of the time. The wrong turn is reading utilisation as the card's load: it counts the arithmetic units, and a memory-bound decode leaves them idle by nature. The line that measures the card's real load is the weights traffic, 7.0 GB read per step at 28 steps a second, about 196 GB/s, and that is the bandwidth being spent almost entirely on weights. A smaller card with less bandwidth would slow every step in proportion, and the 4.3 seconds the report complains about would grow. If the bill is the concern, the lever that cuts it without slowing anything is the same one that cuts the latency: fewer bytes per weight, which is why four-bit weights come before any change of card, in either direction.

</details>

## The lab

The lab, [cache the keys, quantise the weights, batch the tokens](../labs/serve-the-assistant-cheaply.md), runs on a CPU in about four seconds. It should print 42 key/value rows without the cache and 9 with it, the same answer both ways, the hand block's codes 11, 0, 9, 15, 6, 13, 2, 9 with a largest error of 0.0180, the generator's answer unchanged at blocks of 8 and 64, and a step-time table whose per-token cost falls from about 360 µs at batch 1 to about 19 µs at batch 256 on the lab's machine, and something else on yours. Two variations follow, two bits per weight and a smaller matrix, and then the week 37 serving report and the proposal wait for your decision, with hints and a discussion folded until you have written it.

Every lever in this chapter has a price and a number that says what it buys, and chapter 8 puts those numbers on one ledger against the alternative the shop never priced: a rule that costs a test, against a model that costs data, evaluation and drift. If 15% of the shop's queries are paraphrases the rule cannot reach, the model pays back its build after 3,001 queries and its upkeep with 300 a month. What would the shop have to see to choose it?

*Sources: Building LLMs like ChatGPT from Scratch and Cloud Deployment (Neuralearn.ai, Udemy), lectures 3.5, 3.6, 3.7 and 4.1; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 3.15, 7.3 and 8.5; all paraphrased as study material. Inference Engineering, pp. 64–65, 122–130 and 188–191 (physical); Hands-On LLM Serving and Optimization (EPUB), chapters 3, 5 and 6; Автостопом по Квантизации (slides), pp. 12–14; Large Language Models: A Deep Dive, p. 188 (physical).*
