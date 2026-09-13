## 1. Gut reaction after first read (2–4 sentences).

I finally got something more concrete than “embeddings capture meaning”: a ranking failure, an objective, and numbers I could check. The separation between encoding and serving fits how I already think about systems. But the conclusion that the remedy is fine-tuning arrived faster than I was willing to accept it.

## 2. What landed — specific passages

“An encoder runs once per item when it is stored and once per query when it arrives” gave me an immediate architectural reason for using embeddings. I can map that onto ingestion, stored derived data, and request cost.

“Each row is then treated as a classification over B titles” made the loss understandable. I could identify the candidates and the expected answer before dealing with the notation.

The matching cosine ending at “0.33” while retrieval succeeds was useful. I would otherwise be tempted to treat cosine as a confidence score and put a threshold into configuration.

## 3. What didn't

“The search itself is not the problem” makes a diagnosis the opening scenario hasn't established. In an incident review, I'd still ask about preprocessing, filters, and whether the query and catalogue vectors came from compatible model versions. The arithmetic isolates a training problem; the scenario doesn't prove one.

“At realistic size the table grows but the step does not change” glosses over the exact transition I need explained. We manually changed two independent document vectors while holding the query fixed. Then actual training changes shared encoder weights. I understand that these are connected by differentiation, but I cannot yet trace how one parameter update affects several texts, including ones outside this row.

“The loss needs large batches” also sounds too categorical. The page explains why more candidates supply more negatives, but doesn't establish a requirement or explain when those negatives are useful.

I checked the worked arithmetic. Using the supplied \(e^2 = 7.389\), I get probabilities approximately 0.119203 and 0.880797, gradients −8.80797 and +8.80797, updated documents approximately (0.881855, 0.588609) and (0.641457, −0.811391), and cosines 0.8317 and 0.6202. Those agree. Substituting the displayed rounded 0.119 literally gives −8.81; a note about retained precision would save a small double take.

## 4. Could I do the exercise with what is on the page, and would I know if I got it right?

I could run it once Python and PyTorch were installed, and the expected outputs give me enough checks. I could also make the temperature change.

I wouldn't count reproducing six correct training examples as demonstrating a usable search model. There are no held-out queries. The exercise demonstrates fitting supplied pairs and leaving unused lookup rows unchanged; I'd want that boundary stated explicitly.

## 5. What changed between read one and read two

First time, I read the Spanish failure as evidence about multilingual encoders. Second time, I noticed that the Spanish words occupy completely unused lookup rows. Their immobility follows from the construction. The transformer caveat is present, but it carries more weight than I initially gave it.

## 6. One concrete thing I'd tell the author to change

I'd add a tiny shared-parameter example immediately after the vector update: show one weight changing and affecting two different texts. That's the missing bridge between arithmetic I can reproduce and model training I can explain.
