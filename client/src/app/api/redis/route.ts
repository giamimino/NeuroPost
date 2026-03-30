import client from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // await client.set("foo", "bar");
    const foo = await client.get("foo");
    return NextResponse.json({ ok: true, foo }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
