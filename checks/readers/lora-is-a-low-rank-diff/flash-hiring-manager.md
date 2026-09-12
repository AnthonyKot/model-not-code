### 1. Gut reaction after first read
This is the first piece of ML writing I’ve encountered that treats fine-tuning as a systems engineering and memory constraint problem rather than alchemy or Hugging Face boilerplate. It speaks directly to byte counts, parameter budgets, and VRAM limits that my platform engineers already deal with daily. If this is how the book teaches, giving a senior developer six months to master this material is an easy sponsor approval.

### 2. What landed
The framing of LoRA as a software artifact clicked immediately: *"That object is a diff, and this essay is about why a diff of a particular shape is so much cheaper than the weights it changes."* Platform engineers understand git diffs and sparse representations; this grounds unfamiliar math in familiar architecture. 

The parameter accounting also landed squarely. Walking through `(d_in + d_out) × r` to predict exact artifact sizes on disk (deriving the 73.4 MB and 1.56 GB figures) is precisely what I look for when hiring: someone who can calculate infrastructure costs before running a cluster. Furthermore, the warning that *"a setting copied from one codebase may not mean the same thing in another"* due to the $\alpha / r$ scaling discrepancy is the exact production trap that separates seniors from tutorial copy-pasters.

### 3. What didn't
The worked example arithmetic checked out perfectly for me—the 512×512 toy projection (8,192 parameters, 1.57 MB) and the 28-layer decoder configurations matched down to the exact byte. 

Where I doubted the author was the distracting, persistent refereeing of an external video lecture: *"The LLM Engineering course reports... (lecture 7.2, as reported)"* and *"The lecture describes the projections in round speech..."* It reads like a student’s personal study notes or a dispute with a Udemy instructor rather than an authoritative engineering text. Mechanically, moving from the forward activation pass ($h = Wx + sB(Ax)$) directly into fitting $W + BA \approx W + T$ in weight space during the exercise skips explaining why optimizing a matrix reconstruction error is a valid proxy for loss over token sequences.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. It runs with vanilla NumPy on a laptop without GPU dependencies or environment friction. You know instantly if you got it right: the rank-1 target hits 0.000, the random target stalls at 0.780, and running `np.linalg.svd` provides an independent, closed-form verification that the rank ceiling is mathematical, not an optimization failure.

### 5. What changed between read one and read two
On read one, I viewed the reverse-engineering of the 73.4 MB file as a neat parameter-counting trick. On read two, I realized it was a lesson in forensic verification: the author proved the lecturer’s spoken "1000" was actually 1024 by auditing disk bytes. I also noticed a subtle detail in the exercise script: updating `B` in-place on the line immediately preceding `A` is the only reason `A` moves on step zero. Under strict simultaneous backpropagation, $B=0$ would have zeroed out $\nabla_A L$.

### 6. One concrete thing I'd tell the author to change
Drop the constant meta-citations to the Udemy course lectures ("lecture 7.x, as reported"). State the model dimensions as real-world open-weights configurations (e.g., Llama architecture) and teach the principles directly; constantly fact-checking a third-party video tutorial makes the text feel petty rather than authoritative.
