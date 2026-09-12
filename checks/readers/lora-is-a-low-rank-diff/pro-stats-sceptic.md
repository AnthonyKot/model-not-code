### 1. Gut reaction after first read
I was bracing for another breezy, hand-waving tutorial that glosses over the math. Instead, I found a piece that treats numbers as facts to be mathematically verified rather than props for a narrative. It is immensely satisfying to read an author who reverse-engineers a lecturer's rounded figures to deduce the exact matrix dimensions, and who treats parameter counts as rigorous accounting.

### 2. What landed
The section on the `alpha` scaling convention is excellent: "The course describes a hyperparameter alpha... The paper defines the applied scale as alpha divided by r." As a statistician, silent convention collisions are my nightmare when attempting to reproduce experiments. Pointing out that copying an `alpha` of 16 means entirely different things depending on a codebase's implementation is exactly the kind of rigor I demand. 

I also deeply appreciated the forensic arithmetic here: "The spoken '1000' in place of 1024 would give 18,307,072 parameters... so the reported file size is what fixes the k and v width at 1024." You didn't just accept the spoken number; you ran the calculation, found the discrepancy, and deduced the truth from the file size. 

### 3. What didn't
The connection between the SVD and the unexplained variance in the exercise feels rushed. You write: "Compute the singular values of that same random matrix with `np.linalg.svd(T, compute_uv=False)` and you will find that its best possible rank-4 approximation also leaves 0.78 of the squared entries unexplained." If a software engineer runs that command, they just get a 64-element array of singular values. You don't tell the reader how to get from that array to 0.78. They have to know the Eckart-Young-Mirsky theorem to compute the ratio of the truncated sum of squares. 

Also, I checked your arithmetic on the Raschka book error. The dimensions 25 × 50 yield exactly 1,250 entries. The book's erroneous 6,250 comes from mistakenly multiplying 1,250 by the rank (5) again.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The script is entirely self-contained, requires only numpy, and the seed guarantees determinism. Supplying the expected output (`0.000` for rank-1 and `0.780` for random) provides an immediate, exact check. The gradient derivations `2 * R @ A.T` are correct for the squared Frobenius norm, which avoids the vague "loss" hand-waving I usually have to decipher.

### 5. What changed between read one and read two
On the first read, I merely skimmed the 389 million parameter count for the "heavier configuration," assuming it was just more of the same basic multiplication. On the second read, I manually verified it. Summing the four attention matrices gives 20,480 inputs/outputs, and the three MLPs give 33,792. Multiplying their sum by rank 256 and 28 layers yields exactly 389,021,696 parameters. The fact that this perfectly matches the 1.56 GB file size (at 4 bytes per parameter) is beautiful. The math is completely airtight.

### 6. One concrete thing I'd tell the author to change
Provide the specific one-liner for the SVD variance check in the text. Change "Compute the singular values... and you will find" to: "Compute the singular values `S = np.linalg.svd(T, compute_uv=False)` and check the unexplained variance with `(S[4:]**2).sum() / (S**2).sum()`; you will find it also leaves 0.780 unexplained." Do not make the reader guess the variance formula.
