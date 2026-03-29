import { ERRORS } from "@/constants/error-handling";
import { SETTINGS_KEYS } from "@/constants/settings-keys";
import { getAuthUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { SettingsKeysCategoryType } from "@/types/settings";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { key, category } = Object.fromEntries(searchParams.entries()) as {
      key?: string;
      category?: SettingsKeysCategoryType;
    };

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

    if (key) {
      if (
        !Object.keys(
          Object.values(SETTINGS_KEYS).reduce(
            (acc, obj) => ({
              ...acc,
              ...obj,
            }),
            {},
          ),
        ).includes(key.toUpperCase())
      )
        return NextResponse.json(
          { ok: false, error: ERRORS.GENERIC_ERROR },
          { status: 400 },
        );

      const settings = await sql.query(
        `SELECT id, key, value, type FROM user_settings WHERE user_id = $1 AND key = $2`,
        [payload.userId, key.toLowerCase()],
      );
      const setting = settings[0];

      return NextResponse.json({ ok: true, setting }, { status: 200 });
    }

    const validCategory = category
      ? Object.keys(SETTINGS_KEYS).includes(category)
      : false;

    const settings = await sql.query(
      `SELECT id, key, value, type FROM user_settings WHERE user_id = $1 AND key = ANY ($2)`,
      [
        payload.userId,
        validCategory
          ? Object.values(SETTINGS_KEYS[category!])
          : Object.values(SETTINGS_KEYS).reduce(
              (acc, obj) => ({ ...acc, ...obj }),
              {},
            ),
      ],
    );

    return NextResponse.json({ ok: true, settings }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
