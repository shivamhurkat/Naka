import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSignedUploadUrl } from "@/lib/storage/photos";
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

  const { entity_type, entity_id, slot, mime_type } = body as Record<string, string>;
  if (!entity_type || !entity_id || !slot || !mime_type) {
    return NextResponse.json({ error_key: "errors.invalidInput" }, { status: 400 });
  }

  try {
    const result = await getSignedUploadUrl({
      mill_id: session.mill_id,
      entity_type: entity_type as PhotoEntityType,
      entity_id,
      slot: slot as PhotoSlot,
      mime_type,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
