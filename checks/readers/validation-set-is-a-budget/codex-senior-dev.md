## 1. Gut reaction after first read

I recognise the failure: we searched for a good number and then treated that number as independent evidence. The opening PR scenario gives me a concrete engineering mistake to watch for. “The first number was never an estimate” makes me distrust the author slightly, though: surely the problem is that it is a biased estimate.

## 2. What landed — specific passages

“Each of those picks is a small act of fitting” is the sentence I would carry into code review. I don’t need to understand backpropagation to see that checkpoint selection is part of building the model and therefore needs its own independent evaluation.

“The fill value for a missing field” makes leakage concrete. That tells me the boundary applies to preprocessing code, where I might otherwise calculate a convenient global default.

The two-checkpoint table earns its space. I get probabilities of 1/16, 8/16 and 7/16, then an expectation of 4/16 + 7/16 = 11/16. The 18.75 percentage-point inflation follows without training anything or trusting a library.

## 3. What didn’t — where I doubted or lost the mechanism

“The winner’s score is therefore not a measurement of the winner” repeats the opening overstatement. It measures the winner on those rows. Explain why selection compromises its use as an estimate of performance on fresh rows; don’t deny what was measured.

“Inflation depends on N alone” reads as an exact law, immediately beside ratios that vary. I need “approximately, under these assumptions.” I also want the independent-item assumption stated beside the binomial formula. Backend datasets often contain repeated users or related events.

“Churn 0.02 is two neighbouring checkpoints that disagree on about one item in fifty” doesn’t follow from the code. Redrawing can produce the same answer. I get pairwise disagreement of  
(1 − 0.98²) × 2 × 0.8 × 0.2 = 0.012672, about one item in 79.

For the larger worked example, I summed the binomial counts and got 137,980; the roughly 57.1% probability checks out. But “expected best score is 12.81” arrives without a calculation I can reproduce from the explanation.

## 4. Could I do the exercise, and would I know if I got it right?

I could run the supplied script with PyTorch installed and compare the printed results. The tensor explanations give me enough orientation.

The modifications are less complete. The function returns means, so verifying the claimed spread requires changing what it calculates or returns. After changing `winner`, `reported = val.max(...)` still reports the original validation maximum, not necessarily the newly selected candidate’s validation score. I can repair that, but I would be guessing which outputs the exercise intends me to compare. It also needs to say whether to reset `n_test` after the 50-item experiment.

## 5. What changed between read one and read two

First read, I took “once” literally. Second read, the operative rule became clearer: evaluation data loses its independence when it influences a decision. I also noticed that the independent-checkpoint simulation is a deliberately simplified case, not a numerical forecast for my training pipeline.

## 6. One concrete thing I’d tell the author to change

Show the complete modified function for the final exercise, including spread calculation, selection, and the third draw. That would turn an illustrative ending into an experiment I can execute and check unambiguously.
