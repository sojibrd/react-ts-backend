import { Router } from "express";
import { AuthController } from "../controllers/authController";
import passport from "passport";
import { generalLimiter, loginLimiter } from "../middleware/rateLimiters";
import { UserService } from "../services/userService";
import logger from "../utils/logger";
import { generateAndSendOtp, verifyOtp } from "../strategies/otpStrategy";
import { enableMfa, verifyMfa } from "../strategies/mfaStrategy";

const router = Router();
const authController = new AuthController();

// Register Passport strategies (Google, etc.)
import { registerPassportStrategies } from "../strategies";
registerPassportStrategies();

// Apply general rate limiter to all auth routes
router.use(generalLimiter);

// Register route
router.post("/register", (req, res) => authController.register(req, res));

// Login route
router.post("/login", loginLimiter, (req, res) =>
  authController.login(req, res)
);

// Google OAuth 2.0 Social Login
router.get(
  "/oauth/google",
  (req, res, next) => {
    logger.info({ endpoint: "/oauth/google" }, "Google OAuth login start");
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/oauth/google/callback",
  (req, res, next) => {
    logger.info(
      { endpoint: "/oauth/google/callback" },
      "Google OAuth callback"
    );
    next();
  },
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  (req, res) => {
    logger.info(
      { endpoint: "/oauth/google/callback", user: req.user },
      "Google login successful"
    );
    res.json({ message: "Google login successful", user: req.user });
  }
);

// Request OTP
router.post("/request-otp", async (req, res) => {
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
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
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
});

// Enable MFA (TOTP)
router.post("/enable-mfa", async (req, res) => {
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
});

// Verify MFA (TOTP)
router.post("/verify-mfa", async (req, res) => {
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
});

// Get all users
router.get("/users", async (req, res) => {
  logger.info({ endpoint: "/users" }, "Get all users");
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users.", error: err });
  }
});

// Get logged-in user
router.get("/me", (req, res) => {
  logger.info({ endpoint: "/me", user: req.user }, "Get logged-in user");
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  res.json({ user: req.user });
});

// Logout all users (current session)
router.get("/logout-all", (req, res) => {
  logger.info({ endpoint: "/logout-all", user: req.user }, "Logout all users");
  req.logout(function (err) {
    if (err) {
      return res.status(500).json({ message: "Logout failed.", error: err });
    }
    req.session.destroy(() => {
      res.json({ message: "Logged out from all sessions." });
    });
  });
});

export default router;
