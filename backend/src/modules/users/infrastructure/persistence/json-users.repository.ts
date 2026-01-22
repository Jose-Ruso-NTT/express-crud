import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from "modules/users/users.dto";
import type { IdGeneratorPort } from "../../application/ports/id-generator.port";
import type {
  UserRecord,
  UsersRepositoryPort,
} from "../../application/ports/users-repository.port";
import type { JsonDbClient } from "./json-db.client";

type UsersDbShape = { users: UserRecord[] };

export class JsonUsersRepository implements UsersRepositoryPort {
  constructor(
    private readonly db: JsonDbClient<UsersDbShape>,
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async findById(id: string): Promise<UserRecord | null> {
    const { users } = await this.db.read();
    return users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const { users } = await this.db.read();
    const normalized = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
  }

  async list(): Promise<UserRecord[]> {
    const { users } = await this.db.read();
    return [...users];
  }

  async create(data: CreateUserRequestDto): Promise<UserRecord> {
    const now = new Date().toISOString();

    const record: UserRecord = {
      id: this.idGenerator.generate(),
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await this.db.transaction((db) => {
      db.users.push(record);
      return db;
    });

    return record;
  }

  async updateById(
    id: string,
    patch: UpdateUserRequestDto,
  ): Promise<UserRecord | null> {
    let result: UserRecord | null = null;

    await this.db.transaction((db) => {
      const idx = db.users.findIndex((u) => u.id === id);
      if (idx === -1) {
        result = null;
        return db;
      }

      const current = db.users[idx];
      const now = new Date().toISOString();

      const updated: UserRecord = {
        ...current,
        email:
          patch.email !== undefined
            ? patch.email.trim().toLowerCase()
            : current.email,
        name: patch.name !== undefined ? patch.name.trim() : current.name,
        updatedAt: now,
      };

      db.users[idx] = updated;
      result = updated;
      return db;
    });

    return result;
  }

  async deleteById(id: string): Promise<boolean> {
    let deleted = false;

    await this.db.transaction((db) => {
      const before = db.users.length;
      db.users = db.users.filter((u) => u.id !== id);
      deleted = db.users.length !== before;
      return db;
    });

    return deleted;
  }
}
