import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listBuyers, createBuyer } from "@/lib/data/buyers";
import { BuyerSchema } from "@/lib/validation/buyer";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error_key: "errors.forbidden" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("activeOnly") !== "false";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));

  try {
    const result = await listBuyers(session, { activeOnly, search, page, pageSize });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

  const parsed = BuyerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error_key: "errors.invalidInput", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  try {
    const buyer = await createBuyer(session, parsed.data);
    return NextResponse.json(buyer, { status: 201 });
  } catch {
    return NextResponse.json({ error_key: "errors.serverError" }, { status: 500 });
  }
}
