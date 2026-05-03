import { getDb } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { Session } from "@/lib/auth/session";

export interface Supplier {
  id: string;
  mill_id: string;
  name: string;
  phone: string | null;
  village: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListSuppliersOptions {
  activeOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListSuppliersResult {
  data: Supplier[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listSuppliers(
  session: Pick<Session, "mill_id">,
  opts: ListSuppliersOptions = {}
): Promise<ListSuppliersResult> {
  const { activeOnly = true, search = "", page = 1, pageSize = 20 } = opts;
  const db = getDb(session);

  let query = db.from("suppliers").select("*", { count: "exact" });

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
    data: (data ?? []) as Supplier[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getSupplier(
  session: Pick<Session, "mill_id">,
  id: string
): Promise<Supplier> {
  const db = getDb(session);
  const { data, error } = await db.from("suppliers").select("*").eq("id", id).single();
  if (error || !data) throw new NotFoundError("Supplier not found");
  return data as Supplier;
}

export async function createSupplier(
  session: Pick<Session, "mill_id">,
  payload: { name: string; phone?: string | null; village?: string | null; notes?: string | null }
): Promise<Supplier> {
  const db = getDb(session);
  const { data, error } = await db
    .insert("suppliers", { ...payload, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return data as Supplier;
}

export async function updateSupplier(
  session: Pick<Session, "mill_id">,
  id: string,
  payload: { name?: string; phone?: string | null; village?: string | null; notes?: string | null }
): Promise<Supplier> {
  const db = getDb(session);
  const { data, error } = await db
    .update("suppliers", { ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new NotFoundError("Supplier not found");
  return data as Supplier;
}

export async function softDeleteSupplier(
  session: Pick<Session, "mill_id">,
  id: string
): Promise<void> {
  const db = getDb(session);
  const { error } = await db
    .update("suppliers", { is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function restoreSupplier(
  session: Pick<Session, "mill_id">,
  id: string
): Promise<void> {
  const db = getDb(session);
  const { error } = await db
    .update("suppliers", { is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
