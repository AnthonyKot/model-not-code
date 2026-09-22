#!/usr/bin/env python3
"""Word counts for a reworked chapter (STORY-MAP §2 and §6).

    python3 scripts/reading-path.py chapters/<slug>.md

Counts words in prose and table cells. Code blocks, <figure> SVGs, HTML tags and the
italic *Sources:* line are excluded; tokens with no letter or digit (table pipes,
dashes) are not words. "Reading path" is everything outside <details>; "folds" is
everything inside. Targets: reading path 2,000–2,700 (2,900 for chapter 2), folds
18–25% of the page, page 2,400–3,400 (3,800 for chapter 2).
"""
import re
import sys

if len(sys.argv) != 2:
    sys.exit(__doc__)
text = open(sys.argv[1], encoding="utf8").read()
text = re.sub(r"^\*Sources:.*$", "", text, flags=re.M)
text = re.sub(r"<figure[\s\S]*?</figure>", " ", text)
text = re.sub(r"```[\s\S]*?```", " ", text)


def words(chunk):
    chunk = re.sub(r"<[^>]+>", " ", chunk)
    return [w for w in chunk.split() if re.search(r"[A-Za-z0-9Ͱ-Ͽ]", w)]


folds = re.findall(r"<details>[\s\S]*?</details>", text)
fold_words = sum(len(words(f)) for f in folds)
path = re.sub(r"<details>[\s\S]*?</details>", " ", text)
path_words = len(words(path))
total = path_words + fold_words
share = 100 * fold_words / total if total else 0
print(f"reading path {path_words}  folds {fold_words} ({share:.1f}%)  page {total}  details {len(folds)}")
for f in folds:
    m = re.search(r"<summary>(.*?)</summary>", f)
    print(f"  {len(words(f)):4d}  {m.group(1) if m else '?'}")
parts = re.split(r"^(## .*)$", path, flags=re.M)
print(f"  intro {len(words(parts[0]))}")
for i in range(1, len(parts), 2):
    print(f"  {len(words(parts[i + 1])):4d}  {parts[i]}")
