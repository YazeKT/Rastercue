import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
const localReferences = [...html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)].map((match) => match[1]);
const fragmentReferences = [...html.matchAll(/href="#([^"\s]+)"/g)].map((match) => match[1]);
const declaredIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));

const failures = [];
for (const reference of localReferences) {
  try {
    await access(resolve(root, reference));
  } catch {
    failures.push(`Missing local reference: ${reference}`);
  }
}
for (const fragment of fragmentReferences) {
  if (!declaredIds.has(fragment)) failures.push(`Missing in-page target: #${fragment}`);
}

if (/(?:src|url\()\s*["']?https?:\/\//i.test(`${html}\n${css}`)) {
  failures.push("Remote image, script, stylesheet or font asset detected");
}
if (!css.includes("prefers-reduced-motion: reduce")) failures.push("Reduced-motion fallback missing");
if (!css.includes("object-fit: contain")) failures.push("Undistorted product-image rule missing");
if (!html.includes('class="skip-link"')) failures.push("Skip link missing");
if (!html.includes("Download Rastercue 1.0")) failures.push("Stable release download action missing");
if (!html.includes("AMD RX 580 owner-tested")) failures.push("Accepted AMD evidence boundary missing");
if (/\b(?:local candidate|owner testing required|before any public release)\b/i.test(html)) {
  failures.push("Pre-acceptance release copy detected");
}
if (/\b(?:PPI|DPI|print targets?|screen to print)\b/i.test(html)) {
  failures.push("Removed physical-size or print-target feature copy detected");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Website validation passed (${new Set(localReferences).size} local references checked).`);
