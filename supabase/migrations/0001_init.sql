-- =============================================================================
-- Naka — 0001_init.sql
-- Run once in Supabase SQL editor.
-- =============================================================================

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE industry_type   AS ENUM ('cotton', 'oil', 'dal');
CREATE TYPE user_role       AS ENUM ('owner', 'manager', 'munim');
CREATE TYPE item_kind       AS ENUM ('raw_material', 'finished_good', 'by_product');
CREATE TYPE item_unit       AS ENUM ('qtl', 'kg', 'ton', 'bag', 'litre');
CREATE TYPE claim_type      AS ENUM ('moisture', 'quality', 'weight_short', 'other');
CREATE TYPE claim_status    AS ENUM ('open', 'accepted', 'rejected', 'settled');
CREATE TYPE photo_entity_type AS ENUM ('inbound_lot', 'outbound_dispatch', 'claim');
CREATE TYPE photo_slot      AS ENUM ('truck', 'weighbridge', 'moisture_meter', 'sample', 'dispatch_slip', 'other');
CREATE TYPE audit_action    AS ENUM ('create', 'update', 'delete');

-- ─── Shared trigger: set updated_at on every write ───────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── mills ───────────────────────────────────────────────────────────────────

CREATE TABLE mills (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  owner_name  text        NOT NULL,
  phone       text,
  address     text,
  city        text,
  state       text,
  industry    industry_type NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER mills_updated_at
  BEFORE UPDATE ON mills
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-seed default items whenever a new mill is created
CREATE OR REPLACE FUNCTION seed_default_items()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.industry = 'cotton' THEN
    INSERT INTO items (mill_id, name, kind, unit) VALUES
      (NEW.id, 'Kapas',       'raw_material',  'qtl'),
      (NEW.id, 'Bales',       'finished_good', 'qtl'),
      (NEW.id, 'Cottonseed',  'by_product',    'qtl');

  ELSIF NEW.industry = 'oil' THEN
    INSERT INTO items (mill_id, name, kind, unit) VALUES
      (NEW.id, 'Seed',     'raw_material',  'qtl'),
      (NEW.id, 'Oil',      'finished_good', 'litre'),
      (NEW.id, 'Oilcake',  'by_product',    'qtl');

  ELSIF NEW.industry = 'dal' THEN
    INSERT INTO items (mill_id, name, kind, unit) VALUES
      (NEW.id, 'Raw Pulses',  'raw_material',  'qtl'),
      (NEW.id, 'Dal',         'finished_good', 'qtl'),
      (NEW.id, 'Broken Dal',  'by_product',    'qtl'),
      (NEW.id, 'Chuni',       'by_product',    'qtl');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER mills_seed_default_items
  AFTER INSERT ON mills
  FOR EACH ROW EXECUTE FUNCTION seed_default_items();

-- ─── users ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id        uuid        NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  name           text        NOT NULL,
  phone          text        NOT NULL,
  pin_hash       text        NOT NULL,
  role           user_role   NOT NULL DEFAULT 'munim',
  is_active      boolean     NOT NULL DEFAULT true,
  last_login_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mill_id, phone)
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── suppliers ───────────────────────────────────────────────────────────────

CREATE TABLE suppliers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id    uuid        NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  phone      text,
  village    text,
  notes      text,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mill_id, name)
);

CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── buyers ──────────────────────────────────────────────────────────────────

CREATE TABLE buyers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id    uuid        NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  phone      text,
  city       text,
  gst        text,
  notes      text,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mill_id, name)
);

CREATE TRIGGER buyers_updated_at
  BEFORE UPDATE ON buyers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── items ───────────────────────────────────────────────────────────────────
-- Default rows per mill are created by the mills_seed_default_items trigger.

CREATE TABLE items (
  id         uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id    uuid      NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  name       text      NOT NULL,
  kind       item_kind NOT NULL,
  unit       item_unit NOT NULL DEFAULT 'qtl',
  is_active  boolean   NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Lot-number sequences (per mill × date) ───────────────────────────────────

CREATE TABLE lot_number_sequences (
  mill_id   uuid NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  date_key  date NOT NULL,
  last_seq  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (mill_id, date_key)
);

CREATE OR REPLACE FUNCTION generate_lot_number(p_mill_id uuid)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_date_key text := to_char(current_date, 'YYYYMMDD');
  v_seq      integer;
BEGIN
  INSERT INTO lot_number_sequences (mill_id, date_key, last_seq)
  VALUES (p_mill_id, current_date, 1)
  ON CONFLICT (mill_id, date_key) DO UPDATE
    SET last_seq = lot_number_sequences.last_seq + 1
  RETURNING last_seq INTO v_seq;

  RETURN v_date_key || '-' || lpad(v_seq::text, 4, '0');
END;
$$;

-- ─── inbound_lots ────────────────────────────────────────────────────────────

CREATE TABLE inbound_lots (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id          uuid        NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  lot_number       text        NOT NULL,
  supplier_id      uuid        NOT NULL REFERENCES suppliers(id),
  item_id          uuid        NOT NULL REFERENCES items(id),
  vehicle_number   text,
  gross_weight_qtl numeric(10,2) NOT NULL DEFAULT 0,
  tare_weight_qtl  numeric(10,2) NOT NULL DEFAULT 0,
  net_weight_qtl   numeric(10,2) GENERATED ALWAYS AS
                     (gross_weight_qtl - tare_weight_qtl) STORED,
  moisture_pct     numeric(5,2),
  rate_per_qtl     numeric(10,2) NOT NULL DEFAULT 0,
  total_amount     numeric(12,2) GENERATED ALWAYS AS
                     ((gross_weight_qtl - tare_weight_qtl) * rate_per_qtl) STORED,
  deduction_amount numeric(12,2) NOT NULL DEFAULT 0,
  payable_amount   numeric(12,2) GENERATED ALWAYS AS
                     ((gross_weight_qtl - tare_weight_qtl) * rate_per_qtl - deduction_amount) STORED,
  received_at      timestamptz NOT NULL DEFAULT now(),
  notes            text,
  created_by       uuid REFERENCES users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mill_id, lot_number)
);

CREATE OR REPLACE FUNCTION assign_lot_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.lot_number IS NULL OR NEW.lot_number = '' THEN
    NEW.lot_number := generate_lot_number(NEW.mill_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER inbound_lots_lot_number
  BEFORE INSERT ON inbound_lots
  FOR EACH ROW EXECUTE FUNCTION assign_lot_number();

CREATE TRIGGER inbound_lots_updated_at
  BEFORE UPDATE ON inbound_lots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Dispatch-number sequences (per mill × date) ──────────────────────────────

CREATE TABLE dispatch_number_sequences (
  mill_id   uuid NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  date_key  date NOT NULL,
  last_seq  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (mill_id, date_key)
);

CREATE OR REPLACE FUNCTION generate_dispatch_number(p_mill_id uuid)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_date_key text := to_char(current_date, 'YYYYMMDD');
  v_seq      integer;
BEGIN
  INSERT INTO dispatch_number_sequences (mill_id, date_key, last_seq)
  VALUES (p_mill_id, current_date, 1)
  ON CONFLICT (mill_id, date_key) DO UPDATE
    SET last_seq = dispatch_number_sequences.last_seq + 1
  RETURNING last_seq INTO v_seq;

  RETURN 'D-' || v_date_key || '-' || lpad(v_seq::text, 4, '0');
END;
$$;

-- ─── outbound_dispatches ─────────────────────────────────────────────────────

CREATE TABLE outbound_dispatches (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id          uuid        NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  dispatch_number  text        NOT NULL,
  buyer_id         uuid        NOT NULL REFERENCES buyers(id),
  item_id          uuid        NOT NULL REFERENCES items(id),
  vehicle_number   text,
  gross_weight_qtl numeric(10,2) NOT NULL DEFAULT 0,
  tare_weight_qtl  numeric(10,2) NOT NULL DEFAULT 0,
  net_weight_qtl   numeric(10,2) GENERATED ALWAYS AS
                     (gross_weight_qtl - tare_weight_qtl) STORED,
  rate_per_qtl     numeric(10,2) NOT NULL DEFAULT 0,
  total_amount     numeric(12,2) GENERATED ALWAYS AS
                     ((gross_weight_qtl - tare_weight_qtl) * rate_per_qtl) STORED,
  dispatched_at    timestamptz NOT NULL DEFAULT now(),
  notes            text,
  created_by       uuid REFERENCES users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mill_id, dispatch_number)
);

CREATE OR REPLACE FUNCTION assign_dispatch_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.dispatch_number IS NULL OR NEW.dispatch_number = '' THEN
    NEW.dispatch_number := generate_dispatch_number(NEW.mill_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER outbound_dispatches_dispatch_number
  BEFORE INSERT ON outbound_dispatches
  FOR EACH ROW EXECUTE FUNCTION assign_dispatch_number();

CREATE TRIGGER outbound_dispatches_updated_at
  BEFORE UPDATE ON outbound_dispatches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── dispatch_lot_links ──────────────────────────────────────────────────────

CREATE TABLE dispatch_lot_links (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id      uuid        NOT NULL REFERENCES outbound_dispatches(id) ON DELETE CASCADE,
  inbound_lot_id   uuid        NOT NULL REFERENCES inbound_lots(id),
  consumed_qty_qtl numeric(10,2) NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── claims ──────────────────────────────────────────────────────────────────

CREATE TABLE claims (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id          uuid         NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  dispatch_id      uuid         NOT NULL REFERENCES outbound_dispatches(id),
  claim_type       claim_type   NOT NULL,
  claimed_amount   numeric(12,2) NOT NULL,
  accepted_amount  numeric(12,2),
  status           claim_status NOT NULL DEFAULT 'open',
  notes            text,
  created_by       uuid         REFERENCES users(id),
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now()
);

CREATE TRIGGER claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── photos ──────────────────────────────────────────────────────────────────

CREATE TABLE photos (
  id               uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id          uuid             NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
  entity_type      photo_entity_type NOT NULL,
  entity_id        uuid             NOT NULL,
  slot             photo_slot       NOT NULL DEFAULT 'other',
  storage_path     text             NOT NULL,
  mime_type        text,
  file_size_bytes  integer,
  captured_at      timestamptz,
  uploaded_by      uuid             REFERENCES users(id),
  created_at       timestamptz      NOT NULL DEFAULT now()
);

-- ─── audit_log ───────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  mill_id      uuid         REFERENCES mills(id),
  user_id      uuid         REFERENCES users(id),
  entity_type  text         NOT NULL,
  entity_id    uuid         NOT NULL,
  action       audit_action NOT NULL,
  diff         jsonb,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX ON inbound_lots      (mill_id, received_at  DESC);
CREATE INDEX ON outbound_dispatches (mill_id, dispatched_at DESC);
CREATE INDEX ON inbound_lots      (mill_id, supplier_id);
CREATE INDEX ON outbound_dispatches (mill_id, buyer_id);
CREATE INDEX ON photos            (entity_type, entity_id);
CREATE INDEX ON audit_log         (mill_id, created_at DESC);
CREATE INDEX ON users             (mill_id);
CREATE INDEX ON suppliers         (mill_id);
CREATE INDEX ON buyers            (mill_id);
CREATE INDEX ON items             (mill_id);
CREATE INDEX ON claims            (mill_id);
CREATE INDEX ON dispatch_lot_links (dispatch_id);
CREATE INDEX ON dispatch_lot_links (inbound_lot_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE mills                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE items                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_lots             ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_dispatches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_lot_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_number_sequences     ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_number_sequences ENABLE ROW LEVEL SECURITY;

-- Helper: read mill_id from JWT app_metadata (set in step 3 auth)
CREATE OR REPLACE FUNCTION public.current_mill_id()
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'mill_id')::uuid;
EXCEPTION
  WHEN others THEN RETURN NULL;
END;
$$;

-- Helper: read role from JWT app_metadata
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN auth.jwt() -> 'app_metadata' ->> 'role';
EXCEPTION
  WHEN others THEN RETURN NULL;
END;
$$;

-- ── mills ──
CREATE POLICY "mill_member_select" ON mills
  FOR SELECT USING (id = current_mill_id());

CREATE POLICY "mill_owner_update" ON mills
  FOR UPDATE USING (id = current_mill_id() AND current_user_role() = 'owner');

-- ── users ──
CREATE POLICY "mill_member_select_users" ON users
  FOR SELECT USING (mill_id = current_mill_id());

CREATE POLICY "owner_manager_insert_users" ON users
  FOR INSERT WITH CHECK (
    mill_id = current_mill_id()
    AND current_user_role() IN ('owner', 'manager')
  );

CREATE POLICY "owner_manager_update_users" ON users
  FOR UPDATE USING (
    mill_id = current_mill_id()
    AND current_user_role() IN ('owner', 'manager')
  );

-- ── suppliers ──
CREATE POLICY "mill_member_select_suppliers" ON suppliers
  FOR SELECT USING (mill_id = current_mill_id());

CREATE POLICY "mill_member_insert_suppliers" ON suppliers
  FOR INSERT WITH CHECK (mill_id = current_mill_id());

CREATE POLICY "mill_member_update_suppliers" ON suppliers
  FOR UPDATE USING (mill_id = current_mill_id());

-- ── buyers ──
CREATE POLICY "mill_member_select_buyers" ON buyers
  FOR SELECT USING (mill_id = current_mill_id());

CREATE POLICY "mill_member_insert_buyers" ON buyers
  FOR INSERT WITH CHECK (mill_id = current_mill_id());

CREATE POLICY "mill_member_update_buyers" ON buyers
  FOR UPDATE USING (mill_id = current_mill_id());

-- ── items ──
CREATE POLICY "mill_member_select_items" ON items
  FOR SELECT USING (mill_id = current_mill_id());

CREATE POLICY "owner_manager_manage_items" ON items
  FOR ALL USING (
    mill_id = current_mill_id()
    AND current_user_role() IN ('owner', 'manager')
  );

-- ── inbound_lots ──
CREATE POLICY "mill_member_select_lots" ON inbound_lots
  FOR SELECT USING (mill_id = current_mill_id());

CREATE POLICY "mill_member_insert_lots" ON inbound_lots
  FOR INSERT WITH CHECK (mill_id = current_mill_id());

CREATE POLICY "owner_manager_update_lots" ON inbound_lots
  FOR UPDATE USING (
    mill_id = current_mill_id()
    AND current_user_role() IN ('owner', 'manager')
  );

-- ── outbound_dispatches ──
CREATE POLICY "mill_member_select_dispatches" ON outbound_dispatches
  FOR SELECT USING (mill_id = current_mill_id());

CREATE POLICY "mill_member_insert_dispatches" ON outbound_dispatches
  FOR INSERT WITH CHECK (mill_id = current_mill_id());

CREATE POLICY "owner_manager_update_dispatches" ON outbound_dispatches
  FOR UPDATE USING (
    mill_id = current_mill_id()
    AND current_user_role() IN ('owner', 'manager')
  );

-- ── dispatch_lot_links (inherit through dispatch) ──
CREATE POLICY "mill_member_select_links" ON dispatch_lot_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM outbound_dispatches od
      WHERE od.id = dispatch_id AND od.mill_id = current_mill_id()
    )
  );

CREATE POLICY "mill_member_insert_links" ON dispatch_lot_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM outbound_dispatches od
      WHERE od.id = dispatch_id AND od.mill_id = current_mill_id()
    )
  );

-- ── claims ──
CREATE POLICY "mill_member_select_claims" ON claims
  FOR SELECT USING (mill_id = current_mill_id());

CREATE POLICY "mill_member_insert_claims" ON claims
  FOR INSERT WITH CHECK (mill_id = current_mill_id());

CREATE POLICY "owner_manager_update_claims" ON claims
  FOR UPDATE USING (
    mill_id = current_mill_id()
    AND current_user_role() IN ('owner', 'manager')
  );

-- ── photos ──
CREATE POLICY "mill_member_select_photos" ON photos
  FOR SELECT USING (mill_id = current_mill_id());

CREATE POLICY "mill_member_insert_photos" ON photos
  FOR INSERT WITH CHECK (mill_id = current_mill_id());

-- ── audit_log (read only for members; writes via service role) ──
CREATE POLICY "mill_member_select_audit" ON audit_log
  FOR SELECT USING (mill_id = current_mill_id());

-- ── sequence tables ──
CREATE POLICY "mill_member_lot_seq" ON lot_number_sequences
  FOR ALL USING (mill_id = current_mill_id());

CREATE POLICY "mill_member_dispatch_seq" ON dispatch_number_sequences
  FOR ALL USING (mill_id = current_mill_id());

-- =============================================================================
-- Storage — bucket "mill-photos"
-- Path convention: {mill_id}/{entity_type}/{entity_id}/{slot}-{timestamp}.jpg
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mill-photos',
  'mill-photos',
  false,
  10485760,   -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "mill_member_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mill-photos'
    AND split_part(name, '/', 1) = current_mill_id()::text
  );

CREATE POLICY "mill_member_storage_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'mill-photos'
    AND split_part(name, '/', 1) = current_mill_id()::text
  );

CREATE POLICY "mill_member_storage_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'mill-photos'
    AND split_part(name, '/', 1) = current_mill_id()::text
  );

CREATE POLICY "mill_member_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'mill-photos'
    AND split_part(name, '/', 1) = current_mill_id()::text
  );
