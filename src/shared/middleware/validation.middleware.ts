import { Request, Response, NextFunction } from "express";

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Placeholder: Add validation logic or use class-validator/express-validator as needed
  // For now, just call next()
  next();
}
