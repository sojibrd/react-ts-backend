import { Router } from "express";
import { AppDataSource } from "../index";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import passport from "passport";
import passportGoogle, { Profile } from "passport-google-oauth20";
import nodemailer from "nodemailer";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { generalLimiter, loginLimiter } from "../middleware/rateLimiters";
import { UserService } from "../services/userService";
import { RegisterDto, LoginDto } from "../dto/auth.dto";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

const router = Router();
const GoogleStrategy = passportGoogle.Strategy;

// Passport Google OAuth 2.0 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/auth/oauth/google/callback",
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      // Here you would find or create a user in your DB
      // For now, just pass the profile
      return done(null, profile);
    }
  )
);

// Apply general rate limiter to all auth routes
router.use(generalLimiter);

// Register
router.post("/register", async (req, res) => {
  const dto = plainToInstance(RegisterDto, req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    const constraints = errors[0].constraints;
    const message = constraints
      ? Object.values(constraints)[0]
      : "Validation error";
    return res.status(400).json({ message });
  }
  const { email, password } = dto;
  try {
    await UserService.register(email, password);
    res.status(201).json({ message: "User registered successfully." });
  } catch (err: any) {
    if (err.message === "Email already registered.") {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Registration failed.", error: err });
  }
});

// Login
router.post("/login", loginLimiter, async (req, res) => {
  const dto = plainToInstance(LoginDto, req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    const constraints = errors[0].constraints;
    const message = constraints
      ? Object.values(constraints)[0]
      : "Validation error";
    return res.status(400).json({ message });
  }
  const { email, password } = dto;
  try {
    const user = await UserService.validateUser(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    // Set up the session using Passport
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed.", error: err });
      }
      res.json({ message: "Login successful." });
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err });
  }
});

// Google OAuth 2.0 Social Login
router.get(
  "/oauth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/oauth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  (req, res) => {
    // Successful authentication
    res.json({ message: "Google login successful", user: req.user });
  }
);

// Request OTP
router.post("/request-otp", async (req, res) => {
  const { phone, email } = req.body;
  if (!phone && !email) {
    return res
      .status(400)
      .json({ message: "Phone number or email is required." });
  }
  try {
    const userRepo = AppDataSource.getRepository(User);
    let user = phone
      ? await userRepo.findOneBy({ phone })
      : await userRepo.findOneBy({ email });
    if (!user) {
      user = userRepo.create({ phone, email });
    }
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await userRepo.save(user);
    // Send OTP via Gmail SMTP if email is provided
    if (email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP for login is: ${otp}`,
      });
      res.json({ message: "OTP sent to email." });
    } else {
      // Placeholder: send OTP via SMS provider
      console.log(`OTP for ${phone}: ${otp}`);
      res.json({ message: "OTP sent (check console in dev mode)." });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP.", error: err });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { phone, email, otp } = req.body;
  if ((!phone && !email) || !otp) {
    return res
      .status(400)
      .json({ message: "Phone or email and OTP are required." });
  }
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = phone
      ? await userRepo.findOneBy({ phone })
      : await userRepo.findOneBy({ email });
    if (!user || user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP or user." });
    }
    // OTP verified, clear OTP
    user.otp = undefined;
    await userRepo.save(user);
    res.json({ message: "OTP verified. Login successful." });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed.", error: err });
  }
});

// Enable MFA (TOTP)
router.post("/enable-mfa", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const secret = speakeasy.generateSecret({ name: `ExpressTS (${email})` });
    user.mfaSecret = secret.base32;
    await userRepo.save(user);
    const qr = await qrcode.toDataURL(secret.otpauth_url!);
    res.json({
      message: "MFA enabled. Scan QR with Google Authenticator.",
      qr,
      secret: secret.base32,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to enable MFA.", error: err });
  }
});

// Verify MFA (TOTP)
router.post("/verify-mfa", async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res
      .status(400)
      .json({ message: "Email and TOTP code are required." });
  }
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });
    if (!user || !user.mfaSecret) {
      return res.status(404).json({ message: "User or MFA not found." });
    }
    console.log("Verifying TOTP", { secret: user.mfaSecret, token });
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token,
    });
    if (!verified) {
      return res.status(401).json({ message: "Invalid TOTP code." });
    }
    res.json({ message: "MFA verified. Login successful." });
  } catch (err) {
    res.status(500).json({ message: "MFA verification failed.", error: err });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users.", error: err });
  }
});

// Get logged-in user
router.get("/me", (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  res.json({ user: req.user });
});

// Logout all users (current session)
router.post("/logout-all", (req, res) => {
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
