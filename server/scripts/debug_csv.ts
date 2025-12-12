import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvPath = path.resolve(
  process.cwd(),
  "../frontend/src/assets/DareToKnow Question.csv"
);
console.log(`Reading from ${csvPath}`);

const content = fs.readFileSync(csvPath, "utf-8");
const records = parse(content, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
}) as Record<string, string>[];

if (records.length > 0) {
  console.log("First record keys:", Object.keys(records[0]));
  console.log("First record values:", records[0]);

  const answerKey = "answers (separated by |)";
  console.log(`Checking key '${answerKey}':`, records[0][answerKey]);
} else {
  console.log("No records found");
}
