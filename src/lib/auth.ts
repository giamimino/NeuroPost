"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "./db";
import { JWTUserPaylaod } from "@/types/global";

export async function auth({
  userId,
  bio,
}: {
  userId?: boolean;
  bio?: boolean;
}) {
  const start = new Date();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;

  if (!accessToken) return;
  let payload;
  try {
    payload = jwt.verify(
      accessToken,
      process.env.ACCESS_SECRET!,
    ) as JWTUserPaylaod;
  } catch (error) {
    console.error(error);
    return { ok: false, status: 401 };
  }

  if (userId) return { userId: payload.userId };

  const rawSql = `SELECT email, name, username ${bio ? ", bio" : ""} FROM users id WHERE id = $1`;
  const user = await sql.query(rawSql, [payload.userId]);

  const end = new Date();
  console.log(`GET auth 200 in ${end.getTime() - start.getTime()}ms`);

  return { payload, user: user[0] };
}
