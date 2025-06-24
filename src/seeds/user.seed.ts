import dotenv from "dotenv";
dotenv.config();
import { AppDataSource } from "@config/database";
import { User } from "@users/user.entity";
import bcrypt from "bcryptjs";

async function seedUsers() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const password = await bcrypt.hash("password123", 10);
  await userRepo.save([
    // { email: "admin@example.com", password, mfaEnabled: false },
    { email: "sojib@example.com", password, mfaEnabled: false },
  ]);
  console.log("Seeded users.");
  await AppDataSource.destroy();
}

seedUsers().catch(console.error);
