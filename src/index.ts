import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();
import { User } from "./entity/User";
import authRouter from "./routes/auth";
import session from "express-session";
import passport from "passport";

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

app.use(
  session({
    secret: "your_secret_key", // use a strong secret in production!
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
  // You can customize what is stored in the session here
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  // You can fetch user details from DB here if needed
  done(null, obj);
});

app.get("/", (req, res) => {
  res.send("Hello World from Express + TypeScript + TypeORM!");
});

app.use("/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
