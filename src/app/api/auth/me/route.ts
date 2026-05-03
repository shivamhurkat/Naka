import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json({
    user_id: session.user_id,
    mill_id: session.mill_id,
    mill_name: session.mill_name,
    role: session.role,
    name: session.name,
  });
}
