/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDb } from "@/lib/db";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import type { Session } from "@/lib/auth/session";
import type { InboundLotInput } from "@/lib/validation/inbound-lot";

export interface LotSupplierName {
  id: string;
  name: string;
}

export interface LotItemName {
  id: string;
  name: string;
}

export interface InboundLotRow {
  id: string;
  mill_id: string;
  lot_number: string;
  supplier_id: string;
  item_id: string;
  vehicle_number: string | null;
  gross_weight_qtl: number;
  tare_weight_qtl: number;
  net_weight_qtl: number;
  moisture_pct: number | null;
  rate_per_qtl: number;
  total_amount: number;
  deduction_amount: number;
  payable_amount: number;
  received_at: string;
  notes: string | null;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InboundLotWithRefs extends InboundLotRow {
  supplier_name: string;
  item_name: string;
}

export interface ListLotsOptions {
  query?: string;
  supplier_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
}

export interface ListLotsResult {
  data: InboundLotWithRefs[];
  total: number;
  page: number;
  pageSize: number;
}

function isWithin24h(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

export async function listInboundLots(
  session: Pick<Session, "mill_id">,
  opts: ListLotsOptions = {}
): Promise<ListLotsResult> {
  const { query = "", supplier_id, date_from, date_to, page = 1, pageSize = 30 } = opts;
  const db = getDb(session);

  let q = db
    .from("inbound_lots")
    .select(
      "id, mill_id, lot_number, supplier_id, item_id, vehicle_number, gross_weight_qtl, tare_weight_qtl, net_weight_qtl, moisture_pct, rate_per_qtl, total_amount, deduction_amount, payable_amount, received_at, notes, created_by, deleted_at, created_at, updated_at, suppliers!inbound_lots_supplier_id_fkey(name), items!inbound_lots_item_id_fkey(name)",
      { count: "exact" }
    )
    .eq("mill_id", session.mill_id)
    .is("deleted_at", null);

  if (query.trim()) {
    q = q.or(
      `lot_number.ilike.%${query.trim()}%,vehicle_number.ilike.%${query.trim()}%`
    );
  }
  if (supplier_id) {
    q = q.eq("supplier_id", supplier_id);
  }
  if (date_from) {
    q = q.gte("received_at", date_from);
  }
  if (date_to) {
    q = q.lte("received_at", date_to);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await q
    .order("received_at", { ascending: false })
    .order("lot_number", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const rows = (data ?? []).map((r: any) => ({
    ...r,
    supplier_name: r.suppliers?.name ?? "",
    item_name: r.items?.name ?? "",
  })) as InboundLotWithRefs[];

  return { data: rows, total: count ?? 0, page, pageSize };
}

export async function getInboundLot(
  session: Pick<Session, "mill_id">,
  id: string
): Promise<InboundLotWithRefs> {
  const db = getDb(session);
  const { data, error } = await db
    .from("inbound_lots")
    .select(
      "*, suppliers!inbound_lots_supplier_id_fkey(name), items!inbound_lots_item_id_fkey(name)"
    )
    .eq("mill_id", session.mill_id)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !data) throw new NotFoundError("Lot not found");

  return {
    ...(data as any),
    supplier_name: (data as any).suppliers?.name ?? "",
    item_name: (data as any).items?.name ?? "",
  } as InboundLotWithRefs;
}

export async function createInboundLot(
  session: Pick<Session, "mill_id" | "user_id">,
  payload: InboundLotInput
): Promise<InboundLotRow> {
  const db = getDb(session);
  const { data, error } = await db
    .insert("inbound_lots", {
      ...payload,
      created_by: session.user_id,
      received_at: payload.received_at ?? new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as InboundLotRow;
}

export async function updateInboundLot(
  session: Pick<Session, "mill_id" | "user_id" | "role">,
  id: string,
  payload: Partial<InboundLotInput>
): Promise<InboundLotRow> {
  const db = getDb(session);

  // Fetch existing to check ownership/time
  const { data: existing, error: fetchErr } = await db
    .from("inbound_lots")
    .select("created_by, created_at")
    .eq("mill_id", session.mill_id)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (fetchErr || !existing) throw new NotFoundError("Lot not found");

  if (session.role === "munim") {
    const isCreator = (existing as any).created_by === session.user_id;
    const inWindow = isWithin24h((existing as any).created_at);
    if (!isCreator || !inWindow) throw new ForbiddenError("lots.munimEditExpired");
  }

  const { data, error } = await db
    .update("inbound_lots", { ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) throw new NotFoundError("Lot not found");
  return data as InboundLotRow;
}

export async function softDeleteInboundLot(
  session: Pick<Session, "mill_id" | "role">,
  id: string
): Promise<void> {
  if (session.role !== "owner") throw new ForbiddenError();
  const db = getDb(session);
  const { error } = await db
    .update("inbound_lots", { deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
