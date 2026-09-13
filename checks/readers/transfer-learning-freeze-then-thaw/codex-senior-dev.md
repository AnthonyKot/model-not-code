## 1. Gut reaction after first read

I recognise this failure: I disabled one mutation path and assumed the object was immutable. That makes the opening useful to me immediately. I finished understanding the BatchNorm trap, but less convinced I understood when to choose each training strategy.

## 2. What landed — specific passages

“Nothing in that update reads `requires_grad`” is the sentence that makes the mechanism click. I can inspect two independent state transitions: the optimiser changes parameters, and the forward pass changes buffers. That is something I can reason about without having trained a model.

“The head learns on features computed one way and is evaluated on features computed another” explains option C better than its accuracy number does. I recognise a mismatch between production and training behaviour, and I understand why merely stopping writes is insufficient.

“Letting the buffers follow the new data gave the new head 98.5%; keeping them frozen gave 80.6%” earns my trust. The supposedly dangerous behaviour wins on the new task. That makes this an engineering decision about which behaviour must remain stable.

## 3. What didn't

“The new head starts random, so its early loss gradients are large” asks me to accept a causal jump. Why does randomness imply large gradients? I need either a qualification or a small explanation before accepting that as the reason to freeze.

“Each update moves a weight by the rate times its gradient” gives me an update rule, but the script uses Adam without explaining how it relates to that rule. As someone who checks mechanisms, I cannot connect the prose directly to the implementation.

“So the backbone computes exactly what it did after pretraining” is too broad when the next sentences mention dropout. Does setting only BatchNorm to evaluation mode preserve the whole backbone’s behaviour? For this particular backbone I can see why; for the general recipe I remain unsure.

My arithmetic worked: batch two gives variance **0.8575** and output approximately **2.2894**. At fifty batches, using \(0.9^{50}\approx0.005154\), I get mean **1.98969**, variance **0.253865**, and output approximately **1.0128**, before epsilon and the unbiased-variance correction. The reported **1.0127** looks consistent with those adjustments.

“C: buffers unchanged” also made me pause on rereading. You say BatchNorm has three buffers but explain only two. I cannot tell from the page what happens to the third.

## 4. Could I do the exercise with what is on the page, and would I know if I got it right?

I could copy and run it with PyTorch installed, and the expected output gives me useful comparisons. I could explain the mean and variance drift with a pen.

I would be executing a demonstration more than solving an exercise: there is no prediction or modification requested. I also lack a clear distinction between exact invariants and approximate accuracy results, so a slightly different run could leave me unsure whether I had broken something.

## 5. What changed between read one and read two

On read one, I took away “freeze BatchNorm properly.” On read two, I saw that adapting its statistics can be the best choice for the new task. I also noticed that `state_dict()` includes buffers: the checkpoint contains more than the weights whose equality the opening emphasises.

## 6. One concrete thing I'd tell the author to change

Add a short prediction-and-check task before the script: for A, B, and C, have me predict whether parameters, running statistics, and evaluation outputs change. Give the answer with exact invariants separated from illustrative accuracy numbers.
