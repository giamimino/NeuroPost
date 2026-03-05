import jwt from "jsonwebtoken";

export function createAccessToken(userId: string, username: string) {
  return jwt.sign({ userId, username }, process.env.ACCESS_SECRET!, {
    expiresIn: "15m",
  });
}

export function createRefreshToken(userId: string, username: string) {
  return jwt.sign({ userId, username }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });
}
