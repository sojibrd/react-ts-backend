import { Router } from "express";
import { AppDataSource } from "../index";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";

const router = Router();

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
    if (!user) {
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

export default router;
