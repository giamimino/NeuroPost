import { NextResponse } from "next/server";

export async function GET() {
  try {
    await new Promise(resolve => setTimeout(resolve, 10 * 100))
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
