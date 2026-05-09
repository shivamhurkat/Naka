import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  const db = getDb(session);
  const { data, error } = await db
    .from("items")
    .select("id, name, kind, unit")
    .eq("mill_id", session.mill_id)
    .eq("is_active", true)
    .eq("kind", "raw_material")
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  return NextResponse.json(data ?? []);
}
