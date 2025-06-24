import { Request, Response } from "express";
import { UserService } from "@users/user.service";
import { sendSuccess, sendError } from "@shared/utils/responseHandler";
import { ApiError } from "@shared/utils/apiError";
import logger from "@shared/utils/logger";
import { formatDate, diffInDays } from "@shared/common/helpers/dateHelper";

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      // Example: Add a formatted date and days since creation to each user
      const usersWithMeta = users.map((user) => ({
        ...user,
        formattedCreatedAt: formatDate(user.createdAt),
        daysSinceCreated: diffInDays(new Date(), user.createdAt),
      }));
      logger.info({ action: "getAllUsers", count: users.length });
      sendSuccess(res, usersWithMeta, "Fetched all users");
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
