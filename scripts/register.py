#!/usr/bin/env python3
"""Register a drafted essay in site/catalog.mjs.
usage: scripts/register.py <slug> <status> --payoff "..." [--caution "..."] [--sources 'C(...), B(...)']
Rewrites the entry's sources line and its options object; keeps `recommended` if present."""
import argparse, sys
ap = argparse.ArgumentParser()
ap.add_argument("slug"); ap.add_argument("status")
ap.add_argument("--payoff"); ap.add_argument("--caution"); ap.add_argument("--sources")
a = ap.parse_args()
p = "site/catalog.mjs"; lines = open(p).read().split("\n")
i = next(k for k, l in enumerate(lines) if l.strip().startswith(f'E("{a.slug}"'))
j = i + 2                                   # title line, mechanism line, then sources line
assert lines[j].lstrip().startswith("["), lines[j]
k = j                                       # find the end of this entry (line ending in ")," at depth)
while not (lines[k].rstrip().endswith("),") or "),  //" in lines[k] or ")), //" in lines[k] or lines[k].rstrip().endswith("}),")):
    k += 1
old = "\n".join(lines[j:k + 1])
comment = ""
if "//" in lines[k]:
    comment = "  " + lines[k][lines[k].index("//"):]
recommended = "recommended: true" in old
src = a.sources if a.sources else old[old.index("[") + 1: old.index("]", old.index("["))]
q = lambda t: '"' + t.replace("\\", "\\\\").replace('"', '\\"') + '"'
opts = []
if recommended: opts.append("recommended: true")
opts.append(f'status: "{a.status}"')
if a.payoff: opts.append("payoff: " + q(a.payoff))
elif "payoff:" in old:
    s0 = old.index("payoff:"); opts.append(old[s0:old.index('"', old.index('"', s0) + 1) + 1])
if a.caution: opts.append("caution: " + q(a.caution))
elif "caution:" in old:
    s0 = old.index("caution:"); opts.append(old[s0:old.index('"', old.index('"', s0) + 1) + 1])
new = f"    [{src}],{comment}\n    {{ " + ",\n      ".join(opts) + " }),"
lines[j:k + 1] = new.split("\n")
open(p, "w").write("\n".join(lines))
print("registered", a.slug)
