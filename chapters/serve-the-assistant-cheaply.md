# Serve the Assistant Cheaply

Chapter 6's assistant answers a question with three calls to the writer, and the writer produces its answer one token at a time. Chapter 1's encoder, by contrast, costs one pass over its weights per query, and that pass is the same size whether the query has three words or thirty. The generator's bill grows with every token it writes, and the shop's first month of serving ends with a GPU that reports itself mostly idle and a bill that is not.

The chapter's question: **where does a generated token's cost go, and which lever moves it?** There are three levers, and one number decides between them. Each token the generator emits needs every weight of the model read once from memory; the arithmetic done on those weights is small. So a decode step is usually waiting on memory, not on the arithmetic units, and a lever that reduces arithmetic does nothing for it. The three levers are: do not recompute what you already have (a cache of keys and values), read fewer bytes per weight (four bits instead of sixteen), and make each read of the weights serve many customers (batching). The chapter shows each on chapter 1's generator, then hands you a week's serving report and a purchase proposal to judge.

Everything is synthetic and small: chapter 1's sixteen-dimensional generator, an eight-weight block quantised by hand, a 2,048 × 2,048 matrix timed on a CPU. The timings are measured, so they vary from machine to machine; the counts and the arithmetic do not.

## A token costs a pass over the weights

Chapter 1 generated an answer by feeding the whole sequence to the block at every step, and took the last position's output as the next token. The causal mask makes that wasteful in a specific way. Position t attends only to positions up to t, so once token t's key and value are computed, nothing that comes later changes them. Feeding the whole sequence again recomputes every key and value that already existed.

Count it for a two-word prompt and a seven-token answer. Without a cache, step 1 computes keys and values for three positions and a 3 × 3 table of scores; step 2 for four positions and a 4 × 4 table; and so on to 9 × 9. That is 3 + 4 + … + 9 = 42 key/value rows and a score table whose area grows with the square of the length. With a **KV cache**, the prompt is processed once, the **prefill**, giving three rows and a 3 × 3 table; then each **decode** step computes one new row and one row of scores against everything stored: 1 × 4, 1 × 5, up to 1 × 9. Nine rows in all, and the score work is a single row per step. The exercise prints both counts and the same answer from both.

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

The two phases behave differently under load. Prefill handles the whole prompt in one pass: many tokens, one read of the weights, so the arithmetic units are busy and the time to the first token depends on how fast they are. Decode handles one token per pass: one read of the weights for a single token's worth of arithmetic, so each step is bound by how fast the weights can be read, and tokens per second depends on memory bandwidth. This is the number the opening promised: a decode step at a small batch is **memory-bound**, and the levers that help it are the ones that reduce bytes read per token.

The cache is memory too, and it grows with every token in every request being served:

<p class="formula">cache bytes = 2 · L · H<sub>kv</sub> · d<sub>head</sub> · b · T</p>

The 2 is for keys and values; L the number of layers; H<sub>kv</sub> the number of key/value heads; d<sub>head</sub> the width of each; b the bytes per number; T the tokens in the sequence. For an invented model with 24 layers, 8 key/value heads of width 128 and 2-byte numbers, one token costs 96 KB of cache: 0.09 GB at 1,000 tokens, 0.73 GB at 8,000, 2.93 GB at 32,000, per request. Two ways to shrink it follow from the formula. **Grouped-query attention** lets several query heads share one key/value head, cutting H<sub>kv</sub>: without it, a model with 32 key/value heads would need 2.93 GB for the same 8,000-token request. A **sliding window** caps how many past positions a layer attends to, capping T for that layer: a window of 4,096 holds the cache at 0.38 GB however long the conversation runs, at the cost of tokens beyond the window being reachable only through what later positions carried forward.

## Four bits per weight

A weight is stored as a number, and how many bytes the number takes is a choice. Sixteen-bit floats are the usual training format. Storing each weight in four bits reads a quarter of the bytes per step, which for a memory-bound decode is close to a quarter of the time.

The mapping is a scale and an offset per **block** of weights. Take a block of eight:

| Weight | 0.12 | −0.31 | 0.05 | 0.27 | −0.08 | 0.19 | −0.22 | 0.02 |
|---|---|---|---|---|---|---|---|---|

The block's smallest value is −0.31 and its largest 0.27, a range of 0.58. Four bits give sixteen levels, so the **scale** is 0.58 / 15 = 0.03867 and the **offset** is −0.31. Each weight becomes the integer code nearest to (w − offset) / scale:

<p class="formula">code = round( (w − offset) / scale ),  ŵ = code · scale + offset</p>

w is the original weight, ŵ its reconstruction from the code; the offset places level 0 at the block's minimum and the scale is the distance between levels. The eight codes are 11, 0, 9, 15, 6, 13, 2, 9, and the reconstructions 0.1153, −0.31, 0.038, 0.27, −0.078, 0.1927, −0.2327, 0.038. The largest error is 0.0180, which is below half a step, 0.0193, and it always is: rounding to the nearest level can never miss by more than half the distance between levels. Two weights, 0.05 and 0.02, now share a code and a value; four bits cannot tell them apart.

Now put 2.4 in the fourth slot. The range becomes 2.71, the scale 0.1807, and the other seven weights are squeezed into the bottom four levels: codes 2, 0, 2, 1, 3, 0, 2. The largest error among them is 0.09, five times what it was, because one outlier bought its own precision with everyone else's. Real weight matrices have such outliers, and past a few billion parameters a handful of dimensions carry them, which is why a naive four-bit mapping degrades large models and why the working schemes keep the outliers in sixteen bits and quantise the rest.

The block size is the other trade. Every block carries a scale and an offset, two 16-bit numbers, so at blocks of eight the bookkeeping weighs as much as the codes: the exercise's 2,240-weight generator takes 1,120 bytes of codes and 1,120 bytes of scales and offsets. At blocks of 64 the bookkeeping drops to 140 bytes and the largest error rises from 0.1858 to 0.2151, because a bigger block is more likely to hold an outlier. On the toy generator the answer is unchanged either way. For an invented three-billion-weight model the arithmetic is 5.59 GB at two bytes, 2.79 at one, 1.40 at half a byte plus 0.17 GB of bookkeeping at blocks of 64. Chapter 3's LoRA adapters sit beside a four-bit base in full precision; the base is what is read per step, and it is what shrinks. Whether the shop's answers survived the mapping is chapter 2's question, on the golden set, not a benchmark's.

## Batching is where throughput comes from

A decode step at batch 1 reads every weight to produce one token. At batch B it reads every weight once and produces B tokens. For one d × d weight matrix and B tokens, the arithmetic is 2·B·d² operations and the bytes read are 2·d² at two bytes a weight, so the operations per byte, the **arithmetic intensity**, is B. A machine has a ratio of its own: how many operations it can do in the time it takes to read one byte. Below that ratio the step is paid in bytes and its time does not depend on B; above it, the arithmetic units become the limit and the step time grows with B.

For an invented machine that reads 300 GB/s and computes 60 TFLOP/s, the ratio is 200. A 4,096 × 4,096 matrix is 33.6 MB and takes 112 µs to read:

| Batch B | Memory time | Compute time | Step | Per token |
|---|---|---|---|---|
| 1 | 111.8 µs | 0.6 µs | 111.8 µs | 111.85 µs |
| 8 | 111.8 µs | 4.5 µs | 111.8 µs | 13.98 µs |
| 64 | 111.8 µs | 35.8 µs | 111.8 µs | 1.75 µs |
| 200 | 111.8 µs | 111.8 µs | 111.8 µs | 0.56 µs |
| 400 | 111.8 µs | 223.7 µs | 223.7 µs | 0.56 µs |

Up to B = 200 the step costs the same and the cost per token falls by B. Past it, the per-token cost stops falling. On the exercise's CPU the same shape appears with a 2,048 × 2,048 matrix: the step barely moves from batch 1 to 4 and the cost per token falls from 360 µs to 92, then compute takes over and by batch 256 the per-token cost has flattened near 19 µs. The numbers are this machine's; the shape is every machine's.

Batching pays in latency. A customer's token waits for the step, and the step at a full batch is longer. **Static** batching collects B requests, runs them together and returns them together, so a short answer waits for the longest one in its batch: four requests of 3, 1, 4 and 2 decode steps occupy 16 slot-steps and use 10. **Continuous** batching frees a slot the moment a request finishes and admits the next request into it, so a fifth request arriving at step 2 fills a freed slot and the same 16 slot-steps carry 13. The prefill of the newcomer is the wrinkle: it is a big compute-bound pass in the middle of memory-bound decode steps, and splitting it into chunks keeps the decode steps flowing. Diagrams of equal-length requests arriving together are the happy path; real arrivals are ragged, and the continuous scheduler is what handles the rags.

What batching cannot fix is the empty machine. A server that has scaled to zero takes tens of seconds to load weights before its first token, and the first customer pays it. Keeping one replica warm is a fixed cost against a variable one, and the trade is the shop's.

## Which lever, from the numbers on a running server

A serving dashboard shows utilisation of the arithmetic units, memory in use, time to first token, tokens per second per request, and requests in flight. Each lever changes some of those and not others:

| Lever | Reduces | Does not change | Costs |
|---|---|---|---|
| KV cache | work per decode step, from the sequence length to one row | bytes of weights read per step | memory per request |
| Four-bit weights | bytes read per step, so time per token at small batch | arithmetic; the cache | an evaluation of the answers again |
| Batching | cost per token, by B, while memory-bound | time per token for one request | latency per request; scheduler complexity |
| A faster card | memory time by its bandwidth ratio; compute time by its arithmetic ratio | which of the two you are waiting on | money |

The reading order is fixed by the opening's number. If utilisation is low and the batch is small, decode is memory-bound: bytes per step and batch size are the levers, and a card with more arithmetic buys nothing that the dashboard is waiting on. If utilisation is high at a full batch, the arithmetic units are the limit and the faster card is the honest lever.

**Before reading on:** a different shop's dashboard shows 93% utilisation with forty requests decoding at once, memory nearly full, and a queue that grows every evening. Say which lever you would pull first, and which number you would look at to check that you were right. The next paragraph is the check.

## What a real project adds

The machine's ratio is the vendor's number and dated; measure your own step time against batch size as the exercise does, on your card, and use the crossover you observe.

A quantised model is a different model. Its answers go back through chapter 6's golden set and chapter 2's release comparison before it serves anyone, and the standard error on that set says whether a change is real.

The cache is per request and memory is the real capacity limit: the number of requests a card can decode at once is the free memory divided by the cache per request, before any batching arithmetic applies.

Cost per answer is the number chapter 8 needs: tokens per answer, steps per second at the batch you actually run, and the card's price per hour, multiplied out.

<!--mission-->
## Exercise: cache the keys, quantise the weights, batch the tokens

The script trains chapter 1's generator with the attention written out, generates with and without a cache, quantises a block by hand and then the whole generator at two block sizes, and times a matrix product at five batch sizes. PyTorch on a CPU, about four seconds. The timing lines are measured on eight CPU threads and will differ on your machine; every other line is exact.

```python
import math
import time
import torch
import torch.nn as nn
import torch.nn.functional as F

torch.set_num_threads(8)
titles  = ["slim wireless keyboard", "steel kettle", "leather watch", "canvas backpack"]
answers = ["the slim wireless keyboard fits a laptop bag", "the steel kettle boils water fast",
           "the leather watch tells the time", "the canvas backpack carries school books"]
words = sorted({w for t in titles + answers for w in t.split()})
vocab = ["<pad>", "<s>", "</s>"] + words
ids = {w: i for i, w in enumerate(vocab)}
PAD = 0

def batch(texts):
    rows = [["<s>"] + t.split() + ["</s>"] for t in texts]
    width = max(len(r) for r in rows)
    return torch.tensor([[ids[w] for w in r] + [PAD] * (width - len(r)) for r in rows])

class Block(nn.Module):
    """Chapter 1's block with the attention written out, so the keys and values can live in a cache."""
    def __init__(self, n_vocab, dim=16, max_len=64):
        super().__init__()
        self.tok, self.pos = nn.Embedding(n_vocab, dim), nn.Embedding(max_len, dim)
        self.q, self.k, self.v = nn.Linear(dim, dim), nn.Linear(dim, dim), nn.Linear(dim, dim)
        self.dim = dim
    def forward(self, x, cache=None, start=0):
        h = self.tok(x) + self.pos(torch.arange(start, start + x.shape[1]))   # x holds positions start .. start+T-1
        q, k, v = self.q(h), self.k(h), self.v(h)
        if cache is not None:                                             # keys and values of earlier positions are reused
            if "K" in cache:
                k, v = torch.cat([cache["K"], k], 1), torch.cat([cache["V"], v], 1)
            cache["K"], cache["V"] = k, v
        T, S = q.shape[1], k.shape[1]
        mask = torch.ones(T, S, dtype=torch.bool).tril(S - T)             # a position sees keys up to itself
        scores = (q @ k.transpose(1, 2)) / math.sqrt(self.dim)
        scores = scores.masked_fill(~mask, float("-inf"))
        return h + F.softmax(scores, -1) @ v, (T, S)

torch.manual_seed(0)
gen, head = Block(len(vocab)), nn.Linear(16, len(vocab))
opt = torch.optim.Adam(list(gen.parameters()) + list(head.parameters()), lr=0.01)
x = batch([f"{t} {a}" for t, a in zip(titles, answers)])
for step in range(300):
    logits = head(gen(x[:, :-1])[0])
    loss = F.cross_entropy(logits.reshape(-1, len(vocab)), x[:, 1:].reshape(-1), ignore_index=PAD)
    opt.zero_grad(); loss.backward(); opt.step()
print(f"generator trained, next-token loss {loss.item():.4f}")

# ---------- Part 1: the same answer with and without a cache ----------
def generate(prompt, max_new=12, use_cache=False):
    """Greedy decoding. Returns the text, the number of key/value rows computed, and the score-matrix shapes."""
    out = [ids["<s>"]] + [ids[w] for w in prompt.split()]
    rows, shapes = 0, []
    with torch.no_grad():
        if use_cache:
            cache = {}
            h, (T, S) = gen(torch.tensor([out]), cache, 0); rows += T; shapes.append((T, S))   # prefill: the prompt in one pass
            nxt = int(head(h)[0, -1].argmax())
            for _ in range(max_new):
                out.append(nxt)
                if vocab[nxt] == "</s>":
                    break
                h, (T, S) = gen(torch.tensor([[nxt]]), cache, len(out) - 1); rows += T; shapes.append((T, S))   # decode: one token
                nxt = int(head(h)[0, -1].argmax())
        else:
            for _ in range(max_new + 1):
                h, (T, S) = gen(torch.tensor([out])); rows += T; shapes.append((T, S))       # the whole sequence, every step
                nxt = int(head(h)[0, -1].argmax()); out.append(nxt)
                if vocab[nxt] == "</s>":
                    break
    return " ".join(vocab[i] for i in out[1 + len(prompt.split()):]), rows, shapes

for use_cache in (False, True):
    text, rows, shapes = generate("steel kettle", use_cache=use_cache)
    print(f"cache {str(use_cache):5s}: {text!r}; key/value rows computed {rows}; score matrices {shapes}")
long_prompt = " ".join(["steel kettle"] * 8)
for use_cache in (False, True):
    t0 = time.perf_counter()
    for _ in range(20):
        generate(long_prompt, max_new=30, use_cache=use_cache)
    print(f"cache {str(use_cache):5s}: {1000 * (time.perf_counter() - t0) / 20:.1f} ms per 30-token generation from a 17-token prompt (measured)")

# ---------- Part 2: four bits per weight ----------
def quantise(w, bits=4, block=8):
    """Uniform asymmetric quantisation: per block, scale = (max - min) / (2^bits - 1), offset = min."""
    flat = w.flatten(); n = flat.numel(); pad = (-n) % block
    blocks = torch.cat([flat, torch.zeros(pad)]).view(-1, block)
    lo, hi = blocks.min(1, keepdim=True).values, blocks.max(1, keepdim=True).values
    scale = (hi - lo).clamp(min=1e-8) / (2 ** bits - 1)
    codes = ((blocks - lo) / scale).round().clamp(0, 2 ** bits - 1)
    return (codes * scale + lo).flatten()[:n].view_as(w), codes, scale, lo

w8 = torch.tensor([0.12, -0.31, 0.05, 0.27, -0.08, 0.19, -0.22, 0.02])
deq, codes, scale, lo = quantise(w8)
print(f"one block: codes {codes.flatten().int().tolist()}, scale {scale.item():.5f}, offset {lo.item():.2f}, "
      f"largest error {(deq - w8).abs().max().item():.4f} (half a step is {scale.item() / 2:.5f})")
w8[3] = 2.4
deq, codes, scale, lo = quantise(w8)
keep = [i for i in range(8) if i != 3]
print(f"with 2.4 in slot 3: codes {codes.flatten().int().tolist()}, scale {scale.item():.4f}, largest error among the other seven {(deq - w8)[keep].abs().max().item():.4f}")

with torch.no_grad():
    saved = {k: v.clone() for k, v in gen.state_dict().items()}
    n = sum(p.numel() for p in gen.parameters())
    for block in (8, 64):
        worst = 0.0
        for p in gen.parameters():
            deq, *_ = quantise(p.data, block=block)
            worst = max(worst, (deq - p.data).abs().max().item()); p.data.copy_(deq)
        text = generate("steel kettle", use_cache=True)[0]
        extra = 2 * 2 * math.ceil(n / block)                     # a 16-bit scale and a 16-bit offset per block
        print(f"generator's {n} weights in 4-bit blocks of {block}: codes {n // 2} bytes + {extra} bytes of scales and offsets "
              f"(16-bit weights: {2 * n}); largest error {worst:.4f}; answer {text!r}")
        gen.load_state_dict(saved)

# ---------- Part 3: what a batch costs ----------
d = 2048
W = torch.randn(d, d)
print(f"one {d} x {d} weight matrix, {2 * d * d / 1e6:.1f} MB at 2 bytes a weight; step time by batch size (measured):")
for B in (1, 4, 16, 64, 256):
    X = torch.randn(B, d)
    for _ in range(3):
        X @ W.T
    t0 = time.perf_counter()
    for _ in range(50):
        X @ W.T
    ms = 1000 * (time.perf_counter() - t0) / 50
    print(f"  B = {B:3d}: {ms:6.3f} ms per step, {1000 * ms / B:7.1f} us per token, arithmetic intensity {B} flop per byte")
```

What each part does:

- **`Block`** is chapter 1's block with the attention spelled out instead of `scaled_dot_product_attention`, so the keys and values can be kept. `cache` is a dictionary the caller owns; on a decode step the new key and value are appended to it and the scores are computed against all of them. `start` tells the position embedding where the new token sits. The mask `tril(S − T)` lets each of the T query positions see keys up to its own index among the S stored.
- **Part 1**, `generate`, runs greedy decoding two ways and counts key/value rows and score-matrix shapes. With the cache, the prompt is one prefill pass and each later step feeds one token. The timing lines repeat a 30-token generation from a 17-token prompt twenty times.
- **Part 2**, `quantise`, is the per-block scale and offset: codes are integers 0–15, the reconstruction is `code · scale + offset`. It runs on the hand block, on the block with the outlier, and on every weight tensor of the generator at blocks of 8 and 64, restoring the weights after each. The byte counts assume 16-bit scales and offsets.
- **Part 3** times `X @ W.T` for a 2,048 × 2,048 matrix at batch 1 to 256 after three warm-up calls, and prints the per-token cost and the arithmetic intensity B.

**Expected result.** Timing lines vary; everything else is deterministic:

```
generator trained, next-token loss 0.1430
cache False: 'the steel kettle boils water fast </s>'; key/value rows computed 42; score matrices [(3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9)]
cache True : 'the steel kettle boils water fast </s>'; key/value rows computed 9; score matrices [(3, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9)]
cache False: 1.2 ms per 30-token generation from a 17-token prompt (measured)
cache True : 1.0 ms per 30-token generation from a 17-token prompt (measured)
one block: codes [11, 0, 9, 15, 6, 13, 2, 9], scale 0.03867, offset -0.31, largest error 0.0180 (half a step is 0.01933)
with 2.4 in slot 3: codes [2, 0, 2, 15, 1, 3, 0, 2], scale 0.1807, largest error among the other seven 0.0900
generator's 2240 weights in 4-bit blocks of 8: codes 1120 bytes + 1120 bytes of scales and offsets (16-bit weights: 4480); largest error 0.1858; answer 'the steel kettle boils water fast </s>'
generator's 2240 weights in 4-bit blocks of 64: codes 1120 bytes + 140 bytes of scales and offsets (16-bit weights: 4480); largest error 0.2151; answer 'the steel kettle boils water fast </s>'
one 2048 x 2048 weight matrix, 8.4 MB at 2 bytes a weight; step time by batch size (measured):
  B =   1:  0.360 ms per step,   359.6 us per token, arithmetic intensity 1 flop per byte
  B =   4:  0.369 ms per step,    92.2 us per token, arithmetic intensity 4 flop per byte
  B =  16:  0.648 ms per step,    40.5 us per token, arithmetic intensity 16 flop per byte
  B =  64:  1.377 ms per step,    21.5 us per token, arithmetic intensity 64 flop per byte
  B = 256:  4.907 ms per step,    19.2 us per token, arithmetic intensity 256 flop per byte
```

Read it against the chapter. The cache gives the same answer with 9 rows instead of 42, and the score matrices shrink from n × n to 1 × n. The hand block's error is under half a step; the outlier multiplies the others' error by five. Blocks of 64 cost less bookkeeping and a slightly larger error, and neither changes the toy's answer. The step time is nearly flat from batch 1 to 4 while the per-token cost falls, and flattens near 19 µs by batch 256.

Two things to try. First, change `bits=4` to `bits=2` in `quantise`: the hand block's four levels put the largest error at 0.9611 for blocks of 8, and at blocks of 64 the generator's answer becomes *the leather slim boils water fast*. Second, set `d = 512`: the whole matrix is 0.5 MB, the step at batch 1 takes about 25 µs, and compute takes over sooner, with the per-token cost only falling by about twenty times to batch 256 instead of the larger matrix's.

### Your call: the week 37 serving report

The shop runs the assistant's generator on one GPU. Here is the week's report and the platform team's proposal. The report's last two lines are what a purchase decision costs and what it claims; the rest is what the dashboard shows.

```
SERVING REPORT, week 37 (one GPU, the assistant's generator)
  requests per second, average          0.8
  prompt tokens per request (retrieved chunks + question)  600
  answer tokens per request               120
  time to first token                     180 ms
  decode speed per request                28 tokens/s  (an answer takes 4.3 s)
  requests decoding at once, average      3.4
  generated tokens per second, all users  96
  GPU utilisation (arithmetic units busy) 19%
  GPU memory: weights 7.0 GB + caches 1.2 GB of 24.0 GB
  monthly cost, this GPU                  620
PROPOSAL from the platform team: move to the next card up: twice the arithmetic, 1.4 times the memory bandwidth, 48 GB, 1450 a month, 'to bring latency down'.
```

Write down, before opening the discussion:

1. Whether decode on this card is memory-bound or compute-bound, and the two lines of the report that say so. This is the step every later answer depends on.
2. The lever you would pull first to bring an answer's 4.3 seconds down, what it would cost, and roughly what it would gain; use the chapter's arithmetic, with bytes per step and the report's numbers.
3. One option you reject, with the number that rejects it. The proposal is one candidate; "keep everything" and "buy it anyway" are both allowed if the numbers support them.
4. What you cannot tell from this report and would measure before spending money.

A lever chosen for a reason the report's numbers do not support is not a pass, even if it is the lever the discussion picks.

<details>
<summary>Hints, if you are stuck</summary>

About three and a half requests at once and 19% utilisation say what the arithmetic units are doing. Each decode step reads the 7 GB of weights; at 28 steps a second, that is a bandwidth. Ask what each proposal changes about bytes per step and about the arithmetic, and which of the two the step is waiting on. Batching raises tokens per second for all users; ask whether it changes the seconds one customer waits.

</details>

<details>
<summary>Discussion — open after writing your decision</summary>

**Memory-bound.** About three and a half requests decoding at once and 19% utilisation: the arithmetic units are idle most of the time, and the step is waiting on the weights. Each step reads 7 GB; at 28 steps per second that is about 196 GB/s of weight traffic, which is the card's bandwidth being spent almost entirely on weights. Time to first token is short, 180 ms for a 600-token prefill, so the compute-bound phase is not where the four seconds go.

**The proposal.** Twice the arithmetic changes nothing a memory-bound decode is waiting on. 1.4 times the bandwidth is the part that would help, and it caps the gain at about 1.4 times: 28 tokens per second becomes at most 39, an answer of 4.3 seconds becomes about 3.1, for 830 more a month. The 48 GB is headroom the report does not need: caches use 1.2 GB, leaving 15.8 GB free. Rejecting it is well supported by the 19% line; buying it anyway is defensible only if the shop wants 3 seconds and will not accept a re-evaluated model, which the report cannot say.

**Four-bit weights.** Bytes per step fall from 7 GB to about 1.75 GB. If the step stays bandwidth-bound, that is up to four times the decode speed, 28 to about 112 tokens per second, on the same card and the same bill. The cost is chapter 2's: the quantised generator's answers go through chapter 6's golden set and a release comparison before it serves anyone. This is the first lever for the four seconds.

**Batching.** With 0.8 requests a second and 4.3 seconds an answer, about 3.4 requests overlap, and a step at that batch reads the weights once for 3.4 tokens. Admitting more requests per step would raise the tokens per second for all users, about 4.7 times at batch 16 if the step time holds, and there is memory for 48 requests' caches. It does not shorten one customer's wait: the step time is what a customer waits for, and batching leaves it where it is. Batching is the right lever for a bill or a queue, and the wrong one for this complaint, which is latency at low load.

**What to measure first.** Step time against batch size on this card, as the exercise does, to find where the machine's own crossover is; and the quantised model's golden-set scores against the current one, with the standard error, before anyone touches the proposal.

**Not a pass:** the bigger card because "it is faster"; batching because "throughput" without saying it leaves per-request latency alone; four-bit weights without the re-evaluation as part of its cost.

</details>

*Sources: Building LLMs like ChatGPT from Scratch and Cloud Deployment (Neuralearn.ai, Udemy), lectures 3.5, 3.6, 3.7 and 4.1; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 3.15, 7.3 and 8.5; all paraphrased as study material. Inference Engineering, pp. 64–65, 122–130 and 188–191 (physical); Hands-On LLM Serving and Optimization (EPUB), chapters 3, 5 and 6; Автостопом по Квантизации (slides), pp. 12–14; Large Language Models: A Deep Dive, p. 188 (physical).*
