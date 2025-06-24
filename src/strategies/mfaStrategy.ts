import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { AppDataSource } from "../index";
import { User } from "../entity/User";

export async function enableMfa(email: string) {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email });
  if (!user) {
    return { success: false, message: "User not found." };
  }
  const secret = speakeasy.generateSecret({ name: `ExpressTS (${email})` });
  user.mfaSecret = secret.base32;
  await userRepo.save(user);
  const qr = await qrcode.toDataURL(secret.otpauth_url!);
  return {
    success: true,
    message: "MFA enabled. Scan QR with Google Authenticator.",
    qr,
    secret: secret.base32,
  };
}

export async function verifyMfa(email: string, token: string) {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email });
  if (!user || !user.mfaSecret) {
    return { success: false, message: "User or MFA not found." };
  }
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token,
  });
  if (!verified) {
    return { success: false, message: "Invalid TOTP code." };
  }
  return { success: true, message: "MFA verified. Login successful." };
}
