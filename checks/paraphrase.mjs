// checks/paraphrase.mjs — fails the build on any 12-word run an essay shares with a
// cited course's lecture transcripts (CONTEXT.md §5b: paraphrase only, nothing
// reproduced). Warns on 8-word runs unless the phrase is deliberately quoted and
// listed in checks/paraphrase-allow.tsv. Gating on 12-word failures only.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { essays } from "../site/catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildAll = process.argv.includes("--all") || process.env.BUILD_ALL === "1";

const FILLER = new Set(["um", "uh", "uhm", "er", "ah", "like"]);

function normalizeWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !FILLER.has(word));
}

function shingleMap(words, n) {
  const map = new Map();
  for (let i = 0; i + n <= words.length; i++) {
    const key = words.slice(i, i + n).join(" ");
    if (!map.has(key)) map.set(key, true);
  }
  return map;
}

// -- allow list: slug \t phrase (<= 8 words, deliberately quoted in the essay) ------
const allowPath = path.join(root, "checks", "paraphrase-allow.tsv");
if (!fs.existsSync(allowPath)) {
  fs.writeFileSync(
    allowPath,
    "# Deliberate quotations of a phrase (<= 8 words, in quotation marks in the essay) that suppress an 8-word paraphrase warning. CONTEXT.md §5b.\nslug\tphrase\n"
  );
}
const allowRows = fs.readFileSync(allowPath, "utf8")
  .split("\n")
  .filter((line) => line.trim() && !line.startsWith("#") && !line.startsWith("slug\t"))
  .map((line) => {
    const [slug, phrase] = line.split("\t");
    return { slug, phraseWords: normalizeWords(phrase ?? "") };
  });

function allowedPhrasesFor(slug) {
  return allowRows.filter((row) => row.slug === slug).map((row) => row.phraseWords);
}

function quotedPhrases(rawText) {
  const spans = [];
  for (const match of rawText.matchAll(/"([^"]{1,400})"|“([^”]{1,400})”/g)) spans.push(match[1] ?? match[2]);
  return spans.map((s) => normalizeWords(s).join(" "));
}

// -- lecture corpus, cached per course id ---------------------------------------
const lectureCache = new Map();

function loadCourseShingles(courseId) {
  if (lectureCache.has(courseId)) return lectureCache.get(courseId);
  const dir = path.join(root, "resources", "udemy-subs", `course-${courseId}`);
  const twelve = new Map();
  const eight = new Map();
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".txt"))) {
      const words = normalizeWords(fs.readFileSync(path.join(dir, file), "utf8"));
      for (const key of shingleMap(words, 12).keys()) if (!twelve.has(key)) twelve.set(key, file);
      for (const key of shingleMap(words, 8).keys()) if (!eight.has(key)) eight.set(key, file);
    }
  }
  const result = { twelve, eight };
  lectureCache.set(courseId, result);
  return result;
}

function courseIdsFor(essay) {
  if (buildAll) {
    if (!fs.existsSync(path.join(root, "resources", "udemy-subs"))) return [];
    return fs.readdirSync(path.join(root, "resources", "udemy-subs"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("course-"))
      .map((entry) => entry.name.slice("course-".length));
  }
  return [...new Set(essay.sources.filter((s) => s.kind === "course").map((s) => s.course))];
}

let totalFailures = 0;
let totalWarnings = 0;

// Each essay plus any comparison variants in essays/variants/<slug>.<label>.md is checked.
const variantDir = path.join(root, "essays", "variants");
const targets = [];
for (const essay of essays) {
  const main = path.join(root, "essays", `${essay.slug}.md`);
  if (fs.existsSync(main)) targets.push({ essay, label: essay.slug, file: main });
  if (fs.existsSync(variantDir)) {
    for (const f of fs.readdirSync(variantDir).filter((f) => f.startsWith(`${essay.slug}.`) && f.endsWith(".md"))) {
      targets.push({ essay: { ...essay, slug: essay.slug }, label: f.replace(/\.md$/, ""), file: path.join(variantDir, f) });
    }
  }
}

for (const { essay: baseEssay, label, file: essayPath } of targets) {
  const essay = { ...baseEssay, slug: label, _allowSlug: baseEssay.slug };
  const raw = fs.readFileSync(essayPath, "utf8");
  const words = normalizeWords(raw);
  const courseIds = courseIdsFor(essay);
  if (courseIds.length === 0) {
    console.log(`${essay.slug}: no cited courses to check against — skipped`);
    continue;
  }

  const quoted = quotedPhrases(raw);
  const allowed = allowedPhrasesFor(essay._allowSlug);

  const combinedTwelve = new Map();
  const combinedEight = new Map();
  for (const courseId of courseIds) {
    const { twelve, eight } = loadCourseShingles(courseId);
    for (const [key, file] of twelve) if (!combinedTwelve.has(key)) combinedTwelve.set(key, `course-${courseId}/${file}`);
    for (const [key, file] of eight) if (!combinedEight.has(key)) combinedEight.set(key, `course-${courseId}/${file}`);
  }

  let essayFailures = 0;
  for (let i = 0; i + 12 <= words.length; i++) {
    const key = words.slice(i, i + 12).join(" ");
    if (combinedTwelve.has(key)) {
      console.error(`FAIL ${essay.slug}: 12-word run matches ${combinedTwelve.get(key)}\n  "${key}"`);
      essayFailures++;
    }
  }
  totalFailures += essayFailures;

  const warnings = [];
  for (let i = 0; i + 8 <= words.length; i++) {
    const key = words.slice(i, i + 8).join(" ");
    if (!combinedEight.has(key)) continue;
    const suppressed = allowed.some((phraseWords) => {
      if (phraseWords.length === 0 || phraseWords.length > 8) return false;
      const phrase = phraseWords.join(" ");
      return key.includes(phrase) && quoted.some((q) => q.includes(phrase));
    });
    if (!suppressed) warnings.push({ key, file: combinedEight.get(key) });
  }
  totalWarnings += warnings.length;
  if (warnings.length) {
    console.warn(`WARN ${essay.slug}: ${warnings.length} eight-word run(s) close to a lecture (showing up to 20)`);
    warnings.slice(0, 20).forEach(({ key, file }) => console.warn(`  "${key}" ~ ${file}`));
  }
  console.log(`${essay.slug}: ${essayFailures} twelve-word failures, ${warnings.length} eight-word warnings (${courseIds.length} course(s) checked)`);
}

console.log(`\nParaphrase check: ${totalFailures} twelve-word failures, ${totalWarnings} eight-word warnings.`);
if (totalFailures > 0) process.exit(1);
