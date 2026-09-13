## 1. Gut reaction after first read (2-4 sentences).

I finally have something concrete behind “PPO”: stored probabilities, a ratio, and a loss whose slope switches off in one direction. The failure loop feels familiar from operating systems that influence their own incoming workload. But the opening promises more protection than the later explanation delivers, and that makes me wary of the author’s guarantees.

## 2. What landed — specific passages and why they worked for someone like me.

“Fixed for all the epochs on this batch” answers an engineering question immediately: which value is a snapshot, and which gets recomputed? I can follow the lifecycle of `old_logp` through the code.

“The clip never excuses a move in the wrong direction” became convincing when I checked row 3: multiplying by −1 gives −0.7 and −0.8, so `min` chooses −0.8. That negative-advantage case is where I would otherwise implement the wrong thing.

“A zero gradient does not freeze a sample’s probability” is the most useful sentence here. Shared weights mean local inactivity does not imply stable output. The action with zero advantage moving anyway makes that consequence tangible.

## 3. What didn’t — where I got lost, doubted the author, or could not follow the mechanism.

“Using each batch once avoids this” sounds like a guarantee. The essay later shows that a single large step can overshoot badly. I need the opening to distinguish reducing damage from repeated updates from preventing collapse.

“PPO replaces that boundary with … a cap on each sample’s ratio” directly encourages the interpretation that the later section corrects. I initially pictured a bound enforced on the policy.

“Drive r to any size” also fails my pen check. For the sample with old probability 0.30, the ratio cannot exceed 1/0.30 ≈ 3.33. The expected results eventually acknowledge this ceiling for another action.

My table arithmetic agrees: objectives 1.2, −2, −0.8, 0.7; individual loss derivatives with respect to log-probability 0, +2, 0, −0.7. I appreciate that these are individual derivatives; averaging four samples would introduce a factor of ¼.

“Value network” arrives without telling me how it learns. I can accept supplied advantages for this exercise, but I cannot yet trace where the most consequential input comes from.

## 4. Could I do the exercise with what is on the page, and would I know if I got it right?

I could run the supplied script once PyTorch was installed, and the printed targets give me useful checks. I also get approximately `[0.122, 0.547, 0.331]` from exponentiating and normalising the starting logits.

I could verify Part 1 with a pen. I could not independently derive Part 2’s updates confidently without a short explanation of the softmax derivative. “The full output is in the essay’s corpus” is unhelpful in a standalone essay, although the supplied endpoints are sufficient for basic comparison.

## 5. What changed between read one and read two.

On read one, I understood clipping as keeping updates small. On read two, I understood it as removing particular contributions to the gradient. I also noticed that `live` describes the gradient before the step, while the printed ratios describe the policy afterward; those numbers need not describe the same clipping status.

## 6. One concrete thing I’d tell the author to change.

Replace “a cap on each sample’s ratio” with “a cap on the objective’s reward for moving a sampled action further in the advantage’s preferred direction.” I want the accurate contract before the worked example.
