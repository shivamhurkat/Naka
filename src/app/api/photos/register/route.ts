import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { registerPhoto, getSignedViewUrl } from "@/lib/storage/photos";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PhotoEntityType, PhotoSlot } from "@/lib/storage/photos";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error_key: "errors.invalidInput" }, { status: 400 });
  }

  const { entity_type, entity_id, slot, storage_path, mime_type, file_size_bytes } =
    body as Record<string, string>;

  if (!entity_type || !entity_id || !slot || !storage_path) {
    return NextResponse.json({ error_key: "errors.invalidInput" }, { status: 400 });
  }

  try {
    const photo = await registerPhoto({
      mill_id: session.mill_id,
      entity_type: entity_type as PhotoEntityType,
      entity_id,
      slot: slot as PhotoSlot,
      storage_path,
      mime_type: mime_type ?? "image/jpeg",
      file_size_bytes: parseInt(file_size_bytes ?? "0", 10),
      uploaded_by: session.user_id,
    });

    const view_url = await getSignedViewUrl(photo.storage_path);

    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      mill_id: session.mill_id,
      user_id: session.user_id,
      entity_type,
      entity_id,
      action: "create",
      diff: { slot, storage_path } as unknown as null,
    });

    return NextResponse.json({ photo, view_url }, { status: 201 });
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
