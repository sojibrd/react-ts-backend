import { DataSource } from "typeorm";
import { User } from "@users/user.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "express_ts",
  synchronize: true, // Set to false in production
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});

export const connectDatabase = async () => {
  await AppDataSource.initialize();
};
