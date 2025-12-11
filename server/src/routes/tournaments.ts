import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authGuard } from "../middleware/auth.js";
import {
  createTournament,
  listTournaments,
  getTournament,
} from "../services/store.js";

const createTournamentSchema = z.object({
  name: z.string().min(1),
});

export async function tournamentRoutes(app: FastifyInstance) {
  app.post(
    "/tournaments",
    { preValidation: [authGuard] },
    async (request, reply) => {
      const parsed = createTournamentSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply
          .code(400)
          .send({ error: "Invalid body", issues: parsed.error.issues });
      }
      const userId = request.user.sub;
      if (!userId) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      const t = createTournament(parsed.data.name, userId);
      return reply.code(201).send(t);
    }
  );

  app.get("/tournaments", async (_request, reply) => {
    return reply.send(listTournaments());
  });

  app.get("/tournaments/:id", async (request, reply) => {
    const id = (request.params as any).id as string;
    const t = getTournament(id);
    if (!t) return reply.code(404).send({ error: "Not found" });
    return reply.send(t);
  });
}
