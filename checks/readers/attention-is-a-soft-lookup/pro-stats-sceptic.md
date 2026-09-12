### 1. Gut reaction after first read
I was initially skeptical of the "dictionary lookup" metaphor, expecting another hand-wavy analogy that ignores mathematical reality. However, the essay surprisingly anchors the abstraction in exact arithmetic, addressing the training-versus-serving discrepancy head-on. The mechanics are presented plainly, without the mystical jargon typical of AI tutorials, which is a relief.

### 2. What landed
The mechanistic clarity around the mask is excellent. The explanation that "The mask acts on the scores, not the weights: zeroing weights after the softmax would leave a row that no longer sums to one" works perfectly for my background—it explicitly justifies the mathematical order of operations. I also appreciated the blunt reality of computational inefficiency: "The mask hides work without saving it". It dispels any illusions about the basic S × S matrix implementation.

### 3. What didn't
I balked at the casual definition of dot products: "A large product means the query and that key point the same way." This is mathematically imprecise; dot products conflate angle with magnitude. A long vector slightly orthogonal to the query can yield a larger product than a short vector pointing exactly the same way. 

Furthermore, the worked example's vectors are entirely contrived. They are toy integers explicitly crafted to produce convenient zeros and ones after division by √d<sub>k</sub> = 2. It makes the point, but the numbers were chosen to orchestrate a clean result rather than to test statistical reality. Finally, my manual calculation of row 2 unmasked yielded `(0.213, 0.8935)`—which should round to `(0.213, 0.894)`—whereas the text claims `(0.213, 0.893)`. The difference is a trivial truncation artifact, but I noticed it.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The provided Python script is entirely self-contained, requiring nothing outside the standard library. The expected floating-point outputs are explicitly listed in the text (e.g., row 4 printing `(0.594, 1.000)`), and the script utilizes exact assertions. If my environment or transcription introduced an error, I would know definitively.

### 5. What changed between read one and read two
On the first read, I was focused on verifying that the causal mask actually resolved the "cheating" paradox logically. On the second read, I scrutinized the scale and edge cases of the code. I realized that setting −∞ to `-1e9` is a software engineering hack, which makes the subsequent prompt to test `-30` to observe underflow a clever teaching moment about floating-point limitations that I missed initially.

### 6. One concrete thing I'd tell the author to change
Correct the geometric intuition of the dot product. Change "A large product means the query and that key point the same way" to "A large product means the query and key have high similarity, factoring in both their alignment and their magnitudes." This stops the math from being strictly false while preserving the conceptual mechanism.
