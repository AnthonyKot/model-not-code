### 1. Gut reaction after first read
It is a clean, accessible mechanical breakdown of vanilla BPE that demystifies why token boundaries blind an LLM to spelling. However, it quickly reveals itself as a synthesis of introductory lecture slides rather than production reality. It describes Sennrich’s 2016 character-level heuristic while passing off Llama 3’s specific vocabulary metrics as general facts, completely glossing over byte-level tokenization and whitespace preservation.

### 2. What landed
* **The structural trade-off:** *"the frequent word is cheap and opaque, the rare word expensive and transparent."* This neatly articulates the tension between token compression and compositional visibility.
* **The hardware/tensor grounding:** *"The first layer of the network says the same thing in its shape: a matrix with one row per entry in the tokenizer's table, so that the tokenized text is nothing more than a list of row numbers."* Connecting token IDs directly to an embedding matrix lookup (`nn.Embedding`) demystifies what "input" actually means to a tensor.
* **The epistemic boundary:** *"The failure is contingent on the corpus. The absence is not."* This prevents readers from assuming letter-counting is mathematically impossible, correctly attributing it to data distribution rather than architecture.

### 3. What didn't
* **Characters vs. Bytes:** *"Applied to text for a vocabulary, it runs on characters and goes like this."* Production models (GPT-2 through Llama 3) do not run on characters; they use Byte-Level BPE (BBPE) over UTF-8 bytes. Claiming characters are the starting vocabulary skips why modern models never throw out-of-vocabulary (`<unk>`) errors.
* **Discarding whitespace:** *"Split the training corpus into words... a pair of symbols is never counted across a word boundary."* Real tokenizers preserve whitespace (e.g., GPT's `Ġ` or SentencePiece's ` `) or use regex pre-splitters. Naively splitting on words and discarding delimiters yields an irreversible tokenizer that cannot reconstruct text.
* **Uncritical citation of course metrics:** *"the course reports 128,256 entries for one open model's table, of which 256 are reserved."* Naming a Udemy lecture instead of naming Llama 3 feels amateurish. Furthermore, those 256 base entries are the raw byte values (0–255), not just arbitrary "reserved" slots.
* **The worked example arithmetic:** My manual tally matched the author's across all three rounds (Round 1: `u+n` = 9; Round 2: `s+un` = 7; Round 3: `sun+g` = 3). The math is correct.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The provided Python implementation is self-contained, correct, and matches the worked arithmetic. The output expectations are explicit, so verification is trivial. However, directing readers to *"split on anything that is not a letter"* for their own prose reinforces bad engineering habits by discarding whitespace and punctuation.

### 5. What changed between read one and read two
On the first read, the narrative felt coherent and the worked example was neat. On the second read, the title's premise fell apart: the author notes that in their 200-merge prose run, *"strawberry came back as seven pieces, st, ra, w, b, er, r, y"*. That high fragmentation actually exposes almost every individual letter, contradicting the central argument that the word is compressed into an opaque single token.

### 6. One concrete thing I'd tell the author to change
Upgrade the explanation from 2016 character-level BPE to modern Byte-Level BPE (BBPE): explain that the base vocabulary begins with 256 raw byte values and show how whitespace is preserved as an explicit symbol rather than discarded in an unspecified pre-tokenization step.
