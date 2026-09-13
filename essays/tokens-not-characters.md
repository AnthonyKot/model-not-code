# Why the Model Cannot Count the Letters in “Strawberry”

A **tokenizer** cuts your text into fragments and replaces each fragment with an integer from a fixed table. Each fragment is a **token**; its integer is a **token ID**. The language model receives those IDs. A question about a word's letters therefore need not arrive as a sequence of individual letters.

The model uses each ID to select an **embedding**, a row of learned numbers representing that token inside the network. The tokenizer's table maps text to IDs; the embedding table maps IDs to numbers used in computation. Only the latter is adjusted during model training.

Here is the whole path for one word, using the eight-entry table this essay builds below and a four-number embedding table initialised with a fixed random seed:

```text
Raw text:        "sung"
                   ↓  split into words (the corpus rule: letters only)
Fragments:       ["sung"]
                   ↓  replay the merge list, look the fragment up in the tokenizer's table
Token IDs:       [5]
                   ↓  row 5 of the model's embedding table
Input vector:    [0.599, -1.555, -0.341, 1.853]   ← the first thing the network computes with
```

The letters s, u, n and g exist only in the first line. From the second arrow on, the word is one integer and then four numbers. In a real model the embedding rows have hundreds or thousands of numbers and are learned during training; these four were drawn at random, which is what an untrained table holds.

## Four words, three merges

Take an invented **corpus**, the text used to build the tokenizer: “sun” four times, “sung” three times, “gun” twice, “gong” once. You have ten words and five distinct characters: g, n, o, s, u.

Start with each character as a separate **symbol**, a piece that the procedure can combine. Count adjacent symbol pairs, multiplying each word's contribution by its frequency. A **merge** replaces the most frequent pair with a single symbol everywhere it occurs within a word.

**Round 1.** The character pairs have these counts:

| Pair | From | Count |
|---|---|---|
| u+n | sun ×4, sung ×3, gun ×2 | 9 |
| s+u | sun ×4, sung ×3 | 7 |
| n+g | sung ×3, gong ×1 | 4 |
| g+u | gun ×2 | 2 |
| g+o | gong ×1 | 1 |
| o+n | gong ×1 | 1 |

The pair u+n occurs 4 + 3 + 2 = 9 times, so merge it into `un`. The words become `s un`, `s un g`, `g un`, `g o n g`. “gong” stays unchanged: its n has no u before it.

**Round 2.** Count pairs of the resulting symbols:

| Pair | From | Count |
|---|---|---|
| s+un | sun ×4, sung ×3 | 7 |
| un+g | sung ×3 | 3 |
| g+un | gun ×2 | 2 |
| g+o, o+n, n+g | gong ×1 each | 1 |

Merge s+un, with count 7, into `sun`. The words become `sun`, `sun g`, `g un`, `g o n g`.

**Round 3.** The remaining pairs are sun+g with count 3, g+un with 2, and g+o, o+n, n+g with 1 each. Merge sun+g into `sung`.

The **vocabulary**, the set of available tokens, now has 5 + 3 = 8 entries: the five starting characters plus `un`, `sun` and `sung`. After k merges, where k is the number of merges performed, this toy vocabulary has 5 + k entries.

## Applying the merge list

This procedure is **byte-pair encoding**, adapted here to characters. A byte is a unit of stored data with 256 possible values; the name comes from a compression procedure that repeatedly replaced frequent byte pairs. The character version follows these steps:

1. Split the corpus into words and count each word's occurrences.
2. Represent each word as individual characters, the starting vocabulary.
3. Count adjacent symbol pairs, weighted by word frequency.
4. Merge the most frequent pair throughout the words and record it.
5. Repeat the counting and merging until the chosen merge count is reached or no pairs remain.

The ordered record is the **merge list**. To **encode** a new word, converting it into tokens, apply each recorded merge in order. For each pair, scan the word and combine adjacent matches before proceeding to the next pair.

| Word | Replay of u+n, s+un, sun+g | Tokens |
|---|---|---|
| sun | s u n → s un → sun | 1 |
| sung | s u n g → s un g → sun g → sung | 1 |
| gun | g u n → g un; nothing else fires | 2 |
| gong | no pair in the list occurs | 4 |
| snug | n and u are adjacent but in the wrong order for u+n | 4 |

“snug” never occurred in the corpus. Its four letters are the same as those in “sung”, but their order prevents every recorded merge. It requires four IDs; “sung” requires one.

Encoding follows the recorded order without searching for the shortest split. Frequent words can become single tokens; rarer words remain in pieces. An unseen word can still be encoded if its characters are in the starting vocabulary. The corpus, the merge count and the rule for splitting words determine the available pieces. No merge crosses a word boundary.

## Why letter counting can fail

Ask how many n's occur in “sung”. Its representation is one ID for the whole word. The tokenizer retains the spelling, but the network does not receive that spelling table. To associate this ID with n, training must establish the relationship, for example through text that spells out the word or counts its letters.

A plausible explanation for letter-counting errors is that these learned associations are insufficient. This is a hypothesis, not a result established by the toy tokenizer. “snug” supplies separate character IDs and therefore a more direct representation for counting. That difference does not prove that a model must fail on “sung” or succeed on “snug”. A model can produce a correct count from learned associations; the example establishes only how the input differs.

The title's “strawberry” depends on the tokenizer used. No split for it is established here. Combining letters into fewer tokens removes separate character positions from the input, though the tokenizer can recover the spelling from its table.

## What changes in a production tokenizer

The tokenizer is built before the model is trained, and its vocabulary stays fixed during that training. Reserved entries can mark boundaries such as the beginning of text; consistent use during training gives those entries their function. Different tokenizers can assign the same text different IDs and different token counts. Text with frequent programming punctuation can produce a different vocabulary from ordinary prose.

The toy omits an end-of-word symbol, a marker appended before merging to distinguish word endings from internal pieces. Consequently, `un` in “gun” and inside “sung” is the same entry. If pairs tie for the highest count, a tie-breaking rule determines the merge; the script below chooses the alphabetically first pair.

Production tokenizers often start from all 256 byte values, allowing text to be represented without requiring every character in the training corpus. They can also include a leading space in a word's first token, so the same word can use different entries at the start of a line and after a space. The Llama 3 family's vocabulary has 128,256 entries, including 256 reserved entries, compared with the toy's eight.

For English prose, a rough conversion is four characters per token, or three quarters of a word. One sentence of 61 characters and 12 words encodes to 15 tokens with the Llama 3.1 tokenizer. Such counts depend on the text and tokenizer: code, numbers and rare names can require more pieces. Long decimals can be split into three-digit chunks; that split alone does not establish which corpus frequencies or splitting rules produced it.

The **context window**, the amount of text a model can process together, is measured in tokens, as are usage charges. Word counts are therefore only estimates of the input size.

<!--mission-->
## Exercise: build the table and read a word off it

Run this Python 3 script; it needs no external library.

```python
from collections import Counter

def train(words, n_merges):                     # words: {word: count}
    symbols = {w: tuple(w) for w in words}      # every word as its characters
    merges = []
    for _ in range(n_merges):
        pairs = Counter()
        for w, count in words.items():
            s = symbols[w]
            for i in range(len(s) - 1):
                pairs[(s[i], s[i + 1])] += count
        if not pairs:
            break
        best = min(pairs, key=lambda p: (-pairs[p], p))  # highest count; ties broken alphabetically
        merges.append(best)
        symbols = {w: apply(symbols[w], best) for w in symbols}
    return merges

def apply(s, pair):
    out, i = [], 0
    while i < len(s):
        if i < len(s) - 1 and (s[i], s[i + 1]) == pair:
            out.append(s[i] + s[i + 1]); i += 2
        else:
            out.append(s[i]); i += 1
    return tuple(out)

def encode(word, merges):
    s = tuple(word)
    for pair in merges:
        s = apply(s, pair)
    return s

words = {"sun": 4, "sung": 3, "gun": 2, "gong": 1}
merges = train(words, 3)
print("merges:", merges)

table = sorted(set("".join(words)) | {a + b for a, b in merges})   # characters + one entry per merge
ids = {piece: i for i, piece in enumerate(table)}                    # the table: fragment -> row number
print("table:", ids)
for w in ["sung", "gun", "gong", "snug"]:
    pieces = encode(w, merges)
    print(w, "->", pieces, "->", [ids[p] for p in pieces])           # what the network receives
```

`train` counts pairs and records merges. `apply` combines adjacent matches; `encode` replays the list. The final lines sort the vocabulary, assign row numbers and print both fragments and IDs. If your result differs, compare your pair counts with the tables above.

Expected output:

```text
merges: [('u', 'n'), ('s', 'un'), ('sun', 'g')]
table: {'g': 0, 'n': 1, 'o': 2, 's': 3, 'sun': 4, 'sung': 5, 'u': 6, 'un': 7}
sung -> ('sung',) -> [5]
gun -> ('g', 'un') -> [0, 7]
gong -> ('g', 'o', 'n', 'g') -> [0, 2, 1, 0]
snug -> ('s', 'n', 'u', 'g') -> [3, 1, 6, 0]
```

Then train on a page of your own prose: convert it to lower case, split on anything that is not a letter, count the words and request 200 merges. Expect frequent letter pairs such as th, er, in and an, followed by common words. Repeated words may become single entries; a name appearing once may remain in several pieces. Encode that name and count its pieces to obtain the number of IDs it would supply. The exact merges depend on your page.

*Sources: the LLM Engineering course (Ed Donner, Udemy), lectures 1.29 to 1.32 and 3.11 to 3.14, and the Mistral course (Udemy), lecture 3.2, paraphrased as study material; Uday Kamath et al., Large Language Models: A Deep Dive, §2.3.3 and §2.4.2.5; Sennrich, Haddow and Birch, Neural Machine Translation of Rare Words with Subword Units, arXiv:1508.07909, §3.2.*
