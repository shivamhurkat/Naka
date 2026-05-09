-- Add soft-delete support to photos table
ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Filtered index for active-photo lookups by entity
CREATE INDEX IF NOT EXISTS idx_photos_entity_active
  ON photos (entity_type, entity_id)
  WHERE deleted_at IS NULL;
