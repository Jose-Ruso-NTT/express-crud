import { NotFoundError } from "@shared/errors/not-found-error";
import { toUserResponseDto, type UserResponseDto } from "../../users.dto";
import type { UsersRepositoryPort } from "../ports/users-repository.port";

type Deps = { usersRepo: UsersRepositoryPort };

export function getUserByEmail({ usersRepo }: Deps) {
  return async (input: { email: string }): Promise<UserResponseDto> => {
    const user = await usersRepo.findByEmail(input.email);
    if (!user)
      throw new NotFoundError("User not found", "UserNotFound", {
        email: input.email,
      });
    return toUserResponseDto(user);
  };
}
