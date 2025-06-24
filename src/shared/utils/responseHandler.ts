import { Response } from "express";

export function sendSuccess(res: Response, data: any, message = "Success") {
  res.status(200).json({ success: true, message, data });
}

export function sendError(res: Response, error: any, status = 500) {
  res
    .status(status)
    .json({ success: false, message: error.message || "Error", error });
}
