import "dotenv/config";
import { db } from "../src/firebase.js";

const check = async () => {
  try {
    console.log("Checking cards...");
    const snapshot = await db.collection("cards").get();
    if (snapshot.empty) {
      console.log("No cards found.");
    } else {
      console.log(`Found ${snapshot.size} cards.`);
      // Check the first 5 cards
      const docs = snapshot.docs.slice(0, 5);
      docs.forEach((doc) => {
        const d = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Type: '${d.type}' (Typeof: ${typeof d.type})`);
        console.log(`Text: ${d.text?.substring(0, 50)}...`);
        console.log(`Answers (len ${d.answers?.length}):`, d.answers);
        console.log("---");
      });

      // Also check specifically for "Truth" vs "TRUTH"
      const truthMixed = snapshot.docs.filter((d) => d.data().type === "Truth");
      const truthUpper = snapshot.docs.filter((d) => d.data().type === "TRUTH");
      console.log(`Cards with type 'Truth': ${truthMixed.length}`);
      console.log(`Cards with type 'TRUTH': ${truthUpper.length}`);
    }
  } catch (error) {
    console.error("Error checking data:", error);
  }
  process.exit(0);
};

check().catch(console.error);
