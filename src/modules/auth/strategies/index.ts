import passport from "passport";
import { googleStrategy } from "./google/googleStrategy";

export function registerPassportStrategies() {
  passport.use(googleStrategy);
  // Add more strategies here as needed
}
