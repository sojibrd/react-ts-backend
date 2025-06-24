import { Request, Response } from "express";
import logger from "../../shared/utils/logger";
import { generateAndSendOtp, verifyOtp } from "./strategies/otp/otpStrategy";
import { enableMfa, verifyMfa } from "./strategies/mfa/mfaStrategy";
import { UserService } from "../users/user.service";

export const authOtpHandlers = {
  async requestOtp(req: Request, res: Response) {
    logger.info({ endpoint: "/request-otp", body: req.body }, "OTP request");
    const { phone, email } = req.body;
    if (!phone && !email) {
      return res
        .status(400)
        .json({ message: "Phone number or email is required." });
    }
    try {
      const result = await generateAndSendOtp({ phone, email });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to send OTP.", error: err });
    }
  },
  async verifyOtp(req: Request, res: Response) {
    logger.info({ endpoint: "/verify-otp", body: req.body }, "OTP verify");
    const { phone, email, otp } = req.body;
    if ((!phone && !email) || !otp) {
      return res
        .status(400)
        .json({ message: "Phone or email and OTP are required." });
    }
    try {
      const result = await verifyOtp({ phone, email, otp });
      if (!result.valid) {
        return res.status(401).json({ message: result.message });
      }
      res.json({ message: result.message });
    } catch (err) {
      res.status(500).json({ message: "OTP verification failed.", error: err });
    }
  },
};

export const authMfaHandlers = {
  async enableMfa(req: Request, res: Response) {
    logger.info({ endpoint: "/enable-mfa", body: req.body }, "Enable MFA");
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    try {
      const result = await enableMfa(email);
      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to enable MFA.", error: err });
    }
  },
  async verifyMfa(req: Request, res: Response) {
    logger.info({ endpoint: "/verify-mfa", body: req.body }, "Verify MFA");
    const { email, token } = req.body;
    if (!email || !token) {
      return res
        .status(400)
        .json({ message: "Email and TOTP code are required." });
    }
    try {
      const result = await verifyMfa(email, token);
      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }
      res.json({ message: result.message });
    } catch (err) {
      res.status(500).json({ message: "MFA verification failed.", error: err });
    }
  },
};

export function authMeHandler(req: Request, res: Response) {
  logger.info({ endpoint: "/me", user: req.user }, "Get logged-in user");
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  res.json({ user: req.user });
}

export function authLogoutAllHandler(req: Request, res: Response) {
  logger.info({ endpoint: "/logout-all", user: req.user }, "Logout all users");
  req.logout(function (err) {
    if (err) {
      return res.status(500).json({ message: "Logout failed.", error: err });
    }
    req.session.destroy(() => {
      res.json({ message: "Logged out from all sessions." });
    });
  });
}
