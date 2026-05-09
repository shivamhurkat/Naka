import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listPhotos, getSignedViewUrl } from "@/lib/storage/photos";
import type { PhotoEntityType } from "@/lib/storage/photos";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const entity_type = searchParams.get("entity_type");
  const entity_id = searchParams.get("entity_id");

  if (!entity_type || !entity_id) {
    return NextResponse.json({ error_key: "errors.invalidInput" }, { status: 400 });
  }

  try {
    const photos = await listPhotos({
      entity_type: entity_type as PhotoEntityType,
      entity_id,
    });

    // Include signed view URLs in response (max 4 photos, so this is fast)
    const photosWithUrls = await Promise.all(
      photos.map(async (p) => {
        try {
          const view_url = await getSignedViewUrl(p.storage_path);
          return { ...p, view_url };
        } catch {
          return { ...p, view_url: null };
        }
      })
    );

    return NextResponse.json(photosWithUrls);
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
