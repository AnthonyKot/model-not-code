### 1. Gut reaction after first read
This is the first piece of ML writing I’ve read in months that respects software engineering instincts. It diagnoses a terrifying production failure mode—bit-identical weights producing broken outputs—that would baffle a senior backend engineer debugging an inference pipeline. If this is the standard of the book, I would readily sponsor six months of learning time for one of my seniors.

### 2. What landed
- **"a drifted backbone is a different model under the same weights file."** This lands squarely in platform reality. It speaks to immutability, artifact registries, and cache invalidation. A senior developer immediately understands the operational nightmare of mutating state hidden behind a static hash.
- **"The trap: `model.train()` sets every submodule back to training mode, and loops call it every epoch, so re-apply `eval()` to the BatchNorm layers after each call."** This is an interview differentiator. Most candidates memorize `model.eval()` for validation, but senior engineers who can be trusted in production know the framework's recursive state-toggle footguns.
- The separation of parameters from buffers via the forward-pass update formula. Rooting the mechanism in simple recurrence rather than mystical framework behavior makes it click instantly.

### 3. What didn't
The arithmetic in the table is rock solid: tracking $2 \times (1 - 0.9^n)$ and $0.25 + 0.75 \times 0.9^n$ reproduces the outputs exactly (at batch 1: $2.391$; batch 10: $1.674$; batch 50: $1.013$). 

Where I stumbled was the whiplash in **"When the statistics should move"**:
> "In the exercise, letting the buffers follow the new data gave the new head 98.5%; keeping them frozen gave 80.6%..."

After spending the entire essay framing buffer updates as a catastrophic corruption bug (*"drops from 99.4% to 53.4%"*), the author casually reveals that correctly freezing them costs nearly 18% accuracy on the target task. The text warns *"What it cannot be is an accident"* and advises *"Choose which you want,"* but it punts on the obvious engineering question: if buffer adaptation is what makes transfer learning actually work on shifted data, how do we adapt statistics safely without silently mutating the backbone artifact?

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The script is entirely self-contained, CPU-bound, runs in seconds, and uses deterministic seeding. The **Expected result** section provides exact numerical markers (`weights moved 0.0e+00`, probe shift `11.325`, new-task accuracy `0.985` vs `0.806` vs `0.519`). A developer running this would know within ten seconds whether their implementation was correct.

### 5. What changed between read one and read two
On read one, I took away a clean rule: *always freeze BatchNorm into eval mode during transfer learning to avoid corrupting the backbone*. On read two, after working through the numbers and reading the exercise results closely, I realized the core problem is domain shift. Freezing BatchNorm preserves the old task at the expense of crippling the new one. The problem isn't simply "how to freeze"; it's how to manage covariate shift without corrupting shared model state.

### 6. One concrete thing I'd tell the author to change
Bridge the gap between Option A (accidental mutation, 98.5%) and Option B (safe freeze, mediocre 80.6%). Give the reader the standard production solution for domain shift: train the head with frozen statistics, then run an explicit, post-training normalization recalibration pass (or switch to `LayerNorm`) so adaptation is a controlled, isolated step rather than an accidental side-effect of the training loop.
