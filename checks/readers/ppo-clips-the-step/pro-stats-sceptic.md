1. Gut reaction after first read
As a statistician, I appreciate that this essay anchors its explanation in the actual objective function rather than relying entirely on vague metaphors. The step-by-step breakdown of the `min` and `clip` functions maps cleanly to the behavior of the optimizer. However, the author's reluctance to use standard mathematical notation for basic equations initially frustrated me.

2. What landed
The explanation of how softmax interactions cause the policy to drift past the clip boundary is excellent. "A zero gradient does not freeze a sample's probability; the other samples still move the same weights, and in a softmax, lowering one action raises the others." This is exactly the kind of mechanistic detail that practitioners miss when treating algorithms as black boxes. I also appreciated the table mapping the four conditions of `A` and `r` to the active gradients, which demystifies why the `min` operation is used.

3. What didn't
I cringed at the hand-waving definition of KL divergence as "one number for how differently they spread probability." KL divergence is the expected log-likelihood ratio; treating it as a generic "difference in spread" obscures its precise statistical meaning. I also disliked the prose definition of the advantage function: "takes the reward that followed, adds the value network's estimate for the state reached, discounted by a factor γ below 1, and subtracts its estimate for the state left." Writing out $A = r + \gamma V(s') - V(s)$ takes less space and removes all ambiguity. As for the arithmetic, the worked example's numbers came out exactly right for me—row 2's gradient is indeed $+2$ and row 4's is $-0.7$—but claiming to run this on "PyTorch 2.14" when that version doesn't exist made me doubt the author's attention to detail.

4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes, absolutely. The code is entirely self-contained with hardcoded tensors, meaning there are no hidden dependencies or missing data loading steps. The author explicitly lists the expected numerical outputs in the text (e.g., `[8.085, 0.011, 0.025]` for the uncapped run and the specific live counts), so I can verify my exact floating-point results against theirs.

5. What changed between read one and read two
On my first read, I skimmed over the claim that "The clip never excuses a move in the wrong direction" as standard tutorial rhetoric. On the second read, tracing row 2 of the table specifically (where $A=-1$ but $r=2$), I saw exactly how the mathematical `min(-2, -1.2)` enforces this by selecting the uncapped penalty. I also bothered to calculate the exercise numbers for the softmax outputs during the second read. `[-1.0, 0.5, 0.0]` correctly evaluates to `[0.122, 0.547, 0.331]` when passed through the softmax function. The author didn't just invent numbers to make a pedagogical point; the math holds up.

6. One concrete thing I'd tell the author to change
Drop the prose description of equations. Replace the wordy explanation of the advantage function with its standard algebraic formulation, and remove the hand-waving about KL divergence. Software engineers reading this book can read mathematical notation; forcing them to parse prose into formulas is a disservice that introduces unnecessary ambiguity.
