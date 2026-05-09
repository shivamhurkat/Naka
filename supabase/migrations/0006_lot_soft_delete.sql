-- Add soft-delete support to inbound_lots
ALTER TABLE inbound_lots
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Index for efficient filtering of active lots
CREATE INDEX IF NOT EXISTS idx_inbound_lots_deleted_at
  ON inbound_lots (mill_id, deleted_at)
  WHERE deleted_at IS NULL;
