'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getGuestCredits } from '@/lib/credits';
import type { Profile } from '@/types';

interface NavbarProps {
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guestCredits, setGuestCredits] = useState<number>(() => getGuestCredits());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isMounted) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (isMounted) setProfile(data);
      }
      if (isMounted) setLoading(false);
    }

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (isMounted) setProfile(data);
      } else {
        if (isMounted) {
          setProfile(null);
          setGuestCredits(getGuestCredits());
        }
      }
    });

    const handleStorage = () => {
      if (isMounted) setGuestCredits(getGuestCredits());
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/');
  };

  const navLinks = [
    { label: 'Studio AI', href: '/studio', icon: '🎬' },
    { label: 'Avatar en Vivo', href: '/live', icon: '🔴' },
    { label: 'Biblioteca', href: '/library', icon: '📁' },
    { label: 'Planes & Precios', href: '/pricing', icon: '💎' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">✨</div>
          <span className="nav-logo-text text-gradient">AvatarAI</span>
        </Link>

        {/* Nav Links */}
        <div className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${pathname === link.href ? ' active' : ''}`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {!loading && (
            profile ? (
              <>
                <Link href="/pricing" style={{ textDecoration: 'none' }}>
                  <div className="credits-chip" title="Haz clic para recargar créditos">
                    <span>⚡</span>
                    <span>{profile.credits_remaining} créditos</span>
                  </div>
                </Link>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px', borderRadius: '10px',
                  background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                  fontSize: '13px', fontWeight: 600
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff'
                  }}>
                    {(profile.full_name || profile.email || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ color: 'var(--text-secondary)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.full_name || profile.email?.split('@')[0]}
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Salir</button>
              </>
            ) : (
              <>
                {/* Guest trial badge */}
                <Link href="/pricing" style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 20,
                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                    fontSize: 12, fontWeight: 700, color: '#fbbf24', cursor: 'pointer'
                  }}>
                    <span>🎁</span>
                    <span>{guestCredits} de prueba</span>
                  </div>
                </Link>

                <button className="btn btn-ghost btn-sm" onClick={() => onOpenAuth?.('login')}>
                  Iniciar Sesión
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth?.('register')}>
                  Registrarse Gratis
                </button>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
