import { HttpStatus } from "@shared/http/http-status.ts";
import { AppError } from "./app-error.ts";

export class UnauthorizedError extends AppError {
  readonly status = HttpStatus.UNAUTHORIZED;

  constructor(message = "Unauthorized", code?: string, details?: unknown) {
    super(message, code, details);
  }
}
