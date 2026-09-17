# Did the Shop Need a Model?

Seven chapters built models for one shop: a search encoder and an answer writer, a photo classifier, a tuned writer, an assistant, and the machinery to keep them right and serve them. Each one was measured. None of them was compared with the thing the shop would have done instead, which in every case was a rule somebody could have written in an afternoon.

The chapter's question: **which of the shop's models earned their cost, and how would you have known before building them?** The answer is not a side. It is a ledger with the shop's volume in it: a rule costs a test, a model costs data, evaluation, an audit, serving and drift, and the model pays when what it gains per decision, times the decisions, exceeds that. The chapter builds the ledger, puts a rule and chapter 1's encoder on it with numbers the book measured, shows how to read somebody else's ladder of models without being read by it, and closes with chapter 2's classifier on the ledger for you to decide.

Everything here is synthetic where it is the shop's, and reported where it is someone else's single run. The exercise runs on a CPU in about two seconds.

## A rule costs a test; a model costs data, evaluation and drift

Before any model, three baselines set the floor. The **zero-rule** answers with the most common class: if seven in ten app launches are the user's usual app, a recommender has to beat 0.7 to earn its keep. The **heuristic** is the rule a person would write: rank the feed by recency, guess the three most common letters, flag a listing whose seller ticked the box. The **human** baseline is what a person does in the same seat, at the person's price. Each of these is a test you can run today, and a model that cannot beat the heuristic by more than the noise has already answered the chapter's question.

The ledger has two columns and the same rows in each:

| Row | The rule | The model |
|---|---|---|
| Building | a test, a code review | labelling, training, a golden set, the build |
| Per decision | a few comparisons | a model pass, sometimes several |
| Being wrong | the rule's misses and false flags, priced | the model's, priced on the same set |
| Knowing it is still right | the test | chapter 5's audit, every week |
| When the world changes | edit the rule | retrain, re-evaluate, re-gate |
| What it cannot reach | everything the rule does not name | what the training data did not show |

The break-even condition is the ledger solved for volume:

<p class="formula">V · ( g − c<sub>run</sub> ) > F + M · t</p>

V is the number of decisions over the period; g the model's gain per decision over the rule, the difference in the price of being wrong; c<sub>run</sub> the model's extra cost per decision to run; F the fixed cost of building it; M its monthly cost of staying right (audit, serving, retraining) and t the months. When g − c<sub>run</sub> is negative the inequality never holds, and no volume rescues the model. When it is positive, V is the number to forecast, and forecasts are what the last row of the ledger is about: a rule's gap, what it cannot reach, is often the reason the model was proposed, and the one row nobody prices.

## The same catalogue, a rule and a model

Chapter 6's twelve golden questions over its six product sheets, scored two ways: a **keyword rule** that ranks chunks by how many words of the question they contain, and chapter 1's encoder trained as chapter 6 trained it, on the sheets' descriptive lines. The rule wins:

| Twelve golden questions | Top-1 | MRR | Recall@3 |
|---|---|---|---|
| Keyword rule | 6/12 | 0.750 | 1.000 ± 0.000 |
| Encoder | 6/12 | 0.615 | 0.583 ± 0.142 |

Every golden question shares a word with the chunk that answers it, because that is how golden questions get written, and on such questions a rule that counts shared words is hard to beat. The rule's cost per query is 173 word comparisons per query word; the encoder's is a sixteen-wide pass and twelve dot products, and the assistant's adds three writer calls at chapter 7's price per token.

What the rule cannot reach is the row the golden set hides. Add six queries from the click log that share no word with any chunk, *hot drink maker*, *brighten the room*, *slice vegetables*, *pack for class*, *wrist clock*, *type while travelling*, each of which customers typed and then clicked a product. The encoder is trained on those pairs, as chapter 1's was on its clicks. The rule has no way to learn from a click log at all:

| Six paraphrased queries | Top-1 | MRR | Recall@3 |
|---|---|---|---|
| Keyword rule | 0/6 | 0.000 | 0.000 |
| Encoder | 4/6 | 0.833 | 1.000 |

The encoder's score here is fit on its own training pairs, as chapter 1's top-1 was; a held-out paraphrase would need words it has seen. The point stands with that caveat: the encoder's value is exactly the share of queries that look like the second table, and that share has to be measured, not assumed. The exercise's ledger prices it. With an invented margin of 4 per sale, an encoder that costs 0.0002 a query against the rule's 0.00001, a golden set at 300, a build at 1,200 and 150 a month to keep right, and 15% of queries paraphrased, the encoder gains 0.40 per query net and pays for itself after 3,752 queries, then 375 a month; at 30% paraphrased, after 1,875. The ledger counts top-1 hits, on which the two tie for the golden set, so any paraphrased share above zero favours the encoder here; it does not price MRR, where the rule wins, because a second-ranked result was not given a value. The number that decides is the share of queries the rule cannot reach, and it is in the shop's logs, not in anyone's opinion.

## Read the table first

Most of the models a shop will consider were measured by someone else, on someone else's data, in a table. The order to read one in is fixed: the claim, then the table, then the method, then what was held fixed between rows, and last, one number re-derived by hand. The course this book studied built a price predictor for product descriptions and climbed a ladder of models on the same 200 test items; every figure below is the course's, a single run, mean absolute error in dollars:

| Rung | Error | What changed |
|---|---|---|
| Random price, 1–999 | 382.08 ± 37 | ignores the item |
| The training mean | 106.18 | one number for everything |
| Linear regression, three weak features | 101.56 | weight, weight-unknown, description length |
| Linear regression, bag of 2,000 words | 76.81 | the words themselves |
| Random forest | 72.28 | trained on a subset, for speed |
| Gradient-boosted trees | 68.23 | the full data |
| The lecturer, 100 items | 87.62 | a person |
| An 8-layer network, 669,000 parameters | 63.97 | 800,000 training items |
| A small frontier model, prompted | 62.51 | no training at all |
| The same small model, fine-tuned on 20,000 examples | 75.91 | worse than its own base |
| Larger frontier models, prompted | 44.74 to 58.68 | one of them on 50 items |
| A 289-million-parameter network, built from scratch | 46.49 | five epochs on 800,000 items |
| LoRA on an open 3-billion-parameter model, attention only | 65.40 | rank 32, one hour on a free GPU |
| LoRA, attention and MLP, rank 256, two epochs | 39.85 | 1.56 GB of adapters on a 4-bit base |

The claim is the last row: a small open model with adapters beat every frontier model prompted. The method says the adapters were trained on 800,000 examples of exactly this task and nothing else, and the frontier models saw a prompt. The rows are not identically built: the random forest saw a subset, the person saw 100 items, one frontier model saw 50, and the fine-tune that lost had been run before with the same settings and scored 67.75 that time, so the 75.91 is one draw from a wide distribution. What was held fixed is the 200 test items, the metric, and nothing else.

The re-derived number is the interval. The only rung with one is the random pricer: ± 37 at 95% on 200 items, so its standard error is about 18.9 and the spread of a single item's error about 267. That spread does not transfer to the better rungs, whose errors are smaller, but the shape of the arithmetic does: a 200-item mean of errors near 60 has a standard error of a few dollars for any plausible spread, 2.8 if the per-item spread is 40, 5.7 if it is 80, and the 50-item run's is twice that. So 62.51 against 63.97 is a gap of 1.46 on a standard error of a few, not a ranking; 57.62 against 58.68 is the same; and the fine-tune's 75.91 against its own 62.51 is a real loss only if its distribution is narrower than the course's own reruns suggest. A ladder read without intervals is a ranking of products; read with them, it is three or four groups, and the model names inside a group are as-of the recording and interchangeable.

Two more tables, from the paper that introduced the method behind chapter 4, show what "held fixed" means. The claim: a 175-billion-parameter model tuned on human preferences was preferred to the untuned model 85 ± 3% of the time, and 71 ± 4% against the same model given a few examples in its prompt. The table's baseline was fixed, a supervised model of the same size, and so was the prompt distribution, the paper's own users' prompts, on which an instruction-following model is at an advantage the paper names. The ± does not say what it is: read as a 95% interval, 85 ± 3 implies about 544 comparisons; read as one standard error, about 142. The method section gives the number to re-derive: labellers ranked K = 4 to 9 answers per prompt, giving K-choose-2 comparisons, 6 at K = 4 and 36 at K = 9, and because the 36 share an answer they are correlated, so shuffling them into one dataset made a single pass overfit; the fix was to keep one prompt's comparisons together. And the paper reports what the labellers agreed on among themselves, 72.6 ± 1.5%, which caps how much of the 85 is the model.

A smaller table shows the other failure. A forecasting book compares a pretrained model with no fine-tuning, a fine-tuned one and one trained from scratch on twelve monthly test points of one series: errors 1.59, 1.99 and 1.90, and the text reads the first as the power of pretrained models. The fine-tune ran ten steps, the from-scratch model a hundred. Three pages later the same pretrained model loses to a from-scratch model on twelve daily points, 2.59 against 1.34, called a 50% improvement (1.34 / 2.59 = 0.517), and the text concludes that data frequency breaks pretrained forecasters. Between the two tables the frequency changed, and so did the domain, the training budget (500 steps this time), and the twelve points. Neither table has an interval. What changed besides frequency is the whole question, and the table cannot answer it.

**Before reading on:** a vendor's table shows their model at 0.91 and the open model you run at 0.88 on the vendor's benchmark. Write down the three things you would need to know before that gap means anything.

## Where the book's models sit

Chapter 1's encoder beat a keyword rule only on the queries the rule cannot read, and the exercise's ledger says at what share of such queries it pays. Chapter 2's classifier is the reader case below. Chapter 4's tuning bought a measured preference from a hidden scorer on synthetic answers, at the cost of a reward model, a labelling process and the guard against reward hacking; whether people prefer the tuned writer is the release test the chapter deferred to people. Chapter 5's audit is the model's running cost that a rule never had, and the one that made the model's failure visible. Chapter 6's assistant costs three writer calls per answer and chapter 7 priced them; the same twelve questions were answered by a rule at 173 comparisons each. On every row the model's advantage is a measured gap on a specific slice of inputs, and the ledger is the slice's share times the gap, minus the cost of keeping the model right.

## What a real project adds

The prices are the business's: what a missed blade costs, what an hour of review costs, what a lost sale's margin is. Until those are named the ledger has no units.

Volume is a forecast, and the ledger is a bet on it. Write down the volume at which the decision flips and check it quarterly.

Drift turns the ledger into a time series. A rule's misses are constant until someone edits it; a model's drift is chapter 5's whole subject, and its audit is a line item forever.

The rule's gap is real and usually the reason the model was proposed. Price it, measure its share in the logs, and put it on the ledger's last row where it can be seen instead of assumed.

The book ends here. It built a shop's models and measured them; it did not find that the shop needed all of them, and it did not need to.

<!--mission-->
## Exercise: the same questions, a rule and a model, on one ledger

The script trains chapter 6's encoder on chapter 6's catalogue plus six click-log paraphrases, scores the keyword rule and the encoder on the twelve golden questions and the six paraphrases, and solves the ledger for the break-even volume at three paraphrase shares. PyTorch on a CPU, about two seconds.

```python
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

# ---------- chapter 6's catalogue and golden set, and chapter 1's encoder trained the same way ----------
SPECS = {
 "steel kettle": ["steel kettle", "boils water fast", "capacity 1.7 litre", "weight by year", "2019 : 1200 gram", "2020 : 1100 gram", "2021 : 1000 gram", "cord length 0.8 metre"],
 "desk lamp": ["desk lamp", "light for reading", "arm length 40 cm", "weight by year", "2019 : 900 gram", "2020 : 850 gram", "2021 : 800 gram", "bulb included"],
 "chef knife": ["chef knife", "cut bread and meat", "blade 20 cm", "weight by year", "2019 : 250 gram", "2020 : 240 gram", "2021 : 230 gram", "age check required"],
 "canvas backpack": ["canvas backpack", "carry books to school", "volume 25 litre", "weight by year", "2019 : 700 gram", "2020 : 650 gram", "2021 : 600 gram", "two pockets"],
 "leather watch": ["leather watch", "tell the time", "strap 20 mm", "weight by year", "2019 : 80 gram", "2020 : 75 gram", "2021 : 70 gram", "water resistant"],
 "slim wireless keyboard": ["slim wireless keyboard", "typing device for laptop", "battery 12 month", "weight by year", "2019 : 450 gram", "2020 : 420 gram", "2021 : 400 gram", "fits a laptop bag"],
}
GOLD = [("boil water fast", "steel kettle", "boils water fast"), ("kettle weight 2020", "steel kettle", "2020 : 1100 gram"),
        ("light for reading", "desk lamp", "light for reading"), ("lamp weight 2021", "desk lamp", "2021 : 800 gram"),
        ("cut bread", "chef knife", "cut bread and meat"), ("knife weight 2019", "chef knife", "2019 : 250 gram"),
        ("carry books to school", "canvas backpack", "carry books to school"), ("backpack weight 2021", "canvas backpack", "2021 : 600 gram"),
        ("tell the time", "leather watch", "tell the time"), ("watch weight 2020", "leather watch", "2020 : 75 gram"),
        ("typing device for laptop", "slim wireless keyboard", "typing device for laptop"), ("keyboard weight 2021", "slim wireless keyboard", "2021 : 400 gram")]
PARAPHRASED = [("hot drink maker", "steel kettle", "steel kettle"), ("brighten the room", "desk lamp", "desk lamp"),
               ("slice vegetables", "chef knife", "chef knife"), ("pack for class", "canvas backpack", "canvas backpack"),
               ("wrist clock", "leather watch", "leather watch"), ("type while travelling", "slim wireless keyboard", "slim wireless keyboard")]
# the click log: customers who typed each paraphrase clicked that product; the encoder trains on it, the rule cannot use it

def chunk(lines, size=4):
    return [" ".join(([lines[0]] if i else []) + lines[i:i + size]) for i in range(0, len(lines), size)]
chunks, owner = [], []
for name, lines in SPECS.items():
    for c in chunk(lines):
        chunks.append(c); owner.append(name)

words = sorted({w for ls in SPECS.values() for l in ls for w in l.split()} | {w for q, _, _ in GOLD + PARAPHRASED for w in q.split()})
vocab = ["<pad>", "<unk>"] + words
ids = {w: i for i, w in enumerate(vocab)}
PAD, UNK = 0, 1

def batch(texts):
    rows = [t.split() for t in texts]
    width = max(len(r) for r in rows)
    return torch.tensor([[ids.get(w, UNK) for w in r] + [PAD] * (width - len(r)) for r in rows])

class Block(nn.Module):
    def __init__(self, n_vocab, dim=16, max_len=40):
        super().__init__()
        self.tok, self.pos = nn.Embedding(n_vocab, dim), nn.Embedding(max_len, dim)
        self.q, self.k, self.v = nn.Linear(dim, dim), nn.Linear(dim, dim), nn.Linear(dim, dim)
    def forward(self, x):
        h = self.tok(x) + self.pos(torch.arange(x.shape[1]))
        keep = (x != PAD)[:, None, :]
        return h + F.scaled_dot_product_attention(self.q(h), self.k(h), self.v(h), attn_mask=keep)

def embed(block, texts):
    x = batch(texts)
    h = block(x)
    keep = (x != PAD).unsqueeze(-1).float()
    return F.normalize((h * keep).sum(1) / keep.sum(1), dim=1)

torch.manual_seed(0)
enc = Block(len(vocab))
opt = torch.optim.Adam(enc.parameters(), lr=0.01)
names = list(SPECS)
pairs = [(l, names.index(name)) for name, ls in SPECS.items() for l in ls[1:] if ":" not in l] + [(q, names.index(p)) for q, p, _ in PARAPHRASED]
lines, target = [p[0] for p in pairs], torch.tensor([p[1] for p in pairs])
for step in range(300):
    loss = F.cross_entropy((embed(enc, lines) @ embed(enc, names).T) * 20.0, target)
    opt.zero_grad(); loss.backward(); opt.step()

# ---------- Part 1: the same questions, a rule and a model ----------
def rule_order(q):
    """The keyword rule: rank chunks by how many query words they contain; earlier chunk wins a tie."""
    qs = q.split()
    hits = [sum(w in c.split() for w in qs) for c in chunks]
    return [j for j in sorted(range(len(chunks)), key=lambda j: (-hits[j], j)) if hits[j] > 0]   # no shared word: no result

def encoder_order(q):
    with torch.no_grad():
        return (embed(enc, [q]) @ embed(enc, chunks).T).argsort(1, descending=True)[0].tolist()

def score(name, order_fn, questions):
    rr, top1, hits = [], 0, 0
    for q, prod, line in questions:
        order = order_fn(q)
        rank = next((r + 1 for r, j in enumerate(order) if owner[j] == prod and line in chunks[j]), None)
        rr.append(1 / rank if rank else 0.0); top1 += rank == 1; hits += rank is not None and rank <= 3
    n, r = len(questions), hits / len(questions)
    print(f"  {name:12s} top-1 {top1:2d}/{n}  MRR {sum(rr) / n:.3f}  recall@3 {r:.3f} ± {math.sqrt(r * (1 - r) / n):.3f}")
    return top1

print("twelve golden questions that share words with the catalogue:")
r_gold = score("keyword rule", rule_order, GOLD); e_gold = score("encoder", encoder_order, GOLD)
print("six paraphrased queries from the click log, no word shared with any chunk (the encoder trained on these pairs; the rule cannot):")
r_para = score("keyword rule", rule_order, PARAPHRASED); e_para = score("encoder", encoder_order, PARAPHRASED)
words_in_chunks = sum(len(c.split()) for c in chunks)
print(f"cost per query: rule {words_in_chunks} word comparisons per query word; encoder one 16-wide pass over the query plus {len(chunks)} dot products; the assistant adds three writer calls")

# ---------- Part 2: the ledger and the break-even ----------
# invented prices, labelled as such: a missed search costs a lost sale's margin; a query costs compute
MARGIN, RULE_COST, ENCODER_COST, ASSISTANT_COST = 4.0, 0.00001, 0.0002, 0.006   # per lost sale; per query
GOLDEN_SET, MODEL_BUILD, RETRAIN_PER_MONTH = 300.0, 1200.0, 150.0                # fixed: the golden set; the encoder; keeping it right
share_paraphrased = 0.15                                                          # queries the rule cannot reach (invented)
rule_hit = (r_gold / 12) * (1 - share_paraphrased) + (r_para / 6) * share_paraphrased
enc_hit = (e_gold / 12) * (1 - share_paraphrased) + (e_para / 6) * share_paraphrased
print(f"top-1 hit rate over the query mix: rule {rule_hit:.3f}, encoder {enc_hit:.3f} (share of paraphrased queries {share_paraphrased})")
gain = (enc_hit - rule_hit) * MARGIN - (ENCODER_COST - RULE_COST)                # per query, may be negative
print(f"per query: the encoder gains {(enc_hit - rule_hit) * MARGIN:+.4f} in sales and costs {ENCODER_COST - RULE_COST:.5f} more to run: net {gain:+.4f}")
if gain > 0:
    print(f"break-even volume: ({GOLDEN_SET} + {MODEL_BUILD} + {RETRAIN_PER_MONTH} a month) / {gain:.4f} = {(GOLDEN_SET + MODEL_BUILD) / gain:,.0f} queries once, then {RETRAIN_PER_MONTH / gain:,.0f} a month")
else:
    print("the encoder never pays at this query mix: the rule answers the shared-word queries better, and the paraphrased share is too small")
for share in (0.3, 0.5):
    rh = (r_gold / 12) * (1 - share) + (r_para / 6) * share; eh = (e_gold / 12) * (1 - share) + (e_para / 6) * share
    g = (eh - rh) * MARGIN - (ENCODER_COST - RULE_COST)
    print(f"  paraphrased share {share}: rule {rh:.3f}, encoder {eh:.3f}, net per query {g:+.4f}" + (f", monthly break-even {RETRAIN_PER_MONTH / g:,.0f} queries after {(GOLDEN_SET + MODEL_BUILD) / g:,.0f}" if g > 0 else ", the rule still wins"))
```

What each part does:

- **`SPECS`, `GOLD` and `PARAPHRASED`** are chapter 6's catalogue and golden set plus six click-log pairs whose queries share no word with any chunk. The paraphrases join the encoder's training pairs, as chapter 1's clicks did; the rule never sees them.
- **`rule_order`** ranks chunks by the count of query words they contain and returns nothing for a query with no shared word. **`encoder_order`** is chapter 6's retrieval.
- **`score`** prints top-1, MRR and recall@3 with its standard error, and returns the top-1 count for the ledger.
- **Part 2** prices the ledger with invented numbers named in the code: margin per sale, cost per query for each method, the golden set, the build, the monthly upkeep, and the share of paraphrased queries. It solves the break-even volume, and repeats at two other shares.

**Expected result**, deterministic on a CPU:

```
twelve golden questions that share words with the catalogue:
  keyword rule top-1  6/12  MRR 0.750  recall@3 1.000 ± 0.000
  encoder      top-1  6/12  MRR 0.615  recall@3 0.583 ± 0.142
six paraphrased queries from the click log, no word shared with any chunk (the encoder trained on these pairs; the rule cannot):
  keyword rule top-1  0/6  MRR 0.000  recall@3 0.000 ± 0.000
  encoder      top-1  4/6  MRR 0.833  recall@3 1.000 ± 0.000
cost per query: rule 173 word comparisons per query word; encoder one 16-wide pass over the query plus 12 dot products; the assistant adds three writer calls
top-1 hit rate over the query mix: rule 0.425, encoder 0.525 (share of paraphrased queries 0.15)
per query: the encoder gains +0.4000 in sales and costs 0.00019 more to run: net +0.3998
break-even volume: (300.0 + 1200.0 + 150.0 a month) / 0.3998 = 3,752 queries once, then 375 a month
  paraphrased share 0.3: rule 0.350, encoder 0.550, net per query +0.7998, monthly break-even 188 queries after 1,875
  paraphrased share 0.5: rule 0.250, encoder 0.583, net per query +1.3331, monthly break-even 113 queries after 1,125
```

Read it against the chapter. The rule wins the golden set on MRR and recall; the encoder wins the paraphrases the rule cannot read at all; the ledger's answer is a volume, and the volume depends on a share the shop can measure.

Two things to try. First, set `MARGIN` to `1.0`: the encoder's net gain per query at 15% paraphrased falls to about 0.10 and the break-even volume quadruples. Second, set `share_paraphrased` to `0.05`: the net gain per query falls to 0.13 and the break-even climbs to 11,266 queries, then 1,127 a month.

### Your call: chapter 2's classifier on the ledger

Chapter 2 shipped a photo classifier that flags blades for an age check. The shop could instead have trusted a rule: flag the listing if the seller declared its category as blade. Chapter 2 never measured that rule, so this chapter did, on chapter 2's own 500 test listings, with an invented and stated seller behaviour: each blade seller declares another category with probability 25%, each other seller declares blade with probability 2%. In this draw 2 of the 19 blade sellers dodged and 8 others declared blade; the ledger uses the draw, not the rate. Everything below is on those 500 listings and chapter 2's prices, 2 per false flag and 20 per missed blade, apply.

```
500 test listings, 19 blades (chapter 2's test set)
classifier at 0.05           blades caught 13/19 recall 0.684 ± 0.107  false flags 69  missed 6  chapter-2 cost 258
rule: seller declared blade  blades caught 17/19 recall 0.895 ± 0.070  false flags 8  missed 2  chapter-2 cost 56
both: model OR rule          blades caught 19/19 recall 1.000 ± 0.000  false flags 75  missed 0  chapter-2 cost 150

LEDGER (per month; invented prices, labelled)
  classifier: review queue 2760 false flags (5520), missed blades 240 (4800)
  rule      : review queue 320 false flags (640), missed blades 80 (1600)
  both      : review queue 3000 false flags (6000), missed blades 0 (0)
  classifier fixed and running: labelling 10,000 photos once 2,500; the golden test set 300; serving 40 a month; chapter 5's audit 270 a week = 1,170 a month; a retrain every quarter 400
  rule fixed and running: one field check in the listing form; 0 a month; no audit exists for it unless the shop pays for one
  standard error on 19 blades: a recall difference under about 0.15 is inside one SE
```

The shop lists 20,000 products a month, so each of the 500 test listings stands for 40. Write down, before opening the discussion:

1. Which of the three recall figures differ by more than the noise on 19 blades, and which do not. This is the step the rest depends on.
2. Which row the shop should run next month, at the stated volume, with the monthly total for that row and for the one you rejected.
3. What the rejected row would need, in one number, to win: a seller-dodge rate, a price, or a volume.
4. What this ledger cannot tell you and what you would measure before trusting it for a year.

"The rule, and buy an audit for it" is an acceptable answer if the numbers support it. A row chosen for a reason the ledger's numbers do not support is not a pass.

<details>
<summary>Hints, if you are stuck</summary>

Nineteen blades give a standard error near 0.1 on any recall; compare the gaps to that before comparing the costs. Multiply each row's false flags and misses by 40 and by chapter 2's prices, then add the classifier's monthly upkeep where it applies. The dodge rate is invented; ask at what rate the rule's misses would cost what the classifier's review queue costs.

</details>

<details>
<summary>Discussion — open after writing your decision</summary>

**The noise.** On 19 blades the standard errors are 0.107, 0.070 and 0. Rule against classifier is a gap of 0.211, about 1.6 standard errors of the larger one: suggestive, not settled by these 19 blades alone. Both against either is settled by construction, since it cannot miss what either catches, but 19 of 19 on 19 blades is not a promise about the next 19.

**The rows.** Per month at 20,000 listings: the classifier's review queue costs 5,520 and its misses 4,800, plus 40 serving, 1,170 audit and about 133 for a quarterly retrain, about 11,660, before its 2,800 of build. The rule costs 640 in review and 1,600 in misses, about 2,240, with nothing to build. Both catches every blade and costs 6,000 in review plus the classifier's upkeep, about 7,340. The rule wins by about 9,400 a month on this ledger, and both beats the classifier alone. The reason is not accuracy; it is the classifier's 69 false flags per 500 listings, which at this volume are a queue of 2,760 a month that somebody is paid to clear. A model with recall 0.684 and precision 0.16 is expensive in reviewers, and chapter 2 knew that and priced it at 2 a flag; the ledger is where that price meets the volume.

**What flips it.** The rule's cost is its misses, 80 a month from 2 dodged sellers in 19. For the rule's total to reach the classifier's 11,660, its misses would have to cost about 11,000, which is 551 missed blades a month, 13.8 per 500 listings, a dodge rate around 72% of blade sellers. Against both, the rule's misses would have to cost about 6,700, 335 blades a month, 8.4 per 500, a dodge rate around 44%. Or the price of a miss: at 20 a miss the rule wins; at 90 a miss its 80 misses cost 7,200 and both wins. The two numbers the shop must name are how often sellers dodge and what a blade sold without an age check costs, and the ledger supplies neither.

**What the ledger cannot tell you.** The dodge rate is invented; the real one is measurable by the audit the rule does not have, so "the rule, and buy an audit for it" is the sound answer: 270 a week buys the number the decision rests on. Sellers who learn the rule may dodge more, which is chapter 5's feedback loop in a new suit; a model that reads the photo does not care what the seller ticked. And 19 blades is the whole evidence base; the audit's blades over a quarter would be the first real one.

**Not a pass:** the classifier because it is the more sophisticated system; the rule because it "scored higher" without noting the 1.6 standard errors; both because "it catches everything" without its 6,000 review bill.

</details>

*Sources: AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 6.7, 6.13–6.16, 6.18–6.21, 6.23–6.27, 7.23 and 7.24, all paraphrased as study material; every ladder figure is the course's own single run. Chip Huyen, Designing Machine Learning Systems, early release, pp. 110–111, 115, 226 and 235–236 (physical); Ouyang et al., Training language models to follow instructions with human feedback, arXiv:2203.02155, pp. 3 and 8; Time Series Forecasting Using Foundation Models, pp. 48 and 51 (physical).*
