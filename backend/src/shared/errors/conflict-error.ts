import { AppError } from "./app-error.ts";

export class ConflictError extends AppError {
  readonly status = 409;

  constructor(message = "Conflict", code?: string, details?: unknown) {
    super(message, code, details);
  }
}
