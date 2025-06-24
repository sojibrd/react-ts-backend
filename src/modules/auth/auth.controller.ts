import { Request, Response } from "express";
import { UserService } from "@users/user.service";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await UserService.register(email, password);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await UserService.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Establish session
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Session error", error: err });
        }
        res.status(200).json({ message: "Login successful", user });
      });
    } catch (error) {
      res.status(401).json({ message: (error as Error).message });
    }
  }
}
