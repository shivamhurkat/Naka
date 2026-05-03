import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const LocaleSchema = z.object({
  locale: z.enum(["hi", "en"]),
});

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = LocaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locale." }, { status: 400 });
  }

  const { locale } = parsed.data;

  const response = NextResponse.json({ success: true });
  response.cookies.set("naka_locale", locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false, // readable by JS for LocaleSwitcher
  });

  // Persist to DB for authenticated users
  const session = await getSession();
  if (session) {
    const supabase = createAdminClient();
    await supabase
      .from("users")
      .update({ locale })
      .eq("id", session.user_id);
  }

  return response;
}
