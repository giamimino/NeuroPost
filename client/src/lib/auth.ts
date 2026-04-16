"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "./db";
import { JWTUserPaylaod } from "@/types/global";
import { ERRORS } from "@/constants/error-handling";
import { JWTUserPayloadSchema } from "@/schemas/auth/auth.schema";
import { openAsBlob } from "fs";

export async function auth({
  userId,
  bio,
}: {
  userId?: boolean;
  bio?: boolean;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;

  if (!accessToken) return;
  let payload;
  try {
    payload = jwt.verify(
      accessToken,
      process.env.ACCESS_SECRET!,
    ) as JWTUserPaylaod;
  } catch {
    return { ok: false, status: 401 };
  }

  if (userId) return { userId: payload.userId };

  const rawSql = `SELECT email, name, username, profile_url ${bio ? ", bio" : ""}, status FROM users id WHERE id = $1`;
  const user = await sql.query(rawSql, [payload.userId]);

  return { payload, user: user[0] };
}

export async function getAuthUser() {
  const cookieStore = await cookies();

  const access_token = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;

  if (!access_token) {
    return { error: ERRORS.TOKEN_MISSING };
  }

  try {
    const payload = jwt.verify(
      access_token,
      process.env.ACCESS_SECRET!,
    ) as JWTUserPaylaod;

    const parsedPayload = JWTUserPayloadSchema.parse(payload)
    
    return {
      user: parsedPayload,
      ...(parsedPayload.status === "inactive" || !parsedPayload.status
        ? { status: "inactive" }
        : {}),
    };
  } catch {
    return { error: ERRORS.TOKEN_INVALID };
  }
}
