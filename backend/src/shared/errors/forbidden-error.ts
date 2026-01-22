import { HttpStatus } from "@shared/http/http-status.ts";
import { AppError } from "./app-error.ts";

export class ForbiddenError extends AppError {
  readonly status = HttpStatus.FORBIDDEN;

  constructor(message = "Forbidden", code?: string, details?: unknown) {
    super(message, code, details);
  }
}
