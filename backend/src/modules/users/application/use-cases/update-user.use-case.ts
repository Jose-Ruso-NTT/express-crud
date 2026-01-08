import { ConflictError } from "../../../../shared/errors/conflict-error";
import { NotFoundError } from "../../../../shared/errors/not-found-error";
import { toUserResponseDto, type UserResponseDto } from "../../users.dto";
import type { UsersRepositoryPort } from "../ports/users-repository.port";

type Deps = { usersRepo: UsersRepositoryPort };

export function updateUser({ usersRepo }: Deps) {
  return async (input: {
    id: string;
    patch: { email?: string; name?: string };
  }): Promise<UserResponseDto> => {
    if (input.patch.email) {
      const existing = await usersRepo.findByEmail(input.patch.email);
      if (existing && existing.id !== input.id) {
        throw new ConflictError("Email already exists", "EmailAlreadyExists", {
          email: input.patch.email,
        });
      }
    }

    const updated = await usersRepo.updateById(input.id, input.patch);
    if (!updated)
      throw new NotFoundError("User not found", "UserNotFound", {
        id: input.id,
      });

    return toUserResponseDto(updated);
  };
}
