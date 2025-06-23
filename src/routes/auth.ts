import { Router } from "express";
import { AppDataSource } from "../index";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import passport from "passport";
import passportGoogle, { Profile } from "passport-google-oauth20";
import nodemailer from "nodemailer";

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

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  try {
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOneBy({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo.create({ email, password: hashed });
    await userRepo.save(user);
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Registration failed.", error: err });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    res.json({ message: "Login successful." });
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

export default router;
