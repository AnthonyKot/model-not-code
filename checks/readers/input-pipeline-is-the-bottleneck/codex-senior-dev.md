## 1. Gut reaction after first read

I recognise this problem: someone wants to buy capacity before measuring where the consumer blocks. The producer/consumer framing gets me into the subject without requiring a crash course in model training. I trust the basic argument, but the confidence around worker scaling and queue depth exceeds what I would accept in a performance review.

## 2. What landed — specific passages

“Dividing the larger term is what moves a max” is the sentence I would remember during a capacity discussion. It connects the proposed change directly to the bottleneck.

“Each building whole batches” answers a concrete implementation question: are workers dividing one batch or producing separate batches? The later explanation of batches arriving in pairs makes that distinction useful.

“Timer stopped only after the accelerator has finished its queued work” catches exactly the mistake I might make coming from synchronous application code. I need that warning before trusting any measurements.

“A random augmentation cached the same way stops being random” is concise and gives me an actual ML-specific correctness consequence of an otherwise familiar optimisation.

## 3. What didn’t

“As long as each worker has a CPU core of its own” makes linear scaling sound guaranteed. I immediately think about memory bandwidth, allocation, contention and shared storage. The later storage qualification helps, but the initial condition is too strong.

“If L varies … the average still sets the pace” loses my trust. I have operated queues: averages alone do not tell me how much a finite buffer hides, especially when results must be delivered in order. Likewise, “It is not a speed setting” needs the steady-duration assumption attached to it.

My arithmetic reproduces 9 and 7 for the small example, all five steady-state step times, and the utilisation percentages. But the epoch column quietly drops the boundary term just introduced. For one overlapped worker, I get \(157 × 256 + 80 = 40,272\) ms, which rounds to **40.3 seconds**, not 40.2. The table works as a steady-state estimate; it should say so.

“Steps settle to … 1 unit each” initially suggested evenly spaced completions. Two whole-batch workers can deliver a burst followed by a gap. I eventually understood this as average throughput.

## 4. Could I do the exercise with what is on the page, and would I know if I got it right?

I could save and run the script once PyTorch was installed, and the expected output gives me a useful comparison. I would expect the measured curve to flatten around four workers.

I would not know how large a discrepancy warrants investigation: “a few milliseconds” is an observation, not a diagnostic rule. Replacing sleeps with my own timings would still test a timing model, not validate my actual decoder’s scaling. For a real GPU measurement, I also need the concrete synchronisation operation.

## 5. What changed between read one and read two

On the first read, I accepted the table as the worked proof. On the second, I noticed it switches from finite-run arithmetic to steady-state estimates without announcing that change.

I also appreciated the sleep example more narrowly: it demonstrates overlap clearly, but sleeping workers cannot establish the CPU-capacity claim.

## 6. One concrete thing I’d tell the author to change

I would add an explicit assumptions paragraph immediately before the formulas: constant stage durations, independent worker capacity, negligible coordination cost, and average steady-state throughput. Then label the epoch column as an estimate excluding startup and drain.
