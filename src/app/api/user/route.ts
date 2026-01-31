import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await auth();

    if (!user) return NextResponse.json({ ok: false }, {status: 401});

    return NextResponse.json({ user, ok: true }, { status: 200})
  } catch (err) {
    return NextResponse.json({ ok:false }, {status: 500})
  }
}
