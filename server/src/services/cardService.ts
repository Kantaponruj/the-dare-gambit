import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase.js";

export interface GameCard {
  id: string;
  category: string; // Denormalized name
  categoryId?: string; // Link to Category ID
  text: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  type: "TRUTH" | "DARE";
  answers?: string[];
  correctAnswer?: string;
}

export interface Category {
  id: string;
  name: string;
}

class CardService {
  private cards: GameCard[] = [];
  private categories: Category[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    console.log("Loading categories from Firestore...");
    const catSnapshot = await db.collection("categories").get();
    if (catSnapshot.empty) {
      console.log("No categories found. Seeding defaults...");
      await this.seedDefaults();
    } else {
      this.categories = catSnapshot.docs.map((doc) => doc.data() as Category);
    }

    console.log("Loading cards from Firestore...");
    const cardSnapshot = await db.collection("cards").get();
    this.cards = cardSnapshot.docs.map((doc) => doc.data() as GameCard);
    console.log(
      `Loaded ${this.cards.length} cards and ${this.categories.length} categories.`
    );

    this.initialized = true;
  }

  private async seedDefaults() {
    const defaults = [
      "😂 สังคม & มีมดัง",
      "📺 วัยรุ่น Y2K & ซีรีส์",
      "🎤 T-Pop & เพลงฮิต",
      "💸 ชีวิตติดโปร & ไฟแนนซ์",
      "🍽️ ตำนานอาหาร & ท่องเที่ยว",
      "📚 ภูมิปัญญา & ประวัติศาสตร์",
      "📰 โลกรอบตัว & ข่าวล่าสุด",
    ];

    for (const name of defaults) {
      await this.addCategory(name);
    }
  }

  // --- Sync Getters (Read from Cache) ---

  getAll(): GameCard[] {
    return this.cards;
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getByCategory(categoryName: string): GameCard | null {
    const filtered = this.cards.filter((c) => c.category === categoryName);
    if (filtered.length === 0) return this.getRandom();
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  getRandom(): GameCard | null {
    if (this.cards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.cards.length);
    return this.cards[randomIndex];
  }

  getByDifficulty(difficulty: "EASY" | "MEDIUM" | "HARD"): GameCard | null {
    const filtered = this.cards.filter((c) => c.difficulty === difficulty);
    if (filtered.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  getByCategoryAndDifficulty(
    category: string,
    difficulty: string
  ): GameCard | null {
    return this.getByCategoryAndDifficultyExclude(category, difficulty, []);
  }

  getByCategoryAndDifficultyExclude(
    category: string,
    difficulty: string,
    excludeIds: string[]
  ): GameCard | null {
    const excludeSet = new Set(excludeIds);
    const filtered = this.cards.filter(
      (c) =>
        c.category === category &&
        c.difficulty === difficulty &&
        !excludeSet.has(c.id)
    );
    if (filtered.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  getRandomExclude(excludeIds: string[]): GameCard | null {
    const excludeSet = new Set(excludeIds);
    const filtered = this.cards.filter((c) => !excludeSet.has(c.id));

    if (filtered.length === 0) {
      // Fallback: allow duplicates if exhausted
      return this.getRandom();
    }
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  getByCategoryExclude(
    category: string,
    excludeIds: string[]
  ): GameCard | null {
    const excludeSet = new Set(excludeIds);
    const filtered = this.cards.filter(
      (c) => c.category === category && !excludeSet.has(c.id)
    );

    if (filtered.length === 0) {
      // Fallback: allow duplicates if exhausted
      return this.getByCategory(category);
    }
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  // --- Async Mutators (Write to DB + Update Cache) ---

  async add(card: Omit<GameCard, "id">): Promise<GameCard> {
    const newCard: GameCard = { ...card, id: uuidv4() };

    // Link CategoryID
    const cat = this.categories.find((c) => c.name === newCard.category);
    if (cat) {
      newCard.categoryId = cat.id;
    }

    await db.collection("cards").doc(newCard.id).set(newCard);
    this.cards.push(newCard);
    return newCard;
  }

  async importCards(cards: Omit<GameCard, "id">[]): Promise<number> {
    // 1. Identify and create unique categories
    const uniqueCategories = new Set(cards.map((c) => c.category));
    for (const catName of uniqueCategories) {
      if (!this.categories.some((c) => c.name === catName)) {
        console.log(`Auto-creating new category during import: ${catName}`);
        await this.addCategory(catName);
      }
    }

    const batchSize = 500;
    let count = 0;
    const chunks = [];

    for (let i = 0; i < cards.length; i += batchSize) {
      chunks.push(cards.slice(i, i + batchSize));
    }

    for (const chunk of chunks) {
      const batch = db.batch();
      for (const cardData of chunk) {
        const newCard: GameCard = { ...cardData, id: uuidv4() };
        // Link CategoryID (Now guaranteed to exist)
        const cat = this.categories.find((c) => c.name === newCard.category);
        if (cat) {
          newCard.categoryId = cat.id;
        }
        const ref = db.collection("cards").doc(newCard.id);
        batch.set(ref, newCard);
        this.cards.push(newCard); // Push to local too
        count++;
      }
      await batch.commit();
    }
    return count;
  }

  async update(
    id: string,
    updates: Partial<GameCard>
  ): Promise<GameCard | null> {
    const index = this.cards.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updatedCard = { ...this.cards[index], ...updates };

    // If category changed, update ID
    if (updates.category) {
      const cat = this.categories.find((c) => c.name === updates.category);
      if (cat) updatedCard.categoryId = cat.id;
    }

    await db.collection("cards").doc(id).set(updatedCard);
    this.cards[index] = updatedCard;
    return updatedCard;
  }

  async delete(id: string): Promise<void> {
    await db.collection("cards").doc(id).delete();
    this.cards = this.cards.filter((c) => c.id !== id);
  }

  async addCategory(name: string): Promise<Category | null> {
    if (this.categories.some((c) => c.name === name)) return null;

    const newCat: Category = { id: uuidv4(), name };
    await db.collection("categories").doc(newCat.id).set(newCat);
    this.categories.push(newCat);
    return newCat;
  }

  async updateCategory(oldName: string, newName: string): Promise<void> {
    const catIndex = this.categories.findIndex((c) => c.name === oldName);
    if (catIndex === -1) return;

    const cat = this.categories[catIndex];
    cat.name = newName;

    await db.collection("categories").doc(cat.id).set(cat); // Update DB

    // Update all cards with this category
    const batch = db.batch();
    this.cards.forEach((card) => {
      // Removed idx as it's not used in the batch update
      if (card.category === oldName) {
        const ref = db.collection("cards").doc(card.id);
        batch.update(ref, { category: newName });
      }
    });
    await batch.commit();

    // Update local cards
    this.cards.forEach((card, idx) => {
      if (card.category === oldName) {
        this.cards[idx].category = newName;
      }
    });
  }

  async deleteCategory(name: string): Promise<void> {
    const cat = this.categories.find((c) => c.name === name);
    if (!cat) return;

    // Delete Category
    await db.collection("categories").doc(cat.id).delete();

    // Delete Cards
    const cardsToDelete = this.cards.filter((c) => c.category === name);
    const batch = db.batch();
    for (const card of cardsToDelete) {
      batch.delete(db.collection("cards").doc(card.id));
    }
    await batch.commit();

    this.categories = this.categories.filter((c) => c.id !== cat.id);
    this.cards = this.cards.filter((c) => c.category !== name);
  }
}

export const cardService = new CardService();
