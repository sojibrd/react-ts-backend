import passport from "passport";
import { AppDataSource } from "@config/database";
import { User } from "@users/user.entity";

export function configurePassport() {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ id });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
