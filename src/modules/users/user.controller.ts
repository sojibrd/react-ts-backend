import { Request, Response } from "express";
import { UserService } from "@users/user.service";
import { sendSuccess, sendError } from "@shared/utils/responseHandler";
import { ApiError } from "@shared/utils/apiError";
import logger from "@shared/utils/logger";

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      logger.info({ action: "getAllUsers", count: users.length });
      sendSuccess(res, users, "Fetched all users");
    } catch (error) {
      logger.error(error);
      sendError(
        res,
        error instanceof Error
          ? error
          : new ApiError(500, "Failed to fetch users"),
        500
      );
    }
  }
}
