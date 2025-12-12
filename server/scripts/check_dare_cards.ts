import "dotenv/config";
import { db } from "../src/firebase.js";

const checkDareDistribution = async () => {
  try {
    console.log(
      "Checking DARE card distribution by category and difficulty...\n"
    );
    const snapshot = await db.collection("cards").get();

    const dareCards = snapshot.docs
      .map((doc) => doc.data())
      .filter((card: any) => card.type === "DARE");

    console.log(`Total DARE cards: ${dareCards.length}\n`);

    // Group by category
    const byCategory = new Map<string, any[]>();
    dareCards.forEach((card: any) => {
      if (!byCategory.has(card.category)) {
        byCategory.set(card.category, []);
      }
      byCategory.get(card.category)!.push(card);
    });

    console.log("DARE cards by category:");
    for (const [category, cards] of byCategory.entries()) {
      const byDifficulty = cards.reduce((acc: any, card: any) => {
        acc[card.difficulty] = (acc[card.difficulty] || 0) + 1;
        return acc;
      }, {});

      console.log(`  ${category}: ${cards.length} total`);
      console.log(
        `    EASY: ${byDifficulty.EASY || 0}, MEDIUM: ${
          byDifficulty.MEDIUM || 0
        }, HARD: ${byDifficulty.HARD || 0}`
      );
    }

    // Also show all categories in database
    console.log("\n\nAll categories in database:");
    const allCategories = new Set(
      snapshot.docs.map((doc) => doc.data().category)
    );
    for (const cat of allCategories) {
      const total = snapshot.docs.filter(
        (d) => d.data().category === cat
      ).length;
      const dare = dareCards.filter((c: any) => c.category === cat).length;
      const truth = total - dare;
      console.log(`  ${cat}: ${total} total (${truth} TRUTH, ${dare} DARE)`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
};

checkDareDistribution().catch(console.error);
