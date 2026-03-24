import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { NOTIFICATIONS_TEXT } from "@/constants/notifications";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receiverId }: { receiverId: string } = body;
    const { searchParams } = new URL(req.url);
    const { withNotif } = Object.fromEntries(searchParams.entries());

    if (!receiverId)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    const checkReceiver = await sql.query(
      "SELECT id, username FROM users WHERE id = $1",
      [receiverId],
    );

    if (checkReceiver.length === 0)
      return NextResponse.json(
        { ok: false, error: ERRORS.USER_NOT_FOUND },
        { status: 404 },
      );

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    if (auth.status === "inactive")
      return NextResponse.json(
        { ok: false, error: ERRORS.ACCOUNT_INACTIVE },
        { status: 423 },
      );
    const payload = auth.user;

    if (payload.userId === receiverId)
      return NextResponse.json(
        { ok: false, error: ERRORS.YOURSELF_FRIEND_REQUEST_ERROR },
        { status: 400 },
      );

    const friend_requests = await sql.query(
      "INSERT INTO friend_request (requester_id, receiver_id) VALUES ($1, $2) RETURNING *",
      [payload.userId, receiverId],
    );
    const friend_request = friend_requests[0];
    if (!friend_request)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 520 },
      );

    if (Boolean(withNotif) == true) {
      const title = NOTIFICATIONS_TEXT.FRIEND_REQUEST.title;
      const description = `${checkReceiver[0].username} ${NOTIFICATIONS_TEXT.FRIEND_REQUEST.description}`;
      const body = {
        description,
        requester_id: friend_request.requester_id,
        request_id: friend_request.id,
        sentAt: friend_request.created_at,
      };
      const type = "FRIEND_REQUEST";

      await sql.query(
        "INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4)",
        [receiverId, type, title, body],
      );
    }

    return NextResponse.json(
      { ok: true, friend_request: friend_requests[0] },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { requestId } = body;

    if (!requestId)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    if (auth.status === "inactive")
      return NextResponse.json(
        { ok: false, error: ERRORS.ACCOUNT_INACTIVE },
        { status: 423 },
      );
    const payload = auth.user;

    const friend_requests = await sql.query(
      `SELECT * FROM friend_request WHERE id = $1`,
      [requestId],
    );
    const friend_request = friend_requests[0];

    if (!friend_request)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 404 },
      );

    if (friend_request.requester_id !== payload.userId)
      return NextResponse.json(
        { ok: false, error: ERRORS.NOT_ALLOWED },
        { status: 403 },
      );

    await sql.query(`DELETE FROM friend_request WHERE id = $1`, [requestId]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit } = Object.fromEntries(searchParams.entries());

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    if (auth.status === "inactive")
      return NextResponse.json(
        { ok: false, error: ERRORS.ACCOUNT_INACTIVE },
        { status: 423 },
      );
    const payload = auth.user;

    const friend_requests = await sql.query(
      `SELECT fr.id, fr.status, fr.created_at,  
      json_build_object('profile_url', u.profile_url, 'name', u.name, 'username', u.username) AS user
      FROM friend_request fr
      JOIN users u ON u.id = fr.requester_id
      WHERE fr.receiver_id = $1 LIMIT $2`,
      [payload.userId, Number(limit) || 20],
    );

    const keys = friend_requests.map((fr) => fr.user.profile_url || "");
    const signedUrls = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: "neuropost",
          Key: key,
        });

        return getSignedUrl(s3, command, { expiresIn: 5 * 60 });
      }),
    );

    const signedFriend_requests = friend_requests.map((fr, i) => ({
      ...fr,
      user: {
        ...fr.user,
        profile_url: fr.user.profile_url ? signedUrls[i] : "/user.jpg",
      },
    }));

    return NextResponse.json(
      { ok: true, friend_requests: signedFriend_requests },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
