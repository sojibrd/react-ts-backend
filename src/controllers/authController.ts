import { Request, Response } from "express";
import { UserService } from "../services/userService";

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
      res.status(200).json(user);
    } catch (error) {
      res.status(401).json({ message: (error as Error).message });
    }
  }
}
