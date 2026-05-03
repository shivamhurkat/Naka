import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/types/database";

export const COOKIE_NAME = "naka_session";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
const JWT_ALG = "HS256";

export interface Session {
  user_id: string;
  mill_id: string;
  mill_name: string;
  role: UserRole;
  name: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment.");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

/** For use in Server Components and Route Handlers. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Redirects to /login if not authenticated. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Redirects to /dashboard if role is not in the allowed list. */
export function requireRole(session: Session, roles: UserRole[]): void {
  if (!roles.includes(session.role)) redirect("/dashboard");
}

/** For use in middleware (has access to NextRequest, not cookies()). */
export async function getSessionFromRequest(
  req: NextRequest
): Promise<Session | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function makeSessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    },
  };
}
