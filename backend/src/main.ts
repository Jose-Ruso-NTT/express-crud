import { buildApp } from "./app.ts";
import { env } from "./config/env.ts";
import { logger } from "./config/logger.ts";

const app = buildApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Server listening on http://localhost:${env.PORT}`);
});

// Cierre ordenado (recomendado aunque uses JSON)
function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down...`);
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
