import { toUserResponseDto, type UserResponseDto } from "../../users.dto";
import type { UsersRepositoryPort } from "../ports/users-repository.port";

type Deps = { usersRepo: UsersRepositoryPort };

export function listUsers({ usersRepo }: Deps) {
  return async (): Promise<UserResponseDto[]> => {
    const users = await usersRepo.list();
    return users.map(toUserResponseDto);
  };
}
