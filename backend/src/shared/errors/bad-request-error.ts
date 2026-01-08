import { AppError } from "./app-error.ts";

export class BadRequestError extends AppError {
  readonly status = 400;

  constructor(message = "Bad request", code?: string, details?: unknown) {
    super(message, code, details);
  }
}
