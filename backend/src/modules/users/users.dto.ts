import z from "zod";
import type { UserRecord } from "./application/ports/users-repository.port";
import {
  createUserSchema,
  updateUserSchema,
  userEmailParamSchema,
  userIdParamSchema,
} from "./users.schemas";

export type UserIdParam = z.infer<typeof userIdParamSchema>;

export type EmailParam = z.infer<typeof userEmailParamSchema>;

export type CreateUserRequestDto = z.infer<typeof createUserSchema>;

export type UpdateUserRequestDto = z.infer<typeof updateUserSchema>;

export type UserResponseDto = {
  id: string;
  email: string;
  name: string;
  /** Timestamps in ISO 8601 format ex: 2023-01-01T00:00:00.000Z */
  createdAt: string;
  /** Timestamps in ISO 8601 format ex: 2023-01-01T00:00:00.000Z */
  updatedAt: string;
};

export function toUserResponseDto(user: UserRecord): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
