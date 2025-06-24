import { AppDataSource } from "@config/database";
import { User } from "@users/user.entity";
import bcrypt from "bcryptjs";
import { addDays } from "@shared/common/helpers/dateHelper";

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
    const users = await userRepo.find({
      select: ["id", "email", "phone", "mfaEnabled", "createdAt", "updatedAt"],
    });
    // Example: Add a trialExpiry date 30 days after creation for each user
    return users.map((user) => ({
      ...user,
      trialExpiry: addDays(user.createdAt, 30),
    }));
  }
}
