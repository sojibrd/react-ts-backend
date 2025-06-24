import passportGoogle, { Profile } from "passport-google-oauth20";
import passport from "passport";

const GoogleStrategy = passportGoogle.Strategy;

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET",
    callbackURL:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:3000/auth/oauth/google/callback",
  },
  async (accessToken, refreshToken, profile: Profile, done) => {
    // Here you would find or create a user in your DB
    // For now, just pass the profile
    return done(null, profile);
  }
);
