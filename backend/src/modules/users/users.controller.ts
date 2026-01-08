import type { Request, Response } from "express";
import type {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from "./users.dto";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./users.schemas";

// TODO: Comprobar los status ahi hardcodeados

type UsersControllerDeps = {
  createUser: (input: CreateUserRequestDto) => Promise<UserResponseDto>;
  listUsers: () => Promise<UserResponseDto[]>;
  getUserById: (input: { id: string }) => Promise<UserResponseDto>;
  updateUser: (input: {
    id: string;
    patch: UpdateUserRequestDto;
  }) => Promise<UserResponseDto>;
  deleteUser: (input: { id: string }) => Promise<void>;
};

export class UsersController {
  constructor(private readonly deps: UsersControllerDeps) {}

  listUsers = async (_req: Request, res: Response) => {
    const result = await this.deps.listUsers();
    res.status(200).json(result);
  };

  getUserById = async (req: Request, res: Response) => {
    const { id } = userIdParamSchema.parse(req.params);
    const result = await this.deps.getUserById({ id });
    res.status(200).json(result);
  };

  createUser = async (req: Request, res: Response) => {
    const input = createUserSchema.parse(req.body);
    const result = await this.deps.createUser(input);
    res.status(201).json(result);
  };

  updateUser = async (req: Request, res: Response) => {
    const { id } = userIdParamSchema.parse(req.params);
    const patch = updateUserSchema.parse(req.body);
    const result = await this.deps.updateUser({ id, patch });
    res.status(200).json(result);
  };

  deleteUser = async (req: Request, res: Response) => {
    const { id } = userIdParamSchema.parse(req.params);
    await this.deps.deleteUser({ id });
    res.status(204).send();
  };
}
