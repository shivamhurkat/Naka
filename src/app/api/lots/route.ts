/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { listInboundLots, createInboundLot } from "@/lib/data/inbound-lots";
import { InboundLotSchema } from "@/lib/validation/inbound-lot";
import { DuplicateError } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const supplier_id = searchParams.get("supplier_id") ?? undefined;
  const date_from = searchParams.get("date_from") ?? undefined;
  const date_to = searchParams.get("date_to") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "30", 10)));

  try {
    const result = await listInboundLots(session, { query, supplier_id, date_from, date_to, page, pageSize });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error_key: "errors.invalidInput" }, { status: 400 });
  }

  const parsed = InboundLotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error_key: "errors.invalidInput", fields: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const lot = await createInboundLot(session, parsed.data);

    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      mill_id: session.mill_id,
      user_id: session.user_id,
      entity_type: "inbound_lot",
      entity_id: lot.id,
      action: "create" as const,
      diff: parsed.data as unknown as null,
    } as any);

    revalidatePath("/lots");
    revalidatePath("/dashboard");
    return NextResponse.json(lot, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateError) {
      return NextResponse.json({
        error: "duplicate",
        field: err.field,
        value: err.value,
        messageKey: `errors.duplicate.${err.field}`,
      }, { status: 409 });
    }
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
