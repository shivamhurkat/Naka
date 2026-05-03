-- =============================================================================
-- Naka — seed.sql
-- Inserts demo data for development. Run AFTER all migrations.
-- The mills_seed_default_items trigger auto-creates items on mill insert.
-- =============================================================================

DO $$
DECLARE
  v_mill_id uuid;
BEGIN

  -- ── Demo mill ──────────────────────────────────────────────────────────────
  INSERT INTO mills (name, owner_name, phone, address, city, state, industry, code)
  VALUES (
    'Hinganghat Demo Mill',
    'Ramesh Agrawal',
    '9876543210',
    'Plot 12, MIDC Industrial Area',
    'Hinganghat',
    'Maharashtra',
    'cotton',
    'DEMO01'
  )
  RETURNING id INTO v_mill_id;

  -- Default items (Kapas / Bales / Cottonseed) are created automatically
  -- by the mills_seed_default_items trigger above.

  -- ── Demo suppliers ────────────────────────────────────────────────────────
  INSERT INTO suppliers (mill_id, name, phone, village) VALUES
    (v_mill_id, 'Shankarlal Farms',  '9812345678', 'Wardha'),
    (v_mill_id, 'Patil Agro',        '9823456789', 'Yavatmal'),
    (v_mill_id, 'Deshmukh Krishi',   '9834567890', 'Amravati');

  -- ── Demo buyers ───────────────────────────────────────────────────────────
  INSERT INTO buyers (mill_id, name, phone, city, gst) VALUES
    (v_mill_id, 'Maharashtra Textiles Ltd', '9845678901', 'Nagpur',  '27AABCM1234A1Z5'),
    (v_mill_id, 'Vidarbha Cotton Co',       '9856789012', 'Wardha',  '27AABCV5678B1Z3');

  RAISE NOTICE 'Seed complete. Mill ID: %  Code: DEMO01', v_mill_id;
END $$;
