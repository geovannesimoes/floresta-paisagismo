-- Migration to add unique constraint to CPF in customer_profiles
-- This prevents duplicate accounts with the same CPF
ALTER TABLE public.customer_profiles
ADD CONSTRAINT customer_profiles_cpf_key UNIQUE (cpf);
