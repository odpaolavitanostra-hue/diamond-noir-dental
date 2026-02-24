
-- App settings
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tasa_bcv numeric NOT NULL DEFAULT 36.50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update settings" ON public.settings FOR UPDATE TO authenticated USING (true);

-- Doctors
CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  specialty text NOT NULL DEFAULT 'Odontología General',
  pay_model text NOT NULL DEFAULT 'percent' CHECK (pay_model IN ('fixed', 'percent')),
  rate numeric NOT NULL DEFAULT 0.40,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Auth can manage doctors" ON public.doctors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Treatments
CREATE TABLE public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read treatments" ON public.treatments FOR SELECT USING (true);
CREATE POLICY "Auth can manage treatments" ON public.treatments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Patients
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cedula text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  photos text[] NOT NULL DEFAULT '{}',
  clinical_history_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth can update/delete patients" ON public.patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth can delete patients" ON public.patients FOR DELETE TO authenticated USING (true);

-- Inventory
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stock numeric NOT NULL DEFAULT 0,
  price_usd numeric NOT NULL DEFAULT 0,
  min_stock numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can read inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can manage inventory" ON public.inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Appointments
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_phone text NOT NULL,
  patient_cedula text DEFAULT '',
  patient_email text DEFAULT '',
  doctor_id uuid REFERENCES public.doctors(id),
  date text NOT NULL,
  time text NOT NULL,
  treatment text NOT NULL,
  price_usd numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completada', 'cancelada')),
  materials_used jsonb DEFAULT '[]',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (true);

-- Finances
CREATE TABLE public.finances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id),
  date text NOT NULL,
  treatment_price_usd numeric NOT NULL DEFAULT 0,
  doctor_pay_usd numeric NOT NULL DEFAULT 0,
  materials_cost_usd numeric NOT NULL DEFAULT 0,
  utility_usd numeric NOT NULL DEFAULT 0,
  tasa_bcv numeric NOT NULL DEFAULT 36.50,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can read finances" ON public.finances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can manage finances" ON public.finances FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tenants (arrendatarios del consultorio)
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  cov text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  cedula text NOT NULL DEFAULT '',
  rental_mode text NOT NULL DEFAULT 'turno' CHECK (rental_mode IN ('turno', 'percent')),
  rental_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can read tenants" ON public.tenants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can manage tenants" ON public.tenants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tenant blocked slots
CREATE TABLE public.tenant_blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  date text NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  start_time text,
  end_time text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read blocked slots" ON public.tenant_blocked_slots FOR SELECT USING (true);
CREATE POLICY "Auth can manage blocked slots" ON public.tenant_blocked_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- User roles for admin
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Insert default data
INSERT INTO public.settings (tasa_bcv) VALUES (36.50);

INSERT INTO public.doctors (name, email, specialty, pay_model, rate) VALUES
  ('Dra. María González', 'dra1@coso.com', 'Odontología General', 'percent', 0.40);

INSERT INTO public.treatments (name, price_usd) VALUES
  ('Blanqueamiento', 80),
  ('Endodoncia', 120),
  ('Extracción', 40),
  ('Limpieza Dental', 30),
  ('Prótesis', 200),
  ('Resina Compuesta', 45),
  ('Revisión', 25),
  ('Otros', 0);

INSERT INTO public.inventory (name, stock, price_usd, min_stock) VALUES
  ('Guantes (Caja)', 50, 8.50, 10),
  ('Anestesia Local', 100, 3.00, 20),
  ('Resina Compuesta', 30, 25.00, 5),
  ('Agujas Descartables', 200, 0.50, 50),
  ('Algodón (Bolsa)', 40, 2.00, 10);

-- Enable realtime for appointments (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
