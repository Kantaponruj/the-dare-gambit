import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import fetch from "node-fetch";
import FormData from "form-data";

const CSV_PATH = path.resolve(
  process.cwd(),
  "../frontend/src/assets/DareToKnow Question.csv"
);
const API_URL = "http://localhost:3000"; // Make sure server is running

interface CsvRow {
  category: string;
  type: string;
  text: string;
  difficulty: string;
  points: string;
  "answers (separated by |)": string;
  correctAnswer: string;
}

async function importData() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV file not found at: ${CSV_PATH}`);
    process.exit(1);
  }

  console.log("Reading CSV...");
  const fileContent = fs.readFileSync(CSV_PATH, "utf-8");
  const records: CsvRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Parsed ${records.length} records.`);

  // 1. Extract Unique Categories
  const categories = new Set<string>();
  records.forEach((row) => {
    if (row.category) categories.add(row.category);
  });

  console.log(`Found ${categories.size} unique categories.`);

  // 2. Create Categories (Redundant - handled by backend now)
  /*
  for (const cat of categories) {
    try {
      console.log(`Creating category: ${cat}...`);
      const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cat }),
      });
      // ...
    } catch (e) {
      console.error(`Error creating category ${cat}:`, e);
    }
  }
  */

  // 3. Import Cards
  console.log("Importing cards...");
  const formData = new FormData();
  formData.append("file", fs.createReadStream(CSV_PATH));

  try {
    const res = await fetch(`${API_URL}/cards/import`, {
      method: "POST",
      body: formData,
    });

    const data: any = await res.json();
    if (res.ok) {
      console.log(`Successfully imported ${data.count} cards!`);
    } else {
      console.error("Import failed:", data);
    }
  } catch (error) {
    console.error("Error importing cards:", error);
  }
}

importData();
