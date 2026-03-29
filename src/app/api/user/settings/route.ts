import { ERRORS } from "@/constants/error-handling";
import { SETTINGS_KEYS } from "@/constants/settings-keys";
import { getAuthUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { UserSettingsType } from "@/types/enums";
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
          : Object.values(
              Object.values(SETTINGS_KEYS).reduce(
                (acc, obj) => ({ ...acc, ...obj }),
                {},
              ),
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value, type } = body as {
      key: string;
      value: string | boolean | object;
      type: UserSettingsType;
    };

    if (!key || !value || !type)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    const GENERIC_SETTINGS_KEYS = Object.keys(
      Object.values(SETTINGS_KEYS).reduce(
        (acc, obj) => ({ ...acc, ...obj }),
        {},
      ),
    );

    if (!GENERIC_SETTINGS_KEYS.includes(key.toUpperCase()))
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

    const settings = Object.values(SETTINGS_KEYS).reduce(
      (acc, obj) => ({ ...acc, ...obj }),
      {},
    ) as any;

    const existingSettings = await sql.query(
      `SELECT id FROM user_settings WHERE user_id = $1 AND key = $2`,
      [payload.userId, settings[key.toUpperCase()]],
    );
    const existingSetting = existingSettings[0];

    let setting;

    if (existingSetting) {
      setting = await sql.query(
        `UPDATE user_settings SET value = $1 WHERE id = $2 RETURNING id, key, value, type`,
        [value, existingSetting.id],
      );
    } else {
      setting = await sql.query(
        `INSERT INTO user_settings (key, value, type, user_id) VALUES ($1, $2, $3, $4) RETURNING id, key, value, type`,
        [settings[key.toUpperCase()], value, type, payload.userId],
      );
    }

    return NextResponse.json(
      { ok: true, setting: setting[0] },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
