import { HttpStatus } from "@shared/http/http-status.ts";
import { AppError } from "./app-error.ts";

export class ConflictError extends AppError {
  readonly status = HttpStatus.CONFLICT;

  constructor(message = "Conflict", code?: string, details?: unknown) {
    super(message, code, details);
  }
}
