const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src/constants/problems.ts");
let data = fs.readFileSync(filePath, "utf-8");

const lines = data.split("\n");

const arrayLine = lines.findIndex((l) => l.trim().startsWith("export const PROBLEMS"));

// Find the LAST line that is just "];"
let closeLine = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === "];") { closeLine = i; break; }
}

const problemLines = lines.slice(arrayLine + 1, closeLine);
const kept = problemLines.filter((line) => {
  const match = line.match(/frequency: '(\d+)%'/);
  if (!match) return true;
  return parseInt(match[1], 10) >= 30;
});

console.log(`Total: ${problemLines.length}, Removed: ${problemLines.length - kept.length}, Kept: ${kept.length}`);

const output = [
  ...lines.slice(0, arrayLine + 1),
  ...kept,
  lines[closeLine],
].join("\n");

fs.writeFileSync(filePath, output, "utf-8");
console.log("Done.");
