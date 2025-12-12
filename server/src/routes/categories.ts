import { FastifyInstance } from "fastify";
import { z } from "zod";
import { cardService } from "../services/cardService.js";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/categories", async (request, reply) => {
    return cardService.getCategories().map((c) => c.name);
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
    const newCat = await cardService.addCategory(name);
    return newCat || { name };
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
    await cardService.updateCategory(name, newName);
    return { name: newName };
  });

  app.delete("/categories/:name", async (request, reply) => {
    const { name } = request.params as { name: string };
    await cardService.deleteCategory(name);
    return { success: true };
  });
}
