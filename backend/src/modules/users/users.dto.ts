import type { UserRecord } from "./application/ports/users-repository.port";

export type CreateUserRequestDto = {
  email: string;
  name: string;
};

export type UpdateUserRequestDto = {
  email?: string;
  name?: string;
};

export type UserResponseDto = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
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
