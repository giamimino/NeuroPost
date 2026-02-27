import jwt from "jsonwebtoken";

export function createAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.ACCESS_SECRET!, {
    expiresIn: "15m",
  });
}

export function createRefreshToken(userId: string) {
  return jwt.sign({ userId }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });
}
