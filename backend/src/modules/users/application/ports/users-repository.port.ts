import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from "modules/users/users.dto";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  /** Timestamps in ISO 8601 format ex: 2023-01-01T00:00:00.000Z */
  createdAt: string;
  /** Timestamps in ISO 8601 format ex: 2023-01-01T00:00:00.000Z */
  updatedAt: string;
};

export interface UsersRepositoryPort {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  list(): Promise<UserRecord[]>;
  create(data: CreateUserRequestDto): Promise<UserRecord>;
  updateById(
    id: string,
    patch: UpdateUserRequestDto,
  ): Promise<UserRecord | null>;
  deleteById(id: string): Promise<boolean>;
}
