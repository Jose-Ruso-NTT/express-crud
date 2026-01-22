import type { NextFunction, Request, Response } from "express";
import { NodeIdGenerator } from "modules/users/infrastructure/id-generator/node-id-generator";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId =
    req.header("x-request-id") ?? new NodeIdGenerator().generate();
  (req as any).requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
