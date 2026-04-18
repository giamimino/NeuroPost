import { UserStatusType } from "@/types/enums";
import jwt from "jsonwebtoken";

export function createAccessToken(
  userId: string,
  username: string,
  status: UserStatusType,
) {
  return jwt.sign({ userId, username, status }, process.env.ACCESS_SECRET!, {
    expiresIn: "15m",
  });
}

export function createRefreshToken(
  userId: string,
  username: string,
  status: UserStatusType,
) {
  return jwt.sign({ userId, username, status }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });
}

export function createEmailVerifyToken({ id }: { id: string }) {
  return jwt.sign({ id }, process.env.EMAIL_VERIFY_SECRET!, {
    expiresIn: "15m",
  });
}

export function createPasswordResetToken({ userId, username }: { userId: string, username: string }) {
  return jwt.sign({ userId, username }, process.env.PASSWORD_RESET_SECRET!, {
    expiresIn: "15m"
  })
}