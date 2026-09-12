# The Program Is Now a Table of Numbers, and Training Is the Compile Step

You are asked to review a change that alters what the system does. The pull request touches no logic. It replaces one binary file of floating-point numbers with another, and the description says the new file "performs better on the holdout set". Your instinct is to read the code and find the branch that changed. There is no branch. The behaviour lives in the numbers, and nothing in the file tells you which number does what.

This is the first thing that changes when the program you ship is a model. The artefact is not source that a person wrote; it is the output of a loop that a person configured. To review the change you have to understand the loop, because the loop is the only place where a decision was made. This essay walks that loop once, on numbers small enough to check with a pencil, and then shows the two ways it commonly goes wrong.

## The loop that produced the numbers

Start with the simplest model there is: a straight line, y = m·x + c. It has two parameters, the slope m and the intercept c. The course this essay draws on calls m a weight and c a bias, and it is worth holding on to that: a model with seven billion parameters is seven billion of these, and the same loop fills all of them. Nothing conceptually new arrives with scale.

The loop has four steps, repeated.

**1. Predict.** For every training row, run the model with its current parameters and record what it outputs. At the start the parameters are arbitrary. Set them to zero and the model predicts zero for everything.

**2. Score.** Compare each prediction with the known answer and reduce the comparison to one number, the loss. Mean squared error is the usual choice for a regression: take each difference, square it, and average over the rows. Squaring makes every error positive and makes a large error count much more than a small one.

**3. Differentiate.** For each parameter, ask how the loss would change if that parameter moved a little. That question has an exact answer, the loss's partial derivative taken along that one parameter, and the collection of those answers over all parameters is the gradient. The gradient points in the direction that makes the loss larger.

**4. Step.** Move every parameter a small distance against its gradient:

<p class="formula">m ← m − η · ∂L/∂m,&nbsp;&nbsp;&nbsp; c ← c − η · ∂L/∂c</p>

The number η is the learning rate. It is chosen by you, and it is the only knob in the loop that is not derived from the data.

Then go back to step 1 with the new parameters. Stop when the loss stops falling, or when you run out of patience or budget. What remains is a table of numbers that was never typed by anyone.

## Worked example: three points, two parameters, one step

The numbers below are the book's own. Take three training rows, (1, 2), (2, 4) and (3, 6). They lie on the line y = 2x, so the answer the loop should find is m = 2, c = 0. Start at m = 0, c = 0.

**Predict.** Every prediction is 0.

**Score.** The differences from the answers are −2, −4 and −6. Squared: 4, 16 and 36. Their sum is 56, and the mean over three rows is 56/3 = 18.667. That is the starting loss.

**Differentiate.** For mean squared error the derivative with respect to m is the average over rows of 2 × (prediction − answer) × x, and with respect to c it is the average of 2 × (prediction − answer). Row by row, the first is 2 × (−2) × 1 = −4, 2 × (−4) × 2 = −16 and 2 × (−6) × 3 = −36, which average to −56/3 = −18.667. The second is −4, −8 and −12, averaging −8. So the gradient is (−18.667, −8). Both components are negative: the loss falls if either parameter goes up.

**Step.** Take η = 0.05. Then m becomes 0 − 0.05 × (−18.667) = 0.933 and c becomes 0 − 0.05 × (−8) = 0.4.

Score again with the new parameters. The predictions are 1.333, 2.267 and 3.2; the differences from the answers are −0.667, −1.733 and −2.8; squared and averaged, 3.763. One step took the loss from 18.667 to 3.763.

Run the same four steps 200 times and the loss reaches 0.00062, with m = 1.971 and c = 0.066. It is not exactly (2, 0). It is near it, and it gets nearer with more steps, more slowly each time. That slowing is not a defect; it is the mechanism. The gradient is proportional to the error, so as the fit improves the gradient shrinks, and a fixed η times a shrinking gradient is a shrinking step. The loss curve you will see in every training log, a steep fall and then a long flat tail, is this arithmetic drawn out.

## What the learning rate does

The learning rate is where most first training runs go wrong, and the failure has a shape you can recognise.

Start again from (0, 0) with the same three points but η = 0.5, ten times larger. The first step is ten times longer: m becomes 0 − 0.5 × (−18.667) = 9.333 and c becomes 4. The slope was meant to end up at 2 and has overshot to 9. Score it: the predictions are 13.333, 22.667 and 32.0, the loss is 384.3. It went up, from 18.667 to 384.3. The gradient at the new point is large and positive, so the next step swings the parameters far the other way, to m = −32.9, and the loss becomes 7,942. The third step lands at m = 159.3 and a loss of 164,200. By the fourth the loss is past a million and each step is worse than the one before.

That is what "training diverged" means when you meet it in a log: the step was longer than the valley was wide, the parameters landed higher on the far side, and the larger gradient there made the next step longer still. The loss for a linear model under mean squared error is a bowl with one bottom, so this cannot be a case of the loop finding a wrong valley; it is the loop being unable to stay in the only valley there is. Too small an η has the opposite symptom: the loss falls monotonically but so slowly that the run ends far from the bottom. In between is a range of η that works, and finding it is trial, not derivation.

Two things follow for the reviewer. First, a loss curve is evidence about the loop, not about the model's quality: a curve that falls and flattens says the loop converged on the training rows, and says nothing about rows it did not see. The course this essay draws on splits off a held-out set before training for exactly that reason, and a later essay in this book is about how much you can trust that number. Second, when a training run is reported as "not working", the first two questions are the ones this example answers: did the loss go up, and did it flatten far above zero? The first is the learning rate. The second is usually the learning rate too, or the model has too few parameters to fit the data, or the data does not contain the pattern.

## What the loss cannot tell you

The loss formula is a choice, and the choice is part of the program. Under mean squared error a row that is off by 10 contributes 100 to the sum while a row off by 3 contributes 9, so a single bad row can bend the fit toward itself. Mean absolute error weights every row's pull equally; the Huber loss switches from one to the other at a threshold you set. Three loops that differ only in step 2 will produce three different tables of numbers from the same data. None of that is visible in the weights file.

Nor is the preprocessing. The model the course builds puts a normalisation layer in front of the line, and that layer's mean and spread are computed once from the training data and never updated by the loop; the library reports them as non-trainable parameters. They are parameters all the same. Ship the weights without them, or recompute them on different data, and the same nine numbers give different answers. The artefact you are reviewing is the trainable numbers plus every fitted transform in front of them, and a review that looks only at the file that changed has looked at half the program.

Finally, the example is a line because a line lets you check every number by hand. A network with a non-linearity between its layers is the same loop with a longer derivative chain; the loss is no longer a single bowl, and the loop can settle in a valley that is not the lowest. The mechanism does not change. What changes is that you can no longer say in advance where it will stop.

<!--mission-->
## Exercise: run the loop and break it

You need any language with floating-point numbers. No library. The script below is plain Python and fits within twenty lines.

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

**Expected result.** At learning rate 0.05 the first line after the start reads m = 0.9333, c = 0.4000, loss 3.763, which is the worked example. By step 10 the loss is 0.061; by step 50, 0.023; by step 200, 0.00062 with m = 1.9711 and c = 0.0656. At learning rate 0.5 the first step reads m = 9.3333, c = 4.0000, loss 384.3, the second 7,942, the third 164,200, and the script reports divergence at step 4. The full output is in the essay's corpus.

Then two changes. Set the learning rate to 0.005 and watch the loss fall on every step and still sit at 0.048 at step 200, nearly eighty times what the faster run reached: the slow failure. Then put the learning rate back to 0.05 and change the third point to (3, 12), an outlier that no line passes through; the loss flattens near 2 instead of near zero, with m heading to 5 and c to −4, a line through none of the three points. Both runs end with a curve that has flattened. Only one of them is near the data, and the curve alone cannot tell you which.

*Sources: the Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), section 3, paraphrased as study material; Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, chapter 4, the gradient-descent section.*
