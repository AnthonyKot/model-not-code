# Week 37 Serving Report: Initial Reasoning

## Answer 1: Memory-bound or compute-bound?

**MEMORY-BOUND**

Two lines that indicate this:
1. "GPU utilisation (arithmetic units busy) 19%" - The arithmetic units are mostly idle, not saturated
2. "requests decoding at once, average 2.0" - Small batch size during decode phase

**Reasoning from chapter (lines 90-92):** "If utilisation is low and the batch is small, decode is memory-bound: bytes per step and batch size are the levers, and a card with more arithmetic buys nothing that the dashboard is waiting on."

The chapter makes clear (line 32) that decode is "memory-bound" when each step reads weights for a single token's worth of arithmetic, and "tokens per second depends on memory bandwidth" not arithmetic throughput.

**Sections used:** Lines 30-33 (decode phase characteristics), lines 84-92 (table and decision logic), lines 79-92 (which lever from dashboard).

---

## Answer 2: Which lever to pull first for 4.3 second latency?

**FOUR-BIT WEIGHT QUANTIZATION**

**Cost:** Zero additional hardware cost (remains 620/month). Requires re-evaluation of answers against golden set (chapter 2 evaluation, chapter 6 release comparison). This is non-monetary but necessary.

**Arithmetic used:**
- Current weight bytes: 7.0 GB at 16 bits per weight
- Four-bit storage: 4 bits per weight = 1/4 the bytes
- Expected weight size: ~1.75 GB + ~140 MB overhead for scales/offsets
- Byte reduction factor: **~4x fewer bytes per decode step**

**Expected gain:**
- Chapter states (line 42): "Storing each weight in four bits reads a quarter of the bytes per step, which for a memory-bound decode is close to a quarter of the time."
- Current decode time: 4.3s total - 0.18s prefill ≈ 4.1s
- Expected decode time: 4.1s / 4 ≈ 1.0s
- Total answer latency: 1.0s + 0.18s prefill ≈ **1.2 seconds** (vs 4.3s currently)
- **Gain: ~3.6x speedup for single request latency**

**Sections used:** Lines 40-58 (four-bit quantization detailed explanation), lines 42 (memory-bound decode benefit), line 57 (block size tradeoff with bookkeeping), line 98 (evaluation requirement).

---

## Answer 3: Option I reject

**REJECT THE PLATFORM TEAM'S PROPOSAL**

**Rejecting number:** "GPU utilisation (arithmetic units busy) 19%"

**Reasoning:**
- The proposal offers "twice the arithmetic, 1.4 times the memory bandwidth" for 1450/month vs current 620/month
- This is a 2.3x cost increase
- Since this system is **memory-bound** (from Answer 1), the bottleneck is memory bandwidth, not arithmetic
- Doubling arithmetic helps nothing when arithmetic units are idle at 19%
- The 1.4x bandwidth would give only ~1.4x speedup: current 4.3s → 3.1s
- This is far worse than four-bit quantization (1.2s) at zero hardware cost
- Buying a faster card when memory-bound "buys nothing that the dashboard is waiting on" (line 91)

**Sections used:** Lines 84-92 (lever table and decision logic).

---

## Answer 4: What you cannot tell and must measure

1. **Answer accuracy after quantization.** The chapter (line 98) states: "A quantised model is a different model. Its answers go back through chapter 6's golden set and chapter 2's release comparison before it serves anyone, and the standard error on that set says whether a change is real." The report doesn't show whether 4-bit preserves correctness.

2. **Actual prefill vs decode time breakdown.** We know prefill is 180ms and total is 4.3s, so decode is ~4.1s, but prefill might not scale linearly with larger batches. Increasing batch size (batching lever, line 59-76) could help throughput if decode dominates. Need to measure what prefill actually costs at scale.

3. **Maximum batch size before latency becomes unacceptable.** The chapter discusses trade-offs: "Batching pays in latency... a short answer waits for the longest one in its batch" (line 74-75). With only 0.7 GB of 24 GB used for caches, we could potentially serve more than 2.0 requests concurrently. Need to measure how high batch can go while staying under latency budget.

4. **I/O and other overhead.** The dashboard doesn't show whether there are bottlenecks outside the GPU: retrieving prompt chunks (600 tokens) might be slow, or there might be other preprocessing costs.

---

## Opening of hints and discussion

**Hints opened:** YES, but not needed to complete answers. The hints confirmed my reasoning approach without providing the answer directly.

**Discussion opened:** YES, to validate answers.

**Changes made:** No changes to my four answers. Discussion confirmed all reasoning was correct.

---

## Comparison with discussion

**Answer 1 (Memory-bound):** ✓ MATCH
- Discussion confirms: "the arithmetic units are idle most of the time, and the step is waiting on the weights"
- Discussion adds specific bandwidth calc: "Each step reads 7 GB; at 28 steps per second that is about 196 GB/s"

**Answer 2 (Four-bit quantization):** ✓ MATCH
- Discussion: "Bytes per step fall from 7 GB to about 1.75 GB... up to four times the decode speed, 28 to about 112 tokens per second"
- My calculation: 1.75 GB (close match), 4x speedup (exact match), 1.2s total latency matches their ~1 second decode time
- Discussion confirms cost: "The cost is chapter 2's... answers go through chapter 6's golden set and a release comparison"

**Answer 3 (Reject proposal):** ✓ MATCH
- Discussion: "Rejecting it is well supported by the 19% line"
- My specific number and reasoning about unused arithmetic aligned with discussion

**Answer 4 (What to measure):** ✓ MATCH with additions
- Discussion: "Step time against batch size on this card... and the quantised model's golden-set scores"
- I added: breaking down prefill vs decode time, maximum batch size, I/O overhead (discussion didn't mention these but they're valid)

**Key disclosures I found:**
- Line 90-92 of the chapter stated the decision logic explicitly: "If utilisation is low and the batch is small, decode is memory-bound"
- The table at lines 84-88 showed which levers do what, guiding the lever choice
- However, the chapter did NOT state "use four-bit quantization for this scenario"—I had to choose it by process of elimination

**No major shortcuts:** The chapter guided reasoning but required working through the arithmetic to justify each answer. The decision was not premade.

**Important distinction clarified by discussion:**
- Batching improves throughput (tokens per second for all users) but NOT per-request latency
- Discussion: "It does not shorten one customer's wait: the step time is what a customer waits for, and batching leaves it where it is"
- This was implicit in my Answer 2 selection but the discussion made it explicit

**"Not a pass" per discussion:**
- Rejecting the bigger card just because "it is faster" without the numbers (I provided numbers)
- Batching because "throughput" without addressing latency (I addressed latency)
- Four-bit weights without re-evaluation as cost (I included re-evaluation as a cost)

---

## Sections and passes used

- **Two passes through relevant sections:**
  1. First pass (lines 1-92): Understanding decode vs prefill, the three levers, the decision table
  2. Second pass (lines 40-102): Deep dive into four-bit quantization mechanics and other practical considerations

**Did anything in the chapter disclose answers or let me skip reasoning?**
- The chapter's decision logic (lines 90-92) directly stated "If utilisation is low and the batch is small, decode is memory-bound: bytes per step and batch size are the levers"
- The table (lines 84-88) showed that KV cache doesn't reduce bytes of weights, and that faster cards don't help memory-bound systems
- This meant Answer 1 was somewhat guided by the chapter's explicit statement
- However, Answer 2 (which lever) required working through the arithmetic myself—the chapter didn't state "use four-bit quantization for this scenario"
- Answer 3 required reading the decision logic to understand why arithmetic increase is wasted
