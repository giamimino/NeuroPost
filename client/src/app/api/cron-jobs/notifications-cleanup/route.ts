import { ERRORS } from "@/constants/error-handling";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { ok: false, error: ERRORS.UNAUTHORIZED },
        { status: 401 },
      );
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

    try {
      await sql.query(
        `INSERT INTO cron_logs (job_name, status, error) VALUES ($1, $2, $3)`,
        ["cleanup_notifications", "failed", JSON.stringify(err)],
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          ok: false,
          error: ERRORS.INTERNAL_SERVER_ERROR,
          dev: JSON.stringify(error),
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: ERRORS.INTERNAL_SERVER_ERROR,
        dev: JSON.stringify(err),
      },
      { status: 500 },
    );
  }
}
