# Why the Model Cannot Count the Letters in “Strawberry”

You ask a language model how many times a letter appears in a word, it answers with the wrong number, and you file the result under "not as clever as advertised". The filing is aimed at the wrong component. The network that produced the answer never received the word. It received a short list of integers, and the letters you were asking about are not in that list. Whether they can be recovered from it is a separate question, and the answer is "only indirectly", for a reason that this essay derives on the page.

The component that turned your text into integers is the tokenizer, and it is the one part of the system that is not learned by gradient descent. It is a table, built once before training by a counting procedure that takes about thirty lines to write. The essay builds one.

## Text becomes integers before anything else happens

A tokenizer does two things. It cuts text into chunks, and it looks each chunk up in a fixed table that maps every chunk it holds to an integer. The chunk is the token; the integer is the token ID; in practice people say "token" for both. Only the integers go forward. The embedding vectors are produced later, inside the network, from those integers; they are not the input. The first layer of the network says the same thing in its shape: a matrix with one row per entry in the tokenizer's table, so that the tokenized text is nothing more than a list of row numbers.

The table belongs to one model. It is built on that model's training corpus before the model is trained, because its output is the model's input, and it holds a few reserved entries, for "beginning of text" and the like, whose meaning is nothing but a convention the training data followed every time. Two models can give the same sentence different integers and a different number of them, and a table built on code holds entries for punctuation runs that a table built on prose does not. None of this is a property of the network; it is a property of the counting that produced the table.

## How the table is built

The procedure is byte-pair encoding, named after a 1994 compression trick that repeatedly replaced the most frequent pair of bytes in a file with an unused byte. Applied to text for a vocabulary, it runs on characters and goes like this.

1. Split the training corpus into words and count how often each word occurs. Everything after this step works on the word list with those counts; a pair of symbols is never counted across a word boundary.
2. Write every word as a sequence of single characters. The characters are the starting vocabulary.
3. Count every adjacent pair of symbols across the whole list, weighting each word's pairs by that word's count.
4. Take the most frequent pair and merge it: everywhere the two symbols stand next to each other, replace them with one new symbol, and add that symbol to the vocabulary. Record the pair; the ordered record is the merge list.
5. Go back to step 3. Stop after a fixed number of merges.

The merge count is the main knob; the rule that splits the corpus into words in step 1 is the other, and it fixes where a merge can never cross. The final table has one entry per starting character plus one per merge, and every symbol in it has been seen in the training corpus at least once, because it was built by merging things that were there. A frequent word becomes a single symbol after enough merges; a rare word stays in pieces; a word never seen at all falls back to whatever pieces its characters happen to form.

To encode new text, the merge list is replayed in the order it was learned: for each recorded pair, scan the word and merge that pair wherever it occurs adjacent, then move to the next pair. There is no search for the shortest split. What a word becomes is fixed by the corpus counts and the merge order, and by nothing else.

## Worked example: four words, three merges

The corpus is invented and chosen to be tallied by hand: "sun" four times, "sung" three times, "gun" twice, "gong" once. Ten words, five distinct characters: g, n, o, s, u.

**Round 1.** Write each word as characters and count adjacent pairs, weighting by word count.

| Pair | From | Count |
|---|---|---|
| u+n | sun ×4, sung ×3, gun ×2 | 9 |
| s+u | sun ×4, sung ×3 | 7 |
| n+g | sung ×3, gong ×1 | 4 |
| g+u | gun ×2 | 2 |
| g+o | gong ×1 | 1 |
| o+n | gong ×1 | 1 |

The most frequent pair is u+n with 9, so it becomes one symbol, `un`. The words are now `s un`, `s un g`, `g un`, `g o n g`. Note that "gong" is untouched: its n is followed by g, not preceded by u.

**Round 2.** Count again over the new symbols.

| Pair | From | Count |
|---|---|---|
| s+un | sun ×4, sung ×3 | 7 |
| un+g | sung ×3 | 3 |
| g+un | gun ×2 | 2 |
| g+o, o+n, n+g | gong ×1 each | 1 |

Merge s+un into `sun`. The words are now `sun`, `sun g`, `g un`, `g o n g`.

**Round 3.** The pairs left are sun+g with 3, g+un with 2, and the three pairs inside "gong" with 1 each. Merge sun+g into `sung`.

Three merges, and the table has eight entries: the five characters plus `un`, `sun` and `sung`; after k merges it has 5 + k.

Now encode. Replaying the merge list on each word gives:

| Word | Replay of u+n, s+un, sun+g | Tokens |
|---|---|---|
| sun | s u n → s un → sun | 1 |
| sung | s u n g → s un g → sun g → sung | 1 |
| gun | g u n → g un; nothing else fires | 2 |
| gong | no pair in the list occurs | 4 |
| snug | u and n are present but not adjacent | 4 |

"snug" never appeared in the corpus. It has the same four letters as "sung" and costs four integers where "sung" costs one. That is the asymmetry of the scheme: the frequent word is cheap and opaque, the rare word expensive and transparent.

## What this does to a question about letters

Ask the toy model how many n's are in "sung". The network receives one integer, the ID of `sung`. The letter n is not anywhere in that input; it is in the table that produced the input, and the network has no access to the table. Every "n" that the network could ever associate with that integer had to come from training text, and specifically from text in which the token `sung` sat next to tokens that spelled it out, or counted it, or rhymed it with "hung". That is the book's reading of the failure, put forward as a reading and not tested here: the count is not looked up, because there is nothing to look up in; it is recalled, from whatever the corpus said about that token, and the corpus mostly did not say. Ask instead about "snug" and the letters arrive one integer each, and the same network that could not count in "sung" has an easier task. The word in the title differs only in which table it meets; whichever tokenizer you try it in, count the pieces that come back: the fewer there are, the less of the word the network was given.

The same mechanism covers a few things you will meet on the first day. A rule of thumb for English prose is about four characters per token, or about three quarters of a word; one ordinary sentence of 61 characters and 12 words arrives as 15 tokens. A long decimal comes back split into three-digit chunks, which on this mechanism means that three-digit strings were frequent enough in the corpus to earn entries of their own. Cost and context length are both counted in tokens because tokens are the only thing the network is fed; every budget you set is a budget of table entries, not of words.

## Limits

The toy leaves out things a production tokenizer has, and they matter for anyone reproducing a real table. The paper that adapted the procedure to text appends an end-of-word symbol to every word before merging, so that a piece at the end of a word and the same piece in the middle are different symbols; the toy omits it, which is why `un` in "gun" and `un` inside "sung" are the same entry. Real tables are also large: one open model's table has 128,256 entries, of which 256 are reserved. The toy's count is 5 + 3. Ties are also a decision: when two pairs share the top count, some rule has to pick one, and different rules give different tables from the same corpus; the script below picks the alphabetically first. Real tables also usually start from the 256 byte values rather than from characters, so that no input is ever outside the table, and they keep the space in front of a word as part of its first piece, which is why the same word can be two different tokens at the start of a line and in the middle of one.

The table is a product of a particular corpus and a particular merge count, which is why it belongs to one model and why a token count under one table is not a token count under another. The rule of thumb above is for English prose; code, numbers and rare names cost more, and a different corpus mix moves all of it.

Finally, the mechanism explains why the letters are absent from the input. It does not prove that a model cannot count them, only that it must do so from training text rather than from the word in front of it, and a model whose corpus spelled a word out often enough may count it correctly. The failure is contingent on the corpus. The absence is not.

<!--mission-->
## Exercise: build the table and read a word off it

You need any language and no library. Write a trainer of the five steps above: a dictionary of word counts, words as tuples of characters, a pair counter weighted by word count, a merge that replaces one pair everywhere, and a loop for a fixed number of merges that records each pair. Then write an encoder that replays the recorded pairs in order on a new word.

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

merges = train({"sun": 4, "sung": 3, "gun": 2, "gong": 1}, 3)
print(merges)
for w in ["sung", "gun", "gong", "snug"]:
    print(w, encode(w, merges))
```

**Expected result.** This script was run with Python 3 and nothing else (the output is in the essay's corpus). The merge list prints as u+n, s+un, sun+g, in that order, and the encodings are `sung` in one piece, `g`, `un` for "gun", four characters for "gong" and four for "snug". If your merges come out in a different order, print the pair counts at each round and compare them with the two tables above; the counts are the whole algorithm.

Then run it on a page of your own prose: lower-case it, split on anything that is not a letter, count the words, and train for 200 merges. Run on an earlier draft of this essay, about 1,800 words, the first eight merges were th, the, er, in, or, an, un and en, and "and" was the fourteenth entry; "strawberry" came back as seven pieces, st, ra, w, b, er, r, y, and "snug" as three, while "sung", which the page repeats often, was one entry. Do the same with a proper noun from your page and count its pieces. That count is how many integers the network would receive for the name, and it is the number to have in your head the next time a model gets a name's spelling wrong.

*Sources: the LLM Engineering course (Ed Donner, Udemy), lectures 1.29 to 1.32 and 3.11 to 3.14, and the Mistral course (Udemy), lecture 3.2, paraphrased as study material; Uday Kamath et al., Large Language Models: A Deep Dive, §2.3.3 and §2.4.2.5; Sennrich, Haddow and Birch, Neural Machine Translation of Rare Words with Subword Units, arXiv:1508.07909, §3.2.*
