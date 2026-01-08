import { NotFoundError } from "../../../../shared/errors/not-found-error";
import type { UsersRepositoryPort } from "../ports/users-repository.port";

type Deps = { usersRepo: UsersRepositoryPort };

export function deleteUser({ usersRepo }: Deps) {
  return async (input: { id: string }): Promise<void> => {
    const deleted = await usersRepo.deleteById(input.id);
    if (!deleted)
      throw new NotFoundError("User not found", "UserNotFound", {
        id: input.id,
      });
  };
}
