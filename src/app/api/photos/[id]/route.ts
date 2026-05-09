import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { softDeletePhoto } from "@/lib/storage/photos";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  try {
    await softDeletePhoto(params.id, session);

    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      mill_id: session.mill_id,
      user_id: session.user_id,
      entity_type: "photo",
      entity_id: params.id,
      action: "delete",
      diff: null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "Photo not found") return NextResponse.json({ error_key: "errors.notFound" }, { status: 404 });
    if (msg === "Forbidden" || msg === "Photo already deleted") return NextResponse.json({ error_key: "errors.forbidden" }, { status: 403 });
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
