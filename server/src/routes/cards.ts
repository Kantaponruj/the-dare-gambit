import { FastifyInstance } from "fastify";
import { z } from "zod";
import multipart from "@fastify/multipart";
import { parse } from "csv-parse";
import { cardService, GameCard } from "../services/cardService.js";

export async function cardRoutes(app: FastifyInstance) {
  app.register(multipart);

  app.get("/cards", async (request, reply) => {
    return cardService.getAll();
  });

  app.post("/cards", async (request, reply) => {
    const schema = z.object({
      category: z.string(),
      type: z.enum(["TRUTH", "DARE"]),
      text: z.string().min(1),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
      answers: z.array(z.string()).optional(),
      correctAnswer: z.string().optional(),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send(result.error);
    }

    // Validate Truth card requirements
    if (result.data.type === "TRUTH") {
      if (
        !result.data.answers ||
        result.data.answers.length !== 4 ||
        !result.data.correctAnswer
      ) {
        return reply.code(400).send({
          message:
            "TRUTH cards must have exactly 4 answers and a correct answer.",
        });
      }
    }

    // Map difficulty to points
    const points =
      result.data.difficulty === "EASY"
        ? 100
        : result.data.difficulty === "MEDIUM"
        ? 200
        : 300;

    const newCard = cardService.add({
      category: result.data.category,
      text: result.data.text,
      points,
      difficulty: result.data.difficulty,
      type: result.data.type,
      answers: result.data.answers,
      correctAnswer: result.data.correctAnswer,
    });
    return newCard;
  });

  app.put("/cards/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      category: z.string().optional(),
      type: z.enum(["TRUTH", "DARE"]).optional(),
      text: z.string().min(1).optional(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
      answers: z.array(z.string()).optional(),
      correctAnswer: z.string().optional(),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send(result.error);
    }

    // Map updates to GameCard structure
    const updates: any = { ...result.data };

    if (result.data.difficulty) {
      updates.points =
        result.data.difficulty === "EASY"
          ? 100
          : result.data.difficulty === "MEDIUM"
          ? 200
          : 300;
    }

    const updatedCard = cardService.update(id, updates);
    if (!updatedCard) {
      return reply.code(404).send({ message: "Card not found" });
    }
    return updatedCard;
  });

  app.delete("/cards/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    cardService.delete(id);
    return { success: true };
  });

  app.get("/cards/template", async (request, reply) => {
    const csvHeader =
      "category,type,text,difficulty,answers (separated by |),correctAnswer\n";
    const exampleRow1 = "General,TRUTH,What is 2+2?,EASY,1|2|3|4,4\n";
    const exampleRow2 = "Fun,DARE,Dance for 1 minute,MEDIUM,,\n";

    reply.header("Content-Type", "text/csv");
    reply.header(
      "Content-Disposition",
      'attachment; filename="cards_template.csv"'
    );
    return csvHeader + exampleRow1 + exampleRow2;
  });

  app.post("/cards/import", async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ message: "No file uploaded" });
    }

    const cards: Omit<GameCard, "id">[] = [];
    const parser = data.file.pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    );

    for await (const row of parser) {
      try {
        const difficulty = ["EASY", "MEDIUM", "HARD"].includes(
          row.difficulty?.toUpperCase()
        )
          ? row.difficulty.toUpperCase()
          : "EASY";

        const points =
          difficulty === "EASY" ? 100 : difficulty === "MEDIUM" ? 200 : 300;

        const card: Omit<GameCard, "id"> = {
          category: row.category,
          type: row.type as "TRUTH" | "DARE",
          text: row.text,
          points: points,
          difficulty: difficulty as "EASY" | "MEDIUM" | "HARD",
        };

        if (card.type === "TRUTH") {
          card.answers = row["answers (separated by |)"]
            ? row["answers (separated by |)"].split("|")
            : [];
          card.correctAnswer = row.correctAnswer;
        }

        cards.push(card);
      } catch (err) {
        console.error("Error parsing row:", row, err);
      }
    }

    const count = cardService.importCards(cards);
    return { success: true, count };
  });
}
