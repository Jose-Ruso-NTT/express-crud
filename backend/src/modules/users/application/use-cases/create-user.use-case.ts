import { ConflictError } from "@shared/errors/conflict-error.ts";
import {
  CreateUserRequestDto,
  toUserResponseDto,
  type UserResponseDto,
} from "../../users.dto.ts";
import type { UsersRepositoryPort } from "../ports/users-repository.port.ts";

type Deps = { usersRepo: UsersRepositoryPort };

export function createUser({ usersRepo }: Deps) {
  return async (input: CreateUserRequestDto): Promise<UserResponseDto> => {
    const existing = await usersRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email already exists", "EmailAlreadyExists", {
        email: input.email,
      });
    }

    const created = await usersRepo.create(input);
    return toUserResponseDto(created);
  };
}
