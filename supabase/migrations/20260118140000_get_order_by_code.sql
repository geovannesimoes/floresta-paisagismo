CREATE OR REPLACE FUNCTION get_order_by_code(p_code text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM orders WHERE code = p_code LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_order_by_code(text) TO anon, authenticated, service_role;
