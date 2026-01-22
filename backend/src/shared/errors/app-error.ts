import { HttpStatus } from "@shared/http/http-status";

export abstract class AppError extends Error {
  abstract readonly status: HttpStatus;
  readonly code?: string;
  readonly details?: unknown;

  protected constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
  }
}
