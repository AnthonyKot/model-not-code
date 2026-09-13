// checks/consistency.mjs — shelf-wide consistency pass (CONTEXT.md §7 step 7).
// Advisory except two rules: a 5-gram shared by three or more essays, and a first
// paragraph's opening word either banned outright or shared with another essay.
// Run before publishing a batch, not on every check.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { essays } from "../site/catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const HEDGES = ["may", "might", "often", "usually", "perhaps", "arguably", "somewhat"];
const ANTHROPOMORPHISM = ["understands", "knows", "wants", "decides", "believes", "thinks", "hallucinates"];
const BANNED_OPENERS = new Set(["suppose", "consider", "imagine"]);

function normalizeWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function firstParagraph(raw) {
  // Body starts after the H1 heading; skip blank lines, HTML comments and headings
  // until the first line of prose.
  const lines = raw.split("\n");
  let started = false;
  const paragraph = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!started) {
      if (/^#\s/.test(trimmed)) { started = true; continue; }
      continue;
    }
    if (!trimmed) { if (paragraph.length) break; continue; }
    if (/^#{1,6}\s/.test(trimmed) || /^<!--/.test(trimmed)) continue;
    paragraph.push(trimmed);
    // A paragraph is one blank-line-delimited block; keep collecting until a blank line.
  }
  return paragraph.join(" ");
}

function wordCount(regexSource, words) {
  const re = new RegExp(`^(${regexSource})$`);
  return words.filter((w) => re.test(w)).length;
}

const essayData = [];
for (const essay of essays) {
  const file = path.join(root, "essays", `${essay.slug}.md`);
  if (!fs.existsSync(file)) continue;
  const raw = fs.readFileSync(file, "utf8");
  // Compare prose only: code blocks, figures, tables and the source credit are shared scaffolding.
  const prose = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<figure[\s\S]*?<\/figure>/g, " ")
    .replace(/^\|.*$/gm, " ")
    .replace(/^\*Sources:.*$/gm, " ")
    .replace(/^\*\*Expected result\.\*\*.*$/gm, " ");
  const words = normalizeWords(prose);
  essayData.push({ slug: essay.slug, raw, words });
}

let failures = 0;

// -- 5-grams shared by three or more essays -------------------------------------
const fiveGramOwners = new Map(); // 5-gram -> Set(slug)
for (const { slug, words } of essayData) {
  const seen = new Set();
  for (let i = 0; i + 5 <= words.length; i++) {
    const key = words.slice(i, i + 5).join(" ");
    if (seen.has(key)) continue; // count each essay once per 5-gram
    seen.add(key);
    if (!fiveGramOwners.has(key)) fiveGramOwners.set(key, new Set());
    fiveGramOwners.get(key).add(slug);
  }
}
const sharedFiveGrams = [...fiveGramOwners.entries()].filter(([, slugs]) => slugs.size >= 3);
if (sharedFiveGrams.length) {
  console.error(`FAIL: ${sharedFiveGrams.length} five-word run(s) shared by three or more essays:`);
  for (const [key, slugs] of sharedFiveGrams) console.error(`  "${key}" — ${[...slugs].join(", ")}`);
  failures += sharedFiveGrams.length;
}

// -- opening word: banned, or shared with another essay --------------------------
const openers = new Map(); // word -> [slug]
for (const { slug, raw } of essayData) {
  const paragraph = firstParagraph(raw);
  const firstWordMatch = paragraph.match(/[A-Za-z']+/);
  const firstWord = firstWordMatch ? firstWordMatch[0].toLowerCase() : "";
  if (!firstWord) continue;
  if (BANNED_OPENERS.has(firstWord)) {
    console.error(`FAIL: ${slug} opens with banned word "${firstWord}"`);
    failures++;
  }
  if (!openers.has(firstWord)) openers.set(firstWord, []);
  openers.get(firstWord).push(slug);
}
for (const [word, slugs] of openers) {
  if (slugs.length >= 2) {
    console.error(`FAIL: opening word "${word}" shared by ${slugs.join(", ")}`);
    failures++;
  }
}

// -- hedge density per 1,000 words (warn above 5) --------------------------------
for (const { slug, words } of essayData) {
  if (!words.length) continue;
  const hedgeCount = wordCount(HEDGES.join("|"), words);
  const density = (hedgeCount / words.length) * 1000;
  if (density > 5) console.warn(`WARN: ${slug} hedge density ${density.toFixed(1)} per 1,000 words (${hedgeCount} of ${words.length})`);
}

// -- anthropomorphism words: warn with counts ------------------------------------
for (const { slug, words } of essayData) {
  const counts = ANTHROPOMORPHISM.map((word) => [word, words.filter((w) => w === word).length]).filter(([, n]) => n > 0);
  if (counts.length) console.warn(`WARN: ${slug} anthropomorphism — ${counts.map(([w, n]) => `${w}:${n}`).join(", ")}`);
}

console.log(`\nConsistency check: ${essayData.length} essays scanned, ${failures} failing condition(s).`);
if (failures > 0) process.exit(1);
