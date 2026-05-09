import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSignedViewUrl } from "@/lib/storage/photos";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  try {
    const admin = createAdminClient();
    const { data: photo, error } = await admin
      .from("photos")
      .select("mill_id, storage_path, deleted_at")
      .eq("id", params.id)
      .single();

    if (error || !photo) return NextResponse.json({ error_key: "errors.notFound" }, { status: 404 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((photo as any).mill_id !== session.mill_id) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 403 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((photo as any).deleted_at) return NextResponse.json({ error_key: "errors.notFound" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const view_url = await getSignedViewUrl((photo as any).storage_path);
    return NextResponse.json({ view_url });
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
