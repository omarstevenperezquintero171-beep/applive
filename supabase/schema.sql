-- ==============================================================================
-- AI VIDEO STUDIO & INTERACTIVE AVATAR PLATFORM
-- Supabase PostgreSQL Schema, RLS Security Policies & Triggers
-- ==============================================================================

-- 1. TABLA: PROFILES (Perfiles de usuario y balance de créditos)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  credits_remaining INTEGER NOT NULL DEFAULT 3,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'pro', 'unlimited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Permitir inserción de perfil al registrarse"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. TABLA: VIDEOS (Videos verticales 9:16 generados con avatares IA)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  avatar_url TEXT,
  background_url TEXT,
  script_text TEXT,
  generated_video_url TEXT,
  voice_id TEXT DEFAULT 'es-ES-natural',
  aspect_ratio TEXT DEFAULT '9:16',
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propios videos"
  ON public.videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- 3. TABLA: TRANSACTIONS (Historial de compras de planes y paquetes de créditos)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  credits_added INTEGER NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'completed',
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'mercadopago')),
  provider_tx_id TEXT,
  plan_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus transacciones"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 4. TABLA: INTERACTIVE_SESSIONS (Sesiones de avatar streaming en tiempo real)
CREATE TABLE IF NOT EXISTS public.interactive_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.interactive_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus sesiones interactivas"
  ON public.interactive_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- 5. TRIGGER: Creación automática de profile al registrarse nuevo usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits_remaining, plan_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    3, -- 3 créditos gratis de bienvenida
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. STORAGE BUCKETS (Crear en Supabase Storage Dashboard si no existen):
-- - avatars: Para fotos subidas por los usuarios (público o con RLS de lectura).
-- - videos: Para almacenar los videos renderizados finales.
-- - backgrounds: Para imágenes y fondos personalizados.
