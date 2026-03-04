import { ERRORS } from "@/constants/error-handling";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId } = body;

    if(!requestId) return NextResponse.json({ ok: false, error: ERRORS.GENERIC_ERROR }, { status: 400})

    const { searchParams } = new URL(req.url)
    const { withNotif } = Object.fromEntries(searchParams.entries())

    const cookieStore = await cookies();
    const access_token = cookieStore.get(
      process.env.ACCESS_COOKIE_NAME!,
    )?.value;
    if (!access_token)
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_MISSING },
        { status: 404 },
      );
    
    let payload
    try {
      payload = jwt.verify(access_token, process.env.ACCESS_SECRET!) as JWTUserPaylaod
    } catch (error) {
      console.error(error);
      return NextResponse.json({ ok: false, error: ERRORS.TOKEN_INVALID }, { status: 401 })
    }

    const friend_requests = await sql.query(`SELECT * FROM friend_request WHERE id = $1`, [requestId])
    const friend_request = friend_requests[0]

    if(!friend_request) return NextResponse.json({ ok: false, error: ERRORS.GENERIC_ERROR }, { status: 404 });

    if(friend_request.receiver_id !== payload.userId) return NextResponse.json({ ok: false, error: ERRORS.NOT_ALLOWED }, { status: 403 });

    if(Boolean(withNotif) === true) {
      // notif friend request request there
    } else {
      await sql.query(`DELETE FROM friend_request WHERE id = $1`, [requestId])
    }
    

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
