-- Secure function to create order and return details
-- This allows anonymous users to create orders without direct table permissions
CREATE OR REPLACE FUNCTION create_order_and_return(
  p_client_name text,
  p_client_email text,
  p_client_whatsapp text,
  p_property_type text,
  p_dimensions text,
  p_preferences text,
  p_notes text,
  p_plan text
)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code text;
  order_result orders%ROWTYPE;
BEGIN
  -- Loop to ensure unique code generation
  LOOP
    -- Generate 8-char uppercase alphanumeric code from MD5 hash of UUID + Timestamp
    new_code := upper(substring(md5(gen_random_uuid()::text || clock_timestamp()::text) from 1 for 8));
    
    BEGIN
      INSERT INTO orders (
        client_name,
        client_email,
        client_whatsapp,
        property_type,
        dimensions,
        preferences,
        notes,
        plan,
        code,
        status,
        created_at,
        updated_at
      ) VALUES (
        p_client_name,
        p_client_email,
        p_client_whatsapp,
        p_property_type,
        p_dimensions,
        p_preferences,
        p_notes,
        p_plan,
        new_code,
        'Aguardando Pagamento',
        now(),
        now()
      )
      RETURNING * INTO order_result;
      
      RETURN NEXT order_result;
      EXIT; -- Exit loop on success
    EXCEPTION WHEN unique_violation THEN
      -- Retry loop if code exists (highly unlikely but handled)
      CONTINUE;
    END;
  END LOOP;
END;
$$;

-- Secure function to confirm payment
-- Updates status to 'Recebido' checking ID, Code and Email for security
CREATE OR REPLACE FUNCTION confirm_order_payment(
  p_order_id uuid,
  p_order_code text,
  p_email text
)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_order orders%ROWTYPE;
BEGIN
  UPDATE orders
  SET 
    status = 'Recebido',
    updated_at = now()
  WHERE id = p_order_id 
    AND code = p_order_code
    -- Case insensitive email check for extra security
    AND lower(client_email) = lower(p_email)
  RETURNING * INTO updated_order;

  IF FOUND THEN
    RETURN NEXT updated_order;
  ELSE
    RAISE EXCEPTION 'Pedido não encontrado ou dados incorretos.';
  END IF;
END;
$$;

-- Secure function to get full order details including relations
-- Returns JSON to avoid RLS issues on related tables for anonymous users
CREATE OR REPLACE FUNCTION get_client_order_details(p_email text, p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_data json;
BEGIN
  SELECT row_to_json(t) INTO order_data
  FROM (
    SELECT 
      o.*,
      COALESCE((SELECT json_agg(op.*) FROM order_photos op WHERE op.order_id = o.id), '[]'::json) as photos,
      COALESCE((SELECT json_agg(od.*) FROM order_deliverables od WHERE od.order_id = o.id), '[]'::json) as deliverables,
      COALESCE((SELECT json_agg(rr.*) FROM revision_requests rr WHERE rr.order_id = o.id), '[]'::json) as revisions
    FROM orders o
    WHERE lower(o.client_email) = lower(p_email) AND o.code = p_code
  ) t;

  RETURN order_data;
END;
$$;

-- Grant permissions to all functions for anonymous and authenticated users
GRANT EXECUTE ON FUNCTION create_order_and_return TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION confirm_order_payment TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_client_order_details TO anon, authenticated, service_role;

-- Policy to ensure order_photos can be uploaded by anonymous users who have the order_id
-- This allows the upload flow to work immediately after order creation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'order_photos'
        AND policyname = 'Enable insert for all users'
    ) THEN
        CREATE POLICY "Enable insert for all users" ON "public"."order_photos" FOR INSERT WITH CHECK (true);
    END IF;
END
$$;

-- Ensure RLS is enabled on order_photos (idempotent)
ALTER TABLE "public"."order_photos" ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions on order_photos
GRANT ALL ON TABLE "public"."order_photos" TO anon, authenticated, service_role;
