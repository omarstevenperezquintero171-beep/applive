'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { migrateGuestVideosToSupabase } from '@/lib/credits';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', onSuccess }: AuthModalProps) {
  const supabase = createClient();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/studio` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });

        if (error) {
          setError(error.message);
        } else if (data.user) {
          // Create initial profile with 3 complimentary credits
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            full_name: name,
            credits_remaining: 3,
            plan_tier: 'free',
          });

          // Migrate any videos created in guest mode to user account
          await migrateGuestVideosToSupabase(data.user.id);

          setSuccess('¡Cuenta creada con éxito! Tus videos y créditos se han activado.');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError('Correo o contraseña incorrectos.');
        } else if (data.user) {
          // Migrate guest videos upon login
          await migrateGuestVideosToSupabase(data.user.id);
          onSuccess?.();
          onClose();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card card card-glow" style={{ maxWidth: 440, width: '90%' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>
              {tab === 'login' ? '👋 Bienvenido de vuelta' : '🚀 Comenzar Gratis'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {tab === 'login' ? 'Accede a tu estudio de avatares IA' : 'Obtén 3 créditos gratuitos y guarda tus videos'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div className="tabs mb-6">
          <button className={`tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
            Iniciar Sesión
          </button>
          <button className={`tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>
            Registrarse
          </button>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          style={{
            width: '100%', background: '#fff', color: '#1f2937',
            border: 'none', borderRadius: 12, padding: '12px 20px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            marginBottom: 18, transition: 'opacity 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="divider mb-4">o con tu correo electrónico</div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Nombre completo
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Correo electrónico
            </label>
            <input
              type="email"
              className="input"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 8 }}>
              ⚠️ {error}
            </p>
          )}

          {success && (
            <p style={{ fontSize: 13, color: '#34d399', background: 'rgba(16,185,129,0.1)', padding: '10px 14px', borderRadius: 8 }}>
              ✅ {success}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta y Reclamar 3 Créditos'}
          </button>
        </form>

        {/* Note */}
        {tab === 'register' && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
            🎁 Incluye <strong style={{ color: 'var(--primary-light)' }}>3 créditos de regalo</strong> · Sin tarjeta requerida
          </p>
        )}
      </div>
    </div>
  );
}
