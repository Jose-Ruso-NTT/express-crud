import { Router } from "express";
import { UsersController } from "./users.controller";
import { usersRoutes } from "./users.routes";

import { createUser } from "./application/use-cases/create-user.use-case";
import { deleteUser } from "./application/use-cases/delete-user.use-case";
import { getUserById } from "./application/use-cases/get-user-by-id.use-case";
import { listUsers } from "./application/use-cases/list-users.use-case";
import { updateUser } from "./application/use-cases/update-user.use-case";

import { NodeIdGenerator } from "./infrastructure/id-generator/node-id-generator";
import { createJsonDbClient } from "./infrastructure/persistence/json-db.client";
import { JsonUsersRepository } from "./infrastructure/persistence/json-users.repository";

import type { UserRecord } from "./application/ports/users-repository.port";

type UsersDbShape = { users: UserRecord[] };

export function buildUsersModule(): Router {
  // 1️⃣ Infraestructura concreta (JSON temporal)
  const db = createJsonDbClient<UsersDbShape>("data/users.json", {
    initialData: { users: [] },
  });

  const idGenerator = new NodeIdGenerator();
  const usersRepo = new JsonUsersRepository(db, idGenerator);

  // 2️⃣ Use-cases
  const controller = new UsersController({
    createUser: createUser({ usersRepo }),
    listUsers: listUsers({ usersRepo }),
    getUserById: getUserById({ usersRepo }),
    updateUser: updateUser({ usersRepo }),
    deleteUser: deleteUser({ usersRepo }),
  });

  // 3️⃣ Router HTTP
  return usersRoutes(controller);
}
