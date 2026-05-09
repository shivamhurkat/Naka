import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listSuppliers, createSupplier } from "@/lib/data/suppliers";
import { SupplierSchema } from "@/lib/validation/supplier";
import { ForbiddenError, DuplicateError } from "@/lib/errors";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("activeOnly") !== "false";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));

  try {
    const result = await listSuppliers(session, { activeOnly, search, page, pageSize });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  if (session.role === "munim") {
    throw new ForbiddenError();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error_key: "errors.invalidInput" }, { status: 400 });
  }

  const parsed = SupplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error_key: "errors.invalidInput", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  try {
    const supplier = await createSupplier(session, parsed.data);
    return NextResponse.json(supplier, { status: 201 });
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
