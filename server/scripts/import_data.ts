import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import fetch from "node-fetch";
import FormData from "form-data";

const CSV_PATH = path.resolve(
  process.cwd(),
  "../frontend/src/assets/DareToKnow Question.csv"
);
const API_URL = process.env.API_URL || "http://localhost:3000"; // Make sure server is running

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

  // 1. Transform Records
  const transformedCards = records.map((row) => {
    let answers: string[] = [];
    if (row["answers (separated by |)"]) {
      answers = row["answers (separated by |)"]
        .split("|")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
    }

    return {
      category: row.category,
      type: row.type.toUpperCase(), // TRUTH, DARE
      text: row.text,
      difficulty: row.difficulty.toUpperCase(), // EASY, MEDIUM, HARD
      points: parseInt(row.points || "0"),
      answers: answers,
      correctAnswer: row.correctAnswer,
    };
  });

  console.log(`Transformed ${transformedCards.length} cards.`);

  // 2. Import Cards
  console.log("Importing cards to server...");

  try {
    console.log("Sending data to server (JSON)...");
    const res = await fetch(`${API_URL}/cards/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cards: transformedCards }),
    });
    const data: any = await res.json();
    if (res.ok) {
      console.log(`Successfully imported ${data.count} cards!`);
    } else {
      console.error("Import failed:", data);
    }
  } catch (err) {
    console.error(err);
  }
}

importData();
