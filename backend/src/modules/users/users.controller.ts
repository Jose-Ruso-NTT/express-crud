import { HttpStatus } from "@shared/http/http-status.ts";
import type { Request, Response } from "express";
import type {
  CreateUserRequestDto,
  EmailParam,
  UpdateUserRequestDto,
  UserIdParam,
  UserResponseDto,
} from "./users.dto";
import {
  createUserSchema,
  updateUserSchema,
  userEmailParamSchema,
  userIdParamSchema,
} from "./users.schemas";

type UsersControllerDeps = {
  createUser: (input: CreateUserRequestDto) => Promise<UserResponseDto>;
  listUsers: () => Promise<UserResponseDto[]>;
  getUserById: (input: UserIdParam) => Promise<UserResponseDto>;
  getUserByEmail: (input: EmailParam) => Promise<UserResponseDto>;
  updateUser: (input: {
    id: string;
    patch: UpdateUserRequestDto;
  }) => Promise<UserResponseDto>;
  deleteUser: (input: UserIdParam) => Promise<void>;
};

export class UsersController {
  constructor(private readonly deps: UsersControllerDeps) {}

  listUsers = async (_req: Request, res: Response) => {
    const result = await this.deps.listUsers();
    res.status(HttpStatus.OK).json(result);
  };

  getUserById = async (req: Request, res: Response) => {
    const { id } = userIdParamSchema.parse(req.params);
    const result = await this.deps.getUserById({ id });
    res.status(HttpStatus.OK).json(result);
  };

  getUserByEmail = async (req: Request, res: Response) => {
    const { email } = userEmailParamSchema.parse(req.params);
    const result = await this.deps.getUserByEmail({ email });
    res.status(HttpStatus.OK).json(result);
  };

  createUser = async (req: Request, res: Response) => {
    const input = createUserSchema.parse(req.body);
    const result = await this.deps.createUser(input);
    res.status(HttpStatus.CREATED).json(result);
  };

  updateUser = async (req: Request, res: Response) => {
    const { id } = userIdParamSchema.parse(req.params);
    const patch = updateUserSchema.parse(req.body);
    const result = await this.deps.updateUser({ id, patch });
    res.status(HttpStatus.OK).json(result);
  };

  deleteUser = async (req: Request, res: Response) => {
    const { id } = userIdParamSchema.parse(req.params);
    await this.deps.deleteUser({ id });
    res.status(HttpStatus.NO_CONTENT).send();
  };
}
