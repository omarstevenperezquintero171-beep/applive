'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [showBanner, setShowBanner] = useState(true);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleMouseEnterProducts = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveProducts = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 250);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 150 }}>
      {/* 1. TOP ANNOUNCEMENT BANNER (AKOOL STYLE) */}
      {showBanner && (
        <div className="announcement-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>🎬</span>
            <span><strong>AvatarAI Creator Challenge</strong> está en vivo — Más de 10,000 créditos gratis repartidos.</span>
            <Link href="/pricing" className="announcement-link">
              Participar Ahora →
            </Link>
          </div>
          <button
            className="announcement-close"
            onClick={() => setShowBanner(false)}
            aria-label="Cerrar anuncio"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. MAIN NAVBAR */}
      <nav className="navbar" style={{ position: 'relative' }}>
        <div className="container navbar-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' }}>
              ✨
            </div>
            <span className="nav-logo-text" style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>
              <span style={{ color: '#fff' }}>Avatar</span><span style={{ color: '#a855f7' }}>AI</span>
            </span>
          </Link>

          {/* Navigation Links with Mega-Menu Trigger */}
          <div className="nav-links">
            {/* Mega Menu Trigger: "Productos" / "Herramientas" */}
            <div
              onMouseEnter={handleMouseEnterProducts}
              onMouseLeave={handleMouseLeaveProducts}
              style={{ position: 'static' }}
            >
              <button
                type="button"
                className={`nav-link ${isMegaMenuOpen ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => setIsMegaMenuOpen(prev => !prev)}
              >
                <span>Productos</span>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 6px',
                  borderRadius: 10, background: '#ef4444', color: '#fff', textTransform: 'uppercase'
                }}>
                  Nuevo
                </span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{isMegaMenuOpen ? '▲' : '▼'}</span>
              </button>

              {/* AKOOL-STYLE MEGA-MENU DROPDOWN */}
              {isMegaMenuOpen && (
                <div
                  className="mega-menu-container"
                  onMouseEnter={handleMouseEnterProducts}
                  onMouseLeave={handleMouseLeaveProducts}
                >
                  {/* Left Column: Featured Highlight Cards */}
                  <div className="mega-featured-col">
                    <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Herramientas Destacadas
                    </p>

                    <Link href="/studio" className="mega-featured-card" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-featured-icon">📱</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>Imagen a Video 9:16</span>
                          <span className="mega-badge mega-badge-hot">Caliente</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Convierte fotos en videos verticales TikTok & Reels con lip-sync.
                        </p>
                      </div>
                    </Link>

                    <Link href="/live" className="mega-featured-card" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-featured-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>🔴</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>Avatar en Streaming</span>
                          <span className="mega-badge mega-badge-new">Nuevo</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Interacción por voz y WebRTC en directo con latencia &lt;300ms.
                        </p>
                      </div>
                    </Link>

                    <Link href="/studio" className="mega-featured-card" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-featured-icon" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>🗣️</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>Clon de Voz & TTS</span>
                          <span className="mega-badge mega-badge-unlimited">Ilimitado</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Clonación de voz con ElevenLabs y síntesis de audio natural.
                        </p>
                      </div>
                    </Link>

                    <Link href="/studio" className="mega-featured-card" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-featured-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>🎭</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>Face Swap & Rostros</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Animación e intercambio de rostros con calidad de estudio.
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Right Columns: Tool Categories Grid */}
                  <div className="mega-columns-grid">
                    {/* Col 1: En Vivo */}
                    <div>
                      <h4 className="mega-col-title">En Vivo</h4>
                      <Link href="/live" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">📹 Cámara en Vivo</span>
                          <span className="mega-badge mega-badge-new">Nuevo</span>
                        </div>
                        <p className="mega-item-desc">Interpretación simultánea con IA y lip-sync realista.</p>
                      </Link>

                      <Link href="/live" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🔴 Avatar Streaming</span>
                        </div>
                        <p className="mega-item-desc">Interacción en tiempo real por micrófono y chat.</p>
                      </Link>

                      <Link href="/live" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🤖 Agente de Soporte & Ventas</span>
                        </div>
                        <p className="mega-item-desc">Atención al cliente con avatar conversacional.</p>
                      </Link>

                      <Link href="/live" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🔄 Face Swap en Directo</span>
                        </div>
                        <p className="mega-item-desc">Reemplazo facial en streaming WebRTC.</p>
                      </Link>
                    </div>

                    {/* Col 2: Vídeo */}
                    <div>
                      <h4 className="mega-col-title">Vídeo</h4>
                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🗣️ Avatar Parlante</span>
                          <span className="mega-badge mega-badge-unlimited">Ilimitado</span>
                        </div>
                        <p className="mega-item-desc">Sincroniza labios de cualquier foto con tu guión.</p>
                      </Link>

                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">📱 Formato Vertical 9:16</span>
                          <span className="mega-badge mega-badge-hot">Caliente</span>
                        </div>
                        <p className="mega-item-desc">Optimizado para retención en TikTok y Reels.</p>
                      </Link>

                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">📄 Convertir Guión a Video</span>
                        </div>
                        <p className="mega-item-desc">Generación con prompts estructurados de IA.</p>
                      </Link>

                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🎬 Video a Video</span>
                        </div>
                        <p className="mega-item-desc">Reimagina estilo y presentador de tu video.</p>
                      </Link>
                    </div>

                    {/* Col 3: Audio & Voz */}
                    <div>
                      <h4 className="mega-col-title">Audio & Voz</h4>
                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🎙️ Texto a Voz Natural</span>
                        </div>
                        <p className="mega-item-desc">Voces nativas en español de España, México y más.</p>
                      </Link>

                      <Link href="/pricing" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🧬 Clon de Voz</span>
                          <span className="mega-badge mega-badge-new">ElevenLabs</span>
                        </div>
                        <p className="mega-item-desc">Clona tu propia voz con 1 minuto de audio.</p>
                      </Link>

                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">💬 Subtítulos Estilo TikTok</span>
                        </div>
                        <p className="mega-item-desc">Subtítulos animados de alto impacto visual.</p>
                      </Link>

                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🎧 Música de Fondo B-Roll</span>
                        </div>
                        <p className="mega-item-desc">Pistas de fondo sin copyright para redes.</p>
                      </Link>
                    </div>

                    {/* Col 4: Imagen & Fondos */}
                    <div>
                      <h4 className="mega-col-title">Imagen & Fondos</h4>
                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">🖼️ Cambio de Fondo</span>
                        </div>
                        <p className="mega-item-desc">Estudios oscuros, gradientes o sube tu imagen.</p>
                      </Link>

                      <Link href="/studio" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">📸 Retrato Personalizado</span>
                        </div>
                        <p className="mega-item-desc">Animación de selfies y fotos corporativas.</p>
                      </Link>

                      <Link href="/library" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">📁 Gestor de Videos</span>
                        </div>
                        <p className="mega-item-desc">Descargas MP4 y compartición rápida.</p>
                      </Link>

                      <Link href="/pricing" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                        <div className="mega-item-header">
                          <span className="mega-item-title">⚡ API para Empresas</span>
                        </div>
                        <p className="mega-item-desc">Automatiza miles de videos con API REST.</p>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Navigation Links */}
            <Link
              href="/studio"
              className={`nav-link${pathname === '/studio' ? ' active' : ''}`}
            >
              Studio 9:16
            </Link>

            <Link
              href="/live"
              className={`nav-link${pathname === '/live' ? ' active' : ''}`}
            >
              Avatar en Vivo
            </Link>

            <Link
              href="/library"
              className={`nav-link${pathname === '/library' ? ' active' : ''}`}
            >
              Biblioteca
            </Link>

            <Link
              href="/pricing"
              className={`nav-link${pathname === '/pricing' ? ' active' : ''}`}
            >
              Precios
            </Link>
          </div>

          {/* Right Header Actions (Akool Style) */}
          <div className="nav-actions">
            {/* Language Selector */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 8px'
            }}>
              <span>🌐</span>
              <span style={{ fontWeight: 600 }}>ES</span>
            </div>

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
                    <span style={{ color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile.full_name || profile.email?.split('@')[0]}
                    </span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Salir</button>
                </>
              ) : (
                <>
                  {/* Akool Gold "Prueba gratuita" chip */}
                  <Link href="/studio" style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 20,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                      color: '#000', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
                    }}>
                      <span>🎁</span>
                      <span>Prueba gratuita ({guestCredits})</span>
                    </div>
                  </Link>

                  <button className="btn btn-ghost btn-sm" onClick={() => onOpenAuth?.('login')}>
                    Iniciar sesión
                  </button>

                  {/* Akool Violet Pill "Inscríbase" Button */}
                  <button
                    className="btn btn-primary btn-sm"
                    style={{
                      borderRadius: 20, padding: '8px 18px',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                      boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                    }}
                    onClick={() => onOpenAuth?.('register')}
                  >
                    Inscríbase
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
