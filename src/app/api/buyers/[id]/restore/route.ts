import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { restoreBuyer } from "@/lib/data/buyers";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  if (session.role === "munim") {
    return NextResponse.json({ error_key: "errors.forbidden" }, { status: 403 });
  }

  try {
    await restoreBuyer(session, params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
