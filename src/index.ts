import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { connectDatabase } from "./config/database";
import app from "./app";

const PORT = process.env.PORT || 3000;

connectDatabase()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
    process.exit(1);
  });
