import { AppError } from "./app-error.ts";

export class UnauthorizedError extends AppError {
  readonly status = 401;

  constructor(message = "Unauthorized", code?: string, details?: unknown) {
    super(message, code, details);
  }
}
