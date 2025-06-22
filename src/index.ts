import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entity/User";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();
app.use(express.json());

// TypeORM DataSource setup
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "express_ts_db",
  synchronize: true, // Set to false in production
  logging: false,
  entities: [User], // Add entity files here
  migrations: [],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

app.get("/", (req, res) => {
  res.send("Hello World from Express + TypeScript + TypeORM!");
});

app.use("/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
