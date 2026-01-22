import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().min(1),
});

export const userEmailParamSchema = z.object({
  email: z.email(),
});

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
});

export const updateUserSchema = z
  .object({
    email: z.email().optional(),
    name: z.string().min(1).optional(),
  })
  .refine((v) => v.email !== undefined || v.name !== undefined, {
    message: "At least one field must be provided",
  });
