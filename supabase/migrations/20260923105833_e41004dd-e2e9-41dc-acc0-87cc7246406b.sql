CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TYPE public.case_status AS ENUM ('active','treatment_ongoing','funding_complete','recovery','closed');
CREATE TYPE public.donation_status AS ENUM ('pending','verified','rejected');

CREATE TABLE public.rescue_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  animal_name text NOT NULL,
  animal_type text,
  description text,
  location text,
  animal_photo_url text,
  poster_url text,
  medical_bill_url text,
  qr_code_url text,
  amount_required numeric(12,2),
  amount_raised numeric(12,2) NOT NULL DEFAULT 0,
  donation_count integer NOT NULL DEFAULT 0,
  status public.case_status NOT NULL DEFAULT 'active',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT amount_required_positive CHECK (amount_required IS NULL OR amount_required > 0),
  CONSTRAINT amount_raised_non_negative CHECK (amount_raised >= 0)
);
GRANT SELECT ON public.rescue_cases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rescue_cases TO authenticated;
GRANT ALL ON public.rescue_cases TO service_role;
ALTER TABLE public.rescue_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active cases public" ON public.rescue_cases FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admins read all cases" ON public.rescue_cases FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write cases" ON public.rescue_cases FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update cases" ON public.rescue_cases FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete cases" ON public.rescue_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE SEQUENCE public.donation_ref_seq;

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text NOT NULL UNIQUE,
  case_id uuid NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  mobile_number text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  payment_reference text NOT NULL,
  screenshot_path text,
  status public.donation_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.donations TO service_role;
GRANT SELECT, UPDATE ON public.donations TO authenticated;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read donations" ON public.donations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update donations" ON public.donations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.case_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  update_type text NOT NULL DEFAULT 'rescue',
  title text NOT NULL,
  description text,
  image_url text,
  update_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.case_updates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_updates TO authenticated;
GRANT ALL ON public.case_updates TO service_role;
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "updates public" ON public.case_updates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage updates" ON public.case_updates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.case_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  label text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  expense_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.case_expenses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_expenses TO authenticated;
GRANT ALL ON public.case_expenses TO service_role;
ALTER TABLE public.case_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses public" ON public.case_expenses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage expenses" ON public.case_expenses FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER rescue_cases_touch BEFORE UPDATE ON public.rescue_cases FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER donations_touch BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.recalc_case_totals(_case_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.rescue_cases c
  SET amount_raised = COALESCE((SELECT SUM(d.amount) FROM public.donations d WHERE d.case_id = _case_id AND d.status = 'verified'), 0),
      donation_count = COALESCE((SELECT COUNT(*) FROM public.donations d WHERE d.case_id = _case_id AND d.status = 'verified'), 0)
  WHERE c.id = _case_id;
END; $$;

CREATE OR REPLACE FUNCTION public.donations_sync_totals() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN PERFORM public.recalc_case_totals(OLD.case_id); RETURN OLD; END IF;
  PERFORM public.recalc_case_totals(NEW.case_id);
  IF TG_OP = 'UPDATE' AND OLD.case_id <> NEW.case_id THEN PERFORM public.recalc_case_totals(OLD.case_id); END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER donations_sync AFTER INSERT OR UPDATE OR DELETE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.donations_sync_totals();

CREATE OR REPLACE FUNCTION public.next_donation_reference() RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'VF-DON-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.donation_ref_seq')::text, 6, '0')
$$;
GRANT EXECUTE ON FUNCTION public.next_donation_reference() TO service_role;

CREATE INDEX donations_case_idx ON public.donations(case_id);
CREATE INDEX donations_status_idx ON public.donations(status);
CREATE INDEX case_updates_case_idx ON public.case_updates(case_id);
CREATE INDEX case_expenses_case_idx ON public.case_expenses(case_id);