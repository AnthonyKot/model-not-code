#!/usr/bin/env bash
# Flags the author's banned patterns in an essay's prose (code blocks skipped).
f="essays/$1.md"
echo "== $1: $(wc -w < "$f") words in file"
awk '/^```/{c=!c; next} !c' "$f" | grep -v '^\*Sources' | grep -n -i -E "\bthe course\b|\blectures?\b|\blecturer\b|as reported|\breported\b|\bRaschka\b|\bGéron\b|\bHuyen\b|\bLapan\b|\bBurkov\b|\bwe\b|\bour\b|\bus\b|you may have heard|understands|\bknows\b|\bwants\b|\bdecides\b|separate essay|[a-z]_[a-z]" | grep -v '`[^`]*_[^`]*`' | cut -c1-170
echo "mission: $(grep -c '<!--mission-->' "$f")  formulas: $(grep -c 'class="formula"' "$f")  figures: $(grep -c '<figure' "$f")  tables: $(grep -c '^|---' "$f")"
