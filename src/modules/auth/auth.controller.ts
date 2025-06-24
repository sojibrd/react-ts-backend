import { Request, Response } from "express";
import { UserService } from "@users/user.service";
import { sendSuccess, sendError } from "@shared/utils/responseHandler";
import { ApiError } from "@shared/utils/apiError";
import logger from "@shared/utils/logger";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await UserService.register(email, password);
      logger.info({ action: "register", user: user.email });
      sendSuccess(res, user, "User registered successfully");
    } catch (error) {
      logger.error(error);
      sendError(
        res,
        error instanceof Error
          ? error
          : new ApiError(400, "Registration failed"),
        400
      );
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await UserService.validateUser(email, password);
      if (!user) {
        return sendError(res, new ApiError(401, "Invalid credentials"), 401);
      }
      req.login(user, (err) => {
        if (err) {
          logger.error(err);
          return sendError(res, new ApiError(500, "Session error"), 500);
        }
        logger.info({ action: "login", user: user.email });
        sendSuccess(res, user, "Login successful");
      });
    } catch (error) {
      logger.error(error);
      sendError(
        res,
        error instanceof Error ? error : new ApiError(401, "Login failed"),
        401
      );
    }
  }
}
