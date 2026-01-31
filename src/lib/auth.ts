"use server"
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "./db";
import { JWTUserPaylaod } from "@/types/global";

export async function auth() {
  const start = new Date()
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;

  if (!accessToken) return;

  const payload = jwt.verify(accessToken, process.env.ACCESS_SECRET!) as JWTUserPaylaod

  if(!payload) return 

  const rawSql = `SELECT email, name, username FROM users id WHERE id = $1`;
  const user = await sql.query(rawSql, [payload.userId])

  const end = new Date()
  console.log(`GET auth 200 in ${end.getTime() - start.getTime()}ms`);
  
  return {payload, user: user[0]}
}
