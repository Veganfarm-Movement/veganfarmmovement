REVOKE EXECUTE ON FUNCTION public.recalc_case_totals(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.donations_sync_totals() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.next_donation_reference() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.next_donation_reference() TO service_role;
GRANT EXECUTE ON FUNCTION public.recalc_case_totals(uuid) TO service_role;