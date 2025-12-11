import { FastifyInstance } from "fastify";
import { z } from "zod";
import { questionService } from "../services/questionService.js";

export async function questionRoutes(app: FastifyInstance) {
  app.get("/questions", async (request, reply) => {
    return questionService.getAll();
  });

  app.post("/questions", async (request, reply) => {
    const schema = z.object({
      category: z.string(),
      text: z.string().min(1),
      answer: z.string().min(1),
      choices: z.array(z.string()).min(2).max(6), // At least 2 choices, max 6
      points: z.number().min(1).max(1000), // Points between 1-1000
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send(result.error);
    }

    const newQuestion = questionService.add(result.data);
    return newQuestion;
  });

  app.delete("/questions/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    questionService.delete(id);
    return { success: true };
  });
}
