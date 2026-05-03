-- =============================================================================
-- Naka — 0003_rls_session_var.sql
-- Updates current_mill_id() to read from a Postgres session variable
-- instead of auth.jwt() claims. This makes RLS work regardless of whether
-- the caller uses Supabase Auth or our custom JWT session.
--
-- Usage: before running queries, call:
--   SELECT set_config('app.current_mill_id', '<uuid>', false);
-- or via RPC:
--   supabase.rpc('set_mill_context', { p_mill_id: '<uuid>' })
-- =============================================================================

CREATE OR REPLACE FUNCTION public.current_mill_id()
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN current_setting('app.current_mill_id', true)::uuid;
EXCEPTION
  WHEN others THEN RETURN NULL;
END;
$$;

-- RPC helper so the app can set the session variable without raw SQL
CREATE OR REPLACE FUNCTION public.set_mill_context(p_mill_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('app.current_mill_id', p_mill_id::text, false);
END;
$$;

-- current_user_role stays the same but update to read from session var too
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN current_setting('app.current_user_role', true);
EXCEPTION
  WHEN others THEN RETURN NULL;
END;
$$;
