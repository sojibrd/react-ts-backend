import rateLimit from "express-rate-limit";

// General rate limiter (e.g., 100 requests per 15 minutes per IP)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Login-specific brute-force protection (e.g., 5 attempts per 10 minutes per IP)
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
