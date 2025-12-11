import { FastifyInstance } from "fastify";
import { z } from "zod";
import { cardService } from "../services/cardService.js";

// In-memory storage for categories (mock database)
let categories: string[] = [
  "😂 สังคม & มีมดัง",
  "📺 วัยรุ่น Y2K & ซีรีส์",
  "🎤 T-Pop & เพลงฮิต",
  "💸 ชีวิตติดโปร & ไฟแนนซ์",
  "🍽️ ตำนานอาหาร & ท่องเที่ยว",
  "📚 ภูมิปัญญา & ประวัติศาสตร์",
  "📰 โลกรอบตัว & ข่าวล่าสุด",
];

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/categories", async (request, reply) => {
    return categories;
  });

  app.post("/categories", async (request, reply) => {
    const schema = z.object({
      name: z.string().min(1),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send(result.error);
    }

    const { name } = result.data;
    if (!categories.includes(name)) {
      categories.push(name);
    }
    return { name };
  });

  app.put("/categories/:name", async (request, reply) => {
    const { name } = request.params as { name: string };
    const schema = z.object({
      newName: z.string().min(1),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send(result.error);
    }

    const { newName } = result.data;
    const index = categories.indexOf(name);
    if (index !== -1) {
      categories[index] = newName;
      // Update all cards with this category
      cardService.updateCategory(name, newName);
    }
    return { name: newName };
  });

  app.delete("/categories/:name", async (request, reply) => {
    const { name } = request.params as { name: string };
    categories = categories.filter((c) => c !== name);
    // Delete all cards in this category
    cardService.deleteCategory(name);
    return { success: true };
  });
}
