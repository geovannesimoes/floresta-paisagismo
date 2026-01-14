-- Add client_cpf_cnpj column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS client_cpf_cnpj text;

-- Drop old function signatures to avoid confusion and ensure clean replacement
DROP FUNCTION IF EXISTS create_order_and_return(text, text, text, text, text, text, text, text);

-- Recreate create_order_and_return with the new parameter p_client_cpf_cnpj
CREATE OR REPLACE FUNCTION create_order_and_return(
  p_client_name text,
  p_client_email text,
  p_client_cpf_cnpj text,
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
        client_cpf_cnpj,
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
        p_client_cpf_cnpj,
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

-- Grant permissions to the new function signature
GRANT EXECUTE ON FUNCTION create_order_and_return(text, text, text, text, text, text, text, text, text) TO anon, authenticated, service_role;
