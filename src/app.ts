import express from "express";
import session from "express-session";
import passport from "passport";
import { configurePassport } from "@auth/passport.config";
import { registerPassportStrategies } from "@auth/strategies";
import routes from "@config/routes";
import logger from "@shared/utils/logger";
import { errorHandler } from "@shared/middleware/error.middleware";
import { generalLimiter } from "@shared/middleware/rateLimiters.middleware";

const app = express();

app.use(express.json());
app.use(generalLimiter);
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

// Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url });
  next();
});

//api checkup
app.get("/", (req, res) => {
  res.send("Hello World from Express + TypeScript + TypeORM!");
});

// Example: protect all /api/v1 routes with auth and validation middleware
app.use("/api/v1", routes);

// Global error handler
app.use(errorHandler);

export default app;
