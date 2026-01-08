import { AppError } from "./app-error.ts";

export class NotFoundError extends AppError {
  readonly status = 404;

  constructor(
    message = "Resource not found",
    code?: string,
    details?: unknown,
  ) {
    super(message, code, details);
  }
}
