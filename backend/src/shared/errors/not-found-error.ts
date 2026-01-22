import { HttpStatus } from "@shared/http/http-status.ts";
import { AppError } from "./app-error.ts";

export class NotFoundError extends AppError {
  readonly status = HttpStatus.NOT_FOUND;

  constructor(
    message = "Resource not found",
    code?: string,
    details?: unknown,
  ) {
    super(message, code, details);
  }
}
