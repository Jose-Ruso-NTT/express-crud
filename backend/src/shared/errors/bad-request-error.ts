import { HttpStatus } from "@shared/http/http-status.ts";
import { AppError } from "./app-error.ts";

export class BadRequestError extends AppError {
  readonly status = HttpStatus.BAD_REQUEST;

  constructor(message = "Bad request", code?: string, details?: unknown) {
    super(message, code, details);
  }
}
