import Fastify from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import dotenv from "dotenv";
import { setupSocket } from "./socket.js";
import { authRoutes } from "./routes/auth.js";
import { tournamentRoutes } from "./routes/tournaments.js";
import { categoryRoutes } from "./routes/categories.js";
import { cardRoutes } from "./routes/cards.js";
import { questionRoutes } from "./routes/questions.js";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: "*", // Allow all origins
});
fastify.register(formbody);
fastify.register(jwt, { secret: process.env.JWT_SECRET || "secret" });

fastify.register(swagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Game Show API",
      description: "API for Game Show management",
      version: "1.0.0",
    },
    servers: [
      {
        url: process.env.VITE_API_URL || "http://localhost:4000",
      },
    ],
  },
});

fastify.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

// Register Routes
fastify.register(authRoutes);
fastify.register(tournamentRoutes);
fastify.register(categoryRoutes);
fastify.register(cardRoutes);
fastify.register(questionRoutes);

const start = async () => {
  try {
    await fastify.ready();

    // Socket.io setup - must happen before listen
    setupSocket(fastify.server);

    // CRITICAL: Listen on port FIRST to satisfy Cloud Run health check
    const port = parseInt(process.env.PORT || "3000");
    await fastify.listen({
      port,
      host: "0.0.0.0",
    });
    console.log(`Server listening on port ${port}`);
    console.log("Swagger docs available at /docs");

    // Initialize Data Service AFTER the port is bound
    // This can take time or fail without blocking health checks
    try {
      const { cardService } = await import("./services/cardService.js");
      await cardService.initialize();
      console.log("CardService initialized successfully");
    } catch (initErr) {
      console.error("CardService initialization failed:", initErr);
      // Don't exit - server is still functional for health checks
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
