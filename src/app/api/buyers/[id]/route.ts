import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getBuyer, updateBuyer, softDeleteBuyer } from "@/lib/data/buyers";
import { BuyerSchema } from "@/lib/validation/buyer";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  try {
    const buyer = await getBuyer(session, params.id);
    return NextResponse.json(buyer);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error_key: "buyers.notFound" }, { status: 404 });
    }
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  if (session.role === "munim") {
    return NextResponse.json({ error_key: "errors.forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error_key: "errors.invalidInput" }, { status: 400 });
  }

  const parsed = BuyerSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error_key: "errors.invalidInput", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  try {
    const buyer = await updateBuyer(session, params.id, parsed.data);
    return NextResponse.json(buyer);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error_key: "buyers.notFound" }, { status: 404 });
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

  if (session.role === "munim") {
    return NextResponse.json({ error_key: "errors.forbidden" }, { status: 403 });
  }

  try {
    await softDeleteBuyer(session, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error_key: "buyers.notFound" }, { status: 404 });
    }
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
