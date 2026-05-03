import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPin } from "@/lib/auth/pin";
import { signSession, makeSessionCookie } from "@/lib/auth/session";
import {
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
} from "@/lib/auth/rate-limit";

const LoginSchema = z.object({
  mill_code: z.string().min(1).max(10).transform((v) => v.toUpperCase()),
  phone: z.string().regex(/^\d{10}$/),
  pin: z.string().regex(/^\d{4}$/),
});

// Generic error key — relative to 'auth' namespace in translations.
// Never reveal whether mill, phone, or PIN was wrong.
const AUTH_ERR = "errors.loginInvalid";
const LOCALE_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error_key: "errors.invalidInput" },
      { status: 400 }
    );
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error_key: "errors.invalidInput" },
      { status: 400 }
    );
  }

  const { mill_code, phone, pin } = parsed.data;
  const rlKey = `${mill_code}:${phone}`;

  if (isRateLimited(rlKey)) {
    return NextResponse.json(
      { error_key: "errors.rateLimited" },
      { status: 429 }
    );
  }

  const supabase = createAdminClient();

  const { data: mill } = await supabase
    .from("mills")
    .select("id, name")
    .eq("code", mill_code)
    .single();

  if (!mill) {
    recordFailedAttempt(rlKey);
    return NextResponse.json({ error_key: AUTH_ERR }, { status: 401 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, name, phone, pin_hash, role, is_active, locale")
    .eq("mill_id", mill.id)
    .eq("phone", phone)
    .eq("is_active", true)
    .single();

  if (!user) {
    recordFailedAttempt(rlKey);
    return NextResponse.json({ error_key: AUTH_ERR }, { status: 401 });
  }

  const pinValid = await verifyPin(pin, user.pin_hash);
  if (!pinValid) {
    recordFailedAttempt(rlKey);
    return NextResponse.json({ error_key: AUTH_ERR }, { status: 401 });
  }

  clearAttempts(rlKey);

  const token = await signSession({
    user_id: user.id,
    mill_id: mill.id,
    mill_name: mill.name,
    role: user.role,
    name: user.name,
  });

  void Promise.all([
    supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id),
    supabase.from("audit_log").insert({
      mill_id: mill.id,
      user_id: user.id,
      entity_type: "session",
      entity_id: user.id,
      action: "create",
    }),
  ]);

  const sessionCookie = makeSessionCookie(token);
  const userLocale: string = (user as { locale?: string }).locale ?? "hi";

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role, phone: user.phone },
    mill: { id: mill.id, name: mill.name },
  });

  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

  // Restore user's saved locale preference immediately on login
  response.cookies.set("naka_locale", userLocale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}
