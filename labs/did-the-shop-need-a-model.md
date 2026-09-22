# Lab: the same questions, a rule and a model, on one ledger

The lab for chapter 8, [Did the Shop Need a Model?](../chapters/did-the-shop-need-a-model.md). It trains chapter 6's encoder on chapter 6's catalogue plus six click-log paraphrases, scores a keyword rule, a click-log lookup and the encoder on the golden questions, the click-log paraphrases and six held-out paraphrases, solves the ledger for the break-even volume at three paraphrase shares, and then hands you chapter 2's classifier against the seller-declared rule for the book's last decision.

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
HELD_OUT = [("maker of hot drink", "steel kettle", "steel kettle"), ("room to brighten", "desk lamp", "desk lamp"),
            ("vegetables to slice", "chef knife", "chef knife"), ("pack class", "canvas backpack", "canvas backpack"),
            ("clock for the wrist", "leather watch", "leather watch"), ("travelling type", "slim wireless keyboard", "slim wireless keyboard")]
# the click log: customers who typed each PARAPHRASED query clicked that product; the encoder trains on those pairs.
# HELD_OUT are paraphrases nobody has typed yet: click-log content words with ordinary connectors; the encoder never trains on them.

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

CLICKS = {q: p for q, p, _ in PARAPHRASED}
def lookup_order(q):
    """The rule plus the click log as a table: a query typed before goes to the product clicked before; anything else, the rule."""
    if q in CLICKS:
        return [j for j in range(len(chunks)) if owner[j] == CLICKS[q]] + [j for j in rule_order(q) if owner[j] != CLICKS[q]]
    return rule_order(q)

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
print("six paraphrased queries from the click log, no word shared with the answering product's chunks (the encoder trained on these pairs):")
r_para = score("keyword rule", rule_order, PARAPHRASED); l_para = score("lookup+rule", lookup_order, PARAPHRASED); e_para = score("encoder", encoder_order, PARAPHRASED)
print("six held-out paraphrases nobody typed before, click-log content words with connectors (no method has seen these queries):")
r_new = score("keyword rule", rule_order, HELD_OUT); l_new = score("lookup+rule", lookup_order, HELD_OUT); e_new = score("encoder", encoder_order, HELD_OUT)
words_in_chunks = sum(len(c.split()) for c in chunks)
print(f"cost per query: rule {words_in_chunks} word comparisons per query word; encoder one 16-wide pass over the query plus {len(chunks)} dot products; the assistant adds three writer calls")

# ---------- Part 2: the ledger and the break-even ----------
# invented prices, labelled as such: a missed search costs a lost sale's margin; a query costs compute
MARGIN, RULE_COST, ENCODER_COST, ASSISTANT_COST = 4.0, 0.00001, 0.0002, 0.006   # per lost sale; per query
GOLDEN_SET, MODEL_BUILD, RETRAIN_PER_MONTH = 300.0, 1200.0, 150.0                # fixed: the golden set; the encoder; keeping it right
share_paraphrased = 0.15                                                          # new paraphrases, not yet in the click log (invented)
# the comparator is the rule with the click log as a lookup; both sides are scored on the held-out paraphrases, the
# only measurement that is not fit on its own training pairs. The ledger is a scenario conditioned on that rate.
rule_hit = (r_gold / 12) * (1 - share_paraphrased) + (l_new / 6) * share_paraphrased
enc_hit = (e_gold / 12) * (1 - share_paraphrased) + (e_new / 6) * share_paraphrased
print(f"top-1 hit rate over the query mix: lookup+rule {rule_hit:.3f}, encoder {enc_hit:.3f} (share of new paraphrases {share_paraphrased}, held-out rates {l_new}/6 and {e_new}/6)")
gain = (enc_hit - rule_hit) * MARGIN - (ENCODER_COST - RULE_COST)                # per query, may be negative
print(f"per query: the encoder gains {(enc_hit - rule_hit) * MARGIN:+.4f} in sales and costs {ENCODER_COST - RULE_COST:.5f} more to run: net {gain:+.4f}")
if gain > 0:
    print(f"break-even volume: ({GOLDEN_SET} + {MODEL_BUILD} + {RETRAIN_PER_MONTH} a month) / {gain:.4f} = {(GOLDEN_SET + MODEL_BUILD) / gain:,.0f} queries once, then {RETRAIN_PER_MONTH / gain:,.0f} a month")
else:
    print("the encoder never pays at this query mix: the rule answers the shared-word queries better, and the paraphrased share is too small")
for share in (0.3, 0.5):
    rh = (r_gold / 12) * (1 - share) + (l_new / 6) * share; eh = (e_gold / 12) * (1 - share) + (e_new / 6) * share
    g = (eh - rh) * MARGIN - (ENCODER_COST - RULE_COST)
    print(f"  new-paraphrase share {share}: lookup+rule {rh:.3f}, encoder {eh:.3f}, net per query {g:+.4f}" + (f", monthly break-even {RETRAIN_PER_MONTH / g:,.0f} queries after {(GOLDEN_SET + MODEL_BUILD) / g:,.0f}" if g > 0 else ", the rule still wins"))
```

What each part does:

- **`SPECS`, `GOLD`, `PARAPHRASED` and `HELD_OUT`** are chapter 6's catalogue and golden set, six click-log pairs whose queries share no word with the answering product's chunks, and six held-out paraphrases that reuse the click log's content words with ordinary connectors and that no method trains on. The click-log paraphrases join the encoder's training pairs, as chapter 1's clicks did.
- **`rule_order`** ranks chunks by the count of query words they contain and returns nothing for a query with no shared word. **`lookup_order`** answers a query seen in the click log with the product clicked then, and otherwise falls back to the rule. **`encoder_order`** is chapter 6's retrieval.
- **`score`** prints top-1, MRR and recall@3 with its standard error, and returns the top-1 count for the ledger.
- **Part 2** prices the ledger with invented numbers named in the code: margin per sale, cost per query for each method, the golden set, the build, the monthly upkeep, and the share of queries that are new paraphrases. The comparator is the lookup with the rule behind it, and both sides are scored on the held-out paraphrases, so the ledger is a scenario conditioned on that rate. It solves the break-even volume, and repeats at two other shares.

**Expected result**, deterministic on a CPU:

```
twelve golden questions that share words with the catalogue:
  keyword rule top-1  6/12  MRR 0.750  recall@3 1.000 ± 0.000
  encoder      top-1  6/12  MRR 0.615  recall@3 0.583 ± 0.142
six paraphrased queries from the click log, no word shared with the answering product's chunks (the encoder trained on these pairs):
  keyword rule top-1  0/6  MRR 0.000  recall@3 0.000 ± 0.000
  lookup+rule  top-1  6/6  MRR 1.000  recall@3 1.000 ± 0.000
  encoder      top-1  4/6  MRR 0.833  recall@3 1.000 ± 0.000
six held-out paraphrases nobody typed before, click-log content words with connectors (no method has seen these queries):
  keyword rule top-1  0/6  MRR 0.083  recall@3 0.167 ± 0.152
  lookup+rule  top-1  0/6  MRR 0.083  recall@3 0.167 ± 0.152
  encoder      top-1  5/6  MRR 0.854  recall@3 0.833 ± 0.152
cost per query: rule 173 word comparisons per query word; encoder one 16-wide pass over the query plus 12 dot products; the assistant adds three writer calls
top-1 hit rate over the query mix: lookup+rule 0.425, encoder 0.550 (share of new paraphrases 0.15, held-out rates 0/6 and 5/6)
per query: the encoder gains +0.5000 in sales and costs 0.00019 more to run: net +0.4998
break-even volume: (300.0 + 1200.0 + 150.0 a month) / 0.4998 = 3,001 queries once, then 300 a month
  new-paraphrase share 0.3: lookup+rule 0.350, encoder 0.600, net per query +0.9998, monthly break-even 150 queries after 1,500
  new-paraphrase share 0.5: lookup+rule 0.250, encoder 0.667, net per query +1.6665, monthly break-even 90 queries after 900
```

Read it against the chapter. The rule wins the golden set on MRR and recall; the lookup wins the click-log paraphrases outright, because it is those pairs; on the held-out paraphrases neither the rule nor the lookup places anything and the encoder places five of six; the ledger's answer is a volume conditioned on that held-out rate, and the volume depends on a share the shop can measure.

Two things to try. First, set `MARGIN` to `1.0`: the encoder's net gain per query at 15% new paraphrases falls to 0.12 and the break-even volume quadruples, to 12,018 queries and then 1,202 a month. Second, set `share_paraphrased` to `0.05`: the net gain per query falls to 0.17 and the break-even climbs to 9,010 queries, then 901 a month.

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

**The noise.** On 19 blades the standard errors are 0.107, 0.070 and 0. Rule against classifier is a gap of 0.211, about 1.6 standard errors of the difference (√(0.107² + 0.070²) = 0.128): suggestive, not settled by these 19 blades alone. Both against either is settled by construction, since it cannot miss what either catches, but 19 of 19 on 19 blades is not a promise about the next 19.

**The rows.** Per month at 20,000 listings: the classifier's review queue costs 5,520 and its misses 4,800, plus 40 serving, 1,170 audit and about 133 for a quarterly retrain, about 11,660, before its 2,800 of build. The rule costs 640 in review and 1,600 in misses, about 2,240, with nothing to build. Both catches every blade and costs 6,000 in review plus the classifier's upkeep, about 7,340. The rule wins by about 9,400 a month on this ledger, and both beats the classifier alone. The reason is not accuracy; it is the classifier's 69 false flags per 500 listings, which at this volume are a queue of 2,760 a month that somebody is paid to clear. A model with recall 0.684 and precision 0.16 is expensive in reviewers, and chapter 2 knew that and priced it at 2 a flag; the ledger is where that price meets the volume.

**What flips it.** The rule's cost is its misses, 80 a month from 2 dodged sellers in 19. For the rule's total to reach the classifier's 11,660, its misses would have to cost about 11,000, which is 551 missed blades a month, 13.8 per 500 listings, a dodge rate around 72% of blade sellers. Against both, the rule's misses would have to cost about 6,700, 335 blades a month, 8.4 per 500, a dodge rate around 44%. Or the price of a miss: at 20 a miss the rule wins; at 90 a miss its 80 misses cost 7,200 and both wins. The two numbers the shop must name are how often sellers dodge and what a blade sold without an age check costs, and the ledger supplies neither.

**What the ledger cannot tell you.** The dodge rate is invented; the real one is measurable by the audit the rule does not have, so "the rule, and buy an audit for it" is the sound answer: 270 a week buys the number the decision rests on. Sellers who learn the rule may dodge more, which is chapter 5's feedback loop in a new suit; a model that reads the photo does not care what the seller ticked. And 19 blades is the whole evidence base; the audit's blades over a quarter would be the first real one.

**Not a pass:** the classifier because it is the more sophisticated system; the rule because it "scored higher" without noting the 1.6 standard errors; both because "it catches everything" without its 6,000 review bill.

</details>

*Sources: AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 6.7, 6.13–6.16, 6.18–6.21, 6.23–6.27, 7.23 and 7.24, all paraphrased as study material; every ladder figure is the course's own single run. Chip Huyen, Designing Machine Learning Systems, early release, pp. 110–111, 115, 226 and 235–236 (physical); Ouyang et al., Training language models to follow instructions with human feedback, arXiv:2203.02155, pp. 3 and 8; Time Series Forecasting Using Foundation Models, pp. 48 and 51 (physical).*
