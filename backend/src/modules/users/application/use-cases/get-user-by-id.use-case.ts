import { NotFoundError } from "@shared/errors/not-found-error";
import { toUserResponseDto, type UserResponseDto } from "../../users.dto";
import type { UsersRepositoryPort } from "../ports/users-repository.port";

type Deps = { usersRepo: UsersRepositoryPort };

export function getUserById({ usersRepo }: Deps) {
  return async (input: { id: string }): Promise<UserResponseDto> => {
    const user = await usersRepo.findById(input.id);
    if (!user)
      throw new NotFoundError("User not found", "UserNotFound", {
        id: input.id,
      });
    return toUserResponseDto(user);
  };
}
