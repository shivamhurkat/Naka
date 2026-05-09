/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getInboundLot, updateInboundLot, softDeleteInboundLot } from "@/lib/data/inbound-lots";
import { InboundLotSchema } from "@/lib/validation/inbound-lot";
import { NotFoundError, ForbiddenError, DuplicateError } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  try {
    const lot = await getInboundLot(session, params.id);
    return NextResponse.json(lot);
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error_key: "lots.notFound" }, { status: 404 });
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error_key: "errors.invalidInput" }, { status: 400 });
  }

  const parsed = InboundLotSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error_key: "errors.invalidInput", fields: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const lot = await updateInboundLot(session, params.id, parsed.data);

    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      mill_id: session.mill_id,
      user_id: session.user_id,
      entity_type: "inbound_lot",
      entity_id: lot.id,
      action: "update" as const,
      diff: parsed.data as unknown as null,
    } as any);

    revalidatePath("/lots");
    revalidatePath(`/lots/${params.id}`);
    return NextResponse.json(lot);
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error_key: "lots.notFound" }, { status: 404 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error_key: "lots.munimEditExpired" }, { status: 403 });
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  try {
    await softDeleteInboundLot(session, params.id);

    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      mill_id: session.mill_id,
      user_id: session.user_id,
      entity_type: "inbound_lot",
      entity_id: params.id,
      action: "delete" as const,
      diff: null,
    } as any);

    revalidatePath("/lots");
    revalidatePath("/dashboard");
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ForbiddenError) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 403 });
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
