-- Drop potentially conflicting functions to ensure clean slate with new signatures
-- We drop the version accepting UUID to replace it with the TEXT version that casts internally
DROP FUNCTION IF EXISTS confirm_order_payment(uuid, text, text);
DROP FUNCTION IF EXISTS confirm_order_payment(text, text, text);

-- Secure function to confirm payment with explicit type casting
-- Accepts ID as text and casts to UUID to prevent "operator does not exist: text = uuid"
CREATE OR REPLACE FUNCTION confirm_order_payment(
  p_order_id text,
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
  WHERE id = p_order_id::uuid -- Explicit cast to UUID ensures type safety
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

-- Drop and recreate create_order_and_return to ensure consistency
DROP FUNCTION IF EXISTS create_order_and_return(text, text, text, text, text, text, text, text);

-- Secure function to create order and return details
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

-- Grant permissions to all functions for anonymous and authenticated users
GRANT EXECUTE ON FUNCTION confirm_order_payment(text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_order_and_return(text, text, text, text, text, text, text, text) TO anon, authenticated, service_role;
