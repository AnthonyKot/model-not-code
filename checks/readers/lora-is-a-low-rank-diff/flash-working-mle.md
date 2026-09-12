### 1. Gut reaction after first read
Solid, intuitive breakdown of LoRA’s dimensional bottleneck that avoids hand-waving metaphors. However, framing a book chapter around validating numbers from a specific Udemy lecture feels bizarre for experienced software engineers moving into ML. The rank algebra is clean, but brushing past activation memory is a dangerous omission.

### 2. What landed
- **Function space perspective:** *"A diff of rank r is not a full fine-tune with fewer parameters. It is a different function class."* This cuts through common junior confusion that mistakes low-rank adapters for lossless parameter compression rather than a constrained subspace hypothesis.
- **The scaling trap:** *"The scale s is a convention, and the two sources disagree about it... with alpha = 16, an adapter of rank 8 is applied at scale 2 and the same adapter at rank 64 is applied at scale 0.25."* Essential callout. Engineers constantly port configs between Hugging Face PEFT and custom training scripts without realizing $\alpha / r$ flips effective learning rates.
- **Concrete dimensional accounting:** The worked breakdown of $(d_{\text{in}} + d_{\text{out}}) \times r$ per projection gives practitioners the exact tool needed to size adapter checkpoints before allocating cluster resources.

### 3. What didn't
- **The activation memory blindspot:** *"The memory you were fighting is now proportional to the diff, not to the model."* This is flatly misleading. While optimizer states drop to $\mathcal{O}(r(d_{\text{in}} + d_{\text{out}}))$, the frozen base weights must still be resident, and intermediate activation tensors stored for the backward pass scale with batch size, context length, and model width—often dominating VRAM during training.
- **Forensic trivia over architecture:** *"The essay infers that width from the reported figure; the lecture never states it."* Presenting the 3072-to-1024 dimension as an arithmetic mystery solved by reverse-engineering disk bytes feels patronizing. That is standard Grouped-Query Attention (GQA with 24 query heads and 8 KV heads of dimension 128). An engineer expects architectural reasoning, not podcast fact-checking.
- **In-place mutation in the gradient code:**
  ```python
  B -= lr * (2 * R @ A.T)
  A -= lr * (2 * B.T @ R)
  ```
  Mutating `B` before calculating `A`'s gradient uses $B_{t+1}$ alongside a stale residual $R$. If computed simultaneously (standard batch gradient descent), $\nabla_A L = 2 B^T R = 0$ at step 0 because $B_0 = 0$. It accidentally functions as an alternating update, but presenting it as exact gradient descent is sloppy.
- **Arithmetic verification:** My hand calculations matched the text exactly: 8,192 vs. 262,144 entries (3.125%); 18,350,080 parameters / 73.4 MB for the 28-layer attention adapter; and 389,021,696 parameters / 1.56 GB for the expanded MLP configuration.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The script is completely self-contained with fixed seeds, vanilla NumPy, explicit residual calculations, and deterministic printouts (`0.000` and `0.780`). Linking the random target's plateau directly to Eckart-Young-Mirsky low-rank approximation via `np.linalg.svd` makes success immediately falsifiable.

### 5. What changed between read one and read two
On read one, I appreciated the clear geometric framing of outer products and the alpha scaling warning. On read two, the heavy reliance on a Udemy course as primary technical canon became distracting, and the dismissal of non-weight VRAM overhead stood out as a critical flaw that will mislead an engineer trying to fit a batch size on a constrained GPU.

### 6. One concrete thing I'd tell the author to change
Drop the Udemy course forensic framing, identify the 1024 projection as Grouped-Query Attention (GQA), and explicitly explain that LoRA slashes parameter and optimizer memory, but does not eliminate base model footprint or sequence-length activation memory.
