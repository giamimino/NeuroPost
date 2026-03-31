import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()


export function verifyToken(token: string) {
  return jwt.verify(token, process.env.ACCESS_SECRET!)
}