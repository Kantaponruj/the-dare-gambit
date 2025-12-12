import { db } from "../src/firebase.js";

async function clearDatabase() {
  console.log("Clearing cards...");
  const cards = await db.collection("cards").get();
  const cardBatch = db.batch();
  cards.docs.forEach((doc) => cardBatch.delete(doc.ref));
  await cardBatch.commit();
  console.log(`Deleted ${cards.size} cards.`);

  console.log("Clearing categories...");
  const categories = await db.collection("categories").get();
  const catBatch = db.batch();
  categories.docs.forEach((doc) => catBatch.delete(doc.ref));
  await catBatch.commit();
  console.log(`Deleted ${categories.size} categories.`);
}

clearDatabase().catch(console.error);
