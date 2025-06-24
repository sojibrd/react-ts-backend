import { Request, Response, NextFunction } from "express";
import { ApiError } from "@shared/utils/apiError";
import logger from "@shared/utils/logger";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    logger.info({ action: "auth-check", user: req.user?.email });
    return next();
  }
  logger.warn({ action: "auth-fail", url: req.originalUrl });
  next(new ApiError(401, "Unauthorized"));
}
