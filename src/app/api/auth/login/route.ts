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
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
});

// Generic error — never reveal whether mill, phone, or PIN was wrong.
const AUTH_ERROR = "Login galat hai. Dobara try karein.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { mill_code, phone, pin } = parsed.data;
  const rlKey = `${mill_code}:${phone}`;

  if (isRateLimited(rlKey)) {
    return NextResponse.json(
      { error: "Zyada galat try. 15 min baad try karein." },
      { status: 429 }
    );
  }

  const supabase = createAdminClient();

  // Look up mill by code
  const { data: mill } = await supabase
    .from("mills")
    .select("id, name")
    .eq("code", mill_code)
    .single();

  if (!mill) {
    recordFailedAttempt(rlKey);
    return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });
  }

  // Look up user by (mill_id, phone) — active only
  const { data: user } = await supabase
    .from("users")
    .select("id, name, phone, pin_hash, role, is_active")
    .eq("mill_id", mill.id)
    .eq("phone", phone)
    .eq("is_active", true)
    .single();

  if (!user) {
    recordFailedAttempt(rlKey);
    return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });
  }

  const pinValid = await verifyPin(pin, user.pin_hash);

  if (!pinValid) {
    recordFailedAttempt(rlKey);
    return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });
  }

  // Success — clear rate limit
  clearAttempts(rlKey);

  // Sign JWT
  const token = await signSession({
    user_id: user.id,
    mill_id: mill.id,
    mill_name: mill.name,
    role: user.role,
    name: user.name,
  });

  // Audit + last_login_at (fire-and-forget — don't block the response)
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

  const cookie = makeSessionCookie(token);
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role, phone: user.phone },
    mill: { id: mill.id, name: mill.name },
  });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
