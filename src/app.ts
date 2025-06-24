import express from "express";
import session from "express-session";
import passport from "passport";
import { configurePassport } from "./config/passport.config";
import { registerPassportStrategies } from "./modules/auth/strategies";
import routes from "./config/routes";

const app = express();

app.use(express.json());
app.use(
  session({
    secret: "IsAwesome",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

configurePassport();
registerPassportStrategies();

//api checkup
app.get("/", (req, res) => {
  res.send("Hello World from Express + TypeScript + TypeORM!");
});

app.use("/api/v1", routes);

export default app;
