# Lab: train the search, break it, then generate

The lab for chapter 1, [Search the Catalogue, Then Answer From It](../chapters/search-the-catalogue.md). It trains the one-block encoder on a toy click log, shows the pair type training never saw, then trains the generator, prompts it with what search found, and checks what the causal mask promises.

<!--mission-->
## Exercise: train the search, break it, then generate

The script trains a one-block attention encoder on a toy click log, measures top-1 accuracy, shows what happens to a pair type that never appeared, then trains a separate generator of the same block class, prompts it with the title search found, and samples from it. PyTorch on a CPU, no downloads, a few seconds.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# A toy shop. Query i was clicked through to title i; no English query shares a word with its title.
titles  = ["slim wireless keyboard", "steel kettle", "leather watch", "canvas backpack", "chef knife", "desk lamp"]
english = ["typing device for laptop", "boil water fast", "tell the time", "carry books to school", "cut bread", "light for reading"]
spanish = ["teclado para portatil", "hervir agua", "reloj de pulsera", "mochila escolar", "cuchillo de pan", "luz de lectura"]
answers = ["the slim wireless keyboard fits a laptop bag", "the steel kettle boils water fast",
           "the leather watch tells the time", "the canvas backpack carries school books"]

words = sorted({w for t in titles + english + spanish + answers for w in t.split()})
vocab = ["<pad>", "<s>", "</s>"] + words
ids = {w: i for i, w in enumerate(vocab)}
PAD = 0

def batch(texts, add_marks=False):
    rows = [(["<s>"] + t.split() + ["</s>"]) if add_marks else t.split() for t in texts]
    width = max(len(r) for r in rows)
    return torch.tensor([[ids[w] for w in r] + [PAD] * (width - len(r)) for r in rows])

class Block(nn.Module):
    """Embedding + position + one attention layer. The same class serves search and generation."""
    def __init__(self, n_vocab, dim=16, max_len=12):
        super().__init__()
        self.tok = nn.Embedding(n_vocab, dim)
        self.pos = nn.Embedding(max_len, dim)
        self.q, self.k, self.v = nn.Linear(dim, dim), nn.Linear(dim, dim), nn.Linear(dim, dim)
    def forward(self, x, causal):
        h = self.tok(x) + self.pos(torch.arange(x.shape[1]))
        if causal:
            a = F.scaled_dot_product_attention(self.q(h), self.k(h), self.v(h), is_causal=True)
        else:  # read both ways, but never attend to padding
            keep = (x != PAD)[:, None, :]
            a = F.scaled_dot_product_attention(self.q(h), self.k(h), self.v(h), attn_mask=keep)
        return h + a

def embed(block, texts):
    x = batch(texts)
    h = block(x, causal=False)
    keep = (x != PAD).unsqueeze(-1).float()
    pooled = (h * keep).sum(1) / keep.sum(1)          # mean over real tokens only
    return F.normalize(pooled, dim=1)                  # unit length: dot product = cosine

def top1(block, queries):
    with torch.no_grad():
        best = (embed(block, queries) @ embed(block, titles).T).argmax(1)
    return sum(int(b == i) for i, b in enumerate(best.tolist()))

# Part 1: search. In-batch contrastive loss, scale 20 = temperature 0.05.
torch.manual_seed(0)
enc = Block(len(vocab))
spanish_rows = torch.tensor(sorted({ids[w] for t in spanish for w in t.split()} - {ids[w] for t in english + titles for w in t.split()}))
rows_before = enc.tok.weight[spanish_rows].detach().clone()
spanish_before = embed(enc, spanish).detach()
opt = torch.optim.Adam(enc.parameters(), lr=0.01)
for step in range(301):
    sim = embed(enc, english) @ embed(enc, titles).T  # 6 x 6 cosines; the diagonal holds the clicks
    loss = F.cross_entropy(sim * 20.0, torch.arange(len(titles)))
    if step in (0, 100, 300):
        print(f"step {step:3d}  loss {loss.item():.4f}  english top-1 {top1(enc, english)}/6")
    if step < 300:
        opt.zero_grad(); loss.backward(); opt.step()
print("spanish top-1:", f"{top1(enc, spanish)}/6")
print("rows of spanish-only words changed:", not torch.equal(rows_before, enc.tok.weight[spanish_rows]))
print("spanish query vectors changed:", not torch.allclose(spanish_before, embed(enc, spanish), atol=1e-4))

# Part 2: answer from what search found. A separately trained Block of the same class, causal mask on,
# plus a layer that scores every vocabulary entry. Each training text is a title followed by its answer.
torch.manual_seed(0)
gen, head = Block(len(vocab), max_len=16), nn.Linear(16, len(vocab))
opt = torch.optim.Adam(list(gen.parameters()) + list(head.parameters()), lr=0.01)
x = batch([f"{t} {a}" for t, a in zip(titles, answers)], add_marks=True)   # the four titles that have answers
for step in range(301):
    logits = head(gen(x[:, :-1], causal=True))       # position t predicts token t + 1
    loss = F.cross_entropy(logits.reshape(-1, len(vocab)), x[:, 1:].reshape(-1), ignore_index=PAD)
    if step in (0, 300):
        print(f"generator step {step:3d}  next-token loss {loss.item():.4f}")
    if step < 300:
        opt.zero_grad(); loss.backward(); opt.step()

def generate(prompt, temperature, seed=0, max_new=10):
    g = torch.Generator().manual_seed(seed)
    out = ["<s>"] + prompt.split()
    with torch.no_grad():
        for _ in range(max_new):
            last = head(gen(torch.tensor([[ids[w] for w in out]]), causal=True))[0, -1]
            if temperature == 0:
                nxt = int(last.argmax())                                    # greedy
            else:
                probs = F.softmax(last / temperature, dim=-1)               # divide, then softmax
                nxt = int(torch.multinomial(probs, 1, generator=g))
            out.append(vocab[nxt])
            if vocab[nxt] == "</s>":
                break
    return " ".join(out[1 + len(prompt.split()):])                          # the answer only

def answer(query):
    with torch.no_grad():
        best = int((embed(enc, [query]) @ embed(enc, titles).T).argmax())   # search: the top title
    return titles[best], generate(titles[best], 0)                          # the prompt is that title

for query in english + spanish[:2]:
    title, text = answer(query)
    print(f"{query} -> {title} -> {text}")
for seed in range(4):
    print(f"T=2 seed {seed}:", generate("slim wireless keyboard", 2.0, seed))

# The mask's promise: appending a token does not change any earlier position.
with torch.no_grad():
    short = torch.tensor([[ids[w] for w in "<s> steel kettle the".split()]])
    longer = torch.tensor([[ids[w] for w in "<s> steel kettle the steel".split()]])
    for causal in (True, False):
        diff = (gen(short, causal)[0] - gen(longer, causal)[0, :4]).abs().max().item()
        print(f"causal={causal}: largest change in the first four positions after appending: {diff:.2e}")
```

What each part does in real training code:

- **`batch`** is the tokenizer's job at toy size: whole words instead of byte-pair pieces, IDs from a fixed list, and padding to the longest text in the batch. A real pipeline calls the model's own tokenizer with padding switched on and gets the same two things back, IDs and a mask of which positions are real.
- **`Block`** is the chapter's attention section. `nn.Embedding` is the embedding table, and a second table adds a learned vector per position. The three `nn.Linear` layers compute queries, keys and values, and `F.scaled_dot_product_attention` computes the score table, the softmax and the blend. `attn_mask=keep` gives the padding columns −inf; `is_causal=True` gives the future columns −inf. `h + a` adds the attention output back to its input, the residual connection every transformer layer uses. A real encoder stacks many such layers with several heads each and a small feed-forward network between them.
- **`embed`** is the one-vector-per-text section: the masked mean pool, then `F.normalize` to unit length so the matrix product in `top1` is a table of cosines.
- **Part 1** is the in-batch loss. `sim * 20.0` is the sentence-transformers default scale, τ = 0.05, and `torch.arange(6)` puts every correct answer on the diagonal. The script records the Spanish-only embedding rows and the Spanish query vectors before training, so it can compare them afterwards.
- **Part 2** trains a separate `Block` with the mask on and a `head` that turns each position's vector into logits over the vocabulary. Each training text is a title followed by its answer, for the four titles that have one. `x[:, :-1]` is the input and `x[:, 1:]` the targets, the same text shifted by one token, so every position is trained to predict its successor in one pass. `ignore_index=PAD` leaves padding out of the loss.
- **`generate`** is the loop from the generator section: run the blocks, take the last position's logits, pick greedily or divide by the temperature and sample, append, stop at `</s>`. It returns only the tokens after the prompt.
- **`answer`** is the chapter's pipeline at toy size: search picks the top title with the Part 1 encoder, and that title becomes the generator's prompt.
- **The last block** appends one token and measures the largest change in the first four positions, with the mask and without it.

**Expected result.** PyTorch 2.14 on a CPU; the output is in the chapter's corpus. English top-1 measures fit on the same six query–title pairs used for training, not accuracy on held-out queries. The Spanish queries were not training pairs.

```text
step   0  loss 7.9249  english top-1 1/6
step 100  loss 0.0008  english top-1 6/6
step 300  loss 0.0002  english top-1 6/6
spanish top-1: 1/6
rows of spanish-only words changed: False
spanish query vectors changed: True
generator step   0  next-token loss 4.3681
generator step 300  next-token loss 0.1435
typing device for laptop -> slim wireless keyboard -> the slim wireless keyboard fits a laptop bag </s>
boil water fast -> steel kettle -> the steel kettle boils water fast </s>
tell the time -> leather watch -> the leather watch tells the time </s>
carry books to school -> canvas backpack -> the canvas backpack carries school books </s>
cut bread -> chef knife -> the leather watch tells the time </s>
light for reading -> desk lamp -> the steel kettle boils water fast </s>
teclado para portatil -> leather watch -> the leather watch tells the time </s>
hervir agua -> leather watch -> the leather watch tells the time </s>
T=2 seed 0: the slim wireless keyboard fits a laptop bag </s>
T=2 seed 1: the slim wireless keyboard fits a laptop bag </s>
T=2 seed 2: the leather carries water leather keyboard fits the boils keyboard
T=2 seed 3: the slim wireless keyboard fits a laptop bag </s>
causal=True: largest change in the first four positions after appending: 0.00e+00
causal=False: largest change in the first four positions after appending: 1.35e-01
```

Read it against the chapter. All six English queries find their titles without sharing a word with them. The Spanish queries score 1 out of 6. Their own embedding rows are untouched while their vectors moved: the failure the chapter's "Where it stops" names, in both halves. The answers show the two failures from "Where it stops" separately. *cut bread* finds *chef knife*, and the generator, which never saw an answer for that title, writes the watch's answer; *teclado para portatil* finds the wrong title, and the answer faithfully describes that wrong product. At T = 2, seed 2 writes a sentence about nothing in the catalogue. With the mask, appending a token changes nothing earlier; without it, the first four positions move by up to 0.135.

Two things to try. Change `20.0` to `1.0` in Part 1. The loss stops at `0.9187`, above the 0.517 that ln(1 + 5 × e<sup>−2</sup>) allows for six titles at τ = 1, yet English top-1 still reaches `6/6`: a loss that cannot approach zero says nothing, on its own, about whether the ranking is right. Then add Spanish–title pairs as a second loss term, `F.cross_entropy(embed(enc, spanish) @ embed(enc, titles).T * 20.0, torch.arange(6))`, and rerun. Spanish top-1 reaches `6/6`, and now the Spanish-only rows do change, because the missing pair type is in the loss.
