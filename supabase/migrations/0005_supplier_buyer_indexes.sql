-- Composite indexes for supplier/buyer list queries
CREATE INDEX IF NOT EXISTS idx_suppliers_mill_active
  ON suppliers (mill_id, is_active);

CREATE INDEX IF NOT EXISTS idx_suppliers_mill_name
  ON suppliers (mill_id, name);

CREATE INDEX IF NOT EXISTS idx_buyers_mill_active
  ON buyers (mill_id, is_active);

CREATE INDEX IF NOT EXISTS idx_buyers_mill_name
  ON buyers (mill_id, name);
