# Your GPU Is Waiting on Your JPEG Decoder

Your training job runs, the loss falls, and the accelerator's utilisation graph sits at about 31%. The proposal on the table is a faster card. If the job is shaped like this essay's example, the faster card leaves the time per step where it is and pushes utilisation lower, because the step is not waiting on the card. It is waiting on the CPU work that turns files on disk into a batch of tensors.

The shape is familiar from systems work: a producer, a consumer and a queue between them. What is worth having is the arithmetic, because two measured numbers forecast what any fix will buy before you make it.

## Two stages, and how they are scheduled

Split one training step in two. The producer reads one batch's examples, decodes and augments them and stacks them into tensors; call its wall time L, for load. The consumer copies that batch to the accelerator and runs the forward pass, the loss, the backward pass and the optimiser step; call that time C, for compute. Both are per batch, both in milliseconds.

The plainest training loop runs both in one process: it asks for a batch, waits while it is built, trains on it, and only then asks for the next. Each step costs:

<p class="formula">step = L + C</p>

Term by term: L builds one batch, C trains on it, and the step is their sum because nothing runs in parallel. The accelerator is busy only during C, so the fraction of time it is busy is C divided by the step time.

Now move the producer into a separate process and put a bounded queue between it and the training loop. The producer starts building the next batch the moment it has handed one over, so loading overlaps training. Once the queue has settled, one of the two sides is always waiting on the other: if the producer is slower, the queue is empty and the training loop waits at it; if the consumer is slower, the queue is full and the producer waits. Either way, batches pass through at the rate of the slower side:

<p class="formula">step = max(L, C)</p>

Read it as: the time per step, once the pipeline has warmed up, is whichever of the two stages takes longer, so making the faster stage faster does nothing. Over n steps the total is n × max(L, C) + min(L, C): one extra copy of the shorter stage, paid at the start or the end of the run.

The third fact is about the producer alone. Examples in a batch do not depend on one another, so W worker processes, each building whole batches, deliver W batches in the time one worker delivers one. As long as each worker has a CPU core of its own, the producer's time per batch becomes L/W:

<p class="formula">step = max(L / W, C)</p>

Here W is the number of producer workers and L/W the producer's effective time per batch. Once L/W drops below C, the consumer is the slower side and every further worker waits at a full queue.

## Worked example: three steps you can draw, then a real batch

The numbers are the book's own and the pipeline is invented. Start with units small enough to draw: L = 2, C = 1, three steps.

<figure class="diagram">
<svg viewBox="0 0 680 190" width="100%" role="img" aria-label="Timeline of three training steps with load time 2 and compute time 1. Sequential: load, train repeated three times, ending at 9. Overlapped: the producer loads back to back ending at 6, the consumer trains after each load with a one-unit gap, ending at 7." style="max-width:680px;font-family:inherit;font-size:13px">
  <g fill="currentColor" text-anchor="end">
    <text x="112" y="44">sequential</text>
    <text x="112" y="114">producer</text>
    <text x="112" y="154">consumer</text>
  </g>
  <g fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.2">
    <rect x="120" y="26" width="120" height="26"/><rect x="300" y="26" width="120" height="26"/><rect x="480" y="26" width="120" height="26"/>
    <rect x="120" y="96" width="120" height="26"/><rect x="240" y="96" width="120" height="26"/><rect x="360" y="96" width="120" height="26"/>
  </g>
  <g fill="currentColor" fill-opacity="0.6" stroke="currentColor" stroke-width="1.2">
    <rect x="240" y="26" width="60" height="26"/><rect x="420" y="26" width="60" height="26"/><rect x="600" y="26" width="60" height="26"/>
    <rect x="240" y="136" width="60" height="26"/><rect x="360" y="136" width="60" height="26"/><rect x="480" y="136" width="60" height="26"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="180" y="44">L1</text><text x="360" y="44">L2</text><text x="540" y="44">L3</text>
    <text x="180" y="114">L1</text><text x="300" y="114">L2</text><text x="420" y="114">L3</text>
    <text x="330" y="154" font-size="11">wait</text><text x="450" y="154" font-size="11">wait</text>
  </g>
  <g stroke="currentColor" stroke-width="1">
    <line x1="120" y1="176" x2="660" y2="176"/>
  </g>
  <g fill="currentColor" text-anchor="middle" font-size="11">
    <text x="120" y="188">0</text><text x="240" y="188">2</text><text x="360" y="188">4</text><text x="480" y="188">6</text><text x="540" y="188">7</text><text x="660" y="188">9</text>
  </g>
</svg>
<figcaption>Light blocks are loads (L = 2), dark blocks are training steps (C = 1). In sequence, three steps end at 9. Overlapped, the producer loads back to back and the consumer trains as each batch arrives, waiting one unit between steps: three steps end at 7, which is 3 × max(2, 1) + min(2, 1).</figcaption>
</figure>

In sequence, three steps of 2 + 1 take 9. Overlapped, the consumer starts its first step at 2, when the first load finishes; by then the producer has started the second load, which is ready at 4; the consumer finished at 3 and waits until 4. Steps end at 3, 5 and 7, two units apart: max(2, 1). Give the producer two workers and L/W = 1, so the steps settle to max(1, 1) = 1 unit each.

Now a realistic batch. Each image takes 4 ms to decode and augment on one core, and a batch is 64 images, so L = 64 × 4 = 256 ms. The training step on the accelerator takes C = 80 ms. The training set is 10,000 images, which is 156 full batches and one short one; count the short one as full, 157 steps per epoch.

| Configuration | Step formula | Step (ms) | Busy = C / step | Epoch (157 steps) |
|---|---|---|---|---|
| one process, in sequence | 256 + 80 | 336 | 23.8% | 52.8 s |
| one worker, overlapped | max(256, 80) | 256 | 31.3% | 40.2 s |
| two workers | max(128, 80) | 128 | 62.5% | 20.1 s |
| four workers | max(64, 80) | 80 | 100% | 12.6 s |
| eight workers | max(32, 80) | 80 | 100% | 12.6 s |

Three things are readable from the table. Overlapping alone saved 80 ms a step, exactly C, because in the sequential loop the producer sat idle during training; it cannot save more than min(L, C). The largest gain came from the workers, because L was more than three times C: dividing the larger term is what moves a max. And the fourth worker was the last useful one; at eight, the producers could keep up with a 32 ms step and spend more than half their time waiting.

The faster card is also on this page. Halve C to 40 ms and the one-worker pipeline still steps every 256 ms, now with the accelerator busy 40 / 256 = 15.6% of the time. Even the sequential loop only drops from 336 to 296 ms.

To get L and C for your own job, time two things in the plain sequential loop: the call that fetches the next batch, and the step, with the step's timer stopped only after the accelerator has finished its queued work.

## What the data loader does with these knobs

In PyTorch the producer is a `DataLoader` over a `Dataset`, and the three arguments that matter here map directly onto the formula.

`num_workers` is W. With the default of 0 there are no workers: the loop's call for the next batch runs `__getitem__` once per index and stacks the results in the training process itself, which is the L + C schedule. With W greater than 0 the loader starts W processes, each with its own copy of the dataset object. The main process deals out one batch's list of indices to each worker in turn; the worker calls `__getitem__` for every index, stacks the batch with the collate function and puts it on a shared result queue, and your loop receives batches in the order they were requested. Being processes rather than threads, the workers run Python decoding code in parallel instead of taking turns on one interpreter lock.

`prefetch_factor` is the depth of the queue: each worker may have that many batches outstanding, so the loader holds at most `prefetch_factor × num_workers` batches ahead of the loop, 2 × W by default. It is not a speed setting: the steady-state step is the max whatever the depth. The depth decides how large a burst of slow batches is absorbed before the loop feels it, and how much RAM waiting batches occupy.

`pin_memory=True` adds a thread in the main process that copies each finished batch into page-locked RAM, memory the operating system may not swap out or move. The copy to the accelerator can then read that memory directly without an intermediate copy, and `.to(device, non_blocking=True)` lets the copy proceed while the CPU carries on. That shortens the transfer at the front of C.

## Where the forecast stops

L/W assumes W free cores. Decoding and augmentation are CPU work, and eight workers on a machine with four free cores do not divide L by eight; the training process needs a core too. Count the cores that are actually free before trusting the last rows of the table.

The formula describes steady state with steady numbers. Worker start-up is paid again at every epoch unless `persistent_workers=True` keeps the processes alive, and on platforms that start workers by launching a fresh interpreter that cost is larger. If L varies from batch to batch, as it does with mixed image sizes, the average still sets the pace, and a deeper queue is what stops the spikes from reaching the step time.

Reading from storage is a stage too. Workers sharing one slow disk or network mount divide the decode time but not the disk's throughput; that fix is on the storage side, a few large record files instead of many small ones.

Deterministic preprocessing can be done once and cached, which removes it from L after the first epoch; a random augmentation cached the same way stops being random.

None of this is specific to PyTorch. In a `tf.data` pipeline, a map step with a parallel-calls setting is W and a closing prefetch is the queue; the forecast is the same.

<!--mission-->
## Exercise: measure L and C, forecast, then check

The script below is a real `DataLoader` with sleeps standing in for decode and for the training step, so the timings do not depend on how fast your CPU is. It needs only PyTorch and a CPU, and it ran in 23 seconds on the machine used for this essay.

```python
import time
import torch
from torch.utils.data import Dataset, DataLoader

DECODE_S = 0.004      # per example: stands in for JPEG decode + augment on one core
STEP_S = 0.080        # per batch: stands in for forward + backward on the accelerator
BATCH = 64
MEASURED_STEPS = 16   # a multiple of every worker count below


class SlowImages(Dataset):
    """A map-style dataset whose __getitem__ costs a fixed amount of CPU-side time."""

    def __len__(self):
        return 10_000

    def __getitem__(self, i):
        time.sleep(DECODE_S)                       # decode + augment
        return torch.full((3, 32, 32), float(i % 255)), i % 10


def train_step(images, labels):
    time.sleep(STEP_S)                             # forward, loss, backward, optimiser step


def mean_step_ms(loader, warmup):
    """Mean wall time per step once the pipeline is in steady state."""
    it = iter(loader)
    for _ in range(warmup):                        # worker start-up and the first burst
        train_step(*next(it))
    start = time.perf_counter()
    for _ in range(MEASURED_STEPS):
        images, labels = next(it)                  # waits here if the producer is behind
        train_step(images, labels)
    return 1000 * (time.perf_counter() - start) / MEASURED_STEPS


if __name__ == "__main__":
    torch.set_num_threads(1)
    ds = SlowImages()

    # Step 1: measure the two numbers, L (produce one batch) and C (consume one batch).
    it = iter(DataLoader(ds, batch_size=BATCH, num_workers=0))
    t = time.perf_counter(); batch = next(it); L = 1000 * (time.perf_counter() - t)
    t = time.perf_counter(); train_step(*batch); C = 1000 * (time.perf_counter() - t)
    print(f"measured L = {L:.0f} ms per batch, C = {C:.0f} ms per step")
    print(f"{'num_workers':>11} {'prefetch':>8} {'forecast':>8} {'measured':>8}")

    # Step 2: run the loader in each configuration and compare with the forecast.
    for workers, prefetch in [(0, None), (1, 2), (2, 2), (4, 2), (8, 2), (4, 1)]:
        loader = DataLoader(ds, batch_size=BATCH, shuffle=True,
                            num_workers=workers, prefetch_factor=prefetch)
        if workers == 0:
            forecast = L + C                       # load, then train, in one process
        else:
            forecast = max(L / workers, C)         # overlapped: the slower side sets the pace
        step = mean_step_ms(loader, warmup=max(workers, 1))
        print(f"{workers:>11} {str(prefetch):>8} {forecast:>8.0f} {step:>8.0f}")
```

What each part does:

- **`SlowImages`** is a map-style dataset: `__len__` gives the number of examples and `__getitem__(i)` returns example i. In real code this opens the file, decodes the JPEG and augments it; here a 4 ms sleep stands in for all of it.
- **`train_step`** stands in for C: in a real loop, the copy to the device, the model, the loss, `backward()` and `optimizer.step()`.
- **Step 1** measures before it forecasts. A loader with `num_workers=0` builds the batch inside `next(it)`, so timing that call is L; timing the step is C. L comes out above the nominal 256 ms because every one of the 64 sleeps overshoots a little, which is why the forecast uses the measured value.
- **`DataLoader(..., num_workers=workers, prefetch_factor=prefetch)`** is the only thing that changes between rows; with no workers, `prefetch_factor` must stay `None`.
- **`mean_step_ms`** discards the first steps, which include worker start-up and the first burst of W batches, then averages 16 steps. Averaging matters: with two workers batches arrive in pairs, so single step times alternate short and long.
- **`if __name__ == "__main__":`** is required where workers start by importing the script afresh; without it each worker would rerun the experiment.

**Expected result.** Run with PyTorch 2.14 on a 16-core CPU; the full output is in the essay's corpus.

```text
measured L = 269 ms per batch, C = 80 ms per step
num_workers prefetch forecast measured
          0     None      349      348
          1        2      269      271
          2        2      134      137
          4        2       80       83
          8        2       80       84
          4        1       80       84
```

Every measured step lands within a few milliseconds of its forecast; the excess is per-batch overhead the formula leaves out. Eight workers are no faster than four, and `prefetch_factor=1` is no slower than 2, as the max predicts. Then replace the two sleeps with your own measured decode time per example and step time, and read off the forecast for your pipeline. To see the core limit, replace the sleep in `__getitem__` with CPU work, such as a loop of matrix multiplications, and raise `num_workers` past the number of free cores: the measured column stops following L/W.

With an accelerator, a real job's loader gains two arguments and the copy becomes asynchronous:

```python
# illustrative, not executed (no accelerator here); API as of the time of writing
loader = DataLoader(train_ds, batch_size=64, shuffle=True, num_workers=4,
                    prefetch_factor=2, pin_memory=True, persistent_workers=True)
for images, labels in loader:
    images = images.to(device, non_blocking=True)
    labels = labels.to(device, non_blocking=True)
    ...
```

*Sources: the Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 3.11, 11.4 and 11.5, paraphrased as study material; Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, chapter 10, the data loader section; Yuan Tang, Distributed Machine Learning Patterns, the work-queue and caching patterns; the PyTorch 2.14 `torch.utils.data` source.*
