import { AppError } from "./app-error.ts";

export class ForbiddenError extends AppError {
  readonly status = 403;

  constructor(message = "Forbidden", code?: string, details?: unknown) {
    super(message, code, details);
  }
}
