#!/usr/bin/env python3
"""Verify a comparison variant against its published essay: same title, same code blocks, same
credit line, every number in the variant present in the essay or its run.log/receipts, prose length."""
import re, sys
slug, label = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "tight")
main = open(f"essays/{slug}.md").read()
var = open(f"essays/variants/{slug}.{label}.md").read()
ok = True
def say(k, v): print(f"  {k}: {v}")
t1, t2 = main.split("\n", 1)[0], var.split("\n", 1)[0]
say("title identical", t1 == t2); ok &= t1 == t2
code = lambda s: [c for c in re.findall(r"```(?:python|py)\n(.*?)```", s, re.S)]
same_code = code(main) == code(var)
say("python blocks identical", same_code); ok &= same_code
credit = lambda s: [l for l in s.splitlines() if l.startswith("*Sources")]
say("credit line identical", credit(main) == credit(var)); ok &= credit(main) == credit(var)
say("mission markers", var.count("<!--mission-->")); ok &= var.count("<!--mission-->") == 1
say("figures main/variant", f"{main.count('<figure')}/{var.count('<figure')}")
say("formulas main/variant", f"{main.count('class=\"formula\"')}/{var.count('class=\"formula\"')}")
prose = lambda s: len(re.sub(r"<figure.*?</figure>", "", re.sub(r"```.*?```", "", s, flags=re.S), flags=re.S).split())
say("words main -> variant", f"{prose(main)} -> {prose(var)}")
evidence = main
for extra in (f"corpus/{slug}/run.log", f"corpus/{slug}/receipts.tsv"):
    try: evidence += open(extra).read()
    except FileNotFoundError: pass
norm = lambda x: x.replace(",", "").replace("−", "-")
ev = norm(evidence)
nums = set(re.findall(r"(?<![\w.])-?\d[\d,]*\.?\d*", norm(re.sub(r"```.*?```", "", var, flags=re.S))))
new = sorted(n for n in nums if n.strip(".") not in ev and len(n.strip(".-")) > 1)
say("numbers not found in essay/run.log/receipts", new if new else "none"); ok &= not new
body = "\n".join(l for l in var.splitlines() if not l.startswith("*Sources"))
bad = re.findall(r"\b(the course|lecturer|lecture \d|as reported|we |our )", body, re.I)
say("banned phrases", bad if bad else "none"); ok &= not bad
print("RESULT:", "PASS" if ok else "CHECK BY HAND")
