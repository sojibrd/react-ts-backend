import { AppDataSource } from "@config/database";
import { User } from "@users/user.entity";
import nodemailer from "nodemailer";

function normalizeEmail(email?: string) {
  return email ? email.trim().toLowerCase() : undefined;
}

export async function generateAndSendOtp({
  phone,
  email,
}: {
  phone?: string;
  email?: string;
}) {
  const userRepo = AppDataSource.getRepository(User);
  const normEmail = normalizeEmail(email);
  let user: User | null = null;
  if (phone && normEmail) {
    user = await userRepo.findOneBy({ phone, email: normEmail });
  } else if (phone) {
    user = await userRepo.findOneBy({ phone });
  } else if (normEmail) {
    user = await userRepo.findOneBy({ email: normEmail });
  }
  if (!user) {
    if (!phone && !normEmail) {
      throw new Error("Phone or email required to create user.");
    }
    user = userRepo.create({ phone, email: normEmail });
  }
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  await userRepo.save(user);
  // Send OTP via Gmail SMTP if email is provided
  if (normEmail) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: normEmail,
      subject: "Your OTP Code",
      text: `Your OTP for login is: ${otp}`,
    });
    return { message: "OTP sent to email." };
  } else {
    // Placeholder: send OTP via SMS provider
    console.log(`OTP for ${phone}: ${otp}`);
    return { message: "OTP sent (check console in dev mode)." };
  }
}

export async function verifyOtp({
  phone,
  email,
  otp,
}: {
  phone?: string;
  email?: string;
  otp: string;
}) {
  const userRepo = AppDataSource.getRepository(User);
  const normEmail = normalizeEmail(email);
  let user: User | null = null;
  if (phone && normEmail) {
    user = await userRepo.findOneBy({ phone, email: normEmail });
  } else if (phone) {
    user = await userRepo.findOneBy({ phone });
  } else if (normEmail) {
    user = await userRepo.findOneBy({ email: normEmail });
  }
  console.log(`Verifying OTP for user: ${user ? user.id : "not found"}`);
  console.log(`Provided OTP: ${otp}, User OTP: ${user ? user.otp : "none"}`);

  if (!user || user.otp !== otp) {
    return { valid: false, message: "Invalid OTP or user." };
  }
  // OTP verified, clear OTP
  user.otp = undefined;
  await userRepo.save(user);
  return { valid: true, message: "OTP verified. Login successful." };
}
