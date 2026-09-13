### 1. Gut reaction after first read
This is a satisfyingly concrete takedown of a leaky abstraction in PyTorch. I appreciated the mechanistic explanation of state beyond parameters, but I was immediately suspicious of the synthetic dataset and extreme distribution shift used to force the point.

### 2. What landed
The explicit separation of `requires_grad` and `eval()` is excellent. The passage "The weights were frozen; the network was not... A batch-normalisation layer carries state that is not a parameter, and a flag that stops gradients does nothing to it" resonated perfectly. It’s exactly the kind of state-management landmine software engineers need highlighted. Providing closed-form recurrence formulas for the running statistics was also a refreshing alternative to hand-waving.

### 3. What didn't
I rolled my eyes at the arbitrary data-generating process. The author admits, "The exercise's shift is deliberately extreme," yet the accuracy numbers—dropping from 99.4% to 53.4%—are dangled as a cautionary tale. They measure performance on a toy dataset explicitly engineered to fail when the mean shifts by four standard deviations. This isn't evaluating generalization on a population; it's a tautology. Furthermore, while the table's arithmetic checks out, the code uses a massive batch size of 10,000 to quietly neutralize Bessel’s correction, ensuring PyTorch's unbiased variance update cleanly matches the uncorrected variance of 0.25. It’s a bit of statistical sleight of hand to make the worked example pretty.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The script is entirely self-contained, requires no downloads, and sets deterministic seeds (`torch.manual_seed(0)`). The "Expected result" paragraph at the end provides exact floats to assert against (e.g., `probe output changed by 11.325`, `running_mean[:3] [0.902, -0.47, -1.218]`), so I would know instantly if my environment reproduced the author's exact findings.

### 5. What changed between read one and read two
On the first read, I focused on the PyTorch-specific mechanics of buffer updates. On the second read, the statistical implication of Option C (`momentum = 0`) jumped out. It freezes the buffers but normalizes using the current batch during training, meaning the model optimizes over one distribution but is evaluated on another. The author notes features differ by "up to 4.4" between train and eval modes—a massive training-serving skew that perfectly explains why the head "scores 51.9%, close to guessing." 

### 6. One concrete thing I'd tell the author to change
Explicitly define the population the "accuracy" refers to earlier in the text. When you say the head "drops from 99.4% to 53.4% accuracy on its own task" in the opening paragraph, state upfront that this task is classifying a synthetic point cloud with a hand-crafted threshold, not a real-world image classification benchmark. Don't hide the synthetic nature of the dataset until the exercise code.
