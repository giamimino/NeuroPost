import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { s3 } from "@/lib/aws-sdk";
import { sql } from "@/lib/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";


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

    const pending_friends = await sql.query(
      `SELECT fr.id, fr.status, fr.created_at,  
      json_build_object('profile_url', u.profile_url, 'name', u.name, 'username', u.username) AS user
      FROM friend_request fr
      JOIN users u ON u.id = fr.receiver_id
      WHERE fr.requester_id = $1 LIMIT $2`,
      [payload.userId, Number(limit) || 20],
    );

    const keys = pending_friends.map((fr) => fr.user.profile_url || "");
    const signedUrls = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: "neuropost",
          Key: key,
        });

        return getSignedUrl(s3, command, { expiresIn: 5 * 60 });
      }),
    );

    const signedFriend_requests = pending_friends.map((fr, i) => ({
      ...fr,
      user: {
        ...fr.user,
        profile_url: fr.user.profile_url ? signedUrls[i] : "/user.jpg",
      },
    }));

    return NextResponse.json(
      { ok: true, pending_friends: signedFriend_requests },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}