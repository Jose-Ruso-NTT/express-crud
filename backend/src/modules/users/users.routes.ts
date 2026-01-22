import { asyncHandler } from "@shared/http/async-handler";
import { Router } from "express";
import type { UsersController } from "./users.controller";

export function usersRoutes(controller: UsersController): Router {
  const router = Router();

  router.get("/", asyncHandler(controller.listUsers));
  router.get("/:id", asyncHandler(controller.getUserById));
  router.get("/by-email/:email", asyncHandler(controller.getUserByEmail));
  router.post("/", asyncHandler(controller.createUser));
  router.patch("/:id", asyncHandler(controller.updateUser));
  router.delete("/:id", asyncHandler(controller.deleteUser));

  return router;
}
