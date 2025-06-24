import { Router } from "express";
import { registerPassportStrategies } from "./strategies";
import { AuthController } from "./auth.controller";
import {
  generalLimiter,
  loginLimiter,
} from "../../shared/middleware/rateLimiters.middleware";
import {
  authMeHandler,
  authMfaHandlers,
  authOtpHandlers,
  authLogoutAllHandler,
} from "./auth.handlers";

const router = Router();
const authController = new AuthController();

registerPassportStrategies();

router.use(generalLimiter);

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", loginLimiter, (req, res) =>
  authController.login(req, res)
);

// OTP routes
router.post("/request-otp", authOtpHandlers.requestOtp);
router.post("/verify-otp", authOtpHandlers.verifyOtp);

// MFA routes
router.post("/enable-mfa", authMfaHandlers.enableMfa);
router.post("/verify-mfa", authMfaHandlers.verifyMfa);

// User info
router.get("/me", authMeHandler);

// Logout
router.get("/logout-all", authLogoutAllHandler);

export default router;
