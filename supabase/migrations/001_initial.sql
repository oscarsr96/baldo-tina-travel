-- =============================================================
-- Baldo & Tina Travel — Migración inicial
-- =============================================================

-- Enum para roles de usuario
CREATE TYPE user_role AS ENUM ('CLIENT', 'ADMIN');

-- Enum para status de solicitudes
CREATE TYPE request_status AS ENUM ('pendiente', 'en_proceso', 'propuestas_listas', 'archivado');

-- Enum para tier de propuestas
CREATE TYPE proposal_tier AS ENUM ('budget', 'mid', 'premium');

-- =============================================================
-- Tabla: profiles (extiende auth.users)
-- =============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'CLIENT',
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CLIENT'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- Tabla: trip_requests
-- =============================================================
CREATE TABLE trip_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status request_status NOT NULL DEFAULT 'pendiente',
  travelers INTEGER NOT NULL CHECK (travelers BETWEEN 1 AND 10),
  selected_cities JSONB NOT NULL,
  total_days INTEGER NOT NULL CHECK (total_days BETWEEN 3 AND 30),
  budget NUMERIC(10,2) NOT NULL CHECK (budget > 0),
  preferences TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_requests_client ON trip_requests(client_id);
CREATE INDEX idx_trip_requests_status ON trip_requests(status);

-- =============================================================
-- Tabla: proposals
-- =============================================================
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES trip_requests(id) ON DELETE CASCADE,
  tier proposal_tier NOT NULL,
  route_data JSONB NOT NULL,
  form_data JSONB NOT NULL,
  admin_notes TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposals_request ON proposals(request_id);

-- =============================================================
-- Tabla: admin_notes (notas internas)
-- =============================================================
CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES trip_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_notes_request ON admin_notes(request_id);

-- =============================================================
-- Helper: is_admin()
-- =============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================
-- RLS: profiles
-- =============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio perfil"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Usuarios editan su propio perfil"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================================
-- RLS: trip_requests
-- =============================================================
ALTER TABLE trip_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes ven sus solicitudes"
  ON trip_requests FOR SELECT
  USING (client_id = auth.uid() OR is_admin());

CREATE POLICY "Clientes crean solicitudes"
  ON trip_requests FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admin actualiza solicitudes"
  ON trip_requests FOR UPDATE
  USING (is_admin());

-- =============================================================
-- RLS: proposals
-- =============================================================
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes ven propuestas visibles de sus solicitudes"
  ON proposals FOR SELECT
  USING (
    is_admin()
    OR (
      is_visible = true
      AND EXISTS (
        SELECT 1 FROM trip_requests
        WHERE trip_requests.id = proposals.request_id
        AND trip_requests.client_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admin crea propuestas"
  ON proposals FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin edita propuestas"
  ON proposals FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin elimina propuestas"
  ON proposals FOR DELETE
  USING (is_admin());

-- =============================================================
-- RLS: admin_notes
-- =============================================================
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo admin ve notas"
  ON admin_notes FOR SELECT
  USING (is_admin());

CREATE POLICY "Solo admin crea notas"
  ON admin_notes FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Solo admin edita notas"
  ON admin_notes FOR UPDATE
  USING (is_admin());

-- =============================================================
-- Realtime (habilitar publicaciones para proposals y trip_requests)
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_requests;
