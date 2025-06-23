import { AppDataSource } from "../index";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";

export class UserService {
  static async register(email: string, password: string) {
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOneBy({ email });
    if (existing) {
      throw new Error("Email already registered.");
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo.create({ email, password: hashed });
    await userRepo.save(user);
    return user;
  }

  static async validateUser(email: string, password: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });
    if (!user || !user.password) {
      return null;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return null;
    }
    return user;
  }

  static async getAllUsers() {
    const userRepo = AppDataSource.getRepository(User);
    return userRepo.find({
      select: ["id", "email", "phone", "mfaEnabled", "createdAt", "updatedAt"],
    });
  }
}
