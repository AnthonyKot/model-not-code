// checks/receipts.mjs — resolves every course/book/paper receipt cited by a drafted
// essay against resources/udemy-subs/ and resources/MANIFEST.tsv. Gating: exits 1 on
// any failure. It cannot confirm a page says what its paraphrase claims — see
// corpus/SCHEMA.md and CONTEXT.md §5.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { essays, courses } from "../site/catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SCHEMA_COLUMNS = ["claim_id", "paraphrase", "label", "source", "locator", "note"];
const ALLOWED_LABELS = new Set(["observed", "reported", "inferred", "hypothesis", "disputed"]);

function loadManifest() {
  const file = path.join(root, "resources", "MANIFEST.tsv");
  if (!fs.existsSync(file)) return {};
  const lines = fs.readFileSync(file, "utf8").split("\n").filter((line) => line.trim());
  const [header, ...rows] = lines;
  const columns = header.split("\t");
  const byKey = {};
  for (const row of rows) {
    const cells = row.split("\t");
    byKey[cells[columns.indexOf("key")]] = Object.fromEntries(columns.map((c, i) => [c, cells[i] ?? ""]));
  }
  return byKey;
}
const manifest = loadManifest();

function resolveCourseReceipt(courseId, locator) {
  if (!/^\d{2}-\d{2}$/.test(locator)) return { status: "failed", note: `bad locator "${locator}" (expected NN-NN)` };
  const dir = path.join(root, "resources", "udemy-subs", `course-${courseId}`);
  if (!fs.existsSync(dir)) return { status: "failed", note: `no such course directory course-${courseId}` };
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(`${locator}-`) && f.endsWith(".txt"));
  const course = courses[courseId];
  const wantTranslated = Boolean(course && course.lang && course.lang !== "en");
  const candidates = wantTranslated
    ? files.filter((f) => f.endsWith(".en.txt"))
    : files.filter((f) => !f.endsWith(".en.txt"));
  if (candidates.length === 1) return { status: "passed", note: `resources/udemy-subs/course-${courseId}/${candidates[0]}` };
  if (candidates.length === 0) return { status: "failed", note: `no ${wantTranslated ? ".en.txt " : ""}file for ${locator} under course-${courseId}` };
  return { status: "failed", note: `${candidates.length} files match ${locator} under course-${courseId}: ${candidates.join(", ")}` };
}

function parseHighestPage(locator) {
  // "p. 12" or "pp. 12-18" / "pp. 12–18"; returns the highest page number cited, or null.
  const numbers = [...locator.matchAll(/\d+/g)].map((m) => parseInt(m[0], 10));
  return numbers.length ? Math.max(...numbers) : null;
}

function resolveBookReceipt(key, locator) {
  const record = manifest[key];
  if (!record) return { status: "failed", note: `no such key "${key}" in resources/MANIFEST.tsv` };
  if (record.path && record.path.startsWith("MISSING:")) return { status: "failed", note: `manifest row for "${key}" is ${record.path}` };
  if (!locator || locator === "unknown") return { status: "passed", note: `key "${key}" found, no page cited` };
  if (record.pages === "unknown" || !/^\d+$/.test(record.pages || "")) {
    return { status: "skipped", note: `manifest pages for "${key}" is unknown; cannot verify "${locator}"` };
  }
  const cited = parseHighestPage(locator);
  const total = parseInt(record.pages, 10);
  if (cited === null) return { status: "failed", note: `locator "${locator}" has no page number` };
  if (cited > total) return { status: "failed", note: `page ${cited} exceeds "${key}"'s ${total} pages` };
  return { status: "passed", note: `p. ${cited} of ${total}` };
}

function resolvePaperReceipt(source) {
  if (!source || !source.trim()) return { status: "failed", note: "empty paper id" };
  return { status: "unchecked", note: `paper id "${source}" not machine-verified` };
}

function classifySource(source) {
  if (source.startsWith("course-")) return { kind: "course", value: source.slice("course-".length) };
  if (/^arxiv:/i.test(source) || /^https?:\/\//.test(source)) return { kind: "paper", value: source };
  return { kind: "book", value: source };
}

// Returns { rows, structuralFailures } — rows are one per receipt (status: passed /
// failed / skipped / unchecked); structuralFailures are file-level problems (missing
// file, bad header, wrong column count) that are not tied to one row.
function checkReceiptsFile(slug) {
  const file = path.join(root, "corpus", slug, "receipts.tsv");
  if (!fs.existsSync(file)) return { rows: [], structuralFailures: [`corpus/${slug}/receipts.tsv is missing for a drafted essay`] };
  const lines = fs.readFileSync(file, "utf8").split("\n").filter((line) => line.trim());
  if (lines.length === 0) return { rows: [], structuralFailures: [`corpus/${slug}/receipts.tsv is empty`] };
  const header = lines[0].split("\t").map((c) => c.trim());
  const structuralFailures = [];
  if (header.length !== SCHEMA_COLUMNS.length || header.some((c, i) => c !== SCHEMA_COLUMNS[i])) {
    structuralFailures.push(`corpus/${slug}/receipts.tsv header is ${JSON.stringify(header)}, expected ${JSON.stringify(SCHEMA_COLUMNS)}`);
  }
  const rows = [];
  for (const line of lines.slice(1)) {
    const cells = line.split("\t");
    if (cells.length !== SCHEMA_COLUMNS.length) {
      structuralFailures.push(`corpus/${slug}/receipts.tsv row has ${cells.length} columns, expected ${SCHEMA_COLUMNS.length}: "${line}"`);
      continue;
    }
    const [claim_id, , label, source, locator] = cells;
    if (!ALLOWED_LABELS.has(label)) {
      structuralFailures.push(`${claim_id || "(no id)"}: label "${label}" is not one of ${[...ALLOWED_LABELS].join(", ")}`);
    }
    const { kind, value } = classifySource(source);
    const result = kind === "course" ? resolveCourseReceipt(value, locator)
      : kind === "paper" ? resolvePaperReceipt(value)
      : resolveBookReceipt(value, locator);
    rows.push({ claim_id: claim_id || "(no id)", source, locator, ...result });
  }
  return { rows, structuralFailures };
}

let totalRows = 0;
let totalFailingConditions = 0;
const summaryLines = [];

for (const essay of essays) {
  if (!fs.existsSync(path.join(root, "essays", `${essay.slug}.md`))) continue;
  const { rows, structuralFailures } = checkReceiptsFile(essay.slug);
  totalRows += rows.length;
  for (const row of rows) console.log(`  ${essay.slug} ${row.claim_id}: ${row.status} — ${row.note}`);
  structuralFailures.forEach((message) => console.log(`  ${essay.slug}: FAIL — ${message}`));

  const passed = rows.filter((r) => r.status === "passed").length;
  const failed = rows.filter((r) => r.status === "failed").length;
  const skipped = rows.filter((r) => r.status === "skipped").length;
  const unchecked = rows.filter((r) => r.status === "unchecked").length;
  const failingConditions = failed + structuralFailures.length;
  totalFailingConditions += failingConditions;
  summaryLines.push(`${essay.slug}: ${passed} passed, ${failed} failed, ${skipped} skipped, ${unchecked} unchecked` + (structuralFailures.length ? `, ${structuralFailures.length} structural problem(s)` : ""));
}

console.log("");
summaryLines.forEach((line) => console.log(line));
console.log(`\nTotal: ${totalRows} receipts checked across drafted essays, ${totalFailingConditions} failing conditions.`);

if (totalFailingConditions > 0) process.exit(1);
