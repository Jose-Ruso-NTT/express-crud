import { errorMiddleware } from "@shared/http/error.middleware.ts";
import { requestIdMiddleware } from "@shared/http/requestId.middleware.ts";
import cors from "cors";
import express from "express";
import { buildUsersModule } from "./modules/users/users.module.ts";

export function buildApp() {
  const app = express();

  // global middlewares
  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);

  // base endpoints
  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  // Modules
  app.use("/v1/users", buildUsersModule());

  // error handling middleware
  app.use(errorMiddleware);

  return app;
}
