# Did the Shop Need a Model?

Seven chapters built models for one shop, and apart from chapter 2's never-flag baseline none was measured against a rule somebody could have written instead. Put the first of them, chapter 1's search encoder, beside the rule the shop could have written in an afternoon, one that ranks the catalogue's chunks by how many words of the question they contain, and score both on chapter 6's twelve golden questions: the rule puts every answer in its top three and the encoder seven of twelve. On six paraphrases nobody has typed before, the rule puts none first and the encoder five. Priced on one ledger, with a margin of 4 per sale and invented costs, the encoder pays back its build after 3,001 queries and its upkeep with 300 a month, if 15% of the shop's queries are paraphrases the rule cannot reach. Which of the shop's models earned their cost, and how would you have known before building them?

The chapter first writes the ledger, what a rule and a model are each charged for, and solves it for the volume at which a model pays. It then puts the rule and the encoder on the same questions and finds that the answer turns on a share the shop has never counted. It then reads somebody else's ladder of models with the intervals the ladder leaves out, and closes with a table of what the shop keeps, questions and would need to see. The lab puts chapter 2's classifier on the ledger against the rule the shop never tested, and that decision is yours and the book's last. Everything here is synthetic where it is the shop's, and a single run where it is someone else's.

## What each side is charged for

Before a rule and a model can be compared, both have to be charged for the same things. Three baselines set the floor. The **zero-rule** answers with the most common class: if seven in ten app launches are the user's usual app, a recommender has to beat 0.7 to earn its keep. The **heuristic** is the rule a person would write: rank the feed by recency, guess the three most common letters, flag a listing whose seller ticked the box. The **human** baseline is what a person does in the same seat, at the person's price. Each of these is a test you can run today, and a model that cannot beat the heuristic by more than the noise has already answered the chapter's question.

The ledger has two columns and the same rows in each:

| Row | The rule | The model |
|---|---|---|
| Building | a test, a code review | labelling, training, a golden set, the build |
| Per decision | a few comparisons | a model pass, sometimes several |
| Being wrong | the rule's misses and false flags, priced | the model's, priced on the same set |
| Knowing it is still right | the same audit: a rule's inputs change too, and sellers learn rules | chapter 5's audit, every week |
| When the world changes | edit the rule, re-run its test | retrain, re-evaluate, re-gate |
| What it cannot reach | everything the rule does not name | what the training data did not show |

The break-even condition is the ledger solved for volume:

<p class="formula">V · ( g − c<sub>run</sub> ) > F + M · t</p>

V is the number of decisions over the period; g the model's gain per decision over the rule, the difference in the price of being wrong; c<sub>run</sub> the model's extra cost per decision to run; F the fixed cost of building it; M its monthly cost of staying right (audit, serving, retraining) and t the months. When g − c<sub>run</sub> is negative the inequality never holds, and no volume rescues the model. When it is positive, V is the number to forecast, and the last row of the ledger is where forecasts go wrong: a rule's gap, what it cannot reach, is usually the reason the model was proposed, and the one row nobody prices.

## The rule and the encoder on the same questions

The ledger needs g, and g is measured, so the rule and the model go on the same questions. Chapter 6's twelve golden questions over its six product sheets, scored two ways: a **keyword rule** that ranks chunks by how many words of the question they contain, and chapter 1's encoder trained as chapter 6 trained it, on the sheets' descriptive lines, plus the six click-log pairs below, so its scores differ from chapter 6's. The rule wins:

| Twelve golden questions | Top-1 | MRR | Recall@3 |
|---|---|---|---|
| Keyword rule | 6/12 | 0.750 | 1.000 ± 0.000 |
| Encoder | 6/12 | 0.615 | 0.583 ± 0.142 |

Every golden question shares a word with the chunk that answers it, because that is how golden questions get written, and there a rule that counts shared words is hard to beat. The rule's cost per query is 173 word comparisons per query word; the encoder's is a sixteen-wide pass and twelve dot products, and the assistant's adds three writer calls, about 0.0003 for the 120-token answer alone at chapter 7's report prices.

What the rule cannot reach is the row the golden set hides: queries that share no word with the product they lead to. The click log holds six, *hot drink maker*, *brighten the room*, *slice vegetables*, *pack for class*, *wrist clock*, *type while travelling*, each typed by customers who then clicked a product, and the encoder is trained on those pairs, as chapter 1's was on its clicks. The rule cannot learn from a click log, but the log can be used without a model, as a table that sends a query typed before to the product clicked before. On the six known queries that lookup scores 6 of 6 and the encoder 4 of 6, and neither is a measurement: one is the pairs read back, the other a fit on its own training pairs.

<details>
<summary>Optional: the click-log lookup, and why its 6 of 6 is not a score</summary>

The lookup is the fair comparator, because it uses everything the rule's side has: the rule, and the click log as a table with the rule behind it for anything not in the table.

| Six paraphrased queries from the click log | Top-1 | MRR | Recall@3 |
|---|---|---|---|
| Keyword rule | 0/6 | 0.000 | 0.000 |
| Click-log lookup, then the rule | 6/6 | 1.000 | 1.000 |
| Encoder | 4/6 | 0.833 | 1.000 |

The encoder's 4 of 6 is fit on its own training pairs, as chapter 1's top-1 was, and the lookup's 6 of 6 is the same pairs read back. Neither says anything about a paraphrase nobody has typed yet, which is the only kind of query the encoder is for. The lab's ledger scores both sides on the held-out set below and nothing else, so that this table never enters it.

</details>

The only measurement that counts is on paraphrases nobody has typed. The lab holds out six more, built from the click log's content words joined by ordinary connectors and never used as a training query:

| Six held-out paraphrases | Top-1 | MRR | Recall@3 |
|---|---|---|---|
| Keyword rule | 0/6 | 0.083 | 0.167 |
| Click-log lookup, then the rule | 0/6 | 0.083 | 0.167 |
| Encoder | 5/6 | 0.854 | 0.833 |

The lookup has nothing to look up, the rule's 0.083 is one lucky stopword, and the encoder places five of six. That is the measurement the ledger should rest on: six questions, a wide interval, but a rate on unseen queries, not a fit. The encoder's value is exactly the share of queries that look like this table, and that share has to be measured, not assumed.

<details>
<summary>Optional: how the six held-out paraphrases were built, and the rule's one lucky hit</summary>

The six are *maker of hot drink*, *room to brighten*, *vegetables to slice*, *pack class*, *clock for the wrist* and *travelling type*: the click-log queries' content words in a new order, joined by connectors, so that no method has seen the query and the encoder has seen only the words. The rule's 0.083 is *clock for the wrist* sharing one word with three chunks, *for* with the lamp's and the keyboard's and *the* with the watch's own, *tell the time*; the tie is broken by chunk order, which puts the watch second. The encoder's miss is *travelling type*, which it sends to the watch.

</details>

**Before reading the ledger's answer: with the held-out rates above, a margin of 4 per sale, an encoder that costs 0.0002 a query against the rule's 0.00001, a build at 1,500 all told and 150 a month to keep right, at what volume do you expect the encoder to pay for itself?**

The lab's ledger prices it as a scenario: it assumes the held-out rates, 0 in 6 for the lookup and 5 in 6 for the encoder, hold on the shop's new paraphrases, and that 15% of queries are such paraphrases. Over that mix the lookup hits 0.425 of queries first time and the encoder 0.550, a gap of 0.125 that at 4 per sale is 0.50 a query, less 0.00019 to run. The build, a golden set at 300 and the encoder at 1,200, is paid back after 3,001 queries, and the 150 a month after 300 queries a month; at a 30% share, after 1,500 and 150. The ledger counts top-1 hits, on which the two tie on the golden set, so any share above zero favours the encoder here; it does not price MRR, where the rule wins, because a second-ranked result was not given a value. Two numbers decide, and both are in the shop's logs, not in anyone's opinion: the share of queries that are new paraphrases, and the encoder's hit rate on a held-out sample of them larger than six.

## Read somebody else's table before buying from it

Most of the models a shop will consider were measured by someone else, on someone else's data, in a table, and the ledger's g then comes from that table, so the table has to be read the way the shop's own numbers were. The order is fixed: the claim, then the table, then the method, then what was held fixed between rows, and last, one number re-derived by hand. One evaluation built a price predictor for product descriptions and climbed a ladder of models on the same 200 test items; every figure below is a single run of that evaluation, mean absolute error in dollars:

| Rung | Error | What changed |
|---|---|---|
| Random price, 1–999 | 382.08 ± 37 | ignores the item |
| The training mean | 106.18 | one number for everything |
| Linear regression, three weak features | 101.56 | weight, weight-unknown, description length |
| Linear regression, bag of 2,000 words | 76.81 | the words themselves |
| Random forest | 72.28 | trained on a subset, for speed |
| Gradient-boosted trees | 68.23 | the full data |
| A human baseline, 100 items | 87.62 | a person |
| An 8-layer network, 669,000 parameters | 63.97 | 800,000 training items |
| A small frontier model, prompted | 62.51 | no training at all |
| The same small model, fine-tuned on 20,000 examples | 75.91 | worse than its own base |
| Larger frontier models, prompted | 44.74 to 58.68 | one of them on 50 items |
| A 289-million-parameter network, built from scratch | 46.49 | five epochs on 800,000 items |
| LoRA on an open 3-billion-parameter model, attention only | 65.40 | rank 32, one hour on a free GPU |
| LoRA, attention and MLP, rank 256, two epochs | 39.85 | 1.56 GB of adapters on a 4-bit base |

The claim is the last row: a small open model with adapters beat every frontier model prompted. The method says the adapters were trained on 800,000 examples of exactly this task and nothing else, and the frontier models saw a prompt. The rows are not identically built: the random forest saw a subset, the human baseline saw 100 items, one frontier model saw 50, and the fine-tune that lost had been run before with the same settings and scored 67.75 that time, so the 75.91 is one draw from a wide distribution. What was held fixed is the 200 test items, the metric, and nothing else.

The re-derived number is the interval, and only the random rung states one. A 200-item mean of errors near 60 has a standard error of a few dollars for any plausible spread of the per-item error, and the 50-item run's is twice that. So 62.51 against 63.97 is a gap of 1.46 on a standard error of a few, not a ranking; 57.62 against 58.68, two rows inside the table's last frontier range, is the same; and the fine-tune's 75.91 against its own 62.51 is a real loss only if its distribution is narrower than its earlier rerun suggests. A ladder read without intervals is a ranking of products; read with them, it is three or four groups, and the model names inside a group are as-of the recording and interchangeable.

<details>
<summary>Optional: the standard error behind "a few dollars", from the one rung that states an interval</summary>

The random pricer's ± 37 at 95% on 200 items is a standard error of 37 / 1.96 = 18.9, and a per-item spread of 18.9 · √200 = 267. That spread does not transfer to the better rungs, whose errors are smaller, but the shape of the arithmetic does: the standard error of a mean is the per-item spread over the square root of the count. If the per-item error at the 60-dollar rungs has a spread of 40, a 200-item mean has a standard error of 40 / √200 = 2.8 and a 50-item mean 5.7; at a spread of 80, 5.7 and 11.3. Any of those swallows a gap of 1.46. The same reading applies to the table behind chapter 4's method: a model tuned on human preferences was preferred to the untuned model 85 ± 3% of the time, and the ± does not say what it is; as a 95% interval it implies about 544 comparisons, as one standard error about 142. And the labellers agreed among themselves 72.6 ± 1.5% of the time, which caps how much of the 85 is the model.

</details>

<details>
<summary>Optional: the opposite failure, a table too small to carry its conclusion</summary>

A forecasting example scores three models on twelve test points of one series, 1.59, 1.99 and 1.90, and reads the first as the power of pretrained models; a second table on twelve daily points reverses it, 2.59 against 1.34, and concludes that frequency breaks them. Between the tables the frequency changed, and so did the domain, the training budget and the twelve points, with no interval on either. What changed besides frequency is the whole question.

</details>

## What the shop keeps, questions and would need to see

Each of the shop's components has now been through the three instruments. "Not established" is a finding, not a gap in the book: it names the evidence the shop has not bought yet.

| Component | What the book demonstrated | What is not established | The shop's next decision, and the evidence that would settle it |
|---|---|---|---|
| Search encoder (ch. 1, 8) | reads click-log paraphrases a keyword rule cannot; ties the rule on shared-word questions | the share of paraphrased queries in the real logs; MRR is unpriced | keep the rule as the fallback; measure the paraphrase share for a month, then read the break-even |
| Answer writer (ch. 1, 3, 4) | learns a format from four strings through an adapter; tuned against a scorer, it raises the scorer's mean from 0.34 to 6.12 while the preferences behind it fall from 0.33 to −0.20, until a reference guard holds it | that people prefer the tuned writer; the cost of the labelling that a real reward model needs | do not ship tuning on the reward model's score; run the preference comparison with people on fresh prompts |
| Photo classifier (ch. 2, 5) | 0.684 blade recall at a priced threshold; an audit that separates fewer blades from more misses | that it beats the seller-declared rule on cost at the shop's volume; the seller dodge rate | the lab's closing decision, "Your call"; the audit is the purchase either way |
| Assistant loop (ch. 6) | refuses an injected write; three failure stages separable by their evidence | answer accuracy on a golden set larger than twelve; the judge's agreement with people | grow the golden set from real questions; measure the judge against a labelled sample before trusting its scores |
| Serving (ch. 7) | four-bit weights are the first lever for latency at low load; a bigger card is capped by its bandwidth ratio | that the quantised generator's answers survive; the machine's own crossover | the golden set again, with its standard error; step time against batch size on the shop's card |

What the shop keeps without further evidence is the audit, the golden set and the ledger itself: they are the instruments, and every row's next decision is a measurement one of them makes. What it questions is every model whose advantage is a measured gap on a slice of inputs whose share nobody has counted.

## Where it stops

The prices are the business's, a missed blade, an hour of review, a lost sale's margin, and until they are named the ledger has no units. Volume is a forecast, and the ledger is a bet on it: write down the volume at which the decision flips and check it quarterly. Drift turns the ledger into a time series for both columns. A model drifts when its inputs do, which is chapter 5's whole subject; a rule drifts when the people it reads learn it, which is the lab's closing decision, "Your call". The audit that measures either is a line item forever, and a ledger that charges it to the model alone is wrong by that line. And the rule's gap is real and usually the reason the model was proposed: price it, measure its share in the logs, and put it on the ledger's last row where it can be seen instead of assumed.

## Two questions to work

**1. One hit fewer on the held-out six.** The encoder's 5 of 6 on the held-out paraphrases carries a standard error of 0.152, so the next six could easily place 4. Rework the ledger at a 15% share with 4 of 6: the two hit rates over the query mix, the net gain per query, and the break-even once and per month.

<details>
<summary>Worked answer</summary>

The lookup's rate does not move: 0.5 · 0.85 + 0 · 0.15 = 0.425. The encoder's becomes 0.5 · 0.85 + (4/6) · 0.15 = 0.425 + 0.100 = 0.525, so the gap is 0.100, worth 0.40 a query at a margin of 4, less 0.00019 to run: 0.3998. The build of 1,500 is paid back after 1,500 / 0.3998 = 3,752 queries, and the 150 a month after 375 a month. Each held-out hit lost in six costs 0.15 · 4 / 6 = 0.10 a query, so 3 of 6 gives 0.2998 and a break-even of 5,003 then 500. The break-even moves by a quarter on one question's outcome, which is what a six-question sample means, and why the ledger's own last line asks for a larger one.

</details>

**2. The vendor's table.** A vendor's table shows their model at 0.91 and the open model you run at 0.88 on the vendor's benchmark. What would you need to know before that gap means anything, and what is the wrong turn?

<details>
<summary>Worked answer</summary>

The wrong turn is reading the two numbers as a ranking. Three things come first. The interval: on a 200-item benchmark the standard error of the difference between 0.91 and 0.88 is √(0.91 · 0.09 / 200 + 0.88 · 0.12 / 200) = 0.031, so the gap of 0.03 is one standard error and says nothing; it takes 2,000 items to make it three. The test set: whose items, how many, and whether the vendor's model saw them in training, which a vendor's own benchmark cannot rule out. What was held fixed: the prompt, the settings and the scoring across the two rows, since a table that tuned one row and not the other is the fine-tune's 75.91 against its own base. Only after those three does the gap go on the ledger, as g, priced per decision on the shop's own inputs.

</details>

## The lab

The lab, [the same questions, a rule and a model, on one ledger](../labs/did-the-shop-need-a-model.md), runs on a CPU in about two seconds. It should print the two tables above and the click-log one, the rule's 173 word comparisons per query word, the ledger's 0.425 against 0.550 over the query mix, and a break-even of 3,001 queries then 300 a month at a 15% share, with 1,500 then 150 at 30%. Two variations follow: a margin of 1 moves the break-even to 12,018 then 1,202, and a share of 5% to 9,010 then 901. Then chapter 2's classifier goes on the ledger against the rule the shop never tested, the seller's own declaration, on chapter 2's 500 test listings: the classifier catches 13 of 19 blades with 69 false flags, the rule 17 of 19 with 8, both together 19 of 19 with 75, and at 20,000 listings a month each row has a bill. Which row the shop runs next month, what the rejected row would need to win, and what the ledger cannot tell you are yours to write, with hints and a discussion folded until you have. That decision is the book's last. It built a shop's models and measured them; it did not find that the shop needed all of them, and it did not need to.

*Sources: AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 6.7, 6.13–6.16, 6.18–6.21, 6.23–6.27, 7.23 and 7.24, all paraphrased as study material; every ladder figure is the course's own single run. Chip Huyen, Designing Machine Learning Systems, early release, pp. 110–111, 115, 226 and 235–236 (physical); Ouyang et al., Training language models to follow instructions with human feedback, arXiv:2203.02155, pp. 3 and 8; Time Series Forecasting Using Foundation Models, pp. 48 and 51 (physical).*
