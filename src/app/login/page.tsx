// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? 'Correo electrónico o contraseña incorrectos.'
        : signInError.message
      );
      setLoading(false);
    } else {
      router.push('/studio');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/studio` },
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #1e1b4b, #030712 80%)',
      padding: 20
    }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
            <Logo size="md" />
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
            Iniciar Sesión
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Accede a tu estudio de creación y avatares de IA
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
            padding: '10px 14px', borderRadius: 10, color: '#fca5a5',
            fontSize: 12, marginBottom: 18, textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ marginBottom: 18, display: 'flex', gap: 10, justifyContent: 'center' }}
        >
          <span>🌐</span> Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span>o con tu correo</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              className="input w-full"
              placeholder="tu@email.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                Contraseña
              </label>
            </div>
            <input
              type="password"
              className="input w-full"
              placeholder="••••••••"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Iniciando...' : 'Entrar a Mimik AI →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 24, marginBottom: 0 }}>
          ¿No tienes una cuenta?{' '}
          <Link href="/registro" style={{ color: 'var(--accent-purple)', fontWeight: 700, textDecoration: 'none' }}>
            Regístrate Gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
