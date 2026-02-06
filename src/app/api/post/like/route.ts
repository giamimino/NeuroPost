import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, postId }: { userId: string; postId: number } =
      await req.json();

    const rawSQL = `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)`;
    await sql.query(rawSQL, [userId, postId]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id }: { id: string } = await req.json();

    const rawSQL = `DELETE FROM likes WHERE id = $1`;
    await sql.query(rawSQL, [id]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong." },
      { status: 500 },
    );
  }
}
