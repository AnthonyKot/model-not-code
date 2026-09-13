# The Program Is Now a Table of Numbers, and Training Is the Compile Step

A model is a function whose parameters, the numbers that control its output, are fitted to data. You choose the function's form and how to measure its errors. Training repeatedly changes the parameters to reduce those errors. The resulting values determine the predictions when you run the model. In that sense training plays the part a compiler plays in ordinary software: it turns what you specified, a function's form, a loss and a dataset, into the artifact you ship, which is a table of numbers rather than machine code.

## Three points and a starting loss

Take the example points (1, 2), (2, 4) and (3, 6). Each pair contains an input x and its known answer y. A straight-line model predicts m·x + c: m is the **weight**, which multiplies the input, and c is the **bias**, which adds a fixed offset. Here m is the line's slope and c its intercept. The points lie on y = 2x, so m = 2 and c = 0 would fit them exactly.

Start with m = c = 0. Every prediction is zero. A **loss** is a single number measuring prediction error; smaller means a better fit according to that measure. Use mean squared error: square each prediction minus its answer, then average.

| Input x | Answer y | Prediction | Error | Squared error |
|---|---|---|---|---|
| 1 | 2 | 0 | −2 | 4 |
| 2 | 4 | 0 | −4 | 16 |
| 3 | 6 | 0 | −6 | 36 |
| Total | | | | 4 + 16 + 36 = 56 |
| Mean | | | | 56/3 ≈ 18.667 |

For any number of rows, the same calculation is:

<p class="formula">L = (1/n) ∑<sub>i=1</sub><sup>n</sup> (m·x<sub>i</sub> + c − y<sub>i</sub>)<sup>2</sup></p>

L is the loss and n the number of rows. The symbol ∑ adds the expression for each row i, from the first through the nth. x<sub>i</sub> is that row's input, y<sub>i</sub> its answer, and m·x<sub>i</sub> + c its prediction using weight m and bias c. Subtracting the answer gives the error; the superscript 2 squares it; dividing by n gives the mean.

Squaring prevents positive and negative errors from cancelling. It also makes large errors count disproportionately: an error of 10 contributes 100, while an error of 3 contributes 9. Choosing this formula therefore affects which line training produces.

## From loss to gradient to step

A **derivative** measures how fast a quantity changes as another changes. A **partial derivative** measures that rate for one parameter while holding the others fixed. The **gradient** collects the loss's partial derivatives for all parameters. Its direction is uphill: towards increasing loss.

For one row, changing m changes the prediction at rate x; changing c changes it at rate 1. Squaring the error contributes a factor of twice the error. Multiplying these rates gives each row's contribution to the loss derivative, then averaging gives the gradient:

| Row | Contribution for m: 2 × error × x | Contribution for c: 2 × error |
|---|---|---|
| (1, 2) | 2 × (−2) × 1 = −4 | 2 × (−2) = −4 |
| (2, 4) | 2 × (−4) × 2 = −16 | 2 × (−4) = −8 |
| (3, 6) | 2 × (−6) × 3 = −36 | 2 × (−6) = −12 |
| Mean | (−4 − 16 − 36)/3 = −56/3 ≈ −18.667 | (−4 − 8 − 12)/3 = −8 |

Both derivatives are negative, so increasing either parameter slightly reduces the loss at this starting point. **Gradient descent** repeatedly moves the parameters against the gradient. The **learning rate**, η, is the multiplier you choose to control the size of each move:

<p class="formula">m ← m − η · ∂L/∂m,&nbsp;&nbsp;&nbsp; c ← c − η · ∂L/∂c</p>

m and c are the weight and bias; each arrow replaces the old value with the expression on its right. L is the loss. ∂L/∂m and ∂L/∂c are its partial derivatives for the weight and bias, respectively. η multiplies each derivative, and subtraction moves downhill locally. Compute both derivatives from the same old parameters before updating either.

With η = 0.05, m becomes 0 − 0.05 × (−56/3) ≈ 0.933 and c becomes 0 − 0.05 × (−8) = 0.4. Score the new line:

| Input | Prediction, rounded | Error, rounded |
|---|---|---|
| 1 | 0.933 + 0.4 ≈ 1.333 | −0.667 |
| 2 | 0.933 × 2 + 0.4 ≈ 2.267 | −1.733 |
| 3 | 0.933 × 3 + 0.4 ≈ 3.2 | −2.8 |
| Mean squared error | | ((−0.667)² + (−1.733)² + (−2.8)²)/3 ≈ 3.763 |

Keep unrounded values during calculation; the table displays approximations. One step reduces loss from 18.667 to 3.763. Repeat prediction, loss, gradient and step 200 times: m ≈ 1.971, c ≈ 0.066 and loss ≈ 0.00062.

The fall is fast initially, then slower. Here the gradient approaches zero as the line approaches the best fit. Multiplying a shrinking gradient by a fixed learning rate produces smaller steps. More steps bring the parameters closer to (2, 0), with progressively smaller improvements.

## Too far or too slowly

Restart at zero with η = 0.5, ten times larger. The first update gives m = 0 − 0.5 × (−56/3) ≈ 9.333 and c = 0 − 0.5 × (−8) = 4.

| Input | Prediction, rounded | Squared error |
|---|---|---|
| 1 | 9.333 + 4 ≈ 13.333 | (13.333 − 2)² |
| 2 | 9.333 × 2 + 4 ≈ 22.667 | (22.667 − 4)² |
| 3 | 9.333 × 3 + 4 ≈ 32.0 | (32.0 − 6)² |
| Mean squared error | | ((13.333 − 2)² + (22.667 − 4)² + (32.0 − 6)²)/3 ≈ 384.3 |

The step overshoots the fit. The new gradient reverses direction and grows; the next update sends m to −32.9 and loss to 7,942. The third sends m to 159.3 and loss to 164,200. Loss exceeds a million at step 4. This is **divergence**: successive updates move farther from the solution.

For these points, squared-error loss forms a bowl with a single bottom over the possible values of m and c. A sufficiently small step descends towards it; a large one can cross the bowl and land higher on the opposite side. Too small a learning rate makes progress slow enough that your run ends well short of the best fit.

## What else determines the result

The loss formula sets the error penalties and therefore the gradients. Mean absolute error averages error magnitudes without squaring them, reducing the influence of large errors. Changing the loss can change the fitted parameters even with identical data.

**Preprocessing** transforms inputs before prediction. A fitted normalisation transform uses the training data's mean and spread to centre and scale inputs. Those statistics stay fixed during gradient updates, but remain part of the program. Ship them with the weights: recomputing them on different data changes predictions even when m and c stay unchanged.

Training loss measures fit only on the rows used for training. To assess predictions on unseen rows, reserve separate data before fitting either the parameters or preprocessing. A falling training loss alone does not establish how the model performs on rows it has not seen.

A network with non-linear operations, whose outputs cannot be expressed as a straight-line function of their inputs, uses the same training loop. Its loss need not form a single bowl, so the loop need not reach the best possible fit.

<!--mission-->
## Exercise: run the loop and break it

Run this plain Python script; no libraries are required.

```python
# Three points on y = 2x; model y = m*x + c; mean squared error; plain gradient descent.
points = [(1, 2), (2, 4), (3, 6)]

def loss(m, c):
    return sum((m * x + c - y) ** 2 for x, y in points) / len(points)

def gradients(m, c):
    n = len(points)
    dm = sum(2 * (m * x + c - y) * x for x, y in points) / n   # d loss / d m
    dc = sum(2 * (m * x + c - y) for x, y in points) / n       # d loss / d c
    return dm, dc

for lr in (0.05, 0.5):
    m = c = 0.0
    print(f"learning rate {lr}: start loss {loss(m, c):.4f}")
    for step in range(1, 201):
        dm, dc = gradients(m, c)
        m -= lr * dm
        c -= lr * dc
        if step <= 3 or step in (10, 50, 200):
            print(f"  step {step:3d}: m = {m:.4f}  c = {c:.4f}  loss = {loss(m, c):.4g}")
        if loss(m, c) > 1e6:
            print(f"  diverged: loss above a million at step {step}")
            break
```

`points` holds the training rows. `loss` scores the current line; `gradients` averages the row contributions derived above. Each learning rate gets a fresh zero start. The inner loop computes both derivatives, updates the parameters and prints selected steps. The final condition stops a run once loss exceeds a million.

Expected output:

```text
learning rate 0.05: start loss 18.6667
  step   1: m = 0.9333  c = 0.4000  loss = 3.763
  step   2: m = 1.3511  c = 0.5733  loss = 0.8055
  step   3: m = 1.5393  c = 0.6458  loss = 0.2175
  step  10: m = 1.7121  c = 0.6530  loss = 0.06121
  step  50: m = 1.8229  c = 0.4027  loss = 0.02326
  step 200: m = 1.9711  c = 0.0656  loss = 0.0006182
learning rate 0.5: start loss 18.6667
  step   1: m = 9.3333  c = 4.0000  loss = 384.3
  step   2: m = -32.8889  c = -14.6667  loss = 7942
  step   3: m = 159.2593  c = 69.7778  loss = 1.642e+05
  diverged: loss above a million at step 4
```

Try two variations separately:

- Set the learning rate to 0.005. Loss still falls, but reaches only 0.048 at step 200, compared with 0.00062 at 0.05. The smaller updates need more steps.
- Restore 0.05 and change the third point to (3, 12). No line passes through all the points. Loss flattens near 2, with m approaching 5 and c approaching −4. More training cannot remove the error left by the best-fitting line.

A flat loss curve can reflect slow progress or the limit of what the chosen model can fit. These variations let you distinguish the causes because you control the learning rate and the data.

*Sources: the Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), section 3, paraphrased as study material; Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, chapter 4, the gradient-descent section.*
