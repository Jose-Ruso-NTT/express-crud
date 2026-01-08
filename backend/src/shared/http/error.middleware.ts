import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../config/logger.ts";
import { AppError } from "../errors/app-error.ts";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Invalid request payload",
      issues: err.issues,
    });
  }

  // Known domain errors
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.code ?? "AppError",
      message: err.message,
      details: err.details,
    });
  }

  logger.error("Unhandled error", err);
  return res.status(500).json({
    error: "InternalServerError",
    message: "Unexpected error",
  });
}
