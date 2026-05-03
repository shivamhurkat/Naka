// Hand-written to match supabase/migrations/0001_init.sql.
// Regenerate with: npm run db:types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enum types ───────────────────────────────────────────────────────────────

export type IndustryType = "cotton" | "oil" | "dal";
export type UserRole = "owner" | "manager" | "munim";
export type ItemKind = "raw_material" | "finished_good" | "by_product";
export type ItemUnit = "qtl" | "kg" | "ton" | "bag" | "litre";
export type ClaimType = "moisture" | "quality" | "weight_short" | "other";
export type ClaimStatus = "open" | "accepted" | "rejected" | "settled";
export type PhotoEntityType = "inbound_lot" | "outbound_dispatch" | "claim";
export type PhotoSlot =
  | "truck"
  | "weighbridge"
  | "moisture_meter"
  | "sample"
  | "dispatch_slip"
  | "other";
export type AuditAction = "create" | "update" | "delete";

// ─── Database ─────────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      mills: {
        Row: {
          id: string;
          name: string;
          owner_name: string;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          industry: IndustryType;
          code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_name: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          industry: IndustryType;
          code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_name?: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          industry?: IndustryType;
          code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      users: {
        Row: {
          id: string;
          mill_id: string;
          name: string;
          phone: string;
          pin_hash: string;
          role: UserRole;
          locale: "hi" | "en";
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mill_id: string;
          name: string;
          phone: string;
          pin_hash: string;
          role?: UserRole;
          locale?: "hi" | "en";
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string;
          name?: string;
          phone?: string;
          pin_hash?: string;
          role?: UserRole;
          locale?: "hi" | "en";
          is_active?: boolean;
          last_login_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          }
        ];
      };

      suppliers: {
        Row: {
          id: string;
          mill_id: string;
          name: string;
          phone: string | null;
          village: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mill_id: string;
          name: string;
          phone?: string | null;
          village?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string;
          name?: string;
          phone?: string | null;
          village?: string | null;
          notes?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suppliers_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          }
        ];
      };

      buyers: {
        Row: {
          id: string;
          mill_id: string;
          name: string;
          phone: string | null;
          city: string | null;
          gst: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mill_id: string;
          name: string;
          phone?: string | null;
          city?: string | null;
          gst?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string;
          name?: string;
          phone?: string | null;
          city?: string | null;
          gst?: string | null;
          notes?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "buyers_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          }
        ];
      };

      items: {
        Row: {
          id: string;
          mill_id: string;
          name: string;
          kind: ItemKind;
          unit: ItemUnit;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          mill_id: string;
          name: string;
          kind: ItemKind;
          unit?: ItemUnit;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string;
          name?: string;
          kind?: ItemKind;
          unit?: ItemUnit;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "items_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          }
        ];
      };

      inbound_lots: {
        Row: {
          id: string;
          mill_id: string;
          lot_number: string;
          supplier_id: string;
          item_id: string;
          vehicle_number: string | null;
          gross_weight_qtl: number;
          tare_weight_qtl: number;
          /** Generated: gross - tare */
          net_weight_qtl: number;
          moisture_pct: number | null;
          rate_per_qtl: number;
          /** Generated: net * rate */
          total_amount: number;
          deduction_amount: number;
          /** Generated: total - deduction */
          payable_amount: number;
          received_at: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mill_id: string;
          lot_number?: string;
          supplier_id: string;
          item_id: string;
          vehicle_number?: string | null;
          gross_weight_qtl: number;
          tare_weight_qtl: number;
          moisture_pct?: number | null;
          rate_per_qtl: number;
          deduction_amount?: number;
          received_at?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string;
          lot_number?: string;
          supplier_id?: string;
          item_id?: string;
          vehicle_number?: string | null;
          gross_weight_qtl?: number;
          tare_weight_qtl?: number;
          moisture_pct?: number | null;
          rate_per_qtl?: number;
          deduction_amount?: number;
          received_at?: string;
          notes?: string | null;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inbound_lots_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inbound_lots_supplier_id_fkey";
            columns: ["supplier_id"];
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inbound_lots_item_id_fkey";
            columns: ["item_id"];
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inbound_lots_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      outbound_dispatches: {
        Row: {
          id: string;
          mill_id: string;
          dispatch_number: string;
          buyer_id: string;
          item_id: string;
          vehicle_number: string | null;
          gross_weight_qtl: number;
          tare_weight_qtl: number;
          /** Generated: gross - tare */
          net_weight_qtl: number;
          rate_per_qtl: number;
          /** Generated: net * rate */
          total_amount: number;
          dispatched_at: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mill_id: string;
          dispatch_number?: string;
          buyer_id: string;
          item_id: string;
          vehicle_number?: string | null;
          gross_weight_qtl: number;
          tare_weight_qtl: number;
          rate_per_qtl: number;
          dispatched_at?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string;
          dispatch_number?: string;
          buyer_id?: string;
          item_id?: string;
          vehicle_number?: string | null;
          gross_weight_qtl?: number;
          tare_weight_qtl?: number;
          rate_per_qtl?: number;
          dispatched_at?: string;
          notes?: string | null;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "outbound_dispatches_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outbound_dispatches_buyer_id_fkey";
            columns: ["buyer_id"];
            referencedRelation: "buyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outbound_dispatches_item_id_fkey";
            columns: ["item_id"];
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outbound_dispatches_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      dispatch_lot_links: {
        Row: {
          id: string;
          dispatch_id: string;
          inbound_lot_id: string;
          consumed_qty_qtl: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          dispatch_id: string;
          inbound_lot_id: string;
          consumed_qty_qtl: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          dispatch_id?: string;
          inbound_lot_id?: string;
          consumed_qty_qtl?: number;
        };
        Relationships: [
          {
            foreignKeyName: "dispatch_lot_links_dispatch_id_fkey";
            columns: ["dispatch_id"];
            referencedRelation: "outbound_dispatches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dispatch_lot_links_inbound_lot_id_fkey";
            columns: ["inbound_lot_id"];
            referencedRelation: "inbound_lots";
            referencedColumns: ["id"];
          }
        ];
      };

      claims: {
        Row: {
          id: string;
          mill_id: string;
          dispatch_id: string;
          claim_type: ClaimType;
          claimed_amount: number;
          accepted_amount: number | null;
          status: ClaimStatus;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mill_id: string;
          dispatch_id: string;
          claim_type: ClaimType;
          claimed_amount: number;
          accepted_amount?: number | null;
          status?: ClaimStatus;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string;
          dispatch_id?: string;
          claim_type?: ClaimType;
          claimed_amount?: number;
          accepted_amount?: number | null;
          status?: ClaimStatus;
          notes?: string | null;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "claims_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claims_dispatch_id_fkey";
            columns: ["dispatch_id"];
            referencedRelation: "outbound_dispatches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claims_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      photos: {
        Row: {
          id: string;
          mill_id: string;
          entity_type: PhotoEntityType;
          entity_id: string;
          slot: PhotoSlot;
          storage_path: string;
          mime_type: string | null;
          file_size_bytes: number | null;
          captured_at: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          mill_id: string;
          entity_type: PhotoEntityType;
          entity_id: string;
          slot?: PhotoSlot;
          storage_path: string;
          mime_type?: string | null;
          file_size_bytes?: number | null;
          captured_at?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string;
          entity_type?: PhotoEntityType;
          entity_id?: string;
          slot?: PhotoSlot;
          storage_path?: string;
          mime_type?: string | null;
          file_size_bytes?: number | null;
          captured_at?: string | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "photos_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey";
            columns: ["uploaded_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      audit_log: {
        Row: {
          id: string;
          mill_id: string | null;
          user_id: string | null;
          entity_type: string;
          entity_id: string;
          action: AuditAction;
          diff: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          mill_id?: string | null;
          user_id?: string | null;
          entity_type: string;
          entity_id: string;
          action: AuditAction;
          diff?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          mill_id?: string | null;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string;
          action?: AuditAction;
          diff?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_mill_id_fkey";
            columns: ["mill_id"];
            referencedRelation: "mills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_log_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: Record<string, never>;

    Functions: {
      current_mill_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_lot_number: {
        Args: { p_mill_id: string };
        Returns: string;
      };
      generate_dispatch_number: {
        Args: { p_mill_id: string };
        Returns: string;
      };
    };

    Enums: {
      industry_type: IndustryType;
      user_role: UserRole;
      item_kind: ItemKind;
      item_unit: ItemUnit;
      claim_type: ClaimType;
      claim_status: ClaimStatus;
      photo_entity_type: PhotoEntityType;
      photo_slot: PhotoSlot;
      audit_action: AuditAction;
    };

    CompositeTypes: Record<string, never>;
  };
};

// ─── Convenience row types ────────────────────────────────────────────────────

type Tables = Database["public"]["Tables"];

export type Mill = Tables["mills"]["Row"];
export type MillInsert = Tables["mills"]["Insert"];
export type MillUpdate = Tables["mills"]["Update"];

export type User = Tables["users"]["Row"];
export type UserInsert = Tables["users"]["Insert"];
export type UserUpdate = Tables["users"]["Update"];

export type Supplier = Tables["suppliers"]["Row"];
export type SupplierInsert = Tables["suppliers"]["Insert"];

export type Buyer = Tables["buyers"]["Row"];
export type BuyerInsert = Tables["buyers"]["Insert"];

export type Item = Tables["items"]["Row"];
export type ItemInsert = Tables["items"]["Insert"];

export type InboundLot = Tables["inbound_lots"]["Row"];
export type InboundLotInsert = Tables["inbound_lots"]["Insert"];
export type InboundLotUpdate = Tables["inbound_lots"]["Update"];

export type OutboundDispatch = Tables["outbound_dispatches"]["Row"];
export type OutboundDispatchInsert = Tables["outbound_dispatches"]["Insert"];
export type OutboundDispatchUpdate = Tables["outbound_dispatches"]["Update"];

export type DispatchLotLink = Tables["dispatch_lot_links"]["Row"];
export type DispatchLotLinkInsert = Tables["dispatch_lot_links"]["Insert"];

export type Claim = Tables["claims"]["Row"];
export type ClaimInsert = Tables["claims"]["Insert"];
export type ClaimUpdate = Tables["claims"]["Update"];

export type Photo = Tables["photos"]["Row"];
export type PhotoInsert = Tables["photos"]["Insert"];

export type AuditLog = Tables["audit_log"]["Row"];
export type AuditLogInsert = Tables["audit_log"]["Insert"];
