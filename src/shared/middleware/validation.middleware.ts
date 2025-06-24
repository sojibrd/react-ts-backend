import { Request, Response, NextFunction } from "express";
import { isPast } from "@shared/common/helpers/dateHelper";

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Placeholder: Add validation logic or use class-validator/express-validator as needed
  // For now, just call next()
  next();
}

// Example: Middleware to block access if a date in req.query.blockDate is in the past
export function blockIfPast(req: Request, res: Response, next: NextFunction) {
  const { blockDate } = req.query;
  if (blockDate && isPast(new Date(blockDate as string))) {
    return res
      .status(403)
      .json({ message: "This resource is no longer available." });
  }
  next();
}
