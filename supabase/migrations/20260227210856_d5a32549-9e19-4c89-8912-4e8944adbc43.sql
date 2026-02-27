
-- Add phone and COV fields to doctors table
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS cov text NOT NULL DEFAULT '';
