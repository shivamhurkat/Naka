import { getDb } from "@/lib/db";
import { NotFoundError, DuplicateError, pgConstraintField } from "@/lib/errors";
import type { Session } from "@/lib/auth/session";

export interface Buyer {
  id: string;
  mill_id: string;
  name: string;
  phone: string | null;
  city: string | null;
  gst_number: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListBuyersOptions {
  activeOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListBuyersResult {
  data: Buyer[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listBuyers(
  session: Pick<Session, "mill_id">,
  opts: ListBuyersOptions = {}
): Promise<ListBuyersResult> {
  const { activeOnly = true, search = "", page = 1, pageSize = 20 } = opts;
  const db = getDb(session);

  let query = db.from("buyers").select("*", { count: "exact" }).eq("mill_id", session.mill_id);

  if (activeOnly) {
    query = query.eq("is_active", true);
  }
  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as Buyer[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getBuyer(
  session: Pick<Session, "mill_id">,
  id: string
): Promise<Buyer> {
  const db = getDb(session);
  const { data, error } = await db.from("buyers").select("*").eq("mill_id", session.mill_id).eq("id", id).single();
  if (error || !data) throw new NotFoundError("Buyer not found");
  return data as Buyer;
}

export async function createBuyer(
  session: Pick<Session, "mill_id">,
  payload: {
    name: string;
    phone?: string | null;
    city?: string | null;
    gst_number?: string | null;
    notes?: string | null;
  }
): Promise<Buyer> {
  const db = getDb(session);
  const { data, error } = await db
    .insert("buyers", { ...payload, is_active: true })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new DuplicateError(pgConstraintField(error.message), payload.name ?? "");
    }
    throw error;
  }
  return data as Buyer;
}

export async function updateBuyer(
  session: Pick<Session, "mill_id">,
  id: string,
  payload: {
    name?: string;
    phone?: string | null;
    city?: string | null;
    gst_number?: string | null;
    notes?: string | null;
  }
): Promise<Buyer> {
  const db = getDb(session);
  const { data, error } = await db
    .update("buyers", { ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new DuplicateError(pgConstraintField(error.message), payload.name ?? "");
    }
    throw error;
  }
  if (!data) throw new NotFoundError("Buyer not found");
  return data as Buyer;
}

export async function softDeleteBuyer(
  session: Pick<Session, "mill_id">,
  id: string
): Promise<void> {
  const db = getDb(session);
  const { error } = await db
    .update("buyers", { is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function restoreBuyer(
  session: Pick<Session, "mill_id">,
  id: string
): Promise<void> {
  const db = getDb(session);
  const { error } = await db
    .update("buyers", { is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
