import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    if (
      req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    await sql.query(
      `DELETE FROM notifications WHERE 
        (NOW() > created_at + INTERVAL '30 days' AND isread = true) OR 
        (NOW() > created_at + INTERVAL '60 days' AND isread = false)`,
    );

    await sql.query(
      `INSERT INTO cron_logs (job_name, status) VALUES ($1, $2)`,
      ["cleanup_notifications", "success"],
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);

    await sql.query(
      `INSERT INTO cron_logs (job_name, status, error) VALUES ($1, $2, $3)`,
      ["cleanup_notifications", "failed", JSON.stringify(err)],
    );

    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
