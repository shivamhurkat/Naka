// Mill-scoped query helpers.
// Always use getDb(session) in route handlers instead of the raw admin client
// so mill isolation is enforced at the application layer (defense-in-depth on
// top of RLS which is also enabled on every table).
//
// Supabase's deeply-generic query builder causes tsc stack overflows when used
// as explicit return types, so these methods return `any`. Route handlers get
// full type safety by destructuring `{ data, error }` and typing `data`.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAdminClient } from "./supabase/admin";
import type { Session } from "./auth/session";

const MILL_SCOPED = new Set([
  "users",
  "suppliers",
  "buyers",
  "items",
  "inbound_lots",
  "outbound_dispatches",
  "dispatch_lot_links",
  "claims",
  "photos",
  "audit_log",
  "lot_number_sequences",
  "dispatch_number_sequences",
]);

type Row = Record<string, unknown>;

function assertScoped(table: string): void {
  if (process.env.NODE_ENV !== "production" && !MILL_SCOPED.has(table)) {
    throw new Error(
      `[db] getDb().from("${table}") is not mill-scoped. ` +
        `Use db.client directly for unscoped tables such as "mills".`
    );
  }
}

export function getDb(session: Pick<Session, "mill_id">) {
  const client = createAdminClient();
  const { mill_id } = session;

  return {
    /** Raw admin client — use for tables not in MILL_SCOPED (e.g. mills). */
    client,
    mill_id,

    /**
     * SELECT — pre-filtered by mill_id.
     * Chain .select(), .eq(), .order(), .single(), etc.
     * @example
     * const { data } = await db.from('suppliers').select('*').eq('is_active', true)
     */
    from(table: string): any {
      assertScoped(table);
      return (client.from(table as any) as any).eq("mill_id", mill_id);
    },

    /**
     * INSERT — mill_id injected automatically.
     * @example
     * const { data } = await db.insert('suppliers', { name, phone })
     */
    insert(table: string, data: Row | Row[]): any {
      assertScoped(table);
      const rows = (Array.isArray(data) ? data : [data]).map((r) => ({
        ...r,
        mill_id,
      }));
      return client.from(table as any).insert(rows);
    },

    /**
     * UPDATE — pre-filtered by mill_id. Chain .eq('id', id) for row targeting.
     * @example
     * const { data } = await db.update('suppliers', { phone }).eq('id', id)
     */
    update(table: string, data: Row): any {
      assertScoped(table);
      return (client.from(table as any) as any).update(data).eq("mill_id", mill_id);
    },

    /**
     * DELETE — pre-filtered by mill_id. Chain .eq('id', id) for row targeting.
     * @example
     * await db.remove('suppliers').eq('id', id)
     */
    remove(table: string): any {
      assertScoped(table);
      return (client.from(table as any) as any).delete().eq("mill_id", mill_id);
    },
  };
}
