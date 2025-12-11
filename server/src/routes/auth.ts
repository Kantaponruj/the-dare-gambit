import { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByUsername } from "../services/store.js";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid body", issues: parsed.error.issues });
    }
    const { username, password } = parsed.data;
    const user = findUserByUsername(username);
    if (!user) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }
    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }
    const token = app.jwt.sign({ sub: user.id, username: user.username });
    return reply.send({ token });
  });
}
